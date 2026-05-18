/**
 * Headline e2e: login → home → symbol detail.
 *
 * Coverage:
 *   - Unauthenticated request to /  → 307 → /login?next=/
 *   - Wrong password  → inline WRONG_PASSWORD copy visible
 *   - Right password  → cookie set, navigate to /
 *   - Home renders (M2: NetWorthHero+PositionsTable when held, else EmptyHome;
 *     LookupForm is present in both shapes so e2e doesn't depend on DB state)
 *   - LookupForm submit → /s/AAPL renders hero with name + price + chart
 *
 * Runs against `pnpm dev` (see playwright.config.ts webServer block).
 * Requires .env.local with DATABASE_URL + APP_PASSWORD=dev-test-pw +
 * SESSION_SECRET, and `pnpm seed` having been run once against dev DB.
 */

import { expect, test } from '@playwright/test';

const PW = process.env.E2E_PASSWORD ?? 'dev-test-pw';

// Serialize: each test logs in fresh and hits yahoo; parallel runs can
// 429 the upstream and produce flake. Sequential is plenty fast (~30s total).
test.describe.configure({ mode: 'serial' });

// Warm the routes the spec hits so first-time assertions aren't racing
// Next dev mode's per-route cold compile (can spike to 15-20s on dev,
// well past the default 5s expect timeout). Each warmup is best-effort
// — failures are swallowed because the real tests will surface any
// genuine 4xx/5xx behavior.
test.beforeAll(async ({ request }) => {
  await Promise.all([
    request
      .post('/api/auth/login', {
        data: { password: 'warmup-not-real' },
        failOnStatusCode: false,
        timeout: 60_000,
      })
      .catch(() => undefined),
    request
      .get('/api/quote/AAPL', { failOnStatusCode: false, timeout: 60_000 })
      .catch(() => undefined),
    request
      .get('/api/history/AAPL?range=1Y', { failOnStatusCode: false, timeout: 60_000 })
      .catch(() => undefined),
  ]);
});

test.describe('M1 · login → symbol', () => {
  test('unauthenticated / redirects to /login', async ({ page }) => {
    const res = await page.goto('/');
    // Final URL should be /login with ?next=/
    await expect(page).toHaveURL(/\/login(\?next=.*)?$/);
    expect(res?.status() ?? 0).toBeLessThan(400);
  });

  test('wrong password shows inline error', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Password').pressSequentially('definitely-wrong');
    // WebKit's React state updates lag fill(); wait for button-enabled.
    const signIn = page.getByRole('button', { name: /sign in/i });
    await expect(signIn).toBeEnabled();
    await signIn.click();
    await expect(page.getByText(/incorrect password/i)).toBeVisible();
    // URL did not change
    await expect(page).toHaveURL(/\/login/);
  });

  test('right password logs in and shows home', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Password').pressSequentially(PW);
    // WebKit's React state updates lag fill(); wait for button-enabled.
    const signIn = page.getByRole('button', { name: /sign in/i });
    await expect(signIn).toBeEnabled();
    await signIn.click();
    await expect(page).toHaveURL('/');
    await expect(page.getByRole('heading', { name: /mini-mint/i })).toBeVisible();
    // LookupForm is present in both EmptyHome and populated-home shapes,
    // so this assertion doesn't depend on DB state.
    await expect(page.getByLabel(/^symbol$/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /^open$/i })).toBeVisible();
  });

  test('lookup AAPL opens /s/AAPL with hero and chart', async ({ page }) => {
    // login first
    await page.goto('/login');
    await page.getByLabel('Password').pressSequentially(PW);
    // WebKit's React state updates lag fill(); wait for button-enabled.
    const signIn = page.getByRole('button', { name: /sign in/i });
    await expect(signIn).toBeEnabled();
    await signIn.click();
    await expect(page).toHaveURL('/');

    await page.getByLabel(/^symbol$/i).fill('AAPL');
    await page.getByRole('button', { name: /^open$/i }).click();
    await expect(page).toHaveURL('/s/AAPL');

    // Hero — symbol + name
    await expect(page.getByRole('heading', { name: 'AAPL' })).toBeVisible();
    await expect(page.getByText(/apple inc\./i)).toBeVisible();

    // Big price — at least one $XX.XX visible
    await expect(page.getByText(/\$\d{1,4}\.\d{2}/).first()).toBeVisible();

    // Market state badge — one of the labels (.first() since "After hours"
    // can appear both in the main state line and in the extended-hours card)
    await expect(
      page.getByText(/Market open|Market closed|Pre-market|After hours/).first(),
    ).toBeVisible();

    // Range chip row visible — proves SymbolView client island mounted
    await expect(page.getByRole('button', { name: '1Y' })).toBeVisible();
    // lightweight-charts mounts a <canvas> via dynamic import; allow time
    await expect(page.locator('canvas').first()).toBeAttached({ timeout: 15_000 });
  });

  test('switching range chip refetches and chart remains visible', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Password').pressSequentially(PW);
    // WebKit's React state updates lag fill(); wait for button-enabled.
    const signIn = page.getByRole('button', { name: /sign in/i });
    await expect(signIn).toBeEnabled();
    await signIn.click();
    await expect(page).toHaveURL('/');
    await page.getByLabel(/^symbol$/i).fill('AAPL');
    await page.getByRole('button', { name: /^open$/i }).click();
    await expect(page).toHaveURL('/s/AAPL');

    await page.getByRole('button', { name: '1M' }).click();
    // Range chip becomes active (aria-pressed=true)
    await expect(page.getByRole('button', { name: '1M' })).toHaveAttribute('aria-pressed', 'true');
    // Chart canvas still there
    await expect(page.locator('canvas').first()).toBeVisible();
  });

  test('invalid symbol returns 404', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel('Password').pressSequentially(PW);
    // WebKit's React state updates lag fill(); wait for button-enabled.
    const signIn = page.getByRole('button', { name: /sign in/i });
    await expect(signIn).toBeEnabled();
    await signIn.click();
    await expect(page).toHaveURL('/'); // wait for the post-login navigation

    // Symbol too long (>16 chars) fails SYMBOL_RE → notFound() → 404
    const res = await page.goto('/s/THIS-IS-WAY-TOO-LONG-A-SYMBOL');
    expect(res?.status() ?? 200).toBe(404);
    // And the AAPL hero / chart should NOT be rendered
    await expect(page.getByText(/apple inc\./i)).toBeHidden();
  });
});
