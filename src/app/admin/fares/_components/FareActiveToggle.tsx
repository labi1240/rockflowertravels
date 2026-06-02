'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { setFareActive } from '@/app/admin/_actions/fares';

export default function FareActiveToggle({ id, active }: { id: string; active: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function toggle() {
    setError(null);
    startTransition(async () => {
      const result = await setFareActive({ id, active: !active });
      if (result.ok) router.refresh();
      else setError(result.error);
    });
  }

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={toggle}
        disabled={pending}
        aria-pressed={active}
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 transition-colors disabled:opacity-50 ${
          active
            ? 'bg-emerald-100 text-emerald-800 ring-emerald-500/30 hover:bg-emerald-200'
            : 'bg-mist-100 text-mist-500 ring-mist-200 hover:bg-mist-200'
        }`}
      >
        <span className={`size-1.5 rounded-full ${active ? 'bg-emerald-500' : 'bg-mist-400'}`} />
        {pending ? '…' : active ? 'Active' : 'Hidden'}
      </button>
      {error && <span className="text-xs text-rose-700">{error}</span>}
    </div>
  );
}
