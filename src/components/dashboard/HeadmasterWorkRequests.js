import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Plus, Search, Filter, Clock, CheckCircle2, 
  XCircle, FileText, Camera, MapPin, X, Eye,
  AlertCircle, ChevronRight, Upload, Calendar, Tag, Trash2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { showWarningAlert, showErrorAlert, showToast, showConfirmAlert } from '../../utils/sweetAlertUtils';

const HeadmasterWorkRequests = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  // Camera State
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraError, setCameraRefError] = useState('');

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
  const [geotags, setGeotags] = useState([]);

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

  const startCamera = async () => {
    try {
      setIsCameraOpen(true);
      setCameraRefError('');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' },
        audio: false 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access error:", err);
      setCameraRefError("Could not access camera. Please ensure you have given permissions.");
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;
        
        canvas.toBlob((blob) => {
          const file = new File([blob], `capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
          setPhotos(prev => [...prev, file]);
          setGeotags(prev => [...prev, { latitude, longitude }]);
          stopCamera();
        }, 'image/jpeg', 0.85);
      }, (err) => {
        showWarningAlert('Location Required', 'Location is required for geotagged photos. Please enable GPS.');
        console.error(err);
      });
    } else {
      showErrorAlert('Geolocation Not Supported', 'Geolocation is not supported by your browser.');
    }
  };

  const removePhoto = (index) => {
    setPhotos(photos.filter((_, i) => i !== index));
    setGeotags(geotags.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (photos.length === 0) {
      showErrorAlert('Photos Required', 'At least one geotagged photo is required.');
      return;
    }

    const isConfirmed = await showConfirmAlert(
      'Confirm Work Request',
      'Are you sure you want to submit this work request?',
      'Yes, Submit',
      'Cancel'
    );

    if (!isConfirmed) return;

    setLoading(true);

    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('type', formData.type);
    data.append('category', formData.category);
    data.append('priority', formData.priority);
    data.append('schoolId', user.schoolId);
    data.append('createdById', user.id);
    data.append('expectedTimeline', formData.expectedTimeline);
    
    photos.forEach((photo, index) => {
      data.append('photos', photo);
      if (geotags[index]) {
        data.append('latitudes', geotags[index].latitude);
        data.append('longitudes', geotags[index].longitude);
      }
    });

    try {
      await axios.post('http://localhost:8080/api/work-requests', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      showToast('Work request submitted successfully!', 'success');
      setIsModalOpen(false);
      resetForm();
      fetchRequests();
    } catch (err) {
      showErrorAlert('Error', 'Failed to submit work request. Please try again.');
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
    setGeotags([]);
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case 'PENDING_QUOTATION': return { bg: '#e0f2fe', color: '#0369a1', text: t('status_pending_quotation') };
      case 'PENDING_APPROVAL': return { bg: '#fef3c7', color: '#92400e', text: t('status_awaiting_approval') };
      case 'APPROVED': return { bg: '#dcfce7', color: '#166534', text: t('status_approved') };
      case 'REJECTED': return { bg: '#fee2e2', color: '#991b1b', text: t('status_rejected') };
      case 'WORK_CREATED': return { bg: '#f3e8ff', color: '#6b21a8', text: t('status_work_started') };
      default: return { bg: '#f1f5f9', color: '#475569', text: status };
    }
  };

  const translateType = (type) => {
    switch(type) {
      case 'Maintenance': return t('type_maintenance');
      case 'Repair': return t('type_repair');
      case 'New Construction': return t('type_new_construction');
      case 'Renovation': return t('type_renovation');
      default: return type;
    }
  };

  const translatePriority = (p) => {
    switch(p) {
      case 'Low': return t('priority_low');
      case 'Medium': return t('priority_medium');
      case 'High': return t('priority_high');
      case 'Urgent': return t('priority_urgent');
      default: return p;
    }
  };

  return (
    <div className="requests-container">
      <div className="module-header">
        <div>
          <h1>{t('menu_work_requests')}</h1>
          <p>Create and track infrastructure work requests for your school</p>
        </div>
        <button className="create-btn" onClick={() => setIsModalOpen(true)}>
          <Plus size={20} /> {t('btn_create_request')}
        </button>
      </div>

      <div className="requests-list">
        {loading ? (
          <div className="loading">Loading requests...</div>
        ) : requests.length > 0 ? (
          <div className="requests-grid">
            {requests.map(req => {
              const statusInfo = getStatusInfo(req.status);
              return (
                <div key={req.id} className="request-card">
                  <div className="request-header">
                    <span className="request-id">#{req.id}</span>
                    <span className="status-badge" style={{ backgroundColor: statusInfo.bg, color: statusInfo.color }}>
                      {statusInfo.text}
                    </span>
                  </div>
                  <h3>{req.title}</h3>
                  <p className="request-desc">{req.description?.substring(0, 100)}...</p>
                  <div className="request-meta">
                    <div className="meta-item"><Tag size={14} /> {translateType(req.type)}</div>
                    <div className="meta-item"><Calendar size={14} /> {new Date(req.createdAt).toLocaleDateString()}</div>
                  </div>
                  <div className="request-footer">
                    <div className={`priority-text ${req.priority?.toLowerCase()}`}>
                      {translatePriority(req.priority)} {t('field_priority')}
                    </div>
                    <button className="view-details-link" onClick={() => setSelectedRequest(req)}>
                      {t('btn_view')} <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <FileText size={48} />
            <h3>{t('menu_work_requests')}</h3>
            <p>You haven't created any work requests yet.</p>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal modal-lg">
            <div className="modal-header">
              <h2>{t('btn_create_request')}</h2>
              <button className="close-btn" onClick={() => { setIsModalOpen(false); stopCamera(); }}><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-content">
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>{t('field_work_title')} *</label>
                    <input 
                      type="text" 
                      required 
                      value={formData.title}
                      onChange={e => setFormData({...formData, title: e.target.value})}
                      placeholder="e.g., Roof Leakage Repair in Block A"
                    />
                  </div>
                  <div className="form-group">
                    <label>{t('field_type')}</label>
                    <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}>
                      <option value="Maintenance">{t('type_maintenance')}</option>
                      <option value="Repair">{t('type_repair')}</option>
                      <option value="New Construction">{t('type_new_construction')}</option>
                      <option value="Renovation">{t('type_renovation')}</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>{t('field_category')}</label>
                    <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                      <option value="Building">{t('cat_building')}</option>
                      <option value="Electrical">{t('cat_electrical')}</option>
                      <option value="Plumbing">{t('cat_plumbing')}</option>
                      <option value="Furniture">{t('cat_furniture')}</option>
                      <option value="Sanitation">{t('cat_sanitation')}</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>{t('field_priority')}</label>
                    <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})}>
                      <option value="Low">{t('priority_low')}</option>
                      <option value="Medium">{t('priority_medium')}</option>
                      <option value="High">{t('priority_high')}</option>
                      <option value="Urgent">{t('priority_urgent')}</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>{t('field_expected_timeline')}</label>
                    <input 
                      type="text" 
                      value={formData.expectedTimeline}
                      onChange={e => setFormData({...formData, expectedTimeline: e.target.value})}
                      placeholder="e.g., 2 weeks"
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>{t('field_description')} *</label>
                    <textarea 
                      required 
                      rows="4"
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      placeholder="Describe the work required in detail..."
                    />
                  </div>
                  
                  <div className="form-group full-width">
                    <label>{t('field_photos')} (Geotagged Camera Only)</label>
                    
                    {photos.length > 0 && (
                      <div className="captured-photos-preview">
                        {photos.map((photo, index) => (
                          <div key={index} className="preview-item">
                            <img src={URL.createObjectURL(photo)} alt="Captured" />
                            <button type="button" className="remove-photo-btn" onClick={() => removePhoto(index)}>
                              <Trash2 size={14} />
                            </button>
                            <div className="geo-tag-badge">
                              <MapPin size={10} /> {geotags[index]?.latitude.toFixed(4)}, {geotags[index]?.longitude.toFixed(4)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {!isCameraOpen ? (
                      <button type="button" className="open-camera-btn" onClick={startCamera}>
                        <Camera size={24} /> <span>Capture Geotagged Photo</span>
                      </button>
                    ) : (
                      <div className="live-camera-container">
                        <video ref={videoRef} autoPlay playsInline className="camera-preview"></video>
                        <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
                        <div className="camera-actions">
                          <button type="button" className="btn-capture" onClick={capturePhoto}>
                            <div className="capture-inner"></div>
                          </button>
                          <button type="button" className="btn-close-camera" onClick={stopCamera}>
                            <X size={20} />
                          </button>
                        </div>
                        {cameraError && <p className="camera-error">{cameraError}</p>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="cancel-btn" onClick={() => { setIsModalOpen(false); stopCamera(); }}>{t('btn_cancel')}</button>
                <button type="submit" className="submit-btn" disabled={loading || isCameraOpen}>
                  {loading ? 'Submitting...' : t('btn_submit')}
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
              <h2>{t('btn_view')}: {selectedRequest.title}</h2>
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
                      {['APPROVED', 'REJECTED', 'WORK_CREATED'].includes(selectedRequest.status) ? <CheckCircle2 size={16} /> : <div style={{ width: 16, height: 2, background: 'currentColor' }} />}
                      <span>Admin Decision</span>
                    </div>
                  </div>

                  <div className="info-section">
                    <h4>{t('field_description')}</h4>
                    <p>{selectedRequest.description}</p>
                  </div>

                  {selectedRequest.rejectionReason && (
                    <div className="info-section rejection">
                      <h4>{t('label_rejection_reason')}</h4>
                      <p>{selectedRequest.rejectionReason}</p>
                    </div>
                  )}

                  {selectedRequest.quotation && (
                    <div className="info-section quotation-box">
                      <h4>{t('label_quotation_details')}</h4>
                      <div className="quote-grid">
                        <div className="quote-item">
                          <label>{t('label_estimated_total')}</label>
                          <span>₹{selectedRequest.quotation.grandTotal?.toLocaleString()}</span>
                        </div>
                        <div className="quote-item">
                          <label>{t('field_material_cost')}</label>
                          <span>₹{selectedRequest.quotation.materialCost?.toLocaleString()}</span>
                        </div>
                        <div className="quote-item">
                          <label>{t('field_labor_cost')}</label>
                          <span>₹{selectedRequest.quotation.laborCost?.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="details-photos">
                  <h4>{t('field_photos')}</h4>
                  <div className="photo-grid-small">
                    {selectedRequest.photoUrls?.map((photo, i) => (
                      <div key={i} className="photo-item-wrapper">
                        <img src={`http://localhost:8080${photo.url}`} alt={`Issue ${i+1}`} />
                        {photo.latitude && photo.longitude && (
                          <div className="geotag-tag">
                            <MapPin size={10} />
                            <span>{photo.latitude.toFixed(4)}, {photo.longitude.toFixed(4)}</span>
                          </div>
                        )}
                      </div>
                    ))}
                    {(!selectedRequest.photoUrls || selectedRequest.photoUrls.length === 0) && (
                      <p className="no-photos">No photos attached</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setSelectedRequest(null)}>{t('btn_cancel')}</button>
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
        
        /* Camera UI Styles */
        .open-camera-btn { display: flex; align-items: center; justify-content: center; gap: 0.75rem; padding: 1.5rem; background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 0.75rem; color: #475569; font-weight: 700; cursor: pointer; transition: all 0.2s; width: 100%; }
        .open-camera-btn:hover { background: #f0f9ff; border-color: #0ea5e9; color: #0ea5e9; }
        
        .live-camera-container { position: relative; background: #000; border-radius: 0.75rem; overflow: hidden; height: 400px; display: flex; flex-direction: column; }
        .camera-preview { width: 100%; height: 100%; object-fit: cover; }
        .camera-actions { position: absolute; bottom: 1.5rem; left: 0; right: 0; display: flex; justify-content: center; align-items: center; gap: 2rem; }
        
        .btn-capture { width: 64px; height: 64px; border-radius: 50%; border: 4px solid white; background: transparent; padding: 4px; cursor: pointer; }
        .capture-inner { width: 100%; height: 100%; border-radius: 50%; background: white; }
        .btn-capture:active .capture-inner { transform: scale(0.9); background: #e2e8f0; }
        
        .btn-close-camera { width: 40px; height: 40px; border-radius: 50%; background: rgba(255,255,255,0.2); border: none; color: white; display: flex; align-items: center; justify-content: center; cursor: pointer; backdrop-filter: blur(4px); }
        
        .captured-photos-preview { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
        .preview-item { position: relative; height: 100px; border-radius: 0.5rem; overflow: hidden; border: 1px solid #e2e8f0; }
        .preview-item img { width: 100%; height: 100%; object-fit: cover; }
        .remove-photo-btn { position: absolute; top: 0.25rem; right: 0.25rem; width: 24px; height: 24px; border-radius: 50%; background: rgba(239, 68, 68, 0.9); border: none; color: white; display: flex; align-items: center; justify-content: center; cursor: pointer; }
        .geo-tag-badge { position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.6); color: white; font-size: 0.6rem; padding: 0.2rem; display: flex; align-items: center; gap: 0.2rem; }

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

export default HeadmasterWorkRequests;
