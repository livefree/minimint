/**
 * Unit tests for lib/trade/totals.ts.
 *
 * Pins precision-sensitive cases that motivated contract #6 in the first
 * place: floating-point quirks like 0.1 + 0.2 ≠ 0.3 cannot show up in
 * any cash figure shown to the operator.
 */

import Decimal from 'decimal.js';
import { describe, expect, it } from 'vitest';
import { computeEstimatedTotal, formatCash } from '../../../lib/trade/totals';

describe('computeEstimatedTotal', () => {
  it('BUY: qty × price + fees, negative (cash out)', () => {
    const r = computeEstimatedTotal({ kind: 'BUY', quantity: '19', price: '263.41', fees: '0' });
    expect(r.equals(new Decimal('-5004.79'))).toBe(true);
  });

  it('BUY with fees adds to outflow', () => {
    const r = computeEstimatedTotal({ kind: 'BUY', quantity: '10', price: '100', fees: '1.99' });
    expect(r.equals(new Decimal('-1001.99'))).toBe(true);
  });

  it('SELL: qty × price − fees, positive (cash in)', () => {
    const r = computeEstimatedTotal({ kind: 'SELL', quantity: '5', price: '300.50', fees: '1.00' });
    expect(r.equals(new Decimal('1501.50'))).toBe(true);
  });

  it('DIV: qty × price, positive (no fees field)', () => {
    const r = computeEstimatedTotal({ kind: 'DIV', quantity: '10', price: '0.95' });
    expect(r.equals(new Decimal('9.50'))).toBe(true);
  });

  it('CASH_IN: just the quantity, positive', () => {
    const r = computeEstimatedTotal({ kind: 'CASH_IN', quantity: '500' });
    expect(r.equals(new Decimal('500'))).toBe(true);
  });

  it('CASH_OUT: just the quantity, negative', () => {
    const r = computeEstimatedTotal({ kind: 'CASH_OUT', quantity: '50' });
    expect(r.equals(new Decimal('-50'))).toBe(true);
  });

  it('FEE: −fees', () => {
    const r = computeEstimatedTotal({ kind: 'FEE', quantity: '0', fees: '2.99' });
    expect(r.equals(new Decimal('-2.99'))).toBe(true);
  });

  it('SPLIT: 0', () => {
    const r = computeEstimatedTotal({ kind: 'SPLIT', quantity: '2' });
    expect(r.isZero()).toBe(true);
  });

  it('TRANSFER_IN / TRANSFER_OUT: 0 (no cash impact in v1)', () => {
    expect(computeEstimatedTotal({ kind: 'TRANSFER_IN', quantity: '10' }).isZero()).toBe(true);
    expect(computeEstimatedTotal({ kind: 'TRANSFER_OUT', quantity: '10' }).isZero()).toBe(true);
  });

  it('empty / null inputs degrade to Decimal(0), no NaN', () => {
    const r = computeEstimatedTotal({ kind: 'BUY', quantity: '', price: null, fees: undefined });
    expect(r.isZero()).toBe(true);
  });

  it('classic float-precision case 0.1 + 0.2: BUY 0.1@0.2 fee 0 = -0.02', () => {
    const r = computeEstimatedTotal({ kind: 'BUY', quantity: '0.1', price: '0.2', fees: '0' });
    // 0.1 * 0.2 = 0.02 exactly with Decimal; would be 0.020000000000000004 with floats
    expect(r.equals(new Decimal('-0.02'))).toBe(true);
  });

  it('high-precision quantity preserved (8 frac digits per schema)', () => {
    const r = computeEstimatedTotal({
      kind: 'BUY',
      quantity: '0.12345678',
      price: '100',
      fees: '0',
    });
    expect(r.equals(new Decimal('-12.345678'))).toBe(true);
  });

  it('accepts Decimal instances as input', () => {
    const r = computeEstimatedTotal({
      kind: 'SELL',
      quantity: new Decimal('2'),
      price: new Decimal('150'),
      fees: new Decimal('0'),
    });
    expect(r.equals(new Decimal('300'))).toBe(true);
  });
});

describe('formatCash', () => {
  it('positive cash impact gets currency $X', () => {
    expect(formatCash(new Decimal('1234.56'))).toBe('$1,234.56');
  });

  it('negative cash impact gets minus sign prefix', () => {
    expect(formatCash(new Decimal('-1234.56'))).toBe('−$1,234.56');
  });

  it('zero formats as $0.00 (positive sign)', () => {
    expect(formatCash(new Decimal('0'))).toBe('$0.00');
  });

  it('rounds display to 2 decimal places (display-only; underlying stays exact)', () => {
    expect(formatCash(new Decimal('1.005'))).toBe('$1.01');
  });
});
