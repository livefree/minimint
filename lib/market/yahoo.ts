/**
 * yahoo-finance2 adapter — normalizes provider JSON into our canonical
 * Quote / History / SearchResult shapes (lib/market/types.ts).
 *
 * Field-mapping rules locked by the probe analysis (logs/probes/ANALYSIS.md):
 *  - `adjclose` (provider) → `adjClose` (ours) for OHLCV bars
 *  - yahoo silently redirects on renamed symbols (FB → META). We detect by
 *    comparing the queried symbol with response.symbol and surface a
 *    `renamed: true` flag so the caller can update `securities.renamed_to`.
 *  - quoteType maps EQUITY | ETF | INDEX | MUTUALFUND | CRYPTOCURRENCY |
 *    fallback OTHER. Caller branches on this when deciding which
 *    quoteSummary modules to request (ETFs return a strict subset).
 *
 * The provider client is module-local but settable for tests via setClient().
 */

import YahooFinance from 'yahoo-finance2';
import {
  type AssetType,
  type History,
  type MarketState,
  type PriceBar,
  type Quote,
  type Range,
  type SearchResult,
  MarketDataError,
} from './types';

// ─── client (injectable for tests) ────────────────────────────────────────

interface YahooLike {
  quote: (symbol: string) => Promise<Record<string, unknown>>;
  chart: (
    symbol: string,
    opts: Record<string, unknown>
  ) => Promise<Record<string, unknown>>;
  search: (
    q: string,
    opts?: Record<string, unknown>
  ) => Promise<Record<string, unknown>>;
}

let client: YahooLike | null = null;

function getClient(): YahooLike {
  if (!client) client = new YahooFinance() as unknown as YahooLike;
  return client;
}

/** Test seam — pass a mock implementing { quote, chart, search }. */
export function setClient(c: YahooLike | null): void {
  client = c;
}

// ─── helpers ──────────────────────────────────────────────────────────────

function toNumberOrNull(v: unknown): number | null {
  if (v === null || v === undefined) return null;
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v !== '') {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function toDateOrNull(v: unknown): Date | null {
  if (v instanceof Date) return v;
  if (typeof v === 'string' || typeof v === 'number') {
    const d = new Date(v);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  return null;
}

function toAssetType(v: unknown): AssetType {
  switch (v) {
    case 'EQUITY':
    case 'ETF':
    case 'INDEX':
      return v;
    case 'MUTUALFUND':
      // yahoo uses no-underscore form; our enum (DB) has the underscore
      return 'MUTUAL_FUND';
    default:
      // Includes 'CRYPTOCURRENCY', 'FUTURE', 'CURRENCY', etc. — out of v1 scope
      return 'OTHER';
  }
}

function toMarketState(v: unknown): MarketState {
  switch (v) {
    case 'PRE':
    case 'REGULAR':
    case 'POST':
    case 'CLOSED':
    case 'PREPRE':
    case 'POSTPOST':
      return v;
    default:
      return 'CLOSED';
  }
}

/** Re-throw yahoo errors as typed MarketDataError. */
function wrapError(symbol: string, e: unknown): never {
  if (e instanceof MarketDataError) throw e;
  const msg = e instanceof Error ? e.message : String(e);
  if (/no.*data|not found|404/i.test(msg)) {
    throw new MarketDataError(
      `Symbol ${symbol} not found`,
      'NOT_FOUND',
      e
    );
  }
  if (/429|rate limit|too many/i.test(msg)) {
    throw new MarketDataError(
      `Yahoo rate-limited fetching ${symbol}`,
      'RATE_LIMITED',
      e
    );
  }
  throw new MarketDataError(
    `Upstream error fetching ${symbol}: ${msg}`,
    'UPSTREAM_ERROR',
    e
  );
}

// ─── quote ────────────────────────────────────────────────────────────────

export async function getQuote(symbol: string): Promise<Quote> {
  const wanted = symbol.toUpperCase();
  let raw: Record<string, unknown>;
  try {
    raw = await getClient().quote(wanted);
  } catch (e) {
    wrapError(wanted, e);
  }

  if (!raw || typeof raw !== 'object') {
    throw new MarketDataError(`Empty quote for ${wanted}`, 'NOT_FOUND');
  }

  const price = toNumberOrNull(raw.regularMarketPrice);
  if (price === null) {
    throw new MarketDataError(
      `Quote for ${wanted} lacks regularMarketPrice`,
      'UPSTREAM_ERROR'
    );
  }

  const canonical = String(raw.symbol ?? wanted).toUpperCase();
  const renamed = canonical !== wanted;
  const fetchedAt = new Date();

  return {
    symbol: wanted,
    canonicalSymbol: canonical,
    renamed,
    name: String(raw.longName ?? raw.shortName ?? wanted),
    exchange: String(raw.exchange ?? ''),
    fullExchange: String(raw.fullExchangeName ?? ''),
    currency: String(raw.currency ?? 'USD'),
    assetType: toAssetType(raw.quoteType),

    price,
    prevClose: toNumberOrNull(raw.regularMarketPreviousClose),
    dayHigh: toNumberOrNull(raw.regularMarketDayHigh),
    dayLow: toNumberOrNull(raw.regularMarketDayLow),
    openPrice: toNumberOrNull(raw.regularMarketOpen),
    volume: toNumberOrNull(raw.regularMarketVolume),

    bid: toNumberOrNull(raw.bid),
    ask: toNumberOrNull(raw.ask),
    bidSize: toNumberOrNull(raw.bidSize),
    askSize: toNumberOrNull(raw.askSize),

    preMarketPrice: toNumberOrNull(raw.preMarketPrice),
    preMarketChange: toNumberOrNull(raw.preMarketChange),
    preMarketAt: toDateOrNull(raw.preMarketTime),
    postMarketPrice: toNumberOrNull(raw.postMarketPrice),
    postMarketChange: toNumberOrNull(raw.postMarketChange),
    postMarketAt: toDateOrNull(raw.postMarketTime),

    marketState: toMarketState(raw.marketState),
    marketTime: toDateOrNull(raw.regularMarketTime) ?? fetchedAt,

    source: 'yahoo',
    fetchedAt,
  };
}

// ─── history ──────────────────────────────────────────────────────────────

/**
 * Map a UI range to yahoo chart() request parameters.
 *
 * Returns period1 (start), interval, and the minimum bar count we expect
 * (used by tests / validation; not enforced).
 */
export function rangeToChartParams(range: Range): {
  period1: Date;
  interval: '5m' | '15m' | '30m' | '1h' | '1d' | '1wk' | '1mo';
} {
  const now = Date.now();
  const days = (n: number) => new Date(now - n * 24 * 3600 * 1000);

  switch (range) {
    case '1D':
      // 2 days back so we cover today's pre + regular + post; consumer slices
      return { period1: days(2), interval: '5m' };
    case '1W':
      return { period1: days(7), interval: '30m' };
    case '1M':
      return { period1: days(30), interval: '1d' };
    case '3M':
      return { period1: days(90), interval: '1d' };
    case '6M':
      return { period1: days(180), interval: '1d' };
    case 'YTD':
      return {
        period1: new Date(new Date().getFullYear(), 0, 1),
        interval: '1d',
      };
    case '1Y':
      return { period1: days(365), interval: '1d' };
    case '2Y':
      return { period1: days(2 * 365), interval: '1d' };
    case '5Y':
      return { period1: days(5 * 365), interval: '1wk' };
    case '10Y':
      return { period1: days(10 * 365), interval: '1mo' };
    case 'ALL':
      return { period1: new Date(0), interval: '1mo' };
  }
}

export async function getHistory(
  symbol: string,
  range: Range
): Promise<History> {
  const wanted = symbol.toUpperCase();
  const { period1, interval } = rangeToChartParams(range);

  let raw: Record<string, unknown>;
  try {
    raw = await getClient().chart(wanted, {
      period1,
      period2: new Date(),
      interval,
    });
  } catch (e) {
    wrapError(wanted, e);
  }

  const meta = (raw.meta ?? {}) as Record<string, unknown>;
  const canonical = String(meta.symbol ?? wanted).toUpperCase();
  const renamed = canonical !== wanted;

  const quotes = Array.isArray(raw.quotes)
    ? (raw.quotes as Array<Record<string, unknown>>)
    : [];

  const bars: PriceBar[] = [];
  for (const q of quotes) {
    const date = toDateOrNull(q.date);
    const open = toNumberOrNull(q.open);
    const high = toNumberOrNull(q.high);
    const low = toNumberOrNull(q.low);
    const close = toNumberOrNull(q.close);
    // Some bars (typically pre/post extended) have nulls. Drop them.
    if (!date || open === null || high === null || low === null || close === null) continue;
    bars.push({
      date,
      open,
      high,
      low,
      close,
      // *** field rename: yahoo `adjclose` → ours `adjClose` ***
      adjClose: toNumberOrNull(q.adjclose) ?? close,
      volume: toNumberOrNull(q.volume) ?? 0,
    });
  }

  return {
    symbol: wanted,
    canonicalSymbol: canonical,
    renamed,
    range,
    bars,
    timezone: String(meta.exchangeTimezoneName ?? 'America/New_York'),
    currency: String(meta.currency ?? 'USD'),
  };
}

// ─── search ───────────────────────────────────────────────────────────────

const US_EXCHANGES = new Set(['NMS', 'NYQ', 'ASE', 'BTS', 'ARCA', 'PCX', 'NCM', 'NGM']);

export async function searchSymbols(query: string): Promise<SearchResult[]> {
  if (!query || query.trim().length < 1) return [];
  let raw: Record<string, unknown>;
  try {
    raw = await getClient().search(query.trim(), { newsCount: 0, quotesCount: 12 });
  } catch (e) {
    wrapError(query, e);
  }
  const quotes = Array.isArray(raw.quotes)
    ? (raw.quotes as Array<Record<string, unknown>>)
    : [];

  return quotes
    .filter((q) => q.isYahooFinance && q.symbol && US_EXCHANGES.has(String(q.exchange)))
    .map((q) => ({
      symbol: String(q.symbol),
      name: String(q.longname ?? q.shortname ?? q.symbol),
      exchange: String(q.exchange),
      assetType: toAssetType(q.quoteType),
      // Yahoo doesn't flag primary explicitly; first match in our filtered
      // list is treated as primary by the consumer.
      isPrimary: false,
    }));
}
