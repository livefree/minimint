# ADR-0001: stack selection

- **Status**: accepted
- **Date**: 2026-05-13
- **Deciders**: human + Claude

## Context

Brand new project. Operator wants a cross-platform (macOS + iOS) personal stock tracker, "not too heavy", deployable for one household. Multi-profile use case emerged later, but doesn't change stack.

## Decision

- **Framework**: Next.js 15 App Router + TypeScript + PWA
- **DB**: Neon Postgres (serverless, HTTP driver) + Drizzle ORM
- **Hosting**: Vercel
- **Auth**: bcrypt + jose JWT in httpOnly cookie (single operator password v1)
- **Server state**: TanStack Query v5
- **Client state**: Zustand + nuqs (URL params) + RHF/Zod (forms)
- **Styling**: Tailwind v4 (`@theme inline` consuming CSS-var tokens from `styles.css`) + shadcn/ui
- **Charts**: TradingView lightweight-charts (price detail) + hand-rolled SVG (spark/donut/multi-line)
- **Overlays**: vaul (bottom sheets) + Radix via shadcn/ui (modal/popover/menu) + sonner (toast)
- **Motion**: framer-motion
- **Market data**: Finnhub (live quote) + yahoo-finance2 (history, dividends, splits, earnings)
- **Testing**: Vitest + Playwright

## Consequences

- (+) Single deployment target (Vercel + Neon free tier covers personal scale)
- (+) PWA means one codebase for desktop and mobile; no native iOS dev
- (+) Drizzle types flow through queries → mutations → forms (with shared Zod) → React = end-to-end type safety
- (+) Neon serverless HTTP driver works inside Vercel Edge Functions without connection pooling
- (−) PWA on iOS has limited push notification support (16.4+); accept for v1
- (−) yahoo-finance2 is unofficial; risk of breakage. Mitigated by caching history once + alternative providers (Twelve Data, Tiingo) on standby
- (−) Apple does not license SF Pro for web → non-Apple devices see Inter (visible drift at large display weights); accepted, weight ramp 800→750 mitigates

## Alternatives considered

- **Tauri / React Native desktop app** — rejected: too heavy for personal scale; PWA is sufficient
- **SvelteKit / Remix instead of Next.js** — rejected: less ecosystem traction for shadcn/ui + TanStack; Next is the path of least resistance
- **Supabase instead of Neon** — rejected: heavier (built-in auth, storage, realtime) than we need; Neon's just-Postgres is leaner
- **SQLite + Turso instead of Neon** — rejected: Postgres `numeric` type + advanced indexes + stored functions are needed for tax/positions math
- **Recharts / Visx for price chart** — rejected: lightweight-charts has built-in crosshair, pinch, fullscreen (R-I1 requirement); custom SVG would re-implement these

## References

- [`stock-app-1-2-moonlit-dawn.md`](../../stock-app-1-2-moonlit-dawn.md) — original plan
- [`INTERACTION_SPEC.md §16`](../../INTERACTION_SPEC.md) — library decisions table
