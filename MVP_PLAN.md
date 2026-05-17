# MVP Plan — mini-mint

## 0. context & strategy (locked)

**Confirmed with user 2026-05-17**:
- Vertical-slice delivery (one tab end-to-end, ship, repeat)
- Build against current ~80% design canvas; design round-2 deferred until M1 user feedback
- Each milestone deployed to Vercel + Neon prod, accessed via Vercel default `*.vercel.app` subdomain
- Neon dev project already provisioned (`mini-mint-dev` · proj `proud-pine-87759784`), 0000+0001 migrations applied + smoke-tested

**MVP definition**: a personal investment tracker becomes valuable the moment the user can record a real trade and see today's P/L. Everything else — watchlists, multi-profile, market discovery, CSV import, dividends, onboarding — is enhancement. We ship that minimum first, then layer.

## 1. milestone table

| ID | name | user can… | scope | hard cuts | est duration |
|---|---|---|---|---|---|
| **M1** | "See a stock" | Log in on phone or desktop, view AAPL live price + 1-year chart | login flow · yahoo adapter · `/api/quote` + `/api/history` · single-page `/s/[symbol]` · Vercel deploy · Neon prod | no profiles · no positions · no portfolio · no record-trade · no watchlist · no tabs | 3-5 days |
| **M2** | "Record my first trade" | Create one account, record buys/sells, see aggregated MyPosition + today's P/L | profile bootstrap (single "Me" profile auto-created) · single account create · TradeSheet · MyPosition aggregated card (U-1) · minimal Home tab (net worth + holdings list) | still no watchlist · no multi-profile · no market tab · no charts beyond M1's · no CSV | 5-7 days |
| **M3** | "Watchlist + family" | Add multiple watchlist items, switch between family profiles, see pre/post market | full multi-profile (R-P0..P3 minus PIN) · ProfileSwitcher · watchlist CRUD · Home watchlist strip · MarketStatusStrip with pre/post · profile color chrome | no Market tab · no CSV · no dividends/activity tabs · no onboarding wizard | 5-7 days |
| **M4** | "Complete v1" | Browse market, import broker CSV, see dividends + activity history, walk through onboarding | Market tab 4 sub-tabs · CSV import 4-step flow · Portfolio Activity + Dividends + Performance · Onboarding wizard · privacy 3-tier · alerts (read-only list, no triggers yet) | alert push triggers → v1.5 · FIFO tax → v1.5 · Sectors/Movers sub-tabs → v1.5 · per-profile PIN → v1.5 · offline write queue → v1.5 | 7-14 days |

Each milestone is independently mergeable, independently deployable, and a real product the user can use daily.

## 2. M1 detailed scope ("See a stock")

### deliverables
- `/login` page + middleware redirecting unauth → /login (CLAUDE.md non-negotiable #6 alignment)
- `lib/market/yahoo.ts` adapter implementing `getQuote(symbol)` and `getHistory(symbol, range)`, with the field-mapping rules from `logs/probes/ANALYSIS.md` (`adjclose → adj_close`, ETF module subset, rename detection)
- `app/api/quote/[symbol]/route.ts` + `app/api/history/[symbol]/route.ts` — Route Handlers calling adapter, writing through `quote_cache` (30s TTL) + `prices_daily` (write once per symbol-day)
- `app/(app)/s/[symbol]/page.tsx` — single screen: Hero (price + delta + pre/post if available) + lightweight-charts area chart with 1D/1M/1Y/All range chips
- `lib/auth/session.ts` + `app/api/auth/login/route.ts` — bcrypt+jose minimal cookie auth
- `scripts/seed.ts` for-real: bootstrap `app_settings` row 1 from env, no demo profile
- Vercel project linked; Neon prod project provisioned + connection string in Vercel env; first deploy live

### explicit non-goals for M1
- No bottom TabBar (single-page app feel — back to /s/AAPL is the whole UI)
- No profiles model used at API layer (queries still scoped via `profile_id` in DB but the only profile is a hidden "default" one auto-created at bootstrap)
- No TradeSheet, no portfolio, no positions math
- No multi-line comparison chart
- No watchlist
- No global search (URL-only access: `/s/AAPL`, `/s/MSFT`, …)

### acceptance criteria
1. Operator opens `app-name.vercel.app` on iPhone → login → enter `/s/AAPL` URL → sees AAPL price within 1s, chart within 2s
2. Operator opens same URL on macOS Safari → same behavior, denser layout
3. Lighthouse PWA score ≥ 80
4. `audit:loop` 4/4 green on the M1 PR
5. Pre/post market price line appears if session is `PRE`/`POST`
6. Closing the laptop → reopening 1 hour later → quote refreshes automatically (TanStack visibility-aware refetch)

### M1 implementation sequence (suggested for agent assignment)
1. **Adapter** (`lib/market/yahoo.ts` + tests) — pure logic, no DB
2. **API routes** (`/api/quote/[symbol]`, `/api/history/[symbol]`) — adapter + cache writes
3. **Auth** (`lib/auth/session.ts` + `/api/auth/login` + middleware)
4. **Login page** UI
5. **Seed script** (bootstrap app_settings; idempotent)
6. **SymbolDetail page** (server prefetch + client chart)
7. **Vercel + Neon prod wiring** (env vars, deploy hook, first push)
8. **End-to-end Playwright test** for the login → quote round-trip

## 3. M2 detailed scope ("Record my first trade")

### deliverables
- Profile bootstrap: on first login post-M2 deploy, if no profile exists, transparently create one named "Me" with color slot 1 (no profile picker UI yet)
- Single AccountCreate flow (settings sub-page or inline on empty Home)
- `lib/portfolio/positions.ts` — TypeScript wrappers around `get_positions()`, `get_my_position()`, `get_net_worth()` Postgres functions (already in DB)
- `app/api/transactions/route.ts` (POST create, GET list) + `lib/api/mutations/transactions.ts`
- TradeSheet component (BUY/SELL only; DIV/SPLIT defer to M3-M4)
- Aggregated MyPosition card on `/s/[symbol]` (U-1)
- Minimal Home tab at `/` — net worth hero + positions table; no other sections
- A 2-tab TabBar (Home + Settings) — Portfolio/Market/Me deferred; Settings just shows logout + DB connection status
- Toast + Undo for trade record/delete (sonner already installed)

### acceptance criteria
1. Operator records a real buy → returns to /s/AAPL → sees the position in MyPosition card with correct avg cost
2. Today's P/L on Home matches `70 × (quote.price − quote.prev_close)` arithmetic
3. Delete trade → Toast offers 5s Undo → click Undo → trade restored
4. Multi-account scenario (Operator creates 2nd account, buys AAPL in both) → MyPosition aggregates across accounts
5. audit:loop green; Playwright e2e for the complete buy → see-position flow

### explicit non-goals for M2
- No watchlist
- No profile switcher
- No market tab
- No CSV import
- No dividends (DIV kind disabled in TradeSheet)
- No charts beyond M1's
- No swipe gestures on rows (basic tap-to-detail only)

## 4. M3 detailed scope ("Watchlist + family")

### deliverables
- Full R-P0..P3 multi-profile (data model already there; add API + UI):
  - ProfilesList in Settings
  - Add / edit / delete profile with color/avatar
  - ProfileSwitcher (mac sidebar chip + ios full-screen sheet)
  - Profile color chrome (R-P2): sidebar stripe, NavHeader name color, active-CTA tinting
  - Trade Sheet profile-attributed header (R-P3)
- Per-profile PIN deferred to v1.5 (R-P6)
- Watchlist CRUD: create/rename/delete lists; add/remove items; reorder via dnd-kit
- Home Watchlist strip (R-N1 #5): chip switcher + 5-7 rows + "View all"
- WatchlistFull page at `/watchlists/[id]`
- MarketStatusStrip on Home (R-N1 #2) using `quote.marketState` + pre/post — fully closes U-2
- Search palette ⌘K (R-I5) — minimal: holdings + market sections only, no news

### acceptance criteria
1. Operator creates 3 profiles (Me/Mom/Dad) → switches between them → sees only that profile's accounts/holdings/watchlists; sidebar stripe color changes per switch
2. Operator adds 5 symbols to a watchlist → Home shows them with live prices
3. Pre-market hours: MarketStatusStrip shows "Markets open in Xh Ym · Pre-market +0.42%"
4. After-hours: "Markets closed · Pre-market data available"
5. ⌘K from any page → typing "AAPL" → enter → opens /s/AAPL within 200ms

### explicit non-goals for M3
- No Market tab
- No CSV import
- No Activity/Dividends/Performance sub-tabs in Portfolio
- No onboarding wizard
- No alerts management

## 5. M4 detailed scope ("Complete v1")

### deliverables
- Market tab with 4 sub-tabs (Overview/Stocks/ETF/News); Sectors+Movers placeholders
- MultiLineComparisonChart for index overlay (R-N3)
- Portfolio Positions sub-tabs: Summary, Positions (already done in M2), Activity, Balances
- Portfolio detail pages: `/portfolio/dividends`, `/portfolio/performance`
- CSV import 4-step flow with mapping table (R-SC2) — supports Fidelity, Schwab, Vanguard templates + Custom
- Onboarding wizard (U-7) — Welcome → create first profile → 3-way choice (Import CSV | manual | demo)
- Privacy 3-tier (R-P7 / U-8) with privacy mode toggle in Settings
- Alerts list page (read-only; users can set thresholds in DB but no push delivery yet)
- Earnings/dividend events on Home UpcomingEvents card (R-N1 #8)

### acceptance criteria
1. Fresh install → operator walks through onboarding → ends at populated Home
2. CSV import of a Fidelity month-end statement → all transactions land correctly → positions match
3. Privacy mode L2 → in coffee shop, screen reveals no account names or amounts
4. Earnings within 7 days appear on Home's UpcomingEvents
5. Bell icon in Home header pushes to /me/alerts showing configured thresholds (no triggers fire yet)

### explicit non-goals for M4 (deferred to v1.5)
- Alert push notifications (Web Push)
- FIFO tax method + realized-PL lots
- Per-profile PIN (R-P6)
- Offline write queue
- Sector heatmap, Movers tab
- Wash sale detection UI
- Holding period LT/ST badges in UI (data is there from DB function)

## 6. shared dev practices across milestones

### branching
- One branch per milestone: `m1-see-a-stock`, `m2-record-trade`, `m3-watchlist-family`, `m4-complete-v1`
- Sub-features within a milestone live on `m1-yahoo-adapter`, `m1-login`, etc. and merge to the milestone branch
- Each milestone branch → opens PR to main with the full acceptance demo + audit:loop output + Playwright recording (where applicable)
- Once main is green, immediate Vercel prod deploy; tag as `v0.M1`, `v0.M2`, …

### per-milestone definition of done
A milestone is DONE when **all of**:
- [ ] All acceptance criteria pass
- [ ] `pnpm audit:loop` 4/4 green on the merged commit
- [ ] At least one e2e Playwright spec covering the headline user flow
- [ ] Deployed to Vercel prod and tested on operator's real iPhone + real macOS
- [ ] STATUS.md updated; new decisions logged in `logs/ledger/decisions.ndjson`
- [ ] Any spec drift backfilled into INTERACTION_SPEC.md / DATABASE_SPEC.md / REVISIONS.md

### deploy infrastructure (set up during M1, reused throughout)
- **Neon prod project**: separate from dev (created at M1 wiring step)
- **Vercel project**: created from GitHub repo; environment variables:
  - `DATABASE_URL` → Neon prod connection string
  - `APP_PASSWORD_HASH` → bcrypt of operator password
  - `SESSION_SECRET` → openssl-generated
  - `FINNHUB_API_KEY` → blank for v1 (yahoo covers)
  - `SECRETS_KEY` → 32 bytes for encrypting finnhub key (when added)
- **Preview deploys**: every PR auto-gets a Vercel preview URL — operator can test from phone before merge
- **Production hostname**: `mini-mint-<hash>.vercel.app` for v0.M1; custom domain deferred

### agent assignment per milestone
| milestone | recommended agent kickoff |
|---|---|
| M1 | `design-implementer` for SymbolDetail screen · plain `claude` agent for adapter + auth (no design dep) · `test-writer` for adapter unit + e2e |
| M2 | `claude` for TradeSheet + portfolio APIs · `design-implementer` for Home v1 · `test-writer` for mutation flows |
| M3 | `claude` for ProfileSwitcher infra · `design-implementer` for chrome + Watchlist · `migration-author` if needed for any schema tweaks · `test-writer` |
| M4 | `design-implementer` for Market tab + CSV import · `claude` for onboarding state machine · `test-writer` |
| any | `code-reviewer` before every PR merge — automated gate against the 8 contracts |

### definition of "incremental auto-development"
At any milestone, the daily loop is:

1. Pick the next acceptance criterion from this MVP_PLAN.md
2. Spawn the appropriate agent with a narrow brief referencing the relevant spec sections + acceptance criteria
3. Agent edits code on a feature branch
4. Auto-runs `pnpm audit:loop` before claiming done
5. Operator does 5-min real-device sanity check
6. `code-reviewer` agent runs against the diff
7. Merge to milestone branch
8. Repeat — until all acceptance criteria for the milestone tick

When the milestone branch is fully green, single human review + merge to main → auto-deploy.

## 7. risks & mitigations

| risk | likelihood | impact | mitigation |
|---|---|---|---|
| yahoo-finance2 throttling or breaking change | medium | high (M1+) | Finnhub adapter already installed; switch via `lib/market/index.ts` strategy pattern in M1 |
| Neon free tier limits hit | low | medium | autoscale to paid only if pages slow; current load ~200 quote writes/min during hours is ≤1% of free tier |
| Design v2 round-2 lands mid-M3 | medium | low | UI implemented from current canvas; round-2 changes land as a focused PR; design tokens are already locked (R-T0) so most updates are component-internal |
| Operator wants a feature not in M1-M4 | high | low | Add to BACKLOG.md; resist adding to current milestone; revisit at M-X completion |
| Vercel cold start hurts /api routes | medium | low | Neon serverless driver is HTTP, no connection warmup needed; Vercel functions warm within seconds |
| Stored function bug only caught at runtime (like the get_positions one in sprint 0) | medium | medium | Add a `scripts/smoke-db.ts` running all 6 functions against seed data; part of `audit:loop` going forward |

## 8. timeline (best-case rolling)

Assuming aggressive agent-driven work + operator availability for 30-min daily review:

| date | milestone |
|---|---|
| 2026-05-22 | M1 in operator's hand |
| 2026-05-29 | M1 feedback collected; M2 starts |
| 2026-06-05 | M2 in operator's hand |
| 2026-06-12 | M3 starts after M2 feedback |
| 2026-06-19 | M3 in operator's hand |
| 2026-07-03 | M4 / v1.0 in operator's hand |

These are stretch; reality may slip 1-2 weeks. The point is "ship M1 in a week" — not "ship everything in 7 weeks".

## 9. what kicks off M1

Operator says "begin M1" → next conversation starts with:

1. Spawn agent: write `lib/market/yahoo.ts` with adapter + Vitest unit tests
   - brief includes ANALYSIS.md §3 + §F4 + §F5
   - branch `m1-yahoo-adapter`
   - run `audit:loop` + `code-reviewer` before merging into `m1`
2. While that runs, this assistant provisions Vercel project (or operator does it manually + provides project name)
3. Once adapter merges, spawn agent for API routes
4. Once routes work, spawn for auth + login UI
5. Once auth works, spawn for SymbolDetail UI
6. Final integration commit + first Vercel deploy + operator phone test

Estimated 3-5 days of mostly-async agent work with operator gating decisions and merging.
