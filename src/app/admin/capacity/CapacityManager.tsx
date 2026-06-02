'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { setDepartureCapacity } from '@/app/admin/_actions/capacity';

type RouteOption = { slug: string; displayName: string };
export type CapacityRow = {
  id: string;
  routeSlug: string;
  routeName: string;
  serviceDateISO: string;
  departureTime: string;
  seatsBooked: number;
  seatsTotal: number;
};

const INPUT =
  'rounded-lg border border-mist-200 bg-mist-50 px-3 py-2 text-sm text-mist-900 focus:border-evergreen-800/40 focus:outline-none';

export default function CapacityManager({
  routes,
  rows,
  todayISO,
}: {
  routes: RouteOption[];
  rows: CapacityRow[];
  todayISO: string;
}) {
  return (
    <div className="space-y-6">
      <AddForm routes={routes} todayISO={todayISO} />

      <div className="overflow-hidden rounded-2xl border border-mist-200 bg-white shadow-[var(--shadow-card)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-mist-200 text-left text-xs font-semibold uppercase tracking-wider text-mist-500">
              <th className="px-4 py-3">Route</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Departure</th>
              <th className="px-4 py-3 text-right">Booked</th>
              <th className="px-4 py-3">Capacity</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-sm text-mist-500">
                  No departures yet. They appear here once booked, or add one above.
                </td>
              </tr>
            ) : (
              rows.map((r) => <Row key={r.id} row={r} />)
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Row({ row }: { row: CapacityRow }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [seats, setSeats] = useState(String(row.seatsTotal));
  const [error, setError] = useState<string | null>(null);
  const pct = row.seatsTotal > 0 ? Math.round((row.seatsBooked / row.seatsTotal) * 100) : 0;

  function save() {
    setError(null);
    start(async () => {
      const result = await setDepartureCapacity({
        routeSlug: row.routeSlug,
        serviceDate: row.serviceDateISO,
        departureTime: row.departureTime,
        seatsTotal: Number(seats),
      });
      if (result.ok) router.refresh();
      else setError(result.error);
    });
  }

  return (
    <tr className="border-b border-mist-100 last:border-0">
      <td className="px-4 py-3 text-mist-900">{row.routeName}</td>
      <td className="px-4 py-3 text-mist-700">{row.serviceDateISO}</td>
      <td className="px-4 py-3 text-mist-700">{row.departureTime}</td>
      <td className="px-4 py-3 text-right tabular-nums text-mist-700">
        {row.seatsBooked} <span className={pct >= 100 ? 'text-rose-600' : pct >= 80 ? 'text-amber-600' : 'text-mist-400'}>({pct}%)</span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="0"
            max="200"
            value={seats}
            onChange={(e) => setSeats(e.target.value)}
            className={`w-20 ${INPUT}`}
          />
          <button
            type="button"
            onClick={save}
            disabled={pending || seats === String(row.seatsTotal)}
            className="rounded-lg bg-evergreen-800 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-evergreen-900 disabled:opacity-40"
          >
            {pending ? '…' : 'Save'}
          </button>
        </div>
        {error && <p className="mt-1 text-xs text-rose-700">{error}</p>}
      </td>
    </tr>
  );
}

function AddForm({ routes, todayISO }: { routes: RouteOption[]; todayISO: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [routeSlug, setRouteSlug] = useState(routes[0]?.slug ?? '');
  const [date, setDate] = useState(todayISO);
  const [time, setTime] = useState('');
  const [seats, setSeats] = useState('25');
  const [error, setError] = useState<string | null>(null);

  function add() {
    setError(null);
    start(async () => {
      const result = await setDepartureCapacity({
        routeSlug,
        serviceDate: date,
        departureTime: time,
        seatsTotal: Number(seats),
      });
      if (result.ok) {
        setTime('');
        router.refresh();
      } else setError(result.error);
    });
  }

  return (
    <div className="rounded-2xl border border-mist-200 bg-white p-5 shadow-[var(--shadow-card)]">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-widest text-evergreen-700">
        Set / add departure capacity
      </h3>
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-mist-500">Route</span>
          <select value={routeSlug} onChange={(e) => setRouteSlug(e.target.value)} className={INPUT}>
            {routes.map((r) => (
              <option key={r.slug} value={r.slug}>{r.displayName}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-mist-500">Date</span>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={INPUT} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-mist-500">Departure time</span>
          <input value={time} onChange={(e) => setTime(e.target.value)} placeholder="7:00 AM" className={INPUT} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-mist-500">Seats</span>
          <input type="number" min="0" max="200" value={seats} onChange={(e) => setSeats(e.target.value)} className={`w-24 ${INPUT}`} />
        </label>
        <button
          type="button"
          onClick={add}
          disabled={pending}
          className="rounded-lg bg-evergreen-800 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-evergreen-900 disabled:opacity-60"
        >
          {pending ? 'Saving…' : 'Save'}
        </button>
      </div>
      <p className="mt-2 text-xs text-mist-500">
        Departure time must match the time riders book (e.g. &quot;7:00 AM&quot;). Unset departures default to 25 seats on first booking.
      </p>
      {error && <p className="mt-2 text-sm text-rose-700">{error}</p>}
    </div>
  );
}
