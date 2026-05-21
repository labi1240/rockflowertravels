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
    <section className="relative bg-[url('/images/hero_banner.png')] bg-cover bg-center py-16 md:py-28 min-h-[85vh] flex items-center text-white">
      {/* Hero overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a1815]/95 via-[#0f342e]/75 to-black/55 z-1"></div>
      
      <div className="w-full max-w-7xl mx-auto px-6 relative z-10 grid grid-cols-1 lg:grid-cols-[1.25fr_0.75fr] items-center gap-12 lg:gap-16">
        <div className="max-w-2xl animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-accent/15 border border-accent text-accent py-1.5 px-4 rounded-full text-xs font-bold tracking-wider uppercase mb-6">
            <span className="text-sm select-none">🌸</span>
            <span>Premium Rocky Mountain Shuttles</span>
          </div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1] mb-6">
            Banff → Lake Louise <br />
            & Moraine Lake
          </h1>
          <p className="text-sm sm:text-base md:text-lg text-white/85 leading-relaxed mb-8 max-w-xl">
            Reliable, scenic, and premium daily transit connections. Beat the parking crowds and travel in absolute comfort on our state-of-the-art shuttle coaches.
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-white bg-white/8 py-2 px-4 rounded-full border border-white/8">
              <span className="text-sm">✨</span>
              <span>Sunrise Access (4:30 AM)</span>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-white bg-white/8 py-2 px-4 rounded-full border border-white/8">
              <span className="text-sm">⏱️</span>
              <span>Buses Depart on Time</span>
            </div>
            <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-white bg-white/8 py-2 px-4 rounded-full border border-white/8">
              <span className="text-sm">🏔️</span>
              <span>Reserved Seating</span>
            </div>
          </div>
        </div>

        <div className="w-full animate-fade-in delay-100">
          <form onSubmit={handleSubmit} className="bg-slate-950/75 backdrop-blur-xl border border-white/10 p-6 sm:p-8 rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
            <h3 className="font-display text-xl sm:text-2xl font-bold text-white mb-6 relative pb-3">
              Reserve Your Shuttle
              <span className="absolute bottom-0 left-0 w-10 h-[3px] bg-accent rounded" />
            </h3>
            
            <div className="mb-5 flex flex-col gap-2">
              <label htmlFor="route-select" className="text-[10px] font-bold text-white/70 uppercase tracking-wider">Select Route / Service</label>
              <select 
                id="route-select" 
                value={selectedRoute} 
                onChange={(e) => setSelectedRoute(e.target.value)}
                className="w-full px-4 py-3 rounded-lg bg-black/40 border border-white/15 text-white text-sm outline-none focus:border-accent focus:bg-black/60 focus:ring-3 focus:ring-accent/20 transition-all duration-200"
              >
                <option value="sunrise-express" className="bg-[#101917] text-white">Sunrise Express (Premium) — 4:30 AM</option>
                <option value="daytime-circuit" className="bg-[#101917] text-white">Daytime Circuit (Repeating) — 7:00 AM to 5:20 PM</option>
                <option value="evening-return" className="bg-[#101917] text-white">Evening Return (Banff Bound) — 6:00 PM</option>
              </select>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-5">
              <div className="flex-1 flex flex-col gap-2">
                <label htmlFor="date-input" className="text-[10px] font-bold text-white/70 uppercase tracking-wider">Travel Date</label>
                <input 
                  type="date" 
                  id="date-input" 
                  value={date} 
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg bg-black/40 border border-white/15 text-white text-sm outline-none focus:border-accent focus:bg-black/60 focus:ring-3 focus:ring-accent/20 transition-all duration-200 [color-scheme:dark]" 
                  min="2026-05-03"
                />
              </div>

              <div className="flex-1 flex flex-col gap-2">
                <label htmlFor="passengers-input" className="text-[10px] font-bold text-white/70 uppercase tracking-wider">Passengers</label>
                <select 
                  id="passengers-input" 
                  value={passengers} 
                  onChange={(e) => setPassengers(parseInt(e.target.value))}
                  className="w-full px-4 py-3 rounded-lg bg-black/40 border border-white/15 text-white text-sm outline-none focus:border-accent focus:bg-black/60 focus:ring-3 focus:ring-accent/20 transition-all duration-200"
                >
                  <option value={1} className="bg-[#101917] text-white">1 Passenger</option>
                  <option value={2} className="bg-[#101917] text-white">2 Passengers</option>
                  <option value={3} className="bg-[#101917] text-white">3 Passengers</option>
                  <option value={4} className="bg-[#101917] text-white">4 Passengers</option>
                  <option value={5} className="bg-[#101917] text-white">5+ Passengers</option>
                </select>
              </div>
            </div>

            <button type="submit" className="w-full py-4 bg-accent hover:bg-accent-hover text-primary-dark font-bold text-sm rounded-lg flex items-center justify-center gap-2 hover:scale-[1.01] transition-all duration-200 shadow-md mt-2 cursor-pointer">
              <span>Find Availability & Book</span>
              <span className="text-base">→</span>
            </button>
            <p className="text-[11px] text-white/50 text-center mt-4">
              * Please arrive 10 minutes early; buses depart strictly on schedule.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
