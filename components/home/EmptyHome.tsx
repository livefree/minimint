/**
 * EmptyHome — first-run state when the operator has zero positions.
 *
 * Server component. Friendly copy + two CTAs:
 *   1. Add an account (→ /settings/accounts/new)
 *   2. Look up a stock — preserves M1's "search by ticker" affordance
 *      so the operator can still browse symbols before recording trades.
 *
 * When the first BUY lands, getPositions returns rows and the home
 * page swaps to <NetWorthHero/> + <PositionsTable/>.
 */

import Link from 'next/link';
import { LookupForm } from './LookupForm';

export function EmptyHome(): React.ReactElement {
  return (
    <section className="hairline-top bg-surface-1 space-y-5 rounded-lg px-4 py-6">
      <header className="space-y-1">
        <h2 className="t-h">Welcome to mini-mint</h2>
        <p className="t-aux text-text-2">
          Record a trade to see your holdings here. You can also look up any US-listed symbol below.
        </p>
      </header>

      <div className="space-y-2">
        <Link
          href="/settings/accounts/new"
          className="t-row bg-surface-2 text-text hover:bg-surface-3 flex items-center justify-between rounded-md px-4 py-3 transition"
        >
          <span>Add an account</span>
          <span aria-hidden className="t-aux text-text-3">
            →
          </span>
        </Link>
      </div>

      <div className="space-y-2 pt-2">
        <h3 className="t-meta text-text-3">LOOK UP A STOCK</h3>
        <LookupForm />
      </div>
    </section>
  );
}
