import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Check, X, FileText, Eye, Briefcase, AlertTriangle, Search, Filter, Clock, CheckCircle, XCircle, ChevronRight, IndianRupee, MapPin, Tag, Calendar, Building2, Camera } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { showErrorAlert, showWarningAlert, showToast, showApprovalAlert, showConfirmAlert } from '../../utils/sweetAlertUtils';

const AdminWorkRequests = () => {
  const { t } = useTranslation();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('PENDING_APPROVAL');
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:8080/api/work-requests');
      setRequests(res.data || []);
    } catch (err) {
      console.error('Error fetching work requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    try {
      await axios.post(`http://localhost:8080/api/work-requests/${id}/approve`, { remarks });
      showToast('Work request approved successfully', 'success');
      setIsModalOpen(false);
      fetchRequests();
      // Redirect to create official work
      navigate(`/admin/create-work/${id}`);
    } catch (err) {
      console.error('Approval error:', err);
      showErrorAlert('Error', 'Failed to approve request. Please check if the backend is running.');
    }
  };

  const handleReject = async (id) => {
    if (!remarks) {
      showWarningAlert('Remarks Required', 'Please provide a reason for rejection in the remarks field.');
      return;
    }
    try {
      await axios.post(`http://localhost:8080/api/work-requests/${id}/reject`, { reason: remarks });
      showToast('Work request rejected', 'success');
      setIsModalOpen(false);
      fetchRequests();
    } catch (err) {
      console.error('Rejection error:', err);
      showErrorAlert('Error', 'Failed to reject request');
    }
  };

  const filteredRequests = requests.filter(req => {
    const matchesSearch = req.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         req.schoolName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getPriorityClass = (priority) => {
    switch(priority?.toLowerCase()) {
      case 'urgent': return 'priority-urgent';
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return '';
    }
  };

  return (
    <div className="admin-page-container">
      <div className="dashboard-header">
        <div className="header-text">
          <h1>{t('title_work_requests')}</h1>
          <p>{t('msg_work_requests_description')}</p>
        </div>
        <div className="header-actions">
          <div className="stats-mini">
            <div className="stat-mini-item">
              <span className="label">Pending Approval</span>
              <span className="value text-amber-500">{requests.filter(r => r.status === 'PENDING_APPROVAL').length}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="section-card filter-card">
        <div className="filter-content">
          <div className="search-box">
            <Search size={18} />
            <input 
              type="text" 
              placeholder={`${t('btn_search')} ${t('field_school')}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <div className="select-wrapper">
              <Filter size={16} />
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="ALL">{t('opt_all_status')}</option>
                <option value="PENDING_QUOTATION">{t('opt_pending_quotation')}</option>
                <option value="PENDING_APPROVAL">{t('opt_pending_approval')}</option>
                <option value="APPROVED">{t('opt_approved')}</option>
                <option value="REJECTED">{t('opt_rejected')}</option>
                <option value="WORK_CREATED">{t('opt_work_created')}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="section-card table-card">
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t('field_title')}</th>
                <th>{t('field_school')}</th>
                <th>{t('field_priority')}</th>
                <th>{t('field_status')}</th>
                <th>{t('field_date')}</th>
                <th>{t('field_actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.length > 0 ? filteredRequests.map(req => (
                <tr key={req.id}>
                  <td>
                    <div className="work-title-cell">
                      <span className="work-title">{req.title}</span>
                      <span className="work-type-tag">{req.type}</span>
                    </div>
                  </td>
                  <td>
                    <div className="school-info-cell">
                      <Building2 size={16} className="text-slate-400" />
                      <span>{req.schoolName}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`priority-badge ${req.priority?.toLowerCase()}`}>
                      <AlertTriangle size={12} />
                      {req.priority}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge-outline ${req.status?.toLowerCase()}`}>
                      {req.status?.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="text-slate-500 text-sm">
                    <div className="date-cell">
                      <Calendar size={14} />
                      {new Date(req.createdAt).toLocaleDateString('en-IN')}
                    </div>
                  </td>
                  <td>
                    <button className="btn-icon-text primary-ghost" onClick={() => { setSelectedRequest(req); setIsModalOpen(true); setRemarks(''); }}>
                      <Eye size={16} /> {t('btn_review')}
                    </button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="6" className="empty-state-row">
                    <FileText size={48} className="text-slate-200" />
                    <p>{t('msg_no_requests')}</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && selectedRequest && (
        <div className="modal-overlay">
          <div className="modal-container modal-xl">
            <div className="modal-header">
              <div className="modal-title-area">
                <span className="modal-tag"># {selectedRequest.id}</span>
                <h2>{selectedRequest.title}</h2>
              </div>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <div className="modal-body custom-scrollbar">
              <div className="modal-layout">
                <div className="modal-main">
                  <div className="info-grid">
                    <div className="info-item">
                      <div className="info-icon blue"><MapPin size={20} /></div>
                      <div className="info-text">
                        <label>{t('field_school')}</label>
                        <span>{selectedRequest.schoolName}</span>
                      </div>
                    </div>
                    <div className="info-item">
                      <div className="info-icon orange"><Tag size={20} /></div>
                      <div className="info-text">
                        <label>{t('field_type')} & {t('field_category')}</label>
                        <span>{selectedRequest.type} / {selectedRequest.category}</span>
                      </div>
                    </div>
                    <div className="info-item">
                      <div className="info-icon green"><Calendar size={20} /></div>
                      <div className="info-text">
                        <label>{t('field_expected_timeline')}</label>
                        <span>{selectedRequest.expectedTimeline || 'Not specified'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="content-section">
                    <h4 className="section-title">{t('field_description')}</h4>
                    <p className="description-text">{selectedRequest.description}</p>
                  </div>

                  <div className="content-section">
                    <h4 className="section-title">{t('field_photos')}</h4>
                    <div className="photo-grid">
                      {selectedRequest.photoUrls?.map((photo, i) => (
                        <div key={i} className="photo-card">
                          <img src={`http://localhost:8080${photo.url}`} alt={`Evidence ${i+1}`} />
                          {photo.latitude && photo.longitude && (
                            <div className="geotag">
                              <MapPin size={12} />
                              <span>{photo.latitude.toFixed(4)}, {photo.longitude.toFixed(4)}</span>
                            </div>
                          )}
                        </div>
                      ))}
                      {(!selectedRequest.photoUrls || selectedRequest.photoUrls.length === 0) && (
                        <div className="no-photos">
                          <Camera size={32} />
                          <p>No photos provided by headmaster</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedRequest.quotation && (
                    <div className="quotation-card">
                      <div className="card-header-inner">
                        <h4 className="section-title"><IndianRupee size={16} /> {t('label_quotation_details')}</h4>
                        <span className="grand-total">₹{selectedRequest.quotation.grandTotal?.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="quote-grid">
                        <div className="quote-item">
                          <label>{t('field_material_cost')}</label>
                          <span className="val">₹{selectedRequest.quotation.materialCost?.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="quote-item">
                          <label>{t('field_labor_cost')}</label>
                          <span className="val">₹{selectedRequest.quotation.laborCost?.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="quote-item">
                          <label>{t('label_other_costs')}</label>
                          <span className="val">₹{selectedRequest.quotation.additionalCosts?.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                      {selectedRequest.quotation.materialDetails && (
                        <div className="quotation-notes">
                          <label>{t('label_material_details')}:</label>
                          <p>{selectedRequest.quotation.materialDetails}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="modal-sidebar">
                  <div className="sticky-sidebar">
                    <div className="sidebar-section">
                      <label className="sidebar-label">Current Status</label>
                      <span className={`status-badge-large ${selectedRequest.status?.toLowerCase()}`}>
                        {selectedRequest.status?.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="sidebar-section">
                      <label className="sidebar-label">{t('field_remarks')} / Rejection Reason</label>
                      <textarea 
                        className="remarks-textarea"
                        placeholder="Enter approval remarks or rejection reason..."
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        rows="5"
                      />
                    </div>

                    {selectedRequest.status === 'PENDING_APPROVAL' && (
                      <div className="action-stack">
                        <button className="btn-success-full" onClick={() => handleApprove(selectedRequest.id)}>
                          <CheckCircle size={20} /> Approve & Allocate
                        </button>
                        <button className="btn-danger-outline-full" onClick={() => handleReject(selectedRequest.id)}>
                          <XCircle size={20} /> Reject Request
                        </button>
                      </div>
                    )}
                    
                    {selectedRequest.status === 'REJECTED' && (
                      <div className="rejection-box">
                        <label>Rejection Reason Given:</label>
                        <p>{selectedRequest.rejectionReason}</p>
                      </div>
                    )}

                    {selectedRequest.status === 'APPROVED' && (
                      <div className="approval-box">
                        <div className="status-row">
                          <Check size={18} className="text-success" />
                          <span>Approved on {new Date(selectedRequest.approvedAt).toLocaleDateString('en-IN')}</span>
                        </div>
                        <button className="btn-primary-full" onClick={() => navigate(`/admin/create-work/${selectedRequest.id}`)}>
                          Create Official Work
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setIsModalOpen(false)}>{t('btn_close')}</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .admin-page-container { display: flex; flex-direction: column; gap: 1.5rem; color: #1e293b; }

        .dashboard-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 0.5rem; }
        .header-text h1 { font-size: 1.75rem; font-weight: 800; margin: 0; letter-spacing: -0.02em; }
        .header-text p { color: #64748b; margin: 0.25rem 0 0; font-size: 1rem; }

        .stats-mini { display: flex; gap: 1rem; }
        .stat-mini-item { background: white; padding: 0.5rem 1.25rem; border-radius: 0.75rem; border: 1px solid #e2e8f0; display: flex; flex-direction: column; min-width: 140px; }
        .stat-mini-item .label { font-size: 0.7rem; text-transform: uppercase; font-weight: 700; color: #64748b; margin-bottom: 0.15rem; }
        .stat-mini-item .value { font-size: 1.25rem; font-weight: 800; color: #1e293b; }
        .text-amber-500 { color: #f59e0b; }

        /* Filter Card */
        .filter-card { background: white; border-radius: 1rem; border: 1px solid #e2e8f0; padding: 1.25rem 1.5rem; }
        .filter-content { display: flex; justify-content: space-between; align-items: center; gap: 2rem; }

        .search-box { flex: 1; position: relative; display: flex; align-items: center; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0.75rem; padding: 0 1rem; transition: all 0.2s; }
        .search-box:focus-within { border-color: #3b82f6; background: white; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
        .search-box svg { color: #94a3b8; }
        .search-box input { border: none; background: transparent; padding: 0.75rem; outline: none; width: 100%; font-size: 0.95rem; }

        .select-wrapper { display: flex; align-items: center; gap: 0.75rem; background: #f8fafc; padding: 0 1rem; border: 1px solid #e2e8f0; border-radius: 0.75rem; }
        .select-wrapper select { border: none; background: transparent; padding: 0.75rem 0; outline: none; font-weight: 600; color: #475569; min-width: 180px; }

        /* Table Design */
        .admin-table { width: 100%; border-collapse: collapse; text-align: left; }
        .admin-table th { background: #f8fafc; padding: 1rem 1.5rem; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: #64748b; border-bottom: 1px solid #f1f5f9; }
        .admin-table td { padding: 1.25rem 1.5rem; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
        .admin-table tr:hover { background: #fcfcfd; }

        .work-title-cell { display: flex; flex-direction: column; gap: 0.25rem; }
        .work-title { font-weight: 700; color: #1e293b; font-size: 0.95rem; }
        .work-type-tag { font-size: 0.7rem; font-weight: 700; color: #3b82f6; text-transform: uppercase; }

        .school-info-cell { display: flex; align-items: center; gap: 0.75rem; color: #475569; }

        .priority-badge { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.3rem 0.75rem; border-radius: 9999px; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; }
        .priority-badge.urgent { background: #fef2f2; color: #dc2626; border: 1px solid #fee2e2; }
        .priority-badge.high { background: #fff7ed; color: #ea580c; border: 1px solid #ffedd5; }
        .priority-badge.medium { background: #eff6ff; color: #3b82f6; border: 1px solid #dbeafe; }
        .priority-badge.low { background: #f0fdf4; color: #16a34a; border: 1px solid #dcfce7; }

        .status-badge-outline { padding: 0.3rem 0.75rem; border-radius: 9999px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; border: 1px solid #e2e8f0; color: #64748b; }
        .status-badge-outline.pending_approval { background: #fffbeb; border-color: #fef3c7; color: #92400e; }
        .status-badge-outline.approved { background: #f0fdf4; border-color: #dcfce7; color: #15803d; }
        .status-badge-outline.rejected { background: #fef2f2; border-color: #fee2e2; color: #b91c1c; }
        .status-badge-outline.work_created { background: #eff6ff; border-color: #dbeafe; color: #1e40af; }

        .empty-state-row { text-align: center; padding: 4rem 2rem !important; }
        .empty-state-row p { margin-top: 1rem; color: #94a3b8; font-weight: 600; }

        /* Modal Redesign */
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 23, 42, 0.75); backdrop-filter: blur(4px); display: flex; justify-content: center; align-items: center; z-index: 1000; padding: 2rem; }
        .modal-container { background: white; border-radius: 1.5rem; width: 100%; max-height: 90vh; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }
        .modal-xl { max-width: 1200px; }
        .modal-header { padding: 1.5rem 2rem; background: #f8fafc; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }
        .modal-tag { font-family: monospace; background: white; padding: 0.25rem 0.75rem; border-radius: 0.5rem; border: 1px solid #e2e8f0; font-weight: 800; color: #64748b; font-size: 0.8rem; margin-bottom: 0.5rem; display: inline-block; }
        .modal-title-area h2 { margin: 0; font-size: 1.5rem; font-weight: 800; color: #1e293b; }
        .close-btn { background: transparent; border: none; color: #94a3b8; cursor: pointer; }

        .modal-body { padding: 0; overflow-y: auto; }
        .modal-layout { display: grid; grid-template-columns: 1fr 380px; }
        .modal-main { padding: 2.5rem; border-right: 1px solid #f1f5f9; }
        .modal-sidebar { padding: 2.5rem; background: #fcfcfd; }

        .info-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-bottom: 2.5rem; }
        .info-item { display: flex; gap: 1rem; align-items: center; }
        .info-icon { width: 44px; height: 44px; border-radius: 0.75rem; display: flex; align-items: center; justify-content: center; }
        .info-icon.blue { background: #eff6ff; color: #3b82f6; }
        .info-icon.orange { background: #fff7ed; color: #f97316; }
        .info-icon.green { background: #f0fdf4; color: #10b981; }
        .info-text label { display: block; font-size: 0.7rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; margin-bottom: 0.15rem; }
        .info-text span { font-weight: 700; color: #334155; }

        .content-section { margin-bottom: 2.5rem; }
        .section-title { font-size: 0.85rem; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em; margin-bottom: 1.25rem; display: flex; align-items: center; gap: 0.5rem; }
        .description-text { line-height: 1.7; color: #475569; background: #f8fafc; padding: 1.5rem; border-radius: 1rem; border: 1px solid #e2e8f0; margin: 0; }

        .photo-grid { display: flex; gap: 1rem; overflow-x: auto; padding-bottom: 0.5rem; }
        .photo-card { flex: 0 0 240px; height: 160px; border-radius: 1rem; overflow: hidden; position: relative; border: 1px solid #e2e8f0; }
        .photo-card img { width: 100%; height: 100%; object-fit: cover; }
        .geotag { position: absolute; bottom: 0; left: 0; right: 0; background: rgba(15, 23, 42, 0.7); color: white; padding: 0.4rem 0.75rem; font-size: 0.7rem; display: flex; align-items: center; gap: 0.4rem; }

        .quotation-card { background: #f0f9ff; border-radius: 1.5rem; border: 1px solid #bae6fd; padding: 1.75rem; }
        .card-header-inner { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .card-header-inner .section-title { margin: 0; color: #0369a1; }
        .grand-total { background: #0ea5e9; color: white; padding: 0.5rem 1.5rem; border-radius: 9999px; font-weight: 800; font-size: 1.5rem; }
        
        .quote-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
        .quote-item { background: white; padding: 1.25rem; border-radius: 1rem; border: 1px solid #e0f2fe; }
        .quote-item label { display: block; font-size: 0.7rem; font-weight: 700; color: #0ea5e9; text-transform: uppercase; margin-bottom: 0.25rem; }
        .quote-item .val { font-size: 1.1rem; font-weight: 700; color: #1e293b; }
        .quotation-notes { background: rgba(255,255,255,0.6); padding: 1.25rem; border-radius: 1rem; }
        .quotation-notes label { font-weight: 700; color: #0369a1; font-size: 0.85rem; display: block; margin-bottom: 0.5rem; }
        .quotation-notes p { margin: 0; line-height: 1.6; color: #334155; }

        /* Sidebar Elements */
        .sidebar-section { margin-bottom: 2rem; }
        .sidebar-label { display: block; font-size: 0.75rem; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 0.75rem; }
        .status-badge-large { display: inline-block; padding: 0.5rem 1.25rem; border-radius: 9999px; font-weight: 800; text-transform: uppercase; font-size: 0.9rem; border: 2px solid; }
        .status-badge-large.pending_approval { background: #fffbeb; border-color: #fef3c7; color: #92400e; }
        .status-badge-large.approved { background: #f0fdf4; border-color: #dcfce7; color: #15803d; }
        .status-badge-large.rejected { background: #fef2f2; border-color: #fee2e2; color: #b91c1c; }

        .remarks-textarea { width: 100%; border: 1px solid #e2e8f0; border-radius: 1rem; padding: 1.25rem; outline: none; transition: all 0.2s; font-family: inherit; resize: none; }
        .remarks-textarea:focus { border-color: #3b82f6; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1); }

        .action-stack { display: flex; flex-direction: column; gap: 0.75rem; }
        .btn-success-full { display: flex; align-items: center; justify-content: center; gap: 0.75rem; padding: 1rem; background: #10b981; color: white; border: none; border-radius: 0.75rem; font-weight: 700; font-size: 1rem; cursor: pointer; transition: all 0.2s; }
        .btn-success-full:hover { background: #059669; transform: translateY(-2px); }
        .btn-danger-outline-full { display: flex; align-items: center; justify-content: center; gap: 0.75rem; padding: 1rem; background: white; color: #ef4444; border: 2px solid #ef4444; border-radius: 0.75rem; font-weight: 700; cursor: pointer; transition: all 0.2s; }
        .btn-danger-outline-full:hover { background: #fef2f2; }

        .rejection-box { background: #fef2f2; padding: 1.5rem; border-radius: 1rem; border: 1px solid #fee2e2; }
        .rejection-box label { color: #b91c1c; font-weight: 800; font-size: 0.8rem; margin-bottom: 0.5rem; display: block; }
        .rejection-box p { margin: 0; color: #991b1b; line-height: 1.5; font-weight: 600; }

        .approval-box { background: #f0fdf4; padding: 1.5rem; border-radius: 1rem; border: 1px solid #dcfce7; }
        .status-row { display: flex; align-items: center; gap: 0.75rem; font-weight: 700; color: #15803d; margin-bottom: 1.25rem; }
        .btn-primary-full { width: 100%; padding: 0.85rem; background: #1e293b; color: white; border: none; border-radius: 0.75rem; font-weight: 700; cursor: pointer; }
        .btn-primary-full:hover { background: #0f172a; }

        .modal-footer { padding: 1.25rem 2.5rem; border-top: 1px solid #f1f5f9; display: flex; justify-content: flex-end; }
        .btn-secondary { background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; padding: 0.65rem 1.75rem; border-radius: 0.6rem; font-weight: 600; cursor: pointer; }

        @media (max-width: 1024px) {
          .modal-layout { grid-template-columns: 1fr; }
          .modal-main { border-right: none; }
          .filter-content { flex-direction: column; align-items: stretch; gap: 1rem; }
        }
      `}</style>
    </div>
  );
};

export default AdminWorkRequests;
