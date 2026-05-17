// app.jsx — mounts mini-stock screens onto the design canvas
// with a Tweaks panel that drives global rendering variations.

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "chartStyle": "area",
  "rowLayout": "apple",
  "sortMode": "Manual",
  "privacy": false
}/*EDITMODE-END*/;

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  return (
    <DesignCanvas>
      {/* ── v4 · FEEDBACK closure ─────────────────────────────── */}
      <DCSection
        id="v4-feedback"
        title="v4 — FEEDBACK-v3.md closure"
        subtitle="P0 tokens + P1 missing artboards + P2 early deliverables. Closes every item the engineering review flagged."
      >
        {/* P0 */}
        <DCArtboard id="ios-acct-colors" label="P0-3 · Account color picker" width={390} height={980}>
          <div className="artboard-shadow"><IOSAccountColorPicker tweaks={t}/></div>
        </DCArtboard>

        {/* P1 */}
        <DCArtboard id="market-status-variants" label="P1-4 · MarketStatusStrip · 4 sessions" width={390} height={844}>
          <div className="artboard-shadow"><MarketStatusStripVariants tweaks={t}/></div>
        </DCArtboard>
        <DCArtboard id="ios-pin-idle" label="P1-5 · PIN entry · idle" width={390} height={980}>
          <div className="artboard-shadow"><IOSProfilePINEntryV2 tweaks={t} state="idle"/></div>
        </DCArtboard>
        <DCArtboard id="ios-pin-wrong" label="P1-5 · PIN entry · wrong (shake)" width={390} height={980}>
          <div className="artboard-shadow"><IOSProfilePINEntryV2 tweaks={t} state="wrong"/></div>
        </DCArtboard>
        <DCArtboard id="ios-pin-cooldown" label="P1-5 · PIN entry · cooldown" width={390} height={980}>
          <div className="artboard-shadow"><IOSProfilePINEntryV2 tweaks={t} state="cooldown"/></div>
        </DCArtboard>
        <DCArtboard id="ios-dash-collapsed" label="P1-6 · Dashboard · collapsed nav" width={390} height={1080}>
          <div className="artboard-shadow"><IOSDashboardCollapsed tweaks={t}/></div>
        </DCArtboard>
        <DCArtboard id="ios-port-overflow-v2" label="P1-7 · Portfolio overflow · reconciled" width={390} height={980}>
          <div className="artboard-shadow"><IOSPortfolioOverflowMenuV2 tweaks={t}/></div>
        </DCArtboard>
        <DCArtboard id="ios-trade-err" label="P1-8 · Trade · hard validation" width={390} height={980}>
          <div className="artboard-shadow"><IOSTradeSheetError tweaks={t}/></div>
        </DCArtboard>

        {/* P2 */}
        <DCArtboard id="mac-mkt-overview" label="P2-9 · Mac Market · Overview" width={1280} height={820}>
          <div className="artboard-mac-shadow"><MacMarketOverview tweaks={t}/></div>
        </DCArtboard>
        <DCArtboard id="mac-mkt-stocks" label="P2-9 · Mac Market · Stocks" width={1280} height={820}>
          <div className="artboard-mac-shadow"><MacMarketStocks tweaks={t}/></div>
        </DCArtboard>
        <DCArtboard id="mac-mkt-etf-page" label="P2-9 · Mac Market · ETF" width={1280} height={820}>
          <div className="artboard-mac-shadow"><MacMarketETF tweaks={t}/></div>
        </DCArtboard>
        <DCArtboard id="mac-mkt-news" label="P2-9 · Mac Market · News" width={1280} height={820}>
          <div className="artboard-mac-shadow"><MacMarketNews tweaks={t}/></div>
        </DCArtboard>
        <DCArtboard id="ios-sym-cost" label="P2-10 · Symbol · cost line + buy/sell" width={390} height={1480}>
          <div className="artboard-shadow"><IOSSymbolCostMarkers tweaks={t} sym="MSFT"/></div>
        </DCArtboard>
        <DCArtboard id="ios-trade-dup" label="P2-11 · Trade · duplicate detected" width={390} height={980}>
          <div className="artboard-shadow"><IOSTradeSheetDuplicate tweaks={t}/></div>
        </DCArtboard>
        <DCArtboard id="ios-trade-batch" label="P2-11 · Trade · batch entry" width={390} height={1280}>
          <div className="artboard-shadow"><IOSTradeSheetBatchEntry tweaks={t}/></div>
        </DCArtboard>
        <DCArtboard id="ios-event-earnings" label="P2-12 · Upcoming · Earnings detail" width={390} height={1280}>
          <div className="artboard-shadow"><IOSUpcomingEventDetail tweaks={t} kind="earnings"/></div>
        </DCArtboard>
        <DCArtboard id="ios-event-exdiv" label="P2-12 · Upcoming · Ex-Dividend detail" width={390} height={1280}>
          <div className="artboard-shadow"><IOSUpcomingEventDetail tweaks={t} kind="exdiv"/></div>
        </DCArtboard>
        <DCArtboard id="ios-onb-1" label="P2-13 · Onboarding 1 · Welcome" width={390} height={844}>
          <div className="artboard-shadow"><IOSOnboardingWelcome tweaks={t}/></div>
        </DCArtboard>
        <DCArtboard id="ios-onb-2" label="P2-13 · Onboarding 2 · Password" width={390} height={844}>
          <div className="artboard-shadow"><IOSOnboardingPassword tweaks={t}/></div>
        </DCArtboard>
        <DCArtboard id="ios-onb-3" label="P2-13 · Onboarding 3 · Start mode" width={390} height={844}>
          <div className="artboard-shadow"><IOSOnboardingImport tweaks={t}/></div>
        </DCArtboard>
        <DCArtboard id="ios-onb-4" label="P2-13 · Onboarding 4 · First profile" width={390} height={844}>
          <div className="artboard-shadow"><IOSOnboardingFirstProfile tweaks={t}/></div>
        </DCArtboard>
        <DCArtboard id="ios-onb-5" label="P2-13 · Onboarding 5 · Done" width={390} height={844}>
          <div className="artboard-shadow"><IOSOnboardingDone tweaks={t}/></div>
        </DCArtboard>
        <DCArtboard id="ios-privacy-l2" label="P2-14 · Privacy L2 · profile masked" width={390} height={1480}>
          <div className="artboard-shadow"><IOSPrivacyL2 tweaks={t}/></div>
        </DCArtboard>
      </DCSection>

      {/* ── Interactions + States (R-I1, R-I2, R-S1 cont.) ───── */}
      <DCSection
        id="interactions"
        title="Interactions & States (R-I1 / R-I2 / R-S1)"
        subtitle="Chart crosshair on iOS + Mac. Trade field states (focus / error / readonly). iOS numeric keypad. Remaining state overlays."
      >
        <DCArtboard id="ios-sym-scrub" label="iOS · Chart crosshair scrub" width={390} height={1080}>
          <div className="artboard-shadow"><IOSSymbolScrub tweaks={t} sym="MSFT"/></div>
        </DCArtboard>
        <DCArtboard id="mac-sym-hover" label="macOS · Chart hover" width={1280} height={820}>
          <div className="artboard-mac-shadow"><MacSymbolHover tweaks={t} sym="MSFT"/></div>
        </DCArtboard>
        <DCArtboard id="ios-trade-numpad" label="iOS · Trade · Quantity focused + numpad" width={390} height={940}>
          <div className="artboard-shadow"><IOSTradeNumpad tweaks={t}/></div>
        </DCArtboard>
        <DCArtboard id="ios-trade-error" label="iOS · Trade · Validation errors" width={390} height={844}>
          <div className="artboard-shadow"><IOSTradeError tweaks={t}/></div>
        </DCArtboard>
        <DCArtboard id="ios-state-loading-chart" label="State · Loading chart" width={390} height={844}>
          <div className="artboard-shadow"><IOSStateLoadingChart/></div>
        </DCArtboard>
        <DCArtboard id="ios-state-empty-acct" label="State · Empty accounts" width={390} height={844}>
          <div className="artboard-shadow"><IOSStateEmptyAccounts/></div>
        </DCArtboard>
        <DCArtboard id="ios-state-empty-trades" label="State · Empty trades" width={390} height={844}>
          <div className="artboard-shadow"><IOSStateEmptyTrades/></div>
        </DCArtboard>
        <DCArtboard id="ios-state-offline" label="State · Offline" width={390} height={844}>
          <div className="artboard-shadow"><IOSStateOffline/></div>
        </DCArtboard>
      </DCSection>

      {/* ── Flows: CSV import + Search palette ────────────────── */}
      <DCSection
        id="flows"
        title="Flows (R-SC2 / R-I5)"
        subtitle="4-step CSV import wizard. ⌘K command palette on Mac · full-screen search on iOS · grouped by Holdings / Watchlists / Market."
      >
        <DCArtboard id="ios-csv-pick" label="CSV · 1 · Pick file" width={390} height={900}>
          <div className="artboard-shadow"><IOSCSVImportPick tweaks={t}/></div>
        </DCArtboard>
        <DCArtboard id="ios-csv-map" label="CSV · 2 · Map columns" width={390} height={1180}>
          <div className="artboard-shadow"><IOSCSVImportMap tweaks={t}/></div>
        </DCArtboard>
        <DCArtboard id="ios-csv-review" label="CSV · 3 · Review" width={390} height={1020}>
          <div className="artboard-shadow"><IOSCSVImportReview tweaks={t}/></div>
        </DCArtboard>
        <DCArtboard id="ios-csv-done" label="CSV · 4 · Done" width={390} height={844}>
          <div className="artboard-shadow"><IOSCSVImportDone tweaks={t}/></div>
        </DCArtboard>
        <DCArtboard id="mac-search-palette" label="Mac · ⌘K palette" width={1280} height={820}>
          <div className="artboard-mac-shadow"><MacSearchPalette tweaks={t}/></div>
        </DCArtboard>
        <DCArtboard id="ios-search-full" label="iOS · Fullscreen search" width={390} height={980}>
          <div className="artboard-shadow"><IOSSearchFullscreen tweaks={t}/></div>
        </DCArtboard>
      </DCSection>

      {/* ── Gesture / motion (R-I3 / R-I4) ─────────────────────── */}
      <DCSection
        id="gestures"
        title="Gestures & motion (R-I3 / R-I4)"
        subtitle="Large-title collapse · swipe-actions · long-press context menu · pull-to-refresh. Each artboard freezes one keyframe with its spec sheet."
      >
        <DCArtboard id="ios-home-collapsed" label="Home · large-title collapsed (frame 2)" width={390} height={1080}>
          <div className="artboard-shadow"><IOSHomeCollapsed tweaks={t}/></div>
        </DCArtboard>
        <DCArtboard id="ios-watch-collapsed" label="Watchlist · large-title collapsed" width={390} height={1080}>
          <div className="artboard-shadow"><IOSWatchlistCollapsed tweaks={t}/></div>
        </DCArtboard>
        <DCArtboard id="ios-acct-collapsed" label="Portfolio · large-title collapsed" width={390} height={1080}>
          <div className="artboard-shadow"><IOSAccountsCollapsed tweaks={t}/></div>
        </DCArtboard>
        <DCArtboard id="ios-swipe" label="Watchlist · row mid-swipe" width={390} height={844}>
          <div className="artboard-shadow"><IOSWatchlistSwipeAction tweaks={t}/></div>
        </DCArtboard>
        <DCArtboard id="ios-longpress" label="Watchlist · long-press menu" width={390} height={1020}>
          <div className="artboard-shadow"><IOSWatchlistLongPress tweaks={t}/></div>
        </DCArtboard>
        <DCArtboard id="ios-pull-refresh" label="Dashboard · pull-to-refresh" width={390} height={980}>
          <div className="artboard-shadow"><IOSDashboardPullRefresh tweaks={t}/></div>
        </DCArtboard>
      </DCSection>

      {/* ── Profiles (R-P0..P7) ───────────────────────────────── */}
      <DCSection
        id="profiles"
        title="Multi-profile system (R-P0..P7)"
        subtitle="One operator manages multiple family profiles. Each profile owns its accounts/holdings. Distinct accent color → pre-attentive context. Mutations always profile-attributed."
      >
        <DCArtboard id="mac-profile-chrome" label="Mac · 3 dashboards (R-P2 chrome)" width={1280} height={820}>
          <div className="artboard-mac-shadow"><MacDashboardProfileChrome tweaks={t}/></div>
        </DCArtboard>
        <DCArtboard id="ios-profile-switcher" label="iOS · Profile switcher sheet" width={390} height={980}>
          <div className="artboard-shadow"><IOSProfileSwitcherSheet tweaks={t}/></div>
        </DCArtboard>
        <DCArtboard id="mac-profile-switcher" label="Mac · Sidebar popover" width={1280} height={820}>
          <div className="artboard-mac-shadow"><MacProfileSwitcher tweaks={t}/></div>
        </DCArtboard>
        <DCArtboard id="ios-all-profiles" label="iOS · All profiles (household)" width={390} height={1700}>
          <div className="artboard-shadow"><IOSDashboardAllProfiles tweaks={t}/></div>
        </DCArtboard>
        <DCArtboard id="ios-trade-profile" label="iOS · Trade sheet for Mom" width={390} height={900}>
          <div className="artboard-shadow"><IOSTradeSheetProfileHeader tweaks={t}/></div>
        </DCArtboard>
        <DCArtboard id="ios-delete-confirm" label="iOS · Delete confirm (profile-attributed)" width={390} height={844}>
          <div className="artboard-shadow"><IOSDeleteTransactionConfirm tweaks={t}/></div>
        </DCArtboard>
        <DCArtboard id="ios-profiles-list" label="iOS · Settings · Profiles list" width={390} height={980}>
          <div className="artboard-shadow"><IOSSettingsProfilesList tweaks={t}/></div>
        </DCArtboard>
        <DCArtboard id="ios-profile-editor" label="iOS · Profile editor" width={390} height={1320}>
          <div className="artboard-shadow"><IOSProfileEditor tweaks={t}/></div>
        </DCArtboard>
        <DCArtboard id="ios-add-profile" label="iOS · Add profile sheet" width={390} height={1080}>
          <div className="artboard-shadow"><IOSAddProfileSheet tweaks={t}/></div>
        </DCArtboard>
        <DCArtboard id="ios-pin-entry" label="iOS · PIN entry" width={390} height={844}>
          <div className="artboard-shadow"><IOSProfilePINEntry tweaks={t}/></div>
        </DCArtboard>
        <DCArtboard id="ios-pin-setup" label="iOS · PIN setup (in editor)" width={390} height={980}>
          <div className="artboard-shadow"><IOSProfilePINSetup tweaks={t}/></div>
        </DCArtboard>
        <DCArtboard id="ios-statusbar-chip" label="iOS · Status-bar chip · 3 states" width={390} height={844}>
          <div className="artboard-shadow"><IOSStatusBarProfileChip tweaks={t}/></div>
        </DCArtboard>
        <DCArtboard id="ios-acct-switch-warn" label="iOS · Profile-switch warning" width={390} height={844}>
          <div className="artboard-shadow"><IOSAccountSwitchWarning tweaks={t}/></div>
        </DCArtboard>
        <DCArtboard id="ios-trade-from-sym" label="iOS · Trade sheet (from Symbol)" width={390} height={980}>
          <div className="artboard-shadow"><IOSTradeSheetFromSymbol tweaks={t}/></div>
        </DCArtboard>
        <DCArtboard id="mac-switch-transition" label="Mac · Profile-switch transition" width={1280} height={820}>
          <div className="artboard-mac-shadow"><MacProfileSwitchTransition tweaks={t}/></div>
        </DCArtboard>
        <DCArtboard id="mac-all-profiles" label="Mac · Home · All profiles (household)" width={1280} height={900}>
          <div className="artboard-mac-shadow"><MacDashboardAllProfiles tweaks={t}/></div>
        </DCArtboard>
        <DCArtboard id="mac-sym-all-profiles" label="Mac · AAPL · per-profile breakdown" width={1280} height={900}>
          <div className="artboard-mac-shadow"><MacSymbolDetailAllProfiles tweaks={t} sym="AAPL"/></div>
        </DCArtboard>
      </DCSection>

      {/* ── Responsive (R-SC5) + a11y (R-A2) ──────────────────── */}
      <DCSection
        id="responsive"
        title="Responsive · Accessibility (R-SC5 / R-A2)"
        subtitle="iPad mid-tier (1024×768) keeps the iOS TabBar but reflows to 2 columns. Mac at <1024 collapses sidebar to a 64px rail. Keyboard focus uses the global mint outline."
      >
        <DCArtboard id="ipad-dash" label="iPad · Home" width={1024} height={1366}>
          <div className="artboard-shadow" style={{ borderRadius: 28 }}>
            <IPadDashboard tweaks={t}/>
          </div>
        </DCArtboard>
        <DCArtboard id="mac-watch-compact" label="Mac · Watchlist compact (900px)" width={900} height={700}>
          <div className="artboard-mac-shadow"><MacWatchlistCompact tweaks={t}/></div>
        </DCArtboard>
        <DCArtboard id="mac-watch-kbfocus" label="Mac · Watchlist · keyboard focus" width={1280} height={820}>
          <div className="artboard-mac-shadow"><MacWatchlistKeyboardFocus tweaks={t}/></div>
        </DCArtboard>
      </DCSection>

      {/* ── Home v2 — Consolidated (Yahoo-style) ──────────────── */}
      <DCSection
        id="home-v2"
        title="Home — Consolidated (v2)"
        subtitle="Watchlist + Accounts merged into a single rich Home tab. Unified row style across owned & watched. 4-tab IA, no FAB."
      >
        <DCArtboard id="ios-home-v2" label="iOS · Home (full scroll)" width={390} height={1820}>
          <div className="artboard-shadow"><IOSHomeV2 tweaks={t}/></div>
        </DCArtboard>
        <DCArtboard id="mac-home-v2" label="macOS · Home" width={1280} height={820}>
          <div className="artboard-mac-shadow"><MacHomeV2 tweaks={t}/></div>
        </DCArtboard>
      </DCSection>

      {/* ── Portfolio v2 — Fidelity-style ─────────────────────── */}
      <DCSection
        id="portfolio-v2"
        title="Portfolio — Fidelity-style (v2)"
        subtitle="4 sub-tabs · grouped by account with left-edge color stripes · dense positions table · Trade from context, not a global FAB."
      >
        <DCArtboard id="ios-port-summary" label="iOS · Portfolio · Summary" width={390} height={1480}>
          <div className="artboard-shadow"><IOSPortfolioSummary tweaks={t}/></div>
        </DCArtboard>
        <DCArtboard id="ios-port-v2" label="iOS · Portfolio · Positions" width={390} height={1280}>
          <div className="artboard-shadow"><IOSPortfolio tweaks={t}/></div>
        </DCArtboard>
        <DCArtboard id="ios-port-activity" label="iOS · Portfolio · Activity" width={390} height={1280}>
          <div className="artboard-shadow"><IOSPortfolioActivity tweaks={t}/></div>
        </DCArtboard>
        <DCArtboard id="ios-port-balances" label="iOS · Portfolio · Balances" width={390} height={1080}>
          <div className="artboard-shadow"><IOSPortfolioBalances tweaks={t}/></div>
        </DCArtboard>
        <DCArtboard id="ios-acct-selector" label="iOS · Account selector sheet" width={390} height={844}>
          <div className="artboard-shadow"><IOSAccountSelectorSheet tweaks={t}/></div>
        </DCArtboard>
        <DCArtboard id="ios-port-overflow" label="iOS · Portfolio overflow menu" width={390} height={844}>
          <div className="artboard-shadow"><IOSPortfolioOverflowMenu tweaks={t}/></div>
        </DCArtboard>
        <DCArtboard id="mac-port-summary" label="macOS · Portfolio · Summary" width={1280} height={900}>
          <div className="artboard-mac-shadow"><MacPortfolioSummary tweaks={t}/></div>
        </DCArtboard>
        <DCArtboard id="mac-port-v2" label="macOS · Portfolio · Positions" width={1280} height={820}>
          <div className="artboard-mac-shadow"><MacPortfolio tweaks={t}/></div>
        </DCArtboard>
        <DCArtboard id="mac-port-activity" label="macOS · Portfolio · Activity" width={1280} height={900}>
          <div className="artboard-mac-shadow"><MacPortfolioActivity tweaks={t}/></div>
        </DCArtboard>
        <DCArtboard id="mac-port-balances" label="macOS · Portfolio · Balances" width={1280} height={820}>
          <div className="artboard-mac-shadow"><MacPortfolioBalances tweaks={t}/></div>
        </DCArtboard>
      </DCSection>

      {/* ── Market v2 — Yahoo-style ───────────────────────────── */}
      <DCSection
        id="market-v2"
        title="Market — Yahoo-style (v2)"
        subtitle="New tab: index list + multi-line normalized comparison chart + Trending / Most Active sections. Profile-agnostic."
      >
        <DCArtboard id="ios-mkt-v2" label="iOS · Market · Overview" width={390} height={1820}>
          <div className="artboard-shadow"><IOSMarket tweaks={t}/></div>
        </DCArtboard>
        <DCArtboard id="ios-mkt-trending" label="iOS · Market · Stocks · Trending" width={390} height={1480}>
          <div className="artboard-shadow"><IOSMarketTrending tweaks={t}/></div>
        </DCArtboard>
        <DCArtboard id="ios-mkt-etf" label="iOS · Market · ETF" width={390} height={1480}>
          <div className="artboard-shadow"><IOSMarketETF tweaks={t}/></div>
        </DCArtboard>
        <DCArtboard id="ios-mkt-news" label="iOS · Market · News" width={390} height={1480}>
          <div className="artboard-shadow"><IOSMarketNews tweaks={t}/></div>
        </DCArtboard>
        <DCArtboard id="mac-mkt-v2" label="macOS · Market · Overview" width={1280} height={820}>
          <div className="artboard-mac-shadow"><MacMarket tweaks={t}/></div>
        </DCArtboard>
        <DCArtboard id="mac-mkt-heatmap" label="macOS · Market · Sectors heatmap" width={1280} height={820}>
          <div className="artboard-mac-shadow"><MacMarketSectorsHeatmap tweaks={t}/></div>
        </DCArtboard>
      </DCSection>

      {/* ── Symbol detail v2 — sticky Trade CTA ───────────────── */}
      <DCSection
        id="symbol-v2"
        title="Symbol detail (v2)"
        subtitle="Overview sub-tab · stat grid · My Position · Purchase history · About · News · sticky bottom Trade CTA with account picker."
      >
        <DCArtboard id="ios-sym-v2" label="iOS · MSFT" width={390} height={1480}>
          <div className="artboard-shadow"><IOSSymbolV2 tweaks={t} sym="MSFT"/></div>
        </DCArtboard>
      </DCSection>

      {/* ── Me tab + State overlays ───────────────────────────── */}
      <DCSection
        id="me-states"
        title="Me tab + States"
        subtitle="Settings rebranded as “Me”. State overlays per R-S1 — loading shimmer, empty, error/offline banner."
      >
        <DCArtboard id="ios-me" label="iOS · Me" width={390} height={1080}>
          <div className="artboard-shadow"><IOSMe tweaks={t}/></div>
        </DCArtboard>
        <DCArtboard id="ios-state-loading" label="State · Loading" width={390} height={844}>
          <div className="artboard-shadow"><IOSStateLoading/></div>
        </DCArtboard>
        <DCArtboard id="ios-state-empty" label="State · Empty watchlist" width={390} height={844}>
          <div className="artboard-shadow"><IOSStateEmpty/></div>
        </DCArtboard>
        <DCArtboard id="ios-state-error" label="State · Quotes stale / offline" width={390} height={844}>
          <div className="artboard-shadow"><IOSStateError/></div>
        </DCArtboard>
      </DCSection>

      {/* ── iOS Section ───────────────────────────────────────────── */}
      <DCSection
        id="ios"
        title="iOS · iPhone (v1, prior screens)"
        subtitle="Apple-Stocks dark mode + mini-mint accent. 390 × 844pt."
      >
        <DCArtboard id="ios-dash" label="Dashboard" width={390} height={844}>
          <div className="artboard-shadow"><IOSDashboard tweaks={t}/></div>
        </DCArtboard>
        <DCArtboard id="ios-watch" label="Watchlist" width={390} height={844}>
          <div className="artboard-shadow"><IOSWatchlist tweaks={t}/></div>
        </DCArtboard>
        <DCArtboard id="ios-account" label="Accounts (Yahoo-style)" width={390} height={844}>
          <div className="artboard-shadow"><IOSAccount tweaks={t}/></div>
        </DCArtboard>
        <DCArtboard id="ios-sym" label="Symbol · MSFT" width={390} height={844}>
          <div className="artboard-shadow"><IOSSymbol tweaks={t} sym="MSFT"/></div>
        </DCArtboard>
        <DCArtboard id="ios-trade" label="Trade Sheet" width={390} height={844}>
          <div className="artboard-shadow"><IOSTrade tweaks={t}/></div>
        </DCArtboard>
      </DCSection>

      {/* ── Sheets & Menus — unified surface language ──────────────── */}
      <DCSection
        id="surfaces"
        title="Sheets & Menus"
        subtitle="Unified popover, sheet, picker — same buttons, dividers, destructive styling across every screen."
      >
        <DCArtboard id="surf-ctx" label="Watchlist menu (Apple-style)" width={390} height={844}>
          <div className="artboard-shadow"><IOSContextMenu tweaks={t}/></div>
        </DCArtboard>
        <DCArtboard id="surf-port" label="Portfolio menu (Yahoo-style)" width={390} height={844}>
          <div className="artboard-shadow"><IOSPortfolioMenu tweaks={t}/></div>
        </DCArtboard>
        <DCArtboard id="surf-sort" label="Sort picker" width={390} height={844}>
          <div className="artboard-shadow"><IOSSortSheet tweaks={t}/></div>
        </DCArtboard>
        <DCArtboard id="surf-set" label="Settings sheet" width={390} height={844}>
          <div className="artboard-shadow"><IOSSettings tweaks={t}/></div>
        </DCArtboard>
      </DCSection>

      {/* ── macOS Section ────────────────────────────────────────── */}
      <DCSection
        id="mac"
        title="macOS · Desktop"
        subtitle="Sidebar + main pane. Same data, denser layout. 1280 × 820."
      >
        <DCArtboard id="mac-dash" label="Dashboard" width={1280} height={820}>
          <div className="artboard-mac-shadow"><MacDashboard tweaks={t}/></div>
        </DCArtboard>
        <DCArtboard id="mac-watch" label="Watchlist" width={1280} height={820}>
          <div className="artboard-mac-shadow"><MacWatchlist tweaks={t}/></div>
        </DCArtboard>
        <DCArtboard id="mac-account" label="Accounts" width={1280} height={1180}>
          <div className="artboard-mac-shadow"><MacAccount tweaks={t}/></div>
        </DCArtboard>
        <DCArtboard id="mac-sym" label="Symbol · MSFT" width={1280} height={820}>
          <div className="artboard-mac-shadow"><MacSymbol tweaks={t} sym="MSFT"/></div>
        </DCArtboard>
        <DCArtboard id="mac-trade" label="Trade Modal" width={1280} height={820}>
          <div className="artboard-mac-shadow"><MacTrade tweaks={t}/></div>
        </DCArtboard>
      </DCSection>

      {/* Tweaks panel — controls the variations the user asked for */}
      <TweaksPanel title="Tweaks">
        <TweakSection label="Chart"/>
        <TweakRadio label="Chart style" value={t.chartStyle}
                    options={['area','line','candle']}
                    onChange={(v) => setTweak('chartStyle', v)}/>

        <TweakSection label="Watchlist"/>
        <TweakRadio label="Row layout" value={t.rowLayout}
                    options={['apple','yahoo']}
                    onChange={(v) => setTweak('rowLayout', v)}/>
        <TweakSelect label="Sort by" value={t.sortMode}
                     options={['Manual','Price Change','Percentage Change','Market Cap','Symbol']}
                     onChange={(v) => setTweak('sortMode', v)}/>

        <TweakSection label="Display"/>
        <TweakToggle label="Privacy mode" value={t.privacy}
                     onChange={(v) => setTweak('privacy', v)}/>
      </TweaksPanel>
    </DesignCanvas>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
