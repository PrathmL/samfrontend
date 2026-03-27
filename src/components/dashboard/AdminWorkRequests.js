import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Check, X, FileText, Eye, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminWorkRequests = () => {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [quotation, setQuotation] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/work-requests');
      setRequests(res.data);
    } catch (err) { console.error(err); }
  };

  const handleReview = async (req) => {
    setSelectedRequest(req);
    try {
      const res = await axios.get(`http://localhost:8080/api/work-requests/${req.id}/quotation`);
      setQuotation(res.data);
    } catch (err) { 
      setQuotation(null);
      console.error("No quotation found or error fetching it");
    }
    setIsModalOpen(true);
  };

  const handleApprove = async (id) => {
    if (window.confirm('Are you sure you want to approve this request?')) {
      try {
        await axios.post(`http://localhost:8080/api/work-requests/${id}/approve`);
        setIsModalOpen(false);
        fetchRequests();
      } catch (err) { console.error(err); }
    }
  };

  const handleReject = async (id) => {
    if (window.confirm('Are you sure you want to reject this request?')) {
      try {
        await axios.post(`http://localhost:8080/api/work-requests/${id}/reject`);
        setIsModalOpen(false);
        fetchRequests();
      } catch (err) { console.error(err); }
    }
  };

  return (
    <div className="management-container">
      <div className="management-header">
        <h1>Work Request Management</h1>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>School</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req.id}>
                <td>#{req.id}</td>
                <td>{req.title}</td>
                <td>School ID: {req.schoolId}</td>
                <td>{req.priority}</td>
                <td>
                  <span className={`status-badge ${req.status.toLowerCase()}`}>
                    {req.status.replace('_', ' ')}
                  </span>
                </td>
                <td>
                  <button className="edit-btn" onClick={() => handleReview(req)}>
                    <Eye size={18} /> Review
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: '700px' }}>
            <div className="modal-header">
              <h2>Review Work Request</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}><X size={24} /></button>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div>
                <h3 style={{ fontSize: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Request Details</h3>
                <p><strong>Title:</strong> {selectedRequest?.title}</p>
                <p><strong>Type:</strong> {selectedRequest?.type}</p>
                <p><strong>Priority:</strong> {selectedRequest?.priority}</p>
                <p><strong>Description:</strong></p>
                <p style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.9rem' }}>{selectedRequest?.description}</p>
              </div>

              <div>
                <h3 style={{ fontSize: '1rem', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Quotation Details</h3>
                {quotation ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <p><strong>Material Cost:</strong> ₹{quotation.materialCost}</p>
                    <p><strong>Labor Cost:</strong> ₹{quotation.laborCost}</p>
                    <p><strong>Additional:</strong> ₹{quotation.additionalCosts}</p>
                    <p style={{ fontSize: '1.1rem', color: '#0ea5e9' }}><strong>Grand Total:</strong> ₹{quotation.grandTotal}</p>
                    <p><strong>Materials:</strong></p>
                    <p style={{ backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.9rem' }}>{quotation.materialDetails}</p>
                  </div>
                ) : (
                  <p style={{ color: '#64748b', fontStyle: 'italic' }}>No quotation submitted yet.</p>
                )}
              </div>
            </div>

            <div className="modal-footer" style={{ marginTop: '2rem' }}>
              <button className="cancel-btn" onClick={() => setIsModalOpen(false)}>Close</button>
              {selectedRequest?.status === 'PENDING_APPROVAL' && (
                <>
                  <button className="delete-btn" style={{ borderColor: '#ef4444', color: '#ef4444' }} onClick={() => handleReject(selectedRequest.id)}>Reject Request</button>
                  <button className="save-btn" onClick={() => handleApprove(selectedRequest.id)}>Approve Request</button>
                </>
              )}
              {selectedRequest?.status === 'APPROVED' && (
                <button className="save-btn" style={{ backgroundColor: '#0ea5e9' }} onClick={() => navigate(`/admin/create-work/${selectedRequest.id}`)}>
                  <Briefcase size={18} style={{ marginRight: '0.5rem' }} /> Create Official Work
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .management-container { padding: 1rem; }
        .management-header { margin-bottom: 2rem; }
        .table-container { background: white; border-radius: 0.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden; }
        table { width: 100%; border-collapse: collapse; text-align: left; }
        th { background-color: #f1f5f9; padding: 1rem; font-weight: 600; color: #475569; }
        td { padding: 1rem; border-top: 1px solid #f1f5f9; }
        .status-badge { padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; }
        .status-badge.pending_quotation { background-color: #e0f2fe; color: #0369a1; }
        .status-badge.pending_approval { background-color: #fef3c7; color: #92400e; }
        .status-badge.approved { background-color: #dcfce7; color: #166534; }
        .status-badge.rejected { background-color: #fee2e2; color: #991b1b; }
        
        .edit-btn { display: flex; align-items: center; gap: 0.4rem; padding: 0.5rem 1rem; border: 1px solid #e2e8f0; border-radius: 0.25rem; background: white; cursor: pointer; color: #64748b; font-weight: 500; }
        .edit-btn:hover { color: #0ea5e9; border-color: #0ea5e9; }

        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
        .modal { background: white; border-radius: 0.75rem; width: 100%; padding: 2rem; }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .close-btn { background: none; border: none; cursor: pointer; color: #64748b; }
        .modal-footer { display: flex; justify-content: flex-end; gap: 1rem; }
        .cancel-btn { padding: 0.75rem 1.5rem; border: 1px solid #d1d5db; border-radius: 0.5rem; background: white; cursor: pointer; }
        .save-btn { padding: 0.75rem 1.5rem; border: none; border-radius: 0.5rem; background: #10b981; color: white; cursor: pointer; font-weight: 600; }
        .delete-btn { padding: 0.75rem 1.5rem; border: 1px solid #d1d5db; border-radius: 0.5rem; background: white; cursor: pointer; font-weight: 600; }
      `}</style>
    </div>
  );
};

export default AdminWorkRequests;
