'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createStop } from '@/app/admin/_actions/routes';

const INPUT =
  'rounded-lg border border-mist-200 bg-mist-50 px-3 py-2 text-sm text-mist-900 focus:border-evergreen-800/40 focus:outline-none';

export default function AddStopForm() {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  function submit() {
    setError(null);
    start(async () => {
      const result = await createStop({ code, name });
      if (result.ok) {
        setCode('');
        setName('');
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div className="flex flex-wrap items-end gap-2">
      <label className="flex flex-col gap-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-mist-500">Code</span>
        <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="CANMORE" className={INPUT} />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-xs font-semibold uppercase tracking-wider text-mist-500">Name</span>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Canmore" className={INPUT} />
      </label>
      <button
        type="button"
        onClick={submit}
        disabled={pending}
        className="rounded-lg border border-mist-200 px-4 py-2 text-sm font-semibold text-evergreen-800 transition-colors hover:bg-mist-100 disabled:opacity-60"
      >
        {pending ? 'Adding…' : 'Add stop'}
      </button>
      {error && <p className="w-full text-sm text-rose-700">{error}</p>}
    </div>
  );
}
