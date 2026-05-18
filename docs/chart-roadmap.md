# Chart roadmap

> Why v1's `/s/[symbol]` chart is minimal, what comes next, and the
> magnitude estimate. Source of truth for the "Chart polish epic"
> tracked in [BACKLOG.md P3](../BACKLOG.md#p3--v15--post-launch).

## The v1 deliberate floor

M1 shipped a single-mode chart so the rest of the app could land. The
chart you see today on `/s/[symbol]`:

- **TradingView lightweight-charts** area series (close prices)
- **6 range chips** — 1D · 5D · 1M · 6M · 1Y · 5Y · Max — each
  re-fetches `/api/history`
- **No** crosshair, hover, panning, candle mode, OHLC, volume bars,
  cost line, trade markers, event markers, extended-hours overlay,
  or comparison overlay.

This is intentional. M1 deliberately ate the "chart is a toy" debt to
ship the rest of v1 (multi-profile, watchlist, market tab, CSV, etc.).
The decision: **carry the toy through v1, then dedicate a focused
epic in v1.5** rather than scatter chart fixes across M3/M4.

## The gap to a mature chart

Operator audit (2026-05-18) surfaced these missing features. Magnitudes
are working estimates; treat ±50%.

| #   | Gap                                              | Type    | Magnitude |
| --- | ------------------------------------------------ | ------- | --------- |
| 1   | Drag-pan can't fetch earlier data                | Feature | 3-5d      |
| 2   | Line color doesn't reflect range-relative sign   | Style   | 1d        |
| 3   | No candle / OHLC mode                            | Feature | 3-5d      |
| 4   | No extended-hours overlay toggle                 | Feature | 3-5d      |
| 5   | No event markers (dividends / splits / earnings) | Feature | 3-5d      |
| 6   | Daily bars look too coarse on long ranges        | Density | 1-2d      |
| 7   | No crosshair / hover readout (R-I1)              | Feature | 1-2d      |
| 8   | No on-chart cost line + buy/sell markers (U-3)   | Feature | 3-5d      |
| 9   | No tooltip / drag-zoom selection / Y-axis labels | Polish  | 3d        |

**Sum**: 3-4 weeks of focused work (15-25 working days). Coherent epic,
not a scatter.

## Carve-outs

Not everything in the gap waits for v1.5. Two carve-outs:

### 1. Mobile horizontal page-scroll bug — M3 week 1

The chart canvas on mobile sometimes lets the underlying page scroll
horizontally during touch drag. Likely a missing `touch-action: pan-y`
or `overscroll-behavior-x: none` on the chart container. This is a
**bug**, not a missing feature; it deserves a ~30 min fix in M3 week 1,
not a v1.5 wait. Tracked as a `❓ M3 quick-fix candidate` in BACKLOG.

### 2. Multi-line comparison chart — M4

M4 ships a [MultiLineComparisonChart](../references/designs/REVISIONS.md)
(R-N3) on the new Market tab. That's a **new component**, not a change
to the `/s/[symbol]` chart, so it can land independently of this epic.

## Why a coherent epic instead of M3/M4 scatter

If we sprinkle one chart fix per sprint across M3 and M4, three things
go wrong:

1. **No payoff for the user** — one improvement at a time keeps the
   chart in "still feels like a toy" territory for months.
2. **Engineering churn** — most of these touch the same
   `SymbolView.tsx` + `/api/history` boundary. Sequential edits cost
   merge friction; one focused stretch keeps the model in head.
3. **Design coherence** — the toggles (candle, extended hours, events,
   comparison) need consistent affordances. Doing them together yields
   one toolbar; doing them apart yields five awkward switches.

So: park the epic as a **named v1.5 deliverable**, defend it against
"can we just slip one in?" temptations during M3/M4, and bring the
chart from toy to tool in one focused 3-4 week stretch.

## Out of scope for v1 (and probably v1.5)

These were considered and explicitly punted:

- **Real-time tick streaming** — polling 30s in v1; WebSocket is a v2
  consideration if v1 stickiness justifies it.
- **TradingView Charting Library** (the heavy proprietary one) —
  lightweight-charts covers everything in the gap list above; no
  reason to take the heavier dependency.
- **User-drawn annotations** (trendlines, Fibonacci, etc.) — power-
  user feature, not v1 audience.
- **Technical indicators** (MA, RSI, MACD, Bollinger, …) — same.
- **Order-book / depth chart** — not in v1 scope (no trading exec).

## Owner sign-off

When v1 ships and the epic is queued, this file becomes the spec
checklist. Each item lands as a numbered BACKLOG `[ ] chart-N: …`
entry, ticked off here as it ships.

— last updated 2026-05-18, post-M2 close
