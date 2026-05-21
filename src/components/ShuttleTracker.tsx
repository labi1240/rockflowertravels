'use client';

import React, { useState, useEffect } from 'react';

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
  const calculateShuttlePosition = (totalMinutes: number) => {
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
  };

  // Run calculation on effect
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
  }, [isLive, simMinutes]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSimMinutes(parseInt(e.target.value));
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'en-route': return 'badge-premium';
      case 'stopped': return 'badge-info';
      case 'resting': return 'badge-info';
      default: return 'badge-closed';
    }
  };

  return (
    <section id="tracker" className="tracker-section container">
      <div className="section-header">
        <h2 className="section-title text-center">Live Shuttle Tracker & Simulator</h2>
        <p className="section-subtitle text-center">
          Monitor active shuttles in real-time or use the slider to simulate bus positions throughout the day.
        </p>
      </div>

      <div className="tracker-layout card">
        <div className="tracker-header-row">
          <div className="time-display-container">
            <span className="live-badge-tracker">
              <span className={`pulse-dot ${isLive ? 'active-pulse' : 'inactive-pulse'}`}></span>
              {isLive ? 'LIVE' : 'SIMULATION'}
            </span>
            <h3 className="tracker-time-text">{trackerState.timeString}</h3>
          </div>

          {/* Toggle controls */}
          <div className="tracker-toggle-controls">
            <button 
              onClick={() => setIsLive(true)} 
              className={`toggle-btn ${isLive ? 'active-toggle' : ''}`}
            >
              Live Mountain Time
            </button>
            <button 
              onClick={() => setIsLive(false)} 
              className={`toggle-btn ${!isLive ? 'active-toggle' : ''}`}
            >
              Time Travel Slider
            </button>
          </div>
        </div>

        {/* Simulator Slider Container */}
        {!isLive && (
          <div className="slider-container animate-fade-in">
            <div className="slider-labels">
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
              className="time-slider"
            />
            <div className="slider-current-label">
              Simulating Time: <strong>{minutesToTimeString(simMinutes)}</strong>
            </div>
          </div>
        )}

        {/* Visual Progress Bar (The Route Segment) */}
        <div className="visual-progress-container">
          <div className="station-nodes-row">
            <div className="progress-station">
              <span className="station-dot-tracker"></span>
              <span className="station-name-tracker">{trackerState.fromStation}</span>
            </div>
            <div className="progress-station">
              <span className="station-dot-tracker"></span>
              <span className="station-name-tracker">{trackerState.toStation}</span>
            </div>
          </div>

          <div className="progress-track-bar">
            {/* The fill line */}
            <div 
              className="progress-track-fill" 
              style={{ width: `${trackerState.status === 'closed' ? 0 : trackerState.progressPercent}%` }}
            ></div>
            
            {/* The moving bus icon */}
            {trackerState.status !== 'closed' && (
              <div 
                className="moving-bus-marker"
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
        <div className="telemetry-grid">
          <div className="telemetry-card">
            <span className="telemetry-lbl">Active Service Route</span>
            <span className="telemetry-val">{trackerState.activeService}</span>
          </div>

          <div className="telemetry-card">
            <span className="telemetry-lbl">Current Sector</span>
            <span className="telemetry-val">{trackerState.segment}</span>
          </div>

          <div className="telemetry-card">
            <span className="telemetry-lbl">Transit Status</span>
            <span className={`badge ${getStatusBadgeClass(trackerState.status)} telemetry-badge`}>
              {trackerState.status === 'en-route' && 'En Route'}
              {trackerState.status === 'stopped' && 'Boarding / Unloading'}
              {trackerState.status === 'resting' && 'Layover Rest'}
              {trackerState.status === 'closed' && 'Service Closed'}
            </span>
          </div>

          <div className="telemetry-card">
            <span className="telemetry-lbl">
              {trackerState.status === 'closed' ? 'Next Departure In' : 'Est. Destination Arrival'}
            </span>
            <span className="telemetry-val timer-val">
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
