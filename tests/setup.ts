/**
 * Vitest global setup. Loaded by `vitest.config.ts`.
 *
 * - DATABASE_URL stub so modules that touch db/client.ts can be imported
 *   in unit tests without a live Neon connection. Tests that exercise db
 *   logic inject their own mock DB; this stub only prevents the
 *   module-load throw.
 * - jest-dom matchers (expect(x).toBeInTheDocument(), etc.)
 * - MSW server stubs for /api/* (sprint 2)
 */

// Must run before any test file imports a module that touches db/client.
process.env.DATABASE_URL ??= 'postgres://stub:stub@localhost/stub';

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
