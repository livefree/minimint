/**
 * news_cache — v1.5 news + market headlines (DATABASE_SPEC §3.14).
 *
 * `symbol` NULL = market-wide article. Partial index serves the
 * "all market news" feed without scanning per-symbol rows.
 */

import { sql } from 'drizzle-orm';
import { index, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { uuidv7 } from 'uuidv7';

export const newsCache = pgTable(
  'news_cache',
  {
    id: uuid('id')
      .primaryKey()
      .$defaultFn(() => uuidv7()),
    symbol: text('symbol'),
    headline: text('headline').notNull(),
    publisher: text('publisher'),
    url: text('url').notNull(),
    thumbnailUrl: text('thumbnail_url'),
    publishedAt: timestamp('published_at', { withTimezone: true }).notNull(),
    fetchedAt: timestamp('fetched_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => [
    index('idx_news_symbol_pub').on(t.symbol, sql`${t.publishedAt} DESC`),
    index('idx_news_market')
      .on(sql`${t.publishedAt} DESC`)
      .where(sql`${t.symbol} IS NULL`),
  ],
);

export type NewsCache = typeof newsCache.$inferSelect;
export type NewNewsCache = typeof newsCache.$inferInsert;
