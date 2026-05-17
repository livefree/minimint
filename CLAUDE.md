# CLAUDE.md — project context for AI agents

> Single canonical entry point for Claude Code (and via `AGENTS.md` symlink, any other AI coding agent). Read this first; everything else is reachable from here.

## what is this project

**mini-mint** — a personal US-stock investment tracker designed for a household operator managing multiple family members' portfolios. PWA on Next.js 15, deployed to Vercel + Neon Postgres.

Status: **pre-implementation**. Architecture, design, interaction, and database specs are complete (~140K of locked decisions). Next phase: scaffolding + sprint 1 implementation.

## source of truth — read order

For any non-trivial task, read these in order before writing code:

1. **`stock-app-1-2-moonlit-dawn.md`** — overall architecture, tech stack lock-in, PWA strategy
2. **`INTERACTION_SPEC.md`** — every page, route, button, modal, list, state transition; **query keys + invalidation cascade** (§7); cross-cutting flows (§11); library choices (§16)
3. **`DATABASE_SPEC.md`** — Postgres schema DDL, Drizzle structure, indexes, derived `get_positions` function, migration strategy
4. **`references/designs/REVISIONS.md`** — design intent, token contracts (R-T0), multi-profile rules (R-P*), 4-tab IA (R-N*), interaction (R-I*), states (R-S*), accessibility (R-A*), user-perspective (U-*)
5. **`references/designs/styles.css`** — actual token values (RGB triples per R-T0.a, role-based type sizes per R-T0.b, Inter Variable supply per R-T0.e)
6. **`docs/development.md`** — workflow, conventions, commit format
7. **`STATUS.md`** — what's in flight right now
8. **`BACKLOG.md`** — prioritized open work

## stack (locked — do not deviate without ADR)

| concern | choice |
|---|---|
| framework | Next.js 15 App Router · TypeScript |
| styling | Tailwind v4 + `@theme inline` consuming `styles.css` tokens; shadcn/ui base |
| server state | TanStack Query v5 |
| client state | Zustand (global) · nuqs (URL params) · React Hook Form + Zod (forms) |
| db / orm | Neon Postgres + `@neondatabase/serverless` + Drizzle ORM |
| auth | bcrypt password + jose JWT in cookie |
| charts | TradingView lightweight-charts (price detail) · hand-rolled SVG (spark/donut/multi-line) |
| overlays | vaul (sheets) · Radix via shadcn/ui (modal/popover/menu) · sonner (toast) |
| motion | framer-motion (gestures + AnimatePresence) |
| testing | Vitest (unit) · Playwright (e2e) |
| package manager | pnpm |
| node | 20+ (`.nvmrc`) |

## non-negotiable engineering contracts

These are derived from `REVISIONS.md` R-T0.g and locked. Lint rules enforce them; CI fails if violated.

1. **No raw color hex in JSX or component CSS.** Use `rgb(var(--mint))` or Tailwind `bg-mint`. The only place hex is allowed is `styles.css`.
2. **No raw numeric font sizes.** Use role-based utilities (`.t-meta`, `.t-row`, `.t-display`, …) defined in `styles.css`. No `text-[13.5px]` arbitrary values; no `style={{ fontSize: 13.5 }}`.
3. **No `Math.random()` in SVG IDs.** Use `React.useId()` (SSR-safe).
4. **Every TanStack Query key for profile-scoped data MUST include `profileId` as the second element.** Use `useProfileScopedQuery()` wrapper — it throws at dev time if violated.
5. **Every mutation that writes profile-scoped data MUST be disabled when `currentProfileId === '__all__'`.** Use `useProfileMutation()` wrapper.
6. **All decimal math goes through `numeric`-typed columns and `decimal.js` (or equivalent) on the client.** No JS floats for money or quantity.
7. **Server components fetch via Drizzle directly.** No same-host HTTP round-trips. API routes exist only for client mutations + external proxy.
8. **Every SVG sparkline/chart used in server components must accept its own width/height props** — no relative sizing during SSR (causes hydration mismatch).

## directory structure

```
/
├── CLAUDE.md, AGENTS.md, README.md, STATUS.md, BACKLOG.md
├── INTERACTION_SPEC.md, DATABASE_SPEC.md, stock-app-1-2-moonlit-dawn.md   # specs
├── .claude/             # agents · commands · settings · hooks
├── .github/             # CI workflows · templates
├── app/                 # Next.js App Router pages
├── components/          # reusable React components (ui/ = shadcn target)
├── db/                  # Drizzle: client, schema, queries, mutations, migrations
├── lib/                 # utilities; market/ = data adapters (finnhub.ts, yahoo.ts)
├── docs/                # development.md, testing.md, deployment.md, adr/, runbooks/
├── logs/                # AI agent logs, audit outputs, decision ledger
├── public/              # static assets, manifest, icons
├── references/          # design canvas + design specs (do not modify casually)
├── scripts/             # seed, lint-tokens, audit-loop
└── tests/               # unit, integration, e2e
```

## task patterns (consult before starting)

| if the task is… | start here |
|---|---|
| add a new page | `/scaffold-page` slash command → INTERACTION_SPEC §3 page contract |
| add a mutation + invalidation | `/add-mutation` → INTERACTION_SPEC §6 catalog + §7.5 cascade |
| add a DB migration | `/migrate` → DATABASE_SPEC §8 + use `migration-author` agent |
| review a PR | `/audit` → use `code-reviewer` agent; checks against the 8 contracts above |
| write tests | use `test-writer` agent → docs/testing.md |
| convert a design artboard to React | use `design-implementer` agent → reads `references/designs/screens-*.jsx` |
| log a decision worth remembering | `/checkpoint` → appends to `logs/ledger/decisions.ndjson` + ADR if architectural |

## ai operating principles

- **Always check the relevant spec section before writing.** If you can't find the spec for what you're about to build, stop and ask — don't invent.
- **One PR per logical change.** No drive-by edits.
- **Update `STATUS.md`** at start and end of every meaningful unit of work; append to `logs/ledger/decisions.ndjson` for architectural choices.
- **If you discover a spec gap or contradiction**, do NOT silently choose — surface it as a new `❓ open question` entry in `BACKLOG.md` and proceed only after confirmation, or flag and stop.
- **Tests live next to the change.** Never merge a feature without unit (Vitest) coverage; e2e for user-visible flows.
- **Run** `pnpm lint && pnpm typecheck && pnpm test` **before claiming done.**
- **Be honest about uncertainty.** If a verification step fails or is skipped, say so explicitly — don't paper over.

## what NOT to do

- Don't modify `references/designs/*` files without explicit user request — those are design contracts.
- Don't bypass the lint rules in §"non-negotiable engineering contracts" with `// eslint-disable-next-line` to ship faster.
- Don't introduce new dependencies without checking if an already-listed library can do the job (see STACK table above).
- Don't write your own bottom-sheet / popover / context-menu / toast / form library — use the locked picks from §"stack".
- Don't fetch market data client-side — always proxy through `/api/*` so the Finnhub key never leaks to the browser.
- Don't render profile names in chromatically-loud places without privacy-mode awareness (see U-8).
- Don't create planning docs unless asked; this CLAUDE.md + the spec set is the planning surface.
