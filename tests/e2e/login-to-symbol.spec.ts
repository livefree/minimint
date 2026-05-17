/**
 * M1 headline e2e: the full path from unauth to seeing a real stock.
 *
 * Coverage:
 *   - Unauthenticated request to /  → 307 → /login?next=/
 *   - Wrong password  → inline WRONG_PASSWORD copy visible
 *   - Right password  → cookie set, navigate to /
 *   - Home renders ticker grid
 *   - Click AAPL  → /s/AAPL renders hero with name + price + chart
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
    await expect(page.getByText(/look up any us-listed symbol/i)).toBeVisible();
    // ticker grid
    await expect(page.getByRole('link', { name: 'AAPL' })).toBeVisible();
  });

  test('clicking AAPL opens /s/AAPL with hero and chart', async ({ page }) => {
    // login first
    await page.goto('/login');
    await page.getByLabel('Password').pressSequentially(PW);
    // WebKit's React state updates lag fill(); wait for button-enabled.
    const signIn = page.getByRole('button', { name: /sign in/i });
    await expect(signIn).toBeEnabled();
    await signIn.click();
    await expect(page).toHaveURL('/');

    await page.getByRole('link', { name: 'AAPL' }).click();
    await expect(page).toHaveURL('/s/AAPL');

    // Hero — symbol + name
    await expect(page.getByRole('heading', { name: 'AAPL' })).toBeVisible();
    await expect(page.getByText(/apple inc\./i)).toBeVisible();

    // Big price — at least one $XX.XX visible
    await expect(page.getByText(/\$\d{1,4}\.\d{2}/).first()).toBeVisible();

    // Market state badge — one of the labels (.first() since "After hours"
    // can appear both in the main state line and in the extended-hours card)
    await expect(
      page.getByText(/Market open|Market closed|Pre-market|After hours/).first()
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
    await page.getByRole('link', { name: 'AAPL' }).click();

    await page.getByRole('button', { name: '1M' }).click();
    // Range chip becomes active (aria-pressed=true)
    await expect(page.getByRole('button', { name: '1M' })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
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
