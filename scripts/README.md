# scripts/

One-off and recurring dev scripts. Run via `tsx scripts/<name>.ts` or `node scripts/<name>.mjs`.

## current

- `lint-tokens.mjs` — enforces R-T0 design-token contracts in TSX (`CLAUDE.md` non-negotiable #1, #2). Wired to `pnpm lint:tokens`.
- `post-edit-hook.mjs` — Claude Code post-edit hook; quick-checks recently modified TSX for the same contract violations and prints warnings (non-blocking). Not run in CI.
- `seed.ts` — seeds demo data (profiles · accounts · transactions · watchlists) for design-parity testing. Disabled in production; only runs when `DEMO_MODE=true` or with `--force`.
- `audit-loop.ts` — orchestrates `pnpm lint && pnpm typecheck && pnpm test && pnpm lint:tokens` and writes a combined report to `logs/audits/`.

## rules

- Scripts MAY use top-level await, ESM, env vars.
- Scripts MUST be idempotent unless explicitly destructive (and then prompt for confirmation).
- Scripts that write to logs/ledger/decisions.ndjson use the same schema as agents (see logs/README.md).
