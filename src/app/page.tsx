'use client';

import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import ShuttleTracker from '../components/ShuttleTracker';
import ScheduleDashboard from '../components/ScheduleDashboard';
import RouteMap from '../components/RouteMap';
import Footer from '../components/Footer';
import BookingModal from '../components/BookingModal';

export default function Home() {
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [bookingRoute, setBookingRoute] = useState('daytime-circuit');

  const handleOpenBooking = (route: string) => {
    setBookingRoute(route);
    setIsBookingOpen(true);
  };

  return (
    <>
      <Navbar />
      
      <main className="main-content">
        <Hero onOpenBooking={handleOpenBooking} />
        
        <ShuttleTracker />
        
        <ScheduleDashboard onOpenBooking={handleOpenBooking} />
        
        <RouteMap />
      </main>

      <Footer />

      <BookingModal 
        isOpen={isBookingOpen} 
        onClose={() => setIsBookingOpen(false)} 
        initialRoute={bookingRoute}
      />
    </>
  );
}
