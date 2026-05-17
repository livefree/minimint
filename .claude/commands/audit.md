---
description: Run a full audit loop — lint + typecheck + tests + spec drift check via the code-reviewer agent.
---

Run a complete audit of the current working tree:

1. Print `git status` and `git diff --stat` so the audit scope is visible.
2. Run in parallel (single message, multiple Bash calls):
   - `pnpm lint --quiet`
   - `pnpm typecheck`
   - `pnpm test -- --run`
   - `pnpm lint:tokens`
3. If any of (1) fails, summarize the failures.
4. Launch the `code-reviewer` subagent to check spec alignment of the current diff.
5. Save the combined report to `logs/audits/audit-<iso-timestamp>.md` with sections:
   - Summary (pass/fail per gate)
   - Lint output
   - Typecheck output
   - Test output (with coverage if available)
   - Token-lint output
   - code-reviewer report (full)
   - Recommendations (ranked)
6. Append a decision-ledger entry referencing the audit file.

Output a concise summary to the user (< 25 lines).
