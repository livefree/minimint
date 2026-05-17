-- =============================================================================
-- 0000_init — mini-mint v1 initial schema
-- =============================================================================
--
-- ROLLBACK PLAN:
--   This migration creates 18 tables, 8 enums, 23 indexes, 3 extensions, and 1
--   trigger function in an empty database. To rollback an unsuccessful apply:
--     DROP SCHEMA public CASCADE; CREATE SCHEMA public;
--     -- then re-apply from 0000.
--   To rollback after the DB has real data, restore from Neon PITR (see
--   DATABASE_SPEC §9). Forward-only thereafter.
--
-- CONTENT:
--   1. extensions (uuid-ossp, pg_trgm, btree_gin)
--   2. set_updated_at() trigger function
--   3. 8 enums
--   4. 18 tables (app_settings → profiles → … → audit_log)
--   5. all FKs as DO $$ ... ADD CONSTRAINT $$ blocks
--   6. all indexes (incl. partial WHERE deleted_at IS NULL + GIN trigram)
--   7. per-table updated_at triggers
--   8. stored functions: split_factor, get_positions, get_my_position,
--      get_net_worth, get_wash_sale_candidates (DATABASE_SPEC §6, §7.3)
--
-- POST-APPLY:
--   - Run `pnpm seed:operator` to insert app_settings row id=1 with
--     operator_password_hash + session_secret_kid + schema_version=1 from env
--     (those columns are NOT NULL so this migration intentionally does NOT
--     insert them — see DATABASE_SPEC §8.4 + §9.4).
--
-- =============================================================================

-- Required extensions (DATABASE_SPEC §3, §8.2).
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";       -- search_text GIN trigram (§3.8)
CREATE EXTENSION IF NOT EXISTS "btree_gin";     -- composite GIN, future
--> statement-breakpoint

-- Bumped on each UPDATE by trigger (§2.4). One function, attached per-table.
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;
--> statement-breakpoint

CREATE TYPE "public"."account_kind" AS ENUM('BROKERAGE', 'IRA_TRAD', 'IRA_ROTH', 'HSA', '401K', '529', 'TRUST', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."alert_direction" AS ENUM('ABOVE', 'BELOW');--> statement-breakpoint
CREATE TYPE "public"."alert_status" AS ENUM('ACTIVE', 'TRIGGERED', 'DISABLED');--> statement-breakpoint
CREATE TYPE "public"."asset_type" AS ENUM('EQUITY', 'ETF', 'MUTUAL_FUND', 'INDEX', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."avatar_kind" AS ENUM('INITIALS', 'EMOJI', 'PHOTO');--> statement-breakpoint
CREATE TYPE "public"."relation" AS ENUM('SELF', 'PARTNER', 'PARENT', 'CHILD', 'SIBLING', 'OTHER');--> statement-breakpoint
CREATE TYPE "public"."tax_method" AS ENUM('FIFO', 'AVG', 'LIFO', 'SPEC_ID');--> statement-breakpoint
CREATE TYPE "public"."transaction_kind" AS ENUM('BUY', 'SELL', 'DIV', 'SPLIT', 'FEE', 'CASH_IN', 'CASH_OUT', 'TRANSFER_IN', 'TRANSFER_OUT');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "app_settings" (
	"id" smallint PRIMARY KEY NOT NULL,
	"operator_password_hash" text NOT NULL,
	"session_secret_kid" text NOT NULL,
	"finnhub_api_key_enc" text,
	"refresh_seconds" integer DEFAULT 30 NOT NULL,
	"demo_mode" boolean DEFAULT false NOT NULL,
	"schema_version" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chk_app_settings_singleton" CHECK ("app_settings"."id" = 1),
	CONSTRAINT "chk_app_settings_refresh_seconds" CHECK ("app_settings"."refresh_seconds" BETWEEN 10 AND 3600)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "profile_preferences" (
	"profile_id" uuid PRIMARY KEY NOT NULL,
	"default_chart_range" text DEFAULT '3M' NOT NULL,
	"default_chart_mode" text DEFAULT 'area' NOT NULL,
	"privacy_level" smallint DEFAULT 0 NOT NULL,
	"compact_money" boolean DEFAULT false NOT NULL,
	"benchmark_symbol" text DEFAULT 'SPY',
	"positions_columns_json" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"watchlist_active_id" uuid,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chk_profile_preferences_privacy" CHECK ("profile_preferences"."privacy_level" BETWEEN 0 AND 2)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"display_name" text,
	"avatar_kind" "avatar_kind" DEFAULT 'INITIALS' NOT NULL,
	"avatar_value" text DEFAULT '' NOT NULL,
	"color_slot" smallint NOT NULL,
	"relation" "relation" DEFAULT 'OTHER' NOT NULL,
	"birth_year" smallint,
	"is_pinned" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"pin_hash" text,
	"last_active_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chk_profiles_name_len" CHECK (char_length("profiles"."name") BETWEEN 1 AND 64),
	CONSTRAINT "chk_profiles_color_slot" CHECK ("profiles"."color_slot" BETWEEN 1 AND 8),
	CONSTRAINT "chk_profiles_birth_year" CHECK ("profiles"."birth_year" IS NULL OR "profiles"."birth_year" BETWEEN 1900 AND 2100)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "accounts" (
	"id" uuid PRIMARY KEY NOT NULL,
	"profile_id" uuid NOT NULL,
	"name" text NOT NULL,
	"broker" text,
	"account_kind" "account_kind" DEFAULT 'BROKERAGE' NOT NULL,
	"last4" text,
	"currency" char(3) DEFAULT 'USD' NOT NULL,
	"color_slot" smallint NOT NULL,
	"tax_method" "tax_method" DEFAULT 'AVG' NOT NULL,
	"is_archived" boolean DEFAULT false NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"opened_at" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chk_accounts_name_len" CHECK (char_length("accounts"."name") BETWEEN 1 AND 64),
	CONSTRAINT "chk_accounts_last4" CHECK ("accounts"."last4" IS NULL OR "accounts"."last4" ~ '^\d{4}$'),
	CONSTRAINT "chk_accounts_currency_usd" CHECK ("accounts"."currency" = 'USD'),
	CONSTRAINT "chk_accounts_color_slot" CHECK ("accounts"."color_slot" BETWEEN 1 AND 8)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "watchlist_items" (
	"watchlist_id" uuid NOT NULL,
	"symbol" text NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"added_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "watchlist_items_watchlist_id_symbol_pk" PRIMARY KEY("watchlist_id","symbol"),
	CONSTRAINT "chk_watchlist_items_symbol" CHECK ("watchlist_items"."symbol" ~ '^[A-Z0-9.\^\-]{1,16}$')
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "watchlists" (
	"id" uuid PRIMARY KEY NOT NULL,
	"profile_id" uuid NOT NULL,
	"name" text NOT NULL,
	"color_slot" smallint,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chk_watchlists_name_len" CHECK (char_length("watchlists"."name") BETWEEN 1 AND 64),
	CONSTRAINT "chk_watchlists_color_slot" CHECK ("watchlists"."color_slot" IS NULL OR "watchlists"."color_slot" BETWEEN 1 AND 8)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "csv_imports" (
	"id" uuid PRIMARY KEY NOT NULL,
	"profile_id" uuid NOT NULL,
	"filename" text NOT NULL,
	"broker_template" text,
	"mapping_json" jsonb NOT NULL,
	"total_rows" integer NOT NULL,
	"imported_count" integer DEFAULT 0 NOT NULL,
	"skipped_count" integer DEFAULT 0 NOT NULL,
	"error_count" integer DEFAULT 0 NOT NULL,
	"error_log_json" jsonb,
	"undoable_until" timestamp with time zone,
	"undone_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "transactions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"profile_id" uuid NOT NULL,
	"account_id" uuid NOT NULL,
	"symbol" text NOT NULL,
	"kind" "transaction_kind" NOT NULL,
	"quantity" numeric(18, 8) NOT NULL,
	"price" numeric(20, 6) DEFAULT '0' NOT NULL,
	"fees" numeric(20, 4) DEFAULT '0' NOT NULL,
	"currency" char(3) DEFAULT 'USD' NOT NULL,
	"executed_at" timestamp with time zone NOT NULL,
	"note" text,
	"source_import_id" uuid,
	"deleted_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chk_transactions_symbol" CHECK ("transactions"."symbol" ~ '^[A-Z0-9.\^\-]{1,16}$'),
	CONSTRAINT "chk_transactions_currency_usd" CHECK ("transactions"."currency" = 'USD'),
	CONSTRAINT "chk_transactions_qty_sign" CHECK (("transactions"."kind" IN ('BUY','SELL','DIV','CASH_IN','CASH_OUT','TRANSFER_IN','TRANSFER_OUT') AND "transactions"."quantity" > 0)
          OR ("transactions"."kind" IN ('SPLIT','FEE'))),
	CONSTRAINT "chk_transactions_price" CHECK (("transactions"."kind" IN ('BUY','SELL','DIV') AND "transactions"."price" >= 0)
          OR ("transactions"."kind" IN ('SPLIT','FEE','CASH_IN','CASH_OUT','TRANSFER_IN','TRANSFER_OUT')))
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "alerts" (
	"id" uuid PRIMARY KEY NOT NULL,
	"profile_id" uuid NOT NULL,
	"symbol" text NOT NULL,
	"direction" "alert_direction" NOT NULL,
	"threshold" numeric(20, 6) NOT NULL,
	"status" "alert_status" DEFAULT 'ACTIVE' NOT NULL,
	"triggered_at" timestamp with time zone,
	"push_subscription_endpoint" text,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chk_alerts_symbol" CHECK ("alerts"."symbol" ~ '^[A-Z0-9.\^\-]{1,16}$')
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "prices_daily" (
	"symbol" text NOT NULL,
	"date" date NOT NULL,
	"open" numeric(20, 6) NOT NULL,
	"high" numeric(20, 6) NOT NULL,
	"low" numeric(20, 6) NOT NULL,
	"close" numeric(20, 6) NOT NULL,
	"adj_close" numeric(20, 6),
	"volume" bigint,
	CONSTRAINT "prices_daily_symbol_date_pk" PRIMARY KEY("symbol","date")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "quote_cache" (
	"symbol" text PRIMARY KEY NOT NULL,
	"price" numeric(20, 6) NOT NULL,
	"prev_close" numeric(20, 6),
	"day_high" numeric(20, 6),
	"day_low" numeric(20, 6),
	"open_price" numeric(20, 6),
	"volume" bigint,
	"bid" numeric(20, 6),
	"ask" numeric(20, 6),
	"bid_size" integer,
	"ask_size" integer,
	"pre_market_price" numeric(20, 6),
	"pre_market_change" numeric(20, 6),
	"pre_market_at" timestamp with time zone,
	"post_market_price" numeric(20, 6),
	"post_market_change" numeric(20, 6),
	"post_market_at" timestamp with time zone,
	"market_state" text,
	"market_time" timestamp with time zone,
	"source" text NOT NULL,
	"fetched_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "securities" (
	"symbol" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"exchange" text,
	"full_exchange" text,
	"asset_type" "asset_type" DEFAULT 'EQUITY' NOT NULL,
	"currency" char(3) DEFAULT 'USD' NOT NULL,
	"sector" text,
	"industry" text,
	"industry_key" text,
	"country" text,
	"timezone" text,
	"delisted_at" date,
	"renamed_to" text,
	"search_text" text GENERATED ALWAYS AS (lower(symbol || ' ' || name)) STORED,
	"refreshed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "chk_securities_symbol" CHECK ("securities"."symbol" ~ '^[A-Z0-9.\^\-]{1,16}$')
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "securities_meta" (
	"symbol" text PRIMARY KEY NOT NULL,
	"market_cap" numeric(24, 0),
	"shares_outstanding" bigint,
	"float_shares" bigint,
	"trailing_pe" numeric(10, 4),
	"forward_pe" numeric(10, 4),
	"price_to_book" numeric(10, 4),
	"eps_trailing" numeric(10, 4),
	"eps_forward" numeric(10, 4),
	"book_value" numeric(20, 6),
	"fifty_two_week_high" numeric(20, 6),
	"fifty_two_week_low" numeric(20, 6),
	"fifty_day_average" numeric(20, 6),
	"two_hundred_day_average" numeric(20, 6),
	"dividend_rate" numeric(20, 6),
	"dividend_yield" numeric(10, 4),
	"next_dividend_date" date,
	"next_ex_dividend_date" date,
	"next_earnings_at" timestamp with time zone,
	"next_earnings_is_est" boolean,
	"analyst_rating_mean" numeric(10, 4),
	"analyst_target_mean" numeric(20, 6),
	"analyst_target_high" numeric(20, 6),
	"analyst_target_low" numeric(20, 6),
	"analyst_recommendation" text,
	"refreshed_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "dividends_announced" (
	"symbol" text NOT NULL,
	"ex_date" date NOT NULL,
	"amount" numeric(20, 6) NOT NULL,
	"currency" char(3) DEFAULT 'USD' NOT NULL,
	"frequency" text,
	CONSTRAINT "dividends_announced_symbol_ex_date_pk" PRIMARY KEY("symbol","ex_date")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "earnings_calendar" (
	"symbol" text NOT NULL,
	"report_date" date NOT NULL,
	"fiscal_period" text,
	"eps_estimate" numeric(20, 6),
	"eps_actual" numeric(20, 6),
	"revenue_est" numeric(20, 4),
	"revenue_actual" numeric(20, 4),
	"bmo_amc" text,
	CONSTRAINT "earnings_calendar_symbol_report_date_pk" PRIMARY KEY("symbol","report_date"),
	CONSTRAINT "chk_earnings_bmo_amc" CHECK ("earnings_calendar"."bmo_amc" IS NULL OR "earnings_calendar"."bmo_amc" IN ('BMO','AMC','DMH'))
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "splits" (
	"symbol" text NOT NULL,
	"ex_date" date NOT NULL,
	"ratio_numerator" integer NOT NULL,
	"ratio_denominator" integer NOT NULL,
	CONSTRAINT "splits_symbol_ex_date_pk" PRIMARY KEY("symbol","ex_date"),
	CONSTRAINT "chk_splits_num_positive" CHECK ("splits"."ratio_numerator" > 0),
	CONSTRAINT "chk_splits_den_positive" CHECK ("splits"."ratio_denominator" > 0)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "news_cache" (
	"id" uuid PRIMARY KEY NOT NULL,
	"symbol" text,
	"headline" text NOT NULL,
	"publisher" text,
	"url" text NOT NULL,
	"thumbnail_url" text,
	"published_at" timestamp with time zone NOT NULL,
	"fetched_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "audit_log" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"profile_id" uuid,
	"entity" text NOT NULL,
	"entity_id" uuid,
	"action" text NOT NULL,
	"diff_json" jsonb,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "profile_preferences" ADD CONSTRAINT "profile_preferences_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "profile_preferences" ADD CONSTRAINT "profile_preferences_watchlist_active_id_watchlists_id_fk" FOREIGN KEY ("watchlist_active_id") REFERENCES "public"."watchlists"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "accounts" ADD CONSTRAINT "accounts_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "watchlist_items" ADD CONSTRAINT "watchlist_items_watchlist_id_watchlists_id_fk" FOREIGN KEY ("watchlist_id") REFERENCES "public"."watchlists"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "watchlists" ADD CONSTRAINT "watchlists_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "csv_imports" ADD CONSTRAINT "csv_imports_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transactions" ADD CONSTRAINT "transactions_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transactions" ADD CONSTRAINT "transactions_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transactions" ADD CONSTRAINT "transactions_source_import_id_csv_imports_id_fk" FOREIGN KEY ("source_import_id") REFERENCES "public"."csv_imports"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "alerts" ADD CONSTRAINT "alerts_profile_id_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "prices_daily" ADD CONSTRAINT "prices_daily_symbol_securities_symbol_fk" FOREIGN KEY ("symbol") REFERENCES "public"."securities"("symbol") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "quote_cache" ADD CONSTRAINT "quote_cache_symbol_securities_symbol_fk" FOREIGN KEY ("symbol") REFERENCES "public"."securities"("symbol") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "securities" ADD CONSTRAINT "securities_renamed_to_securities_symbol_fk" FOREIGN KEY ("renamed_to") REFERENCES "public"."securities"("symbol") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "securities_meta" ADD CONSTRAINT "securities_meta_symbol_securities_symbol_fk" FOREIGN KEY ("symbol") REFERENCES "public"."securities"("symbol") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "dividends_announced" ADD CONSTRAINT "dividends_announced_symbol_securities_symbol_fk" FOREIGN KEY ("symbol") REFERENCES "public"."securities"("symbol") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "earnings_calendar" ADD CONSTRAINT "earnings_calendar_symbol_securities_symbol_fk" FOREIGN KEY ("symbol") REFERENCES "public"."securities"("symbol") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "splits" ADD CONSTRAINT "splits_symbol_securities_symbol_fk" FOREIGN KEY ("symbol") REFERENCES "public"."securities"("symbol") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_profiles_sort" ON "profiles" USING btree ("is_pinned" DESC,"sort_order","created_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_accounts_profile" ON "accounts" USING btree ("profile_id","is_archived","sort_order");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_watchlist_items_sort" ON "watchlist_items" USING btree ("watchlist_id","sort_order");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_watchlists_profile" ON "watchlists" USING btree ("profile_id","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "uq_watchlists_default" ON "watchlists" USING btree ("profile_id") WHERE "watchlists"."is_default";--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_csv_imports_profile" ON "csv_imports" USING btree ("profile_id","created_at" DESC);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_transactions_profile_executed" ON "transactions" USING btree ("profile_id","executed_at" DESC) WHERE "transactions"."deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_transactions_profile_account_exec" ON "transactions" USING btree ("profile_id","account_id","executed_at" DESC) WHERE "transactions"."deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_transactions_profile_symbol_exec" ON "transactions" USING btree ("profile_id","symbol","executed_at") WHERE "transactions"."deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_transactions_profile_kind" ON "transactions" USING btree ("profile_id","kind","executed_at") WHERE "transactions"."deleted_at" IS NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_transactions_import" ON "transactions" USING btree ("source_import_id") WHERE "transactions"."source_import_id" IS NOT NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_transactions_deleted" ON "transactions" USING btree ("deleted_at") WHERE "transactions"."deleted_at" IS NOT NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_alerts_active" ON "alerts" USING btree ("status","symbol") WHERE "alerts"."status" = 'ACTIVE';--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_alerts_profile" ON "alerts" USING btree ("profile_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_prices_daily_date" ON "prices_daily" USING btree ("date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_quote_cache_freshness" ON "quote_cache" USING btree ("fetched_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_securities_search" ON "securities" USING gin ("search_text" gin_trgm_ops);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_securities_active" ON "securities" USING btree ("asset_type") WHERE "securities"."delisted_at" IS NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_securities_meta_freshness" ON "securities_meta" USING btree ("refreshed_at");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_dividends_announced_ex" ON "dividends_announced" USING btree ("ex_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_earnings_date" ON "earnings_calendar" USING btree ("report_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_splits_ex" ON "splits" USING btree ("ex_date");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_news_symbol_pub" ON "news_cache" USING btree ("symbol","published_at" DESC);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_news_market" ON "news_cache" USING btree ("published_at" DESC) WHERE "news_cache"."symbol" IS NULL;--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_audit_recent" ON "audit_log" USING btree ("occurred_at" DESC);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "idx_audit_entity" ON "audit_log" USING btree ("entity","entity_id");--> statement-breakpoint

-- =============================================================================
-- updated_at triggers (DATABASE_SPEC §2.4 — every table with updated_at).
-- =============================================================================
CREATE TRIGGER trg_app_settings_updated_at        BEFORE UPDATE ON "app_settings"        FOR EACH ROW EXECUTE FUNCTION set_updated_at();--> statement-breakpoint
CREATE TRIGGER trg_profiles_updated_at            BEFORE UPDATE ON "profiles"            FOR EACH ROW EXECUTE FUNCTION set_updated_at();--> statement-breakpoint
CREATE TRIGGER trg_profile_preferences_updated_at BEFORE UPDATE ON "profile_preferences" FOR EACH ROW EXECUTE FUNCTION set_updated_at();--> statement-breakpoint
CREATE TRIGGER trg_accounts_updated_at            BEFORE UPDATE ON "accounts"            FOR EACH ROW EXECUTE FUNCTION set_updated_at();--> statement-breakpoint
CREATE TRIGGER trg_watchlists_updated_at          BEFORE UPDATE ON "watchlists"          FOR EACH ROW EXECUTE FUNCTION set_updated_at();--> statement-breakpoint
CREATE TRIGGER trg_transactions_updated_at        BEFORE UPDATE ON "transactions"        FOR EACH ROW EXECUTE FUNCTION set_updated_at();--> statement-breakpoint
CREATE TRIGGER trg_alerts_updated_at              BEFORE UPDATE ON "alerts"              FOR EACH ROW EXECUTE FUNCTION set_updated_at();--> statement-breakpoint

-- =============================================================================
-- schema_version bookkeeping.
-- We intentionally do NOT INSERT INTO app_settings here — operator_password_hash
-- + session_secret_kid are NOT NULL and must come from env via `pnpm seed:operator`
-- (see DATABASE_SPEC §8.4 + §9.4). The seed script sets schema_version = 1.
-- =============================================================================
-- =============================================================================
-- 0001_stored_functions — derived positions, net worth, wash sale (§6, §7).
-- =============================================================================
--
-- Hand-authored: drizzle-kit does not introspect or generate Postgres
-- functions. All bodies copied verbatim from DATABASE_SPEC.md §6 and §7.3.
-- Bump the `-- version: N` comment inside each function on every change
-- so audits can diff intent (see migration-author agent guidance).
--
-- ROLLBACK PLAN:
--   Functions are CREATE OR REPLACE — safe to re-run. To rollback a single
--   function, write a new forward migration with the previous body and bump
--   the version comment.
--
-- All functions are `STABLE` (read-only, no side effects within a statement).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- split_factor(symbol, asOf) → numeric
-- Cumulative product of (num/den) for all splits AFTER asOf.
-- Used by get_positions to adjust pre-split historical txns to today's shares.
-- version: 1
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION split_factor(p_symbol text, p_as_of date)
RETURNS numeric
LANGUAGE sql STABLE AS $$
  SELECT COALESCE(
    (SELECT EXP(SUM(LN(ratio_numerator::numeric / ratio_denominator::numeric)))
       FROM splits
       WHERE symbol = p_symbol
         AND ex_date > p_as_of),
    1
  );
$$;
--> statement-breakpoint

-- -----------------------------------------------------------------------------
-- get_positions(profile_id, account_id, status) → table
-- AVG-cost implementation per DATABASE_SPEC §6.1.
-- Returns one row per (account_id, symbol) with derived qty / avg_cost /
-- realized_pl. FIFO variant ships in v1.5 (`get_positions_fifo`).
-- version: 1
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_positions(
  p_profile_id   uuid,
  p_account_id   uuid DEFAULT NULL,
  p_status       text DEFAULT 'open'
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
--> statement-breakpoint

-- -----------------------------------------------------------------------------
-- get_my_position(profile_id, symbol) → per-account rows for U-1 aggregator.
-- version: 1
-- -----------------------------------------------------------------------------
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
  WHERE p.symbol = p_symbol;
$$;
--> statement-breakpoint

-- -----------------------------------------------------------------------------
-- get_net_worth(profile_id, account_id) → Home hero + Portfolio Summary.
-- Joins quote_cache for live prices; treats DIV/BUY/SELL/FEE/CASH_* impact
-- on cash via single CTE rollup.
-- version: 1
-- -----------------------------------------------------------------------------
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
--> statement-breakpoint

-- -----------------------------------------------------------------------------
-- get_wash_sale_candidates(profile_id, start, end) → IRS §1091 ±30d window scan.
-- Returns SELL→BUY pairs within the wash-sale window per DATABASE_SPEC §7.3.
-- Loss filter (whether the SELL is a loss) is left to the UI layer because it
-- requires joining cost basis at time of sale; raw window candidate list is
-- enough for v1's "potential wash sales" surfacing.
-- version: 1
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION get_wash_sale_candidates(
  p_profile_id  uuid,
  p_start       timestamptz,
  p_end         timestamptz
) RETURNS TABLE (
  sell_id     uuid,
  symbol      text,
  sell_at     timestamptz,
  buy_id      uuid,
  buy_at      timestamptz,
  offset_days integer
) LANGUAGE sql STABLE AS $$
  WITH losses AS (
    SELECT t.id, t.profile_id, t.account_id, t.symbol, t.executed_at,
           t.quantity, t.price, t.fees
    FROM transactions t
    WHERE t.profile_id = p_profile_id
      AND t.kind = 'SELL'
      AND t.deleted_at IS NULL
      AND t.executed_at BETWEEN p_start AND p_end
  )
  SELECT
    l.id   AS sell_id,
    l.symbol,
    l.executed_at AS sell_at,
    b.id   AS buy_id,
    b.executed_at AS buy_at,
    EXTRACT(DAY FROM (b.executed_at - l.executed_at))::int AS offset_days
  FROM losses l
  JOIN transactions b
    ON b.profile_id = l.profile_id
   AND b.symbol = l.symbol
   AND b.kind IN ('BUY','TRANSFER_IN')
   AND b.deleted_at IS NULL
   AND b.executed_at BETWEEN l.executed_at - interval '30 days'
                         AND l.executed_at + interval '30 days'
   AND b.id <> l.id;
$$;
