/**
 * Unit tests for app/api/transactions/[id]/route.ts.
 *
 * Mocks db chain + getCurrentProfileId. Verifies validation, ownership
 * 404, idempotency call shape on DELETE + PATCH restore.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

const innerJoinWhereLimit = vi.fn();
const updateWhere = vi.fn();

vi.mock('@/db/client', () => ({
  db: {
    select: () => ({
      from: () => ({
        innerJoin: () => ({
          where: () => ({
            limit: innerJoinWhereLimit,
          }),
        }),
      }),
    }),
    update: () => ({
      set: () => ({
        where: updateWhere,
      }),
    }),
  },
}));

vi.mock('@/lib/profiles/current', () => ({
  getCurrentProfileId: vi.fn().mockResolvedValue('profile-uuid'),
}));

const { DELETE, PATCH } = await import('../../../app/api/transactions/[id]/route');

const VALID_ID = '0190b5c8-9000-7000-8000-000000000123';

function delReq(): Request {
  return new Request(`http://localhost/api/transactions/${VALID_ID}`, { method: 'DELETE' });
}

function patchReq(body: unknown): Request {
  return new Request(`http://localhost/api/transactions/${VALID_ID}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function ctx(id = VALID_ID) {
  return { params: Promise.resolve({ id }) };
}

describe('DELETE /api/transactions/[id]', () => {
  beforeEach(() => {
    innerJoinWhereLimit.mockReset();
    updateWhere.mockReset();
  });

  it('rejects invalid id format', async () => {
    const res = await DELETE(delReq(), ctx('not-a-uuid'));
    expect(res.status).toBe(400);
    expect((await res.json()).error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 404 when transaction not owned by current profile', async () => {
    innerJoinWhereLimit.mockResolvedValueOnce([]); // no rows
    const res = await DELETE(delReq(), ctx());
    expect(res.status).toBe(404);
    expect((await res.json()).error.code).toBe('TRANSACTION_NOT_FOUND');
  });

  it('soft-deletes when owned + alive', async () => {
    innerJoinWhereLimit.mockResolvedValueOnce([{ id: VALID_ID, deletedAt: null }]);
    updateWhere.mockResolvedValueOnce(undefined);
    const res = await DELETE(delReq(), ctx());
    expect(res.status).toBe(200);
    expect((await res.json()).ok).toBe(true);
    expect(updateWhere).toHaveBeenCalledTimes(1);
  });

  it('idempotent on already-deleted row', async () => {
    innerJoinWhereLimit.mockResolvedValueOnce([{ id: VALID_ID, deletedAt: new Date() }]);
    updateWhere.mockResolvedValueOnce(undefined);
    const res = await DELETE(delReq(), ctx());
    // Still 200 — the WHERE clause filters out the already-deleted row
    // server-side, but the route doesn't 404.
    expect(res.status).toBe(200);
  });
});

describe('PATCH /api/transactions/[id]', () => {
  beforeEach(() => {
    innerJoinWhereLimit.mockReset();
    updateWhere.mockReset();
  });

  it('rejects body without restore: true', async () => {
    const res = await PATCH(patchReq({}), ctx());
    expect(res.status).toBe(400);
    expect((await res.json()).error.code).toBe('VALIDATION_ERROR');
  });

  it('rejects malformed JSON', async () => {
    const req = new Request(`http://localhost/api/transactions/${VALID_ID}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: '{not json',
    });
    const res = await PATCH(req, ctx());
    expect(res.status).toBe(400);
    expect((await res.json()).error.code).toBe('INVALID_BODY');
  });

  it('returns 404 when not owned', async () => {
    innerJoinWhereLimit.mockResolvedValueOnce([]);
    const res = await PATCH(patchReq({ restore: true }), ctx());
    expect(res.status).toBe(404);
    expect((await res.json()).error.code).toBe('TRANSACTION_NOT_FOUND');
  });

  it('restores when owned', async () => {
    innerJoinWhereLimit.mockResolvedValueOnce([{ id: VALID_ID, deletedAt: new Date() }]);
    updateWhere.mockResolvedValueOnce(undefined);
    const res = await PATCH(patchReq({ restore: true }), ctx());
    expect(res.status).toBe(200);
    expect((await res.json()).ok).toBe(true);
    expect(updateWhere).toHaveBeenCalledTimes(1);
  });

  it('idempotent on already-live row', async () => {
    innerJoinWhereLimit.mockResolvedValueOnce([{ id: VALID_ID, deletedAt: null }]);
    updateWhere.mockResolvedValueOnce(undefined);
    const res = await PATCH(patchReq({ restore: true }), ctx());
    expect(res.status).toBe(200);
  });
});
