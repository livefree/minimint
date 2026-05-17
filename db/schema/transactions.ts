/**
 * transactions + csv_imports (DATABASE_SPEC §3.5 + §3.7).
 *
 * Transactions are the sole writable source of truth for portfolio state
 * (§1.1). `csv_imports` is declared first so `transactions.source_import_id`
 * can FK to it; both live in the same file so declaration order Just Works.
 *
 * Index strategy mirrors §5: every hot-path index filters
 * `deleted_at IS NULL` so soft-delete tombstones don't bloat indexes.
 */

import { sql } from 'drizzle-orm';
import {
  char,
  check,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { uuidv7 } from 'uuidv7';
import { accounts } from './accounts';
import { transactionKindEnum } from './enums';
import { profiles } from './profiles';

export const csvImports = pgTable(
  'csv_imports',
  {
    id: uuid('id')
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    profileId: uuid('profile_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    filename: text('filename').notNull(),
    brokerTemplate: text('broker_template'),
    mappingJson: jsonb('mapping_json').notNull(),
    totalRows: integer('total_rows').notNull(),
    importedCount: integer('imported_count').notNull().default(0),
    skippedCount: integer('skipped_count').notNull().default(0),
    errorCount: integer('error_count').notNull().default(0),
    errorLogJson: jsonb('error_log_json'),
    undoableUntil: timestamp('undoable_until', { withTimezone: true }),
    undoneAt: timestamp('undone_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => [
    index('idx_csv_imports_profile').on(t.profileId, sql`${t.createdAt} DESC`),
  ],
);

export const transactions = pgTable(
  'transactions',
  {
    id: uuid('id')
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    profileId: uuid('profile_id')
      .notNull()
      .references(() => profiles.id, { onDelete: 'cascade' }),
    accountId: uuid('account_id')
      .notNull()
      .references(() => accounts.id, { onDelete: 'cascade' }),
    symbol: text('symbol').notNull(),
    kind: transactionKindEnum('kind').notNull(),
    quantity: numeric('quantity', { precision: 18, scale: 8 }).notNull(),
    price: numeric('price', { precision: 20, scale: 6 }).notNull().default('0'),
    fees: numeric('fees', { precision: 20, scale: 4 }).notNull().default('0'),
    currency: char('currency', { length: 3 }).notNull().default('USD'),
    executedAt: timestamp('executed_at', { withTimezone: true }).notNull(),
    note: text('note'),
    sourceImportId: uuid('source_import_id').references(() => csvImports.id, {
      onDelete: 'set null',
    }),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => [
    check(
      'chk_transactions_symbol',
      sql`${t.symbol} ~ '^[A-Z0-9.\\^\\-]{1,16}$'`,
    ),
    check('chk_transactions_currency_usd', sql`${t.currency} = 'USD'`),
    check(
      'chk_transactions_qty_sign',
      sql`(${t.kind} IN ('BUY','SELL','DIV','CASH_IN','CASH_OUT','TRANSFER_IN','TRANSFER_OUT') AND ${t.quantity} > 0)
          OR (${t.kind} IN ('SPLIT','FEE'))`,
    ),
    check(
      'chk_transactions_price',
      sql`(${t.kind} IN ('BUY','SELL','DIV') AND ${t.price} >= 0)
          OR (${t.kind} IN ('SPLIT','FEE','CASH_IN','CASH_OUT','TRANSFER_IN','TRANSFER_OUT'))`,
    ),
    // Per §5 — every hot index filters out tombstones.
    index('idx_transactions_profile_executed')
      .on(t.profileId, sql`${t.executedAt} DESC`)
      .where(sql`${t.deletedAt} IS NULL`),
    index('idx_transactions_profile_account_exec')
      .on(t.profileId, t.accountId, sql`${t.executedAt} DESC`)
      .where(sql`${t.deletedAt} IS NULL`),
    index('idx_transactions_profile_symbol_exec')
      .on(t.profileId, t.symbol, t.executedAt)
      .where(sql`${t.deletedAt} IS NULL`),
    index('idx_transactions_profile_kind')
      .on(t.profileId, t.kind, t.executedAt)
      .where(sql`${t.deletedAt} IS NULL`),
    index('idx_transactions_import')
      .on(t.sourceImportId)
      .where(sql`${t.sourceImportId} IS NOT NULL`),
    index('idx_transactions_deleted')
      .on(t.deletedAt)
      .where(sql`${t.deletedAt} IS NOT NULL`),
  ],
);

export type CsvImport = typeof csvImports.$inferSelect;
export type NewCsvImport = typeof csvImports.$inferInsert;
export type Transaction = typeof transactions.$inferSelect;
export type NewTransaction = typeof transactions.$inferInsert;
