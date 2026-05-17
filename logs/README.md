# logs/

Runtime + AI agent traces. Structured for both human review and AI replay.

## subdirs

| dir | what | retention | gitignored? |
|---|---|---|---|
| `agents/` | per-agent run transcripts (full IO when the agent self-logs) | 30 days local; not committed | yes |
| `audits/` | output of `/audit` command or `pnpm audit:loop` | committed for last 5; rest gitignored | partial |
| `dev/` | local dev runtime errors, debug dumps, profiler output | local only | yes |
| `ledger/` | canonical decision log + CHANGELOG | committed | no |

## ledger format

`logs/ledger/decisions.ndjson` — one JSON object per line. Append-only.

Schema:

```json
{
  "ts":      "2026-05-16T12:34:56Z",
  "by":      "human" | "<agent name>" | "<script name>",
  "kind":    "checkpoint" | "decision" | "spec-change" | "migration" | "review" | "audit" | "add-tests" | "port-artboard",
  "summary": "one sentence, present tense, < 100 chars",
  "branch":  "feat/login",
  "commit":  "a1b2c3d",
  "refs":    ["docs/adr/0004-...", "PR-12", "INTERACTION_SPEC §7.5"]
}
```

Every AI agent that produces a code change MUST append a line. Audit tooling reads this to reconstruct "what changed when and why".

## CHANGELOG.md

Human-readable summary of releases. Built from the ledger but curated. Format follows Keep a Changelog (https://keepachangelog.com).

## audit retention rule

- Keep the most recent 5 audit reports committed (so reviewers can see trends)
- Older ones are local-only; CI runs a cleanup hook on push
