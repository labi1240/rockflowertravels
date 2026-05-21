'use client';

import React, { useState, useEffect } from 'react';
import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs';

export default function Navbar() {
  const [mountainTime, setMountainTime] = useState<string>('');
  const { isLoaded, isSignedIn } = useUser();

  useEffect(() => {
    const updateTime = () => {
      // Banff, Alberta is in the Mountain Time Zone (MST/MDT)
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'America/Edmonton',
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      };
      const formatter = new Intl.DateTimeFormat('en-US', options);
      setMountainTime(formatter.format(new Date()));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-primary/85 backdrop-blur-md border-b border-white/10 py-4 transition-all duration-300">
      <div className="w-full max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <a href="#" className="flex items-center gap-3">
          <span className="text-2xl animate-pulse-glow select-none">🌸</span>
          <div className="flex flex-col">
            <span className="font-display text-xl font-extrabold tracking-tight text-white leading-none">RockFlower</span>
            <span className="text-[10px] font-bold text-accent tracking-widest uppercase mt-0.5">Travels Inc.</span>
          </div>
        </a>

        <nav className="flex flex-wrap items-center gap-6 md:gap-8 w-full md:w-auto">
          <a href="#schedule" className="relative group py-1 text-sm font-semibold text-white/80 hover:text-accent transition-colors duration-200">
            Schedules
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent group-hover:w-full transition-all duration-200" />
          </a>
          <a href="#tracker" className="relative group py-1 text-sm font-semibold text-white/80 hover:text-accent transition-colors duration-200">
            Live Tracker
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent group-hover:w-full transition-all duration-200" />
          </a>
          <a href="#map" className="relative group py-1 text-sm font-semibold text-white/80 hover:text-accent transition-colors duration-200">
            Route Map
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent group-hover:w-full transition-all duration-200" />
          </a>
          <a href="#booking" className="py-1">
            <span className="inline-flex items-center justify-center px-4 py-1.5 rounded-lg bg-accent text-primary-dark font-semibold text-xs hover:bg-accent-hover transition-all duration-200 hover:scale-[1.02] shadow-sm">
              Book Shuttle
            </span>
          </a>

          <div className="flex items-center gap-2">
            {isLoaded && isSignedIn ? (
              <>
                <a href="/my-trips" className="relative group py-1 text-sm font-semibold text-white/80 hover:text-accent transition-colors duration-200 mr-2">
                  My Trips
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-accent group-hover:w-full transition-all duration-200" />
                </a>
                <UserButton />
              </>
            ) : isLoaded ? (
              <>
                <SignInButton mode="modal">
                  <button className="rounded-md px-3 py-1.5 text-xs font-semibold text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200">
                    Sign in
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="rounded-md bg-white text-primary-dark px-3 py-1.5 text-xs font-semibold hover:bg-white/90 transition-all duration-200 shadow-sm">
                    Sign up
                  </button>
                </SignUpButton>
              </>
            ) : (
              <div className="h-8 w-20 animate-pulse rounded-md bg-white/10" />
            )}
          </div>
        </nav>

        <div className="flex items-center gap-2 bg-white/8 border border-white/12 py-2 px-4 rounded-full text-white text-xs md:self-auto self-start">
          <span className="w-2 h-2 rounded-full bg-accent inline-block shadow-[0_0_8px_var(--color-accent)] animate-pulse-glow" />
          <span className="opacity-70 font-medium">Banff Local Time:</span>
          <span className="font-display font-bold text-accent">{mountainTime || 'Loading...'}</span>
        </div>
      </div>
    </header>
  );
}
