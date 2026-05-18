/**
 * MyPositionCard — aggregated holdings card on SymbolDetail (U-1).
 *
 * Server component. Consumes the pre-aggregated `MyPositionAggregate`
 * from `lib/portfolio/aggregate.ts` so the math (Decimal) never
 * round-trips through props as strings — types stay Decimal until the
 * very last render formatter.
 *
 * M2 carving: single-profile only. The R-P5 `__all__` cross-profile
 * mode (per-profile breakdown rows) lands in M3 with the
 * MacSymbolDetailAllProfiles design.
 *
 * Today P/L formula matches MVP §3 exit criteria:
 *   totalQty × (currentPrice − prevClose)
 * Hidden when prevClose is unavailable (early-morning quotes).
 */

import type Decimal from 'decimal.js';
import type { MyPositionAggregate } from '@/lib/portfolio/aggregate';

interface Props {
  aggregate: MyPositionAggregate;
}

export function MyPositionCard({ aggregate }: Props): React.ReactElement {
  const {
    totalQty,
    avgCost,
    totalCost,
    marketValue,
    unrealizedPl,
    unrealizedPct,
    todayPl,
    todayPct,
    isAnyLt,
    minDaysToLt,
    perAccount,
  } = aggregate;

  return (
    <section
      aria-label="Your position"
      className="hairline-top bg-surface-1 space-y-4 rounded-lg px-4 py-4"
    >
      <header className="flex items-baseline justify-between">
        <h2 className="t-eyebrow text-text-3">YOUR POSITION</h2>
        <HoldingPeriodChip isAnyLt={isAnyLt} minDaysToLt={minDaysToLt} />
      </header>

      {/* Hero row — shares · avg cost · market value */}
      <div className="grid grid-cols-3 gap-3">
        <Stat label="Shares" value={formatShares(totalQty)} />
        <Stat label="Avg cost" value={formatPrice(avgCost)} />
        <Stat label="Market value" value={formatPrice(marketValue)} />
      </div>

      {/* Today + unrealized P/L */}
      <div className="grid grid-cols-2 gap-3">
        <PLStat label="Today" amount={todayPl} pct={todayPct} />
        <PLStat label="Unrealized" amount={unrealizedPl} pct={unrealizedPct} />
      </div>

      {/* Per-account breakdown */}
      {perAccount.length > 0 && (
        <div className="space-y-2 pt-2">
          <h3 className="t-meta text-text-3">BY ACCOUNT</h3>
          <ul className="hairline-top divide-surface-2 bg-surface-2/40 divide-y rounded-md">
            {perAccount.map((r) => (
              <li key={r.accountId} className="flex items-baseline justify-between px-3 py-2.5">
                <div className="t-row">
                  {r.accountName}
                  {r.isLt && <LTBadge />}
                </div>
                <div className="tabular t-aux text-text-2">
                  {formatShares(r.quantity)} sh · {formatPrice(r.avgCost)}
                </div>
              </li>
            ))}
          </ul>
          <p className="t-meta text-text-3">Total cost {formatPrice(totalCost)}</p>
        </div>
      )}
    </section>
  );
}

// ─── pieces ────────────────────────────────────────────────────────────

function Stat({ label, value }: { label: string; value: string }): React.ReactElement {
  return (
    <div className="space-y-0.5">
      <div className="t-meta text-text-3">{label}</div>
      <div className="tabular t-h-sub">{value}</div>
    </div>
  );
}

function PLStat({
  label,
  amount,
  pct,
}: {
  label: string;
  amount: Decimal | null;
  pct: Decimal | null;
}): React.ReactElement {
  if (!amount) {
    return (
      <div className="hairline-top bg-surface-2 rounded-md px-3 py-2.5">
        <div className="t-meta text-text-3">{label}</div>
        <div className="tabular t-h-sub text-text-3">—</div>
      </div>
    );
  }
  const up = !amount.isNegative();
  const colorClass = amount.isZero() ? 'text-text-2' : up ? 'text-up' : 'text-down';
  return (
    <div className="hairline-top bg-surface-2 rounded-md px-3 py-2.5">
      <div className="t-meta text-text-3">{label}</div>
      <div className={`tabular t-h-sub ${colorClass}`}>{formatSignedPrice(amount)}</div>
      {pct && <div className={`tabular t-aux ${colorClass}`}>{formatSignedPct(pct)}</div>}
    </div>
  );
}

function HoldingPeriodChip({
  isAnyLt,
  minDaysToLt,
}: {
  isAnyLt: boolean;
  minDaysToLt: number;
}): React.ReactElement | null {
  if (isAnyLt) {
    return <span className="t-meta bg-mint/15 text-mint rounded-full px-2 py-0.5">Long-term</span>;
  }
  if (minDaysToLt > 0) {
    return (
      <span className="t-meta bg-surface-2 text-text-3 rounded-full px-2 py-0.5">
        {minDaysToLt}d to LT
      </span>
    );
  }
  return null;
}

function LTBadge(): React.ReactElement {
  return <span className="t-meta bg-mint/15 text-mint ml-2 rounded-full px-1.5 py-0.5">LT</span>;
}

// ─── formatters ────────────────────────────────────────────────────────

/** USD currency formatting. Decimal → string only at the render boundary. */
function formatPrice(d: Decimal): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(d.toNumber());
}

/** Signed currency with explicit "+" prefix when positive (P/L convention). */
function formatSignedPrice(d: Decimal): string {
  if (d.isZero()) return formatPrice(d);
  const abs = formatPrice(d.abs());
  return d.isNegative() ? `−${abs}` : `+${abs}`;
}

/** Signed percent, 2-decimal. Input is a fraction (0.0125 → "+1.25%"). */
function formatSignedPct(d: Decimal): string {
  const pct = d.times(100);
  if (pct.isZero()) return '0.00%';
  const v = pct.abs().toFixed(2);
  return pct.isNegative() ? `−${v}%` : `+${v}%`;
}

/** Quantity formatting — trims trailing zeros, max 8 digits (schema scale). */
function formatShares(d: Decimal): string {
  // Decimal.toFixed leaves trailing zeros; drop them while keeping at
  // least 0 decimals for whole-share displays.
  const fixed = d.toFixed(8);
  const trimmed = fixed.replace(/\.?0+$/, '');
  return trimmed || '0';
}
