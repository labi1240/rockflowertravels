import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-[#0b1311] text-white pt-20 mt-auto border-t border-white/5">
      <div className="w-full max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-12 pb-12">
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <span className="text-2xl animate-pulse-glow select-none">🌸</span>
            <div className="flex flex-col">
              <span className="font-display text-2xl font-extrabold tracking-tight text-white leading-none">RockFlower</span>
              <span className="text-[10px] font-bold text-white/50 tracking-widest uppercase mt-0.5">Travels Inc.</span>
            </div>
          </div>
          <p className="text-[15px] text-slate-400 max-w-md leading-relaxed">
            Providing premium transportation services across the Canadian Rockies. Experience Banff, Lake Louise, and Moraine Lake with our luxurious shuttle service.
          </p>
          <div className="flex flex-col gap-1 text-xs text-slate-500">
            <p><strong>Prepared:</strong> May 03, 2026</p>
            <p><strong>Document State:</strong> Shuttle Schedule Draft (v1.2)</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
          <div className="flex flex-col">
            <h4 className="text-base font-bold mb-5 text-white relative pb-2">
              Quick Links
              <span className="absolute bottom-0 left-0 w-8 h-[2px] bg-accent" />
            </h4>
            <ul className="flex flex-col gap-3">
              <li>
                <a href="#schedule" className="text-sm text-slate-400 hover:text-accent transition-all duration-150 hover:pl-1">
                  Schedules
                </a>
              </li>
              <li>
                <a href="#tracker" className="text-sm text-slate-400 hover:text-accent transition-all duration-150 hover:pl-1">
                  Live Shuttle Tracker
                </a>
              </li>
              <li>
                <a href="#map" className="text-sm text-slate-400 hover:text-accent transition-all duration-150 hover:pl-1">
                  Route Map
                </a>
              </li>
              <li>
                <a href="#booking" className="text-sm text-slate-400 hover:text-accent transition-all duration-150 hover:pl-1">
                  Book Shuttle
                </a>
              </li>
            </ul>
          </div>

          <div className="flex flex-col">
            <h4 className="text-base font-bold mb-5 text-white relative pb-2">
              Contact & Support
              <span className="absolute bottom-0 left-0 w-8 h-[2px] bg-accent" />
            </h4>
            <ul className="flex flex-col gap-3">
              <li>
                <a href="mailto:info@rockflowertravels.ca" className="text-sm text-slate-400 hover:text-accent transition-all duration-150">
                  info@rockflowertravels.ca
                </a>
              </li>
              <li>
                <a href="tel:+14035550199" className="text-sm text-slate-400 hover:text-accent transition-all duration-150">
                  +1 (403) 555-0199
                </a>
              </li>
              <li>
                <span className="text-sm text-slate-500">Banff Visitor Center</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-[#060b09] py-6 border-t border-white/5 text-xs text-slate-500">
        <div className="w-full max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <p>&copy; {new Date().getFullYear()} RockFlower Travels Inc. All rights reserved.</p>
          <p className="italic font-light">
            Buses depart strictly on time. Please arrive 10 minutes prior to departure.
          </p>
        </div>
      </div>
    </footer>
  );
}
