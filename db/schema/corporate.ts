/**
 * Corporate actions (DATABASE_SPEC §3.11–§3.13).
 *
 *   dividends_announced  — historical ex-date + amount (trimmed per ANALYSIS §F8)
 *   splits               — ratio numerator/denominator
 *   earnings_calendar    — report dates + EPS/revenue est & actual
 *
 * All operator-global.
 */

import { sql } from 'drizzle-orm';
import {
  char,
  check,
  date,
  index,
  integer,
  numeric,
  pgTable,
  primaryKey,
  text,
} from 'drizzle-orm/pg-core';
import { securities } from './market';

export const dividendsAnnounced = pgTable(
  'dividends_announced',
  {
    symbol: text('symbol')
      .notNull()
      .references(() => securities.symbol, { onDelete: 'cascade' }),
    exDate: date('ex_date').notNull(),
    amount: numeric('amount', { precision: 20, scale: 6 }).notNull(),
    currency: char('currency', { length: 3 }).notNull().default('USD'),
    // Nullable; app heuristic computes from inter-date spacing
    // (~91d=quarterly, ~183d=semi). Yahoo doesn't expose explicit frequency.
    frequency: text('frequency'),
  },
  (t) => [
    primaryKey({ columns: [t.symbol, t.exDate] }),
    index('idx_dividends_announced_ex').on(t.exDate),
  ],
);

export const splits = pgTable(
  'splits',
  {
    symbol: text('symbol')
      .notNull()
      .references(() => securities.symbol, { onDelete: 'cascade' }),
    exDate: date('ex_date').notNull(),
    ratioNumerator: integer('ratio_numerator').notNull(),
    ratioDenominator: integer('ratio_denominator').notNull(),
  },
  (t) => [
    primaryKey({ columns: [t.symbol, t.exDate] }),
    check('chk_splits_num_positive', sql`${t.ratioNumerator} > 0`),
    check('chk_splits_den_positive', sql`${t.ratioDenominator} > 0`),
    index('idx_splits_ex').on(t.exDate),
  ],
);

export const earningsCalendar = pgTable(
  'earnings_calendar',
  {
    symbol: text('symbol')
      .notNull()
      .references(() => securities.symbol, { onDelete: 'cascade' }),
    reportDate: date('report_date').notNull(),
    fiscalPeriod: text('fiscal_period'),
    epsEstimate: numeric('eps_estimate', { precision: 20, scale: 6 }),
    epsActual: numeric('eps_actual', { precision: 20, scale: 6 }),
    revenueEst: numeric('revenue_est', { precision: 20, scale: 4 }),
    revenueActual: numeric('revenue_actual', { precision: 20, scale: 4 }),
    bmoAmc: text('bmo_amc'),
  },
  (t) => [
    primaryKey({ columns: [t.symbol, t.reportDate] }),
    check(
      'chk_earnings_bmo_amc',
      sql`${t.bmoAmc} IS NULL OR ${t.bmoAmc} IN ('BMO','AMC','DMH')`,
    ),
    index('idx_earnings_date').on(t.reportDate),
  ],
);

export type DividendAnnounced = typeof dividendsAnnounced.$inferSelect;
export type NewDividendAnnounced = typeof dividendsAnnounced.$inferInsert;
export type Split = typeof splits.$inferSelect;
export type NewSplit = typeof splits.$inferInsert;
export type EarningsCalendar = typeof earningsCalendar.$inferSelect;
export type NewEarningsCalendar = typeof earningsCalendar.$inferInsert;
