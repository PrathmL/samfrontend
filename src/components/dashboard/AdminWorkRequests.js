import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Check, X, FileText, Eye, Briefcase, AlertTriangle, Search, Filter, Clock, CheckCircle, XCircle, ChevronRight, IndianRupee, MapPin, Tag, Calendar } from 'lucide-react';
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
    <div className="work-requests-admin">
      <div className="module-header">
        <h1>{t('title_work_requests')}</h1>
        <p>{t('msg_work_requests_description')}</p>
      </div>

      <div className="filter-section">
        <div className="search-bar">
          <Search size={20} />
          <input 
            type="text" 
            placeholder={`${t('btn_search')} ${t('field_school')}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="status-filter-box">
          <Filter size={18} />
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

      <div className="requests-table-wrapper">
        <table className="requests-table">
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
                <td className="title-cell">
                  <div className="req-title">{req.title}</div>
                  <div className="req-type">{req.type}</div>
                </td>
                <td>{req.schoolName}</td>
                <td>
                  <span className={`priority-tag ${getPriorityClass(req.priority)}`}>
                    {req.priority}
                  </span>
                </td>
                <td>
                  <span className={`status-pill-req ${req.status?.toLowerCase()}`}>
                    {req.status?.replace('_', ' ')}
                  </span>
                </td>
                <td>{new Date(req.createdAt).toLocaleDateString()}</td>
                <td>
                  <button className="review-btn" onClick={() => { setSelectedRequest(req); setIsModalOpen(true); setRemarks(''); }}>
                    {t('btn_review')} <ChevronRight size={16} />
                  </button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan="6" className="empty-row">{t('msg_no_requests')}</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && selectedRequest && (
        <div className="modal-overlay">
          <div className="modal modal-xl">
            <div className="modal-header">
              <div className="header-info">
                <span className="req-id">#{selectedRequest.id}</span>
                <h2>{selectedRequest.title}</h2>
              </div>
              <button className="close-x" onClick={() => setIsModalOpen(false)}><X size={24} /></button>
            </div>
            <div className="modal-content">
              <div className="review-layout">
                <div className="info-main">
                  <div className="info-grid-3">
                    <div className="info-card">
                      <label><MapPin size={14} /> {t('field_school')}</label>
                      <span>{selectedRequest.schoolName}</span>
                    </div>
                    <div className="info-card">
                      <label><Tag size={14} /> {t('field_type')} & {t('field_category')}</label>
                      <span>{selectedRequest.type} / {selectedRequest.category}</span>
                    </div>
                    <div className="info-card">
                      <label><Calendar size={14} /> {t('field_expected_timeline')}</label>
                      <span>{selectedRequest.expectedTimeline || 'Not specified'}</span>
                    </div>
                  </div>

                  <div className="description-box">
                    <h4>{t('field_description')}</h4>
                    <p>{selectedRequest.description}</p>
                  </div>

                  <div className="photos-section">
                    <h4>{t('field_photos')}</h4>
                    <div className="photo-grid-scroll">
                      {selectedRequest.photoUrls?.map((photo, i) => (
                        <div key={i} className="photo-item">
                          <img src={`http://localhost:8080${photo.url}`} alt={`Evidence ${i+1}`} />
                          {photo.latitude && photo.longitude && (
                            <div className="geotag-overlay">
                              <MapPin size={10} />
                              <span>{photo.latitude.toFixed(4)}, {photo.longitude.toFixed(4)}</span>
                            </div>
                          )}
                        </div>
                      ))}
                      {(!selectedRequest.photoUrls || selectedRequest.photoUrls.length === 0) && (
                        <p className="no-data">No photos provided by headmaster</p>
                      )}
                    </div>
                  </div>

                  {selectedRequest.quotation && (
                    <div className="quotation-summary-box">
                      <div className="box-header">
                        <h4>{t('label_quotation_details')}</h4>
                        <span className="total-badge">₹{selectedRequest.quotation.grandTotal?.toLocaleString()}</span>
                      </div>
                      <div className="quote-metrics">
                        <div className="metric">
                          <label>{t('field_material_cost')}</label>
                          <span>₹{selectedRequest.quotation.materialCost?.toLocaleString()}</span>
                        </div>
                        <div className="metric">
                          <label>{t('field_labor_cost')}</label>
                          <span>₹{selectedRequest.quotation.laborCost?.toLocaleString()}</span>
                        </div>
                        <div className="metric">
                          <label>{t('label_other_costs')}</label>
                          <span>₹{selectedRequest.quotation.additionalCosts?.toLocaleString()}</span>
                        </div>
                      </div>
                      {selectedRequest.quotation.materialDetails && (
                        <div className="material-notes">
                          <label>{t('label_material_details')}:</label>
                          <p>{selectedRequest.quotation.materialDetails}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="action-sidebar">
                  <div className="sidebar-sticky">
                    <div className="status-indicator">
                      <label>Current Status</label>
                      <div className={`status-pill-big ${selectedRequest.status?.toLowerCase()}`}>
                        {selectedRequest.status?.replace('_', ' ')}
                      </div>
                    </div>

                    <div className="remarks-box">
                      <label>{t('field_remarks')} / Rejection Reason</label>
                      <textarea 
                        placeholder="Enter approval remarks or rejection reason..."
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        rows="6"
                      />
                    </div>

                    {selectedRequest.status === 'PENDING_APPROVAL' && (
                      <div className="decision-buttons">
                        <button className="btn-approve-main" onClick={() => handleApprove(selectedRequest.id)}>
                          <CheckCircle size={20} /> Approve & Allocate
                        </button>
                        <button className="btn-reject-main" onClick={() => handleReject(selectedRequest.id)}>
                          <XCircle size={20} /> Reject Request
                        </button>
                      </div>
                    )}
                    
                    {selectedRequest.status === 'REJECTED' && (
                      <div className="rejection-info">
                        <label>Rejection Reason Given:</label>
                        <p>{selectedRequest.rejectionReason}</p>
                      </div>
                    )}

                    {selectedRequest.status === 'APPROVED' && (
                      <div className="approval-info">
                        <div className="info-row">
                          <Check size={16} className="text-success" />
                          <span>Approved on {new Date(selectedRequest.approvedAt).toLocaleDateString()}</span>
                        </div>
                        <button className="btn-create-work" onClick={() => navigate(`/admin/create-work/${selectedRequest.id}`)}>
                          Create Official Work
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .work-requests-admin { padding: 0; }
        .module-header { margin-bottom: 2rem; }
        .module-header h1 { margin: 0; font-size: 1.75rem; color: #1e293b; }
        .module-header p { margin: 0.25rem 0 0; color: #64748b; }

        .filter-section { display: flex; gap: 1rem; margin-bottom: 2rem; align-items: center; }
        .search-bar { flex: 1; position: relative; display: flex; align-items: center; }
        .search-bar svg { position: absolute; left: 1rem; color: #94a3b8; }
        .search-bar input { width: 100%; padding: 0.75rem 1rem 0.75rem 3rem; border: 1px solid #e2e8f0; border-radius: 0.75rem; outline: none; transition: border-color 0.2s; }
        .search-bar input:focus { border-color: #0ea5e9; box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1); }

        .status-filter-box { display: flex; align-items: center; gap: 0.75rem; background: white; padding: 0 1rem; border: 1px solid #e2e8f0; border-radius: 0.75rem; }
        .status-filter-box select { border: none; padding: 0.75rem 0; outline: none; font-weight: 600; color: #475569; background: transparent; cursor: pointer; }

        .requests-table-wrapper { background: white; border-radius: 1rem; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
        .requests-table { width: 100%; border-collapse: collapse; }
        .requests-table th { background: #f8fafc; padding: 1rem; text-align: left; font-size: 0.85rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #e2e8f0; }
        .requests-table td { padding: 1.25rem 1rem; border-bottom: 1px solid #f1f5f9; }
        .requests-table tr:last-child td { border-bottom: none; }
        .empty-row { text-align: center; color: #94a3b8; padding: 3rem !important; font-style: italic; }

        .title-cell { max-width: 300px; }
        .req-title { font-weight: 700; color: #1e293b; margin-bottom: 0.25rem; }
        .req-type { font-size: 0.75rem; color: #0ea5e9; font-weight: 600; text-transform: uppercase; }

        .priority-tag { padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; }
        .priority-urgent { background: #fee2e2; color: #dc2626; border: 1px solid #fecaca; }
        .priority-high { background: #ffedd5; color: #ea580c; border: 1px solid #fed7aa; }
        .priority-medium { background: #f0f9ff; color: #0284c7; border: 1px solid #bae6fd; }
        .priority-low { background: #f0fdf4; color: #16a34a; border: 1px solid #bbf7d0; }

        .status-pill-req { padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }
        .status-pill-req.pending_quotation { background: #f1f5f9; color: #64748b; }
        .status-pill-req.pending_approval { background: #fef3c7; color: #92400e; }
        .status-pill-req.approved { background: #dcfce7; color: #15803d; }
        .status-pill-req.rejected { background: #fee2e2; color: #b91c1c; }
        .status-pill-req.work_created { background: #e0f2fe; color: #0369a1; }

        .review-btn { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0.5rem; color: #475569; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .review-btn:hover { background: #1e293b; color: white; border-color: #1e293b; }

        /* Modal Styles */
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 23, 42, 0.75); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 2rem; }
        .modal-xl { max-width: 1200px !important; width: 100%; max-height: 90vh; }
        .modal { background: white; border-radius: 1.5rem; overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }
        
        .modal-header { padding: 1.5rem 2rem; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; background: #f8fafc; }
        .header-info { display: flex; align-items: center; gap: 1rem; }
        .req-id { font-family: monospace; font-weight: 800; color: #94a3b8; background: white; padding: 0.25rem 0.75rem; border-radius: 0.5rem; border: 1px solid #e2e8f0; }
        .modal-header h2 { margin: 0; font-size: 1.5rem; color: #1e293b; }
        .close-x { background: transparent; border: none; color: #64748b; cursor: pointer; padding: 0.5rem; border-radius: 0.5rem; transition: background 0.2s; }
        .close-x:hover { background: #f1f5f9; color: #1e293b; }

        .modal-content { padding: 0; overflow-y: auto; flex: 1; }
        .review-layout { display: grid; grid-template-columns: 1fr 380px; height: 100%; }
        
        .info-main { padding: 2rem; border-right: 1px solid #e2e8f0; }
        .info-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-bottom: 2rem; }
        .info-card { background: #f8fafc; padding: 1.25rem; border-radius: 1rem; border: 1px solid #e2e8f0; }
        .info-card label { display: flex; align-items: center; gap: 0.5rem; font-size: 0.75rem; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 0.5rem; }
        .info-card span { display: block; font-size: 1.1rem; font-weight: 700; color: #1e293b; }

        .description-box { margin-bottom: 2rem; }
        .description-box h4, .photos-section h4 { font-size: 0.9rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 1rem; }
        .description-box p { line-height: 1.7; color: #334155; background: #fff; padding: 1.5rem; border-radius: 1rem; border: 1px solid #f1f5f9; font-size: 1.05rem; }

        .photo-grid-scroll { display: flex; gap: 1rem; overflow-x: auto; padding-bottom: 1rem; scrollbar-width: thin; }
        .photo-item { flex: 0 0 240px; height: 160px; border-radius: 0.75rem; overflow: hidden; border: 2px solid #f1f5f9; }
        .photo-item img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s; }
        .photo-item:hover img { transform: scale(1.05); }
        .no-data { color: #94a3b8; font-style: italic; }

        .quotation-summary-box { background: #f0f9ff; border-radius: 1.25rem; border: 1px solid #bae6fd; padding: 1.5rem; margin-top: 2rem; }
        .box-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .box-header h4 { margin: 0; color: #0369a1; }
        .total-badge { background: #0ea5e9; color: white; padding: 0.5rem 1.25rem; border-radius: 9999px; font-weight: 800; font-size: 1.25rem; }
        
        .quote-metrics { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 1.5rem; }
        .metric { background: white; padding: 1rem; border-radius: 0.75rem; border: 1px solid #e0f2fe; }
        .metric label { display: block; font-size: 0.7rem; font-weight: 700; color: #0ea5e9; text-transform: uppercase; margin-bottom: 0.25rem; }
        .metric span { font-size: 1.1rem; font-weight: 700; color: #1e293b; }
        
        .material-notes { background: rgba(255,255,255,0.5); padding: 1rem; border-radius: 0.75rem; }
        .material-notes label { font-weight: 700; font-size: 0.8rem; color: #0369a1; margin-bottom: 0.5rem; display: block; }
        .material-notes p { margin: 0; color: #334155; font-size: 0.95rem; line-height: 1.5; }

        /* Action Sidebar */
        .action-sidebar { background: #f8fafc; padding: 2rem; position: relative; }
        .sidebar-sticky { position: sticky; top: 0; display: flex; flex-direction: column; gap: 2rem; }
        
        .status-indicator label, .remarks-box label { display: block; font-size: 0.75rem; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 0.75rem; }
        .status-pill-big { display: inline-block; padding: 0.5rem 1.25rem; border-radius: 9999px; font-weight: 800; font-size: 0.9rem; text-transform: uppercase; }
        .status-pill-big.pending_approval { background: #fef3c7; color: #92400e; border: 2px solid #fde68a; }
        .status-pill-big.approved { background: #dcfce7; color: #15803d; border: 2px solid #bbf7d0; }
        .status-pill-big.rejected { background: #fee2e2; color: #b91c1c; border: 2px solid #fecaca; }

        .remarks-box textarea { width: 100%; border: 1px solid #cbd5e1; border-radius: 0.75rem; padding: 1rem; outline: none; transition: border-color 0.2s; font-family: inherit; resize: none; }
        .remarks-box textarea:focus { border-color: #0ea5e9; box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1); }

        .decision-buttons { display: flex; flex-direction: column; gap: 0.75rem; }
        .btn-approve-main { display: flex; align-items: center; justify-content: center; gap: 0.75rem; padding: 1rem; background: #10b981; color: white; border: none; border-radius: 0.75rem; font-weight: 700; font-size: 1rem; cursor: pointer; transition: all 0.2s; }
        .btn-approve-main:hover { background: #059669; transform: translateY(-2px); }
        .btn-reject-main { display: flex; align-items: center; justify-content: center; gap: 0.75rem; padding: 1rem; background: white; color: #ef4444; border: 2px solid #ef4444; border-radius: 0.75rem; font-weight: 700; cursor: pointer; transition: all 0.2s; }
        .btn-reject-main:hover { background: #fee2e2; }

        .rejection-info, .approval-info { background: white; padding: 1.5rem; border-radius: 1rem; border: 1px solid #e2e8f0; }
        .rejection-info p { color: #dc2626; margin-top: 0.5rem; line-height: 1.5; font-weight: 600; }
        .info-row { display: flex; align-items: center; gap: 0.5rem; font-weight: 700; color: #15803d; margin-bottom: 1rem; }
        .btn-create-work { width: 100%; padding: 0.75rem; background: #1e293b; color: white; border: none; border-radius: 0.5rem; font-weight: 600; cursor: pointer; }
        .btn-create-work:hover { background: #0f172a; }
        
        .text-success { color: #10b981; }
      `}</style>
    </div>
  );
};

export default AdminWorkRequests;
