---
description: Close the current milestone — verify P0 is empty, run full prod-readiness checks, tag, and roll the sprint forward.
---

> Run only when `STATUS.md` current sprint has zero unchecked `[ ]` boxes and the user has confirmed real-device verification.

## Procedure

### 1. Verify scope is empty

- Read `STATUS.md` current sprint section
- If any `[ ]` (todo) or `[~]` (in progress) or `[!]` (blocked) remains, abort with a list of what's left
- If any `[?]` (needs clarification) remains, abort and surface

### 2. Cross-check BACKLOG

- Read `BACKLOG.md`
- Confirm the corresponding P0 milestone block has no unchecked items
- If mismatch (STATUS done but BACKLOG has items, or vice versa), abort and report

### 3. Run full prod-readiness gate

In parallel:

- `pnpm lint --quiet`
- `pnpm typecheck`
- `pnpm test -- --run`
- `pnpm lint:tokens`
- `pnpm build` (full Next.js production build)
- `pnpm exec playwright test` (full e2e on both projects: chromium + iPhone-13)

Any failure aborts. No `--no-verify`, no `.skip`, no excuses.

### 4. Real-device confirmation (human gate)

Print to user:

```
REAL-DEVICE VERIFICATION
- Open the prod URL on phone + desktop
- Run the milestone's exit-criteria flow (see MVP_PLAN.md §<N>)
- Reply "verified" to continue, or "fail: <detail>" to abort
```

**Stop and wait.** Do not proceed without explicit "verified".

### 5. Tag + ledger

- Compute tag name from STATUS.md milestone (e.g. `v0.M2`)
- Annotated git tag:

  ```
  git tag -a v0.MN -m "Milestone N · <name> closed YYYY-MM-DD

  Deliverables: <bullet list from STATUS.md>
  Verified on: prod URL on operator's phone + desktop"
  ```

- Append decision-ledger:
  ```json
  {
    "ts": "...",
    "by": "milestone-close",
    "kind": "milestone",
    "milestone": "MN",
    "commit": "<short>",
    "tag": "v0.MN"
  }
  ```

### 6. Roll the sprint forward

Edit `STATUS.md`:

- Move current sprint into a `## past sprints` section (archive in place)
- Promote `## next sprint` to `## current sprint`
- Bring the next milestone's exit criteria + deliverable checklist from `MVP_PLAN.md`

Edit `BACKLOG.md`:

- Replace closed P0 block with a "✓ Done — M<N>" banner pointing to STATUS.md
- Promote P1 → P0
- Promote P2 → P1
- Surface any deferred `❓` open questions to the top

### 7. Commit the closeout

Two commits, separated:

```
chore(MN): close milestone — prod verified, tag v0.MN
chore(status): promote M<N+1> to current sprint
```

### 8. Report and STOP

```
MILESTONE CLOSED: M<N>
TAG: v0.MN
NEXT SPRINT: M<N+1> — <name>
NEXT P0 ITEMS: <bullet first 3>
PUSH: run `git push origin main --tags` when ready
```

**Do not push.** The user pushes.

## Invariants

- **Never tag without real-device verification.**
- **Never skip the full prod build.** Dev mode passing ≠ prod build passing (we learned this M1).
- **Never carry over an unchecked item silently.** Either it ships, or it gets promoted to a follow-up with explicit deferral note.
