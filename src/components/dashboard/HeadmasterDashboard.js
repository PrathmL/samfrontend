import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { 
  Plus, ClipboardList, Clock, CheckCircle2, XCircle, 
  AlertTriangle, TrendingUp, Calendar, Upload, Image, 
  Eye, Edit2, Trash2, X, Filter, Search, Download,
  ChevronRight, ChevronLeft, Menu, LogOut, User,
  Home, Briefcase, AlertCircle, FileText, Settings,
  Camera, MapPin, Check, RefreshCw, Send, MessageSquare,
  DollarSign, Building2, BarChart3, Award, Minus, Bell
} from 'lucide-react';

import { useNavigate } from 'react-router-dom';
import BlockerManagement from './BlockerManagement';

const HeadmasterDashboard = () => {
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
    pendingRequests: 0,
    activeBlockers: 0,
    daysSinceLastUpdate: 0,
    budgetUtilized: 0,
    totalBudget: 0
  });

  // Work Requests
  const [workRequests, setWorkRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestFormData, setRequestFormData] = useState({
    title: '',
    description: '',
    type: 'Maintenance',
    category: 'Building',
    priority: 'Medium',
    photos: []
  });
  const [photoPreviews, setPhotoPreviews] = useState([]);

  // Active Works
  const [activeWorks, setActiveWorks] = useState([]);
  const [selectedWork, setSelectedWork] = useState(null);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const [isWorkDetailModalOpen, setIsWorkDetailModalOpen] = useState(false);
  const [progressFormData, setProgressFormData] = useState({
    workId: '',
    stageId: '',
    progressPercentage: 0,
    remarks: '',
    photos: [],
    materialCost: 0,
    laborCost: 0,
    otherCost: 0
  });
  const [workSearchTerm, setWorkSearchTerm] = useState('');
  const [workStatusFilter, setWorkStatusFilter] = useState('ALL');

  // Blockers
  const [blockers, setBlockers] = useState([]);
  const [isBlockerModalOpen, setIsBlockerModalOpen] = useState(false);
  const [blockerFormData, setBlockerFormData] = useState({
    workId: '',
    title: '',
    type: 'Material Shortage',
    priority: 'Medium',
    description: '',
    impact: '',
    estimatedDelay: 0,
    photos: []
  });

  // Completed Works for Closure
  const [worksPendingClosure, setWorksPendingClosure] = useState([]);
  const [selectedWorkForClosure, setSelectedWorkForClosure] = useState(null);
  const [isClosureModalOpen, setIsClosureModalOpen] = useState(false);
  const [closureFormData, setClosureFormData] = useState({
    completionDate: '',
    finalRemarks: '',
    qualityAssessment: 'Good',
    finalPhotos: []
  });

  useEffect(() => {
    if (user && user.schoolId) {
      fetchDashboardData();
      fetchWorkRequests();
      fetchActiveWorks();
      fetchBlockers();
      fetchWorksPendingClosure();
    }
  }, [user]);

  // Filter active works based on search and status
  const filteredActiveWorks = activeWorks.filter(work => {
    const matchesSearch = work.title?.toLowerCase().includes(workSearchTerm.toLowerCase()) ||
                          work.workCode?.toLowerCase().includes(workSearchTerm.toLowerCase());
    const matchesStatus = workStatusFilter === 'ALL' || work.status === workStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      if (!user?.schoolId) {
        setStats({
          totalWorks: 0,
          activeWorks: 0,
          completedWorks: 0,
          pendingRequests: 0,
          activeBlockers: 0,
          daysSinceLastUpdate: 0,
          budgetUtilized: 0,
          totalBudget: 0
        });
        return;
      }
      
      // Fetch works for the school
      const worksRes = await axios.get(`http://localhost:8080/api/works/school/${user.schoolId}`);
      const works = worksRes.data || [];
      
      const activeWorksCount = works.filter(w => w.status === 'ACTIVE' || w.status === 'IN_PROGRESS').length;
      const completedWorksCount = works.filter(w => w.status === 'COMPLETED' || w.status === 'PENDING_CLOSURE').length;
      
      // Fetch work requests
      const requestsRes = await axios.get(`http://localhost:8080/api/work-requests`, {
        params: { schoolId: user.schoolId }
      });
      const requests = requestsRes.data || [];
      const pendingRequests = requests.filter(r => r.status === 'PENDING_QUOTATION' || r.status === 'PENDING_APPROVAL').length;
      
      // Fetch blockers
      const blockersRes = await axios.get(`http://localhost:8080/api/blockers`, {
        params: { schoolId: user.schoolId }
      });
      const blockers = blockersRes.data || [];
      const activeBlockers = blockers.filter(b => b.status !== 'RESOLVED').length;
      
      setStats({
        totalWorks: works.length,
        activeWorks: activeWorksCount,
        completedWorks: completedWorksCount,
        pendingRequests: pendingRequests,
        activeBlockers: activeBlockers,
        daysSinceLastUpdate: calculateDaysSinceLastUpdate(works),
        budgetUtilized: works.reduce((sum, w) => sum + (w.totalUtilized || 0), 0),
        totalBudget: works.reduce((sum, w) => sum + (w.sanctionedAmount || 0), 0)
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const calculateDaysSinceLastUpdate = (works) => {
    if (!works.length) return 0;
    const lastUpdate = Math.max(...works.map(w => new Date(w.lastUpdateAt || w.createdAt).getTime()));
    const days = Math.floor((Date.now() - lastUpdate) / (1000 * 60 * 60 * 24));
    return days;
  };

  const fetchWorkRequests = async () => {
    try {
      if (!user?.schoolId) {
        setWorkRequests([]);
        return;
      }
      const res = await axios.get(`http://localhost:8080/api/work-requests`, {
        params: { schoolId: user.schoolId }
      });
      setWorkRequests(res.data || []);
    } catch (err) {
      console.error('Error fetching work requests:', err);
    }
  };

 const fetchActiveWorks = async () => {
    try {
        if (!user?.schoolId) {
            console.log('No schoolId found for user:', user);
            setActiveWorks([]);
            return;
        }
        console.log('Fetching works for schoolId:', user.schoolId);
        const res = await axios.get(`http://localhost:8080/api/works/school/${user.schoolId}`);
        console.log('All works from API:', res.data);
        
        // Log each work's status for debugging
        if (res.data && res.data.length > 0) {
            res.data.forEach(work => {
                console.log(`Work ${work.id} - Title: ${work.title}, Status: ${work.status}, ActivatedAt: ${work.activatedAt}`);
            });
        } else {
            console.log('No works found for this school');
        }
        
        // Filter works that should be visible to Headmaster
        // Include ACTIVE, IN_PROGRESS, ON_HOLD statuses
        const filtered = res.data.filter(work => {
            return work.status === 'ACTIVE' || 
                   work.status === 'IN_PROGRESS' || 
                   work.status === 'ON_HOLD' ||
                   (work.status === 'DRAFT' && work.activatedAt !== null);
        });
        
        console.log('Filtered active works:', filtered);
        setActiveWorks(filtered);
    } catch (err) {
        console.error('Error fetching active works:', err);
        setActiveWorks([]);
    }
};

  const fetchBlockers = async () => {
    try {
      if (!user?.schoolId) {
        setBlockers([]);
        return;
      }
      const res = await axios.get(`http://localhost:8080/api/blockers`, {
        params: { schoolId: user.schoolId }
      });
      setBlockers(res.data || []);
    } catch (err) {
      console.error('Error fetching blockers:', err);
    }
  };

  const fetchWorksPendingClosure = async () => {
    try {
      if (!user?.schoolId) {
        setWorksPendingClosure([]);
        return;
      }
      const res = await axios.get(`http://localhost:8080/api/works/school/${user.schoolId}`);
      const works = res.data || [];
      setWorksPendingClosure(works.filter(w => w.status === 'PENDING_CLOSURE'));
    } catch (err) {
      console.error('Error fetching works pending closure:', err);
    }
  };

  const handleCreateWorkRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', requestFormData.title);
      formDataToSend.append('description', requestFormData.description);
      formDataToSend.append('type', requestFormData.type);
      formDataToSend.append('category', requestFormData.category);
      formDataToSend.append('priority', requestFormData.priority);
      formDataToSend.append('schoolId', user.schoolId);
      formDataToSend.append('createdById', user.id);
      
      requestFormData.photos.forEach((photo, index) => {
        formDataToSend.append('photos', photo);
      });
      
      await axios.post('http://localhost:8080/api/work-requests', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setSuccess('Work request created successfully');
      setIsRequestModalOpen(false);
      resetRequestForm();
      fetchWorkRequests();
      fetchDashboardData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to create work request');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProgress = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('workId', progressFormData.workId);
      formDataToSend.append('stageId', progressFormData.stageId);
      formDataToSend.append('progressPercentage', progressFormData.progressPercentage);
      formDataToSend.append('remarks', progressFormData.remarks);
      formDataToSend.append('materialCost', progressFormData.materialCost);
      formDataToSend.append('laborCost', progressFormData.laborCost);
      formDataToSend.append('otherCost', progressFormData.otherCost);
      formDataToSend.append('updatedById', user.id);
      formDataToSend.append('updatedByRole', 'HEADMASTER');
      
      progressFormData.photos.forEach((photo, index) => {
        formDataToSend.append('photos', photo);
      });
      
      await axios.post('http://localhost:8080/api/works/progress', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setSuccess('Work progress updated successfully');
      setIsProgressModalOpen(false);
      setIsWorkDetailModalOpen(false);
      resetProgressForm();
      fetchActiveWorks();
      fetchDashboardData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update progress');
    } finally {
      setLoading(false);
    }
  };

  const handleViewWorkDetails = (work) => {
    setSelectedWork(work);
    setIsWorkDetailModalOpen(true);
  };

  const handleReportBlocker = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:8080/api/blockers', {
        ...blockerFormData,
        schoolId: user.schoolId,
        reportedById: user.id,
        reportedByRole: 'HEADMASTER'
      });
      
      setSuccess('Blocker reported successfully');
      setIsBlockerModalOpen(false);
      resetBlockerForm();
      fetchBlockers();
      fetchDashboardData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to report blocker');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkWorkComplete = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`http://localhost:8080/api/works/${selectedWorkForClosure.id}/mark-complete`, {
        completionDate: closureFormData.completionDate,
        finalRemarks: closureFormData.finalRemarks,
        qualityAssessment: closureFormData.qualityAssessment
      });
      
      setSuccess('Work marked as complete. Awaiting Sachiv verification.');
      setIsClosureModalOpen(false);
      resetClosureForm();
      fetchWorksPendingClosure();
      fetchActiveWorks();
      fetchDashboardData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to mark work as complete');
    } finally {
      setLoading(false);
    }
  };

  const resetRequestForm = () => {
    setRequestFormData({
      title: '',
      description: '',
      type: 'Maintenance',
      category: 'Building',
      priority: 'Medium',
      photos: []
    });
    setPhotoPreviews([]);
  };

  const resetProgressForm = () => {
    setProgressFormData({
      workId: '',
      stageId: '',
      progressPercentage: 0,
      remarks: '',
      photos: [],
      materialCost: 0,
      laborCost: 0,
      otherCost: 0
    });
  };

  const resetBlockerForm = () => {
    setBlockerFormData({
      workId: '',
      title: '',
      type: 'Material Shortage',
      priority: 'Medium',
      description: '',
      impact: '',
      estimatedDelay: 0,
      photos: []
    });
  };

  const resetClosureForm = () => {
    setClosureFormData({
      completionDate: new Date().toISOString().split('T')[0],
      finalRemarks: '',
      qualityAssessment: 'Good',
      finalPhotos: []
    });
  };

  const handlePhotoUpload = (e, setter, previewSetter) => {
    const files = Array.from(e.target.files);
    setter(prev => [...prev, ...files]);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        previewSetter(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'Urgent': return '#ef4444';
      case 'High': return '#f97316';
      case 'Medium': return '#eab308';
      default: return '#10b981';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'ACTIVE':
      case 'IN_PROGRESS':
        return { bg: '#dcfce7', text: '#166534', icon: CheckCircle2 };
      case 'ON_HOLD':
        return { bg: '#fef3c7', text: '#92400e', icon: Clock };
      case 'COMPLETED':
        return { bg: '#dbeafe', text: '#1e40af', icon: CheckCircle2 };
      case 'PENDING_CLOSURE':
        return { bg: '#fef3c7', text: '#d97706', icon: AlertTriangle };
      default:
        return { bg: '#f1f5f9', text: '#475569', icon: Briefcase };
    }
  };

  // Dashboard View
  const renderDashboard = () => (
    <div className="hm-dashboard">
      <div className="stats-grid-hm">
        <div className="stat-card-hm">
          <div className="stat-icon-hm" style={{ backgroundColor: '#e0f2fe', color: '#0284c7' }}>
            <Briefcase size={24} />
          </div>
          <div className="stat-content-hm">
            <h3>{stats.totalWorks}</h3>
            <p>Total Works</p>
          </div>
        </div>
        <div className="stat-card-hm">
          <div className="stat-icon-hm" style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>
            <CheckCircle2 size={24} />
          </div>
          <div className="stat-content-hm">
            <h3>{stats.completedWorks}</h3>
            <p>Completed</p>
          </div>
        </div>
        <div className="stat-card-hm">
          <div className="stat-icon-hm" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
            <Clock size={24} />
          </div>
          <div className="stat-content-hm">
            <h3>{stats.activeWorks}</h3>
            <p>In Progress</p>
          </div>
        </div>
        <div className="stat-card-hm">
          <div className="stat-icon-hm" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
            <AlertTriangle size={24} />
          </div>
          <div className="stat-content-hm">
            <h3>{stats.activeBlockers}</h3>
            <p>Active Blockers</p>
          </div>
        </div>
        <div className="stat-card-hm">
          <div className="stat-icon-hm" style={{ backgroundColor: '#e0e7ff', color: '#4f46e5' }}>
            <DollarSign size={24} />
          </div>
          <div className="stat-content-hm">
            <h3>{((stats.budgetUtilized / stats.totalBudget) * 100 || 0).toFixed(0)}%</h3>
            <p>Budget Utilized</p>
          </div>
        </div>
        <div className="stat-card-hm">
          <div className="stat-icon-hm" style={{ backgroundColor: '#fce7f3', color: '#db2777' }}>
            <Calendar size={24} />
          </div>
          <div className="stat-content-hm">
            <h3>{stats.daysSinceLastUpdate}</h3>
            <p>Days Since Update</p>
          </div>
        </div>
      </div>

      <div className="quick-actions-hm">
        <h3>Quick Actions</h3>
        <div className="actions-grid-hm">
          <button className="action-btn-hm" onClick={() => setIsRequestModalOpen(true)}>
            <Plus size={20} /> Create Work Request
          </button>
          <button className="action-btn-hm" onClick={() => setActiveModule('active-works')}>
            <RefreshCw size={20} /> Update Progress
          </button>
          <button className="action-btn-hm" onClick={() => setIsBlockerModalOpen(true)}>
            <AlertTriangle size={20} /> Report Blocker
          </button>
          <button className="action-btn-hm" onClick={() => setActiveModule('active-works')}>
            <Eye size={20} /> View All Works
          </button>
        </div>
      </div>

      <div className="recent-activity-hm">
        <h3>Recent Activity</h3>
        <div className="activity-list">
          {workRequests.slice(0, 5).map(request => (
            <div key={request.id} className="activity-item">
              <div className="activity-icon"><FileText size={16} /></div>
              <div className="activity-content">
                <p><strong>{request.title}</strong> - {request.status?.replace('_', ' ')}</p>
                <small>{new Date(request.createdAt).toLocaleDateString()}</small>
              </div>
            </div>
          ))}
          {workRequests.length === 0 && <p className="no-activity">No recent activity</p>}
        </div>
      </div>
    </div>
  );

  // Work Requests View
  const renderWorkRequests = () => (
    <div className="hm-module">
      <div className="module-header">
        <h2>Work Requests</h2>
        <button className="create-btn" onClick={() => setIsRequestModalOpen(true)}>
          <Plus size={18} /> New Request
        </button>
      </div>
      <div className="requests-list">
        {workRequests.map(request => {
          const statusStyle = getStatusColor(request.status);
          return (
            <div key={request.id} className="request-card">
              <div className="request-header">
                <h3>{request.title}</h3>
                <span className="priority-badge" style={{ backgroundColor: getPriorityColor(request.priority) + '20', color: getPriorityColor(request.priority) }}>
                  {request.priority}
                </span>
              </div>
              <p className="request-desc">{request.description}</p>
              <div className="request-meta">
                <span>Type: {request.type}</span>
                <span>Created: {new Date(request.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="request-footer">
                <span className="status-badge" style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}>
                  {request.status?.replace('_', ' ')}
                </span>
              </div>
            </div>
          );
        })}
        {workRequests.length === 0 && (
          <div className="empty-state-hm">
            <FileText size={48} />
            <p>No work requests yet. Create your first request!</p>
          </div>
        )}
      </div>
    </div>
  );

  // Active Works View
  const renderActiveWorks = () => (
    <div className="hm-module">
      <div className="module-header">
        <h2>Active Works</h2>
        <div className="module-actions">
          <div className="search-box-small">
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
          </select>
        </div>
      </div>

      <div className="works-grid">
        {filteredActiveWorks.map(work => {
          const statusStyle = getStatusColor(work.status);
          const StatusIcon = statusStyle.icon;
          return (
            <div key={work.id} className="work-card">
              <div className="work-header">
                <div>
                  <h3>{work.title}</h3>
                  <span className="work-code">{work.workCode}</span>
                </div>
                <span className={`status-badge ${work.status?.toLowerCase()}`} style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}>
                  <StatusIcon size={12} />
                  {work.status?.replace('_', ' ')}
                </span>
              </div>
              
              <div className="work-progress">
                <div className="progress-label">
                  <span>Progress</span>
                  <span className="progress-value">{work.progressPercentage}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${work.progressPercentage}%` }}></div>
                </div>
              </div>
              
              <div className="work-details">
                <div className="detail-row">
                  <DollarSign size={14} />
                  <span>Budget: ₹{work.sanctionedAmount?.toLocaleString()}</span>
                </div>
                <div className="detail-row">
                  <Clock size={14} />
                  <span>Utilized: ₹{work.totalUtilized?.toLocaleString()}</span>
                </div>
                <div className="detail-row">
                  <Calendar size={14} />
                  <span>Last Update: {work.lastUpdateAt ? new Date(work.lastUpdateAt).toLocaleDateString() : 'Not updated'}</span>
                </div>
              </div>
              
              {work.stages && work.stages.length > 0 && (
                <div className="stages-preview">
                  <small>Stages:</small>
                  <div className="stage-chips">
                    {work.stages.slice(0, 3).map((stage, idx) => (
                      <span key={idx} className={`stage-chip ${stage.status?.toLowerCase()}`}>
                        {stage.name} ({stage.progressPercentage}%)
                      </span>
                    ))}
                    {work.stages.length > 3 && <span className="stage-chip">+{work.stages.length - 3}</span>}
                  </div>
                </div>
              )}
              
              <div className="work-actions">
                <button className="view-details-btn" onClick={() => handleViewWorkDetails(work)}>
                  <Eye size={16} /> View Details
                </button>
                <button className="update-progress-btn" onClick={() => {
                  setProgressFormData({ ...progressFormData, workId: work.id });
                  setIsProgressModalOpen(true);
                }}>
                  <RefreshCw size={16} /> Update Progress
                </button>
                <button className="report-blocker-btn" onClick={() => {
                  setBlockerFormData({ ...blockerFormData, workId: work.id });
                  setIsBlockerModalOpen(true);
                }}>
                  <AlertTriangle size={16} /> Report Blocker
                </button>
              </div>
            </div>
          );
        })}
        
        {filteredActiveWorks.length === 0 && (
          <div className="empty-state-hm">
            <Briefcase size={48} />
            <p>No active works found. Works created by admin will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );

  // Work Details Modal
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
                  <span className="work-code-large">{selectedWork.workCode}</span>
                </div>
                <div className="detail-item">
                  <label>Title</label>
                  <span>{selectedWork.title}</span>
                </div>
                <div className="detail-item full-width">
                  <label>Description</label>
                  <p>{selectedWork.description || 'No description provided'}</p>
                </div>
                <div className="detail-item">
                  <label>Type</label>
                  <span>{selectedWork.type || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <label>Status</label>
                  <span className="status-badge-large">{selectedWork.status}</span>
                </div>
                <div className="detail-item">
                  <label>Sanctioned Amount</label>
                  <span className="amount">₹{selectedWork.sanctionedAmount?.toLocaleString()}</span>
                </div>
                <div className="detail-item">
                  <label>Total Utilized</label>
                  <span className="amount">₹{selectedWork.totalUtilized?.toLocaleString()}</span>
                </div>
                <div className="detail-item">
                  <label>Created Date</label>
                  <span>{new Date(selectedWork.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="detail-item">
                  <label>Activated Date</label>
                  <span>{selectedWork.activatedAt ? new Date(selectedWork.activatedAt).toLocaleDateString() : 'Not activated'}</span>
                </div>
              </div>
            </div>

            {selectedWork.stages && selectedWork.stages.length > 0 && (
              <div className="details-section">
                <h3>Stages Progress</h3>
                <div className="stages-list">
                  {selectedWork.stages.map((stage, idx) => (
                    <div key={idx} className="stage-progress-item">
                      <div className="stage-info">
                        <span className="stage-name">{stage.name}</span>
                        <span className="stage-weightage">{stage.weightage}%</span>
                      </div>
                      <div className="progress-bar-small">
                        <div className="progress-fill" style={{ width: `${stage.progressPercentage}%` }}></div>
                      </div>
                      <div className="stage-status">
                        <span className={`stage-status-badge ${stage.status?.toLowerCase()}`}>
                          {stage.status || 'Pending'}
                        </span>
                        {stage.remarks && <small>{stage.remarks}</small>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedWork.progressUpdates && selectedWork.progressUpdates.length > 0 && (
              <div className="details-section">
                <h3>Progress History</h3>
                <div className="updates-list">
                  {selectedWork.progressUpdates.slice(0, 5).map((update, idx) => (
                    <div key={idx} className="update-item">
                      <div className="update-header">
                        <span className="update-date">{new Date(update.updatedAt).toLocaleString()}</span>
                        <span className="update-progress">Progress: {update.progressPercentage}%</span>
                      </div>
                      <p className="update-remarks">{update.remarks}</p>
                      <div className="update-costs">
                        <span>Material: ₹{update.materialCost?.toLocaleString()}</span>
                        <span>Labor: ₹{update.laborCost?.toLocaleString()}</span>
                        <span>Other: ₹{update.otherCost?.toLocaleString()}</span>
                      </div>
                      {update.photoUrls && update.photoUrls.length > 0 && (
                        <div className="update-photos">
                          {update.photoUrls.slice(0, 3).map((url, i) => (
                            <img key={i} src={`http://localhost:8080${url}`} alt={`Update ${idx} photo ${i}`} />
                          ))}
                          {update.photoUrls.length > 3 && <span>+{update.photoUrls.length - 3}</span>}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setIsWorkDetailModalOpen(false)}>
                Close
              </button>
              <button className="update-progress-btn" onClick={() => {
                setIsWorkDetailModalOpen(false);
                setProgressFormData({ ...progressFormData, workId: selectedWork.id });
                setIsProgressModalOpen(true);
              }}>
                <RefreshCw size={18} /> Update Progress
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Progress Update Modal
  const renderProgressModal = () => (
    <div className="modal-overlay">
      <div className="modal modal-large">
        <div className="modal-header">
          <h2>Update Work Progress</h2>
          <button className="close-btn" onClick={() => setIsProgressModalOpen(false)}>
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleUpdateProgress}>
          <div className="modal-content">
            <div className="form-group">
              <label>Select Work *</label>
              <select
                value={progressFormData.workId}
                onChange={(e) => {
                  const workId = e.target.value;
                  setProgressFormData({...progressFormData, workId: workId});
                  const work = activeWorks.find(w => w.id === parseInt(workId));
                  if (work) setSelectedWork(work);
                }}
                required
              >
                <option value="">Select Work</option>
                {activeWorks.map(work => (
                  <option key={work.id} value={work.id}>{work.title} ({work.workCode})</option>
                ))}
              </select>
            </div>

            {selectedWork && selectedWork.stages && (
              <div className="form-group">
                <label>Select Stage (Optional)</label>
                <select
                  value={progressFormData.stageId}
                  onChange={(e) => setProgressFormData({...progressFormData, stageId: e.target.value})}
                >
                  <option value="">Update Overall Progress</option>
                  {selectedWork.stages.map(stage => (
                    <option key={stage.id} value={stage.id}>
                      {stage.name} - Current: {stage.progressPercentage}% (Weight: {stage.weightage}%)
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="form-group">
              <label>Progress Percentage *</label>
              <input
                type="number"
                min="0"
                max="100"
                value={progressFormData.progressPercentage}
                onChange={(e) => setProgressFormData({...progressFormData, progressPercentage: e.target.value})}
                required
              />
              <small>Enter overall work progress percentage (0-100)</small>
            </div>

            <div className="form-group">
              <label>Remarks *</label>
              <textarea
                value={progressFormData.remarks}
                onChange={(e) => setProgressFormData({...progressFormData, remarks: e.target.value})}
                rows="3"
                placeholder="Describe what has been completed, any challenges faced, next steps..."
                required
              />
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label>Material Cost (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={progressFormData.materialCost}
                  onChange={(e) => setProgressFormData({...progressFormData, materialCost: e.target.value})}
                  placeholder="0.00"
                />
              </div>
              <div className="form-group">
                <label>Labor Cost (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={progressFormData.laborCost}
                  onChange={(e) => setProgressFormData({...progressFormData, laborCost: e.target.value})}
                  placeholder="0.00"
                />
              </div>
              <div className="form-group">
                <label>Other Costs (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={progressFormData.otherCost}
                  onChange={(e) => setProgressFormData({...progressFormData, otherCost: e.target.value})}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Photos (Mandatory - Min 2)</label>
              <input
                type="file"
                accept="image/*"
                multiple
                required
                onChange={(e) => handlePhotoUpload(e,
                  (files) => setProgressFormData({...progressFormData, photos: [...progressFormData.photos, ...files]}),
                  () => {}
                )}
              />
              <small>Upload photos showing work progress from different angles</small>
              {progressFormData.photos.length > 0 && (
                <div className="photo-count">
                  <Camera size={14} />
                  <span>{progressFormData.photos.length} photo(s) selected</span>
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="cancel-btn" onClick={() => setIsProgressModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="save-btn" disabled={loading}>
              {loading ? 'Updating...' : 'Update Progress'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Blocker Modal
  const renderBlockerModal = () => (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Report a Blocker</h2>
          <button className="close-btn" onClick={() => setIsBlockerModalOpen(false)}>
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleReportBlocker}>
          <div className="modal-content">
            <div className="form-group">
              <label>Affected Work *</label>
              <select
                value={blockerFormData.workId}
                onChange={(e) => setBlockerFormData({...blockerFormData, workId: e.target.value})}
                required
              >
                <option value="">Select Work</option>
                {activeWorks.map(work => (
                  <option key={work.id} value={work.id}>{work.title} ({work.workCode})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Blocker Title *</label>
              <input
                type="text"
                value={blockerFormData.title}
                onChange={(e) => setBlockerFormData({...blockerFormData, title: e.target.value})}
                required
                placeholder="Brief title for the blocker"
              />
            </div>
            <div className="form-group">
              <label>Blocker Type *</label>
              <select value={blockerFormData.type} onChange={(e) => setBlockerFormData({...blockerFormData, type: e.target.value})}>
                <option>Material Shortage</option>
                <option>Labor Availability</option>
                <option>Fund Issues</option>
                <option>Administrative Delay</option>
                <option>Technical Issue</option>
                <option>Weather/Seasonal</option>
                <option>Contractor Issue</option>
                <option>Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Priority *</label>
              <select value={blockerFormData.priority} onChange={(e) => setBlockerFormData({...blockerFormData, priority: e.target.value})}>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>
            <div className="form-group">
              <label>Description *</label>
              <textarea
                value={blockerFormData.description}
                onChange={(e) => setBlockerFormData({...blockerFormData, description: e.target.value})}
                rows="3"
                required
                placeholder="Describe the blocker in detail"
              />
            </div>
            <div className="form-group">
              <label>Impact on Work</label>
              <input
                type="text"
                value={blockerFormData.impact}
                onChange={(e) => setBlockerFormData({...blockerFormData, impact: e.target.value})}
                placeholder="e.g., Work stopped, 5 days delay"
              />
            </div>
            <div className="form-group">
              <label>Estimated Delay (Days)</label>
              <input
                type="number"
                value={blockerFormData.estimatedDelay}
                onChange={(e) => setBlockerFormData({...blockerFormData, estimatedDelay: e.target.value})}
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="cancel-btn" onClick={() => setIsBlockerModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="save-btn" disabled={loading}>
              {loading ? 'Reporting...' : 'Report Blocker'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Profile View
  const renderProfile = () => (
    <div className="hm-module">
      <div className="module-header">
        <h2>My Profile</h2>
      </div>
      <div className="profile-card">
        <div className="profile-avatar">
          <User size={64} />
        </div>
        <div className="profile-info">
          <h3>{user?.name}</h3>
          <p>Role: Head Master</p>
          <p>Mobile: {user?.mobileNumber}</p>
          <p>Email: {user?.email || 'Not provided'}</p>
          <p>School ID: {user?.schoolId}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="headmaster-container">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <h2>{sidebarCollapsed ? 'HM' : 'Head Master'}</h2>
          <button className="collapse-btn" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
            <Menu size={20} />
          </button>
        </div>
        <nav className="sidebar-nav">
          <button className={`nav-item ${activeModule === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveModule('dashboard')}>
            <Home size={20} /> {!sidebarCollapsed && <span>Dashboard</span>}
          </button>
          <button className={`nav-item ${activeModule === 'requests' ? 'active' : ''}`} onClick={() => setActiveModule('requests')}>
            <FileText size={20} /> {!sidebarCollapsed && <span>Work Requests</span>}
          </button>
          <button className={`nav-item ${activeModule === 'active-works' ? 'active' : ''}`} onClick={() => setActiveModule('active-works')}>
            <Briefcase size={20} /> {!sidebarCollapsed && <span>Active Works</span>}
          </button>
          <button className={`nav-item ${activeModule === 'blockers' ? 'active' : ''}`} onClick={() => setActiveModule('blockers')}>
            <AlertCircle size={20} /> {!sidebarCollapsed && <span>Blockers</span>}
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
                  activeModule === 'requests' ? 'Work Requests' : 
                  activeModule === 'active-works' ? 'Active Works' : 
                  activeModule === 'blockers' ? 'Blockers' : 'Profile'}</h1>
            <p>Welcome back, {user?.name}</p>
          </div>
          <div className="user-info">
            <div className="notification-bell">
              <Bell size={20} />
              <span className="badge">{stats.pendingRequests}</span>
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
        {activeModule === 'requests' && renderWorkRequests()}
        {activeModule === 'active-works' && renderActiveWorks()}
        {activeModule === 'blockers' && <BlockerManagement />}
        {activeModule === 'profile' && renderProfile()}
      </div>

      {/* Modals */}
      {isRequestModalOpen && (
        <div className="modal-overlay">
          <div className="modal modal-lg">
            <div className="modal-header">
              <h2>Create Work Request</h2>
              <button className="close-btn" onClick={() => setIsRequestModalOpen(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleCreateWorkRequest}>
              <div className="modal-content">
                <div className="form-group full-width">
                  <label>Work Title *</label>
                  <input type="text" value={requestFormData.title} onChange={(e) => setRequestFormData({...requestFormData, title: e.target.value})} required />
                </div>
                <div className="form-group full-width">
                  <label>Description *</label>
                  <textarea value={requestFormData.description} onChange={(e) => setRequestFormData({...requestFormData, description: e.target.value})} rows="4" required />
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Work Type</label>
                    <select value={requestFormData.type} onChange={(e) => setRequestFormData({...requestFormData, type: e.target.value})}>
                      <option>Maintenance</option><option>Repair</option><option>New Construction</option><option>Renovation</option><option>Emergency</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <select value={requestFormData.category} onChange={(e) => setRequestFormData({...requestFormData, category: e.target.value})}>
                      <option>Building</option><option>Electrical</option><option>Plumbing</option><option>Painting</option><option>Furniture</option><option>Sanitation</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Priority</label>
                    <select value={requestFormData.priority} onChange={(e) => setRequestFormData({...requestFormData, priority: e.target.value})}>
                      <option>Low</option><option>Medium</option><option>High</option><option>Urgent</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Photos (Optional)</label>
                    <input type="file" accept="image/*" multiple onChange={(e) => handlePhotoUpload(e, 
                      (files) => setRequestFormData({...requestFormData, photos: [...requestFormData.photos, ...files]}),
                      setPhotoPreviews
                    )} />
                    {photoPreviews.length > 0 && (
                      <div className="photo-previews">
                        {photoPreviews.map((preview, idx) => <img key={idx} src={preview} alt="Preview" />)}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="cancel-btn" onClick={() => setIsRequestModalOpen(false)}>Cancel</button>
                <button type="submit" className="save-btn" disabled={loading}>{loading ? 'Submitting...' : 'Submit Request'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isWorkDetailModalOpen && renderWorkDetailModal()}
      {isProgressModalOpen && renderProgressModal()}
      {isBlockerModalOpen && renderBlockerModal()}

      <style>{`
        .headmaster-container { display: flex; min-height: 100vh; background-color: #f8fafc; }
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
        .stats-grid-hm { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
        .stat-card-hm { background: white; padding: 1rem; border-radius: 0.75rem; display: flex; align-items: center; gap: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .stat-icon-hm { width: 48px; height: 48px; border-radius: 0.5rem; display: flex; align-items: center; justify-content: center; }
        .stat-content-hm h3 { margin: 0; font-size: 1.5rem; font-weight: 700; }
        .stat-content-hm p { margin: 0; color: #64748b; font-size: 0.8rem; }
        .quick-actions-hm { background: white; padding: 1.5rem; border-radius: 0.75rem; margin-bottom: 2rem; }
        .quick-actions-hm h3 { margin: 0 0 1rem 0; }
        .actions-grid-hm { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }
        .action-btn-hm { display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem; background-color: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 0.5rem; cursor: pointer; transition: all 0.2s; }
        .action-btn-hm:hover { background-color: #0ea5e9; color: white; }
        .recent-activity-hm { background: white; padding: 1.5rem; border-radius: 0.75rem; }
        .recent-activity-hm h3 { margin: 0 0 1rem 0; }
        .activity-list { display: flex; flex-direction: column; gap: 0.75rem; }
        .activity-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.5rem; border-bottom: 1px solid #f1f5f9; }
        .activity-icon { width: 28px; height: 28px; background-color: #e0f2fe; border-radius: 0.5rem; display: flex; align-items: center; justify-content: center; color: #0284c7; }
        .activity-content { flex: 1; }
        .activity-content p { margin: 0; font-size: 0.875rem; }
        .activity-content small { color: #94a3b8; font-size: 0.7rem; }
        .no-activity { text-align: center; color: #94a3b8; padding: 2rem; }
        .hm-module { background: white; border-radius: 0.75rem; padding: 1.5rem; }
        .module-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; flex-wrap: wrap; gap: 1rem; }
        .module-header h2 { margin: 0; font-size: 1.25rem; }
        .module-actions { display: flex; gap: 1rem; }
        .create-btn { display: flex; align-items: center; gap: 0.5rem; background-color: #0ea5e9; color: white; border: none; padding: 0.6rem 1.2rem; border-radius: 0.5rem; cursor: pointer; font-weight: 600; }
        .search-box-small { display: flex; align-items: center; gap: 0.5rem; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 0.5rem; padding: 0.5rem 0.75rem; }
        .search-box-small input { border: none; background: none; outline: none; }
        .status-filter { padding: 0.5rem; border: 1px solid #e2e8f0; border-radius: 0.5rem; background: white; }
        .works-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 1.5rem; }
        .work-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0.75rem; padding: 1rem; transition: all 0.2s; }
        .work-card:hover { box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
        .work-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; }
        .work-header h3 { margin: 0; font-size: 1rem; }
        .work-code { font-size: 0.7rem; color: #64748b; font-family: monospace; }
        .status-badge { display: inline-flex; align-items: center; gap: 0.25rem; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.7rem; font-weight: 600; }
        .work-progress { margin: 1rem 0; }
        .progress-label { display: flex; justify-content: space-between; font-size: 0.75rem; margin-bottom: 0.25rem; }
        .progress-value { font-weight: 600; color: #0ea5e9; }
        .progress-bar { background-color: #e2e8f0; border-radius: 9999px; height: 8px; overflow: hidden; }
        .progress-fill { background-color: #0ea5e9; height: 100%; border-radius: 9999px; transition: width 0.3s; }
        .work-details { margin: 0.75rem 0; padding: 0.5rem 0; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; }
        .detail-row { display: flex; align-items: center; gap: 0.5rem; font-size: 0.75rem; color: #475569; margin-bottom: 0.25rem; }
        .stages-preview { margin: 0.5rem 0; }
        .stages-preview small { font-size: 0.7rem; color: #64748b; }
        .stage-chips { display: flex; flex-wrap: wrap; gap: 0.25rem; margin-top: 0.25rem; }
        .stage-chip { font-size: 0.65rem; padding: 0.2rem 0.5rem; background-color: #e2e8f0; border-radius: 9999px; color: #334155; }
        .stage-chip.completed { background-color: #dcfce7; color: #166534; }
        .stage-chip.in_progress { background-color: #fef3c7; color: #92400e; }
        .work-actions { display: flex; gap: 0.5rem; margin-top: 1rem; }
        .view-details-btn, .update-progress-btn, .report-blocker-btn { display: flex; align-items: center; gap: 0.4rem; padding: 0.5rem; border: none; border-radius: 0.5rem; cursor: pointer; font-size: 0.75rem; flex: 1; justify-content: center; }
        .view-details-btn { background-color: #f1f5f9; color: #475569; }
        .update-progress-btn { background-color: #0ea5e9; color: white; }
        .report-blocker-btn { background-color: #fee2e2; color: #dc2626; }
        .empty-state-hm { text-align: center; padding: 3rem; color: #94a3b8; }
        .empty-state-hm svg { margin-bottom: 1rem; opacity: 0.5; }
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
        .modal { background: white; border-radius: 1rem; width: 100%; max-width: 500px; max-height: 90vh; overflow-y: auto; }
        .modal-large { max-width: 800px; }
        .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem; border-bottom: 1px solid #e2e8f0; }
        .modal-header h2 { margin: 0; }
        .close-btn { background: none; border: none; cursor: pointer; color: #64748b; }
        .modal-content { padding: 1.5rem; }
        .modal-footer { display: flex; justify-content: flex-end; gap: 1rem; padding: 1.5rem; border-top: 1px solid #e2e8f0; }
        .form-group { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1rem; }
        .form-group.full-width { grid-column: span 2; }
        .form-group label { font-weight: 600; color: #334155; font-size: 0.875rem; }
        .form-group input, .form-group select, .form-group textarea { padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 0.9rem; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .details-section { margin-bottom: 2rem; }
        .details-section h3 { margin: 0 0 1rem 0; font-size: 1rem; border-bottom: 2px solid #e2e8f0; padding-bottom: 0.5rem; }
        .details-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem; }
        .detail-item { display: flex; flex-direction: column; gap: 0.25rem; }
        .detail-item.full-width { grid-column: span 2; }
        .detail-item label { font-size: 0.7rem; font-weight: 600; color: #64748b; text-transform: uppercase; }
        .detail-item span, .detail-item p { font-size: 0.9rem; color: #1e293b; }
        .stages-list { display: flex; flex-direction: column; gap: 1rem; }
        .stage-progress-item { padding: 0.75rem; background-color: #f8fafc; border-radius: 0.5rem; }
        .stage-info { display: flex; justify-content: space-between; margin-bottom: 0.5rem; }
        .stage-name { font-weight: 600; }
        .stage-weightage { font-size: 0.75rem; color: #64748b; }
        .progress-bar-small { background-color: #e2e8f0; border-radius: 9999px; height: 6px; overflow: hidden; margin: 0.5rem 0; }
        .stage-status-badge { display: inline-block; padding: 0.2rem 0.5rem; border-radius: 9999px; font-size: 0.7rem; }
        .stage-status-badge.completed { background-color: #dcfce7; color: #166534; }
        .stage-status-badge.in_progress { background-color: #fef3c7; color: #d97706; }
        .updates-list { display: flex; flex-direction: column; gap: 1rem; }
        .update-item { padding: 1rem; background-color: #f8fafc; border-radius: 0.5rem; }
        .update-header { display: flex; justify-content: space-between; margin-bottom: 0.5rem; font-size: 0.75rem; }
        .update-date { color: #64748b; }
        .update-progress { font-weight: 600; color: #0ea5e9; }
        .update-remarks { margin: 0.5rem 0; font-size: 0.875rem; }
        .update-costs { display: flex; gap: 1rem; font-size: 0.7rem; color: #64748b; margin: 0.5rem 0; }
        .update-photos { display: flex; gap: 0.5rem; margin-top: 0.5rem; }
        .update-photos img { width: 60px; height: 60px; object-fit: cover; border-radius: 0.25rem; }
        .photo-count { display: flex; align-items: center; gap: 0.5rem; font-size: 0.75rem; color: #64748b; margin-top: 0.5rem; }
        .cancel-btn { padding: 0.75rem 1.5rem; border: 1px solid #d1d5db; border-radius: 0.5rem; background: white; cursor: pointer; }
        .save-btn { padding: 0.75rem 1.5rem; border: none; border-radius: 0.5rem; background: #0ea5e9; color: white; cursor: pointer; font-weight: 600; }
        .save-btn:disabled { background-color: #93c5fd; cursor: not-allowed; }
        .alert { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; border-radius: 0.5rem; margin-bottom: 1rem; }
        .alert.error { background-color: #fee2e2; color: #dc2626; }
        .alert.success { background-color: #dcfce7; color: #16a34a; }
        .alert button { background: none; border: none; margin-left: auto; cursor: pointer; color: inherit; }
        .photo-previews { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.5rem; }
        .photo-previews img { width: 80px; height: 80px; object-fit: cover; border-radius: 0.5rem; }
        .profile-card { background: #f8fafc; padding: 2rem; border-radius: 0.75rem; text-align: center; }
        .profile-avatar { width: 100px; height: 100px; background-color: #e2e8f0; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; color: #64748b; }
        .profile-info h3 { margin: 0 0 0.5rem 0; }
        .profile-info p { margin: 0.25rem 0; color: #475569; }
        .priority-tag { padding: 0.2rem 0.6rem; border-radius: 9999px; font-size: 0.7rem; font-weight: 600; }
        .priority-tag.high, .priority-tag.urgent { background-color: #fee2e2; color: #dc2626; }
        .priority-tag.medium { background-color: #fef3c7; color: #d97706; }
        .priority-tag.low { background-color: #dcfce7; color: #16a34a; }
        .blocker-card { background: #f8fafc; padding: 1rem; border-radius: 0.75rem; border: 1px solid #e2e8f0; margin-bottom: 1rem; }
        .blocker-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
        .blocker-header h3 { margin: 0; font-size: 1rem; }
        .blocker-desc { color: #475569; font-size: 0.875rem; margin-bottom: 0.5rem; }
        .blocker-meta { display: flex; gap: 1rem; font-size: 0.75rem; color: #64748b; }
        .requests-list { display: flex; flex-direction: column; gap: 1rem; }
        .request-card { background: #f8fafc; padding: 1rem; border-radius: 0.75rem; border: 1px solid #e2e8f0; }
        .request-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
        .request-header h3 { margin: 0; font-size: 1rem; }
        .request-desc { color: #475569; font-size: 0.875rem; margin-bottom: 0.5rem; }
        .request-meta { display: flex; gap: 1rem; font-size: 0.75rem; color: #64748b; margin-bottom: 0.75rem; }
        .request-footer { display: flex; justify-content: space-between; align-items: center; }
        .priority-badge { padding: 0.2rem 0.6rem; border-radius: 9999px; font-size: 0.7rem; font-weight: 600; }
      `}</style>
    </div>
  );
};

export default HeadmasterDashboard;