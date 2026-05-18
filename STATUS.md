# STATUS

> Living document. Update at the START and END of every meaningful unit of work.

## current sprint

**Sprint 3 · M3 "Watchlist + family"** — ready to start (see [`MVP_PLAN.md` §4](MVP_PLAN.md))

Deliverables:

- [ ] Multi-profile UI (R-P0..P3 minus PIN): ProfilesList in Settings · Add/Edit/Delete · ProfileSwitcher (mac sidebar chip + ios sheet) · profile color chrome
- [ ] Trade Sheet profile-attributed header (R-P3) — swap M2's hard-coded mint dot for `var(--p-N)` of cookie-resolved current profile
- [ ] Watchlist CRUD: create/rename/delete lists; add/remove items; reorder via dnd-kit
- [ ] Home WatchlistStrip (R-N1 #5)
- [ ] WatchlistFull page at `/watchlists/[id]`
- [ ] MarketStatusStrip on Home (R-N1 #2) — fully closes U-2
- [ ] ⌘K search palette (R-I5; holdings + market sections)

**Exit criteria** (MVP_PLAN §4):

1. Operator creates 3 profiles (Me/Mom/Dad) → switches between them → sees only that profile's accounts/holdings/watchlists; sidebar stripe color changes per switch
2. Operator adds 5 symbols to a watchlist → Home shows them with live prices
3. Pre-market hours: MarketStatusStrip shows "Markets open in Xh Ym · Pre-market +0.42%"
4. After-hours: "Markets closed · Pre-market data available"
5. ⌘K from any page → typing "AAPL" → enter → opens /s/AAPL within 200ms

**M3 unblocks several deferred M2 ❓** (see `BACKLOG.md ❓ open questions`):

- TanStack QueryClient + §7.5 invalidation cascade (5 sub-tasks)
- `__all__` write-guard on every mutation route (already inline in M2 routes — verify still triggered)
- `ensureDefaultProfile` per-render optimization → cookie-resolved `getCurrentProfileId()`
- Home today-% denominator caveat + quote-fetch concurrency cap
- TradeSheet success toast (sonner Toaster now mounted in (app)/layout via M2-9)
- TabBar height as `--tabbar-h` CSS var
- TradeSheet hard-coded mint dot → `var(--p-N)` (P3 attribution in multi-profile world)

## past sprints

**Sprint 2 · M2 "Record my first trade"** — DONE (closed 2026-05-18 · tag `v0.M2`)

Operator confirmed prod working: login → ensure account → trade BUY → MyPosition card shows correct avg cost + today P/L → delete + undo via sonner toast. 10 deliverables shipped + 1 incidental TradeSheet drawer-scroll fix surfaced by the e2e on iPhone viewport.

- [x] Auto-create default "Me" profile on first login if none exists (`b1db5ba`)
- [x] Settings sub-page for account create (`b4b0d9f`)
- [x] `lib/portfolio/positions.ts` TS wrappers around get_positions / get_my_position / get_net_worth (`3b32ae7`)
- [x] `app/api/transactions/route.ts` POST/GET + `lib/api/mutations/transactions.ts` (`cd75946`)
- [x] TradeSheet component (BUY/SELL only) + sticky CTA on SymbolDetail (`ab74aba`)
- [x] MyPosition aggregated card on SymbolDetail (U-1) (`8ca1c9a`)
- [x] Minimal Home tab — NetWorthHero + PositionsTable + EmptyHome + LookupForm (`a15b828`)
- [x] 2-tab TabBar (Home + Settings) (`d959964`)
- [x] Soft-delete + sonner toast-undo for transactions (`ddaedbe`)
- [x] Playwright e2e: buy → see position with correct math (`80b1a16`)
- [x] Real-device verified on operator's phone + desktop

**Sprint 1 · M1 "See a stock"** — DONE (closed 2026-05-17 · tag `v0.M1`)

Operator confirmed prod working: login → home → symbol detail (price, day change, post-market price+change, range-switchable chart).

- [x] `lib/market/yahoo.ts` adapter + 21 Vitest unit tests
- [x] `/api/quote/[symbol]` + `/api/history/[symbol]` with cache write-through
- [x] Single-password auth (bcrypt + jose + middleware gate)
- [x] `/login` UI (server page + client form, error states)
- [x] `scripts/seed.ts` real impl — bootstraps `app_settings` from env
- [x] `/s/[symbol]` Hero + lightweight-charts area + 6 range chips
- [x] Neon prod (`flat-bonus-47972630`) provisioned + migrations applied + app_settings seeded
- [x] Vercel project linked + 4 prod env vars set + initial deploy
- [x] Playwright e2e × 6 specs × 2 projects = 12/12 green
- [x] Real-device verified on operator's phone + desktop

## post-M1 follow-ups (queued for separate work)

- Design canvas round-2: completed in v3 + v4 rounds (see `references/designs/CHANGELOG.md`)
- Component-locality fixes in design canvas per `references/designs/REVISIONS.md` audit

## what's NOT in scope for M3

- Market tab, CSV import, dividends/performance sub-pages, onboarding wizard (M4)
- Per-profile PIN (R-P6 deferred to v1.5)
- Alert push triggers, FIFO tax, offline write queue (v1.5)
- Cross-profile `__all__` view (M4 or v1.5)

## decision log pointer

For the full decision history, see [`logs/ledger/decisions.ndjson`](logs/ledger/decisions.ndjson).
Major architectural choices are in [`docs/adr/`](docs/adr/).

## status conventions

- `[ ]` = todo · `[~]` = in progress · `[x]` = done · `[!]` = blocked · `[?]` = needs clarification
- Sprints map 1:1 to MVP milestones from `MVP_PLAN.md`
- "what's NOT in scope" prevents scope creep — when in doubt, defer
