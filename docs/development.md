# development

## first-time setup

```bash
nvm use                                  # Node 20+
pnpm install
cp .env.example .env.local               # fill DATABASE_URL, APP_PASSWORD_HASH, SESSION_SECRET, FINNHUB_API_KEY
pnpm db:migrate
pnpm dev                                 # http://localhost:3000
```

To get a Neon `DATABASE_URL` quickly during dev, use the Neon MCP tool (`mcp__Neon__create_project` etc.) — there's no separate CLI step.

## daily loop

```bash
pnpm dev                                 # in one terminal
pnpm test:watch                          # in another (when working on covered code)
```

Before pushing:

```bash
pnpm lint && pnpm typecheck && pnpm test -- --run && pnpm lint:tokens
```

Or just `pnpm audit:loop` (writes a combined report under `logs/audits/`).

## branching

- `main` — always deployable
- `feat/<short>` — new features
- `fix/<short>` — bug fixes
- `chore/<short>` — tooling, docs, scaffolding
- `db/<short>` — DB migrations (always use the `migration-author` agent)

## commit format

```
<type>(<scope>): <subject>

<optional body>

Co-Authored-By: Claude <noreply@anthropic.com>   # if AI-assisted
```

Types: `feat`, `fix`, `chore`, `db`, `docs`, `test`, `style`, `refactor`, `perf`.

Subjects in present tense, ≤ 60 chars, no period.

## PR conventions

- One logical change per PR. No drive-by edits.
- PR description: paste the relevant `INTERACTION_SPEC` / `DATABASE_SPEC` section the PR satisfies.
- Run `/audit` (Claude command) or `pnpm audit:loop` before requesting review.
- Reviewer (human or `code-reviewer` agent) checks against the 8 non-negotiable contracts in CLAUDE.md.

## environment

- Node 20+ (`.nvmrc`)
- pnpm 9+ (`packageManager` in package.json)
- Postgres 15+ (Neon serverless)
- No Docker required for dev (Neon HTTP driver eliminates local DB)

## conventions

| concern | rule |
|---|---|
| filenames | `kebab-case.ts(x)` for routes/components; `PascalCase` exports |
| imports | absolute via `@/` paths; group by external → @/-prefixed → relative |
| client/server boundary | server by default; `'use client'` only when needed |
| styling | Tailwind utility classes from `@theme inline`; never inline `style={{}}` for color/size/spacing |
| data fetching | server components: Drizzle direct; client: TanStack Query via `useProfileScopedQuery` |
| forms | React Hook Form + Zod schema (shared with API route validation) |
| dates | always `timestamptz`; format via `lib/date.ts` (sprint 2) |
| money | `decimal.js` on client; `numeric` in DB; never JS float |

## debugging

- DB queries: `pnpm db:studio` opens Drizzle Studio
- React state: TanStack Query Devtools is mounted in `_app` (dev only)
- Slow query: add `EXPLAIN ANALYZE` against Neon directly via `mcp__Neon__run_sql`

## when stuck

1. Re-read the relevant spec section.
2. Check `BACKLOG.md` ❓ open questions — your problem may already be flagged.
3. Run `pnpm audit:loop` — sometimes lint catches the issue.
4. If genuinely blocked, add a `[?]` entry to `STATUS.md` and stop work on that thread.
