import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { 
  Check, X, Eye, Clock, AlertTriangle, 
  Search, IndianRupee, Building2, Calendar, FileText
} from 'lucide-react';
import { showApprovalAlert, showInputAlert, showToast, showErrorAlert } from '../../utils/sweetAlertUtils';

const AdminFundRequests = () => {
  const { t } = useTranslation();
  const [quotations, setQuotations] = useState([]);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchFundRequests();
  }, []);

  const fetchFundRequests = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:8080/api/quotations/all'); // Need this endpoint
      // Filter for REPLENISHMENT type
      const fundReqs = (res.data || []).filter(q => q.quotationType === 'REPLENISHMENT');
      setQuotations(fundReqs);
    } catch (err) {
      console.error('Error fetching fund requests:', err);
      showErrorAlert('Error', 'Failed to fetch fund requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    const isConfirmed = await showApprovalAlert('fund request');
    if (isConfirmed) {
      setLoading(true);
      try {
        await axios.put(`http://localhost:8080/api/quotations/${id}/approve`, { remarks: 'Approved by Admin' });
        showToast('Fund request approved successfully', 'success');
        setIsModalOpen(false);
        fetchFundRequests();
      } catch (err) {
        showErrorAlert('Error', 'Failed to approve request');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleReject = async (id) => {
    const result = await showInputAlert('Reject Fund Request', 'Rejection Reason', 'Enter your reason for rejection...', true);
    if (result.isConfirmed && result.value) {
      setLoading(true);
      try {
        await axios.put(`http://localhost:8080/api/quotations/${id}/reject`, { remarks: result.value });
        showToast('Fund request rejected', 'success');
        setIsModalOpen(false);
        fetchFundRequests();
      } catch (err) {
        showErrorAlert('Error', 'Failed to reject request');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="admin-page-container">
      <div className="dashboard-header">
        <div className="header-text">
          <h1>{t('title_fund_requests')}</h1>
          <p>{t('msg_fund_requests_description')}</p>
        </div>
        <div className="header-actions">
          <div className="stats-mini">
            <div className="stat-mini-item">
              <span className="label">Pending</span>
              <span className="value">{quotations.filter(q => q.status === 'PENDING').length}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="section-card table-card">
        <div className="card-header">
          <h3><IndianRupee size={18} /> {t('title_fund_requests')}</h3>
          <div className="search-box">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search by School ID..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t('th_id')}</th>
                <th>{t('field_school')}</th>
                <th>{t('th_amount_requested')}</th>
                <th>{t('field_status')}</th>
                <th>{t('th_submitted_at')}</th>
                <th>{t('field_actions')}</th>
              </tr>
            </thead>
            <tbody>
              {quotations
                .filter(q => q.schoolId?.toString().includes(searchTerm))
                .map(q => (
                <tr key={q.id}>
                  <td className="font-mono text-xs font-bold text-slate-500">#Q-{q.id}</td>
                  <td>
                    <div className="school-info-cell">
                      <div className="school-icon"><Building2 size={16} /></div>
                      <div className="school-details">
                        <span className="school-id">School ID: {q.schoolId}</span>
                      </div>
                    </div>
                  </td>
                  <td className="amount-cell">₹{q.grandTotal?.toLocaleString('en-IN')}</td>
                  <td>
                    <span className={`status-badge ${q.status?.toLowerCase()}`}>
                      {q.status === 'PENDING' ? <Clock size={12} /> : null}
                      {q.status}
                    </span>
                  </td>
                  <td className="text-slate-500 text-sm">
                    <div className="date-cell">
                      <Calendar size={14} />
                      {new Date(q.submittedAt).toLocaleDateString('en-IN')}
                    </div>
                  </td>
                  <td>
                    <button className="btn-icon-text primary-ghost" onClick={() => { setSelectedQuotation(q); setIsModalOpen(true); }}>
                      <Eye size={16} /> {t('btn_review')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {quotations.length === 0 && !loading && (
            <div className="empty-state">
              <FileText size={48} />
              <p>{t('msg_no_fund_requests')}</p>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && selectedQuotation && (
        <div className="modal-overlay">
          <div className="modal-container modal-lg">
            <div className="modal-header">
              <div className="modal-title-area">
                <h2>{t('title_review_fund_request')}</h2>
                <span className="modal-subtitle">#Q-{selectedQuotation.id} • School ID: {selectedQuotation.schoolId}</span>
              </div>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <div className="details-grid">
                <div className="details-main">
                  <div className="detail-section">
                    <h4 className="section-title">{t('label_items_requested')}</h4>
                    <div className="table-responsive">
                      <table className="mini-table">
                        <thead>
                          <tr>
                            <th>{t('th_material_id')}</th>
                            <th>{t('field_quantity')}</th>
                            <th>{t('field_unit_price')}</th>
                            <th>{t('field_total')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedQuotation.items?.map(item => (
                            <tr key={item.id}>
                              <td>{item.materialId}</td>
                              <td>{item.quantity}</td>
                              <td>₹{item.unitPrice?.toLocaleString('en-IN')}</td>
                              <td className="font-bold">₹{item.totalPrice?.toLocaleString('en-IN')}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="details-sidebar">
                  <div className="summary-card">
                    <h4 className="section-title">{t('label_request_summary')}</h4>
                    <div className="summary-items">
                      <div className="summary-item total">
                        <span className="label">{t('label_material_cost')}</span>
                        <span className="value">₹{selectedQuotation.materialCost?.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="summary-item">
                        <span className="label">Status</span>
                        <span className={`status-badge ${selectedQuotation.status?.toLowerCase()}`}>{selectedQuotation.status}</span>
                      </div>
                      <div className="summary-item vertical">
                        <span className="label">{t('label_justification')}</span>
                        <p className="justification-text">{selectedQuotation.materialDetails || 'No justification provided'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setIsModalOpen(false)}>{t('btn_close')}</button>
              {selectedQuotation.status === 'PENDING' && (
                <div className="action-buttons">
                  <button className="btn-danger-outline" onClick={() => handleReject(selectedQuotation.id)}>
                    <X size={16} /> {t('btn_reject')}
                  </button>
                  <button className="btn-success" onClick={() => handleApprove(selectedQuotation.id)}>
                    <Check size={16} /> {t('btn_approve_funds')}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .admin-page-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          color: #1e293b;
        }

        /* Page Header Styles are consistent with DashboardHome */
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 0.5rem;
        }

        .header-text h1 {
          font-size: 1.75rem;
          font-weight: 800;
          margin: 0;
          letter-spacing: -0.02em;
        }

        .header-text p {
          color: #64748b;
          margin: 0.25rem 0 0;
          font-size: 1rem;
        }

        .stats-mini {
          display: flex;
          gap: 1rem;
        }

        .stat-mini-item {
          background: white;
          padding: 0.5rem 1rem;
          border-radius: 0.75rem;
          border: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
        }

        .stat-mini-item .label {
          font-size: 0.7rem;
          text-transform: uppercase;
          font-weight: 700;
          color: #64748b;
        }

        .stat-mini-item .value {
          font-size: 1.1rem;
          font-weight: 800;
          color: #1e293b;
        }

        /* Section Card */
        .section-card {
          background: white;
          border-radius: 1rem;
          border: 1px solid #e2e8f0;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          overflow: hidden;
        }

        .card-header {
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid #f1f5f9;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .card-header h3 {
          font-size: 1.1rem;
          font-weight: 700;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: #1e293b;
        }

        .search-box {
          position: relative;
          display: flex;
          align-items: center;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          padding: 0 0.75rem;
          width: 300px;
          transition: all 0.2s ease;
        }

        .search-box:focus-within {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          background: white;
        }

        .search-box svg {
          color: #94a3b8;
        }

        .search-box input {
          border: none;
          background: transparent;
          padding: 0.6rem 0.5rem;
          outline: none;
          width: 100%;
          font-size: 0.9rem;
          color: #1e293b;
        }

        /* Table Styles */
        .table-responsive {
          overflow-x: auto;
        }

        .admin-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .admin-table th {
          background: #f8fafc;
          padding: 1rem 1.5rem;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #64748b;
          border-bottom: 1px solid #f1f5f9;
        }

        .admin-table td {
          padding: 1rem 1.5rem;
          border-bottom: 1px solid #f1f5f9;
          vertical-align: middle;
        }

        .admin-table tr:hover {
          background-color: #fcfcfd;
        }

        .school-info-cell {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .school-icon {
          width: 32px;
          height: 32px;
          background: #eff6ff;
          color: #3b82f6;
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .school-id {
          font-weight: 600;
          font-size: 0.95rem;
          color: #334155;
        }

        .amount-cell {
          font-weight: 700;
          color: #1e293b;
          font-size: 1rem;
        }

        .date-cell {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.35rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
        }

        .status-badge.pending { background: #fff7ed; color: #ea580c; border: 1px solid #ffedd5; }
        .status-badge.approved { background: #f0fdf4; color: #16a34a; border: 1px solid #dcfce7; }
        .status-badge.rejected { background: #fef2f2; color: #dc2626; border: 1px solid #fee2e2; }

        /* Buttons */
        .btn-icon-text {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          font-weight: 600;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .primary-ghost {
          background: #f1f5f9;
          color: #475569;
          border: 1px solid #e2e8f0;
        }

        .primary-ghost:hover {
          background: #e2e8f0;
          color: #1e293b;
        }

        .btn-success { background: #10b981; color: white; border: none; }
        .btn-success:hover { background: #059669; }
        
        .btn-danger-outline { background: white; color: #ef4444; border: 1px solid #ef4444; }
        .btn-danger-outline:hover { background: #fef2f2; }

        .btn-secondary { background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(4px);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          padding: 2rem;
        }

        .modal-container {
          background: white;
          border-radius: 1.25rem;
          width: 100%;
          max-width: 900px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          animation: modalSlideUp 0.3s ease-out;
        }

        @keyframes modalSlideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        .modal-header {
          padding: 1.5rem;
          border-bottom: 1px solid #f1f5f9;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .modal-title-area h2 { margin: 0; font-size: 1.25rem; font-weight: 800; color: #1e293b; }
        .modal-subtitle { color: #64748b; font-size: 0.85rem; font-weight: 500; }

        .close-btn { background: none; border: none; color: #94a3b8; cursor: pointer; padding: 0.25rem; }
        .close-btn:hover { color: #475569; }

        .modal-body { padding: 1.5rem; overflow-y: auto; }

        .details-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 1.5rem; }

        .section-title { font-size: 0.85rem; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em; margin: 0 0 1rem 0; }

        .mini-table { width: 100%; border-collapse: collapse; }
        .mini-table th { text-align: left; font-size: 0.75rem; color: #94a3b8; padding-bottom: 0.75rem; border-bottom: 1px solid #f1f5f9; }
        .mini-table td { padding: 0.75rem 0; border-bottom: 1px dashed #f1f5f9; font-size: 0.9rem; }

        .summary-card { background: #f8fafc; padding: 1.25rem; border-radius: 1rem; border: 1px solid #e2e8f0; }

        .summary-items { display: flex; flex-direction: column; gap: 1rem; }
        .summary-item { display: flex; justify-content: space-between; align-items: center; }
        .summary-item.total { padding-bottom: 1rem; border-bottom: 1px solid #e2e8f0; margin-bottom: 0.5rem; }
        .summary-item.total .value { font-size: 1.25rem; font-weight: 800; color: #3b82f6; }
        .summary-item.vertical { flex-direction: column; align-items: flex-start; gap: 0.5rem; }
        
        .summary-item .label { font-size: 0.8rem; font-weight: 600; color: #64748b; }
        .summary-item .value { font-weight: 700; color: #1e293b; }

        .justification-text { background: white; padding: 0.75rem; border-radius: 0.5rem; border: 1px solid #e2e8f0; font-size: 0.85rem; color: #475569; line-height: 1.5; width: 100%; }

        .modal-footer { padding: 1.25rem 1.5rem; border-top: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }
        .action-buttons { display: flex; gap: 0.75rem; }

        .empty-state { padding: 4rem 2rem; display: flex; flex-direction: column; align-items: center; gap: 1rem; color: #94a3b8; }
        .empty-state p { margin: 0; font-weight: 500; }

        @media (max-width: 768px) {
          .details-grid { grid-template-columns: 1fr; }
          .modal-overlay { padding: 1rem; }
          .search-box { width: 100%; }
          .card-header { flex-direction: column; align-items: stretch; gap: 1rem; }
        }
      `}</style>
    </div>
  );
};

export default AdminFundRequests;
