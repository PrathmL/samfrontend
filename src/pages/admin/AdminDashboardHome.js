import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { 
  Briefcase, Clock, CheckCircle2, IndianRupee, Building2, 
  Users, AlertTriangle, ClipboardList, BarChart3, TrendingUp,
  ArrowRight, FileText, Activity, Zap, Calendar, Layers
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

  const COLORS = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dfe6e9'];

  const fetchWorkRequests = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/work-requests');
      setWorkRequests(res.data || []);
    } catch (err) {
      console.error('Error fetching work requests:', err);
    }
  };

  // Helper to format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(value);
  };

  // Get status color for activity items
  const getStatusColor = (status) => {
    switch(status) {
      case 'PENDING_APPROVAL': return '#f59e0b';
      case 'APPROVED': return '#10b981';
      case 'REJECTED': return '#ef4444';
      case 'IN_PROGRESS': return '#3b82f6';
      default: return '#6b7280';
    }
  };

  return (
    <div className="admin-dashboard-home">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1>{t('dash_overview')}</h1>
            <p>{t('dash_welcome')}, {user?.name}</p>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <div className="hero-stat-icon"><Briefcase size={20} /></div>
              <div>
                <strong>{stats.totalWorks}</strong>
                <span>Total Works</span>
              </div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-icon"><Clock size={20} /></div>
              <div>
                <strong>{stats.worksInProgress}</strong>
                <span>In Progress</span>
              </div>
            </div>
            <div className="hero-stat">
              <div className="hero-stat-icon"><CheckCircle2 size={20} /></div>
              <div>
                <strong>{stats.completedWorks}</strong>
                <span>Completed</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon purple"><IndianRupee size={24} /></div>
          <div className="stat-info">
            <h3>{formatCurrency(stats.totalFunds)}</h3>
            <p>{t('dash_total_funds')}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue"><Building2 size={24} /></div>
          <div className="stat-info">
            <h3>{stats.activeSchools}</h3>
            <p>{t('dash_active_schools')}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange"><AlertTriangle size={24} /></div>
          <div className="stat-info">
            <h3>{stats.pendingRequests}</h3>
            <p>{t('dash_pending_requests')}</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><Users size={24} /></div>
          <div className="stat-info">
            <h3>{stats.totalUsers}</h3>
            <p>Total Users</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions-section">
        <h3><Zap size={20} /> {t('dash_quick_actions')}</h3>
        <div className="actions-grid-home">
          <button className="action-btn-home" onClick={() => navigate('/admin/users')}>
            <Users size={18} /> {t('menu_users')}
          </button>
          <button className="action-btn-home" onClick={() => navigate('/admin/work-requests')}>
            <ClipboardList size={18} /> {t('menu_work_requests')}
          </button>
          <button className="action-btn-home" onClick={() => navigate('/admin/blockers')}>
            <AlertTriangle size={18} /> {t('menu_blockers')}
          </button>
          <button className="action-btn-home" onClick={() => navigate('/admin/analytics')}>
            <BarChart3 size={18} /> {t('menu_analytics')}
          </button>
          <button className="action-btn-home" onClick={() => navigate('/admin/reports')}>
            <FileText size={18} /> {t('menu_reports')}
          </button>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="analytics-section">
        <div className="section-header">
          <h3><TrendingUp size={20} /> {t('dash_quick_analytics')}</h3>
          <button className="view-all-btn" onClick={() => navigate('/admin/analytics')}>
            {t('dash_view_all')} <ArrowRight size={16} />
          </button>
        </div>
        <div className="analytics-grid">
          <div className="analytics-card">
            <div className="card-title">
              <Activity size={18} />
              <h4>{t('dash_status_distribution')}</h4>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}`} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="analytics-card">
            <div className="card-title">
              <Layers size={18} />
              <h4>{t('dash_budget_utilization')} (Top 5 Works)</h4>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={budgetData} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                  <XAxis type="number" tickFormatter={(value) => `₹${(value/100000).toFixed(0)}L`} />
                  <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 10 }} />
                  <Tooltip formatter={(value) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="sanctioned" name="Sanctioned" fill="#ff6b6b" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="utilized" name="Utilized" fill="#4ecdc4" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="recent-activities-section">
        <h3><Clock size={20} /> {t('dash_recent_activity')}</h3>
        <div className="activity-timeline">
          {workRequests.slice(0, 5).map(req => (
            <div key={req.id} className="timeline-item">
              <div className="timeline-dot" style={{ background: getStatusColor(req.status) }}></div>
              <div className="timeline-content">
                <div className="timeline-title">
                  <strong>{req.title}</strong>
                  <span className="status-badge" style={{ background: getStatusColor(req.status) }}>
                    {req.status?.replace('_', ' ')}
                  </span>
                </div>
                <div className="timeline-meta">
                  <Calendar size={12} />
                  <small>{new Date(req.createdAt).toLocaleDateString()}</small>
                </div>
              </div>
            </div>
          ))}
          {workRequests.length === 0 && <p className="no-activity">No recent activity</p>}
        </div>
      </div>

      <style>{`
        .admin-dashboard-home {
          padding: 0;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
          background: linear-gradient(135deg, #f5f7fa 0%, #eef2f7 100%);
        }

        /* Hero Section */
        .hero-section {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 1.5rem;
          padding: 2rem;
          margin-bottom: 2rem;
          color: white;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
        }
        .hero-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1.5rem;
        }
        .hero-text h1 {
          margin: 0;
          font-size: 2rem;
          font-weight: 700;
          letter-spacing: -0.02em;
        }
        .hero-text p {
          margin: 0.5rem 0 0;
          opacity: 0.9;
          font-size: 1rem;
        }
        .hero-stats {
          display: flex;
          gap: 2rem;
        }
        .hero-stat {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          background: rgba(255,255,255,0.2);
          backdrop-filter: blur(8px);
          padding: 0.75rem 1.25rem;
          border-radius: 1rem;
        }
        .hero-stat-icon {
          background: rgba(255,255,255,0.3);
          padding: 0.5rem;
          border-radius: 0.75rem;
        }
        .hero-stat div {
          display: flex;
          flex-direction: column;
        }
        .hero-stat strong {
          font-size: 1.25rem;
          font-weight: 700;
        }
        .hero-stat span {
          font-size: 0.7rem;
          opacity: 0.8;
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        .stat-card {
          background: white;
          border-radius: 1rem;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          transition: all 0.3s ease;
          border: 1px solid #e2e8f0;
        }
        .stat-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 20px -12px rgba(0, 0, 0, 0.2);
        }
        .stat-icon {
          width: 56px;
          height: 56px;
          border-radius: 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .stat-icon.purple { background: linear-gradient(135deg, #667eea20, #764ba220); color: #667eea; }
        .stat-icon.blue { background: linear-gradient(135deg, #3b82f620, #2563eb20); color: #3b82f6; }
        .stat-icon.orange { background: linear-gradient(135deg, #f9731620, #ea580c20); color: #f97316; }
        .stat-icon.green { background: linear-gradient(135deg, #10b98120, #05966920); color: #10b981; }
        .stat-info h3 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 800;
          color: #0f172a;
        }
        .stat-info p {
          margin: 0;
          color: #64748b;
          font-size: 0.8rem;
          font-weight: 500;
          text-transform: uppercase;
        }

        /* Quick Actions */
        .quick-actions-section {
          background: white;
          border-radius: 1rem;
          padding: 1.5rem;
          margin-bottom: 2rem;
          border: 1px solid #e2e8f0;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        .quick-actions-section h3 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin: 0 0 1.25rem 0;
          font-size: 1.1rem;
          font-weight: 600;
          color: #0f172a;
        }
        .actions-grid-home {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
        }
        .action-btn-home {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          font-size: 0.9rem;
          font-weight: 500;
          color: #1e293b;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .action-btn-home:hover {
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border-color: transparent;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }

        /* Analytics Section */
        .analytics-section {
          margin-bottom: 2rem;
        }
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        .section-header h3 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin: 0;
          font-size: 1.1rem;
          font-weight: 600;
          color: #0f172a;
        }
        .view-all-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: none;
          border: none;
          color: #667eea;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: color 0.2s;
        }
        .view-all-btn:hover {
          color: #764ba2;
        }
        .analytics-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 1.5rem;
        }
        .analytics-card {
          background: white;
          border-radius: 1rem;
          padding: 1.5rem;
          border: 1px solid #e2e8f0;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          transition: all 0.2s;
        }
        .analytics-card:hover {
          box-shadow: 0 8px 20px -8px rgba(0,0,0,0.1);
        }
        .card-title {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }
        .card-title h4 {
          margin: 0;
          font-size: 0.85rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #64748b;
        }
        .chart-container {
          width: 100%;
          height: 280px;
        }

        /* Recent Activity Timeline */
        .recent-activities-section {
          background: white;
          border-radius: 1rem;
          padding: 1.5rem;
          border: 1px solid #e2e8f0;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        .recent-activities-section h3 {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin: 0 0 1.25rem 0;
          font-size: 1.1rem;
          font-weight: 600;
          color: #0f172a;
        }
        .activity-timeline {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .timeline-item {
          display: flex;
          gap: 1rem;
          position: relative;
        }
        .timeline-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          margin-top: 0.25rem;
          flex-shrink: 0;
        }
        .timeline-content {
          flex: 1;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #f1f5f9;
        }
        .timeline-title {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 0.25rem;
        }
        .status-badge {
          font-size: 0.7rem;
          padding: 0.2rem 0.5rem;
          border-radius: 1rem;
          color: white;
          font-weight: 500;
          text-transform: uppercase;
        }
        .timeline-meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #94a3b8;
          font-size: 0.7rem;
        }
        .no-activity {
          text-align: center;
          color: #94a3b8;
          padding: 2rem;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .hero-content {
            flex-direction: column;
            align-items: flex-start;
          }
          .hero-stats {
            width: 100%;
            justify-content: space-between;
          }
          .stats-grid {
            gap: 1rem;
          }
          .stat-card {
            padding: 1rem;
          }
          .stat-icon {
            width: 48px;
            height: 48px;
          }
          .stat-info h3 {
            font-size: 1.25rem;
          }
          .actions-grid-home {
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          }
          .analytics-grid {
            grid-template-columns: 1fr;
          }
        }
        @media (max-width: 480px) {
          .hero-text h1 {
            font-size: 1.5rem;
          }
          .hero-stat {
            padding: 0.5rem 0.75rem;
          }
          .hero-stat strong {
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboardHome;