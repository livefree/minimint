/**
 * POST /api/auth/logout — clear the session cookie. Idempotent.
 */

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { SESSION_COOKIE_NAME, sessionCookieOptions } from '@/lib/auth/session';

export const runtime = 'nodejs';

export async function POST(): Promise<NextResponse> {
  const jar = await cookies();
  // Setting maxAge=0 + empty value reliably evicts across browsers
  jar.set(SESSION_COOKIE_NAME, '', { ...sessionCookieOptions(0), maxAge: 0 });
  return NextResponse.json({ ok: true });
}
