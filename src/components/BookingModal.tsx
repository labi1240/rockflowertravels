'use client';

import React, { useState, useEffect } from 'react';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRoute: string;
}

export default function BookingModal({ isOpen, onClose, initialRoute }: BookingModalProps) {
  const [step, setStep] = useState<number>(1);
  const [route, setRoute] = useState<string>('daytime-circuit');
  const [time, setTime] = useState<string>('');
  const [date, setDate] = useState<string>('2026-05-21');
  const [passengers, setPassengers] = useState<number>(1);
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [ticketRef, setTicketRef] = useState<string>('');

  // Update initial route if passed from parent
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (initialRoute) {
      setRoute(initialRoute);
      // Auto-set first available times based on route
      if (initialRoute === 'sunrise-express') {
        setTime('4:30 AM (Banff → Moraine)');
      } else if (initialRoute === 'evening-return') {
        setTime('6:00 PM (Lakeshore → Banff)');
      } else {
        setTime('7:00 AM');
      }
    }
  }, [initialRoute, isOpen]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Generate ticket reference code on success
  const generateTicketRef = () => {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const randLetters = Array.from({ length: 3 }, () => letters[Math.floor(Math.random() * 26)]).join('');
    const randNums = Math.floor(1000 + Math.random() * 9000);
    return `RF-${randLetters}-${randNums}`;
  };

  const getRoutePrice = (routeId: string) => {
    switch (routeId) {
      case 'sunrise-express': return 45.00; // Premium
      case 'evening-return': return 20.00; // Standard
      default: return 25.00; // Daytime Circuit
    }
  };

  const getRouteDisplayName = (routeId: string) => {
    switch (routeId) {
      case 'sunrise-express': return 'Sunrise Express (Premium)';
      case 'evening-return': return 'Evening Return (Banff Bound)';
      default: return 'Daytime Repeating Circuit';
    }
  };

  const pricePerPax = getRoutePrice(route);
  const subtotal = pricePerPax * passengers;
  const tax = subtotal * 0.05; // 5% GST Alberta
  const total = subtotal + tax;

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      if (!name || !email || !phone) {
        alert('Please fill out all contact fields.');
        return;
      }
      setTicketRef(generateTicketRef());
      setStep(3);
    }
  };

  const handleBackStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleClose = () => {
    setStep(1);
    setName('');
    setEmail('');
    setPhone('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white dark:bg-[#101917] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl p-6 md:p-8 overflow-hidden animate-fade-in">
        <button 
          className="absolute top-4 right-4 text-2xl text-slate-400 hover:text-slate-600 dark:hover:text-white transition duration-150 cursor-pointer" 
          onClick={handleClose}
        >
          ×
        </button>

        {/* Steps indicator */}
        {step < 3 && (
          <div className="flex items-center justify-center gap-3 mb-6 select-none">
            <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full border transition-all duration-150 ${
              step >= 1 
                ? 'border-primary bg-primary text-white dark:border-accent dark:bg-accent dark:text-primary-dark' 
                : 'border-slate-200 dark:border-slate-800 text-slate-400 bg-slate-50 dark:bg-slate-900'
            }`}>
              1. Route & Time
            </span>
            <span className="h-[2px] w-8 bg-slate-200 dark:bg-slate-800"></span>
            <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full border transition-all duration-150 ${
              step >= 2 
                ? 'border-primary bg-primary text-white dark:border-accent dark:bg-accent dark:text-primary-dark' 
                : 'border-slate-200 dark:border-slate-800 text-slate-400 bg-slate-50 dark:bg-slate-900'
            }`}>
              2. Passenger Info
            </span>
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleNextStep} className="flex flex-col gap-5">
            <h2 className="font-display text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white text-center mb-2">
              Configure Shuttle Booking
            </h2>
            
            <div className="flex flex-col gap-1.5">
              <label htmlFor="modal-route" className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Shuttle Service
              </label>
              <select 
                id="modal-route" 
                value={route}
                onChange={(e) => {
                  setRoute(e.target.value);
                  if (e.target.value === 'sunrise-express') {
                    setTime('4:30 AM (Banff → Moraine)');
                  } else if (e.target.value === 'evening-return') {
                    setTime('6:00 PM (Lakeshore → Banff)');
                  } else {
                    setTime('7:00 AM');
                  }
                }}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-lg px-4 py-2.5 text-sm focus:border-primary-light dark:focus:border-accent focus:bg-white dark:focus:bg-[#101917] outline-none transition-all duration-200 focus:ring-3 focus:ring-accent/10"
              >
                <option value="sunrise-express">Sunrise Express (Premium) — $45.00</option>
                <option value="daytime-circuit">Daytime Repeating Circuit — $25.00</option>
                <option value="evening-return">Evening Return (Banff) — $20.00</option>
              </select>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 flex flex-col gap-1.5">
                <label htmlFor="modal-date" className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Date
                </label>
                <input 
                  type="date" 
                  id="modal-date" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-lg px-4 py-2.5 text-sm focus:border-primary-light dark:focus:border-accent focus:bg-white dark:focus:bg-[#101917] outline-none transition-all duration-200 focus:ring-3 focus:ring-accent/10"
                  min="2026-05-03"
                />
              </div>

              <div className="flex-1 flex flex-col gap-1.5">
                <label htmlFor="modal-pax" className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Passengers
                </label>
                <select 
                  id="modal-pax"
                  value={passengers}
                  onChange={(e) => setPassengers(parseInt(e.target.value))}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-lg px-4 py-2.5 text-sm focus:border-primary-light dark:focus:border-accent focus:bg-white dark:focus:bg-[#101917] outline-none transition-all duration-200 focus:ring-3 focus:ring-accent/10"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                    <option key={n} value={n}>{n} {n === 1 ? 'Passenger' : 'Passengers'}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="modal-time" className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Departure Time
              </label>
              {route === 'sunrise-express' ? (
                <select 
                  id="modal-time" 
                  value={time} 
                  onChange={(e) => setTime(e.target.value)} 
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-lg px-4 py-2.5 text-sm focus:border-primary-light dark:focus:border-accent focus:bg-white dark:focus:bg-[#101917] outline-none transition-all duration-200 focus:ring-3 focus:ring-accent/10"
                >
                  <option value="4:30 AM (Banff → Moraine)">4:30 AM (Banff → Moraine Lake)</option>
                  <option value="6:10 AM (Moraine → LL Lakeshore)">6:10 AM (Moraine → LL Lakeshore - positioning)</option>
                  <option value="6:35 AM (LL Lakeshore → Samson)">6:35 AM (LL Lakeshore → Samson - positioning)</option>
                </select>
              ) : route === 'evening-return' ? (
                <select 
                  id="modal-time" 
                  value={time} 
                  onChange={(e) => setTime(e.target.value)} 
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-lg px-4 py-2.5 text-sm focus:border-primary-light dark:focus:border-accent focus:bg-white dark:focus:bg-[#101917] outline-none transition-all duration-200 focus:ring-3 focus:ring-accent/10"
                >
                  <option value="6:00 PM (Lakeshore → Banff)">6:00 PM (Lake Louise Lakeshore → Banff)</option>
                </select>
              ) : (
                <select 
                  id="modal-time" 
                  value={time} 
                  onChange={(e) => setTime(e.target.value)} 
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-lg px-4 py-2.5 text-sm focus:border-primary-light dark:focus:border-accent focus:bg-white dark:focus:bg-[#101917] outline-none transition-all duration-200 focus:ring-3 focus:ring-accent/10"
                >
                  <option value="7:00 AM">7:00 AM (Circuit 1 - Samson Mall)</option>
                  <option value="7:15 AM">7:15 AM (Circuit 1 - LL Lakeshore)</option>
                  <option value="7:40 AM">7:40 AM (Circuit 1 - Moraine Lake)</option>
                  <option value="9:00 AM">9:00 AM (Circuit 2 - Samson Mall)</option>
                  <option value="9:15 AM">9:15 AM (Circuit 2 - LL Lakeshore)</option>
                  <option value="9:40 AM">9:40 AM (Circuit 2 - Moraine Lake)</option>
                  <option value="11:00 AM">11:00 AM (Circuit 3 - Samson Mall)</option>
                  <option value="11:15 AM">11:15 AM (Circuit 3 - LL Lakeshore)</option>
                  <option value="11:40 AM">11:40 AM (Circuit 3 - Moraine Lake)</option>
                  <option value="1:30 PM">1:30 PM (Circuit 4 - Samson Mall)</option>
                  <option value="1:45 PM">1:45 PM (Circuit 4 - LL Lakeshore)</option>
                  <option value="2:10 PM">2:10 PM (Circuit 4 - Moraine Lake)</option>
                  <option value="3:30 PM">3:30 PM (Circuit 5 - Samson Mall)</option>
                  <option value="3:45 PM">3:45 PM (Circuit 5 - LL Lakeshore)</option>
                  <option value="4:10 PM">4:10 PM (Circuit 5 - Moraine Lake)</option>
                </select>
              )}
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 flex flex-col gap-2">
              <div className="flex justify-between items-center text-sm text-slate-600 dark:text-slate-400">
                <span>Shuttle Rate (x{passengers})</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">${subtotal.toFixed(2)} CAD</span>
              </div>
              <div className="flex justify-between items-center text-sm text-slate-600 dark:text-slate-400">
                <span>Alberta GST (5%)</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">${tax.toFixed(2)} CAD</span>
              </div>
              <div className="flex justify-between items-center text-base font-extrabold text-slate-900 dark:text-white pt-2 mt-1 border-t border-slate-200 dark:border-slate-800">
                <span>Total Amount</span>
                <span className="text-primary dark:text-accent">${total.toFixed(2)} CAD</span>
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full inline-flex items-center justify-between px-5 py-3 rounded-lg bg-accent text-primary-dark hover:bg-accent-hover font-bold text-sm transition-all duration-150 cursor-pointer shadow-md mt-2"
            >
              <span>Continue to Contact Info</span>
              <span>→</span>
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleNextStep} className="flex flex-col gap-5">
            <h2 className="font-display text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white text-center mb-2">
              Contact & Billing Details
            </h2>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="modal-name" className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Primary Passenger Name
              </label>
              <input 
                type="text" 
                id="modal-name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-lg px-4 py-2.5 text-sm focus:border-primary-light dark:focus:border-accent focus:bg-white dark:focus:bg-[#101917] outline-none transition-all duration-200 focus:ring-3 focus:ring-accent/10"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="modal-email" className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Email Address
              </label>
              <input 
                type="email" 
                id="modal-email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john.doe@example.com"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-lg px-4 py-2.5 text-sm focus:border-primary-light dark:focus:border-accent focus:bg-white dark:focus:bg-[#101917] outline-none transition-all duration-200 focus:ring-3 focus:ring-accent/10"
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="modal-phone" className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Mobile Phone (for delays/notifications)
              </label>
              <input 
                type="tel" 
                id="modal-phone" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (403) 555-0100"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-lg px-4 py-2.5 text-sm focus:border-primary-light dark:focus:border-accent focus:bg-white dark:focus:bg-[#101917] outline-none transition-all duration-200 focus:ring-3 focus:ring-accent/10"
                required
              />
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 rounded-lg p-3 text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
              <p>⚠️ By continuing, you acknowledge that buses depart strictly on time. Passengers must arrive 10 minutes early.</p>
            </div>

            <div className="flex gap-4 mt-2">
              <button 
                type="button" 
                onClick={handleBackStep} 
                className="px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-350 font-bold text-sm transition duration-150 cursor-pointer flex-1 text-center"
              >
                Back
              </button>
              <button 
                type="submit" 
                className="px-4 py-3 rounded-lg bg-accent text-primary-dark hover:bg-accent-hover font-bold text-sm transition duration-150 cursor-pointer flex-2 text-center shadow-md"
              >
                Confirm & Generate Ticket
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-6 animate-fade-in">
            <div className="flex flex-col items-center text-center gap-2">
              <span className="w-12 h-12 flex items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 font-bold text-xl mb-2">
                ✓
              </span>
              <h2 className="font-display text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                Reservation Confirmed!
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Your boarding pass is ready. A confirmation has been sent to {email}.
              </p>
            </div>

            {/* Boarding Pass Ticket */}
            <div className="bg-[#0f342e] text-white rounded-xl shadow-lg overflow-hidden border border-[#1b4b43]">
              <div className="bg-[#09221e] px-5 py-3 border-b border-[#1b4b43] flex justify-between items-center">
                <span className="font-display font-extrabold text-xs tracking-wider text-accent">🌸 RockFlower Travels Inc.</span>
                <span className="text-[9px] font-bold tracking-widest px-2 py-0.5 bg-accent/25 border border-accent/40 rounded text-accent">BOARDING PASS</span>
              </div>
              
              <div className="p-5 flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] font-bold text-[#62a499] uppercase tracking-wider">Passenger</span>
                    <span className="text-sm font-semibold text-white">{name}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] font-bold text-[#62a499] uppercase tracking-wider">Shuttle Route</span>
                    <span className="text-sm font-semibold text-white">{getRouteDisplayName(route)}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] font-bold text-[#62a499] uppercase tracking-wider">Date</span>
                    <span className="text-sm font-semibold text-white">{date}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] font-bold text-[#62a499] uppercase tracking-wider">Departure Time</span>
                    <span className="text-sm font-display font-bold text-accent">{time}</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] font-bold text-[#62a499] uppercase tracking-wider">Passengers</span>
                    <span className="text-sm font-semibold text-white">{passengers} Pax</span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[9px] font-bold text-[#62a499] uppercase tracking-wider">Ticket Reference</span>
                    <span className="text-sm font-mono font-bold text-accent">{ticketRef}</span>
                  </div>
                </div>

                <div className="text-[11px] text-[#86bfb5] leading-relaxed border-t border-[#1b4b43] pt-3">
                  <p><strong>Note:</strong> Please arrive <strong>10 minutes early</strong>. Present this boarding pass to the driver upon boarding.</p>
                </div>

                {/* CSS Barcode */}
                <div className="flex flex-col items-center gap-1.5 bg-white p-3 rounded-lg border border-slate-200">
                  <div className="flex items-stretch h-8 gap-[1px]">
                    {Array.from({ length: 48 }).map((_, i) => (
                      <span 
                        key={i} 
                        className="bg-slate-900" 
                        style={{ 
                          width: `${(i % 3 === 0 ? 3 : i % 2 === 0 ? 1 : 2)}px`,
                          opacity: i % 7 === 0 ? 0.3 : 1
                        }}
                      ></span>
                    ))}
                  </div>
                  <span className="text-[10px] font-mono font-semibold tracking-widest text-slate-800">{ticketRef}</span>
                </div>
              </div>
            </div>

            <button 
              onClick={handleClose} 
              className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-350 font-bold text-sm transition duration-150 cursor-pointer text-center"
            >
              Close & Return to Schedules
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
