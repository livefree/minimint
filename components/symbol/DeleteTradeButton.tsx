'use client';

/**
 * DeleteTradeButton — per-row delete affordance with toast+undo (M2-9).
 *
 * Click flow:
 *   1. deleteTransaction(id) (soft-delete via DELETE /api/transactions/[id])
 *   2. router.refresh() so MyPosition + Home + RecentTradesList recompute
 *   3. sonner toast pops with a 5-second "Undo" action
 *   4. Undo (if clicked) → restoreTransaction(id) → another router.refresh()
 *
 * Errors surface as a destructive sonner toast (no router.refresh on error).
 *
 * INTERACTION_SPEC §6 transactions.delete row: spec calls for inline-confirm
 * 3s + Toast w/ Undo. M2 carving skips the inline 3s and relies on the toast
 * undo as the sole safety net — the swipe-reveal pattern lands in M3 with
 * the Portfolio Activity sub-tab.
 */

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import {
  deleteTransaction,
  restoreTransaction,
  TransactionApiError,
} from '@/lib/api/mutations/transactions';

interface Props {
  id: string;
  /** Symbol + qty are shown in the toast copy so the operator knows
   *  which trade they're undoing if multiple are deleted quickly. */
  summary: string;
}

export function DeleteTradeButton({ id, summary }: Props): React.ReactElement {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function onClick() {
    if (busy) return;
    setBusy(true);
    try {
      await deleteTransaction(id);
      router.refresh();
      toast(`Deleted ${summary}`, {
        duration: 5000,
        action: {
          label: 'Undo',
          onClick: async () => {
            try {
              await restoreTransaction(id);
              router.refresh();
              toast.success(`Restored ${summary}`);
            } catch (e) {
              toast.error(
                e instanceof TransactionApiError
                  ? `Undo failed: ${e.message}`
                  : 'Undo failed. Try again.',
              );
            }
          },
        },
      });
    } catch (e) {
      toast.error(
        e instanceof TransactionApiError
          ? `Couldn’t delete: ${e.message}`
          : 'Couldn’t delete. Try again.',
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      aria-label={`Delete ${summary}`}
      className="t-meta text-text-3 hover:text-down rounded px-2 py-1 transition disabled:opacity-50"
    >
      {busy ? '…' : 'Delete'}
    </button>
  );
}
