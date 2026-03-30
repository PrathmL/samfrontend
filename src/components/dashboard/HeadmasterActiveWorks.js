import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { 
  Briefcase, TrendingUp, Clock, CheckCircle2, 
  DollarSign, Camera, FileText, ChevronRight,
  Plus, X, RefreshCw, MapPin, AlertCircle, Save,
  Package, IndianRupee, Trash2, Calendar, Building2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { showErrorAlert, showWarningAlert, showConfirmAlert, showToast } from '../../utils/sweetAlertUtils';

const HeadmasterActiveWorks = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedWork, setSelectedWork] = useState(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Camera State
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraError, setCameraRefError] = useState('');

  // Update Form State
  const [updateFormData, setUpdateFormData] = useState({
    stageId: '',
    progressPercentage: 0,
    remarks: '',
    materialCost: 0,
    laborCost: 0,
    otherCost: 0
  });
  const [updatePhotos, setUpdatePhotos] = useState([]);
  const [updateGeotags, setUpdateGeotags] = useState([]);
  const [workItems, setWorkItems] = useState([]);
  const [itemUsage, setItemUsage] = useState({});

  useEffect(() => {
    if (user?.schoolId) {
      fetchWorks();
    }
  }, [user?.schoolId]);

  const fetchWorks = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:8080/api/works/school/${user.schoolId}`);
      setWorks(res.data || []);
    } catch (err) {
      console.error('Error fetching active works:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchWorkItems = async (workId) => {
    try {
      const res = await axios.get(`http://localhost:8080/api/works/${workId}/items`);
      const items = res.data || [];
      setWorkItems(items);
      const initialUsage = {};
      items.forEach((item, index) => {
        initialUsage[index] = 0;
      });
      setItemUsage(initialUsage);
    } catch (err) {
      console.error('Error fetching work items:', err);
    }
  };

  const handleUpdateClick = (work) => {
    setSelectedWork(work);
    const initialStage = work.stages?.find(s => s.status !== 'COMPLETED') || work.stages?.[0];
    setUpdateFormData({
      stageId: initialStage?.id || '',
      progressPercentage: initialStage?.progressPercentage || 0,
      remarks: '',
      materialCost: 0,
      laborCost: 0,
      otherCost: 0
    });
    fetchWorkItems(work.id);
    setIsUpdateModalOpen(true);
  };

  const handleStageChange = (stageId) => {
    const stage = selectedWork.stages?.find(s => s.id.toString() === stageId.toString());
    setUpdateFormData({
      ...updateFormData,
      stageId,
      progressPercentage: stage ? stage.progressPercentage : 0
    });
  };

  const handleViewDetails = (work) => {
    setSelectedWork(work);
    setIsDetailsModalOpen(true);
  };

  const handleItemUsageChange = (index, value) => {
    setItemUsage({ ...itemUsage, [index]: value });
  };

  // Camera Functions
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
      setCameraRefError("Could not access camera.");
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
          const file = new File([blob], `update_${Date.now()}.jpg`, { type: 'image/jpeg' });
          setUpdatePhotos(prev => [...prev, file]);
          setUpdateGeotags(prev => [...prev, { latitude, longitude }]);
          stopCamera();
        }, 'image/jpeg', 0.85);
      }, (err) => {
        showWarningAlert('Location Required', 'Location is required for geotagged photos. Please enable GPS.');
      });
    }
  };

  const removePhoto = (index) => {
    setUpdatePhotos(updatePhotos.filter((_, i) => i !== index));
    setUpdateGeotags(updateGeotags.filter((_, i) => i !== index));
  };

  const handleProgressSubmit = async (e) => {
    e.preventDefault();
    if (updatePhotos.length === 0) {
      showErrorAlert('Error', 'At least one geotagged photo is required.');
      return;
    }

    const isConfirmed = await showConfirmAlert(
      'Confirm Progress Update',
      'Are you sure you want to submit this progress update?',
      'Yes, Submit',
      'Cancel'
    );

    if (!isConfirmed) return;

    setLoading(true);
    const data = new FormData();
    data.append('workId', selectedWork.id);
    data.append('stageId', updateFormData.stageId);
    data.append('progressPercentage', updateFormData.progressPercentage);
    data.append('remarks', updateFormData.remarks);
    data.append('materialCost', updateFormData.materialCost);
    data.append('laborCost', updateFormData.laborCost);
    data.append('otherCost', updateFormData.otherCost);
    data.append('updatedById', user.id);
    data.append('updatedByRole', user.role);
    
    const usageList = workItems
      .map((item, index) => ({
        materialId: item.materialId,
        materialName: item.materialName,
        quantityUsed: Number(itemUsage[index] || 0)
      }))
      .filter(u => u.quantityUsed > 0);

    data.append('itemUsage', JSON.stringify(usageList));
    updatePhotos.forEach((photo, index) => {
      data.append('photos', photo);
      if (updateGeotags[index]) {
        data.append('latitudes', updateGeotags[index].latitude);
        data.append('longitudes', updateGeotags[index].longitude);
      }
    });

    try {
      await axios.post('http://localhost:8080/api/works/progress', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      showToast('Progress updated successfully!', 'success');
      setIsUpdateModalOpen(false);
      resetUpdateForm();
      fetchWorks();
    } catch (err) {
      showErrorAlert('Error', 'Failed to update progress.');
    } finally {
      setLoading(false);
    }
  };

  const resetUpdateForm = () => {
    setUpdateFormData({ stageId: '', progressPercentage: 0, remarks: '', materialCost: 0, laborCost: 0, otherCost: 0 });
    setUpdatePhotos([]);
    setUpdateGeotags([]);
    setItemUsage({});
  };

  const handleMarkComplete = async (workId) => {
    const isConfirmed = await showConfirmAlert(
      'Mark Work Complete',
      'Are you sure this work is 100% complete and ready for Sachiv verification?',
      'Yes, Complete',
      'Cancel'
    );
    
    if (isConfirmed) {
      setLoading(true);
      try {
        await axios.post(`http://localhost:8080/api/works/${workId}/mark-complete`, {});
        showToast('Work submitted for final verification!', 'success');
        fetchWorks();
      } catch (err) {
        showErrorAlert('Error', err.response?.data?.error || 'Failed to mark work as complete.');
      } finally {
        setLoading(false);
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return '#0ea5e9';
      case 'IN_PROGRESS': return '#3b82f6';
      case 'ON_HOLD': return '#f59e0b';
      case 'PENDING_CLOSURE': return '#6366f1';
      case 'COMPLETED': return '#10b981';
      default: return '#64748b';
    }
  };

  return (
    <div className="active-works-container">
      <div className="module-header">
        <div>
          <h1>{t('menu_active_works')}</h1>
          <p>Monitor and update ongoing school projects</p>
        </div>
      </div>

      <div className="works-list">
        {loading && works.length === 0 ? (
          <div className="loading">Loading projects...</div>
        ) : works.length > 0 ? (
          <div className="works-grid">
            {works.map(work => (
              <div key={work.id} className="work-card-active">
                <div className="work-card-header">
                  <div className="work-code-badge">{work.workCode}</div>
                  <div className="work-status-dot" style={{ backgroundColor: getStatusColor(work.status) }}>
                    {work.status?.replace('_', ' ')}
                  </div>
                </div>
                <h3>{work.title}</h3>
                <div className="work-progress-section">
                  <div className="progress-label-row">
                    <span>{t('field_progress')}</span>
                    <strong>{work.progressPercentage}%</strong>
                  </div>
                  <div className="progress-bar-bg">
                    <div className="progress-bar-fill" style={{ width: `${work.progressPercentage}%` }}></div>
                  </div>
                </div>
                
                <div className="work-stats-mini">
                  <div className="work-stat">
                    <IndianRupee size={14} />
                    <span>₹{work.totalUtilized?.toLocaleString()} utilized</span>
                  </div>
                </div>

                <div className="work-actions-row">
                  {work.progressPercentage === 100 && work.status !== 'PENDING_CLOSURE' && work.status !== 'COMPLETED' ? (
                    <button className="complete-btn" onClick={() => handleMarkComplete(work.id)}>
                      <CheckCircle2 size={16} /> Mark as Complete
                    </button>
                  ) : (
                    <button className="update-btn" onClick={() => handleUpdateClick(work)} disabled={work.status === 'PENDING_CLOSURE' || work.status === 'COMPLETED'}>
                      <RefreshCw size={16} /> {t('btn_update_progress')}
                    </button>
                  )}
                  <button className="view-btn-sm" onClick={() => handleViewDetails(work)}>
                    {t('btn_view')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <Briefcase size={48} />
            <h3>No Active Works</h3>
          </div>
        )}
      </div>

      {/* Update Progress Modal */}
      {isUpdateModalOpen && selectedWork && (
        <div className="modal-overlay">
          <div className="modal modal-lg">
            <div className="modal-header">
              <h2>{t('btn_update_progress')}: {selectedWork.workCode}</h2>
              <button className="close-btn" onClick={() => { setIsUpdateModalOpen(false); stopCamera(); }}><X size={24} /></button>
            </div>
            <form onSubmit={handleProgressSubmit}>
              <div className="modal-content overflow-y-auto" style={{ maxHeight: '75vh' }}>
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>{t('field_stage')}</label>
                    <select value={updateFormData.stageId} onChange={e => handleStageChange(e.target.value)} required>
                      <option value="">-- Choose Stage --</option>
                      {selectedWork.stages?.map(stage => (
                        <option key={stage.id} value={stage.id}>{stage.name} (Current: {stage.progressPercentage}%)</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>{t('field_progress')} (%)</label>
                    <input type="number" min="0" max="100" required value={updateFormData.progressPercentage} onChange={e => setUpdateFormData({...updateFormData, progressPercentage: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Material Cost (₹)</label>
                    <input type="number" min="0" value={updateFormData.materialCost} onChange={e => setUpdateFormData({...updateFormData, materialCost: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Labor Cost (₹)</label>
                    <input type="number" min="0" value={updateFormData.laborCost} onChange={e => setUpdateFormData({...updateFormData, laborCost: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Other Cost (₹)</label>
                    <input type="number" min="0" value={updateFormData.otherCost} onChange={e => setUpdateFormData({...updateFormData, otherCost: e.target.value})} />
                  </div>
                  <div className="form-group full-width">
                    <label>{t('field_remarks')}</label>
                    <textarea rows="2" required value={updateFormData.remarks} onChange={e => setUpdateFormData({...updateFormData, remarks: e.target.value})} />
                  </div>

                  {workItems.length > 0 && (
                    <div className="form-group full-width">
                      <label>Material Usage Report</label>
                      <div className="item-usage-list">
                        {workItems.map((item, index) => (
                          <div key={index} className="usage-item-row">
                            <span>{item.materialName}</span>
                            <div className="usage-input-group">
                              <input 
                                type="number" 
                                min="0" 
                                value={itemUsage[index] || 0} 
                                onChange={(e) => handleItemUsageChange(index, e.target.value)}
                              />
                              <span className="unit">Unit</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="form-group full-width">
                    <label>{t('field_photos')} (Geotagged Camera Only)</label>
                    <div className="captured-photos-preview">
                      {updatePhotos.map((photo, index) => (
                        <div key={index} className="preview-item">
                          <img src={URL.createObjectURL(photo)} alt="Captured" />
                          <button type="button" className="remove-photo-btn" onClick={() => removePhoto(index)}><Trash2 size={14} /></button>
                        </div>
                      ))}
                    </div>
                    {!isCameraOpen ? (
                      <button type="button" className="open-camera-btn" onClick={startCamera}>
                        <Camera size={24} /> <span>Capture Geotagged Photo</span>
                      </button>
                    ) : (
                      <div className="live-camera-container">
                        <video ref={videoRef} autoPlay playsInline className="camera-preview"></video>
                        <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
                        <div className="camera-actions">
                          <button type="button" className="btn-capture" onClick={capturePhoto}><div className="capture-inner"></div></button>
                          <button type="button" className="btn-close-camera" onClick={stopCamera}><X size={20} /></button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="cancel-btn" onClick={() => setIsUpdateModalOpen(false)}>{t('btn_cancel')}</button>
                <button type="submit" className="submit-btn" disabled={loading || isCameraOpen}>{t('btn_submit_update')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details View Modal */}
      {isDetailsModalOpen && selectedWork && (
        <div className="modal-overlay">
          <div className="modal modal-xl">
            <div className="modal-header">
              <div className="header-info">
                <span className="req-id">{selectedWork.workCode}</span>
                <h2>{selectedWork.title}</h2>
              </div>
              <button className="close-x" onClick={() => setIsDetailsModalOpen(false)}><X size={24} /></button>
            </div>
            <div className="modal-content overflow-y-auto" style={{ maxHeight: '80vh' }}>
              <div className="work-details-layout">
                <div className="details-info-main">
                  <div className="section-box">
                    <h4>Initial Site Photos</h4>
                    <div className="photo-gallery-horizontal">
                      {selectedWork.photoUrls?.map((url, i) => (
                        <div key={i} className="gallery-photo-item">
                          <img src={`http://localhost:8080${url}`} alt="Site" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="section-box">
                    <h4>Progress Photo Timeline</h4>
                    <div className="updates-timeline">
                      {selectedWork.progressUpdates?.map((update) => (
                        <div key={update.id} className="update-item-card">
                          <div className="update-header">
                            <span className="update-pct">{update.progressPercentage}%</span>
                            <span className="update-date">{new Date(update.updatedAt).toLocaleString()}</span>
                          </div>
                          <p className="update-remarks">{update.remarks}</p>
                          <div className="update-photos-grid">
                            {update.photoUrls?.map((purl, pi) => (
                              <img key={pi} src={`http://localhost:8080${purl}`} alt="Progress" />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="details-sidebar">
                  <div className="progress-radial-box">
                    <label>Overall Progress</label>
                    <div className="progress-big-val">{selectedWork.progressPercentage}%</div>
                  </div>
                  <div className="financial-breakdown">
                    <div className="fin-row"><span>Sanctioned</span><strong>₹{selectedWork.sanctionedAmount?.toLocaleString()}</strong></div>
                    <div className="fin-row"><span>Utilized</span><strong>₹{selectedWork.totalUtilized?.toLocaleString()}</strong></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .active-works-container { padding: 0; }
        .module-header { margin-bottom: 2rem; }
        .works-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 1.5rem; }
        .work-card-active { background: white; padding: 1.5rem; border-radius: 1rem; border: 1px solid #e2e8f0; }
        .work-card-header { display: flex; justify-content: space-between; margin-bottom: 1rem; }
        .work-code-badge { font-family: monospace; font-weight: 700; color: #0ea5e9; background: #f0f9ff; padding: 0.2rem 0.5rem; border-radius: 4px; }
        .work-status-dot { padding: 0.2rem 0.6rem; border-radius: 9999px; color: white; font-size: 0.6rem; }
        .progress-bar-bg { height: 8px; background: #f1f5f9; border-radius: 4px; overflow: hidden; margin-top: 0.5rem; }
        .progress-bar-fill { height: 100%; background: #0ea5e9; }
        .work-actions-row { display: flex; gap: 0.75rem; margin-top: 1.5rem; }
        .update-btn { flex: 1; padding: 0.6rem; background: #1e293b; color: white; border: none; border-radius: 0.5rem; cursor: pointer; }
        .complete-btn { flex: 1; padding: 0.6rem; background: #10b981; color: white; border: none; border-radius: 0.5rem; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem; font-weight: 600; }
        .complete-btn:hover { background: #059669; }
        .view-btn-sm { padding: 0.6rem 1rem; border: 1px solid #d1d5db; border-radius: 0.5rem; cursor: pointer; }

        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 23, 42, 0.75); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 2rem; }
        .modal { background: white; border-radius: 1.5rem; overflow: hidden; display: flex; flex-direction: column; width: 100%; }
        .modal-lg { max-width: 800px; width: 90%; max-height: 90vh; }
        .modal-xl { max-width: 1200px; width: 95%; max-height: 95vh; }
        .modal-header { padding: 1.5rem 2rem; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; background: #f8fafc; flex-shrink: 0; }
        
        form { display: flex; flex-direction: column; overflow: hidden; height: 100%; }
        .modal-content { padding: 2rem; overflow-y: auto; flex-grow: 1; }
        
        /* Custom Scrollbar */
        .modal-content::-webkit-scrollbar { width: 6px; }
        .modal-content::-webkit-scrollbar-track { background: #f1f5f9; }
        .modal-content::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }
        .modal-content::-webkit-scrollbar-thumb:hover { background: #94a3b8; }

        .overflow-y-auto { overflow-y: auto; }
        
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
        .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
        .form-group.full-width { grid-column: 1 / -1; }
        .form-group label { font-size: 0.9rem; font-weight: 600; color: #475569; }
        .form-group input, .form-group select, .form-group textarea { padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: 0.5rem; font-size: 1rem; width: 100%; }
        
        .modal-footer { padding: 1.5rem 2rem; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 1rem; background: #f8fafc; flex-shrink: 0; }
        .cancel-btn { padding: 0.75rem 1.5rem; border: 1px solid #e2e8f0; border-radius: 0.5rem; background: white; cursor: pointer; }
        .submit-btn { padding: 0.75rem 1.5rem; border: none; border-radius: 0.5rem; background: #0ea5e9; color: white; font-weight: 600; cursor: pointer; }
        .submit-btn:disabled { opacity: 0.5; cursor: not-allowed; }

        .close-x { background: transparent; border: none; cursor: pointer; }

        .work-details-layout { display: grid; grid-template-columns: 1fr 300px; }
        .details-info-main { padding: 2rem; border-right: 1px solid #e2e8f0; }
        .section-box { margin-bottom: 2rem; }
        .section-box h4 { color: #64748b; text-transform: uppercase; font-size: 0.8rem; margin-bottom: 1rem; }
        .photo-gallery-horizontal { display: flex; gap: 1rem; overflow-x: auto; padding-bottom: 1rem; }
        .gallery-photo-item { flex: 0 0 180px; height: 120px; border-radius: 0.5rem; overflow: hidden; border: 1px solid #e2e8f0; }
        .gallery-photo-item img { width: 100%; height: 100%; object-fit: cover; }

        .updates-timeline { display: flex; flex-direction: column; gap: 1.5rem; }
        .update-item-card { border-left: 3px solid #0ea5e9; padding-left: 1rem; }
        .update-header { display: flex; gap: 1rem; font-size: 0.8rem; font-weight: 700; margin-bottom: 0.5rem; }
        .update-pct { color: #0ea5e9; }
        .update-remarks { font-size: 0.9rem; color: #475569; margin-bottom: 0.75rem; }
        .update-photos-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 0.5rem; }
        .update-photos-grid img { width: 100%; height: 80px; object-fit: cover; border-radius: 0.4rem; }

        .details-sidebar { padding: 2rem; background: #f8fafc; }
        .progress-radial-box { text-align: center; background: white; padding: 1.5rem; border-radius: 1rem; border: 1px solid #e2e8f0; margin-bottom: 1.5rem; }
        .progress-big-val { font-size: 2.5rem; font-weight: 800; color: #1e293b; }
        .fin-row { display: flex; justify-content: space-between; font-size: 0.85rem; padding: 0.5rem 0; border-bottom: 1px solid #e2e8f0; }

        .item-usage-list { background: #f8fafc; padding: 1rem; border-radius: 0.5rem; border: 1px solid #e2e8f0; margin-top: 0.5rem; }
        .usage-item-row { display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0; border-bottom: 1px dotted #cbd5e1; }
        .usage-item-row:last-child { border-bottom: none; }
        .usage-input-group { display: flex; align-items: center; gap: 0.5rem; }
        .usage-input-group input { width: 80px; padding: 0.3rem; border: 1px solid #cbd5e1; border-radius: 4px; }
        .usage-input-group .unit { font-size: 0.8rem; color: #64748b; }

        .open-camera-btn { width: 100%; padding: 1.5rem; background: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 0.75rem; cursor: pointer; }
        .live-camera-container { position: relative; background: #000; height: 350px; border-radius: 0.75rem; overflow: hidden; }
        .camera-preview { width: 100%; height: 100%; object-fit: cover; }
        .camera-actions { position: absolute; bottom: 1rem; left: 0; right: 0; display: flex; justify-content: center; gap: 2rem; align-items: center; }
        .btn-capture { width: 50px; height: 50px; border-radius: 50%; border: 3px solid white; background: transparent; padding: 3px; cursor: pointer; }
        .capture-inner { width: 100%; height: 100%; border-radius: 50%; background: white; }
        .btn-close-camera { background: rgba(0,0,0,0.5); color: white; border: 1px solid rgba(255,255,255,0.3); border-radius: 50%; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center; cursor: pointer; }
        .btn-close-camera:hover { background: rgba(0,0,0,0.7); }
        .captured-photos-preview { display: flex; gap: 0.5rem; overflow-x: auto; margin-bottom: 1rem; }
        .preview-item { position: relative; flex: 0 0 100px; height: 80px; border-radius: 0.4rem; overflow: hidden; }
        .preview-item img { width: 100%; height: 100%; object-fit: cover; }
        .remove-photo-btn { position: absolute; top: 2px; right: 2px; background: red; color: white; border: none; border-radius: 50%; cursor: pointer; }
      `}</style>
    </div>
  );
};

export default HeadmasterActiveWorks;
