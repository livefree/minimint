/**
 * Postgres native enums (DATABASE_SPEC §2.3).
 *
 * Adding values later: `ALTER TYPE <name> ADD VALUE '<NEW>'` in its own migration
 * (Postgres requires it to live outside a transaction in older versions; safer to ship alone).
 */

import { pgEnum } from 'drizzle-orm/pg-core';

export const avatarKindEnum = pgEnum('avatar_kind', ['INITIALS', 'EMOJI', 'PHOTO']);

export const relationEnum = pgEnum('relation', [
  'SELF',
  'PARTNER',
  'PARENT',
  'CHILD',
  'SIBLING',
  'OTHER',
]);

export const taxMethodEnum = pgEnum('tax_method', ['FIFO', 'AVG', 'LIFO', 'SPEC_ID']);

export const accountKindEnum = pgEnum('account_kind', [
  'BROKERAGE',
  'IRA_TRAD',
  'IRA_ROTH',
  'HSA',
  '401K',
  '529',
  'TRUST',
  'OTHER',
]);

export const transactionKindEnum = pgEnum('transaction_kind', [
  'BUY',
  'SELL',
  'DIV',
  'SPLIT',
  'FEE',
  'CASH_IN',
  'CASH_OUT',
  'TRANSFER_IN',
  'TRANSFER_OUT',
]);

export const assetTypeEnum = pgEnum('asset_type', [
  'EQUITY',
  'ETF',
  'MUTUAL_FUND',
  'INDEX',
  'OTHER',
]);

export const alertDirectionEnum = pgEnum('alert_direction', ['ABOVE', 'BELOW']);

export const alertStatusEnum = pgEnum('alert_status', ['ACTIVE', 'TRIGGERED', 'DISABLED']);
