/**
 * Temporary M1 home. The real Home tab lands in M2 (per MVP_PLAN §3).
 * Until then this is a tiny "ticker lookup" form so the operator can
 * navigate to any /s/[symbol] from one URL, plus a small grid of demos.
 */

import Link from 'next/link';
import { redirect } from 'next/navigation';

const FEATURED = ['AAPL', 'MSFT', 'NVDA', 'SPY', 'VOO', 'GOOGL'] as const;

async function go(formData: FormData): Promise<void> {
  'use server';
  const raw = String(formData.get('symbol') ?? '').trim().toUpperCase();
  if (!raw) return;
  redirect(`/s/${encodeURIComponent(raw)}`);
}

async function signOut(): Promise<void> {
  'use server';
  const { cookies } = await import('next/headers');
  const { SESSION_COOKIE_NAME } = await import('@/lib/auth/session');
  const jar = await cookies();
  jar.delete(SESSION_COOKIE_NAME);
  redirect('/login');
}

export default function HomePage(): React.ReactElement {
  return (
    <main className="min-h-screen bg-bg text-text">
      <div className="mx-auto max-w-3xl space-y-8 px-4 py-10 sm:px-6">
        <header className="space-y-2">
          <h1 className="t-display-2">mini-mint</h1>
          <p className="t-aux text-text-2">
            M1 · look up any US-listed symbol. Real Home lands in M2.
          </p>
        </header>

        <form action={go} className="flex gap-2">
          <input
            name="symbol"
            placeholder="AAPL"
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            className="t-row w-full rounded-md bg-surface-2 px-3 py-2.5 text-text outline-none ring-1 ring-transparent transition focus:ring-mint"
          />
          <button
            type="submit"
            className="t-row rounded-md bg-mint px-4 font-semibold text-bg"
          >
            Open
          </button>
        </form>

        <section className="space-y-2">
          <h2 className="t-meta text-text-3">Try one</h2>
          <ul className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            {FEATURED.map((sym) => (
              <li key={sym}>
                <Link
                  href={`/s/${sym}`}
                  className="t-row block rounded-md bg-surface-1 px-3 py-2.5 text-center hairline-top transition hover:bg-surface-2"
                >
                  {sym}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <footer className="t-meta text-text-3">
          Signed in.{' '}
          <form action={signOut} className="inline">
            <button type="submit" className="underline">
              Sign out
            </button>
          </form>
        </footer>
      </div>
    </main>
  );
}
