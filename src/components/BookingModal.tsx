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
    <div className="modal-overlay">
      <div className="modal-container card">
        <button className="modal-close-btn" onClick={handleClose}>×</button>

        {/* Steps indicator */}
        {step < 3 && (
          <div className="steps-indicator">
            <span className={`step-dot ${step >= 1 ? 'active-dot' : ''}`}>1. Route & Time</span>
            <span className="step-connector"></span>
            <span className={`step-dot ${step >= 2 ? 'active-dot' : ''}`}>2. Passenger Info</span>
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleNextStep} className="modal-step-form">
            <h2 className="modal-title">Configure Shuttle Booking</h2>
            
            <div className="form-group">
              <label htmlFor="modal-route">Shuttle Service</label>
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
                className="search-input bg-card-input"
              >
                <option value="sunrise-express">Sunrise Express (Premium) — $45.00</option>
                <option value="daytime-circuit">Daytime Repeating Circuit — $25.00</option>
                <option value="evening-return">Evening Return (Banff) — $20.00</option>
              </select>
            </div>

            <div className="form-row">
              <div className="form-group half-width">
                <label htmlFor="modal-date">Date</label>
                <input 
                  type="date" 
                  id="modal-date" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="search-input bg-card-input"
                  min="2026-05-03"
                />
              </div>

              <div className="form-group half-width">
                <label htmlFor="modal-pax">Passengers</label>
                <select 
                  id="modal-pax"
                  value={passengers}
                  onChange={(e) => setPassengers(parseInt(e.target.value))}
                  className="search-input bg-card-input"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                    <option key={n} value={n}>{n} {n === 1 ? 'Passenger' : 'Passengers'}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="modal-time">Departure Time</label>
              {route === 'sunrise-express' ? (
                <select id="modal-time" value={time} onChange={(e) => setTime(e.target.value)} className="search-input bg-card-input">
                  <option value="4:30 AM (Banff → Moraine)">4:30 AM (Banff → Moraine Lake)</option>
                  <option value="6:10 AM (Moraine → LL Lakeshore)">6:10 AM (Moraine → LL Lakeshore - positioning)</option>
                  <option value="6:35 AM (LL Lakeshore → Samson)">6:35 AM (LL Lakeshore → Samson - positioning)</option>
                </select>
              ) : route === 'evening-return' ? (
                <select id="modal-time" value={time} onChange={(e) => setTime(e.target.value)} className="search-input bg-card-input">
                  <option value="6:00 PM (Lakeshore → Banff)">6:00 PM (Lake Louise Lakeshore → Banff)</option>
                </select>
              ) : (
                <select id="modal-time" value={time} onChange={(e) => setTime(e.target.value)} className="search-input bg-card-input">
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

            <div className="pricing-summary">
              <div className="price-row">
                <span>Shuttle Rate (x{passengers})</span>
                <span>${subtotal.toFixed(2)} CAD</span>
              </div>
              <div className="price-row">
                <span>Alberta GST (5%)</span>
                <span>${tax.toFixed(2)} CAD</span>
              </div>
              <hr />
              <div className="price-row total-row">
                <span>Total Amount</span>
                <span>${total.toFixed(2)} CAD</span>
              </div>
            </div>

            <button type="submit" className="btn btn-primary modal-action-btn">
              <span>Continue to Contact Info</span>
              <span>→</span>
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleNextStep} className="modal-step-form">
            <h2 className="modal-title">Contact & Billing Details</h2>

            <div className="form-group">
              <label htmlFor="modal-name">Primary Passenger Name</label>
              <input 
                type="text" 
                id="modal-name" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="search-input bg-card-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="modal-email">Email Address</label>
              <input 
                type="email" 
                id="modal-email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john.doe@example.com"
                className="search-input bg-card-input"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="modal-phone">Mobile Phone (for delays/notifications)</label>
              <input 
                type="tel" 
                id="modal-phone" 
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (403) 555-0100"
                className="search-input bg-card-input"
                required
              />
            </div>

            <div className="booking-notice">
              <p>⚠️ By continuing, you acknowledge that buses depart strictly on time. Passengers must arrive 10 minutes early.</p>
            </div>

            <div className="modal-btn-row">
              <button type="button" onClick={handleBackStep} className="btn btn-secondary flex-1">
                Back
              </button>
              <button type="submit" className="btn btn-primary flex-2">
                Confirm & Generate Ticket
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <div className="modal-success-screen animate-fade-in">
            <div className="success-header">
              <span className="success-icon-check">✓</span>
              <h2>Reservation Confirmed!</h2>
              <p>Your boarding pass is ready. A confirmation has been sent to {email}.</p>
            </div>

            {/* Boarding Pass Ticket */}
            <div className="boarding-pass-ticket">
              <div className="ticket-header">
                <span className="ticket-logo">🌸 RockFlower Travels Inc.</span>
                <span className="ticket-badge-right">BOARDING PASS</span>
              </div>
              
              <div className="ticket-body">
                <div className="ticket-info-grid">
                  <div className="ticket-info-item">
                    <span className="info-lbl">Passenger</span>
                    <span className="info-val">{name}</span>
                  </div>
                  <div className="ticket-info-item">
                    <span className="info-lbl">Shuttle Route</span>
                    <span className="info-val">{getRouteDisplayName(route)}</span>
                  </div>
                  <div className="ticket-info-item">
                    <span className="info-lbl">Date</span>
                    <span className="info-val">{date}</span>
                  </div>
                  <div className="ticket-info-item">
                    <span className="info-lbl">Departure Time</span>
                    <span className="info-val highlight-time">{time}</span>
                  </div>
                  <div className="ticket-info-item">
                    <span className="info-lbl">Passengers</span>
                    <span className="info-val">{passengers} Pax</span>
                  </div>
                  <div className="ticket-info-item">
                    <span className="info-lbl">Ticket Reference</span>
                    <span className="info-val code-val">{ticketRef}</span>
                  </div>
                </div>

                <div className="ticket-instructions">
                  <p><strong>Note:</strong> Please arrive <strong>10 minutes early</strong>. Present this boarding pass to the driver upon boarding.</p>
                </div>

                {/* CSS Barcode */}
                <div className="ticket-barcode-container">
                  <div className="barcode-bars">
                    {Array.from({ length: 48 }).map((_, i) => (
                      <span 
                        key={i} 
                        className="barcode-bar" 
                        style={{ 
                          width: `${(i % 3 === 0 ? 3 : i % 2 === 0 ? 1 : 2)}px`,
                          opacity: i % 7 === 0 ? 0.3 : 1
                        }}
                      ></span>
                    ))}
                  </div>
                  <span className="barcode-number">{ticketRef}</span>
                </div>
              </div>
            </div>

            <button onClick={handleClose} className="btn btn-secondary modal-close-action-btn">
              Close & Return to Schedules
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
