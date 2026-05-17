---
description: Log a meaningful decision or progress checkpoint. Args: $ARGUMENTS = short description.
---

Record `$ARGUMENTS` as a checkpoint:

1. Append one JSON line to `logs/ledger/decisions.ndjson`:
   ```json
   {"ts":"<iso8601>","by":"<agent or 'human'>","kind":"checkpoint","summary":"$ARGUMENTS","branch":"<current git branch>","commit":"<HEAD short>"}
   ```
2. If the checkpoint represents an **architectural decision** (something future readers must understand to make sense of the codebase), additionally:
   - Create a new ADR file under `docs/adr/NNNN-<kebab-slug>.md` following the format in `docs/adr/README.md`
   - Add the ADR link to BACKLOG.md "decisions made" section

3. If the checkpoint represents a **completed sprint deliverable**, update `STATUS.md`:
   - Mark `[ ]` → `[x]` for the deliverable
   - If sprint is complete, archive to a `## past sprints` section and bring "next sprint" forward as "current"

Use `date -u +%Y-%m-%dT%H:%M:%SZ` for the ISO timestamp. Use `git rev-parse --short HEAD` for the commit.
