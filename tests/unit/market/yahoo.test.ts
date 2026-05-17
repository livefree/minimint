/**
 * Unit tests for lib/market/yahoo.ts.
 *
 * No network: we inject a mock YahooLike client via setClient(). Fixtures
 * mirror the actual JSON shapes captured in logs/probes/2026-05-17* runs.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getHistory,
  getQuote,
  rangeToChartParams,
  searchSymbols,
  setClient,
} from '../../../lib/market/yahoo';
import { MarketDataError } from '../../../lib/market/types';

// ─── fixtures (trimmed from real probe responses) ───────────────────────

const AAPL_QUOTE_FIXTURE = {
  symbol: 'AAPL',
  longName: 'Apple Inc.',
  shortName: 'Apple Inc.',
  currency: 'USD',
  exchange: 'NMS',
  fullExchangeName: 'NasdaqGS',
  quoteType: 'EQUITY',
  marketState: 'CLOSED',
  regularMarketPrice: 300.23,
  regularMarketPreviousClose: 298.21002,
  regularMarketDayHigh: 303.2,
  regularMarketDayLow: 296.53,
  regularMarketOpen: 297.755,
  regularMarketVolume: 54675423,
  regularMarketTime: '2026-05-15T20:00:01.000Z',
  preMarketPrice: 298.5,
  preMarketChange: 0.29,
  preMarketTime: '2026-05-15T13:25:00.000Z',
  postMarketPrice: 299.846,
  postMarketChange: -0.3840027,
  postMarketTime: '2026-05-15T23:59:44.000Z',
  bid: 299.81,
  ask: 299.85,
  bidSize: 3,
  askSize: 5,
} as const;

const AAPL_CHART_1M_FIXTURE = {
  meta: {
    symbol: 'AAPL',
    currency: 'USD',
    exchangeTimezoneName: 'America/New_York',
    instrumentType: 'EQUITY',
  },
  quotes: [
    {
      date: '2026-04-17T13:30:00.000Z',
      open: 290.1,
      high: 292.3,
      low: 289.5,
      close: 291.4,
      adjclose: 291.39,
      volume: 50000000,
    },
    {
      date: '2026-04-18T13:30:00.000Z',
      open: 291.5,
      high: 293.0,
      low: 290.2,
      close: 292.0,
      adjclose: 291.99,
      volume: 48000000,
    },
    {
      // Bar with nulls — typical of extended-hours rows; should be dropped.
      date: '2026-04-19T00:00:00.000Z',
      open: null,
      high: null,
      low: null,
      close: null,
      adjclose: null,
      volume: 0,
    },
  ],
};

const FB_RENAMED_QUOTE_FIXTURE = {
  ...AAPL_QUOTE_FIXTURE,
  symbol: 'META', // yahoo silently redirected FB → META
  longName: 'Meta Platforms, Inc.',
};

const SPY_QUOTE_FIXTURE = {
  ...AAPL_QUOTE_FIXTURE,
  symbol: 'SPY',
  longName: 'SPDR S&P 500 ETF Trust',
  shortName: 'SPDR S&P 500',
  quoteType: 'ETF',
  regularMarketPrice: 580.12,
};

const SEARCH_APPLE_FIXTURE = {
  quotes: [
    {
      symbol: 'AAPL',
      shortname: 'Apple Inc.',
      longname: 'Apple Inc.',
      exchange: 'NMS',
      quoteType: 'EQUITY',
      isYahooFinance: true,
    },
    {
      symbol: 'APLE',
      shortname: 'Apple Hospitality REIT, Inc.',
      longname: 'Apple Hospitality REIT, Inc.',
      exchange: 'NYQ',
      quoteType: 'EQUITY',
      isYahooFinance: true,
    },
    {
      symbol: 'APC.DE',
      shortname: 'Apple Inc. R',
      longname: 'Apple Inc.',
      exchange: 'GER', // German exchange — must be filtered out
      quoteType: 'EQUITY',
      isYahooFinance: true,
    },
  ],
};

// ─── helper to build a mock client ───────────────────────────────────────

type RawObj = Record<string, unknown>;

function makeMock(impl: {
  quote?: (s: string) => Promise<RawObj>;
  chart?: (s: string, o: RawObj) => Promise<RawObj>;
  search?: (q: string, o?: RawObj) => Promise<RawObj>;
}) {
  return {
    quote: vi.fn<(s: string) => Promise<RawObj>>(impl.quote ?? (async () => ({}))),
    chart: vi.fn<(s: string, o: RawObj) => Promise<RawObj>>(
      impl.chart ?? (async () => ({}))
    ),
    search: vi.fn<(q: string, o?: RawObj) => Promise<RawObj>>(
      impl.search ?? (async () => ({}))
    ),
  };
}

beforeEach(() => {
  setClient(null);
});

afterEach(() => {
  setClient(null);
});

// ─── getQuote ─────────────────────────────────────────────────────────────

describe('getQuote', () => {
  it('maps AAPL fixture into canonical Quote shape', async () => {
    const mock = makeMock({ quote: async () => AAPL_QUOTE_FIXTURE });
    setClient(mock);

    const q = await getQuote('aapl'); // lower-case → uppercased

    expect(q.symbol).toBe('AAPL');
    expect(q.canonicalSymbol).toBe('AAPL');
    expect(q.renamed).toBe(false);
    expect(q.name).toBe('Apple Inc.');
    expect(q.exchange).toBe('NMS');
    expect(q.fullExchange).toBe('NasdaqGS');
    expect(q.currency).toBe('USD');
    expect(q.assetType).toBe('EQUITY');
    expect(q.price).toBe(300.23);
    expect(q.prevClose).toBeCloseTo(298.21, 2);
    expect(q.dayHigh).toBe(303.2);
    expect(q.dayLow).toBe(296.53);
    expect(q.openPrice).toBe(297.755);
    expect(q.volume).toBe(54675423);
    expect(q.bid).toBe(299.81);
    expect(q.ask).toBe(299.85);
    expect(q.bidSize).toBe(3);
    expect(q.askSize).toBe(5);
    expect(q.preMarketPrice).toBe(298.5);
    expect(q.preMarketChange).toBeCloseTo(0.29, 2);
    expect(q.preMarketAt).toBeInstanceOf(Date);
    expect(q.postMarketPrice).toBe(299.846);
    expect(q.postMarketChange).toBeCloseTo(-0.384, 3);
    expect(q.postMarketAt).toBeInstanceOf(Date);
    expect(q.marketState).toBe('CLOSED');
    expect(q.marketTime).toBeInstanceOf(Date);
    expect(q.source).toBe('yahoo');
    expect(q.fetchedAt).toBeInstanceOf(Date);

    expect(mock.quote).toHaveBeenCalledWith('AAPL');
  });

  it('detects symbol rename when response.symbol differs', async () => {
    const mock = makeMock({ quote: async () => FB_RENAMED_QUOTE_FIXTURE });
    setClient(mock);

    const q = await getQuote('FB');

    expect(q.symbol).toBe('FB');
    expect(q.canonicalSymbol).toBe('META');
    expect(q.renamed).toBe(true);
    expect(q.name).toBe('Meta Platforms, Inc.');
  });

  it('treats ETF quoteType correctly', async () => {
    const mock = makeMock({ quote: async () => SPY_QUOTE_FIXTURE });
    setClient(mock);

    const q = await getQuote('SPY');

    expect(q.assetType).toBe('ETF');
    expect(q.price).toBe(580.12);
  });

  it('throws NOT_FOUND when provider returns nothing', async () => {
    const mock = makeMock({
      quote: async () => {
        throw new Error('No data found, symbol may be delisted');
      },
    });
    setClient(mock);

    await expect(getQuote('ZZZZ')).rejects.toThrow(MarketDataError);
    await expect(getQuote('ZZZZ')).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('throws RATE_LIMITED when provider says so', async () => {
    const mock = makeMock({
      quote: async () => {
        throw new Error('429 Too Many Requests');
      },
    });
    setClient(mock);

    await expect(getQuote('AAPL')).rejects.toMatchObject({ code: 'RATE_LIMITED' });
  });

  it('throws UPSTREAM_ERROR when provider gives a quote without regularMarketPrice', async () => {
    const mock = makeMock({
      quote: async () => ({ symbol: 'AAPL' /* no price */ }),
    });
    setClient(mock);

    await expect(getQuote('AAPL')).rejects.toMatchObject({ code: 'UPSTREAM_ERROR' });
  });

  it('falls back to OTHER asset type for unknown quoteType', async () => {
    const mock = makeMock({
      quote: async () => ({ ...AAPL_QUOTE_FIXTURE, quoteType: 'WEIRD' }),
    });
    setClient(mock);

    const q = await getQuote('AAPL');
    expect(q.assetType).toBe('OTHER');
  });

  it('falls back to CLOSED marketState for unknown values', async () => {
    const mock = makeMock({
      quote: async () => ({ ...AAPL_QUOTE_FIXTURE, marketState: undefined }),
    });
    setClient(mock);

    const q = await getQuote('AAPL');
    expect(q.marketState).toBe('CLOSED');
  });
});

// ─── getHistory ───────────────────────────────────────────────────────────

describe('getHistory', () => {
  it('renames adjclose → adjClose in each bar', async () => {
    const mock = makeMock({ chart: async () => AAPL_CHART_1M_FIXTURE });
    setClient(mock);

    const h = await getHistory('AAPL', '1M');

    expect(h.bars).toHaveLength(2); // null bar dropped
    expect(h.bars[0]).toBeDefined();
    expect(h.bars[0]!.adjClose).toBeCloseTo(291.39, 2);
    expect(h.bars[1]!.adjClose).toBeCloseTo(291.99, 2);
    // No raw `adjclose` field
    expect(h.bars[0]).not.toHaveProperty('adjclose');
  });

  it('preserves timezone and currency from meta', async () => {
    const mock = makeMock({ chart: async () => AAPL_CHART_1M_FIXTURE });
    setClient(mock);

    const h = await getHistory('AAPL', '1M');

    expect(h.timezone).toBe('America/New_York');
    expect(h.currency).toBe('USD');
  });

  it('detects symbol rename in chart meta', async () => {
    const mock = makeMock({
      chart: async () => ({
        meta: { symbol: 'META', currency: 'USD' },
        quotes: AAPL_CHART_1M_FIXTURE.quotes,
      }),
    });
    setClient(mock);

    const h = await getHistory('FB', '1M');

    expect(h.symbol).toBe('FB');
    expect(h.canonicalSymbol).toBe('META');
    expect(h.renamed).toBe(true);
  });

  it('returns empty bars when provider returns no quotes', async () => {
    const mock = makeMock({
      chart: async () => ({ meta: { symbol: 'AAPL' }, quotes: [] }),
    });
    setClient(mock);

    const h = await getHistory('AAPL', '1M');
    expect(h.bars).toEqual([]);
  });

  it('drops bars with null open/high/low/close', async () => {
    const mock = makeMock({ chart: async () => AAPL_CHART_1M_FIXTURE });
    setClient(mock);

    const h = await getHistory('AAPL', '1M');
    // The 3rd fixture row has all-null OHLC; should be filtered out
    expect(h.bars.every((b) => b.open !== null && b.close !== null)).toBe(true);
  });
});

// ─── rangeToChartParams ───────────────────────────────────────────────────

describe('rangeToChartParams', () => {
  it('1D uses 5m interval', () => {
    expect(rangeToChartParams('1D').interval).toBe('5m');
  });

  it('1Y uses 1d interval', () => {
    expect(rangeToChartParams('1Y').interval).toBe('1d');
  });

  it('5Y uses 1wk interval', () => {
    expect(rangeToChartParams('5Y').interval).toBe('1wk');
  });

  it('ALL uses 1mo interval and epoch start', () => {
    const { period1, interval } = rangeToChartParams('ALL');
    expect(interval).toBe('1mo');
    expect(period1.getTime()).toBe(0);
  });

  it('YTD starts at Jan 1 of current year', () => {
    const { period1 } = rangeToChartParams('YTD');
    expect(period1.getMonth()).toBe(0);
    expect(period1.getDate()).toBe(1);
    expect(period1.getFullYear()).toBe(new Date().getFullYear());
  });
});

// ─── searchSymbols ────────────────────────────────────────────────────────

describe('searchSymbols', () => {
  it('returns empty for empty query', async () => {
    const r = await searchSymbols('');
    expect(r).toEqual([]);
  });

  it('filters out non-US exchanges', async () => {
    const mock = makeMock({ search: async () => SEARCH_APPLE_FIXTURE });
    setClient(mock);

    const r = await searchSymbols('apple');

    expect(r.map((x) => x.symbol)).toEqual(['AAPL', 'APLE']);
    expect(r.some((x) => x.symbol === 'APC.DE')).toBe(false);
  });

  it('passes through asset type', async () => {
    const mock = makeMock({
      search: async () => ({
        quotes: [
          {
            symbol: 'SPY',
            shortname: 'SPDR S&P 500',
            exchange: 'PCX',
            quoteType: 'ETF',
            isYahooFinance: true,
          },
        ],
      }),
    });
    setClient(mock);

    const r = await searchSymbols('SPY');
    expect(r[0]!.assetType).toBe('ETF');
  });
});
