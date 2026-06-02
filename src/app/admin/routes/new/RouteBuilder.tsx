'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createRouteWithSchedule } from '@/app/admin/_actions/routes';

type StopOption = { id: string; code: string; name: string };

interface LegRow {
  rowId: string; // stable React key, decoupled from array index
  fromStopId: string;
  toStopId: string;
  depart: string; // "HH:mm"
  arrive: string;
  bookable: boolean;
  price: string; // dollars
}

interface FareRow {
  rowId: string; // stable React key, decoupled from array index
  id: string;
  label: string;
  short: string;
  origin: string;
  destination: string;
  price: string; // dollars
  toll: string;
  roundTrip: boolean;
  premium: boolean;
  defaultTime: string;
  note: string;
}

const INPUT =
  'w-full rounded-lg border border-mist-200 bg-mist-50 px-3 py-2 text-sm text-mist-900 focus:border-evergreen-800/40 focus:outline-none';
const LABEL = 'text-xs font-semibold uppercase tracking-wider text-mist-500';

const TIME_RE = /^\d{1,2}:\d{2}$/;
const timeToMin = (hhmm: string): number => {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
};
const toCents = (v: string): number => Math.round(parseFloat(v || '0') * 100);

const emptyLeg = (): LegRow => ({ rowId: crypto.randomUUID(), fromStopId: '', toStopId: '', depart: '', arrive: '', bookable: true, price: '' });
const emptyFare = (): FareRow => ({
  rowId: crypto.randomUUID(), id: '', label: '', short: '', origin: '', destination: '', price: '', toll: '0',
  roundTrip: false, premium: false, defaultTime: '', note: '',
});

export default function RouteBuilder({ stops }: { stops: StopOption[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [slug, setSlug] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [tier, setTier] = useState('daytime');
  const [isPremium, setIsPremium] = useState(false);
  const [description, setDescription] = useState('');
  const [templateLabel, setTemplateLabel] = useState('');
  const [legs, setLegs] = useState<LegRow[]>([emptyLeg()]);
  const [fares, setFares] = useState<FareRow[]>([emptyFare()]);

  function updateLeg(i: number, patch: Partial<LegRow>) {
    setLegs((prev) => prev.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  }
  function updateFare(i: number, patch: Partial<FareRow>) {
    setFares((prev) => prev.map((f, idx) => (idx === i ? { ...f, ...patch } : f)));
  }

  function submit() {
    setError(null);
    if (stops.length === 0) {
      setError('Add at least one stop before building a route.');
      return;
    }
    // Catch blank/partial times client-side so the server doesn't reject them with the
    // misleading "arrival must be after departure" (timeToMin would otherwise yield NaN).
    for (const [i, leg] of legs.entries()) {
      if (!TIME_RE.test(leg.depart) || !TIME_RE.test(leg.arrive)) {
        setError(`Leg ${i + 1}: set both departure and arrival times.`);
        return;
      }
    }
    start(async () => {
      const result = await createRouteWithSchedule({
        slug,
        displayName,
        tier,
        isPremium,
        description,
        templateLabel,
        legs: legs.map((l) => ({
          fromStopId: l.fromStopId,
          toStopId: l.toStopId,
          departMin: timeToMin(l.depart),
          arriveMin: timeToMin(l.arrive),
          bookable: l.bookable,
          priceCents: toCents(l.price),
        })),
        fares: fares.map((f) => ({
          id: f.id,
          label: f.label,
          short: f.short,
          origin: f.origin,
          destination: f.destination,
          priceCents: toCents(f.price),
          tollCents: toCents(f.toll),
          roundTrip: f.roundTrip,
          premium: f.premium,
          defaultTime: f.defaultTime,
          note: f.note || undefined,
        })),
      });
      if (result.ok) {
        router.push('/admin/routes');
        router.refresh();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* Route basics */}
      <section className="rounded-2xl border border-mist-200 bg-white p-4 shadow-[var(--shadow-card)] sm:p-6">
        <h3 className="mb-4 text-xs font-semibold uppercase tracking-widest text-evergreen-700">Route</h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className={LABEL}>Display name</span>
            <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Canmore Express" className={`mt-1 ${INPUT}`} />
          </label>
          <label className="block">
            <span className={LABEL}>Slug (kebab-case)</span>
            <input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="canmore-express" className={`mt-1 ${INPUT}`} />
          </label>
          <label className="block">
            <span className={LABEL}>Tier</span>
            <select value={tier} onChange={(e) => setTier(e.target.value)} className={`mt-1 ${INPUT}`}>
              <option value="sunrise">sunrise</option>
              <option value="daytime">daytime</option>
              <option value="evening">evening</option>
            </select>
          </label>
          <label className="flex items-center gap-2 pt-6">
            <input type="checkbox" checked={isPremium} onChange={(e) => setIsPremium(e.target.checked)} />
            <span className="text-sm text-mist-700">Premium route</span>
          </label>
          <label className="block sm:col-span-2">
            <span className={LABEL}>Description (optional)</span>
            <input value={description} onChange={(e) => setDescription(e.target.value)} className={`mt-1 ${INPUT}`} />
          </label>
          <label className="block sm:col-span-2">
            <span className={LABEL}>Schedule label</span>
            <input value={templateLabel} onChange={(e) => setTemplateLabel(e.target.value)} placeholder="Daily (08:00)" className={`mt-1 ${INPUT}`} />
          </label>
        </div>
      </section>

      {/* Legs */}
      <section className="rounded-2xl border border-mist-200 bg-white p-4 shadow-[var(--shadow-card)] sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-evergreen-700">Schedule legs</h3>
          <button type="button" onClick={() => setLegs((p) => [...p, emptyLeg()])} className="text-sm font-semibold text-evergreen-700 hover:text-sunrise-700">
            + Add leg
          </button>
        </div>
        {stops.length === 0 && (
          <p className="mb-3 text-sm text-amber-700">No stops yet — add one above first.</p>
        )}
        <div className="space-y-3">
          {legs.map((leg, i) => (
            <div key={leg.rowId} className="grid grid-cols-1 gap-2 rounded-xl border border-mist-200 p-3 sm:grid-cols-12">
              <select aria-label="Departure stop" value={leg.fromStopId} onChange={(e) => updateLeg(i, { fromStopId: e.target.value })} className={`sm:col-span-3 ${INPUT}`}>
                <option value="">From…</option>
                {stops.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <select aria-label="Arrival stop" value={leg.toStopId} onChange={(e) => updateLeg(i, { toStopId: e.target.value })} className={`sm:col-span-3 ${INPUT}`}>
                <option value="">To…</option>
                {stops.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
              <input aria-label="Departure time" type="time" value={leg.depart} onChange={(e) => updateLeg(i, { depart: e.target.value })} className={`sm:col-span-2 ${INPUT}`} />
              <input aria-label="Arrival time" type="time" value={leg.arrive} onChange={(e) => updateLeg(i, { arrive: e.target.value })} className={`sm:col-span-2 ${INPUT}`} />
              <input aria-label="Leg price" type="number" step="0.01" min="0" value={leg.price} onChange={(e) => updateLeg(i, { price: e.target.value })} placeholder="$" className={`sm:col-span-1 ${INPUT}`} />
              <div className="flex items-center justify-between gap-2 sm:col-span-1">
                <label className="flex items-center gap-1 text-xs text-mist-600" title="Bookable leg">
                  <input type="checkbox" checked={leg.bookable} onChange={(e) => updateLeg(i, { bookable: e.target.checked })} />
                  Book
                </label>
                {legs.length > 1 && (
                  <button type="button" onClick={() => setLegs((p) => p.filter((_, idx) => idx !== i))} className="text-mist-400 hover:text-rose-600" aria-label="Remove leg">×</button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Fares */}
      <section className="rounded-2xl border border-mist-200 bg-white p-4 shadow-[var(--shadow-card)] sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-evergreen-700">Bookable fares</h3>
          <button type="button" onClick={() => setFares((p) => [...p, emptyFare()])} className="text-sm font-semibold text-evergreen-700 hover:text-sunrise-700">
            + Add fare
          </button>
        </div>
        <div className="space-y-4">
          {fares.map((fare, i) => (
            <div key={fare.rowId} className="rounded-xl border border-mist-200 p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block"><span className={LABEL}>Fare id (kebab)</span>
                  <input value={fare.id} onChange={(e) => updateFare(i, { id: e.target.value })} placeholder="canmore-banff" className={`mt-1 ${INPUT}`} /></label>
                <label className="block"><span className={LABEL}>Default time</span>
                  <input value={fare.defaultTime} onChange={(e) => updateFare(i, { defaultTime: e.target.value })} placeholder="8:00 AM" className={`mt-1 ${INPUT}`} /></label>
                <label className="block"><span className={LABEL}>Label</span>
                  <input value={fare.label} onChange={(e) => updateFare(i, { label: e.target.value })} placeholder="Canmore → Banff" className={`mt-1 ${INPUT}`} /></label>
                <label className="block"><span className={LABEL}>Short label</span>
                  <input value={fare.short} onChange={(e) => updateFare(i, { short: e.target.value })} placeholder="Canmore → Banff" className={`mt-1 ${INPUT}`} /></label>
                <label className="block"><span className={LABEL}>Origin</span>
                  <input value={fare.origin} onChange={(e) => updateFare(i, { origin: e.target.value })} className={`mt-1 ${INPUT}`} /></label>
                <label className="block"><span className={LABEL}>Destination</span>
                  <input value={fare.destination} onChange={(e) => updateFare(i, { destination: e.target.value })} className={`mt-1 ${INPUT}`} /></label>
                <label className="block"><span className={LABEL}>Price (CAD)</span>
                  <input type="number" step="0.01" min="0" value={fare.price} onChange={(e) => updateFare(i, { price: e.target.value })} className={`mt-1 ${INPUT}`} /></label>
                <label className="block"><span className={LABEL}>Toll / passenger (CAD)</span>
                  <input type="number" step="0.01" min="0" value={fare.toll} onChange={(e) => updateFare(i, { toll: e.target.value })} className={`mt-1 ${INPUT}`} /></label>
                <label className="block sm:col-span-2"><span className={LABEL}>Note (optional)</span>
                  <input value={fare.note} onChange={(e) => updateFare(i, { note: e.target.value })} className={`mt-1 ${INPUT}`} /></label>
              </div>
              <div className="mt-3 flex items-center gap-5">
                <label className="flex items-center gap-2 text-sm text-mist-700">
                  <input type="checkbox" checked={fare.roundTrip} onChange={(e) => updateFare(i, { roundTrip: e.target.checked })} /> Round trip
                </label>
                <label className="flex items-center gap-2 text-sm text-mist-700">
                  <input type="checkbox" checked={fare.premium} onChange={(e) => updateFare(i, { premium: e.target.checked })} /> Premium
                </label>
                {fares.length > 1 && (
                  <button type="button" onClick={() => setFares((p) => p.filter((_, idx) => idx !== i))} className="ml-auto text-sm text-mist-400 hover:text-rose-600">
                    Remove fare
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {error && <p className="text-sm font-medium text-rose-700">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={submit}
          disabled={pending}
          className="rounded-full bg-evergreen-800 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-evergreen-900 disabled:opacity-60"
        >
          {pending ? 'Creating…' : 'Create route'}
        </button>
        <span className="text-xs text-mist-500">
          New routes sell immediately via checkout. Live seat inventory is not tracked yet.
        </span>
      </div>
    </div>
  );
}
