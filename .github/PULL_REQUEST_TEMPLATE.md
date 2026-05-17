## what

<!-- 1-3 sentences. What does this PR change, observable to the user or developer? -->

## why

<!-- Link the spec section this PR satisfies:
     - INTERACTION_SPEC.md §X.Y
     - DATABASE_SPEC.md §X
     - references/designs/REVISIONS.md R-Z
     If there's no spec, this is a spec change first — say so. -->

## scope

- [ ] One logical change (no drive-by edits)
- [ ] No `references/designs/*` modifications (those are design contracts)
- [ ] No new dependency unless spec requires it

## contracts (CLAUDE.md non-negotiables)

- [ ] No raw color hex in TSX (token-lint passes)
- [ ] No raw font sizes / inline `style.fontSize|letterSpacing|fontWeight`
- [ ] No `Math.random()` in components (use `React.useId()`)
- [ ] All new TanStack Query keys for profile-scoped data include `profileId` as 2nd element
- [ ] All new profile-scoped mutations are disabled when scope is `__all__`
- [ ] No JS float math for money/quantity
- [ ] Server components fetch via Drizzle directly (no own-host HTTP)
- [ ] SVG components accept explicit `width`/`height` props

## checks

- [ ] `pnpm lint --quiet` passes
- [ ] `pnpm typecheck` passes
- [ ] `pnpm test -- --run` passes (incl. new tests)
- [ ] `pnpm lint:tokens` passes
- [ ] Tested in browser (DESKTOP + iPhone 13 viewport via DevTools)

## screenshots / video

<!-- If UI change, attach. Show all relevant states (loading, empty, error). -->

## ledger

After merge, this PR is recorded in `logs/ledger/decisions.ndjson`. Reviewer ensures the entry is accurate.
