'use client';

import React, { useState } from 'react';

interface HeroProps {
  onOpenBooking: (route: string) => void;
}

export default function Hero({ onOpenBooking }: HeroProps) {
  const [selectedRoute, setSelectedRoute] = useState('daytime-circuit');
  const [date, setDate] = useState('2026-05-21');
  const [passengers, setPassengers] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onOpenBooking(selectedRoute);
  };

  return (
    <section className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[url('/images/hero_banner.png')] bg-cover bg-center" />
      {/* Two-stop overlay: heavier on the left where the headline sits, lighter toward the booking card */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-evergreen-950/95 via-evergreen-950/70 to-evergreen-900/50" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-evergreen-950/40 via-transparent to-evergreen-950/30" />

      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 px-6 py-20 md:py-28 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16 lg:py-32">
        {/* Left — narrative */}
        <div className="max-w-2xl animate-fade-in text-white">
          <span className="inline-flex items-center gap-2 rounded-full border border-sunrise-500/40 bg-sunrise-500/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-sunrise-300">
            <span aria-hidden className="size-1.5 rounded-full bg-sunrise-400" />
            Premium Rocky Mountain Shuttles
          </span>

          <h1 className="mt-6 font-display text-4xl font-extrabold leading-[1.02] tracking-tight text-balance text-white sm:text-5xl lg:text-6xl">
            Banff to <span className="text-sunrise-400">Lake Louise</span> &amp; <span className="text-sunrise-400">Moraine Lake</span>
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-mist-200 sm:text-lg">
            Reliable, scenic, premium daily transit. Beat the parking crowds and travel in
            absolute comfort on our state-of-the-art shuttle coaches.
          </p>

          <ul className="mt-8 flex flex-wrap gap-2 text-sm text-mist-100">
            <li className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5">
              <span aria-hidden>✨</span>
              <span className="font-medium">Sunrise Access (4:30 AM)</span>
            </li>
            <li className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5">
              <span aria-hidden>⏱️</span>
              <span className="font-medium">Buses depart on time</span>
            </li>
            <li className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5">
              <span aria-hidden>🏔️</span>
              <span className="font-medium">Reserved seating</span>
            </li>
          </ul>
        </div>

        {/* Right — booking card */}
        <div className="w-full animate-fade-in [animation-delay:120ms]">
          <form
            onSubmit={handleSubmit}
            className="relative overflow-hidden rounded-3xl bg-evergreen-900 ring-1 ring-evergreen-700/60 shadow-[var(--shadow-elevated)]"
          >
            <div className="h-1.5 w-full bg-gradient-to-r from-sunrise-500 via-sunrise-400 to-sunrise-600" />

            <div className="p-6 sm:p-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-sunrise-300">
                Book your shuttle
              </p>
              <h2 className="mt-1.5 font-display text-2xl font-bold text-white sm:text-3xl">
                Reserve in 30&nbsp;seconds
              </h2>

              <div className="mt-7 space-y-5">
                <Field label="Route / Service" htmlFor="route-select">
                  <select
                    id="route-select"
                    value={selectedRoute}
                    onChange={(e) => setSelectedRoute(e.target.value)}
                    className="w-full rounded-xl border border-evergreen-700 bg-evergreen-950/60 px-4 py-3.5 text-base font-medium text-white outline-none transition focus:border-sunrise-400 focus:bg-evergreen-950 focus:ring-2 focus:ring-sunrise-400/30"
                  >
                    <option value="sunrise-express" className="bg-evergreen-900 text-white">Sunrise Express — 4:30 AM</option>
                    <option value="daytime-circuit" className="bg-evergreen-900 text-white">Daytime Circuit — 7:00 AM to 5:20 PM</option>
                    <option value="evening-return" className="bg-evergreen-900 text-white">Evening Return — 6:00 PM</option>
                  </select>
                </Field>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  <Field label="Travel date" htmlFor="date-input">
                    <input
                      type="date"
                      id="date-input"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full rounded-xl border border-evergreen-700 bg-evergreen-950/60 px-4 py-3.5 text-base font-medium text-white outline-none transition [color-scheme:dark] focus:border-sunrise-400 focus:bg-evergreen-950 focus:ring-2 focus:ring-sunrise-400/30"
                      min="2026-05-03"
                    />
                  </Field>

                  <Field label="Passengers" htmlFor="passengers-input">
                    <select
                      id="passengers-input"
                      value={passengers}
                      onChange={(e) => setPassengers(parseInt(e.target.value))}
                      className="w-full rounded-xl border border-evergreen-700 bg-evergreen-950/60 px-4 py-3.5 text-base font-medium text-white outline-none transition focus:border-sunrise-400 focus:bg-evergreen-950 focus:ring-2 focus:ring-sunrise-400/30"
                    >
                      {[1, 2, 3, 4, 5].map((n) => (
                        <option key={n} value={n} className="bg-evergreen-900 text-white">
                          {n === 5 ? '5+ Passengers' : `${n} Passenger${n > 1 ? 's' : ''}`}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
              </div>

              <button
                type="submit"
                className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-sunrise-500 px-6 py-4 font-display text-base font-bold text-evergreen-950 shadow-[var(--shadow-glow-sunrise)] transition hover:bg-sunrise-400 focus:outline-none focus:ring-2 focus:ring-sunrise-300 focus:ring-offset-2 focus:ring-offset-evergreen-900"
              >
                Find availability &amp; book
                <span aria-hidden>→</span>
              </button>

              <p className="mt-4 text-center text-xs text-mist-300">
                Please arrive 10 minutes early — buses depart strictly on schedule.
              </p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-mist-300"
      >
        {label}
      </label>
      {children}
    </div>
  );
}
