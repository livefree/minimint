# STATUS

> Living document. Update at the START and END of every meaningful unit of work.

## current sprint

**Sprint 0 · Framework Scaffolding** — **DONE** (closed 2026-05-17)

- [x] `INTERACTION_SPEC.md`, `DATABASE_SPEC.md` finalized
- [x] Design canvas v2 ~80% (round-2 deferred to post-M1 feedback per MVP_PLAN §0)
- [x] Root directory structure + AI framework
- [x] `pnpm install` + `pnpm dev` proof (cab2658)
- [x] Yahoo-finance2 probe validated 23/23 endpoints (5f558e3 · `logs/probes/ANALYSIS.md`)
- [x] v1 schema authored + 0000 migration generated (8e62c08)
- [x] Neon dev project provisioned (`proud-pine-87759784`)
- [x] 0000 migration applied to dev DB · 3 stored functions smoke-tested with correct arithmetic
- [x] 0001 migration: DB-level `gen_random_uuid()` defaults on UUID PK columns (so raw SQL inserts work)

## current sprint (active)

**Sprint 1 · M1 "See a stock"** — starting

See [`MVP_PLAN.md` §2](MVP_PLAN.md) for full M1 brief. Vertical slice; ship to Vercel; operator tests on phone + desktop.

- **goal**: operator logs in on phone or desktop → enters `/s/AAPL` → sees live price + 1Y chart
- **owner**: AI agents (design-implementer + claude + test-writer) with operator gating
- **deliverables**:
  - [ ] `lib/market/yahoo.ts` adapter (Vitest unit-tested)
  - [ ] `/api/quote/[symbol]` + `/api/history/[symbol]` Route Handlers (writes through quote_cache + prices_daily)
  - [ ] Single-password auth (`lib/auth/session.ts` + `/api/auth/login` + middleware)
  - [ ] `/login` UI
  - [ ] `scripts/seed.ts` bootstraps `app_settings` row from env (real impl, no longer stub)
  - [ ] `app/(app)/s/[symbol]/page.tsx` — Hero + lightweight-charts area chart with range chips
  - [ ] Vercel project + Neon prod project + first deploy
  - [ ] Playwright e2e for login → quote round-trip
- **exit criteria**: see [`MVP_PLAN.md` §2 acceptance criteria](MVP_PLAN.md)
- **blockers**: none
- **target**: in operator's hand by 2026-05-22

## next sprint

**Sprint 2 · M2 "Record my first trade"** (planned, see [`MVP_PLAN.md` §3](MVP_PLAN.md))

Starts only after M1 acceptance + operator feedback.

## what's NOT in scope right now

- Market tab, watchlists, multi-profile UI — M3+
- CSV import, dividends UI, onboarding wizard — M4
- Alert push triggers, FIFO tax, offline write queue, per-profile PIN — v1.5
- Design canvas round-2 — deferred until M1 user feedback

## decision log pointer

For the full decision history, see [`logs/ledger/decisions.ndjson`](logs/ledger/decisions.ndjson).
Major architectural choices are in [`docs/adr/`](docs/adr/).

## status conventions

- `[ ]` = todo · `[~]` = in progress · `[x]` = done · `[!]` = blocked · `[?]` = needs clarification
- Sprints map 1:1 to MVP milestones from `MVP_PLAN.md`
- "what's NOT in scope" prevents scope creep — when in doubt, defer
