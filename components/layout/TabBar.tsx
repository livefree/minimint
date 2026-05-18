'use client';

/**
 * TabBar — bottom navigation for the (app) layout.
 *
 * M2 carving: 2 tabs only (Home + Settings). The full 4-tab IA from
 * R-N0 (Home / Portfolio / Market / Me) lands in M3+. Symbol detail
 * pages keep the TabBar visible so the operator can jump out.
 *
 * Active tab tint = mint (single-profile M2). M3 will swap to
 * `var(--p-N)` of the cookie-resolved current profile per R-P2.
 *
 * Client component because we need `usePathname` to compute active.
 * The bar itself is fixed bottom (mobile-first) and centered with a
 * max-width on larger viewports to keep tap targets reasonable on mac.
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GearIcon, HouseIcon } from './icons';

interface Tab {
  href: string;
  label: string;
  icon: typeof HouseIcon;
  /** Active when pathname starts with this prefix. */
  matchPrefix: string;
}

const TABS: Tab[] = [
  { href: '/', label: 'Home', icon: HouseIcon, matchPrefix: '/' },
  { href: '/settings', label: 'Settings', icon: GearIcon, matchPrefix: '/settings' },
];

export function TabBar(): React.ReactElement {
  const pathname = usePathname();

  return (
    <nav aria-label="Primary" className="bg-bg-elev hairline-top fixed inset-x-0 bottom-0 z-20">
      <ul className="mx-auto flex max-w-md items-stretch justify-around">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = isActive(pathname, t);
          return (
            <li key={t.href} className="flex-1">
              <Link
                href={t.href}
                aria-current={active ? 'page' : undefined}
                className={`flex flex-col items-center gap-1 px-3 pt-2 pb-3 transition ${
                  active ? 'text-mint' : 'text-text-3 hover:text-text-2'
                }`}
              >
                <Icon size={22} aria-hidden />
                <span className="t-meta">{t.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function isActive(pathname: string, tab: Tab): boolean {
  // "/" is active only on the exact home; other prefixes use startsWith
  // so /settings/accounts/new also lights up the Settings tab.
  if (tab.matchPrefix === '/') return pathname === '/';
  return pathname === tab.matchPrefix || pathname.startsWith(`${tab.matchPrefix}/`);
}
