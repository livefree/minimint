/**
 * Health check endpoint. Used by CI smoke tests and uptime monitors.
 * Returns DB connectivity + schema_version when DB is configured.
 */

import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const status = {
    ok: true,
    service: 'mini-mint',
    version: process.env.npm_package_version ?? 'dev',
    db: { configured: !!process.env.DATABASE_URL, reachable: undefined as boolean | undefined },
    time: new Date().toISOString(),
  };

  // DB ping intentionally skipped in sprint-0 stub; will be wired in sprint 1
  // when db/client.ts and the first migration land.

  return NextResponse.json(status);
}
