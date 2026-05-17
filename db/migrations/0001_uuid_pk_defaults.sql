-- 0001_uuid_pk_defaults.sql
--
-- The Drizzle schema declares UUID v7 generation via `$defaultFn(() => uuidv7())`
-- which runs in Node — perfect when the app inserts via Drizzle, but raw SQL
-- inserts (seed scripts, ad-hoc fixes via psql, smoke tests) hit a NOT NULL
-- violation because Postgres has no column DEFAULT.
--
-- Fix: add a fallback `DEFAULT gen_random_uuid()` (UUID v4, built-in in
-- Postgres 13+, no extension needed) on every UUID PK column. App-layer
-- inserts still win when they supply a value (uuidv7 preferred for natural
-- time-ordering), but raw SQL no longer needs to know.
--
-- Affected tables: profiles, accounts, watchlists, csv_imports, transactions,
-- alerts, news_cache. Excluded: app_settings (smallint PK), profile_preferences
-- (PK = FK to profiles), watchlist_items (composite PK), audit_log (bigserial).
--
-- Idempotent: ALTER COLUMN SET DEFAULT is safe to re-run.

ALTER TABLE "profiles"    ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "accounts"    ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "watchlists"  ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "csv_imports" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "alerts"      ALTER COLUMN "id" SET DEFAULT gen_random_uuid();--> statement-breakpoint
ALTER TABLE "news_cache"  ALTER COLUMN "id" SET DEFAULT gen_random_uuid();
