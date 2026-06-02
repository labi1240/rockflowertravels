'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { setFareActive } from '@/app/admin/_actions/fares';

export default function FareActiveToggle({ id, active }: { id: string; active: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function toggle() {
    startTransition(async () => {
      const result = await setFareActive({ id, active: !active });
      if (result.ok) router.refresh();
    });
  }

  return (
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
  );
}
