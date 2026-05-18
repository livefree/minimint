# BACKLOG

> Prioritized open work, organized around [`MVP_PLAN.md`](MVP_PLAN.md) milestones. Update whenever a spec changes or a sprint completes.

## priority encoding

`P0` = current milestone · `P1` = next milestone · `P2` = within MVP · `P3` = v1.5+ · `❓` = open question requiring human decision

---

## ✓ Done — M1 "See a stock" (closed 2026-05-17, tag `v0.M1`)

All 12 deliverables shipped and verified in prod on operator's real device.
See [`STATUS.md`](STATUS.md) for the closing checklist.

## P0 — M2 "Record my first trade" (current sprint, see MVP_PLAN §3)

- [x] Auto-create default "Me" profile on first login if none exists
- [x] Settings sub-page for account create (no full Profile editor yet)
- [x] `lib/portfolio/positions.ts` — TS wrappers around `get_positions` / `get_my_position` / `get_net_worth`
- [ ] `app/api/transactions/route.ts` (POST/GET) + `lib/api/mutations/transactions.ts`
- [ ] TradeSheet component (BUY/SELL only)
- [ ] MyPosition aggregated card on SymbolDetail (U-1)
- [ ] Minimal Home tab at `/` (net worth hero + positions table)
- [ ] 2-tab TabBar (Home + Settings)
- [ ] Toast + Undo for trade delete (sonner)
- [ ] Playwright e2e: buy → see position with correct math

## P1 — M3 "Watchlist + family" (next, see MVP_PLAN §4)

- [ ] Multi-profile UI (R-P0..P3 minus PIN): ProfilesList in Settings · Add/Edit/Delete · ProfileSwitcher (mac sidebar chip + ios sheet) · profile color chrome
- [ ] Trade Sheet profile-attributed header (R-P3)
- [ ] Watchlist CRUD: create/rename/delete lists; add/remove items; reorder via dnd-kit
- [ ] Home WatchlistStrip (R-N1 #5)
- [ ] WatchlistFull page at `/watchlists/[id]`
- [ ] MarketStatusStrip on Home (R-N1 #2) — fully closes U-2
- [ ] ⌘K search palette (R-I5; holdings + market sections)

## P2 — M4 "Complete v1" (see MVP_PLAN §5)

- [ ] Market tab 4 sub-tabs: Overview · Stocks · ETF · News (Sectors+Movers placeholders)
- [ ] MultiLineComparisonChart (R-N3)
- [ ] Portfolio sub-tabs: Activity · Balances (Summary+Positions land in M2)
- [ ] `/portfolio/dividends` + `/portfolio/performance` detail pages
- [ ] CSV import 4-step flow (R-SC2) for Fidelity / Schwab / Vanguard / Custom
- [ ] Onboarding wizard (U-7)
- [ ] Privacy mode L0/L1/L2 (R-P7 / U-8)
- [ ] Alerts list page (no triggers yet)
- [ ] UpcomingEvents card on Home (R-N1 #8) reading dividends + earnings

## P3 — v1.5 / post-launch

- [ ] Alerts trigger + Web Push delivery
- [ ] FIFO `get_positions_fifo` + `get_realized_pl_lots` (DATABASE_SPEC §6.1 future)
- [ ] Wash sale detection UI (function `get_wash_sale_candidates` already in DB)
- [ ] Holding period LT/ST badge on positions
- [ ] Offline write queue (`outbox_mutations` table)
- [ ] Per-profile PIN (R-P6)
- [ ] Sectors + Movers tabs in Market
- [ ] On-chart cost-line + buy/sell markers (U-3)
- [ ] Trade entry UX micro-improvements (U-4: default price, dup detect, batch mode)
- [ ] Cross-profile aggregate view (R-P5 `__all__`)
- [ ] i18n with `next-intl` (U-9) — already installed, scaffold strings now
- [ ] Soft-delete cleanup Vercel cron (DATABASE_SPEC §12 #4)
- [ ] `audit_log` triggers (gated by `app_settings.audit_enabled`)

---

## ❓ open questions (status updates from prior list)

Decisions made during Sprint 0 → moved out of "open" into MVP_PLAN/specs:

- ~~uuid_v7 source~~ → **app-generated** via `uuidv7` npm; 0001 migration adds `gen_random_uuid()` DB-level fallback for raw SQL inserts (logged 2026-05-17 in ledger)
- ~~trigger updated_at vs app-set~~ → **trigger** (`set_updated_at` function generated)
- ~~real-time WebSocket vs polling~~ → **polling 30s** in v1 (yahoo-finance2 covers); WS deferred
- ~~design canvas round-2 timing~~ → **defer to post-M1 feedback** (locked 2026-05-17)
- ~~push notifications~~ → **v1.5** (MVP_PLAN §5 non-goals)
- ~~offline write queue~~ → **v1.5** (MVP_PLAN §5 non-goals)
- ~~multi-operator~~ → **out of v1** (DATABASE_SPEC §11 lists migration path)
- ~~audit log default on/off~~ → **off** in v1 (DATABASE_SPEC §3.16)
- ~~cash modeling polymorphism~~ → **accept** (DATABASE_SPEC §12.6)

Still open:

- ❓ **i18n on day 1** — `next-intl` is installed; extract strings via dictionary even if only EN ships v1? Recommendation: yes, takes ~1 day, saves a refactor later.
- ❓ **service worker scope** — assets only (M1-M4) vs API GET cache (v1.5)? Recommendation: assets only for MVP.
- ❓ **custom domain** for Vercel — use `mini-mint-XXX.vercel.app` for v0 (decided) or buy a domain? Defer to post-M2 if v1 sticks.
- ❓ **bootstrap concurrency** (2026-05-17) — `ensureDefaultProfile` has a theoretical race: two concurrent first-login requests could both insert a "Me" profile. Practically impossible for a single-operator single-device app. Hardening options: advisory lock, partial unique index on `(true) WHERE relation='SELF'`, or `SELECT FOR UPDATE` on `app_settings`. Decision needed only if multi-device concurrent first-login becomes a real scenario. Defer to v1.5.
- ❓ **account colorSlot concurrency** (2026-05-17) — `POST /api/accounts` reads `count()` then inserts with `(count % 8) + 1`. Two concurrent creates could pick the same slot. Same practical risk profile as bootstrap concurrency. Cleaner long-term: subquery `INSERT … SELECT (COUNT(*) % 8) + 1` OR hand colorSlot to the user via `IOSAccountColorPicker` (M3) and drop server-side cycling entirely. Defer to M3.
- ❓ **`__all__` write guard** (2026-05-17) — Contract #5 says every profile-scoped mutation must refuse when `currentProfileId === '__all__'`. M2 has no `__all__` (single profile only), so `getCurrentProfileId()` never returns it. When the cookie-resolved current-profile lands in M3, every mutation route — accounts, transactions, watchlists — must check and 400 on `__all__`. Track this here so the M3 cutover doesn't silently regress contract #5.
- ❓ **batch zod-issue error reporting** (2026-05-17) — `/api/accounts` and `/api/transactions` collapse multi-field validation failures to `issues[0]?.message`. M2-5 TradeSheet will need inline per-field error mapping; at that point the API should return `issues: ZodIssue[]` so the sheet can highlight individual fields. Defer to M2-5 along with the TanStack QueryClient setup.

## decision-log conventions

Once an open question is decided:

1. Strike it through here with the date
2. Append a JSON line to `logs/ledger/decisions.ndjson`
3. If architectural, also write an ADR under `docs/adr/`
