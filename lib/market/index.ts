/**
 * Public market-data API. Today wraps yahoo-finance2 only; in v1.5 may
 * grow a strategy layer to fall back to Finnhub on yahoo failures.
 *
 * Callers (API routes, server components, tests) should import from here
 * — never reach into `./yahoo` directly. The only exception is
 * `./yahoo.setClient` in unit tests.
 */

export type {
  Range,
  Quote,
  PriceBar,
  History,
  SearchResult,
  AssetType,
  MarketState,
  QuoteSource,
} from './types';
export { MarketDataError, ALL_RANGES } from './types';
export { getQuote, getHistory, searchSymbols, rangeToChartParams } from './yahoo';
