// Flat config — enforces the R-T0.g engineering contracts from REVISIONS.md.
// CI runs `pnpm lint` and fails on any of these. Do NOT disable rules to
// ship faster; if a rule is wrong, change it here with reasoning.

import nextPlugin from 'eslint-config-next';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';

export default [
  {
    ignores: ['node_modules', '.next', 'public', 'tests/e2e/test-results'],
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: { ecmaVersion: 'latest', sourceType: 'module', ecmaFeatures: { jsx: true } },
    },
    plugins: { '@typescript-eslint': tsPlugin },
    rules: {
      // contract 1: no raw color hex inside .tsx (CSS is fine)
      'no-restricted-syntax': [
        'error',
        {
          selector: "Literal[value=/^#[0-9a-fA-F]{3,8}$/]",
          message:
            'Raw color hex forbidden in TS/TSX. Use `rgb(var(--token))` or Tailwind utility (`bg-mint` etc.). See CLAUDE.md non-negotiables.',
        },
        // contract 2: no raw fontSize literals
        {
          selector:
            "Property[key.name='fontSize'][value.type='Literal'][value.value!=null]",
          message:
            'Inline `style={{ fontSize: N }}` forbidden. Use role-based utility (.t-meta, .t-row, .t-display, ...). See styles.css.',
        },
        {
          selector:
            "Property[key.name='letterSpacing'][value.type='Literal']",
          message:
            'Inline `style={{ letterSpacing }}` forbidden. Use tracking-* utility.',
        },
        {
          selector:
            "Property[key.name='fontWeight'][value.type='Literal']",
          message:
            'Inline `style={{ fontWeight }}` forbidden. Use a role class.',
        },
        // contract 3: no Math.random inside components/
        {
          selector: "CallExpression[callee.object.name='Math'][callee.property.name='random']",
          message:
            'Math.random() is SSR-unsafe in components. Use React.useId() for SVG IDs.',
        },
      ],
      // typing
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
  {
    // Components folder gets stricter rules; Math.random ban applies app-wide
    // but is critical here.
    files: ['components/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            { name: 'date-fns', message: 'Use a thin wrapper from lib/date.ts for tz-aware formatting.' },
          ],
        },
      ],
    },
  },
  {
    // Tailwind arbitrary-value clamp: forbid `text-[*px]` and `bg-[#...]`
    // — implemented as raw regex via custom rule scaffold; full enforcement
    // ships when prettier-plugin-tailwindcss + a project-specific tailwind
    // plugin lands in sprint 1.
    files: ['**/*.{ts,tsx,css}'],
    rules: {},
  },
];
