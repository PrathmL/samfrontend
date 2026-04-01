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

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }

        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }

        * {
          box-sizing: border-box;
        }

        .admin-dashboard-home {
          padding: 1.5rem;
          background: linear-gradient(135deg, #f0f9ff 0%, #f8fafc 100%);
          min-height: 100vh;
          animation: fadeIn 0.4s ease;
        }

        .welcome-section-home {
          margin-bottom: 2.5rem;
          animation: slideInDown 0.6s ease;
        }

        .welcome-section-home h1 {
          margin: 0;
          font-size: 2rem;
          font-weight: 800;
          color: #0f172a;
          letter-spacing: -0.02em;
        }

        .welcome-section-home p {
          margin: 0.5rem 0 0;
          color: #64748b;
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
          border: 2px solid #f1f5f9;
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
          border-color: inherit;
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

        .quick-actions-section {
          background: white;
          padding: 2rem;
          border-radius: 1.25rem;
          margin-bottom: 2.5rem;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          animation: slideInUp 0.7s ease 0.1s backwards;
        }

        .quick-actions-section h3 {
          margin: 0 0 1.5rem 0;
          font-size: 1.25rem;
          font-weight: 700;
          color: #0f172a;
        }

        .actions-grid-home {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 1rem;
        }

        .action-btn-home {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          padding: 1.25rem;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border: 2px solid #e2e8f0;
          border-radius: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 600;
          color: #475569;
          font-size: 0.95rem;
          position: relative;
          overflow: hidden;
        }

        .action-btn-home::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: -1;
        }

        .action-btn-home:hover::before {
          opacity: 1;
        }

        .action-btn-home:hover {
          color: white;
          border-color: transparent;
          transform: translateY(-4px);
          box-shadow: 0 12px 24px rgba(14, 165, 233, 0.3);
        }

        .action-btn-home:active {
          transform: translateY(-2px);
        }

        .analytics-preview-home {
          background: white;
          padding: 2rem;
          border-radius: 1.25rem;
          margin-bottom: 2.5rem;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          animation: slideInUp 0.7s ease 0.2s backwards;
        }

        .preview-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .preview-header h3 {
          margin: 0;
          font-size: 1.25rem;
          font-weight: 700;
          color: #0f172a;
        }

        .view-all-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: none;
          border: none;
          color: #0ea5e9;
          font-weight: 700;
          cursor: pointer;
          font-size: 0.95rem;
          transition: all 0.3s ease;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
        }

        .view-all-btn:hover {
          background: #f0f9ff;
          transform: translateX(4px);
        }

        .preview-grid-home {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 1.5rem;
        }

        .preview-card-home {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          padding: 1.5rem;
          border-radius: 1rem;
          border: 1px solid #e2e8f0;
          transition: all 0.3s ease;
          animation: slideInUp 0.6s ease;
        }

        .preview-card-home:hover {
          border-color: #cbd5e1;
          box-shadow: 0 8px 16px rgba(0, 0, 0, 0.08);
          transform: translateY(-4px);
        }

        .preview-card-home h4 {
          margin: 0 0 1rem 0;
          font-size: 0.9rem;
          font-weight: 700;
          color: #0f172a;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .chart-container-recharts {
          width: 100%;
          margin-top: 1rem;
        }

        .recent-activities-home {
          background: white;
          padding: 2rem;
          border-radius: 1.25rem;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          animation: slideInUp 0.7s ease 0.3s backwards;
        }

        .recent-activities-home h3 {
          margin: 0 0 1.5rem 0;
          font-size: 1.25rem;
          font-weight: 700;
          color: #0f172a;
        }

        .activity-list-home {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .activity-item-home {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          border-radius: 0.875rem;
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border: 1px solid #e2e8f0;
          transition: all 0.3s ease;
        }

        .activity-item-home:hover {
          border-color: #cbd5e1;
          background: white;
          transform: translateX(4px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .activity-icon-home {
          width: 44px;
          height: 44px;
          background: linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%);
          border-radius: 0.75rem;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #0284c7;
          flex-shrink: 0;
          transition: all 0.3s ease;
        }

        .activity-item-home:hover .activity-icon-home {
          transform: scale(1.1) rotate(-10deg);
          background: linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%);
          color: white;
        }

        .activity-content-home {
          flex: 1;
        }

        .activity-content-home p {
          margin: 0;
          font-size: 0.95rem;
          color: #1e293b;
          font-weight: 600;
        }

        .activity-content-home small {
          color: #94a3b8;
          font-size: 0.8rem;
          margin-top: 0.25rem;
          display: block;
        }

        .no-activity {
          text-align: center;
          color: #94a3b8;
          padding: 2rem;
          font-style: italic;
        }

        /* Loading State */
        .loading-skeleton {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }

        /* Tablet Responsiveness (768px - 1024px) */
        @media (max-width: 1024px) {
          .admin-dashboard-home {
            padding: 1rem;
          }

          .welcome-section-home h1 {
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

          .preview-grid-home {
            grid-template-columns: 1fr;
          }

          .actions-grid-home {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        /* Mobile Responsiveness (640px - 768px) */
        @media (max-width: 768px) {
          .admin-dashboard-home {
            padding: 1rem;
          }

          .welcome-section-home h1 {
            font-size: 1.35rem;
          }

          .welcome-section-home p {
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

          .quick-actions-section {
            padding: 1.5rem;
          }

          .quick-actions-section h3 {
            font-size: 1rem;
            margin-bottom: 1rem;
          }

          .actions-grid-home {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.75rem;
          }

          .action-btn-home {
            padding: 1rem;
            font-size: 0.85rem;
            gap: 0.5rem;
          }

          .action-btn-home svg {
            width: 18px;
            height: 18px;
          }

          .analytics-preview-home {
            padding: 1.5rem;
          }

          .preview-header h3 {
            font-size: 1rem;
          }

          .view-all-btn {
            font-size: 0.8rem;
            padding: 0.4rem 0.8rem;
          }

          .preview-grid-home {
            gap: 1rem;
          }

          .preview-card-home {
            padding: 1rem;
          }

          .preview-card-home h4 {
            font-size: 0.8rem;
            margin-bottom: 0.75rem;
          }

          .recent-activities-home {
            padding: 1.5rem;
          }

          .recent-activities-home h3 {
            font-size: 1rem;
            margin-bottom: 1rem;
          }

          .activity-item-home {
            padding: 0.75rem;
            gap: 0.75rem;
          }

          .activity-icon-home {
            width: 40px;
            height: 40px;
            min-width: 40px;
          }

          .activity-content-home p {
            font-size: 0.85rem;
          }

          .activity-content-home small {
            font-size: 0.7rem;
          }
        }

        /* Small Mobile (480px - 640px) */
        @media (max-width: 640px) {
          .admin-dashboard-home {
            padding: 0.75rem;
          }

          .welcome-section-home {
            margin-bottom: 1.75rem;
          }

          .welcome-section-home h1 {
            font-size: 1.25rem;
          }

          .welcome-section-home p {
            font-size: 0.85rem;
          }

          .stats-grid {
            grid-template-columns: 1fr;
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

          .quick-actions-section {
            padding: 1.25rem;
            margin-bottom: 1.75rem;
          }

          .quick-actions-section h3 {
            font-size: 0.95rem;
            margin-bottom: 0.75rem;
          }

          .actions-grid-home {
            grid-template-columns: 1fr;
            gap: 0.5rem;
          }

          .action-btn-home {
            padding: 0.875rem;
            font-size: 0.8rem;
            flex-direction: row;
            gap: 0.5rem;
          }

          .action-btn-home svg {
            width: 16px;
            height: 16px;
          }

          .analytics-preview-home {
            padding: 1.25rem;
            margin-bottom: 1.75rem;
          }

          .preview-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .preview-header h3 {
            font-size: 1rem;
          }

          .view-all-btn {
            align-self: flex-start;
          }

          .preview-grid-home {
            gap: 0.75rem;
          }

          .preview-card-home {
            padding: 0.875rem;
          }

          .preview-card-home h4 {
            font-size: 0.75rem;
          }

          .recent-activities-home {
            padding: 1.25rem;
          }

          .recent-activities-home h3 {
            font-size: 0.95rem;
            margin-bottom: 0.75rem;
          }

          .activity-item-home {
            padding: 0.625rem;
            gap: 0.5rem;
          }

          .activity-icon-home {
            width: 36px;
            height: 36px;
            min-width: 36px;
          }

          .activity-icon-home svg {
            width: 14px;
            height: 14px;
          }

          .activity-content-home p {
            font-size: 0.8rem;
          }

          .activity-content-home small {
            font-size: 0.65rem;
          }
        }

        /* Extra Small Mobile (< 480px) */
        @media (max-width: 480px) {
          .admin-dashboard-home {
            padding: 0.5rem;
          }

          .welcome-section-home {
            margin-bottom: 1.5rem;
          }

          .welcome-section-home h1 {
            font-size: 1.1rem;
          }

          .welcome-section-home p {
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

          .quick-actions-section {
            padding: 1rem;
            margin-bottom: 1.5rem;
          }

          .quick-actions-section h3 {
            font-size: 0.9rem;
          }

          .action-btn-home {
            padding: 0.75rem;
            font-size: 0.75rem;
          }

          .analytics-preview-home {
            padding: 1rem;
          }

          .recent-activities-home {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboardHome;
