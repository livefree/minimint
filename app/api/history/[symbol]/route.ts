/**
 * GET /api/history/[symbol]?range=1M
 *
 * Returns a History (lib/market/types.ts) for the given symbol + range.
 *
 * For M1 we always call upstream (yahoo chart()) — the prices_daily cache
 * is write-through only. Read-through caching (skip yahoo if we already
 * have the date range) lands in M2 when chart traffic increases.
 *
 * Daily/weekly/monthly bars (1M+) are persisted to prices_daily; intraday
 * (1D 5-min) bars are not — they're ephemeral and the cache write-through
 * skips today's incomplete bar anyway.
 */

import { NextResponse } from 'next/server';
import { getHistory } from '@/lib/market';
import { upsertPriceBars } from '@/lib/market/cache';
import { ALL_RANGES, MarketDataError, type Range } from '@/lib/market/types';

export const runtime = 'nodejs';

const SYMBOL_RE = /^[A-Z0-9.\^\-]{1,16}$/;

function isRange(v: string | null): v is Range {
  return v !== null && (ALL_RANGES as readonly string[]).includes(v);
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ symbol: string }> }
): Promise<NextResponse> {
  const { symbol: raw } = await params;
  const symbol = raw.toUpperCase();
  const url = new URL(req.url);
  const rangeParam = url.searchParams.get('range');
  const range: Range = isRange(rangeParam) ? rangeParam : '1Y';

  if (!SYMBOL_RE.test(symbol)) {
    return NextResponse.json(
      { ok: false, error: { code: 'INVALID_SYMBOL', message: `Invalid symbol: ${raw}` } },
      { status: 400 }
    );
  }

  try {
    const history = await getHistory(symbol, range);

    // Persist daily+ bars (not 1D intraday).
    if (range !== '1D' && range !== '1W' && history.bars.length > 0) {
      upsertPriceBars(history.canonicalSymbol, history.bars).catch((e) =>
        console.error('[api/history] cache write failed:', e)
      );
    }

    return NextResponse.json(
      { ok: true, data: history },
      {
        headers: {
          // Intraday cache: short; daily+: longer.
          'Cache-Control':
            range === '1D' || range === '1W'
              ? 'private, max-age=30'
              : 'private, max-age=600',
        },
      }
    );
  } catch (e) {
    if (e instanceof MarketDataError) {
      const status =
        e.code === 'NOT_FOUND'
          ? 404
          : e.code === 'RATE_LIMITED'
            ? 429
            : e.code === 'INVALID_SYMBOL'
              ? 400
              : 502;
      return NextResponse.json(
        { ok: false, error: { code: e.code, message: e.message } },
        { status }
      );
    }
    console.error('[api/history] internal error:', e);
    return NextResponse.json(
      { ok: false, error: { code: 'INTERNAL', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
