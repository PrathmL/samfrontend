import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { School, ChevronRight, LogOut, User, Globe, ChevronDown, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { showConfirmAlert } from '../../utils/sweetAlertUtils';

const Navbar = ({ toggleSidebar }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { t, i18n } = useTranslation();
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const handleLogout = async () => {
    const isConfirmed = await showConfirmAlert(
      'Logout',
      'Are you sure you want to log out?',
      'Yes, Logout',
      'Cancel'
    );
    if (isConfirmed) {
      logout();
      navigate('/');
    }
  };

  const isDashboard = location.pathname.includes('/admin') || 
                      location.pathname.includes('/sachiv') || 
                      location.pathname.includes('/headmaster') || 
                      location.pathname.includes('/clerk');

  const handleBrandClick = () => {
    if (user) {
      navigate(`/${user.role.toLowerCase()}/dashboard`);
    } else {
      navigate('/');
    }
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setLangDropdownOpen(false);
  };

  const currentLanguage = i18n.language || 'en';

  return (
    <nav className={`main-navbar ${isDashboard ? 'dashboard-nav' : ''}`}>
      <div className="nav-container">
        <div className="nav-left">
          {isDashboard && (
            <button className="hamburger-btn" onClick={toggleSidebar}>
              <Menu size={24} />
            </button>
          )}
          <div className="nav-brand" onClick={handleBrandClick} style={{ cursor: 'pointer' }}>
            <School className="brand-icon" />
            <div className="brand-text">
              <span className="brand-name">{t('brand_name')}</span>
              <span className="brand-tagline">{t('brand_tagline')}</span>
            </div>
          </div>
        </div>

        <div className="nav-actions">
          {/* Language Dropdown */}
          <div className="lang-selector">
            <button className="lang-btn" onClick={() => setLangDropdownOpen(!langDropdownOpen)}>
              <Globe size={18} />
              <span className="lang-text">{currentLanguage === 'en' ? 'English' : 'मराठी'}</span>
              <ChevronDown size={14} className={langDropdownOpen ? 'rotate' : ''} />
            </button>
            {langDropdownOpen && (
              <div className="lang-dropdown">
                <button className={currentLanguage === 'en' ? 'active' : ''} onClick={() => changeLanguage('en')}>English</button>
                <button className={currentLanguage === 'mr' ? 'active' : ''} onClick={() => changeLanguage('mr')}>मराठी</button>
              </div>
            )}
          </div>

          {user ? (
            <div className="user-nav-box">
              <div className="user-profile-btn" onClick={() => navigate(`/${user.role.toLowerCase()}/profile`)}>
                <User size={18} />
                <div className="user-details-nav">
                  <span className="user-name-nav">{user.name}</span>
                  <span className="user-role-nav">{user.role}</span>
                </div>
              </div>
              <button className="logout-nav-btn" onClick={handleLogout}>
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            location.pathname !== '/login' && (
              <button className="login-nav-btn" onClick={() => navigate('/login')}>
                {t('portal_login')} <ChevronRight size={16} />
              </button>
            )
          )}
        </div>
      </div>

      <style>{`
        .main-navbar {
          background: white;
          border-bottom: 1px solid #e2e8f0;
          padding: 0.5rem 5%;
          position: sticky;
          top: 0;
          z-index: 1000;
          height: 60px;
          display: flex;
          align-items: center;
        }

        .nav-container {
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .nav-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .hamburger-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          background: none;
          border: none;
          color: #64748b;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 0.5rem;
          transition: background 0.2s;
        }

        .hamburger-btn:hover {
          background: #f1f5f9;
          color: #0f172a;
        }

        .nav-brand {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .brand-icon {
          color: #0ea5e9;
          width: 28px;
          height: 28px;
        }

        .brand-text {
          display: flex;
          flex-direction: column;
        }

        .brand-name {
          font-size: 1.1rem;
          font-weight: 800;
          color: #0f172a;
          line-height: 1.2;
        }

        .brand-tagline {
          font-size: 0.65rem;
          color: #64748b;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .nav-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        /* Language Selector */
        .lang-selector {
          position: relative;
        }

        .lang-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.4rem 0.6rem;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          font-weight: 600;
          font-size: 0.8rem;
          color: #475569;
          cursor: pointer;
          transition: all 0.2s;
        }

        .lang-btn:hover {
          background: #e2e8f0;
        }

        .lang-btn .rotate {
          transform: rotate(180deg);
        }

        .lang-dropdown {
          position: absolute;
          top: calc(100% + 0.5rem);
          right: 0;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
          width: 120px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .lang-dropdown button {
          padding: 0.75rem 1rem;
          border: none;
          background: none;
          text-align: left;
          font-size: 0.9rem;
          font-weight: 500;
          color: #475569;
          cursor: pointer;
          transition: background 0.2s;
        }

        .lang-dropdown button:hover {
          background: #f8fafc;
        }

        .lang-dropdown button.active {
          color: #0ea5e9;
          background: #f0f9ff;
          font-weight: 700;
        }

        .login-nav-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: #1e293b;
          color: white;
          border: none;
          border-radius: 9999px;
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .login-nav-btn:hover {
          background: #334155;
          transform: translateY(-1px);
        }

        .user-nav-box {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: #f8fafc;
          padding: 0.3rem;
          padding-left: 0.75rem;
          border-radius: 9999px;
          border: 1px solid #e2e8f0;
        }

        .user-profile-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
        }

        .user-details-nav {
          display: flex;
          flex-direction: column;
        }

        .user-name-nav {
          font-size: 0.8rem;
          font-weight: 700;
          color: #1e293b;
          line-height: 1.2;
        }

        .user-role-nav {
          font-size: 0.65rem;
          color: #0ea5e9;
          font-weight: 600;
        }

        .logout-nav-btn {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 50%;
          color: #ef4444;
          cursor: pointer;
          transition: all 0.2s;
        }

        .logout-nav-btn:hover {
          background: #fee2e2;
          border-color: #fecaca;
        }

        /* Dashboard variation */
        .main-navbar.dashboard-nav {
          padding: 0.5rem 1.5rem;
          background: #ffffff;
          border-bottom: 1px solid #e2e8f0;
        }

        @media (max-width: 768px) {
          .lang-text {
            display: none;
          }
          .user-details-nav {
            display: none;
          }
          .brand-tagline {
            display: none;
          }
          .user-nav-box {
            padding-left: 0.3rem;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
