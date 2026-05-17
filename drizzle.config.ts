import { defineConfig } from 'drizzle-kit';

// drizzle-kit bundles its own dotenv loader and auto-reads .env.local / .env,
// so we don't `import 'dotenv/config'` here (dotenv isn't a direct dep).
// DATABASE_URL is required at apply time (`db:migrate`) but optional at
// generate time (schema diffing is offline).
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
