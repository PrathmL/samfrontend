import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { 
  AlertTriangle, Clock, CheckCircle2, Flag, User, Building2, 
  Search, Filter, Eye, RefreshCw, Send, X, Plus, 
  MessageSquare, ChevronRight, AlertCircle, Trash2, Link as LinkIcon, Briefcase
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const BlockerManagement = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [blockers, setBlockers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');

  // Modals
  const [selectedBlocker, setSelectedBlocker] = useState(null);
  const [isDetailModalOpen, setIsBlockerDetailModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [isEscalateModalOpen, setIsEscalateModalOpen] = useState(false);
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [isRequestInfoModalOpen, setIsRequestInfoModalOpen] = useState(false);

  // Form States
  const [reportFormData, setReportFormData] = useState({
    workId: '',
    title: '',
    type: 'Material Shortage',
    priority: 'Medium',
    description: '',
    impact: '',
    estimatedDelayDays: 0
  });
  
  const [assignFormData, setAssignFormData] = useState({
    assignedToId: '',
    targetDate: '',
    notes: ''
  });
  
  const [resolveFormData, setResolveFormData] = useState({
    resolutionNotes: ''
  });
  
  const [escalateFormData, setEscalateFormData] = useState({
    reason: ''
  });
  
  const [duplicateFormData, setDuplicateFormData] = useState({
    duplicateOfId: ''
  });

  const [commentText, setCommentText] = useState('');
  const [activeWorks, setActiveWorks] = useState([]);
  const [sachivUsers, setSachivUsers] = useState([]);

  const fetchBlockers = useCallback(async () => {
    try {
      setLoading(true);
      let params = {};
      if (user?.role === 'HEADMASTER' || user?.role === 'CLERK') {
        params.schoolId = user.schoolId;
      } else if (user?.role === 'SACHIV') {
        params.talukaId = user.talukaId;
      }
      
      const res = await axios.get('http://localhost:8080/api/blockers', { params });
      setBlockers(res.data || []);
    } catch (err) {
      console.error('Error fetching blockers:', err);
      setError('Failed to fetch blockers');
    } finally {
      setLoading(false);
    }
  }, [user?.role, user?.schoolId, user?.talukaId]);

  const fetchActiveWorks = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/works/school/${user?.schoolId}`);
      setActiveWorks(res.data?.filter(w => w.status !== 'COMPLETED') || []);
    } catch (err) {
      console.error('Error fetching works:', err);
    }
  };

  const fetchSachivUsers = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/admin/users/role/SACHIV');
      setSachivUsers(res.data || []);
    } catch (err) {
      console.error('Error fetching sachivs:', err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchBlockers();
      if (user.role === 'HEADMASTER') fetchActiveWorks();
      if (user.role === 'ADMIN' || user.role === 'SACHIV') fetchSachivUsers();
    }
  }, [fetchBlockers, user?.role, user?.schoolId]);

  const handleReportBlocker = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:8080/api/blockers', {
        ...reportFormData,
        schoolId: user.schoolId,
        reportedById: user.id,
        reportedByRole: user.role
      });
      setSuccess('Blocker reported successfully');
      setIsReportModalOpen(false);
      resetReportForm();
      fetchBlockers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to report blocker');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignBlocker = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(`http://localhost:8080/api/blockers/${selectedBlocker.id}/assign`, {
        assignedToId: assignFormData.assignedToId,
        assignedToRole: 'SACHIV',
        targetDate: assignFormData.targetDate,
        assignedBy: user.id,
        assignedByRole: user.role,
        notes: assignFormData.notes
      });
      setSuccess('Blocker assigned successfully');
      setIsAssignModalOpen(false);
      fetchBlockers();
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
        resolvedByRole: user.role
      });
      setSuccess('Blocker resolved successfully');
      setIsResolveModalOpen(false);
      fetchBlockers();
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
        escalatedToId: 1, // Default to Admin
        escalatedToRole: 'ADMIN',
        reason: escalateFormData.reason,
        escalatedById: user.id,
        escalatedByRole: user.role
      });
      setSuccess('Blocker escalated to Admin');
      setIsEscalateModalOpen(false);
      fetchBlockers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to escalate blocker');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestInfo = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(`http://localhost:8080/api/blockers/${selectedBlocker.id}/request-info`, {
        notes: resolveFormData.resolutionNotes, // Reuse resolutionNotes for info request text
        requestedById: user.id,
        requestedByRole: user.role
      });
      setSuccess('Information requested');
      setIsRequestInfoModalOpen(false);
      setResolveFormData({ resolutionNotes: '' });
      fetchBlockers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to request info');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePriority = async (newPriority) => {
    setLoading(true);
    try {
      await axios.put(`http://localhost:8080/api/blockers/${selectedBlocker.id}/priority`, {
        priority: newPriority,
        updatedById: user.id,
        updatedByRole: user.role
      });
      setSuccess('Priority updated');
      const updated = await axios.get(`http://localhost:8080/api/blockers/${selectedBlocker.id}`);
      setSelectedBlocker(updated.data);
      fetchBlockers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update priority');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkDuplicate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(`http://localhost:8080/api/blockers/${selectedBlocker.id}/duplicate`, {
        duplicateOfId: duplicateFormData.duplicateOfId,
        updatedById: user.id,
        updatedByRole: user.role
      });
      setSuccess('Marked as duplicate');
      setIsDuplicateModalOpen(false);
      fetchBlockers();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to mark as duplicate');
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
        commentedByRole: user.role,
        commentedByName: user.name,
        isInternal: false
      });
      setCommentText('');
      const updated = await axios.get(`http://localhost:8080/api/blockers/${selectedBlocker.id}`);
      setSelectedBlocker(updated.data);
      setSuccess('Comment added');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to add comment');
    } finally {
      setLoading(false);
    }
  };

  const resetReportForm = () => {
    setReportFormData({
      workId: '', title: '', type: 'Material Shortage', 
      priority: 'Medium', description: '', impact: '', estimatedDelayDays: 0
    });
  };

  const getPriorityBadge = (priority) => {
    switch(priority) {
      case 'HIGH': return { bg: '#fee2e2', color: '#dc2626', text: t('priority_high') };
      case 'MEDIUM': return { bg: '#fef3c7', color: '#d97706', text: t('priority_medium') };
      default: return { bg: '#dcfce7', color: '#16a34a', text: t('priority_low') };
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'NEW': return { bg: '#fef3c7', color: '#92400e', text: t('status_new') };
      case 'IN_PROGRESS': return { bg: '#e0f2fe', color: '#0284c7', text: t('status_in_progress') };
      case 'RESOLVED': return { bg: '#dcfce7', color: '#166534', text: t('stat_resolved') };
      case 'ESCALATED': return { bg: '#fee2e2', color: '#dc2626', text: t('stat_escalated') };
      case 'INFO_REQUESTED': return { bg: '#fff7ed', color: '#c2410c', text: t('status_info_requested') };
      case 'DUPLICATE': return { bg: '#f1f5f9', color: '#475569', text: t('status_duplicate') };
      default: return { bg: '#f1f5f9', color: '#475569', text: status };
    }
  };

  const translateBlockerType = (type) => {
    switch(type) {
      case 'Material Shortage': return t('type_material_shortage');
      case 'Labor Availability': return t('type_labor_availability');
      case 'Fund Issues': return t('type_fund_issues');
      case 'Technical Issue': return t('type_technical_issue');
      case 'Administrative Delay': return t('type_admin_delay');
      default: return type;
    }
  };

  const filteredBlockers = blockers.filter(b => {
    const matchesSearch = b.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          b.workTitle?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || b.priority === priorityFilter;
    const matchesType = typeFilter === 'ALL' || b.type === typeFilter;
    return matchesSearch && matchesStatus && matchesPriority && matchesType;
  });

  return (
    <div className="blocker-management">
      <div className="module-header">
        <div>
          <h2>{t('title_blocker_mgmt')}</h2>
          <p>{t('subtitle_blocker_mgmt')}</p>
        </div>
        {user.role === 'HEADMASTER' && (
          <button className="create-btn" onClick={() => setIsReportModalOpen(true)}>
            <Plus size={18} /> {t('btn_report_blocker')}
          </button>
        )}
      </div>

      {/* Stats Summary */}
      <div className="stats-strip">
        <div className="stat-item">
          <span className="val">{blockers.filter(b => b.status !== 'RESOLVED').length}</span>
          <span className="lab">{t('stat_active_blockers')}</span>
        </div>
        <div className="stat-item">
          <span className="val">{blockers.filter(b => b.priority === 'HIGH' && b.status !== 'RESOLVED').length}</span>
          <span className="lab">{t('stat_high_priority')}</span>
        </div>
        <div className="stat-item">
          <span className="val">{blockers.filter(b => b.status === 'ESCALATED').length}</span>
          <span className="lab">{t('stat_escalated')}</span>
        </div>
        <div className="stat-item">
          <span className="val">{blockers.filter(b => b.status === 'RESOLVED').length}</span>
          <span className="lab">{t('stat_resolved')}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-row">
        <div className="search-group">
          <Search size={18} />
          <input 
            type="text" 
            placeholder={`${t('btn_search')}...`} 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="ALL">All Status</option>
          <option value="NEW">{t('status_new')}</option>
          <option value="IN_PROGRESS">{t('status_in_progress')}</option>
          <option value="ESCALATED">{t('stat_escalated')}</option>
          <option value="RESOLVED">{t('stat_resolved')}</option>
          <option value="DUPLICATE">{t('status_duplicate')}</option>
        </select>
        <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
          <option value="ALL">All Priority</option>
          <option value="HIGH">{t('priority_high')}</option>
          <option value="MEDIUM">{t('priority_medium')}</option>
          <option value="LOW">{t('priority_low')}</option>
        </select>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="ALL">All Types</option>
          <option value="Material Shortage">{t('type_material_shortage')}</option>
          <option value="Labor Availability">{t('type_labor_availability')}</option>
          <option value="Fund Issues">{t('type_fund_issues')}</option>
          <option value="Technical Issue">{t('type_technical_issue')}</option>
          <option value="Administrative Delay">{t('type_admin_delay')}</option>
        </select>
      </div>

      {/* Blocker Grid */}
      <div className="blockers-grid">
        {filteredBlockers.map(blocker => {
          const statusBadge = getStatusBadge(blocker.status);
          const priorityBadge = getPriorityBadge(blocker.priority);
          return (
            <div key={blocker.id} className={`blocker-card priority-${blocker.priority?.toLowerCase()}`}>
              <div className="card-top">
                <div className="blocker-id">#{blocker.id}</div>
                <div className="badges">
                  <span className="p-badge" style={{ backgroundColor: priorityBadge.bg, color: priorityBadge.color }}>
                    {priorityBadge.text}
                  </span>
                  <span className="s-badge" style={{ backgroundColor: statusBadge.bg, color: statusBadge.color }}>
                    {statusBadge.text}
                  </span>
                </div>
              </div>
              
              <h3 className="blocker-title">{blocker.title}</h3>
              <div className="work-ref">
                <Briefcase size={12} />
                <span>{blocker.workTitle} ({blocker.workCode})</span>
              </div>
              
              <p className="description">{blocker.description?.substring(0, 100)}...</p>
              
              <div className="card-meta">
                <div className="meta-row">
                  <Building2 size={12} />
                  <span>{blocker.schoolName}</span>
                </div>
                <div className="meta-row">
                  <Clock size={12} />
                  <span>{new Date(blocker.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              
              <button className="view-btn" onClick={() => {
                setSelectedBlocker(blocker);
                setIsBlockerDetailModalOpen(true);
              }}>
                <Eye size={14} /> {t('btn_view')}
              </button>
            </div>
          );
        })}
        {filteredBlockers.length === 0 && (
          <div className="empty-state">
            <AlertCircle size={48} />
            <p>No blockers found matching filters.</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {isDetailModalOpen && selectedBlocker && (
        <div className="modal-overlay">
          <div className="modal modal-xl">
            <div className="modal-header">
              <h2>{t('btn_view')}: {selectedBlocker.title}</h2>
              <button className="close-btn" onClick={() => setIsBlockerDetailModalOpen(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="modal-content">
              <div className="detail-layout">
                <div className="detail-info">
                  <div className="info-section">
                    <h3>{t('title_blocker_info')}</h3>
                    <div className="info-grid">
                      <div className="info-item">
                        <label>{t('field_status')}</label>
                        <span className="status-badge-large" style={{ backgroundColor: getStatusBadge(selectedBlocker.status).bg, color: getStatusBadge(selectedBlocker.status).color }}>
                          {getStatusBadge(selectedBlocker.status).text}
                        </span>
                      </div>
                      <div className="info-item">
                        <label>{t('field_priority')}</label>
                        <div className="priority-actions">
                          <span className="priority-text" style={{ color: getPriorityColor(selectedBlocker.priority) }}>
                            {getPriorityBadge(selectedBlocker.priority).text}
                          </span>
                          {(user.role === 'ADMIN' || user.role === 'SACHIV') && selectedBlocker.status !== 'RESOLVED' && (
                            <div className="p-buttons">
                              <button onClick={() => handleUpdatePriority('HIGH')} className="p-high">H</button>
                              <button onClick={() => handleUpdatePriority('MEDIUM')} className="p-med">M</button>
                              <button onClick={() => handleUpdatePriority('LOW')} className="p-low">L</button>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="info-item">
                        <label>{t('field_blocker_type')}</label>
                        <span>{translateBlockerType(selectedBlocker.type)}</span>
                      </div>
                      <div className="info-item">
                        <label>{t('field_reported_by')}</label>
                        <span>{selectedBlocker.reportedBy} ({selectedBlocker.reportedByRole})</span>
                      </div>
                      <div className="info-item">
                        <label>{t('field_est_delay')}</label>
                        <span>{selectedBlocker.estimatedDelayDays || 0} {t('field_date')}</span>
                      </div>
                      <div className="info-item">
                        <label>{t('field_target_date')}</label>
                        <span>{selectedBlocker.targetDate ? new Date(selectedBlocker.targetDate).toLocaleDateString() : 'Not set'}</span>
                      </div>
                    </div>
                    <div className="desc-block">
                      <label>{t('field_description')}</label>
                      <p>{selectedBlocker.description}</p>
                    </div>
                    <div className="desc-block">
                      <label>{t('field_impact')}</label>
                      <p>{selectedBlocker.impact || 'Not specified'}</p>
                    </div>
                    {selectedBlocker.status === 'DUPLICATE' && (
                      <div className="duplicate-info">
                        <LinkIcon size={16} />
                        <span>{t('label_duplicate_of')}: <strong>#{selectedBlocker.duplicateOfId}</strong> {selectedBlocker.duplicateOfTitle}</span>
                      </div>
                    )}
                  </div>

                  <div className="info-section">
                    <h3>{t('title_work_context')}</h3>
                    <div className="work-context-box">
                      <p><strong>{t('field_school')}:</strong> {selectedBlocker.schoolName}</p>
                      <p><strong>{t('field_work_title')}:</strong> {selectedBlocker.workTitle}</p>
                      <p><strong>{t('field_work_code')}:</strong> {selectedBlocker.workCode}</p>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="action-bar-blocker">
                    {user.role === 'ADMIN' && selectedBlocker.status === 'ESCALATED' && (
                      <>
                        <button className="resolve-action" onClick={() => setIsResolveModalOpen(true)}>
                          <CheckCircle2 size={16} /> {t('btn_mark_resolved')}
                        </button>
                        <button className="assign-action" onClick={() => setIsAssignModalOpen(true)}>
                          <RefreshCw size={16} /> {t('btn_reassign_sachiv')}
                        </button>
                      </>
                    )}
                    {user.role === 'SACHIV' && selectedBlocker.status === 'NEW' && (
                      <button className="assign-action" onClick={() => setIsAssignModalOpen(true)}>
                        <User size={16} /> {t('field_assigned_to')}
                      </button>
                    )}
                    {(user.role === 'SACHIV' || user.role === 'ADMIN') && selectedBlocker.status === 'IN_PROGRESS' && (
                      <button className="resolve-action" onClick={() => setIsResolveModalOpen(true)}>
                        <CheckCircle2 size={16} /> {t('btn_mark_resolved')}
                      </button>
                    )}
                    {user.role === 'SACHIV' && selectedBlocker.status !== 'RESOLVED' && (
                      <button className="escalate-action" onClick={() => setIsEscalateModalOpen(true)}>
                        <AlertTriangle size={16} /> {t('btn_escalate_admin')}
                      </button>
                    )}
                    {(user.role === 'ADMIN' || user.role === 'SACHIV') && selectedBlocker.status === 'NEW' && (
                      <button className="duplicate-action" style={{ background: '#fff7ed', color: '#c2410c' }} onClick={() => setIsRequestInfoModalOpen(true)}>
                        <MessageSquare size={16} /> {t('status_info_requested')}
                      </button>
                    )}
                    {(user.role === 'ADMIN' || user.role === 'SACHIV') && selectedBlocker.status !== 'RESOLVED' && (
                      <button className="duplicate-action" onClick={() => setIsDuplicateModalOpen(true)}>
                        <LinkIcon size={16} /> {t('status_duplicate')}
                      </button>
                    )}
                  </div>
                </div>

                <div className="detail-timeline">
                  <h3>{t('title_timeline_comments')}</h3>
                  <div className="comments-container">
                    {selectedBlocker.comments?.map((c, i) => (
                      <div key={i} className="comment-bubble">
                        <div className="comment-meta">
                          <strong>{c.commentedBy}</strong>
                          <span className="role-tag">{c.commentedByRole}</span>
                          <span className="time">{new Date(c.createdAt).toLocaleString()}</span>
                        </div>
                        <p>{c.comment}</p>
                      </div>
                    ))}
                  </div>
                  <div className="comment-input-area">
                    <textarea 
                      placeholder={t('placeholder_comment')} 
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                    />
                    <button onClick={handleAddComment} disabled={loading || !commentText.trim()}>
                      <Send size={16} /> {t('btn_post')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Escalate Modal */}
      {isEscalateModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{t('btn_escalate_admin')}</h2>
              <button className="close-btn" onClick={() => setIsEscalateModalOpen(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleEscalateBlocker}>
              <div className="modal-content">
                <div className="warning-text">
                  This will move the blocker to Admin dashboard for higher level intervention.
                </div>
                <div className="form-group">
                  <label>Reason for Escalation *</label>
                  <textarea 
                    value={escalateFormData.reason}
                    onChange={(e) => setEscalateFormData({...escalateFormData, reason: e.target.value})}
                    placeholder="Describe why this needs Admin attention..."
                    rows="4"
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="cancel-btn" onClick={() => setIsEscalateModalOpen(false)}>{t('btn_cancel')}</button>
                <button type="submit" className="escalate-btn-real" disabled={loading}>{t('btn_escalate_admin')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {isAssignModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{t('field_assigned_to')}</h2>
              <button className="close-btn" onClick={() => setIsAssignModalOpen(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleAssignBlocker}>
              <div className="modal-content">
                <div className="form-group">
                  <label>Select Person *</label>
                  <select 
                    value={assignFormData.assignedToId} 
                    onChange={(e) => setAssignFormData({...assignFormData, assignedToId: e.target.value})}
                    required
                  >
                    <option value="">-- Select --</option>
                    {sachivUsers.map(s => (
                      <option key={s.id} value={s.id}>{s.name} ({s.talukaName})</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>{t('field_target_date')} *</label>
                  <input 
                    type="date" 
                    value={assignFormData.targetDate}
                    onChange={(e) => setAssignFormData({...assignFormData, targetDate: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Assignment Notes</label>
                  <textarea 
                    value={assignFormData.notes}
                    onChange={(e) => setAssignFormData({...assignFormData, notes: e.target.value})}
                    rows="3"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="cancel-btn" onClick={() => setIsAssignModalOpen(false)}>{t('btn_cancel')}</button>
                <button type="submit" className="save-btn" disabled={loading}>{t('btn_save')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Resolve Modal */}
      {isResolveModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{t('btn_mark_resolved')}</h2>
              <button className="close-btn" onClick={() => setIsResolveModalOpen(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleResolveBlocker}>
              <div className="modal-content">
                <div className="form-group">
                  <label>Resolution Notes *</label>
                  <textarea 
                    value={resolveFormData.resolutionNotes}
                    onChange={(e) => setResolveFormData({...resolveFormData, resolutionNotes: e.target.value})}
                    placeholder="Describe how the issue was resolved..."
                    rows="4"
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="cancel-btn" onClick={() => setIsResolveModalOpen(false)}>{t('btn_cancel')}</button>
                <button type="submit" className="save-btn" disabled={loading}>{t('stat_resolved')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Request Info Modal */}
      {isRequestInfoModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{t('status_info_requested')}</h2>
              <button className="close-btn" onClick={() => setIsRequestInfoModalOpen(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleRequestInfo}>
              <div className="modal-content">
                <div className="form-group">
                  <label>Information Needed *</label>
                  <textarea 
                    value={resolveFormData.resolutionNotes}
                    onChange={(e) => setResolveFormData({...resolveFormData, resolutionNotes: e.target.value})}
                    placeholder="Describe what information is missing..."
                    rows="4"
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="cancel-btn" onClick={() => setIsRequestInfoModalOpen(false)}>{t('btn_cancel')}</button>
                <button type="submit" className="save-btn" disabled={loading}>{t('btn_post')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Duplicate Modal */}
      {isDuplicateModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Mark as Duplicate</h2>
              <button className="close-btn" onClick={() => setIsDuplicateModalOpen(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleMarkDuplicate}>
              <div className="modal-content">
                <div className="form-group">
                  <label>Duplicate Of Blocker ID *</label>
                  <input 
                    type="number" 
                    value={duplicateFormData.duplicateOfId}
                    onChange={(e) => setDuplicateFormData({...duplicateFormData, duplicateOfId: e.target.value})}
                    placeholder="Enter the original blocker ID"
                    required
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="cancel-btn" onClick={() => setIsDuplicateModalOpen(false)}>{t('btn_cancel')}</button>
                <button type="submit" className="save-btn" disabled={loading}>{t('btn_save')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Report Modal */}
      {isReportModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{t('btn_report_blocker')}</h2>
              <button className="close-btn" onClick={() => setIsReportModalOpen(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleReportBlocker}>
              <div className="modal-content">
                <div className="form-group">
                  <label>{t('field_affected_work')} *</label>
                  <select 
                    value={reportFormData.workId} 
                    onChange={(e) => setReportFormData({...reportFormData, workId: e.target.value})}
                    required
                  >
                    <option value="">Select Work</option>
                    {activeWorks.map(w => (
                      <option key={w.id} value={w.id}>{w.title} ({w.workCode})</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>{t('field_blocker_title')} *</label>
                  <input 
                    type="text" 
                    value={reportFormData.title}
                    onChange={(e) => setReportFormData({...reportFormData, title: e.target.value})}
                    placeholder="e.g., Cement supply shortage"
                    required
                  />
                </div>
                <div className="form-grid">
                  <div className="form-group">
                    <label>{t('field_blocker_type')}</label>
                    <select value={reportFormData.type} onChange={(e) => setReportFormData({...reportFormData, type: e.target.value})}>
                      <option value="Material Shortage">{t('type_material_shortage')}</option>
                      <option value="Labor Availability">{t('type_labor_availability')}</option>
                      <option value="Fund Issues">{t('type_fund_issues')}</option>
                      <option value="Technical Issue">{t('type_technical_issue')}</option>
                      <option value="Administrative Delay">{t('type_admin_delay')}</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>{t('field_priority')}</label>
                    <select value={reportFormData.priority} onChange={(e) => setReportFormData({...reportFormData, priority: e.target.value})}>
                      <option value="LOW">{t('priority_low')}</option>
                      <option value="MEDIUM">{t('priority_medium')}</option>
                      <option value="HIGH">{t('priority_high')}</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label>{t('field_description')} *</label>
                  <textarea 
                    value={reportFormData.description}
                    onChange={(e) => setReportFormData({...reportFormData, description: e.target.value})}
                    rows="3"
                    required
                  />
                </div>
                <div className="form-group">
                  <label>{t('field_impact')}</label>
                  <input 
                    type="text" 
                    value={reportFormData.impact}
                    onChange={(e) => setReportFormData({...reportFormData, impact: e.target.value})}
                    placeholder="e.g., Work stopped since 2 days"
                  />
                </div>
                <div className="form-group">
                  <label>{t('field_est_delay')}</label>
                  <input 
                    type="number" 
                    value={reportFormData.estimatedDelayDays}
                    onChange={(e) => setReportFormData({...reportFormData, estimatedDelayDays: e.target.value})}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="cancel-btn" onClick={() => setIsReportModalOpen(false)}>{t('btn_cancel')}</button>
                <button type="submit" className="save-btn" disabled={loading}>{t('btn_report_blocker')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .blocker-management { padding: 0; }
        .module-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .module-header h2 { margin: 0; font-size: 1.5rem; color: #1e293b; }
        .module-header p { margin: 0.25rem 0 0; color: #64748b; font-size: 0.9rem; }
        
        .create-btn { display: flex; align-items: center; gap: 0.5rem; background-color: #0ea5e9; color: white; border: none; padding: 0.6rem 1.2rem; border-radius: 0.5rem; cursor: pointer; font-weight: 600; }
        
        .stats-strip { display: flex; gap: 1rem; margin-bottom: 1.5rem; }
        .stat-item { background: white; padding: 1rem; border-radius: 0.75rem; flex: 1; text-align: center; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .stat-item .val { display: block; font-size: 1.5rem; font-weight: 700; color: #1e293b; }
        .stat-item .lab { font-size: 0.75rem; color: #64748b; text-transform: uppercase; }
        
        .filters-row { display: flex; gap: 1rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
        .search-group { display: flex; align-items: center; gap: 0.5rem; background: white; border: 1px solid #e2e8f0; border-radius: 0.5rem; padding: 0.5rem 0.75rem; flex: 1; min-width: 250px; }
        .search-group input { border: none; outline: none; flex: 1; }
        .filters-row select { padding: 0.5rem; border: 1px solid #e2e8f0; border-radius: 0.5rem; background: white; outline: none; }
        
        .blockers-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1rem; }
        .blocker-card { background: white; border: 1px solid #e2e8f0; border-radius: 0.75rem; padding: 1rem; position: relative; border-left: 4px solid #e2e8f0; transition: transform 0.2s; }
        .blocker-card:hover { transform: translateY(-2px); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
        .blocker-card.priority-high { border-left-color: #ef4444; }
        .blocker-card.priority-medium { border-left-color: #f59e0b; }
        .blocker-card.priority-low { border-left-color: #10b981; }
        
        .card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
        .blocker-id { font-size: 0.75rem; font-weight: 700; color: #94a3b8; }
        .badges { display: flex; gap: 0.4rem; }
        .p-badge, .s-badge { font-size: 0.65rem; font-weight: 700; padding: 0.15rem 0.5rem; border-radius: 9999px; }
        
        .blocker-title { margin: 0 0 0.5rem 0; font-size: 1rem; color: #1e293b; }
        .work-ref { display: flex; align-items: center; gap: 0.4rem; font-size: 0.75rem; color: #0ea5e9; margin-bottom: 0.75rem; }
        .description { font-size: 0.85rem; color: #475569; margin-bottom: 1rem; line-height: 1.4; }
        
        .card-meta { display: flex; justify-content: space-between; padding-top: 0.75rem; border-top: 1px solid #f1f5f9; margin-bottom: 1rem; }
        .meta-row { display: flex; align-items: center; gap: 0.3rem; font-size: 0.7rem; color: #94a3b8; }
        
        .view-btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.5rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0.5rem; cursor: pointer; font-size: 0.8rem; color: #475569; }
        .view-btn:hover { background: #f1f5f9; border-color: #cbd5e1; }
        
        /* Modal Content */
        .detail-layout { display: grid; grid-template-columns: 1.5fr 1fr; gap: 2rem; }
        .info-section { margin-bottom: 2rem; }
        .info-section h3 { margin: 0 0 1rem 0; font-size: 1rem; color: #1e293b; border-bottom: 2px solid #f1f5f9; padding-bottom: 0.5rem; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem; }
        .info-item label { display: block; font-size: 0.7rem; font-weight: 600; color: #94a3b8; text-transform: uppercase; margin-bottom: 0.25rem; }
        .info-item span { font-size: 0.9rem; color: #1e293b; font-weight: 500; }
        
        .priority-actions { display: flex; align-items: center; gap: 0.75rem; }
        .p-buttons { display: flex; gap: 0.25rem; }
        .p-buttons button { width: 20px; height: 20px; border-radius: 4px; border: none; font-size: 0.6rem; font-weight: 700; color: white; cursor: pointer; }
        .p-high { background: #ef4444; }
        .p-med { background: #f59e0b; }
        .p-low { background: #10b981; }
        
        .desc-block { margin-top: 1rem; }
        .desc-block label { display: block; font-size: 0.7rem; font-weight: 600; color: #94a3b8; text-transform: uppercase; margin-bottom: 0.25rem; }
        .desc-block p { margin: 0; font-size: 0.9rem; color: #475569; line-height: 1.5; background: #f8fafc; padding: 0.75rem; border-radius: 0.5rem; }
        
        .work-context-box { background: #f0f9ff; border: 1px solid #bae6fd; padding: 1rem; border-radius: 0.5rem; }
        .work-context-box p { margin: 0.25rem 0; font-size: 0.85rem; color: #0369a1; }
        
        .duplicate-info { margin-top: 1rem; display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem; background: #f1f5f9; border-radius: 0.5rem; font-size: 0.85rem; color: #475569; }
        
        .action-bar-blocker { display: flex; gap: 0.75rem; flex-wrap: wrap; margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid #f1f5f9; }
        .assign-action, .resolve-action, .escalate-action, .duplicate-action { display: flex; align-items: center; gap: 0.5rem; padding: 0.6rem 1rem; border: none; border-radius: 0.5rem; font-size: 0.85rem; font-weight: 600; cursor: pointer; }
        .assign-action { background: #e0f2fe; color: #0284c7; }
        .resolve-action { background: #dcfce7; color: #166534; }
        .escalate-action { background: #fee2e2; color: #dc2626; }
        .duplicate-action { background: #f1f5f9; color: #475569; }
        
        .detail-timeline h3 { margin: 0 0 1rem 0; font-size: 1rem; }
        .comments-container { background: #f8fafc; border-radius: 0.75rem; padding: 1rem; height: 400px; overflow-y: auto; margin-bottom: 1rem; display: flex; flex-direction: column; gap: 1rem; }
        .comment-bubble { background: white; padding: 0.75rem; border-radius: 0.5rem; border: 1px solid #e2e8f0; }
        .comment-meta { display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.4rem; font-size: 0.7rem; }
        .role-tag { background: #f1f5f9; color: #64748b; padding: 0.1rem 0.4rem; border-radius: 4px; font-weight: 600; }
        .comment-meta .time { color: #94a3b8; margin-left: auto; }
        .comment-bubble p { margin: 0; font-size: 0.85rem; color: #1e293b; }
        
        .comment-input-area { display: flex; flex-direction: column; gap: 0.5rem; }
        .comment-input-area textarea { padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: 0.5rem; resize: none; font-size: 0.85rem; }
        .comment-input-area button { align-self: flex-end; display: flex; align-items: center; gap: 0.4rem; background: #0ea5e9; color: white; border: none; padding: 0.5rem 1.2rem; border-radius: 0.5rem; font-weight: 600; cursor: pointer; }
        .comment-input-area button:disabled { opacity: 0.5; }
        
        /* Common Modal Styles */
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
        .modal { background: white; border-radius: 1rem; width: 100%; max-width: 500px; max-height: 90vh; overflow-y: auto; }
        .modal-xl { max-width: 1000px; width: 95%; }
        .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem; border-bottom: 1px solid #f1f5f9; }
        .modal-header h2 { margin: 0; font-size: 1.2rem; }
        .close-btn { background: none; border: none; cursor: pointer; color: #94a3b8; }
        .modal-content { padding: 1.5rem; }
        .modal-footer { display: flex; justify-content: flex-end; gap: 1rem; padding: 1.25rem 1.5rem; border-top: 1px solid #f1f5f9; }
        
        .form-group { display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 1rem; }
        .form-group label { font-size: 0.85rem; font-weight: 600; color: #475569; }
        .form-group input, .form-group select, .form-group textarea { padding: 0.6rem; border: 1px solid #d1d5db; border-radius: 0.4rem; font-size: 0.9rem; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        
        .cancel-btn { padding: 0.6rem 1.2rem; border: 1px solid #d1d5db; border-radius: 0.4rem; background: white; cursor: pointer; font-weight: 600; }
        .save-btn { padding: 0.6rem 1.2rem; border: none; border-radius: 0.4rem; background: #0ea5e9; color: white; cursor: pointer; font-weight: 600; }
        .escalate-btn-real { padding: 0.6rem 1.2rem; border: none; border-radius: 0.4rem; background: #ef4444; color: white; cursor: pointer; font-weight: 600; }
        
        .warning-text { color: #b91c1c; font-size: 0.85rem; background: #fef2f2; padding: 0.75rem; border-radius: 0.5rem; margin-bottom: 1rem; }
        .empty-state { text-align: center; padding: 3rem; color: #94a3b8; }
      `}</style>
    </div>
  );
};

const getPriorityColor = (p) => {
  switch(p) {
    case 'HIGH': return '#ef4444';
    case 'MEDIUM': return '#f59e0b';
    default: return '#10b981';
  }
};

export default BlockerManagement;
