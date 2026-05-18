/**
 * /api/transactions/[id] — DELETE (soft) + PATCH (restore).
 *
 *   DELETE: sets `deleted_at = now()` so positions / aggregations
 *           silently drop the row. Idempotent: deleting an already-
 *           deleted row returns the same 200 OK.
 *
 *   PATCH { restore: true }: sets `deleted_at = null`. Idempotent
 *           the same way — restoring a live row is a no-op.
 *
 * Ownership: both verbs verify the transaction belongs to an account
 * under the current profile. Defense-in-depth before M3 multi-profile.
 *
 * INTERACTION_SPEC §7.5 cascade applies to both verbs; the client
 * wrapper triggers router.refresh() until M3 TanStack lands.
 */

import { and, eq, isNotNull, isNull } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/db/client';
import { accounts, transactions } from '@/db/schema';
import { getCurrentProfileId } from '@/lib/profiles/current';

export const runtime = 'nodejs';

const PatchBody = z.object({
  restore: z.literal(true),
});

function jsonError(code: string, message: string, status: number): NextResponse {
  return NextResponse.json({ ok: false, error: { code, message } }, { status });
}

const IdRe = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

interface RouteCtx {
  params: Promise<{ id: string }>;
}

async function ensureOwned(profileId: string, txId: string) {
  // Pulls the tx joined to its account to verify the chain
  // (tx → account → profile). Returns the tx row when authorized.
  const rows = await db
    .select({
      id: transactions.id,
      deletedAt: transactions.deletedAt,
    })
    .from(transactions)
    .innerJoin(accounts, eq(accounts.id, transactions.accountId))
    .where(and(eq(transactions.id, txId), eq(accounts.profileId, profileId)))
    .limit(1);
  return rows[0] ?? null;
}

export async function DELETE(_req: Request, ctx: RouteCtx): Promise<NextResponse> {
  const { id } = await ctx.params;
  if (!IdRe.test(id)) return jsonError('VALIDATION_ERROR', 'Invalid id', 400);

  const profileId = await getCurrentProfileId();
  // Contract #5 guard. M2 single-profile never returns '__all__', so this
  // is a no-op today, but landing the check now means the bug can't ship
  // the day M3 cookie-resolved profile lands.
  if (profileId === '__all__') {
    return jsonError('PROFILE_REQUIRED', 'Pick a profile before deleting trades', 400);
  }
  const owned = await ensureOwned(profileId, id);
  if (!owned) {
    return jsonError(
      'TRANSACTION_NOT_FOUND',
      'Transaction does not exist under the current profile',
      404,
    );
  }

  // Idempotent by-WHERE: update only matches when not already soft-deleted,
  // so the second of two racing deletes is a no-op (0 rows) and we still
  // return 200 OK. Trade-off: the client gets no "already deleted" signal
  // — acceptable because the UI only invokes delete on a visible (live) row.
  await db
    .update(transactions)
    .set({ deletedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(transactions.id, id), isNull(transactions.deletedAt)));

  return NextResponse.json({ ok: true });
}

export async function PATCH(req: Request, ctx: RouteCtx): Promise<NextResponse> {
  const { id } = await ctx.params;
  if (!IdRe.test(id)) return jsonError('VALIDATION_ERROR', 'Invalid id', 400);

  let parsed;
  try {
    parsed = PatchBody.safeParse(await req.json());
  } catch {
    return jsonError('INVALID_BODY', 'Invalid JSON', 400);
  }
  if (!parsed.success) {
    return jsonError('VALIDATION_ERROR', 'Only `{ restore: true }` is supported', 400);
  }

  const profileId = await getCurrentProfileId();
  if (profileId === '__all__') {
    return jsonError('PROFILE_REQUIRED', 'Pick a profile before restoring trades', 400);
  }
  const owned = await ensureOwned(profileId, id);
  if (!owned) {
    return jsonError(
      'TRANSACTION_NOT_FOUND',
      'Transaction does not exist under the current profile',
      404,
    );
  }

  // Idempotent: only clear deleted_at when it's set.
  await db
    .update(transactions)
    .set({ deletedAt: null, updatedAt: new Date() })
    .where(and(eq(transactions.id, id), isNotNull(transactions.deletedAt)));

  return NextResponse.json({ ok: true });
}
