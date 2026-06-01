'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { SignInButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs';
import { useBookingModal } from '@/store/booking-modal';

const TIME_FORMATTER = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/Edmonton',
  hour: 'numeric',
  minute: '2-digit',
  hour12: true,
});

export default function Navbar() {
  const [mountainTime, setMountainTime] = useState<string>('');
  const [scrolled, setScrolled] = useState(false);
  const { isLoaded, isSignedIn } = useUser();
  const openBooking = useBookingModal((s) => s.open);

  useEffect(() => {
    const update = () => setMountainTime(TIME_FORMATTER.format(new Date()));
    update();
    const interval = setInterval(update, 30_000);

    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);

    return () => {
      clearInterval(interval);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <header className={`fixed w-full top-0 z-50 transition-all duration-500 ${
      scrolled 
        ? 'border-b border-mist-200 bg-mist-50/80 shadow-[var(--shadow-card)] backdrop-blur-2xl backdrop-saturate-200 py-1'
        : 'border-transparent bg-transparent py-4'
    }`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6">
        <a 
          href="#" 
          className="group flex items-center transition-transform hover:scale-[1.02] active:scale-95" 
          aria-label="Rock Flower Travels Inc. — home"
        >
          {/* Hero is cream now, so the bar sits on a light surface in both states — dark logo throughout. */}
          <Image
            src="/main_logo.png"
            alt="Rock Flower Travels Inc."
            width={400}
            height={195}
            priority
            className="h-12 w-auto drop-shadow-md transition-all duration-300 group-hover:drop-shadow-lg"
          />
        </a>

        <nav className="hidden items-center rounded-full border border-mist-200 bg-mist-100 px-2 py-1.5 shadow-inner md:flex md:gap-1">
          <NavLink href="#schedule">Schedules</NavLink>
          <NavLink href="#tracker">Live Tracker</NavLink>
          <NavLink href="#map">Route Map</NavLink>
        </nav>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => openBooking()}
            className="hidden md:inline-flex items-center justify-center rounded-full bg-gradient-to-r from-sunrise-400 to-sunrise-500 px-5 py-2 text-sm font-bold text-evergreen-950 shadow-[0_0_15px_hsla(41,80%,58%,0.3)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_25px_hsla(41,80%,58%,0.5)] active:scale-95"
          >
            Book Shuttle
          </button>

          <div className="h-6 w-px bg-mist-200 hidden md:block mx-1" />

          {!isLoaded ? (
            <div className="h-9 w-24 animate-pulse rounded-full bg-mist-200" />
          ) : isSignedIn ? (
            <>
              <a
                href="/my-trips"
                className="hidden rounded-full px-4 py-2 text-sm font-medium text-mist-700 transition-all hover:bg-mist-100 hover:text-evergreen-700 sm:inline-flex"
              >
                My Trips
              </a>
              <div className="rounded-full ring-2 ring-mist-200 transition-all hover:ring-sunrise-400/50 p-0.5">
                <UserButton appearance={{ elements: { avatarBox: 'size-8' } }} />
              </div>
            </>
          ) : (
            <div className="flex items-center gap-1">
              <SignInButton mode="modal">
                <button className="rounded-full px-4 py-2 text-sm font-medium text-mist-700 transition-all hover:bg-mist-100 hover:text-evergreen-700 active:scale-95">
                  Sign in
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="rounded-full border border-mist-200 bg-white px-4 py-2 text-sm font-medium text-mist-900 shadow-sm backdrop-blur-md transition-all hover:bg-mist-100 hover:border-mist-300 active:scale-95">
                  Sign up
                </button>
              </SignUpButton>
            </div>
          )}

          <div className="group relative ml-1 hidden items-center gap-2 rounded-full border border-mist-200 bg-mist-100 px-3 py-1.5 text-xs backdrop-blur-md transition-all hover:border-sunrise-400/30 hover:bg-mist-200 lg:inline-flex cursor-default">
            <span aria-hidden className="relative flex size-2 items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sunrise-400 opacity-75"></span>
              <span className="relative inline-flex size-2 rounded-full bg-sunrise-500 shadow-[0_0_8px_hsla(41,80%,58%,0.8)]"></span>
            </span>
            <span className="font-semibold uppercase tracking-widest text-mist-500 transition-colors group-hover:text-mist-700">Banff</span>
            <span className="font-display font-bold tabular-nums text-mist-900">{mountainTime || '—:—'}</span>
          </div>
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="relative rounded-full px-4 py-2 text-sm font-medium text-mist-700 transition-all duration-300 hover:text-evergreen-700 hover:bg-mist-100 active:scale-95"
    >
      {children}
    </a>
  );
}
