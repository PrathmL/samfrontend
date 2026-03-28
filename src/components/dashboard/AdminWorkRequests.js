import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Check, X, FileText, Eye, Briefcase, AlertTriangle, Search, Filter, Clock, CheckCircle, XCircle, DollarSign, Building2, User, Calendar } from 'lucide-react';

const AdminWorkRequests = () => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [quotation, setQuotation] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [requests, searchTerm, statusFilter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:8080/api/work-requests');
      setRequests(res.data);
      setFilteredRequests(res.data);
    } catch (err) {
      console.error('Error fetching work requests:', err);
      setError('Failed to fetch work requests');
    } finally {
      setLoading(false);
    }
  };

  const filterRequests = () => {
    let filtered = [...requests];
    
    // Filter by status
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(req => req.status === statusFilter);
    }
    
    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(req => 
        req.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.id?.toString().includes(searchTerm) ||
        req.schoolName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    setFilteredRequests(filtered);
  };

  const handleReview = async (req) => {
    setSelectedRequest(req);
    try {
      const res = await axios.get(`http://localhost:8080/api/work-requests/${req.id}/quotation`);
      setQuotation(res.data);
    } catch (err) {
      setQuotation(null);
      console.log("No quotation found for this request");
    }
    setIsModalOpen(true);
  };

  const handleApprove = async (id) => {
    if (window.confirm('Are you sure you want to approve this work request?')) {
      setLoading(true);
      try {
        await axios.post(`http://localhost:8080/api/work-requests/${id}/approve`);
        setSuccess('Work request approved successfully');
        setIsModalOpen(false);
        fetchRequests();
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        setError('Failed to approve request');
        setTimeout(() => setError(''), 3000);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleReject = async (id) => {
    if (!rejectionReason.trim()) {
      setError('Please provide a rejection reason');
      return;
    }
    
    setLoading(true);
    try {
      await axios.post(`http://localhost:8080/api/work-requests/${id}/reject`, {
        reason: rejectionReason
      });
      setSuccess('Work request rejected');
      setShowRejectModal(false);
      setRejectionReason('');
      setIsModalOpen(false);
      fetchRequests();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to reject request');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWork = (requestId) => {
    navigate(`/admin/create-work/${requestId}`);
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'PENDING_QUOTATION':
        return { bg: '#fef3c7', color: '#92400e', icon: Clock, text: 'Pending Quotation' };
      case 'PENDING_APPROVAL':
        return { bg: '#fee2e2', color: '#991b1b', icon: AlertTriangle, text: 'Pending Approval' };
      case 'APPROVED':
        return { bg: '#dcfce7', color: '#166534', icon: CheckCircle, text: 'Approved' };
      case 'REJECTED':
        return { bg: '#fee2e2', color: '#991b1b', icon: XCircle, text: 'Rejected' };
      case 'WORK_CREATED':
        return { bg: '#dbeafe', color: '#1e40af', icon: Briefcase, text: 'Work Created' };
      default:
        return { bg: '#f1f5f9', color: '#475569', icon: FileText, text: status };
    }
  };

  const getPriorityBadge = (priority) => {
    switch(priority) {
      case 'Urgent':
        return { bg: '#fee2e2', color: '#dc2626' };
      case 'High':
        return { bg: '#fef3c7', color: '#d97706' };
      case 'Medium':
        return { bg: '#e0f2fe', color: '#0284c7' };
      default:
        return { bg: '#dcfce7', color: '#16a34a' };
    }
  };

  const stats = {
    total: requests.length,
    pendingQuotation: requests.filter(r => r.status === 'PENDING_QUOTATION').length,
    pendingApproval: requests.filter(r => r.status === 'PENDING_APPROVAL').length,
    approved: requests.filter(r => r.status === 'APPROVED').length,
    workCreated: requests.filter(r => r.status === 'WORK_CREATED').length,
    rejected: requests.filter(r => r.status === 'REJECTED').length
  };

  return (
    <div className="work-requests-container">
      <div className="page-header">
        <h1>Work Request Management</h1>
        <p>Review and manage work requests from Head Masters</p>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card" style={{ borderLeftColor: '#3b82f6' }}>
          <div className="stat-icon" style={{ backgroundColor: '#eff6ff', color: '#3b82f6' }}>
            <FileText size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats.total}</h3>
            <p>Total Requests</p>
          </div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#f59e0b' }}>
          <div className="stat-icon" style={{ backgroundColor: '#fef3c7', color: '#f59e0b' }}>
            <Clock size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats.pendingQuotation}</h3>
            <p>Pending Quotation</p>
          </div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#ef4444' }}>
          <div className="stat-icon" style={{ backgroundColor: '#fee2e2', color: '#ef4444' }}>
            <AlertTriangle size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats.pendingApproval}</h3>
            <p>Pending Approval</p>
          </div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#10b981' }}>
          <div className="stat-icon" style={{ backgroundColor: '#dcfce7', color: '#10b981' }}>
            <CheckCircle size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats.approved}</h3>
            <p>Approved</p>
          </div>
        </div>
        <div className="stat-card" style={{ borderLeftColor: '#3b82f6' }}>
          <div className="stat-icon" style={{ backgroundColor: '#dbeafe', color: '#3b82f6' }}>
            <Briefcase size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats.workCreated}</h3>
            <p>Work Created</p>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="alert error">
          <AlertTriangle size={18} />
          <span>{error}</span>
          <button onClick={() => setError('')}><X size={16} /></button>
        </div>
      )}
      {success && (
        <div className="alert success">
          <CheckCircle size={18} />
          <span>{success}</span>
          <button onClick={() => setSuccess('')}><X size={16} /></button>
        </div>
      )}

      {/* Search and Filters */}
      <div className="filters-bar">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by title, ID, or school..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-box">
          <Filter size={18} />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="ALL">All Status</option>
            <option value="PENDING_QUOTATION">Pending Quotation</option>
            <option value="PENDING_APPROVAL">Pending Approval</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="WORK_CREATED">Work Created</option>
          </select>
        </div>
      </div>

      {/* Requests Table */}
      <div className="table-container">
        {loading ? (
          <div className="loading-state">Loading requests...</div>
        ) : (
          <table className="requests-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>School</th>
                <th>Type</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRequests.map((req) => {
                const StatusIcon = getStatusBadge(req.status).icon;
                const priorityStyle = getPriorityBadge(req.priority);
                return (
                  <tr key={req.id}>
                    <td className="request-id">#{req.id}</td>
                    <td className="request-title">
                      <strong>{req.title}</strong>
                      {req.description && (
                        <small>{req.description.substring(0, 60)}...</small>
                      )}
                    </td>
                    <td>
                      <div className="school-info">
                        <Building2 size={14} />
                        <span>{req.schoolName || `School ID: ${req.schoolId}`}</span>
                      </div>
                    </td>
                    <td>
                      <span className="type-badge">{req.type || 'N/A'}</span>
                    </td>
                    <td>
                      <span className="priority-badge" style={{ backgroundColor: priorityStyle.bg, color: priorityStyle.color }}>
                        {req.priority || 'Medium'}
                      </span>
                    </td>
                    <td>
                      <span className="status-badge" style={{ backgroundColor: getStatusBadge(req.status).bg, color: getStatusBadge(req.status).color }}>
                        <StatusIcon size={12} />
                        {getStatusBadge(req.status).text}
                      </span>
                    </td>
                    <td className="date-cell">
                      <Calendar size={12} />
                      {new Date(req.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <button className="view-btn" onClick={() => handleReview(req)}>
                        <Eye size={16} /> Review
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        
        {filteredRequests.length === 0 && !loading && (
          <div className="empty-state">
            <FileText size={48} />
            <p>No work requests found</p>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {isModalOpen && selectedRequest && (
        <div className="modal-overlay">
          <div className="modal modal-large">
            <div className="modal-header">
              <h2>Review Work Request</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={24} />
              </button>
            </div>
            
            <div className="modal-content">
              {/* Request Details */}
              <div className="details-section">
                <h3>Request Details</h3>
                <div className="details-grid">
                  <div className="detail-item">
                    <label>Request ID</label>
                    <span>#{selectedRequest.id}</span>
                  </div>
                  <div className="detail-item">
                    <label>Title</label>
                    <span>{selectedRequest.title}</span>
                  </div>
                  <div className="detail-item">
                    <label>Type</label>
                    <span>{selectedRequest.type || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Category</label>
                    <span>{selectedRequest.category || 'N/A'}</span>
                  </div>
                  <div className="detail-item">
                    <label>Priority</label>
                    <span className={`priority-text ${selectedRequest.priority?.toLowerCase()}`}>
                      {selectedRequest.priority || 'Medium'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <label>School</label>
                    <span>{selectedRequest.schoolName || `School ID: ${selectedRequest.schoolId}`}</span>
                  </div>
                  <div className="detail-item full-width">
                    <label>Description</label>
                    <p className="description-text">{selectedRequest.description}</p>
                  </div>
                  <div className="detail-item">
                    <label>Created Date</label>
                    <span>{new Date(selectedRequest.createdAt).toLocaleString()}</span>
                  </div>
                  <div className="detail-item">
                    <label>Status</label>
                    <span className="status-text">{selectedRequest.status?.replace('_', ' ')}</span>
                  </div>
                </div>
                
                {/* Photos Gallery */}
                {selectedRequest.photoUrls && selectedRequest.photoUrls.length > 0 && (
                  <div className="photos-section">
                    <label>Attached Photos</label>
                    <div className="photos-gallery">
                      {selectedRequest.photoUrls.map((url, idx) => (
                        <div key={idx} className="photo-thumb">
                          <img src={`http://localhost:8080${url}`} alt={`Request photo ${idx + 1}`} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Quotation Details */}
              <div className="details-section">
                <h3>Quotation Details</h3>
                {quotation ? (
                  <div className="quotation-details">
                    <div className="quotation-summary">
                      <div className="cost-item">
                        <span>Material Cost</span>
                        <strong>₹{quotation.materialCost?.toLocaleString() || 0}</strong>
                      </div>
                      <div className="cost-item">
                        <span>Labor Cost</span>
                        <strong>₹{quotation.laborCost?.toLocaleString() || 0}</strong>
                      </div>
                      <div className="cost-item">
                        <span>Additional Costs</span>
                        <strong>₹{quotation.additionalCosts?.toLocaleString() || 0}</strong>
                      </div>
                      <div className="cost-item total">
                        <span>Grand Total</span>
                        <strong>₹{quotation.grandTotal?.toLocaleString() || 0}</strong>
                      </div>
                    </div>
                    
                    {quotation.materialDetails && (
                      <div className="quotation-detail-text">
                        <label>Material Details</label>
                        <p>{quotation.materialDetails}</p>
                      </div>
                    )}
                    
                    {quotation.laborDetails && (
                      <div className="quotation-detail-text">
                        <label>Labor Details</label>
                        <p>{quotation.laborDetails}</p>
                      </div>
                    )}
                    
                    {quotation.additionalDetails && (
                      <div className="quotation-detail-text">
                        <label>Additional Details</label>
                        <p>{quotation.additionalDetails}</p>
                      </div>
                    )}
                    
                    {quotation.validUntil && (
                      <div className="validity-info">
                        <Clock size={14} />
                        <span>Valid until: {new Date(quotation.validUntil).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="no-quotation">
                    <AlertTriangle size={24} />
                    <p>No quotation submitted yet. Waiting for Clerk to prepare quotation.</p>
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setIsModalOpen(false)}>
                Close
              </button>
              
              {selectedRequest.status === 'PENDING_APPROVAL' && quotation && (
                <>
                  <button className="reject-btn" onClick={() => setShowRejectModal(true)}>
                    <X size={18} /> Reject Request
                  </button>
                  <button className="approve-btn" onClick={() => handleApprove(selectedRequest.id)} disabled={loading}>
                    <Check size={18} /> {loading ? 'Processing...' : 'Approve Request'}
                  </button>
                </>
              )}
              
              {selectedRequest.status === 'APPROVED' && (
                <button className="create-work-btn" onClick={() => handleCreateWork(selectedRequest.id)}>
                  <Briefcase size={18} /> Create Official Work
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Reject Work Request</h2>
              <button className="close-btn" onClick={() => setShowRejectModal(false)}>
                <X size={24} />
              </button>
            </div>
            <div className="modal-content">
              <p>Please provide a reason for rejecting this work request:</p>
              <textarea
                className="rejection-reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter rejection reason..."
                rows="4"
                autoFocus
              />
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowRejectModal(false)}>
                Cancel
              </button>
              <button className="reject-btn" onClick={() => handleReject(selectedRequest.id)} disabled={loading}>
                {loading ? 'Rejecting...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .work-requests-container {
          padding: 1.5rem;
        }

        .page-header {
          margin-bottom: 2rem;
        }

        .page-header h1 {
          margin: 0 0 0.5rem 0;
          font-size: 1.75rem;
          color: #1e293b;
        }

        .page-header p {
          margin: 0;
          color: #64748b;
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: white;
          padding: 1rem;
          border-radius: 0.75rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          border-left: 4px solid;
        }

        .stat-icon {
          width: 48px;
          height: 48px;
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-info h3 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 700;
        }

        .stat-info p {
          margin: 0;
          color: #64748b;
          font-size: 0.8rem;
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

        /* Filters */
        .filters-bar {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .search-box {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          padding: 0.5rem 0.75rem;
          flex: 1;
        }

        .search-box input {
          border: none;
          outline: none;
          flex: 1;
        }

        .filter-box {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          padding: 0.5rem 0.75rem;
        }

        .filter-box select {
          border: none;
          outline: none;
          background: transparent;
        }

        /* Table */
        .table-container {
          background: white;
          border-radius: 0.75rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          overflow-x: auto;
        }

        .requests-table {
          width: 100%;
          border-collapse: collapse;
        }

        .requests-table th {
          background-color: #f8fafc;
          padding: 1rem;
          text-align: left;
          font-weight: 600;
          color: #475569;
          border-bottom: 1px solid #e2e8f0;
        }

        .requests-table td {
          padding: 1rem;
          border-bottom: 1px solid #f1f5f9;
          vertical-align: middle;
        }

        .request-id {
          font-family: monospace;
          font-weight: 600;
          color: #0ea5e9;
        }

        .request-title strong {
          display: block;
          margin-bottom: 0.25rem;
        }

        .request-title small {
          font-size: 0.75rem;
          color: #64748b;
        }

        .school-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
        }

        .type-badge {
          display: inline-block;
          padding: 0.25rem 0.5rem;
          background-color: #f1f5f9;
          border-radius: 0.25rem;
          font-size: 0.75rem;
          color: #475569;
        }

        .priority-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .date-cell {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: #64748b;
        }

        .view-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background-color: #f1f5f9;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          cursor: pointer;
          font-size: 0.875rem;
          transition: all 0.2s;
        }

        .view-btn:hover {
          background-color: #0ea5e9;
          color: white;
          border-color: #0ea5e9;
        }

        .loading-state, .empty-state {
          text-align: center;
          padding: 3rem;
          color: #94a3b8;
        }

        .empty-state svg {
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
          border-radius: 1rem;
          width: 100%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-large {
          max-width: 900px;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid #e2e8f0;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 1.25rem;
        }

        .close-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #64748b;
        }

        .modal-content {
          padding: 1.5rem;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          padding: 1.5rem;
          border-top: 1px solid #e2e8f0;
        }

        /* Details Section */
        .details-section {
          margin-bottom: 2rem;
        }

        .details-section h3 {
          margin: 0 0 1rem 0;
          font-size: 1rem;
          color: #0f172a;
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 0.5rem;
        }

        .details-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }

        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .detail-item.full-width {
          grid-column: span 2;
        }

        .detail-item label {
          font-size: 0.75rem;
          font-weight: 600;
          color: #64748b;
          text-transform: uppercase;
        }

        .detail-item span, .detail-item p {
          font-size: 0.9rem;
          color: #1e293b;
        }

        .description-text {
          background-color: #f8fafc;
          padding: 0.75rem;
          border-radius: 0.5rem;
          margin: 0;
        }

        .priority-text {
          font-weight: 600;
        }

        .priority-text.urgent, .priority-text.high {
          color: #dc2626;
        }

        .priority-text.medium {
          color: #f59e0b;
        }

        .priority-text.low {
          color: #10b981;
        }

        .status-text {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        /* Photos */
        .photos-section {
          margin-top: 1rem;
        }

        .photos-gallery {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          margin-top: 0.5rem;
        }

        .photo-thumb {
          width: 100px;
          height: 100px;
          border-radius: 0.5rem;
          overflow: hidden;
          border: 1px solid #e2e8f0;
        }

        .photo-thumb img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        /* Quotation */
        .quotation-details {
          background-color: #f8fafc;
          border-radius: 0.5rem;
          padding: 1rem;
        }

        .quotation-summary {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        .cost-item {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem;
          background: white;
          border-radius: 0.5rem;
        }

        .cost-item.total {
          grid-column: span 2;
          background-color: #e0f2fe;
          font-size: 1rem;
        }

        .cost-item.total strong {
          color: #0284c7;
          font-size: 1.125rem;
        }

        .quotation-detail-text {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #e2e8f0;
        }

        .quotation-detail-text label {
          font-weight: 600;
          font-size: 0.75rem;
          color: #64748b;
          text-transform: uppercase;
        }

        .quotation-detail-text p {
          margin: 0.25rem 0 0;
          font-size: 0.875rem;
          color: #334155;
        }

        .validity-info {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #e2e8f0;
          font-size: 0.875rem;
          color: #f59e0b;
        }

        .no-quotation {
          text-align: center;
          padding: 2rem;
          color: #64748b;
        }

        .no-quotation svg {
          margin-bottom: 0.5rem;
          opacity: 0.5;
        }

        /* Buttons */
        .cancel-btn {
          padding: 0.75rem 1.5rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          background: white;
          cursor: pointer;
          font-weight: 600;
        }

        .approve-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 0.5rem;
          background: #10b981;
          color: white;
          cursor: pointer;
          font-weight: 600;
        }

        .approve-btn:hover {
          background: #059669;
        }

        .reject-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border: 1px solid #ef4444;
          border-radius: 0.5rem;
          background: white;
          color: #ef4444;
          cursor: pointer;
          font-weight: 600;
        }

        .reject-btn:hover {
          background: #fee2e2;
        }

        .create-work-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 0.5rem;
          background: #0ea5e9;
          color: white;
          cursor: pointer;
          font-weight: 600;
        }

        .create-work-btn:hover {
          background: #0284c7;
        }

        .rejection-reason {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          font-family: inherit;
          resize: vertical;
          margin-top: 1rem;
        }

        .approve-btn:disabled, .reject-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default AdminWorkRequests;