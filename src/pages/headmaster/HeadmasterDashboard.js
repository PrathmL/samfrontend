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
        .hm-dashboard { padding: 0; }
        .welcome-section { margin-bottom: 2rem; }
        .welcome-section h1 { margin: 0; font-size: 1.875rem; color: #1e293b; }
        .welcome-section p { color: #64748b; margin: 0.5rem 0 0; }
        
        .stats-grid-hm { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 2.5rem; }
        .stat-card-hm { background: white; padding: 1.5rem; border-radius: 1rem; display: flex; align-items: center; gap: 1.25rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .stat-icon-hm { width: 48px; height: 48px; border-radius: 0.75rem; display: flex; align-items: center; justify-content: center; }
        .stat-content-hm h3 { margin: 0; font-size: 1.5rem; font-weight: 700; color: #1e293b; }
        .stat-content-hm p { margin: 0; color: #64748b; font-size: 0.8rem; font-weight: 600; text-transform: uppercase; }

        .charts-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 2rem; }
        .chart-card { background: white; padding: 1.5rem; border-radius: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; }
        .chart-card h3 { margin: 0 0 1.5rem 0; font-size: 1.1rem; color: #1e293b; }
        .chart-container { width: 100%; height: 300px; }
      `}</style>
    </div>
  );
};

export default HeadmasterDashboard;
