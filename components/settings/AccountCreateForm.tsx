'use client';

/**
 * AccountCreateForm — minimum-viable client form for POST /api/accounts.
 *
 * M2 carving: name + broker + accountKind + last4. colorSlot is assigned
 * server-side (cyclic 1..8 by creation order per R-N2.b); the
 * `IOSAccountColorPicker` swatch grid lands in M3 when manual override
 * arrives.
 *
 * Pattern mirrors `app/(auth)/login/LoginForm.tsx`: plain useState +
 * fetch. React Hook Form is reserved for the TradeSheet PR where field
 * count + cross-field validation justifies the dependency.
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type ErrorCode = 'VALIDATION_ERROR' | 'NETWORK' | 'OTHER';

const COPY: Record<ErrorCode, string> = {
  VALIDATION_ERROR: 'Please check the highlighted fields.',
  NETWORK: "Couldn't reach the server. Try again.",
  OTHER: 'Something went wrong. Try again.',
};

const ACCOUNT_KINDS = [
  { value: 'BROKERAGE', label: 'Brokerage' },
  { value: 'IRA_ROTH', label: 'Roth IRA' },
  { value: 'IRA_TRAD', label: 'Traditional IRA' },
  { value: 'HSA', label: 'HSA' },
  { value: '401K', label: '401(k)' },
  { value: '529', label: '529' },
  { value: 'TRUST', label: 'Trust' },
  { value: 'OTHER', label: 'Other' },
] as const;

export function AccountCreateForm(): React.ReactElement {
  const router = useRouter();
  const [name, setName] = useState('');
  const [broker, setBroker] = useState('');
  const [accountKind, setAccountKind] =
    useState<(typeof ACCOUNT_KINDS)[number]['value']>('BROKERAGE');
  const [last4, setLast4] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<ErrorCode | null>(null);
  const [fieldError, setFieldError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!name.trim()) return;
    setSubmitting(true);
    setError(null);
    setFieldError(null);
    try {
      const res = await fetch('/api/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          broker: broker.trim() || undefined,
          accountKind,
          last4: last4 || undefined,
        }),
      });
      if (res.ok) {
        router.replace('/');
        return;
      }
      const body = (await res.json().catch(() => ({}))) as {
        error?: { code?: string; message?: string };
      };
      if (body.error?.code === 'VALIDATION_ERROR') {
        setError('VALIDATION_ERROR');
        setFieldError(body.error.message ?? null);
      } else {
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
        <div role="alert" className="bg-down/15 t-aux text-down rounded-md px-3 py-2">
          {fieldError ?? COPY[error]}
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="acct-name" className="t-meta">
          Name
        </label>
        <input
          id="acct-name"
          name="name"
          type="text"
          required
          autoFocus
          maxLength={64}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Individual"
          className="t-row bg-surface-2 text-text focus:ring-mint w-full rounded-md px-3 py-2.5 ring-1 ring-transparent transition outline-none"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="acct-broker" className="t-meta">
          Broker <span className="text-text-3">(optional)</span>
        </label>
        <input
          id="acct-broker"
          name="broker"
          type="text"
          maxLength={64}
          value={broker}
          onChange={(e) => setBroker(e.target.value)}
          placeholder="Fidelity"
          className="t-row bg-surface-2 text-text focus:ring-mint w-full rounded-md px-3 py-2.5 ring-1 ring-transparent transition outline-none"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="acct-kind" className="t-meta">
          Account type
        </label>
        <select
          id="acct-kind"
          name="accountKind"
          value={accountKind}
          onChange={(e) => setAccountKind(e.target.value as typeof accountKind)}
          className="t-row bg-surface-2 text-text focus:ring-mint w-full rounded-md px-3 py-2.5 ring-1 ring-transparent transition outline-none"
        >
          {ACCOUNT_KINDS.map((k) => (
            <option key={k.value} value={k.value}>
              {k.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="acct-last4" className="t-meta">
          Last 4 of account # <span className="text-text-3">(optional)</span>
        </label>
        <input
          id="acct-last4"
          name="last4"
          type="text"
          inputMode="numeric"
          maxLength={4}
          value={last4}
          onChange={(e) => setLast4(e.target.value.replace(/\D/g, '').slice(0, 4))}
          placeholder="2645"
          className="t-row bg-surface-2 text-text focus:ring-mint w-full rounded-md px-3 py-2.5 ring-1 ring-transparent transition outline-none"
        />
      </div>

      <p className="t-aux text-text-3">
        A color is assigned automatically (cycling through 8 muted hues). You can change it later
        when the Account Editor ships in M3.
      </p>

      <button
        type="submit"
        disabled={submitting || !name.trim()}
        className="t-row bg-mint text-bg w-full rounded-md px-3 py-2.5 font-semibold transition hover:opacity-90 disabled:opacity-50"
      >
        {submitting ? 'Creating…' : 'Create account'}
      </button>
    </form>
  );
}
