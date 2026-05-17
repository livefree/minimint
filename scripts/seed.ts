/**
 * Demo data seeder. Reads the design canvas's mock data shape and inserts
 * 3 profiles (Sam, Mom, Dad), 2 accounts per profile, ~30 transactions each.
 *
 * Safe-guards:
 *   - Refuses to run unless DEMO_MODE=true OR --force flag.
 *   - Wraps inserts in a single transaction.
 *   - Idempotent: deletes existing demo rows (identified by `note LIKE 'demo:%'`) first.
 *
 * Sprint 1: stub. Real seed lands once db/schema/ is populated.
 */

const FORCE = process.argv.includes('--force');
const DEMO = process.env.DEMO_MODE === 'true';

if (!DEMO && !FORCE) {
  console.error('seed: refusing to run. Set DEMO_MODE=true or pass --force.');
  process.exit(1);
}

console.log('seed: stub — sprint 1 implementation pending.');
console.log('seed: will insert 3 profiles × 2 accounts × ~30 txns once schema lands.');
process.exit(0);
