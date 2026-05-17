/**
 * audit_log — optional change history (DATABASE_SPEC §3.16).
 *
 * Disabled by default; populated by triggers if `app_settings.audit_enabled`
 * (future) is true. Bounded by cleanup job (delete > 90 days).
 */

import { sql } from 'drizzle-orm';
import { bigserial, index, jsonb, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';

export const auditLog = pgTable(
  'audit_log',
  {
    id: bigserial('id', { mode: 'bigint' }).primaryKey(),
    profileId: uuid('profile_id'),
    entity: text('entity').notNull(),
    entityId: uuid('entity_id'),
    action: text('action').notNull(), // 'INSERT' | 'UPDATE' | 'DELETE'
    diffJson: jsonb('diff_json'),
    occurredAt: timestamp('occurred_at', { withTimezone: true })
      .notNull()
      .default(sql`now()`),
  },
  (t) => [
    index('idx_audit_recent').on(sql`${t.occurredAt} DESC`),
    index('idx_audit_entity').on(t.entity, t.entityId),
  ],
);

export type AuditLog = typeof auditLog.$inferSelect;
export type NewAuditLog = typeof auditLog.$inferInsert;
