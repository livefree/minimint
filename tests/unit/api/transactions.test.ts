/**
 * Unit tests for app/api/transactions/route.ts (POST + GET).
 *
 * Mocks `@/db/client` and `@/lib/profiles/current` so the route runs
 * without a live DB. The DB mock uses a state machine over `selectChain`
 * and `insertChain` so each test sets up exactly the queries it expects.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';

const selectWhereLimit = vi.fn();
const selectWhereOrderLimit = vi.fn();
const insertReturning = vi.fn();

vi.mock('@/db/client', () => ({
  db: {
    select: () => ({
      from: () => ({
        where: (...args: unknown[]) => ({
          limit: () => selectWhereLimit(...args),
          orderBy: () => ({ limit: () => selectWhereOrderLimit(...args) }),
        }),
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

const { POST, GET } = await import('../../../app/api/transactions/route');

function postReq(body: unknown): Request {
  return new Request('http://localhost/api/transactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function getReq(qs = ''): Request {
  return new Request(`http://localhost/api/transactions${qs}`);
}

const VALID_BODY = {
  accountId: '0190b5c8-9000-7000-8000-000000000001',
  symbol: 'AAPL',
  kind: 'BUY' as const,
  quantity: '10',
  price: '150.50',
  fees: '0',
  executedAt: '2026-05-17T15:35:00-04:00',
};

describe('POST /api/transactions', () => {
  beforeEach(() => {
    selectWhereLimit.mockReset();
    selectWhereOrderLimit.mockReset();
    insertReturning.mockReset();
  });

  it('rejects empty body with VALIDATION_ERROR', async () => {
    const res = await POST(postReq({}));
    expect(res.status).toBe(400);
    expect((await res.json()).error.code).toBe('VALIDATION_ERROR');
  });

  it('rejects non-UUID accountId', async () => {
    const res = await POST(postReq({ ...VALID_BODY, accountId: 'not-a-uuid' }));
    expect(res.status).toBe(400);
    expect((await res.json()).error.code).toBe('VALIDATION_ERROR');
  });

  it('rejects symbol with lowercase / overlong', async () => {
    const res = await POST(postReq({ ...VALID_BODY, symbol: 'aapl' }));
    expect(res.status).toBe(400);
  });

  it('rejects unknown kind', async () => {
    const res = await POST(postReq({ ...VALID_BODY, kind: 'GIFT' }));
    expect(res.status).toBe(400);
  });

  it('rejects quantity = 0 or negative', async () => {
    const z = await POST(postReq({ ...VALID_BODY, quantity: '0' }));
    expect(z.status).toBe(400);
  });

  it('rejects quantity with too many decimals (over scale 8)', async () => {
    const res = await POST(postReq({ ...VALID_BODY, quantity: '1.123456789' }));
    expect(res.status).toBe(400);
  });

  it('rejects executedAt without timezone', async () => {
    const res = await POST(postReq({ ...VALID_BODY, executedAt: '2026-05-17T15:35:00' }));
    expect(res.status).toBe(400);
  });

  it('returns 404 when accountId does not belong to current profile', async () => {
    selectWhereLimit.mockResolvedValueOnce([]); // no owner row found
    const res = await POST(postReq(VALID_BODY));
    expect(res.status).toBe(404);
    expect((await res.json()).error.code).toBe('ACCOUNT_NOT_FOUND');
  });

  it('inserts and returns 201 + transaction on happy path', async () => {
    selectWhereLimit.mockResolvedValueOnce([{ id: VALID_BODY.accountId }]);
    insertReturning.mockResolvedValueOnce([
      {
        id: 'tx-uuid',
        profileId: 'profile-uuid',
        accountId: VALID_BODY.accountId,
        symbol: 'AAPL',
        kind: 'BUY',
        quantity: '10.00000000',
        price: '150.500000',
        fees: '0.0000',
      },
    ]);

    const res = await POST(postReq(VALID_BODY));
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.transaction.id).toBe('tx-uuid');
    // String preservation per contract #6 — never coerced to a JS number.
    expect(json.transaction.quantity).toBe('10.00000000');
    expect(json.transaction.price).toBe('150.500000');
  });

  it('defaults missing price + fees to "0"', async () => {
    const noPrice = { ...VALID_BODY };
    delete (noPrice as Partial<typeof VALID_BODY>).price;
    delete (noPrice as Partial<typeof VALID_BODY>).fees;
    selectWhereLimit.mockResolvedValueOnce([{ id: VALID_BODY.accountId }]);
    insertReturning.mockResolvedValueOnce([{ id: 'tx-2', price: '0', fees: '0' }]);

    const res = await POST(postReq(noPrice));
    expect(res.status).toBe(201);
  });

  it('rejects malformed JSON body', async () => {
    const req = new Request('http://localhost/api/transactions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{not json',
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    expect((await res.json()).error.code).toBe('INVALID_BODY');
  });
});

describe('GET /api/transactions', () => {
  beforeEach(() => {
    selectWhereLimit.mockReset();
    selectWhereOrderLimit.mockReset();
    insertReturning.mockReset();
  });

  it('returns rows on bare GET (no filters)', async () => {
    selectWhereOrderLimit.mockResolvedValueOnce([
      { id: 't1', symbol: 'AAPL', kind: 'BUY', quantity: '10' },
      { id: 't2', symbol: 'MSFT', kind: 'BUY', quantity: '5' },
    ]);
    const res = await GET(getReq());
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.transactions).toHaveLength(2);
  });

  it('accepts ?accountId=', async () => {
    selectWhereOrderLimit.mockResolvedValueOnce([]);
    const res = await GET(getReq('?accountId=0190b5c8-9000-7000-8000-000000000001'));
    expect(res.status).toBe(200);
  });

  it('accepts ?symbol=', async () => {
    selectWhereOrderLimit.mockResolvedValueOnce([]);
    const res = await GET(getReq('?symbol=AAPL'));
    expect(res.status).toBe(200);
  });

  it('accepts ?limit= up to 200', async () => {
    selectWhereOrderLimit.mockResolvedValueOnce([]);
    const res = await GET(getReq('?limit=200'));
    expect(res.status).toBe(200);
  });

  it('rejects ?limit > 200', async () => {
    const res = await GET(getReq('?limit=500'));
    expect(res.status).toBe(400);
  });

  it('rejects ?symbol with bad format', async () => {
    const res = await GET(getReq('?symbol=aapl'));
    expect(res.status).toBe(400);
  });

  it('rejects ?accountId not a UUID', async () => {
    const res = await GET(getReq('?accountId=garbage'));
    expect(res.status).toBe(400);
  });
});
