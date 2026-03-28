import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FileText, Search, X, CheckCircle2, 
  ChevronRight, IndianRupee, Clock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ClerkQuotations = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    materialCost: 0,
    laborCost: 0,
    additionalCosts: 0,
    materialDetails: '',
    laborDetails: '',
    additionalDetails: '',
    validUntil: ''
  });

  useEffect(() => {
    if (user?.schoolId) {
      fetchWorkRequests();
    }
  }, [user?.schoolId]);

  const fetchWorkRequests = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:8080/api/work-requests`, {
        params: { schoolId: user.schoolId, status: 'PENDING_QUOTATION' }
      });
      setRequests(res.data || []);
    } catch (err) {
      console.error('Error fetching work requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrepareQuote = (req) => {
    setSelectedRequest(req);
    setIsModalOpen(true);
  };

  const handleSubmitQuotation = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        workRequestId: selectedRequest.id,
        schoolId: user.schoolId,
        preparedById: user.id,
        ...formData,
        materialCost: Number(formData.materialCost),
        laborCost: Number(formData.laborCost),
        additionalCosts: Number(formData.additionalCosts)
      };

      await axios.post('http://localhost:8080/api/quotations', payload);
      
      setSuccess('Quotation submitted successfully');
      setIsModalOpen(false);
      resetForm();
      fetchWorkRequests();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to submit quotation');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      materialCost: 0,
      laborCost: 0,
      additionalCosts: 0,
      materialDetails: '',
      laborDetails: '',
      additionalDetails: '',
      validUntil: ''
    });
    setSelectedRequest(null);
  };

  return (
    <div className="quotations-container">
      <div className="module-header">
        <h1>Work Quotations</h1>
        <p>Prepare cost estimations for pending school work requests</p>
      </div>

      {success && <div className="alert success">{success}</div>}
      {error && <div className="alert error">{error}</div>}

      <div className="requests-grid">
        {requests.map(req => (
          <div key={req.id} className="request-card">
            <div className="request-header">
              <span className="req-id">#{req.id}</span>
              <span className={`priority-badge ${req.priority?.toLowerCase()}`}>{req.priority}</span>
            </div>
            <h3>{req.title}</h3>
            <p className="req-desc">{req.description?.substring(0, 120)}...</p>
            <div className="req-meta">
              <div className="meta-item"><Clock size={14} /> {new Date(req.createdAt).toLocaleDateString()}</div>
            </div>
            <button className="prepare-btn" onClick={() => handlePrepareQuote(req)}>
              Prepare Quotation <ChevronRight size={16} />
            </button>
          </div>
        ))}
        {requests.length === 0 && !loading && (
          <div className="empty-state">
            <CheckCircle2 size={48} color="#10b981" />
            <h3>All Clear!</h3>
            <p>No work requests are pending quotations.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal modal-lg">
            <div className="modal-header">
              <h2>Prepare Quotation</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmitQuotation}>
              <div className="modal-content">
                <div className="req-summary">
                  <strong>For:</strong> {selectedRequest?.title}
                </div>
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>Material Details *</label>
                    <textarea required rows="3" value={formData.materialDetails} onChange={e => setFormData({...formData, materialDetails: e.target.value})} placeholder="List materials and quantities..."></textarea>
                  </div>
                  <div className="form-group">
                    <label>Material Cost (₹) *</label>
                    <input type="number" required value={formData.materialCost} onChange={e => setFormData({...formData, materialCost: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Labor Cost (₹)</label>
                    <input type="number" value={formData.laborCost} onChange={e => setFormData({...formData, laborCost: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Valid Until</label>
                    <input type="date" value={formData.validUntil} onChange={e => setFormData({...formData, validUntil: e.target.value})} />
                  </div>
                </div>
                <div className="total-box">
                  <span>Grand Total:</span>
                  <strong>₹{(Number(formData.materialCost) + Number(formData.laborCost) + Number(formData.additionalCosts)).toLocaleString()}</strong>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="cancel-btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="submit-btn" disabled={loading}>Submit to Admin</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .quotations-container { padding: 0; }
        .requests-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 1.5rem; margin-top: 2rem; }
        .request-card { background: white; padding: 1.5rem; border-radius: 1rem; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .request-header { display: flex; justify-content: space-between; margin-bottom: 1rem; }
        .req-id { color: #94a3b8; font-weight: 700; font-family: monospace; }
        .priority-badge { padding: 0.2rem 0.6rem; border-radius: 9999px; font-size: 0.7rem; font-weight: 700; }
        .priority-badge.high { background: #fee2e2; color: #dc2626; }
        .priority-badge.medium { background: #fef3c7; color: #d97706; }
        .priority-badge.low { background: #dcfce7; color: #16a34a; }
        .req-desc { font-size: 0.9rem; color: #475569; margin-bottom: 1.5rem; line-height: 1.5; }
        .prepare-btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.75rem; background: #0ea5e9; color: white; border: none; border-radius: 0.5rem; font-weight: 600; cursor: pointer; }
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
        .modal { background: white; border-radius: 1rem; width: 100%; max-width: 500px; }
        .modal-lg { max-width: 800px; }
        .modal-header { padding: 1.5rem; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; }
        .modal-content { padding: 1.5rem; }
        .req-summary { background: #f8fafc; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1.5rem; border-left: 4px solid #0ea5e9; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .full-width { grid-column: span 2; }
        .form-group { display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 1rem; }
        .form-group input, .form-group textarea { padding: 0.6rem; border: 1px solid #d1d5db; border-radius: 0.4rem; }
        .total-box { margin-top: 1rem; padding: 1rem; background: #f1f5f9; border-radius: 0.5rem; display: flex; justify-content: space-between; align-items: center; }
        .total-box strong { font-size: 1.25rem; color: #0ea5e9; }
        .modal-footer { padding: 1.5rem; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 1rem; }
        .submit-btn { padding: 0.6rem 1.5rem; background: #10b981; color: white; border: none; border-radius: 0.4rem; cursor: pointer; font-weight: 600; }
        .alert { padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem; }
        .alert.success { background: #dcfce7; color: #16a34a; }
      `}</style>
    </div>
  );
};

export default ClerkQuotations;
