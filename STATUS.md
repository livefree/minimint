# STATUS

> Living document. Update at the START and END of every meaningful unit of work.

## current sprint

**Sprint 2 · M2 "Record my first trade"** — in progress (see [`MVP_PLAN.md` §3](MVP_PLAN.md))

Vertical slice deliverables:

- [x] Auto-create default "Me" profile on first login if none exists (`b1db5ba`)
- [x] Settings sub-page for account create (no full Profile editor yet) (`b4b0d9f`)
- [x] `lib/portfolio/positions.ts` — TS wrappers around `get_positions` / `get_my_position` / `get_net_worth` (`3b32ae7`)
- [x] `app/api/transactions/route.ts` (POST/GET) + `lib/api/mutations/transactions.ts` (`cd75946`)
- [x] TradeSheet component (BUY/SELL only) (`ab74aba`)
- [x] MyPosition aggregated card on SymbolDetail (U-1) (`8ca1c9a`)
- [x] Minimal Home tab at `/` (net worth hero + positions table) (`a15b828`)
- [ ] 2-tab TabBar (Home + Settings)
- [ ] Toast + Undo for trade delete (sonner)
- [ ] Playwright e2e: buy → see position with correct math

**Exit criteria**: operator records a real buy → MyPosition shows correct avg cost + today P/L matching `qty × (price − prev_close)`.

## past sprints

**Sprint 1 · M1 "See a stock"** — DONE (closed 2026-05-17 · tag `v0.M1`)

Operator confirmed prod working: login → home (search box + Open button + 6 featured tickers) → symbol detail (price, day change, post-market price+change, range-switchable chart). Real Yahoo data, real Neon prod, tested on real device.

- [x] `lib/market/yahoo.ts` adapter + 21 Vitest unit tests
- [x] `/api/quote/[symbol]` + `/api/history/[symbol]` with cache write-through
- [x] Single-password auth (bcrypt + jose + middleware gate)
- [x] `/login` UI (server page + client form, error states)
- [x] `scripts/seed.ts` real impl — bootstraps `app_settings` from env
- [x] `/s/[symbol]` Hero + lightweight-charts area + 6 range chips
- [x] Neon prod (`flat-bonus-47972630`) provisioned + 0000+0001 migrations applied + app_settings seeded
- [x] Vercel project linked + 4 prod env vars set + initial deploy
- [x] Playwright e2e × 6 specs × 2 projects (chromium + iPhone-13 mobile-safari) = 12/12 green
- [x] Real-device verified on operator's phone + desktop

## post-M1 follow-ups (queued for separate work)

- Design canvas round-2: complete the remaining ~20% (R-N1 UpcomingEvents+HouseholdSwitchHint, R-P PIN-Setup+SwitchTransition+DeleteConfirm, R-S1 stale state, U-7 onboarding, 4 missing design-spec.html sections)
- Component-locality fixes in design canvas per `references/designs/REVISIONS.md` audit

## what's NOT in scope for M2

- Watchlists, multi-profile UI (M3)
- Market tab, CSV import, dividends UI, onboarding wizard (M4)
- Alert push triggers, FIFO tax, offline write queue, per-profile PIN (v1.5)

## decision log pointer

For the full decision history, see [`logs/ledger/decisions.ndjson`](logs/ledger/decisions.ndjson).
Major architectural choices are in [`docs/adr/`](docs/adr/).

## status conventions

- `[ ]` = todo · `[~]` = in progress · `[x]` = done · `[!]` = blocked · `[?]` = needs clarification
- Sprints map 1:1 to MVP milestones from `MVP_PLAN.md`
- "what's NOT in scope" prevents scope creep — when in doubt, defer
