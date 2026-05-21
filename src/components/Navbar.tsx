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
    <header className="site-header">
      <div className="container header-container">
        <a href="#" className="logo-container">
          <span className="logo-flower">🌸</span>
          <div className="logo-text">
            <span className="logo-brand">RockFlower</span>
            <span className="logo-subbrand">Travels Inc.</span>
          </div>
        </a>

        <nav className="main-nav">
          <a href="#schedule" className="nav-link">Schedules</a>
          <a href="#tracker" className="nav-link">Live Tracker</a>
          <a href="#map" className="nav-link">Route Map</a>
          <a href="#booking" className="nav-link nav-btn-link">
            <span className="btn btn-primary btn-sm">Book Shuttle</span>
          </a>

          <div className="ml-2 flex items-center gap-2">
            {isLoaded && isSignedIn ? (
              <>
                <a href="/my-trips" className="nav-link">My Trips</a>
                <UserButton />
              </>
            ) : isLoaded ? (
              <>
                <SignInButton mode="modal">
                  <button className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100">
                    Sign in
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800">
                    Sign up
                  </button>
                </SignUpButton>
              </>
            ) : (
              <div className="h-8 w-20 animate-pulse rounded-md bg-slate-100" />
            )}
          </div>
        </nav>

        <div className="mountain-clock-badge">
          <span className="clock-pulse"></span>
          <span className="clock-label">Banff Local Time:</span>
          <span className="clock-time">{mountainTime || 'Loading...'}</span>
        </div>
      </div>
    </header>
  );
}
