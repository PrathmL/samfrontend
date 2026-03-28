import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { 
  Briefcase, AlertCircle, CheckCircle2,
  Clock, Building2, Eye, BarChart3
} from 'lucide-react';

const SachivDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalWorks: 0,
    activeWorks: 0,
    completedWorks: 0,
    pendingVerification: 0,
    totalBlockers: 0,
    activeBlockers: 0,
    totalSchools: 0
  });

  useEffect(() => {
    if (user?.talukaId) {
      fetchDashboardData();
    }
  }, [user?.talukaId]);

  const fetchDashboardData = async () => {
    try {
      const worksRes = await axios.get(`http://localhost:8080/api/works/taluka/${user.talukaId}`);
      const allWorks = worksRes.data || [];
      const schoolsRes = await axios.get(`http://localhost:8080/api/schools`, { params: { talukaId: user.talukaId } });
      const schools = schoolsRes.data || [];
      
      setStats({
        totalWorks: allWorks.length,
        activeWorks: allWorks.filter(w => w.status === 'ACTIVE' || w.status === 'IN_PROGRESS').length,
        completedWorks: allWorks.filter(w => w.status === 'COMPLETED').length,
        pendingVerification: allWorks.filter(w => w.status === 'PENDING_CLOSURE').length,
        totalBlockers: 0, // Simplified for now
        activeBlockers: 0,
        totalSchools: schools.length
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    }
  };

  return (
    <div className="sachiv-dashboard">
      <div className="welcome-section">
        <h1>Taluka Dashboard</h1>
        <p>Welcome back, {user?.name} | Taluka: {user?.talukaId}</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card" style={{ borderLeftColor: '#3b82f6' }}>
          <div className="stat-icon" style={{ backgroundColor: '#eff6ff', color: '#3b82f6' }}>
            <Building2 size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats.totalWorks}</h3>
            <p>Total Works</p>
          </div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#10b981' }}>
          <div className="stat-icon" style={{ backgroundColor: '#dcfce7', color: '#10b981' }}>
            <CheckCircle2 size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats.activeWorks}</h3>
            <p>Active Works</p>
          </div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#f59e0b' }}>
          <div className="stat-icon" style={{ backgroundColor: '#fef3c7', color: '#f59e0b' }}>
            <Clock size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats.pendingVerification}</h3>
            <p>Pending Verification</p>
          </div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#06b6d4' }}>
          <div className="stat-icon" style={{ backgroundColor: '#cffafe', color: '#06b6d4' }}>
            <Briefcase size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats.totalSchools}</h3>
            <p>Schools</p>
          </div>
        </div>
      </div>

      <style>{`
        .welcome-section { margin-bottom: 2rem; }
        .welcome-section h1 { margin: 0; font-size: 1.875rem; color: #1e293b; }
        .welcome-section p { color: #64748b; margin: 0.5rem 0 0; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
        .stat-card { background: white; padding: 1.5rem; border-radius: 0.75rem; display: flex; align-items: center; gap: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-left: 4px solid; }
        .stat-info h3 { margin: 0; font-size: 1.5rem; }
      `}</style>
    </div>
  );
};

export default SachivDashboard;
