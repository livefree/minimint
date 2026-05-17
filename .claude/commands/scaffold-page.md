---
description: Scaffold a new page under app/ from INTERACTION_SPEC.md §3 contract. Args: $ARGUMENTS = page name (e.g., "portfolio.balances" or "s/[symbol]")
---

Scaffold a new Next.js page named `$ARGUMENTS`.

Steps:

1. Confirm the page exists in `INTERACTION_SPEC.md §2 route map`. If not, refuse and ask the user to add it to the spec first.
2. Read the corresponding `§3` page inventory contract for that route. Note: render mode (server vs client), queries, mutations, primary CTAs, state matrix.
3. Create the file under `app/<route>/page.tsx`:
   - server component by default; client component only if state/event handlers required
   - import canonical layout from `(app)/layout.tsx`
   - wrap content in `<Surface fallback={...}>` HOCs for each declared state
   - use TanStack Query keys from `§7.2` — NEVER invent new key shapes
4. Create matching loading skeleton at `app/<route>/loading.tsx` per `§9` state matrix
5. Create matching error boundary at `app/<route>/error.tsx`
6. Add a stub unit test at `tests/unit/app/<route>.test.tsx` that asserts the page renders the spec'd top-level sections
7. Append to `logs/ledger/decisions.ndjson`:
   ```json
   {"ts":"...","by":"scaffold-page","route":"$ARGUMENTS","spec_section":"§3.X"}
   ```

Do NOT implement business logic — only scaffold the structure. Hand off to design-implementer agent for the visual port.
