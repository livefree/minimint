# mini-mint

Personal US-stock investment tracker for household operators (you + family). Cross-platform PWA. Multi-profile · multi-account · Apple-Stocks + Yahoo-Finance-inspired UX · dark-first.

> **AI-driven project.** Start at [`CLAUDE.md`](./CLAUDE.md).

## docs

- [`CLAUDE.md`](./CLAUDE.md) — primary entry for any AI agent
- [`STATUS.md`](./STATUS.md) — current sprint
- [`BACKLOG.md`](./BACKLOG.md) — prioritized work
- [`stock-app-1-2-moonlit-dawn.md`](./stock-app-1-2-moonlit-dawn.md) — architecture plan
- [`INTERACTION_SPEC.md`](./INTERACTION_SPEC.md) — pages, routes, mutations, flows
- [`DATABASE_SPEC.md`](./DATABASE_SPEC.md) — schema, indexes, derived functions
- [`references/designs/REVISIONS.md`](./references/designs/REVISIONS.md) — design canvas spec
- [`docs/`](./docs/) — development · testing · deployment · ADRs

## quick start

```bash
pnpm install
cp .env.example .env.local
# edit .env.local: DATABASE_URL, FINNHUB_API_KEY, APP_PASSWORD_HASH, SESSION_SECRET
pnpm db:migrate
pnpm dev
```

Open http://localhost:3000.

## scripts

| command | what |
|---|---|
| `pnpm dev` | Next.js dev server |
| `pnpm build` | production build |
| `pnpm start` | run prod build |
| `pnpm lint` | ESLint |
| `pnpm typecheck` | `tsc --noEmit` |
| `pnpm test` | Vitest unit tests |
| `pnpm test:e2e` | Playwright e2e |
| `pnpm db:generate` | Drizzle: generate migration from schema diff |
| `pnpm db:migrate` | apply pending migrations |
| `pnpm db:studio` | Drizzle Studio |
| `pnpm seed` | seed demo data |
| `pnpm lint:tokens` | custom: enforce design-token contracts |

## license

Personal use only. No public distribution.
