/**
 * Home — M2 minimal layout.
 *
 * Server component. Resolves current profile, pulls home summary
 * (positions + parallel live quotes), and either renders the empty
 * onboarding shape or the NetWorthHero + PositionsTable + a sticky
 * lookup affordance.
 *
 * Future M3 sections (MarketStatusStrip, WatchlistStrip, Upcoming
 * Events) plug in below the positions table when the corresponding
 * BACKLOG items land.
 */

import { redirect } from 'next/navigation';
import { EmptyHome } from '@/components/home/EmptyHome';
import { LookupForm } from '@/components/home/LookupForm';
import { NetWorthHero } from '@/components/home/NetWorthHero';
import { PositionsTable } from '@/components/home/PositionsTable';
import { getHomeSummary } from '@/lib/home/summary';
import { ensureDefaultProfile } from '@/lib/profiles/bootstrap';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

async function signOut(): Promise<void> {
  'use server';
  const { cookies } = await import('next/headers');
  const { SESSION_COOKIE_NAME } = await import('@/lib/auth/session');
  const jar = await cookies();
  jar.delete(SESSION_COOKIE_NAME);
  redirect('/login');
}

export default async function HomePage(): Promise<React.ReactElement> {
  const { profile } = await ensureDefaultProfile();
  const summary = await getHomeSummary(profile.id);
  const hasPositions = summary.bySymbol.length > 0;

  return (
    <main className="bg-bg text-text min-h-screen">
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-8 sm:px-6">
        <header className="flex items-baseline justify-between">
          <h1 className="t-display-2">mini-mint</h1>
          <form action={signOut} className="t-meta text-text-3">
            <button type="submit" className="underline">
              Sign out
            </button>
          </form>
        </header>

        {hasPositions ? (
          <>
            <NetWorthHero summary={summary} />
            <PositionsTable summary={summary} />
            <section className="space-y-2">
              <h3 className="t-meta text-text-3">LOOK UP A STOCK</h3>
              <LookupForm />
            </section>
          </>
        ) : (
          <EmptyHome />
        )}
      </div>
    </main>
  );
}
