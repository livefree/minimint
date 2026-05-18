/**
 * NetWorthHero — Home top block (INTERACTION_SPEC §3.3 portfolio.summary).
 *
 * Server component. Pre-aggregated HomeSummary in, Decimal stays live
 * through to the Intl boundary.
 *
 * M2 carving: total market value + today P/L + unrealized P/L. Cash
 * row deferred until DIV / CASH_* trade entry ships. R-T2 hero
 * gradient honored on the up/down sign of today P/L.
 */

import type { HomeSummary } from '@/lib/home/summary';
import type Decimal from 'decimal.js';

interface Props {
  summary: HomeSummary;
}

export function NetWorthHero({ summary }: Props): React.ReactElement {
  const { totalMarketValue, totalUnrealizedPl, todayPl, todayPct } = summary;
  const todayUp = !todayPl.isNegative();
  const todayColor = todayPl.isZero() ? 'text-text-2' : todayUp ? 'text-up' : 'text-down';
  const unrealizedUp = !totalUnrealizedPl.isNegative();
  const unrealizedColor = totalUnrealizedPl.isZero()
    ? 'text-text-2'
    : unrealizedUp
      ? 'text-up'
      : 'text-down';

  return (
    <section
      aria-label="Net worth"
      className="hairline-top bg-surface-1 space-y-3 rounded-lg px-4 py-5"
    >
      <h2 className="t-eyebrow text-text-3">NET WORTH</h2>
      <div className="tabular t-display-3">{formatPrice(totalMarketValue)}</div>

      <div className="grid grid-cols-2 gap-3 pt-1">
        <PLBlock label="Today" color={todayColor} amount={todayPl} pct={todayPct} />
        <PLBlock label="Unrealized" color={unrealizedColor} amount={totalUnrealizedPl} pct={null} />
      </div>
    </section>
  );
}

function PLBlock({
  label,
  color,
  amount,
  pct,
}: {
  label: string;
  color: string;
  amount: Decimal;
  pct: Decimal | null;
}): React.ReactElement {
  return (
    <div className="space-y-0.5">
      <div className="t-meta text-text-3">{label}</div>
      <div className={`tabular t-h-sub ${color}`}>{formatSignedPrice(amount)}</div>
      {pct && <div className={`tabular t-aux ${color}`}>{formatSignedPct(pct)}</div>}
    </div>
  );
}

// ─── formatters (copied from MyPositionCard intent — keep close to use site) ──

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
