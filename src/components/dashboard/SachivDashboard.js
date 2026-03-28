import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { 
  Home, Briefcase, AlertCircle, CheckCircle2, XCircle,
  Plus, Edit2, Trash2, X, Search, Filter, Download,
  Menu, LogOut, User, Clock, Calendar, DollarSign,
  Building2, Eye, RefreshCw, Send, MessageSquare,
  ChevronUp, ChevronDown, Flag, Users, TrendingUp,
  Bell, FileText, Settings, Award, BarChart3, Minus
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import BlockerManagement from './BlockerManagement';

const SachivDashboard = () => {
  const { user, logout } = useAuth();
  const [activeModule, setActiveModule] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Dashboard Stats
  const [stats, setStats] = useState({
    totalWorks: 0,
    activeWorks: 0,
    completedWorks: 0,
    pendingVerification: 0,
    totalBlockers: 0,
    activeBlockers: 0,
    resolvedBlockers: 0,
    escalatedBlockers: 0,
    totalSchools: 0
  });

  // Works
  const [works, setWorks] = useState([]);
  const [selectedWork, setSelectedWork] = useState(null);
  const [isWorkDetailModalOpen, setIsWorkDetailModalOpen] = useState(false);
  const [workSearchTerm, setWorkSearchTerm] = useState('');
  const [workStatusFilter, setWorkStatusFilter] = useState('ALL');

  // Blockers
  const [blockers, setBlockers] = useState([]);
  const [selectedBlocker, setSelectedBlocker] = useState(null);
  const [isBlockerDetailModalOpen, setIsBlockerDetailModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [isEscalateModalOpen, setIsEscalateModalOpen] = useState(false);
  const [assignFormData, setAssignFormData] = useState({
    assignedToId: '',
    assignedToRole: 'SACHIV',
    notes: ''
  });
  const [resolveFormData, setResolveFormData] = useState({
    resolutionNotes: ''
  });
  const [escalateFormData, setEscalateFormData] = useState({
    reason: '',
    escalateToAdmin: true
  });
  const [commentText, setCommentText] = useState('');
  const [blockerSearchTerm, setBlockerSearchTerm] = useState('');
  const [blockerStatusFilter, setBlockerStatusFilter] = useState('ALL');
  const [blockerPriorityFilter, setBlockerPriorityFilter] = useState('ALL');

  // Schools under Taluka
  const [schools, setSchools] = useState([]);
  const [sachivUsers, setSachivUsers] = useState([]);
  const [workRequests, setWorkRequests] = useState([]);

  // Pending Verification Works
  const [pendingVerificationWorks, setPendingVerificationWorks] = useState([]);
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [verificationFormData, setVerificationFormData] = useState({
    inspectionNotes: '',
    qualityAssessment: 'Good',
    punchListItems: [],
    finalPhotos: []
  });

  useEffect(() => {
    if (user && user.talukaId) {
      fetchDashboardData();
      fetchWorks();
      fetchBlockers();
      fetchSchools();
      fetchPendingVerification();
      fetchSachivUsers();
    }
  }, [user]);

  // Filter functions
  const filteredWorks = works.filter(work => {
    const matchesSearch = work.title?.toLowerCase().includes(workSearchTerm.toLowerCase()) ||
                          work.workCode?.toLowerCase().includes(workSearchTerm.toLowerCase());
    const matchesStatus = workStatusFilter === 'ALL' || work.status === workStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredBlockers = blockers.filter(blocker => {
    const matchesSearch = blocker.title?.toLowerCase().includes(blockerSearchTerm.toLowerCase()) ||
                          blocker.workTitle?.toLowerCase().includes(blockerSearchTerm.toLowerCase());
    const matchesStatus = blockerStatusFilter === 'ALL' || blocker.status === blockerStatusFilter;
    const matchesPriority = blockerPriorityFilter === 'ALL' || blocker.priority === blockerPriorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch works in taluka
      const worksRes = await axios.get(`http://localhost:8080/api/works/taluka/${user.talukaId}`);
      const allWorks = worksRes.data || [];
      
      // Fetch blockers
      const blockersRes = await axios.get(`http://localhost:8080/api/blockers`);
      const allBlockers = blockersRes.data || [];
      const talukaBlockers = allBlockers.filter(b => {
        const school = schools.find(s => s.id === b.schoolId);
        return school && school.talukaId === user.talukaId;
      });
      
      setStats({
        totalWorks: allWorks.length,
        activeWorks: allWorks.filter(w => w.status === 'ACTIVE' || w.status === 'IN_PROGRESS').length,
        completedWorks: allWorks.filter(w => w.status === 'COMPLETED').length,
        pendingVerification: allWorks.filter(w => w.status === 'PENDING_CLOSURE').length,
        totalBlockers: talukaBlockers.length,
        activeBlockers: talukaBlockers.filter(b => b.status !== 'RESOLVED').length,
        resolvedBlockers: talukaBlockers.filter(b => b.status === 'RESOLVED').length,
        escalatedBlockers: talukaBlockers.filter(b => b.status === 'ESCALATED').length,
        totalSchools: schools.length
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWorks = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/works/taluka/${user.talukaId}`);
      setWorks(res.data || []);
    } catch (err) {
      console.error('Error fetching works:', err);
    }
  };

  const fetchBlockers = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/blockers`);
      let allBlockers = res.data || [];
      
      // Filter by schools in this taluka
      const talukaSchoolIds = schools.map(s => s.id);
      const talukaBlockers = allBlockers.filter(b => talukaSchoolIds.includes(b.schoolId));
      
      setBlockers(talukaBlockers);
    } catch (err) {
      console.error('Error fetching blockers:', err);
    }
  };

  const fetchSchools = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/schools`, {
        params: { talukaId: user.talukaId }
      });
      setSchools(res.data || []);
    } catch (err) {
      console.error('Error fetching schools:', err);
    }
  };

  const fetchPendingVerification = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/works/status/PENDING_CLOSURE`);
      const allPending = res.data || [];
      const talukaSchoolIds = schools.map(s => s.id);
      const pending = allPending.filter(w => talukaSchoolIds.includes(w.schoolId));
      setPendingVerificationWorks(pending);
    } catch (err) {
      console.error('Error fetching pending verification:', err);
    }
  };

  const fetchSachivUsers = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/admin/users/role/SACHIV`);
      setSachivUsers(res.data || []);
    } catch (err) {
      console.error('Error fetching sachiv users:', err);
    }
  };

  // Blocker Actions
  const handleAssignBlocker = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(`http://localhost:8080/api/blockers/${selectedBlocker.id}/assign`, {
        assignedToId: assignFormData.assignedToId,
        assignedToRole: assignFormData.assignedToRole,
        assignedBy: user.id,
        assignedByRole: 'SACHIV'
      });
      
      setSuccess('Blocker assigned successfully');
      setIsAssignModalOpen(false);
      fetchBlockers();
      fetchDashboardData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to assign blocker');
    } finally {
      setLoading(false);
    }
  };

  const handleResolveBlocker = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(`http://localhost:8080/api/blockers/${selectedBlocker.id}/resolve`, {
        resolutionNotes: resolveFormData.resolutionNotes,
        resolvedById: user.id,
        resolvedByRole: 'SACHIV'
      });
      
      setSuccess('Blocker resolved successfully');
      setIsResolveModalOpen(false);
      fetchBlockers();
      fetchDashboardData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to resolve blocker');
    } finally {
      setLoading(false);
    }
  };

  const handleEscalateBlocker = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(`http://localhost:8080/api/blockers/${selectedBlocker.id}/escalate`, {
        escalatedToId: 1, // Admin ID
        escalatedToRole: 'ADMIN',
        reason: escalateFormData.reason,
        escalatedById: user.id,
        escalatedByRole: 'SACHIV'
      });
      
      setSuccess('Blocker escalated to Admin');
      setIsEscalateModalOpen(false);
      fetchBlockers();
      fetchDashboardData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to escalate blocker');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    setLoading(true);
    try {
      await axios.post(`http://localhost:8080/api/blockers/${selectedBlocker.id}/comments`, {
        comment: commentText,
        commentedById: user.id,
        commentedByRole: 'SACHIV',
        commentedByName: user.name,
        isInternal: false
      });
      
      setCommentText('');
      fetchBlockers();
      // Refresh the modal data
      const updatedBlocker = await axios.get(`http://localhost:8080/api/blockers/${selectedBlocker.id}`);
      setSelectedBlocker(updatedBlocker.data);
      setSuccess('Comment added');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to add comment');
    } finally {
      setLoading(false);
    }
  };

  const handleViewBlockerDetails = (blocker) => {
    setSelectedBlocker(blocker);
    setIsBlockerDetailModalOpen(true);
    setCommentText('');
  };

  // Work Verification
  const handleVerifyWork = async (work) => {
    setSelectedWork(work);
    setIsVerificationModalOpen(true);
  };

  const handleSubmitVerification = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`http://localhost:8080/api/works/${selectedWork.id}/verify`, {
        inspectionNotes: verificationFormData.inspectionNotes,
        qualityAssessment: verificationFormData.qualityAssessment
      });
      
      setSuccess('Work verified and completed successfully');
      setIsVerificationModalOpen(false);
      fetchWorks();
      fetchPendingVerification();
      fetchDashboardData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to verify work');
    } finally {
      setLoading(false);
    }
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
      case 'NEW': return { bg: '#fef3c7', color: '#92400e', icon: Clock };
      case 'IN_PROGRESS': return { bg: '#e0f2fe', color: '#0284c7', icon: RefreshCw };
      case 'RESOLVED': return { bg: '#dcfce7', color: '#166534', icon: CheckCircle2 };
      case 'ESCALATED': return { bg: '#fee2e2', color: '#dc2626', icon: AlertCircle };
      default: return { bg: '#f1f5f9', color: '#475569', icon: AlertCircle };
    }
  };

  // Render Dashboard
  const renderDashboard = () => (
    <div className="sachiv-dashboard">
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
        <div className="stat-card" style={{ borderLeftColor: '#10b981' }}>
          <div className="stat-icon" style={{ backgroundColor: '#dcfce7', color: '#10b981' }}>
            <CheckCircle2 size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats.activeWorks}</h3>
            <p>Active Works</p>
          </div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#f59e0b' }}>
          <div className="stat-icon" style={{ backgroundColor: '#fef3c7', color: '#f59e0b' }}>
            <Clock size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats.pendingVerification}</h3>
            <p>Pending Verification</p>
          </div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#ef4444' }}>
          <div className="stat-icon" style={{ backgroundColor: '#fee2e2', color: '#ef4444' }}>
            <AlertCircle size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats.activeBlockers}</h3>
            <p>Active Blockers</p>
          </div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#8b5cf6' }}>
          <div className="stat-icon" style={{ backgroundColor: '#ede9fe', color: '#8b5cf6' }}>
            <Flag size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats.escalatedBlockers}</h3>
            <p>Escalated</p>
          </div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#06b6d4' }}>
          <div className="stat-icon" style={{ backgroundColor: '#cffafe', color: '#06b6d4' }}>
            <Building2 size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats.totalSchools}</h3>
            <p>Schools</p>
          </div>
        </div>
      </div>

      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="actions-grid">
          <button className="action-btn" onClick={() => setActiveModule('blockers')}>
            <AlertCircle size={20} /> Manage Blockers
          </button>
          <button className="action-btn" onClick={() => setActiveModule('verification')}>
            <CheckCircle2 size={20} /> Verify Works
          </button>
          <button className="action-btn" onClick={() => setActiveModule('works')}>
            <Eye size={20} /> Monitor Works
          </button>
          <button className="action-btn" onClick={() => setActiveModule('reports')}>
            <BarChart3 size={20} /> View Reports
          </button>
        </div>
      </div>
    </div>
  );

  // Render Works Monitoring
  const renderWorks = () => (
    <div className="sachiv-module">
      <div className="module-header">
        <h2>Works Monitoring</h2>
        <div className="module-actions">
          <div className="search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search by code or title..."
              value={workSearchTerm}
              onChange={(e) => setWorkSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="status-filter"
            value={workStatusFilter}
            onChange={(e) => setWorkStatusFilter(e.target.value)}
          >
            <option value="ALL">All Status</option>
            <option value="ACTIVE">Active</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="ON_HOLD">On Hold</option>
            <option value="COMPLETED">Completed</option>
            <option value="PENDING_CLOSURE">Pending Closure</option>
          </select>
        </div>
      </div>

      <div className="works-table-container">
        <table className="works-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Title</th>
              <th>School</th>
              <th>Progress</th>
              <th>Status</th>
              <th>Budget</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredWorks.map(work => {
              const statusStyle = getStatusColor(work.status);
              const StatusIcon = statusStyle.icon;
              return (
                <tr key={work.id}>
                  <td className="work-code">{work.workCode}</td>
                  <td className="work-title">
                    <strong>{work.title}</strong>
                    <small>{work.description?.substring(0, 50)}</small>
                  </td>
                  <td>{work.schoolName || `School ID: ${work.schoolId}`}</td>
                  <td>
                    <div className="progress-cell">
                      <div className="progress-bar-small">
                        <div className="progress-fill" style={{ width: `${work.progressPercentage}%` }}></div>
                      </div>
                      <span>{work.progressPercentage}%</span>
                    </div>
                  </td>
                  <td>
                    <span className="status-badge" style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}>
                      <StatusIcon size={12} />
                      {work.status?.replace('_', ' ')}
                    </span>
                  </td>
                  <td>₹{work.sanctionedAmount?.toLocaleString()}</td>
                  <td>
                    <button className="view-btn" onClick={() => {
                      setSelectedWork(work);
                      setIsWorkDetailModalOpen(true);
                    }}>
                      <Eye size={16} /> View
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredWorks.length === 0 && (
          <div className="empty-state">
            <Briefcase size={48} />
            <p>No works found</p>
          </div>
        )}
      </div>
    </div>
  );

  // Render Blockers Management
  const renderBlockers = () => (
    <div className="sachiv-module">
      <div className="module-header">
        <h2>Blocker Management</h2>
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
            <option value="NEW">New</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="ESCALATED">Escalated</option>
          </select>
          <select 
            className="priority-filter"
            value={blockerPriorityFilter}
            onChange={(e) => setBlockerPriorityFilter(e.target.value)}
          >
            <option value="ALL">All Priority</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
        </div>
      </div>

      <div className="blockers-grid">
        {filteredBlockers.map(blocker => {
          const statusStyle = getStatusColor(blocker.status);
          const StatusIcon = statusStyle.icon;
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
                    <StatusIcon size={10} />
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
              
              <div className="blocker-actions">
                <button className="view-details-btn" onClick={() => handleViewBlockerDetails(blocker)}>
                  <Eye size={14} /> View Details
                </button>
                {blocker.status === 'NEW' && (
                  <button className="assign-btn" onClick={() => {
                    setSelectedBlocker(blocker);
                    setIsAssignModalOpen(true);
                  }}>
                    <Users size={14} /> Assign
                  </button>
                )}
                {blocker.status === 'IN_PROGRESS' && (
                  <button className="resolve-btn" onClick={() => {
                    setSelectedBlocker(blocker);
                    setIsResolveModalOpen(true);
                  }}>
                    <CheckCircle2 size={14} /> Resolve
                  </button>
                )}
                {blocker.status !== 'RESOLVED' && blocker.status !== 'ESCALATED' && (
                  <button className="escalate-btn" onClick={() => {
                    setSelectedBlocker(blocker);
                    setIsEscalateModalOpen(true);
                  }}>
                    <AlertCircle size={14} /> Escalate
                  </button>
                )}
              </div>
            </div>
          );
        })}
        
        {filteredBlockers.length === 0 && (
          <div className="empty-state">
            <AlertCircle size={48} />
            <p>No blockers found</p>
          </div>
        )}
      </div>
    </div>
  );

  // Render Pending Verification
  const renderVerification = () => (
    <div className="sachiv-module">
      <div className="module-header">
        <h2>Works Ready for Verification</h2>
      </div>

      <div className="verification-list">
        {pendingVerificationWorks.map(work => (
          <div key={work.id} className="verification-card">
            <div className="verification-header">
              <div>
                <h3>{work.title}</h3>
                <span className="work-code">{work.workCode}</span>
              </div>
              <span className="completion-badge">Ready for Inspection</span>
            </div>
            
            <div className="verification-details">
              <div className="detail-row">
                <Building2 size={14} />
                <span>{work.schoolName || `School ID: ${work.schoolId}`}</span>
              </div>
              <div className="detail-row">
                <DollarSign size={14} />
                <span>Budget: ₹{work.sanctionedAmount?.toLocaleString()} | Utilized: ₹{work.totalUtilized?.toLocaleString()}</span>
              </div>
              <div className="detail-row">
                <Calendar size={14} />
                <span>Completed: {work.completedAt ? new Date(work.completedAt).toLocaleDateString() : 'Pending'}</span>
              </div>
            </div>
            
            <div className="verification-actions">
              <button className="verify-btn" onClick={() => handleVerifyWork(work)}>
                <CheckCircle2 size={16} /> Verify & Close
              </button>
            </div>
          </div>
        ))}
        
        {pendingVerificationWorks.length === 0 && (
          <div className="empty-state">
            <CheckCircle2 size={48} />
            <p>No works pending verification</p>
          </div>
        )}
      </div>
    </div>
  );

  // Blocker Detail Modal
  const renderBlockerDetailModal = () => (
    <div className="modal-overlay">
      <div className="modal modal-large">
        <div className="modal-header">
          <h2>Blocker Details</h2>
          <button className="close-btn" onClick={() => setIsBlockerDetailModalOpen(false)}>
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
                {selectedBlocker.assignedTo && (
                  <div className="detail-item">
                    <label>Assigned To</label>
                    <span>{selectedBlocker.assignedTo} ({selectedBlocker.assignedToRole})</span>
                  </div>
                )}
                {selectedBlocker.resolutionNotes && (
                  <div className="detail-item full-width">
                    <label>Resolution Notes</label>
                    <p>{selectedBlocker.resolutionNotes}</p>
                  </div>
                )}
                {selectedBlocker.escalationReason && (
                  <div className="detail-item full-width">
                    <label>Escalation Reason</label>
                    <p>{selectedBlocker.escalationReason}</p>
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
              
              <div className="add-comment">
                <textarea
                  placeholder="Add a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  rows="2"
                />
                <button onClick={handleAddComment} disabled={loading}>
                  <Send size={16} /> Post Comment
                </button>
              </div>
            </div>

            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setIsBlockerDetailModalOpen(false)}>
                Close
              </button>
              {selectedBlocker.status === 'NEW' && (
                <button className="assign-btn" onClick={() => {
                  setIsBlockerDetailModalOpen(false);
                  setIsAssignModalOpen(true);
                }}>
                  <Users size={18} /> Assign
                </button>
              )}
              {selectedBlocker.status === 'IN_PROGRESS' && (
                <button className="resolve-btn" onClick={() => {
                  setIsBlockerDetailModalOpen(false);
                  setIsResolveModalOpen(true);
                }}>
                  <CheckCircle2 size={18} /> Resolve
                </button>
              )}
              {selectedBlocker.status !== 'RESOLVED' && selectedBlocker.status !== 'ESCALATED' && (
                <button className="escalate-btn" onClick={() => {
                  setIsBlockerDetailModalOpen(false);
                  setIsEscalateModalOpen(true);
                }}>
                  <AlertCircle size={18} /> Escalate to Admin
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Assign Blocker Modal
  const renderAssignModal = () => (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Assign Blocker</h2>
          <button className="close-btn" onClick={() => setIsAssignModalOpen(false)}>
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleAssignBlocker}>
          <div className="modal-content">
            <div className="form-group">
              <label>Assign To</label>
              <select
                value={assignFormData.assignedToId}
                onChange={(e) => setAssignFormData({...assignFormData, assignedToId: e.target.value})}
                required
              >
                <option value="">Select Sachiv</option>
                {sachivUsers.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Notes (Optional)</label>
              <textarea
                value={assignFormData.notes}
                onChange={(e) => setAssignFormData({...assignFormData, notes: e.target.value})}
                rows="3"
                placeholder="Add any instructions or notes..."
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="cancel-btn" onClick={() => setIsAssignModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="save-btn" disabled={loading}>
              {loading ? 'Assigning...' : 'Assign Blocker'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Resolve Blocker Modal
  const renderResolveModal = () => (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Resolve Blocker</h2>
          <button className="close-btn" onClick={() => setIsResolveModalOpen(false)}>
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleResolveBlocker}>
          <div className="modal-content">
            <div className="form-group">
              <label>Resolution Notes *</label>
              <textarea
                value={resolveFormData.resolutionNotes}
                onChange={(e) => setResolveFormData({...resolveFormData, resolutionNotes: e.target.value})}
                rows="4"
                required
                placeholder="Describe how the blocker was resolved..."
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="cancel-btn" onClick={() => setIsResolveModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="save-btn" disabled={loading}>
              {loading ? 'Resolving...' : 'Resolve Blocker'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Escalate Blocker Modal
  const renderEscalateModal = () => (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Escalate Blocker to Admin</h2>
          <button className="close-btn" onClick={() => setIsEscalateModalOpen(false)}>
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleEscalateBlocker}>
          <div className="modal-content">
            <div className="form-group">
              <label>Escalation Reason *</label>
              <textarea
                value={escalateFormData.reason}
                onChange={(e) => setEscalateFormData({...escalateFormData, reason: e.target.value})}
                rows="4"
                required
                placeholder="Explain why this blocker needs Admin intervention..."
              />
            </div>
            <div className="info-box">
              <AlertCircle size={16} />
              <span>Escalating will notify Admin and mark this blocker as ESCALATED</span>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="cancel-btn" onClick={() => setIsEscalateModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="escalate-btn" disabled={loading}>
              {loading ? 'Escalating...' : 'Escalate to Admin'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Verification Modal
  const renderVerificationModal = () => (
    <div className="modal-overlay">
      <div className="modal modal-large">
        <div className="modal-header">
          <h2>Verify Work Completion</h2>
          <button className="close-btn" onClick={() => setIsVerificationModalOpen(false)}>
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmitVerification}>
          <div className="modal-content">
            <div className="work-summary">
              <h3>Work Summary</h3>
              <p><strong>Title:</strong> {selectedWork?.title}</p>
              <p><strong>Code:</strong> {selectedWork?.workCode}</p>
              <p><strong>School:</strong> {selectedWork?.schoolName}</p>
              <p><strong>Budget:</strong> ₹{selectedWork?.sanctionedAmount?.toLocaleString()}</p>
              <p><strong>Utilized:</strong> ₹{selectedWork?.totalUtilized?.toLocaleString()}</p>
            </div>

            <div className="form-group">
              <label>Inspection Notes *</label>
              <textarea
                value={verificationFormData.inspectionNotes}
                onChange={(e) => setVerificationFormData({...verificationFormData, inspectionNotes: e.target.value})}
                rows="4"
                required
                placeholder="Enter inspection findings, quality observations..."
              />
            </div>

            <div className="form-group">
              <label>Quality Assessment</label>
              <select
                value={verificationFormData.qualityAssessment}
                onChange={(e) => setVerificationFormData({...verificationFormData, qualityAssessment: e.target.value})}
              >
                <option>Excellent</option>
                <option>Good</option>
                <option>Satisfactory</option>
                <option>Needs Improvement</option>
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="cancel-btn" onClick={() => setIsVerificationModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="verify-submit-btn" disabled={loading}>
              {loading ? 'Verifying...' : 'Verify & Complete Work'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Work Detail Modal
  const renderWorkDetailModal = () => (
    <div className="modal-overlay">
      <div className="modal modal-large">
        <div className="modal-header">
          <h2>Work Details</h2>
          <button className="close-btn" onClick={() => setIsWorkDetailModalOpen(false)}>
            <X size={24} />
          </button>
        </div>
        {selectedWork && (
          <div className="modal-content">
            <div className="details-section">
              <h3>Basic Information</h3>
              <div className="details-grid">
                <div className="detail-item">
                  <label>Work Code</label>
                  <span>{selectedWork.workCode}</span>
                </div>
                <div className="detail-item">
                  <label>Title</label>
                  <span>{selectedWork.title}</span>
                </div>
                <div className="detail-item full-width">
                  <label>Description</label>
                  <p>{selectedWork.description || 'No description'}</p>
                </div>
                <div className="detail-item">
                  <label>Status</label>
                  <span>{selectedWork.status}</span>
                </div>
                <div className="detail-item">
                  <label>Progress</label>
                  <span>{selectedWork.progressPercentage}%</span>
                </div>
                <div className="detail-item">
                  <label>Sanctioned Amount</label>
                  <span>₹{selectedWork.sanctionedAmount?.toLocaleString()}</span>
                </div>
                <div className="detail-item">
                  <label>Utilized Amount</label>
                  <span>₹{selectedWork.totalUtilized?.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {selectedWork.stages && selectedWork.stages.length > 0 && (
              <div className="details-section">
                <h3>Stages Progress</h3>
                {selectedWork.stages.map((stage, idx) => (
                  <div key={idx} className="stage-item">
                    <div className="stage-header">
                      <span className="stage-name">{stage.name}</span>
                      <span className="stage-weightage">{stage.weightage}%</span>
                    </div>
                    <div className="progress-bar-small">
                      <div className="progress-fill" style={{ width: `${stage.progressPercentage}%` }}></div>
                    </div>
                    <div className="stage-status">{stage.status}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        <div className="modal-footer">
          <button className="cancel-btn" onClick={() => setIsWorkDetailModalOpen(false)}>
            Close
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="sachiv-container">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <h2>{sidebarCollapsed ? 'SC' : 'Sachiv'}</h2>
          <button className="collapse-btn" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
            <Menu size={20} />
          </button>
        </div>
        <nav className="sidebar-nav">
          <button className={`nav-item ${activeModule === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveModule('dashboard')}>
            <Home size={20} /> {!sidebarCollapsed && <span>Dashboard</span>}
          </button>
          <button className={`nav-item ${activeModule === 'works' ? 'active' : ''}`} onClick={() => setActiveModule('works')}>
            <Briefcase size={20} /> {!sidebarCollapsed && <span>Works</span>}
          </button>
          <button className={`nav-item ${activeModule === 'blockers' ? 'active' : ''}`} onClick={() => setActiveModule('blockers')}>
            <AlertCircle size={20} /> {!sidebarCollapsed && <span>Blockers</span>}
          </button>
          <button className={`nav-item ${activeModule === 'verification' ? 'active' : ''}`} onClick={() => setActiveModule('verification')}>
            <CheckCircle2 size={20} /> {!sidebarCollapsed && <span>Verification</span>}
          </button>
          <button className={`nav-item ${activeModule === 'profile' ? 'active' : ''}`} onClick={() => setActiveModule('profile')}>
            <User size={20} /> {!sidebarCollapsed && <span>Profile</span>}
          </button>
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
                  activeModule === 'works' ? 'Works Monitoring' : 
                  activeModule === 'blockers' ? 'Blocker Management' : 
                  activeModule === 'verification' ? 'Work Verification' : 'Profile'}</h1>
            <p>Welcome back, {user?.name} | Taluka: {user?.talukaId}</p>
          </div>
          <div className="user-info">
            <div className="notification-bell">
              <Bell size={20} />
              <span className="badge">{stats.activeBlockers + stats.pendingVerification}</span>
            </div>
            <div className="user-name">
              <User size={20} />
              <span>{user?.name?.split(' ')[0]}</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="alert error">
            <AlertCircle size={18} />
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
        {activeModule === 'works' && renderWorks()}
        {activeModule === 'blockers' && <BlockerManagement />}
        {activeModule === 'verification' && renderVerification()}
        {activeModule === 'profile' && (
          <div className="profile-card">
            <div className="profile-avatar"><User size={64} /></div>
            <div className="profile-info">
              <h3>{user?.name}</h3>
              <p>Role: Sachiv</p>
              <p>Mobile: {user?.mobileNumber}</p>
              <p>Email: {user?.email || 'Not provided'}</p>
              <p>Taluka ID: {user?.talukaId}</p>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {isBlockerDetailModalOpen && renderBlockerDetailModal()}
      {isAssignModalOpen && renderAssignModal()}
      {isResolveModalOpen && renderResolveModal()}
      {isEscalateModalOpen && renderEscalateModal()}
      {isVerificationModalOpen && renderVerificationModal()}
      {isWorkDetailModalOpen && renderWorkDetailModal()}

      <style>{`
        .sachiv-container { display: flex; min-height: 100vh; background-color: #f8fafc; }
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
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
        .stat-card { background: white; padding: 1rem; border-radius: 0.75rem; display: flex; align-items: center; gap: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-left: 4px solid; }
        .stat-icon { width: 48px; height: 48px; border-radius: 0.5rem; display: flex; align-items: center; justify-content: center; }
        .stat-info h3 { margin: 0; font-size: 1.5rem; font-weight: 700; }
        .stat-info p { margin: 0; color: #64748b; font-size: 0.8rem; }
        .quick-actions { background: white; padding: 1.5rem; border-radius: 0.75rem; margin-bottom: 2rem; }
        .quick-actions h3 { margin: 0 0 1rem 0; }
        .actions-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }
        .action-btn { display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem; background-color: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 0.5rem; cursor: pointer; transition: all 0.2s; }
        .action-btn:hover { background-color: #0ea5e9; color: white; }
        .sachiv-module { background: white; border-radius: 0.75rem; padding: 1.5rem; }
        .module-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
        .module-header h2 { margin: 0; font-size: 1.25rem; }
        .module-actions { display: flex; gap: 1rem; flex-wrap: wrap; }
        .search-box { display: flex; align-items: center; gap: 0.5rem; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 0.5rem; padding: 0.5rem 0.75rem; }
        .search-box input { border: none; background: none; outline: none; }
        .status-filter, .priority-filter { padding: 0.5rem; border: 1px solid #e2e8f0; border-radius: 0.5rem; background: white; }
        .works-table-container { overflow-x: auto; }
        .works-table { width: 100%; border-collapse: collapse; }
        .works-table th { background-color: #f8fafc; padding: 1rem; text-align: left; font-weight: 600; color: #475569; border-bottom: 1px solid #e2e8f0; }
        .works-table td { padding: 1rem; border-bottom: 1px solid #f1f5f9; }
        .work-code { font-family: monospace; font-weight: 600; color: #0ea5e9; }
        .work-title strong { display: block; margin-bottom: 0.25rem; }
        .work-title small { font-size: 0.75rem; color: #64748b; }
        .progress-cell { display: flex; align-items: center; gap: 0.5rem; }
        .progress-bar-small { flex: 1; background-color: #e2e8f0; border-radius: 9999px; height: 6px; overflow: hidden; }
        .progress-fill { background-color: #0ea5e9; height: 100%; border-radius: 9999px; }
        .status-badge { display: inline-flex; align-items: center; gap: 0.25rem; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; }
        .view-btn { display: inline-flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; background-color: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 0.5rem; cursor: pointer; font-size: 0.875rem; }
        .view-btn:hover { background-color: #0ea5e9; color: white; }
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
        .blocker-meta { display: flex; flex-wrap: wrap; gap: 1rem; margin-bottom: 1rem; padding: 0.5rem 0; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; }
        .meta-item { display: flex; align-items: center; gap: 0.25rem; font-size: 0.7rem; color: #64748b; }
        .blocker-actions { display: flex; gap: 0.5rem; }
        .view-details-btn, .assign-btn, .resolve-btn, .escalate-btn { display: flex; align-items: center; gap: 0.4rem; padding: 0.5rem; border: none; border-radius: 0.5rem; cursor: pointer; font-size: 0.75rem; flex: 1; justify-content: center; }
        .view-details-btn { background-color: #f1f5f9; color: #475569; }
        .assign-btn { background-color: #e0f2fe; color: #0284c7; }
        .resolve-btn { background-color: #dcfce7; color: #16a34a; }
        .escalate-btn { background-color: #fee2e2; color: #dc2626; }
        .verification-list { display: flex; flex-direction: column; gap: 1rem; }
        .verification-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0.75rem; padding: 1rem; }
        .verification-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
        .verification-header h3 { margin: 0; font-size: 1rem; }
        .completion-badge { padding: 0.25rem 0.75rem; background-color: #fef3c7; color: #d97706; border-radius: 9999px; font-size: 0.7rem; font-weight: 600; }
        .verification-details { margin-bottom: 1rem; }
        .detail-row { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; color: #475569; margin-bottom: 0.25rem; }
        .verify-btn { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; background-color: #10b981; color: white; border: none; border-radius: 0.5rem; cursor: pointer; font-weight: 600; }
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
        .modal { background: white; border-radius: 1rem; width: 100%; max-width: 500px; max-height: 90vh; overflow-y: auto; }
        .modal-large { max-width: 800px; }
        .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem; border-bottom: 1px solid #e2e8f0; }
        .modal-header h2 { margin: 0; }
        .close-btn { background: none; border: none; cursor: pointer; color: #64748b; }
        .modal-content { padding: 1.5rem; }
        .modal-footer { display: flex; justify-content: flex-end; gap: 1rem; padding: 1.5rem; border-top: 1px solid #e2e8f0; }
        .form-group { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1rem; }
        .form-group label { font-weight: 600; color: #334155; font-size: 0.875rem; }
        .form-group input, .form-group select, .form-group textarea { padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 0.9rem; }
        .details-section { margin-bottom: 2rem; }
        .details-section h3 { margin: 0 0 1rem 0; font-size: 1rem; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.5rem; }
        .details-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
        .detail-item { display: flex; flex-direction: column; gap: 0.25rem; }
        .detail-item.full-width { grid-column: span 2; }
        .detail-item label { font-size: 0.7rem; font-weight: 600; color: #64748b; text-transform: uppercase; }
        .priority-text.high { color: #dc2626; font-weight: 600; }
        .priority-text.medium { color: #f59e0b; font-weight: 600; }
        .priority-text.low { color: #10b981; font-weight: 600; }
        .comments-list { max-height: 300px; overflow-y: auto; margin-bottom: 1rem; }
        .comment-item { background-color: #f8fafc; padding: 0.75rem; border-radius: 0.5rem; margin-bottom: 0.5rem; }
        .comment-header { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem; font-size: 0.75rem; }
        .comment-role { color: #64748b; font-size: 0.7rem; }
        .comment-text { margin: 0; font-size: 0.875rem; color: #1e293b; }
        .add-comment { display: flex; flex-direction: column; gap: 0.5rem; }
        .add-comment textarea { padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; resize: vertical; }
        .add-comment button { display: flex; align-items: center; gap: 0.5rem; justify-content: center; padding: 0.5rem; background-color: #0ea5e9; color: white; border: none; border-radius: 0.5rem; cursor: pointer; }
        .info-box { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; background-color: #fef3c7; border-radius: 0.5rem; color: #92400e; font-size: 0.875rem; margin-top: 1rem; }
        .work-summary { background-color: #f8fafc; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1.5rem; }
        .work-summary h3 { margin: 0 0 0.5rem 0; font-size: 0.875rem; }
        .work-summary p { margin: 0.25rem 0; font-size: 0.875rem; }
        .stage-item { margin-bottom: 1rem; }
        .stage-header { display: flex; justify-content: space-between; margin-bottom: 0.25rem; font-size: 0.875rem; }
        .stage-name { font-weight: 500; }
        .stage-weightage { color: #64748b; }
        .stage-status { font-size: 0.7rem; color: #64748b; margin-top: 0.25rem; }
        .cancel-btn { padding: 0.75rem 1.5rem; border: 1px solid #d1d5db; border-radius: 0.5rem; background: white; cursor: pointer; }
        .save-btn { padding: 0.75rem 1.5rem; border: none; border-radius: 0.5rem; background: #0ea5e9; color: white; cursor: pointer; font-weight: 600; }
        .verify-submit-btn { padding: 0.75rem 1.5rem; border: none; border-radius: 0.5rem; background: #10b981; color: white; cursor: pointer; font-weight: 600; }
        .alert { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; border-radius: 0.5rem; margin-bottom: 1rem; }
        .alert.error { background-color: #fee2e2; color: #dc2626; }
        .alert.success { background-color: #dcfce7; color: #16a34a; }
        .alert button { background: none; border: none; margin-left: auto; cursor: pointer; color: inherit; }
        .empty-state { text-align: center; padding: 3rem; color: #94a3b8; }
        .empty-state svg { margin-bottom: 1rem; opacity: 0.5; }
        .profile-card { background: white; padding: 2rem; border-radius: 0.75rem; text-align: center; }
        .profile-avatar { width: 100px; height: 100px; background-color: #e2e8f0; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; color: #64748b; }
      `}</style>
    </div>
  );
};

export default SachivDashboard;