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
    <section id="schedule" className="schedule-section container">
      <div className="section-header">
        <h2 className="section-title text-center">Daily Shuttle Schedules</h2>
        <p className="section-subtitle text-center">
          Browse daily shuttle timetables for Banff, Moraine Lake, and Lake Louise.
        </p>
      </div>

      {/* Interactive Search Filters */}
      <div className="schedule-filters card">
        <h3 className="filter-title">Quick Route Search</h3>
        <div className="filter-grid">
          <div className="form-group">
            <label htmlFor="filter-origin">From (Origin)</label>
            <select
              id="filter-origin"
              value={searchOrigin}
              onChange={(e) => setSearchOrigin(e.target.value)}
              className="search-input bg-card-input"
            >
              {locations.map((loc) => (
                <option key={loc.value} value={loc.value}>{loc.label}</option>
              ))}
            </select>
          </div>

          <div className="filter-connector">
            <span>⇄</span>
          </div>

          <div className="form-group">
            <label htmlFor="filter-dest">To (Destination)</label>
            <select
              id="filter-dest"
              value={searchDestination}
              onChange={(e) => setSearchDestination(e.target.value)}
              className="search-input bg-card-input"
            >
              {locations.map((loc) => (
                <option key={loc.value} value={loc.value}>{loc.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="schedule-tabs">
        <button
          onClick={() => setActiveTab('sunrise')}
          className={`tab-btn ${activeTab === 'sunrise' ? 'active' : ''}`}
        >
          <span className="tab-icon">🌅</span>
          <div className="tab-btn-text">
            <span className="tab-name">Sunrise Express</span>
            <span className="tab-desc">Premium (4:30 AM - 6:50 AM)</span>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('daytime')}
          className={`tab-btn ${activeTab === 'daytime' ? 'active' : ''}`}
        >
          <span className="tab-icon">☀️</span>
          <div className="tab-btn-text">
            <span className="tab-name">Daytime Circuit</span>
            <span className="tab-desc">Repeating (7:00 AM - 5:20 PM)</span>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('evening')}
          className={`tab-btn ${activeTab === 'evening' ? 'active' : ''}`}
        >
          <span className="tab-icon">🌇</span>
          <div className="tab-btn-text">
            <span className="tab-name">Evening Return</span>
            <span className="tab-desc">Banff Return (6:00 PM)</span>
          </div>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="tab-panel card">
        {!activeMatchesFilters ? (
          <div className="no-routes-found">
            <p>No direct routes found matching your origin and destination filters for this shuttle service.</p>
            <button 
              onClick={() => { setSearchOrigin('all'); setSearchDestination('all'); }} 
              className="btn btn-secondary btn-sm"
              style={{ marginTop: '12px' }}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            {activeTab === 'sunrise' && (
              <div className="table-wrapper animate-fade-in">
                <div className="table-header-info">
                  <span className="badge badge-premium">Sunrise Premium Service</span>
                  <p className="table-note-text">Perfect for sunrise photography at Moraine Lake. Reservations required.</p>
                </div>
                <div className="table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Route Service</th>
                        <th>Departure Time</th>
                        <th>Est. Arrival</th>
                        <th>Service Type</th>
                        <th>Action</th>
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
                          <tr key={route.id} style={{ opacity: isMatch ? 1 : 0.4 }}>
                            <td><strong>{route.route}</strong></td>
                            <td className="time-cell">{route.depart}</td>
                            <td className="time-cell">{route.arrive}</td>
                            <td>
                              <span className={`badge ${route.type.includes('Premium') ? 'badge-premium' : 'badge-info'}`}>
                                {route.type}
                              </span>
                            </td>
                            <td>
                              <button 
                                onClick={() => onOpenBooking('sunrise-express')} 
                                className="btn btn-outline btn-sm"
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
              <div className="table-wrapper animate-fade-in">
                <div className="table-header-info">
                  <span className="badge badge-info">Daytime Repeating Circuit</span>
                  <p className="table-note-text">
                    <strong>Pattern:</strong> Samson Mall → Lake Louise Lakeshore → Moraine Lake → Samson Mall.
                  </p>
                </div>
                <div className="table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Circuit No.</th>
                        <th>Samson Mall (Village)</th>
                        <th>Lake Louise Lakeshore</th>
                        <th>Moraine Lake</th>
                        <th>Back to Samson Mall</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {daytimeCircuits.map((circ) => {
                        return (
                          <tr key={circ.id}>
                            <td><strong>{circ.name}</strong></td>
                            <td className="time-cell highlight-time">{circ.samson}</td>
                            <td className="time-cell">{circ.lakeshore}</td>
                            <td className="time-cell">{circ.moraine}</td>
                            <td className="time-cell highlight-time">{circ.returnSamson}</td>
                            <td>
                              <button 
                                onClick={() => onOpenBooking('daytime-circuit')} 
                                className="btn btn-primary btn-sm"
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
              <div className="table-wrapper animate-fade-in">
                <div className="table-header-info">
                  <span className="badge badge-info">Banff Return Service</span>
                  <p className="table-note-text">Standard evening departure back to Banff. Highly recommended to book in advance.</p>
                </div>
                <div className="table-container">
                  <table className="custom-table">
                    <thead>
                      <tr>
                        <th>Route Service</th>
                        <th>Departure Time</th>
                        <th>Est. Arrival</th>
                        <th>Service Type</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {eveningRoutes.map((route) => {
                        return (
                          <tr key={route.id}>
                            <td><strong>{route.route}</strong></td>
                            <td className="time-cell">{route.depart}</td>
                            <td className="time-cell">{route.arrive}</td>
                            <td>
                              <span className="badge badge-info">{route.type}</span>
                            </td>
                            <td>
                              <button 
                                onClick={() => onOpenBooking('evening-return')} 
                                className="btn btn-primary btn-sm"
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
      <div className="advisory-card card border-accent">
        <div className="advisory-header">
          <span className="advisory-icon">⚠️</span>
          <h4>Important Travel Notes & Guidelines</h4>
        </div>
        <ul className="advisory-list">
          <li><strong>Arrive Early:</strong> Please arrive at your designated loading area at least <strong>10 minutes early</strong>. Shuttles depart precisely on time.</li>
          <li><strong>Service Schedule Draft:</strong> This schedule is a draft prepared on May 03, 2026. Times are subject to minor modifications due to traffic, weather, and operational requirements.</li>
          <li><strong>Stop Directions:</strong> Lake Louise Lakeshore and Moraine Lake stops must strictly follow designated/approved loading areas and staff instructions.</li>
          <li><strong>Samson Mall Location:</strong> Samson Mall is the central pickup and drop-off point in Lake Louise Village.</li>
        </ul>
      </div>
    </section>
  );
}
