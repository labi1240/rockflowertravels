'use client';

import React, { useState, useEffect } from 'react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRoute: string;
}

type RouteId = 'sunrise-express' | 'daytime-circuit' | 'evening-return';

const ROUTE_META: Record<RouteId, { name: string; price: number; defaultTime: string }> = {
  'sunrise-express': { name: 'Sunrise Express (Premium)',     price: 45, defaultTime: '4:30 AM (Banff → Moraine)' },
  'daytime-circuit': { name: 'Daytime Repeating Circuit',     price: 25, defaultTime: '7:00 AM' },
  'evening-return':  { name: 'Evening Return (Banff bound)',  price: 20, defaultTime: '6:00 PM (Lakeshore → Banff)' },
};

const TIME_OPTIONS: Record<RouteId, { value: string; label: string }[]> = {
  'sunrise-express': [
    { value: '4:30 AM (Banff → Moraine)', label: '4:30 AM — Banff → Moraine Lake' },
  ],
  'evening-return': [
    { value: '6:00 PM (Lakeshore → Banff)', label: '6:00 PM — Lake Louise Lakeshore → Banff' },
  ],
  'daytime-circuit': [
    { value: '7:00 AM',  label: '7:00 AM (Circuit 1 — Samson Mall)'   },
    { value: '7:15 AM',  label: '7:15 AM (Circuit 1 — LL Lakeshore)'  },
    { value: '7:40 AM',  label: '7:40 AM (Circuit 1 — Moraine Lake)'  },
    { value: '9:00 AM',  label: '9:00 AM (Circuit 2 — Samson Mall)'   },
    { value: '9:15 AM',  label: '9:15 AM (Circuit 2 — LL Lakeshore)'  },
    { value: '9:40 AM',  label: '9:40 AM (Circuit 2 — Moraine Lake)'  },
    { value: '11:00 AM', label: '11:00 AM (Circuit 3 — Samson Mall)'  },
    { value: '11:15 AM', label: '11:15 AM (Circuit 3 — LL Lakeshore)' },
    { value: '11:40 AM', label: '11:40 AM (Circuit 3 — Moraine Lake)' },
    { value: '1:30 PM',  label: '1:30 PM (Circuit 4 — Samson Mall)'   },
    { value: '1:45 PM',  label: '1:45 PM (Circuit 4 — LL Lakeshore)'  },
    { value: '2:10 PM',  label: '2:10 PM (Circuit 4 — Moraine Lake)'  },
    { value: '3:30 PM',  label: '3:30 PM (Circuit 5 — Samson Mall)'   },
    { value: '3:45 PM',  label: '3:45 PM (Circuit 5 — LL Lakeshore)'  },
    { value: '4:10 PM',  label: '4:10 PM (Circuit 5 — Moraine Lake)'  },
  ],
};

export default function BookingModal({ isOpen, onClose, initialRoute }: BookingModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [route, setRoute] = useState<RouteId>('daytime-circuit');
  const [time, setTime] = useState<string>('');
  const [date, setDate] = useState<string>('2026-05-21');
  const [passengers, setPassengers] = useState<number>(1);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [ticketRef, setTicketRef] = useState<string>('');

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (initialRoute && initialRoute in ROUTE_META) {
      const r = initialRoute as RouteId;
      setRoute(r);
      setTime(ROUTE_META[r].defaultTime);
    }
  }, [initialRoute, isOpen]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const meta = ROUTE_META[route];
  const subtotal = meta.price * passengers;
  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) setStep(2);
    else if (step === 2) {
      if (!name || !email || !phone) {
        alert('Please fill out all contact fields.');
        return;
      }
      setTicketRef(generateTicketRef());
      setStep(3);
    }
  };

  const handleClose = () => {
    setStep(1); setName(''); setEmail(''); setPhone('');
    onClose();
  };

  const handleRouteChange = (next: RouteId) => {
    setRoute(next);
    setTime(ROUTE_META[next].defaultTime);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-evergreen-950/80 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-[var(--shadow-elevated)] animate-fade-in dark:bg-evergreen-900 dark:ring-1 dark:ring-evergreen-700/60">
        <button
          aria-label="Close"
          onClick={handleClose}
          className="absolute right-4 top-4 grid size-8 place-items-center rounded-full text-mist-400 transition hover:bg-mist-100 hover:text-mist-900 dark:hover:bg-evergreen-800 dark:hover:text-white"
        >
          ×
        </button>

        {step < 3 && <StepIndicator step={step as 1 | 2} />}

        <div className="px-6 pb-6 sm:px-8 sm:pb-8">
          {step === 1 && (
            <form onSubmit={handleNext} className="space-y-5">
              <header className="text-center">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-evergreen-500 dark:text-sunrise-400">
                  Step 1 of 2
                </p>
                <h2 className="mt-1 font-display text-2xl font-extrabold text-mist-900 dark:text-white">
                  Configure your shuttle
                </h2>
              </header>

              <Field label="Service" htmlFor="modal-route">
                <Select id="modal-route" value={route} onChange={(v) => handleRouteChange(v as RouteId)}>
                  <option value="sunrise-express">Sunrise Express (Premium) — $45</option>
                  <option value="daytime-circuit">Daytime Repeating Circuit — $25</option>
                  <option value="evening-return">Evening Return — $20</option>
                </Select>
              </Field>

              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <Field label="Travel date" htmlFor="modal-date">
                  <input
                    type="date"
                    id="modal-date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    min="2026-05-03"
                    className={INPUT_CLASS}
                  />
                </Field>
                <Field label="Passengers" htmlFor="modal-pax">
                  <Select id="modal-pax" value={String(passengers)} onChange={(v) => setPassengers(parseInt(v))}>
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                      <option key={n} value={n}>{n} {n === 1 ? 'passenger' : 'passengers'}</option>
                    ))}
                  </Select>
                </Field>
              </div>

              <Field label="Departure time" htmlFor="modal-time">
                <Select id="modal-time" value={time} onChange={setTime}>
                  {TIME_OPTIONS[route].map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </Select>
              </Field>

              <div className="rounded-xl border border-mist-200 bg-mist-50 p-4 dark:border-evergreen-700/40 dark:bg-evergreen-950/40">
                <SummaryRow label={`Fare × ${passengers}`} value={`$${subtotal.toFixed(2)}`} />
                <SummaryRow label="Alberta GST (5%)" value={`$${tax.toFixed(2)}`} />
                <div className="mt-2 flex items-center justify-between border-t border-mist-200 pt-2 dark:border-evergreen-700/40">
                  <span className="font-display text-sm font-bold text-mist-900 dark:text-white">Total</span>
                  <span className="font-display text-lg font-extrabold text-evergreen-700 tabular-nums dark:text-sunrise-400">
                    ${total.toFixed(2)} CAD
                  </span>
                </div>
              </div>

              <button type="submit" className={CTA_CLASS}>
                Continue
                <span aria-hidden>→</span>
              </button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleNext} className="space-y-5">
              <header className="text-center">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-evergreen-500 dark:text-sunrise-400">
                  Step 2 of 2
                </p>
                <h2 className="mt-1 font-display text-2xl font-extrabold text-mist-900 dark:text-white">
                  Who's travelling?
                </h2>
              </header>

              <Field label="Primary passenger" htmlFor="modal-name">
                <input
                  type="text"
                  id="modal-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Full name"
                  className={INPUT_CLASS}
                  required
                />
              </Field>

              <Field label="Email" htmlFor="modal-email">
                <input
                  type="email"
                  id="modal-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={INPUT_CLASS}
                  required
                />
              </Field>

              <Field label="Mobile (for delay alerts)" htmlFor="modal-phone">
                <input
                  type="tel"
                  id="modal-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (403) 555-0100"
                  className={INPUT_CLASS}
                  required
                />
              </Field>

              <div className="flex gap-3 rounded-xl border border-sunrise-200 bg-sunrise-50 p-4 dark:border-sunrise-500/30 dark:bg-sunrise-500/10">
                <span aria-hidden className="text-base">⚠️</span>
                <p className="text-xs leading-relaxed text-sunrise-900 dark:text-sunrise-200">
                  Buses depart strictly on schedule. Arrive at your loading area 10 minutes early.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="rounded-xl border border-mist-200 px-4 py-3 text-sm font-semibold text-mist-700 transition hover:bg-mist-50 dark:border-evergreen-700/60 dark:text-mist-200 dark:hover:bg-evergreen-800"
                >
                  Back
                </button>
                <button type="submit" className={`${CTA_CLASS} flex-1`}>
                  Confirm & generate ticket
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <div className="animate-fade-in space-y-6">
              <header className="flex flex-col items-center gap-3 text-center">
                <span className="grid size-12 place-items-center rounded-full bg-evergreen-100 text-2xl text-evergreen-700 dark:bg-evergreen-500/15 dark:text-evergreen-300">
                  ✓
                </span>
                <h2 className="font-display text-2xl font-extrabold text-mist-900 dark:text-white">
                  Reservation confirmed
                </h2>
                <p className="text-sm text-mist-500 dark:text-mist-300">
                  Confirmation sent to <strong className="text-mist-900 dark:text-white">{email}</strong>.
                </p>
              </header>

              <BoardingPass
                name={name}
                routeName={meta.name}
                date={date}
                time={time}
                passengers={passengers}
                ticketRef={ticketRef}
              />

              <button
                onClick={handleClose}
                className="w-full rounded-xl border border-mist-200 px-4 py-3 text-sm font-semibold text-mist-700 transition hover:bg-mist-50 dark:border-evergreen-700/60 dark:text-mist-200 dark:hover:bg-evergreen-800"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const INPUT_CLASS =
  'w-full rounded-xl border border-mist-200 bg-white px-4 py-3 text-sm font-medium text-mist-900 outline-none transition focus:border-evergreen-500 focus:ring-2 focus:ring-evergreen-500/20 dark:border-evergreen-700/60 dark:bg-evergreen-950/60 dark:text-white dark:focus:border-sunrise-400 dark:focus:ring-sunrise-400/20';

const CTA_CLASS =
  'inline-flex w-full items-center justify-center gap-2 rounded-xl bg-evergreen-800 px-5 py-3.5 font-display text-sm font-bold text-white shadow-[var(--shadow-card)] transition hover:bg-evergreen-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-sunrise-400/40 dark:bg-sunrise-500 dark:text-evergreen-950 dark:hover:bg-sunrise-400';

function StepIndicator({ step }: { step: 1 | 2 }) {
  return (
    <div className="border-b border-mist-200 bg-mist-50 px-6 py-4 dark:border-evergreen-700/40 dark:bg-evergreen-950/40">
      <div className="mx-auto flex max-w-xs items-center gap-3">
        <Step n={1} label="Route" active={step >= 1} />
        <div className={`h-0.5 flex-1 rounded-full ${step >= 2 ? 'bg-evergreen-700 dark:bg-sunrise-400' : 'bg-mist-200 dark:bg-evergreen-700/40'}`} />
        <Step n={2} label="Contact" active={step >= 2} />
      </div>
    </div>
  );
}

function Step({ n, label, active }: { n: number; label: string; active: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`grid size-6 place-items-center rounded-full text-[11px] font-bold ${
          active
            ? 'bg-evergreen-700 text-white dark:bg-sunrise-400 dark:text-evergreen-950'
            : 'bg-mist-200 text-mist-500 dark:bg-evergreen-700/40 dark:text-mist-400'
        }`}
      >
        {n}
      </span>
      <span className="text-xs font-semibold text-mist-700 dark:text-mist-200">{label}</span>
    </div>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-mist-500 dark:text-mist-400">
        {label}
      </label>
      {children}
    </div>
  );
}

function Select({ id, value, onChange, children }: { id: string; value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={INPUT_CLASS}>
      {children}
    </select>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-mist-500 dark:text-mist-300">{label}</span>
      <span className="font-medium text-mist-900 tabular-nums dark:text-white">{value}</span>
    </div>
  );
}

function BoardingPass({
  name, routeName, date, time, passengers, ticketRef,
}: {
  name: string;
  routeName: string;
  date: string;
  time: string;
  passengers: number;
  ticketRef: string;
}) {
  return (
    <div className="overflow-hidden rounded-2xl bg-evergreen-900 text-white ring-1 ring-evergreen-700/60">
      <div className="flex items-center justify-between border-b border-evergreen-700/60 bg-evergreen-950 px-5 py-3">
        <span className="font-display text-xs font-bold uppercase tracking-[0.14em] text-sunrise-300">
          🌸 RockFlower Travels
        </span>
        <span className="rounded-full bg-sunrise-500/15 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-sunrise-300 ring-1 ring-sunrise-500/30">
          Boarding pass
        </span>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-4 p-5">
        <PassField label="Passenger" value={name} />
        <PassField label="Route"     value={routeName} />
        <PassField label="Date"      value={date} />
        <PassField label="Departs"   value={time} highlight />
        <PassField label="Pax"       value={`${passengers}`} />
        <PassField label="Ref"       value={ticketRef} mono highlight />
      </div>

      <div className="border-t border-evergreen-700/60 bg-evergreen-950/60 p-5">
        <p className="text-xs leading-relaxed text-mist-300">
          Arrive <strong className="text-white">10 minutes</strong> before departure and present this pass to the driver.
        </p>
        <div className="mt-4 rounded-lg bg-white p-3">
          <div className="flex h-8 items-stretch gap-[1px]">
            {Array.from({ length: 48 }).map((_, i) => (
              <span
                key={i}
                className="bg-mist-900"
                style={{
                  width: `${i % 3 === 0 ? 3 : i % 2 === 0 ? 1 : 2}px`,
                  opacity: i % 7 === 0 ? 0.3 : 1,
                }}
              />
            ))}
          </div>
          <p className="mt-2 text-center font-mono text-[10px] font-semibold tracking-[0.18em] text-mist-700">
            {ticketRef}
          </p>
        </div>
      </div>
    </div>
  );
}

function PassField({
  label, value, highlight = false, mono = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-mist-400">{label}</p>
      <p
        className={`mt-0.5 text-sm ${highlight ? 'font-display font-bold text-sunrise-300' : 'font-medium text-white'} ${
          mono ? 'font-mono' : ''
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function generateTicketRef(): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const randLetters = Array.from({ length: 3 }, () => letters[Math.floor(Math.random() * 26)]).join('');
  const randNums = Math.floor(1000 + Math.random() * 9000);
  return `RF-${randLetters}-${randNums}`;
}
