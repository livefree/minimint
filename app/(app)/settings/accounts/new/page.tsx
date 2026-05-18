/**
 * /settings/accounts/new — server page wrapping AccountCreateForm.
 *
 * Auth is handled by middleware (any /settings/* path requires session).
 * No data fetch needed before the form renders; submission POSTs to
 * /api/accounts which resolves the current profile server-side.
 */

import Link from 'next/link';
import { AccountCreateForm } from '@/components/settings/AccountCreateForm';

export const dynamic = 'force-dynamic';

export default function NewAccountPage(): React.ReactElement {
  return (
    <main className="bg-bg text-text mx-auto min-h-screen max-w-md px-4 py-8">
      <nav className="t-aux mb-4">
        <Link
          href="/settings"
          className="text-text-3 hover:text-text-2 transition"
          aria-label="Back to settings"
        >
          ← Settings
        </Link>
      </nav>

      <header className="mb-6">
        <h1 className="t-display text-text">New account</h1>
        <p className="t-aux text-text-2 mt-1">
          Track holdings under a brokerage, retirement, or other account. You can add more later.
        </p>
      </header>

      <AccountCreateForm />
    </main>
  );
}
