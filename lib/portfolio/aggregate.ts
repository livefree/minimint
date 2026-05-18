/**
 * Aggregate per-account `MyPositionRow[]` into the single-figure
 * stats the MyPosition card renders (U-1).
 *
 * Pure Decimal math. Inputs from `getMyPosition` are already Decimal;
 * quote fields (currentPrice, prevClose) are JS numbers fresh from the
 * Yahoo SDK and get coerced at this boundary — never the other way
 * around (contract #6).
 *
 * Returns `null` when there are no rows so the caller can skip mounting
 * the card without forcing every consumer to nullable-check every
 * field.
 *
 * Today P/L formula matches the M2 exit criteria:
 *   totalQty × (currentPrice − prevClose)
 * If prevClose is missing (extended-hours quotes can omit it), the
 * today fields are returned as null and the UI hides them.
 */

import Decimal from 'decimal.js';
import type { MyPositionRow } from './positions';

export interface MyPositionAggregate {
  totalQty: Decimal;
  /** weighted by quantity: Σ(qty × avgCost) / Σ qty */
  avgCost: Decimal;
  /** Σ(qty × avgCost) — exact, not totalQty × avgCost re-multiplied */
  totalCost: Decimal;
  marketValue: Decimal;
  unrealizedPl: Decimal;
  /** unrealizedPl / totalCost; null when totalCost is zero (free shares from a SPLIT etc.) */
  unrealizedPct: Decimal | null;
  /** totalQty × (currentPrice − prevClose); null when prevClose is missing */
  todayPl: Decimal | null;
  /** (currentPrice − prevClose) / prevClose; null when prevClose is missing or zero */
  todayPct: Decimal | null;
  /** True when ANY account row's first_buy_at is ≥ 1 year ago. */
  isAnyLt: boolean;
  /** Smallest days_to_lt across rows; 0 when isAnyLt is true. */
  minDaysToLt: number;
  /** Per-account breakdown rows for the card. */
  perAccount: PerAccountRow[];
}

export interface PerAccountRow {
  accountId: string;
  accountName: string;
  quantity: Decimal;
  avgCost: Decimal;
  totalCost: Decimal;
  marketValue: Decimal;
  unrealizedPl: Decimal;
  isLt: boolean;
}

function dec(v: number | string | Decimal | null | undefined): Decimal {
  if (v === null || v === undefined || v === '') return new Decimal(0);
  try {
    return new Decimal(v);
  } catch {
    return new Decimal(0);
  }
}

export function aggregateMyPosition(
  rows: MyPositionRow[],
  currentPrice: number | string | Decimal,
  prevClose: number | string | Decimal | null,
): MyPositionAggregate | null {
  if (rows.length === 0) return null;

  const price = dec(currentPrice);
  const prev = prevClose === null ? null : dec(prevClose);

  let totalQty = new Decimal(0);
  let totalCost = new Decimal(0);
  let isAnyLt = false;
  let minDaysToLt = Number.POSITIVE_INFINITY;

  const perAccount: PerAccountRow[] = rows.map((r) => {
    const rowCost = r.quantity.times(r.avgCost);
    const rowMv = r.quantity.times(price);
    const rowPl = rowMv.minus(rowCost);

    totalQty = totalQty.plus(r.quantity);
    totalCost = totalCost.plus(rowCost);

    if (r.isLt) {
      isAnyLt = true;
      minDaysToLt = 0;
    } else if (r.daysToLt < minDaysToLt) {
      minDaysToLt = r.daysToLt;
    }

    return {
      accountId: r.accountId,
      accountName: r.accountName,
      quantity: r.quantity,
      avgCost: r.avgCost,
      totalCost: rowCost,
      marketValue: rowMv,
      unrealizedPl: rowPl,
      isLt: r.isLt,
    };
  });

  const avgCost = totalQty.isZero() ? new Decimal(0) : totalCost.dividedBy(totalQty);
  const marketValue = totalQty.times(price);
  const unrealizedPl = marketValue.minus(totalCost);
  const unrealizedPct = totalCost.isZero() ? null : unrealizedPl.dividedBy(totalCost);

  let todayPl: Decimal | null = null;
  let todayPct: Decimal | null = null;
  if (prev !== null) {
    const dayDelta = price.minus(prev);
    todayPl = totalQty.times(dayDelta);
    todayPct = prev.isZero() ? null : dayDelta.dividedBy(prev);
  }

  return {
    totalQty,
    avgCost,
    totalCost,
    marketValue,
    unrealizedPl,
    unrealizedPct,
    todayPl,
    todayPct,
    isAnyLt,
    minDaysToLt: Number.isFinite(minDaysToLt) ? minDaysToLt : 0,
    perAccount,
  };
}
