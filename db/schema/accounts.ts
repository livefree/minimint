/**
 * accounts — broker accounts under a profile (DATABASE_SPEC §3.3).
 */

import { sql } from 'drizzle-orm';
import {
  boolean,
  char,
  check,
  date,
  index,
  integer,
  pgTable,
  smallint,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { uuidv7 } from 'uuidv7';
import { accountKindEnum, taxMethodEnum } from './enums';
import { profiles } from './profiles';

export const accounts = pgTable(
  'accounts',
  {
    id: uuid('id')
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    profileId: uuid('profile_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    name: text('name').notNull(),
    broker: text('broker'),
    accountKind: accountKindEnum('account_kind').notNull().default('BROKERAGE'),
    last4: text('last4'),
    currency: char('currency', { length: 3 }).notNull().default('USD'),
    colorSlot: smallint('color_slot').notNull(),
    taxMethod: taxMethodEnum('tax_method').notNull().default('AVG'),
    isArchived: boolean('is_archived').notNull().default(false),
    sortOrder: integer('sort_order').notNull().default(0),
    openedAt: date('opened_at'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => [
    check('chk_accounts_name_len', sql`char_length(${t.name}) BETWEEN 1 AND 64`),
    check('chk_accounts_last4', sql`${t.last4} IS NULL OR ${t.last4} ~ '^\\d{4}$'`),
    check('chk_accounts_currency_usd', sql`${t.currency} = 'USD'`),
    check('chk_accounts_color_slot', sql`${t.colorSlot} BETWEEN 1 AND 8`),
    index('idx_accounts_profile').on(t.profileId, t.isArchived, t.sortOrder),
  ],
);

export type Account = typeof accounts.$inferSelect;
export type NewAccount = typeof accounts.$inferInsert;
