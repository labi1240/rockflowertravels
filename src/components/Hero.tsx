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
    <section className="hero-section">
      <div className="hero-overlay"></div>
      <div className="container hero-container">
        <div className="hero-content">
          <div className="hero-badge animate-fade-in">
            <span className="badge-flower">🌸</span>
            <span>Premium Rocky Mountain Shuttles</span>
          </div>
          <h1 className="hero-title">
            Banff → Lake Louise <br />
            & Moraine Lake
          </h1>
          <p className="hero-subtitle">
            Reliable, scenic, and premium daily transit connections. Beat the parking crowds and travel in absolute comfort on our state-of-the-art shuttle coaches.
          </p>
          <div className="hero-features">
            <div className="feature-item">
              <span className="feature-icon">✨</span>
              <span>Sunrise Access (4:30 AM)</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">⏱️</span>
              <span>Buses Depart on Time</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🏔️</span>
              <span>Reserved Seating</span>
            </div>
          </div>
        </div>

        <div className="hero-search-card-wrapper">
          <form onSubmit={handleSubmit} className="hero-search-card dark-glass">
            <h3 className="search-title">Reserve Your Shuttle</h3>
            
            <div className="form-group">
              <label htmlFor="route-select">Select Route / Service</label>
              <select 
                id="route-select" 
                value={selectedRoute} 
                onChange={(e) => setSelectedRoute(e.target.value)}
                className="search-input"
              >
                <option value="sunrise-express">Sunrise Express (Premium) — 4:30 AM</option>
                <option value="daytime-circuit">Daytime Circuit (Repeating) — 7:00 AM to 5:20 PM</option>
                <option value="evening-return">Evening Return (Banff Bound) — 6:00 PM</option>
              </select>
            </div>

            <div className="form-row">
              <div className="form-group half-width">
                <label htmlFor="date-input">Travel Date</label>
                <input 
                  type="date" 
                  id="date-input" 
                  value={date} 
                  onChange={(e) => setDate(e.target.value)}
                  className="search-input" 
                  min="2026-05-03"
                />
              </div>

              <div className="form-group half-width">
                <label htmlFor="passengers-input">Passengers</label>
                <select 
                  id="passengers-input" 
                  value={passengers} 
                  onChange={(e) => setPassengers(parseInt(e.target.value))}
                  className="search-input"
                >
                  <option value={1}>1 Passenger</option>
                  <option value={2}>2 Passengers</option>
                  <option value={3}>3 Passengers</option>
                  <option value={4}>4 Passengers</option>
                  <option value={5}>5+ Passengers</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn btn-primary search-submit-btn">
              <span>Find Availability & Book</span>
              <span className="arrow-icon">→</span>
            </button>
            <p className="search-note">
              * Please arrive 10 minutes early; buses depart strictly on schedule.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
