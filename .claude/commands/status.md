---
description: Print current sprint status + open BACKLOG P0/P1 items.
---

Read `STATUS.md` and `BACKLOG.md`. Output a concise status:

1. Current sprint name + 1-line goal
2. Sprint deliverables: count done / count total + list the in-progress one
3. Top 5 P0 backlog items
4. Any [!] blocked items
5. Any ❓ open questions that affect the current sprint
6. The most recent 3 entries from `logs/ledger/decisions.ndjson` (parse JSON, format brief)

Format as markdown, < 30 lines. Do NOT modify any file.
