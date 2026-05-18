/**
 * /api/transactions — first write API for portfolio state.
 *
 * POST: create a transaction (zod-validated, account-ownership enforced).
 * GET:  list transactions with optional ?accountId / ?symbol / ?limit filters.
 *
 * DATABASE_SPEC §3.5 governs the schema. Numeric fields (quantity, price,
 * fees) cross the wire as STRINGS to preserve precision per contract #6;
 * we hand them to Drizzle untouched and never `parseFloat` them. The DB
 * column type drives the actual decimal storage.
 *
 * INTERACTION_SPEC §7.5 prescribes the post-mutation cascade
 * (positions / myPosition / portfolio.summary / accounts.todayPL / etc.).
 * The cascade is APPLIED in the client wrapper layer once TanStack
 * QueryClient lands in the TradeSheet PR (M2-5); this route layer only
 * writes the row and lets server-fetched paint refresh.
 *
 * Account ownership: every POST verifies the supplied accountId belongs
 * to the current profile. The check is redundant in M2 (single profile)
 * but is the defense-in-depth backstop for the M3 multi-profile cutover
 * — it short-circuits cross-profile write-by-id attacks the moment the
 * cookie-resolved current profile lands. See BACKLOG ❓ `__all__` guard.
 */

import { and, desc, eq, isNull, type SQL } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/db/client';
import { accounts, transactions } from '@/db/schema';
import { getCurrentProfileId } from '@/lib/profiles/current';

export const runtime = 'nodejs';

// ─── shared validators ─────────────────────────────────────────────────

const KINDS = [
  'BUY',
  'SELL',
  'DIV',
  'SPLIT',
  'FEE',
  'CASH_IN',
  'CASH_OUT',
  'TRANSFER_IN',
  'TRANSFER_OUT',
] as const;

/** Schema's chk_transactions_symbol regex (DATABASE_SPEC §3.5). */
const SYMBOL_RE = /^[A-Z0-9.^-]{1,16}$/;

/** Positive decimal string with up to `scale` fractional digits. We keep
 *  values as strings end-to-end so Drizzle hands them to numeric columns
 *  without ever round-tripping through Number — contract #6 says no JS
 *  floats for money/quantity, including not for compare-only operations.
 *  Returns ZodEffects (regex + refine), annotation widened so callers
 *  can compose. */
const ZERO_RE = /^0+(\.0+)?$/;
function decString(scale: number, allowZero: boolean) {
  const re = new RegExp(`^\\d+(\\.\\d{1,${scale}})?$`);
  return z
    .string()
    .regex(re, `Must be a decimal with up to ${scale} fractional digits`)
    .refine((v) => allowZero || !ZERO_RE.test(v), 'Must be greater than zero');
}

const Body = z.object({
  accountId: z.string().uuid('accountId must be a UUID'),
  symbol: z.string().regex(SYMBOL_RE, 'Symbol must match ^[A-Z0-9.^-]{1,16}$'),
  kind: z.enum(KINDS),
  quantity: decString(8, /* allowZero */ false),
  price: decString(6, /* allowZero */ true).optional(),
  fees: decString(4, /* allowZero */ true).optional(),
  executedAt: z
    .string()
    .datetime({ offset: true, message: 'executedAt must be ISO-8601 with timezone' }),
  note: z.string().max(2000).optional(),
});

// ─── helpers ───────────────────────────────────────────────────────────

function jsonError(code: string, message: string, status: number): NextResponse {
  return NextResponse.json({ ok: false, error: { code, message } }, { status });
}

// ─── POST ──────────────────────────────────────────────────────────────

export async function POST(req: Request): Promise<NextResponse> {
  let parsed;
  try {
    parsed = Body.safeParse(await req.json());
  } catch {
    return jsonError('INVALID_BODY', 'Invalid JSON', 400);
  }
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return jsonError('VALIDATION_ERROR', issue?.message ?? 'Validation failed', 400);
  }

  const profileId = await getCurrentProfileId();

  // Account ownership — required even in M2 to lock down the API surface
  // before multi-profile UI lands.
  const ownerRow = await db
    .select({ id: accounts.id })
    .from(accounts)
    .where(and(eq(accounts.id, parsed.data.accountId), eq(accounts.profileId, profileId)))
    .limit(1);
  if (!ownerRow[0]) {
    return jsonError('ACCOUNT_NOT_FOUND', 'Account does not exist under the current profile', 404);
  }

  const inserted = await db
    .insert(transactions)
    .values({
      profileId,
      accountId: parsed.data.accountId,
      symbol: parsed.data.symbol,
      kind: parsed.data.kind,
      quantity: parsed.data.quantity,
      price: parsed.data.price ?? '0',
      fees: parsed.data.fees ?? '0',
      executedAt: new Date(parsed.data.executedAt),
      note: parsed.data.note,
    })
    .returning();
  const created = inserted[0];
  if (!created) {
    return jsonError('INSERT_FAILED', 'Could not create transaction', 500);
  }

  return NextResponse.json({ ok: true, transaction: created }, { status: 201 });
}

// ─── GET ───────────────────────────────────────────────────────────────

const Query = z.object({
  accountId: z.string().uuid().optional(),
  symbol: z.string().regex(SYMBOL_RE).optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
});

export async function GET(req: Request): Promise<NextResponse> {
  const params = Object.fromEntries(new URL(req.url).searchParams);
  const parsed = Query.safeParse(params);
  if (!parsed.success) {
    return jsonError('VALIDATION_ERROR', parsed.error.issues[0]?.message ?? 'Bad query', 400);
  }

  const profileId = await getCurrentProfileId();

  const where: SQL[] = [eq(transactions.profileId, profileId), isNull(transactions.deletedAt)];
  if (parsed.data.accountId) where.push(eq(transactions.accountId, parsed.data.accountId));
  if (parsed.data.symbol) where.push(eq(transactions.symbol, parsed.data.symbol));

  const rows = await db
    .select()
    .from(transactions)
    .where(and(...where))
    .orderBy(desc(transactions.executedAt))
    .limit(parsed.data.limit);

  return NextResponse.json({ ok: true, transactions: rows });
}
