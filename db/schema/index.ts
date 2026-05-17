/**
 * Schema barrel. Each domain owns a file; this re-exports everything so
 * Drizzle can discover the full schema for migration generation.
 *
 * Files (to be authored in sprint 1 per DATABASE_SPEC.md §4):
 *   enums.ts          — pgEnum declarations
 *   app.ts            — app_settings (singleton)
 *   profiles.ts       — profiles + profile_preferences
 *   accounts.ts       — accounts
 *   watchlists.ts     — watchlists + watchlist_items
 *   transactions.ts   — transactions + csv_imports
 *   alerts.ts         — alerts (v1.5 surface — table exists, logic later)
 *   market.ts         — securities + quote_cache + prices_daily
 *   corporate.ts      — dividends_announced + splits + earnings_calendar
 *   news.ts           — news_cache
 *   audit.ts          — audit_log (optional)
 */

// Files do not exist yet (sprint 1). Leave intentional empty barrel so Drizzle
// imports succeed; uncomment as each domain file lands.

// Explicit empty export so TypeScript treats this as a module (not a global script).
export {};

// export * from './enums';
// export * from './app';
// export * from './profiles';
// export * from './accounts';
// export * from './watchlists';
// export * from './transactions';
// export * from './alerts';
// export * from './market';
// export * from './corporate';
// export * from './news';
// export * from './audit';
