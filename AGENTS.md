# AGENTS.md

This file is the cross-tool agent entry point (OpenAI Codex, Cursor, Aider, etc.).

**For all project context, conventions, and operating principles, read [`CLAUDE.md`](./CLAUDE.md)** — it is the canonical AI brief and equally applicable here.

## quick links (same content tree, ordered by frequency of need)

- [`CLAUDE.md`](./CLAUDE.md) — operating principles + read order + non-negotiable contracts
- [`STATUS.md`](./STATUS.md) — what's in flight now
- [`BACKLOG.md`](./BACKLOG.md) — prioritized open work + open questions
- [`INTERACTION_SPEC.md`](./INTERACTION_SPEC.md) — routes, mutations, queries, flows
- [`DATABASE_SPEC.md`](./DATABASE_SPEC.md) — schema, indexes, derived functions
- [`docs/development.md`](./docs/development.md) — dev workflow + commit format
- [`docs/adr/`](./docs/adr/) — architecture decision records

## tool-specific notes

- Claude Code: `.claude/agents/`, `.claude/commands/`, `.claude/settings.json` are honored.
- Cursor / Continue: read this file + `CLAUDE.md`; `.cursorrules` not present (use these instead).
- Aider: `--read CLAUDE.md` recommended at start of session.
- GitHub Copilot Workspace: `AGENTS.md` is detected by default.

## tracing

Every AI agent run that produces a commit should append a line to `logs/ledger/decisions.ndjson` (one JSON object per line) describing what was done and why. See [`logs/README.md`](./logs/README.md) for the schema.
