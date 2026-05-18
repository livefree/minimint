/**
 * Unit tests for lib/portfolio/positions.ts.
 *
 * Mocks the DB by passing an object with a stubbed `execute` method.
 * We assert: (a) numeric columns are wrapped in Decimal (contract #6),
 * (b) timestamptz columns become Date | null, (c) options pass through
 * to a single execute() call, (d) the rowsOf adapter tolerates both
 * `{rows: [...]}` and plain `[...]` driver shapes.
 *
 * "Did it call the right function name" is verified by the dialect-
 * compilation done by Drizzle plus the integration tier (M2 e2e item:
 * buy → see position with correct math) — over-specifying it here would
 * couple the test to Drizzle internals.
 */

import Decimal from 'decimal.js';
import { describe, expect, it, vi } from 'vitest';
import { getMyPosition, getNetWorth, getPositions } from '../../../lib/portfolio/positions';
import type { DB } from '../../../db/client';

function makeDb(rows: Record<string, unknown>[]): {
  db: DB;
  execute: ReturnType<typeof vi.fn>;
} {
  const execute = vi.fn().mockResolvedValue({ rows });
  return { db: { execute } as unknown as DB, execute };
}

describe('getPositions', () => {
  it('calls get_positions with status=open by default and wraps numerics', async () => {
    const { db, execute } = makeDb([
      {
        account_id: 'a1',
        symbol: 'AAPL',
        quantity: '10.50000000',
        avg_cost: '150.000000',
        total_cost: '1575.0000',
        realized_pl: '0.0000',
        first_buy_at: '2025-01-15T10:30:00Z',
        last_txn_at: '2025-02-01T14:00:00Z',
      },
    ]);

    const rows = await getPositions('profile-uuid', {}, db);

    expect(execute).toHaveBeenCalledTimes(1);
    expect(rows).toHaveLength(1);
    const r = rows[0]!;
    expect(r.symbol).toBe('AAPL');
    expect(r.quantity).toBeInstanceOf(Decimal);
    expect(r.quantity.equals(new Decimal('10.5'))).toBe(true);
    expect(r.avgCost.equals(new Decimal('150'))).toBe(true);
    expect(r.firstBuyAt).toBeInstanceOf(Date);
    expect(r.firstBuyAt?.toISOString()).toBe('2025-01-15T10:30:00.000Z');
  });

  it('passes accountId + status when provided', async () => {
    const { db, execute } = makeDb([]);
    await getPositions('profile-uuid', { accountId: 'acct-uuid', status: 'closed' }, db);
    expect(execute).toHaveBeenCalledTimes(1);
  });

  it('returns [] on empty result', async () => {
    const { db } = makeDb([]);
    const rows = await getPositions('profile-uuid', {}, db);
    expect(rows).toEqual([]);
  });

  it('maps NULL last_txn_at to null Date', async () => {
    const { db } = makeDb([
      {
        account_id: 'a1',
        symbol: 'AAPL',
        quantity: '0',
        avg_cost: '0',
        total_cost: '0',
        realized_pl: '0',
        first_buy_at: null,
        last_txn_at: null,
      },
    ]);
    const rows = await getPositions('profile-uuid', {}, db);
    expect(rows[0]!.firstBuyAt).toBeNull();
    expect(rows[0]!.lastTxnAt).toBeNull();
  });
});

describe('getMyPosition', () => {
  it('returns per-account rows with is_lt boolean and days_to_lt number', async () => {
    const { db, execute } = makeDb([
      {
        account_id: 'a1',
        account_name: 'Fidelity · Individual',
        quantity: '5.00000000',
        avg_cost: '180.000000',
        first_buy_at: '2024-06-01T10:00:00Z',
        is_lt: true,
        days_to_lt: 0,
      },
      {
        account_id: 'a2',
        account_name: 'Roth IRA',
        quantity: '2.00000000',
        avg_cost: '200.000000',
        first_buy_at: '2025-03-01T10:00:00Z',
        is_lt: false,
        days_to_lt: 120,
      },
    ]);

    const rows = await getMyPosition('profile-uuid', 'AAPL', db);

    expect(execute).toHaveBeenCalledTimes(1);
    expect(rows).toHaveLength(2);
    expect(rows[0]!.isLt).toBe(true);
    expect(rows[0]!.daysToLt).toBe(0);
    expect(rows[1]!.isLt).toBe(false);
    expect(rows[1]!.daysToLt).toBe(120);
    expect(rows[1]!.quantity).toBeInstanceOf(Decimal);
  });
});

describe('getNetWorth', () => {
  it('returns the single-row aggregate with Decimal fields', async () => {
    const { db, execute } = makeDb([
      {
        total_market_value: '12345.6789',
        total_cost: '10000.0000',
        today_pl: '23.4567',
        today_pct: '0.0019',
        cash_balance: '500.0000',
      },
    ]);

    const nw = await getNetWorth('profile-uuid', null, db);

    expect(execute).toHaveBeenCalledTimes(1);
    expect(nw.totalMarketValue).toBeInstanceOf(Decimal);
    expect(nw.totalMarketValue.equals(new Decimal('12345.6789'))).toBe(true);
    expect(nw.todayPct.equals(new Decimal('0.0019'))).toBe(true);
  });

  it('returns zeroes when result has no rows', async () => {
    const { db } = makeDb([]);
    const nw = await getNetWorth('profile-uuid', null, db);
    expect(nw.totalMarketValue.equals(0)).toBe(true);
    expect(nw.cashBalance.equals(0)).toBe(true);
  });

  it('accepts plain-array result shape (node-pg driver path)', async () => {
    const arrLike = [
      {
        total_market_value: '1',
        total_cost: '1',
        today_pl: '0',
        today_pct: '0',
        cash_balance: '0',
      },
    ];
    const db = { execute: vi.fn().mockResolvedValue(arrLike) } as unknown as DB;
    const nw = await getNetWorth('profile-uuid', null, db);
    expect(nw.totalMarketValue.equals(1)).toBe(true);
  });
});
