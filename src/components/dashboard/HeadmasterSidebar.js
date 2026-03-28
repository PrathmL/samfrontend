import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, FileText, Briefcase, AlertCircle, 
  Bell, BarChart3, MessageSquare, User, 
  LogOut, Menu
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const HeadmasterSidebar = ({ collapsed, setCollapsed }) => {
  const { logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/headmaster/dashboard', icon: Home },
    { name: 'Work Requests', path: '/headmaster/requests', icon: FileText },
    { name: 'Active Works', path: '/headmaster/works', icon: Briefcase },
    { name: 'Blockers', path: '/headmaster/blockers', icon: AlertCircle },
    { name: 'Alerts', path: '/headmaster/alerts', icon: Bell },
    { name: 'Reports', path: '/headmaster/reports', icon: BarChart3 },
    { name: 'Communications', path: '/headmaster/communication', icon: MessageSquare },
    { name: 'Profile', path: '/headmaster/profile', icon: User },
  ];

  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <h2>{collapsed ? 'HM' : 'Head Master'}</h2>
        <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
          <Menu size={20} />
        </button>
      </div>
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink 
            key={item.path} 
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <item.icon size={20} />
            {!collapsed && <span>{item.name}</span>}
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <button onClick={logout} className="logout-btn">
          <LogOut size={20} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>

      <style>{`
        .sidebar { 
          width: 260px; 
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); 
          color: white; 
          display: flex; 
          flex-direction: column; 
          position: fixed; 
          height: 100vh; 
          transition: width 0.3s ease; 
          z-index: 100; 
          left: 0;
          top: 0;
        }
        .sidebar.collapsed { width: 70px; }
        .sidebar-header { padding: 1.5rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #334155; }
        .sidebar-header h2 { margin: 0; font-size: 1.25rem; color: #38bdf8; }
        .collapse-btn { background: none; border: none; color: #94a3b8; cursor: pointer; }
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
        .nav-item { 
          display: flex; 
          align-items: center; 
          gap: 0.75rem; 
          padding: 0.75rem 1.5rem; 
          background: none; 
          border: none; 
          color: #cbd5e1; 
          cursor: pointer; 
          transition: all 0.2s; 
          width: 100%; 
          text-align: left; 
          font-size: 0.95rem;
          text-decoration: none;
        }
        .nav-item:hover { background-color: #334155; color: white; }
        .nav-item.active { background-color: #0ea5e9; color: white; }
        .sidebar-footer { padding: 1rem; border-top: 1px solid #334155; }
        .logout-btn { display: flex; align-items: center; gap: 0.75rem; width: 100%; padding: 0.75rem; background: none; border: none; color: #cbd5e1; cursor: pointer; }
        .logout-btn:hover { color: #ef4444; }
      `}</style>
    </div>
  );
};

export default HeadmasterSidebar;
