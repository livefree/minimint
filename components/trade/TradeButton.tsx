'use client';

/**
 * TradeButton — sticky bottom Trade CTA + TradeSheet host.
 *
 * Lives inside `/s/[symbol]` so the operator can record a buy/sell
 * without leaving the symbol view. Server page pre-fetches the
 * profile's accounts list and passes it down so the sheet's account
 * picker has no client-side fetch latency.
 *
 * Per INTERACTION_SPEC §3.7: "sticky bottom Trade CTA → opens
 * TradeSheet pre-filled."
 */

import { useState } from 'react';
import { TradeSheet } from './TradeSheet';
import type { AccountSummary } from '@/lib/accounts/listForProfile';

interface Props {
  symbol: string;
  accounts: AccountSummary[];
  lastPrice?: number;
}

export function TradeButton({ symbol, accounts, lastPrice }: Props): React.ReactElement {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Sticky bottom rail. Offset above the (app) layout TabBar
          (~64-72px tall + safe area) so the CTA never sits under it. */}
      <div className="sticky bottom-24 z-30 flex justify-center pt-6">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="t-row bg-mint text-bg shadow-mint/20 pointer-events-auto rounded-full px-6 py-3 font-semibold shadow-lg transition hover:opacity-90"
        >
          Trade {symbol}
        </button>
      </div>
      <TradeSheet
        symbol={symbol}
        accounts={accounts}
        {...(lastPrice !== undefined ? { lastPrice } : {})}
        open={open}
        onOpenChange={setOpen}
      />
    </>
  );
}
