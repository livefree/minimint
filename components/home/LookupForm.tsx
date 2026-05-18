/**
 * LookupForm — shared "open a symbol" affordance.
 *
 * Used both in EmptyHome and as a secondary affordance under
 * NetWorthHero. Server component using a Server Action — no client
 * JS needed for navigation.
 *
 * Carries forward the M1 home "search by ticker" pattern in a tighter
 * shape (single input + Open button). M3 ⌘K palette replaces this
 * with a richer search.
 */

import { redirect } from 'next/navigation';

async function go(formData: FormData): Promise<void> {
  'use server';
  const raw = String(formData.get('symbol') ?? '')
    .trim()
    .toUpperCase();
  if (!raw) return;
  redirect(`/s/${encodeURIComponent(raw)}`);
}

export function LookupForm(): React.ReactElement {
  return (
    <form action={go} className="flex gap-2">
      <label htmlFor="lookup-symbol" className="sr-only">
        Symbol
      </label>
      <input
        id="lookup-symbol"
        name="symbol"
        type="text"
        inputMode="search"
        autoComplete="off"
        maxLength={16}
        placeholder="AAPL"
        className="t-row tabular bg-surface-2 text-text focus:ring-mint w-full rounded-md px-3 py-2.5 ring-1 ring-transparent transition outline-none"
      />
      <button
        type="submit"
        className="t-row bg-mint text-bg rounded-md px-4 py-2.5 font-semibold transition hover:opacity-90"
      >
        Open
      </button>
    </form>
  );
}
