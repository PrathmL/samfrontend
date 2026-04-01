import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { 
  Briefcase, Clock, CheckCircle2, IndianRupee, Building2, 
  Users, AlertTriangle, ClipboardList, BarChart3, TrendingUp,
  ArrowRight, FileText, Activity, Zap, Calendar, Layers, ChevronRight
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
      {/* Header Section */}
      <div className="dashboard-header">
        <div className="header-text">
          <h1>{t('dash_overview')}</h1>
          <p>{t('dash_welcome')}, {user?.name}</p>
        </div>
        <div className="header-actions">
          <div className="date-display">
            <Calendar size={16} />
            <span>{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {/* Primary Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-content">
            <p className="stat-label">Total Allocated Funds</p>
            <h3 className="stat-value">{formatCurrency(stats.totalFunds)}</h3>
            <div className="stat-subtext">
              <TrendingUp size={14} />
              <span>Across all talukas</span>
            </div>
          </div>
          <div className="stat-icon-bg"><IndianRupee size={48} /></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue"><Briefcase size={24} /></div>
          <div className="stat-info">
            <p className="stat-label">Total Works</p>
            <h3 className="stat-value">{stats.totalWorks}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange"><Clock size={24} /></div>
          <div className="stat-info">
            <p className="stat-label">In Progress</p>
            <h3 className="stat-value">{stats.worksInProgress}</h3>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><CheckCircle2 size={24} /></div>
          <div className="stat-info">
            <p className="stat-label">Completed</p>
            <h3 className="stat-value">{stats.completedWorks}</h3>
          </div>
        </div>
      </div>

      <div className="dashboard-main-grid">
        {/* Left Column: Analytics & Quick Actions */}
        <div className="grid-left-col">
          {/* Quick Actions */}
          <div className="section-card quick-actions-card">
            <div className="card-header">
              <h3><Zap size={18} /> {t('dash_quick_actions')}</h3>
            </div>
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
            </div>
          </div>

          {/* Budget Utilization */}
          <div className="section-card">
            <div className="card-header">
              <h3><Layers size={18} /> {t('dash_budget_utilization')}</h3>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={budgetData} layout="vertical" margin={{ left: 10, right: 30 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#e2e8f0" />
                  <XAxis type="number" tickFormatter={(value) => `₹${(value/100000).toFixed(0)}L`} />
                  <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value) => formatCurrency(value)} cursor={{fill: '#f8fafc'}} />
                  <Legend iconType="circle" />
                  <Bar dataKey="sanctioned" name="Sanctioned" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={12} />
                  <Bar dataKey="utilized" name="Utilized" fill="#10b981" radius={[0, 4, 4, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Column: Recent Activity & Distribution */}
        <div className="grid-right-col">
          {/* Status Distribution */}
          <div className="section-card">
            <div className="card-header">
              <h3><Activity size={18} /> {t('dash_status_distribution')}</h3>
            </div>
            <div className="chart-container pie-container">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}`} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="section-card recent-activity-card">
            <div className="card-header">
              <h3><Clock size={18} /> {t('dash_recent_activity')}</h3>
              <button className="text-link" onClick={() => navigate('/admin/work-requests')}>View All</button>
            </div>
            <div className="activity-list">
              {workRequests.slice(0, 4).map(req => (
                <div key={req.id} className="activity-item">
                  <div className={`activity-status-dot ${req.status?.toLowerCase()}`}></div>
                  <div className="activity-info">
                    <p className="activity-title">{req.title}</p>
                    <p className="activity-meta">
                      <span>{req.schoolName}</span>
                      <span className="dot">•</span>
                      <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                    </p>
                  </div>
                  <ChevronRight size={16} className="activity-arrow" />
                </div>
              ))}
              {workRequests.length === 0 && <p className="no-data">No recent activity</p>}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .admin-dashboard-home {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          padding-bottom: 2rem;
          color: #1e293b;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 0.5rem;
        }

        .header-text h1 {
          font-size: 1.75rem;
          font-weight: 800;
          margin: 0;
          letter-spacing: -0.02em;
        }

        .header-text p {
          color: #64748b;
          margin: 0.25rem 0 0;
          font-size: 1rem;
        }

        .date-display {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          font-size: 0.85rem;
          font-weight: 600;
          color: #475569;
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 1.25rem;
        }

        .stat-card {
          background: white;
          padding: 1.25rem;
          border-radius: 1rem;
          border: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          gap: 1rem;
          position: relative;
          overflow: hidden;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05);
        }

        .stat-card.primary {
          background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
          color: white;
          border: none;
        }

        .stat-card.primary .stat-label { color: #94a3b8; }
        .stat-card.primary .stat-value { color: white; font-size: 1.75rem; }
        .stat-card.primary .stat-subtext { color: #94a3b8; }

        .stat-icon-bg {
          position: absolute;
          right: -10px;
          bottom: -10px;
          opacity: 0.1;
          transform: rotate(-15deg);
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .stat-icon.blue { background: #eff6ff; color: #3b82f6; }
        .stat-icon.orange { background: #fff7ed; color: #f97316; }
        .stat-icon.green { background: #f0fdf4; color: #10b981; }

        .stat-label {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #64748b;
          margin: 0 0 0.25rem 0;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 800;
          margin: 0;
        }

        .stat-subtext {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-size: 0.75rem;
          margin-top: 0.5rem;
          font-weight: 500;
        }

        /* Main Grid Layout */
        .dashboard-main-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 1.5rem;
        }

        .section-card {
          background: white;
          border-radius: 1rem;
          border: 1px solid #e2e8f0;
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .card-header h3 {
          font-size: 1rem;
          font-weight: 700;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 0.6rem;
          color: #1e293b;
        }

        .text-link {
          background: none;
          border: none;
          color: #0ea5e9;
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
        }

        .grid-left-col, .grid-right-col {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        /* Quick Actions */
        .actions-grid-home {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
        }

        .action-btn-home {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          background: #f8fafc;
          border: 1px solid #f1f5f9;
          border-radius: 0.75rem;
          font-weight: 600;
          color: #475569;
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 0.9rem;
        }

        .action-btn-home:hover {
          background: white;
          border-color: #0ea5e9;
          color: #0ea5e9;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
          transform: translateY(-2px);
        }

        /* Activity List */
        .activity-list {
          display: flex;
          flex-direction: column;
        }

        .activity-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.85rem 0;
          border-bottom: 1px solid #f1f5f9;
          cursor: pointer;
          transition: padding-left 0.2s ease;
        }

        .activity-item:last-child { border-bottom: none; }
        .activity-item:hover { padding-left: 0.5rem; }

        .activity-status-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .activity-status-dot.pending_approval { background: #f59e0b; }
        .activity-status-dot.approved { background: #10b981; }
        .activity-status-dot.rejected { background: #ef4444; }
        .activity-status-dot.in_progress { background: #3b82f6; }

        .activity-info { flex: 1; }
        .activity-title { font-size: 0.9rem; font-weight: 600; margin: 0; color: #334155; }
        .activity-meta { font-size: 0.75rem; color: #94a3b8; margin: 0.15rem 0 0; display: flex; align-items: center; gap: 0.4rem; }
        .dot { font-size: 0.5rem; }
        .activity-arrow { color: #cbd5e1; }

        /* Responsive Breakpoints */
        @media (max-width: 1280px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 1024px) {
          .dashboard-main-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .dashboard-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 1rem;
          }
          .stats-grid {
            grid-template-columns: 1fr;
          }
          .actions-grid-home {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboardHome;