import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { 
  Plus, ClipboardList, Clock, CheckCircle2, 
  TrendingUp, Building2, User
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

const HeadmasterDashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState([]);
  const [activeWorks, setActiveWorks] = useState([]);

  useEffect(() => {
    if (user?.schoolId) {
      fetchWorkRequests();
      fetchActiveWorks();
    }
  }, [user?.schoolId]);

  const fetchWorkRequests = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/work-requests?schoolId=${user.schoolId}`);
      setRequests(res.data || []);
    } catch (err) {
      console.error('Error fetching requests:', err);
    }
  };

  const fetchActiveWorks = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/works/school/${user.schoolId}`);
      setActiveWorks(res.data || []);
    } catch (err) {
      console.error('Error fetching works:', err);
    }
  };

  const requestStatusData = useMemo(() => {
    const counts = requests.reduce((acc, r) => {
      const status = r.status || 'UNKNOWN';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    return Object.keys(counts).map(status => ({
      name: status.replace('_', ' '),
      value: counts[status]
    }));
  }, [requests]);

  const workProgressData = useMemo(() => {
    return activeWorks
      .filter(w => w.status !== 'COMPLETED')
      .map(w => ({
        name: w.workCode || w.title.substring(0, 10),
        progress: w.progressPercentage || 0
      }))
      .slice(0, 5);
  }, [activeWorks]);

  const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#6366f1'];

  return (
    <div className="hm-dashboard">
      <div className="welcome-section">
        <h1>{t('dash_school_dashboard')}</h1>
        <p>{t('dash_welcome')}, {user?.name}</p>
      </div>

      <div className="stats-grid-hm">
        <div className="stat-card-hm" style={{ borderLeft: '4px solid #3b82f6' }}>
          <div className="stat-icon-hm" style={{ backgroundColor: '#eff6ff', color: '#3b82f6' }}>
            <Building2 size={24} />
          </div>
          <div className="stat-content-hm">
            <h3>{activeWorks.length}</h3>
            <p>{t('dash_total_works')}</p>
          </div>
        </div>
        <div className="stat-card-hm" style={{ borderLeft: '4px solid #f59e0b' }}>
          <div className="stat-icon-hm" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
            <Clock size={24} />
          </div>
          <div className="stat-content-hm">
            <h3>{requests.filter(r => r.status === 'PENDING_QUOTATION').length}</h3>
            <p>{t('dash_pending_requests')}</p>
          </div>
        </div>
        <div className="stat-card-hm" style={{ borderLeft: '4px solid #10b981' }}>
          <div className="stat-icon-hm" style={{ backgroundColor: '#dcfce7', color: '#10b981' }}>
            <CheckCircle2 size={24} />
          </div>
          <div className="stat-content-hm">
            <h3>{activeWorks.filter(w => w.status === 'COMPLETED').length}</h3>
            <p>{t('dash_completed')}</p>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Request Status Distribution</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={requestStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {requestStatusData.map((entry, index) => (
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
          <h3>Active Works Progress (%)</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={workProgressData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" fontSize={10} />
                <YAxis fontSize={12} domain={[0, 100]} />
                <Tooltip />
                <Bar dataKey="progress" name="Progress %" fill="#10b981" radius={[4, 4, 0, 0]} />
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

        .hm-dashboard {
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

        .stats-grid-hm {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2.5rem;
        }

        .stat-card-hm {
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

        .stat-card-hm::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          transition: left 0.5s ease;
        }

        .stat-card-hm:hover::before {
          left: 100%;
        }

        .stat-card-hm:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 12px 24px -5px rgba(0, 0, 0, 0.12);
        }

        .stat-icon-hm {
          width: 64px;
          height: 64px;
          border-radius: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.3s ease;
        }

        .stat-card-hm:hover .stat-icon-hm {
          transform: scale(1.15) rotate(-10deg);
        }

        .stat-content-hm h3 {
          margin: 0;
          font-size: 1.75rem;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.02em;
        }

        .stat-content-hm p {
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
          .hm-dashboard {
            padding: 1rem;
          }

          .welcome-section h1 {
            font-size: 1.5rem;
          }

          .stats-grid-hm {
            grid-template-columns: repeat(2, 1fr);
            gap: 1rem;
          }

          .stat-card-hm {
            flex-direction: column;
            text-align: center;
            padding: 1.25rem;
          }

          .stat-content-hm h3 {
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
          .hm-dashboard {
            padding: 1rem;
          }

          .welcome-section h1 {
            font-size: 1.35rem;
          }

          .welcome-section p {
            font-size: 0.9rem;
          }

          .stats-grid-hm {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .stat-card-hm {
            flex-direction: row;
            text-align: left;
            padding: 1rem;
          }

          .stat-icon-hm {
            width: 56px;
            height: 56px;
          }

          .stat-content-hm h3 {
            font-size: 1.35rem;
          }

          .stat-content-hm p {
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
          .hm-dashboard {
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

          .stats-grid-hm {
            gap: 0.75rem;
            margin-bottom: 1.75rem;
          }

          .stat-card-hm {
            padding: 0.875rem;
            gap: 1rem;
          }

          .stat-icon-hm {
            width: 50px;
            height: 50px;
          }

          .stat-content-hm h3 {
            font-size: 1.25rem;
          }

          .stat-content-hm p {
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
          .hm-dashboard {
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

          .stats-grid-hm {
            gap: 0.5rem;
            margin-bottom: 1.5rem;
          }

          .stat-card-hm {
            padding: 0.75rem;
          }

          .stat-icon-hm {
            width: 44px;
            height: 44px;
          }

          .stat-content-hm h3 {
            font-size: 1.1rem;
          }

          .stat-content-hm p {
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

export default HeadmasterDashboard;
