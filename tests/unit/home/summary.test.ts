/**
 * Unit tests for lib/home/summary.ts.
 *
 * Mocks `getPositions` (db layer) and injects a fake quote fetcher via
 * the `fetchQuote` option. Tests focus on the aggregation contract:
 * per-symbol roll-up across accounts, parallel quote tolerance, hero
 * totals correctness, today P/L when prevClose is missing/zero.
 */

import Decimal from 'decimal.js';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Quote } from '../../../lib/market';

vi.mock('../../../lib/portfolio/positions', async () => {
  const actual = await vi.importActual<typeof import('../../../lib/portfolio/positions')>(
    '../../../lib/portfolio/positions',
  );
  return {
    ...actual,
    getPositions: vi.fn(),
  };
});

const { getPositions } = await import('../../../lib/portfolio/positions');
const { getHomeSummary } = await import('../../../lib/home/summary');

function pos(over: Partial<import('../../../lib/portfolio/positions').Position> = {}) {
  return {
    accountId: 'a1',
    symbol: 'AAPL',
    quantity: new Decimal('10'),
    avgCost: new Decimal('150'),
    totalCost: new Decimal('1500'),
    realizedPl: new Decimal('0'),
    firstBuyAt: new Date('2025-01-01'),
    lastTxnAt: new Date('2025-01-01'),
    ...over,
  };
}

function quote(
  symbol: string,
  price: number,
  prevClose: number | null = price - 1,
  name = symbol,
): Quote {
  // Cast to Quote — tests only exercise (symbol, price, prevClose, name);
  // the other 30+ upstream fields are irrelevant to the home summary path
  // under test, so cast through unknown rather than enumerate them.
  return {
    symbol,
    canonicalSymbol: symbol,
    name,
    currency: 'USD',
    price,
    prevClose,
    marketState: 'REGULAR',
    marketTime: new Date(),
    preMarketPrice: null,
    preMarketChange: null,
    preMarketAt: null,
    postMarketPrice: null,
    postMarketChange: null,
    postMarketAt: null,
  } as unknown as Quote;
}

describe('getHomeSummary', () => {
  beforeEach(() => {
    vi.mocked(getPositions).mockReset();
  });

  it('returns empty summary when no positions', async () => {
    vi.mocked(getPositions).mockResolvedValueOnce([]);
    const s = await getHomeSummary('profile-uuid', {
      fetchQuote: () => Promise.resolve(quote('AAPL', 100)),
    });
    expect(s.bySymbol).toEqual([]);
    expect(s.totalMarketValue.equals(0)).toBe(true);
    expect(s.todayPct).toBeNull();
  });

  it('collapses multiple accounts of the same symbol into one row', async () => {
    vi.mocked(getPositions).mockResolvedValueOnce([
      pos({
        accountId: 'a1',
        symbol: 'AAPL',
        quantity: new Decimal('10'),
        totalCost: new Decimal('1500'),
      }),
      pos({
        accountId: 'a2',
        symbol: 'AAPL',
        quantity: new Decimal('5'),
        totalCost: new Decimal('800'),
      }),
    ]);
    const s = await getHomeSummary('profile-uuid', {
      fetchQuote: () => Promise.resolve(quote('AAPL', 200, 198)),
    });
    expect(s.bySymbol).toHaveLength(1);
    const r = s.bySymbol[0]!;
    expect(r.totalQty.equals(15)).toBe(true);
    expect(r.totalCost.equals(2300)).toBe(true);
    // weighted avg = 2300 / 15
    expect(r.avgCost.toFixed(4)).toBe('153.3333');
    expect(r.marketValue?.equals(3000)).toBe(true);
    // today P/L = 15 × (200 − 198) = 30
    expect(r.todayPl?.equals(30)).toBe(true);
  });

  it('hero totals sum per-symbol rows', async () => {
    vi.mocked(getPositions).mockResolvedValueOnce([
      pos({ symbol: 'AAPL', quantity: new Decimal('10'), totalCost: new Decimal('1500') }),
      pos({ symbol: 'MSFT', quantity: new Decimal('5'), totalCost: new Decimal('2000') }),
    ]);
    const s = await getHomeSummary('profile-uuid', {
      fetchQuote: (sym) =>
        Promise.resolve(quote(sym, sym === 'AAPL' ? 200 : 500, sym === 'AAPL' ? 198 : 495)),
    });
    // MV: 10×200 + 5×500 = 2000 + 2500 = 4500
    expect(s.totalMarketValue.equals(4500)).toBe(true);
    // cost: 1500 + 2000 = 3500
    expect(s.totalCost.equals(3500)).toBe(true);
    // unrealized: 1000
    expect(s.totalUnrealizedPl.equals(1000)).toBe(true);
    // today P/L: 10×2 + 5×5 = 45
    expect(s.todayPl.equals(45)).toBe(true);
    // today pct: 45 / (10×198 + 5×495) = 45 / 4455
    expect(s.todayPct?.toFixed(6)).toBe('0.010101');
  });

  it('isolates a failed quote — row gets nulls, others render', async () => {
    vi.mocked(getPositions).mockResolvedValueOnce([
      pos({ symbol: 'AAPL', quantity: new Decimal('10'), totalCost: new Decimal('1500') }),
      pos({ symbol: 'BADSYM', quantity: new Decimal('1'), totalCost: new Decimal('50') }),
    ]);
    const s = await getHomeSummary('profile-uuid', {
      fetchQuote: (sym) =>
        sym === 'BADSYM' ? Promise.reject(new Error('429')) : Promise.resolve(quote(sym, 200, 198)),
    });
    expect(s.failedSymbols).toEqual(['BADSYM']);
    expect(s.bySymbol).toHaveLength(2);
    const bad = s.bySymbol.find((r) => r.symbol === 'BADSYM')!;
    expect(bad.currentPrice).toBeNull();
    expect(bad.marketValue).toBeNull();
    expect(bad.todayPl).toBeNull();
    const good = s.bySymbol.find((r) => r.symbol === 'AAPL')!;
    expect(good.marketValue?.equals(2000)).toBe(true);
  });

  it('today P/L absent when prevClose missing', async () => {
    vi.mocked(getPositions).mockResolvedValueOnce([
      pos({ symbol: 'AAPL', quantity: new Decimal('10'), totalCost: new Decimal('1500') }),
    ]);
    const s = await getHomeSummary('profile-uuid', {
      fetchQuote: () => Promise.resolve(quote('AAPL', 200, null)),
    });
    expect(s.bySymbol[0]!.todayPl).toBeNull();
    expect(s.todayPl.equals(0)).toBe(true);
    expect(s.todayPct).toBeNull();
  });

  it('sorts by marketValue DESC; failed rows last alphabetical', async () => {
    vi.mocked(getPositions).mockResolvedValueOnce([
      pos({ symbol: 'ZZZ', quantity: new Decimal('1'), totalCost: new Decimal('10') }),
      pos({ symbol: 'AAA', quantity: new Decimal('10'), totalCost: new Decimal('1500') }),
      pos({ symbol: 'BAD', quantity: new Decimal('1'), totalCost: new Decimal('10') }),
    ]);
    const s = await getHomeSummary('profile-uuid', {
      fetchQuote: (sym) =>
        sym === 'BAD'
          ? Promise.reject(new Error('429'))
          : sym === 'AAA'
            ? Promise.resolve(quote(sym, 200, 199))
            : Promise.resolve(quote(sym, 50, 49)),
    });
    const order = s.bySymbol.map((r) => r.symbol);
    // AAA (mv 2000), ZZZ (mv 50), BAD (failed)
    expect(order).toEqual(['AAA', 'ZZZ', 'BAD']);
  });
});
