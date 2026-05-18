/**
 * Authenticated app shell — owns TabBar.
 * Spec: INTERACTION_SPEC.md §1.1 frame structure.
 *
 * M2: 2-tab bottom bar (Home + Settings). M3 promotes to the 4-tab
 * IA (Home / Portfolio / Market / Me) per R-N0, with sidebar reflow
 * on mac per §1.1.
 *
 * `pb-24` (≈ 96px) on the content wrapper keeps the last row of any
 * page above the TabBar's safe area. Sticky bottom CTAs on individual
 * pages (e.g. TradeButton on SymbolDetail) handle their own offset.
 */

import { TabBar } from '@/components/layout/TabBar';
import { ToasterMount } from '@/components/layout/ToasterMount';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-bg text-text min-h-screen">
      <div className="pb-24">{children}</div>
      <TabBar />
      {/* sonner Toaster — single mount for the whole (app) tree, via
          a 'use client' wrapper (see ToasterMount). /login has no
          Toaster in M2; promote to root app/layout if that changes. */}
      <ToasterMount />
    </div>
  );
}
