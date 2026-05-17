/**
 * watchlists + watchlist_items (DATABASE_SPEC §3.4).
 *
 * Items reference `symbol` as text (not FK to securities.symbol) so we can
 * record a watch on a symbol before market-data backfill has populated
 * `securities`. See §1.3 + §3.8.
 */

import { sql } from 'drizzle-orm';
import {
  check,
  index,
  integer,
  pgTable,
  primaryKey,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  boolean,
} from 'drizzle-orm/pg-core';
import { uuidv7 } from 'uuidv7';
import { profiles } from './profiles';

export const watchlists = pgTable(
  'watchlists',
  {
    id: uuid('id')
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    profileId: uuid('profile_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    colorSlot: smallint('color_slot'),
    sortOrder: integer('sort_order').notNull().default(0),
    isDefault: boolean('is_default').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => [
    check('chk_watchlists_name_len', sql`char_length(${t.name}) BETWEEN 1 AND 64`),
    check(
      'chk_watchlists_color_slot',
      sql`${t.colorSlot} IS NULL OR ${t.colorSlot} BETWEEN 1 AND 8`,
    ),
    index('idx_watchlists_profile').on(t.profileId, t.sortOrder),
    uniqueIndex('uq_watchlists_default').on(t.profileId).where(sql`${t.isDefault}`),
  ],
);

export const watchlistItems = pgTable(
  'watchlist_items',
  {
    watchlistId: uuid('watchlist_id')
      .notNull()
      .references(() => watchlists.id, { onDelete: 'cascade' }),
    symbol: text('symbol').notNull(),
    sortOrder: integer('sort_order').notNull().default(0),
    addedAt: timestamp('added_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => [
    primaryKey({ columns: [t.watchlistId, t.symbol] }),
    check(
      'chk_watchlist_items_symbol',
      sql`${t.symbol} ~ '^[A-Z0-9.\\^\\-]{1,16}$'`,
    ),
    index('idx_watchlist_items_sort').on(t.watchlistId, t.sortOrder),
  ],
);

export type Watchlist = typeof watchlists.$inferSelect;
export type NewWatchlist = typeof watchlists.$inferInsert;
export type WatchlistItem = typeof watchlistItems.$inferSelect;
export type NewWatchlistItem = typeof watchlistItems.$inferInsert;
