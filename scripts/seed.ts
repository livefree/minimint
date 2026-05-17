#!/usr/bin/env tsx
/**
 * Operator bootstrap + optional demo data seeder.
 *
 * Modes (mutually exclusive):
 *   pnpm seed           → bootstrap mode: writes app_settings row from env.
 *                         Idempotent — re-runs are safe and re-hash password.
 *   pnpm seed --demo    → in addition, seeds 3 profiles + accounts + txns
 *                         (DEMO_MODE=true or --demo flag)
 *
 * Required env (bootstrap):
 *   DATABASE_URL          → Neon connection string
 *   APP_PASSWORD          → operator's password (will be bcrypt-hashed)
 *   SESSION_SECRET        → 32+ char hex (used as JWT signing secret)
 *
 * Optional env:
 *   FINNHUB_API_KEY       → stored encrypted in app_settings (v1.5; for now
 *                           kept in env directly and saved unencrypted here
 *                           to avoid blocking on encryption work)
 *   SECRETS_KEY           → 32-byte key for future Finnhub key encryption
 *
 * Loads .env.local explicitly (tsx doesn't pick it up by default).
 */

import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// ── env loading: read .env.local first so we never depend on shell exports ──
function loadEnvLocal() {
  const p = resolve(process.cwd(), '.env.local');
  if (!existsSync(p)) return;
  for (const raw of readFileSync(p, 'utf8').split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq < 0) continue;
    const key = line.slice(0, eq).trim();
    const val = line.slice(eq + 1).trim();
    if (key && !(key in process.env)) process.env[key] = val;
  }
}
loadEnvLocal();

// Lazy-import db client AFTER env is loaded (it asserts DATABASE_URL).
const { db } = await import('@/db/client');
const { appSettings, profiles, accounts, securities, transactions } = await import(
  '@/db/schema'
);
const { hashPassword } = await import('@/lib/auth/session');
const { eq, sql } = await import('drizzle-orm');

const demo = process.argv.includes('--demo') || process.env.DEMO_MODE === 'true';

// ── bootstrap app_settings ───────────────────────────────────────────────

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) {
    console.error(`seed: ${name} not set. Aborting.`);
    process.exit(1);
  }
  return v;
}

async function bootstrap(): Promise<void> {
  const password = process.env.APP_PASSWORD ?? process.env.OPERATOR_PASSWORD;
  if (!password) {
    // Allow bootstrap from existing APP_PASSWORD_HASH if password is missing —
    // useful when re-deploying with the same hash already in env.
    const existingHash = process.env.APP_PASSWORD_HASH;
    if (!existingHash || existingHash === 'stub') {
      console.error(
        'seed: APP_PASSWORD (plaintext to hash) or APP_PASSWORD_HASH (precomputed) required.'
      );
      process.exit(1);
    }
    await upsertSettings(existingHash);
    return;
  }
  const hash = await hashPassword(password);
  await upsertSettings(hash);
}

async function upsertSettings(hash: string): Promise<void> {
  const sessionSecret = requireEnv('SESSION_SECRET');
  if (sessionSecret.length < 32) {
    console.error('seed: SESSION_SECRET must be ≥32 chars (openssl rand -hex 64).');
    process.exit(1);
  }
  await db
    .insert(appSettings)
    .values({
      id: 1,
      operatorPasswordHash: hash,
      sessionSecretKid: 'v1',
      refreshSeconds: 30,
      demoMode: demo,
      schemaVersion: 1,
    })
    .onConflictDoUpdate({
      target: appSettings.id,
      set: {
        operatorPasswordHash: hash,
        sessionSecretKid: 'v1',
        demoMode: demo,
        updatedAt: new Date(),
      },
    });
  console.log('seed: app_settings (id=1) upserted; demo_mode=' + demo);
}

// ── demo data ────────────────────────────────────────────────────────────

async function seedDemo(): Promise<void> {
  console.log('seed --demo: building 1 profile × 1 account × 3 transactions');

  // Idempotent: wipe any demo profile named "Demo · Me" first
  await db.delete(profiles).where(eq(profiles.name, 'Demo · Me'));

  // Ensure AAPL exists in securities (lazy populate via market adapter
  // would be cleaner; here we hardcode for offline-safety of the seeder)
  await db
    .insert(securities)
    .values({
      symbol: 'AAPL',
      name: 'Apple Inc.',
      exchange: 'NMS',
      assetType: 'EQUITY',
      currency: 'USD',
    })
    .onConflictDoNothing();

  const [profile] = await db
    .insert(profiles)
    .values({
      name: 'Demo · Me',
      avatarValue: 'DM',
      colorSlot: 1,
      relation: 'SELF',
    })
    .returning({ id: profiles.id });

  if (!profile) throw new Error('demo profile insert returned no rows');

  const [acct] = await db
    .insert(accounts)
    .values({
      profileId: profile.id,
      name: 'Demo Brokerage',
      accountKind: 'BROKERAGE',
      colorSlot: 1,
      taxMethod: 'AVG',
    })
    .returning({ id: accounts.id });

  if (!acct) throw new Error('demo account insert returned no rows');

  await db.insert(transactions).values([
    {
      profileId: profile.id,
      accountId: acct.id,
      symbol: 'AAPL',
      kind: 'BUY',
      quantity: '50',
      price: '150.00',
      executedAt: new Date('2024-01-15T14:30:00Z'),
      note: 'demo: opening lot',
    },
    {
      profileId: profile.id,
      accountId: acct.id,
      symbol: 'AAPL',
      kind: 'BUY',
      quantity: '50',
      price: '180.00',
      executedAt: new Date('2025-06-10T14:30:00Z'),
      note: 'demo: add-on',
    },
    {
      profileId: profile.id,
      accountId: acct.id,
      symbol: 'AAPL',
      kind: 'SELL',
      quantity: '30',
      price: '220.00',
      executedAt: new Date('2025-12-20T14:30:00Z'),
      note: 'demo: partial trim',
    },
  ]);

  const count = await db.execute(
    sql`SELECT count(*)::int AS n FROM transactions WHERE note LIKE 'demo:%'`
  );
  console.log('seed --demo: ' + (count.rows[0] as { n: number }).n + ' demo transactions');
}

// ── main ─────────────────────────────────────────────────────────────────

try {
  await bootstrap();
  if (demo) await seedDemo();
  console.log('seed: done.');
  process.exit(0);
} catch (e) {
  console.error('seed: FAILED', e);
  process.exit(1);
}
