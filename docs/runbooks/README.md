# runbooks

On-call and operational playbooks. Each runbook answers: **"X happened. What do I do, in order, right now?"**

## index

(empty for sprint 0 — add as operational events occur)

Expected v1 runbooks:

- `db-down.md` — Neon Postgres unreachable
- `finnhub-rate-limited.md` — 429s from Finnhub
- `yahoo-finance2-broken.md` — upstream change broke the unofficial scraper
- `bad-migration-deployed.md` — migration broke prod
- `secrets-rotation.md` — rotate operator password / session secret / Finnhub key
- `restore-from-backup.md` — Neon PITR restore steps
- `csv-import-bad-data.md` — operator imported wrong CSV, needs bulk-undo

## format

```markdown
# runbook: <event>

## symptoms
What you see when this is happening.

## immediate triage
First 3 minutes. What to check, what NOT to do.

## resolution
Step-by-step recovery.

## prevention
What change to make so this doesn't recur. Usually links to a code/spec/PR.

## escalation
Who to ping if the above didn't work.
```

Runbooks live close to the code so they update with the code. Don't put them in a wiki.
