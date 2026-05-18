/**
 * /settings — minimum-viable Settings landing for M2.
 *
 * M2 carves a 2-row tree:
 *   - Accounts (new account form lives at /settings/accounts/new)
 *
 * The full MeSettingsPage shape (INTERACTION_SPEC §3.6) — profiles tree,
 * data import/export, app preferences — lands across M3 and M4. This
 * page is the operator's only path to create an account before the
 * TabBar + Settings tab arrive.
 */

import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default function SettingsPage(): React.ReactElement {
  return (
    <main className="bg-bg text-text mx-auto min-h-screen max-w-md px-4 py-8">
      <header className="mb-6">
        <h1 className="t-display text-text">Settings</h1>
        <p className="t-aux text-text-2 mt-1">
          The full settings tree lands in M3+. For now, account creation lives here.
        </p>
      </header>

      <ul className="space-y-2">
        <li>
          <Link
            href="/settings/accounts/new"
            className="t-row bg-surface-1 text-text hover:bg-surface-2 flex items-center justify-between rounded-md px-4 py-3 transition"
          >
            <span>Add an account</span>
            <span className="t-aux text-text-3" aria-hidden>
              →
            </span>
          </Link>
        </li>
      </ul>

      <p className="t-aux text-text-3 mt-8">
        Tip: type <code className="bg-surface-2 rounded px-1.5 py-0.5">/settings</code> in your URL
        bar to get back here until the bottom Tab Bar lands.
      </p>
    </main>
  );
}
