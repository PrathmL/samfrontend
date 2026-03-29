import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Check, X, FileText, Eye, Briefcase, AlertTriangle, Search, Filter, Clock, CheckCircle, XCircle, ChevronRight, IndianRupee } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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
      await axios.put(`http://localhost:8080/api/work-requests/${id}/approve`, { remarks });
      setIsModalOpen(false);
      fetchRequests();
      // Redirect to create official work
      navigate(`/admin/create-work/${id}`);
    } catch (err) {
      alert('Failed to approve request');
    }
  };

  const handleReject = async (id) => {
    try {
      await axios.put(`http://localhost:8080/api/work-requests/${id}/reject`, { remarks });
      setIsModalOpen(false);
      fetchRequests();
    } catch (err) {
      alert('Failed to reject request');
    }
  };

  const filteredRequests = requests.filter(req => {
    const matchesSearch = req.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         req.schoolName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="work-requests-admin">
      <div className="module-header">
        <h1>{t('title_work_requests')}</h1>
        <p>Review and process infrastructure development proposals from schools</p>
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
            <option value="ALL">All Status</option>
            <option value="PENDING_APPROVAL">Pending Approval</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="WORK_CREATED">Work Created</option>
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
            {filteredRequests.map(req => (
              <tr key={req.id}>
                <td className="title-cell">
                  <div className="req-title">{req.title}</div>
                  <div className="req-type">{req.type}</div>
                </td>
                <td>{req.schoolName}</td>
                <td>
                  <span className={`priority-tag ${req.priority?.toLowerCase()}`}>
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
                  <button className="review-btn" onClick={() => { setSelectedRequest(req); setIsModalOpen(true); }}>
                    {t('btn_review')} <ChevronRight size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && selectedRequest && (
        <div className="modal-overlay">
          <div className="modal modal-lg">
            <div className="modal-header">
              <h2>Request Review: {selectedRequest.title}</h2>
              <button onClick={() => setIsModalOpen(false)}><X size={24} /></button>
            </div>
            <div className="modal-content">
              <div className="review-grid">
                <div className="req-details-panel">
                  <section className="detail-section">
                    <h4>{t('field_description')}</h4>
                    <p>{selectedRequest.description}</p>
                  </section>
                  
                  <section className="detail-section">
                    <h4>Expected Benefits</h4>
                    <p>{selectedRequest.expectedBenefits}</p>
                  </section>

                  {selectedRequest.estimatedCost && (
                    <section className="detail-section highlight">
                      <div className="cost-label">Estimated Cost</div>
                      <div className="cost-value">₹{selectedRequest.estimatedCost.toLocaleString()}</div>
                    </section>
                  )}
                </div>

                <div className="decision-panel">
                  <label>{t('field_remarks')}</label>
                  <textarea 
                    placeholder="Enter your approval/rejection remarks here..."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                  />
                  
                  <div className="decision-actions">
                    <button className="reject-btn" onClick={() => handleReject(selectedRequest.id)}>
                      <XCircle size={18} /> {t('btn_reject')}
                    </button>
                    <button className="approve-btn" onClick={() => handleApprove(selectedRequest.id)}>
                      <CheckCircle size={18} /> {t('btn_approve')} & Proceed
                    </button>
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
        .search-bar input { width: 100%; padding: 0.75rem 1rem 0.75rem 3rem; border: 1px solid #e2e8f0; border-radius: 0.75rem; outline: none; }

        .status-filter-box { display: flex; align-items: center; gap: 0.75rem; background: white; padding: 0 1rem; border: 1px solid #e2e8f0; border-radius: 0.75rem; }
        .status-filter-box select { border: none; padding: 0.75rem 0; outline: none; font-weight: 600; color: #475569; }

        .requests-table-wrapper { background: white; border-radius: 1rem; border: 1px solid #e2e8f0; overflow: hidden; }
        .requests-table { width: 100%; border-collapse: collapse; }
        .requests-table th { background: #f8fafc; padding: 1rem; text-align: left; font-size: 0.85rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
        .requests-table td { padding: 1.25rem 1rem; border-top: 1px solid #f1f5f9; }

        .title-cell { max-width: 300px; }
        .req-title { font-weight: 700; color: #1e293b; margin-bottom: 0.25rem; }
        .req-type { font-size: 0.75rem; color: #0ea5e9; font-weight: 600; text-transform: uppercase; }

        .priority-tag { padding: 0.2rem 0.6rem; border-radius: 9999px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; }
        .priority-tag.high { background: #fee2e2; color: #dc2626; }
        .priority-tag.medium { background: #fef3c7; color: #d97706; }
        .priority-tag.low { background: #dcfce7; color: #16a34a; }

        .status-pill-req { padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }
        .status-pill-req.pending_approval { background: #fef3c7; color: #d97706; }
        .status-pill-req.approved { background: #dcfce7; color: #16a34a; }
        .status-pill-req.work_created { background: #e0f2fe; color: #0ea5e9; }

        .review-btn { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0.5rem; color: #475569; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .review-btn:hover { background: #1e293b; color: white; border-color: #1e293b; }

        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1100; }
        .modal-lg { max-width: 1000px !important; }
        .modal { background: white; border-radius: 1.5rem; width: 90%; overflow: hidden; }
        .modal-header { padding: 1.5rem; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
        .modal-content { padding: 2rem; }

        .review-grid { display: grid; grid-template-columns: 1fr 350px; gap: 2.5rem; }
        .detail-section { margin-bottom: 1.5rem; }
        .detail-section h4 { font-size: 0.9rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.75rem; }
        .detail-section p { line-height: 1.6; color: #334155; }
        .detail-section.highlight { background: #f0f9ff; padding: 1.25rem; border-radius: 1rem; border: 1px solid #bae6fd; }
        .cost-label { font-size: 0.8rem; font-weight: 700; color: #0ea5e9; text-transform: uppercase; margin-bottom: 0.25rem; }
        .cost-value { font-size: 1.5rem; font-weight: 800; color: #0369a1; }

        .decision-panel { display: flex; flex-direction: column; gap: 1.25rem; background: #f8fafc; padding: 1.5rem; border-radius: 1rem; border: 1px solid #e2e8f0; }
        .decision-panel label { font-weight: 700; color: #1e293b; }
        .decision-panel textarea { padding: 1rem; border: 1px solid #d1d5db; border-radius: 0.75rem; min-height: 150px; outline: none; }
        .decision-actions { display: flex; flex-direction: column; gap: 0.75rem; }
        .approve-btn { display: flex; align-items: center; justify-content: center; gap: 0.75rem; padding: 1rem; background: #10b981; color: white; border: none; border-radius: 0.75rem; font-weight: 700; cursor: pointer; }
        .reject-btn { display: flex; align-items: center; justify-content: center; gap: 0.75rem; padding: 1rem; background: white; color: #ef4444; border: 1px solid #ef4444; border-radius: 0.75rem; font-weight: 700; cursor: pointer; }
      `}</style>
    </div>
  );
};

export default AdminWorkRequests;
