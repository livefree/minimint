# docs/

Documentation entrypoint.

| doc | purpose |
|---|---|
| [`../CLAUDE.md`](../CLAUDE.md) | AI agent operating context (read first) |
| [`../STATUS.md`](../STATUS.md) | what's in flight |
| [`../BACKLOG.md`](../BACKLOG.md) | prioritized work |
| [`../INTERACTION_SPEC.md`](../INTERACTION_SPEC.md) | every page, route, mutation, flow |
| [`../DATABASE_SPEC.md`](../DATABASE_SPEC.md) | schema, indexes, derived functions |
| [`../stock-app-1-2-moonlit-dawn.md`](../stock-app-1-2-moonlit-dawn.md) | architecture plan |
| [`./development.md`](./development.md) | dev workflow, conventions, commit format |
| [`./testing.md`](./testing.md) | testing strategy: unit / integration / e2e |
| [`./deployment.md`](./deployment.md) | Vercel + Neon deploy |
| [`./adr/`](./adr/) | architecture decision records |
| [`./runbooks/`](./runbooks/) | on-call & operational playbooks (rare) |
| [`../references/designs/REVISIONS.md`](../references/designs/REVISIONS.md) | design contract (R-T*, R-N*, R-P*, U-*) |

## docs philosophy

- Specs (INTERACTION_SPEC, DATABASE_SPEC, REVISIONS) describe *what must be true*.
- ADRs describe *why we chose this over alternatives*.
- Runbooks describe *what to do when X happens in prod*.
- This index is the only map; agents that get lost should land here.
