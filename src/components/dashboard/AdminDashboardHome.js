import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { 
  Briefcase, Clock, CheckCircle2, IndianRupee, Building2, 
  Users, AlertTriangle, LayoutDashboard, User, MapPin, 
  School, ClipboardList, BarChart3, Settings, LogOut,
  Menu, X, Eye, RefreshCw, Bell, TrendingUp, Flag,
  ArrowUp, ArrowDown, Download, Filter, Search
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeModule, setActiveModule] = useState('dashboard');

  // Dashboard Stats
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

  // Users
  const [users, setUsers] = useState([]);
  const [schools, setSchools] = useState([]);
  const [talukas, setTalukas] = useState([]);
  const [workRequests, setWorkRequests] = useState([]);

  // Blockers
  const [blockers, setBlockers] = useState([]);
  const [escalatedBlockers, setEscalatedBlockers] = useState([]);
  const [selectedBlocker, setSelectedBlocker] = useState(null);
  const [isBlockerModalOpen, setIsBlockerModalOpen] = useState(false);
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false);
  const [reassignFormData, setReassignFormData] = useState({
    assignedToId: '',
    notes: ''
  });
  const [sachivUsers, setSachivUsers] = useState([]);
  const [blockerSearchTerm, setBlockerSearchTerm] = useState('');
  const [blockerStatusFilter, setBlockerStatusFilter] = useState('ALL');

  useEffect(() => {
    fetchDashboardData();
    fetchUsers();
    fetchSchools();
    fetchTalukas();
    fetchWorkRequests();
    fetchBlockers();
    fetchEscalatedBlockers();
    fetchSachivUsers();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch users
      const usersRes = await axios.get('http://localhost:8080/api/admin/users');
      const allUsers = usersRes.data || [];
      
      // Fetch schools
      const schoolsRes = await axios.get('http://localhost:8080/api/schools');
      const allSchools = schoolsRes.data || [];
      
      // Fetch works
      const worksRes = await axios.get('http://localhost:8080/api/works');
      const works = worksRes.data || [];
      
      // Fetch work requests
      const requestsRes = await axios.get('http://localhost:8080/api/work-requests');
      const requests = requestsRes.data || [];
      const pendingRequests = requests.filter(r => r.status === 'PENDING_APPROVAL').length;
      
      // Fetch blockers stats
      const blockerStatsRes = await axios.get('http://localhost:8080/api/blockers/stats');
      const blockerStats = blockerStatsRes.data;
      
      setStats({
        totalWorks: works.length,
        worksInProgress: works.filter(w => w.status === 'IN_PROGRESS' || w.status === 'ACTIVE').length,
        completedWorks: works.filter(w => w.status === 'COMPLETED').length,
        totalFunds: works.reduce((sum, w) => sum + (w.sanctionedAmount || 0), 0),
        fundsUtilized: works.reduce((sum, w) => sum + (w.totalUtilized || 0), 0),
        activeSchools: allSchools.filter(s => s.status === 'Active').length,
        totalUsers: allUsers.length,
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

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/admin/users');
      setUsers(res.data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const fetchSchools = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/schools');
      setSchools(res.data || []);
    } catch (err) {
      console.error('Error fetching schools:', err);
    }
  };

  const fetchTalukas = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/talukas');
      setTalukas(res.data || []);
    } catch (err) {
      console.error('Error fetching talukas:', err);
    }
  };

  const fetchWorkRequests = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/work-requests');
      setWorkRequests(res.data || []);
    } catch (err) {
      console.error('Error fetching work requests:', err);
    }
  };

  const fetchBlockers = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/blockers');
      setBlockers(res.data || []);
    } catch (err) {
      console.error('Error fetching blockers:', err);
    }
  };

  const fetchEscalatedBlockers = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/blockers?status=ESCALATED');
      setEscalatedBlockers(res.data || []);
    } catch (err) {
      console.error('Error fetching escalated blockers:', err);
    }
  };

  const fetchSachivUsers = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/admin/users/role/SACHIV');
      setSachivUsers(res.data || []);
    } catch (err) {
      console.error('Error fetching sachiv users:', err);
    }
  };

  const handleReassignBlocker = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(`http://localhost:8080/api/blockers/${selectedBlocker.id}/assign`, {
        assignedToId: reassignFormData.assignedToId,
        assignedToRole: 'SACHIV',
        assignedBy: user.id,
        assignedByRole: 'ADMIN',
        notes: reassignFormData.notes
      });
      
      setSuccess('Blocker reassigned successfully');
      setIsReassignModalOpen(false);
      fetchBlockers();
      fetchEscalatedBlockers();
      fetchDashboardData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to reassign blocker');
    } finally {
      setLoading(false);
    }
  };

  const handleViewBlockerDetails = (blocker) => {
    setSelectedBlocker(blocker);
    setIsBlockerModalOpen(true);
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'HIGH': return '#ef4444';
      case 'MEDIUM': return '#f59e0b';
      default: return '#10b981';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'NEW': return { bg: '#fef3c7', color: '#92400e' };
      case 'IN_PROGRESS': return { bg: '#e0f2fe', color: '#0284c7' };
      case 'RESOLVED': return { bg: '#dcfce7', color: '#166534' };
      case 'ESCALATED': return { bg: '#fee2e2', color: '#dc2626' };
      default: return { bg: '#f1f5f9', color: '#475569' };
    }
  };

  const filteredEscalatedBlockers = escalatedBlockers.filter(blocker => {
    const matchesSearch = blocker.title?.toLowerCase().includes(blockerSearchTerm.toLowerCase()) ||
                          blocker.workTitle?.toLowerCase().includes(blockerSearchTerm.toLowerCase());
    const matchesStatus = blockerStatusFilter === 'ALL' || blocker.status === blockerStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Navigation Menu Items
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    { id: 'users', label: 'User Management', icon: Users, path: '/admin/users' },
    { id: 'talukas', label: 'Taluka Management', icon: MapPin, path: '/admin/talukas' },
    { id: 'schools', label: 'School Management', icon: School, path: '/admin/schools' },
    { id: 'work-requests', label: 'Work Requests', icon: ClipboardList, path: '/admin/work-requests' },
    { id: 'blockers', label: 'Blockers', icon: AlertTriangle, path: '/admin/blockers' },
    { id: 'reports', label: 'Reports', icon: BarChart3, path: '/admin/reports' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/admin/settings' }
  ];

  // Render Dashboard
  const renderDashboard = () => (
    <div className="admin-dashboard">
      <div className="stats-grid">
        <div className="stat-card" style={{ borderLeftColor: '#3b82f6' }}>
          <div className="stat-icon" style={{ backgroundColor: '#eff6ff', color: '#3b82f6' }}>
            <Briefcase size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats.totalWorks}</h3>
            <p>Total Works</p>
          </div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#f59e0b' }}>
          <div className="stat-icon" style={{ backgroundColor: '#fef3c7', color: '#f59e0b' }}>
            <Clock size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats.worksInProgress}</h3>
            <p>In Progress</p>
          </div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#10b981' }}>
          <div className="stat-icon" style={{ backgroundColor: '#dcfce7', color: '#10b981' }}>
            <CheckCircle2 size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats.completedWorks}</h3>
            <p>Completed</p>
          </div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#6366f1' }}>
          <div className="stat-icon" style={{ backgroundColor: '#e0e7ff', color: '#6366f1' }}>
            <IndianRupee size={24} />
          </div>
          <div className="stat-info">
            <h3>₹{stats.totalFunds.toLocaleString()}</h3>
            <p>Total Funds</p>
          </div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#8b5cf6' }}>
          <div className="stat-icon" style={{ backgroundColor: '#ede9fe', color: '#8b5cf6' }}>
            <TrendingUp size={24} />
          </div>
          <div className="stat-info">
            <h3>{((stats.fundsUtilized / stats.totalFunds) * 100 || 0).toFixed(0)}%</h3>
            <p>Utilized</p>
          </div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#ec4899' }}>
          <div className="stat-icon" style={{ backgroundColor: '#fce7f3', color: '#ec4899' }}>
            <Building2 size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats.activeSchools}</h3>
            <p>Active Schools</p>
          </div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#64748b' }}>
          <div className="stat-icon" style={{ backgroundColor: '#f1f5f9', color: '#64748b' }}>
            <Users size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats.totalUsers}</h3>
            <p>Total Users</p>
          </div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#ef4444' }}>
          <div className="stat-icon" style={{ backgroundColor: '#fee2e2', color: '#ef4444' }}>
            <AlertTriangle size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats.pendingRequests}</h3>
            <p>Pending Requests</p>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="actions-grid">
          <button className="action-btn" onClick={() => navigate('/admin/users')}>
            <Users size={20} /> Manage Users
          </button>
          <button className="action-btn" onClick={() => navigate('/admin/work-requests')}>
            <ClipboardList size={20} /> Review Requests
          </button>
          <button className="action-btn" onClick={() => setActiveModule('blockers')}>
            <AlertTriangle size={20} /> View Blockers
          </button>
          <button className="action-btn" onClick={() => navigate('/admin/reports')}>
            <BarChart3 size={20} /> Generate Reports
          </button>
        </div>
      </div>

      <div className="recent-activities">
        <h3>Recent Activity</h3>
        <div className="activity-list">
          {workRequests.slice(0, 5).map(req => (
            <div key={req.id} className="activity-item">
              <div className="activity-icon"><ClipboardList size={16} /></div>
              <div className="activity-content">
                <p><strong>{req.title}</strong> - {req.status?.replace('_', ' ')}</p>
                <small>{new Date(req.createdAt).toLocaleDateString()}</small>
              </div>
            </div>
          ))}
          {workRequests.length === 0 && <p className="no-activity">No recent activity</p>}
        </div>
      </div>
    </div>
  );

  // Render Blockers View (Admin)
  const renderBlockers = () => (
    <div className="admin-module">
      <div className="module-header">
        <h2>Escalated Blockers</h2>
        <div className="module-actions">
          <div className="search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search blockers..."
              value={blockerSearchTerm}
              onChange={(e) => setBlockerSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="status-filter"
            value={blockerStatusFilter}
            onChange={(e) => setBlockerStatusFilter(e.target.value)}
          >
            <option value="ALL">All Status</option>
            <option value="ESCALATED">Escalated</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="NEW">New</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>
      </div>

      <div className="blockers-grid">
        {filteredEscalatedBlockers.map(blocker => {
          const statusStyle = getStatusColor(blocker.status);
          return (
            <div key={blocker.id} className={`blocker-card priority-${blocker.priority?.toLowerCase()}`}>
              <div className="blocker-header">
                <div className="blocker-title">
                  <h3>{blocker.title}</h3>
                  <span className="work-ref">Work: {blocker.workCode || `#${blocker.workId}`}</span>
                </div>
                <div className="blocker-badges">
                  <span className={`priority-badge ${blocker.priority?.toLowerCase()}`}>
                    {blocker.priority}
                  </span>
                  <span className="status-badge-small" style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}>
                    {blocker.status}
                  </span>
                </div>
              </div>
              
              <p className="blocker-description">{blocker.description}</p>
              
              <div className="blocker-meta">
                <div className="meta-item">
                  <Building2 size={12} />
                  <span>{blocker.schoolName || `School ID: ${blocker.schoolId}`}</span>
                </div>
                <div className="meta-item">
                  <Clock size={12} />
                  <span>Reported: {new Date(blocker.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="meta-item">
                  <Flag size={12} />
                  <span>Type: {blocker.type}</span>
                </div>
              </div>
              
              {blocker.escalationReason && (
                <div className="escalation-reason">
                  <AlertTriangle size={12} />
                  <span>Escalation Reason: {blocker.escalationReason}</span>
                </div>
              )}
              
              <div className="blocker-actions">
                <button className="view-details-btn" onClick={() => handleViewBlockerDetails(blocker)}>
                  <Eye size={14} /> View Details
                </button>
                <button className="reassign-btn" onClick={() => {
                  setSelectedBlocker(blocker);
                  setIsReassignModalOpen(true);
                }}>
                  <RefreshCw size={14} /> Reassign
                </button>
              </div>
            </div>
          );
        })}
        
        {filteredEscalatedBlockers.length === 0 && (
          <div className="empty-state">
            <CheckCircle2 size={48} />
            <p>No escalated blockers. All blockers are being handled!</p>
          </div>
        )}
      </div>
    </div>
  );

  // Blocker Details Modal
  const renderBlockerModal = () => (
    <div className="modal-overlay">
      <div className="modal modal-large">
        <div className="modal-header">
          <h2>Blocker Details</h2>
          <button className="close-btn" onClick={() => setIsBlockerModalOpen(false)}>
            <X size={24} />
          </button>
        </div>
        
        {selectedBlocker && (
          <div className="modal-content">
            <div className="details-section">
              <h3>Blocker Information</h3>
              <div className="details-grid">
                <div className="detail-item full-width">
                  <label>Title</label>
                  <span>{selectedBlocker.title}</span>
                </div>
                <div className="detail-item">
                  <label>Type</label>
                  <span>{selectedBlocker.type}</span>
                </div>
                <div className="detail-item">
                  <label>Priority</label>
                  <span className={`priority-text ${selectedBlocker.priority?.toLowerCase()}`}>
                    {selectedBlocker.priority}
                  </span>
                </div>
                <div className="detail-item">
                  <label>Status</label>
                  <span>{selectedBlocker.status}</span>
                </div>
                <div className="detail-item full-width">
                  <label>Description</label>
                  <p>{selectedBlocker.description}</p>
                </div>
                <div className="detail-item full-width">
                  <label>Impact</label>
                  <p>{selectedBlocker.impact || 'Not specified'}</p>
                </div>
                <div className="detail-item">
                  <label>Estimated Delay</label>
                  <span>{selectedBlocker.estimatedDelayDays || 0} days</span>
                </div>
                <div className="detail-item">
                  <label>Reported By</label>
                  <span>{selectedBlocker.reportedBy} ({selectedBlocker.reportedByRole})</span>
                </div>
                <div className="detail-item">
                  <label>Reported At</label>
                  <span>{new Date(selectedBlocker.createdAt).toLocaleString()}</span>
                </div>
                {selectedBlocker.escalationReason && (
                  <div className="detail-item full-width">
                    <label>Escalation Reason</label>
                    <p className="escalation-text">{selectedBlocker.escalationReason}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="details-section">
              <h3>Work Context</h3>
              <div className="work-context">
                <p><strong>Work:</strong> {selectedBlocker.workTitle || `Work ID: ${selectedBlocker.workId}`}</p>
                <p><strong>Code:</strong> {selectedBlocker.workCode || 'N/A'}</p>
                <p><strong>School:</strong> {selectedBlocker.schoolName || `School ID: ${selectedBlocker.schoolId}`}</p>
              </div>
            </div>

            <div className="details-section">
              <h3>Comments & Updates</h3>
              <div className="comments-list">
                {selectedBlocker.comments && selectedBlocker.comments.map((comment, idx) => (
                  <div key={idx} className="comment-item">
                    <div className="comment-header">
                      <strong>{comment.commentedBy}</strong>
                      <span className="comment-role">{comment.commentedByRole}</span>
                      <small>{new Date(comment.createdAt).toLocaleString()}</small>
                    </div>
                    <p className="comment-text">{comment.comment}</p>
                  </div>
                ))}
                {(!selectedBlocker.comments || selectedBlocker.comments.length === 0) && (
                  <p className="no-comments">No comments yet</p>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setIsBlockerModalOpen(false)}>
                Close
              </button>
              <button className="reassign-btn" onClick={() => {
                setIsBlockerModalOpen(false);
                setIsReassignModalOpen(true);
              }}>
                <RefreshCw size={18} /> Reassign Blocker
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Reassign Modal
  const renderReassignModal = () => (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Reassign Blocker</h2>
          <button className="close-btn" onClick={() => setIsReassignModalOpen(false)}>
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleReassignBlocker}>
          <div className="modal-content">
            <div className="form-group">
              <label>Assign To</label>
              <select
                value={reassignFormData.assignedToId}
                onChange={(e) => setReassignFormData({...reassignFormData, assignedToId: e.target.value})}
                required
              >
                <option value="">Select Sachiv</option>
                {sachivUsers.map(s => (
                  <option key={s.id} value={s.id}>{s.name} {s.talukaName ? `(${s.talukaName})` : ''}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Notes (Optional)</label>
              <textarea
                value={reassignFormData.notes}
                onChange={(e) => setReassignFormData({...reassignFormData, notes: e.target.value})}
                rows="3"
                placeholder="Add any instructions or notes for the Sachiv..."
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="cancel-btn" onClick={() => setIsReassignModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="save-btn" disabled={loading}>
              {loading ? 'Reassigning...' : 'Reassign Blocker'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="admin-container">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <h2>{sidebarCollapsed ? 'AD' : 'Admin'}</h2>
          <button className="collapse-btn" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
            <Menu size={20} />
          </button>
        </div>
        <nav className="sidebar-nav">
          {menuItems.map(item => (
            <button
              key={item.id}
              className={`nav-item ${activeModule === item.id ? 'active' : ''}`}
              onClick={() => {
                setActiveModule(item.id);
                navigate(item.path);
              }}
            >
              <item.icon size={20} />
              {!sidebarCollapsed && <span>{item.label}</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={logout}>
            <LogOut size={20} />
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`main-content ${sidebarCollapsed ? 'expanded' : ''}`}>
        <div className="top-bar">
          <div className="welcome-section">
            <h1>{activeModule === 'dashboard' ? 'Dashboard' : 
                  activeModule === 'blockers' ? 'Blocker Management' : 
                  menuItems.find(m => m.id === activeModule)?.label || 'Dashboard'}</h1>
            <p>Welcome back, {user?.name}</p>
          </div>
          <div className="user-info">
            <div className="notification-bell">
              <Bell size={20} />
              <span className="badge">{stats.escalatedBlockers + stats.pendingRequests}</span>
            </div>
            <div className="user-name">
              <User size={20} />
              <span>{user?.name?.split(' ')[0]}</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="alert error">
            <AlertTriangle size={18} />
            <span>{error}</span>
            <button onClick={() => setError('')}><X size={16} /></button>
          </div>
        )}
        {success && (
          <div className="alert success">
            <CheckCircle2 size={18} />
            <span>{success}</span>
            <button onClick={() => setSuccess('')}><X size={16} /></button>
          </div>
        )}

        {activeModule === 'dashboard' && renderDashboard()}
        {activeModule === 'blockers' && renderBlockers()}
      </div>

      {/* Modals */}
      {isBlockerModalOpen && renderBlockerModal()}
      {isReassignModalOpen && renderReassignModal()}

      <style>{`
        .admin-container { display: flex; min-height: 100vh; background-color: #f8fafc; }
        .sidebar { width: 260px; background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); color: white; display: flex; flex-direction: column; position: fixed; height: 100vh; transition: width 0.3s ease; z-index: 100; }
        .sidebar.collapsed { width: 70px; }
        .sidebar-header { padding: 1.5rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #334155; }
        .sidebar-header h2 { margin: 0; font-size: 1.25rem; color: #38bdf8; }
        .collapse-btn { background: none; border: none; color: #94a3b8; cursor: pointer; }
        .sidebar-nav { flex: 1; padding: 1rem 0; display: flex; flex-direction: column; gap: 0.25rem; }
        .nav-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1.5rem; background: none; border: none; color: #cbd5e1; cursor: pointer; transition: all 0.2s; width: 100%; text-align: left; font-size: 0.95rem; }
        .nav-item:hover { background-color: #334155; color: white; }
        .nav-item.active { background-color: #0ea5e9; color: white; }
        .sidebar-footer { padding: 1rem; border-top: 1px solid #334155; }
        .logout-btn { display: flex; align-items: center; gap: 0.75rem; width: 100%; padding: 0.75rem; background: none; border: none; color: #cbd5e1; cursor: pointer; }
        .logout-btn:hover { color: #ef4444; }
        .main-content { flex: 1; margin-left: 260px; padding: 1.5rem; transition: margin-left 0.3s ease; }
        .main-content.expanded { margin-left: 70px; }
        .top-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 1px solid #e2e8f0; }
        .welcome-section h1 { margin: 0; font-size: 1.5rem; color: #1e293b; }
        .welcome-section p { margin: 0.25rem 0 0; color: #64748b; font-size: 0.875rem; }
        .user-info { display: flex; align-items: center; gap: 1.5rem; }
        .notification-bell { position: relative; cursor: pointer; }
        .notification-bell .badge { position: absolute; top: -8px; right: -8px; background-color: #ef4444; color: white; font-size: 0.7rem; padding: 2px 5px; border-radius: 10px; }
        .user-name { display: flex; align-items: center; gap: 0.5rem; color: #334155; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
        .stat-card { background: white; padding: 1rem; border-radius: 0.75rem; display: flex; align-items: center; gap: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-left: 4px solid; }
        .stat-icon { width: 48px; height: 48px; border-radius: 0.5rem; display: flex; align-items: center; justify-content: center; }
        .stat-info h3 { margin: 0; font-size: 1.5rem; font-weight: 700; }
        .stat-info p { margin: 0; color: #64748b; font-size: 0.8rem; }
        .quick-actions { background: white; padding: 1.5rem; border-radius: 0.75rem; margin-bottom: 2rem; }
        .quick-actions h3 { margin: 0 0 1rem 0; }
        .actions-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }
        .action-btn { display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem; background-color: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 0.5rem; cursor: pointer; transition: all 0.2s; }
        .action-btn:hover { background-color: #0ea5e9; color: white; }
        .recent-activities { background: white; padding: 1.5rem; border-radius: 0.75rem; }
        .recent-activities h3 { margin: 0 0 1rem 0; }
        .activity-list { display: flex; flex-direction: column; gap: 0.75rem; }
        .activity-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem; border-bottom: 1px solid #f1f5f9; }
        .activity-icon { width: 28px; height: 28px; background-color: #e0f2fe; border-radius: 0.5rem; display: flex; align-items: center; justify-content: center; color: #0284c7; }
        .activity-content { flex: 1; }
        .activity-content p { margin: 0; font-size: 0.875rem; }
        .activity-content small { color: #94a3b8; font-size: 0.7rem; }
        .no-activity { text-align: center; color: #94a3b8; padding: 2rem; }
        .admin-module { background: white; border-radius: 0.75rem; padding: 1.5rem; }
        .module-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
        .module-header h2 { margin: 0; font-size: 1.25rem; }
        .module-actions { display: flex; gap: 1rem; flex-wrap: wrap; }
        .search-box { display: flex; align-items: center; gap: 0.5rem; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 0.5rem; padding: 0.5rem 0.75rem; }
        .search-box input { border: none; background: none; outline: none; }
        .status-filter { padding: 0.5rem; border: 1px solid #e2e8f0; border-radius: 0.5rem; background: white; }
        .blockers-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 1.5rem; }
        .blocker-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0.75rem; padding: 1rem; transition: all 0.2s; }
        .blocker-card.priority-high { border-left: 4px solid #ef4444; }
        .blocker-card.priority-medium { border-left: 4px solid #f59e0b; }
        .blocker-card.priority-low { border-left: 4px solid #10b981; }
        .blocker-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.75rem; }
        .blocker-title h3 { margin: 0 0 0.25rem 0; font-size: 1rem; }
        .work-ref { font-size: 0.7rem; color: #64748b; }
        .blocker-badges { display: flex; gap: 0.5rem; }
        .priority-badge { padding: 0.2rem 0.6rem; border-radius: 9999px; font-size: 0.7rem; font-weight: 600; }
        .priority-badge.high { background-color: #fee2e2; color: #dc2626; }
        .priority-badge.medium { background-color: #fef3c7; color: #d97706; }
        .priority-badge.low { background-color: #dcfce7; color: #16a34a; }
        .status-badge-small { display: inline-flex; align-items: center; gap: 0.25rem; padding: 0.2rem 0.5rem; border-radius: 9999px; font-size: 0.65rem; font-weight: 600; }
        .blocker-description { color: #475569; font-size: 0.875rem; margin-bottom: 0.75rem; }
        .blocker-meta { display: flex; flex-wrap: wrap; gap: 1rem; margin-bottom: 0.75rem; padding: 0.5rem 0; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; }
        .meta-item { display: flex; align-items: center; gap: 0.25rem; font-size: 0.7rem; color: #64748b; }
        .escalation-reason { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem; background-color: #fee2e2; border-radius: 0.5rem; margin-bottom: 0.75rem; font-size: 0.75rem; color: #dc2626; }
        .blocker-actions { display: flex; gap: 0.5rem; }
        .view-details-btn, .reassign-btn { display: flex; align-items: center; gap: 0.4rem; padding: 0.5rem; border: none; border-radius: 0.5rem; cursor: pointer; font-size: 0.75rem; flex: 1; justify-content: center; }
        .view-details-btn { background-color: #f1f5f9; color: #475569; }
        .reassign-btn { background-color: #e0f2fe; color: #0284c7; }
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
        .modal { background: white; border-radius: 1rem; width: 100%; max-width: 500px; max-height: 90vh; overflow-y: auto; }
        .modal-large { max-width: 800px; }
        .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem; border-bottom: 1px solid #e2e8f0; }
        .modal-header h2 { margin: 0; }
        .close-btn { background: none; border: none; cursor: pointer; color: #64748b; }
        .modal-content { padding: 1.5rem; }
        .modal-footer { display: flex; justify-content: flex-end; gap: 1rem; padding: 1.5rem; border-top: 1px solid #e2e8f0; }
        .details-section { margin-bottom: 2rem; }
        .details-section h3 { margin: 0 0 1rem 0; font-size: 1rem; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.5rem; }
        .details-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
        .detail-item { display: flex; flex-direction: column; gap: 0.25rem; }
        .detail-item.full-width { grid-column: span 2; }
        .detail-item label { font-size: 0.7rem; font-weight: 600; color: #64748b; text-transform: uppercase; }
        .priority-text.high { color: #dc2626; font-weight: 600; }
        .priority-text.medium { color: #f59e0b; font-weight: 600; }
        .escalation-text { background-color: #fee2e2; padding: 0.5rem; border-radius: 0.5rem; color: #dc2626; }
        .work-context { background-color: #f8fafc; padding: 1rem; border-radius: 0.5rem; }
        .work-context p { margin: 0.25rem 0; }
        .comments-list { max-height: 300px; overflow-y: auto; margin-bottom: 1rem; }
        .comment-item { background-color: #f8fafc; padding: 0.75rem; border-radius: 0.5rem; margin-bottom: 0.5rem; }
        .comment-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem; font-size: 0.75rem; flex-wrap: wrap; }
        .comment-role { color: #64748b; font-size: 0.7rem; }
        .comment-text { margin: 0; font-size: 0.875rem; color: #1e293b; }
        .no-comments { text-align: center; color: #94a3b8; padding: 1rem; }
        .form-group { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1rem; }
        .form-group label { font-weight: 600; color: #334155; font-size: 0.875rem; }
        .form-group input, .form-group select, .form-group textarea { padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 0.9rem; }
        .cancel-btn { padding: 0.75rem 1.5rem; border: 1px solid #d1d5db; border-radius: 0.5rem; background: white; cursor: pointer; }
        .save-btn { padding: 0.75rem 1.5rem; border: none; border-radius: 0.5rem; background: #0ea5e9; color: white; cursor: pointer; font-weight: 600; }
        .alert { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; border-radius: 0.5rem; margin-bottom: 1rem; }
        .alert.error { background-color: #fee2e2; color: #dc2626; }
        .alert.success { background-color: #dcfce7; color: #16a34a; }
        .alert button { background: none; border: none; margin-left: auto; cursor: pointer; color: inherit; }
        .empty-state { text-align: center; padding: 3rem; color: #94a3b8; }
        .empty-state svg { margin-bottom: 1rem; opacity: 0.5; }
      `}</style>
    </div>
  );
};

export default AdminDashboard;