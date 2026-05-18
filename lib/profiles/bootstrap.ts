/**
 * Default-profile bootstrap (DATABASE_SPEC §3.2, REVISIONS R-P0).
 *
 * On first successful login the operator has zero profiles. We auto-create
 * a single "Me" profile (relation=SELF, colorSlot=1) so the rest of the app
 * — which always scopes by profile_id — has somewhere to land.
 *
 * Idempotency: returns the first existing profile without inserting. The
 * "any profile" check (not specifically a SELF-relation profile) is
 * intentional: today the only way for a profile to exist is through this
 * very bootstrap, but once R-P1's profile-creation UI ships an operator
 * could legitimately have only PARENT/CHILD profiles. In that case the
 * existing profile is a usable scope and we don't second-guess it.
 *
 * `profile_preferences` is NOT inserted here. DATABASE_SPEC §3.15 mandates
 * "lazy-inserted on first read"; the future preferences reader will upsert
 * on demand. Inserting eagerly would deviate from the spec contract.
 *
 * Race window: two concurrent first-login requests would both observe an
 * empty profiles table and both insert. profiles has no unique constraint
 * beyond the PK, so duplicate "Me" rows are theoretically possible. For a
 * single-operator app this is practically impossible (humans don't double-
 * click login that fast against two devices on the same fresh account).
 * Hardening (advisory lock, partial unique index, or transaction with
 * SELECT FOR UPDATE on app_settings) is tracked in BACKLOG as a v1.5 item
 * if multi-device concurrent first-login ever becomes a real scenario.
 */

import { db as defaultDb, type DB } from '@/db/client';
import { profiles } from '@/db/schema';
import type { Profile } from '@/db/schema/profiles';

export interface BootstrapResult {
  profile: Profile;
  created: boolean;
}

export async function ensureDefaultProfile(database: DB = defaultDb): Promise<BootstrapResult> {
  const existing = await database.select().from(profiles).limit(1);
  if (existing[0]) {
    return { profile: existing[0], created: false };
  }

  const inserted = await database
    .insert(profiles)
    .values({
      name: 'Me',
      colorSlot: 1,
      relation: 'SELF',
    })
    .returning();
  const created = inserted[0];
  if (!created) {
    throw new Error('ensureDefaultProfile: profile insert returned no row');
  }

  return { profile: created, created: true };
}
