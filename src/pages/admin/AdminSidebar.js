import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  MapPin, 
  School as SchoolIcon, 
  ClipboardList, 
  AlertCircle, 
  BarChart3, 
  Settings,
  LogOut,
  Eye,
  FileText,
  Bell,
  MessageSquare,
  IndianRupee,
  User,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const AdminSidebar = ({ collapsed, setCollapsed, isMobile, isOpen }) => {
  const { t } = useTranslation();

  const menuItems = [
    { name: t('menu_dashboard'), path: '/admin/dashboard', icon: LayoutDashboard },
    { name: t('menu_users'), path: '/admin/users', icon: Users },
    { name: t('menu_talukas'), path: '/admin/talukas', icon: MapPin },
    { name: t('menu_schools'), path: '/admin/schools', icon: SchoolIcon },
    { name: t('menu_work_monitoring'), path: '/admin/work-monitoring', icon: Eye },
    { name: t('menu_work_requests'), path: '/admin/work-requests', icon: ClipboardList },
    { name: t('menu_blockers'), path: '/admin/blockers', icon: AlertCircle },
    { name: t('menu_analytics'), path: '/admin/analytics', icon: BarChart3 },
    { name: t('menu_alerts'), path: '/admin/alerts', icon: Bell },
    { name: t('menu_reports'), path: '/admin/reports', icon: FileText },
    { name: t('menu_communication'), path: '/admin/communication', icon: MessageSquare },
    { name: t('menu_audit_logs'), path: '/admin/audit-logs', icon: Settings },
    { name: t('profile'), path: '/admin/profile', icon: User },
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
          background-color: #f8fafc;
          border-right: 1px solid #e2e8f0;
          height: calc(100vh - 60px);
          position: fixed;
          left: 0;
          top: 60px;
          padding-top: 1rem;
          overflow-y: auto;
          overflow-x: hidden;
          display: flex;
          flex-direction: column;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 999;
          box-shadow: 1px 0 10px rgba(0,0,0,0.02);
        }

        .sidebar.mobile {
          transform: translateX(-100%);
          width: 260px;
          top: 0;
          height: 100vh;
          padding-top: 2rem;
        }

        .sidebar.mobile.open {
          transform: translateX(0);
        }

        .sidebar-header {
          padding: 0 1.5rem 1rem;
          border-bottom: 1px solid #edf2f7;
          margin-bottom: 1rem;
          min-height: 40px;
          display: flex;
          align-items: center;
        }

        .admin-portal-label {
          font-size: 0.7rem;
          font-weight: 800;
          color: #94a3b8;
          letter-spacing: 0.1em;
        }

        .sidebar-menu {
          padding: 0 0.75rem;
          flex: 1;
        }

        .menu-item {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          padding: 0.75rem 1rem;
          color: #475569;
          text-decoration: none;
          border-radius: 0.6rem;
          margin-bottom: 0.35rem;
          transition: all 0.2s ease;
          font-weight: 500;
          white-space: nowrap;
          border: 1px solid transparent;
        }

        .menu-item:hover {
          background-color: #f1f5f9;
          color: #1e293b;
          transform: translateX(4px);
        }

        .menu-item.active {
          background-color: white;
          color: #0ea5e9;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
          border-color: #e2e8f0;
          font-weight: 600;
        }

        .menu-item.active .menu-icon {
          color: #0ea5e9;
        }

        .menu-icon {
          min-width: 20px;
          color: #64748b;
          transition: color 0.2s;
        }

        .collapse-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
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
        
        .collapsed .menu-item:hover {
          transform: none;
        }

        /* Custom Scrollbar */
        .sidebar::-webkit-scrollbar {
          width: 5px;
        }
        .sidebar::-webkit-scrollbar-track {
          background: transparent;
        }
        .sidebar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .sidebar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }

        @media (max-width: 1024px) {
          .sidebar:not(.mobile) {
            transform: translateX(-100%);
          }
        }
      `}</style>
    </div>
  );
};

export default AdminSidebar;
