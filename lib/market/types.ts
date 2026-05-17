/**
 * Shared types for the market-data adapter layer.
 *
 * These are the **engineering boundary** between provider responses
 * (yahoo-finance2, Finnhub, …) and everything downstream — API routes,
 * cache writes, UI. Providers normalize INTO this shape; nothing else
 * should ever consume raw provider JSON.
 *
 * Field shapes are aligned with DATABASE_SPEC §3.9 quote_cache and
 * §3.10 prices_daily so writes are a near-direct spread.
 */

export type Range =
  | '1D'
  | '1W'
  | '1M'
  | '3M'
  | '6M'
  | 'YTD'
  | '1Y'
  | '2Y'
  | '5Y'
  | '10Y'
  | 'ALL';

export const ALL_RANGES: readonly Range[] = [
  '1D',
  '1W',
  '1M',
  '3M',
  '6M',
  'YTD',
  '1Y',
  '2Y',
  '5Y',
  '10Y',
  'ALL',
] as const;

export type MarketState =
  | 'PRE'
  | 'REGULAR'
  | 'POST'
  | 'CLOSED'
  | 'PREPRE'
  | 'POSTPOST';

export type AssetType =
  | 'EQUITY'
  | 'ETF'
  | 'INDEX'
  | 'MUTUALFUND'
  | 'CRYPTOCURRENCY'
  | 'OTHER';

export type QuoteSource = 'yahoo' | 'finnhub';

export interface Quote {
  // Symbol the caller asked for. If yahoo silently redirected (FB → META),
  // this is still the original; canonicalSymbol is the resolved one.
  symbol: string;
  canonicalSymbol: string;
  renamed: boolean;

  name: string;
  exchange: string;
  fullExchange: string;
  currency: string;
  assetType: AssetType;

  // regular session
  price: number;
  prevClose: number | null;
  dayHigh: number | null;
  dayLow: number | null;
  openPrice: number | null;
  volume: number | null;

  // live order book (typically populated only during market hours)
  bid: number | null;
  ask: number | null;
  bidSize: number | null;
  askSize: number | null;

  // extended hours
  preMarketPrice: number | null;
  preMarketChange: number | null;
  preMarketAt: Date | null;
  postMarketPrice: number | null;
  postMarketChange: number | null;
  postMarketAt: Date | null;

  // session context
  marketState: MarketState;
  marketTime: Date;

  source: QuoteSource;
  fetchedAt: Date;
}

export interface PriceBar {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  /** split + dividend adjusted close. Provider field is `adjclose`; renamed here. */
  adjClose: number;
  volume: number;
}

export interface History {
  symbol: string;
  canonicalSymbol: string;
  renamed: boolean;
  range: Range;
  bars: PriceBar[];
  /** Exchange timezone for chart x-axis labeling. Pulled from chart() meta. */
  timezone: string;
  /** Currency the bars are quoted in. */
  currency: string;
}

/** A SearchResult is a flat list of best-match symbols (US-equity filtered). */
export interface SearchResult {
  symbol: string;
  name: string;
  exchange: string;
  assetType: AssetType;
  /** True if yahoo flags this row as a primary (non-secondary) result. */
  isPrimary: boolean;
}

/** Errors the adapter surfaces. Caller can branch on `.code`. */
export type MarketDataErrorCode =
  | 'NOT_FOUND'
  | 'UPSTREAM_ERROR'
  | 'RATE_LIMITED'
  | 'INVALID_SYMBOL'
  | 'INTERNAL';

export class MarketDataError extends Error {
  // `cause` overrides Error's native field (TS strict mode requires `override`).
  public override readonly cause?: unknown;
  public readonly code: MarketDataErrorCode;

  constructor(message: string, code: MarketDataErrorCode, cause?: unknown) {
    super(message);
    this.name = 'MarketDataError';
    this.code = code;
    this.cause = cause;
  }
}
