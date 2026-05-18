/**
 * /s/[symbol] — Symbol detail. M1 single-screen surface.
 *
 * Server component:
 *   - Validates symbol against SYMBOL_RE
 *   - Calls adapter directly (skip HTTP for initial paint)
 *   - Renders the hero (price + delta + extended-hours line if any)
 *   - Hands {symbol, initial1Y} to <SymbolView/> client component
 *
 * Client (SymbolView):
 *   - Owns range chip state + chart rendering (lightweight-charts)
 *   - Re-fetches /api/history when range changes
 *
 * Edge cases:
 *   - Invalid symbol shape → notFound()
 *   - Symbol not found upstream → notFound()
 *   - Upstream error → throws to error boundary (default Next 500)
 */

import { notFound } from 'next/navigation';
import { getQuote, getHistory } from '@/lib/market';
import { upsertQuote, upsertPriceBars } from '@/lib/market/cache';
import { MarketDataError, type Quote } from '@/lib/market/types';
import { listAccountsForProfile } from '@/lib/accounts/listForProfile';
import { ensureDefaultProfile } from '@/lib/profiles/bootstrap';
import { TradeButton } from '@/components/trade/TradeButton';
import { SymbolView } from './SymbolView';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const SYMBOL_RE = /^[A-Z0-9.\^\-]{1,16}$/;

interface PageProps {
  params: Promise<{ symbol: string }>;
}

export default async function SymbolDetailPage({ params }: PageProps): Promise<React.ReactElement> {
  const { symbol: raw } = await params;
  const symbol = decodeURIComponent(raw).toUpperCase();
  if (!SYMBOL_RE.test(symbol)) notFound();

  let quote: Quote;
  try {
    quote = await getQuote(symbol);
  } catch (e) {
    if (e instanceof MarketDataError && e.code === 'NOT_FOUND') notFound();
    throw e;
  }

  // Fire-and-forget cache write
  upsertQuote(quote).catch((e) => console.error('[s/page] cache write failed:', e));

  // Initial 1Y history — load in parallel; degrade gracefully if it fails
  let initialBars: { date: string; close: number }[] = [];
  try {
    const h = await getHistory(symbol, '1Y');
    initialBars = h.bars.map((b) => ({
      date: b.date.toISOString(),
      close: b.close,
    }));
    upsertPriceBars(h.canonicalSymbol, h.bars).catch((e) =>
      console.error('[s/page] history write failed:', e),
    );
  } catch (e) {
    console.warn('[s/page] history fetch failed; chart will show empty:', e);
  }

  // Resolve current profile (auto-bootstrap on first visit) + load
  // accounts so the TradeSheet's account picker renders without an
  // extra client-side fetch.
  const { profile } = await ensureDefaultProfile();
  const accounts = await listAccountsForProfile(profile.id);

  return (
    <main className="bg-bg text-text min-h-screen">
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        <Hero quote={quote} />
        <SymbolView symbol={symbol} initialBars={initialBars} />
        <TradeButton symbol={symbol} accounts={accounts} lastPrice={quote.price} />
      </div>
    </main>
  );
}

// ─── Hero (server component) ─────────────────────────────────────────────

function Hero({ quote }: { quote: Quote }): React.ReactElement {
  const change = quote.prevClose !== null ? quote.price - quote.prevClose : null;
  const changePct =
    change !== null && quote.prevClose !== null && quote.prevClose !== 0
      ? (change / quote.prevClose) * 100
      : null;
  const up = (change ?? 0) >= 0;

  return (
    <header className="space-y-3">
      <div className="space-y-1">
        <h1 className="t-display-2 tracking-title">{quote.canonicalSymbol}</h1>
        <p className="t-aux text-text-2">{quote.name}</p>
        {quote.renamed && (
          <p className="t-meta text-text-3">
            Renamed from {quote.symbol} → {quote.canonicalSymbol}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <div className="t-display-3 tabular tracking-tight">
          {formatPrice(quote.price, quote.currency)}
        </div>
        {change !== null && (
          <div className={`t-row tabular ${up ? 'text-up' : 'text-down'}`}>
            {up ? '+' : ''}
            {formatPrice(change, quote.currency, true)}
            {changePct !== null && (
              <>
                {' '}
                ({up ? '+' : ''}
                {changePct.toFixed(2)}%)
              </>
            )}
          </div>
        )}
        <div className="t-meta text-text-3">
          {marketStateLabel(quote.marketState)} · As of {formatTime(quote.marketTime)} ET
        </div>
      </div>

      {(quote.preMarketPrice !== null || quote.postMarketPrice !== null) && (
        <ExtendedHoursLine quote={quote} />
      )}
    </header>
  );
}

function ExtendedHoursLine({ quote }: { quote: Quote }): React.ReactElement {
  const isPre =
    quote.preMarketPrice !== null &&
    (quote.marketState === 'PRE' ||
      quote.marketState === 'PREPRE' ||
      quote.marketState === 'CLOSED');
  const price = isPre ? quote.preMarketPrice : quote.postMarketPrice;
  const change = isPre ? quote.preMarketChange : quote.postMarketChange;
  const at = isPre ? quote.preMarketAt : quote.postMarketAt;
  if (price === null) return <></>;
  const up = (change ?? 0) >= 0;
  const label = isPre ? 'Pre-market' : 'After hours';
  return (
    <div className="bg-surface-1 t-aux text-text-2 hairline-top rounded-md px-3 py-2">
      <span className="text-text-3 t-meta">{label}</span>{' '}
      <span className="tabular text-text">{formatPrice(price, quote.currency)}</span>{' '}
      {change !== null && (
        <span className={`tabular ${up ? 'text-up' : 'text-down'}`}>
          {up ? '+' : ''}
          {change.toFixed(2)}
        </span>
      )}
      {at && <span className="text-text-3 t-meta"> · {formatTime(at)} ET</span>}
    </div>
  );
}

// ─── formatters ─────────────────────────────────────────────────────────

function formatPrice(n: number, currency = 'USD', signed = false): string {
  const fmt = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const v = fmt.format(Math.abs(n));
  return signed && n >= 0 ? v : n < 0 ? '-' + v : v;
}

function formatTime(d: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/New_York',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(d);
}

function marketStateLabel(s: Quote['marketState']): string {
  switch (s) {
    case 'PRE':
    case 'PREPRE':
      return 'Pre-market';
    case 'REGULAR':
      return 'Market open';
    case 'POST':
    case 'POSTPOST':
      return 'After hours';
    case 'CLOSED':
      return 'Market closed';
  }
}
