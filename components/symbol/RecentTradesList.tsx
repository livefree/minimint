/**
 * RecentTradesList — Recent transactions for a symbol on SymbolDetail.
 *
 * Server component. Reads from `lib/transactions/listForSymbol.ts`
 * (joined with account name). Renders a row per transaction with a
 * client `<DeleteTradeButton/>` so the operator can undo mistakes.
 *
 * Returns null when the operator has zero transactions for this
 * symbol (caller renders nothing — no empty card).
 */

import type Decimal from 'decimal.js';
import { DeleteTradeButton } from './DeleteTradeButton';
import type { TradeRow } from '@/lib/transactions/listForSymbol';

interface Props {
  trades: TradeRow[];
}

export function RecentTradesList({ trades }: Props): React.ReactElement | null {
  if (trades.length === 0) return null;

  return (
    <section
      aria-label="Recent trades"
      className="hairline-top bg-surface-1 space-y-3 rounded-lg px-4 py-4"
    >
      <h2 className="t-eyebrow text-text-3">RECENT TRADES</h2>
      <ul className="divide-surface-2 divide-y">
        {trades.map((t) => (
          <li key={t.id}>
            <TradeRowItem trade={t} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function TradeRowItem({ trade }: { trade: TradeRow }): React.ReactElement {
  const qty = formatShares(trade.quantity);
  const price = formatPrice(trade.price);
  const summary = `${trade.kind} ${qty} @ ${price}`;

  return (
    <div className="flex items-center justify-between py-3">
      <div className="min-w-0">
        <div className="t-row-strong flex items-center gap-2">
          <KindBadge kind={trade.kind} />
          <span className="tabular">{qty}</span>
          <span className="t-aux text-text-3">@</span>
          <span className="tabular">{price}</span>
        </div>
        <div className="t-aux text-text-3">
          {trade.accountName} · {formatDate(trade.executedAt)}
          {!trade.fees.isZero() && <> · fees {formatPrice(trade.fees)}</>}
        </div>
      </div>
      <DeleteTradeButton id={trade.id} summary={summary} />
    </div>
  );
}

function KindBadge({ kind }: { kind: TradeRow['kind'] }): React.ReactElement {
  const isBuy = kind === 'BUY';
  const isSell = kind === 'SELL';
  const color = isBuy
    ? 'bg-up/15 text-up'
    : isSell
      ? 'bg-down/15 text-down'
      : 'bg-surface-3 text-text-2';
  const label = isBuy ? 'BUY' : isSell ? 'SELL' : kind;
  return <span className={`t-meta rounded-full px-2 py-0.5 ${color}`}>{label}</span>;
}

// ─── formatters ────────────────────────────────────────────────────────

function formatShares(d: Decimal): string {
  const fixed = d.toFixed(8);
  const trimmed = fixed.replace(/\.?0+$/, '');
  return trimmed || '0';
}

function formatPrice(d: Decimal): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(d.toNumber());
}

function formatDate(d: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(d);
}
