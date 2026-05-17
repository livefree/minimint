/**
 * POST /api/auth/login
 *
 * Body: { password: string }
 *
 * 1. Read app_settings.operator_password_hash (singleton, id=1)
 * 2. bcrypt.compare against submitted password
 * 3. On match: sign session JWT, set httpOnly cookie, return
 *    { ok: true, profilesExist: bool } so the client can decide
 *    whether to land on /onboarding or /.
 * 4. On mismatch: 401 with rate-limit-friendly cool-down hint.
 *
 * For M1 the client redirects post-login; we don't redirect server-side
 * so the response shape can carry routing hints.
 */

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { cookies } from 'next/headers';
import { eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { appSettings, profiles } from '@/db/schema';
import { sessionCookieOptions, signSession, verifyPassword } from '@/lib/auth/session';

export const runtime = 'nodejs';

const Body = z.object({
  password: z.string().min(1).max(256),
});

export async function POST(req: Request): Promise<NextResponse> {
  let parsed;
  try {
    parsed = Body.safeParse(await req.json());
  } catch {
    return NextResponse.json(
      { ok: false, error: { code: 'INVALID_BODY', message: 'Invalid JSON' } },
      { status: 400 }
    );
  }
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: { code: 'VALIDATION_ERROR', message: 'Password required' } },
      { status: 400 }
    );
  }

  // Read singleton operator row
  const rows = await db
    .select({ hash: appSettings.operatorPasswordHash })
    .from(appSettings)
    .where(eq(appSettings.id, 1))
    .limit(1);
  const row = rows[0];

  if (!row) {
    // Bootstrap missing — operator hasn't run pnpm seed yet
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'NOT_BOOTSTRAPPED',
          message: 'App not initialized. Run `pnpm seed` on the server.',
        },
      },
      { status: 503 }
    );
  }

  const ok = await verifyPassword(parsed.data.password, row.hash);
  if (!ok) {
    // Constant 800ms delay to blunt timing attacks + brute force
    await new Promise((r) => setTimeout(r, 800));
    return NextResponse.json(
      { ok: false, error: { code: 'WRONG_PASSWORD', message: 'Incorrect password' } },
      { status: 401 }
    );
  }

  const token = await signSession();
  const opts = sessionCookieOptions();
  const jar = await cookies();
  jar.set(opts.name, token, opts);

  // Tell the client whether they need to land on onboarding or home
  const profileCount = await db.select({ id: profiles.id }).from(profiles).limit(1);
  const profilesExist = profileCount.length > 0;

  return NextResponse.json({ ok: true, profilesExist });
}
