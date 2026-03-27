import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Briefcase, 
  Clock, 
  CheckCircle2, 
  IndianRupee, 
  Building2, 
  Users as UsersIcon, 
  AlertTriangle 
} from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, color }) => (
  <div className="stat-card" style={{ borderLeft: `4px solid ${color}` }}>
    <div className="stat-content">
      <p className="stat-title">{title}</p>
      <h3 className="stat-value">{value}</h3>
    </div>
    <div className="stat-icon" style={{ backgroundColor: `${color}20`, color }}>
      <Icon size={24} />
    </div>
  </div>
);

const AdminDashboardHome = () => {
  const [stats, setStats] = useState({
    totalWorks: 0,
    worksInProgress: 0,
    completedWorks: 0,
    totalFunds: '0',
    fundsUtilized: '0',
    activeSchools: 0,
    totalUsers: 0,
    pendingRequests: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      // Fetch users
      const usersRes = await axios.get('http://localhost:8080/api/admin/users');
      const users = usersRes.data || [];
      
      // Fetch schools
      const schoolsRes = await axios.get('http://localhost:8080/api/schools');
      const schools = schoolsRes.data || [];
      
      // Fetch work requests (if API exists)
      let pendingRequests = 0;
      try {
        const workRequestsRes = await axios.get('http://localhost:8080/api/work-requests');
        pendingRequests = workRequestsRes.data?.filter(r => r.status === 'PENDING_APPROVAL').length || 0;
      } catch (err) {
        console.log('Work requests API not ready yet');
      }
      
      setStats({
        totalWorks: 12, // Mock data until work module is built
        worksInProgress: 8,
        completedWorks: 4,
        totalFunds: '25,00,000',
        fundsUtilized: '18,50,000',
        activeSchools: schools.filter(s => s.status === 'Active').length,
        totalUsers: users.length,
        pendingRequests: pendingRequests
      });
      setError(null);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Don't show error to user, just use default values
      setStats(prev => ({
        ...prev,
        activeSchools: 0,
        totalUsers: 0
      }));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-home">
        <div className="dashboard-header">
          <h1>Dashboard Overview</h1>
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-home">
      <div className="dashboard-header">
        <h1>Dashboard Overview</h1>
        <p>Real-time metrics and insights across the district.</p>
      </div>

      {error && (
        <div className="error-banner">
          <AlertTriangle size={16} />
          <span>{error}</span>
        </div>
      )}

      <div className="stats-grid">
        <StatCard title="Total Works" value={stats.totalWorks} icon={Briefcase} color="#0ea5e9" />
        <StatCard title="In Progress" value={stats.worksInProgress} icon={Clock} color="#f59e0b" />
        <StatCard title="Completed" value={stats.completedWorks} icon={CheckCircle2} color="#10b981" />
        <StatCard title="Total Funds" value={`₹${stats.totalFunds}`} icon={IndianRupee} color="#6366f1" />
        <StatCard title="Funds Utilized" value={`₹${stats.fundsUtilized}`} icon={IndianRupee} color="#8b5cf6" />
        <StatCard title="Active Schools" value={stats.activeSchools} icon={Building2} color="#ec4899" />
        <StatCard title="Total Users" value={stats.totalUsers} icon={UsersIcon} color="#64748b" />
        <StatCard title="Pending Requests" value={stats.pendingRequests} icon={AlertTriangle} color="#f43f5e" />
      </div>

      <div className="dashboard-content">
        <div className="content-card">
          <h3>Quick Actions</h3>
          <div className="quick-actions-grid">
            <button className="action-btn">Create New Sachiv</button>
            <button className="action-btn">Create New Head Master</button>
            <button className="action-btn">Approve Work Requests</button>
            <button className="action-btn">Create New Work</button>
            <button className="action-btn">View Blockers</button>
            <button className="action-btn">Generate Reports</button>
          </div>
        </div>

        <div className="content-card">
          <h3>Recent Activity</h3>
          <div className="empty-state">
            <p>No recent activity to show.</p>
          </div>
        </div>
      </div>

      <style>{`
        .dashboard-home {
          padding: 1rem;
        }
        .dashboard-header {
          margin-bottom: 2rem;
        }
        .dashboard-header h1 {
          font-size: 1.875rem;
          color: #1e293b;
          margin-bottom: 0.5rem;
        }
        .dashboard-header p {
          color: #64748b;
        }
        .error-banner {
          background-color: #fee2e2;
          color: #dc2626;
          padding: 0.75rem 1rem;
          border-radius: 0.5rem;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2.5rem;
        }
        .stat-card {
          background: white;
          padding: 1.5rem;
          border-radius: 0.75rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .stat-title {
          color: #64748b;
          font-size: 0.875rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }
        .stat-value {
          color: #1e293b;
          font-size: 1.5rem;
          font-weight: 700;
          margin: 0;
        }
        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .dashboard-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }
        .content-card {
          background: white;
          padding: 1.5rem;
          border-radius: 0.75rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .content-card h3 {
          margin-bottom: 1.5rem;
          color: #1e293b;
          font-size: 1.125rem;
        }
        .quick-actions-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        .action-btn {
          padding: 0.75rem;
          background-color: #f1f5f9;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          color: #475569;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
        }
        .action-btn:hover {
          background-color: #0ea5e9;
          color: white;
          border-color: #0ea5e9;
        }
        .empty-state {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 200px;
          color: #94a3b8;
          border: 2px dashed #e2e8f0;
          border-radius: 0.5rem;
        }
      `}</style>
    </div>
  );
};

export default AdminDashboardHome;