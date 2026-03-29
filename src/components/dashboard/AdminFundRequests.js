import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import { 
  Check, X, Eye, Clock, AlertTriangle, 
  Search, IndianRupee, Building2, Calendar, FileText
} from 'lucide-react';

const AdminFundRequests = () => {
  const { t } = useTranslation();
  const [quotations, setQuotations] = useState([]);
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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
      setError('Failed to fetch fund requests');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    if (window.confirm('Are you sure you want to approve this fund request?')) {
      setLoading(true);
      try {
        await axios.put(`http://localhost:8080/api/quotations/${id}/approve`, { remarks: 'Approved by Admin' });
        setSuccess('Fund request approved successfully');
        setIsModalOpen(false);
        fetchFundRequests();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError('Failed to approve request');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt('Enter rejection reason:');
    if (reason === null) return;

    setLoading(true);
    try {
      await axios.put(`http://localhost:8080/api/quotations/${id}/reject`, { remarks: reason });
      setSuccess('Fund request rejected');
      setIsModalOpen(false);
      fetchFundRequests();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to reject request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fund-requests-container">
      <div className="page-header">
        <h1>{t('title_fund_requests')}</h1>
        <p>{t('msg_fund_requests_description')}</p>
      </div>

      {success && <div className="alert success">{success}</div>}
      {error && <div className="alert error">{error}</div>}

      <div className="table-container">
        <table className="requests-table">
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
            {quotations.map(q => (
              <tr key={q.id}>
                <td className="request-id">#Q-{q.id}</td>
                <td>
                  <div className="school-info">
                    <Building2 size={14} />
                    <span>School ID: {q.schoolId}</span>
                  </div>
                </td>
                <td className="amount-cell">₹{q.grandTotal?.toLocaleString()}</td>
                <td>
                  <span className={`status-badge ${q.status?.toLowerCase()}`}>
                    {q.status}
                  </span>
                </td>
                <td>{new Date(q.submittedAt).toLocaleDateString()}</td>
                <td>
                  <button className="view-btn" onClick={() => { setSelectedQuotation(q); setIsModalOpen(true); }}>
                    <Eye size={16} /> {t('btn_review')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {quotations.length === 0 && !loading && (
          <div className="empty-state">{t('msg_no_fund_requests')}</div>
        )}
      </div>

      {isModalOpen && selectedQuotation && (
        <div className="modal-overlay">
          <div className="modal modal-lg">
            <div className="modal-header">
              <h2>{t('title_review_fund_request')}: #Q-{selectedQuotation.id}</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}><X size={24} /></button>
            </div>
            <div className="modal-content">
              <div className="details-section">
                <h3>{t('label_items_requested')}</h3>
                <table className="items-table-mini">
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
                        <td>₹{item.unitPrice}</td>
                        <td>₹{item.totalPrice?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="details-section mt-4">
                <h3>{t('label_request_summary')}</h3>
                <div className="summary-box">
                  <p><strong>{t('label_material_cost')}:</strong> ₹{selectedQuotation.materialCost?.toLocaleString()}</p>
                  <p><strong>{t('label_justification')}:</strong> {selectedQuotation.materialDetails || 'No justification provided'}</p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setIsModalOpen(false)}>{t('btn_close')}</button>
              {selectedQuotation.status === 'PENDING' && (
                <>
                  <button className="reject-btn" onClick={() => handleReject(selectedQuotation.id)}>{t('btn_reject')}</button>
                  <button className="approve-btn" onClick={() => handleApprove(selectedQuotation.id)}>{t('btn_approve_funds')}</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .fund-requests-container { padding: 0; }
        .table-container { background: white; border-radius: 1rem; border: 1px solid #e2e8f0; overflow: hidden; margin-top: 2rem; }
        .requests-table { width: 100%; border-collapse: collapse; }
        .requests-table th { background: #f8fafc; padding: 1rem; text-align: left; }
        .requests-table td { padding: 1rem; border-top: 1px solid #f1f5f9; }
        .amount-cell { font-weight: 700; color: #0ea5e9; }
        .status-badge { padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }
        .status-badge.pending { background: #fef3c7; color: #d97706; }
        .status-badge.approved { background: #dcfce7; color: #16a34a; }
        
        .items-table-mini { width: 100%; border-collapse: collapse; margin-top: 1rem; }
        .items-table-mini th { text-align: left; font-size: 0.8rem; color: #64748b; padding-bottom: 0.5rem; }
        .items-table-mini td { padding: 0.5rem 0; border-bottom: 1px dashed #e2e8f0; font-size: 0.9rem; }
        
        .summary-box { background: #f8fafc; padding: 1rem; border-radius: 0.5rem; margin-top: 1rem; }
        .mt-4 { margin-top: 1rem; }
        
        .approve-btn { padding: 0.6rem 1.5rem; background: #10b981; color: white; border: none; border-radius: 0.4rem; cursor: pointer; font-weight: 600; }
        .reject-btn { padding: 0.6rem 1.5rem; background: white; color: #ef4444; border: 1px solid #ef4444; border-radius: 0.4rem; cursor: pointer; font-weight: 600; }
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
        .modal { background: white; border-radius: 1rem; width: 100%; max-width: 800px; }
        .modal-header { padding: 1.5rem; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; }
        .modal-content { padding: 1.5rem; }
        .modal-footer { padding: 1.5rem; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 1rem; }
        .view-btn { display: flex; align-items: center; gap: 0.5rem; padding: 0.4rem 0.8rem; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 0.4rem; cursor: pointer; }
      `}</style>
    </div>
  );
};

export default AdminFundRequests;
