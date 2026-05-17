# CHANGELOG — v2 design pass (continuation)

This pass closed the remaining gaps from `uploads/REVISIONS.md`. Existing artboards
were not touched; new files were added and `app.jsx` / `index.html` updated to
mount them.

## New files

### `screens-v3-tabs.jsx` (R-N2 / R-N3 — Portfolio & Market sub-tab parity)
- `IOSPortfolioSummary` — 4-up KPI strip · vs-SPY performance card · allocation donut + legend · top-5 holdings · dividends preview
- `IOSPortfolioActivity` — month-grouped txn list · 6 filter chips · per-month subtotal · import/export rail · CSV nudge
- `IOSPortfolioBalances` — 3 aggregate stat tiles · per-account breakdown w/ left-edge account-color stripe · external-cash hint
- `IOSAccountSelectorSheet` — drop-down sheet listing all accounts + virtual "All accounts" row, with profile-color avatars and today P/L
- `IOSPortfolioOverflowMenu` — Apple-style 9-row popover anchored to top-right "…" (replaces FAB-invoked Trade per R-N4)
- `MacPortfolioSummary` — 2-col Mac layout · 4-up KPI hero · perf chart · allocation donut · top-5 list
- `MacPortfolioActivity` — 8-col dense table (Date · Type · Symbol · Account · Qty · Price · Total · Running P/L)
- `MacPortfolioBalances` — 4-up KPI strip · 2-col per-account broker cards with account-color stripe
- `IOSMarketTrending` — Stocks tab w/ section chips (Trending / Most active / Day gainers / Day losers / Undervalued / High dividend)
- `IOSMarketETF` — IMG_5095-parity: Trending & Movers heading, AUM column, filled %-pills
- `IOSMarketNews` — 7 filter chips + 1 feature card + 5 thumb cards w/ "You hold" / "Earnings" / "Macro" tags
- `MacMarketSectorsHeatmap` — 11 GICS sectors as heatmap tiles with continuous red→green gradient and top-3 ticker chips

### `screens-v3-misc.jsx` (R-I3 / R-P1 / R-P3 / R-P5 / R-P6 / R-N4 / R-SC5 / R-A2)
- `IOSWatchlistCollapsed`, `IOSAccountsCollapsed` — frame-2 of R-I3 nav-bar collapse, with spec chip
- `IOSStatusBarProfileChip` — 3 close-up states (active / PIN-protected / switch target) for the iOS top-left chip
- `IOSProfilePINSetup` — 4-dot numpad screen inside Profile Editor with "not a security boundary" disclaimer
- `IOSAccountSwitchWarning` — alert dialog showing from-profile → to-profile, with discard-and-switch action
- `IOSTradeSheetFromSymbol` — sheet invocation from MSFT detail; profile-attributed header + pre-filled symbol + segmented BUY/SELL + estimated total
- `MacProfileSwitchTransition` — mid-220ms cross-fade frame with target-profile radial flash
- `MacDashboardAllProfiles` — household read-only with stacked profile bar, per-profile share legend, household movers w/ avatar attribution, By-profile allocation donut
- `MacSymbolDetailAllProfiles` — AAPL aggregate MyPosition with breakdown rows per profile (left-edge profile stripe)
- `IPadDashboard` — 1024×1366 mid-tier · iOS TabBar preserved · 2-col reflow (Hero+Movers / Accounts+Watchlist)
- `MacWatchlistCompact` — 900×700 · sidebar collapses to 64px icon rail · sparkline column hidden
- `MacWatchlistKeyboardFocus` — `:focus-visible` mint outline on row 2, with hint strip explaining ↑↓ / ↵ / delete / ⌘F

## Modified files

### `index.html`
- inserted `<script type="text/babel" src="screens-v3-tabs.jsx"></script>` and `…misc.jsx` immediately before `app.jsx`

### `app.jsx`
- Portfolio v2 section: 8 new artboards (Summary/Activity/Balances on both iOS+Mac · selector sheet · overflow menu) added alongside existing Positions screens
- Market v2 section: 4 new artboards (iOS Trending · iOS ETF · iOS News · Mac sector heatmap)
- Gestures section: 2 new collapsed-nav frames (Watchlist · Portfolio)
- Profiles section: 7 new artboards (PIN setup · status-bar chip · switch warning · trade-from-symbol · mac switch transition · mac all-profiles dashboard · mac all-profiles symbol)
- New Responsive section: 3 artboards (iPad Home · Mac compact watchlist · Mac keyboard focus)

## Notes on scope

- The Mac Sector Heatmap is the R-N3 v1.5 placeholder; tile sizes are equal (treemap weighting deferred to v1.5)
- `MacSymbolDetailAllProfiles` uses AAPL because it is the only symbol currently held across all 3 mock profiles in `data.jsx` — verifies the cross-profile aggregation visually
- All new artboards consume `var(--p-*)` profile tokens, `var(--sec-*)` section accents, `--hairline-top`, `--hero-grad-*`, and `.t-*` role classes from `styles.css` — no new hex literals or arbitrary font sizes introduced
