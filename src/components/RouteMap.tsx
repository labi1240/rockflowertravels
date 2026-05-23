'use client';

import React, { useState } from 'react';

type RouteKey = 'all' | 'sunrise' | 'daytime' | 'evening';
type StopKey = 'banff' | 'samson' | 'lakeshore' | 'moraine';

interface StopDetails {
  name: string;
  role: string;
  notes: string[];
  tips: string;
  cx: number;
  cy: number;
  labelAnchor: 'start' | 'middle' | 'end';
  labelDx: number;
  labelDy: number;
}

const STOPS: Record<StopKey, StopDetails> = {
  banff: {
    name: 'Banff (Townsite)',
    role: 'Primary Origin & Evening Terminal',
    notes: [
      'Sunrise Express departs from Banff at 4:30 AM.',
      'Evening Return arrives back in Banff at 7:15 PM.',
    ],
    tips: 'Perfect starting point for visitors staying in the town of Banff. Overnight parking is available in the public transit hub.',
    cx: 500, cy: 380,
    labelAnchor: 'middle', labelDx: 0, labelDy: 32,
  },
  samson: {
    name: 'Samson Mall (Lake Louise Village)',
    role: 'Main Daytime Hub',
    notes: [
      'Samson Mall is the central Lake Louise Village pickup point.',
      'Daytime Circuit departs every 2 hours starting at 7:00 AM.',
    ],
    tips: 'Located in the heart of Lake Louise Village with retail, food, and restroom amenities while you wait.',
    cx: 280, cy: 280,
    labelAnchor: 'middle', labelDx: 0, labelDy: 32,
  },
  lakeshore: {
    name: 'Lake Louise Lakeshore',
    role: 'Daytime Stop & Evening Departure',
    notes: [
      'Follow designated loading areas and staff direction.',
      'Evening Return to Banff departs at 6:00 PM.',
    ],
    tips: 'Look for the RockFlower Travels signpost near the public shuttle loops. Staff will guide you to your loading bay.',
    cx: 140, cy: 140,
    labelAnchor: 'start', labelDx: -10, labelDy: -16,
  },
  moraine: {
    name: 'Moraine Lake',
    role: 'Scenic Destination',
    notes: [
      'Sunrise Express arrives at 6:00 AM for premium sunrise viewing.',
      'Private vehicles restricted — our shuttle is guaranteed access.',
    ],
    tips: 'Private vehicles are restricted. Our shuttle is the best way to secure guaranteed, stress-free access to Moraine Lake.',
    cx: 360, cy: 80,
    labelAnchor: 'middle', labelDx: 0, labelDy: -18,
  },
};

const ROUTE_META: Record<Exclude<RouteKey, 'all'>, { label: string; icon: string; color: string }> = {
  sunrise: { label: 'Sunrise Express', icon: '🌅', color: 'var(--color-sunrise-500)' },
  daytime: { label: 'Daytime Circuit', icon: '☀️', color: 'var(--color-evergreen-500)' },
  evening: { label: 'Evening Return', icon: '🌇', color: 'var(--color-evergreen-700)' },
};

export default function RouteMap() {
  const [filter, setFilter] = useState<RouteKey>('all');
  const [activeStop, setActiveStop] = useState<StopKey | null>(null);

  const isVisible = (route: Exclude<RouteKey, 'all'>) => filter === 'all' || filter === route;
  const dim = (route: Exclude<RouteKey, 'all'>) => (isVisible(route) ? 1 : 0.12);
  const stopOpacity = (key: StopKey): number => {
    if (filter === 'all') return 1;
    const map: Record<StopKey, Exclude<RouteKey, 'all'>[]> = {
      banff:     ['sunrise', 'evening'],
      samson:    ['sunrise', 'daytime'],
      lakeshore: ['sunrise', 'daytime', 'evening'],
      moraine:   ['sunrise', 'daytime'],
    };
    return map[key].includes(filter as Exclude<RouteKey, 'all'>) ? 1 : 0.25;
  };

  return (
    <section id="map" className="mx-auto max-w-7xl px-6 py-24">
      <header className="mx-auto max-w-2xl text-center">
        <h2 className="font-display text-4xl font-extrabold leading-[1.02] tracking-tighter text-mist-900 dark:text-white sm:text-5xl">
          Where we go
        </h2>
        <p className="mt-4 text-base text-mist-500 dark:text-mist-300">
          Four stops, three services. Tap a stop to see loading bays and departure notes.
        </p>
      </header>

      <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-[1.5fr_1fr]">
        {/* Map */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-[var(--shadow-card-hover)] dark:bg-evergreen-900">
          {/* Filters */}
          <div className="flex flex-wrap gap-1.5 bg-mist-50/60 p-4 dark:bg-evergreen-950/40">
            <FilterPill active={filter === 'all'} onClick={() => setFilter('all')}>All routes</FilterPill>
            {(Object.keys(ROUTE_META) as Exclude<RouteKey, 'all'>[]).map((k) => (
              <FilterPill key={k} active={filter === k} onClick={() => setFilter(k)} color={ROUTE_META[k].color}>
                <span aria-hidden className="mr-1.5">{ROUTE_META[k].icon}</span>
                {ROUTE_META[k].label}
              </FilterPill>
            ))}
          </div>

          {/* SVG */}
          <div className="relative aspect-[5/4] w-full bg-mist-50 dark:bg-evergreen-950/60">
            <svg viewBox="0 0 600 480" className="absolute inset-0 h-full w-full" aria-label="Shuttle route map">
              {/* Subtle topographic background */}
              <defs>
                <pattern id="topo" width="60" height="60" patternUnits="userSpaceOnUse">
                  <path d="M 0 30 Q 15 20 30 30 T 60 30" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-mist-200 dark:text-evergreen-700/40" />
                </pattern>
              </defs>
              <rect width="600" height="480" fill="url(#topo)" />

              {/* Sunrise Express: Banff → Moraine (direct), then positioning legs (dashed) */}
              <g opacity={dim('sunrise')} className="transition-opacity duration-300">
                <Path d={`M ${STOPS.banff.cx} ${STOPS.banff.cy} Q 460 220 ${STOPS.moraine.cx} ${STOPS.moraine.cy}`} color="var(--color-sunrise-500)" />
                <Path d={`M ${STOPS.moraine.cx} ${STOPS.moraine.cy} Q 240 90 ${STOPS.lakeshore.cx} ${STOPS.lakeshore.cy}`} color="var(--color-sunrise-500)" dashed />
                <Path d={`M ${STOPS.lakeshore.cx} ${STOPS.lakeshore.cy} Q 200 220 ${STOPS.samson.cx} ${STOPS.samson.cy}`} color="var(--color-sunrise-500)" dashed />
              </g>

              {/* Daytime Circuit: Samson → Lakeshore → Moraine → Samson */}
              <g opacity={dim('daytime')} className="transition-opacity duration-300">
                <Path d={`M ${STOPS.samson.cx} ${STOPS.samson.cy} Q 180 200 ${STOPS.lakeshore.cx} ${STOPS.lakeshore.cy}`} color="var(--color-evergreen-500)" />
                <Path d={`M ${STOPS.lakeshore.cx} ${STOPS.lakeshore.cy} Q 240 60 ${STOPS.moraine.cx} ${STOPS.moraine.cy}`} color="var(--color-evergreen-500)" />
                <Path d={`M ${STOPS.moraine.cx} ${STOPS.moraine.cy} Q 340 180 ${STOPS.samson.cx} ${STOPS.samson.cy}`} color="var(--color-evergreen-500)" />
              </g>

              {/* Evening Return: Lakeshore → Banff */}
              <g opacity={dim('evening')} className="transition-opacity duration-300">
                <Path d={`M ${STOPS.lakeshore.cx} ${STOPS.lakeshore.cy} Q 320 320 ${STOPS.banff.cx} ${STOPS.banff.cy}`} color="var(--color-evergreen-700)" />
              </g>

              {/* Stop markers */}
              {(Object.keys(STOPS) as StopKey[]).map((key) => {
                const s = STOPS[key];
                const isActive = activeStop === key;
                return (
                  <g
                    key={key}
                    onClick={() => setActiveStop(isActive ? null : key)}
                    className="cursor-pointer"
                    opacity={stopOpacity(key)}
                  >
                    {isActive && (
                      <circle cx={s.cx} cy={s.cy} r={22} className="fill-sunrise-500/15 transition-all duration-300" />
                    )}
                    <circle
                      cx={s.cx}
                      cy={s.cy}
                      r={isActive ? 13 : 11}
                      className={`transition-all duration-200 ${
                        isActive
                          ? 'fill-sunrise-500 stroke-white'
                          : 'fill-white stroke-evergreen-700 dark:fill-evergreen-900 dark:stroke-sunrise-400'
                      }`}
                      strokeWidth="3"
                    />
                    <circle
                      cx={s.cx}
                      cy={s.cy}
                      r={4}
                      className={isActive ? 'fill-white' : 'fill-evergreen-700 dark:fill-sunrise-400'}
                    />
                    {/* Label background pill for legibility */}
                    <text
                      x={s.cx + s.labelDx}
                      y={s.cy + s.labelDy}
                      textAnchor={s.labelAnchor}
                      className="pointer-events-none select-none fill-mist-900 font-display text-[13px] font-semibold dark:fill-white"
                      paintOrder="stroke"
                      stroke="var(--bg)"
                      strokeWidth="4"
                      strokeLinejoin="round"
                    >
                      {labelFor(key)}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-x-5 gap-y-2 bg-mist-50/60 px-4 py-3 text-xs text-mist-500 dark:bg-evergreen-950/40 dark:text-mist-300">
            <LegendItem color="var(--color-sunrise-500)" label="Sunrise Express" />
            <LegendItem color="var(--color-evergreen-500)" label="Daytime Circuit" />
            <LegendItem color="var(--color-evergreen-700)" label="Evening Return" />
            <LegendItem color="var(--color-sunrise-500)" label="Positioning leg" dashed />
          </div>
        </div>

        {/* Sidebar */}
        <aside className="rounded-2xl bg-white p-6 shadow-[var(--shadow-card-hover)] dark:bg-evergreen-900">
          {activeStop ? (
            <div className="animate-fade-in">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-sunrise-100 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-sunrise-700 dark:bg-sunrise-500/15 dark:text-sunrise-300">
                <span aria-hidden>📍</span> Station
              </span>
              <h3 className="mt-3 font-display text-2xl font-extrabold text-mist-900 dark:text-white">
                {STOPS[activeStop].name}
              </h3>
              <p className="mt-1 text-sm font-medium text-mist-500 dark:text-mist-300">
                {STOPS[activeStop].role}
              </p>

              <div className="mt-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mist-500 dark:text-mist-400">
                  Pickup & stop notes
                </p>
                <ul className="mt-2 space-y-2 text-sm text-mist-600 dark:text-mist-200">
                  {STOPS[activeStop].notes.map((note, i) => (
                    <li key={i} className="flex gap-2.5">
                      <span aria-hidden className="mt-2 size-1.5 shrink-0 rounded-full bg-sunrise-500" />
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-5 rounded-xl bg-mist-50 p-4 dark:bg-evergreen-950/40">
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-mist-500 dark:text-mist-400">
                  Travel tip
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-mist-700 dark:text-mist-200">
                  {STOPS[activeStop].tips}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex h-full flex-col">
              <h3 className="font-display text-lg font-bold text-mist-900 dark:text-white">
                Stations on the network
              </h3>
              <p className="mt-1 text-sm text-mist-500 dark:text-mist-300">
                Tap any stop on the map — or pick one here — for loading bays and travel tips.
              </p>

              <ul className="mt-5 grid gap-2">
                {(Object.keys(STOPS) as StopKey[]).map((key) => (
                  <li key={key}>
                    <button
                      type="button"
                      onClick={() => setActiveStop(key)}
                      className="group flex w-full items-center justify-between gap-3 rounded-xl px-3.5 py-3 text-left transition hover:bg-mist-50 dark:hover:bg-evergreen-950/40"
                    >
                      <span>
                        <span className="block font-display text-sm font-bold text-mist-900 dark:text-white">
                          {STOPS[key].name}
                        </span>
                        <span className="block text-xs text-mist-500 dark:text-mist-400">
                          {STOPS[key].role}
                        </span>
                      </span>
                      <span aria-hidden className="text-mist-300 transition group-hover:translate-x-0.5 group-hover:text-sunrise-500 dark:text-mist-500">→</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </section>
  );
}

function labelFor(key: StopKey): string {
  return ({
    banff: 'Banff',
    samson: 'Samson Mall',
    lakeshore: 'Lake Louise Lakeshore',
    moraine: 'Moraine Lake',
  } as const)[key];
}

function Path({ d, color, dashed = false }: { d: string; color: string; dashed?: boolean }) {
  return (
    <path
      d={d}
      fill="none"
      stroke={color}
      strokeWidth={3.5}
      strokeLinecap="round"
      strokeDasharray={dashed ? '6 6' : undefined}
    />
  );
}

function FilterPill({
  active, onClick, children, color,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  color?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center rounded-full border px-3.5 py-1.5 text-xs font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sunrise-400/40 ${
        active
          ? 'border-evergreen-800 bg-evergreen-800 text-white dark:border-sunrise-400 dark:bg-sunrise-500 dark:text-evergreen-950'
          : 'border-mist-200 bg-white text-mist-600 hover:border-mist-300 hover:bg-mist-50 dark:border-evergreen-700/60 dark:bg-evergreen-900 dark:text-mist-300 dark:hover:border-evergreen-600'
      }`}
      style={active && color ? { borderColor: color, backgroundColor: color, color: 'white' } : undefined}
    >
      {children}
    </button>
  );
}

function LegendItem({ color, label, dashed = false }: { color: string; label: string; dashed?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2">
      <svg width="22" height="6" aria-hidden>
        <line x1="0" y1="3" x2="22" y2="3" stroke={color} strokeWidth="3" strokeLinecap="round" strokeDasharray={dashed ? '4 3' : undefined} />
      </svg>
      <span>{label}</span>
    </span>
  );
}

