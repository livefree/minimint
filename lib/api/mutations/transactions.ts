/**
 * Client-side wrappers for /api/transactions.
 *
 * Plain async functions for now — mirror the AccountCreateForm pattern.
 * The TradeSheet PR (M2-5) wraps these in TanStack `useMutation` /
 * `useQuery` and applies the INTERACTION_SPEC §7.5 invalidation cascade
 * via a central `invalidateAfterTxnMutation(qc, profileId, txn)` helper
 * (not yet built). For now callers can `router.refresh()` or re-fetch
 * manually after success.
 *
 * Numeric fields (quantity, price, fees) travel as STRINGS end-to-end to
 * preserve precision per contract #6 — UI inputs collect strings, the
 * API stores them in numeric columns, and `lib/portfolio/positions.ts`
 * reads them back as `Decimal`. Don't introduce a `parseFloat`.
 */

export interface TransactionInput {
  accountId: string;
  symbol: string;
  kind:
    | 'BUY'
    | 'SELL'
    | 'DIV'
    | 'SPLIT'
    | 'FEE'
    | 'CASH_IN'
    | 'CASH_OUT'
    | 'TRANSFER_IN'
    | 'TRANSFER_OUT';
  /** Decimal as string. > 0 (server rejects 0 or negative). */
  quantity: string;
  /** Decimal as string. ≥ 0. Defaults to '0' server-side when omitted. */
  price?: string;
  /** Decimal as string. ≥ 0. Defaults to '0' server-side when omitted. */
  fees?: string;
  /** ISO-8601 with timezone, e.g. '2026-05-17T15:35:00-04:00'. */
  executedAt: string;
  note?: string;
}

export interface CreatedTransaction {
  id: string;
  profileId: string;
  accountId: string;
  symbol: string;
  kind: TransactionInput['kind'];
  quantity: string;
  price: string;
  fees: string;
  executedAt: string;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiError {
  code: string;
  message: string;
}

export class TransactionApiError extends Error {
  readonly code: string;
  readonly status: number;
  constructor(code: string, message: string, status: number) {
    super(message);
    this.name = 'TransactionApiError';
    this.code = code;
    this.status = status;
  }
}

/**
 * POST /api/transactions. Throws `TransactionApiError` on non-2xx.
 */
export async function createTransaction(input: TransactionInput): Promise<CreatedTransaction> {
  const res = await fetch('/api/transactions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  const body = (await res.json().catch(() => ({}))) as
    | { ok: true; transaction: CreatedTransaction }
    | { ok: false; error: ApiError };

  if (!res.ok || !body.ok) {
    const err = 'error' in body ? body.error : { code: 'UNKNOWN', message: 'Unknown error' };
    throw new TransactionApiError(err.code, err.message, res.status);
  }
  return body.transaction;
}

export interface ListTransactionsQuery {
  accountId?: string;
  symbol?: string;
  /** 1..200, default 50. */
  limit?: number;
}

/**
 * GET /api/transactions. Returns rows sorted by executedAt DESC.
 */
export async function listTransactions(
  query: ListTransactionsQuery = {},
): Promise<CreatedTransaction[]> {
  const search = new URLSearchParams();
  if (query.accountId) search.set('accountId', query.accountId);
  if (query.symbol) search.set('symbol', query.symbol);
  if (query.limit !== undefined) search.set('limit', String(query.limit));

  const url = `/api/transactions${search.size ? `?${search.toString()}` : ''}`;
  const res = await fetch(url);
  const body = (await res.json().catch(() => ({}))) as
    | { ok: true; transactions: CreatedTransaction[] }
    | { ok: false; error: ApiError };

  if (!res.ok || !body.ok) {
    const err = 'error' in body ? body.error : { code: 'UNKNOWN', message: 'Unknown error' };
    throw new TransactionApiError(err.code, err.message, res.status);
  }
  return body.transactions;
}
