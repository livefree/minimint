# Interaction Specification — mini-mint

## 0. purpose & scope

This document is the **engineering interaction contract** derived from `references/designs/REVISIONS.md` (design intent) and `stock-app-1-2-moonlit-dawn.md` (architecture plan). It specifies every page, route, navigation edge, button action, overlay, list pattern, and state transition needed to implement frontend routing + state management + business logic for v1.

It does NOT specify visual design (covered by the design canvas) nor backend schema beyond what affects client behavior (covered by the architecture plan).

**Stack assumptions** (locked):
- Next.js 15 App Router · TypeScript
- TanStack Query v5 (server state) · Zustand (global client state) · nuqs (URL search params) · React Hook Form + Zod (forms)
- shadcn/ui base components · vaul (bottom sheets) · framer-motion (transitions/gestures)
- Drizzle + `@neondatabase/serverless` (Neon Postgres) · bcryptjs + jose (auth)
- TradingView lightweight-charts (price charts) · custom SVG (sparklines/donut)
- next-pwa (manifest + SW)

---

## 1. global navigation model

### 1.1 frame structure

```
<RootLayout>
  ├── (auth) routes — no app chrome
  │     /login
  └── (app) routes — app chrome (TabBar/Sidebar + ProfileChip)
        ├── Home          (tab)
        ├── Portfolio     (tab)
        ├── Market        (tab)
        ├── Me            (tab)
        ├── /s/[symbol]   (drill-down, any tab can push)
        ├── /search       (drill-down or modal)
        └── (overlays — rendered above current page via portal)
              ├── ProfileSwitcher (sheet)
              ├── TradeSheet (sheet)
              ├── CsvImport (sheet)
              ├── AccountSelector (sheet)
              ├── ContextMenu (popover)
              ├── ConfirmDialog (alert)
              └── Toast (transient)
```

### 1.2 tab stack semantics (iOS-style independent back stacks)

- Each of the 4 tabs maintains its **independent navigation stack**
- Tapping the active tab again pops to its root
- Switching tabs preserves the other tabs' scroll + stack depth (mounted-not-unmounted approach)
- Switching tab does NOT count as navigation history (no browser back-button trace)
- On mac: same model, sidebar replaces TabBar

**Implementation**: Next.js parallel routes via `(app)/@home`, `(app)/@portfolio`, `(app)/@market`, `(app)/@me` slots in a single layout, with `default.tsx` files to avoid 404 on slot mismatch. State for "active tab" lives in `cookie` so SSR works.

### 1.3 profile switching is orthogonal to navigation

- Profile switch = scope mutation, NOT a route change
- Current profile lives in cookie `mm.profile` + Zustand mirror
- Switching profile keeps the same tab + same route, just refetches all profile-scoped queries
- Query keys MUST include `profileId` (see §7.2) so cache is naturally segmented

### 1.4 push vs replace conventions

| transition | API | rationale |
|---|---|---|
| Tab change | swap parallel-route slot, no `router.push` | not a real navigation |
| List → detail (StockRow → /s/AAPL) | `router.push` | adds back stack entry |
| Detail → other detail (e.g., from AAPL to MSFT via related) | `router.push` | history preserved |
| Settings sub-page → back | `router.back()` | standard back |
| Login success | `router.replace('/')` | login not in history |
| Profile creation → first Home | `router.replace('/')` | onboarding not in history |
| Modal close | NOT a route change | overlay state local |

### 1.5 deep linking

All app routes are deep-linkable; visiting them while not authenticated redirects to `/login?next=<path>`; visiting while no profiles exist redirects to `/onboarding`. After auth + profile present, redirect target is honored.

---

## 2. route map (canonical)

| route | render | render mode | auth | profile | data deps |
|---|---|---|---|---|---|
| `/login` | LoginPage | server | none | none | none |
| `/onboarding` | OnboardingFlow | client | required | optional | none (creates first) |
| `/` | HomePage | server (initial) + client | required | required | net worth, accounts, watchlist, movers, allocation, events, activity |
| `/portfolio` | PortfolioPage (Summary tab) | server | required | required | KPIs, allocation, mini perf |
| `/portfolio/positions` | PortfolioPositions | server | required | required | positions table |
| `/portfolio/activity` | PortfolioActivity | server | required | required | transactions paginated |
| `/portfolio/balances` | PortfolioBalances | server | required | required | cash/margin per account |
| `/portfolio/performance` | PortfolioPerformanceFull | client (chart heavy) | required | required | TWR series, benchmark |
| `/portfolio/dividends` | PortfolioDividendsFull | server | required | required | divs YTD + upcoming |
| `/market` | MarketPage (Overview tab) | server | required | irrelevant | indices, trending |
| `/market/stocks` | MarketStocks | server | required | irrelevant | gainers/losers/active |
| `/market/etf` | MarketEtf | server | required | irrelevant | trending ETFs |
| `/market/news` | MarketNews | server | required | irrelevant | news feed |
| `/market/sectors` (v1.5) | MarketSectors | server | required | irrelevant | sector heatmap |
| `/market/movers` (v1.5) | MarketMovers | server | required | irrelevant | full movers |
| `/me` | MeSettingsPage | server | required | required | settings tree |
| `/me/profiles` | ProfilesList | server | required | optional | all profiles |
| `/me/profiles/[id]` | ProfileEditor | server | required | optional | profile detail |
| `/me/appearance` | Appearance | client | required | required | local prefs |
| `/me/privacy` | Privacy | client | required | required | privacy level |
| `/me/data` | DataPanel | client | required | required | export/import/backup |
| `/me/market-data` | MarketDataPanel | client | required | none | API key status, refresh rate |
| `/me/app` | AppPanel | server | required | none | password change, version |
| `/s/[symbol]` | SymbolDetail | server (initial) + client (chart) | required | required | quote, history, profile-scoped position |
| `/watchlists/[listId]` | WatchlistFull | server | required | required | full list (when "View all" from Home) |
| `/search` | SearchPage (ios fullscreen) | client | required | required | symbols matching query |

### 2.1 search params

| param | scope | persisted | values |
|---|---|---|---|
| `?range=1D\|1W\|1M\|3M\|6M\|YTD\|1Y\|2Y\|5Y\|10Y\|ALL` | symbol detail, performance, net worth chart | per-surface localStorage | range chips |
| `?mode=area\|line\|candle` | symbol detail chart | per-user pref | chart toggle |
| `?account=<id>\|all` | portfolio/* | session | AccountSelector |
| `?from=<isoDate>&to=<isoDate>` | portfolio activity | URL only | filter |
| `?kind=BUY\|SELL\|DIV\|SPLIT\|FEE` (multi) | portfolio activity | URL only | filter |
| `?sort=<col>:<asc\|desc>` | portfolio positions, watchlist | per-user pref | column sort |
| `?next=<path>` | /login | URL only | post-auth redirect |
| `?profile=<id>\|__all__` | overrides current profile for a single page load | URL only | useful for shared links |

### 2.2 reserved profile id

`__all__` is a virtual profile id meaning "household aggregate". Allowed on Home and Portfolio only. Mutation routes refuse `__all__` (see §6 — mutation gating).

---

## 3. page inventory (per-page contract)

Each entry has: **route · render · queries · mutations · primary CTAs · empty/error states · permissions**.

### 3.1 LoginPage
- route `/login`
- render: server component + client form
- queries: none
- mutations: `POST /api/auth/login` { password } → cookie `mm.session`
- CTAs: "Sign in" (primary)
- states: idle / submitting / error (wrong password — inline) / locked-out (after 5 failures — 30s cooldown)
- permissions: none
- on success: `router.replace(searchParams.next ?? '/')` — but if no profiles exist, `/onboarding`

### 3.2 OnboardingFlow
- route `/onboarding`
- render: client (multi-step)
- queries: `profiles.list()` — to detect if already onboarded (redirect away)
- mutations: `profiles.create({ name, color, relation })` then optional `transactions.bulkImport(csv)` or `accounts.create(...)`
- steps:
  1. Welcome (1 screen, dismissible)
  2. Create first profile (name input + 8-swatch color picker + relation chips)
  3. Quick-start choice (3 cards): "Import CSV" → CsvImport flow · "Add an account manually" → AccountCreate → first TradeSheet · "Skip & explore demo" → toggles `demoMode` flag + seeds mock data
- exit: `router.replace('/')`

### 3.3 HomePage (`/`)
- render: server initial paint (net worth, accounts, recent activity from DB) + client hydration (live quotes overlay, movers re-sort)
- queries:
  - `quote.batch(symbols[])` — for all held + watchlist symbols
  - `marketStatus()` — global status strip (shared cache, 60s)
  - `portfolio.summary(profileId)`
  - `accounts.list(profileId)` + per-account `accounts.todayPL`
  - `watchlists.active(profileId)` (last-used list) → `quote.batch` for its symbols
  - `events.upcoming(profileId, daysAhead=7)`
  - `transactions.recent(profileId, limit=5)`
- mutations: none directly; reachable via "..." menu → opens TradeSheet
- CTAs: ProfileChip · search · bell (Alerts) · "..." menu (Refresh / Privacy / Record trade) · account chips · "View all" on Watchlist (push `/watchlists/[id]`)
- pull-to-refresh: invalidate `quote.*`, `marketStatus`, `portfolio.summary`, `accounts.list`
- states: see §9.1 per-section

### 3.4 PortfolioPage + sub-tabs
- route `/portfolio` (Summary) · `/portfolio/positions` · `/portfolio/activity` · `/portfolio/balances`
- sub-tab strip is sticky; switching sub-tab uses `<Link>` (URL-driven, browser-back works)
- AccountSelector is sticky above sub-tabs; opening it = bottom sheet listing accounts of current profile + "All accounts"
- **Summary**:
  - queries: `portfolio.summary(profileId, accountFilter)`, `performance.summary(profileId, accountFilter, range='1Y')`
  - mini chart deep-links to `/portfolio/performance`
- **Positions**:
  - queries: `positions.list(profileId, accountFilter, status='open'|'closed'|'options')`, `quote.batch(symbols)`
  - row tap → `router.push('/s/[symbol]')`
  - long press → ContextMenu (Set alert · Add to watchlist · View transactions · Hide)
  - swipe-left (ios) → reveal "Trade · Edit avg cost" actions
  - sort: column header tap toggles `?sort=col:asc|desc`
- **Activity**:
  - queries: `transactions.list(profileId, accountFilter, { from, to, kinds, cursor })` — paginated
  - infinite scroll: load 50 at a time
  - swipe-left → Edit · Delete
  - filter chips top: All · Buys · Sells · Dividends · Fees (sync to `?kind=`)
- **Balances**:
  - queries: `balances.list(profileId)` — per-account cash/margin
  - placeholder v1; manual cash entry CTA

### 3.5 MarketPage + sub-tabs
- profile-agnostic data; `profileId` only used for "is this symbol in your portfolio/watchlist" badges
- queries: `market.indices(region)`, `market.trending(kind)`, `market.gainers(kind)`, `market.losers(kind)`, `market.activeETFs()`, `market.news()`, with `staleTime=60s` during market hours, `300s` after-hours
- RegionChips → `?region=US|EU|ASIA` URL state
- RangeChips → `?range=...`
- index row tap → `router.push('/s/[symbol])` (use real index ticker, e.g. ^GSPC)

### 3.6 MeSettingsPage
- root `/me` shows a settings tree; tapping a row pushes sub-page
- mac: 2-col layout (tree left, content right); ios: pushes new page
- `/me/profiles` → list of profiles (drag-reorder); add CTA at bottom in current profile color
- `/me/profiles/[id]` → ProfileEditor (name, color, avatar, relation, PIN); destructive "Delete profile" requires typed confirmation
- `/me/data` → Export CSV/JSON · Import CSV (opens CsvImport flow) · Clear data (typed confirmation)

### 3.7 SymbolDetail
- route `/s/[symbol]?range=&mode=`
- render: server initial (Hero, MyPosition, About) + client (chart, crosshair, news)
- queries: `quote(symbol)`, `priceHistory(symbol, range)`, `priceCandles(symbol, range)` (for candle mode), `myPosition(profileId, symbol)` (aggregated across accounts per U-1), `dividends(symbol)`, `companyProfile(symbol)`, `news(symbol)`, `earnings.next(symbol)`
- chart interactions per §5.5
- sticky bottom Trade CTA → opens TradeSheet pre-filled
- "..." menu → Add to Watchlist · Set price alert · Share · Hide from portfolio
- left swipe = no-op (chart owns horizontal gesture); back gesture from screen-edge (ios) per §1.4

### 3.8 WatchlistFull
- route `/watchlists/[listId]?sort=...`
- "View all" link from Home opens this
- header: list name (large title) · "Edit" (enters multi-select mode for bulk delete/move) · "+ Add symbol" (opens SearchPage)
- list row interactions identical to Portfolio Positions row

### 3.9 SearchPage
- route `/search?q=...` (ios fullscreen) or modal palette (mac, ⌘K)
- queries: `search.holdings(profileId, q)` + `search.market(q)` (debounced 250ms)
- sections: My Holdings · Watchlists · Market
- row tap → `router.push('/s/[symbol]')`
- close: cancel → back; symbol selected → replace (don't add search to history)

---

## 4. navigation graph

### 4.1 cross-page edges (most important)

```
Home ──(StockRow tap)──> /s/[symbol]
Home ──(account chip tap)──> /portfolio?account=<id>
Home ──(View all on watchlist)──> /watchlists/[listId]
Home ──(View all on events)──> /portfolio/dividends (if div) | /s/[symbol] (if earnings)
Home ──(account chip context: Activity)──> /portfolio/activity?account=<id>
Home ──(... menu: Record trade)──> TradeSheet overlay
Home ──(bell tap)──> /me/alerts | placeholder if v1.5
Home ──(profile chip tap)──> ProfileSwitcher overlay
Home ──(search tap)──> /search

Portfolio.Summary ──(View full performance →)──> /portfolio/performance
Portfolio.Summary ──(View dividends →)──> /portfolio/dividends
Portfolio.Positions row ──(tap)──> /s/[symbol]
Portfolio.Positions row ──(swipe Trade)──> TradeSheet
Portfolio.Activity row ──(swipe Edit)──> TradeSheet (edit mode)
Portfolio.Activity ──(... overflow Import CSV)──> CsvImport overlay
Portfolio.* ──(account selector tap)──> AccountSelector sheet

Market.* ──(any row tap)──> /s/[symbol]
Market.* ──(search)──> /search
Market.Overview ──(news headline)──> /market/news?article=<id> | external if v1 stub

Me ──(profile row tap)──> /me/profiles/[id]
Me ──(any setting row tap)──> /me/<subpage>
Me.profiles list ──(switch profile)──> ProfileSwitcher overlay (then no nav, scope change)

SymbolDetail ──(Trade CTA)──> TradeSheet
SymbolDetail ──(MyPosition → View transactions)──> /portfolio/activity?account=<id>&symbol=AAPL
SymbolDetail ──(... menu: Add to watchlist)──> small inline list-picker popover
SymbolDetail ──(... menu: Set alert)──> AlertSheet overlay (v1.5)
SymbolDetail ──(back gesture)──> previous screen

TradeSheet ──(Save)──> dismiss + Toast with Undo
TradeSheet ──(Cancel after edits)──> ConfirmDialog "Discard changes?"
TradeSheet ──(account dropdown choose different profile)──> ConfirmDialog "Switch profile?"

CsvImport ──(Done → 'Open Activity')──> /portfolio/activity
ProfileSwitcher ──(pick profile)──> no nav, scope change + accent-flash transition (§15.4)
ProfileSwitcher ──(Add profile)──> push /me/profiles/new (full-screen sheet stack)
ProfileSwitcher ──(All profiles)──> no nav, scope change to __all__
```

### 4.2 back stack rules

- Drill-down navigations (StockRow → /s/AAPL → /s/MSFT) accumulate; user can back-stack all the way.
- Tab switching does NOT push; old tab's stack is preserved verbatim.
- Modals do NOT modify the back stack; closing a modal = local state mutation.
- Onboarding and login are `replace` calls; user cannot back into them after completion.
- "Forward" gesture (browser/back-button-2) is supported by default via Next.js.

### 4.3 deep link normalization

When app receives a deep link:
1. If no session cookie → `/login?next=<original>`
2. Else if no profiles exist → `/onboarding`
3. Else if path requires profile and `?profile=` invalid for current operator → fallback to current profile + Toast "Profile not found, showing [Current]"
4. Else render target

---

## 5. overlay system

### 5.1 taxonomy

| kind | container | dismiss | scrolllock | stackable | a11y role |
|---|---|---|---|---|---|
| Sheet (bottom) | vaul Drawer | swipe down · backdrop tap · ✕ button | yes | yes (up to 2 deep; deeper sheets push instead) | dialog |
| Modal (centered) | Radix Dialog | backdrop tap (configurable) · ✕ · Esc | yes | rare; 1 max | dialog |
| Popover (anchored) | Radix Popover | outside click · Esc | no | no | menu/dialog |
| ContextMenu | Radix DropdownMenu | outside click · Esc · item select | no | no | menu |
| ActionSheet (ios) | vaul Drawer (short) | swipe down · backdrop · Cancel button | yes | replaces existing | dialog |
| ConfirmDialog | Radix Alert | only via explicit buttons | yes | yes (over sheets allowed) | alertdialog |
| Toast | sonner | auto 4s · swipe | no | yes (up to 3 visible) | status |
| Inline-confirm | inline DOM | tap elsewhere | no | n/a | none |

### 5.2 anchor + position rules

- mac sidebar ProfileSwitcher → Popover anchored to ProfileChip top
- ios ProfileSwitcher → Sheet, large detent
- mac ContextMenu (long-press / right-click) → Popover at pointer position
- ios ContextMenu (long-press) → ActionSheet centered bottom + source preview "lifted" overlay (per R-I4)
- TradeSheet → Sheet, large detent on ios, Modal centered on mac (840×680)
- CsvImport → Sheet, large detent; each step replaces content (no nested sheets)

### 5.3 scroll lock + body behavior

- All Sheet/Modal/ConfirmDialog open: `<body>` gets `data-overlay=open`, CSS sets `overflow: hidden` + preserves scrollbar gutter.
- ContextMenu/Popover/Toast: no scroll lock.

### 5.4 multi-overlay stacking

- ConfirmDialog can open over Sheet (e.g., "Discard changes?" over TradeSheet).
- One Sheet at a time (open → close before next, or stack as full-screen sheet replace).
- ContextMenu auto-closes when a Sheet/Modal opens.
- Toast persists across overlay open/close.

### 5.5 SymbolDetail chart crosshair (not an "overlay" but lives in same z-order discussion)

- Crosshair is in-component, not a portal.
- While crosshair active: header price + Δ swap to value-at-cursor; nav bar dims slightly so chart claims focus.
- Release → 250ms fade back to current price.

### 5.6 keyboard

- Esc dismisses topmost Sheet/Modal/Popover/ContextMenu (cascading).
- Enter inside a form Modal/Sheet submits primary action.
- ⌘. (mac) acts as Esc.

---

## 6. button / action catalog

### 6.1 mutation gating (applies app-wide)

- All mutation buttons that write to profile-scoped data are **disabled** when current scope is `__all__`. Tooltip: "Switch to a profile to record trades."
- Disabled state shows reduced opacity 0.4 + cursor not-allowed.

### 6.2 catalog (consolidated)

| button / surface | action | side effects | confirms? |
|---|---|---|---|
| **Save** (TradeSheet) | mutation `transactions.create` | invalidates `positions.*`, `quote.batch` (no), `transactions.*`, `portfolio.summary`, `accounts.todayPL` | no; Toast with 5s Undo |
| **Cancel** (TradeSheet) | dismiss sheet | none if pristine | ConfirmDialog "Discard changes?" if dirty |
| **Delete transaction** (Activity swipe) | mutation `transactions.delete` | same invalidations as Save | inline-confirm 3s + Toast with Undo |
| **Edit transaction** (Activity swipe) | open TradeSheet pre-filled (mode=edit) | on Save → invalidate | discard-confirm if dirty |
| **Add to Watchlist** (SymbolDetail) | mutation `watchlist.add` | invalidate `watchlists.active`, `watchlists.byList` | popover picker — 1-tap |
| **Remove from Watchlist** (WatchlistFull swipe) | mutation `watchlist.remove` | same | inline-confirm 3s + Undo |
| **Set price alert** (v1.5) | open AlertSheet | on Save → invalidate `alerts.list` | no |
| **Switch profile** (ProfileSwitcher row) | set `mm.profile` cookie + Zustand + refetch all profile-scoped queries | invalidate `['profile-scoped', oldId]` then `['profile-scoped', newId]` is naturally fetched | only if PIN required (R-P6) |
| **Add profile** (Me/profiles → +) | push `/me/profiles/new` | on Save → invalidate `profiles.list`, set as current | no |
| **Delete profile** (ProfileEditor → Delete) | mutation `profiles.delete` | invalidate `profiles.list`; switch to remaining profile | typed-name ConfirmDialog + Export CSV inline button |
| **Pin/Unpin profile** | mutation `profiles.update({ pinned })` | invalidate `profiles.list` | no |
| **Reorder profiles** (drag) | mutation `profiles.reorder` | optimistic update + invalidate | no |
| **Import CSV** (Portfolio overflow / Me/data) | open CsvImport sheet (4 steps) | on Done → invalidate `transactions.*`, `positions.*`, `portfolio.summary` | step 3 shows validation summary with confirm |
| **Export CSV** (Me/data) | client-side blob download | none | no |
| **Clear all data** (Me/data) | mutation `profiles.clearAllData(profileId)` | clears profile-scoped tables | typed "DELETE [Profile name]" + Export-first nudge |
| **Change password** (Me/app) | mutation `auth.changePassword` | rotates `mm.session` cookie | re-enter current password |
| **Sign out** (Me/app) | clear cookies | `router.replace('/login')` | ConfirmDialog "Sign out?" |
| **Toggle privacy mode** (Home menu / Me/privacy) | Zustand `privacy.level = 0|1|2` + persist localStorage | re-renders all PriceText/AmountText/profile labels | no |
| **Toggle theme** (Me/appearance) | Zustand `theme = light|dark|system` + persist | flips `data-theme` on html | no |
| **Refresh** (Home pull-to-refresh / mac ... menu) | invalidate `quote.*`, `marketStatus`, `portfolio.summary`, `accounts.list` | no | no |
| **Account chip tap** (Home) | `router.push('/portfolio?account=<id>')` | no | no |
| **AccountSelector pick** (Portfolio) | `router.replace('/portfolio/<subpage>?account=<id>')` | no nav history added | no |
| **Range chip** (chart) | URL `?range=` + invalidate `priceHistory(symbol, range)` | no | no |
| **Mode toggle** (chart) | URL `?mode=` + refetch candle data if switching to candle | no | no |
| **Trade CTA** (SymbolDetail bottom) | open TradeSheet pre-filled | none until Save | no |
| **"..." menu** (any) | open ContextMenu | none until item picked | no |
| **bell / Alerts** (Home header) | push `/me/alerts` (v1.5) | none | no |
| **search / ⌘K** | open SearchPage (ios) or Modal palette (mac) | none until pick | no |
| **ProfileChip tap** | open ProfileSwitcher | none until switch | no |
| **ProfileChip long-press** (ios) | quick-switch to most-recent profile | scope change + flash | no |

### 6.3 disabled-state catalog (UX clarity)

| condition | what's disabled |
|---|---|
| `scope = __all__` | TradeSheet trigger CTAs, Edit/Delete in Activity, Add ticker, Import CSV |
| Loading skeleton showing | the section's CTA dimmed but visible |
| Offline | mutations disabled; queue write for later (v1.5); show inline "queued" badge |
| Market closed | none disabled; only data freshness banner |
| Profile has PIN + not unlocked | every CTA inside that profile until PIN entered |

---

## 7. data lifecycle (TanStack Query contract)

### 7.1 client setup

- One QueryClient per app, in a Provider in RootLayout
- Defaults:
  - `staleTime: 0` (overridden per query family)
  - `gcTime: 5 min`
  - `refetchOnWindowFocus: true` (cheap, helps "background tab → return")
  - `refetchOnReconnect: true`
  - `retry: 2` with exponential backoff

### 7.2 query key naming convention

Format: `[domain, ...scope, ...args]`

```
['marketStatus']                                        // global
['quote', symbol]                                       // global
['quote.batch', [symbols].sort().join(',')]             // global; deterministic key
['priceHistory', symbol, range]                         // global
['priceCandles', symbol, range]                         // global
['companyProfile', symbol]                              // global
['news', symbol | 'market']                             // global
['market.indices', region]                              // global
['market.trending', kind]                               // global
['market.gainers' | 'losers' | 'activeETFs', kind]      // global

['profiles']                                            // operator-scoped
['profile', profileId]                                  // operator-scoped

['accounts', profileId]                                 // profile-scoped
['account', accountId]                                  // profile-scoped (via account.profileId)
['accounts.todayPL', profileId]                         // profile-scoped (derived)

['positions', profileId, accountFilter, status]         // profile-scoped
['myPosition', profileId, symbol]                       // profile-scoped (aggregated across accounts per U-1)

['transactions', profileId, accountFilter, filterHash]  // profile-scoped
['transactions.recent', profileId, limit]               // profile-scoped

['watchlists', profileId]                               // profile-scoped
['watchlist.active', profileId]                         // profile-scoped
['watchlist', listId]                                   // profile-scoped (via list.profileId)

['portfolio.summary', profileId, accountFilter]         // profile-scoped, aggregate
['performance', profileId, accountFilter, range, benchmark]
['dividends', profileId, accountFilter]                 // profile-scoped
['events.upcoming', profileId, daysAhead]               // profile-scoped

['alerts', profileId]                                   // profile-scoped (v1.5)

['search.market', q]                                    // global (debounced)
['search.holdings', profileId, q]                       // profile-scoped (debounced)

['settings.preferences', profileId]                     // profile-scoped
['settings.app']                                        // operator-scoped
```

**Invariant**: profile-scoped key MUST contain `profileId` as second element. A type-safe `qk.profileScoped(profileId, ...)` helper enforces this.

### 7.3 staleTime + refetchInterval table

| query family | staleTime | refetchInterval | conditions |
|---|---|---|---|
| `marketStatus` | 60s | 60s | always |
| `quote.*` (single + batch) | 30s | 30s during market hours · 300s after-hours · disabled when tab hidden | market-hours-aware |
| `priceHistory` (1D range) | 60s | 60s during hours | only on visible chart |
| `priceHistory` (≥ 1W) | 12 hours | none | request once per session unless invalidated |
| `priceCandles` | same as above | same | only when `mode=candle` |
| `companyProfile`, `dividends`, `news` | 1 hour | none | rare changes |
| `market.indices`, `market.trending`, etc. | 60s | 60s during hours · 600s after-hours | market-hours-aware |
| `profiles`, `accounts`, `positions`, `transactions`, `watchlists`, `portfolio.summary`, `accounts.todayPL` | derived from `quote.*` invalidation cascade; intrinsic 5 min staleTime | none | manual invalidate after mutation |
| `events.upcoming`, `alerts` | 30 min | none | manual invalidate |
| `search.*` | 10 min | none | debounced; cancel on new q |
| `settings.preferences`, `settings.app` | Infinity | none | invalidate only on mutation |

### 7.4 market-hours awareness

A pure helper `isMarketOpen(now)` returns `'pre' | 'regular' | 'post' | 'closed-day' | 'closed-weekend'`. Used by:
- `refetchInterval` enabler
- MarketStatusStrip text
- Quote-cache fallback timestamp banner

NYSE hours: regular 9:30–16:00 ET; pre 4:00–9:30; post 16:00–20:00. Closed weekends + NYSE holiday list (hardcoded JSON, updated yearly).

### 7.5 invalidation cascades (mutation → which keys to invalidate)

```ts
transactions.create / update / delete  =>
  invalidate(['transactions', profileId, '*'])
  invalidate(['transactions.recent', profileId])
  invalidate(['positions', profileId, '*', '*'])
  invalidate(['myPosition', profileId, txn.symbol])
  invalidate(['portfolio.summary', profileId, '*'])
  invalidate(['accounts.todayPL', profileId])
  invalidate(['performance', profileId, '*', '*', '*'])
  invalidate(['dividends', profileId, '*'])    // if kind=DIV or affects div math
  invalidate(['events.upcoming', profileId])    // if alters next-event

accounts.create / delete  =>
  invalidate(['accounts', profileId])
  invalidate(['accounts.todayPL', profileId])
  invalidate(['portfolio.summary', profileId, '*'])

watchlist.add / remove / reorder  =>
  invalidate(['watchlists', profileId])
  invalidate(['watchlist.active', profileId])
  invalidate(['watchlist', listId])

profiles.create / update / delete  =>
  invalidate(['profiles'])
  invalidate(['profile', id])

settings.preferences.update  =>
  invalidate(['settings.preferences', profileId])
```

A central helper `invalidateAfterTxnMutation(qc, profileId, txn)` encapsulates the txn cascade so no caller forgets.

### 7.6 optimistic update pattern

For low-risk mutations (watchlist add/remove, reorder, pin/unpin, privacy toggle):
- `onMutate`: snapshot prior, apply local mutation to cache
- `onError`: rollback to snapshot, show error Toast
- `onSettled`: invalidate

For high-risk mutations (transactions, profile delete, clear data):
- No optimistic; show inline submitting state, await server confirm, then invalidate + Toast.

### 7.7 mutation API conventions

All API routes under `/api/*` follow:
- POST = create/mutate
- GET = read
- DELETE = delete
- response shape: `{ ok: true, data }` or `{ ok: false, error: { code, message, fieldErrors? } }`
- error codes: `UNAUTHENTICATED`, `FORBIDDEN`, `VALIDATION_ERROR`, `NOT_FOUND`, `RATE_LIMITED`, `UPSTREAM_ERROR`, `INTERNAL`
- client wrapper `api.transactions.create(input)` parses, throws typed errors → TanStack Query catches → maps to UI

### 7.8 SSR + hydration

- Server components fetch via Drizzle directly (no HTTP roundtrip to own API)
- They prefetch into a `HydrationBoundary` with the same query keys client expects
- Client takes over from there
- Profile cookie is read server-side → `profileId` is available at server render time

---

## 8. list patterns

### 8.1 pull-to-refresh (ios)

- Available on Home, WatchlistFull, Portfolio.* (any tab), Market.*
- Pull > 64px → trigger; haptic on threshold; spinner sticks for min 600ms (avoid flicker)
- Refreshes all queries on the visible page (deterministic list per route)

### 8.2 pagination strategy

| surface | strategy | page size |
|---|---|---|
| Home WatchlistStrip | show first 5–7 + "View all" deep-link | 5–7 |
| Home RecentActivity | top 5, no pagination | 5 |
| Home TodayMovers | top 5, horizontal scroll | 5 |
| WatchlistFull | render all, virtual scroll if >50 items | n/a |
| Portfolio.Positions | render all (typical < 200), virtual if > 100 | n/a |
| Portfolio.Activity | infinite scroll, cursor-based | 50/page |
| Market.Trending / Gainers / Losers | top 25, "View more" → push to /market/movers | 25 |
| SymbolDetail.News | top 5, "View more" → push to /market/news?symbol= | 5 |

Use `@tanstack/react-virtual` for any list expected > 50 rows.

### 8.3 sort / filter persistence

- URL search params hold sort + filter (so deep links work and back works)
- On URL change, list refetches via new query key
- "Reset" button visible when any filter is non-default

### 8.4 search filtering (within a list)

- Watchlist + Positions tables: client-side filter via local input (text matches symbol or company name)
- Filter is in component state, not URL (transient)

### 8.5 sticky headers

- Portfolio.Positions table header sticks below sub-tab strip when scrolling
- Portfolio.Activity month group headers ("MAY 2026") sticky
- WatchlistFull sort chip sticks

---

## 9. state surface matrix

Each surface declares which of {loading, partial, empty, error, offline, stale, unauthorized} it can be in. Implementations live in `<Surface fallback={...}>` HOCs.

### 9.1 per-section state spec (Home as example, others identical pattern)

| section | loading | empty | error | offline | stale |
|---|---|---|---|---|---|
| MarketStatusStrip | 1-line skeleton | n/a | hide section | "Offline" small text | n/a |
| NetWorthHero | full skeleton (amount bar + sparkline shimmer) | "$0.00 · Add your first account" CTA | "Couldn't load" + retry button | gray-out + cached value + "as of HH:mm" | same as offline but mint progress bar at top |
| AccountsRibbon | 3 skeleton chips | "No accounts yet · + Add" inline CTA | hide section + error banner top | each chip: cached value | row-level dim 0.7 |
| WatchlistStrip | 5 skeleton rows | "Add symbols to your watchlist" + search shortcut | hide rows, banner top | rows: cached prices | same |
| TodayMovers | 4 skeleton cards | hide section (no movers if no holdings) | hide section | hide section | hide section |
| AllocationDonut | skeleton circle | hide section | hide section | cached | cached |
| UpcomingEvents | 3 skeleton rows | hide section (nothing upcoming) | hide section | cached | cached |
| RecentActivity | 5 skeleton rows | "No transactions yet · Record one" CTA | hide section + banner | cached | cached |

### 9.2 global state overlays

- **Offline** (navigator.onLine = false): yellow banner top of screen, "You're offline · showing cached data"; all mutations disabled with Tooltip
- **Stale** (any active query > 5x its staleTime due to network failures): 2px mint progress bar top of viewport (`<StaleBar />`)
- **API rate limited** (Finnhub 429): yellow banner "Quote provider rate-limited · refreshing slower", auto-disappears after next success
- **Unauthorized** (session expired mid-session): redirect to `/login?next=<current>` after showing 2s Toast "Session expired"
- **Profile not found** (deep link with invalid profile): silent fallback to current profile + Toast

### 9.3 skeleton shimmer

- 1200ms linear gradient sweep (surface-1 → surface-2 → surface-1)
- Honors `prefers-reduced-motion: reduce` → static dim, no animation
- Components: `<Skeleton w h r />`, `<SkeletonText lines={n} />`, `<SkeletonChart h />`

---

## 10. scope / client state (Zustand store)

```ts
// app store — one root store
type AppStore = {
  // operator session (read from cookie at SSR, mirrored client-side)
  operator: { authed: boolean }

  // scope
  currentProfileId: string | '__all__'
  setCurrentProfile: (id: string | '__all__') => void

  // ui prefs (persisted to localStorage)
  privacy: { level: 0 | 1 | 2 }
  setPrivacy: (level: 0 | 1 | 2) => void

  theme: 'light' | 'dark' | 'system'
  setTheme: (t: 'light' | 'dark' | 'system') => void

  // ephemeral overlay state (one each — only one Sheet/Modal at a time)
  overlay: {
    sheet: { id: string; props: any } | null
    modal: { id: string; props: any } | null
    confirmDialog: { props: ConfirmProps } | null
  }
  openSheet: (id: string, props: any) => void
  closeSheet: () => void
  // ... similar for modal/confirm

  // demo mode
  demoMode: boolean
}
```

Per-page UI state (sort, filter, range, mode chart, account selector) goes to **URL search params via nuqs**, NOT Zustand — so deep links + back-button work correctly.

Form state goes to **React Hook Form**, NOT Zustand.

### 10.1 cookie-backed state (server-readable)

| cookie | scope | mutation | reason it's a cookie |
|---|---|---|---|
| `mm.session` | operator auth | login/logout/password-change | server middleware checks |
| `mm.profile` | currentProfileId | profile switcher | server components need it for initial data fetch |
| `mm.theme` | theme preference | Me settings | avoid FOUC; server renders right surface palette |

All cookies httpOnly except `mm.profile` and `mm.theme` (client + server both read).

---

## 11. cross-cutting flows

### 11.1 login flow

```
GET /login (or any deep link → middleware redirect)
  → form: password
  → submit POST /api/auth/login { password }
    → success: server sets mm.session, returns { profilesExist: bool }
      → client: if !profilesExist → router.replace('/onboarding')
                else → router.replace(searchParams.next ?? '/')
    → failure: inline error "Wrong password"; after 5 failures show "Locked · 30s"
```

### 11.2 onboarding flow

```
GET /onboarding
  → if any profile exists → router.replace('/')
  → render Welcome (1 screen, dismiss → next)
  → render CreateFirstProfile { name, color, relation }
    → mutate profiles.create → returns profile.id
    → set mm.profile cookie
    → render QuickStart 3-card chooser
  → choose:
    A) "Import CSV" → open CsvImport sheet in-place
       → on Done → router.replace('/portfolio/activity')
    B) "Add manually" → push /me/profiles/<id>?firstAccount=true (account form inline)
       → on Save → open TradeSheet pre-empty
       → on Save trade → router.replace('/')
    C) "Skip & explore demo" → set demoMode=true, seed mock data → router.replace('/')
```

### 11.3 profile switch flow

```
ProfileSwitcher row tap (id=newProfile)
  → if newProfile has PIN AND newProfile != currentProfile
    → push PIN entry sheet
    → on success continue, on cancel abort
  → set mm.profile cookie
  → set Zustand currentProfileId
  → close ProfileSwitcher with 220ms color-flash transition (§15.4)
  → on the next render, all profile-scoped queries naturally key on new id and fetch
  → tab + sub-page preserved
  → if current route was profile-id-specific (e.g. /me/profiles/[id]) and operator can't see other profile's editor → safe by design (operator owns all)
```

### 11.4 trade record flow (3 entry paths converge)

```
Entry:
  A) SymbolDetail bottom Trade CTA → TradeSheet opens with { symbol, price=last } pre-filled
  B) Portfolio overflow "Record trade" → opens with { account=currentAccountFilter } pre-filled
  C) Home overflow "Record trade" → opens empty

TradeSheet:
  → user selects type (BUY/SELL/DIV/SPLIT), account, qty, price, date, fees, note
  → realtime validation (Zod via RHF):
    - qty > 0
    - price > 0 (except SPLIT mode)
    - SELL: warn if qty > holding (allow but flag yellow)
    - if recent identical txn within 1h → inline soft-block "Looks like a duplicate · Continue anyway?"
  → on Save:
    - mutate transactions.create → returns id
    - invalidate cascade per §7.5
    - close sheet
    - Toast "Trade recorded · Undo" (5s, action triggers transactions.delete with same id)
  → on Cancel with dirty form: ConfirmDialog "Discard changes?"
```

### 11.5 csv import flow

```
Entry: Portfolio overflow / Me/data / Onboarding choice
TabBarSafe (sheet doesn't block tabs, but back-gesture closes the sheet step-by-step)

Step 1 (Pick):
  → user picks file (input type=file, drag-drop on mac)
  → user picks broker template (Fidelity / Schwab / Vanguard / IBKR / Custom)
  → optionally picks target profile (default = current profile)
  → "Next" → upload to /api/csv/parse → returns { columns, rowSample, suggestedMapping }

Step 2 (Map):
  → render mapping table: source col → target field (Date | Symbol | Kind | Qty | Price | Fees | Account)
  → auto-fill from suggestedMapping with confidence indicator
  → user adjusts
  → "Validate" → /api/csv/validate { mapping, fileToken } → returns { valid, invalid, warnings }

Step 3 (Review):
  → render summary: "42 rows · 38 valid · 4 issues" with expandable error list
  → option to "Skip invalid rows & import valid"
  → "Import" → /api/csv/commit → returns { createdCount, errors }
  → progress: SSE or polling, show spinner

Step 4 (Done):
  → success card: "Imported 38 transactions"
  → "Open Activity" button → router.push('/portfolio/activity'); sheet closes
  → "Undo (24h)" button → schedules /api/csv/undo to be available for 24h via Toast
```

### 11.6 watchlist management flow

- Add: SymbolDetail "..." → "Add to Watchlist" → Popover with current profile's lists + "+ New list" option → tap list → mutation + Toast "Added to [List]" with Undo
- Remove: WatchlistFull swipe-left → "Remove" → mutation + Toast Undo
- Create list: WatchlistFull or Home WatchlistStrip "..." → "New list" sheet → form { name, color } → mutation
- Reorder list items: WatchlistFull → "Edit" mode (multi-select) → drag handle visible → mutation on commit
- Reorder lists: Home WatchlistStrip chip → long-press → enter edit mode → drag → commit

### 11.7 search flow (⌘K)

```
mac:
  ⌘K from any page → open SearchPalette Modal (no nav)
  → debounced 250ms input
  → results: { My Holdings (current profile), Watchlists, Market } sections
  → ↑↓ navigate, ↵ open
  → on pick: router.push('/s/[symbol]'); close palette

ios:
  Tap search icon → push /search route (full-screen with input focused)
  → same sections + behavior
  → "Cancel" → router.back()
  → on pick: router.replace('/s/[symbol]') (don't pollute history)
```

### 11.8 privacy mode toggle flow

```
Home "..." → "Privacy mode" submenu (3-tier)
  → pick L0 / L1 / L2 (radio)
  → Zustand setPrivacy(level)
  → all <Amount>, <PriceText>, <ProfileChip>, <AccountChip> read store and re-render masked variants
  → persist to localStorage
  → 80ms cross-fade on every affected node
```

### 11.9 alerts (v1.5 placeholder — design in spec, no implementation)

- Surface: bell icon → /me/alerts route → list of price alerts
- SymbolDetail "..." → "Set alert" → AlertSheet { threshold, direction, channel: in-app | push }
- Trigger: server cron checks every 5 min during hours; sends Web Push to PWA-installed devices; in-app Toast on next open

---

## 12. keyboard shortcuts (mac)

| shortcut | action | scope |
|---|---|---|
| ⌘K / ⌘F | Open SearchPalette | global |
| ⌘1 / ⌘2 / ⌘3 / ⌘4 | Switch to tab 1/2/3/4 (Home/Portfolio/Market/Me) | global |
| ⌘⇧1..8 | Switch to pinned profile #N | global |
| ⌘⇧P | Open ProfileSwitcher | global |
| ⌘N | Open TradeSheet (only on profile-scoped tabs; disabled on __all__) | Home/Portfolio/SymbolDetail |
| ⌘E | Open Activity (if in Portfolio) | Portfolio |
| ⌘R | Refresh current page | global |
| ⌘. / Esc | Close topmost overlay | overlay-context |
| ↑ ↓ | Navigate list rows (focus row) | list-context |
| ↵ | Open focused row | list-context |
| ⌫ | Delete in Activity (with confirm) | Activity |
| ⌘B | Toggle sidebar collapse | mac global |
| ⌘, | Open Me/preferences | global |

Implementation: `react-hotkeys-hook` or custom keymap provider, scoped via React Context.

---

## 13. real-time / background work

### 13.1 quote polling

- Active page only; `useQuery({ enabled: tabVisible && marketOpen })`
- Page Visibility API: when tab hidden, polling paused; on visible-again, immediate invalidate
- Aggregated `quote.batch(symbols)` per page to minimize Finnhub calls
- Server-side cache `quote_cache` with 30s TTL → API routes always check DB cache first

### 13.2 background sync (service worker)

- On `online` event (after offline): trigger `qc.invalidateQueries()` for all stale + cached queries
- On `visibilitychange → visible`: same
- Service worker caches static assets (stale-while-revalidate); API calls always network-first with fallback to last cached response if offline

### 13.3 PWA install banner

- Show install hint on Settings/About page (not auto-prompt)
- Detect `beforeinstallprompt` event; cache for later trigger

---

## 14. error handling matrix

| error class | UI response | recovery |
|---|---|---|
| Network timeout | inline retry button on affected card; banner if global | tap retry |
| 401 UNAUTHENTICATED | clear cookie + redirect /login | reauthenticate |
| 403 FORBIDDEN (operator tried action on wrong profile via race) | Toast + log; rollback optimistic | report |
| 422 VALIDATION_ERROR | inline field errors via RHF + Zod | fix input |
| 429 RATE_LIMITED (Finnhub) | yellow banner; back off automatic | wait |
| 502/503 UPSTREAM (yahoo-finance2 down) | "Historical data unavailable" inline on chart; rest of page works | nothing (graceful degrade) |
| 500 INTERNAL | red Toast "Something went wrong" + Sentry log | retry |
| Hydration mismatch (caught) | console only; not user-facing | dev-time fix |
| ChunkLoadError (build hash changed) | full reload toast | tap reload |

Wrap entire app in error boundary; per-tab in nested boundary so one tab crash doesn't kill the others.

---

## 15. animation / transition contract

### 15.1 tab switch

- 200ms cross-fade (no slide) — preserves stack mental model
- TabBar item active state: 220ms ease-out scale + color
- Reduced motion: instant

### 15.2 push / pop navigation

- ios feel: 320ms ease-out, slide-left for push, slide-right + parallax for pop
- ios edge-swipe back: gesture-driven with rubberband if cancelled
- mac: 180ms cross-fade
- Implementation: framer-motion `<AnimatePresence>` per route group; `usePathname` keying

### 15.3 sheet present / dismiss

- vaul handles spring physics (default config: stiffness 350, damping 30)
- Detents: `[0.5, 1]` for most sheets (medium + large); large only for TradeSheet
- Backdrop fade 220ms

### 15.4 profile switch flash

- 0–80ms: backdrop fades in profile-color @ 0.18
- 80–180ms: backdrop hold + scope mutation + query refetch trigger
- 180–280ms: backdrop fades out
- Total 280ms; haptic at 80ms
- Reduced motion: skip backdrop, just hard swap

### 15.5 privacy mode toggle

- 80ms cross-fade per node — simultaneously across all visible amounts
- Reduced motion: instant

### 15.6 chart crosshair

- Engage: 100ms fade-in of guide line + tooltips
- Disengage: 250ms fade-out
- Crosshair X position: snaps to nearest data point with 120ms ease-out tween
- Reduced motion: instant snap

### 15.7 list row interactions

- swipe-action reveal: spring stiffness 350 damping 30; auto-commit at 60% pull
- long-press lift: 480ms hold → 200ms scale 1.0 → 1.04 + backdrop blur ramp
- pull-to-refresh: rubberband over-scroll; spinner appears at 32px pull, commits at 64px

### 15.8 toast

- Slide-up from bottom on mobile (above safe-area), slide-down from top on mac
- 220ms in, 220ms out, 4s display (extendable by hover/touch)
- Undo button keeps toast alive 5s total

---

## 16. state management library decisions (locked)

| concern | choice | rationale |
|---|---|---|
| Server state | TanStack Query v5 | already in plan; matches query-key contract here |
| Global client state | Zustand | smaller than Redux, no boilerplate; persist middleware for prefs |
| URL search params (sort, filter, range) | nuqs | type-safe, batched, supports defaults + history mode |
| Forms | React Hook Form + Zod resolver | minimal re-renders, type-safe; matches API validation |
| Theme | next-themes | system/light/dark with no FOUC |
| Bottom sheets (ios) | vaul | spring physics matches iOS feel |
| Modals / popovers / context menus / alert dialogs | shadcn/ui (Radix primitives) | a11y baseline |
| Toasts | sonner | shadcn-native; supports promise toasts + action button (Undo) |
| Drag-drop reorder | dnd-kit | watchlist items, profile order |
| Charts (price) | TradingView lightweight-charts | crosshair, pinch, full-screen built-in |
| Charts (sparkline, donut, mini bars) | hand-rolled SVG | already in design canvas |
| Charts (multi-line comparison) | hand-rolled SVG (reuse area chart engine) | small + matches design exactly |
| Keyboard shortcuts | react-hotkeys-hook | scoped via context |
| Page visibility / online | `useSyncExternalStore` wrappers | native browser APIs |
| Animations | framer-motion | matches gestures + AnimatePresence for routes |
| Date | `date-fns` + `date-fns-tz` | NYSE hours math needs timezone |

---

## 17. glossary & type discipline

```ts
// IDs are branded strings — no cross-mixing
type ProfileId  = string & { _tag: 'ProfileId' }
type AccountId  = string & { _tag: 'AccountId' }
type SymbolId   = string & { _tag: 'SymbolId' }
type WatchlistId= string & { _tag: 'WatchlistId' }
type TxnId      = string & { _tag: 'TxnId' }

// Reserved virtual profile
const ALL_PROFILES: ProfileId = '__all__' as ProfileId
function isVirtualProfile(id: ProfileId): boolean { return id === ALL_PROFILES }

// AccountFilter for portfolio queries
type AccountFilter = AccountId | 'all'

// Quote (canonical)
type Quote = {
  symbol: SymbolId
  price: number
  prevClose: number
  change: number      // price - prevClose
  changePct: number
  dayHigh?: number
  dayLow?: number
  volume?: number
  asOf: Date          // server time; client formats per locale
  source: 'finnhub' | 'yahoo' | 'cache'
  stale?: boolean
}

// Privacy levels
enum PrivacyLevel { Off = 0, AmountsHidden = 1, PublicMode = 2 }

// Market state
type MarketState = 'pre' | 'regular' | 'post' | 'closed-day' | 'closed-weekend'
```

### 17.1 implementation guardrails

- A custom hook `useProfileScopedQuery(key, fn, opts)` enforces profile id in key; throws at dev-time if missing.
- A type-level guard prevents using `transactions.create()` with a profile id of `'__all__'`.
- All mutations go through `useApiMutation` wrapper that auto-invalidates per §7.5 from a declarative manifest.
- Forms never bypass Zod schema; backend re-validates same Zod schema on the API route.

---

## 18. open questions for engineering

These are decisions to confirm before sprint 1:

1. **Push notifications scope** — iOS PWA push (16.4+) supported but requires user installing to home screen first. Defer to v1.5? (recommendation: yes)
2. **Offline write queue** — record trade while offline → sync when back online. Defer to v1.5? (recommendation: yes; v1 disables mutations offline)
3. **Real-time WebSocket vs polling** — Finnhub free tier has WS for US stocks. Polling at 30s is simpler; WS adds connection state. Recommendation: polling for v1.
4. **Multi-operator (not multi-profile)** — household with 2 humans both logging in. Out of scope for v1 (single password).
5. **i18n switch** — design in EN; product target is bilingual operator. Plan: extract strings to dictionary now (use `next-intl`), even if only EN is supplied v1.
6. **Currency** — USD-only locked for v1; type allows future expansion.
7. **Holiday calendar source** — hardcoded JSON updated yearly vs API. Recommendation: hardcoded, accept 1×/year maintenance.
8. **Service Worker scope** — only static assets + manifest? Or also API GET cache for offline-read? Recommendation: assets only in v1, GET cache in v1.5.
