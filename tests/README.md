# tests/

Test code. See [`docs/testing.md`](../docs/testing.md) for strategy.

## layout

```
tests/
├── setup.ts                    # global setup (jest-dom matchers, MSW server)
├── _factories/                 # makeProfile(), makeAccount(), makeBuy()...
├── unit/                       # Vitest, jsdom; mirrors source paths
├── integration/                # Vitest + MSW; multi-component flows
└── e2e/                        # Playwright; full user flows
```

## run

```bash
pnpm test                    # all unit + integration once
pnpm test:watch              # watch
pnpm test:e2e                # Playwright headless
pnpm test:e2e:ui             # Playwright UI mode
```

## conventions

- `*.test.ts(x)` for unit/integration; `*.spec.ts` for e2e (Playwright default)
- Test files mirror source location (`tests/unit/lib/portfolio.test.ts` tests `lib/portfolio.ts`)
- Factories ONLY for test data; never inline literals
- See `docs/testing.md` for full rule set
