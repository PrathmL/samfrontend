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
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminSidebar = () => {
  const { logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'User Management', path: '/admin/users', icon: Users },
    { name: 'Taluka Management', path: '/admin/talukas', icon: MapPin },
    { name: 'School Management', path: '/admin/schools', icon: SchoolIcon },
    { name: 'Work Monitoring', path: '/admin/work-monitoring', icon: Eye },
    { name: 'Work Requests', path: '/admin/work-requests', icon: ClipboardList },
    { name: 'Blocker Management', path: '/admin/blockers', icon: AlertCircle },
    { name: 'Blocker Analytics', path: '/admin/analytics', icon: BarChart3 },
    { name: 'Alerts & Notifications', path: '/admin/alerts', icon: Bell },
    { name: 'Reports', path: '/admin/reports', icon: FileText },
    { name: 'Communication', path: '/admin/communication', icon: MessageSquare },
    { name: 'Audit Logs', path: '/admin/audit-logs', icon: ClipboardList },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="admin-sidebar">
      <div className="sidebar-header">
        <h2>ESSP Admin</h2>
      </div>
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink 
            key={item.path} 
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <item.icon size={20} />
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <button onClick={logout} className="logout-button">
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>

      <style>{`
        .admin-sidebar {
          width: 260px;
          background-color: #1e293b;
          color: white;
          display: flex;
          flex-direction: column;
          height: 100vh;
          position: fixed;
          left: 0;
          top: 0;
        }
        .sidebar-header {
          padding: 1.5rem;
          border-bottom: 1px solid #334155;
          text-align: center;
        }
        .sidebar-header h2 {
          margin: 0;
          font-size: 1.25rem;
          color: #38bdf8;
        }
        .sidebar-nav {
          flex: 1;
          padding: 1rem 0;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          overflow-y: auto;
        }
        .sidebar-nav::-webkit-scrollbar {
          width: 4px;
        }
        .sidebar-nav::-webkit-scrollbar-track {
          background: transparent;
        }
        .sidebar-nav::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 10px;
        }
        .sidebar-nav::-webkit-scrollbar-thumb:hover {
          background: #475569;
        }
        .nav-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1.5rem;
          text-decoration: none;
          color: #cbd5e1;
          transition: all 0.2s;
        }
        .nav-item:hover {
          background-color: #334155;
          color: white;
        }
        .nav-item.active {
          background-color: #0ea5e9;
          color: white;
        }
        .sidebar-footer {
          padding: 1rem;
          border-top: 1px solid #334155;
        }
        .logout-button {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          width: 100%;
          padding: 0.75rem;
          background: none;
          border: none;
          color: #cbd5e1;
          cursor: pointer;
          transition: color 0.2s;
          font-size: 1rem;
        }
        .logout-button:hover {
          color: #ef4444;
        }
      `}</style>
    </div>
  );
};

export default AdminSidebar;
