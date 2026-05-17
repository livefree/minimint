# Architecture Decision Records

A record of architectural choices, why we made them, what we rejected, and what they cost.

## why

When future you (or future AI) reads the codebase and wonders "why on earth is it done this way?", an ADR is the answer. Without ADRs, knowledge evaporates and decisions get re-litigated.

## format

Each ADR is a markdown file `NNNN-kebab-slug.md`:

```markdown
# ADR-NNNN: <title>

- **Status**: proposed | accepted | superseded by ADR-NNNN | deprecated
- **Date**: YYYY-MM-DD
- **Deciders**: human + AI agents involved

## Context

Why this decision was needed. What forces were at play.

## Decision

What we decided. One paragraph.

## Consequences

- Positive: ...
- Negative: ...
- Neutral: ...

## Alternatives considered

- Option A — rejected because ...
- Option B — rejected because ...

## References

Links to specs, PRs, threads.
```

## when to write one

Write an ADR when:
- You picked one stack option over a credible alternative (DB type, framework, library, lint rule).
- You made a non-obvious tradeoff (perf vs simplicity, flexibility vs safety).
- You set an invariant that later code must respect.
- The choice would surprise a competent engineer coming in cold.

Don't write an ADR for:
- Naming a variable, picking an icon, choosing tab order.
- Bug fixes (use commit messages).
- Easy reversible decisions.

## ADR index

| # | title | status |
|---|---|---|
| 0001 | [stack selection](./0001-stack-selection.md) | accepted |
| 0002 | [multi-profile tenant model](./0002-multi-profile-tenant.md) | accepted |
| 0003 | [postgres functions for derived positions](./0003-postgres-functions-for-positions.md) | accepted |

Add new entries above the table in chronological order; never renumber.
