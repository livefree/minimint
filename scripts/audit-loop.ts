/**
 * audit-loop — orchestrates lint + typecheck + tests + token-lint,
 * writes a combined markdown report to logs/audits/, returns non-zero on any failure.
 *
 * Invoked manually (`pnpm audit:loop`) or by the /audit Claude command.
 */

import { execSync } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

type Gate = { name: string; cmd: string };
const GATES: Gate[] = [
  { name: 'lint', cmd: 'pnpm lint --quiet' },
  { name: 'typecheck', cmd: 'pnpm typecheck' },
  { name: 'test', cmd: 'pnpm test -- --run' },
  { name: 'lint:tokens', cmd: 'pnpm lint:tokens' },
];

type Result = { name: string; ok: boolean; output: string };

const results: Result[] = [];
for (const gate of GATES) {
  process.stdout.write(`▸ ${gate.name} ... `);
  try {
    const output = execSync(gate.cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    results.push({ name: gate.name, ok: true, output });
    process.stdout.write('pass\n');
  } catch (err: unknown) {
    const e = err as { stdout?: string; stderr?: string };
    results.push({
      name: gate.name,
      ok: false,
      output: (e.stdout ?? '') + (e.stderr ?? ''),
    });
    process.stdout.write('FAIL\n');
  }
}

const ts = new Date().toISOString().replace(/[:.]/g, '-');
mkdirSync('logs/audits', { recursive: true });
const reportPath = join('logs', 'audits', `audit-${ts}.md`);

const summary = results.map((r) => `- ${r.ok ? '✓' : '✗'} ${r.name}`).join('\n');
const detail = results
  .map((r) => `## ${r.name}\n\n\`\`\`\n${r.output.trim() || '(no output)'}\n\`\`\``)
  .join('\n\n');

writeFileSync(
  reportPath,
  `# audit · ${new Date().toISOString()}\n\n## summary\n\n${summary}\n\n${detail}\n`,
);

console.log(`\nreport: ${reportPath}`);
process.exit(results.every((r) => r.ok) ? 0 : 1);
