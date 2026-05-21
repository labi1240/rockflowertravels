import React from 'react';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-container">
        <div className="footer-info">
          <div className="logo-container footer-logo">
            <span className="logo-flower">🌸</span>
            <div className="logo-text">
              <span className="logo-brand text-white">RockFlower</span>
              <span className="logo-subbrand text-white-muted">Travels Inc.</span>
            </div>
          </div>
          <p className="footer-desc">
            Providing premium transportation services across the Canadian Rockies. Experience Banff, Lake Louise, and Moraine Lake with our luxurious shuttle service.
          </p>
          <div className="footer-meta">
            <p className="meta-item"><strong>Prepared:</strong> May 03, 2026</p>
            <p className="meta-item"><strong>Document State:</strong> Shuttle Schedule Draft (v1.2)</p>
          </div>
        </div>

        <div className="footer-links-group">
          <div className="footer-links-col">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="#schedule">Schedules</a></li>
              <li><a href="#tracker">Live Shuttle Tracker</a></li>
              <li><a href="#map">Route Map</a></li>
              <li><a href="#booking">Book Shuttle</a></li>
            </ul>
          </div>

          <div className="footer-links-col">
            <h4>Contact & Support</h4>
            <ul>
              <li><a href="mailto:info@rockflowertravels.ca">info@rockflowertravels.ca</a></li>
              <li><a href="tel:+14035550199">+1 (403) 555-0199</a></li>
              <li><span className="text-white-muted">Banff Visitor Center</span></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-container">
          <p>&copy; {new Date().getFullYear()} RockFlower Travels Inc. All rights reserved.</p>
          <p className="footer-terms">
            Buses depart strictly on time. Please arrive 10 minutes prior to departure.
          </p>
        </div>
      </div>
    </footer>
  );
}
