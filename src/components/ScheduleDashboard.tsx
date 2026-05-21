'use client';

import React, { useState } from 'react';

interface ScheduleDashboardProps {
  onOpenBooking: (route: string) => void;
}

type TabKey = 'sunrise' | 'daytime' | 'evening';

const TABS: { key: TabKey; label: string; window: string; icon: string }[] = [
  { key: 'sunrise', label: 'Sunrise Express', window: '4:30 AM – 6:50 AM', icon: '🌅' },
  { key: 'daytime', label: 'Daytime Circuit', window: '7:00 AM – 5:20 PM', icon: '☀️' },
  { key: 'evening', label: 'Evening Return', window: '6:00 PM departure', icon: '🌇' },
];

const LOCATIONS = [
  { value: 'all', label: 'All locations' },
  { value: 'banff', label: 'Banff' },
  { value: 'samson', label: 'Samson Mall (Village)' },
  { value: 'lakeshore', label: 'Lake Louise Lakeshore' },
  { value: 'moraine', label: 'Moraine Lake' },
];

const sunriseRoutes = [
  { id: 's1', route: 'Banff → Moraine Lake',                        depart: '4:30 AM', arrive: '6:00 AM', type: 'Premium' as const },
  { id: 's2', route: 'Moraine Lake → Lake Louise Lakeshore',        depart: '6:10 AM', arrive: '6:35 AM', type: 'Positioning' as const },
  { id: 's3', route: 'Lake Louise Lakeshore → Samson Mall',         depart: '6:35 AM', arrive: '6:50 AM', type: 'Positioning' as const },
];

const daytimeCircuits = [
  { id: 'c1', name: 'Circuit 1', samson: '7:00 AM',  lakeshore: '7:15 AM',  moraine: '7:40 AM',  returnSamson: '8:50 AM'  },
  { id: 'c2', name: 'Circuit 2', samson: '9:00 AM',  lakeshore: '9:15 AM',  moraine: '9:40 AM',  returnSamson: '10:50 AM' },
  { id: 'c3', name: 'Circuit 3', samson: '11:00 AM', lakeshore: '11:15 AM', moraine: '11:40 AM', returnSamson: '12:50 PM' },
  { id: 'c4', name: 'Circuit 4', samson: '1:30 PM',  lakeshore: '1:45 PM',  moraine: '2:10 PM',  returnSamson: '3:20 PM'  },
  { id: 'c5', name: 'Circuit 5', samson: '3:30 PM',  lakeshore: '3:45 PM',  moraine: '4:10 PM',  returnSamson: '5:20 PM'  },
];

const eveningRoutes = [
  { id: 'e1', route: 'Lake Louise Lakeshore → Banff', depart: '6:00 PM', arrive: '7:15 PM' },
];

export default function ScheduleDashboard({ onOpenBooking }: ScheduleDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('daytime');
  const [searchOrigin, setSearchOrigin] = useState<string>('all');
  const [searchDestination, setSearchDestination] = useState<string>('all');

  return (
    <section id="schedule" className="mx-auto max-w-7xl px-6 py-24">
      <header className="mx-auto max-w-2xl text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-evergreen-500 dark:text-sunrise-400">
          Daily timetables
        </p>
        <h2 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-mist-900 dark:text-white sm:text-5xl">
          Pick your departure
        </h2>
        <p className="mt-4 text-base text-mist-500 dark:text-mist-300">
          Three services run daily between Banff, Lake Louise Village, and Moraine Lake.
          Filter by origin and destination, then book in one click.
        </p>
      </header>

      {/* Route search */}
      <div className="mt-12 grid grid-cols-1 gap-4 rounded-2xl border border-mist-200 bg-white p-5 shadow-[var(--shadow-card)] dark:border-evergreen-700/40 dark:bg-evergreen-900 sm:grid-cols-[1fr_auto_1fr_auto]">
        <FilterSelect
          id="filter-origin"
          label="From"
          value={searchOrigin}
          onChange={setSearchOrigin}
          options={LOCATIONS}
        />
        <div aria-hidden className="hidden self-end pb-3.5 text-mist-300 dark:text-mist-500 sm:block">
          ⇄
        </div>
        <FilterSelect
          id="filter-dest"
          label="To"
          value={searchDestination}
          onChange={setSearchDestination}
          options={LOCATIONS}
        />
        <button
          type="button"
          onClick={() => { setSearchOrigin('all'); setSearchDestination('all'); }}
          className="self-end rounded-lg px-4 py-3 text-sm font-semibold text-mist-500 transition hover:text-evergreen-700 dark:text-mist-300 dark:hover:text-sunrise-300"
        >
          Clear
        </button>
      </div>

      {/* Tabs */}
      <div role="tablist" aria-label="Shuttle services" className="mt-10 flex flex-wrap gap-2">
        {TABS.map((t) => {
          const active = activeTab === t.key;
          return (
            <button
              key={t.key}
              role="tab"
              aria-selected={active}
              onClick={() => setActiveTab(t.key)}
              className={`group inline-flex items-center gap-3 rounded-full px-5 py-2.5 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sunrise-400/40 ${
                active
                  ? 'bg-evergreen-800 text-white shadow-[var(--shadow-card)] dark:bg-sunrise-500 dark:text-evergreen-950'
                  : 'text-mist-600 hover:bg-mist-100 dark:text-mist-300 dark:hover:bg-evergreen-900'
              }`}
            >
              <span aria-hidden className="text-base">{t.icon}</span>
              <span>{t.label}</span>
              <span className={`text-xs font-normal ${active ? 'text-white/70 dark:text-evergreen-950/70' : 'text-mist-400 dark:text-mist-500'}`}>
                · {t.window}
              </span>
            </button>
          );
        })}
      </div>

      {/* Panel */}
      <div className="mt-6 overflow-hidden rounded-2xl border border-mist-200 bg-white shadow-[var(--shadow-card)] dark:border-evergreen-700/40 dark:bg-evergreen-900">
        {activeTab === 'sunrise' && (
          <SunrisePanel
            routes={sunriseRoutes}
            onBook={() => onOpenBooking('sunrise-express')}
            origin={searchOrigin}
            dest={searchDestination}
          />
        )}
        {activeTab === 'daytime' && (
          <DaytimePanel
            circuits={daytimeCircuits}
            onBook={() => onOpenBooking('daytime-circuit')}
          />
        )}
        {activeTab === 'evening' && (
          <EveningPanel routes={eveningRoutes} onBook={() => onOpenBooking('evening-return')} />
        )}
      </div>

      {/* Advisory */}
      <aside className="mt-8 rounded-2xl border-l-4 border-l-sunrise-500 border-y border-r border-mist-200 bg-white p-6 dark:border-y-evergreen-700/40 dark:border-r-evergreen-700/40 dark:bg-evergreen-900 sm:p-7">
        <h3 className="flex items-center gap-2.5 font-display text-lg font-bold text-mist-900 dark:text-white">
          <span aria-hidden>⚠️</span>
          Important travel notes
        </h3>
        <ul className="mt-4 grid gap-3 text-sm text-mist-600 dark:text-mist-300 sm:grid-cols-2">
          <Note title="Arrive early">
            Be at your designated loading area at least <strong className="text-mist-900 dark:text-white">10 minutes</strong> before departure.
          </Note>
          <Note title="Schedule draft">
            Drafted May 03, 2026. Times may change due to traffic, weather, or operations.
          </Note>
          <Note title="Stop directions">
            Lake Louise Lakeshore and Moraine Lake follow designated loading areas; follow staff instructions.
          </Note>
          <Note title="Samson Mall">
            Central pickup and drop-off point in Lake Louise Village.
          </Note>
        </ul>
      </aside>
    </section>
  );
}

function FilterSelect({
  id, label, value, onChange, options,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.14em] text-mist-500 dark:text-mist-400">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-mist-200 bg-white px-3.5 py-3 text-sm font-medium text-mist-900 outline-none transition focus:border-evergreen-500 focus:ring-2 focus:ring-evergreen-500/20 dark:border-evergreen-700/60 dark:bg-evergreen-950/60 dark:text-white dark:focus:border-sunrise-400 dark:focus:ring-sunrise-400/20"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} className="bg-white text-mist-900 dark:bg-evergreen-900 dark:text-white">
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function Note({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-3">
      <span aria-hidden className="mt-1.5 size-1.5 shrink-0 rounded-full bg-sunrise-500" />
      <div>
        <p className="font-semibold text-mist-900 dark:text-white">{title}</p>
        <p className="mt-0.5 leading-relaxed">{children}</p>
      </div>
    </li>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="bg-mist-50 px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-[0.12em] text-mist-500 dark:bg-evergreen-950/40 dark:text-mist-400">
      {children}
    </th>
  );
}

function Time({ value, muted = false }: { value: string; muted?: boolean }) {
  return (
    <span className={`font-display tabular-nums ${muted ? 'text-mist-400 dark:text-mist-500' : 'text-mist-900 dark:text-white'} text-base font-semibold`}>
      {value}
    </span>
  );
}

function BookButton({ onClick, disabled, label = 'Book' }: { onClick: () => void; disabled?: boolean; label?: string }) {
  if (disabled) {
    return (
      <span className="inline-flex cursor-not-allowed items-center rounded-lg border border-mist-200 px-3 py-1.5 text-xs font-semibold text-mist-400 dark:border-evergreen-700/50 dark:text-mist-500">
        {label}
      </span>
    );
  }
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-lg bg-evergreen-800 px-3.5 py-1.5 text-xs font-bold text-white transition hover:bg-evergreen-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-sunrise-400/40 dark:bg-sunrise-500 dark:text-evergreen-950 dark:hover:bg-sunrise-400"
    >
      {label}
      <span aria-hidden>→</span>
    </button>
  );
}

function SunrisePanel({
  routes, onBook, origin, dest,
}: {
  routes: typeof sunriseRoutes;
  onBook: () => void;
  origin: string;
  dest: string;
}) {
  return (
    <div className="animate-fade-in">
      <div className="flex flex-col gap-3 border-b border-mist-200 px-6 py-5 dark:border-evergreen-700/40 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-mist-600 dark:text-mist-300">
          Premium 4:30 AM departure direct to Moraine Lake. Positioning legs are not bookable.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <Th>Route</Th>
              <Th>Departs</Th>
              <Th>Arrives</Th>
              <Th>Service</Th>
              <Th>Action</Th>
            </tr>
          </thead>
          <tbody>
            {routes.map((r, i) => {
              const isPositioning = r.type === 'Positioning';
              const map = ['banff','moraine','lakeshore'];
              const dMap = ['moraine','lakeshore','samson'];
              const isMatch = (origin === 'all' || map[i] === origin) && (dest === 'all' || dMap[i] === dest);
              return (
                <tr key={r.id} className={`border-t border-mist-200 dark:border-evergreen-700/30 ${isMatch ? '' : 'opacity-40'}`}>
                  <td className="px-6 py-4 font-medium text-mist-900 dark:text-white">{r.route}</td>
                  <td className="px-6 py-4"><Time value={r.depart} muted={isPositioning} /></td>
                  <td className="px-6 py-4"><Time value={r.arrive} muted={isPositioning} /></td>
                  <td className="px-6 py-4">
                    {isPositioning ? (
                      <span className="inline-flex items-center rounded-full bg-mist-100 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-mist-500 dark:bg-evergreen-950/50 dark:text-mist-400">
                        Positioning
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-sunrise-100 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-sunrise-700 dark:bg-sunrise-500/15 dark:text-sunrise-300">
                        Premium
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <BookButton onClick={onBook} disabled={isPositioning} label={isPositioning ? 'Internal' : 'Book'} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DaytimePanel({ circuits, onBook }: { circuits: typeof daytimeCircuits; onBook: () => void }) {
  return (
    <div className="animate-fade-in">
      <div className="border-b border-mist-200 px-6 py-5 dark:border-evergreen-700/40">
        <p className="text-sm text-mist-600 dark:text-mist-300">
          <strong className="text-mist-900 dark:text-white">Pattern:</strong>{' '}
          Samson Mall → Lake Louise Lakeshore → Moraine Lake → back to Samson Mall.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <Th>Circuit</Th>
              <Th>Samson Mall</Th>
              <Th>Lakeshore</Th>
              <Th>Moraine</Th>
              <Th>Back to Samson</Th>
              <Th>Action</Th>
            </tr>
          </thead>
          <tbody>
            {circuits.map((c) => (
              <tr key={c.id} className="border-t border-mist-200 transition hover:bg-mist-50/60 dark:border-evergreen-700/30 dark:hover:bg-evergreen-950/30">
                <td className="px-6 py-4 font-semibold text-mist-900 dark:text-white">{c.name}</td>
                <td className="px-6 py-4"><Time value={c.samson} /></td>
                <td className="px-6 py-4"><Time value={c.lakeshore} /></td>
                <td className="px-6 py-4"><Time value={c.moraine} /></td>
                <td className="px-6 py-4"><Time value={c.returnSamson} /></td>
                <td className="px-6 py-4"><BookButton onClick={onBook} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function EveningPanel({ routes, onBook }: { routes: typeof eveningRoutes; onBook: () => void }) {
  return (
    <div className="animate-fade-in">
      <div className="border-b border-mist-200 px-6 py-5 dark:border-evergreen-700/40">
        <p className="text-sm text-mist-600 dark:text-mist-300">Standard evening departure back to Banff. Reservations recommended.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <Th>Route</Th>
              <Th>Departs</Th>
              <Th>Arrives</Th>
              <Th>Action</Th>
            </tr>
          </thead>
          <tbody>
            {routes.map((r) => (
              <tr key={r.id} className="border-t border-mist-200 dark:border-evergreen-700/30">
                <td className="px-6 py-4 font-medium text-mist-900 dark:text-white">{r.route}</td>
                <td className="px-6 py-4"><Time value={r.depart} /></td>
                <td className="px-6 py-4"><Time value={r.arrive} /></td>
                <td className="px-6 py-4"><BookButton onClick={onBook} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
