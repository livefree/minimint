/**
 * POST /api/accounts — create a new broker account under the current profile.
 *
 * Body (zod-validated):
 *   name:        string 1..64
 *   broker:      string 1..64  (optional)
 *   accountKind: enum BROKERAGE | IRA_TRAD | IRA_ROTH | HSA | 401K | 529 | TRUST | OTHER
 *   last4:       string ^\d{4}$  (optional)
 *
 * colorSlot is assigned server-side by cycling 1..8 based on the count of
 * the operator's existing accounts under the current profile (R-N2.b
 * "cyclic by creation order"). Manual override comes in M3 with
 * `IOSAccountColorPicker`.
 *
 * Currency is fixed to USD per check constraint chk_accounts_currency_usd
 * (DATABASE_SPEC §3.3). taxMethod defaults to AVG.
 *
 * INTERACTION_SPEC §7.5 invalidation cascade for accounts.create:
 *   ['accounts', profileId], ['accounts.todayPL', profileId],
 *   ['portfolio.summary', profileId, '*']
 * (the client-side mutation wrapper applies the cascade; this route
 * just inserts).
 */

import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/db/client';
import { accounts } from '@/db/schema';
import { getCurrentProfileId } from '@/lib/profiles/current';

export const runtime = 'nodejs';

const Body = z.object({
  name: z.string().trim().min(1).max(64),
  broker: z.string().trim().min(1).max(64).optional(),
  accountKind: z.enum([
    'BROKERAGE',
    'IRA_TRAD',
    'IRA_ROTH',
    'HSA',
    '401K',
    '529',
    'TRUST',
    'OTHER',
  ]),
  last4: z
    .string()
    .regex(/^\d{4}$/, 'Last 4 digits must be exactly four digits')
    .optional(),
});

function badRequest(code: string, message: string): NextResponse {
  return NextResponse.json({ ok: false, error: { code, message } }, { status: 400 });
}

export async function POST(req: Request): Promise<NextResponse> {
  let parsed;
  try {
    parsed = Body.safeParse(await req.json());
  } catch {
    return badRequest('INVALID_BODY', 'Invalid JSON');
  }
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return badRequest('VALIDATION_ERROR', issue?.message ?? 'Validation failed');
  }

  const profileId = await getCurrentProfileId();

  // colorSlot = (existing count mod 8) + 1, so we cycle 1..8 by creation order.
  // Read-then-insert race: two concurrent creates could pick the same slot.
  // M2 single-operator scope makes this practically impossible; M3 will
  // either (a) fold the count into a subquery `INSERT … SELECT …` or
  // (b) hand color choice to IOSAccountColorPicker. Tracked in BACKLOG ❓.
  const existing = await db
    .select({ id: accounts.id })
    .from(accounts)
    .where(eq(accounts.profileId, profileId));
  const colorSlot = (existing.length % 8) + 1;

  const inserted = await db
    .insert(accounts)
    .values({
      profileId,
      name: parsed.data.name,
      broker: parsed.data.broker,
      accountKind: parsed.data.accountKind,
      last4: parsed.data.last4,
      colorSlot,
    })
    .returning();
  const created = inserted[0];
  if (!created) {
    return NextResponse.json(
      { ok: false, error: { code: 'INSERT_FAILED', message: 'Could not create account' } },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, account: created }, { status: 201 });
}
