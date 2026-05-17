/**
 * Authenticated app shell — owns TabBar / Sidebar / NavHeader.
 * Spec: INTERACTION_SPEC.md §1.1 frame structure.
 *
 * Current state: stub.
 */

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-bg text-text">{children}</div>;
}
