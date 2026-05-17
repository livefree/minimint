# ADR-0002: multi-profile tenant model

- **Status**: accepted
- **Date**: 2026-05-15
- **Deciders**: human + Claude

## Context

Scope grew from "single user tracker" to "household operator managing multiple family members' portfolios". Operator (the human) is one, but they manage 1-5 family profiles. Need: switch between profiles without re-login, prevent cross-profile data leak (especially mis-recording a trade), keep market data shared (one Finnhub call benefits all).

## Decision

**Three-tier hierarchy: `operator → profile → account → holdings/transactions`.**

- One operator, one app password (single auth boundary).
- Profile is a workspace, not an identity. Switching is a scope mutation, not a route change.
- Every profile-scoped table has `profile_id NOT NULL FK ... ON DELETE CASCADE`.
- Market data (`securities`, `quote_cache`, `prices_daily`, `dividends_announced`, `splits`, `earnings_calendar`) is global (no `profile_id`).
- Profile switching: cookie `mm.profile` + Zustand mirror; query keys include `profileId` as second element, cache naturally segments.
- UI: every screen visibly bound to a profile color (R-P2 chrome) to prevent cross-profile mis-action. Visual changes are pre-attentive, not requiring user attention.
- Mutations refuse the reserved virtual id `__all__` (which means "household aggregate read-only view").
- Optional per-profile PIN for casual snooping protection — not a true identity boundary.

## Consequences

- (+) Clean isolation: one operator can never accidentally write to another profile's data via UI (profile context in chrome + Trade Sheet header per R-P3)
- (+) Single Finnhub key, single DB schema, single deploy — no per-tenant infrastructure
- (+) Query caches segment automatically via key — no manual eviction needed on profile switch
- (+) Future multi-operator is incremental (add `operators` table + `profiles.owner_operator_id`); no rewrite
- (−) Every profile-scoped query and mutation must remember `profile_id` — enforced by `useProfileScopedQuery` wrapper that throws at dev time
- (−) Reserved `__all__` id complicates UI logic — mutations must be disabled in this mode; handled by `useProfileMutation` wrapper
- (−) Wash sale + holding period rules are per-profile (IRS treats each profile as a separate taxpayer); spec must call this out explicitly

## Alternatives considered

- **One DB per profile** — rejected: operational complexity, no win at this scale
- **Postgres Row-Level Security** — rejected: overkill for single-operator; app-layer enforcement is sufficient + clearer
- **Multi-operator from day 1** — rejected: no near-term need; YAGNI
- **Profile = full identity boundary with separate logins** — rejected: operator wants to *manage* family, not lock themselves out

## References

- [`references/designs/REVISIONS.md` § profiles (R-P0..P7)](../../references/designs/REVISIONS.md)
- [`DATABASE_SPEC.md §1.2, §3.2`](../../DATABASE_SPEC.md)
- [`INTERACTION_SPEC.md §1.3, §10`](../../INTERACTION_SPEC.md)
