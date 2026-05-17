#!/usr/bin/env node
/**
 * lint-tokens — enforce R-T0 design-token contracts in TSX.
 *
 * Rules (CLAUDE.md non-negotiables 1 & 2):
 *   1. No raw color hex inside .tsx / .ts (CSS allowed).
 *   2. No raw numeric font-size literals (`style={{ fontSize: N }}`) or
 *      Tailwind arbitrary text size (`text-[13.5px]`) — must use role classes.
 *   3. No `Math.random()` inside components/ for SVG IDs.
 *
 * Exit non-zero with a report when any violation is found.
 */

import { readdirSync, statSync, readFileSync } from 'node:fs';
import { join, extname, relative } from 'node:path';

const ROOT = process.cwd();
const SCAN_DIRS = ['app', 'components', 'lib'];
const SKIP_DIRS = new Set(['node_modules', '.next', 'dist', 'build', 'references']);
const EXTS = new Set(['.ts', '.tsx']);

const RULES = [
  {
    id: 'no-hex-color',
    re: /#[0-9a-fA-F]{3,8}\b/g,
    test: (line) => /['"]#[0-9a-fA-F]{3,8}['"]/.test(line),
    msg: 'Raw color hex forbidden in TS/TSX. Use `rgb(var(--token))` or Tailwind utility.',
  },
  {
    id: 'no-inline-fontsize',
    re: /\bfontSize\s*:\s*\d/g,
    test: () => true,
    msg: 'Inline fontSize forbidden. Use a role class (.t-meta, .t-row, .t-display, ...).',
  },
  {
    id: 'no-inline-letterspacing',
    re: /\bletterSpacing\s*:\s*['"]?-?\d/g,
    test: () => true,
    msg: 'Inline letterSpacing forbidden. Use a tracking-* utility.',
  },
  {
    id: 'no-inline-fontweight',
    re: /\bfontWeight\s*:\s*\d/g,
    test: () => true,
    msg: 'Inline fontWeight forbidden. Use a role class.',
  },
  {
    id: 'no-arbitrary-text-size',
    re: /\btext-\[[\d.]+(?:px|rem|em)\]/g,
    test: () => true,
    msg: 'Tailwind arbitrary text size forbidden. Define + use a role utility.',
  },
  {
    id: 'no-math-random',
    re: /\bMath\.random\s*\(/g,
    test: () => true,
    msg: 'Math.random() is SSR-unsafe. Use React.useId() for SVG IDs.',
  },
];

function* walk(dir) {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRS.has(entry)) continue;
    const full = join(dir, entry);
    const s = statSync(full);
    if (s.isDirectory()) yield* walk(full);
    else if (EXTS.has(extname(entry))) yield full;
  }
}

const violations = [];
for (const dir of SCAN_DIRS) {
  let exists = false;
  try {
    exists = statSync(join(ROOT, dir)).isDirectory();
  } catch {
    /* skip missing dirs */
  }
  if (!exists) continue;
  for (const file of walk(join(ROOT, dir))) {
    const text = readFileSync(file, 'utf8');
    const lines = text.split('\n');
    lines.forEach((line, i) => {
      for (const rule of RULES) {
        rule.re.lastIndex = 0;
        if (rule.re.test(line) && rule.test(line)) {
          violations.push({
            file: relative(ROOT, file),
            line: i + 1,
            rule: rule.id,
            msg: rule.msg,
            snippet: line.trim().slice(0, 120),
          });
        }
      }
    });
  }
}

if (violations.length === 0) {
  console.log('lint-tokens: 0 violations');
  process.exit(0);
}

const grouped = new Map();
for (const v of violations) {
  if (!grouped.has(v.rule)) grouped.set(v.rule, []);
  grouped.get(v.rule).push(v);
}

console.error(`lint-tokens: ${violations.length} violation(s)\n`);
for (const [rule, items] of grouped) {
  console.error(`  [${rule}] ${items[0].msg}`);
  for (const v of items.slice(0, 10)) {
    console.error(`    ${v.file}:${v.line}   ${v.snippet}`);
  }
  if (items.length > 10) console.error(`    ... and ${items.length - 10} more\n`);
}
process.exit(1);
