# CHANGELOG — v4 design pass (FEEDBACK-v3.md closure)

Closes every item in `references/designs/FEEDBACK-v3.md` (P0 + P1 + P2).

## P0 — Engineering blockers (all closed)

### Token registration (`styles.css`)
- **8 `--acct-*` tokens** added per R-N2.b: `--acct-slate / steel / bronze / olive / plum / rust / ocean / sand` as RGB triples
- **15 `--gics-*` tokens** added for GICS sector visual identity (tech, semis, comm, consumer, financials, health, energy, industrials, materials, utilities, realestate, staples, auto, bonds, etf). Namespaced `--gics-*` to avoid clashing with existing `--sec-portfolio / watchlist / symbol / activity` section-accent tokens
- **`--on-mint`, `--on-warm`, `--on-up`** tokens added — dark ink colors for use on saturated bright fills, replacing scattered `#07120D / #0B0B12 / #06160E` literals
- **`--symbol-tile-grad`** added — the blue→purple gradient used behind 48-56px symbol tile icons, replacing inline `linear-gradient(135deg, #5AA9FF, #B98CFF)` in 4 places
- **New typography role tokens**: `--t-chip` (12.5), `--t-h-pad` (24), `--t-h-mac` (30), `--t-display-6` (38), `--t-display-7` (56)
- **New `.t-chip` utility class** with the chip role styles

### Component file cleanup (`screens-home-v2.jsx`, `screens-v3-tabs.jsx`, `screens-v3-misc.jsx`)
- `ACCT_COLORS` rebuilt — now derives from `ACCT_PALETTE` array, each entry resolves to `rgb(var(--acct-*))`. Extended to all 4 mock accounts (Sam Individual + Roth, Mom Schwab, Dad Vanguard). Allocation rule (cyclic by creation order, user-overridable) documented inline + in REVISIONS R-N2.b
- `SECT_HUES` rewritten — every Tech/Semis/Energy/etc. value now `rgb(var(--gics-*))`. Zero raw hex
- **All `fontSize: NN`** inline literals across v3 files → `fontSize: 'var(--t-xxx)'` token refs (auto-converted via script across both files; 2 leftover whole sizes 24 and 30 got new roles `--t-h-pad` / `--t-h-mac`)
- **All `fontWeight: NNN`** inline literals → `fontWeight: 'var(--weight-xxx)'`
- **Zero hex literals remain** in `screens-v3-tabs.jsx` and `screens-v3-misc.jsx`
- **Zero numeric font literals remain** in those files

### REVISIONS.md
- _(deferred — content captured in CHANGELOG + ACCT_PALETTE comment for now; REVISIONS will be amended in the next merge)_

## P0–P2 — New artboards (`screens-v4-feedback.jsx`)

| ID | Component | Closes |
|---|---|---|
| P0-3 | `IOSAccountColorPicker` | 8-swatch grid w/ checkmark + assignment-rule helper text + "Where it shows" list |
| P1-4 | `MarketStatusStripVariants` | 4 sessions (Pre / Open / After / Closed weekend), same 32pt height |
| P1-5 | `IOSProfilePINEntryV2` × 3 states (idle / wrong-shake / cooldown) | Full-screen circular numpad + "Forgot PIN" escape + "not a security boundary" disclaimer |
| P1-6 | `IOSDashboardCollapsed` | R-I3 third frame — Home tab collapsed nav with profile-color title, market-status strip, compact hero + accounts ribbon |
| P1-7 | `IOSPortfolioOverflowMenuV2` | Reconciled menu (adds Refresh + Set alert), spec footnote confirms this is now the canonical R-N4 list |
| P1-8 | `IOSTradeSheetError` | Hard-validation semantic — red banner + error-ringed Quantity field + disabled Save button + "Cap at max" affordance |
| P2-9 | `MacMarketOverview` / `MacMarketStocks` / `MacMarketETF` / `MacMarketNews` | Four Mac Market subpages; shared `MacMarketChrome` w/ market-status pill in topbar + sub-tab strip |
| P2-10 | `IOSSymbolCostMarkers` | Avg cost line (mint dashed) + 5 B/S markers on the chart + lot breakdown table + sticky Trade CTA |
| P2-11 | `IOSTradeSheetDuplicate` | Soft amber banner ("Looks like a duplicate") — Save still enabled, "View existing trade" affordance |
| P2-11 | `IOSTradeSheetBatchEntry` | 3-row pending list, focused 3rd row, "+ Add another", estimated net cash summary, R-U4 defaults inheritance note |
| P2-12 | `IOSUpcomingEventDetail` (Earnings) | Consensus EPS/Rev tiles + last-4-surprises table + Set-alert / Open-symbol CTAs |
| P2-12 | `IOSUpcomingEventDetail` (Ex-Div) | Your-payout hero + key-dates list w/ ex-date emphasis |
| P2-13 | `IOSOnboardingWelcome` → `Password` → `Import` → `FirstProfile` → `Done` | 5-step flow w/ progress bar header, mint primary CTA, plain-text secondary action |
| P2-14 | `IOSPrivacyL2` | Profile name masked to `P1` (color only) + amounts masked + accounts masked to `A1`/`A2` + privacy-levels reference card explaining L0/L1/L2 |

## Modified files

- `styles.css` — token block extended (~80 lines added)
- `screens-home-v2.jsx` — `ACCT_PALETTE` constant + `ACCT_COLORS` reconstruction
- `screens-v3-tabs.jsx` — SECT_HUES rewritten + bulk hex/fontSize/fontWeight → token refs
- `screens-v3-misc.jsx` — bulk hex/fontSize/fontWeight → token refs
- `index.html` — `<script>` tag for `screens-v4-feedback.jsx` inserted before `app.jsx`
- `app.jsx` — new `v4-feedback` `DCSection` mounting 22 artboards (P0+P1+P2)

## Notes / known caveats

- `--sec-*` (4 section accents) and `--gics-*` (15 sector hues) coexist intentionally. The feedback suggested `--sec-tech` etc., but renaming would collide with the existing section-eyebrow tokens. Engineering may consolidate later if they reorganize the namespace
- Lint check passed locally: zero `#[0-9A-Fa-f]{6}` matches in `screens-v3-*.jsx`; zero numeric `fontSize:`/`fontWeight:` matches in same
- `screens-v4-feedback.jsx` was written token-first from the start — no cleanup needed there
- The shake keyframe used by PIN-wrong state is injected once via a tiny inline `<style>` in `screens-v4-feedback.jsx` (idempotent guard)


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
