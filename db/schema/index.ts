/**
 * Schema barrel. Each domain owns a file; this re-exports everything so
 * Drizzle can discover the full schema for migration generation and so
 * `db/client.ts` can `import * as schema`.
 *
 * Layout matches DATABASE_SPEC §4.
 */

export * from './enums';
export * from './app';
export * from './profiles';
export * from './accounts';
export * from './watchlists';
export * from './transactions';
export * from './alerts';
export * from './market';
export * from './corporate';
export * from './news';
export * from './audit';
