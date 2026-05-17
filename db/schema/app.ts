/**
 * app_settings — singleton operator config (DATABASE_SPEC §3.1).
 *
 * Exactly one row (id=1, enforced by CHECK). Holds operator password hash,
 * session JWT signing key id, encrypted Finnhub API key, refresh cadence, and
 * the running schema_version (sanity-checked at boot per §8.4).
 */

import { sql } from 'drizzle-orm';
import { boolean, check, integer, pgTable, smallint, text, timestamp } from 'drizzle-orm/pg-core';

export const appSettings = pgTable(
  'app_settings',
  {
    id: smallint('id').primaryKey(),
    operatorPasswordHash: text('operator_password_hash').notNull(),
    sessionSecretKid: text('session_secret_kid').notNull(),
    finnhubApiKeyEnc: text('finnhub_api_key_enc'),
    refreshSeconds: integer('refresh_seconds').notNull().default(30),
    demoMode: boolean('demo_mode').notNull().default(false),
    schemaVersion: integer('schema_version').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => [
    check('chk_app_settings_singleton', sql`${t.id} = 1`),
    check(
      'chk_app_settings_refresh_seconds',
      sql`${t.refreshSeconds} BETWEEN 10 AND 3600`,
    ),
  ],
);

export type AppSettings = typeof appSettings.$inferSelect;
export type NewAppSettings = typeof appSettings.$inferInsert;
