'use client';

import React, { useState, useEffect } from 'react';
import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs';

const TIME_FORMATTER = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/Edmonton',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
});

export default function Navbar() {
  const [mountainTime, setMountainTime] = useState<string>('');
  const { isLoaded, isSignedIn } = useUser();

  useEffect(() => {
    const update = () => setMountainTime(TIME_FORMATTER.format(new Date()));
    update();
    const interval = setInterval(update, 30_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-evergreen-700/40 bg-evergreen-950/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-3.5">
        <a href="#" className="flex items-center gap-2.5">
          <span aria-hidden className="text-2xl">🌸</span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-lg font-extrabold text-white">RockFlower</span>
            <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-mist-300">Travels Inc.</span>
          </span>
        </a>

        <nav className="hidden items-center gap-1 md:flex">
          <NavLink href="#schedule">Schedules</NavLink>
          <NavLink href="#tracker">Live Tracker</NavLink>
          <NavLink href="#map">Route Map</NavLink>
          <a
            href="#booking"
            className="ml-2 inline-flex items-center rounded-full bg-sunrise-500 px-4 py-1.5 font-display text-sm font-bold text-evergreen-950 transition hover:bg-sunrise-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-sunrise-300/60"
          >
            Book Shuttle
          </a>
        </nav>

        <div className="flex items-center gap-2">
          {!isLoaded ? (
            <div className="h-8 w-20 animate-pulse rounded-full bg-evergreen-800" />
          ) : isSignedIn ? (
            <>
              <a
                href="/my-trips"
                className="hidden rounded-full px-3 py-1.5 text-sm font-medium text-mist-200 transition hover:text-white sm:inline-flex"
              >
                My Trips
              </a>
              <UserButton appearance={{ elements: { avatarBox: 'size-8' } }} />
            </>
          ) : (
            <>
              <SignInButton mode="modal">
                <button className="rounded-full px-3 py-1.5 text-sm font-medium text-mist-200 transition hover:text-white">
                  Sign in
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="rounded-full bg-white/10 px-3.5 py-1.5 text-sm font-semibold text-white transition hover:bg-white/15">
                  Sign up
                </button>
              </SignUpButton>
            </>
          )}

          <span className="ml-2 hidden items-center gap-2 rounded-full border border-evergreen-700/60 bg-evergreen-900/70 px-3 py-1.5 text-xs lg:inline-flex">
            <span aria-hidden className="size-1.5 rounded-full bg-sunrise-400 shadow-[0_0_0_3px_hsl(41_80%_50%/0.2)]" />
            <span className="font-semibold uppercase tracking-[0.14em] text-mist-300">Banff</span>
            <span className="font-display font-bold tabular-nums text-white">{mountainTime || '—:—'}</span>
          </span>
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="rounded-full px-3.5 py-1.5 text-sm font-medium text-mist-200 transition hover:bg-white/5 hover:text-white"
    >
      {children}
    </a>
  );
}
