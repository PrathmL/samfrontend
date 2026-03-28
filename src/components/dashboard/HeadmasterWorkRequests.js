import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus, Search, Filter, Clock, CheckCircle2, 
  XCircle, FileText, Camera, MapPin, X, Eye,
  AlertCircle, ChevronRight, Upload, Calendar
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const HeadmasterWorkRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'Maintenance',
    category: 'Building',
    priority: 'Medium',
    reason: '',
    expectedTimeline: ''
  });
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    if (user?.schoolId) {
      fetchRequests();
    }
  }, [user?.schoolId]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:8080/api/work-requests`, {
        params: { schoolId: user.schoolId }
      });
      setRequests(res.data || []);
    } catch (err) {
      console.error('Error fetching requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setPhotos([...e.target.files]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('type', formData.type);
    data.append('category', formData.category);
    data.append('priority', formData.priority);
    data.append('schoolId', user.schoolId);
    data.append('createdById', user.id);
    
    photos.forEach(photo => {
      data.append('photos', photo);
    });

    try {
      await axios.post('http://localhost:8080/api/work-requests', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccess('Work request submitted successfully!');
      setIsModalOpen(false);
      resetForm();
      fetchRequests();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to submit work request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'Maintenance',
      category: 'Building',
      priority: 'Medium',
      reason: '',
      expectedTimeline: ''
    });
    setPhotos([]);
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'PENDING_QUOTATION': return { bg: '#e0f2fe', color: '#0369a1', text: 'Pending Quotation' };
      case 'PENDING_APPROVAL': return { bg: '#fef3c7', color: '#92400e', text: 'Awaiting Approval' };
      case 'APPROVED': return { bg: '#dcfce7', color: '#166534', text: 'Approved' };
      case 'REJECTED': return { bg: '#fee2e2', color: '#991b1b', text: 'Rejected' };
      case 'WORK_CREATED': return { bg: '#f3e8ff', color: '#6b21a8', text: 'Work Started' };
      default: return { bg: '#f1f5f9', color: '#475569', text: status };
    }
  };

  return (
    <div className="requests-container">
      <div className="module-header">
        <div>
          <h1>Work Requests</h1>
          <p>Create and track infrastructure work requests for your school</p>
        </div>
        <button className="create-btn" onClick={() => setIsModalOpen(true)}>
          <Plus size={20} /> Create New Request
        </button>
      </div>

      {success && <div className="alert success">{success}</div>}
      {error && <div className="alert error">{error}</div>}

      <div className="requests-list">
        {loading ? (
          <div className="loading">Loading requests...</div>
        ) : requests.length > 0 ? (
          <div className="requests-grid">
            {requests.map(req => {
              const statusStyle = getStatusStyle(req.status);
              return (
                <div key={req.id} className="request-card">
                  <div className="request-header">
                    <span className="request-id">#{req.id}</span>
                    <span className="status-badge" style={{ backgroundColor: statusStyle.bg, color: statusStyle.color }}>
                      {statusStyle.text}
                    </span>
                  </div>
                  <h3>{req.title}</h3>
                  <p className="request-desc">{req.description?.substring(0, 100)}...</p>
                  <div className="request-meta">
                    <div className="meta-item"><Tag size={14} /> {req.type}</div>
                    <div className="meta-item"><Calendar size={14} /> {new Date(req.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div className="request-footer">
                    <div className={`priority-text ${req.priority?.toLowerCase()}`}>
                      {req.priority} Priority
                    </div>
                    <button className="view-details-link" onClick={() => setSelectedRequest(req)}>
                      View Details <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <FileText size={48} />
            <h3>No Work Requests</h3>
            <p>You haven't created any work requests yet.</p>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal modal-lg">
            <div className="modal-header">
              <h2>New Work Request</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-content">
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>Work Title *</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.title}
                      onChange={e => setFormData({...formData, title: e.target.value})}
                      placeholder="e.g., Roof Leakage Repair in Block A"
                    />
                  </div>
                  <div className="form-group">
                    <label>Work Type</label>
                    <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                      <option>Maintenance</option>
                      <option>Repair</option>
                      <option>New Construction</option>
                      <option>Renovation</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                      <option>Building</option>
                      <option>Electrical</option>
                      <option>Plumbing</option>
                      <option>Furniture</option>
                      <option>Sanitation</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Priority</label>
                    <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}>
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                      <option>Urgent</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Expected Timeline</label>
                    <input 
                      type="text" 
                      value={formData.expectedTimeline}
                      onChange={e => setFormData({...formData, expectedTimeline: e.target.value})}
                      placeholder="e.g., 2 weeks"
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Description *</label>
                    <textarea 
                      required 
                      rows="4"
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      placeholder="Describe the work required in detail..."
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Upload Photos (Max 10)</label>
                    <div className="file-upload">
                      <input type="file" multiple accept="image/*" onChange={handleFileChange} id="photos" />
                      <label htmlFor="photos">
                        <Upload size={20} />
                        <span>{photos.length > 0 ? `${photos.length} files selected` : 'Choose photos of the issue...'}</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="cancel-btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {selectedRequest && (
        <div className="modal-overlay">
          <div className="modal modal-lg">
            <div className="modal-header">
              <h2>Request Details: {selectedRequest.title}</h2>
              <button className="close-btn" onClick={() => setSelectedRequest(null)}><X size={24} /></button>
            </div>
            <div className="modal-content">
              <div className="details-layout">
                <div className="details-info">
                  <div className="status-timeline">
                    <div className={`timeline-step completed`}>
                      <CheckCircle2 size={16} />
                      <span>Request Created</span>
                      <small>{new Date(selectedRequest.createdAt).toLocaleDateString()}</small>
                    </div>
                    <div className={`timeline-step ${selectedRequest.status !== 'PENDING_QUOTATION' ? 'completed' : 'active'}`}>
                      {selectedRequest.status !== 'PENDING_QUOTATION' ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                      <span>Clerk Quotation</span>
                    </div>
                    <div className={`timeline-step ${['APPROVED', 'REJECTED', 'WORK_CREATED'].includes(selectedRequest.status) ? 'completed' : ''}`}>
                      {['APPROVED', 'REJECTED', 'WORK_CREATED'].includes(selectedRequest.status) ? <CheckCircle2 size={16} /> : <Minus size={16} />}
                      <span>Admin Decision</span>
                    </div>
                  </div>

                  <div className="info-section">
                    <h4>Description</h4>
                    <p>{selectedRequest.description}</p>
                  </div>

                  {selectedRequest.rejectionReason && (
                    <div className="info-section rejection">
                      <h4>Rejection Reason</h4>
                      <p>{selectedRequest.rejectionReason}</p>
                    </div>
                  )}

                  {selectedRequest.quotation && (
                    <div className="info-section quotation-box">
                      <h4>Quotation Details</h4>
                      <div className="quote-grid">
                        <div className="quote-item">
                          <label>Estimated Total</label>
                          <span>₹{selectedRequest.quotation.grandTotal?.toLocaleString()}</span>
                        </div>
                        <div className="quote-item">
                          <label>Material Cost</label>
                          <span>₹{selectedRequest.quotation.materialCost?.toLocaleString()}</span>
                        </div>
                        <div className="quote-item">
                          <label>Labor Cost</label>
                          <span>₹{selectedRequest.quotation.laborCost?.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="details-photos">
                  <h4>Attached Photos</h4>
                  <div className="photo-grid-small">
                    {selectedRequest.photoUrls?.map((url, i) => (
                      <img key={i} src={`http://localhost:8080${url}`} alt={`Issue ${i+1}`} />
                    ))}
                    {(!selectedRequest.photoUrls || selectedRequest.photoUrls.length === 0) && (
                      <p className="no-photos">No photos attached</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setSelectedRequest(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .requests-container { padding: 0; }
        .module-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
        .module-header h1 { margin: 0; font-size: 1.875rem; color: #1e293b; }
        .module-header p { color: #64748b; margin: 0.5rem 0 0; }
        
        .create-btn { display: flex; align-items: center; gap: 0.5rem; background: #0ea5e9; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; font-weight: 600; cursor: pointer; }
        
        .requests-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 1.5rem; }
        .request-card { background: white; padding: 1.5rem; border-radius: 1rem; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .request-header { display: flex; justify-content: space-between; margin-bottom: 1rem; }
        .request-id { font-family: monospace; font-weight: 700; color: #94a3b8; }
        .status-badge { padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; }
        .request-card h3 { margin: 0 0 0.75rem 0; font-size: 1.1rem; color: #1e293b; }
        .request-desc { font-size: 0.9rem; color: #475569; margin-bottom: 1.25rem; line-height: 1.5; }
        .request-meta { display: flex; gap: 1rem; margin-bottom: 1.25rem; }
        .meta-item { display: flex; align-items: center; gap: 0.4rem; font-size: 0.8rem; color: #64748b; }
        .request-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 1rem; border-top: 1px solid #f1f5f9; }
        .priority-text { font-size: 0.8rem; font-weight: 700; text-transform: uppercase; }
        .priority-text.urgent { color: #ef4444; }
        .priority-text.high { color: #f59e0b; }
        .priority-text.medium { color: #0ea5e9; }
        .priority-text.low { color: #10b981; }
        .view-details-link { background: none; border: none; color: #0ea5e9; font-weight: 600; font-size: 0.875rem; cursor: pointer; display: flex; align-items: center; gap: 0.25rem; }

        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
        .modal { background: white; border-radius: 1rem; width: 100%; max-width: 600px; max-height: 90vh; overflow-y: auto; }
        .modal-lg { max-width: 900px; }
        .modal-header { padding: 1.5rem 2rem; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
        .modal-content { padding: 2rem; }
        .modal-footer { padding: 1.5rem 2rem; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 1rem; }
        
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
        .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
        .form-group.full-width { grid-column: span 2; }
        .form-group label { font-weight: 600; color: #475569; font-size: 0.875rem; }
        .form-group input, .form-group select, .form-group textarea { padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 0.95rem; }
        
        .file-upload input { display: none; }
        .file-upload label { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; padding: 2rem; border: 2px dashed #cbd5e1; border-radius: 0.5rem; cursor: pointer; color: #64748b; transition: all 0.2s; }
        .file-upload label:hover { border-color: #0ea5e9; color: #0ea5e9; background: #f0f9ff; }

        .details-layout { display: grid; grid-template-columns: 1fr 300px; gap: 2rem; }
        .status-timeline { display: flex; flex-direction: column; gap: 1.5rem; margin-bottom: 2rem; padding: 1.5rem; background: #f8fafc; border-radius: 0.75rem; }
        .timeline-step { display: flex; align-items: center; gap: 0.75rem; color: #94a3b8; font-size: 0.9rem; position: relative; }
        .timeline-step.active { color: #0ea5e9; font-weight: 600; }
        .timeline-step.completed { color: #10b981; }
        .timeline-step small { margin-left: auto; color: #94a3b8; }

        .info-section { margin-bottom: 1.5rem; }
        .info-section h4 { margin: 0 0 0.5rem 0; color: #1e293b; font-size: 0.95rem; }
        .info-section p { margin: 0; color: #475569; font-size: 0.9rem; line-height: 1.6; }
        .rejection { background: #fee2e2; padding: 1rem; border-radius: 0.5rem; color: #dc2626; }
        .quotation-box { background: #f0f9ff; padding: 1rem; border-radius: 0.5rem; border: 1px solid #bae6fd; }
        .quote-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-top: 0.5rem; }
        .quote-item label { display: block; font-size: 0.7rem; color: #0369a1; text-transform: uppercase; font-weight: 700; }
        .quote-item span { font-weight: 700; color: #1e293b; font-size: 1.1rem; }

        .photo-grid-small { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; }
        .photo-grid-small img { width: 100%; height: 120px; object-fit: cover; border-radius: 0.4rem; }

        .cancel-btn { padding: 0.75rem 1.5rem; border: 1px solid #d1d5db; border-radius: 0.5rem; background: white; cursor: pointer; }
        .submit-btn { padding: 0.75rem 1.5rem; background: #0ea5e9; color: white; border: none; border-radius: 0.5rem; font-weight: 600; cursor: pointer; }
        .alert { padding: 1rem; border-radius: 0.5rem; margin-bottom: 1.5rem; }
        .alert.success { background: #dcfce7; color: #16a34a; }
        .alert.error { background: #fee2e2; color: #dc2626; }
      `}</style>
    </div>
  );
};

// Internal Lucide-react Icon proxy since I can't import all individually easily
const Tag = ({ size }) => <span style={{ fontSize: size }}><FileText size={size} /></span>;
const Minus = ({ size }) => <div style={{ width: size, height: 2, background: 'currentColor' }} />;

export default HeadmasterWorkRequests;
