'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Elements, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import type { StripeElementsOptions } from '@stripe/stripe-js';
import { getStripe } from '@/lib/stripe-client';
import { useBookingModal } from '@/store/booking-modal';

type RouteId = 'sunrise-express' | 'daytime-circuit' | 'evening-return';

const ROUTE_META: Record<RouteId, { name: string; price: number; defaultTime: string }> = {
  'sunrise-express': { name: 'Sunrise Express (Premium)',     price: 64.99, defaultTime: '4:30 AM (Banff → Moraine)' },
  'daytime-circuit': { name: 'Daytime Repeating Circuit',     price: 64.99, defaultTime: '7:00 AM' },
  'evening-return':  { name: 'Evening Return (Banff bound)',  price: 64.99, defaultTime: '6:00 PM (Lakeshore → Banff)' },
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

type Step = 1 | 2 | 3 | 4;

export default function BookingModal() {
  const isOpen = useBookingModal((s) => s.isOpen);
  const initialRoute = useBookingModal((s) => s.initialRoute);
  const initialDate = useBookingModal((s) => s.initialDate);
  const initialPassengers = useBookingModal((s) => s.initialPassengers);
  const closeModal = useBookingModal((s) => s.close);

  const [step, setStep] = useState<Step>(1);
  const [route, setRoute] = useState<RouteId>('daytime-circuit');
  const [time, setTime] = useState<string>('');
  const [date, setDate] = useState<string>('2026-05-21');
  const [passengers, setPassengers] = useState<number>(1);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [ticketRef, setTicketRef] = useState<string>('');
  const [clientSecret, setClientSecret] = useState<string>('');
  const [holdExpiresAt, setHoldExpiresAt] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string>('');

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!isOpen) return;
    if (initialRoute in ROUTE_META) {
      setRoute(initialRoute);
      setTime(ROUTE_META[initialRoute].defaultTime);
    }
    if (initialDate) setDate(initialDate);
    if (typeof initialPassengers === 'number' && initialPassengers >= 1 && initialPassengers <= 8) {
      setPassengers(initialPassengers);
    }
  }, [initialRoute, initialDate, initialPassengers, isOpen]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const meta = ROUTE_META[route];
  const subtotal = meta.price * passengers;
  const tax = subtotal * 0.05;
  const total = subtotal + tax;

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone) {
      setSubmitError('Please fill out all contact fields.');
      return;
    }
    setSubmitting(true);
    setSubmitError('');

    try {
      const res = await fetch('/api/checkout/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ route, date, time, passengers, name, email, phone }),
      });
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: 'Payment setup failed' }));
        throw new Error(error || 'Payment setup failed');
      }
      const data = await res.json() as { clientSecret: string; reference: string; holdExpiresAt: string };
      setClientSecret(data.clientSecret);
      setTicketRef(data.reference);
      setHoldExpiresAt(data.holdExpiresAt);
      setStep(3);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Could not start payment');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaymentSuccess = () => {
    setStep(4);
  };

  const handleClose = () => {
    setStep(1); setName(''); setEmail(''); setPhone('');
    setClientSecret(''); setTicketRef(''); setHoldExpiresAt(''); setSubmitError('');
    closeModal();
  };

  const handleRouteChange = (next: RouteId) => {
    setRoute(next);
    setTime(ROUTE_META[next].defaultTime);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-evergreen-950/85 p-4 backdrop-blur-sm sm:items-center" role="dialog" aria-modal="true">
      <div className="relative my-8 w-full max-w-4xl overflow-hidden rounded-3xl bg-white shadow-[var(--shadow-elevated)] animate-fade-in dark:bg-evergreen-900 dark:ring-1 dark:ring-evergreen-700/60">
        <button
          aria-label="Close"
          onClick={handleClose}
          className="absolute right-4 top-4 z-10 grid size-9 place-items-center rounded-full bg-white/90 text-mist-500 shadow-sm backdrop-blur transition hover:bg-white hover:text-mist-900 dark:bg-evergreen-800/80 dark:text-mist-300 dark:hover:bg-evergreen-700 dark:hover:text-white"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="size-4"><path d="M6 6l12 12M18 6 6 18" /></svg>
        </button>

        {step < 4 ? (
          <div className="grid grid-cols-1 lg:grid-cols-[1.35fr_1fr]">
            {/* Form column */}
            <div className="bg-white dark:bg-evergreen-900">
              <StepIndicator step={step as 1 | 2 | 3} />

              <div className="p-6 sm:p-9">
                {step === 1 && (
                  <form onSubmit={handleStep1Submit} className="space-y-6">
                    <header>
                      <h2 className="font-display text-2xl font-extrabold tracking-tight text-mist-900 dark:text-white sm:text-3xl">
                        Configure your shuttle
                      </h2>
                      <p className="mt-1.5 text-sm text-mist-500 dark:text-mist-400">
                        Pick your service, departure and party size.
                      </p>
                    </header>

                    <Field label="Service" htmlFor="modal-route">
                      <Select id="modal-route" value={route} onChange={(v) => handleRouteChange(v as RouteId)}>
                        <option value="sunrise-express">Sunrise Express (Premium) — $64.99</option>
                        <option value="daytime-circuit">Daytime Repeating Circuit — $64.99</option>
                        <option value="evening-return">Evening Return — $64.99</option>
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

                    <button type="submit" className={CTA_CLASS}>
                      Continue to contact
                      <span aria-hidden>→</span>
                    </button>
                  </form>
                )}

                {step === 2 && (
                  <form onSubmit={handleStep2Submit} className="space-y-6">
                    <header>
                      <h2 className="font-display text-2xl font-extrabold tracking-tight text-mist-900 dark:text-white sm:text-3xl">
                        Who&apos;s travelling?
                      </h2>
                      <p className="mt-1.5 text-sm text-mist-500 dark:text-mist-400">
                        We&apos;ll send your ticket and any delay alerts here.
                      </p>
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

                    <div className="flex items-start gap-3 rounded-xl border-l-4 border-l-evergreen-500 bg-mist-50/80 p-4 dark:bg-evergreen-950/40">
                      <span aria-hidden className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-full bg-evergreen-100 text-evergreen-700 dark:bg-evergreen-700/40 dark:text-evergreen-200">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
                      </span>
                      <p className="text-xs leading-relaxed text-mist-600 dark:text-mist-300">
                        Buses depart strictly on schedule. Arrive at your loading area
                        <strong className="text-mist-900 dark:text-white"> 10 minutes early</strong>.
                      </p>
                    </div>

                    {submitError && (
                      <p role="alert" className="text-sm font-medium text-red-600 dark:text-red-400">
                        {submitError}
                      </p>
                    )}

                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setStep(1)}
                        className="rounded-xl px-4 py-3 text-sm font-semibold text-mist-500 transition hover:text-mist-900 dark:text-mist-300 dark:hover:text-white"
                      >
                        ← Back
                      </button>
                      <button
                        type="submit"
                        disabled={submitting}
                        className={`${CTA_CLASS} flex-1 disabled:cursor-wait disabled:opacity-70`}
                      >
                        {submitting ? 'Preparing payment…' : 'Continue to payment →'}
                      </button>
                    </div>
                  </form>
                )}

                {step === 3 && clientSecret && (
                  <PaymentStep
                    clientSecret={clientSecret}
                    total={total}
                    email={email}
                    holdExpiresAt={holdExpiresAt}
                    onSuccess={handlePaymentSuccess}
                    onCancel={handleClose}
                    onExpire={() => { setStep(2); setClientSecret(''); setHoldExpiresAt(''); setSubmitError('Your reservation hold expired. Please try again.'); }}
                  />
                )}
              </div>
            </div>

            {/* Trip summary column */}
            <TripSummary
              routeName={meta.name}
              routePrice={meta.price}
              date={date}
              time={time}
              passengers={passengers}
              subtotal={subtotal}
              tax={tax}
              total={total}
            />
          </div>
        ) : (
          <div className="animate-fade-in p-6 sm:p-10">
            <header className="flex flex-col items-center gap-3 text-center">
              <span
                className="relative grid size-14 place-items-center rounded-full bg-evergreen-700 text-white shadow-[0_0_0_8px_hsl(168_55%_16%/0.08)] dark:bg-sunrise-500 dark:text-evergreen-950"
                aria-hidden
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="size-7">
                  <path d="m5 12 4.5 4.5L19 7" />
                </svg>
              </span>
              <h2 className="font-display text-2xl font-extrabold tracking-tight text-mist-900 dark:text-white sm:text-3xl">
                Reservation confirmed
              </h2>
              <p className="text-sm text-mist-500 dark:text-mist-300">
                Confirmation sent to <strong className="text-mist-900 dark:text-white">{email}</strong>
              </p>
            </header>

            <div className="mx-auto mt-7 max-w-md">
              <BoardingPass
                name={name}
                routeName={meta.name}
                date={date}
                time={time}
                passengers={passengers}
                ticketRef={ticketRef}
                total={total}
              />

              <button onClick={handleClose} className={`${CTA_CLASS} mt-6`}>
                Done — close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const INPUT_CLASS =
  'w-full rounded-xl border border-mist-200 bg-white px-4 py-3.5 text-sm font-medium text-mist-900 outline-none transition placeholder:text-mist-400 focus:border-evergreen-500 focus:ring-4 focus:ring-evergreen-500/15 dark:border-evergreen-700/60 dark:bg-evergreen-950/60 dark:text-white dark:focus:border-sunrise-400 dark:focus:ring-sunrise-400/20';

const CTA_CLASS =
  'inline-flex w-full items-center justify-center gap-2 rounded-xl bg-sunrise-500 px-5 py-4 font-display text-sm font-bold text-evergreen-950 shadow-[var(--shadow-glow-sunrise)] transition hover:bg-sunrise-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-sunrise-300 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-evergreen-900';

function StepIndicator({ step }: { step: 1 | 2 | 3 }) {
  return (
    <div className="border-b border-mist-200 px-6 py-4 sm:px-9 dark:border-evergreen-700/40">
      <div className="flex items-center gap-3">
        <Step n={1} label="Route"   active={step >= 1} />
        <div className={`h-0.5 flex-1 rounded-full ${step >= 2 ? 'bg-evergreen-700 dark:bg-sunrise-400' : 'bg-mist-200 dark:bg-evergreen-700/40'}`} />
        <Step n={2} label="Contact" active={step >= 2} />
        <div className={`h-0.5 flex-1 rounded-full ${step >= 3 ? 'bg-evergreen-700 dark:bg-sunrise-400' : 'bg-mist-200 dark:bg-evergreen-700/40'}`} />
        <Step n={3} label="Pay"     active={step >= 3} />
      </div>
    </div>
  );
}

function TripSummary({
  routeName, routePrice, date, time, passengers, subtotal, tax, total,
}: {
  routeName: string;
  routePrice: number;
  date: string;
  time: string;
  passengers: number;
  subtotal: number;
  tax: number;
  total: number;
}) {
  return (
    <aside className="relative flex flex-col justify-between gap-8 overflow-hidden bg-evergreen-950 p-6 text-white sm:p-9">
      {/* Subtle decorative ridge */}
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-40 [background:radial-gradient(circle_at_top_right,hsl(41_78%_50%/0.18),transparent_55%)]" />

      <div className="relative space-y-6">
        <div className="flex items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 font-display text-xs font-bold uppercase tracking-[0.18em] text-white">
            <span aria-hidden>🌸</span> Your trip
          </span>
          <span className="rounded-full bg-sunrise-500/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-sunrise-300 ring-1 ring-sunrise-500/30">
            Live preview
          </span>
        </div>

        <div>
          <p className="font-display text-xl font-extrabold leading-tight tracking-tight text-white">{routeName}</p>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-mist-400">Service</p>
        </div>

        <div className="grid grid-cols-2 gap-x-4 gap-y-5">
          <SummaryCell label="Date" value={date} />
          <SummaryCell label="Departs" value={time || '—'} highlight />
          <SummaryCell label="Passengers" value={`${passengers}`} />
          <SummaryCell label="Per seat" value={`$${routePrice.toFixed(2)}`} />
        </div>

        <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
          <div className="flex items-center justify-between text-xs text-mist-300">
            <span>Fare × {passengers}</span>
            <span className="tabular-nums">${subtotal.toFixed(2)}</span>
          </div>
          <div className="mt-1.5 flex items-center justify-between text-xs text-mist-300">
            <span>Alberta GST (5%)</span>
            <span className="tabular-nums">${tax.toFixed(2)}</span>
          </div>
          <div className="mt-3 border-t border-white/10 pt-3">
            <div className="flex items-end justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-mist-400">
                Total · CAD
              </span>
              <span className="font-display text-3xl font-extrabold tabular-nums text-white sm:text-[2rem]">
                ${total.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <ul className="relative space-y-2.5 text-xs text-mist-300">
        <TrustItem>Secure payment via Stripe · 128-bit SSL</TrustItem>
        <TrustItem>Free cancellation up to 24h before departure</TrustItem>
        <TrustItem>Confirmation by email and SMS</TrustItem>
      </ul>
    </aside>
  );
}

function SummaryCell({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <p className={`font-display text-sm font-bold leading-snug ${highlight ? 'text-sunrise-300' : 'text-white'}`}>{value}</p>
      <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-mist-400">{label}</p>
    </div>
  );
}

function TrustItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5">
      <span aria-hidden className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-sunrise-500/15 text-sunrise-400">
        <svg viewBox="0 0 16 16" fill="currentColor" className="size-2.5"><path d="M13 4.5 6 11.5 3 8.5l1-1L6 9.5l6-6z" /></svg>
      </span>
      <span className="leading-relaxed">{children}</span>
    </li>
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
      <label htmlFor={htmlFor} className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-mist-500 dark:text-mist-400">
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

function BoardingPass({
  name, routeName, date, time, passengers, ticketRef, total,
}: {
  name: string;
  routeName: string;
  date: string;
  time: string;
  passengers: number;
  ticketRef: string;
  total: number;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-evergreen-900 text-white shadow-[var(--shadow-elevated)] ring-1 ring-evergreen-700/60">
      {/* Header */}
      <div className="flex items-center justify-between bg-evergreen-950 px-5 py-3.5">
        <span className="inline-flex items-center gap-2 font-display text-xs font-bold uppercase tracking-[0.16em] text-white">
          <span aria-hidden>🌸</span> RockFlower Travels
        </span>
        <span className="rounded-full bg-sunrise-500/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-sunrise-300 ring-1 ring-sunrise-500/30">
          Boarding pass
        </span>
      </div>

      {/* Main — value-first hierarchy: data leads, labels support */}
      <div className="space-y-5 p-5 sm:p-6">
        <div>
          <p className="font-display text-xl font-extrabold leading-tight tracking-tight text-white">{name || '—'}</p>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-mist-400">Passenger</p>
        </div>

        <div>
          <p className="font-display text-base font-bold leading-snug text-white">{routeName}</p>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-mist-400">Route</p>
        </div>

        <div className="grid grid-cols-3 gap-x-4 gap-y-4">
          <PassCell label="Date" value={date} />
          <PassCell label="Departs" value={time} highlight />
          <PassCell label="Pax" value={`${passengers}`} />
        </div>
      </div>

      {/* Perforation — book: Overlap elements to create layers; classic ticket motif */}
      <div className="relative">
        <span aria-hidden className="absolute -left-3 top-1/2 size-6 -translate-y-1/2 rounded-full bg-white dark:bg-evergreen-900" />
        <span aria-hidden className="absolute -right-3 top-1/2 size-6 -translate-y-1/2 rounded-full bg-white dark:bg-evergreen-900" />
        <div className="border-t border-dashed border-evergreen-700/80" />
      </div>

      {/* Stub */}
      <div className="bg-evergreen-950/60 p-5 sm:p-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="font-mono text-base font-bold tracking-[0.16em] text-sunrise-300">{ticketRef}</p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-mist-400">Reference</p>
          </div>
          <div className="text-right">
            <p className="font-display text-base font-bold tabular-nums text-white">${total.toFixed(2)}</p>
            <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-mist-400">Paid · CAD</p>
          </div>
        </div>

        <div className="mt-4 rounded-lg bg-white p-3">
          <div className="flex h-9 items-stretch justify-between">
            {Array.from({ length: 90 }).map((_, i) => (
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
          <p className="mt-2 text-center font-mono text-[10px] font-bold tracking-[0.22em] text-mist-700">
            {ticketRef}
          </p>
        </div>

        <p className="mt-4 text-xs leading-relaxed text-mist-300">
          Arrive <strong className="text-white">10 minutes</strong> before departure and present this pass to the driver.
        </p>
      </div>
    </div>
  );
}

function PassCell({
  label, value, highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <p className={`font-display text-sm font-bold leading-snug ${highlight ? 'text-sunrise-300' : 'text-white'}`}>
        {value}
      </p>
      <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-mist-400">{label}</p>
    </div>
  );
}

function PaymentStep({
  clientSecret, total, email, holdExpiresAt, onSuccess, onCancel, onExpire,
}: {
  clientSecret: string;
  total: number;
  email: string;
  holdExpiresAt: string;
  onSuccess: () => void;
  onCancel: () => void;
  onExpire: () => void;
}) {
  const options: StripeElementsOptions = {
    clientSecret,
    appearance: {
      theme: 'flat',
      variables: {
        colorPrimary: 'hsl(41, 78%, 50%)',
        colorBackground: '#ffffff',
        colorText: 'hsl(220, 24%, 12%)',
        colorDanger: 'hsl(0, 75%, 50%)',
        fontFamily: 'system-ui, -apple-system, "Segoe UI", sans-serif',
        borderRadius: '12px',
        spacingUnit: '4px',
      },
      rules: {
        '.Input': {
          border: '1px solid hsl(210, 14%, 89%)',
          padding: '14px',
          fontSize: '14px',
          fontWeight: '500',
        },
        '.Input:focus': {
          border: '1px solid hsl(168, 45%, 30%)',
          boxShadow: '0 0 0 4px hsl(168 45% 30% / 0.15)',
        },
        '.Label': {
          fontSize: '11px',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '0.16em',
          color: 'hsl(210, 8%, 50%)',
          marginBottom: '8px',
        },
      },
    },
  };

  return (
    <Elements stripe={getStripe()} options={options}>
      <PaymentForm
        total={total}
        email={email}
        holdExpiresAt={holdExpiresAt}
        onSuccess={onSuccess}
        onCancel={onCancel}
        onExpire={onExpire}
      />
    </Elements>
  );
}

function formatHold(msRemaining: number): string {
  const s = Math.max(0, Math.floor(msRemaining / 1000));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

function HoldTimer({ holdExpiresAt, onExpire }: { holdExpiresAt: string; onExpire: () => void }) {
  const [now, setNow] = useState(() => Date.now());
  const deadline = new Date(holdExpiresAt).getTime();
  const remaining = deadline - now;
  const expiredRef = useRef(false);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (remaining <= 0 && !expiredRef.current) {
      expiredRef.current = true;
      onExpire();
    }
  }, [remaining, onExpire]);

  const warn = remaining < 60_000;

  return (
    <div
      className={`flex items-start gap-3 rounded-xl p-4 ring-1 ${
        warn
          ? 'bg-red-50 ring-red-200 dark:bg-red-500/10 dark:ring-red-500/30'
          : 'bg-evergreen-50 ring-evergreen-200 dark:bg-evergreen-950/40 dark:ring-evergreen-700/40'
      }`}
    >
      <span
        aria-hidden
        className={`mt-0.5 grid size-7 shrink-0 place-items-center rounded-full ${
          warn
            ? 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-200'
            : 'bg-evergreen-100 text-evergreen-700 dark:bg-evergreen-700/40 dark:text-evergreen-200'
        }`}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4">
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      </span>
      <div className="flex-1 text-xs leading-relaxed text-mist-700 dark:text-mist-200">
        <p className="font-semibold text-mist-900 dark:text-white">
          Your reservation is being held for{' '}
          <span className="font-mono tabular-nums">{formatHold(remaining)}</span>
        </p>
        <p className="mt-0.5">
          Closing this payment dialog releases the hold and you will need to reserve again.
        </p>
      </div>
    </div>
  );
}

function PaymentForm({
  total, email, holdExpiresAt, onSuccess, onCancel, onExpire,
}: {
  total: number;
  email: string;
  holdExpiresAt: string;
  onSuccess: () => void;
  onCancel: () => void;
  onExpire: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [expired, setExpired] = useState(false);

  const handleExpire = () => {
    setExpired(true);
    onExpire();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    if (expired) {
      setError('Your reservation hold expired. Please start a new booking.');
      return;
    }

    setSubmitting(true);
    setError('');

    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
      confirmParams: {
        receipt_email: email,
        return_url: typeof window !== 'undefined' ? window.location.origin : undefined,
      },
    });

    if (stripeError) {
      setError(stripeError.message || 'Payment failed. Please try again.');
      setSubmitting(false);
      return;
    }

    if (paymentIntent && paymentIntent.status === 'succeeded') {
      onSuccess();
    } else {
      setError(`Unexpected payment status: ${paymentIntent?.status || 'unknown'}`);
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <header>
        <h2 className="font-display text-2xl font-extrabold tracking-tight text-mist-900 dark:text-white sm:text-3xl">
          Payment
        </h2>
        <p className="mt-1.5 text-sm text-mist-500 dark:text-mist-400">
          Charged once. We use Stripe — your card never touches our servers.
        </p>
      </header>

      <HoldTimer holdExpiresAt={holdExpiresAt} onExpire={handleExpire} />

      <PaymentElement options={{ layout: 'tabs' }} />

      <p className="text-xs leading-relaxed text-mist-500 dark:text-mist-400">
        By providing your card information, you allow RockFlower Travels Inc. to charge your card
        for this booking and any related fees in accordance with our{' '}
        <a href="/privacy-policy" className="font-semibold text-evergreen-700 underline-offset-2 hover:underline dark:text-sunrise-300">
          privacy policy
        </a>{' '}
        and terms.
      </p>

      {error && (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </p>
      )}

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="rounded-xl border border-mist-200 px-5 py-3.5 text-sm font-semibold text-mist-700 transition hover:border-mist-300 hover:bg-mist-50 disabled:opacity-40 dark:border-evergreen-700/60 dark:text-mist-200 dark:hover:bg-evergreen-800/40"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!stripe || !elements || submitting || expired}
          className={`${CTA_CLASS} flex-1 disabled:cursor-not-allowed disabled:opacity-60`}
        >
          {submitting ? 'Processing…' : expired ? 'Hold expired' : `Pay now (C$${total.toFixed(2)})`}
        </button>
      </div>

      <p className="text-center text-[11px] text-mist-400 dark:text-mist-500">
        <span aria-hidden className="mr-1">🔒</span>
        Secured by Stripe · 128-bit SSL · PCI DSS Level 1
      </p>
    </form>
  );
}
