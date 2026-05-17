/**
 * GET /api/quote/[symbol]
 *
 * Returns a Quote (lib/market/types.ts) for the given US-equity symbol.
 *
 * Cache flow:
 *   1. Try quote_cache → return immediately if fetched_at < TTL
 *      (30s in market hours, 5min after; see cacheTtlMs)
 *   2. Miss → call yahoo adapter, lazy-upsert securities, upsert
 *      quote_cache, return fresh
 *   3. On upstream error map MarketDataError.code → HTTP status
 *
 * No auth check at the route level for M1: the operator already passed
 * middleware before reaching here. Profile scope doesn't apply — quotes
 * are global market data.
 */

import { NextResponse } from 'next/server';
import { getQuote } from '@/lib/market';
import { getCachedQuote, upsertQuote } from '@/lib/market/cache';
import { MarketDataError } from '@/lib/market/types';

export const runtime = 'nodejs'; // Neon driver requires node, not edge

const SYMBOL_RE = /^[A-Z0-9.\^\-]{1,16}$/;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ symbol: string }> }
): Promise<NextResponse> {
  const { symbol: raw } = await params;
  const symbol = raw.toUpperCase();

  if (!SYMBOL_RE.test(symbol)) {
    return NextResponse.json(
      { ok: false, error: { code: 'INVALID_SYMBOL', message: `Invalid symbol: ${raw}` } },
      { status: 400 }
    );
  }

  // 1. Cache check
  try {
    const cached = await getCachedQuote(symbol);
    if (cached) {
      return NextResponse.json(
        { ok: true, data: cached, source: 'cache' },
        {
          headers: {
            'Cache-Control': 'private, max-age=15',
          },
        }
      );
    }
  } catch (e) {
    // Cache miss path can swallow non-fatal DB errors — we'll just go upstream.
    console.warn('[api/quote] cache read failed, falling through:', e);
  }

  // 2. Upstream call
  try {
    const fresh = await getQuote(symbol);
    // 3. Write through; don't fail the request if write hiccups
    upsertQuote(fresh).catch((e) =>
      console.error('[api/quote] cache write failed:', e)
    );

    return NextResponse.json(
      { ok: true, data: fresh, source: 'upstream' },
      {
        headers: {
          'Cache-Control': 'private, max-age=15',
        },
      }
    );
  } catch (e) {
    return errorResponse(e);
  }
}

function errorResponse(e: unknown): NextResponse {
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
  console.error('[api/quote] internal error:', e);
  return NextResponse.json(
    {
      ok: false,
      error: { code: 'INTERNAL', message: 'Internal server error' },
    },
    { status: 500 }
  );
}
