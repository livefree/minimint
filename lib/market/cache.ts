/**
 * Cache write-through layer between yahoo adapter and Postgres.
 *
 * Read pattern (per DATABASE_SPEC §3.9):
 *   1. SELECT quote_cache WHERE symbol = $1 AND fetched_at > now() - TTL
 *   2. If empty → call yahoo, write through, return fresh.
 *
 * Lazy population of `securities`: each fresh quote lazy-inserts a minimal
 * securities row (symbol, name, exchange, asset_type, currency) so the FK
 * from quote_cache works. Full enrichment via `securities_meta` is a
 * separate daily job (out-of-scope for M1).
 */

import { eq, gt, and, sql } from 'drizzle-orm';
import { db } from '@/db/client';
import { securities, quoteCache, pricesDaily } from '@/db/schema';
import type { Quote, PriceBar, MarketState } from './types';

/**
 * Cache TTL by market state. During regular hours we want freshness;
 * after hours quotes barely change, so we widen the window to save calls.
 */
function cacheTtlMs(state: MarketState | null): number {
  switch (state) {
    case 'REGULAR':
    case 'PRE':
    case 'POST':
      return 30 * 1000; // 30s
    default:
      return 5 * 60 * 1000; // 5min
  }
}

/**
 * Try to read a fresh quote from cache. Returns null if absent or stale.
 * Note: we read the row first to get its market_state so we know which TTL
 * to apply — a single SELECT, then a freshness check in JS.
 */
export async function getCachedQuote(symbol: string): Promise<Quote | null> {
  const sym = symbol.toUpperCase();
  const rows = await db
    .select()
    .from(quoteCache)
    .where(eq(quoteCache.symbol, sym))
    .limit(1);
  const row = rows[0];
  if (!row) return null;

  const ttl = cacheTtlMs(row.marketState as MarketState | null);
  // Defensive: drizzle-orm should return Date for timestamptz, but normalize
  // in case a driver layer returns a string.
  const fetchedAtMs =
    row.fetchedAt instanceof Date
      ? row.fetchedAt.getTime()
      : new Date(row.fetchedAt as unknown as string).getTime();
  if (Date.now() - fetchedAtMs > ttl) return null;

  return rowToQuote(row, sym);
}

/**
 * Write a freshly-fetched quote into the cache. Also lazy-upserts the
 * securities row so the FK is satisfied for symbols we've never seen.
 *
 * Wrapped in a single transaction-equivalent (two statements; on Neon
 * serverless HTTP each call is its own TX, but ordering is safe here:
 * securities first, then quote_cache that FK-references it).
 */
export async function upsertQuote(q: Quote): Promise<void> {
  // Use the canonical (post-rename-resolution) symbol for storage.
  const sym = q.canonicalSymbol;

  await db
    .insert(securities)
    .values({
      symbol: sym,
      name: q.name,
      exchange: q.exchange || null,
      fullExchange: q.fullExchange || null,
      assetType: q.assetType,
      currency: q.currency,
    })
    .onConflictDoUpdate({
      target: securities.symbol,
      set: {
        name: q.name,
        exchange: q.exchange || null,
        fullExchange: q.fullExchange || null,
        currency: q.currency,
        refreshedAt: new Date(),
      },
    });

  await db
    .insert(quoteCache)
    .values({
      symbol: sym,
      price: q.price.toString(),
      prevClose: q.prevClose?.toString() ?? null,
      dayHigh: q.dayHigh?.toString() ?? null,
      dayLow: q.dayLow?.toString() ?? null,
      openPrice: q.openPrice?.toString() ?? null,
      volume: q.volume ? BigInt(Math.round(q.volume)) : null,
      bid: q.bid?.toString() ?? null,
      ask: q.ask?.toString() ?? null,
      bidSize: q.bidSize ?? null,
      askSize: q.askSize ?? null,
      preMarketPrice: q.preMarketPrice?.toString() ?? null,
      preMarketChange: q.preMarketChange?.toString() ?? null,
      preMarketAt: q.preMarketAt,
      postMarketPrice: q.postMarketPrice?.toString() ?? null,
      postMarketChange: q.postMarketChange?.toString() ?? null,
      postMarketAt: q.postMarketAt,
      marketState: q.marketState,
      marketTime: q.marketTime,
      source: q.source,
      fetchedAt: q.fetchedAt,
    })
    .onConflictDoUpdate({
      target: quoteCache.symbol,
      set: {
        price: q.price.toString(),
        prevClose: q.prevClose?.toString() ?? null,
        dayHigh: q.dayHigh?.toString() ?? null,
        dayLow: q.dayLow?.toString() ?? null,
        openPrice: q.openPrice?.toString() ?? null,
        volume: q.volume ? BigInt(Math.round(q.volume)) : null,
        bid: q.bid?.toString() ?? null,
        ask: q.ask?.toString() ?? null,
        bidSize: q.bidSize ?? null,
        askSize: q.askSize ?? null,
        preMarketPrice: q.preMarketPrice?.toString() ?? null,
        preMarketChange: q.preMarketChange?.toString() ?? null,
        preMarketAt: q.preMarketAt,
        postMarketPrice: q.postMarketPrice?.toString() ?? null,
        postMarketChange: q.postMarketChange?.toString() ?? null,
        postMarketAt: q.postMarketAt,
        marketState: q.marketState,
        marketTime: q.marketTime,
        source: q.source,
        fetchedAt: q.fetchedAt,
      },
    });
}

/**
 * Write OHLCV bars into prices_daily. `ON CONFLICT DO NOTHING` because
 * historical bars are immutable — re-fetching the same range should be
 * idempotent and never overwrite. Only bars whose date is < today are
 * persisted (today's bar may be incomplete during regular hours).
 */
export async function upsertPriceBars(
  symbol: string,
  bars: ReadonlyArray<PriceBar>
): Promise<number> {
  if (bars.length === 0) return 0;
  const sym = symbol.toUpperCase();
  const today = todayIsoDate();

  const rows = bars
    .filter((b) => toIsoDate(b.date) < today)
    .map((b) => ({
      symbol: sym,
      date: toIsoDate(b.date),
      open: b.open.toString(),
      high: b.high.toString(),
      low: b.low.toString(),
      close: b.close.toString(),
      adjClose: b.adjClose.toString(),
      volume: BigInt(Math.round(b.volume)),
    }));

  if (rows.length === 0) return 0;

  await db.insert(pricesDaily).values(rows).onConflictDoNothing();
  return rows.length;
}

// ─── helpers ────────────────────────────────────────────────────────────

function toIsoDate(d: Date): string {
  // YYYY-MM-DD in UTC; matches Postgres date input.
  return d.toISOString().slice(0, 10);
}
function todayIsoDate(): string {
  return toIsoDate(new Date());
}

function rowToQuote(
  row: typeof quoteCache.$inferSelect,
  requested: string
): Quote {
  const num = (v: string | null): number | null =>
    v === null ? null : Number(v);
  return {
    symbol: requested,
    canonicalSymbol: row.symbol,
    renamed: row.symbol !== requested,
    // securities-table fields are not joined here for hot path; UI gets
    // them from the upstream Quote on first fetch and rarely needs again.
    name: row.symbol,
    exchange: '',
    fullExchange: '',
    currency: 'USD',
    assetType: 'EQUITY',
    price: Number(row.price),
    prevClose: num(row.prevClose),
    dayHigh: num(row.dayHigh),
    dayLow: num(row.dayLow),
    openPrice: num(row.openPrice),
    volume: row.volume === null ? null : Number(row.volume),
    bid: num(row.bid),
    ask: num(row.ask),
    bidSize: row.bidSize,
    askSize: row.askSize,
    preMarketPrice: num(row.preMarketPrice),
    preMarketChange: num(row.preMarketChange),
    preMarketAt: row.preMarketAt,
    postMarketPrice: num(row.postMarketPrice),
    postMarketChange: num(row.postMarketChange),
    postMarketAt: row.postMarketAt,
    marketState: (row.marketState ?? 'CLOSED') as MarketState,
    marketTime: row.marketTime ?? row.fetchedAt,
    source: (row.source ?? 'yahoo') as 'yahoo' | 'finnhub',
    fetchedAt: row.fetchedAt,
  };
}

// Silence unused-imports until we wire range-cached reads in M2.
void and;
void gt;
void sql;
