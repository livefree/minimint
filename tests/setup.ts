/**
 * Vitest global setup. Loaded by `vitest.config.ts`.
 *
 * - jest-dom matchers (expect(x).toBeInTheDocument(), etc.)
 * - MSW server stubs for /api/* (sprint 2)
 */

import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

afterEach(() => {
  cleanup();
});

// MSW server boot lives here once integration tests need it (sprint 2):
//   import { server } from './_msw/server';
//   beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
//   afterEach(() => server.resetHandlers());
//   afterAll(() => server.close());
