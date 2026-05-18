/**
 * Trade-sheet estimated-total math.
 *
 * Pure functions over Decimal — never touches a JS number, per
 * CLAUDE.md contract #6. The TradeSheet calls `computeEstimatedTotal`
 * on every input change to update the hero figure; unit tests pin
 * the precision-sensitive cases.
 *
 * Semantics:
 *   BUY            =  quantity × price + fees      (cash OUT to broker)
 *   SELL           =  quantity × price − fees      (cash IN from broker)
 *   DIV            =  quantity × price             (cash IN, no fees in v1)
 *   CASH_IN/OUT    =  ±quantity                    (price ignored)
 *   FEE            =  −fees                        (qty/price both zero)
 *   SPLIT          =  0                            (no cash impact)
 *   TRANSFER_*     =  0                            (no cash impact in v1)
 *
 * Returned sign convention matches "net cash impact on the account":
 *   negative = cash leaves the account (BUY, CASH_OUT, FEE)
 *   positive = cash enters the account (SELL, DIV, CASH_IN)
 *   zero     = no cash impact (SPLIT, TRANSFER_*)
 *
 * Inputs accept Decimal | string | number for ergonomics; "" / null
 * / invalid → treated as 0 so partially-filled forms still render a
 * sensible preview.
 */

import Decimal from 'decimal.js';

export type TransactionKind =
  | 'BUY'
  | 'SELL'
  | 'DIV'
  | 'SPLIT'
  | 'FEE'
  | 'CASH_IN'
  | 'CASH_OUT'
  | 'TRANSFER_IN'
  | 'TRANSFER_OUT';

export interface TradeInput {
  kind: TransactionKind;
  quantity: Decimal | string | number | null | undefined;
  price?: Decimal | string | number | null;
  fees?: Decimal | string | number | null;
}

function dec(v: Decimal | string | number | null | undefined): Decimal {
  if (v === null || v === undefined || v === '') return new Decimal(0);
  try {
    return new Decimal(v);
  } catch {
    return new Decimal(0);
  }
}

export function computeEstimatedTotal(input: TradeInput): Decimal {
  const qty = dec(input.quantity);
  const price = dec(input.price);
  const fees = dec(input.fees);

  switch (input.kind) {
    case 'BUY':
      return qty.times(price).plus(fees).neg();
    case 'SELL':
      return qty.times(price).minus(fees);
    case 'DIV':
      return qty.times(price);
    case 'CASH_IN':
      return qty;
    case 'CASH_OUT':
      return qty.neg();
    case 'FEE':
      return fees.neg();
    case 'SPLIT':
    case 'TRANSFER_IN':
    case 'TRANSFER_OUT':
      return new Decimal(0);
  }
}

/** Convenience: format Decimal cash impact as "$X,XXX.XX" / "−$X,XXX.XX".
 *  Used by the TradeSheet hero. Currency is USD-only in v1 per
 *  chk_transactions_currency_usd. */
export function formatCash(d: Decimal): string {
  const abs = d.abs();
  const formatted = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(abs.toNumber());
  return d.isNegative() ? `−${formatted}` : formatted;
}
