/**
 * Portfolio-positions TS wrappers (DATABASE_SPEC §6.1).
 *
 * Thin facade over the three Postgres derived-data functions:
 *
 *   - get_positions(profile_id, account_id?, status?)
 *       → row-per (account_id, symbol) AVG-cost positions
 *   - get_my_position(profile_id, symbol)
 *       → per-account breakdown for one symbol (U-1 MyPosition card)
 *   - get_net_worth(profile_id, account_id?)
 *       → single-row aggregate (market value + cost + today P/L + cash)
 *
 * Per CLAUDE.md contract #6 every numeric column is wrapped in `Decimal`
 * at this boundary. Callers (server components, mutation cascades, UI
 * formatters) never touch raw strings or floats. timestamptz columns
 * come back as JS `Date | null`.
 *
 * INTERACTION_SPEC §6 names the matching query identifiers used by
 * TanStack Query (`positions`, `myPosition`, `netWorth`); the keys
 * themselves live in `lib/api/queryKeys.ts` once that arrives.
 */

import Decimal from 'decimal.js';
import { sql } from 'drizzle-orm';
import { db as defaultDb, type DB } from '@/db/client';

// ─── result shapes ─────────────────────────────────────────────────────

export type PositionStatus = 'open' | 'closed' | 'all';

export interface Position {
  accountId: string;
  symbol: string;
  quantity: Decimal;
  avgCost: Decimal;
  totalCost: Decimal;
  realizedPl: Decimal;
  firstBuyAt: Date | null;
  lastTxnAt: Date | null;
}

export interface MyPositionRow {
  accountId: string;
  accountName: string;
  quantity: Decimal;
  avgCost: Decimal;
  firstBuyAt: Date | null;
  isLt: boolean;
  daysToLt: number;
}

export interface NetWorth {
  totalMarketValue: Decimal;
  totalCost: Decimal;
  todayPl: Decimal;
  todayPct: Decimal;
  cashBalance: Decimal;
}

// ─── coercion helpers ──────────────────────────────────────────────────

/** Drizzle's neon-http driver returns numeric columns as JS strings to
 *  preserve precision. Wrap once at the boundary. NULL → Decimal(0). */
function dec(raw: unknown): Decimal {
  if (raw === null || raw === undefined) return new Decimal(0);
  // Decimal accepts string | number | Decimal; everything else throws.
  return new Decimal(raw as string | number | Decimal);
}

/** timestamptz → Date | null. Neon returns ISO strings; Date | null
 *  callers can pass through nullish-aware UI helpers. */
function dateOrNull(raw: unknown): Date | null {
  if (raw === null || raw === undefined) return null;
  const d = raw instanceof Date ? raw : new Date(String(raw));
  return Number.isNaN(d.getTime()) ? null : d;
}

// ─── wrappers ──────────────────────────────────────────────────────────

export interface GetPositionsOptions {
  accountId?: string;
  status?: PositionStatus;
}

export async function getPositions(
  profileId: string,
  opts: GetPositionsOptions = {},
  database: DB = defaultDb,
): Promise<Position[]> {
  const status: PositionStatus = opts.status ?? 'open';
  const accountId = opts.accountId ?? null;

  const result = await database.execute(
    sql`SELECT account_id, symbol, quantity, avg_cost, total_cost,
               realized_pl, first_buy_at, last_txn_at
        FROM get_positions(${profileId}::uuid, ${accountId}::uuid, ${status})`,
  );

  return rowsOf(result).map((r) => ({
    accountId: String(r.account_id),
    symbol: String(r.symbol),
    quantity: dec(r.quantity),
    avgCost: dec(r.avg_cost),
    totalCost: dec(r.total_cost),
    realizedPl: dec(r.realized_pl),
    firstBuyAt: dateOrNull(r.first_buy_at),
    lastTxnAt: dateOrNull(r.last_txn_at),
  }));
}

export async function getMyPosition(
  profileId: string,
  symbol: string,
  database: DB = defaultDb,
): Promise<MyPositionRow[]> {
  const result = await database.execute(
    sql`SELECT account_id, account_name, quantity, avg_cost,
               first_buy_at, is_lt, days_to_lt
        FROM get_my_position(${profileId}::uuid, ${symbol})`,
  );

  return rowsOf(result).map((r) => ({
    accountId: String(r.account_id),
    accountName: String(r.account_name),
    quantity: dec(r.quantity),
    avgCost: dec(r.avg_cost),
    firstBuyAt: dateOrNull(r.first_buy_at),
    isLt: Boolean(r.is_lt),
    daysToLt: Number(r.days_to_lt),
  }));
}

export async function getNetWorth(
  profileId: string,
  accountId: string | null = null,
  database: DB = defaultDb,
): Promise<NetWorth> {
  const result = await database.execute(
    sql`SELECT total_market_value, total_cost, today_pl, today_pct, cash_balance
        FROM get_net_worth(${profileId}::uuid, ${accountId}::uuid)`,
  );

  const row = rowsOf(result)[0];
  if (!row) {
    // Function always returns exactly one row, but guard so callers don't
    // have to nullable-check every field.
    return {
      totalMarketValue: new Decimal(0),
      totalCost: new Decimal(0),
      todayPl: new Decimal(0),
      todayPct: new Decimal(0),
      cashBalance: new Decimal(0),
    };
  }

  return {
    totalMarketValue: dec(row.total_market_value),
    totalCost: dec(row.total_cost),
    todayPl: dec(row.today_pl),
    todayPct: dec(row.today_pct),
    cashBalance: dec(row.cash_balance),
  };
}

// ─── result-shape adapter ──────────────────────────────────────────────

/** Drizzle's `execute()` returns different shapes per driver. The
 *  neon-http binding returns an object with a `rows` array; node-postgres
 *  returns an array directly. Tolerate both so swapping drivers later
 *  doesn't break this layer. */
function rowsOf(result: unknown): Record<string, unknown>[] {
  if (Array.isArray(result)) return result as Record<string, unknown>[];
  if (result && typeof result === 'object' && 'rows' in result) {
    const rows = (result as { rows: unknown }).rows;
    if (Array.isArray(rows)) return rows as Record<string, unknown>[];
  }
  return [];
}
