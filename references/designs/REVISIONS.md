# REVISIONS — mini-stock design v1 → v2

## meta
- input_dir: `references/designs/`
- baseline_files: `app.jsx`, `components.jsx`, `surfaces.jsx`, `data.jsx`, `screens-ios.jsx`, `screens-mac.jsx`, `design-spec.html`, `index.html`
- output_format: same file structure; edit in place; produce a `CHANGELOG.md` listing every modified file:line range
- tweaks_panel: keep existing 4 tweaks; add new tweaks per item below (each item lists `tweaks_panel_add`)
- token_naming: keep `--*` CSS vars; do not rename; only adjust values or add new vars
- canvas_artboards_required: every new screen/state listed below must be a real `DCArtboard` in `app.jsx` (mounted, not only spec text)
- success_criteria: a developer can implement Next.js + Tailwind v4 + shadcn/ui without making any unstated design decisions

---

## tokens

### R-T0 (P0, BLOCKER) — token export contract (must land before any other R-T*)
- rationale
  - the v1 token format is incompatible with the engineering stack (Next.js 15 + Tailwind v4 + shadcn/ui). without fixing the contract first, every other token revision will be silently rounded or broken at integration time. this item is a hard prerequisite for R-T1, R-T2, R-T3, R-T4 and every screen revision.
- locus
  - `design-spec.html:325-349` token tables — currently hex strings
  - `index.html:7` references `styles.css` — **file does not exist**; `.tnum` class referenced 113× across `screens-*.jsx` is therefore a no-op
  - `components.jsx:26, 76` — `Math.random()` used for SVG gradient IDs (SSR-unsafe)
  - all `style={{ fontSize: 10.5 | 11.5 | 12.5 | 13.5 | 14.5 }}` occurrences in `screens-*.jsx` (~40 sites) — half-point sizes have no semantic name

#### R-T0.a — color tokens must be RGB triples, not hex
- problem
  - hex format breaks Tailwind v4 opacity modifier syntax (`bg-up/40`). Tailwind's `<alpha-value>` expansion requires `rgb(R G B / α)` where R/G/B are space-separated channels, not a packed hex.
  - same constraint applies to shadcn/ui's color system.
- required_changes
  - rewrite every color token in this exact format (channels only, no `rgb()` wrapper, no commas):
    ```css
    :root {
      /* surfaces */
      --bg:              7   7   10;
      --bg-elev:         17  17  24;
      --surface-1:       27  27  35;
      --surface-2:       38  38  48;
      --surface-3:       51  51  63;

      /* text */
      --text:            255 255 255;
      --text-2:          235 235 245;   /* consumed at .62 alpha */
      --text-3:          235 235 245;   /* consumed at .38 alpha */

      /* brand */
      --mint:            107 232 184;
      --mint-2:          61  217 160;

      /* semantic */
      --up:              52  211 153;
      --down:            251 113 133;

      /* section accents (R-T3) */
      --sec-portfolio:   107 232 184;
      --sec-watchlist:   122 182 255;
      --sec-symbol:      201 182 255;
      --sec-activity:    255 193 118;

      /* separators consumed with alpha */
      --separator-alpha:        0.10;
      --separator-strong-alpha: 0.14;
    }
    ```
  - consumption pattern (mandatory; document in spec):
    - CSS: `color: rgb(var(--text));` · `background: rgb(var(--surface-1));` · `color: rgb(var(--text-2) / 0.62);`
    - Tailwind: `text-text` · `bg-surface-1` · `text-text-2/[0.62]` · `bg-up/20`
  - `--up-bg`, `--down-bg`, `--mint-soft` MAY be kept as semantic aliases for hot paths (BUY/SELL pills), but their values MUST be expressed as `rgb(var(--up) / 0.18)` etc., not hardcoded.

#### R-T0.b — half-point font sizes named & codified
- problem
  - design uses 10.5 / 11.5 / 12.5 / 13.5 / 14.5 px throughout. these don't exist in Tailwind's default scale (12/14/16/18...). dev choices: round to nearest (drift) or use `text-[13.5px]` arbitrary everywhere (no semantics, easy to typo).
- required_changes
  - define type scale by **role**, not by size, so dev cannot pick a wrong size for a given role:
    ```css
    :root {
      /* role → size / line-height / weight defaults */
      --t-meta:        10.5px;   /* uppercase metadata, table headers */
      --t-caption:     11px;     /* secondary captions */
      --t-eyebrow:     11.5px;   /* section eyebrow labels */
      --t-aux:         12px;     /* sublabels, footer text */
      --t-stat:        13px;     /* StatTile value */
      --t-stat-mac:    14.5px;   /* StatTile value on mac (denser) */
      --t-body:        13.5px;   /* default body, list-row primary */
      --t-row:         14px;     /* table row body */
      --t-base:        15px;     /* form field value */
      --t-row-strong:  16px;     /* StockRow symbol */
      --t-row-strong-2: 17px;    /* nav title, dashboard row price */
      --t-h-sub:       18px;
      --t-h:           22px;     /* small hero, broker total */
      --t-h-2:         26px;     /* symbol detail header */
      --t-h-3:         28px;
      --t-display:     32px;
      --t-display-2:   34px;     /* iOS large title */
      --t-display-3:   40px;     /* symbol price ios */
      --t-display-4:   42px;     /* symbol price mac */
      --t-display-5:   46px;     /* dashboard net worth mac */
    }
    ```
  - Tailwind exposes via `@theme inline`:
    ```css
    @theme inline {
      --text-meta:        var(--t-meta);
      --text-eyebrow:     var(--t-eyebrow);
      --text-stat:        var(--t-stat);
      --text-row:         var(--t-row);
      /* …one entry per role… */
    }
    ```
    → generates utilities `text-meta`, `text-eyebrow`, `text-stat`, `text-row`, ...
  - **forbidden**: `text-[13.5px]`, `text-sm` (14), `text-xs` (12) — none may appear in app code. ESLint rule enforced.
  - `design-spec.html` must publish a single table mapping `role → token → px → designed usage examples` so designer and dev share one source of truth.

#### R-T0.c — letter-spacing & font-weight roles
- required_changes
  ```css
  :root {
    --tracking-display:  -0.025em;   /* ≥32px headlines, net worth */
    --tracking-title:    -0.022em;   /* 26-30px titles */
    --tracking-tight:    -0.01em;    /* 18-22px */
    --tracking-normal:    0;
    --tracking-data:      0.01em;    /* mono digits within rows */
    --tracking-caption:   0.04em;    /* uppercase metadata */
    --tracking-eyebrow:   0.06em;    /* uppercase eyebrows */
    --tracking-meta:      0.08em;    /* sector eyebrows */

    --weight-regular: 400;
    --weight-medium:  500;
    --weight-semi:    600;
    --weight-bold:    700;
    --weight-black:   800;   /* maps to Inter 750 on non-Apple — see R-T0.e */
  }
  ```
  - Tailwind: `tracking-display`, `tracking-title`, … generated via `@theme inline`.
  - rule: dev MAY NOT inline `letterSpacing: '-0.025em'` — must use `tracking-display`.

#### R-T0.d — required `styles.css` minimum set (currently missing)
- problem
  - `.tnum` class is used 113× but never defined. all "tabular numbers" claims in the spec are not actually enforced in the canvas. SF Pro and Inter both default to proportional figures unless explicitly opted in.
- required_changes — designer ships a real `references/designs/styles.css` containing at minimum:
  ```css
  :root { /* all R-T0.a/b/c tokens here */ }

  html, body {
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text",
                 "Inter Variable", "Inter", system-ui, sans-serif;
    font-synthesis-weight: none;            /* avoid faux-bold on Inter fallback */
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    background: rgb(var(--bg));
    color: rgb(var(--text));
  }

  /* tabular numbers — must be opted in explicitly */
  .tnum, .tabular {
    font-variant-numeric: tabular-nums;
    font-feature-settings: "tnum" 1, "cv11" 1;   /* cv11 = single-story 4 (SF/Inter parity) */
  }

  /* role-based type utilities (mirror @theme inline) */
  .t-meta     { font-size: var(--t-meta);    letter-spacing: var(--tracking-caption); text-transform: uppercase; font-weight: var(--weight-semi);    color: rgb(var(--text-3) / 0.38); }
  .t-eyebrow  { font-size: var(--t-eyebrow); letter-spacing: var(--tracking-eyebrow); text-transform: uppercase; font-weight: var(--weight-bold);    }
  .t-stat     { font-size: var(--t-stat);    font-weight: var(--weight-bold);    }
  .t-row      { font-size: var(--t-row);     font-weight: var(--weight-semi);    }
  .t-display  { font-size: var(--t-display); letter-spacing: var(--tracking-display); font-weight: var(--weight-black); }
  /* …one rule per --t-* role */

  /* privacy mode masking — replaces R-A1 visual + sr-only */
  .masked { color: transparent; background: rgb(var(--text-3) / 0.18); border-radius: 3px; }
  .masked[aria-hidden="true"] { user-select: none; }
  .sr-only {
    position: absolute; width: 1px; height: 1px;
    padding: 0; margin: -1px; overflow: hidden;
    clip: rect(0,0,0,0); white-space: nowrap; border: 0;
  }

  /* hairline material (R-T1) */
  .hairline-top    { box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.045); }
  .hairline-bottom { box-shadow: inset 0 -1px 0 rgb(0 0 0 / 0.35); }
  ```
- designer responsibility: every `style={{ fontSize, letterSpacing, fontWeight, color, background }}` currently inlined in `screens-*.jsx` MUST be replaced by the corresponding `.t-*` class or `var(--...)` reference. no raw numeric typography literals remain after v2.

#### R-T0.e — Inter Variable web font supply (non-Apple parity)
- problem
  - Apple does not license SF Pro for web distribution. Without a self-hosted fallback font, non-Apple users land on system-ui (Roboto/Segoe/etc) — visible drift in width, weight, and digit shape.
  - Inter at `weight: 800` is visibly heavier/wider than SF Pro Display 800 at large sizes — large numbers will look chunky on Chromium/Windows.
- required_changes
  - self-host `Inter Variable` (`InterVariable.woff2`, latin subset) at `/public/fonts/InterVariable.woff2` (engineering will wire; designer just declares the contract):
    ```css
    @font-face {
      font-family: "Inter Variable";
      src: url("/fonts/InterVariable.woff2") format("woff2-variations");
      font-weight: 100 900;
      font-style: normal;
      font-display: swap;
    }
    ```
  - on non-Apple platforms, large display sizes (≥`--t-display`) ramp `font-weight` from `800` → `750` to compensate Inter's heavier optical body:
    ```css
    @supports not (font: -apple-system-body) {
      .t-display,
      .t-display-2,
      .t-display-3,
      .t-display-4,
      .t-display-5 { font-weight: 750; }
    }
    ```
  - Inter Variable's optical-size axis (`opsz`) bound to size (engineering wires `font-variation-settings: "opsz" var(--t-current)` per role); designer just guarantees `--t-*` tokens are pure pixel numbers.

#### R-T0.f — SVG IDs must be stable (SSR-safe)
- problem
  - `components.jsx:26` `const gradId = 'spk-' + ... + Math.round(Math.random() * 1e9);` and `components.jsx:76` same pattern. Under Next.js App Router with React 18, server and client produce different IDs → hydration mismatch warning + potentially missing gradients.
- required_changes
  - replace with `React.useId()` (designer can leave as `Math.random()` in the design canvas if needed for inline preview, but spec MUST mandate the engineering pattern):
    ```jsx
    function Sparkline({ data, up, ... }) {
      const reactId = React.useId();
      const gradId = `spk-${reactId}`;
      // ...
    }
    ```
  - alternative acceptable pattern (when used inside a known-unique render context): deterministic ID from inputs, e.g. `spk-${sym}-${up ? 'u' : 'd'}-${rangeKey}`.
  - `design-spec.html` § "Components" must publish this rule under `Sparkline` and `PriceChart` definitions.

#### R-T0.g — engineering enforcement rules (codify in spec, dev wires lint)
- `design-spec.html` adds a § "Engineering Contract" listing the following lint rules; designer NEED NOT implement them, but spec must list them so engineering wires them at scaffold time:

  | rule | target | rationale |
  |---|---|---|
  | `no-restricted-syntax` on `style.fontSize\|color\|backgroundColor\|padding\|margin\|gap\|letterSpacing\|fontWeight` | `.tsx` files | force token-based utilities; no inline numeric literals |
  | Tailwind `safelist: false` for arbitrary values matching `text-\[.+px\]`, `tracking-\[.+\]`, `bg-\[#.+\]` | tailwind config | block ad-hoc "近似" values |
  | stylelint `color-no-hex` + `color-named: never` | `.css` | tokens only; no raw colors outside `styles.css` |
  | stylelint `unit-allowed-list: ['px','rem','em','%','vh','vw','deg','ms','s']` excluding hex | `.css` | catch typos |
  | a custom rule: ban `Math.random` in `components/`, allow only in `app/` and `lib/random` | `.tsx` | catch SSR-unsafe IDs |
  | typography-only utilities allowlist: only `text-meta\|caption\|eyebrow\|aux\|stat\|stat-mac\|body\|row\|base\|row-strong\|row-strong-2\|h-sub\|h\|h-2\|h-3\|display\|display-2\|display-3\|display-4\|display-5` accepted on `class` | tailwind plugin | force role-based type usage |

#### R-T0.h — known-incompatible items (accept as limitations, document in spec)
- iOS **continuous corner (squircle)**: CSS `border-radius` is quarter-circle. Web has no native superellipse. Visual diff is negligible ≤16px, noticeable at 22+px. Spec must publish a note: "border radii ≥20px use standard rounded corners on web; acceptable drift documented here."
- **dynamic system colors** (Apple's accent that changes with user setting): static tokens only on web; spec notes "system-blue rendered as our `rgb(var(--mint))` brand accent regardless of user OS setting."
- **iOS haptics** (`navigator.vibrate`): silently no-op on iOS Safari; works on Android Chrome. Spec notes "haptic spec is aspirational; iOS PWA gets no haptic feedback today."

#### R-T0 deliverables (designer must produce in v2)
- [ ] `references/designs/styles.css` NEW — full token block (R-T0.a/b/c), `.tnum`/`.tabular`, `.t-*` role classes, `.masked`/`.sr-only`, `.hairline-*`, `@font-face` Inter Variable declaration
- [ ] `design-spec.html` § "Tokens" rewritten: every value as RGB-triple; published one consumption pattern (`rgb(var(--tok))` and `rgb(var(--tok) / α)`) and one Tailwind pattern (`@theme inline` mapping)
- [ ] `design-spec.html` § "Typography" rewritten: published `role → token → px` table for all `--t-*`; published `tracking-*` table; published Inter weight ramp rule (R-T0.e)
- [ ] `design-spec.html` § NEW "Engineering Contract" — copy R-T0.g table verbatim
- [ ] `design-spec.html` § "Components → Sparkline / PriceChart" updated with SSR-safe ID pattern (R-T0.f)
- [ ] `components.jsx` updated: `Math.random()` → `React.useId()` in both gradient sites
- [ ] all `screens-*.jsx` updated: every inline `style={{ fontSize: N }}` → `className="t-{role}"`; every inline `letterSpacing` → `className="tracking-{role}"`; every inline color literal → `style={{ color: 'rgb(var(--tok))' }}` (or `className="text-{tok}"` after `@theme` lands)
- [ ] every `<span className="tnum">` and inline-styled tnum-bearing element verified to actually inherit `font-variant-numeric: tabular-nums` once `styles.css` is loaded

### R-T1 (P0) — surface ladder too compressed, neutral-only, no depth
- locus
  - `design-spec.html:325-330` token table
  - all `var(--bg|--bg-elev|--surface-1|--surface-2|--surface-3)` usages across `screens-*.jsx`
- current_values
  - `--bg #0A0A0C` · `--bg-elev #101015` · `--surface-1 #16161B` · `--surface-2 #1F1F26` · `--surface-3 #2A2A33` · `--separator rgba(255,255,255,.07)`
  - L* delta bg→surface-1 ≈ 3.5 (perceptually flat). Hue is pure neutral. No hairline on cards. Result: whole screen reads as one black slab with barely-visible darker/lighter blocks.
- required_changes
  - replace 5-step ladder with values below; keep semantic mapping but widen perceptual deltas and add subtle cool tint (hue 240, ~6% saturation) so surfaces feel "stacked" not "painted on":
    ```
    --bg              #07070A      /* slightly inkier */
    --bg-elev         #111118      /* sidebar / nav strip */
    --surface-1       #1B1B23      /* default card  */
    --surface-2       #262630      /* field / chip / segmented track */
    --surface-3       #33333F      /* active segmented / hover */
    --surface-tint    rgba(122,134,255,0.04)   /* added on top of surface-1 to nudge cool */
    --separator       rgba(255,255,255,0.10)   /* hairline; raise from .07 */
    --separator-strong rgba(255,255,255,0.14)  /* group dividers */
    --hairline-top    inset 0 1px 0 rgba(255,255,255,0.045)   /* "lit from above" */
    --hairline-bottom inset 0 -1px 0 rgba(0,0,0,0.35)         /* depression edge for input fields */
    ```
  - every default card (radius ≥ 12) MUST apply `box-shadow: var(--hairline-top);` — gives every block a 1px lit edge without using diffused shadow.
  - apply `--surface-tint` as a second `background-image: linear-gradient(var(--surface-tint), var(--surface-tint))` layer on `--surface-1` cards only (keeps macro hue neutral, micro hue cool).
- contrast_proof_required
  - re-run AA contrast for `--text` `--text-2` `--text-3` against new `--surface-1 #1B1B23`; spec § Accessibility must list new ratios.
- migration_note
  - keep token names; only swap values. No screen JSX rename needed.

### R-T2 (P0) — hero cards need ambient gradient, not flat fill
- locus
  - `screens-ios.jsx:107-150` (Dashboard NetWorthCard area), `screens-ios.jsx:319-368` (Symbol hero), `screens-mac.jsx:98-200` (Mac Dashboard hero), `screens-mac.jsx:528-565` (Mac Symbol hero)
- problem
  - hero blocks use the same `--surface-1` flat fill as data tables. Most important block visually competes with secondary cards.
- required_changes
  - introduce `--hero-grad-up` / `--hero-grad-down` per-direction gradients applied to the top ~40% of hero cards:
    ```
    --hero-grad-up:    radial-gradient(120% 80% at 0% 0%, rgba(52,211,153,0.10) 0%, transparent 60%);
    --hero-grad-down:  radial-gradient(120% 80% at 0% 0%, rgba(251,113,133,0.10) 0%, transparent 60%);
    --hero-grad-neutral: radial-gradient(120% 80% at 0% 0%, rgba(122,134,255,0.08) 0%, transparent 60%);
    ```
  - direction chosen by today's net P/L sign (up/down/neutral). Layered on top of `--surface-1`.
  - hero cards: NetWorthCard (Dashboard), Symbol price hero, Account broker-card header strip, Trade Sheet "Estimated Total" card.
- tweaks_panel_add
  - `heroGradient`: `on | off` (default `on`) — designer toggle to verify the "without gradient" baseline.

### R-T3 (P1) — accent system is mono (mint only); add category accents to break visual sameness
- problem
  - mint (`#6BE8B8`) is the only chromatic accent; appears on FAB, CTA, active tab. Every other surface is neutral gray. Cards across screens look interchangeable.
- required_changes
  - add 4 "section accents" — used ONLY in section eyebrows (8-11pt all-caps labels) and section-header underline (1px, 24px wide), never on body data:
    ```
    --sec-portfolio  #6BE8B8   /* mint, Dashboard + Accounts */
    --sec-watchlist  #7AB6FF   /* sky blue, Watchlists */
    --sec-symbol     #C9B6FF   /* lavender, Symbol detail */
    --sec-activity   #FFC176   /* amber, Trades / News / Activity */
    ```
  - eyebrow CSS: `color: var(--sec-*); opacity: 0.85; letter-spacing: 0.08em;`
  - cap usage to 1 accent per surface. Body text/numbers stay on `--text` / `--up` / `--down`.
- non_goal
  - do NOT colorize card backgrounds with these. Eyebrows + 1px header bar only.

### R-T4 (P1) — repurpose existing 7-color sector palette beyond donut
- locus
  - `design-spec.html:351-363` defines 7 sector colors; only used in `AllocationDonut`.
- required_changes
  - reuse sector colors as 6px round category dots:
    - Watchlist chip leading dot (before list name)
    - Account broker card avatar background (currently `linear-gradient(135deg,#5AA9FF,#B98CFF)` hardcoded — replace with sector color of dominant holding)
    - Symbol detail breadcrumb (small dot before sector name)
  - usage adds chromatic relief without changing surface palette.

---

## interaction

### R-I1 (P0) — PriceChart has zero interaction; must add crosshair / scrub / tap-to-detail
- locus
  - `components.jsx:56-155` (`PriceChart` / `AreaChart` / `CandleChart`)
- current_state
  - pure SVG render; no `onPointerMove`, no `onTouchMove`, no tooltip layer, no vertical guide.
- required_changes
  - add `<Crosshair>` overlay component layered above SVG:
    - vertical guide line: 1px, `rgba(255,255,255,0.18)`, full height
    - dot at intersection: 4px radius, fill `--up`/`--down` per direction, 2px outer ring `--surface-1`
    - top floating label: timestamp (`MMM D · HH:mm` for 1D; `MMM D, YYYY` for ≥ 1W), 11pt, surface-2 bg, 4/8 padding, radius 6
    - right floating label: price (tabular-nums, semibold) + ΔΔ% (semantic color), same chip style
    - while active: dim Y-axis ticks to 50% opacity, hide volume bars top labels
  - pointer model
    - desktop: track `pointermove`, debounce 16ms via rAF
    - touch: track on `pointerdown` + `pointermove`, NOT on scroll; require 8px movement before consuming gesture (else passes to vertical page scroll)
  - haptic
    - on first crosshair attach: `navigator.vibrate?.(8)`
    - on data-point snap change: `navigator.vibrate?.(3)`
  - empty-data: crosshair disabled, no tooltip
- artboard_required
  - new artboard `IOSSymbolScrub` — Symbol detail with crosshair active at ~60% chart width, both floating labels visible
  - new artboard `MacSymbolHover` — same for mac, with cursor pin glyph

### R-I2 (P1) — Trade Sheet field states (active/focus/error/numpad)
- locus
  - `screens-ios.jsx:715-731` (`Field` component, display-only)
- required_changes
  - add 4 explicit visual states for `Field`:
    - default: current
    - focus: 1px ring `--mint` outside bg, label color → `--mint`
    - error: 1px ring `--down`, helper text 12/500 `--down` below field
    - readonly: opacity 0.75
  - new artboard `IOSTradeNumpad` — Quantity field focused with iOS-style numeric keypad sheet pushing trade sheet up; show focus ring + numeric keypad
- validation_examples_to_render
  - error "Quantity exceeds available 8 sh in Fidelity · Individual"
  - error "Price must be > 0"

### R-I3 (P1) — Large Title collapse spec
- locus
  - `screens-ios.jsx:107-110` Dashboard, `screens-ios.jsx:243-247` Watchlist, `screens-ios.jsx:473` Accounts
- required_changes
  - 3-frame motion spec:
    - frame 0 (scrollY = 0): large title 34/800, no nav bar title
    - frame 1 (scrollY = 12 to 36, transition zone): title scales 34 → 17, opacity of large title 1 → 0, nav bar title fades 0 → 1
    - frame 2 (scrollY ≥ 36): nav bar title 17/600, sticky; bottom hairline `--separator-strong` appears
  - blur backdrop on nav bar appears at frame 1
- artboard_required
  - new artboard pair per screen: `IOSDashboardCollapsed`, `IOSWatchlistCollapsed`, `IOSAccountsCollapsed`

### R-I4 (P2) — gesture motion spec: swipe-actions, long-press context menu, pull-to-refresh
- required_changes (one frame each, plus numeric spec)
  - swipe-actions
    - row tracks finger horizontally; max reveal 96px; spring `stiffness 350 damping 30`
    - reveal slot bg `--down` (delete primary) + `--mint` (secondary action)
    - threshold: drag > 60% reveals → release commits; else snap back
    - artboard `IOSWatchlistSwipeAction` — AAPL row half-revealed showing "Add to Holdings | Remove"
  - long-press context menu
    - press 480ms triggers; source view scales 1.0 → 0.96 then 1.04 with backdrop blur 0 → 24px
    - menu popover slides from source rect, 320ms ease-out
    - artboard `IOSWatchlistLongPress` — AAPL row mid-lift, context menu fully shown, backdrop blurred
  - pull-to-refresh
    - elastic resistance 0.5 above scroll-top; threshold 64px; rotating arc spinner mint
    - artboard `IOSDashboardPullRefresh` — show dragged-down state with spinner at peak

### R-I5 (P2) — global search ⌘K palette + iOS top-bar search
- required_changes
  - mac: floating command palette modal, 560×420, centered, blur 40px backdrop dim 60%
    - sections: "My Holdings" (rendered with PositionRow mini, mint dot prefix) | "Watchlists" (list chips) | "Market" (Finnhub search result rows with exchange tag)
    - keyboard hints: `↑↓` navigate, `↵` open, `esc` close
  - ios: top-bar search icon in NavHeader → tap → push full-screen search; same sections
- artboard_required
  - `MacSearchPalette`, `IOSSearchFullscreen`

---

## state_machine

### R-S1 (P0) — implement loading / empty / error / offline / stale states for every async surface
- problem
  - `design-spec.html:655-665` describes states in prose; zero artboards exist.
- required_changes
  - produce a `screens-states.jsx` mounting these artboards on iOS canvas (390×844):
    1. `StateLoadingDashboard` — net-worth card with shimmer skeleton (1.2s linear-gradient sweep, `135deg`, surface-1 → surface-2 → surface-1), chart shimmer (4-bar pulse), TodayMovers strip skeleton (4 mini cards as grey rounded rects)
    2. `StateLoadingChart` — Symbol detail with chart-only shimmer (data still showing on stat tiles); thin 2px progress bar at chart top
    3. `StateEmptyWatchlist` — lucide `eye-off` 64pt + "No symbols yet" (17/700) + "Search a stock to begin" (13/500 text-2) + primary CTA "Add symbol"
    4. `StateEmptyAccounts` — lucide `wallet` 64pt + "Add your first account"
    5. `StateEmptyHoldings` — within account broker section: dashed border card "No holdings · Add ticker"
    6. `StateEmptyTrades` — "No transactions recorded · Add trade"
    7. `StateErrorQuotes` — yellow banner top of screen: lucide `alert-triangle` 14pt + "Live quotes unavailable · showing data from 10:32 AM" + "Retry" link mint
    8. `StateOffline` — same banner pattern, copy "You're offline · showing cached data"
    9. `StateStaleBackground` — normal screen + 2px progress bar at very top of viewport (mint, indeterminate)
  - all banners are 36pt height, full-width, `background: rgba(255,193,118,0.14)`, `border-bottom: 1px solid rgba(255,193,118,0.3)`, `color: #FFC176`
- shimmer_spec
  - duration 1200ms, ease linear, repeat infinite
  - gradient stops: 0% surface-1 / 50% surface-2 / 100% surface-1
  - mask shape per skeleton tile

---

## screens

### R-SC1 (P0) — Accounts: add Trades / Performance / Dividends content (sub-tabs inside broker section)
- locus
  - `screens-ios.jsx:453-542` (`IOSAccount`), `screens-mac.jsx:712-888` (`MacAccount`)
- decision
  - keep Yahoo-style expanded broker cards as default
  - add a 4-segment sub-tab strip INSIDE each broker section, directly below `BrokerHeader`:
    `Holdings · Activity · Performance · Dividends`
  - active segment underline 2px sector-accent (`--sec-portfolio`); inactive 12/500 `--text-3`
- required_artboards
  - `IOSAccountActivity` — Activity tab: month-grouped transaction list ("MAY 2026" eyebrow with `--sec-activity` accent); each row = date · KindPill (BUY/SELL/DIV/SPLIT/FEE color-coded) · symbol · qty × price · total; swipe-left reveals Edit/Delete; top filter chip row (All · Buys · Sells · Dividends)
  - `IOSAccountPerformance` — Performance tab: net-value area chart (TWR-adjusted) full-width 200pt high; SPY benchmark dashed line overlay; below: 6-month bar chart of monthly P/L (red/green); KPI strip (1M / 3M / YTD / 1Y / All returns vs SPY)
  - `IOSAccountDividends` — Dividends tab: YTD card ($amount big), prior-year comparison sparkline; upcoming ex-dates list (next 5); historical dividends table aggregated by symbol with yield-on-cost column
  - macOS equivalents: `MacAccountActivity`, `MacAccountPerformance`, `MacAccountDividends` — denser, table-driven
- benchmark_selector
  - Performance tab top-right: small chip "vs SPY" → tap opens picker (SPY · QQQ · DIA · VT · custom)

### R-SC2 (P0) — CSV import sheet
- required_artboards (all iOS + mac)
  1. `IOSCSVImportPick` — bottom sheet, drag-drop zone (mac) / file picker tile (ios) + "Choose file from Files" CTA; supported brokers list (Fidelity · Schwab · Vanguard · IBKR · Custom) each as a chip
  2. `IOSCSVImportMap` — preview of first 5 rows from uploaded CSV; column-mapping table: source-column → target-field (Date · Symbol · Kind · Quantity · Price · Fees · Account); dropdowns with auto-detected match (mint check icon when high confidence)
  3. `IOSCSVImportReview` — validation summary: "42 rows · 38 valid · 4 issues" with collapsible error list per row; "Skip & import valid" + "Cancel" actions
  4. `IOSCSVImportDone` — success state with import count + "Undo (24h)" link

### R-SC3 (P1) — iOS Symbol detail must reach parity with mac Symbol
- locus
  - `screens-ios.jsx:319-448` ends after MyPosition; missing Dividend History, About, News
- required_changes
  - add (in order, below MyPosition card):
    - Dividend History card (port from `screens-mac.jsx:666-692`; same 8 quarterly bars; same footer triple-stat)
    - About card (CEO · HQ · Employees · Industry · expandable description)
    - News card (3 items): thumbnail 56×56 radius 8 + headline 14/600 (2-line clamp) + publisher · relative time 11/500 `--text-3`; tap → in-app web view
  - all 3 cards on `--surface-1` with `--hairline-top`

### R-SC4 (P1) — Dashboard NetWorthCard needs sparkline overlay + range chips (currently spec says it, mac has it, iOS doesn't show range-bound)
- locus
  - `screens-ios.jsx:107-150`
- required_changes
  - confirm/insert: above net-worth amount, a horizontal range chip row `24H · 1W · 1M · 3M · 1Y · ALL`; below amount, area sparkline 110pt high; gradient direction matches today sign per R-T2
  - add tap target: tapping a chip swaps range; haptic light

### R-SC5 (P2) — responsive mid-tier breakpoint (iPad / mid-mac window 769–1023px)
- required_artboards
  - `IPadDashboard` 1024×768 — iOS layout with TabBar still at bottom, but 2-column dashboard
  - `MacWatchlistCompact` 900×700 — sidebar collapsed to 64px icon-rail; main pane single column
- rule_doc
  - add `design-spec.html` § Responsive: breakpoint logic, what collapses, what reflows

---

## visual_hierarchy_global

### R-V1 (P0) — apply elevation language consistently (rooted in R-T1/T2)
- problem
  - "All blocks look the same" because no consistent rule for which surface uses which token.
- required_rule_table (add to `design-spec.html`)
  ```
  level   token          shadow                    usage
  -----   ------------   -----------------------   ------------------------------------
  page    --bg           none                      app background, full-bleed
  bar     --bg-elev      hairline-top              status/nav/tabbar, sidebar
  card    --surface-1    hairline-top + tint       primary data card (default)
  hero    --surface-1    hairline-top + hero-grad  net-worth, symbol price, big total
  inset   --surface-2    hairline-bottom           field, segmented track, chip group
  active  --surface-3    hairline-top              active segmented item, hover row
  modal   surface-1@98%  shadow 0 20 60 black/40   sheet, popover, alert
  ```
- enforcement
  - every JSX inline `background: 'var(--surface-1)'` must additionally include `boxShadow: 'var(--hairline-top)'`; hero blocks add background-image gradient per R-T2
  - audit script: grep for `background: 'var(--surface-1)'` and verify hairline applied; report list at end of v2

### R-V2 (P0) — section grouping with eyebrows (rooted in R-T3)
- problem
  - long screens (Dashboard, Account detail) have no visible content rhythm; cards just stack without grouped section beats
- required_changes
  - every screen scrolls in 3-5 named sections; each section preceded by a 28pt-high eyebrow row:
    - 11pt `letter-spacing: 0.08em` all-caps label in sector-accent color
    - optional 11pt right-aligned action ("See all", "Sort", "Edit")
    - 24×1px underline in sector-accent at 0.5 opacity below label
  - example for Dashboard: `PORTFOLIO` (mint) → NetWorthCard + sparkline · `TODAY` (amber) → Movers strip · `ALLOCATION` (lavender) → Donut · `ACCOUNTS` (mint) → broker summary list · `ACTIVITY` (amber) → recent transactions

### R-V3 (P1) — separator hairlines: dynamic strength
- problem
  - all dividers use `--separator` @ 7%; group boundaries and row boundaries look the same
- required_changes
  - row-level (between holdings in a list): `--separator` (10% per R-T1)
  - section-level (between major card groups): `--separator-strong` (14%) + 16px vertical padding above/below
  - card-internal (between My Position upper and lower halves): keep at `--separator`

---

## a11y

### R-A1 (P2) — masked-numbers privacy mode + screen reader
- locus
  - `screens-mac.jsx:849, 859` `<span class="masked">000.00</span>` etc.
- required_changes
  - `.masked` rule: `aria-hidden="true"` on the visible span; sibling `<span class="sr-only">amount hidden</span>`
  - top-bar privacy toggle gets `aria-pressed` + descriptive label "Hide amounts"
- spec_update
  - `design-spec.html` § Accessibility: add 3 examples of aria-label for the most important data rows ("MSFT $421.92 up 3.05% today, intraday chart with 78 data points")

### R-A2 (P2) — focus rings + keyboard nav for mac
- problem
  - no visible focus state defined anywhere
- required_changes
  - global rule `:focus-visible { outline: 2px solid var(--mint); outline-offset: 2px; border-radius: inherit; }`
  - artboard `MacWatchlistKeyboardFocus` — second row focused via Tab, ring visible

---

## sundries

### R-X1 (P2) — number overflow & i18n placeholders
- show in artboards how data renders for:
  - amount ≥ $1,000,000 (use compact: $1.23M; toggle in Settings)
  - amount ≥ $1B (auto compact)
  - 8-digit holding count
- locale: spec a single `formatMoney(amount, { compact: 'auto' | 'always' | 'never' })` contract; document in `design-spec.html`

### R-X2 (P2) — light theme placeholder
- not required for v2 implementation
- but: add `:root[data-theme="light"]` token overrides skeleton in `design-spec.html` listing all surface/text counterparts (values TBD), so engineering can wire the toggle now and design fills colors later

### R-X3 (P3) — News v2 placeholder card
- ship in v2 even as "Coming soon" tile so Symbol detail layout doesn't shift later

---

## tweaks_panel_v2

extend `app.jsx` `TWEAK_DEFAULTS` with:
```
{
  "chartStyle": "area",        // existing
  "rowLayout":  "apple",       // existing
  "sortMode":   "Manual",      // existing
  "privacy":    false,         // existing
  "heroGradient": true,        // R-T2
  "elevation":  "v2",          // "v1" = current flat ladder | "v2" = R-T1 widened ladder, for A/B
  "sectionEyebrows": true,     // R-V2 toggle
  "stateOverlay": "none"       // "none" | "loading" | "empty" | "error" | "offline" | "stale" — R-S1
}
```

new tweaks panel sections:
- "Elevation" (radio v1/v2, toggle heroGradient, toggle sectionEyebrows)
- "States" (select stateOverlay) — when non-none, applies to currently rendered artboard

---

## deliverables_checklist

- [ ] `data.jsx`: unchanged unless adding mock for activity / dividends / news
- [ ] token table values updated (R-T1, R-T2, R-T3, R-T4) — both `design-spec.html` table and the css block consumed by canvas
- [ ] `components.jsx`: `PriceChart` adds `Crosshair` overlay (R-I1); `Field` adds 4 states (R-I2); `KindPill`, `Eyebrow` new exports (R-V2); `Skeleton`, `Banner` new exports (R-S1)
- [ ] `surfaces.jsx`: add `IOSCSVImportPick/Map/Review/Done` (R-SC2)
- [ ] `screens-states.jsx` NEW: 9 state artboards (R-S1)
- [ ] `screens-ios.jsx`: add `IOSSymbolScrub`, `IOSTradeNumpad`, `IOSDashboardCollapsed`, `IOSWatchlistCollapsed`, `IOSAccountsCollapsed`, `IOSWatchlistSwipeAction`, `IOSWatchlistLongPress`, `IOSDashboardPullRefresh`, `IOSAccountActivity`, `IOSAccountPerformance`, `IOSAccountDividends`, `IOSSearchFullscreen`, `IPadDashboard`; update `IOSSymbol` for R-SC3; update `IOSDashboard` for R-SC4
- [ ] `screens-mac.jsx`: add `MacSymbolHover`, `MacAccountActivity`, `MacAccountPerformance`, `MacAccountDividends`, `MacSearchPalette`, `MacWatchlistCompact`, `MacWatchlistKeyboardFocus`; apply R-V1/V2 across existing screens
- [ ] `app.jsx`: mount all new artboards in their proper DCSection; extend Tweaks panel per `tweaks_panel_v2`
- [ ] `design-spec.html`: token values updated; new sections "Elevation Rules" (R-V1), "Section Grouping" (R-V2), "States" (R-S1), "Responsive" (R-SC5), "Accessibility examples" (R-A1/A2); contrast ratios re-proven
- [ ] `CHANGELOG.md` NEW: per-file diff summary; per-revision-id mapping (R-T1 → which files/lines changed)
- [ ] all new artboards visible in `index.html` canvas without errors

---

## profiles (multi-user workspace — NEW SCOPE)

### context
- product scope changes from "single personal investor" to "household operator managing multiple family members' portfolios"
- operator (the human running the app) is ONE — single auth boundary
- profiles (e.g., Sam / Mom / Dad / Sister) are workspaces inside the operator's account
- multiple profiles coexist indefinitely; switching is hot (no logout, no auth re-challenge by default)
- each profile owns its own brokerage accounts → which own holdings + transactions
- three-tier hierarchy: `operator → profile → account → holdings/transactions`
- this section supersedes any prior assumption of single-user; all existing R-* items that touch data are updated by cross-references at the end

### R-P0 (P0, BLOCKER for data layer) — data model & scoping rules
- locus
  - `data.jsx` (mock data) and `db/schema.ts` (engineering, planned)
- required_changes
  - new top-level entity `profile`:
    ```
    profile {
      id            uuid (pk)
      name          text   (e.g., "Sam", "Mom 妈妈")
      display_name  text   (long form, optional)
      avatar_kind   enum   "initials" | "emoji" | "photo"
      avatar_value  text   ("SM" | "👩" | "/uploads/mom.jpg")
      color         text   from fixed 8-color palette (see R-P2)
      relation      enum   "self" | "partner" | "parent" | "child" | "sibling" | "other"
      birth_year    int    (optional, used for future retirement-horizon hints — do not surface yet)
      created_at    ts
      pinned        bool   (top of switcher)
      sort_order    int
      pin_hash      text?  (optional per-profile PIN, see R-P6)
    }
    ```
  - **scope rules** (must be codified in spec + DB constraints):
    | entity | scope | rationale |
    |---|---|---|
    | `accounts` | profile-scoped (FK `profile_id NOT NULL`) | accounts belong to a person |
    | `transactions` | inherits via `account.profile_id` | derived |
    | `watchlists` | profile-scoped | personal interest |
    | `watchlist_items` | inherits via `watchlist.profile_id` | derived |
    | `securities` | **global** | market data, identical for everyone |
    | `quote_cache` | **global** | market data |
    | `prices_daily` | **global** | market data |
    | `dividends_announced` | **global** | corporate action |
    | `dividends_received` | profile-scoped (derived from transactions) | personal |
    | `alerts` (R-U6 future) | profile-scoped | personal triggers |
    | `settings.preferences` | profile-scoped (theme, default range, etc.) | personal |
    | `settings.app` | global (Finnhub key, refresh rate) | operator-level |
  - **invariant**: every query at the application layer carries `profile_id` (or `IN (...)` for aggregate view); enforced by a single DB access wrapper. there is NO query in the codebase that reads profile-scoped tables without a profile predicate.
  - **default profile**: on first launch after R-P0 migration, create one profile `Me` with all existing data assigned to it (the migration). on subsequent launches, last-used profile is restored.
  - **mock data update**: `data.jsx` ships 3 profiles (Sam · Mom · Dad), each owning 1-2 accounts, with distinct holding mixes (Sam = growth/tech-heavy; Mom = dividend ETFs; Dad = balanced) so screens demonstrate cross-profile contrast.

### R-P1 (P0) — profile switcher UI
- locus
  - new everywhere: top-left of `MacSidebar` and `IOSStatusBar` adjacent area
- required_changes
  - **mac**: top of sidebar, above search row, a `ProfileChip` (44px tall):
    - left: 28px circular avatar (color-tinted background per R-P2 + initials/emoji/photo)
    - middle: profile name (15/700) + tiny "$XXX,XXX · today +/-Y%" line (12/500 text-2)
    - right: down chevron icon
    - click → `ProfileSwitcher` popover (anchored to chip)
  - **ios**: NavHeader leading slot replaces the (currently empty) corner with the same 28px avatar (no name to save horizontal). tap → full-screen `ProfileSwitcher` sheet. long-press → quick-switch to most-recent profile (single haptic).
  - `ProfileSwitcher` content (single shared component, sheet on ios / popover on mac):
    - "Switch profile" header
    - pinned profiles first, then others, then divider
    - each row: 36px avatar · name · today P/L (semantic color) · current indicator (mint check on right if active)
    - footer rows:
      - "All profiles" (virtual aggregate view, R-P5; opens cross-profile read-only dashboard)
      - "Manage profiles" → R-P4 Settings sub-screen
      - "Add profile" → new profile sheet
  - **switch motion**: when user picks a different profile, entire app frame does a 220ms cross-fade through the profile's accent color (R-P2) as a brief flash, then re-mounts data. this gives unambiguous "I am now in a different context" feedback. no spinner — switching is a client-side scope change + cached query reflush, not a network round-trip.
  - **keyboard shortcuts (mac)**: `⌘1` `⌘2` `⌘3` `⌘4` switch to first 4 pinned profiles; `⌘⇧P` opens switcher palette
- artboards_required
  - `MacProfileSwitcher` — sidebar profile chip + open popover with 4 profiles
  - `IOSProfileSwitcherSheet` — full-screen sheet (avatar grid + list, see R-P4)
  - `MacProfileSwitchTransition` — mid-transition frame showing accent flash
  - `IOSStatusBarProfileChip` — close-up of the iOS top-left chip in 3 profile states

### R-P2 (P0) — visual chrome MUST signal current profile at all times
- problem
  - operator switching between Mom and Dad while half-distracted will fat-finger a trade into the wrong profile. the screen MUST look visibly different per profile so the wrong context is rejected pre-attentively.
- required_changes
  - each profile is assigned one of 8 distinct accent colors (separate from `--sec-*` section accents from R-T3 — these are PROFILE accents, taking priority):
    ```
    --profile-1  107 232 184   /* mint */
    --profile-2  122 182 255   /* sky */
    --profile-3  201 182 255   /* lavender */
    --profile-4  255 193 118   /* amber */
    --profile-5  244 114 182   /* pink */
    --profile-6  110 231 183   /* teal — distinct from mint via hue */
    --profile-7  253 164 175   /* coral */
    --profile-8  165 180 252   /* indigo */
    ```
  - profile color is bound to a CSS var `--current-profile` set at app root on every profile switch.
  - visual chrome touchpoints (mandatory, every screen):
    - **mac sidebar**: 3px left-edge stripe in profile color; profile avatar background = profile color @ 0.18 alpha
    - **ios status bar area + tabbar top hairline**: 1px line in profile color (subtle)
    - **NavHeader (mac top bar / ios large title row)**: profile name appears in profile color (only place name is rendered chromatically; everywhere else uses neutral text)
    - **active TabBar item (ios)**: tinted in profile color (overrides existing mint default)
    - **buttons & CTAs that mutate profile data** (Save, Add, Record Trade, Add Ticker): background = profile color; everything else stays neutral or section-accent
  - the profile color must **never** be used for the up/down semantic colors — those remain `--up #34D399` / `--down #FB7185` regardless of profile, so red/green retain absolute meaning across profiles.
  - if a profile is assigned color #1 (mint), the system's default brand mint is still used for non-profile chrome (Settings, login screen, switcher itself), preserving brand identity.
- artboard_required
  - `MacDashboardProfileChrome` — 3 dashboards side-by-side, each in a different profile color, to verify pre-attentive differentiation works at a glance

### R-P3 (P0) — mutation safety: TradeSheet and any write surface must show profile context unambiguously
- problem
  - the single highest-risk action is recording a trade under the wrong profile (taxes, holdings, cost basis all become wrong). cannot rely on operator memory; must rely on screen.
- required_changes
  - **TradeSheet header** ([screens-ios.jsx:643-648](references/designs/screens-ios.jsx), [screens-mac.jsx:893+](references/designs/screens-mac.jsx)) — replace "New Trade" title with a 3-line stack:
    - eyebrow (12/600 in profile color): "RECORDING FOR" all-caps
    - profile avatar (28px) + profile name (17/700) + relation tag ("Mom · parent" small text-2)
    - the entire sheet header background gets a 4px top-border strip in profile color
  - **Account dropdown inside TradeSheet** — list ONLY accounts of the current profile; if operator tries to switch profile via the dropdown, sheet closes with a confirmation ("Switch to Dad's accounts? Current entries will be discarded · Cancel | Switch")
  - **inline destructive-action confirmations** (e.g., "Delete this transaction") — confirmation dialog displays the affected profile's avatar + name above the message: "From [Mom]'s Fidelity · Individual — Delete buy 50 NVDA on May 10?"
  - **WatchList add/remove**, **account create/delete**, **CSV import** all carry the same "for [Profile]" header pattern
- artboard_required
  - `IOSTradeSheetProfileHeader` — TradeSheet with new 3-line profile-attributed header (in Mom's accent color)
  - `IOSDeleteTransactionConfirm` — confirmation dialog showing profile attribution
  - `IOSAccountSwitchWarning` — what happens if user tries to switch profile mid-trade-entry

### R-P4 (P1) — Settings sub-screen: profile management
- locus
  - new artboard rooted in `surfaces.jsx` IOSSettings
- required_changes
  - "Profiles" section in Settings (replaces single "Account" section at top):
    - list of profiles with drag handle (reorder), avatar, name, relation, pin toggle
    - each row tap → profile detail editor (name, display_name, avatar choice, color choice from 8-swatch grid, relation, optional PIN per R-P6)
    - footer: "Add profile" CTA in current profile's color
    - destructive: "Delete profile" inside detail editor — requires typing profile name to confirm; warns "5 accounts, 234 transactions, $X,XXX value will be permanently removed. Export first?" with Export CSV button inline
  - **operator-level** Settings (Finnhub key, App password, Refresh rate, Backup) live at the very bottom under "App settings" eyebrow — visually separated so operator understands these are NOT per-profile
- artboards_required
  - `IOSSettingsProfilesList`
  - `IOSProfileEditor` — color palette grid + avatar picker + relation chips
  - `IOSAddProfileSheet`
  - `IOSDeleteProfileConfirm`

### R-P5 (P1) — "All profiles" aggregate view (read-only)
- problem
  - operator wants the cross-family snapshot: "how is the household doing this week?"
- required_changes
  - virtual profile `__all__` (not a real row, computed view) accessible from ProfileSwitcher footer "All profiles"
  - layout = Dashboard, but:
    - top hero replaced with `HouseholdHero` showing each profile as a stacked horizontal bar (width = relative net worth) in profile colors; total at top
    - NetWorthCard sparkline aggregates ALL profiles
    - TodayMoversStrip shows each mover with **profile attribution badge** (small avatar in corner)
    - AllocationDonut: dual-mode toggle "By sector / By profile"
    - AccountsSummaryList groups by profile, each group header in profile color
  - **mutation surfaces are disabled** in this view: no FAB (TabBar shows `+` greyed with tooltip "Switch to a profile to record trades"), no swipe-to-edit on rows, no "Add account" CTA. tapping a holding pushes Symbol detail with aggregated MyPosition showing per-profile breakdown.
  - WatchList tab in `__all__` view: shows unified list (union of all profiles' lists), each row badged with which profile(s) hold it
- artboards_required
  - `IOSDashboardAllProfiles`
  - `MacDashboardAllProfiles`
  - `MacSymbolDetailAllProfiles` — MyPosition card showing per-profile breakdown rows

### R-P6 (P2) — optional per-profile PIN
- problem
  - some profiles (e.g., operator's own) may want extra protection beyond the single app password — e.g., if family members ever borrow the device
- required_changes
  - in Profile Editor (R-P4), optional 4-digit PIN
  - if set: switching to that profile requires PIN entry sheet (numpad with 4 dot indicators; 3 wrong attempts → 30s cooldown; matches iOS device unlock pattern)
  - PIN failures do NOT log out the app; just block the switch and keep operator in current profile
  - operator can reset any profile's PIN from Settings (knows app password = can override)
- artboards_required
  - `IOSProfilePINEntry`
  - `IOSProfilePINSetup` (inside profile editor)
- non_goal
  - this is not a true identity boundary — operator still has full access; PIN exists only to prevent casual snooping over the operator's shoulder

### R-P7 — cross-references: existing R-* items that need profile updates
- update locations as part of v2 design pass:
  - **R-T3 (section accents)**: profile accents take precedence over section accents on chrome surfaces (sidebar stripe, NavHeader name, primary CTAs). section accents continue on internal eyebrows (PORTFOLIO / WATCHLIST / etc.). spec must document the precedence order: `semantic (up/down) > profile (chrome + CTAs) > section (eyebrows)`.
  - **R-SC1 (account sub-tabs)**: Performance tab's SPY benchmark comparison is per-profile by default; "All profiles" view (R-P5) compares household-aggregated TWR vs SPY.
  - **R-SC2 (CSV import)**: import sheet header carries profile attribution per R-P3; column mapping has a NEW field "Profile" (auto = current; can override per-row for batched family imports). artboard `IOSCSVImportMap` must show this column.
  - **R-I5 (⌘K search)**: results section grouped by profile when operating in `__all__` view; in single-profile view, only current profile's holdings appear plus the "Market" results. spec should NOT cross-leak: searching from inside Mom's profile must not show Sam's holdings in the "My Holdings" group.
  - **U-1 (multi-account aggregated MyPosition)**: this is now scoped within a single profile by default; R-P5 `__all__` view shows the cross-profile aggregation as a separate mode in MyPosition card.
  - **U-4 (Trade entry recent-date default)**: "last used date" is per-profile (operator recording for Mom uses Mom's last date, not Sam's).
  - **U-5 (tax / wash sale)**: wash sale detection is **per profile** (IRS rules apply per taxpayer; operator's wash sale on AAPL does NOT trigger when Mom buys AAPL). spec must explicitly state this.
  - **U-7 (onboarding)**: revised flow:
    1. login (operator password)
    2. "Who are you setting up first?" — create first profile (default "Me"), pick color
    3. then the existing 3-way choice (CSV / manual / demo)
    4. post-onboarding: persistent hint chip in Settings "Add another profile (e.g., for a family member)" until dismissed
  - **U-8 (privacy levels)**: 3-tier instead of 2:
    - L0 default: everything visible
    - L1 "amounts hidden": numbers masked (existing)
    - L2 "public mode": amounts + account names + profile name masked (profile shown as color avatar only, no name; useful when handing device to someone)
  - **U-9 (i18n)**: profile names support full unicode (中文姓名); relation labels (parent/child/etc.) must be localized.

### R-P deliverables
- [ ] `data.jsx`: add `PROFILES` array (3 mock profiles); restructure `ACCOUNTS` to carry `profile_id`; recompute all derived aggregates per profile
- [ ] `components.jsx`: new `ProfileChip`, `ProfileAvatar`, `ProfileBadge`, `ProfileColorStripe` components
- [ ] `surfaces.jsx`: extend Settings + add `ProfileSwitcher`, `ProfileEditor`, `AddProfileSheet`, `DeleteProfileConfirm`, `ProfilePINEntry`
- [ ] `screens-ios.jsx`: add `IOSProfileSwitcherSheet`, `IOSStatusBarProfileChip`, `IOSTradeSheetProfileHeader`, `IOSDeleteTransactionConfirm`, `IOSAccountSwitchWarning`, `IOSSettingsProfilesList`, `IOSProfileEditor`, `IOSDashboardAllProfiles`, `IOSProfilePINEntry`, `IOSProfilePINSetup`; apply chrome (R-P2) across all existing iOS screens
- [ ] `screens-mac.jsx`: add `MacProfileSwitcher` (with sidebar chip), `MacProfileSwitchTransition`, `MacDashboardProfileChrome`, `MacDashboardAllProfiles`, `MacSymbolDetailAllProfiles`; apply chrome to every existing screen (3px sidebar stripe, NavHeader name in profile color)
- [ ] `app.jsx`: add tweaks panel section "Profile" with select `currentProfile: Sam | Mom | Dad | All` so audit can A/B all artboards across profile contexts
- [ ] `design-spec.html`: NEW § "Multi-profile architecture" with data model diagram, scoping table, switching motion spec, mutation-safety rules, R-P2 color palette, color precedence rule

---

## navigation_restructure (SUPERSEDES previous 5-tab IA)

### context
- prior IA: `Home · Watchlist · + (Trade FAB) · Accounts · Me` (5 tabs, central FAB)
- new IA: `Home · Portfolio · Market · Me` (4 tabs, NO central FAB)
- rationale
  - prior tabs were under-loaded individually (each could fit in one scroll); merging produces a Yahoo Finance-style Home that answers "what happened to my stuff today" in one scroll
  - Yahoo Finance ships only 4 tabs (Home / News / Markets / Community) and the design is denser & more decision-useful than 5 thinner tabs
  - introduces a **Market** tab — covers index movers, sector heatmap, trending/most-active/gainers-losers — without which the operator must context-switch out to Yahoo/Google to research new symbols, breaking the loop
  - removes central Trade FAB; trade entry becomes **contextual** (per-symbol "Trade" CTA + per-portfolio "Transact" action) per Fidelity model — drastically reduces accidental cross-profile / cross-account trade entry
- reference_inputs
  - `references/IMG_5093.PNG`, `IMG_5094.PNG`, `IMG_5095.PNG` — Yahoo Markets tab Overview / Trending Now / ETF screens
  - `references/IMG_5096.PNG` — Fidelity Portfolio Positions screen (Summary/Positions/Balances/Activity sub-tabs, per-account left color stripe, dense table)
  - `references/IMG_5097.PNG` — Fidelity Symbol detail (Overview/Research/Options/Positions sub-tabs, bottom Trade CTA, "As of … ET" timestamp, Purchase history table)
- this section RESTRUCTURES: prior artboards `IOSDashboard`, `IOSWatchlist`, `IOSAccount` collapse / re-target. mac counterparts re-target identically. all R-* and U-* items previously scoped to one of those screens are reassigned per R-N6 below.

### R-N0 (P0, BLOCKER for IA) — new tab structure
- required_changes
  - TabBar (ios) and Sidebar (mac) become 4 items:
    | tab | icon (lucide) | scope | active accent |
    |---|---|---|---|
    | Home | `home` | per-current-profile snapshot (was Dashboard + Watchlist + Accounts header) | profile color |
    | Portfolio | `briefcase` | per-current-profile holdings & activity (Fidelity-style) | profile color |
    | Market | `globe-2` | profile-agnostic market data | `--mint` (brand, not profile) |
    | Me | `user` | settings, profiles, app | `--mint` |
  - no central FAB. iOS TabBar reverts to 4 evenly-spaced items.
  - mac Sidebar: 4 nav items + accounts group below + user row at bottom (same shape as v1)
  - the ProfileChip (R-P1) stays at the top of the sidebar / top-left of iOS NavHeader; profile switching is orthogonal to tab choice
- artboards_required (replaces existing per R-N6)
  - `IOSTabBarV2` — close-up of the 4-tab bar, no FAB; show inactive + active states; show profile-color-tinted active for Home/Portfolio vs mint for Market/Me
  - `MacSidebarV2` — same 4 nav items + accounts group; ProfileChip on top

### R-N1 (P0) — Home tab (consolidated)
- supersedes prior IOSDashboard + IOSWatchlist + IOSAccount summary section
- information_architecture (single scroll, top → bottom)
  1. **NavHeader**
     - leading: ProfileChip (R-P1)
     - title: large-title "Home" (mac) / "[Profile Name]'s Portfolio" (ios) — per R-I3 collapse
     - trailing: search icon · bell icon (alerts, R-U6) · "..." (overflow: Refresh / Privacy mode / Add ticker)
  2. **MarketStatusStrip** (R-U2 lands here)
     - "US Markets · Open · Closes in 2h 14m" + tiny pill showing S&P intraday % (color)
     - if closed: "Markets closed · Pre-market +0.42% · Opens in 6h 14m"
     - height 28pt, full-bleed, blurred backdrop
  3. **NetWorthCard** (was Dashboard hero)
     - profile-attributed total + today P/L + sparkline + range chips
     - hero gradient direction per R-T2
  4. **AccountsRibbon** (new, replaces standalone Accounts overview)
     - horizontal scroll of account chips (one per account in current profile): account name + today P/L pill, color stripe at top per account (see R-N2.b for account color rule)
     - tap chip → Portfolio tab with that account preselected in dropdown
  5. **WatchlistStrip** (was Watchlist tab)
     - section eyebrow "WATCHLIST" + horizontal chip switcher of user's lists ("My Symbols · Mega Cap · ETFs ·..." per R-N2 list-of-lists semantics)
     - **vertical** list of StockRow within the active list (apple layout, 5-7 rows visible, with "View all" footer link → full-screen list per chip)
     - long-press / left-swipe gestures per R-I4
  6. **TodayMoversStrip** — horizontal scroll, profile holdings only, sorted by abs(%)
  7. **AllocationDonut** + sector legend (collapsible, default collapsed below the fold)
  8. **UpcomingEventsCard** (R-U6 lands here)
     - "This week: 3 earnings · 2 ex-div" with rows below; tap → event detail
  9. **RecentActivity** — last 5 transactions (was Recent Activity from prior Dashboard)
  10. **HouseholdSwitchHint** (only when operator has ≥2 profiles, dismissible)
     - "Viewing [Mom]'s Home · switch to [All profiles] to see household totals" (small mint inline)
- artboards_required
  - `IOSHomeV2` — full single-scroll iOS Home with all sections visible
  - `IOSHomeV2Collapsed` — same with NavHeader collapsed per R-I3
  - `MacHomeV2` — mac equivalent (2-col layout: left = NetWorth + Market status + Watchlist; right = Accounts ribbon + Movers + Donut + Events + Activity)

### R-N2 (P0) — Portfolio tab (Fidelity-style)
- replaces prior IOSAccount and MacAccount
- information_architecture
  1. NavHeader: title "Portfolio" · trailing "..." (Edit columns / Sort / Export CSV / Import CSV) · search · ProfileChip
  2. **AccountSelector** (dropdown, just below NavHeader, full-width)
     - default: "All accounts" (current profile)
     - on tap: drops a sheet listing accounts of current profile + "All accounts" virtual row at top
     - each row: account name · broker · today P/L · color swatch (R-N2.b)
  3. **Sub-tabs** (Fidelity model, horizontal, underlined active in profile color):
     - `Summary` — KPI strip (Total Value · Today · Total P/L · Dividends YTD) + AllocationDonut + Performance preview (mini chart) + "View Performance →"
     - `Positions` — see R-N2.a below
     - `Activity` — transaction list per R-SC1 (month-grouped, swipe edit/delete, filters chip row, CSV import / export buttons)
     - `Balances` — cash + margin + buying power per account; broker-side liabilities; for v1 mostly placeholder + manually-entered cash row
  4. fixed bottom safe-area: subtle hairline + "↑ Collapse" chevron (per IMG_5096) → collapses the sub-tab bar so the table gets more vertical space
- **R-N2.a — Positions sub-tab (the dense table)**
  - sub-sub-tab row: `Open` (default) · `Closed` (historical / sold-out positions; v2 if scope tight) · `Options` (v2/placeholder)
  - table header sticky on scroll, columns (mac, denser):
    | Symbol | Last | Chg | Today $ G/L | Today % | Mkt Value | Avg Cost | Total G/L | % Port | LT/ST |
  - table on iOS: prioritized columns (responsive collapse):
    | Symbol | Last | Today % | Total G/L |
    long-press row → reveal column sheet for that row; tap row → Symbol detail
  - **left-edge color stripe** per row in account color (R-N2.b) — visible when in "All accounts" mode; hidden in single-account mode (redundant)
  - **R-U5 holding-period badge** rendered in last column: "LT" mint or "ST · 21d" amber
  - sort: column header tap; default sort = Mkt Value desc; persist per-profile preference
  - empty: per R-S1 patterns
- **R-N2.b — Account color assignment**
  - each account gets a color (separate from profile color) chosen automatically on creation from an 8-swatch palette, user-overridable in account settings; ensures every account has a unique color within a profile
  - color palette intentionally **distinct from profile palette** to avoid confusion: muted tones (slate, steel, bronze, olive, plum, rust, ocean, sand)
  - color used in: account chip in Home AccountsRibbon (top stripe), Portfolio Positions table (left-edge stripe), Symbol detail MyPosition card per-account row (left-edge stripe), Trade Sheet account dropdown swatch
- **R-N2.c — Summary sub-tab content** (closes gap with prior Dashboard hero overlap)
  - kept lighter than Home (no AccountsRibbon, no WatchlistStrip); focuses on **per-profile portfolio aggregate** as if "all accounts" were one fund: net worth · today P/L · TWR vs SPY mini chart · top 5 positions · sector donut
- artboards_required
  - `IOSPortfolioSummary` (new) · `IOSPortfolioPositions` (was Account holdings) · `IOSPortfolioActivity` (was R-SC1 Activity tab artboard) · `IOSPortfolioBalances` (placeholder for v1)
  - `MacPortfolioSummary` · `MacPortfolioPositions` (10-col table) · `MacPortfolioActivity` · `MacPortfolioBalances`
  - `IOSAccountSelectorSheet` — drop-down sheet listing accounts of current profile + "All accounts"

### R-N3 (P0) — Market tab (NEW, Yahoo-style)
- profile-agnostic — same data regardless of which profile is active. ProfileChip still visible in NavHeader (operator may want to switch context before tapping a symbol that auto-pre-fills a trade), but switching profile does not change Market content.
- information_architecture
  1. NavHeader: title "Market" · search (`⌘K` on mac) · bell · ProfileChip
  2. **Section sub-tabs** (horizontal scroll, underlined active in mint per R-N0):
     - `Overview` (default) · `Stocks` · `ETF` · `News` · `Sectors` · `Movers`
     - v1 scope: Overview + Stocks + ETF + News; Sectors + Movers v1.5; drop Crypto / Private Companies / Mutual Fund / Options from Yahoo's set (out of scope)
  3. **Overview content** (close to IMG_5093/94):
     - **RegionChips**: `US` (default selected, mint pill) · `Europe` · `Asia` · "Collapse" link right
     - **IndexList**: S&P 500 · Dow · NASDAQ · Russell 2000 (US set). Each row: color dot (matches multi-line chart) + name + last + filled %-pill (per R-T0.a palette)
     - **MultiLineComparisonChart**: all 4 indices overlaid, normalized to 100% at start of range, color legend dots match IndexList; right edge shows end-value labels per line (per IMG_5093: "-0.27%" "-2.48%")
     - **RangeChips**: `1D · 5D · 1M · 6M · YTD · 1Y · 5Y · ALL` (Yahoo's set; superset of Apple Stocks); active in mint
     - **LastUpdatedStrip** + **HeadlineSummary** (1-line, mint-link "read more")
     - **TrendingNow** section — list of 5 trending symbols (sparkline + filled-pill + a smaller P/L badge for "since your last visit" if user holds)
     - **MostActive** section — same row shape, sorted by volume
     - footer: "View all →"
  4. **Stocks tab**: section chips (Trending stocks / Most actives / Day gainers / Day losers / Undervalued growth / High dividend) + StockRow list under selected chip
  5. **ETF tab** (IMG_5095 model): "Trending ETFs / Most actives" chips + ETF list (TRENDING & MOVERS heading); "DAY GAINERS & LOSERS" heading + chip-toggled list
  6. **News tab**: per-user-interest news (built from positions + watchlist) + general market news
  7. **Sectors tab (v1.5)**: 11 GICS sectors as cards with sparkline + % change; tap → sector detail with constituent ETFs and top stocks
  8. **Movers tab (v1.5)**: full-screen gainers/losers tables with filters (mkt cap / volume / price range)
- **MultiLineComparisonChart spec** (new component, build on existing PriceChart engine)
  - up to 6 series; first series semantic color override (e.g. user holds it) optional
  - palette for non-semantic series: index-distinct hues from the section-accent + sector palette (R-T3/T4) — never use semantic up/down colors here
  - crosshair (per R-I1) tracks all series; tooltip shows all series values at hovered x
  - empty / single-series modes: degrades to standard area chart
- artboards_required
  - `IOSMarketOverview` (matches IMG_5093 structure)
  - `IOSMarketOverviewTrending` (matches IMG_5094 — scrolled past the chart)
  - `IOSMarketETF` (matches IMG_5095)
  - `IOSMarketNews` (placeholder for v1)
  - `MacMarketOverview` — denser, side-by-side: IndexList + Chart left, Trending/MostActive right
  - `MacMarketSectorsHeatmap` (v1.5 placeholder)

### R-N4 (P0) — Trade entry relocation (no central FAB)
- problem with prior central FAB
  - global FAB invites cross-account / cross-profile mistakes; in a 4-tab no-FAB layout there's no good home for it
- new pattern
  - **primary path** — per-symbol: Symbol detail screen has a sticky bottom "Trade" CTA (matches IMG_5097: dark mint button with account dropdown left). symbol + price pre-filled; account dropdown defaults to "last-used for this profile + symbol"
  - **secondary path** — Portfolio tab: NavHeader "..." overflow includes "Record trade" (opens TradeSheet with account = currently-selected in Account Selector, symbol blank)
  - **tertiary path** — Home tab: NavHeader "..." overflow includes "Record trade"
  - **TradeSheet header** retains R-P3 profile-attributed 3-line header in all paths
- artboards_required
  - `IOSSymbolDetailV2TradeCTA` — Symbol detail with sticky bottom Trade button + account dropdown swatch
  - `IOSTradeSheetFromSymbol` — TradeSheet invoked from Symbol, pre-filled values visible
  - `IOSPortfolioOverflowMenu` — Portfolio "..." menu showing "Record trade" item
- supersedes prior `IOSTrade` artboard placement (sheet content survives per R-I2, only invocation path changes)

### R-N5 (P1) — Me tab (was Settings)
- 4th tab; same content as prior Settings (R-P4 profile management + app settings)
- ordering top-to-bottom:
  1. ProfileChip (current profile) — large, tap → switch (duplicates ProfileChip in NavHeader for convenience)
  2. "Profiles" section (manage profiles per R-P4)
  3. "Appearance" (theme / accent / compact)
  4. "Privacy" (3-tier per R-P7 / R-U8)
  5. "Data" (Export / Import / Backup / Clear)
  6. "Market data" (Finnhub status / Yahoo status / refresh rate)
  7. "App" (password change, version, support, sign out)
- artboard_required
  - `IOSMeTab` — full Settings screen rebranded as "Me"

### R-N6 — supersession & cross-references
- **artboards superseded** (mark for removal in v2 canvas):
  - `IOSDashboard` → replaced by `IOSHomeV2`
  - `IOSWatchlist` → content folded into `IOSHomeV2` WatchlistStrip; "View all" deep-link opens `IOSWatchlistFull` (full-screen list, retains StockRow + sort chip + add-symbol footer — keep this artboard, renamed)
  - `IOSAccount` → replaced by `IOSPortfolioPositions` (Positions sub-tab); summary content → `IOSPortfolioSummary`
  - `IOSTrade` (as a primary-FAB-invoked sheet) → repath: invocation becomes per-symbol or per-portfolio per R-N4; sheet visual mostly unchanged (header gets R-P3 profile attribution)
  - mac equivalents: same
- **R-SC1 (Accounts sub-tabs)** is partially superseded:
  - sub-tab structure changes: `Holdings · Activity · Performance · Dividends` → Fidelity-style `Summary · Positions · Activity · Balances`
  - Performance content lives inside `Summary` sub-tab as a mini chart with "View full performance →" deep link that pushes a `PortfolioPerformanceFull` artboard (new)
  - Dividends content lives inside `Summary` sub-tab as a mini card with "View dividends →" deep link → `PortfolioDividendsFull` artboard (new)
  - net change: 4 sub-tabs match Fidelity's mental model, deep details get full-screen real estate when needed
- **R-SC4 (Dashboard NetWorthCard sparkline + range chips)** — folds into R-N1 NetWorthCard spec; no change to component itself
- **R-I5 (⌘K search)** — palette gains a new section "Market" (Yahoo-style trending list) above "Holdings"; on mac is invoked from any tab; in `__all__` view per R-P5, holdings group sub-groups by profile
- **R-U2 (market status)** — fully absorbed by R-N1 MarketStatusStrip + R-N3 Market tab; remove from open list (closed)
- **R-U6 (alerts + earnings + ex-div)** — UpcomingEventsCard lives in R-N1 Home tab; Alerts management lives in R-N5 Me tab; Symbol detail keeps per-symbol "Set alert" / next-ex-div line
- **R-P2 (profile chrome)** — touch-points updated for 4-tab IA:
  - active TabBar item color = profile color **only on Home and Portfolio** (profile-scoped tabs); Market and Me active = mint (profile-agnostic / app-level)
  - sidebar 3px stripe still profile color globally (operator's overall context indicator)
- **R-P5 (all-profiles aggregate view)** — applies only to Home and Portfolio tabs; Market and Me are global and unaffected

### R-N7 deliverables
- [ ] `app.jsx`: replace iOS section's 5 artboards with the new set per R-N6; same for mac section; add Market section
- [ ] `screens-ios.jsx`: implement `IOSHomeV2`, `IOSHomeV2Collapsed`, `IOSWatchlistFull` (renamed), `IOSPortfolioSummary`, `IOSPortfolioPositions`, `IOSPortfolioActivity`, `IOSPortfolioBalances`, `IOSAccountSelectorSheet`, `IOSMarketOverview`, `IOSMarketOverviewTrending`, `IOSMarketETF`, `IOSMarketNews`, `IOSSymbolDetailV2TradeCTA`, `IOSTradeSheetFromSymbol`, `IOSPortfolioOverflowMenu`, `IOSMeTab`, `IOSTabBarV2`
- [ ] `screens-mac.jsx`: implement `MacHomeV2`, `MacPortfolioSummary`, `MacPortfolioPositions`, `MacPortfolioActivity`, `MacPortfolioBalances`, `MacMarketOverview`, `MacMarketSectorsHeatmap` (placeholder), `MacSidebarV2`
- [ ] `components.jsx`: new `MultiLineComparisonChart`, `AccountChip`, `AccountColorStripe`, `MarketStatusStrip`, `IndexRow`, `UpcomingEventCard`; refactor `Sparkline`/`PriceChart` to accept multi-series input
- [ ] `data.jsx`: add `MARKETS` mock (indices · trending · most active · ETFs · sectors); add `account.color` field
- [ ] `design-spec.html`: NEW § "Information Architecture v2" with tab table, content allocation per tab, supersession list (R-N6), MultiLineComparisonChart spec, account color palette (R-N2.b)
- [ ] update `CHANGELOG.md` with the supersession diff so engineering knows which old artboards to ignore

---

## priority_order_for_implementation

0. **R-T0 (BLOCKER)** — token export contract: RGB-triple color tokens, named half-point type scale, `styles.css` minimum set, Inter Variable supply, SSR-safe SVG IDs, lint contract. Every other revision depends on this; nothing else may merge until R-T0 deliverables are complete.
1. **R-N0–N6 (IA BLOCKER)** — 4-tab navigation restructure (Home / Portfolio / Market / Me), Home consolidation, Portfolio = Fidelity-style, Market = Yahoo-style, Trade entry relocated to per-symbol + per-portfolio. Must land alongside R-P0–P3 because every screen artboard changes shape. Without this, every other R-* revision draws against an obsolete IA.
2. **R-P0, R-P1, R-P2, R-P3 (PROFILES BLOCKER)** — multi-profile data model + switcher UI + visual chrome + mutation safety. Same priority as R-N0–N6; profile chrome applies to the new IA per R-N6 supersession rules. R-P0 is also a DB-migration blocker.
3. R-T1, R-T2, R-V1, R-V2 (elevation + grouping — affects every screen, do next; all color values must already be in R-T0.a triple format; respect R-P2 profile-color precedence)
4. R-S1 (states — needed for engineering parity)
5. R-I1 (chart crosshair — signature interaction; also powers R-N3 MultiLineComparisonChart)
6. R-SC1 (Portfolio Activity sub-tab — per R-N6 supersession, Fidelity-style)
7. R-SC2, R-SC3, R-SC4 (screen completeness; CSV import must carry R-P3 profile attribution; R-SC4 folds into R-N1)
8. R-P4, R-P5 (profile management in Me tab per R-N5, all-profiles aggregate view applies to Home + Portfolio only)
9. R-T3, R-T4, R-V3 (accent + dividers — finer hierarchy; respect R-P7 precedence rule)
10. R-I2, R-I3, R-I4 (input + nav + gesture states)
11. U-1, U-3, U-4, U-5 (multi-account aggregation, on-chart positions, trade entry UX, tax holding period — note U-2 closed by R-N1 MarketStatusStrip)
12. R-P6 (per-profile PIN), R-I5, R-A1, R-A2, R-SC5, R-X* (sundries)
13. U-6 (folded into R-N1 UpcomingEventsCard + R-N5 Alerts management), U-7 (revised onboarding), U-8 (3-tier privacy), U-9, U-10
