/**
 * PositionsTable — Home holdings list (INTERACTION_SPEC §3.4 Positions
 * sub-tab row template, simplified for M2 Home).
 *
 * Server component. Each row is a Link to /s/[symbol] so the operator
 * can drill in. Rows whose quote fetch failed render with "—" cells
 * and remain clickable (the symbol page can re-fetch).
 *
 * Failed-quote banner is rendered above the table when any symbol
 * failed; M3 will surface a retry CTA.
 */

import Link from 'next/link';
import type Decimal from 'decimal.js';
import type { HomeSummary, SymbolSummary } from '@/lib/home/summary';

interface Props {
  summary: HomeSummary;
}

export function PositionsTable({ summary }: Props): React.ReactElement {
  const { bySymbol, failedSymbols } = summary;
  return (
    <section
      aria-label="Positions"
      className="hairline-top bg-surface-1 space-y-3 rounded-lg px-4 py-4"
    >
      <h2 className="t-eyebrow text-text-3">POSITIONS</h2>

      {failedSymbols.length > 0 && (
        <p role="status" className="t-aux bg-down/15 text-down rounded-md px-3 py-2">
          Couldn’t refresh: {failedSymbols.join(', ')}. Showing last known cost only.
        </p>
      )}

      <ul className="divide-surface-2 divide-y">
        {bySymbol.map((row) => (
          <li key={row.symbol}>
            <PositionRow row={row} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function PositionRow({ row }: { row: SymbolSummary }): React.ReactElement {
  const todayUp = row.todayPl ? !row.todayPl.isNegative() : false;
  const todayColor = !row.todayPl
    ? 'text-text-3'
    : row.todayPl.isZero()
      ? 'text-text-2'
      : todayUp
        ? 'text-up'
        : 'text-down';

  return (
    <Link
      href={`/s/${row.symbol}`}
      prefetch={false}
      className="hover:bg-surface-2 -mx-2 flex items-baseline justify-between rounded px-2 py-3 transition"
    >
      <div className="min-w-0">
        <div className="t-row-strong">{row.symbol}</div>
        <div className="t-aux text-text-3 truncate">{row.name ?? '—'}</div>
      </div>

      <div className="flex flex-col items-end">
        <div className="tabular t-row">{row.marketValue ? formatPrice(row.marketValue) : '—'}</div>
        <div className={`tabular t-aux ${todayColor}`}>
          {row.todayPl ? formatSignedPrice(row.todayPl) : '—'}
          {row.todayPct && <> ({formatSignedPct(row.todayPct)})</>}
        </div>
      </div>
    </Link>
  );
}

// ─── formatters ────────────────────────────────────────────────────────

function formatPrice(d: Decimal): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(d.toNumber());
}

function formatSignedPrice(d: Decimal): string {
  if (d.isZero()) return formatPrice(d);
  const abs = formatPrice(d.abs());
  return d.isNegative() ? `−${abs}` : `+${abs}`;
}

function formatSignedPct(d: Decimal): string {
  const pct = d.times(100);
  if (pct.isZero()) return '0.00%';
  const v = pct.abs().toFixed(2);
  return pct.isNegative() ? `−${v}%` : `+${v}%`;
}
