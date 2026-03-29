import React from 'react';
import { School, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="main-footer">
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-brand-section">
            <div className="footer-logo">
              <School size={28} color="#0ea5e9" />
              <span>E-Samruddha Shala</span>
            </div>
            <p className="footer-desc">
              Transforming education infrastructure through transparent governance 
              and real-time resource monitoring.
            </p>
          </div>

          <div className="footer-links-section">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="/">Home</a></li>
              <li><a href="/login">Portal Login</a></li>
              <li><a href="#">About Project</a></li>
              <li><a href="#">Contact Support</a></li>
            </ul>
          </div>

          <div className="footer-contact-section">
            <h4>Support Contact</h4>
            <div className="contact-item">
              <Mail size={16} />
              <span>support@samruddhashala.gov.in</span>
            </div>
            <div className="contact-item">
              <Phone size={16} />
              <span>+91 1800-123-4567</span>
            </div>
            <div className="contact-item">
              <MapPin size={16} />
              <span>Education Dept, District HQ</span>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© 2026 E-Samruddha Shala Project. All rights reserved.</p>
          <div className="footer-legal">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
      </div>

      <style>{`
        .main-footer {
          background: #0f172a;
          color: #f8fafc;
          padding: 4rem 5% 2rem;
          border-top: 1px solid #1e293b;
        }

        .footer-container {
          max-width: 1400px;
          margin: 0 auto;
        }

        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1.5fr;
          gap: 4rem;
          margin-bottom: 4rem;
        }

        .footer-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1.25rem;
          font-weight: 800;
          margin-bottom: 1.5rem;
        }

        .footer-desc {
          color: #94a3b8;
          line-height: 1.6;
          max-width: 320px;
        }

        .footer-grid h4 {
          color: white;
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
        }

        .footer-links-section ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .footer-links-section ul li {
          margin-bottom: 0.75rem;
        }

        .footer-links-section ul li a {
          color: #94a3b8;
          text-decoration: none;
          transition: color 0.2s;
          font-size: 0.95rem;
        }

        .footer-links-section ul li a:hover {
          color: #0ea5e9;
        }

        .contact-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: #94a3b8;
          margin-bottom: 1rem;
          font-size: 0.95rem;
        }

        .footer-bottom {
          border-top: 1px solid #1e293b;
          padding-top: 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: #64748b;
          font-size: 0.85rem;
        }

        .footer-legal {
          display: flex;
          gap: 2rem;
        }

        .footer-legal a {
          color: #64748b;
          text-decoration: none;
        }

        .footer-legal a:hover {
          color: #94a3b8;
        }

        @media (max-width: 768px) {
          .footer-grid { grid-template-columns: 1fr; gap: 2.5rem; }
          .footer-bottom { flex-direction: column; gap: 1rem; text-align: center; }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
