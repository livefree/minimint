# Automation flow

> How mini-mint is built day-to-day. Designed to minimize manual intervention while keeping quality and direction non-negotiable. Operator stays in the loop at named pause points; everything else runs.

## Five-layer model

```
L5  ─  Operator                     visual review · ❓decisions · prod tag · push
L4  ─  Orchestration                /sprint-next · /milestone-close · /audit · /status
L3  ─  Execution agents             design-implementer · migration-author · test-writer · code-reviewer
L2  ─  Quality gates                pre-commit · pre-push · CI · nightly drift-check
L1  ─  Direction anchors            CLAUDE.md · INTERACTION_SPEC · DATABASE_SPEC · REVISIONS · MVP_PLAN · STATUS · BACKLOG
```

L1 never changes silently. L2 enforces L1. L3 implements within L2. L4 orchestrates L3. L5 (you) makes irreversible / aesthetic / strategic calls.

## Day-to-day loop

### Start a unit of work

```
/sprint-next
```

The command:

1. Reads `STATUS.md` + `BACKLOG.md`, picks the top P0
2. Outputs a **plan card** (BACKLOG item · spec anchor · agent · expected files · gates · pause points · scope)
3. **Pauses for "go"** — never edits without ack

### During execution

Sprint-next runs the chosen sub-agent, then in parallel:

- `pnpm lint --quiet`
- `pnpm typecheck`
- `pnpm test -- --run`
- `pnpm lint:tokens`

Then launches `code-reviewer` against the diff. Any P0/P1 finding loops back to fix-and-rerun (no `--no-verify`, no `eslint-disable` band-aids — fix the root cause).

### Visual review (UI work only)

Sprint-next starts `pnpm dev` and prints the route + the 2-3 things to look for. **You open the browser yourself** (per current preference) and reply "looks good" or "fix X". On "fix X", it loops; on "looks good", it commits.

### Close out

After the commit lands, sprint-next:

- Marks the BACKLOG item `[x]`
- Updates STATUS.md current-sprint checklist
- Appends a `decisions.ndjson` entry
- Commits the tracking update separately
- **Stops.** Next item only on next `/sprint-next` invocation.

### Push

Manual. `git push origin main` after you've reviewed `git log`. Pre-push hook runs vitest + full lint as last line of defense.

## Milestone close

When `STATUS.md` current sprint has zero `[ ]` boxes:

```
/milestone-close
```

It refuses to proceed unless:

- All `[ ]` / `[~]` / `[!]` / `[?]` are gone
- `STATUS.md` and `BACKLOG.md` agree on which items are done
- Full prod-readiness gate passes: lint · typecheck · vitest · lint:tokens · **next build** · playwright full
- You confirm real-device verification (it prints the URL + exit criteria and waits)

Then it tags `v0.M<N>`, archives the sprint, promotes the next milestone, and writes two commits. Pushing the tag stays manual.

## Quality gates

### Pre-commit (`.husky/pre-commit`)

- `lint-staged` (eslint --fix + prettier on staged ts/tsx, prettier on css/md/json)
- `pnpm lint:tokens` (full-tree; raw hex + arbitrary font sizes)
- `pnpm typecheck`

Vitest skipped here for speed; runs in pre-push instead.

### Pre-push (`.husky/pre-push`)

- `pnpm test -- --run` (full vitest suite)
- `pnpm lint --quiet` (full tree; catches lint regressions in unstaged files)

### CI (`.github/workflows/ci.yml`)

Three jobs in dependency chain:

1. **quality** — lint · typecheck · lint:tokens
2. **test** — vitest with stub env
3. **build** — `next build` with stub env (needs 1+2)
4. **e2e** — playwright on chromium + iPhone-13 (PR + main only)

### Nightly drift (`.github/workflows/drift-check.yml`)

Weekdays 09:13 UTC. Scans:

- lint:tokens violations
- ❓ open-question count (manual review needed)
- STATUS.md staleness vs code commits (>48h behind = flag)
- `any`-type creep in lib/ app/ db/ (threshold 5)

Opens a GitHub issue labeled `drift-check` on any failure. Reuses the issue across days (comments) to avoid noise.

## Direction anchors — the L1 rule

The 8 non-negotiable contracts in [CLAUDE.md](../CLAUDE.md):

1. No raw color hex in JSX/CSS (use `rgb(var(--token))`)
2. No raw numeric font sizes (use `.t-*` role classes)
3. No `Math.random()` in SVG IDs (use `React.useId()`)
4. Every profile-scoped TanStack Query key includes `profileId` second
5. Every profile-scoped mutation disabled when `currentProfileId === '__all__'`
6. All decimal math via `numeric` columns + `decimal.js`
7. Server components fetch via Drizzle, never same-host HTTP
8. Every server-rendered SVG has explicit width/height

The `code-reviewer` sub-agent checks all 8 on every diff before commit. Pre-commit lint:tokens script enforces #1 and #2. `useProfileScopedQuery()` / `useProfileMutation()` wrappers throw at dev time for #4 and #5.

## Operator pause points (the 6 you can't skip)

| Pause          | Trigger                   | What you do                                          |
| -------------- | ------------------------- | ---------------------------------------------------- |
| Plan ack       | `/sprint-next` step 2     | Read plan card, say "go" or redirect                 |
| Visual review  | UI change committed       | Open browser, eyeball, confirm or redirect           |
| ❓ resolution  | Agent finds spec gap      | Add to BACKLOG ❓, decide and reply                  |
| Milestone tag  | `/milestone-close` step 4 | Real-device test prod, reply "verified"              |
| Push           | Always                    | `git push origin main [--tags]` after review         |
| New dependency | Agent wants `pnpm add X`  | Confirm it's in the stack table or approve exception |

Everything else is automated.

## Recovery

If anything is stuck (gate fails, spec contradicts itself, agent loops):

1. Stop. Don't bypass.
2. Read the error.
3. If it's a fixable code bug → fix at root.
4. If it's a spec issue → append to BACKLOG `❓ open questions` with date, ask the operator.
5. Never use `--no-verify`, `eslint-disable`, `xfail`, `.skip` to ship faster. The whole point of L2 is to refuse fast shipping when quality slips.

## File map

```
.claude/commands/
  sprint-next.md       # core loop
  milestone-close.md   # M close ritual
  audit.md             # full audit on demand
  status.md            # quick status print
  checkpoint.md        # log a decision
  add-mutation.md      # mutation scaffolder
  scaffold-page.md     # page scaffolder
  migrate.md           # schema change

.claude/agents/
  code-reviewer.md     # 8-contract review
  design-implementer.md # artboard → React
  migration-author.md  # Drizzle migration
  test-writer.md       # vitest + playwright

.husky/
  pre-commit           # staged lint + tokens + typecheck
  pre-push             # full vitest + full lint

.github/workflows/
  ci.yml               # PR + main gate (quality / test / build / e2e)
  drift-check.yml      # nightly drift scanner

logs/ledger/
  decisions.ndjson     # append-only decision log
  CHANGELOG.md         # human-readable history
```
