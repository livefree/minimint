# testing

Three layers, one rule: **test observable behavior, not implementation.**

## layers

### unit (Vitest + jsdom)

- target: pure functions, hooks, simple components
- location: `tests/unit/**/*.test.ts(x)`
- mirrors source path (e.g., `tests/unit/lib/portfolio.test.ts` for `lib/portfolio.ts`)
- coverage minimum: 80% lines for `lib/**`, 60% for components (pragmatic)

### integration (Vitest + jsdom + MSW)

- target: component + hooks + RHF + Zustand interaction
- location: `tests/integration/**/*.test.tsx`
- MSW mocks `/api/*` routes; never hit real Finnhub/Yahoo in unit/integration

### e2e (Playwright)

- target: critical user flows end-to-end
- location: `tests/e2e/**/*.spec.ts`
- runs against `pnpm dev` (config auto-starts it)
- Chromium + iPhone 13 viewport mandatory; tablet optional

## what to test (per spec)

| spec section | minimum coverage |
|---|---|
| INTERACTION_SPEC §3 (page contract) | each page: renders, all state-matrix variants, primary CTA fires |
| INTERACTION_SPEC §6 (mutations) | success / validation error / server error / invalidation propagation |
| INTERACTION_SPEC §7.5 (invalidation cascade) | one test per mutation that asserts the right query keys invalidate |
| INTERACTION_SPEC §9 (state matrix) | one test per state per surface |
| INTERACTION_SPEC §11 (cross-cutting flows) | one e2e test per flow |
| DATABASE_SPEC §6 (derived functions) | SQL function tests via direct Drizzle call against test Neon branch |
| DATABASE_SPEC §7 (tax queries) | input/output fixtures; cover edge cases (wash sale ±30d boundary) |

## rules

- ✓ Use `@testing-library/react` queries by role/text
- ✗ Never query by class or test ID unless no alternative exists
- ✗ Never test "calls `setState`" or "uses `useEffect`" — meaningless
- ✓ Snapshot tests OK for very small SVG components; reject if > 30 lines
- ✓ Generate test data via factories (`tests/_factories/`) — never inline literals
- ✓ Test names: `it('shows error when password wrong')`, not `it('handles auth')`

## commands

```bash
pnpm test                # run once
pnpm test:watch          # watch mode
pnpm test -- portfolio   # filter
pnpm test -- --coverage  # with v8 coverage
pnpm test:e2e            # Playwright headless
pnpm test:e2e:ui         # Playwright UI mode
```

## CI

`pnpm test -- --run` runs in GitHub Actions on every push (see `.github/workflows/ci.yml`). E2E currently runs on PR + push to main; tagged for nightly extension.

## fixtures and factories

Lives in `tests/_factories/`:

- `profile.ts` — `makeProfile()`, `makeProfileWithAccounts(n)`
- `account.ts` — `makeAccount({ tax_method, color_slot })`
- `transaction.ts` — `makeBuy(...)`, `makeSell(...)`, `makeDividend(...)`
- `quote.ts` — `makeQuote({ price, change })`

Use these in every test that needs domain data. They centralize the canonical shape.

## test DB

- E2E + integration use a Neon test branch automatically provisioned in CI via `mcp__Neon__create_branch`.
- Local: set `DATABASE_URL_TEST` in `.env.local`; tests use this when present, else skip integration.
- Each test cleans its own data (TRUNCATE in `afterEach`).
