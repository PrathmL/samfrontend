import React from 'react';
import { School, Mail, Phone, MapPin, ExternalLink, Heart } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="main-footer">
      <div className="footer-container">
        <div className="footer-grid">
          {/* Brand Section */}
          <div className="footer-brand-section">
            <div className="footer-logo">
              <div className="logo-icon-wrapper">
                <School size={32} />
              </div>
              <div className="brand-info">
                <span className="brand-name">E-Samruddha Shala Portal</span>
                <span className="brand-tagline">Education Infrastructure Management</span>
              </div>
            </div>
            <p className="footer-desc">
              Transforming education infrastructure through transparent governance, 
              real-time resource monitoring, and collaborative work management.
            </p>
          </div>

          {/* Links Section */}
          <div className="footer-links-section">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="/">{t('home')}</a></li>
              <li><a href="/login">{t('portal_login')}</a></li>
              <li><a href="#">About Project</a></li>
              <li><a href="#">Contact Support</a></li>
            </ul>
          </div>

          {/* Legal Links Section */}
          <div className="footer-legal-section">
            <h4>Legal & Info</h4>
            <ul>
              <li><a href="#" className="legal-link"><span>Terms of Service</span><ExternalLink size={14} /></a></li>
              <li><a href="#" className="legal-link"><span>FAQ</span><ExternalLink size={14} /></a></li>
              <li><a href="#" className="legal-link"><span>Privacy Policy</span><ExternalLink size={14} /></a></li>
              <li><a href="#" className="legal-link"><span>Contact Support</span><ExternalLink size={14} /></a></li>
            </ul>
          </div>

          {/* Contact Section */}
          <div className="footer-contact-section">
            <h4>Support</h4>
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

        {/* Footer Bottom */}
        <div className="footer-bottom">
          <div className="copyright-section">
            <School size={16} className="copyright-icon" />
            <p>© {currentYear} E-Samruddha Shala Project. All rights reserved.</p>
          </div>
          <div className="footer-credit">
            <span>Made with <Heart size={14} className="heart-icon" /> for Education</span>
          </div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        .main-footer {
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #162e4d 100%);
          color: #f8fafc;
          padding: 4rem 2rem 2rem;
          border-top: 1px solid #1e293b;
          margin-top: auto;
          font-family: 'Inter', sans-serif;
        }

        .footer-container {
          max-width: 1400px;
          margin: 0 auto;
        }

        .footer-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 3rem;
          margin-bottom: 3rem;
          animation: fadeIn 0.6s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Brand Section */
        .footer-brand-section {
          grid-column: span 1;
        }

        .footer-logo {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
          animation: slideInLeft 0.6s ease;
        }

        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .logo-icon-wrapper {
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(6, 182, 212, 0.3);
          transition: all 0.3s ease;
        }

        .footer-logo:hover .logo-icon-wrapper {
          transform: scale(1.08) rotate(-5deg);
          box-shadow: 0 6px 16px rgba(6, 182, 212, 0.4);
        }

        .brand-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .brand-name {
          font-size: 1.125rem;
          font-weight: 800;
          color: #e0f2fe;
          letter-spacing: -0.01em;
        }

        .brand-tagline {
          font-size: 0.75rem;
          color: #7dd3fc;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .footer-desc {
          color: #94a3b8;
          line-height: 1.7;
          font-size: 0.95rem;
          margin: 0;
        }

        /* Links Sections */
        .footer-links-section,
        .footer-legal-section,
        .footer-contact-section {
          animation: slideInUp 0.6s ease;
        }

        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .footer-links-section h4,
        .footer-legal-section h4,
        .footer-contact-section h4 {
          color: #e0f2fe;
          font-size: 1.05rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          position: relative;
          padding-bottom: 0.75rem;
          letter-spacing: -0.01em;
        }

        .footer-links-section h4::after,
        .footer-legal-section h4::after,
        .footer-contact-section h4::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 40px;
          height: 2px;
          background: linear-gradient(90deg, #0ea5e9, #06b6d4);
          border-radius: 2px;
        }

        .footer-links-section ul,
        .footer-legal-section ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .footer-links-section ul li,
        .footer-legal-section ul li {
          margin-bottom: 0.875rem;
        }

        .footer-links-section ul li a,
        .footer-legal-section ul li a {
          color: #94a3b8;
          text-decoration: none;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-size: 0.95rem;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          position: relative;
        }

        .footer-links-section ul li a::before,
        .footer-legal-section ul li a::before {
          content: '';
          position: absolute;
          left: 0;
          bottom: -2px;
          width: 0;
          height: 2px;
          background: linear-gradient(90deg, #0ea5e9, #06b6d4);
          transition: width 0.3s ease;
        }

        .footer-links-section ul li a:hover::before,
        .footer-legal-section ul li a:hover::before {
          width: 100%;
        }

        .footer-links-section ul li a:hover,
        .footer-legal-section ul li a:hover {
          color: #0ea5e9;
          transform: translateX(4px);
        }

        .legal-link {
          display: flex !important;
          align-items: center;
          gap: 0.5rem;
        }

        .legal-link span {
          transition: all 0.3s ease;
        }

        .legal-link svg {
          opacity: 0;
          transform: translate(-8px, -8px);
          transition: all 0.3s ease;
        }

        .legal-link:hover svg {
          opacity: 1;
          transform: translate(0, -2px);
        }

        /* Contact Section */
        .contact-item {
          display: flex;
          align-items: flex-start;
          gap: 1rem;
          color: #94a3b8;
          margin-bottom: 1.25rem;
          font-size: 0.95rem;
          transition: all 0.3s ease;
          padding: 0.75rem;
          border-radius: 0.75rem;
        }

        .contact-item:hover {
          background: rgba(14, 165, 233, 0.1);
          color: #0ea5e9;
          transform: translateX(4px);
        }

        .contact-item svg {
          flex-shrink: 0;
          margin-top: 2px;
          transition: all 0.3s ease;
        }

        .contact-item:hover svg {
          transform: scale(1.2) rotate(10deg);
        }

        /* Footer Bottom */
        .footer-bottom {
          border-top: 1px solid #1e293b;
          padding-top: 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 2rem;
          flex-wrap: wrap;
        }

        .copyright-section {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: #64748b;
          font-size: 0.9rem;
        }

        .copyright-icon {
          color: #0ea5e9;
          animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
        }

        .copyright-section p {
          margin: 0;
        }

        .footer-credit {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #64748b;
          font-size: 0.9rem;
        }

        .heart-icon {
          color: #ef4444;
          animation: heartbeat 1.5s ease-in-out infinite;
        }

        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          25% { transform: scale(1.3); }
          50% { transform: scale(1); }
        }

        /* Responsive Design */
        /* Desktop (1024px+) - Already styled */
        
        /* Tablet (768px - 1024px) */
        @media (max-width: 1024px) {
          .main-footer {
            padding: 3.5rem 1.5rem 2rem;
          }

          .footer-grid {
            gap: 2.5rem;
            margin-bottom: 2.5rem;
          }

          .footer-links-section h4,
          .footer-legal-section h4,
          .footer-contact-section h4 {
            font-size: 1rem;
            margin-bottom: 1.25rem;
          }

          .footer-links-section ul li,
          .footer-legal-section ul li {
            margin-bottom: 0.75rem;
          }

          .footer-links-section ul li a,
          .footer-legal-section ul li a {
            font-size: 0.9rem;
          }

          .footer-desc {
            font-size: 0.9rem;
          }
        }

        /* Mobile (640px - 768px) */
        @media (max-width: 768px) {
          .main-footer {
            padding: 3rem 1.25rem 1.75rem;
          }

          .footer-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
            margin-bottom: 2rem;
          }

          .footer-logo {
            gap: 0.875rem;
          }

          .logo-icon-wrapper {
            width: 44px;
            height: 44px;
          }

          .brand-name {
            font-size: 1rem;
          }

          .brand-tagline {
            font-size: 0.7rem;
          }

          .footer-links-section h4,
          .footer-legal-section h4,
          .footer-contact-section h4 {
            font-size: 0.95rem;
            margin-bottom: 1rem;
          }

          .footer-links-section ul li,
          .footer-legal-section ul li {
            margin-bottom: 0.625rem;
          }

          .footer-links-section ul li a,
          .footer-legal-section ul li a {
            font-size: 0.875rem;
          }

          .footer-desc {
            font-size: 0.875rem;
          }

          .contact-item {
            font-size: 0.875rem;
            margin-bottom: 1rem;
            padding: 0.6rem;
          }

          .footer-bottom {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
            align-items: center;
          }

          .copyright-section {
            width: 100%;
            justify-content: center;
            font-size: 0.85rem;
          }

          .footer-credit {
            font-size: 0.85rem;
          }
        }

        /* Small Mobile (480px - 640px) */
        @media (max-width: 640px) {
          .main-footer {
            padding: 2.5rem 1rem 1.5rem;
          }

          .footer-grid {
            gap: 1.75rem;
            margin-bottom: 1.75rem;
          }

          .footer-logo {
            gap: 0.75rem;
            margin-bottom: 1rem;
          }

          .logo-icon-wrapper {
            width: 40px;
            height: 40px;
            border-radius: 10px;
          }

          .logo-icon-wrapper svg {
            width: 24px;
            height: 24px;
          }

          .brand-name {
            font-size: 0.95rem;
          }

          .brand-tagline {
            font-size: 0.65rem;
          }

          .footer-links-section h4,
          .footer-legal-section h4,
          .footer-contact-section h4 {
            font-size: 0.9rem;
            margin-bottom: 0.875rem;
          }

          .footer-links-section ul li,
          .footer-legal-section ul li {
            margin-bottom: 0.5rem;
          }

          .footer-links-section ul li a,
          .footer-legal-section ul li a {
            font-size: 0.8rem;
          }

          .footer-desc {
            font-size: 0.8rem;
            line-height: 1.6;
          }

          .contact-item {
            font-size: 0.8rem;
            margin-bottom: 0.875rem;
            padding: 0.5rem;
            gap: 0.75rem;
          }

          .footer-bottom {
            gap: 0.875rem;
          }

          .copyright-section,
          .footer-credit {
            font-size: 0.75rem;
          }

          .copyright-icon {
            width: 14px;
            height: 14px;
          }

          .heart-icon {
            width: 12px;
            height: 12px;
          }
        }

        /* Extra Small Mobile (< 480px) */
        @media (max-width: 480px) {
          .main-footer {
            padding: 2rem 0.75rem 1.25rem;
          }

          .footer-grid {
            gap: 1.5rem;
            margin-bottom: 1.5rem;
          }

          .footer-logo {
            gap: 0.625rem;
            margin-bottom: 0.875rem;
          }

          .logo-icon-wrapper {
            width: 36px;
            height: 36px;
            border-radius: 8px;
          }

          .logo-icon-wrapper svg {
            width: 20px;
            height: 20px;
          }

          .brand-name {
            font-size: 0.875rem;
          }

          .brand-tagline {
            font-size: 0.6rem;
          }

          .footer-links-section,
          .footer-legal-section,
          .footer-contact-section {
            padding: 0 0.5rem;
          }

          .footer-links-section h4,
          .footer-legal-section h4,
          .footer-contact-section h4 {
            font-size: 0.85rem;
            margin-bottom: 0.75rem;
          }

          .footer-links-section h4::after,
          .footer-legal-section h4::after,
          .footer-contact-section h4::after {
            width: 30px;
          }

          .footer-links-section ul li,
          .footer-legal-section ul li {
            margin-bottom: 0.4rem;
          }

          .footer-links-section ul li a,
          .footer-legal-section ul li a {
            font-size: 0.75rem;
          }

          .footer-desc {
            font-size: 0.75rem;
            line-height: 1.5;
          }

          .contact-item {
            font-size: 0.75rem;
            margin-bottom: 0.75rem;
            padding: 0.4rem;
          }

          .contact-item svg {
            width: 14px;
            height: 14px;
          }

          .footer-bottom {
            gap: 0.75rem;
            padding-top: 1.5rem;
          }

          .copyright-section,
          .footer-credit {
            font-size: 0.7rem;
          }

          .copyright-icon {
            width: 12px;
            height: 12px;
          }

          .heart-icon {
            width: 10px;
            height: 10px;
          }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
