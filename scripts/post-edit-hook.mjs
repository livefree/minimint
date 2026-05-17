#!/usr/bin/env node
/**
 * Claude Code PostToolUse hook (Edit / Write / MultiEdit).
 *
 * Quickly checks the most recently modified TSX file for token-contract
 * violations and prints a short warning to stderr (non-blocking).
 *
 * Intentionally silent on success — only speaks up when there's a problem.
 */

import { execSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';

let recent;
try {
  recent = execSync(
    'git diff --name-only HEAD 2>/dev/null | grep -E "\\.(ts|tsx)$" | head -3',
    { encoding: 'utf8' },
  )
    .trim()
    .split('\n')
    .filter(Boolean);
} catch {
  process.exit(0);
}

if (!recent.length) process.exit(0);

const QUICK_CHECKS = [
  { re: /['"]#[0-9a-fA-F]{3,8}['"]/, msg: 'raw color hex' },
  { re: /\bfontSize\s*:\s*\d/, msg: 'inline fontSize' },
  { re: /\btext-\[[\d.]+px\]/, msg: 'arbitrary text size' },
  { re: /\bMath\.random\s*\(/, msg: 'Math.random in component' },
];

const warnings = [];
for (const file of recent) {
  if (!existsSync(file)) continue;
  const text = readFileSync(file, 'utf8');
  for (const { re, msg } of QUICK_CHECKS) {
    if (re.test(text)) warnings.push({ file, msg });
  }
}

if (warnings.length) {
  process.stderr.write(
    `\n⚠  token-lint warning (${warnings.length}):\n` +
      warnings.map((w) => `   ${w.file}: ${w.msg}`).join('\n') +
      `\n   run \`pnpm lint:tokens\` for details.\n`,
  );
}
process.exit(0);
