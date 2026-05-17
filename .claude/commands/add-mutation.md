---
description: Add a new mutation following INTERACTION_SPEC §6 catalog + §7.5 invalidation cascade. Args: $ARGUMENTS = mutation name (e.g., "transactions.create" or "watchlist.add").
---

Add the mutation `$ARGUMENTS`.

Steps:

1. **Locate** `$ARGUMENTS` in `INTERACTION_SPEC.md §6 button/action catalog`. If absent → spec gap, stop and ask user to add the row first.
2. **Read** the corresponding invalidation rule in `§7.5`.
3. **Write the API route handler** at `app/api/<domain>/<verb>/route.ts`:
   - Validate input with Zod schema (shared between client + server)
   - Authenticate via session cookie middleware
   - For profile-scoped mutations: verify `profileId` from cookie matches input (or matches via account FK chain)
   - Reject if scope is `__all__`
   - Use Drizzle transaction for multi-row writes
   - Return `{ ok: true, data: <created> }` or `{ ok: false, error: { code, message, fieldErrors? } }`
4. **Write the client wrapper** in `db/mutations/<domain>.ts`:
   - `useApiMutation` wrapper auto-invalidates per the declarative manifest entry
   - Add the manifest entry to `db/mutations/invalidation-manifest.ts`
5. **Wire it into the calling UI** per the spec entry's "trigger" location.
6. **Tests** (via test-writer agent):
   - Unit: schema validates accepted + rejects malformed inputs
   - Integration: client wrapper triggers correct invalidations
   - E2E: full user flow if it's a primary CTA (e.g., trade record)
7. **Append decision** to `logs/ledger/decisions.ndjson`.

The mutation should be reachable via the wrappers — don't expose `fetch` calls in components.
