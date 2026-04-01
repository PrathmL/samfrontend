import React, { useState } from 'react';
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
  Menu,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const AdminSidebar = ({ collapsed, setCollapsed }) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

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
    <>
      <button 
        className="sidebar-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle sidebar"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>
      
      {isOpen && <div className="sidebar-overlay" onClick={() => setIsOpen(false)} />}
      
      <div className={`sidebar ${collapsed ? 'collapsed' : ''} ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-title">{t('menu_label')}</h2>
          <button 
            className="desktop-toggle-btn"
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
          <button 
            className="close-btn"
            onClick={() => setIsOpen(false)}
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="sidebar-menu">
          {menuItems.map((item, index) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
              onClick={() => setIsOpen(false)}
              style={{ animationDelay: `${index * 0.05}s` }}
              title={item.name}
            >
              <item.icon size={20} className="menu-icon" />
              {!collapsed && <span className="menu-text">{item.name}</span>}
            </NavLink>
          ))}
        </div>

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

          .sidebar-toggle {
            display: none;
            position: fixed;
            top: 80px;
            left: 1rem;
            z-index: 999;
            background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%);
            border: none;
            color: white;
            padding: 0.75rem;
            border-radius: 0.75rem;
            cursor: pointer;
            font-family: 'Inter', sans-serif;
            box-shadow: 0 4px 12px rgba(6, 182, 212, 0.3);
            transition: all 0.3s ease;
          }

          .sidebar-toggle:hover {
            transform: scale(1.05);
            box-shadow: 0 6px 16px rgba(6, 182, 212, 0.4);
          }

          .sidebar-overlay {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            z-index: 998;
          }

          .sidebar {
            width: 280px;
            background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);
            border-right: 1px solid #e2e8f0;
            height: calc(100vh - 70px);
            position: fixed;
            left: 0;
            top: 70px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 4px 12px -4px rgba(0, 0, 0, 0.1);
            font-family: 'Inter', sans-serif;
            scrollbar-width: thin;
            scrollbar-color: #cbd5e1 transparent;
          }

          .sidebar.collapsed {
            width: 110px;
          }

          .sidebar::-webkit-scrollbar {
            width: 6px;
          }

          .sidebar::-webkit-scrollbar-track {
            background: transparent;
          }

          .sidebar::-webkit-scrollbar-thumb {
            background: #cbd5e1;
            border-radius: 10px;
          }

          .sidebar::-webkit-scrollbar-thumb:hover {
            background: #94a3b8;
          }

          .sidebar-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 1.25rem 1rem;
            border-bottom: 1px solid #e2e8f0;
            min-height: 60px;
          }

          .sidebar-title {
            margin: 0;
            font-size: 1.125rem;
            font-weight: 700;
            color: #0f172a;
            letter-spacing: -0.02em;
            flex: 1;
          }

          .sidebar.collapsed .sidebar-title {
            display: none;
          }

          .desktop-toggle-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            background: none;
            border: none;
            color: #0ea5e9;
            cursor: pointer;
            padding: 0.5rem;
            border-radius: 0.5rem;
            transition: all 0.3s ease;
            flex-shrink: 0;
          }

          .desktop-toggle-btn:hover {
            background: #e0f2fe;
            color: #0284c7;
            transform: scale(1.1);
          }

          .close-btn {
            display: none;
            align-items: center;
            justify-content: center;
            background: none;
            border: none;
            color: #64748b;
            cursor: pointer;
            padding: 0.5rem;
            border-radius: 0.5rem;
            transition: all 0.2s ease;
          }

          .close-btn:hover {
            color: #0f172a;
            background: #f1f5f9;
          }

          .sidebar-menu {
            padding: 1.25rem 0.75rem;
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
          }

          .menu-item {
            display: flex;
            align-items: center;
            gap: 1rem;
            padding: 0.875rem 1.125rem;
            color: #64748b;
            text-decoration: none;
            border-radius: 0.875rem;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            font-weight: 500;
            font-size: 0.95rem;
            position: relative;
            overflow: hidden;
            animation: slideInLeft 0.6s ease forwards;
            opacity: 0;
          }

          @keyframes slideInLeft {
            from {
              opacity: 0;
              transform: translateX(-20px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }

          .menu-icon {
            flex-shrink: 0;
            transition: all 0.3s ease;
          }

          .menu-text {
            flex: 1;
            transition: all 0.3s ease;
          }

          .menu-item::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
            transform: translateX(-100%);
            transition: transform 0.5s ease;
          }

          .menu-item:hover::before {
            transform: translateX(100%);
          }

          .menu-item:hover {
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
            color: #0ea5e9;
            transform: translateX(4px);
            box-shadow: 0 4px 12px rgba(14, 165, 233, 0.15);
          }

          .menu-item:hover .menu-icon {
            transform: scale(1.1) rotate(-5deg);
            color: #0ea5e9;
          }

          .menu-item.active {
            background: linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%);
            color: white;
            box-shadow: 0 8px 16px rgba(6, 182, 212, 0.3);
            transform: translateX(4px);
          }

          .menu-item.active .menu-icon,
          .menu-item.active .menu-text {
            color: white;
          }

          .menu-item.active .menu-icon {
            animation: bounceIcon 0.6s ease;
          }

          @keyframes bounceIcon {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.2); }
          }

          /* Desktop - Hide toggle */
          @media (min-width: 1025px) {
            .sidebar-toggle,
            .sidebar-overlay {
              display: none !important;
            }
          }

          /* Tablet (768px - 1024px) */
          @media (max-width: 1024px) {
            .sidebar {
              width: 240px;
            }

            .sidebar.collapsed {
              width: 110px;
            }

            .sidebar-menu {
              padding: 1rem 0.5rem;
              gap: 0.4rem;
            }

            .menu-item {
              padding: 0.75rem 1rem;
              font-size: 0.9rem;
            }
          }

          /* Mobile Responsiveness (640px - 768px) */
          @media (max-width: 768px) {
            .sidebar-toggle,
            .sidebar-overlay {
              display: flex;
            }

            .sidebar {
              width: 280px;
              transform: translateX(-100%);
              opacity: 0;
              z-index: 999;
            }

            .sidebar.open {
              transform: translateX(0);
              opacity: 1;
            }

            .sidebar.open.sidebar-overlay {
              display: block;
            }

            .sidebar.collapsed {
              width: 280px;
            }

            .sidebar.collapsed .menu-text {
              display: block;
            }

            .sidebar-header {
              display: flex;
              align-items: center;
              justify-content: space-between;
            }

            .close-btn {
              display: block;
            }
          }

          /* Small Mobile (480px - 640px) */
          @media (max-width: 640px) {
            .sidebar {
              width: 260px;
            }

            .sidebar-toggle {
              top: 78px;
              left: 0.75rem;
              padding: 0.65rem;
            }

            .sidebar-menu {
              padding: 0.875rem 0.5rem;
            }

            .menu-item {
              padding: 0.7rem 0.875rem;
              font-size: 0.85rem;
              gap: 0.75rem;
            }

            .menu-icon {
              width: 18px;
              height: 18px;
            }
          }

          /* Extra Small Mobile (< 480px) */
          @media (max-width: 480px) {
            .sidebar {
              width: 100%;
            }

            .sidebar-toggle {
              top: 76px;
              left: 0.5rem;
              right: auto;
              padding: 0.6rem;
            }

            .sidebar-header {
              padding: 1rem 1rem;
            }

            .sidebar-title {
              font-size: 1rem;
            }

            .sidebar-menu {
              padding: 0.75rem 0.5rem;
              gap: 0.35rem;
            }

            .menu-item {
              padding: 0.65rem 0.75rem;
              font-size: 0.8rem;
              gap: 0.65rem;
            }

            .menu-icon {
              width: 16px;
              height: 16px;
            }

            .menu-text {
              font-size: 0.8rem;
            }
          }
        `}</style>
      </div>
    </>
  );
};

export default AdminSidebar;
