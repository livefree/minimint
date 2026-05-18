/**
 * listAccountsForProfile — non-archived accounts under a profile.
 *
 * Read path used by anything that needs to populate an account picker
 * (TradeSheet, AccountSelector, Portfolio sub-tabs). Filters by
 * `isArchived=false` and orders by `(sortOrder, createdAt)` so the
 * operator's manual reordering surfaces in the UI.
 *
 * Server-only; callers are server components per contract #7.
 */

import { and, asc, eq } from 'drizzle-orm';
import { db as defaultDb, type DB } from '@/db/client';
import { accounts } from '@/db/schema';

/** Minimum AccountSummary fields needed by M2 callers (TradeSheet
 *  picker). When the Account row swatch ships in M3 — via the
 *  IOSAccountColorPicker design — extend with `colorSlot` and
 *  `accountKind`; until then those columns are dead data on the
 *  wire and intentionally not selected. */
export interface AccountSummary {
  id: string;
  name: string;
  broker: string | null;
  last4: string | null;
}

export async function listAccountsForProfile(
  profileId: string,
  database: DB = defaultDb,
): Promise<AccountSummary[]> {
  return database
    .select({
      id: accounts.id,
      name: accounts.name,
      broker: accounts.broker,
      last4: accounts.last4,
    })
    .from(accounts)
    .where(and(eq(accounts.profileId, profileId), eq(accounts.isArchived, false)))
    .orderBy(asc(accounts.sortOrder), asc(accounts.createdAt));
}
