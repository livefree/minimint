'use client';

/**
 * TradeSheet — M2 carve: BUY / SELL only.
 *
 * Bottom sheet (vaul Drawer) on touch devices; the Drawer primitive
 * also handles mac as a centered modal-like overlay.
 *
 * Form: react-hook-form + zod resolver. Numeric inputs collect strings
 * end-to-end per contract #6; estimated-total hero updates live via
 * a watch + computeEstimatedTotal (Decimal math).
 *
 * Submit: createTransaction (lib/api/mutations/transactions.ts) →
 * dismiss sheet → router.refresh() so server-rendered MyPosition /
 * positions table re-fetch (no TanStack QueryClient in M2; cascade
 * deferred to M3 per BACKLOG ❓).
 *
 * Spec anchors: INTERACTION_SPEC §3.7 (sticky bottom Trade CTA path),
 * §6 (transactions.create button + cancel-confirm behavior),
 * REVISIONS R-I2 (field states), R-P3 (profile-attributed header —
 * single profile in M2 so renders as "Me" with profile color stripe).
 *
 * DIV / SPLIT / CASH_* / TRANSFER_* / FEE kinds are deferred — UI
 * locked to BUY/SELL segmented control per BACKLOG ("BUY/SELL only").
 * The API already accepts the full enum so DIV/SPLIT UI can extend
 * without API changes.
 */

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Drawer } from 'vaul';
import { z } from 'zod';
import {
  createTransaction,
  TransactionApiError,
  type TransactionInput,
} from '@/lib/api/mutations/transactions';
import type { AccountSummary } from '@/lib/accounts/listForProfile';
import { computeEstimatedTotal, formatCash } from '@/lib/trade/totals';

// ─── form schema ───────────────────────────────────────────────────────

const DEC_RE = /^\d+(\.\d+)?$/;

const TradeFormSchema = z.object({
  kind: z.enum(['BUY', 'SELL']),
  accountId: z.string().uuid('Pick an account'),
  symbol: z.string().regex(/^[A-Z0-9.^-]{1,16}$/),
  quantity: z
    .string()
    .min(1, 'Enter a quantity')
    .regex(DEC_RE, 'Numbers only')
    .refine((v) => /^[0]+(\.0+)?$/.test(v) === false, 'Must be greater than zero')
    .refine((v) => {
      const dot = v.indexOf('.');
      return dot < 0 || v.length - dot - 1 <= 8;
    }, 'Up to 8 decimal places'),
  price: z
    .string()
    .min(1, 'Enter a price')
    .regex(DEC_RE, 'Numbers only')
    .refine((v) => {
      const dot = v.indexOf('.');
      return dot < 0 || v.length - dot - 1 <= 6;
    }, 'Up to 6 decimal places'),
  fees: z
    .string()
    .regex(DEC_RE, 'Numbers only')
    .refine((v) => {
      const dot = v.indexOf('.');
      return dot < 0 || v.length - dot - 1 <= 4;
    }, 'Up to 4 decimal places')
    .default('0'),
  executedAt: z.string().min(1, 'Pick a date'),
  note: z.string().max(2000).optional(),
});

type TradeFormValues = z.infer<typeof TradeFormSchema>;

// ─── helpers ───────────────────────────────────────────────────────────

/** YYYY-MM-DDTHH:MM in the browser's local zone, suitable for
 *  <input type="datetime-local"> default. */
function nowLocalISO(): string {
  const now = new Date();
  const pad = (n: number): string => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

/** Browser-local datetime-local string → ISO-8601 with offset that the
 *  /api/transactions zod schema accepts. */
function localToIso(local: string): string {
  // `new Date('YYYY-MM-DDTHH:MM')` interprets as local time
  return new Date(local).toISOString();
}

// ─── component ─────────────────────────────────────────────────────────

interface Props {
  symbol: string;
  accounts: AccountSummary[];
  /** Hint for cash-impact preview color. Optional — only used for the
   *  "estimated total" hero. */
  lastPrice?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TradeSheet({
  symbol,
  accounts,
  lastPrice,
  open,
  onOpenChange,
}: Props): React.ReactElement {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const defaultValues = useMemo<TradeFormValues>(
    () => ({
      kind: 'BUY',
      accountId: accounts[0]?.id ?? '',
      symbol,
      quantity: '',
      // Seed only — operator is expected to overwrite with the exact
      // fill price. The float→string boundary here is safe because
      // the value is a *default* the user re-types or accepts; no
      // downstream math is derived from it before Decimal re-parses it.
      price: lastPrice ? lastPrice.toFixed(2) : '',
      fees: '0',
      executedAt: nowLocalISO(),
      note: '',
    }),
    [accounts, symbol, lastPrice],
  );

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<TradeFormValues>({
    resolver: zodResolver(TradeFormSchema),
    defaultValues,
  });

  // Cancel / overlay-dismiss with confirm-if-dirty per
  // INTERACTION_SPEC §6 transactions.create "Cancel (TradeSheet)" row.
  function requestClose() {
    if (isDirty && typeof window !== 'undefined' && !window.confirm('Discard this trade?')) {
      return;
    }
    onOpenChange(false);
  }

  // Reset when the sheet re-opens (so a successful submit's prior
  // values don't linger).
  useEffect(() => {
    if (open) {
      reset(defaultValues);
      setServerError(null);
    }
  }, [open, reset, defaultValues]);

  // Live estimated-total updates as the operator types.
  const watched = watch(['kind', 'quantity', 'price', 'fees']);
  const estimated = useMemo(
    () =>
      computeEstimatedTotal({
        kind: watched[0],
        quantity: watched[1],
        price: watched[2],
        fees: watched[3],
      }),
    [watched],
  );

  async function onSubmit(values: TradeFormValues) {
    setServerError(null);
    try {
      const payload: TransactionInput = {
        accountId: values.accountId,
        symbol: values.symbol,
        kind: values.kind,
        quantity: values.quantity,
        price: values.price,
        fees: values.fees,
        executedAt: localToIso(values.executedAt),
        ...(values.note ? { note: values.note } : {}),
      };
      await createTransaction(payload);
      onOpenChange(false);
      // Server components on this page (Hero, future MyPosition card)
      // re-fetch on refresh — no TanStack cache to invalidate in M2.
      router.refresh();
    } catch (e) {
      const msg = e instanceof TransactionApiError ? e.message : 'Something went wrong. Try again.';
      setServerError(msg);
    }
  }

  const noAccounts = accounts.length === 0;

  return (
    <Drawer.Root
      open={open}
      onOpenChange={(next) => {
        // Vaul calls onOpenChange(false) on overlay-click + Escape;
        // intercept those through the same dirty-check the Cancel
        // button uses.
        if (!next) requestClose();
        else onOpenChange(true);
      }}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="bg-bg/70 fixed inset-0 z-40 backdrop-blur-sm" />
        <Drawer.Content
          aria-describedby={undefined}
          className="bg-surface-1 text-text hairline-top fixed inset-x-0 bottom-0 z-50 flex max-h-[92vh] flex-col rounded-t-2xl focus:outline-none"
        >
          <div className="bg-surface-3 mx-auto mt-2 h-1.5 w-10 rounded-full" />
          <div className="mx-auto w-full max-w-md px-4 pt-4 pb-6">
            <Drawer.Title className="t-h">Record a trade</Drawer.Title>
            <Drawer.Description className="sr-only">
              Enter the symbol, quantity, price, fees, and account for a buy or sell.
            </Drawer.Description>

            {/* Profile-attributed header (R-P3 minimal).
                TODO(M3): swap bg-mint for var(--p-N) of the cookie-
                resolved current profile when multi-profile UI lands. */}
            <div className="bg-surface-2 mt-3 mb-4 flex items-center gap-3 rounded-md px-3 py-2">
              <span aria-hidden className="bg-mint inline-block h-3 w-3 rounded-full" />
              <span className="t-meta">EDITING FOR</span>
              <span className="t-row font-semibold">Me</span>
            </div>

            {serverError && (
              <div role="alert" className="bg-down/15 t-aux text-down mb-3 rounded-md px-3 py-2">
                {serverError}
              </div>
            )}

            {noAccounts ? (
              <NoAccountsHint />
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                {/* BUY / SELL segmented */}
                <fieldset className="space-y-1.5">
                  <legend className="t-meta">Action</legend>
                  <div className="bg-surface-2 grid grid-cols-2 gap-2 rounded-md p-1">
                    {(['BUY', 'SELL'] as const).map((k) => (
                      <KindButton
                        key={k}
                        kind={k}
                        selected={watch('kind') === k}
                        onSelect={() => setValue('kind', k, { shouldDirty: true })}
                      />
                    ))}
                  </div>
                </fieldset>

                {/* Account select */}
                <FormRow label="Account" htmlFor="tx-account" error={errors.accountId?.message}>
                  <select
                    id="tx-account"
                    {...register('accountId')}
                    className="t-row bg-surface-2 text-text focus:ring-mint w-full rounded-md px-3 py-2.5 ring-1 ring-transparent transition outline-none"
                  >
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.broker ? `${a.broker} · ` : ''}
                        {a.name}
                        {a.last4 ? ` ····${a.last4}` : ''}
                      </option>
                    ))}
                  </select>
                </FormRow>

                {/* Symbol (read-only, pre-filled from page route) */}
                <FormRow label="Symbol" htmlFor="tx-symbol" error={errors.symbol?.message}>
                  <input
                    id="tx-symbol"
                    {...register('symbol')}
                    readOnly
                    className="t-row tabular bg-surface-3 text-text-2 w-full rounded-md px-3 py-2.5 ring-1 ring-transparent outline-none"
                  />
                </FormRow>

                {/* Quantity + Price side-by-side */}
                <div className="grid grid-cols-2 gap-3">
                  <FormRow label="Quantity" htmlFor="tx-qty" error={errors.quantity?.message}>
                    <input
                      id="tx-qty"
                      type="text"
                      inputMode="decimal"
                      autoComplete="off"
                      autoFocus
                      {...register('quantity')}
                      className="t-row tabular bg-surface-2 text-text focus:ring-mint w-full rounded-md px-3 py-2.5 ring-1 ring-transparent transition outline-none"
                      placeholder="0"
                    />
                  </FormRow>
                  <FormRow label="Price" htmlFor="tx-price" error={errors.price?.message}>
                    <input
                      id="tx-price"
                      type="text"
                      inputMode="decimal"
                      autoComplete="off"
                      {...register('price')}
                      className="t-row tabular bg-surface-2 text-text focus:ring-mint w-full rounded-md px-3 py-2.5 ring-1 ring-transparent transition outline-none"
                      placeholder="0.00"
                    />
                  </FormRow>
                </div>

                {/* Fees + Date side-by-side */}
                <div className="grid grid-cols-2 gap-3">
                  <FormRow label="Fees" htmlFor="tx-fees" error={errors.fees?.message}>
                    <input
                      id="tx-fees"
                      type="text"
                      inputMode="decimal"
                      autoComplete="off"
                      {...register('fees')}
                      className="t-row tabular bg-surface-2 text-text focus:ring-mint w-full rounded-md px-3 py-2.5 ring-1 ring-transparent transition outline-none"
                      placeholder="0"
                    />
                  </FormRow>
                  <FormRow label="Date" htmlFor="tx-date" error={errors.executedAt?.message}>
                    <input
                      id="tx-date"
                      type="datetime-local"
                      {...register('executedAt')}
                      className="t-row bg-surface-2 text-text focus:ring-mint w-full rounded-md px-3 py-2.5 ring-1 ring-transparent transition outline-none"
                    />
                  </FormRow>
                </div>

                {/* Note (optional) */}
                <FormRow label="Note (optional)" htmlFor="tx-note" error={errors.note?.message}>
                  <input
                    id="tx-note"
                    type="text"
                    maxLength={2000}
                    autoComplete="off"
                    {...register('note')}
                    className="t-row bg-surface-2 text-text focus:ring-mint w-full rounded-md px-3 py-2.5 ring-1 ring-transparent transition outline-none"
                    placeholder="Why this trade?"
                  />
                </FormRow>

                {/* Estimated total hero */}
                <div className="bg-surface-2 hairline-top rounded-md px-3 py-3">
                  <div className="t-meta text-text-3">Estimated cash impact</div>
                  <div
                    className={`tabular ${
                      estimated.isNegative()
                        ? 'text-down'
                        : estimated.isZero()
                          ? 'text-text-2'
                          : 'text-up'
                    } t-display-3`}
                  >
                    {formatCash(estimated)}
                  </div>
                </div>

                {/* Submit + Cancel */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={requestClose}
                    className="t-row bg-surface-2 text-text hover:bg-surface-3 w-full rounded-md px-3 py-2.5 font-semibold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="t-row bg-mint text-bg w-full rounded-md px-3 py-2.5 font-semibold transition hover:opacity-90 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Saving…' : 'Save trade'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

// ─── inner pieces ──────────────────────────────────────────────────────

function FormRow({
  label,
  htmlFor,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <div className="space-y-1">
      <label htmlFor={htmlFor} className="t-meta">
        {label}
      </label>
      {children}
      {error && (
        <p className="t-aux text-down" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function KindButton({
  kind,
  selected,
  onSelect,
}: {
  kind: 'BUY' | 'SELL';
  selected: boolean;
  onSelect: () => void;
}): React.ReactElement {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`t-row rounded-md py-2 font-semibold transition ${
        selected ? 'bg-mint text-bg' : 'text-text-2 hover:bg-surface-3'
      }`}
    >
      {kind === 'BUY' ? 'Buy' : 'Sell'}
    </button>
  );
}

function NoAccountsHint(): React.ReactElement {
  return (
    <div className="bg-surface-2 rounded-md px-4 py-4">
      <p className="t-row">You need to add an account first before recording a trade.</p>
      <a href="/settings/accounts/new" className="t-aux text-mint mt-3 inline-block underline">
        Add an account →
      </a>
    </div>
  );
}
