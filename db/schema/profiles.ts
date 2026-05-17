/**
 * profiles + profile_preferences (DATABASE_SPEC §3.2 + §3.15).
 *
 * `profile_id` is the tenancy key for every other profile-scoped table.
 * UUID v7 (app-generated via `uuidv7` npm) for natural creation-time ordering.
 */

import { sql } from 'drizzle-orm';
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgTable,
  smallint,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { uuidv7 } from 'uuidv7';
import { avatarKindEnum, relationEnum } from './enums';
import { watchlists } from './watchlists';

export const profiles = pgTable(
  'profiles',
  {
    id: uuid('id')
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    name: text('name').notNull(),
    displayName: text('display_name'),
    avatarKind: avatarKindEnum('avatar_kind').notNull().default('INITIALS'),
    avatarValue: text('avatar_value').notNull().default(''),
    colorSlot: smallint('color_slot').notNull(),
    relation: relationEnum('relation').notNull().default('OTHER'),
    birthYear: smallint('birth_year'),
    isPinned: boolean('is_pinned').notNull().default(false),
    sortOrder: integer('sort_order').notNull().default(0),
    pinHash: text('pin_hash'),
    lastActiveAt: timestamp('last_active_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => [
    check('chk_profiles_name_len', sql`char_length(${t.name}) BETWEEN 1 AND 64`),
    check('chk_profiles_color_slot', sql`${t.colorSlot} BETWEEN 1 AND 8`),
    check(
      'chk_profiles_birth_year',
      sql`${t.birthYear} IS NULL OR ${t.birthYear} BETWEEN 1900 AND 2100`,
    ),
    index('idx_profiles_sort').on(
      sql`${t.isPinned} DESC`,
      t.sortOrder,
      t.createdAt,
    ),
  ],
);

export const profilePreferences = pgTable('profile_preferences', {
  profileId: uuid('profile_id')
    .primaryKey()
    .references(() => profiles.id, { onDelete: 'cascade' }),
  defaultChartRange: text('default_chart_range').notNull().default('3M'),
  defaultChartMode: text('default_chart_mode').notNull().default('area'),
  privacyLevel: smallint('privacy_level').notNull().default(0),
  compactMoney: boolean('compact_money').notNull().default(false),
  benchmarkSymbol: text('benchmark_symbol').default('SPY'),
  positionsColumnsJson: jsonb('positions_columns_json')
    .notNull()
    .default(sql`'[]'::jsonb`),
  watchlistActiveId: uuid('watchlist_active_id').references(() => watchlists.id, {
    onDelete: 'set null',
  }),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .default(sql`now()`),
}, (t) => [
  check(
    'chk_profile_preferences_privacy',
    sql`${t.privacyLevel} BETWEEN 0 AND 2`,
  ),
]);

export type Profile = typeof profiles.$inferSelect;
export type NewProfile = typeof profiles.$inferInsert;
export type ProfilePreferences = typeof profilePreferences.$inferSelect;
export type NewProfilePreferences = typeof profilePreferences.$inferInsert;
