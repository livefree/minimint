/**
 * Unit tests for lib/portfolio/aggregate.ts.
 *
 * Pins the M2 exit-criteria formula
 *   today_pl = totalQty × (currentPrice − prevClose)
 * plus the weighted-avg-cost math that the multi-account aggregation
 * case actually exercises.
 */

import Decimal from 'decimal.js';
import { describe, expect, it } from 'vitest';
import { aggregateMyPosition } from '../../../lib/portfolio/aggregate';
import type { MyPositionRow } from '../../../lib/portfolio/positions';

function row(over: Partial<MyPositionRow> = {}): MyPositionRow {
  return {
    accountId: 'a1',
    accountName: 'Account',
    quantity: new Decimal('0'),
    avgCost: new Decimal('0'),
    firstBuyAt: null,
    isLt: false,
    daysToLt: 365,
    ...over,
  };
}

describe('aggregateMyPosition', () => {
  it('returns null when rows is empty', () => {
    expect(aggregateMyPosition([], 100, 99)).toBeNull();
  });

  it('single account: avg cost = row avg cost', () => {
    const r = row({
      accountId: 'a1',
      accountName: 'Fidelity',
      quantity: new Decimal('10'),
      avgCost: new Decimal('150'),
    });
    const agg = aggregateMyPosition([r], 160, 159)!;
    expect(agg.totalQty.equals(10)).toBe(true);
    expect(agg.avgCost.equals(150)).toBe(true);
    expect(agg.totalCost.equals(1500)).toBe(true);
    expect(agg.marketValue.equals(1600)).toBe(true);
    expect(agg.unrealizedPl.equals(100)).toBe(true);
    expect(agg.todayPl?.equals(10)).toBe(true);
    expect(agg.perAccount).toHaveLength(1);
  });

  it('multi-account weighted avg cost', () => {
    // Fidelity: 10 sh @ 150  → cost 1500
    // Roth IRA: 5 sh  @ 200  → cost 1000
    // Total: 15 sh; weighted avg = 2500 / 15 = 166.666…
    const rows = [
      row({
        accountId: 'a1',
        accountName: 'Fidelity',
        quantity: new Decimal('10'),
        avgCost: new Decimal('150'),
      }),
      row({
        accountId: 'a2',
        accountName: 'Roth',
        quantity: new Decimal('5'),
        avgCost: new Decimal('200'),
      }),
    ];
    const agg = aggregateMyPosition(rows, 180, 178)!;
    expect(agg.totalQty.equals(15)).toBe(true);
    expect(agg.totalCost.equals(2500)).toBe(true);
    expect(agg.avgCost.toFixed(4)).toBe('166.6667');
    expect(agg.marketValue.equals(2700)).toBe(true);
    expect(agg.unrealizedPl.equals(200)).toBe(true);
    // today P/L = 15 × (180 − 178) = 30
    expect(agg.todayPl?.equals(30)).toBe(true);
    expect(agg.perAccount).toHaveLength(2);
  });

  it('M2 exit-criteria canary: 19 sh @ 263.41, current 264.50, prev 263.41', () => {
    const r = row({
      quantity: new Decimal('19'),
      avgCost: new Decimal('263.41'),
    });
    const agg = aggregateMyPosition([r], 264.5, 263.41)!;
    // today P/L = 19 × (264.50 − 263.41) = 19 × 1.09 = 20.71
    expect(agg.todayPl?.toFixed(2)).toBe('20.71');
    // total cost = 19 × 263.41 = 5004.79
    expect(agg.totalCost.equals(new Decimal('5004.79'))).toBe(true);
    expect(agg.marketValue.toFixed(2)).toBe('5025.50');
    expect(agg.unrealizedPl.toFixed(2)).toBe('20.71');
  });

  it('null prevClose: today fields are null', () => {
    const r = row({ quantity: new Decimal('10'), avgCost: new Decimal('150') });
    const agg = aggregateMyPosition([r], 160, null)!;
    expect(agg.todayPl).toBeNull();
    expect(agg.todayPct).toBeNull();
    expect(agg.unrealizedPl.equals(100)).toBe(true);
  });

  it('isAnyLt rolls up across rows; minDaysToLt = 0 when any is LT', () => {
    const rows = [
      row({ accountId: 'a1', isLt: false, daysToLt: 90 }),
      row({ accountId: 'a2', isLt: true, daysToLt: 0 }),
    ];
    const agg = aggregateMyPosition(rows, 100, 99)!;
    expect(agg.isAnyLt).toBe(true);
    expect(agg.minDaysToLt).toBe(0);
  });

  it('minDaysToLt = smallest when no row is LT', () => {
    const rows = [
      row({ accountId: 'a1', isLt: false, daysToLt: 120 }),
      row({ accountId: 'a2', isLt: false, daysToLt: 30 }),
      row({ accountId: 'a3', isLt: false, daysToLt: 200 }),
    ];
    const agg = aggregateMyPosition(rows, 100, 99)!;
    expect(agg.isAnyLt).toBe(false);
    expect(agg.minDaysToLt).toBe(30);
  });

  it('totalCost = 0 → unrealizedPct is null (no divide-by-zero)', () => {
    // Free shares scenario: SPLIT/TRANSFER inflated qty but zero cost.
    // Real positions go through get_positions's avg_cost calc which
    // already handles 0 — this guards the aggregate layer too.
    const r = row({ quantity: new Decimal('10'), avgCost: new Decimal('0') });
    const agg = aggregateMyPosition([r], 100, 99)!;
    expect(agg.unrealizedPct).toBeNull();
    expect(agg.unrealizedPl.equals(1000)).toBe(true);
  });

  it('prevClose = 0 → todayPct is null (no divide-by-zero), todayPl still computed', () => {
    const r = row({ quantity: new Decimal('5'), avgCost: new Decimal('50') });
    const agg = aggregateMyPosition([r], 55, 0)!;
    expect(agg.todayPl?.equals(275)).toBe(true);
    expect(agg.todayPct).toBeNull();
  });

  it('classic float-precision case in totalCost (1.1 × 10 = 11.0 exactly)', () => {
    const r = row({ quantity: new Decimal('10'), avgCost: new Decimal('1.1') });
    const agg = aggregateMyPosition([r], 1.2, 1.1)!;
    expect(agg.totalCost.equals(new Decimal('11.0'))).toBe(true);
    expect(agg.marketValue.equals(new Decimal('12.0'))).toBe(true);
    expect(agg.unrealizedPl.equals(new Decimal('1.0'))).toBe(true);
  });

  it('per-account rows carry their own cost / mv / pl', () => {
    const rows = [
      row({
        accountId: 'a1',
        accountName: 'F',
        quantity: new Decimal('4'),
        avgCost: new Decimal('100'),
      }),
      row({
        accountId: 'a2',
        accountName: 'R',
        quantity: new Decimal('6'),
        avgCost: new Decimal('110'),
      }),
    ];
    const agg = aggregateMyPosition(rows, 120, 118)!;
    expect(agg.perAccount[0]!.totalCost.equals(400)).toBe(true);
    expect(agg.perAccount[0]!.marketValue.equals(480)).toBe(true);
    expect(agg.perAccount[0]!.unrealizedPl.equals(80)).toBe(true);
    expect(agg.perAccount[1]!.totalCost.equals(660)).toBe(true);
    expect(agg.perAccount[1]!.unrealizedPl.equals(60)).toBe(true);
  });
});
