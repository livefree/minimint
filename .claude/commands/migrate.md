---
description: Run the migration-author agent for a schema change. Args: $ARGUMENTS = short description of the change.
---

Use the `migration-author` agent to handle this schema change.

Pass the agent: `$ARGUMENTS` as the change description plus instructions to:
1. Verify the change is reflected in `DATABASE_SPEC.md` first; if not, update spec before code
2. Generate the migration via `drizzle-kit generate`
3. Hand-review the generated SQL
4. Apply to local Neon branch
5. Write rollback notes
6. Append to decisions ledger

Do NOT run the agent for ad-hoc DB tweaks without spec alignment.
