import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { 
  Briefcase, Clock, CheckCircle2, IndianRupee, Building2, 
  Users, AlertTriangle, ClipboardList, BarChart3, TrendingUp,
  ArrowRight, FileText
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

const AdminDashboardHome = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalWorks: 0,
    worksInProgress: 0,
    completedWorks: 0,
    totalFunds: 0,
    fundsUtilized: 0,
    activeSchools: 0,
    totalUsers: 0,
    pendingRequests: 0,
    activeBlockers: 0,
    escalatedBlockers: 0
  });
  const [workRequests, setWorkRequests] = useState([]);
  const [worksData, setWorksData] = useState([]);

  useEffect(() => {
    fetchDashboardData();
    fetchWorkRequests();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [usersRes, schoolsRes, worksRes, requestsRes, blockerStatsRes] = await Promise.all([
        axios.get('http://localhost:8080/api/admin/users'),
        axios.get('http://localhost:8080/api/schools'),
        axios.get('http://localhost:8080/api/works'),
        axios.get('http://localhost:8080/api/work-requests'),
        axios.get('http://localhost:8080/api/blockers/stats')
      ]);

      const works = worksRes.data || [];
      setWorksData(works);
      const pendingRequests = (requestsRes.data || []).filter(r => r.status === 'PENDING_APPROVAL').length;
      const blockerStats = blockerStatsRes.data;

      setStats({
        totalWorks: works.length,
        worksInProgress: works.filter(w => w.status === 'IN_PROGRESS' || w.status === 'ACTIVE').length,
        completedWorks: works.filter(w => w.status === 'COMPLETED').length,
        totalFunds: works.reduce((sum, w) => sum + (w.sanctionedAmount || 0), 0),
        fundsUtilized: works.reduce((sum, w) => sum + (w.totalUtilized || 0), 0),
        activeSchools: (schoolsRes.data || []).filter(s => s.status === 'Active').length,
        totalUsers: (usersRes.data || []).length,
        pendingRequests: pendingRequests,
        activeBlockers: blockerStats.totalBlockers - blockerStats.resolvedBlockers,
        escalatedBlockers: blockerStats.escalatedBlockers || 0
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
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

  const budgetData = useMemo(() => {
    // Show top 5 works by sanctioned amount
    return worksData
      .sort((a, b) => (b.sanctionedAmount || 0) - (a.sanctionedAmount || 0))
      .slice(0, 5)
      .map(w => ({
        name: w.workCode || w.title.substring(0, 10),
        sanctioned: w.sanctionedAmount || 0,
        utilized: w.totalUtilized || 0
      }));
  }, [worksData]);

  const COLORS = ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#6366f1', '#8b5cf6'];

  const fetchWorkRequests = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/work-requests');
      setWorkRequests(res.data || []);
    } catch (err) {
      console.error('Error fetching work requests:', err);
    }
  };

  return (
    <div className="admin-dashboard-home">
      <div className="welcome-section-home">
        <h1>{t('dash_overview')}</h1>
        <p>{t('dash_welcome')}, {user?.name}</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card" style={{ borderLeftColor: '#3b82f6' }}>
          <div className="stat-icon" style={{ backgroundColor: '#eff6ff', color: '#3b82f6' }}>
            <Briefcase size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats.totalWorks}</h3>
            <p>{t('dash_total_works')}</p>
          </div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#f59e0b' }}>
          <div className="stat-icon" style={{ backgroundColor: '#fef3c7', color: '#f59e0b' }}>
            <Clock size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats.worksInProgress}</h3>
            <p>{t('dash_in_progress')}</p>
          </div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#10b981' }}>
          <div className="stat-icon" style={{ backgroundColor: '#dcfce7', color: '#10b981' }}>
            <CheckCircle2 size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats.completedWorks}</h3>
            <p>{t('dash_completed')}</p>
          </div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#6366f1' }}>
          <div className="stat-icon" style={{ backgroundColor: '#e0e7ff', color: '#6366f1' }}>
            <IndianRupee size={24} />
          </div>
          <div className="stat-info">
            <h3>₹{stats.totalFunds.toLocaleString()}</h3>
            <p>{t('dash_total_funds')}</p>
          </div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#ec4899' }}>
          <div className="stat-icon" style={{ backgroundColor: '#fce7f3', color: '#ec4899' }}>
            <Building2 size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats.activeSchools}</h3>
            <p>{t('dash_active_schools')}</p>
          </div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#ef4444' }}>
          <div className="stat-icon" style={{ backgroundColor: '#fee2e2', color: '#ef4444' }}>
            <AlertTriangle size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats.pendingRequests}</h3>
            <p>{t('dash_pending_requests')}</p>
          </div>
        </div>
      </div>

      <div className="quick-actions-section">
        <h3>{t('dash_quick_actions')}</h3>
        <div className="actions-grid-home">
          <button className="action-btn-home" onClick={() => navigate('/admin/users')}>
            <Users size={20} /> {t('menu_users')}
          </button>
          <button className="action-btn-home" onClick={() => navigate('/admin/work-requests')}>
            <ClipboardList size={20} /> {t('menu_work_requests')}
          </button>
          <button className="action-btn-home" onClick={() => navigate('/admin/blockers')}>
            <AlertTriangle size={20} /> {t('menu_blockers')}
          </button>
          <button className="action-btn-home" onClick={() => navigate('/admin/analytics')}>
            <BarChart3 size={20} /> {t('menu_analytics')}
          </button>
          <button className="action-btn-home" onClick={() => navigate('/admin/reports')}>
            <FileText size={20} /> {t('menu_reports')}
          </button>
        </div>
      </div>

      <div className="analytics-preview-home">
        <div className="preview-header">
          <h3>{t('dash_quick_analytics')}</h3>
          <button className="view-all-btn" onClick={() => navigate('/admin/analytics')}>
            {t('dash_view_all')} <ArrowRight size={16} />
          </button>
        </div>
        <div className="preview-grid-home">
          <div className="preview-card-home">
            <h4>{t('dash_status_distribution')}</h4>
            <div className="chart-container-recharts">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
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
          <div className="preview-card-home">
            <h4>{t('dash_budget_utilization')} (Top Works)</h4>
            <div className="chart-container-recharts">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={budgetData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" fontSize={10} />
                  <YAxis fontSize={10} />
                  <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
                  <Legend />
                  <Bar dataKey="sanctioned" name="Sanctioned" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="utilized" name="Utilized" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="recent-activities-home">
        <h3>{t('dash_recent_activity')}</h3>
        <div className="activity-list-home">
          {workRequests.slice(0, 5).map(req => (
            <div key={req.id} className="activity-item-home">
              <div className="activity-icon-home"><ClipboardList size={16} /></div>
              <div className="activity-content-home">
                <p><strong>{req.title}</strong> - {req.status?.replace('_', ' ')}</p>
                <small>{new Date(req.createdAt).toLocaleDateString()}</small>
              </div>
            </div>
          ))}
          {workRequests.length === 0 && <p className="no-activity">No recent activity</p>}
        </div>
      </div>

      <style>{`
        .admin-dashboard-home { padding: 0; }
        .welcome-section-home { margin-bottom: 2rem; }
        .welcome-section-home h1 { margin: 0; font-size: 1.75rem; color: #1e293b; }
        .welcome-section-home p { margin: 0.25rem 0 0; color: #64748b; font-size: 1rem; }

        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 2.5rem; }
        .stat-card { background: white; padding: 1.25rem; border-radius: 1rem; display: flex; align-items: center; gap: 1.25rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-left: 4px solid; }
        .stat-icon { width: 52px; height: 52px; border-radius: 0.75rem; display: flex; align-items: center; justify-content: center; }
        .stat-info h3 { margin: 0; font-size: 1.5rem; font-weight: 800; color: #1e293b; }
        .stat-info p { margin: 0; color: #64748b; font-size: 0.85rem; font-weight: 600; text-transform: uppercase; }

        .quick-actions-section { background: white; padding: 1.5rem; border-radius: 1rem; margin-bottom: 2rem; border: 1px solid #e2e8f0; }
        .quick-actions-section h3 { margin: 0 0 1.25rem 0; font-size: 1.1rem; }
        .actions-grid-home { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }
        .action-btn-home { display: flex; align-items: center; gap: 0.75rem; padding: 1rem; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0.75rem; cursor: pointer; transition: all 0.2s; font-weight: 600; color: #475569; }
        .action-btn-home:hover { background-color: #0ea5e9; color: white; border-color: #0ea5e9; transform: translateY(-2px); }

        .analytics-preview-home { background: white; padding: 1.5rem; border-radius: 1rem; margin-bottom: 2rem; border: 1px solid #e2e8f0; }
        .preview-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .preview-header h3 { margin: 0; font-size: 1.1rem; }
        .view-all-btn { display: flex; align-items: center; gap: 0.5rem; background: none; border: none; color: #0ea5e9; font-weight: 700; cursor: pointer; font-size: 0.9rem; }
        .preview-grid-home { display: grid; grid-template-columns: 1.5fr 1fr; gap: 1.5rem; }
        .preview-card-home { background: #f8fafc; padding: 1.5rem; border-radius: 0.75rem; border: 1px solid #e2e8f0; }
        .preview-card-home h4 { margin: 0 0 1.25rem 0; font-size: 0.85rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
        
        .chart-container-recharts { width: 100%; height: 250px; margin-top: 1rem; }

        .recent-activities-home { background: white; padding: 1.5rem; border-radius: 1rem; border: 1px solid #e2e8f0; }
        .recent-activities-home h3 { margin: 0 0 1rem 0; font-size: 1.1rem; }
        .activity-list-home { display: flex; flex-direction: column; gap: 1rem; }
        .activity-item-home { display: flex; align-items: center; gap: 1rem; padding: 0.75rem; border-radius: 0.75rem; background: #f8fafc; border: 1px solid #f1f5f9; }
        .activity-icon-home { width: 36px; height: 36px; background-color: #e0f2fe; border-radius: 0.5rem; display: flex; align-items: center; justify-content: center; color: #0284c7; }
        .activity-content-home { flex: 1; }
        .activity-content-home p { margin: 0; font-size: 0.95rem; color: #1e293b; }
        .activity-content-home small { color: #94a3b8; font-size: 0.75rem; }
        .no-activity { text-align: center; color: #94a3b8; padding: 2rem; }
      `}</style>
    </div>
  );
};

export default AdminDashboardHome;
