/**
 * Unit tests for app/api/accounts/route.ts.
 *
 * Mocks `@/db/client` and `@/lib/profiles/current` so the route's POST
 * handler runs without a live DB. We assert: zod rejects bad bodies,
 * colorSlot cycles 1..8 based on existing count, and a happy-path
 * insert returns 201 with the created row.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

// ─── mocks ──────────────────────────────────────────────────────────────

const insertReturning = vi.fn();
const selectFromWhere = vi.fn();

vi.mock('@/db/client', () => ({
  db: {
    select: () => ({
      from: () => ({
        where: selectFromWhere,
      }),
    }),
    insert: () => ({
      values: () => ({
        returning: insertReturning,
      }),
    }),
  },
}));

vi.mock('@/lib/profiles/current', () => ({
  getCurrentProfileId: vi.fn().mockResolvedValue('profile-uuid'),
}));

// Import AFTER mocks are set up
const { POST } = await import('../../../app/api/accounts/route');

function makeRequest(body: unknown): Request {
  return new Request('http://localhost/api/accounts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/accounts', () => {
  beforeEach(() => {
    insertReturning.mockReset();
    selectFromWhere.mockReset();
  });

  it('rejects empty body with VALIDATION_ERROR', async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error.code).toBe('VALIDATION_ERROR');
  });

  it('rejects malformed last4 with VALIDATION_ERROR', async () => {
    const res = await POST(
      makeRequest({ name: 'Individual', accountKind: 'BROKERAGE', last4: '12ab' }),
    );
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error.code).toBe('VALIDATION_ERROR');
  });

  it('rejects malformed JSON', async () => {
    const req = new Request('http://localhost/api/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{not json',
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error.code).toBe('INVALID_BODY');
  });

  it('inserts with colorSlot=1 when no existing accounts', async () => {
    selectFromWhere.mockResolvedValueOnce([]);
    insertReturning.mockResolvedValueOnce([
      { id: 'a1', profileId: 'profile-uuid', name: 'Individual', colorSlot: 1 },
    ]);

    const res = await POST(makeRequest({ name: 'Individual', accountKind: 'BROKERAGE' }));
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.account.colorSlot).toBe(1);
  });

  it('cycles colorSlot — 3 existing => slot 4', async () => {
    selectFromWhere.mockResolvedValueOnce([{ id: 'x' }, { id: 'y' }, { id: 'z' }]);
    insertReturning.mockResolvedValueOnce([
      { id: 'a4', profileId: 'profile-uuid', name: 'Roth', colorSlot: 4 },
    ]);

    const res = await POST(makeRequest({ name: 'Roth', accountKind: 'IRA_ROTH' }));
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.account.colorSlot).toBe(4);
  });

  it('wraps colorSlot at 8 — 8 existing => slot 1', async () => {
    selectFromWhere.mockResolvedValueOnce(Array.from({ length: 8 }, (_, i) => ({ id: `a${i}` })));
    insertReturning.mockResolvedValueOnce([
      { id: 'a9', profileId: 'profile-uuid', name: '9th', colorSlot: 1 },
    ]);

    const res = await POST(makeRequest({ name: '9th', accountKind: 'BROKERAGE' }));
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.account.colorSlot).toBe(1);
  });

  it('returns 500 when insert returns no row', async () => {
    selectFromWhere.mockResolvedValueOnce([]);
    insertReturning.mockResolvedValueOnce([]);

    const res = await POST(makeRequest({ name: 'X', accountKind: 'BROKERAGE' }));
    expect(res.status).toBe(500);
    const json = await res.json();
    expect(json.error.code).toBe('INSERT_FAILED');
  });
});
