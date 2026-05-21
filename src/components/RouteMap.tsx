'use client';

import React, { useState } from 'react';

interface StopDetails {
  name: string;
  role: string;
  notes: string[];
  tips: string;
}

export default function RouteMap() {
  const [selectedRouteFilter, setSelectedRouteFilter] = useState<'all' | 'sunrise' | 'daytime' | 'evening'>('all');
  const [activeStop, setActiveStop] = useState<string | null>(null);

  const stops: Record<string, StopDetails> = {
    banff: {
      name: 'Banff (Townsite)',
      role: 'Primary Origin & Terminal',
      notes: [
        'Sunrise Express departs from Banff at 4:30 AM.',
        'Evening Return arrives back in Banff at 7:15 PM.'
      ],
      tips: 'Perfect starting point for visitors staying in the town of Banff. Overnight parking is available in the public transit hub.'
    },
    samson: {
      name: 'Samson Mall (Lake Louise Village)',
      role: 'Main Daytime Hub',
      notes: [
        'Samson Mall = Lake Louise Village main pickup point.',
        'Buses depart on the Daytime Circuit every 2 hours starting at 7:00 AM.'
      ],
      tips: 'Located in the heart of Lake Louise Village. Features retail, food, and restroom amenities while you wait.'
    },
    lakeshore: {
      // LL Lakeshore
      name: 'Lake Louise Lakeshore',
      role: 'Daytime Stop & Evening Return Terminal',
      notes: [
        'Must follow designated/approved loading areas and staff direction.',
        'Final departure back to Banff departs from here at 6:00 PM.'
      ],
      tips: 'Look for the RockFlower Travels signpost near the public shuttle loops. Staff will guide you to your loading bay.'
    },
    moraine: {
      name: 'Moraine Lake',
      role: 'Scenic Destination Stop',
      notes: [
        'Sunrise Express arrives here at 6:00 AM for premium sunrise viewings.',
        'Must follow designated/approved loading areas and staff direction.'
      ],
      tips: 'Private vehicles are restricted. Our shuttle is the best way to secure guaranteed, stress-free access to Moraine Lake.'
    }
  };

  const handleStopClick = (key: string) => {
    setActiveStop(activeStop === key ? null : key);
  };

  return (
    <section id="map" className="py-16 max-w-7xl mx-auto px-6">
      <div className="mb-12">
        <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-center text-slate-900 dark:text-white mb-4">
          Interactive Route Map
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-center max-w-2xl mx-auto text-sm sm:text-base">
          Explore our routes connecting Banff, Samson Mall, Lake Louise Lakeshore, and Moraine Lake. Click a stop to view details.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* SVG Route Map */}
        <div className="w-full flex-1 bg-white dark:bg-[#101917] border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg p-6 flex flex-col gap-6">
          {/* Route Map Controls */}
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => setSelectedRouteFilter('all')} 
              className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg border transition-all duration-150 cursor-pointer ${
                selectedRouteFilter === 'all'
                  ? 'bg-primary border-primary text-white dark:bg-accent dark:border-accent dark:text-primary-dark shadow-md'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              All Routes
            </button>
            <button 
              onClick={() => setSelectedRouteFilter('sunrise')} 
              className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg border transition-all duration-150 cursor-pointer ${
                selectedRouteFilter === 'sunrise'
                  ? 'bg-primary border-primary text-white dark:bg-accent dark:border-accent dark:text-primary-dark shadow-md'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              🌅 Sunrise Express
            </button>
            <button 
              onClick={() => setSelectedRouteFilter('daytime')} 
              className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg border transition-all duration-150 cursor-pointer ${
                selectedRouteFilter === 'daytime'
                  ? 'bg-primary border-primary text-white dark:bg-accent dark:border-accent dark:text-primary-dark shadow-md'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              ☀️ Daytime Circuit
            </button>
            <button 
              onClick={() => setSelectedRouteFilter('evening')} 
              className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg border transition-all duration-150 cursor-pointer ${
                selectedRouteFilter === 'evening'
                  ? 'bg-primary border-primary text-white dark:bg-accent dark:border-accent dark:text-primary-dark shadow-md'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-350 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              🌇 Evening Return
            </button>
          </div>

          <div className="relative w-full aspect-[3/2] bg-slate-100 dark:bg-[#0c1312] border border-slate-100 dark:border-slate-800 rounded-lg overflow-hidden flex items-center justify-center p-2">
            <svg viewBox="0 0 600 400" className="w-full h-full select-none">
              {/* Definitions for gradients and markers */}
              <defs>
                <linearGradient id="sunriseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#d4af37" />
                  <stop offset="100%" stopColor="#f39c12" />
                </linearGradient>
                <linearGradient id="daytimeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2ecc71" />
                  <stop offset="100%" stopColor="#1abc9c" />
                </linearGradient>
                <linearGradient id="eveningGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#9b59b6" />
                  <stop offset="100%" stopColor="#34495e" />
                </linearGradient>
                <marker id="arrow" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 2 L 8 5 L 0 8 z" fill="var(--text-secondary)" />
                </marker>
              </defs>

              {/* Mountains representation in SVG for background aesthetics */}
              <path d="M 50 350 L 150 200 L 250 350 Z" className="fill-[#0f342e]/[0.05] dark:fill-white/[0.02]" />
              <path d="M 200 350 L 320 180 L 440 350 Z" className="fill-[#0f342e]/[0.03] dark:fill-white/[0.01]" />
              <path d="M 380 350 L 480 220 L 580 350 Z" className="fill-[#0f342e]/[0.05] dark:fill-white/[0.02]" />

              {/* Connecting Paths */}
              
              {/* A) Sunrise Express: Banff -> Moraine Lake -> Lakeshore -> Samson */}
              <path 
                d="M 120 320 Q 300 340 480 120" 
                fill="none" 
                stroke="url(#sunriseGrad)" 
                strokeWidth={selectedRouteFilter === 'sunrise' || selectedRouteFilter === 'all' ? 4 : 1}
                strokeDasharray="8 6"
                className={`transition-all duration-300 ${selectedRouteFilter === 'sunrise' ? 'opacity-100' : ''} ${selectedRouteFilter !== 'sunrise' && selectedRouteFilter !== 'all' ? 'opacity-15' : 'opacity-80'}`}
              />
              <path 
                d="M 480 120 Q 430 90 380 120" 
                fill="none" 
                stroke="url(#sunriseGrad)" 
                strokeWidth={selectedRouteFilter === 'sunrise' || selectedRouteFilter === 'all' ? 4 : 1}
                strokeDasharray="6 4"
                className={`transition-all duration-300 ${selectedRouteFilter === 'sunrise' ? 'opacity-100' : ''} ${selectedRouteFilter !== 'sunrise' && selectedRouteFilter !== 'all' ? 'opacity-15' : 'opacity-80'}`}
              />
              <path 
                d="M 380 120 Q 330 150 280 220" 
                fill="none" 
                stroke="url(#sunriseGrad)" 
                strokeWidth={selectedRouteFilter === 'sunrise' || selectedRouteFilter === 'all' ? 4 : 1}
                strokeDasharray="6 4"
                className={`transition-all duration-300 ${selectedRouteFilter === 'sunrise' ? 'opacity-100' : ''} ${selectedRouteFilter !== 'sunrise' && selectedRouteFilter !== 'all' ? 'opacity-15' : 'opacity-80'}`}
              />

              {/* B) Daytime Circuit: Samson Mall -> LL Lakeshore -> Moraine Lake -> Samson Mall */}
              {/* Samson -> Lakeshore */}
              <path 
                d="M 280 220 Q 320 160 380 120" 
                fill="none" 
                stroke="url(#daytimeGrad)" 
                strokeWidth={selectedRouteFilter === 'daytime' || selectedRouteFilter === 'all' ? 4 : 1}
                className={`transition-all duration-300 ${selectedRouteFilter === 'daytime' ? 'opacity-100' : ''} ${selectedRouteFilter !== 'daytime' && selectedRouteFilter !== 'all' ? 'opacity-15' : 'opacity-80'}`}
              />
              {/* Lakeshore -> Moraine */}
              <path 
                d="M 380 120 Q 430 100 480 120" 
                fill="none" 
                stroke="url(#daytimeGrad)" 
                strokeWidth={selectedRouteFilter === 'daytime' || selectedRouteFilter === 'all' ? 4 : 1}
                className={`transition-all duration-300 ${selectedRouteFilter === 'daytime' ? 'opacity-100' : ''} ${selectedRouteFilter !== 'daytime' && selectedRouteFilter !== 'all' ? 'opacity-15' : 'opacity-80'}`}
              />
              {/* Moraine -> Samson */}
              <path 
                d="M 480 120 Q 380 180 280 220" 
                fill="none" 
                stroke="url(#daytimeGrad)" 
                strokeWidth={selectedRouteFilter === 'daytime' || selectedRouteFilter === 'all' ? 4 : 1}
                className={`transition-all duration-300 ${selectedRouteFilter === 'daytime' ? 'opacity-100' : ''} ${selectedRouteFilter !== 'daytime' && selectedRouteFilter !== 'all' ? 'opacity-15' : 'opacity-80'}`}
              />

              {/* C) Evening Return: Lake Louise Lakeshore -> Banff */}
              <path 
                d="M 380 120 Q 250 250 120 320" 
                fill="none" 
                stroke="url(#eveningGrad)" 
                strokeWidth={selectedRouteFilter === 'evening' || selectedRouteFilter === 'all' ? 4 : 1}
                strokeDasharray="10 5"
                className={`transition-all duration-300 ${selectedRouteFilter === 'evening' ? 'opacity-100' : ''} ${selectedRouteFilter !== 'evening' && selectedRouteFilter !== 'all' ? 'opacity-15' : 'opacity-80'}`}
              />

              {/* Stops Nodes (Markers) */}
              
              {/* 1. Banff */}
              <g 
                onClick={() => handleStopClick('banff')}
                className="cursor-pointer group"
              >
                <circle 
                  cx="120" 
                  cy="320" 
                  r="12" 
                  className={`fill-white dark:fill-[#101917] transition-all duration-200 group-hover:r-[14px] ${
                    activeStop === 'banff' 
                      ? 'stroke-accent stroke-[4px]' 
                      : 'stroke-primary dark:stroke-slate-700 stroke-[3px]'
                  }`} 
                />
                <circle cx="120" cy="320" r="6" className="fill-primary dark:fill-accent group-hover:r-[7px] transition-all duration-200" />
                <text x="120" y="352" textAnchor="middle" className="font-display font-bold text-xs fill-slate-700 dark:fill-slate-300 pointer-events-none group-hover:fill-primary dark:group-hover:fill-accent transition-colors duration-155">Banff</text>
              </g>

              {/* 2. Samson Mall */}
              <g 
                onClick={() => handleStopClick('samson')}
                className="cursor-pointer group"
              >
                <circle 
                  cx="280" 
                  cy="220" 
                  r="12" 
                  className={`fill-white dark:fill-[#101917] transition-all duration-200 group-hover:r-[14px] ${
                    activeStop === 'samson' 
                      ? 'stroke-accent stroke-[4px]' 
                      : 'stroke-primary dark:stroke-slate-700 stroke-[3px]'
                  }`} 
                />
                <circle cx="280" cy="220" r="6" className="fill-primary dark:fill-accent group-hover:r-[7px] transition-all duration-200" />
                <text x="280" y="252" textAnchor="middle" className="font-display font-bold text-xs fill-slate-700 dark:fill-slate-300 pointer-events-none group-hover:fill-primary dark:group-hover:fill-accent transition-colors duration-155">Samson Mall (Village)</text>
              </g>

              {/* 3. Lake Louise Lakeshore */}
              <g 
                onClick={() => handleStopClick('lakeshore')}
                className="cursor-pointer group"
              >
                <circle 
                  cx="380" 
                  cy="120" 
                  r="12" 
                  className={`fill-white dark:fill-[#101917] transition-all duration-200 group-hover:r-[14px] ${
                    activeStop === 'lakeshore' 
                      ? 'stroke-accent stroke-[4px]' 
                      : 'stroke-primary dark:stroke-slate-700 stroke-[3px]'
                  }`} 
                />
                <circle cx="380" cy="120" r="6" className="fill-primary dark:fill-accent group-hover:r-[7px] transition-all duration-200" />
                <text x="380" y="94" textAnchor="middle" className="font-display font-bold text-xs fill-slate-700 dark:fill-slate-300 pointer-events-none group-hover:fill-primary dark:group-hover:fill-accent transition-colors duration-155">Lake Louise Lakeshore</text>
              </g>

              {/* 4. Moraine Lake */}
              <g 
                onClick={() => handleStopClick('moraine')}
                className="cursor-pointer group"
              >
                <circle 
                  cx="480" 
                  cy="120" 
                  r="12" 
                  className={`fill-white dark:fill-[#101917] transition-all duration-200 group-hover:r-[14px] ${
                    activeStop === 'moraine' 
                      ? 'stroke-accent stroke-[4px]' 
                      : 'stroke-primary dark:stroke-slate-700 stroke-[3px]'
                  }`} 
                />
                <circle cx="480" cy="120" r="6" className="fill-primary dark:fill-accent group-hover:r-[7px] transition-all duration-200" />
                <text x="480" y="94" textAnchor="middle" className="font-display font-bold text-xs fill-slate-700 dark:fill-slate-300 pointer-events-none group-hover:fill-primary dark:group-hover:fill-accent transition-colors duration-155">Moraine Lake</text>
              </g>
            </svg>
          </div>
        </div>

        {/* Info Card Sidebar */}
        <div className="w-full lg:w-[350px] shrink-0 self-stretch">
          {activeStop ? (
            <div className="h-full bg-white dark:bg-[#101917] border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg p-6 animate-fade-in flex flex-col gap-5 justify-between">
              <div className="flex flex-col gap-4">
                <span className="inline-flex self-start items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide bg-accent-light dark:bg-accent-light/10 text-accent-hover dark:text-accent border border-accent">
                  📍 Selected Station
                </span>
                <h3 className="font-display text-xl font-extrabold text-slate-900 dark:text-white">{stops[activeStop].name}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-350">
                  <strong className="text-slate-800 dark:text-slate-200">Role:</strong> {stops[activeStop].role}
                </p>
                
                <div className="flex flex-col gap-2 mt-2">
                  <h4 className="font-display text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Pickup & Stop Notes</h4>
                  <ul className="list-none p-0 flex flex-col gap-2 text-sm text-slate-500 dark:text-slate-400">
                    {stops[activeStop].notes.map((note, idx) => (
                      <li key={idx} className="relative pl-4">
                        <span className="absolute left-0 text-accent font-extrabold select-none">•</span>
                        {note}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <h4 className="font-display text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">Travel Tip</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/60 p-3.5 rounded-lg border border-slate-100 dark:border-slate-800 italic">
                  {stops[activeStop].tips}
                </p>
              </div>
            </div>
          ) : (
            <div className="h-full bg-white dark:bg-[#101917] border border-slate-200 dark:border-slate-800 rounded-xl shadow-md p-6 flex flex-col items-center text-center justify-center min-h-[350px] gap-5">
              <span className="text-4xl select-none mb-2">💡</span>
              <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">Station Information</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 max-w-[260px] leading-relaxed">
                Click any marker on the map to view specific station loading bays, guidelines, and shuttle departure notes.
              </p>
              <div className="flex gap-4 mt-2 w-full justify-center">
                <div className="flex flex-col items-center bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 px-4 py-2.5 rounded-lg min-w-[100px]">
                  <span className="font-display text-2xl font-extrabold text-primary dark:text-accent">4</span>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-0.5">Stations</span>
                </div>
                <div className="flex flex-col items-center bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 px-4 py-2.5 rounded-lg min-w-[100px]">
                  <span className="font-display text-2xl font-extrabold text-primary dark:text-accent">5</span>
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-0.5">Daily Loops</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
