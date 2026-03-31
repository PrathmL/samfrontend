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
  User
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const AdminSidebar = () => {
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

  return (
    <div className="sidebar">
      <div className="sidebar-menu">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
          >
            <item.icon size={20} />
            <span>{item.name}</span>
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
          display: flex;
          flex-direction: column;
        }
        .sidebar-menu {
          padding: 1.5rem 1rem;
          flex: 1;
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

export default AdminSidebar;
