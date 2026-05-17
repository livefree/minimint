/**
 * Drizzle + Neon serverless connection.
 * See DATABASE_SPEC.md §10.3 for rationale.
 */

import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from './schema';

if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL not set. Copy .env.example to .env.local and fill in the Neon connection string.',
  );
}

const sql = neon(process.env.DATABASE_URL);

export const db = drizzle(sql, {
  schema,
  casing: 'snake_case',
});

export type DB = typeof db;
export { schema };
