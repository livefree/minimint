---
name: Bug
about: Something doesn't work as the spec says it should
labels: bug
---

## what spec says

<!-- Quote or link the spec line/section that describes the expected behavior -->

## what happens

<!-- Steps to reproduce, then the actual outcome -->

1.
2.
3.

actual: …
expected: …

## environment

- device: macOS Safari / iOS 16+ / Chromium / …
- profile: single-profile / multi-profile / `__all__`
- privacy mode: L0 / L1 / L2
- branch / commit:

## suspected scope

- [ ] visual only — `references/designs/`
- [ ] frontend logic — `app/`, `components/`, `lib/`
- [ ] data — `db/queries`, `db/mutations`, `db/schema`
- [ ] spec drift — INTERACTION_SPEC / DATABASE_SPEC needs updating
