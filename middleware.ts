/**
 * Route guard middleware. Unauthenticated requests to any (app) page
 * redirect to /login?next=<original>. API routes return 401 JSON.
 *
 * Public paths (no auth):
 *   - /login
 *   - /api/auth/login
 *   - /api/auth/logout (idempotent — safe to call without session)
 *   - /api/health (monitoring)
 *   - Next.js static assets (handled by config.matcher exclusion)
 */

import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME, verifySession } from '@/lib/auth/session';

const PUBLIC_PATHS = new Set([
  '/login',
  '/api/auth/login',
  '/api/auth/logout',
  '/api/health',
]);

export async function middleware(req: NextRequest): Promise<NextResponse> {
  const { pathname } = req.nextUrl;

  if (PUBLIC_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = await verifySession(token);

  if (session) {
    return NextResponse.next();
  }

  // Unauthenticated branch
  if (pathname.startsWith('/api/')) {
    return NextResponse.json(
      { ok: false, error: { code: 'UNAUTHENTICATED', message: 'Sign in required' } },
      { status: 401 }
    );
  }

  const loginUrl = new URL('/login', req.url);
  loginUrl.searchParams.set('next', pathname + req.nextUrl.search);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  /**
   * Run middleware on every path EXCEPT:
   *   - _next/* (Next internal: static, image, etc.)
   *   - favicon, manifest, icons
   *   - public/* served files (anything with a file extension)
   */
  matcher: ['/((?!_next/|favicon|.*\\..*).*)'],
};
