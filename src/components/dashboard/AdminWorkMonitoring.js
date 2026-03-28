import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
  Search, Filter, Eye, RefreshCw, X, Briefcase, 
  Building2, MapPin, Clock, CheckCircle2, AlertTriangle,
  DollarSign, Calendar, Download, MoreHorizontal, MessageSquare,
  Image as ImageIcon, BarChart3, ArrowRight, Save, Edit2, XCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const AdminWorkMonitoring = () => {
  const { user } = useAuth();
  const [works, setWorks] = useState([]);
  const [filteredWorks, setFilteredWorks] = useState([]); 
  const [talukas, setTalukas] = useState([]);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [talukaFilter, setTalukaIdFilter] = useState('ALL');
  const [schoolFilter, setSchoolIdFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal State
  const [selectedWork, setSelectedWork] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSuspendModalOpen, setIsSuspendModalOpen] = useState(false);
  
  // Form States
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    sanctionedAmount: 0
  });
  const [suspendReason, setSuspendReason] = useState('');
  const [internalNotes, setInternalNotes] = useState('');

  const fetchWorks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:8080/api/works');
      setWorks(res.data || []);
    } catch (err) {
      console.error('Error fetching works:', err);
      setError('Failed to fetch works');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTalukas = useCallback(async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/talukas');
      setTalukas(res.data || []);
    } catch (err) {
      console.error('Error fetching talukas:', err);
    }
  }, []);

  const fetchSchools = useCallback(async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/schools');
      setSchools(res.data || []);
    } catch (err) {
      console.error('Error fetching schools:', err);
    }
  }, []);

  useEffect(() => {
    fetchWorks();
    fetchTalukas();
    fetchSchools();
  }, [fetchWorks, fetchTalukas, fetchSchools]);

  const renderSegmentedProgressBar = (work) => {
    if (!work.stages || work.stages.length === 0) {
      return (
        <div className="bar-bg">
          <div className="bar-fill" style={{ width: `${work.progressPercentage}%` }}></div>
        </div>
      );
    }

    return (
      <div className="segmented-progress-container-table">
        <div className="segmented-progress-bar-table">
          {work.stages.map((stage, idx) => (
            <div 
              key={idx} 
              className="progress-segment-table" 
              style={{ width: `${stage.weightage}%` }}
              title={`${stage.name}: ${stage.progressPercentage}%`}
            >
              <div 
                className={`segment-fill-table ${stage.status?.toLowerCase()}`} 
                style={{ width: `${stage.progressPercentage}%` }}
              ></div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const applyFilters = useCallback(() => {
    let filtered = [...works];

    if (searchTerm) {
      filtered = filtered.filter(w => 
        w.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        w.workCode?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (talukaFilter !== 'ALL') {
      const schoolIdsInTaluka = schools
        .filter(s => s.talukaId === parseInt(talukaFilter))
        .map(s => s.id);
      filtered = filtered.filter(w => schoolIdsInTaluka.includes(w.schoolId));
    }

    if (schoolFilter !== 'ALL') {
      filtered = filtered.filter(w => w.schoolId === parseInt(schoolFilter));
    }

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(w => w.status === statusFilter);
    }

    return filtered;
  }, [works, searchTerm, talukaFilter, schoolFilter, statusFilter, schools]);

  const handleUpdateWork = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(`http://localhost:8080/api/works/${selectedWork.id}`, editFormData);
      setSuccess('Work updated successfully');
      setIsEditModalOpen(false);
      fetchWorks();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update work');
    } finally {
      setLoading(false);
    }
  };

  const handleSuspendWork = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`http://localhost:8080/api/works/${selectedWork.id}/suspend`, {
        reason: suspendReason
      });
      setSuccess('Work suspended');
      setIsSuspendModalOpen(false);
      setSuspendReason('');
      fetchWorks();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to suspend work');
    } finally {
      setLoading(false);
    }
  };

  const handleResumeWork = async (id) => {
    if (!window.confirm('Are you sure you want to resume this work?')) return;
    setLoading(true);
    try {
      await axios.post(`http://localhost:8080/api/works/${id}/resume`);
      setSuccess('Work resumed successfully');
      fetchWorks();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to resume work');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotes = async () => {
    try {
      await axios.post(`http://localhost:8080/api/works/${selectedWork.id}/notes`, {
        notes: internalNotes
      });
      setSuccess('Internal notes saved');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to save notes');
    }
  };

  const getStatusStyle = (status) => {
    switch(status) {
      case 'ACTIVE': return { bg: '#dcfce7', color: '#166534' };
      case 'IN_PROGRESS': return { bg: '#e0f2fe', color: '#0284c7' };
      case 'ON_HOLD': return { bg: '#fee2e2', color: '#991b1b' };
      case 'COMPLETED': return { bg: '#f3e8ff', color: '#6b21a8' };
      case 'PENDING_CLOSURE': return { bg: '#fef3c7', color: '#92400e' };
      default: return { bg: '#f1f5f9', color: '#475569' };
    }
  };

  const currentFilteredWorks = applyFilters();

  return (
    <div className="admin-work-monitoring">
      <div className="module-header">
        <div>
          <h2>Work Monitoring</h2>
          <p>Track progress and manage all active works across the district</p>
        </div>
        <div className="header-actions">
          <button className="export-btn">
            <Download size={18} /> Export List
          </button>
        </div>
      </div>

      {error && <div className="alert error"><AlertTriangle size={18} /> {error} <X size={16} onClick={() => setError('')} /></div>}
      {success && <div className="alert success"><CheckCircle2 size={18} /> {success} <X size={16} onClick={() => setSuccess('')} /></div>}

      {/* Filters Bar */}
      <div className="filters-bar">
        <div className="search-box">
          <Search size={18} />
          <input 
            type="text" 
            placeholder="Search by code or title..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filters-group">
          <div className="filter-item">
            <MapPin size={16} />
            <select value={talukaFilter} onChange={(e) => setTalukaIdFilter(e.target.value)}>
              <option value="ALL">All Talukas</option>
              {talukas.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div className="filter-item">
            <Building2 size={16} />
            <select value={schoolFilter} onChange={(e) => setSchoolIdFilter(e.target.value)}>
              <option value="ALL">All Schools</option>
              {schools.filter(s => talukaFilter === 'ALL' || s.talukaId === parseInt(talukaFilter)).map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="filter-item">
            <Filter size={16} />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="ON_HOLD">On Hold</option>
              <option value="COMPLETED">Completed</option>
              <option value="PENDING_CLOSURE">Pending Closure</option>
            </select>
          </div>
        </div>
      </div>

      {/* Works Table */}
      <div className="table-container">
        <table className="works-table">
          <thead>
            <tr>
              <th>Work Code</th>
              <th>Work Title</th>
              <th>School & Taluka</th>
              <th>Status</th>
              <th>Progress</th>
              <th>Last Update</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentFilteredWorks.map(work => {
              const statusStyle = getStatusStyle(work.status);
              const school = schools.find(s => s.id === work.schoolId);
              const taluka = talukas.find(t => t.id === school?.talukaId);
              
              return (
                <tr key={work.id}>
                  <td className="code-cell">#{work.workCode}</td>
                  <td className="title-cell">
                    <strong>{work.title}</strong>
                    <small>{work.type}</small>
                  </td>
                  <td className="meta-cell">
                    <div><Building2 size={12} /> {school?.name || 'Unknown School'}</div>
                    <div><MapPin size={12} /> {taluka?.name || 'Unknown Taluka'}</div>
                  </td>
                  <td>
                    <span className="status-badge" style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}>
                      {work.status?.replace('_', ' ')}
                    </span>
                  </td>
                  <td>
                    <div className="progress-mini-table">
                      {renderSegmentedProgressBar(work)}
                      <span>{work.progressPercentage}%</span>
                    </div>
                  </td>
                  <td className="date-cell">
                    <Clock size={12} />
                    {work.lastUpdateAt ? new Date(work.lastUpdateAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td>
                    <div className="action-btns">
                      <button className="icon-btn view" title="View Details" onClick={() => {
                        setSelectedWork(work);
                        setInternalNotes(work.internalNotes || '');
                        setIsDetailModalOpen(true);
                      }}>
                        <Eye size={18} />
                      </button>
                      <button className="icon-btn edit" title="Edit Work" onClick={() => {
                        setSelectedWork(work);
                        setEditFormData({
                          title: work.title,
                          description: work.description,
                          sanctionedAmount: work.sanctionedAmount
                        });
                        setIsEditModalOpen(true);
                      }}>
                        <Edit2 size={18} />
                      </button>
                      {work.status === 'ON_HOLD' ? (
                        <button className="icon-btn resume" title="Resume Work" onClick={() => handleResumeWork(work.id)}>
                          <RefreshCw size={18} />
                        </button>
                      ) : (
                        <button className="icon-btn suspend" title="Suspend Work" onClick={() => {
                          setSelectedWork(work);
                          setIsSuspendModalOpen(true);
                        }}>
                          <XCircle size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {currentFilteredWorks.length === 0 && (
          <div className="empty-state">
            <Briefcase size={48} />
            <p>No works found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {isDetailModalOpen && selectedWork && (
        <div className="modal-overlay">
          <div className="modal modal-xl">
            <div className="modal-header">
              <h2>Work Details: {selectedWork.title}</h2>
              <button className="close-btn" onClick={() => setIsDetailModalOpen(false)}><X size={24} /></button>
            </div>
            <div className="modal-content detail-view">
              <div className="detail-tabs">
                <div className="detail-main">
                  <div className="info-grid">
                    <div className="info-item">
                      <label>Work Code</label>
                      <span>{selectedWork.workCode}</span>
                    </div>
                    <div className="info-item">
                      <label>Status</label>
                      <span className="status-badge-large" style={getStatusStyle(selectedWork.status)}>
                        {selectedWork.status}
                      </span>
                    </div>
                    <div className="info-item">
                      <label>Progress</label>
                      <div className="progress-large">
                        <div className="bar-bg"><div className="bar-fill" style={{ width: `${selectedWork.progressPercentage}%` }}></div></div>
                        <span>{selectedWork.progressPercentage}%</span>
                      </div>
                    </div>
                    <div className="info-item">
                      <label>Sanctioned Amount</label>
                      <span className="amount">₹{selectedWork.sanctionedAmount?.toLocaleString()}</span>
                    </div>
                    <div className="info-item">
                      <label>Total Utilized</label>
                      <span className="amount utilized">₹{selectedWork.totalUtilized?.toLocaleString()}</span>
                    </div>
                    <div className="info-item">
                      <label>Remaining Balance</label>
                      <span className="amount balance">₹{(selectedWork.sanctionedAmount - selectedWork.totalUtilized)?.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="desc-box">
                    <label>Description</label>
                    <p>{selectedWork.description}</p>
                  </div>

                  {/* Stages */}
                  <div className="stages-section">
                    <h3>Stage-wise Progress</h3>
                    <div className="stages-list">
                      {selectedWork.stages?.map((stage, idx) => (
                        <div key={idx} className="stage-card-detail">
                          <div className="stage-top">
                            <strong>{stage.name}</strong>
                            <span className="weight">{stage.weightage}% weight</span>
                          </div>
                          <div className="progress-mini">
                            <div className="bar-bg"><div className="bar-fill" style={{ width: `${stage.progressPercentage}%` }}></div></div>
                            <span>{stage.progressPercentage}%</span>
                          </div>
                          <div className="stage-meta">
                            <span>Status: {stage.status}</span>
                            <span>Expected: {stage.expectedCompletionDate ? new Date(stage.expectedCompletionDate).toLocaleDateString() : 'N/A'}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Photo Gallery */}
                  <div className="photos-section">
                    <h3>Photo Gallery</h3>
                    <div className="photo-grid">
                      {selectedWork.progressUpdates?.flatMap(u => u.photoUrls || [])?.map((url, i) => (
                        <div key={i} className="photo-item">
                          <img src={`http://localhost:8080${url}`} alt="Progress" />
                        </div>
                      ))}
                      {!selectedWork.progressUpdates?.some(u => u.photoUrls?.length > 0) && <p className="no-data">No photos uploaded yet</p>}
                    </div>
                  </div>
                </div>

                <div className="detail-sidebar">
                  {/* Internal Notes */}
                  <div className="notes-section">
                    <h3>Internal Notes (Admin Only)</h3>
                    <textarea 
                      value={internalNotes} 
                      onChange={(e) => setInternalNotes(e.target.value)}
                      placeholder="Add private notes about this work..."
                    />
                    <button className="save-notes-btn" onClick={handleSaveNotes}>
                      <Save size={16} /> Save Notes
                    </button>
                  </div>

                  {/* Timeline */}
                  <div className="timeline-section">
                    <h3>Progress Updates</h3>
                    <div className="timeline-list">
                      {selectedWork.progressUpdates?.map((update, i) => (
                        <div key={i} className="timeline-item">
                          <div className="t-dot"></div>
                          <div className="t-content">
                            <div className="t-header">
                              <strong>{update.progressPercentage}%</strong>
                              <span>{new Date(update.updatedAt).toLocaleDateString()}</span>
                            </div>
                            <p>{update.remarks}</p>
                            <div className="t-meta">
                              <span>Cost: ₹{update.totalCost?.toLocaleString()}</span>
                              <span>By: {update.updatedBy}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                      {!selectedWork.progressUpdates?.length && <p className="no-data">No updates yet</p>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {isEditModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Edit Work Details</h2>
              <button className="close-btn" onClick={() => setIsEditModalOpen(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleUpdateWork}>
              <div className="modal-content">
                <div className="form-group">
                  <label>Work Title</label>
                  <input 
                    type="text" 
                    value={editFormData.title} 
                    onChange={(e) => setEditFormData({...editFormData, title: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Sanctioned Amount (₹)</label>
                  <input 
                    type="number" 
                    value={editFormData.sanctionedAmount} 
                    onChange={(e) => setEditFormData({...editFormData, sanctionedAmount: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea 
                    value={editFormData.description} 
                    onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                    rows="4"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="cancel-btn" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                <button type="submit" className="save-btn" disabled={loading}>Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Suspend Modal */}
      {isSuspendModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Suspend Work</h2>
              <button className="close-btn" onClick={() => setIsSuspendModalOpen(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleSuspendWork}>
              <div className="modal-content">
                <p className="warning-text">Are you sure you want to suspend this work? This will mark it as ON HOLD.</p>
                <div className="form-group">
                  <label>Reason for Suspension *</label>
                  <textarea 
                    value={suspendReason} 
                    onChange={(e) => setSuspendReason(e.target.value)}
                    rows="4"
                    required
                    placeholder="Provide a detailed reason for suspending this work..."
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="cancel-btn" onClick={() => setIsSuspendModalOpen(false)}>Cancel</button>
                <button type="submit" className="suspend-btn-real" disabled={loading}>Suspend Work</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .admin-work-monitoring { padding: 0; }
        .module-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
        .module-header h2 { margin: 0; font-size: 1.75rem; color: #1e293b; }
        .module-header p { margin: 0.25rem 0 0; color: #64748b; }
        
        .export-btn { display: flex; align-items: center; gap: 0.5rem; background: white; border: 1px solid #e2e8f0; padding: 0.6rem 1.2rem; border-radius: 0.5rem; cursor: pointer; font-weight: 600; color: #475569; }
        .export-btn:hover { background: #f8fafc; border-color: #cbd5e1; }

        .filters-bar { display: flex; gap: 1.5rem; margin-bottom: 2rem; align-items: center; }
        .search-box { display: flex; align-items: center; gap: 0.75rem; background: white; border: 1px solid #e2e8f0; border-radius: 0.75rem; padding: 0.6rem 1rem; flex: 1; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
        .search-box input { border: none; outline: none; flex: 1; font-size: 0.95rem; }
        
        .filters-group { display: flex; gap: 1rem; }
        .filter-item { display: flex; align-items: center; gap: 0.5rem; background: white; border: 1px solid #e2e8f0; border-radius: 0.75rem; padding: 0.5rem 0.75rem; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
        .filter-item select { border: none; outline: none; background: transparent; font-size: 0.9rem; color: #475569; min-width: 120px; }

        .table-container { background: white; border-radius: 1rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06); overflow: hidden; }
        .works-table { width: 100%; border-collapse: collapse; text-align: left; }
        .works-table th { background: #f8fafc; padding: 1.25rem 1.5rem; font-weight: 600; color: #475569; font-size: 0.875rem; text-transform: uppercase; letter-spacing: 0.025em; border-bottom: 1px solid #e2e8f0; }
        .works-table td { padding: 1.25rem 1.5rem; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
        
        .code-cell { font-family: monospace; font-weight: 700; color: #0ea5e9; }
        .title-cell strong { display: block; color: #1e293b; margin-bottom: 0.25rem; }
        .title-cell small { color: #64748b; font-size: 0.75rem; }
        
        .meta-cell { font-size: 0.8rem; color: #64748b; }
        .meta-cell div { display: flex; align-items: center; gap: 0.4rem; margin-bottom: 0.2rem; }
        
        .status-badge { padding: 0.35rem 0.8rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 700; display: inline-block; }
        
        .progress-mini { display: flex; align-items: center; gap: 0.75rem; width: 120px; }
        .bar-bg { flex: 1; height: 6px; background: #e2e8f0; border-radius: 10px; overflow: hidden; }
        .bar-fill { height: 100%; background: #0ea5e9; border-radius: 10px; transition: width 0.3s ease; }
        .progress-mini span { font-size: 0.8rem; font-weight: 600; color: #475569; min-width: 35px; }
        
        .progress-mini-table { display: flex; align-items: center; gap: 0.75rem; width: 150px; }
        .segmented-progress-container-table { flex: 1; }
        .segmented-progress-bar-table { height: 8px; background: #e2e8f0; border-radius: 4px; display: flex; overflow: hidden; gap: 1px; }
        .progress-segment-table { height: 100%; background: #f1f5f9; position: relative; }
        .segment-fill-table { height: 100%; transition: width 0.5s ease-out; }
        .segment-fill-table.completed { background: #10b981; }
        .segment-fill-table.in_progress { background: #3b82f6; }
        .segment-fill-table.pending { background: #cbd5e1; }

        .date-cell { display: flex; align-items: center; gap: 0.4rem; font-size: 0.85rem; color: #64748b; }
        
        .action-btns { display: flex; gap: 0.5rem; }
        .icon-btn { width: 36px; height: 36px; border-radius: 0.5rem; border: 1px solid #e2e8f0; background: white; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #64748b; transition: all 0.2s; }
        .icon-btn:hover { background: #f8fafc; color: #0ea5e9; border-color: #0ea5e9; }
        .icon-btn.suspend:hover { color: #ef4444; border-color: #ef4444; }
        .icon-btn.resume:hover { color: #10b981; border-color: #10b981; }

        /* Modal Styles */
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(4px); display: flex; justify-content: center; align-items: center; z-index: 1000; }
        .modal { background: white; border-radius: 1.25rem; width: 100%; max-width: 600px; max-height: 95vh; overflow-y: auto; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }
        .modal-xl { max-width: 1200px; width: 95%; }
        .modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem 2rem; border-bottom: 1px solid #f1f5f9; }
        .modal-header h2 { margin: 0; font-size: 1.5rem; color: #1e293b; }
        .close-btn { background: none; border: none; cursor: pointer; color: #94a3b8; }
        
        .detail-view { padding: 2rem; }
        .detail-layout { display: grid; grid-template-columns: 1fr 350px; gap: 3rem; }
        
        .info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-bottom: 2rem; }
        .info-item label { display: block; font-size: 0.75rem; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.5rem; }
        .info-item span { font-size: 1.1rem; font-weight: 600; color: #1e293b; }
        .amount { color: #0ea5e9; font-size: 1.25rem !important; }
        .amount.utilized { color: #f59e0b; }
        .amount.balance { color: #10b981; }
        
        .desc-box { background: #f8fafc; padding: 1.25rem; border-radius: 0.75rem; margin-bottom: 2rem; border: 1px solid #e2e8f0; }
        .desc-box label { display: block; font-size: 0.75rem; font-weight: 600; color: #94a3b8; text-transform: uppercase; margin-bottom: 0.75rem; }
        .desc-box p { margin: 0; color: #475569; line-height: 1.6; }
        
        .stages-section h3, .photos-section h3, .notes-section h3, .timeline-section h3 { margin: 0 0 1.25rem 0; font-size: 1.1rem; color: #1e293b; border-bottom: 2px solid #f1f5f9; padding-bottom: 0.5rem; }
        
        .stages-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
        .stage-card-detail { background: white; border: 1px solid #e2e8f0; border-radius: 0.75rem; padding: 1rem; }
        .stage-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; }
        .stage-top strong { font-size: 0.9rem; }
        .stage-top .weight { font-size: 0.7rem; color: #94a3b8; }
        .stage-meta { display: flex; flex-direction: column; gap: 0.25rem; margin-top: 0.75rem; font-size: 0.7rem; color: #64748b; }
        
        .photo-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 1rem; }
        .photo-item { border-radius: 0.5rem; overflow: hidden; aspect-ratio: 1; border: 1px solid #e2e8f0; }
        .photo-item img { width: 100%; height: 100%; object-fit: cover; }
        
        .detail-sidebar { border-left: 1px solid #f1f5f9; padding-left: 2rem; }
        .notes-section textarea { width: 100%; border: 1px solid #e2e8f0; border-radius: 0.75rem; padding: 1rem; min-height: 150px; font-size: 0.9rem; margin-bottom: 1rem; resize: none; }
        .save-notes-btn { width: 100%; background: #1e293b; color: white; border: none; padding: 0.75rem; border-radius: 0.5rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem; transition: background 0.2s; }
        .save-notes-btn:hover { background: #0f172a; }
        
        .timeline-list { display: flex; flex-direction: column; gap: 1.5rem; margin-top: 1.5rem; }
        .timeline-item { display: flex; gap: 1rem; position: relative; }
        .t-dot { width: 12px; height: 12px; border-radius: 50%; background: #0ea5e9; border: 3px solid #e0f2fe; z-index: 1; margin-top: 4px; }
        .timeline-item::after { content: ''; position: absolute; left: 5px; top: 16px; bottom: -20px; width: 2px; background: #f1f5f9; }
        .timeline-item:last-child::after { display: none; }
        .t-content { flex: 1; background: #f8fafc; padding: 0.75rem 1rem; border-radius: 0.75rem; border: 1px solid #f1f5f9; }
        .t-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
        .t-header strong { color: #0ea5e9; }
        .t-header span { font-size: 0.75rem; color: #94a3b8; }
        .t-content p { margin: 0 0 0.5rem 0; font-size: 0.85rem; color: #475569; }
        .t-meta { display: flex; gap: 1rem; font-size: 0.7rem; color: #94a3b8; }
        
        .action-bar-blocker { display: flex; gap: 1rem; margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid #f1f5f9; }
        
        .form-group { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1.25rem; }
        .form-group label { font-size: 0.875rem; font-weight: 600; color: #475569; }
        .form-group input, .form-group textarea { padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 0.95rem; }
        
        .modal-footer { display: flex; justify-content: flex-end; gap: 1rem; padding: 1.5rem 2rem; border-top: 1px solid #f1f5f9; }
        .cancel-btn { padding: 0.75rem 1.5rem; border: 1px solid #d1d5db; border-radius: 0.5rem; background: white; cursor: pointer; font-weight: 600; }
        .save-btn { padding: 0.75rem 1.5rem; border: none; border-radius: 0.5rem; background: #0ea5e9; color: white; cursor: pointer; font-weight: 600; }
        .suspend-btn-real { padding: 0.75rem 1.5rem; border: none; border-radius: 0.5rem; background: #ef4444; color: white; cursor: pointer; font-weight: 600; }
        
        .alert { display: flex; align-items: center; gap: 0.75rem; padding: 1rem; border-radius: 0.75rem; margin-bottom: 1.5rem; position: relative; }
        .alert.error { background: #fef2f2; color: #b91c1c; border: 1px solid #fee2e2; }
        .alert.success { background: #f0fdf4; color: #166534; border: 1px solid #dcfce7; }
        .alert svg:last-child { position: absolute; right: 1rem; cursor: pointer; }
        
        .warning-text { color: #b91c1c; font-size: 0.9rem; background: #fef2f2; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1.5rem; border-left: 4px solid #ef4444; }
        .empty-state { text-align: center; padding: 4rem; color: #94a3b8; }
        .no-data { text-align: center; color: #94a3b8; font-size: 0.85rem; padding: 1rem; }
      `}</style>
    </div>
  );
};

export default AdminWorkMonitoring;
