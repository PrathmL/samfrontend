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
  User 
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const SachivSidebar = ({ collapsed }) => {
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

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-menu">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
          >
            <item.icon size={20} />
            {!collapsed && <span>{item.name}</span>}
          </NavLink>
        ))}
      </div>

      <style>{`
        .sidebar {
          width: 260px;
          background-color: white;
          border-right: 1px solid #e2e8f0;
          height: calc(100vh - 70px);
          position: fixed;
          left: 0;
          overflow-y: auto;
          transition: width 0.3s ease;
        }
        .sidebar.collapsed {
          width: 70px;
        }
        .sidebar-menu {
          padding: 1.5rem 1rem;
        }
        .menu-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
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
      `}</style>
    </div>
  );
};

export default SachivSidebar;
