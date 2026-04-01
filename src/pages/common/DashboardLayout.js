import React, { useState, useEffect } from 'react';
import AdminSidebar from '../admin/AdminSidebar';
import SachivSidebar from '../sachiv/SachivSidebar';
import HeadmasterSidebar from '../headmaster/HeadmasterSidebar';
import ClerkSidebar from '../clerk/ClerkSidebar';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from 'react-router-dom';

const DashboardLayout = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1024);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 1024;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(false);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [location.pathname, isMobile]);

  const toggleSidebar = () => {
    if (isMobile) {
      setSidebarOpen(!sidebarOpen);
    } else {
      setCollapsed(!collapsed);
    }
  };

  const renderSidebar = () => {
    const commonProps = { collapsed, setCollapsed, isMobile, isOpen: sidebarOpen };
    
    switch (user?.role) {
      case 'ADMIN':
        return <AdminSidebar {...commonProps} />;
      case 'SACHIV':
        return <SachivSidebar {...commonProps} />;
      case 'HEADMASTER':
        return <HeadmasterSidebar {...commonProps} />;
      case 'CLERK':
        return <ClerkSidebar {...commonProps} />;
      default:
        return null;
    }
  };

  const getMarginLeft = () => {
    if (isMobile) return '0';
    if (user?.role === 'ADMIN') return collapsed ? '70px' : '260px';
    return collapsed ? '70px' : '260px';
  };

  return (
    <div className="dashboard-wrapper">
      <Navbar toggleSidebar={toggleSidebar} />
      <div className="dashboard-layout">
        {renderSidebar()}
        
        {isMobile && sidebarOpen && (
          <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>
        )}

        <div className="dashboard-container" style={{ marginLeft: getMarginLeft() }}>
          <main className="dashboard-main">
            {children}
          </main>
          <Footer />
        </div>
      </div>

      <style>{`
        .dashboard-wrapper {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
        }
        .dashboard-layout {
          display: flex;
          flex: 1;
          background-color: #f8fafc;
          position: relative;
        }
        .dashboard-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          transition: margin-left 0.3s ease;
          min-width: 0;
        }
        .dashboard-main {
          flex: 1;
          padding: 1.5rem;
        }
        .sidebar-overlay {
          position: fixed;
          top: 60px;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.4);
          z-index: 998;
          backdrop-filter: blur(2px);
        }

        @media (max-width: 768px) {
          .dashboard-main {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default DashboardLayout;

