# ADR-0003: Postgres functions for derived positions

- **Status**: accepted
- **Date**: 2026-05-16
- **Deciders**: human + Claude

## Context

Positions, cost basis, today's P/L are read 10× more often than transactions are written. They must always reflect the latest transaction (single source of truth — see DATABASE_SPEC §1.1). Three options for "where to compute":

1. App layer (TypeScript walks transactions for each query)
2. Postgres view / materialized view
3. Postgres function (`STABLE`)

## Decision

**Stored functions** (`get_positions`, `get_my_position`, `get_net_worth`, plus future `get_realized_pl_lots`, `get_wash_sale_candidates`).

## Consequences

- (+) Closer to data → fewer round-trips, lower latency (one SQL call vs N transactions fetched + computed in Node)
- (+) Always in sync — re-derives on every call, no staleness window
- (+) Same function callable from any client (app, scripts, ad-hoc SQL via Drizzle Studio or Neon SQL editor)
- (+) Split adjustment, currency conversion (future), tax-method (avg vs FIFO) all encapsulated in DB layer — app stays thin
- (−) SQL is harder to debug than TypeScript for some engineers; mitigated by extensive comments + unit tests with fixture data
- (−) Drizzle doesn't generate types for function returns — must hand-write TS types matching the function signature; lint catches drift
- (−) Migration churn higher (every function tweak is a migration); mitigated by `CREATE OR REPLACE FUNCTION` (idempotent)

## Alternatives considered

- **App-layer computation** — rejected: N+1 round trips for batched portfolio reads; would force complex client cache invariants on split/dividend adjustment
- **Materialized view** — rejected at v1: introduces staleness window, refresh scheduling complexity; revisit if operator scales to thousands of profiles (then mv + scheduled refresh becomes the cleaner answer)
- **Triggers that maintain a `positions` snapshot table** — rejected: doubles the write path, easy to drift, hard to backfill on schema changes

## References

- [`DATABASE_SPEC.md §6`](../../DATABASE_SPEC.md) — full function bodies and signatures
- [`INTERACTION_SPEC.md §7.5`](../../INTERACTION_SPEC.md) — invalidation cascade that depends on these functions
