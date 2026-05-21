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
    <section id="map" className="map-section container">
      <div className="section-header">
        <h2 className="section-title text-center">Interactive Route Map</h2>
        <p className="section-subtitle text-center">
          Explore our routes connecting Banff, Samson Mall, Lake Louise Lakeshore, and Moraine Lake. Click a stop to view details.
        </p>
      </div>

      <div className="map-layout">
        {/* SVG Route Map */}
        <div className="map-container card">
          {/* Route Map Controls */}
          <div className="map-controls">
            <button 
              onClick={() => setSelectedRouteFilter('all')} 
              className={`map-control-btn ${selectedRouteFilter === 'all' ? 'active' : ''}`}
            >
              All Routes
            </button>
            <button 
              onClick={() => setSelectedRouteFilter('sunrise')} 
              className={`map-control-btn ${selectedRouteFilter === 'sunrise' ? 'active' : ''}`}
            >
              🌅 Sunrise Express
            </button>
            <button 
              onClick={() => setSelectedRouteFilter('daytime')} 
              className={`map-control-btn ${selectedRouteFilter === 'daytime' ? 'active' : ''}`}
            >
              ☀️ Daytime Circuit
            </button>
            <button 
              onClick={() => setSelectedRouteFilter('evening')} 
              className={`map-control-btn ${selectedRouteFilter === 'evening' ? 'active' : ''}`}
            >
              🌇 Evening Return
            </button>
          </div>

          <div className="svg-wrapper">
            <svg viewBox="0 0 600 400" className="route-svg">
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
              <path d="M 50 350 L 150 200 L 250 350 Z" fill="rgba(15, 52, 46, 0.05)" />
              <path d="M 200 350 L 320 180 L 440 350 Z" fill="rgba(15, 52, 46, 0.03)" />
              <path d="M 380 350 L 480 220 L 580 350 Z" fill="rgba(15, 52, 46, 0.05)" />

              {/* Connecting Paths */}
              
              {/* A) Sunrise Express: Banff -> Moraine Lake -> Lakeshore -> Samson */}
              <path 
                d="M 120 320 Q 300 340 480 120" 
                fill="none" 
                stroke="url(#sunriseGrad)" 
                strokeWidth={selectedRouteFilter === 'sunrise' || selectedRouteFilter === 'all' ? 4 : 1}
                strokeDasharray="8 6"
                className={`svg-path ${selectedRouteFilter === 'sunrise' ? 'active-path' : ''} ${selectedRouteFilter !== 'sunrise' && selectedRouteFilter !== 'all' ? 'dimmed-path' : ''}`}
              />
              <path 
                d="M 480 120 Q 430 90 380 120" 
                fill="none" 
                stroke="url(#sunriseGrad)" 
                strokeWidth={selectedRouteFilter === 'sunrise' || selectedRouteFilter === 'all' ? 4 : 1}
                strokeDasharray="6 4"
                className={`svg-path ${selectedRouteFilter === 'sunrise' ? 'active-path' : ''} ${selectedRouteFilter !== 'sunrise' && selectedRouteFilter !== 'all' ? 'dimmed-path' : ''}`}
              />
              <path 
                d="M 380 120 Q 330 150 280 220" 
                fill="none" 
                stroke="url(#sunriseGrad)" 
                strokeWidth={selectedRouteFilter === 'sunrise' || selectedRouteFilter === 'all' ? 4 : 1}
                strokeDasharray="6 4"
                className={`svg-path ${selectedRouteFilter === 'sunrise' ? 'active-path' : ''} ${selectedRouteFilter !== 'sunrise' && selectedRouteFilter !== 'all' ? 'dimmed-path' : ''}`}
              />

              {/* B) Daytime Circuit: Samson Mall -> LL Lakeshore -> Moraine Lake -> Samson Mall */}
              {/* Samson -> Lakeshore */}
              <path 
                d="M 280 220 Q 320 160 380 120" 
                fill="none" 
                stroke="url(#daytimeGrad)" 
                strokeWidth={selectedRouteFilter === 'daytime' || selectedRouteFilter === 'all' ? 4 : 1}
                className={`svg-path ${selectedRouteFilter === 'daytime' ? 'active-path' : ''} ${selectedRouteFilter !== 'daytime' && selectedRouteFilter !== 'all' ? 'dimmed-path' : ''}`}
              />
              {/* Lakeshore -> Moraine */}
              <path 
                d="M 380 120 Q 430 100 480 120" 
                fill="none" 
                stroke="url(#daytimeGrad)" 
                strokeWidth={selectedRouteFilter === 'daytime' || selectedRouteFilter === 'all' ? 4 : 1}
                className={`svg-path ${selectedRouteFilter === 'daytime' ? 'active-path' : ''} ${selectedRouteFilter !== 'daytime' && selectedRouteFilter !== 'all' ? 'dimmed-path' : ''}`}
              />
              {/* Moraine -> Samson */}
              <path 
                d="M 480 120 Q 380 180 280 220" 
                fill="none" 
                stroke="url(#daytimeGrad)" 
                strokeWidth={selectedRouteFilter === 'daytime' || selectedRouteFilter === 'all' ? 4 : 1}
                className={`svg-path ${selectedRouteFilter === 'daytime' ? 'active-path' : ''} ${selectedRouteFilter !== 'daytime' && selectedRouteFilter !== 'all' ? 'dimmed-path' : ''}`}
              />

              {/* C) Evening Return: Lake Louise Lakeshore -> Banff */}
              <path 
                d="M 380 120 Q 250 250 120 320" 
                fill="none" 
                stroke="url(#eveningGrad)" 
                strokeWidth={selectedRouteFilter === 'evening' || selectedRouteFilter === 'all' ? 4 : 1}
                strokeDasharray="10 5"
                className={`svg-path ${selectedRouteFilter === 'evening' ? 'active-path' : ''} ${selectedRouteFilter !== 'evening' && selectedRouteFilter !== 'all' ? 'dimmed-path' : ''}`}
              />

              {/* Stops Nodes (Markers) */}
              
              {/* 1. Banff */}
              <g 
                className={`stop-node ${activeStop === 'banff' ? 'node-active' : ''}`} 
                onClick={() => handleStopClick('banff')}
                style={{ cursor: 'pointer' }}
              >
                <circle cx="120" cy="320" r="12" fill="var(--bg-card)" stroke="var(--primary)" strokeWidth="3" />
                <circle cx="120" cy="320" r="6" fill="var(--primary)" className="node-dot" />
                <text x="120" y="352" textAnchor="middle" className="node-text">Banff</text>
              </g>

              {/* 2. Samson Mall */}
              <g 
                className={`stop-node ${activeStop === 'samson' ? 'node-active' : ''}`} 
                onClick={() => handleStopClick('samson')}
                style={{ cursor: 'pointer' }}
              >
                <circle cx="280" cy="220" r="12" fill="var(--bg-card)" stroke="var(--primary)" strokeWidth="3" />
                <circle cx="280" cy="220" r="6" fill="var(--primary)" className="node-dot" />
                <text x="280" y="252" textAnchor="middle" className="node-text">Samson Mall (Village)</text>
              </g>

              {/* 3. Lake Louise Lakeshore */}
              <g 
                className={`stop-node ${activeStop === 'lakeshore' ? 'node-active' : ''}`} 
                onClick={() => handleStopClick('lakeshore')}
                style={{ cursor: 'pointer' }}
              >
                <circle cx="380" cy="120" r="12" fill="var(--bg-card)" stroke="var(--primary)" strokeWidth="3" />
                <circle cx="380" cy="120" r="6" fill="var(--primary)" className="node-dot" />
                <text x="380" y="94" textAnchor="middle" className="node-text">Lake Louise Lakeshore</text>
              </g>

              {/* 4. Moraine Lake */}
              <g 
                className={`stop-node ${activeStop === 'moraine' ? 'node-active' : ''}`} 
                onClick={() => handleStopClick('moraine')}
                style={{ cursor: 'pointer' }}
              >
                <circle cx="480" cy="120" r="12" fill="var(--bg-card)" stroke="var(--primary)" strokeWidth="3" />
                <circle cx="480" cy="120" r="6" fill="var(--primary)" className="node-dot" />
                <text x="480" y="94" textAnchor="middle" className="node-text">Moraine Lake</text>
              </g>
            </svg>
          </div>
        </div>

        {/* Info Card Sidebar */}
        <div className="stop-info-panel">
          {activeStop ? (
            <div className="card stop-detail-card animate-fade-in">
              <span className="stop-badge">📍 Selected Station</span>
              <h3 className="stop-title">{stops[activeStop].name}</h3>
              <p className="stop-role"><strong>Role:</strong> {stops[activeStop].role}</p>
              
              <div className="stop-notes-section">
                <h4>Pickup & Stop Notes</h4>
                <ul className="stop-notes-list">
                  {stops[activeStop].notes.map((note, idx) => (
                    <li key={idx}>{note}</li>
                  ))}
                </ul>
              </div>

              <div className="stop-tips-section">
                <h4>Travel Tip</h4>
                <p>{stops[activeStop].tips}</p>
              </div>
            </div>
          ) : (
            <div className="card stop-placeholder-card">
              <span className="info-icon">💡</span>
              <h3>Station Information</h3>
              <p>Click any marker on the map to view specific station loading bays, guidelines, and shuttle departure notes.</p>
              <div className="quick-stats-row">
                <div className="stat-card">
                  <span className="stat-num">4</span>
                  <span className="stat-lbl">Stations</span>
                </div>
                <div className="stat-card">
                  <span className="stat-num">5</span>
                  <span className="stat-lbl">Daily Circuits</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
