import React, { useState } from 'react';
import AdminSidebar from '../admin/AdminSidebar';
import SachivSidebar from '../sachiv/SachivSidebar';
import HeadmasterSidebar from '../headmaster/HeadmasterSidebar';
import ClerkSidebar from '../clerk/ClerkSidebar';
import Navbar from '../../components/common/Navbar';
import Footer from '../../components/common/Footer';
import { useAuth } from '../../context/AuthContext';

const DashboardLayout = ({ children }) => {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  const renderSidebar = () => {
    switch (user?.role) {
      case 'ADMIN':
        return <AdminSidebar />;
      case 'SACHIV':
        return <SachivSidebar collapsed={collapsed} setCollapsed={setCollapsed} />;
      case 'HEADMASTER':
        return <HeadmasterSidebar collapsed={collapsed} setCollapsed={setCollapsed} />;
      case 'CLERK':
        return <ClerkSidebar collapsed={collapsed} setCollapsed={setCollapsed} />;
      default:
        return null;
    }
  };

  const getMarginLeft = () => {
    if (user?.role === 'ADMIN') return '260px';
    return collapsed ? '70px' : '260px';
  };

  return (
    <div className="dashboard-wrapper">
      <Navbar />
      <div className="dashboard-layout">
        {renderSidebar()}
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
        }
        .dashboard-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          transition: margin-left 0.3s ease;
          min-width: 0; /* Prevents flex items from overflowing */
        }
        .dashboard-main {
          flex: 1;
          padding: 2rem;
        }
      `}</style>
    </div>
  );
};

export default DashboardLayout;

