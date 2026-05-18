/**
 * Unit tests for lib/profiles/bootstrap.ts.
 *
 * No live DB: we hand-roll a minimal mock of the Drizzle chain shape that
 * `ensureDefaultProfile` actually uses (`select().from().limit()`,
 * `insert().values().returning()`). Integration coverage of the real Neon
 * path comes from the M1 playwright login e2e, which exercises this code
 * path on every test run.
 */

import { describe, expect, it, vi } from 'vitest';
import { ensureDefaultProfile } from '../../../lib/profiles/bootstrap';
import { profiles } from '../../../db/schema';
import type { DB } from '../../../db/client';

const EXISTING_PROFILE = {
  id: 'existing-uuid',
  name: 'Sam',
  displayName: null,
  avatarKind: 'INITIALS' as const,
  avatarValue: '',
  colorSlot: 1,
  relation: 'SELF' as const,
  birthYear: null,
  isPinned: false,
  sortOrder: 0,
  pinHash: null,
  lastActiveAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const CREATED_PROFILE = { ...EXISTING_PROFILE, id: 'new-uuid', name: 'Me' };

function makeMockDb(opts: { existing: (typeof EXISTING_PROFILE)[] }): {
  db: DB;
  spies: {
    select: ReturnType<typeof vi.fn>;
    insertProfiles: ReturnType<typeof vi.fn>;
  };
} {
  const insertProfilesValues = vi.fn().mockReturnValue({
    returning: () => Promise.resolve([CREATED_PROFILE]),
  });

  const insert = vi.fn((table) => {
    if (table === profiles) return { values: insertProfilesValues };
    throw new Error(`unexpected insert table: ${String(table)}`);
  });

  const select = vi.fn().mockReturnValue({
    from: () => ({
      limit: () => Promise.resolve(opts.existing),
    }),
  });

  return {
    db: { select, insert } as unknown as DB,
    spies: { select, insertProfiles: insertProfilesValues },
  };
}

describe('ensureDefaultProfile', () => {
  it('returns existing profile without inserting when one already exists', async () => {
    const { db, spies } = makeMockDb({ existing: [EXISTING_PROFILE] });

    const result = await ensureDefaultProfile(db);

    expect(result).toEqual({ profile: EXISTING_PROFILE, created: false });
    expect(spies.select).toHaveBeenCalledTimes(1);
    expect(spies.insertProfiles).not.toHaveBeenCalled();
  });

  it('inserts default "Me" profile when none exist', async () => {
    const { db, spies } = makeMockDb({ existing: [] });

    const result = await ensureDefaultProfile(db);

    expect(result.created).toBe(true);
    expect(result.profile.id).toBe('new-uuid');
    expect(spies.insertProfiles).toHaveBeenCalledWith({
      name: 'Me',
      colorSlot: 1,
      relation: 'SELF',
    });
  });

  it('does not eagerly insert profile_preferences (spec §3.15: lazy on first read)', async () => {
    const { db, spies } = makeMockDb({ existing: [] });

    await ensureDefaultProfile(db);

    // Only the profiles insert; preferences happens lazily elsewhere
    expect(spies.insertProfiles).toHaveBeenCalledTimes(1);
  });

  it('throws when the profile insert returns no row', async () => {
    const { db } = makeMockDb({ existing: [] });
    (db as unknown as { insert: ReturnType<typeof vi.fn> }).insert = vi.fn(() => ({
      values: () => ({ returning: () => Promise.resolve([]) }),
    }));

    await expect(ensureDefaultProfile(db)).rejects.toThrow(/insert returned no row/);
  });
});
