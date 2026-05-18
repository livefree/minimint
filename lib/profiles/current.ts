/**
 * "Current profile" resolution (M2 minimum viable).
 *
 * Returns the operator's first profile id. M2 ships with a single
 * auto-created "Me" profile (see `ensureDefaultProfile`), so "current"
 * trivially means "the only one." M3's multi-profile UI will replace
 * this with a cookie- or session-bound current-profile id and surface
 * the switcher.
 *
 * Throws when no profile exists — callers should run after the post-
 * login bootstrap so this is unreachable in normal flow.
 */

import { db as defaultDb, type DB } from '@/db/client';
import { profiles } from '@/db/schema';

export async function getCurrentProfileId(database: DB = defaultDb): Promise<string> {
  const rows = await database.select({ id: profiles.id }).from(profiles).limit(1);
  const first = rows[0];
  if (!first) {
    throw new Error('getCurrentProfileId: no profile exists (call ensureDefaultProfile first)');
  }
  return first.id;
}
