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
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slideInDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        * {
          box-sizing: border-box;
        }

        .sachiv-dashboard {
          padding: 1.5rem;
          background: linear-gradient(135deg, #f0f9ff 0%, #f8fafc 100%);
          min-height: 100vh;
          animation: fadeIn 0.4s ease;
        }

        .welcome-section {
          margin-bottom: 2.5rem;
          animation: slideInDown 0.6s ease;
        }

        .welcome-section h1 {
          margin: 0;
          font-size: 2rem;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.02em;
        }

        .welcome-section p {
          color: #64748b;
          margin: 0.5rem 0 0;
          font-size: 1rem;
          font-weight: 500;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2.5rem;
        }

        .stat-card {
          background: white;
          padding: 1.5rem;
          border-radius: 1.25rem;
          display: flex;
          align-items: center;
          gap: 1.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          border-left: 5px solid;
          transition: all 0.3s ease;
          animation: slideInUp 0.6s ease;
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }

        .stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          transition: left 0.5s ease;
        }

        .stat-card:hover::before {
          left: 100%;
        }

        .stat-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 12px 24px -5px rgba(0, 0, 0, 0.12);
        }

        .stat-icon {
          width: 64px;
          height: 64px;
          border-radius: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.3s ease;
        }

        .stat-card:hover .stat-icon {
          transform: scale(1.15) rotate(-10deg);
        }

        .stat-info h3 {
          margin: 0;
          font-size: 1.75rem;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.02em;
        }

        .stat-info p {
          margin: 0.25rem 0 0;
          color: #64748b;
          font-size: 0.875rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .charts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 2rem;
        }

        .chart-card {
          background: white;
          padding: 2rem;
          border-radius: 1.25rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          border: 1px solid #e2e8f0;
          transition: all 0.3s ease;
          animation: slideInUp 0.7s ease;
        }

        .chart-card:hover {
          border-color: #cbd5e1;
          box-shadow: 0 12px 24px -5px rgba(0, 0, 0, 0.12);
          transform: translateY(-4px);
        }

        .chart-card h3 {
          margin: 0 0 1.5rem 0;
          font-size: 1.1rem;
          font-weight: 700;
          color: #0f172a;
        }

        .chart-container {
          width: 100%;
          height: 300px;
        }

        /* Tablet Responsiveness (768px - 1024px) */
        @media (max-width: 1024px) {
          .sachiv-dashboard {
            padding: 1rem;
          }

          .welcome-section h1 {
            font-size: 1.5rem;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
          }

          .stat-card {
            flex-direction: column;
            text-align: center;
            padding: 1.25rem;
          }

          .stat-info h3 {
            font-size: 1.5rem;
          }

          .charts-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }

          .chart-container {
            height: 250px;
          }
        }

        /* Mobile Responsiveness (640px - 768px) */
        @media (max-width: 768px) {
          .sachiv-dashboard {
            padding: 1rem;
          }

          .welcome-section h1 {
            font-size: 1.35rem;
          }

          .welcome-section p {
            font-size: 0.9rem;
          }

          .stats-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .stat-card {
            flex-direction: row;
            text-align: left;
            padding: 1rem;
          }

          .stat-icon {
            width: 56px;
            height: 56px;
          }

          .stat-info h3 {
            font-size: 1.35rem;
          }

          .stat-info p {
            font-size: 0.75rem;
          }

          .charts-grid {
            gap: 1rem;
          }

          .chart-card {
            padding: 1.5rem;
          }

          .chart-card h3 {
            font-size: 1rem;
            margin-bottom: 1rem;
          }

          .chart-container {
            height: 250px;
          }
        }

        /* Small Mobile (480px - 640px) */
        @media (max-width: 640px) {
          .sachiv-dashboard {
            padding: 0.75rem;
          }

          .welcome-section {
            margin-bottom: 1.75rem;
          }

          .welcome-section h1 {
            font-size: 1.25rem;
          }

          .welcome-section p {
            font-size: 0.85rem;
          }

          .stats-grid {
            gap: 0.75rem;
            margin-bottom: 1.75rem;
          }

          .stat-card {
            padding: 0.875rem;
            gap: 1rem;
          }

          .stat-icon {
            width: 50px;
            height: 50px;
          }

          .stat-info h3 {
            font-size: 1.25rem;
          }

          .stat-info p {
            font-size: 0.7rem;
          }

          .charts-grid {
            gap: 0.75rem;
          }

          .chart-card {
            padding: 1.25rem;
          }

          .chart-card h3 {
            font-size: 0.95rem;
          }

          .chart-container {
            height: 220px;
          }
        }

        /* Extra Small Mobile (< 480px) */
        @media (max-width: 480px) {
          .sachiv-dashboard {
            padding: 0.5rem;
          }

          .welcome-section {
            margin-bottom: 1.5rem;
          }

          .welcome-section h1 {
            font-size: 1.1rem;
          }

          .welcome-section p {
            font-size: 0.8rem;
          }

          .stats-grid {
            gap: 0.5rem;
            margin-bottom: 1.5rem;
          }

          .stat-card {
            padding: 0.75rem;
          }

          .stat-icon {
            width: 44px;
            height: 44px;
          }

          .stat-info h3 {
            font-size: 1.1rem;
          }

          .stat-info p {
            font-size: 0.65rem;
          }

          .chart-card {
            padding: 1rem;
          }

          .chart-container {
            height: 200px;
          }
        }
      `}</style>
    </div>
  );
};

export default SachivDashboard;
