'use client';

/**
 * Client island for /login.
 *   - Plain HTML form (no library) to keep M1 lean
 *   - POST /api/auth/login on submit
 *   - Server sets cookie; we just navigate to ?next or '/'
 *   - Error states: WRONG_PASSWORD (inline) · NOT_BOOTSTRAPPED (banner) ·
 *     network (banner with retry-by-resubmit)
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Props {
  next: string;
}

type ErrorCode = 'WRONG_PASSWORD' | 'NOT_BOOTSTRAPPED' | 'NETWORK' | 'OTHER';

const COPY: Record<ErrorCode, string> = {
  WRONG_PASSWORD: 'Incorrect password.',
  NOT_BOOTSTRAPPED:
    'App is not initialized yet. Run `pnpm seed` on the server.',
  NETWORK: "Couldn't reach the server. Check your connection and try again.",
  OTHER: 'Something went wrong. Try again.',
};

export function LoginForm({ next }: Props): React.ReactElement {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<ErrorCode | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!password) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        // Cookie set; navigate.
        router.replace(next);
        return;
      }
      const body = (await res.json().catch(() => ({}))) as {
        error?: { code?: string };
      };
      switch (body.error?.code) {
        case 'WRONG_PASSWORD':
          setError('WRONG_PASSWORD');
          break;
        case 'NOT_BOOTSTRAPPED':
          setError('NOT_BOOTSTRAPPED');
          break;
        default:
          setError('OTHER');
      }
    } catch {
      setError('NETWORK');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      {error && (
        <div
          role="alert"
          className="rounded-md bg-down/15 px-3 py-2 t-aux text-down"
        >
          {COPY[error]}
        </div>
      )}
      <div className="space-y-1.5">
        <label htmlFor="password" className="t-meta">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          autoFocus
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="t-row w-full rounded-md bg-surface-2 px-3 py-2.5 text-text outline-none ring-1 ring-transparent transition focus:ring-mint"
          aria-invalid={error === 'WRONG_PASSWORD'}
          aria-describedby={error ? 'login-error' : undefined}
        />
      </div>
      <button
        type="submit"
        disabled={submitting || !password}
        className="t-row w-full rounded-md bg-mint px-3 py-2.5 font-semibold text-bg transition hover:opacity-90 disabled:opacity-50"
      >
        {submitting ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
