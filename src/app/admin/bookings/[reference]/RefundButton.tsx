'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { refundBooking } from '@/app/admin/_actions/refunds';

export default function RefundButton({
  bookingId,
  totalLabel,
}: {
  bookingId: string;
  totalLabel: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function submit() {
    setError(null);
    startTransition(async () => {
      const result = await refundBooking({ bookingId, reason });
      if (result.ok) {
        setDone(true);
        setOpen(false);
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  if (done) {
    return (
      <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800 ring-1 ring-amber-500/30">
        Refund initiated. The booking will show as refunded once Stripe confirms (usually a few
        seconds).
      </p>
    );
  }

  if (!open) {
    return (
      <div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="rounded-full border border-rose-500/40 px-5 py-2.5 text-sm font-semibold text-rose-700 transition-colors hover:bg-rose-50"
        >
          Issue refund
        </button>
        {error && <p className="mt-2 text-sm text-rose-700">{error}</p>}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-rose-500/30 bg-rose-50/60 p-5">
      <p className="font-display text-base font-semibold text-mist-900">Refund {totalLabel}?</p>
      <p className="mt-1 text-sm text-mist-700">
        This refunds the full charge via Stripe and cannot be undone. The rider will be notified by
        Stripe.
      </p>
      <label className="mt-3 block">
        <span className="text-xs font-semibold uppercase tracking-wider text-mist-500">
          Reason (optional)
        </span>
        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. customer cancellation"
          className="mt-1 w-full rounded-lg border border-mist-200 bg-white px-3 py-2 text-sm text-mist-900 focus:border-evergreen-800/40 focus:outline-none"
        />
      </label>
      {error && <p className="mt-2 text-sm text-rose-700">{error}</p>}
      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={submit}
          disabled={pending}
          className="rounded-full bg-rose-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-rose-700 disabled:opacity-60"
        >
          {pending ? 'Refunding…' : 'Confirm refund'}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          disabled={pending}
          className="text-sm font-semibold text-mist-500 hover:text-mist-900 disabled:opacity-60"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
