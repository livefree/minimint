# Database Design — mini-mint

## 0. purpose

Engineering spec for the Postgres schema, Drizzle ORM mapping, indexes, derived data, and migration strategy. Companion to:
- `stock-app-1-2-moonlit-dawn.md` — architecture overview
- `INTERACTION_SPEC.md` — query keys, mutation patterns, scope rules at app layer
- `references/designs/REVISIONS.md` — multi-profile semantics, U-* feature scope

This document is the canonical source for schema decisions. App code MUST conform; deviations require updating this doc first.

---

## 1. design principles

### 1.1 source of truth
**Transactions are the sole writable source of truth for portfolio state.** Positions, cost basis, realized/unrealized P/L, dividends received, holding period — ALL derived. No "positions snapshot" table is ever written by application code; positions exist only as a computed view / function. This prevents drift between snapshot and ground truth, and makes audit + undo + corporate-action replay trivial.

### 1.2 profile is the tenant
Every profile-scoped table carries `profile_id` NOT NULL with FK + ON DELETE CASCADE. The app-layer `useProfileScopedQuery` (INTERACTION_SPEC §17.1) plus a DB-level invariant guarantee that no query reads across profiles unintentionally. The reserved virtual id `__all__` is **never persisted** — it's an application-layer aggregation request that fans out to `IN (...)` over real profile ids.

### 1.3 market data is global
`securities`, `quote_cache`, `prices_daily`, `dividends_announced`, `splits`, `earnings_calendar`, `news_cache` are operator-global (no `profile_id`). All profiles share one market data lake. This is the right cache boundary for a single-operator household: one Finnhub call benefits everyone.

### 1.4 decimal precision over float
Every monetary or quantity column is `numeric` with explicit precision/scale. Floats are forbidden for money (rounding errors compound for tax reporting). Specifics in §2.2.

### 1.5 IDs
Primary keys are **UUID v7** stored as `uuid`, generated via `uuid_generate_v7()` (extension) or Postgres 17's `uuidv7()` (when available). UUID v7 sorts naturally by creation time → enables efficient cursor pagination without secondary index on `created_at`.

App-layer types are branded strings (INTERACTION_SPEC §17): `ProfileId`, `AccountId`, etc., preventing cross-mixing at compile time.

### 1.6 time is always tz-aware
Every timestamp is `timestamptz`. Stored UTC, displayed in user's locale. `executed_at` on transactions stores the wall-clock moment the trade occurred (typically NYSE ET, but normalized to UTC at insert).

### 1.7 soft delete only where Undo demands it
Hard delete by default. Two exceptions:
- `transactions.deleted_at` — supports the 5-second client Undo Toast (INTERACTION_SPEC §11.4). After grace window, a background job (or next read filter) finalizes.
- `csv_imports.undoable_until` — 24h bulk undo window.

Profiles, accounts, watchlists: hard delete with cascade. Operator confirms with typed-name dialog before destructive ops.

### 1.8 currency: USD only v1
Every monetary column includes implicit USD. A `currency CHAR(3) DEFAULT 'USD'` column is included on accounts + transactions for forward compat but unused in v1 (CHECK constraint locks to 'USD').

---

## 2. conventions

### 2.1 naming

| element | convention | example |
|---|---|---|
| table | `snake_case`, plural | `transactions`, `watchlist_items` |
| column | `snake_case`, singular | `profile_id`, `executed_at` |
| FK column | `<referenced_table_singular>_id` | `profile_id`, `account_id` |
| boolean | `is_*` or `has_*` | `is_pinned`, `has_pin` |
| enum value | `UPPER_SNAKE` | `'BUY'`, `'CASH_IN'` |
| index | `idx_<table>_<cols>` | `idx_transactions_profile_executed` |
| unique | `uq_<table>_<cols>` | `uq_watchlist_items_list_symbol` |
| check | `chk_<table>_<rule>` | `chk_transactions_qty_positive` |
| FK constraint | `fk_<table>_<col>` | `fk_transactions_account_id` |

### 2.2 numeric types

| domain | type | rationale |
|---|---|---|
| share quantity | `numeric(18, 8)` | fractional shares to 8 decimals (matches Fidelity / Robinhood) |
| price per share | `numeric(20, 6)` | 6 decimals covers low-priced + crypto-future-proofing without precision loss |
| money amount | `numeric(20, 4)` | 4 decimals enough for any USD aggregate, no float drift |
| ratio (split numerator/denominator) | `integer` each | exact rationals; e.g., 4-for-1 stored as `num=4, den=1` |
| percent (FK rate, dividend yield computed) | `numeric(10, 6)` | 6 decimals |
| color slot (1..8) | `smallint` | palette index per §3.2 profiles, §3.3 accounts |
| sort_order | `integer` | sparse; allow re-spacing |

### 2.3 enums

All enums use Postgres native `CREATE TYPE ... AS ENUM (...)`. Drizzle maps via `pgEnum`. Adding values: `ALTER TYPE ... ADD VALUE ...` (Postgres 12+ requires no rewrite).

```
transaction_kind:  BUY | SELL | DIV | SPLIT | FEE | CASH_IN | CASH_OUT | TRANSFER_IN | TRANSFER_OUT
avatar_kind:       INITIALS | EMOJI | PHOTO
relation:          SELF | PARTNER | PARENT | CHILD | SIBLING | OTHER
tax_method:        FIFO | AVG | LIFO | SPEC_ID
account_kind:      BROKERAGE | IRA_TRAD | IRA_ROTH | HSA | 401K | 529 | TRUST | OTHER
asset_type:        EQUITY | ETF | MUTUAL_FUND | INDEX | OTHER
alert_direction:   ABOVE | BELOW
alert_status:      ACTIVE | TRIGGERED | DISABLED
```

### 2.4 timestamps on every row

Every table gets:
```
created_at   timestamptz NOT NULL DEFAULT now()
updated_at   timestamptz NOT NULL DEFAULT now()
```
A trigger `set_updated_at()` updates `updated_at` on UPDATE.

### 2.5 cascade rules

- `profiles` DELETE → cascades to all profile-scoped rows
- `accounts` DELETE → cascades to `transactions` + `csv_imports` referencing it (but rare; usually accounts are archived rather than deleted)
- `watchlists` DELETE → cascades to `watchlist_items`
- `securities` is referenced loosely (txns and watchlist items reference `symbol` text, not FK to `securities.symbol`). This allows recording trades in symbols we've never had market data for; market data populates lazily. See §3.8.

---

## 3. tables (DDL + Drizzle)

DDL shown for clarity; Drizzle schema is the actual artifact (§4). Required Postgres extensions:
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";       -- search (§5)
CREATE EXTENSION IF NOT EXISTS "btree_gin";     -- composite GIN indexes
```

### 3.1 app_settings (singleton)

Operator-level configuration. Exactly one row, enforced by CHECK on a sentinel column.

```sql
CREATE TABLE app_settings (
  id                smallint PRIMARY KEY CHECK (id = 1),
  operator_password_hash  text NOT NULL,
  session_secret_kid      text NOT NULL,
  finnhub_api_key_enc     text,
  refresh_seconds         integer NOT NULL DEFAULT 30 CHECK (refresh_seconds BETWEEN 10 AND 3600),
  demo_mode               boolean NOT NULL DEFAULT false,
  schema_version          integer NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);
```

Notes:
- `operator_password_hash`: bcrypt cost 12.
- `session_secret_kid`: identifier for the JWT signing key in env; rotate via env + record kid here.
- `finnhub_api_key_enc`: AES-GCM-encrypted with env `SECRETS_KEY` (so DB backup alone doesn't leak the key).
- `schema_version`: tracked separately from Drizzle's migration table for sanity-check at app boot.

### 3.2 profiles

```sql
CREATE TABLE profiles (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v7(),
  name            text NOT NULL CHECK (length(name) BETWEEN 1 AND 64),
  display_name    text,
  avatar_kind     avatar_kind NOT NULL DEFAULT 'INITIALS',
  avatar_value    text NOT NULL DEFAULT '',
  color_slot      smallint NOT NULL CHECK (color_slot BETWEEN 1 AND 8),
  relation        relation NOT NULL DEFAULT 'OTHER',
  birth_year      smallint CHECK (birth_year IS NULL OR birth_year BETWEEN 1900 AND 2100),
  is_pinned       boolean NOT NULL DEFAULT false,
  sort_order      integer NOT NULL DEFAULT 0,
  pin_hash        text,                                  -- bcrypt, optional per R-P6
  last_active_at  timestamptz,                           -- for "last used" sort + recent-switch hint
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_profiles_sort ON profiles (is_pinned DESC, sort_order, created_at);
```

Notes:
- No `operator_id` FK because there's only one operator (`app_settings` row 1).
- `color_slot` maps to `--p-N` CSS var. Designer-assigned at create; user can override.
- `pin_hash` NULL = no PIN required to switch.

### 3.3 accounts

```sql
CREATE TABLE accounts (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v7(),
  profile_id    uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name          text NOT NULL CHECK (length(name) BETWEEN 1 AND 64),
  broker        text,                                                -- 'Fidelity', 'Schwab', etc.
  account_kind  account_kind NOT NULL DEFAULT 'BROKERAGE',
  last4         text CHECK (last4 IS NULL OR last4 ~ '^\d{4}$'),     -- masked account number suffix
  currency      char(3) NOT NULL DEFAULT 'USD' CHECK (currency = 'USD'),
  color_slot    smallint NOT NULL CHECK (color_slot BETWEEN 1 AND 8),
  tax_method    tax_method NOT NULL DEFAULT 'AVG',
  is_archived   boolean NOT NULL DEFAULT false,
  sort_order    integer NOT NULL DEFAULT 0,
  opened_at     date,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_accounts_profile ON accounts (profile_id, is_archived, sort_order);
```

Notes:
- `color_slot` palette is separate from profile palette (per R-N2.b); not enforced at DB layer — app picks first unused slot at create.
- `tax_method`: defaults to AVG (simplest); per-account override allows IRAs to use AVG while taxable brokerage uses FIFO.
- `is_archived`: closed brokerage account but keep history; excluded from default lists.

### 3.4 watchlists + watchlist_items

```sql
CREATE TABLE watchlists (
  id            uuid PRIMARY KEY DEFAULT uuid_generate_v7(),
  profile_id    uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name          text NOT NULL CHECK (length(name) BETWEEN 1 AND 64),
  color_slot    smallint CHECK (color_slot IS NULL OR color_slot BETWEEN 1 AND 8),
  sort_order    integer NOT NULL DEFAULT 0,
  is_default    boolean NOT NULL DEFAULT false,                       -- "My Symbols", first list
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_watchlists_profile ON watchlists (profile_id, sort_order);
CREATE UNIQUE INDEX uq_watchlists_default ON watchlists (profile_id) WHERE is_default;

CREATE TABLE watchlist_items (
  watchlist_id  uuid NOT NULL REFERENCES watchlists(id) ON DELETE CASCADE,
  symbol        text NOT NULL CHECK (symbol ~ '^[A-Z0-9.\^\-]{1,16}$'),
  sort_order    integer NOT NULL DEFAULT 0,
  added_at      timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (watchlist_id, symbol)
);
CREATE INDEX idx_watchlist_items_sort ON watchlist_items (watchlist_id, sort_order);
```

Notes:
- Partial unique index ensures exactly one default list per profile.
- `symbol` is text not FK — see §1.3 + §3.8.

### 3.5 transactions

The central table. Append-only in spirit; updates are rare (correcting a typo) and re-derive everything downstream.

```sql
CREATE TABLE transactions (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v7(),
  profile_id      uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  account_id      uuid NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
  symbol          text NOT NULL CHECK (symbol ~ '^[A-Z0-9.\^\-]{1,16}$'),
  kind            transaction_kind NOT NULL,
  quantity        numeric(18,8) NOT NULL,
  price           numeric(20,6) NOT NULL DEFAULT 0,                  -- per-share; 0 for FEE/CASH_*
  fees            numeric(20,4) NOT NULL DEFAULT 0,
  currency        char(3) NOT NULL DEFAULT 'USD' CHECK (currency = 'USD'),
  executed_at     timestamptz NOT NULL,                              -- when the trade actually happened (NYSE wall-clock → UTC)
  note            text,
  source_import_id uuid REFERENCES csv_imports(id) ON DELETE SET NULL,   -- if from CSV import
  deleted_at      timestamptz,                                       -- soft delete; finalized by job
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT chk_transactions_qty_sign CHECK (
    (kind IN ('BUY','SELL','DIV','CASH_IN','CASH_OUT','TRANSFER_IN','TRANSFER_OUT') AND quantity > 0)
    OR (kind IN ('SPLIT','FEE'))                                      -- split qty interpreted as ratio elsewhere; fee qty can be 0
  ),
  CONSTRAINT chk_transactions_price CHECK (
    (kind IN ('BUY','SELL','DIV') AND price >= 0)
    OR (kind IN ('SPLIT','FEE','CASH_IN','CASH_OUT','TRANSFER_IN','TRANSFER_OUT'))
  )
);
```

Notes on `kind` semantics:

| kind | meaning | qty | price | fees | net cash impact |
|---|---|---|---|---|---|
| `BUY` | acquire shares of symbol | shares | per-share cost | optional | −(qty×price + fees) |
| `SELL` | dispose shares of symbol | shares | per-share proceeds | optional | +(qty×price − fees) |
| `DIV` | cash dividend received | shares-at-record-date | per-share amount | usually 0 | +(qty×price) |
| `SPLIT` | stock split adjustment | post-split shares | 0 | 0 | 0 (qty rewritten; historical txns also adjusted via splits table; see §3.12) |
| `FEE` | misc fee debited | 0 | 0 | amount | −fees |
| `CASH_IN` | deposit to account | 0 | 0 | 0 | +(custom; held in `quantity` as USD amount) |
| `CASH_OUT` | withdrawal | 0 | 0 | 0 | −(same) |
| `TRANSFER_IN` | shares received from another account/broker | shares | original cost basis | 0 | 0 |
| `TRANSFER_OUT` | shares sent out | shares | 0 | 0 | 0 |

Edge case `CASH_IN/OUT`: hijacks `quantity` as USD amount (price = 0). Rationale: avoids a separate cash table. Alternative is dedicated columns; we accept the polymorphism for v1 simplicity. App layer hides `quantity` in cash forms behind an "Amount" label.

`SPLIT` is rare in user-recorded txns — auto-handled by the `splits` table feed. Users only manually record SPLIT if data feed missed it.

### 3.6 alerts (v1.5)

Defined now so schema doesn't need a migration to add later.

```sql
CREATE TABLE alerts (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v7(),
  profile_id   uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  symbol       text NOT NULL,
  direction    alert_direction NOT NULL,
  threshold    numeric(20,6) NOT NULL,
  status       alert_status NOT NULL DEFAULT 'ACTIVE',
  triggered_at timestamptz,
  push_subscription_endpoint text,                       -- Web Push subscription
  note         text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_alerts_active ON alerts (status, symbol) WHERE status = 'ACTIVE';
CREATE INDEX idx_alerts_profile ON alerts (profile_id);
```

A background job every 5 min during market hours queries `idx_alerts_active`, joins `quote_cache`, sets `status='TRIGGERED'` + sends Web Push.

### 3.7 csv_imports

Audit trail for batch operations + supports 24h bulk Undo.

```sql
CREATE TABLE csv_imports (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v7(),
  profile_id      uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  filename        text NOT NULL,
  broker_template text,                                  -- 'fidelity' | 'schwab' | 'custom'
  mapping_json    jsonb NOT NULL,
  total_rows      integer NOT NULL,
  imported_count  integer NOT NULL DEFAULT 0,
  skipped_count   integer NOT NULL DEFAULT 0,
  error_count     integer NOT NULL DEFAULT 0,
  error_log_json  jsonb,                                 -- array of {row_no, message}
  undoable_until  timestamptz,                           -- NULL after window expires
  undone_at       timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_csv_imports_profile ON csv_imports (profile_id, created_at DESC);
```

Undo = `DELETE FROM transactions WHERE source_import_id = $1`. Subsequent invalidation cascade per INTERACTION_SPEC §7.5.

### 3.8 securities

Symbol catalog. Populated lazily — when the app encounters a symbol it doesn't know (e.g., via CSV import), it fetches profile from yahoo-finance2 (`assetProfile` module) and inserts.

```sql
CREATE TABLE securities (
  symbol        text PRIMARY KEY CHECK (symbol ~ '^[A-Z0-9.\^\-]{1,16}$'),
  name          text NOT NULL,
  exchange      text,                                     -- e.g. "NMS" (short code from quote().exchange)
  full_exchange text,                                     -- e.g. "NasdaqGS" (from quote().fullExchangeName)
  asset_type    asset_type NOT NULL DEFAULT 'EQUITY',
  currency      char(3) NOT NULL DEFAULT 'USD',
  sector        text,
  industry      text,
  industry_key  text,                                     -- yahoo's slug form, e.g. "consumer-electronics"
  country       text,                                     -- yahoo returns full name ("United States"); convert to ISO2 in app layer if needed
  timezone      text,                                     -- e.g. "America/New_York" (from chart().meta)
  delisted_at   date,
  renamed_to    text REFERENCES securities(symbol),       -- FB → META; app-layer detects via returned-symbol-mismatch
  search_text   text GENERATED ALWAYS AS (lower(symbol || ' ' || name)) STORED,
  refreshed_at  timestamptz NOT NULL DEFAULT now(),
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_securities_search ON securities USING gin (search_text gin_trgm_ops);
CREATE INDEX idx_securities_active ON securities (asset_type) WHERE delisted_at IS NULL;
```

`renamed_to` handles symbol changes. yahoo silently auto-redirects (querying `FB` returns META data); the adapter compares `result.symbol !== queriedSymbol` to detect and writes the pointer.

`search_text` + trigram GIN supports the `⌘K` Market search section with sub-50ms fuzzy match up to 100k symbols.

**Removed columns from earlier draft**: `cik` (not provided by yahoo — would need SEC EDGAR backfill, out of v1 scope). See `logs/probes/ANALYSIS.md` §3.4.

### 3.9 quote_cache

Hot cache of last quote per symbol. Updated by the quote-fetch route (yahoo-finance2 primary per `logs/probes/ANALYSIS.md`; Finnhub fallback for v1.5 WebSocket). TTL enforced at read time (30s during hours, 5 min after).

```sql
CREATE TABLE quote_cache (
  symbol             text PRIMARY KEY REFERENCES securities(symbol) ON DELETE CASCADE,

  -- regular session
  price              numeric(20,6) NOT NULL,             -- regularMarketPrice
  prev_close         numeric(20,6),
  day_high           numeric(20,6),
  day_low            numeric(20,6),
  open_price         numeric(20,6),
  volume             bigint,

  -- live order book (only meaningful during market hours)
  bid                numeric(20,6),
  ask                numeric(20,6),
  bid_size           integer,
  ask_size           integer,

  -- extended hours (U-2: pre/post market on Home + SymbolDetail)
  pre_market_price   numeric(20,6),
  pre_market_change  numeric(20,6),
  pre_market_at      timestamptz,
  post_market_price  numeric(20,6),
  post_market_change numeric(20,6),
  post_market_at     timestamptz,

  -- session context
  market_state       text,                               -- 'REGULAR' | 'PRE' | 'POST' | 'CLOSED' | 'PREPRE' | 'POSTPOST'
  market_time        timestamptz,                        -- yahoo's regularMarketTime (real exchange time)

  -- bookkeeping
  source             text NOT NULL,                      -- 'yahoo' | 'finnhub'
  fetched_at         timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_quote_cache_freshness ON quote_cache (fetched_at);
```

Read pattern: `SELECT * FROM quote_cache WHERE symbol = ANY($1) AND fetched_at > now() - interval '30 seconds'`. Misses trigger an upstream fetch + UPSERT.

**Why 14 added columns**: cache rewritten every 30s for ~30 active symbols × 24h = ~90k writes/day total, ~10 KB total payload. Trivial. Avoids needing a separate "extended-quote" table for the SymbolDetail hero (R-SC3) which renders all this data inline.

### 3.9.1 securities_meta (slow-changing snapshot)

Many useful quote fields (PE / EPS / 52w / MA / market cap / next earnings / dividend yield / analyst rating) change at most daily and don't belong in the hot 30s-rewrite cache. Separate table refreshed once per day per symbol.

```sql
CREATE TABLE securities_meta (
  symbol                  text PRIMARY KEY REFERENCES securities(symbol) ON DELETE CASCADE,

  -- size / shares
  market_cap              numeric(24,0),                  -- AAPL ~4.4T fits comfortably
  shares_outstanding      bigint,
  float_shares            bigint,

  -- valuation
  trailing_pe             numeric(10,4),
  forward_pe              numeric(10,4),
  price_to_book           numeric(10,4),
  eps_trailing            numeric(10,4),
  eps_forward             numeric(10,4),
  book_value              numeric(20,6),

  -- 52-week range
  fifty_two_week_high     numeric(20,6),
  fifty_two_week_low      numeric(20,6),

  -- moving averages (for R-I1 chart overlay toggle)
  fifty_day_average       numeric(20,6),
  two_hundred_day_average numeric(20,6),

  -- dividends (next event; history goes to dividends_announced)
  dividend_rate           numeric(20,6),
  dividend_yield          numeric(10,4),
  next_dividend_date      date,
  next_ex_dividend_date   date,

  -- next earnings
  next_earnings_at        timestamptz,
  next_earnings_is_est    boolean,

  -- analyst consensus (1.0 strong buy → 5.0 strong sell)
  analyst_rating_mean     numeric(10,4),
  analyst_target_mean     numeric(20,6),
  analyst_target_high     numeric(20,6),
  analyst_target_low      numeric(20,6),
  analyst_recommendation  text,                           -- 'BUY' | 'HOLD' | 'SELL' (yahoo recommendationKey)

  refreshed_at            timestamptz NOT NULL DEFAULT now(),
  created_at              timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_securities_meta_freshness ON securities_meta (refreshed_at);
```

For ETFs (e.g. SPY), most fields are NULL — yahoo's quoteSummary returns a strict subset of modules. Adapter must branch on `securities.asset_type`.

### 3.10 prices_daily

Daily OHLCV. Backfilled on first symbol lookup (yahoo-finance2 single call → 5+ years); kept current by a nightly job + ad-hoc fills when a user opens a chart with `range` > cached span.

```sql
CREATE TABLE prices_daily (
  symbol     text NOT NULL REFERENCES securities(symbol) ON DELETE CASCADE,
  date       date NOT NULL,
  open       numeric(20,6) NOT NULL,
  high       numeric(20,6) NOT NULL,
  low        numeric(20,6) NOT NULL,
  close      numeric(20,6) NOT NULL,
  adj_close  numeric(20,6),                              -- split + dividend adjusted
  volume     bigint,
  PRIMARY KEY (symbol, date)
);
CREATE INDEX idx_prices_daily_date ON prices_daily (date);
```

For a typical operator (100 symbols × 365 days × 5 years) ≈ 180k rows — trivial.

Storage estimate: row width ~120 bytes; 180k × 120 = 22 MB. Compress with tablespace defaults; no partitioning needed in v1. Re-evaluate at > 10M rows.

### 3.11 dividends_announced

Global corporate dividend declarations. yahoo's chart() events feed only returns `{amount, date}` per occurrence (see `logs/probes/ANALYSIS.md` §F8) — `pay_date`, `record_date`, and explicit `frequency` are not available historically.

```sql
CREATE TABLE dividends_announced (
  symbol       text NOT NULL REFERENCES securities(symbol) ON DELETE CASCADE,
  ex_date      date NOT NULL,
  amount       numeric(20,6) NOT NULL,
  currency     char(3) NOT NULL DEFAULT 'USD',
  frequency    text,                                      -- nullable; computed by app heuristic on inter-date spacing
  PRIMARY KEY (symbol, ex_date)
);
CREATE INDEX idx_dividends_announced_ex ON dividends_announced (ex_date);
```

For the **next** ex/pay date specifically, use `securities_meta.next_ex_dividend_date` + `next_dividend_date` — those ARE returned by quoteSummary's `calendarEvents` module.

Used by:
- Symbol detail Dividend History card (historical)
- Home UpcomingEvents (next 7 days — joins `securities_meta` for "next" + this table for inferring schedule)
- Auto-suggest DIV transactions on ex-date for held positions (v1.5)

**Removed columns from earlier draft**: `pay_date`, `record_date` (not in yahoo events feed for history; next-only pay date moved to `securities_meta`). See `logs/probes/ANALYSIS.md` §3.3.

### 3.12 splits

```sql
CREATE TABLE splits (
  symbol            text NOT NULL REFERENCES securities(symbol) ON DELETE CASCADE,
  ex_date           date NOT NULL,
  ratio_numerator   integer NOT NULL CHECK (ratio_numerator > 0),
  ratio_denominator integer NOT NULL CHECK (ratio_denominator > 0),
  PRIMARY KEY (symbol, ex_date)
);
CREATE INDEX idx_splits_ex ON splits (ex_date);
```

Positions calc joins splits to adjust pre-split qty: `effective_qty = stored_qty × Π(num/den for splits between txn_date and now)`. Per-share cost adjusted inversely.

### 3.13 earnings_calendar

```sql
CREATE TABLE earnings_calendar (
  symbol         text NOT NULL REFERENCES securities(symbol) ON DELETE CASCADE,
  report_date    date NOT NULL,
  fiscal_period  text,                                    -- 'Q1 2026' etc.
  eps_estimate   numeric(20,6),
  eps_actual     numeric(20,6),
  revenue_est    numeric(20,4),
  revenue_actual numeric(20,4),
  bmo_amc        text CHECK (bmo_amc IN ('BMO', 'AMC', 'DMH')),  -- before/after/during market
  PRIMARY KEY (symbol, report_date)
);
CREATE INDEX idx_earnings_date ON earnings_calendar (report_date);
```

Used by Symbol detail "Next earnings" line + Home UpcomingEvents.

### 3.14 news_cache (v1.5)

```sql
CREATE TABLE news_cache (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v7(),
  symbol          text,                                   -- NULL = market-wide
  headline        text NOT NULL,
  publisher       text,
  url             text NOT NULL,
  thumbnail_url   text,
  published_at    timestamptz NOT NULL,
  fetched_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_news_symbol_pub ON news_cache (symbol, published_at DESC);
CREATE INDEX idx_news_market ON news_cache (published_at DESC) WHERE symbol IS NULL;
```

### 3.15 profile_preferences

```sql
CREATE TABLE profile_preferences (
  profile_id              uuid PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  default_chart_range     text NOT NULL DEFAULT '3M',
  default_chart_mode      text NOT NULL DEFAULT 'area',
  privacy_level           smallint NOT NULL DEFAULT 0 CHECK (privacy_level BETWEEN 0 AND 2),
  compact_money           boolean NOT NULL DEFAULT false,
  benchmark_symbol        text DEFAULT 'SPY',
  positions_columns_json  jsonb NOT NULL DEFAULT '[]'::jsonb,   -- user-customized column order
  watchlist_active_id     uuid REFERENCES watchlists(id) ON DELETE SET NULL,
  updated_at              timestamptz NOT NULL DEFAULT now()
);
```

One row per profile, lazy-inserted on first read.

### 3.16 audit_log (optional, recommended)

For debug / "what changed when". Disabled by default; enabled per `app_settings.audit_enabled` flag.

```sql
CREATE TABLE audit_log (
  id          bigserial PRIMARY KEY,
  profile_id  uuid,
  entity      text NOT NULL,        -- 'transactions', 'accounts', etc.
  entity_id   uuid,
  action      text NOT NULL,        -- 'INSERT' | 'UPDATE' | 'DELETE'
  diff_json   jsonb,
  occurred_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_audit_recent ON audit_log (occurred_at DESC);
CREATE INDEX idx_audit_entity ON audit_log (entity, entity_id);
```

Populated by triggers; bounded by a cleanup job (delete > 90 days).

---

## 4. Drizzle schema.ts structure

```
db/
  client.ts                 # drizzle({ schema }) with @neondatabase/serverless
  schema/
    index.ts                # re-export everything
    enums.ts                # pgEnum declarations
    app.ts                  # app_settings
    profiles.ts             # profiles + profile_preferences
    accounts.ts             # accounts
    watchlists.ts           # watchlists + watchlist_items
    transactions.ts         # transactions + csv_imports
    alerts.ts               # alerts
    market.ts               # securities + quote_cache + prices_daily
    corporate.ts            # dividends_announced + splits + earnings_calendar
    news.ts                 # news_cache
    audit.ts                # audit_log
  queries/                  # composable query builders
    positions.ts            # the derived positions calc (§6)
    performance.ts          # TWR + benchmark
    dividends.ts            # received + upcoming
    tax.ts                  # holding period + wash sale (§7)
    search.ts               # ⌘K palette
  mutations/                # complement to queries
    transactions.ts         # create/update/delete + cascade
    profiles.ts
    accounts.ts
    watchlists.ts
  migrations/               # drizzle-kit output
    0000_init.sql
    0001_*.sql
```

Example `schema/profiles.ts`:

```ts
import { pgTable, uuid, text, smallint, integer, boolean, timestamptz, check } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { avatarKindEnum, relationEnum } from './enums';

export const profiles = pgTable('profiles', {
  id:            uuid('id').primaryKey().default(sql`uuid_generate_v7()`),
  name:          text('name').notNull(),
  displayName:   text('display_name'),
  avatarKind:    avatarKindEnum('avatar_kind').notNull().default('INITIALS'),
  avatarValue:   text('avatar_value').notNull().default(''),
  colorSlot:     smallint('color_slot').notNull(),
  relation:      relationEnum('relation').notNull().default('OTHER'),
  birthYear:     smallint('birth_year'),
  isPinned:      boolean('is_pinned').notNull().default(false),
  sortOrder:     integer('sort_order').notNull().default(0),
  pinHash:       text('pin_hash'),
  lastActiveAt:  timestamptz('last_active_at'),
  createdAt:     timestamptz('created_at').notNull().defaultNow(),
  updatedAt:     timestamptz('updated_at').notNull().defaultNow(),
}, (t) => ({
  nameLen:    check('chk_profiles_name_len', sql`char_length(${t.name}) BETWEEN 1 AND 64`),
  colorRange: check('chk_profiles_color', sql`${t.colorSlot} BETWEEN 1 AND 8`),
}));

export type Profile       = typeof profiles.$inferSelect;
export type NewProfile    = typeof profiles.$inferInsert;
```

---

## 5. indexes (by query)

The right hot-path indexes matter more than the table layout. Each entry is `(query family → index → cost / cardinality note)`.

| query (per INTERACTION_SPEC §7.2) | index used | notes |
|---|---|---|
| `['transactions', profileId, accountFilter, filterHash]` paginated | `idx_transactions_profile_account_executed` = `(profile_id, account_id, executed_at DESC)` | covers Activity tab; cursor pagination on `(executed_at, id)` |
| `['myPosition', profileId, symbol]` (aggregate across accounts) | `idx_transactions_profile_symbol_executed` = `(profile_id, symbol, executed_at)` | walks all txns for one (profile, symbol) |
| `['positions', profileId, accountFilter, status]` | composite scan of above | small dataset; sequential acceptable per profile |
| `['transactions.recent', profileId, limit]` | `idx_transactions_profile_executed` = `(profile_id, executed_at DESC)` | LIMIT 5 |
| `['quote.batch', symbols]` | PK on `(symbol)` | trivial |
| `['priceHistory', symbol, range]` | PK on `(symbol, date)` | range scan |
| `['watchlist', listId]` | PK on `(watchlist_id, symbol)` + `idx_watchlist_items_sort` | small |
| `['accounts', profileId]` | `idx_accounts_profile` | usually < 10 rows |
| `['dividends', profileId]` (received aggregate) | `idx_transactions_profile_kind` = `(profile_id, kind, executed_at)` WHERE `kind='DIV'` | partial index |
| `['events.upcoming', profileId, 7]` | `idx_dividends_announced_ex` + `idx_earnings_date` + join to held symbols | tiny lookup |
| `['search.market', q]` | `idx_securities_search` (GIN trigram) | sub-50ms for 100k symbols |
| wash sale window scan (§7.3) | `idx_transactions_profile_symbol_executed` | bounded to ±30 day window |

Full index list to create alongside tables:

```sql
CREATE INDEX idx_transactions_profile_executed       ON transactions (profile_id, executed_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_transactions_profile_account_exec   ON transactions (profile_id, account_id, executed_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_transactions_profile_symbol_exec    ON transactions (profile_id, symbol, executed_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_transactions_profile_kind           ON transactions (profile_id, kind, executed_at) WHERE deleted_at IS NULL;
CREATE INDEX idx_transactions_import                 ON transactions (source_import_id) WHERE source_import_id IS NOT NULL;
CREATE INDEX idx_transactions_deleted                ON transactions (deleted_at) WHERE deleted_at IS NOT NULL;     -- cleanup job
```

All hot indexes filter `deleted_at IS NULL` so the soft-delete tombstones don't bloat the index.

---

## 6. derived data — positions

Positions are the single most-read derived view. We expose them as a **Postgres SQL function** rather than a materialized view, because:
- Operator has < 10 accounts × < 200 symbols = ~2000 rows max
- Function returns instantly under that scale
- No staleness window vs. materialized view's
- App layer caches via TanStack Query staleTime

### 6.1 stored function `get_positions`

```sql
CREATE OR REPLACE FUNCTION get_positions(
  p_profile_id   uuid,
  p_account_id   uuid DEFAULT NULL,             -- NULL = all accounts in profile
  p_status       text DEFAULT 'open'            -- 'open' | 'closed' | 'all'
) RETURNS TABLE (
  account_id     uuid,
  symbol         text,
  quantity       numeric(18,8),
  avg_cost       numeric(20,6),
  total_cost     numeric(20,4),
  realized_pl    numeric(20,4),
  first_buy_at   timestamptz,
  last_txn_at    timestamptz
) LANGUAGE sql STABLE AS $$
  WITH adjusted AS (
    -- 1) apply splits to historical txns
    SELECT
      t.account_id, t.symbol, t.kind, t.executed_at,
      t.quantity * COALESCE(split_factor(t.symbol, t.executed_at::date), 1) AS adj_qty,
      t.price    / NULLIF(COALESCE(split_factor(t.symbol, t.executed_at::date), 1), 0) AS adj_price,
      t.fees
    FROM transactions t
    WHERE t.profile_id = p_profile_id
      AND t.deleted_at IS NULL
      AND (p_account_id IS NULL OR t.account_id = p_account_id)
      AND t.kind IN ('BUY','SELL','TRANSFER_IN','TRANSFER_OUT','SPLIT')
  ),
  rolled AS (
    SELECT
      account_id, symbol,
      SUM(CASE WHEN kind IN ('BUY','TRANSFER_IN')  THEN  adj_qty
               WHEN kind IN ('SELL','TRANSFER_OUT') THEN -adj_qty
               ELSE 0 END)                                                 AS quantity,
      SUM(CASE WHEN kind IN ('BUY','TRANSFER_IN')  THEN adj_qty * adj_price + fees
               ELSE 0 END)                                                 AS gross_cost_buys,
      SUM(CASE WHEN kind IN ('BUY','TRANSFER_IN')  THEN adj_qty
               ELSE 0 END)                                                 AS gross_qty_buys,
      SUM(CASE WHEN kind = 'SELL'                  THEN adj_qty * adj_price - fees
               ELSE 0 END)                                                 AS gross_proceeds_sells,
      SUM(CASE WHEN kind = 'SELL'                  THEN adj_qty * (
            (SUM(adj_qty*adj_price + fees) FILTER (WHERE kind='BUY')
             / NULLIF(SUM(adj_qty) FILTER (WHERE kind='BUY'), 0))
          ) ELSE 0 END) OVER (PARTITION BY account_id, symbol)              AS approx_cost_of_sales,
      MIN(CASE WHEN kind = 'BUY' THEN executed_at END)                     AS first_buy_at,
      MAX(executed_at)                                                     AS last_txn_at
    FROM adjusted
    GROUP BY account_id, symbol
  )
  SELECT
    account_id, symbol,
    quantity,
    CASE WHEN gross_qty_buys = 0 THEN 0
         ELSE gross_cost_buys / gross_qty_buys END                         AS avg_cost,
    CASE WHEN quantity = 0 THEN 0
         ELSE quantity * (gross_cost_buys / NULLIF(gross_qty_buys, 0)) END AS total_cost,
    gross_proceeds_sells - approx_cost_of_sales                            AS realized_pl,
    first_buy_at,
    last_txn_at
  FROM rolled
  WHERE
    (p_status = 'open'   AND quantity > 0)
    OR (p_status = 'closed' AND quantity = 0)
    OR (p_status = 'all');
$$;
```

Note: `split_factor(symbol, asOf)` is a helper that returns Π(num/den) for all splits between `asOf` and `current_date`.

This function is the **avg-cost** implementation. A separate `get_positions_fifo` mirrors it with FIFO logic for accounts with `tax_method='FIFO'` (significantly more complex — uses a recursive CTE that walks BUY → SELL lot consumption). App layer chooses which function by `account.tax_method`.

For v1, ship `get_positions` only; document `get_positions_fifo` as v1.5.

### 6.2 cross-account aggregated MyPosition (U-1)

```sql
CREATE OR REPLACE FUNCTION get_my_position(
  p_profile_id  uuid,
  p_symbol      text
) RETURNS TABLE (
  account_id    uuid,
  account_name  text,
  quantity      numeric(18,8),
  avg_cost      numeric(20,6),
  first_buy_at  timestamptz,
  is_lt         boolean,
  days_to_lt    integer
) LANGUAGE sql STABLE AS $$
  SELECT
    p.account_id,
    a.name,
    p.quantity,
    p.avg_cost,
    p.first_buy_at,
    p.first_buy_at + interval '1 year' <= now() AS is_lt,
    GREATEST(0, (date(p.first_buy_at + interval '1 year') - current_date))::int AS days_to_lt
  FROM get_positions(p_profile_id, NULL, 'open') p
  JOIN accounts a ON a.id = p.account_id
  WHERE p.symbol = p_symbol
$$;
```

UI sums quantity/cost across rows for the aggregated header; rows shown per-account beneath.

### 6.3 net worth + today P/L (Home hero, Portfolio Summary)

```sql
CREATE OR REPLACE FUNCTION get_net_worth(
  p_profile_id  uuid,
  p_account_id  uuid DEFAULT NULL
) RETURNS TABLE (
  total_market_value  numeric(20,4),
  total_cost          numeric(20,4),
  today_pl            numeric(20,4),
  today_pct           numeric(10,4),
  cash_balance        numeric(20,4)
) LANGUAGE sql STABLE AS $$
  WITH pos AS (
    SELECT p.*, q.price, q.prev_close
    FROM get_positions(p_profile_id, p_account_id, 'open') p
    LEFT JOIN quote_cache q ON q.symbol = p.symbol
  ),
  cash AS (
    SELECT COALESCE(SUM(
      CASE WHEN kind = 'CASH_IN'  THEN quantity
           WHEN kind = 'CASH_OUT' THEN -quantity
           WHEN kind = 'DIV'      THEN quantity * price
           WHEN kind = 'BUY'      THEN -(quantity * price + fees)
           WHEN kind = 'SELL'     THEN (quantity * price - fees)
           WHEN kind = 'FEE'      THEN -fees
           ELSE 0 END
    ), 0) AS bal
    FROM transactions
    WHERE profile_id = p_profile_id
      AND deleted_at IS NULL
      AND (p_account_id IS NULL OR account_id = p_account_id)
  )
  SELECT
    COALESCE(SUM(quantity * price), 0)                                       AS total_market_value,
    COALESCE(SUM(total_cost), 0)                                             AS total_cost,
    COALESCE(SUM(quantity * (price - prev_close)), 0)                        AS today_pl,
    CASE WHEN SUM(quantity * prev_close) = 0 THEN 0
         ELSE SUM(quantity * (price - prev_close)) / SUM(quantity * prev_close) * 100
    END                                                                       AS today_pct,
    (SELECT bal FROM cash)                                                   AS cash_balance
  FROM pos;
$$;
```

App layer ALWAYS calls this through TanStack Query (`portfolio.summary`). It's pure SQL; Neon serverless handles concurrency.

---

## 7. tax-relevant queries (U-5)

### 7.1 holding period flag for a position

Already returned by `get_my_position` (`is_lt`, `days_to_lt`). Render badge in Positions table accordingly.

### 7.2 realized gain/loss split by ST vs LT (Tax tab, v1.5)

Requires lot matching — needs FIFO walk per closed slice. Implementation outline:

```sql
CREATE OR REPLACE FUNCTION get_realized_pl_lots(
  p_profile_id  uuid,
  p_year        integer
) RETURNS TABLE (
  account_id      uuid,
  symbol          text,
  acquired_at     timestamptz,
  sold_at         timestamptz,
  quantity        numeric(18,8),
  cost_basis      numeric(20,4),
  proceeds        numeric(20,4),
  realized_pl     numeric(20,4),
  is_long_term    boolean
) LANGUAGE plpgsql STABLE AS $$
  /* Walks BUY queue per (account, symbol) in FIFO,
     matching SELLs to consume lots. Splits adjustment applied
     before matching. Emits one row per consumed lot piece. */
  ...
$$;
```

The detailed implementation is left to engineering (recursive CTE or PL/pgSQL loop). UI consumes a sum over rows grouped by `is_long_term`.

### 7.3 wash sale detection (U-5)

```sql
-- For each SELL with loss, find any BUY of same symbol
-- in same profile within ±30 days. Returns potential wash sales for the period.
WITH losses AS (
  SELECT t.id, t.profile_id, t.account_id, t.symbol, t.executed_at,
         t.quantity, t.price, t.fees
  FROM transactions t
  WHERE t.profile_id = $1
    AND t.kind = 'SELL'
    AND t.deleted_at IS NULL
    AND t.executed_at BETWEEN $2 AND $3
    -- has loss: requires joining cost basis at time of sale — implementation detail
)
SELECT l.id AS sell_id,
       l.symbol,
       l.executed_at AS sell_at,
       b.id AS buy_id,
       b.executed_at AS buy_at,
       (b.executed_at - l.executed_at) AS offset
FROM losses l
JOIN transactions b
  ON b.profile_id = l.profile_id
 AND b.symbol = l.symbol
 AND b.kind IN ('BUY','TRANSFER_IN')
 AND b.deleted_at IS NULL
 AND b.executed_at BETWEEN l.executed_at - interval '30 days'
                       AND l.executed_at + interval '30 days'
 AND b.id <> l.id;
```

Wrap as `get_wash_sale_candidates(profile_id, start, end)`. Note: wash sale rule is per-taxpayer (IRS), and a profile maps to one taxpayer, so the query is per-profile only — never crosses profiles (enforced by `t.profile_id` predicate on both sides of the join).

---

## 8. migrations

### 8.1 strategy

- Drizzle Kit: `drizzle-kit generate` emits `.sql` migrations from schema diffs; commit those to git.
- Apply via `drizzle-kit migrate` in CI or boot-time script.
- Migrations are forward-only; rollback by writing a new forward migration.

### 8.2 v1 initial migration (`0000_init.sql`)

In order:

1. extensions
2. enums (`avatar_kind`, `relation`, `tax_method`, `account_kind`, `transaction_kind`, `asset_type`, `alert_direction`, `alert_status`)
3. `app_settings` (singleton seeded with `id=1, schema_version=1`)
4. `profiles` (+ trigger `set_updated_at`)
5. `profile_preferences`
6. `accounts`
7. `watchlists`, `watchlist_items`
8. `securities`
9. `quote_cache`, `securities_meta`, `prices_daily`, `dividends_announced`, `splits`, `earnings_calendar`, `news_cache`
10. `csv_imports`
11. `transactions` (depends on accounts + csv_imports for FK)
12. `alerts`
13. `audit_log`
14. functions: `split_factor`, `get_positions`, `get_my_position`, `get_net_worth`, `get_wash_sale_candidates`
15. all indexes (§5)

### 8.3 expected v1.5 migrations

| migration | adds |
|---|---|
| `0001_fifo_positions.sql` | `get_positions_fifo`, `get_realized_pl_lots` |
| `0002_alerts_live.sql` | nothing new in schema (table exists); maybe trigger to set `triggered_at` |
| `0003_offline_queue.sql` | `outbox_mutations` table (offline write queue) |
| `0004_audit_default_on.sql` | audit triggers on profiles/accounts/transactions/watchlists |
| `0005_news_pinned.sql` | per-profile pinned articles, etc. |

### 8.4 schema_version checking

App boot:
```
SELECT schema_version FROM app_settings WHERE id = 1;
```
If mismatch with compiled `EXPECTED_SCHEMA_VERSION` constant → log warning + show maintenance banner. Migrations should update this row in their last statement.

---

## 9. backup / export / restore

### 9.1 backups

- Neon's automatic point-in-time backups (PITR up to 7 days on free tier; longer on paid).
- Operator can trigger manual snapshot via Neon dashboard before risky ops.
- v1 ships no DB-internal backup tooling.

### 9.2 export (operator action from Me → Data)

| format | content | implementation |
|---|---|---|
| Per-profile CSV bundle | transactions, accounts, watchlists, dividends → zip of CSVs | streaming CSV via Node `Readable` |
| Per-profile JSON | full profile-scoped dump | single JSON download |
| Global JSON | all profiles + market data | rare; only for migration |

CSV row format for transactions matches the canonical CSV import format (round-trip safe).

### 9.3 import

- Same broker-templated CSV import flow (INTERACTION_SPEC §11.5) accepts our own export format under "Custom" template
- "Restore from backup" sub-flow in Me → Data: file picker → validates → bulk insert in single TX

### 9.4 disaster recovery

- Production DB lost: restore from latest Neon PITR.
- Schema drift: re-apply `drizzle-kit migrate` against restored DB.
- App secrets (operator password hash, finnhub key) are in DB → backup includes them. If app_settings row destroyed, `pnpm seed:operator` script rewrites a fresh row from env vars.

---

## 10. performance budget

### 10.1 expected scale (single household)

| entity | typical count | upper bound | growth |
|---|---|---|---|
| profiles | 1–5 | 12 | static |
| accounts per profile | 1–5 | 15 | static |
| transactions per profile | 100–5,000 | 50,000 | +500/yr active |
| watchlists per profile | 1–5 | 20 | static |
| watchlist items total | < 100 | 500 | static |
| securities | 200–2,000 | 50,000 (full US universe) | static after fill |
| prices_daily | 100k–500k | 5M (US universe × 5y) | +400/sym/yr |
| quote_cache | = active symbols | = securities | rotating |
| dividends_announced | 10k–50k | 200k | +10k/yr |
| splits | < 5k | 20k | rare |
| news_cache | bounded by retention | 100k | retention 30 days |

Total DB size estimate v1 typical: **< 200 MB**; upper: **< 5 GB**. Neon free tier (3 GB) covers typical; paid covers upper.

### 10.2 query budget

| query | target p50 | target p95 | notes |
|---|---|---|---|
| `get_net_worth(profile_id)` | < 30ms | < 100ms | hot path, every Home open |
| `get_positions(profile_id)` | < 50ms | < 200ms | Portfolio tab |
| `transactions` list paginated | < 30ms | < 100ms | Activity tab |
| `search.market(q)` | < 50ms | < 150ms | GIN trigram |
| `quote.batch(symbols[10])` | DB lookup < 10ms; Finnhub round-trip 100–400ms | — | DB cache hit dominates |

If a query exceeds budget consistently: profile via `EXPLAIN ANALYZE`, then either add index or move to materialized view.

### 10.3 connection model

- Neon serverless driver (HTTP-based) → no persistent connection
- Each Next.js Route Handler / Server Component opens a stateless HTTP req → trivially scales
- No `pgbouncer` needed
- Avoid long-running transactions; CSV import wraps in single TX but expected < 5s

---

## 11. future evolution

These are anticipated; schema preserves space.

- **Multi-operator (household 2+ logins)**: add `operators` table; `app_settings` becomes multi-row; `profiles.owner_operator_id` FK. Migration: add column nullable, backfill from sole operator, then NOT NULL. App layer adds RBAC.
- **Crypto / international equities**: `securities.asset_type` already enum-extensible; `currency` columns already present; need FX rate cache table + per-asset price source routing.
- **Tax lots specified at sale time (SPEC_ID)**: add `transaction_lot_links(sell_txn_id, buy_txn_id, qty)` table to record explicit lot matching.
- **Sharing**: read-only deep link to a frozen portfolio snapshot for advisor review. New `snapshot` table storing a JSON dump + signed token.
- **Web Push subscriptions**: `alerts.push_subscription_endpoint` already in place; add `push_subscriptions(profile_id, endpoint, keys_json, created_at)` for many-to-one.
- **Custom benchmarks**: `benchmarks(profile_id, name, weights_json)` for blended index vs current single-symbol.
- **Options trading**: extend `transactions.kind` with `OPTION_BUY_TO_OPEN`, etc.; add `option_legs(transaction_id, strike, expiry, type, ...)`.

---

## 12. open decisions for engineering

1. **uuid_v7 source**: extension (e.g., `pg_uuidv7`) vs app-generated (`uuidv7` npm). Recommendation: app-generated for portability (Neon may not ship the extension); pass as parameter on insert.
2. **Function vs view for positions**: confirmed function (§6). If app scales to thousands of profiles, revisit with materialized view + scheduled refresh.
3. **Trigger-based `updated_at`**: vs application-set. Recommendation: trigger (deterministic, no client clock skew).
4. **Soft-delete cleanup**: cron job vs scheduled function in Neon. Recommendation: small Edge function on Vercel cron every 5 min: `DELETE FROM transactions WHERE deleted_at < now() - interval '10 seconds'`.
5. **Audit log default**: on or off in v1? Recommendation: off (overhead trivial but adds noise; flip on per-need).
6. **Cash modeling polymorphism**: current design hijacks `quantity` for CASH_* kinds. Alternative is a separate `cash_transactions` table. Confirmed to keep polymorphism for v1; revisit if it bites.
7. **Symbol rename pointer chain depth**: `securities.renamed_to` could chain indefinitely. Recommendation: app layer follows up to 3 hops then warns.
