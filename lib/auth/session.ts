/**
 * Session auth helpers — single-operator single-password v1.
 *
 * Architecture (per INTERACTION_SPEC §10.1 + DATABASE_SPEC §3.1):
 *   1. Operator's password is bcrypt-hashed (cost 12) and stored in
 *      app_settings.operator_password_hash (id=1, singleton).
 *   2. SESSION_SECRET (env, 64+ bytes hex) signs JWTs via HS256.
 *      session_secret_kid (DB, just 'v1' in v1) tags the JWT so future
 *      rotation can multi-version.
 *   3. JWT payload: { kid, iat, exp }. No userId — operator is implicit.
 *   4. Cookie: `mm.session`, httpOnly, sameSite=lax, secure in prod,
 *      maxAge driven by SESSION_MAX_AGE_SECONDS (default 30d).
 *
 * Multi-operator + per-profile PIN are deferred (v1.5).
 */

import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';

const COOKIE_NAME = process.env.SESSION_COOKIE_NAME ?? 'mm.session';
const MAX_AGE_SEC = Number(process.env.SESSION_MAX_AGE_SECONDS ?? 60 * 60 * 24 * 30);
const KID = 'v1';

function secret(): Uint8Array {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) {
    throw new Error('SESSION_SECRET must be set and ≥ 32 chars (use `openssl rand -hex 64`)');
  }
  return new TextEncoder().encode(s);
}

export interface SessionPayload {
  kid: string;
  iat: number;
  exp: number;
}

/** Compare a plaintext password against the stored bcrypt hash. */
export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  try {
    return await bcrypt.compare(plain, hash);
  } catch {
    return false;
  }
}

/** Hash a password — used by seed.ts to bootstrap and Settings change-password. */
export async function hashPassword(plain: string, cost = 12): Promise<string> {
  return bcrypt.hash(plain, cost);
}

/** Sign a session JWT. Returns the token string. */
export async function signSession(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  return await new SignJWT({})
    .setProtectedHeader({ alg: 'HS256', kid: KID })
    .setIssuedAt(now)
    .setExpirationTime(now + MAX_AGE_SEC)
    .sign(secret());
}

/** Verify a session token. Returns the decoded payload or null on any failure. */
export async function verifySession(token: string | undefined): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload, protectedHeader } = await jwtVerify(token, secret(), {
      algorithms: ['HS256'],
    });
    if (protectedHeader.kid !== KID) return null;
    if (typeof payload.iat !== 'number' || typeof payload.exp !== 'number') return null;
    return { kid: KID, iat: payload.iat, exp: payload.exp };
  } catch {
    return null;
  }
}

/** Cookie attributes that match what login + logout set/clear. */
export function sessionCookieOptions(maxAge = MAX_AGE_SEC) {
  return {
    name: COOKIE_NAME,
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge,
  };
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;
