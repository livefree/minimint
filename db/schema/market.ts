/**
 * Market-data domain — operator-global (no profile_id).
 *
 *   securities       (§3.8)  — symbol catalog
 *   quote_cache      (§3.9)  — hot 30s cache, 14 extended quote fields
 *   securities_meta  (§3.9.1) — slow-changing daily snapshot
 *   prices_daily     (§3.10) — OHLCV history
 *
 * All four are shared across all profiles per §1.3 (single household,
 * single market-data lake — one Finnhub/yahoo call benefits everyone).
 */

import { sql } from 'drizzle-orm';
import {
  bigint,
  boolean,
  char,
  check,
  date,
  index,
  integer,
  numeric,
  pgTable,
  primaryKey,
  text,
  timestamp,
  type AnyPgColumn,
} from 'drizzle-orm/pg-core';
import { assetTypeEnum } from './enums';

export const securities = pgTable(
  'securities',
  {
    symbol: text('symbol').primaryKey(),
    name: text('name').notNull(),
    exchange: text('exchange'),
    fullExchange: text('full_exchange'),
    assetType: assetTypeEnum('asset_type').notNull().default('EQUITY'),
    currency: char('currency', { length: 3 }).notNull().default('USD'),
    sector: text('sector'),
    industry: text('industry'),
    industryKey: text('industry_key'),
    country: text('country'),
    timezone: text('timezone'),
    delistedAt: date('delisted_at'),
    // Self-reference: `renamed_to` points to the surviving symbol (FB → META).
    // Use `(): AnyColumn` to defer column lookup past the cyclic init.
    renamedTo: text('renamed_to').references((): AnyPgColumn => securities.symbol),
    searchText: text('search_text').generatedAlwaysAs(
      sql`lower(symbol || ' ' || name)`,
    ),
    refreshedAt: timestamp('refreshed_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => [
    check(
      'chk_securities_symbol',
      sql`${t.symbol} ~ '^[A-Z0-9.\\^\\-]{1,16}$'`,
    ),
    // GIN trigram index for ⌘K Market search; relies on pg_trgm extension.
    // drizzle-kit may not emit `gin_trgm_ops`; we patch the generated SQL.
    index('idx_securities_search')
      .using('gin', sql`${t.searchText} gin_trgm_ops`),
    index('idx_securities_active')
      .on(t.assetType)
      .where(sql`${t.delistedAt} IS NULL`),
  ],
);

export const quoteCache = pgTable(
  'quote_cache',
  {
    symbol: text('symbol')
      .primaryKey()
      .references(() => securities.symbol, { onDelete: 'cascade' }),

    // regular session
    price: numeric('price', { precision: 20, scale: 6 }).notNull(),
    prevClose: numeric('prev_close', { precision: 20, scale: 6 }),
    dayHigh: numeric('day_high', { precision: 20, scale: 6 }),
    dayLow: numeric('day_low', { precision: 20, scale: 6 }),
    openPrice: numeric('open_price', { precision: 20, scale: 6 }),
    volume: bigint('volume', { mode: 'bigint' }),

    // live order book (regular hours only)
    bid: numeric('bid', { precision: 20, scale: 6 }),
    ask: numeric('ask', { precision: 20, scale: 6 }),
    bidSize: integer('bid_size'),
    askSize: integer('ask_size'),

    // extended hours (U-2: pre/post on Home + SymbolDetail)
    preMarketPrice: numeric('pre_market_price', { precision: 20, scale: 6 }),
    preMarketChange: numeric('pre_market_change', { precision: 20, scale: 6 }),
    preMarketAt: timestamp('pre_market_at', { withTimezone: true }),
    postMarketPrice: numeric('post_market_price', { precision: 20, scale: 6 }),
    postMarketChange: numeric('post_market_change', { precision: 20, scale: 6 }),
    postMarketAt: timestamp('post_market_at', { withTimezone: true }),

    // session context
    marketState: text('market_state'),
    marketTime: timestamp('market_time', { withTimezone: true }),

    // bookkeeping
    source: text('source').notNull(),
    fetchedAt: timestamp('fetched_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => [index('idx_quote_cache_freshness').on(t.fetchedAt)],
);

export const securitiesMeta = pgTable(
  'securities_meta',
  {
    symbol: text('symbol')
      .primaryKey()
      .references(() => securities.symbol, { onDelete: 'cascade' }),

    // size / shares
    marketCap: numeric('market_cap', { precision: 24, scale: 0 }),
    sharesOutstanding: bigint('shares_outstanding', { mode: 'bigint' }),
    floatShares: bigint('float_shares', { mode: 'bigint' }),

    // valuation
    trailingPe: numeric('trailing_pe', { precision: 10, scale: 4 }),
    forwardPe: numeric('forward_pe', { precision: 10, scale: 4 }),
    priceToBook: numeric('price_to_book', { precision: 10, scale: 4 }),
    epsTrailing: numeric('eps_trailing', { precision: 10, scale: 4 }),
    epsForward: numeric('eps_forward', { precision: 10, scale: 4 }),
    bookValue: numeric('book_value', { precision: 20, scale: 6 }),

    // 52-week range
    fiftyTwoWeekHigh: numeric('fifty_two_week_high', { precision: 20, scale: 6 }),
    fiftyTwoWeekLow: numeric('fifty_two_week_low', { precision: 20, scale: 6 }),

    // moving averages (R-I1 chart overlay)
    fiftyDayAverage: numeric('fifty_day_average', { precision: 20, scale: 6 }),
    twoHundredDayAverage: numeric('two_hundred_day_average', { precision: 20, scale: 6 }),

    // next dividend event (history goes to dividends_announced)
    dividendRate: numeric('dividend_rate', { precision: 20, scale: 6 }),
    dividendYield: numeric('dividend_yield', { precision: 10, scale: 4 }),
    nextDividendDate: date('next_dividend_date'),
    nextExDividendDate: date('next_ex_dividend_date'),

    // next earnings
    nextEarningsAt: timestamp('next_earnings_at', { withTimezone: true }),
    nextEarningsIsEst: boolean('next_earnings_is_est'),

    // analyst consensus (1.0 strong buy → 5.0 strong sell)
    analystRatingMean: numeric('analyst_rating_mean', { precision: 10, scale: 4 }),
    analystTargetMean: numeric('analyst_target_mean', { precision: 20, scale: 6 }),
    analystTargetHigh: numeric('analyst_target_high', { precision: 20, scale: 6 }),
    analystTargetLow: numeric('analyst_target_low', { precision: 20, scale: 6 }),
    analystRecommendation: text('analyst_recommendation'),

    refreshedAt: timestamp('refreshed_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => [index('idx_securities_meta_freshness').on(t.refreshedAt)],
);

export const pricesDaily = pgTable(
  'prices_daily',
  {
    symbol: text('symbol')
      .notNull()
      .references(() => securities.symbol, { onDelete: 'cascade' }),
    date: date('date').notNull(),
    open: numeric('open', { precision: 20, scale: 6 }).notNull(),
    high: numeric('high', { precision: 20, scale: 6 }).notNull(),
    low: numeric('low', { precision: 20, scale: 6 }).notNull(),
    close: numeric('close', { precision: 20, scale: 6 }).notNull(),
    adjClose: numeric('adj_close', { precision: 20, scale: 6 }),
    volume: bigint('volume', { mode: 'bigint' }),
  },
  (t) => [
    primaryKey({ columns: [t.symbol, t.date] }),
    index('idx_prices_daily_date').on(t.date),
  ],
);

export type Security = typeof securities.$inferSelect;
export type NewSecurity = typeof securities.$inferInsert;
export type QuoteCache = typeof quoteCache.$inferSelect;
export type NewQuoteCache = typeof quoteCache.$inferInsert;
export type SecuritiesMeta = typeof securitiesMeta.$inferSelect;
export type NewSecuritiesMeta = typeof securitiesMeta.$inferInsert;
export type PricesDaily = typeof pricesDaily.$inferSelect;
export type NewPricesDaily = typeof pricesDaily.$inferInsert;
