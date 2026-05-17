import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { defineConfig } from 'drizzle-kit';

// drizzle-kit doesn't auto-load .env.local (Next.js convention but not its own).
// We parse it ourselves — minimal subset of dotenv (KEY=VALUE per line, # comments,
// no quoting tricks). Existing process.env wins so CI can override.
// DATABASE_URL is required at apply time; for `db:generate` schema diffing it
// falls back to a placeholder URL (drizzle-kit doesn't connect during generate).
function loadEnvLocal(): void {
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

export default defineConfig({
  schema: './db/schema/index.ts',
  out: './db/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL ?? 'postgres://placeholder',
  },
  verbose: true,
  strict: true,
  casing: 'snake_case',
});
