'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface TrackerState {
  timeString: string;
  activeService: string;
  status: 'en-route' | 'stopped' | 'resting' | 'closed';
  segment: string;
  progressPercent: number; // 0 to 100
  fromStation: string;
  toStation: string;
  etaMins: number;
}

export default function ShuttleTracker() {
  const [isLive, setIsLive] = useState<boolean>(true);
  const [simMinutes, setSimMinutes] = useState<number>(540); // Default to 9:00 AM (9 * 60)
  const [trackerState, setTrackerState] = useState<TrackerState>({
    timeString: '9:00 AM',
    activeService: 'Daytime Circuit (Circuit 2)',
    status: 'stopped',
    segment: 'Boarding at Samson Mall',
    progressPercent: 0,
    fromStation: 'Samson Mall',
    toStation: 'Lake Louise Lakeshore',
    etaMins: 15,
  });

  // Convert minutes of the day (e.g. 270 = 4:30 AM) to a nice 12-hour AM/PM string
  const minutesToTimeString = (mins: number): string => {
    const hours = Math.floor(mins / 60);
    const m = mins % 60;
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 === 0 ? 12 : hours % 12;
    const displayMinutes = m < 10 ? `0${m}` : m;
    return `${displayHours}:${displayMinutes} ${ampm}`;
  };

  // Convert Date object to Mountain Time minutes of the day
  const getMountainTimeMinutes = (): number => {
    const edmontonDate = new Date().toLocaleString('en-US', { timeZone: 'America/Edmonton' });
    const localDate = new Date(edmontonDate);
    return localDate.getHours() * 60 + localDate.getMinutes();
  };

  // Run the core calculation engine to locate shuttles at a specific time of day (minutes since midnight)
  const calculateShuttlePosition = useCallback((totalMinutes: number) => {
    const timeString = minutesToTimeString(totalMinutes);
    
    // Default closed state
    let activeService = 'No Active Shuttles';
    let status: 'en-route' | 'stopped' | 'resting' | 'closed' = 'closed';
    let segment = 'Depot / Overnight Parking';
    let progressPercent = 0;
    let fromStation = 'Banff Depot';
    let toStation = 'Banff Depot';
    let etaMins = 0;

    // A) Sunrise Express: 4:30 AM (270 mins) to 6:50 AM (410 mins)
    if (totalMinutes >= 270 && totalMinutes < 410) {
      activeService = 'Sunrise Express (Premium)';
      
      if (totalMinutes >= 270 && totalMinutes < 360) {
        // Banff -> Moraine Lake (4:30 AM - 6:00 AM, 90 mins)
        status = 'en-route';
        fromStation = 'Banff';
        toStation = 'Moraine Lake';
        const elapsed = totalMinutes - 270;
        progressPercent = Math.min(100, Math.floor((elapsed / 90) * 100));
        segment = 'Banff to Moraine Lake';
        etaMins = 360 - totalMinutes;
      } else if (totalMinutes >= 360 && totalMinutes < 370) {
        // Stopped at Moraine (6:00 AM - 6:10 AM, 10 mins)
        status = 'stopped';
        fromStation = 'Moraine Lake';
        toStation = 'Lake Louise Lakeshore';
        progressPercent = 100;
        segment = 'Unloading & Boarding at Moraine Lake';
        etaMins = 370 - totalMinutes;
      } else if (totalMinutes >= 370 && totalMinutes < 395) {
        // Moraine -> Lakeshore (6:10 AM - 6:35 AM, 25 mins)
        status = 'en-route';
        fromStation = 'Moraine Lake';
        toStation = 'Lake Louise Lakeshore';
        const elapsed = totalMinutes - 370;
        progressPercent = Math.min(100, Math.floor((elapsed / 25) * 100));
        segment = 'Positioning: Moraine Lake to Lake Louise Lakeshore';
        etaMins = 395 - totalMinutes;
      } else if (totalMinutes >= 395 && totalMinutes < 410) {
        // Lakeshore -> Samson Mall (6:35 AM - 6:50 AM, 15 mins)
        status = 'en-route';
        fromStation = 'Lake Louise Lakeshore';
        toStation = 'Samson Mall';
        const elapsed = totalMinutes - 395;
        progressPercent = Math.min(100, Math.floor((elapsed / 15) * 100));
        segment = 'Positioning: Lake Louise Lakeshore to Samson Mall';
        etaMins = 410 - totalMinutes;
      }
    }
    // Rest before daytime circuit (6:50 AM - 7:00 AM, 10 mins)
    else if (totalMinutes >= 410 && totalMinutes < 420) {
      activeService = 'Preparing for Daytime Circuit';
      status = 'resting';
      fromStation = 'Samson Mall';
      toStation = 'Lake Louise Lakeshore';
      progressPercent = 0;
      segment = 'Layover / Preparing bus at Samson Mall';
      etaMins = 420 - totalMinutes;
    }
    // B) Daytime Circuit (repeating)
    // Samson Mall -> Lake Louise Lakeshore -> Moraine Lake -> Samson Mall
    else if (totalMinutes >= 420 && totalMinutes < 1040) {
      // 7:00 AM (420 mins) to 5:20 PM (1040 mins)
      const circuits = [
        { start: 420, label: 'Daytime Circuit 1' }, // 7:00 AM
        { start: 540, label: 'Daytime Circuit 2' }, // 9:00 AM
        { start: 660, label: 'Daytime Circuit 3' }, // 11:00 AM
        { start: 810, label: 'Daytime Circuit 4' }, // 1:30 PM (810 mins)
        { start: 930, label: 'Daytime Circuit 5' }  // 3:30 PM (930 mins)
      ];

      // Find which circuit we are currently in or resting after
      let activeCirc = circuits[0];
      for (let i = 0; i < circuits.length; i++) {
        if (totalMinutes >= circuits[i].start) {
          activeCirc = circuits[i];
        }
      }

      activeService = activeCirc.label;
      const start = activeCirc.start;

      // Circuit duration structure (110 mins total):
      // 0 - 15 mins: Samson -> LL Lakeshore (15 mins)
      // 15 - 40 mins: Lakeshore -> Moraine (25 mins)
      // 40 - 110 mins: Moraine -> Samson Mall (70 mins)
      const relativeMin = totalMinutes - start;

      if (relativeMin >= 0 && relativeMin < 15) {
        status = 'en-route';
        fromStation = 'Samson Mall';
        toStation = 'Lake Louise Lakeshore';
        progressPercent = Math.min(100, Math.floor((relativeMin / 15) * 100));
        segment = 'Samson Mall to Lake Louise Lakeshore';
        etaMins = 15 - relativeMin;
      } else if (relativeMin >= 15 && relativeMin < 40) {
        status = 'en-route';
        fromStation = 'Lake Louise Lakeshore';
        toStation = 'Moraine Lake';
        const elapsed = relativeMin - 15;
        progressPercent = Math.min(100, Math.floor((elapsed / 25) * 100));
        segment = 'Lake Louise Lakeshore to Moraine Lake';
        etaMins = 40 - relativeMin;
      } else if (relativeMin >= 40 && relativeMin < 110) {
        status = 'en-route';
        fromStation = 'Moraine Lake';
        toStation = 'Samson Mall';
        const elapsed = relativeMin - 40;
        progressPercent = Math.min(100, Math.floor((elapsed / 70) * 100));
        segment = 'Moraine Lake to Samson Mall (Village)';
        etaMins = 110 - relativeMin;
      } else {
        // Layover/Rest period between circuits
        status = 'resting';
        fromStation = 'Samson Mall';
        toStation = 'Samson Mall';
        progressPercent = 100;
        segment = 'Layover / Rest Break at Samson Mall';
        
        // Find next circuit start
        const curIndex = circuits.findIndex(c => c.start === start);
        if (curIndex < circuits.length - 1) {
          const nextStart = circuits[curIndex + 1].start;
          etaMins = nextStart - totalMinutes;
          toStation = 'Lake Louise Lakeshore';
        } else {
          // Last circuit ends, preparing for evening return
          etaMins = 1080 - totalMinutes; // Preparing for 6:00 PM (1080)
          toStation = 'Lake Louise Lakeshore';
        }
      }
    }
    // Preparing for Evening Return: 5:20 PM (1040 mins) to 6:00 PM (1080 mins)
    else if (totalMinutes >= 1040 && totalMinutes < 1080) {
      activeService = 'Preparing for Evening Return';
      status = 'resting';
      fromStation = 'Samson Mall';
      toStation = 'Lake Louise Lakeshore';
      progressPercent = Math.min(100, Math.floor(((totalMinutes - 1040) / 40) * 100));
      segment = 'Positioning/Resting: Samson Mall to Lake Louise Lakeshore';
      etaMins = 1080 - totalMinutes;
    }
    // C) Evening Return: 6:00 PM (1080 mins) to 7:15 PM (1155 mins)
    else if (totalMinutes >= 1080 && totalMinutes < 1155) {
      activeService = 'Evening Return';
      status = 'en-route';
      fromStation = 'Lake Louise Lakeshore';
      toStation = 'Banff';
      const elapsed = totalMinutes - 1080;
      progressPercent = Math.min(100, Math.floor((elapsed / 75) * 100));
      segment = 'Lake Louise Lakeshore to Banff (Evening Return)';
      etaMins = 1155 - totalMinutes;
    }
    // Night depot: After 7:15 PM (1155 mins) or Before 4:30 AM (270 mins)
    else {
      activeService = 'Closed / Depot';
      status = 'closed';
      segment = 'Services ended for the day. Buses parked in depot.';
      fromStation = 'Banff Depot';
      toStation = 'Banff Depot';
      progressPercent = 0;
      etaMins = totalMinutes < 270 ? 270 - totalMinutes : (1440 - totalMinutes) + 270;
    }

    setTrackerState({
      timeString,
      activeService,
      status,
      segment,
      progressPercent,
      fromStation,
      toStation,
      etaMins
    });
  }, []);

  // Run calculation on effect
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (isLive) {
      const updateTracker = () => {
        const liveMinutes = getMountainTimeMinutes();
        calculateShuttlePosition(liveMinutes);
      };

      updateTracker();
      const interval = setInterval(updateTracker, 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    } else {
      calculateShuttlePosition(simMinutes);
    }
  }, [isLive, simMinutes, calculateShuttlePosition]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSimMinutes(parseInt(e.target.value));
  };

  const getStatusBadgeStyles = (status: string) => {
    switch (status) {
      case 'en-route': return 'bg-amber-100 dark:bg-amber-950/30 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50';
      case 'stopped': return 'bg-emerald-100 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50';
      case 'resting': return 'bg-blue-100 dark:bg-blue-950/30 text-blue-800 dark:text-blue-400 border border-blue-200 dark:border-blue-900/50';
      default: return 'bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-800';
    }
  };

  return (
    <section id="tracker" className="py-16 max-w-7xl mx-auto px-6">
      <div className="mb-12">
        <h2 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-center text-slate-900 dark:text-white mb-4">
          Live Shuttle Tracker & Simulator
        </h2>
        <p className="text-slate-500 dark:text-slate-400 text-center max-w-2xl mx-auto text-sm sm:text-base">
          Monitor active shuttles in real-time or use the slider to simulate bus positions throughout the day.
        </p>
      </div>

      <div className="p-6 sm:p-8 bg-white dark:bg-[#101917] border border-slate-200 dark:border-slate-800 rounded-[20px] shadow-md max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-8 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div className="flex flex-col gap-1.5">
            <span className="inline-flex items-center gap-2 text-[10px] font-extrabold tracking-widest px-3 py-1 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-fit select-none">
              <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse' : 'bg-accent shadow-[0_0_8px_var(--color-accent)]'}`} />
              {isLive ? 'LIVE' : 'SIMULATION'}
            </span>
            <h3 className="font-display text-3xl font-extrabold text-slate-900 dark:text-white leading-none mt-1">
              {trackerState.timeString}
            </h3>
          </div>

          {/* Toggle controls */}
          <div className="flex bg-slate-50 dark:bg-slate-900/50 p-1 rounded-lg border border-slate-200 dark:border-slate-800">
            <button 
              onClick={() => setIsLive(true)} 
              className={`px-4 py-2 text-xs font-bold rounded-md transition-all duration-200 cursor-pointer ${isLive ? 'bg-white dark:bg-[#101917] text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
            >
              Live Mountain Time
            </button>
            <button 
              onClick={() => setIsLive(false)} 
              className={`px-4 py-2 text-xs font-bold rounded-md transition-all duration-200 cursor-pointer ${!isLive ? 'bg-white dark:bg-[#101917] text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
            >
              Time Travel Slider
            </button>
          </div>
        </div>

        {/* Simulator Slider Container */}
        {!isLive && (
          <div className="bg-slate-50 dark:bg-slate-900/25 border border-slate-200 dark:border-slate-800 p-6 rounded-xl mb-8 animate-fade-in">
            <div className="flex justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase mb-3 tracking-wider">
              <span>Sunrise Express (4:30 AM)</span>
              <span>Noon (12:00 PM)</span>
              <span>Evening Return (6:00 PM)</span>
              <span>Night Depot (8:00 PM)</span>
            </div>
            <input 
              type="range" 
              min={240} // 4:00 AM
              max={1230} // 8:30 PM
              step={5}
              value={simMinutes}
              onChange={handleSliderChange}
              className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer mb-4 accent-accent"
            />
            <div className="text-sm text-slate-500 dark:text-slate-400 text-center">
              Simulating Time: <strong className="text-primary dark:text-accent font-bold">{minutesToTimeString(simMinutes)}</strong>
            </div>
          </div>
        )}

        {/* Visual Progress Bar (The Route Segment) */}
        <div className="my-12 relative px-4">
          <div className="flex justify-between relative z-10 pointer-events-none">
            <div className="flex flex-col items-start gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-white dark:bg-[#101917] border-3 border-primary dark:border-accent shadow-sm" />
              <span className="font-display text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">{trackerState.fromStation}</span>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-white dark:bg-[#101917] border-3 border-primary dark:border-accent shadow-sm" />
              <span className="font-display text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">{trackerState.toStation}</span>
            </div>
          </div>

          <div className="absolute top-[5px] left-8 right-8 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full z-0">
            {/* The fill line */}
            <div 
              className="h-full bg-accent rounded-full transition-all duration-500 ease-out" 
              style={{ width: `${trackerState.status === 'closed' ? 0 : trackerState.progressPercent}%` }}
            />
            
            {/* The moving bus icon */}
            {trackerState.status !== 'closed' && (
              <div 
                className="absolute -top-3.5 transform -translate-x-1/2 text-2xl transition-all duration-500 ease-out z-25 select-none"
                style={{ 
                  left: `${trackerState.progressPercent}%`,
                  animation: trackerState.status === 'en-route' ? 'busDrive 0.6s infinite ease' : 'none' 
                }}
              >
                🚌
              </div>
            )}
          </div>
        </div>

        {/* Telemetry Data Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
          <div className="bg-slate-50 dark:bg-slate-900/30 border border-slate-200/50 dark:border-slate-800 p-5 rounded-xl flex flex-col gap-2">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active Service Route</span>
            <span className="font-display text-sm font-bold text-slate-900 dark:text-white leading-tight">{trackerState.activeService}</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/30 border border-slate-200/50 dark:border-slate-800 p-5 rounded-xl flex flex-col gap-2">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Current Sector</span>
            <span className="font-display text-sm font-bold text-slate-900 dark:text-white leading-tight">{trackerState.segment}</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/30 border border-slate-200/50 dark:border-slate-800 p-5 rounded-xl flex flex-col gap-2">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Transit Status</span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide w-fit mt-1 ${getStatusBadgeStyles(trackerState.status)}`}>
              {trackerState.status === 'en-route' && 'En Route'}
              {trackerState.status === 'stopped' && 'Boarding'}
              {trackerState.status === 'resting' && 'Layover'}
              {trackerState.status === 'closed' && 'Closed'}
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-900/30 border border-slate-200/50 dark:border-slate-800 p-5 rounded-xl flex flex-col gap-2">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              {trackerState.status === 'closed' ? 'Next Departure In' : 'Est. Destination Arrival'}
            </span>
            <span className="font-display text-sm font-bold text-amber-600 dark:text-accent leading-tight">
              {trackerState.status === 'closed' 
                ? `${Math.floor(trackerState.etaMins / 60)}h ${trackerState.etaMins % 60}m`
                : trackerState.status === 'resting'
                  ? `Departs in ${trackerState.etaMins} mins`
                  : `${trackerState.etaMins} mins`
              }
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
