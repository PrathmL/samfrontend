import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { 
  Briefcase, AlertCircle, CheckCircle2,
  Clock, Building2, Eye, BarChart3, TrendingUp
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

const SachivDashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    totalWorks: 0,
    activeWorks: 0,
    completedWorks: 0,
    pendingVerification: 0,
    totalBlockers: 0,
    activeBlockers: 0,
    totalSchools: 0
  });
  const [worksData, setWorksData] = useState([]);
  const [schoolsData, setSchoolsData] = useState([]);

  useEffect(() => {
    if (user?.talukaId) {
      fetchDashboardData();
    }
  }, [user?.talukaId]);

  const fetchDashboardData = async () => {
    try {
      const worksRes = await axios.get(`http://localhost:8080/api/works/taluka/${user.talukaId}`);
      const allWorks = worksRes.data || [];
      setWorksData(allWorks);

      const schoolsRes = await axios.get(`http://localhost:8080/api/schools`, { params: { talukaId: user.talukaId } });
      const schools = schoolsRes.data || [];
      setSchoolsData(schools);
      
      setStats({
        totalWorks: allWorks.length,
        activeWorks: allWorks.filter(w => w.status === 'ACTIVE' || w.status === 'IN_PROGRESS').length,
        completedWorks: allWorks.filter(w => w.status === 'COMPLETED').length,
        pendingVerification: allWorks.filter(w => w.status === 'PENDING_CLOSURE').length,
        totalBlockers: 0, 
        activeBlockers: 0,
        totalSchools: schools.length
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    }
  };

  const statusData = useMemo(() => {
    const counts = worksData.reduce((acc, w) => {
      const status = w.status || 'UNKNOWN';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    return Object.keys(counts).map(status => ({
      name: status.replace('_', ' '),
      value: counts[status]
    }));
  }, [worksData]);

  const schoolWiseData = useMemo(() => {
    const counts = worksData.reduce((acc, w) => {
      const schoolName = w.schoolName || 'Unknown School';
      acc[schoolName] = (acc[schoolName] || 0) + 1;
      return acc;
    }, {});

    return Object.keys(counts)
      .map(name => ({ name, count: counts[name] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [worksData]);

  const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#6366f1'];

  return (
    <div className="sachiv-dashboard">
      <div className="welcome-section">
        <h1>{t('dash_taluka_dashboard')}</h1>
        <p>{t('dash_welcome')}, {user?.name} | {t('field_taluka')}: {user?.talukaId}</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card" style={{ borderLeftColor: '#3b82f6' }}>
          <div className="stat-icon" style={{ backgroundColor: '#eff6ff', color: '#3b82f6' }}>
            <Building2 size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats.totalWorks}</h3>
            <p>{t('dash_total_works')}</p>
          </div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#10b981' }}>
          <div className="stat-icon" style={{ backgroundColor: '#dcfce7', color: '#10b981' }}>
            <CheckCircle2 size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats.activeWorks}</h3>
            <p>{t('menu_active_works')}</p>
          </div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#f59e0b' }}>
          <div className="stat-icon" style={{ backgroundColor: '#fef3c7', color: '#f59e0b' }}>
            <Clock size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats.pendingVerification}</h3>
            <p>{t('dash_pending_verification')}</p>
          </div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#06b6d4' }}>
          <div className="stat-icon" style={{ backgroundColor: '#cffafe', color: '#06b6d4' }}>
            <Briefcase size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats.totalSchools}</h3>
            <p>{t('menu_schools')}</p>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>{t('dash_status_distribution')}</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="chart-card">
          <h3>Schools with Most Works</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={schoolWiseData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={10} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="count" name="Total Works" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <style>{`
        .sachiv-dashboard { padding: 0; }
        .welcome-section { margin-bottom: 2rem; }
        .welcome-section h1 { margin: 0; font-size: 1.875rem; color: #1e293b; }
        .welcome-section p { color: #64748b; margin: 0.5rem 0 0; }
        
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 2.5rem; }
        .stat-card { background: white; padding: 1.5rem; border-radius: 1rem; display: flex; align-items: center; gap: 1.25rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-left: 4px solid; }
        .stat-icon { width: 48px; height: 48px; border-radius: 0.75rem; display: flex; align-items: center; justify-content: center; }
        .stat-info h3 { margin: 0; font-size: 1.5rem; font-weight: 700; color: #1e293b; }
        .stat-info p { margin: 0; color: #64748b; font-size: 0.8rem; font-weight: 600; text-transform: uppercase; }

        .charts-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 2rem; }
        .chart-card { background: white; padding: 1.5rem; border-radius: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; }
        .chart-card h3 { margin: 0 0 1.5rem 0; font-size: 1.1rem; color: #1e293b; }
        .chart-container { width: 100%; height: 300px; }
      `}</style>
    </div>
  );
};

export default SachivDashboard;
