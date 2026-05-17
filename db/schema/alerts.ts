/**
 * alerts — v1.5 price alerts (DATABASE_SPEC §3.6).
 *
 * Table ships in v1 so subsequent feature work needs no schema migration.
 * Background job per §3.6 reads `idx_alerts_active` every 5 min during hours,
 * joins `quote_cache`, sets `status='TRIGGERED'` + sends Web Push.
 */

import { sql } from 'drizzle-orm';
import { check, index, numeric, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { uuidv7 } from 'uuidv7';
import { alertDirectionEnum, alertStatusEnum } from './enums';
import { profiles } from './profiles';

export const alerts = pgTable(
  'alerts',
  {
    id: uuid('id')
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    profileId: uuid('profile_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    symbol: text('symbol').notNull(),
    direction: alertDirectionEnum('direction').notNull(),
    threshold: numeric('threshold', { precision: 20, scale: 6 }).notNull(),
    status: alertStatusEnum('status').notNull().default('ACTIVE'),
    triggeredAt: timestamp('triggered_at', { withTimezone: true }),
    pushSubscriptionEndpoint: text('push_subscription_endpoint'),
    note: text('note'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => [
    check(
      'chk_alerts_symbol',
      sql`${t.symbol} ~ '^[A-Z0-9.\\^\\-]{1,16}$'`,
    ),
    index('idx_alerts_active')
      .on(t.status, t.symbol)
      .where(sql`${t.status} = 'ACTIVE'`),
    index('idx_alerts_profile').on(t.profileId),
  ],
);

export type Alert = typeof alerts.$inferSelect;
export type NewAlert = typeof alerts.$inferInsert;
