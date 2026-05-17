# BACKLOG

> Prioritized open work, distilled from `INTERACTION_SPEC.md §18`, `DATABASE_SPEC.md §12`, `references/designs/REVISIONS.md` priority order. Update whenever a spec changes or a sprint completes.

## priority encoding

`P0` = blocks subsequent work · `P1` = next sprint · `P2` = within phase · `P3` = nice-to-have · `❓` = open question requiring human decision

---

## P0 — sprint 0 / 1 prerequisites

- [x] root scaffolding (this commit)
- [ ] `pnpm install` + `pnpm dev` proof-of-bootability
- [ ] Neon project provisioned via MCP; `DATABASE_URL` in `.env.local`
- [ ] initial Drizzle migration applied (`0000_init.sql` per DATABASE_SPEC §8.2)
- [ ] seed `app_settings` singleton with bcrypt-hashed operator password
- [ ] login screen + session cookie + middleware route guard
- [ ] profile CRUD + switch (R-P1 + R-P3)
- [ ] `styles.css` from design canvas imported into `app/globals.css`
- [ ] Tailwind v4 `@theme inline` mapping for tokens

## P1 — sprint 2 (data layer + Home)

- [ ] `lib/market/finnhub.ts` quote + search + profile endpoints
- [ ] `lib/market/yahoo.ts` history + dividends + splits + earnings
- [ ] `quote_cache` + `prices_daily` write-through pattern
- [ ] `useProfileScopedQuery` wrapper + query-key factory
- [ ] `useApiMutation` wrapper with declarative invalidation manifest (INTERACTION_SPEC §7.5)
- [ ] Home page sections: NavHeader, MarketStatusStrip, NetWorthHero, AccountsRibbon, WatchlistStrip, TodayMovers, AllocationDonut, RecentActivity (skip UpcomingEvents + HouseholdSwitchHint until designs are complete)
- [ ] Portfolio.Summary + Portfolio.Positions
- [ ] Symbol detail with TradingView lightweight-charts integration
- [ ] TradeSheet with React Hook Form + Zod
- [ ] PWA manifest + service worker (next-pwa)

## P2 — sprint 3 (market + completeness)

- [ ] Market tab Overview + Stocks + ETF
- [ ] MultiLineComparisonChart component
- [ ] CSV import 4-step flow (R-SC2)
- [ ] Onboarding flow (U-7)
- [ ] Privacy mode L0/L1/L2 (U-8)
- [ ] Wash sale detection function (`get_wash_sale_candidates`, DATABASE_SPEC §7.3)
- [ ] Holding period LT/ST badge
- [ ] Multi-account aggregated MyPosition card (U-1)
- [ ] Per-symbol earnings + ex-div line (U-6 inline)
- [ ] State scaffolding `<Surface fallback>` per INTERACTION_SPEC §9
- [ ] Pull-to-refresh on all main lists

## P3 — v1.5 / post-launch

- [ ] FIFO positions function + tax lot report
- [ ] Alerts (UI + cron + Web Push)
- [ ] Offline write queue (`outbox_mutations` table)
- [ ] Sectors + Movers tabs in Market
- [ ] Pre/post-market quote display (yahoo-finance2)
- [ ] On-chart cost-line + buy/sell markers (U-3)
- [ ] Trade entry UX micro-improvements (U-4: default price, last-date default, dup detect, batch mode)
- [ ] Cross-profile aggregate view (R-P5 `__all__`)
- [ ] i18n with `next-intl` (U-9)

---

## ❓ open questions (need human decision before relevant sprint)

From `INTERACTION_SPEC.md §18`:

- ❓ **push notifications scope** — iOS PWA push (16.4+). Defer to v1.5? Recommendation: yes.
- ❓ **offline write queue** — v1.5? Recommendation: yes; v1 just disables mutations offline.
- ❓ **real-time WebSocket vs polling** — Finnhub free has WS. Recommendation: polling for v1.
- ❓ **multi-operator** — out of scope v1; confirm.
- ❓ **i18n switch on day 1** — extract strings via `next-intl` even if only EN ships?
- ❓ **service worker scope** — assets only (v1) vs API GET cache (v1.5)?

From `DATABASE_SPEC.md §12`:

- ❓ **uuid_v7 source** — Postgres extension vs app-generated. Recommendation: app-generated (`uuidv7` npm).
- ❓ **trigger `updated_at` vs app-set**. Recommendation: trigger.
- ❓ **audit log default on or off** in v1? Recommendation: off.
- ❓ **cash modeling polymorphism** — accept `quantity`-as-amount for CASH_* kinds? Recommendation: accept v1.

From design v2 audit (REVISIONS.md round 1):

- ❓ Settle remaining ~20% of design canvas (UpcomingEvents, HouseholdSwitchHint, ProfileSwitchTransition, DeleteProfileConfirm, ProfilePINSetup, Stale state, U-7 onboarding, 4 missing `design-spec.html` sections).

## decision-log conventions

Once an open question is decided:
1. Move it from "❓ open questions" to "decisions made" (a section to be added when first decision lands).
2. Append a JSON line to `logs/ledger/decisions.ndjson`.
3. If architectural, also write an ADR under `docs/adr/`.
