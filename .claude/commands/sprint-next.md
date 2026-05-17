---
description: Pull the top P0 item from BACKLOG and ship it as one commit. Stops after one item — never auto-chains.
---

> Core sprint loop. M2 cadence: one item per invocation, full quality gates, mandatory pause for visual review on UI work.

## Procedure

### 1. Orient

- Read `STATUS.md` and `BACKLOG.md`
- Identify the **top unchecked P0 item** (current sprint)
- If P0 is empty, stop and recommend `/milestone-close`
- If the top item is `❓ open question`, stop and ask the user — never auto-decide

### 2. Plan (output to user, then pause for ack)

Output a short plan card:

```
NEXT: <BACKLOG item text>
SPEC ANCHOR: <which section of INTERACTION_SPEC / DATABASE_SPEC / REVISIONS governs this>
AGENT: <design-implementer | migration-author | test-writer | direct>
FILES (expected): <list>
QUALITY GATES: lint · typecheck · vitest · lint:tokens · (code-reviewer agent) · (playwright if UI)
PAUSE POINTS: <when you'll stop for visual review or confirmation>
EST. SCOPE: <S/M/L>
```

**Wait for the user to say "go" (or equivalent) before any code change.** Do not edit files in step 2.

### 3. Execute

- Spawn the chosen sub-agent OR work directly if the task is small (<3 files, no new abstractions)
- Sub-agent prompt must always include:
  - Full BACKLOG item text + spec anchor reference
  - The 8 non-negotiable contracts from CLAUDE.md
  - "Stop and ask before introducing any new dependency"
- While agent runs, do nothing else — wait for its report

### 4. Self-check (run in parallel)

- `pnpm lint --quiet`
- `pnpm typecheck`
- `pnpm test -- --run`
- `pnpm lint:tokens`

If ANY fails:

- Diagnose root cause (do not bypass with `--no-verify`, `eslint-disable`, etc.)
- Fix and re-run
- If fix touches the spec, stop and surface as `❓` in BACKLOG

### 5. Review pass

- Launch `code-reviewer` sub-agent on the working-tree diff
- If it returns any P0/P1 issue → fix and re-launch
- Only proceed when review is clean

### 6. Visual review (UI changes only)

- Start `pnpm dev` in background
- Print to user:
  ```
  VISUAL REVIEW NEEDED
  - URL: http://localhost:3000/<relevant route>
  - Look for: <2-3 specific things tied to the BACKLOG item>
  - Compare against: references/designs/<artboard file>
  ```
- **Stop and wait** for user to say "looks good" or "fix X"
- If "fix X" — go back to step 3 with the feedback

### 7. Commit

- Stage only files relevant to this BACKLOG item (no stray edits)
- Commit message format:

  ```
  <type>(<scope>): <imperative summary tied to BACKLOG item>

  <2-3 sentences on why / what changed / spec section satisfied>

  Co-Authored-By: Claude Opus 4.7 <noreply@anthropic.com>
  ```

- Run `pnpm exec playwright test` if the item touches a user-visible flow (M2: trade record, position view)

### 8. Update tracking (in this order)

- Mark item `[x]` in `BACKLOG.md`
- Update `STATUS.md` current sprint checklist
- Append decision-ledger entry:
  ```json
  {"ts":"<iso8601>","by":"sprint-next","kind":"deliverable","summary":"<item>","commit":"<short>","files":<n>}
  ```
- Commit the tracking update separately:
  ```
  chore(status): mark <item> done
  ```

### 9. Report and STOP

Output (≤ 12 lines):

```
DONE: <item>
COMMITS: <short> · <short>
GATES: ✓ all
FILES: <n> changed (+L/-L)
NEXT P0: <peek at next item>
PUSHED: no (run `git push` when ready)
```

**Do not continue to the next item.** The user invokes `/sprint-next` again when ready.

## Invariants

- **Never auto-chain.** One invocation = one BACKLOG item.
- **Never bypass a gate.** Fix root cause.
- **Never edit `references/designs/*`** without explicit user instruction.
- **Never `pnpm add X`** without asking.
- **Never push.** That stays manual.
- **Never amend a prior commit.** Always create new.

## Recovery

If at any point you're stuck (spec gap, unclear requirement, unexpected state):

1. Stop work, don't guess
2. Append to BACKLOG.md under `❓ open questions` with current date
3. Tell the user exactly what's blocking + 2 candidate paths forward
