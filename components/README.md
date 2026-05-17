# components/

Reusable React components.

## structure

- `ui/` — shadcn/ui-generated primitives (Button, Dialog, Popover, Tabs, Toggle, etc.). Generated via `pnpm dlx shadcn add <name>`; do not hand-edit beyond renames.
- domain components live at the top level: `StockRow.tsx`, `PositionRow.tsx`, `PriceText.tsx`, `Sparkline.tsx`, `ProfileChip.tsx`, etc.

## rules (enforced by lint + reviewer)

- Server component by default; mark `'use client'` only when needed.
- No raw color hex; no raw font sizes (CLAUDE.md non-negotiables).
- Every visual component imported from `references/designs/components.jsx` must be ported once and only once — no copy-paste duplication across screens.
- Domain components that read scope state (current profile, privacy level) read it from the Zustand store, not from props drilling.
- Charts and SVG components accept explicit `width`/`height` props (no fluid sizing during SSR).

## porting workflow

When porting a design canvas component into production, use the `design-implementer` agent. See `.claude/agents/design-implementer.md`.
