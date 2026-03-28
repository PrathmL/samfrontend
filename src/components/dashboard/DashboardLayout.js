import React, { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import SachivSidebar from './SachivSidebar';
import HeadmasterSidebar from './HeadmasterSidebar';
import ClerkSidebar from './ClerkSidebar';
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
    if (user?.role === 'ADMIN') return '260px'; // AdminSidebar is currently fixed at 260px
    return collapsed ? '70px' : '260px';
  };

  return (
    <div className="dashboard-layout">
      {renderSidebar()}
      <main className="dashboard-main" style={{ marginLeft: getMarginLeft() }}>
        {children}
      </main>

      <style>{`
        .dashboard-layout {
          display: flex;
          min-height: 100vh;
          background-color: #f8fafc;
        }
        .dashboard-main {
          flex: 1;
          padding: 2rem;
          transition: margin-left 0.3s ease;
        }
      `}</style>
    </div>
  );
};

export default DashboardLayout;
