# Changelog

All notable changes to this project. Follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added
- Initial project scaffolding: root directory tree, AI development framework, configs, app shell, DB skeleton, doc set, ADR template (ADR-0001/0002/0003).
- `CLAUDE.md` + `AGENTS.md` + `STATUS.md` + `BACKLOG.md` for AI-driven dev coordination.
- `.claude/` agents (code-reviewer, test-writer, migration-author, design-implementer) + commands (status, scaffold-page, add-mutation, migrate, checkpoint, audit).
- `scripts/lint-tokens.mjs` + `scripts/audit-loop.ts` enforcing R-T0 design-token contracts.
- GitHub Actions CI workflow (lint + typecheck + test + token-lint + build).

### Specs delivered (pre-scaffolding)
- `stock-app-1-2-moonlit-dawn.md` — architecture plan
- `INTERACTION_SPEC.md` — 18-section interaction contract
- `DATABASE_SPEC.md` — 12-section database design
- `references/designs/REVISIONS.md` — design system + IA revisions through round 1
- `references/designs/styles.css` — locked design tokens (R-T0 contract)

[Unreleased]: /
