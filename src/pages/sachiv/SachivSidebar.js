import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  AlertCircle, 
  BarChart3, 
  Bell, 
  CheckCircle, 
  FileText, 
  MessageSquare, 
  User,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const SachivSidebar = ({ collapsed, setCollapsed, isMobile, isOpen }) => {
  const { t } = useTranslation();

  const menuItems = [
    { name: t('menu_dashboard'), path: '/sachiv/dashboard', icon: LayoutDashboard },
    { name: t('menu_work_monitoring'), path: '/sachiv/works', icon: Briefcase },
    { name: t('menu_blockers'), path: '/sachiv/blockers', icon: AlertCircle },
    { name: t('menu_analytics'), path: '/sachiv/analytics', icon: BarChart3 },
    { name: t('menu_alerts'), path: '/sachiv/alerts', icon: Bell },
    { name: t('menu_verification'), path: '/sachiv/verification', icon: CheckCircle },
    { name: t('menu_reports'), path: '/sachiv/reports', icon: FileText },
    { name: t('menu_communication'), path: '/sachiv/communication', icon: MessageSquare },
    { name: t('profile'), path: '/sachiv/profile', icon: User },
  ];

  const sidebarWidth = collapsed ? '70px' : '260px';

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''} ${isMobile ? 'mobile' : ''} ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-menu">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
            title={collapsed ? item.name : ''}
          >
            <item.icon size={20} className="menu-icon" />
            {!collapsed && <span className="menu-text">{item.name}</span>}
          </NavLink>
        ))}
      </div>

      {!isMobile && (
        <button 
          className="collapse-btn" 
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      )}

      <style>{`
        .sidebar {
          width: ${sidebarWidth};
          background-color: white;
          border-right: 1px solid #e2e8f0;
          height: calc(100vh - 60px);
          position: fixed;
          left: 0;
          top: 60px;
          overflow-y: auto;
          overflow-x: hidden;
          display: flex;
          flex-direction: column;
          transition: all 0.3s ease;
          z-index: 999;
        }

        .sidebar.mobile {
          transform: translateX(-100%);
          width: 260px;
        }

        .sidebar.mobile.open {
          transform: translateX(0);
        }

        .sidebar-menu {
          padding: 1rem 0.75rem;
          flex: 1;
        }

        .menu-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 0.85rem;
          color: #64748b;
          text-decoration: none;
          border-radius: 0.5rem;
          margin-bottom: 0.25rem;
          transition: all 0.2s;
          font-weight: 500;
          white-space: nowrap;
        }

        .menu-item:hover {
          background-color: #f1f5f9;
          color: #0f172a;
        }

        .menu-item.active {
          background-color: #f0f9ff;
          color: #0ea5e9;
        }

        .menu-icon {
          min-width: 20px;
        }

        .collapse-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0.75rem;
          background: #f8fafc;
          border: none;
          border-top: 1px solid #e2e8f0;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s;
        }

        .collapse-btn:hover {
          background: #f1f5f9;
          color: #0f172a;
        }

        .collapsed .menu-item {
          justify-content: center;
          padding: 0.75rem;
          gap: 0;
        }

        /* Custom Scrollbar */
        .sidebar::-webkit-scrollbar {
          width: 4px;
        }
        .sidebar::-webkit-scrollbar-track {
          background: transparent;
        }
        .sidebar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default SachivSidebar;
