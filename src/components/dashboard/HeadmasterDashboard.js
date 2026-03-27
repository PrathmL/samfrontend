import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { 
  Plus, ClipboardList, Clock, CheckCircle2, XCircle, 
  AlertTriangle, TrendingUp, Calendar, Upload, Image, 
  Eye, Edit2, Trash2, X, Filter, Search, Download,
  ChevronRight, ChevronLeft, Star, Building2, 
  IndianRupee, Activity, Bell, Menu, LogOut, User,
  Home, Briefcase, AlertCircle, FileText, Settings,
  Camera, MapPin, Check, RefreshCw, Send, MessageSquare
} from 'lucide-react';

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

  // Update the useEffect to check if user exists
  useEffect(() => {
    if (user && user.id) {
        fetchDashboardData();
        fetchWorkRequests();
        fetchActiveWorks();
        fetchBlockers();
        fetchWorksPendingClosure();
    } else {
        console.log('User not loaded yet');
    }
}, [user]);

  const fetchDashboardData = async () => {
    try {
        setLoading(true);
        
        // Check if schoolId exists
        if (!user?.schoolId) {
            console.log('No schoolId found for user');
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
        const worksRes = await axios.get(`http://localhost:8080/api/works`, {
            params: { schoolId: user.schoolId }
        });
        const works = worksRes.data || [];
        
        const activeWorksCount = works.filter(w => w.status === 'ACTIVE').length;
        const completedWorksCount = works.filter(w => w.status === 'COMPLETED').length;
        
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
        // Set default stats on error
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
    } finally {
        setLoading(false);
    }
};

  const calculateDaysSinceLastUpdate = (works) => {
    // Calculate days since last update for the most recent work
    if (!works.length) return 0;
    const lastUpdate = Math.max(...works.map(w => new Date(w.updatedAt || w.createdAt).getTime()));
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
        setWorkRequests([]);
    }
};

  const fetchActiveWorks = async () => {
    try {
        if (!user?.schoolId) {
            setActiveWorks([]);
            return;
        }
        const res = await axios.get(`http://localhost:8080/api/works`, {
            params: { 
                schoolId: user.schoolId,
                status: 'ACTIVE'
            }
        });
        setActiveWorks(res.data || []);
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
        setBlockers([]);
    }
};

  const fetchWorksPendingClosure = async () => {
    try {
        if (!user?.schoolId) {
            setWorksPendingClosure([]);
            return;
        }
        const res = await axios.get(`http://localhost:8080/api/works`, {
            params: { 
                schoolId: user.schoolId,
                status: 'PENDING_CLOSURE'
            }
        });
        setWorksPendingClosure(res.data || []);
    } catch (err) {
        console.error('Error fetching works pending closure:', err);
        setWorksPendingClosure([]);
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
      
      progressFormData.photos.forEach((photo, index) => {
        formDataToSend.append('photos', photo);
      });
      
      await axios.post('http://localhost:8080/api/work-progress', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setSuccess('Work progress updated successfully');
      setIsProgressModalOpen(false);
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

  const handleReportBlocker = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:8080/api/blockers', {
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
      const formDataToSend = new FormData();
      formDataToSend.append('workId', selectedWorkForClosure.id);
      formDataToSend.append('completionDate', closureFormData.completionDate);
      formDataToSend.append('finalRemarks', closureFormData.finalRemarks);
      formDataToSend.append('qualityAssessment', closureFormData.qualityAssessment);
      
      closureFormData.finalPhotos.forEach((photo, index) => {
        formDataToSend.append('photos', photo);
      });
      
      await axios.post('http://localhost:8080/api/works/mark-complete', formDataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setSuccess('Work marked as complete. Awaiting Sachiv verification.');
      setIsClosureModalOpen(false);
      resetClosureForm();
      fetchWorksPendingClosure();
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
      case 'ACTIVE': return { bg: '#dcfce7', text: '#166534' };
      case 'PENDING_QUOTATION': return { bg: '#fef3c7', text: '#92400e' };
      case 'PENDING_APPROVAL': return { bg: '#fee2e2', text: '#991b1b' };
      case 'COMPLETED': return { bg: '#dbeafe', text: '#1e40af' };
      default: return { bg: '#f1f5f9', text: '#475569' };
    }
  };

  // Navigation Menu Items
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'requests', label: 'Work Requests', icon: FileText },
    { id: 'active-works', label: 'Active Works', icon: Briefcase },
    { id: 'blockers', label: 'Blockers', icon: AlertCircle },
    { id: 'completion', label: 'Work Completion', icon: CheckCircle2 },
    { id: 'reports', label: 'Reports', icon: TrendingUp },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  const renderDashboard = () => (
    <div className="hm-dashboard">
      {/* Stats Cards */}
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
            <IndianRupee size={24} />
          </div>
          <div className="stat-content-hm">
            <h3>₹{((stats.budgetUtilized / stats.totalBudget) * 100 || 0).toFixed(0)}%</h3>
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

      {/* Quick Actions */}
      <div className="quick-actions-hm">
        <h3>Quick Actions</h3>
        <div className="actions-grid-hm">
          <button className="action-btn-hm" onClick={() => setIsRequestModalOpen(true)}>
            <Plus size={20} />
            <span>Create Work Request</span>
          </button>
          <button className="action-btn-hm" onClick={() => setActiveModule('active-works')}>
            <RefreshCw size={20} />
            <span>Update Progress</span>
          </button>
          <button className="action-btn-hm" onClick={() => setIsBlockerModalOpen(true)}>
            <AlertTriangle size={20} />
            <span>Report Blocker</span>
          </button>
          <button className="action-btn-hm" onClick={() => setActiveModule('active-works')}>
            <Eye size={20} />
            <span>View All Works</span>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="recent-activity-hm">
        <h3>Recent Activity</h3>
        <div className="activity-list">
          {workRequests.slice(0, 5).map(request => (
            <div key={request.id} className="activity-item">
              <div className="activity-icon">
                <FileText size={16} />
              </div>
              <div className="activity-content">
                <p><strong>{request.title}</strong> - {request.status?.replace('_', ' ')}</p>
                <small>{new Date(request.createdAt).toLocaleDateString()}</small>
              </div>
            </div>
          ))}
          {workRequests.length === 0 && (
            <p className="no-activity">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  );

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
                {request.quotation && (
                  <button className="view-quote-btn" onClick={() => setSelectedRequest(request)}>
                    View Quotation
                  </button>
                )}
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

  const renderActiveWorks = () => (
    <div className="hm-module">
      <div className="module-header">
        <h2>Active Works</h2>
      </div>

      <div className="works-list">
        {activeWorks.map(work => (
          <div key={work.id} className="work-card">
            <div className="work-header">
              <h3>{work.title}</h3>
              <span className="work-code">{work.workCode}</span>
            </div>
            <div className="work-progress">
              <div className="progress-label">
                <span>Progress</span>
                <span>{work.progressPercentage}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${work.progressPercentage}%` }}></div>
              </div>
            </div>
            <div className="work-meta">
              <span>Budget: ₹{work.sanctionedAmount?.toLocaleString()}</span>
              <span>Utilized: ₹{work.totalUtilized?.toLocaleString()}</span>
            </div>
            <div className="work-footer">
              <button className="update-btn" onClick={() => {
                setProgressFormData({ ...progressFormData, workId: work.id });
                setIsProgressModalOpen(true);
              }}>
                <RefreshCw size={16} /> Update Progress
              </button>
              {work.progressPercentage >= 90 && (
                <button className="complete-btn" onClick={() => {
                  setSelectedWorkForClosure(work);
                  setIsClosureModalOpen(true);
                }}>
                  <CheckCircle2 size={16} /> Mark Complete
                </button>
              )}
            </div>
          </div>
        ))}
        {activeWorks.length === 0 && (
          <div className="empty-state-hm">
            <Briefcase size={48} />
            <p>No active works. Approved work requests will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderBlockers = () => (
    <div className="hm-module">
      <div className="module-header">
        <h2>Blockers</h2>
        <button className="create-btn" onClick={() => setIsBlockerModalOpen(true)}>
          <AlertTriangle size={18} /> Report Blocker
        </button>
      </div>

      <div className="blockers-list">
        {blockers.map(blocker => (
          <div key={blocker.id} className={`blocker-card priority-${blocker.priority?.toLowerCase()}`}>
            <div className="blocker-header">
              <h3>{blocker.title}</h3>
              <span className={`priority-tag ${blocker.priority?.toLowerCase()}`}>
                {blocker.priority}
              </span>
            </div>
            <p className="blocker-desc">{blocker.description}</p>
            <div className="blocker-meta">
              <span>Type: {blocker.type}</span>
              <span>Status: {blocker.status}</span>
              <span>Reported: {new Date(blocker.createdAt).toLocaleDateString()}</span>
            </div>
            {blocker.status === 'RESOLVED' && (
              <div className="resolution-info">
                <CheckCircle2 size={14} />
                <span>Resolved: {blocker.resolvedAt ? new Date(blocker.resolvedAt).toLocaleDateString() : 'Recently'}</span>
              </div>
            )}
          </div>
        ))}
        {blockers.length === 0 && (
          <div className="empty-state-hm">
            <AlertCircle size={48} />
            <p>No blockers reported. All works are progressing smoothly!</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderWorkCompletion = () => (
    <div className="hm-module">
      <div className="module-header">
        <h2>Works Ready for Closure</h2>
      </div>

      <div className="completion-list">
        {worksPendingClosure.map(work => (
          <div key={work.id} className="completion-card">
            <div className="completion-header">
              <h3>{work.title}</h3>
              <span className="work-code">{work.workCode}</span>
            </div>
            <div className="completion-progress">
              <div className="progress-label">
                <span>Final Progress</span>
                <span>{work.progressPercentage}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${work.progressPercentage}%` }}></div>
              </div>
            </div>
            <button className="complete-final-btn" onClick={() => {
              setSelectedWorkForClosure(work);
              setIsClosureModalOpen(true);
            }}>
              <CheckCircle2 size={18} /> Mark as Complete
            </button>
          </div>
        ))}
        {worksPendingClosure.length === 0 && (
          <div className="empty-state-hm">
            <CheckCircle2 size={48} />
            <p>No works ready for closure. Keep working on active projects!</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderReports = () => (
    <div className="hm-module">
      <div className="module-header">
        <h2>Reports</h2>
      </div>
      <div className="reports-grid">
        <div className="report-card">
          <h3>Work Summary</h3>
          <div className="report-stats">
            <div>Total: {stats.totalWorks}</div>
            <div>Active: {stats.activeWorks}</div>
            <div>Completed: {stats.completedWorks}</div>
          </div>
          <button className="download-btn">Download Report</button>
        </div>
        <div className="report-card">
          <h3>Financial Summary</h3>
          <div className="report-stats">
            <div>Total Budget: ₹{stats.totalBudget?.toLocaleString()}</div>
            <div>Utilized: ₹{stats.budgetUtilized?.toLocaleString()}</div>
            <div>Remaining: ₹{(stats.totalBudget - stats.budgetUtilized)?.toLocaleString()}</div>
          </div>
          <button className="download-btn">Download Report</button>
        </div>
        <div className="report-card">
          <h3>Blocker Summary</h3>
          <div className="report-stats">
            <div>Total: {blockers.length}</div>
            <div>Active: {blockers.filter(b => b.status !== 'RESOLVED').length}</div>
            <div>Resolved: {blockers.filter(b => b.status === 'RESOLVED').length}</div>
          </div>
          <button className="download-btn">Download Report</button>
        </div>
      </div>
    </div>
  );

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
        <button className="edit-profile-btn" onClick={() => alert('Profile editing coming soon!')}>
          <Edit2 size={16} /> Edit Profile
        </button>
      </div>
    </div>
  );

  // Modal for Create Work Request
  const renderCreateRequestModal = () => (
    <div className="modal-overlay">
      <div className="modal modal-lg">
        <div className="modal-header">
          <h2>Create Work Request</h2>
          <button className="close-btn" onClick={() => setIsRequestModalOpen(false)}><X size={24} /></button>
        </div>
        <form onSubmit={handleCreateWorkRequest}>
          <div className="form-grid">
            <div className="form-group full-width">
              <label>Work Title *</label>
              <input
                type="text"
                value={requestFormData.title}
                onChange={(e) => setRequestFormData({...requestFormData, title: e.target.value})}
                required
                placeholder="Enter work title"
              />
            </div>
            <div className="form-group full-width">
              <label>Description *</label>
              <textarea
                value={requestFormData.description}
                onChange={(e) => setRequestFormData({...requestFormData, description: e.target.value})}
                required
                rows="4"
                placeholder="Describe the work needed"
              />
            </div>
            <div className="form-group">
              <label>Work Type</label>
              <select value={requestFormData.type} onChange={(e) => setRequestFormData({...requestFormData, type: e.target.value})}>
                <option>Maintenance</option>
                <option>Repair</option>
                <option>New Construction</option>
                <option>Renovation</option>
                <option>Emergency</option>
              </select>
            </div>
            <div className="form-group">
              <label>Category</label>
              <select value={requestFormData.category} onChange={(e) => setRequestFormData({...requestFormData, category: e.target.value})}>
                <option>Building</option>
                <option>Electrical</option>
                <option>Plumbing</option>
                <option>Painting</option>
                <option>Furniture</option>
                <option>Sanitation</option>
              </select>
            </div>
            <div className="form-group">
              <label>Priority</label>
              <select value={requestFormData.priority} onChange={(e) => setRequestFormData({...requestFormData, priority: e.target.value})}>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
                <option>Urgent</option>
              </select>
            </div>
            <div className="form-group">
              <label>Photos (Optional)</label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => handlePhotoUpload(e, 
                  (files) => setRequestFormData({...requestFormData, photos: [...requestFormData.photos, ...files]}),
                  setPhotoPreviews
                )}
              />
              {photoPreviews.length > 0 && (
                <div className="photo-previews">
                  {photoPreviews.map((preview, idx) => (
                    <img key={idx} src={preview} alt={`Preview ${idx}`} />
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="cancel-btn" onClick={() => setIsRequestModalOpen(false)}>Cancel</button>
            <button type="submit" className="save-btn" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Modal for Update Progress
  const renderProgressModal = () => (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Update Work Progress</h2>
          <button className="close-btn" onClick={() => setIsProgressModalOpen(false)}><X size={24} /></button>
        </div>
        <form onSubmit={handleUpdateProgress}>
          <div className="form-group">
            <label>Select Work</label>
            <select
              value={progressFormData.workId}
              onChange={(e) => setProgressFormData({...progressFormData, workId: e.target.value})}
              required
            >
              <option value="">Select Work</option>
              {activeWorks.map(work => (
                <option key={work.id} value={work.id}>{work.title}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Progress Percentage</label>
            <input
              type="number"
              min="0"
              max="100"
              value={progressFormData.progressPercentage}
              onChange={(e) => setProgressFormData({...progressFormData, progressPercentage: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Remarks</label>
            <textarea
              value={progressFormData.remarks}
              onChange={(e) => setProgressFormData({...progressFormData, remarks: e.target.value})}
              rows="3"
              placeholder="Describe what has been completed"
            />
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label>Material Cost (₹)</label>
              <input
                type="number"
                value={progressFormData.materialCost}
                onChange={(e) => setProgressFormData({...progressFormData, materialCost: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Labor Cost (₹)</label>
              <input
                type="number"
                value={progressFormData.laborCost}
                onChange={(e) => setProgressFormData({...progressFormData, laborCost: e.target.value})}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Photos (Mandatory)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              required
              onChange={(e) => handlePhotoUpload(e,
                (files) => setProgressFormData({...progressFormData, photos: [...progressFormData.photos, ...files]}),
                (previews) => {}
              )}
            />
          </div>
          <div className="modal-footer">
            <button type="button" className="cancel-btn" onClick={() => setIsProgressModalOpen(false)}>Cancel</button>
            <button type="submit" className="save-btn" disabled={loading}>
              {loading ? 'Updating...' : 'Update Progress'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Modal for Report Blocker
  const renderBlockerModal = () => (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Report a Blocker</h2>
          <button className="close-btn" onClick={() => setIsBlockerModalOpen(false)}><X size={24} /></button>
        </div>
        <form onSubmit={handleReportBlocker}>
          <div className="form-group">
            <label>Affected Work</label>
            <select
              value={blockerFormData.workId}
              onChange={(e) => setBlockerFormData({...blockerFormData, workId: e.target.value})}
              required
            >
              <option value="">Select Work</option>
              {activeWorks.map(work => (
                <option key={work.id} value={work.id}>{work.title}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Blocker Title</label>
            <input
              type="text"
              value={blockerFormData.title}
              onChange={(e) => setBlockerFormData({...blockerFormData, title: e.target.value})}
              required
              placeholder="Brief title for the blocker"
            />
          </div>
          <div className="form-group">
            <label>Blocker Type</label>
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
            <label>Priority</label>
            <select value={blockerFormData.priority} onChange={(e) => setBlockerFormData({...blockerFormData, priority: e.target.value})}>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>
          <div className="form-group">
            <label>Description</label>
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
          <div className="modal-footer">
            <button type="button" className="cancel-btn" onClick={() => setIsBlockerModalOpen(false)}>Cancel</button>
            <button type="submit" className="save-btn" disabled={loading}>
              {loading ? 'Reporting...' : 'Report Blocker'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Modal for Work Completion
  const renderClosureModal = () => (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Mark Work as Complete</h2>
          <button className="close-btn" onClick={() => setIsClosureModalOpen(false)}><X size={24} /></button>
        </div>
        <form onSubmit={handleMarkWorkComplete}>
          <div className="form-group">
            <label>Completion Date</label>
            <input
              type="date"
              value={closureFormData.completionDate}
              onChange={(e) => setClosureFormData({...closureFormData, completionDate: e.target.value})}
              required
            />
          </div>
          <div className="form-group">
            <label>Quality Assessment</label>
            <select value={closureFormData.qualityAssessment} onChange={(e) => setClosureFormData({...closureFormData, qualityAssessment: e.target.value})}>
              <option>Excellent</option>
              <option>Good</option>
              <option>Satisfactory</option>
              <option>Needs Improvement</option>
            </select>
          </div>
          <div className="form-group">
            <label>Final Remarks</label>
            <textarea
              value={closureFormData.finalRemarks}
              onChange={(e) => setClosureFormData({...closureFormData, finalRemarks: e.target.value})}
              rows="3"
              placeholder="Any final comments about the work completion"
            />
          </div>
          <div className="form-group">
            <label>Final Photos (Minimum 3)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              required
              onChange={(e) => handlePhotoUpload(e,
                (files) => setClosureFormData({...closureFormData, finalPhotos: [...closureFormData.finalPhotos, ...files]}),
                (previews) => {}
              )}
            />
            <small>Please upload photos showing the completed work from different angles</small>
          </div>
          <div className="modal-footer">
            <button type="button" className="cancel-btn" onClick={() => setIsClosureModalOpen(false)}>Cancel</button>
            <button type="submit" className="save-btn" disabled={loading}>
              {loading ? 'Submitting...' : 'Submit for Verification'}
            </button>
          </div>
        </form>
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
          {menuItems.map(item => (
            <button
              key={item.id}
              className={`nav-item ${activeModule === item.id ? 'active' : ''}`}
              onClick={() => setActiveModule(item.id)}
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
            <h1>{menuItems.find(m => m.id === activeModule)?.label}</h1>
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
        {activeModule === 'blockers' && renderBlockers()}
        {activeModule === 'completion' && renderWorkCompletion()}
        {activeModule === 'reports' && renderReports()}
        {activeModule === 'profile' && renderProfile()}
      </div>

      {/* Modals */}
      {isRequestModalOpen && renderCreateRequestModal()}
      {isProgressModalOpen && renderProgressModal()}
      {isBlockerModalOpen && renderBlockerModal()}
      {isClosureModalOpen && renderClosureModal()}

      <style>{`
        .headmaster-container {
          display: flex;
          min-height: 100vh;
          background-color: #f8fafc;
        }

        /* Sidebar Styles */
        .sidebar {
          width: 260px;
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          color: white;
          display: flex;
          flex-direction: column;
          position: fixed;
          height: 100vh;
          transition: width 0.3s ease;
          z-index: 100;
        }
        .sidebar.collapsed {
          width: 70px;
        }
        .sidebar-header {
          padding: 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #334155;
        }
        .sidebar-header h2 {
          margin: 0;
          font-size: 1.25rem;
          color: #38bdf8;
        }
        .collapse-btn {
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 0.25rem;
        }
        .sidebar-nav {
          flex: 1;
          padding: 1rem 0;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .nav-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1.5rem;
          background: none;
          border: none;
          color: #cbd5e1;
          cursor: pointer;
          transition: all 0.2s;
          width: 100%;
          text-align: left;
          font-size: 0.95rem;
        }
        .nav-item:hover {
          background-color: #334155;
          color: white;
        }
        .nav-item.active {
          background-color: #0ea5e9;
          color: white;
        }
        .sidebar-footer {
          padding: 1rem;
          border-top: 1px solid #334155;
        }
        .logout-btn {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          width: 100%;
          padding: 0.75rem;
          background: none;
          border: none;
          color: #cbd5e1;
          cursor: pointer;
          transition: color 0.2s;
        }
        .logout-btn:hover {
          color: #ef4444;
        }

        /* Main Content */
        .main-content {
          flex: 1;
          margin-left: 260px;
          padding: 1.5rem;
          transition: margin-left 0.3s ease;
        }
        .main-content.expanded {
          margin-left: 70px;
        }
        .top-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #e2e8f0;
        }
        .welcome-section h1 {
          margin: 0;
          font-size: 1.5rem;
          color: #1e293b;
        }
        .welcome-section p {
          margin: 0.25rem 0 0;
          color: #64748b;
          font-size: 0.875rem;
        }
        .user-info {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }
        .notification-bell {
          position: relative;
          cursor: pointer;
        }
        .notification-bell .badge {
          position: absolute;
          top: -8px;
          right: -8px;
          background-color: #ef4444;
          color: white;
          font-size: 0.7rem;
          padding: 2px 5px;
          border-radius: 10px;
        }
        .user-name {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #334155;
        }

        /* Dashboard Styles */
        .stats-grid-hm {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .stat-card-hm {
          background: white;
          padding: 1rem;
          border-radius: 0.75rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .stat-icon-hm {
          width: 48px;
          height: 48px;
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .stat-content-hm h3 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 700;
        }
        .stat-content-hm p {
          margin: 0;
          color: #64748b;
          font-size: 0.8rem;
        }
        .quick-actions-hm {
          background: white;
          padding: 1.5rem;
          border-radius: 0.75rem;
          margin-bottom: 2rem;
        }
        .quick-actions-hm h3 {
          margin: 0 0 1rem 0;
        }
        .actions-grid-hm {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }
        .action-btn-hm {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem;
          background-color: #f1f5f9;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .action-btn-hm:hover {
          background-color: #0ea5e9;
          color: white;
        }
        .recent-activity-hm {
          background: white;
          padding: 1.5rem;
          border-radius: 0.75rem;
        }
        .recent-activity-hm h3 {
          margin: 0 0 1rem 0;
        }
        .activity-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .activity-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.5rem;
          border-bottom: 1px solid #f1f5f9;
        }
        .activity-icon {
          width: 28px;
          height: 28px;
          background-color: #e0f2fe;
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #0284c7;
        }
        .activity-content {
          flex: 1;
        }
        .activity-content p {
          margin: 0;
          font-size: 0.875rem;
        }
        .activity-content small {
          color: #94a3b8;
          font-size: 0.7rem;
        }
        .no-activity {
          text-align: center;
          color: #94a3b8;
          padding: 2rem;
        }

        /* Module Styles */
        .hm-module {
          background: white;
          border-radius: 0.75rem;
          padding: 1.5rem;
        }
        .module-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        .module-header h2 {
          margin: 0;
          font-size: 1.25rem;
        }
        .create-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background-color: #0ea5e9;
          color: white;
          border: none;
          padding: 0.6rem 1.2rem;
          border-radius: 0.5rem;
          cursor: pointer;
          font-weight: 600;
        }

        /* Request Card */
        .requests-list, .works-list, .blockers-list, .completion-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .request-card, .work-card, .blocker-card, .completion-card {
          background: #f8fafc;
          padding: 1rem;
          border-radius: 0.5rem;
          border: 1px solid #e2e8f0;
        }
        .request-header, .work-header, .blocker-header, .completion-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }
        .request-header h3, .work-header h3, .blocker-header h3 {
          margin: 0;
          font-size: 1rem;
        }
        .priority-badge, .priority-tag {
          padding: 0.2rem 0.6rem;
          border-radius: 9999px;
          font-size: 0.7rem;
          font-weight: 600;
        }
        .priority-tag.high, .priority-tag.urgent {
          background-color: #fee2e2;
          color: #dc2626;
        }
        .priority-tag.medium {
          background-color: #fef3c7;
          color: #d97706;
        }
        .priority-tag.low {
          background-color: #dcfce7;
          color: #16a34a;
        }
        .work-code {
          font-size: 0.75rem;
          color: #64748b;
          font-family: monospace;
        }
        .request-desc, .blocker-desc {
          color: #475569;
          font-size: 0.875rem;
          margin-bottom: 0.5rem;
        }
        .request-meta, .work-meta, .blocker-meta {
          display: flex;
          gap: 1rem;
          font-size: 0.75rem;
          color: #64748b;
          margin-bottom: 0.75rem;
        }
        .request-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
        }
        .work-progress {
          margin: 1rem 0;
        }
        .progress-label {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          margin-bottom: 0.25rem;
        }
        .progress-bar {
          background-color: #e2e8f0;
          border-radius: 9999px;
          height: 8px;
          overflow: hidden;
        }
        .progress-fill {
          background-color: #0ea5e9;
          height: 100%;
          border-radius: 9999px;
          transition: width 0.3s;
        }
        .work-footer {
          display: flex;
          gap: 0.5rem;
        }
        .update-btn, .complete-btn, .complete-final-btn {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          font-size: 0.8rem;
        }
        .update-btn {
          background-color: #0ea5e9;
          color: white;
        }
        .complete-btn, .complete-final-btn {
          background-color: #10b981;
          color: white;
        }
        .resolution-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 0.5rem;
          padding-top: 0.5rem;
          border-top: 1px solid #e2e8f0;
          font-size: 0.75rem;
          color: #10b981;
        }

        /* Reports */
        .reports-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }
        .report-card {
          background: #f8fafc;
          padding: 1.5rem;
          border-radius: 0.75rem;
          text-align: center;
        }
        .report-card h3 {
          margin: 0 0 1rem 0;
        }
        .report-stats {
          margin-bottom: 1rem;
        }
        .report-stats div {
          padding: 0.5rem;
          border-bottom: 1px solid #e2e8f0;
        }
        .download-btn {
          background-color: #0ea5e9;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          cursor: pointer;
        }

        /* Profile */
        .profile-card {
          background: #f8fafc;
          padding: 2rem;
          border-radius: 0.75rem;
          text-align: center;
        }
        .profile-avatar {
          width: 100px;
          height: 100px;
          background-color: #e2e8f0;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
          color: #64748b;
        }
        .profile-info h3 {
          margin: 0 0 0.5rem 0;
        }
        .profile-info p {
          margin: 0.25rem 0;
          color: #475569;
        }
        .edit-profile-btn {
          margin-top: 1rem;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background-color: #0ea5e9;
          color: white;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
        }

        /* Empty State */
        .empty-state-hm {
          text-align: center;
          padding: 3rem;
          color: #94a3b8;
        }
        .empty-state-hm svg {
          margin-bottom: 1rem;
          opacity: 0.5;
        }

        /* Modal */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        .modal {
          background: white;
          border-radius: 0.75rem;
          width: 100%;
          max-width: 600px;
          max-height: 90vh;
          overflow-y: auto;
          padding: 2rem;
        }
        .modal-lg {
          max-width: 800px;
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        .modal-header h2 {
          margin: 0;
        }
        .close-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #64748b;
        }
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .form-group.full-width {
          grid-column: span 2;
        }
        .form-group label {
          font-weight: 600;
          color: #334155;
          font-size: 0.875rem;
        }
        .form-group input, .form-group select, .form-group textarea {
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          font-size: 0.9rem;
        }
        .photo-previews {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.5rem;
          flex-wrap: wrap;
        }
        .photo-previews img {
          width: 80px;
          height: 80px;
          object-fit: cover;
          border-radius: 0.5rem;
        }
        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 2rem;
        }
        .cancel-btn {
          padding: 0.75rem 1.5rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          background: white;
          cursor: pointer;
        }
        .save-btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 0.5rem;
          background: #0ea5e9;
          color: white;
          cursor: pointer;
          font-weight: 600;
        }
        .save-btn:disabled {
          background-color: #93c5fd;
          cursor: not-allowed;
        }

        /* Alerts */
        .alert {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          border-radius: 0.5rem;
          margin-bottom: 1rem;
        }
        .alert.error {
          background-color: #fee2e2;
          color: #dc2626;
        }
        .alert.success {
          background-color: #dcfce7;
          color: #16a34a;
        }
        .alert button {
          background: none;
          border: none;
          margin-left: auto;
          cursor: pointer;
          color: inherit;
        }
      `}</style>
    </div>
  );
};

export default HeadmasterDashboard;