import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  // Bump assertion timeout from the 5s default. Next dev mode's per-route
  // first-request compile can spike to 15-20s, blowing past assertions
  // that hit the route immediately (login POST, /s/[symbol] navigation).
  // CI uses retries=2 to absorb this; locally we have retries=0 by policy
  // (surface real flakes early) so we give the assertion more headroom.
  expect: { timeout: 20_000 },
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: devices['Desktop Chrome'] },
    { name: 'mobile-safari', use: devices['iPhone 13'] },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
