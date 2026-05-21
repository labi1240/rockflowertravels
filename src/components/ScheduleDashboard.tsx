'use client';

import React, { useState } from 'react';

interface ScheduleDashboardProps {
  onOpenBooking: (route: string) => void;
}

export default function ScheduleDashboard({ onOpenBooking }: ScheduleDashboardProps) {
  const [activeTab, setActiveTab] = useState<'sunrise' | 'daytime' | 'evening'>('daytime');
  const [searchOrigin, setSearchOrigin] = useState<string>('all');
  const [searchDestination, setSearchDestination] = useState<string>('all');

  const sunriseRoutes = [
    { id: 's1', route: 'Banff → Moraine Lake', depart: '4:30 AM', arrive: '6:00 AM', type: 'Premium Passenger Route' },
    { id: 's2', route: 'Moraine Lake → Lake Louise Lakeshore', depart: '6:10 AM', arrive: '6:35 AM', type: 'Positioning Circuit' },
    { id: 's3', route: 'Lake Louise Lakeshore → Samson Mall (Village)', depart: '6:35 AM', arrive: '6:50 AM', type: 'Positioning Circuit' },
  ];

  const daytimeCircuits = [
    { id: 'c1', name: 'Circuit 1', samson: '7:00 AM', lakeshore: '7:15 AM', moraine: '7:40 AM', returnSamson: '8:50 AM' },
    { id: 'c2', name: 'Circuit 2', samson: '9:00 AM', lakeshore: '9:15 AM', moraine: '9:40 AM', returnSamson: '10:50 AM' },
    { id: 'c3', name: 'Circuit 3', samson: '11:00 AM', lakeshore: '11:15 AM', moraine: '11:40 AM', returnSamson: '12:50 PM' },
    { id: 'c4', name: 'Circuit 4', samson: '1:30 PM', lakeshore: '1:45 PM', moraine: '2:10 PM', returnSamson: '3:20 PM' },
    { id: 'c5', name: 'Circuit 5', samson: '3:30 PM', lakeshore: '3:45 PM', moraine: '4:10 PM', returnSamson: '5:20 PM' },
  ];

  const eveningRoutes = [
    { id: 'e1', route: 'Lake Louise Lakeshore → Banff', depart: '6:00 PM', arrive: '7:15 PM', type: 'Standard Return Passenger Route' },
  ];

  // Locations for dropdown search
  const locations = [
    { value: 'all', label: 'All Locations' },
    { value: 'banff', label: 'Banff' },
    { value: 'samson', label: 'Samson Mall (Village)' },
    { value: 'lakeshore', label: 'Lake Louise Lakeshore' },
    { value: 'moraine', label: 'Moraine Lake' }
  ];

  // Check if a route matches filters
  const matchesFilter = (origin: string, dest: string, routeKey: 'sunrise' | 'daytime' | 'evening') => {
    if (origin === 'all' && dest === 'all') return true;

    if (routeKey === 'sunrise') {
      const paths = [
        { orig: 'banff', dest: 'moraine' },
        { orig: 'moraine', dest: 'lakeshore' },
        { orig: 'lakeshore', dest: 'samson' }
      ];
      return paths.some((p, index) => {
        const matchesO = origin === 'all' || p.orig === origin;
        const matchesD = dest === 'all' || p.dest === dest;
        return matchesO && matchesD && index === sunriseRoutes.findIndex(r => r.id === `s${index+1}`);
      });
    }

    if (routeKey === 'daytime') {
      // Daytime circuit matches Samson -> Lakeshore, Lakeshore -> Moraine, Moraine -> Samson
      const paths = [
        { orig: 'samson', dest: 'lakeshore' },
        { orig: 'lakeshore', dest: 'moraine' },
        { orig: 'moraine', dest: 'samson' },
        // Also direct connections through transit
        { orig: 'samson', dest: 'moraine' }
      ];
      return paths.some(p => {
        const matchesO = origin === 'all' || p.orig === origin;
        const matchesD = dest === 'all' || p.dest === dest;
        return matchesO && matchesD;
      });
    }

    if (routeKey === 'evening') {
      const matchesO = origin === 'all' || origin === 'lakeshore';
      const matchesD = dest === 'all' || dest === 'banff';
      return matchesO && matchesD;
    }

    return false;
  };

  const activeMatchesFilters = matchesFilter(searchOrigin, searchDestination, activeTab);

  return (
    <section id="schedule" className="py-16 max-w-7xl mx-auto px-6">
      <div className="mb-12">
        <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-center text-slate-900 dark:text-white mb-4">
          Daily Shuttle Schedules
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-center max-w-2xl mx-auto text-sm sm:text-base">
          Browse daily shuttle timetables for Banff, Moraine Lake, and Lake Louise.
        </p>
      </div>

      {/* Interactive Search Filters */}
      <div className="max-w-3xl mx-auto mb-10 border border-slate-200 dark:border-slate-800 border-l-4 border-l-primary dark:border-l-accent bg-white dark:bg-[#101917] p-6 rounded-r-xl shadow-md">
        <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white mb-4">Quick Route Search</h3>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-5">
          <div className="flex-1 flex flex-col gap-2">
            <label htmlFor="filter-origin" className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">From (Origin)</label>
            <select
              id="filter-origin"
              value={searchOrigin}
              onChange={(e) => setSearchOrigin(e.target.value)}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-lg px-4 py-3 text-sm focus:border-primary-light dark:focus:border-accent focus:bg-white dark:focus:bg-[#101917] outline-none transition-all duration-200 focus:ring-3 focus:ring-accent/10"
            >
              {locations.map((loc) => (
                <option key={loc.value} value={loc.value} className="bg-white dark:bg-[#101917] text-slate-900 dark:text-white">{loc.label}</option>
              ))}
            </select>
          </div>

          <div className="text-xl text-slate-400 self-center hidden sm:block select-none pb-2.5">
            ⇄
          </div>

          <div className="flex-1 flex flex-col gap-2">
            <label htmlFor="filter-dest" className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">To (Destination)</label>
            <select
              id="filter-dest"
              value={searchDestination}
              onChange={(e) => setSearchDestination(e.target.value)}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-lg px-4 py-3 text-sm focus:border-primary-light dark:focus:border-accent focus:bg-white dark:focus:bg-[#101917] outline-none transition-all duration-200 focus:ring-3 focus:ring-accent/10"
            >
              {locations.map((loc) => (
                <option key={loc.value} value={loc.value} className="bg-white dark:bg-[#101917] text-slate-900 dark:text-white">{loc.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <button
          onClick={() => setActiveTab('sunrise')}
          className={`flex items-center gap-4 p-5 rounded-xl border cursor-pointer transition-all duration-200 text-left hover:translate-y-[-2px] ${
            activeTab === 'sunrise' 
              ? 'bg-primary border-primary text-white shadow-lg' 
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#101917] text-slate-800 dark:text-slate-200 hover:border-slate-350 dark:hover:border-slate-700 hover:shadow-md'
          }`}
        >
          <span className="text-2xl select-none">🌅</span>
          <div className="flex flex-col">
            <span className="font-display text-sm sm:text-base font-bold">Sunrise Express</span>
            <span className={`text-[10px] tracking-wide mt-0.5 ${activeTab === 'sunrise' ? 'text-white/80' : 'text-slate-500'}`}>Premium (4:30 AM - 6:50 AM)</span>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('daytime')}
          className={`flex items-center gap-4 p-5 rounded-xl border cursor-pointer transition-all duration-200 text-left hover:translate-y-[-2px] ${
            activeTab === 'daytime' 
              ? 'bg-primary border-primary text-white shadow-lg' 
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#101917] text-slate-800 dark:text-slate-200 hover:border-slate-350 dark:hover:border-slate-700 hover:shadow-md'
          }`}
        >
          <span className="text-2xl select-none">☀️</span>
          <div className="flex flex-col">
            <span className="font-display text-sm sm:text-base font-bold">Daytime Circuit</span>
            <span className={`text-[10px] tracking-wide mt-0.5 ${activeTab === 'daytime' ? 'text-white/80' : 'text-slate-500'}`}>Repeating (7:00 AM - 5:20 PM)</span>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('evening')}
          className={`flex items-center gap-4 p-5 rounded-xl border cursor-pointer transition-all duration-200 text-left hover:translate-y-[-2px] ${
            activeTab === 'evening' 
              ? 'bg-primary border-primary text-white shadow-lg' 
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#101917] text-slate-800 dark:text-slate-200 hover:border-slate-350 dark:hover:border-slate-700 hover:shadow-md'
          }`}
        >
          <span className="text-2xl select-none">🌇</span>
          <div className="flex flex-col">
            <span className="font-display text-sm sm:text-base font-bold">Evening Return</span>
            <span className={`text-[10px] tracking-wide mt-0.5 ${activeTab === 'evening' ? 'text-white/80' : 'text-slate-500'}`}>Banff Return (6:00 PM)</span>
          </div>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="p-6 sm:p-8 bg-white dark:bg-[#101917] border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg mb-10">
        {!activeMatchesFilters ? (
          <div className="text-center py-10 text-slate-500 dark:text-slate-400">
            <p>No direct routes found matching your origin and destination filters for this shuttle service.</p>
            <button 
              onClick={() => { setSearchOrigin('all'); setSearchDestination('all'); }} 
              className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-lg transition duration-150 cursor-pointer"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            {activeTab === 'sunrise' && (
              <div className="animate-fade-in">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide bg-accent-light dark:bg-accent-light/10 text-accent-hover dark:text-accent border border-accent">
                    Sunrise Premium Service
                  </span>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Perfect for sunrise photography at Moraine Lake. Reservations required.</p>
                </div>
                <div className="w-full overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#101917]">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead>
                      <tr className="bg-primary-dark/95 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                        <th className="text-white font-display font-semibold px-6 py-4 text-xs tracking-wider uppercase">Route Service</th>
                        <th className="text-white font-display font-semibold px-6 py-4 text-xs tracking-wider uppercase">Departure Time</th>
                        <th className="text-white font-display font-semibold px-6 py-4 text-xs tracking-wider uppercase">Est. Arrival</th>
                        <th className="text-white font-display font-semibold px-6 py-4 text-xs tracking-wider uppercase">Service Type</th>
                        <th className="text-white font-display font-semibold px-6 py-4 text-xs tracking-wider uppercase">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sunriseRoutes.map((route, i) => {
                        const isMatch = (searchOrigin === 'all' || 
                          (i === 0 && searchOrigin === 'banff') || 
                          (i === 1 && searchOrigin === 'moraine') || 
                          (i === 2 && searchOrigin === 'lakeshore')) &&
                          (searchDestination === 'all' || 
                          (i === 0 && searchDestination === 'moraine') || 
                          (i === 1 && searchDestination === 'lakeshore') || 
                          (i === 2 && searchDestination === 'samson'));
                        
                        return (
                          <tr key={route.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors duration-150" style={{ opacity: isMatch ? 1 : 0.35 }}>
                            <td className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200"><strong>{route.route}</strong></td>
                            <td className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 font-display font-extrabold text-sm sm:text-base text-primary dark:text-accent">{route.depart}</td>
                            <td className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 font-display font-extrabold text-sm sm:text-base text-primary dark:text-accent">{route.arrive}</td>
                            <td className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide ${route.type.includes('Premium') ? 'bg-accent-light dark:bg-accent-light/10 text-accent-hover dark:text-accent border border-accent' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700'}`}>
                                {route.type}
                              </span>
                            </td>
                            <td className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                              <button 
                                onClick={() => onOpenBooking('sunrise-express')} 
                                className="inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg border border-accent text-accent hover:bg-accent hover:text-primary-dark font-bold text-xs transition duration-150 hover:scale-[1.02] disabled:opacity-40 disabled:hover:scale-100 cursor-pointer disabled:cursor-not-allowed"
                                disabled={route.type.includes('Positioning')}
                              >
                                {route.type.includes('Positioning') ? 'Positioning Only' : 'Book'}
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'daytime' && (
              <div className="animate-fade-in">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    Daytime Repeating Circuit
                  </span>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    <strong>Pattern:</strong> Samson Mall → Lake Louise Lakeshore → Moraine Lake → Samson Mall.
                  </p>
                </div>
                <div className="w-full overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#101917]">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead>
                      <tr className="bg-primary-dark/95 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                        <th className="text-white font-display font-semibold px-6 py-4 text-xs tracking-wider uppercase">Circuit No.</th>
                        <th className="text-white font-display font-semibold px-6 py-4 text-xs tracking-wider uppercase">Samson Mall (Village)</th>
                        <th className="text-white font-display font-semibold px-6 py-4 text-xs tracking-wider uppercase">Lake Louise Lakeshore</th>
                        <th className="text-white font-display font-semibold px-6 py-4 text-xs tracking-wider uppercase">Moraine Lake</th>
                        <th className="text-white font-display font-semibold px-6 py-4 text-xs tracking-wider uppercase">Back to Samson Mall</th>
                        <th className="text-white font-display font-semibold px-6 py-4 text-xs tracking-wider uppercase">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {daytimeCircuits.map((circ) => {
                        return (
                          <tr key={circ.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors duration-150">
                            <td className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200"><strong>{circ.name}</strong></td>
                            <td className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 font-display font-extrabold text-sm sm:text-base text-amber-600 dark:text-accent-hover">{circ.samson}</td>
                            <td className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 font-display font-extrabold text-sm sm:text-base text-primary dark:text-accent">{circ.lakeshore}</td>
                            <td className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 font-display font-extrabold text-sm sm:text-base text-primary dark:text-accent">{circ.moraine}</td>
                            <td className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 font-display font-extrabold text-sm sm:text-base text-amber-600 dark:text-accent-hover">{circ.returnSamson}</td>
                            <td className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                              <button 
                                onClick={() => onOpenBooking('daytime-circuit')} 
                                className="inline-flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-lg bg-accent text-primary-dark hover:bg-accent-hover font-bold text-xs transition duration-150 hover:scale-[1.02] cursor-pointer"
                              >
                                Book
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'evening' && (
              <div className="animate-fade-in">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                    Banff Return Service
                  </span>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Standard evening departure back to Banff. Highly recommended to book in advance.</p>
                </div>
                <div className="w-full overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#101917]">
                  <table className="w-full border-collapse text-left text-sm">
                    <thead>
                      <tr className="bg-primary-dark/95 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
                        <th className="text-white font-display font-semibold px-6 py-4 text-xs tracking-wider uppercase">Route Service</th>
                        <th className="text-white font-display font-semibold px-6 py-4 text-xs tracking-wider uppercase">Departure Time</th>
                        <th className="text-white font-display font-semibold px-6 py-4 text-xs tracking-wider uppercase">Est. Arrival</th>
                        <th className="text-white font-display font-semibold px-6 py-4 text-xs tracking-wider uppercase">Service Type</th>
                        <th className="text-white font-display font-semibold px-6 py-4 text-xs tracking-wider uppercase">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {eveningRoutes.map((route) => {
                        return (
                          <tr key={route.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors duration-150">
                            <td className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200"><strong>{route.route}</strong></td>
                            <td className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 font-display font-extrabold text-sm sm:text-base text-primary dark:text-accent">{route.depart}</td>
                            <td className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 font-display font-extrabold text-sm sm:text-base text-primary dark:text-accent">{route.arrive}</td>
                            <td className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                {route.type}
                              </span>
                            </td>
                            <td className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
                              <button 
                                onClick={() => onOpenBooking('evening-return')} 
                                className="inline-flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-lg bg-accent text-primary-dark hover:bg-accent-hover font-bold text-xs transition duration-150 hover:scale-[1.02] cursor-pointer"
                              >
                                Book
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Important Travel Advisory */}
      <div className="border border-slate-200 dark:border-slate-800 p-6 sm:p-8 bg-white dark:bg-[#101917] rounded-xl shadow-md border-l-4 border-l-accent">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-lg select-none">⚠️</span>
          <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">Important Travel Notes & Guidelines</h4>
        </div>
        <ul className="list-none p-0 flex flex-col gap-3">
          <li className="relative pl-5 text-sm text-slate-500 dark:text-slate-400">
            <span className="absolute left-0 text-accent font-extrabold select-none">•</span>
            <strong>Arrive Early:</strong> Please arrive at your designated loading area at least <strong>10 minutes early</strong>. Shuttles depart precisely on time.
          </li>
          <li className="relative pl-5 text-sm text-slate-500 dark:text-slate-400">
            <span className="absolute left-0 text-accent font-extrabold select-none">•</span>
            <strong>Service Schedule Draft:</strong> This schedule is a draft prepared on May 03, 2026. Times are subject to minor modifications due to traffic, weather, and operational requirements.
          </li>
          <li className="relative pl-5 text-sm text-slate-500 dark:text-slate-400">
            <span className="absolute left-0 text-accent font-extrabold select-none">•</span>
            <strong>Stop Directions:</strong> Lake Louise Lakeshore and Moraine Lake stops must strictly follow designated/approved loading areas and staff instructions.
          </li>
          <li className="relative pl-5 text-sm text-slate-500 dark:text-slate-400">
            <span className="absolute left-0 text-accent font-extrabold select-none">•</span>
            <strong>Samson Mall Location:</strong> Samson Mall is the central pickup and drop-off point in Lake Louise Village.
          </li>
        </ul>
      </div>
    </section>
  );
}
