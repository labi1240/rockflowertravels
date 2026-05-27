'use client';

import React, { useState } from 'react';
import { useBookingModal, type BookingRouteId } from '@/store/booking-modal';

export default function HeroBookingForm() {
  const openBooking = useBookingModal((s) => s.open);
  const [selectedRoute, setSelectedRoute] = useState<BookingRouteId>('daytime-circuit');
  const [date, setDate] = useState('2026-05-21');
  const [passengers, setPassengers] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    openBooking(selectedRoute, { date, passengers });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="relative overflow-hidden rounded-3xl bg-evergreen-900 ring-1 ring-evergreen-700/60 shadow-[var(--shadow-elevated)]"
    >
      <div className="p-8 sm:p-10">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-mist-400">
          Book your shuttle
        </p>
        <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-white sm:text-[28px]">
          Reserve in 30&nbsp;seconds
        </h2>

        <div className="mt-8 space-y-6">
          <Field label="Route / Service" htmlFor="route-select">
            <select
              id="route-select"
              value={selectedRoute}
              onChange={(e) => setSelectedRoute(e.target.value as BookingRouteId)}
              className="w-full rounded-xl border border-evergreen-700 bg-evergreen-950/60 px-4 py-3.5 text-base font-medium text-white outline-none transition focus:border-sunrise-400 focus:bg-evergreen-950 focus:ring-2 focus:ring-sunrise-400/30"
            >
              <option value="sunrise-express" className="bg-evergreen-900 text-white">Sunrise Express — 4:30 AM</option>
              <option value="daytime-circuit" className="bg-evergreen-900 text-white">Daytime Circuit — 7:00 AM to 5:20 PM</option>
              <option value="evening-return" className="bg-evergreen-900 text-white">Evening Return — 6:00 PM</option>
            </select>
          </Field>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
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
          className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-sunrise-500 px-6 py-4 font-display text-base font-bold text-evergreen-950 shadow-[var(--shadow-glow-sunrise)] transition hover:bg-sunrise-400 focus:outline-none focus:ring-2 focus:ring-sunrise-300 focus:ring-offset-2 focus:ring-offset-evergreen-900"
        >
          Find availability &amp; book
          <span aria-hidden>→</span>
        </button>

        <p className="mt-5 text-center text-xs text-mist-400">
          Please arrive 10 minutes early — buses depart strictly on schedule.
        </p>
      </div>
    </form>
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
        className="mb-2 block text-[11px] font-semibold uppercase tracking-[0.16em] text-mist-400"
      >
        {label}
      </label>
      {children}
    </div>
  );
}
