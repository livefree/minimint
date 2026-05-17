# STATUS

> Living document. Update at the START and END of every meaningful unit of work.

## current sprint

**Sprint 0 · Framework Scaffolding** — in progress

- **goal**: lay the AI-driven dev framework (this scaffolding); no app feature work yet
- **owner**: AI + human review
- **deliverables**:
  - [x] `INTERACTION_SPEC.md`, `DATABASE_SPEC.md` finalized
  - [x] Design canvas v2 mostly done (~80%, per [audit](references/designs/REVISIONS.md))
  - [x] Root directory structure
  - [x] `CLAUDE.md` + `AGENTS.md` + `.claude/` agents & commands
  - [x] `package.json` + tsconfig + Next.js + Drizzle + lint configs
  - [x] CI workflow + PR template + ADR template
  - [x] First `pnpm install` + `pnpm dev` proof (cab2658 · 5 routes built · /api/health returns valid JSON · token classes render in HTML)
  - [ ] First Neon DB project created + initial migration applied
- **blockers**: none
- **exit criteria**: `pnpm dev` shows a login screen; `pnpm test` runs (0 tests OK); CI green on first commit

## next sprint

**Sprint 1 · Auth + Profile + Home stub** (planned, not started)

- goal: end-to-end vertical slice
- deliverables (preview):
  - login flow (R-T0.b form, bcrypt, jose cookie)
  - profile create + switch (R-P0/P1)
  - Home tab shell with NetWorthCard reading real Neon data (no live quotes yet)
- exit criteria: operator can log in, create a profile, see (zero-state) Home

## what's NOT in scope right now

- Real Finnhub / yahoo-finance2 integration (Sprint 2)
- Chart rendering (Sprint 3)
- CSV import (Sprint 4)
- Alerts, push notifications, offline write queue (v1.5)

## decision log pointer

For the full decision history, see [`logs/ledger/decisions.ndjson`](logs/ledger/decisions.ndjson).
Major architectural choices are in [`docs/adr/`](docs/adr/).

## status conventions

- `[ ]` = todo · `[~]` = in progress · `[x]` = done · `[!]` = blocked · `[?]` = needs clarification
- Sprints are 1-2 week chunks; "current" + "next" only, no long-range gantt
- "what's NOT in scope" prevents scope creep — when in doubt, defer
