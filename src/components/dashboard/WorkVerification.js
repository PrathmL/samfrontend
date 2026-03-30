import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { 
  ClipboardCheck, List, FileCheck, 
  Plus, CheckCircle2, AlertCircle, 
  Camera, MapPin, User, ShieldCheck,
  ChevronRight, ChevronLeft, Download,
  Save, AlertTriangle, X, Trash2,
  IndianRupee, PieChart, Landmark
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { showToast, showErrorAlert, showSuccessAlert, showConfirmAlert } from '../../utils/sweetAlertUtils';

const WorkVerification = ({ work, onComplete, onCancel }) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Step 1: Inspection
  const [inspection, setInspection] = useState({
    inspectorName: user.name,
    designation: 'Sachiv',
    notes: '',
    qualityScore: 'Good',
    complianceWithSpecifications: true,
    inspectionDate: new Date().toISOString().split('T')[0]
  });

  // Step 2: Punch List
  const [punchList, setPunchList] = useState([]);
  const [newPunchItem, setNewPunchItem] = useState({
    description: '',
    location: '',
    severity: 'Minor',
    dueDate: ''
  });

  // Step 3: Final Documentation (Photos)
  const [verificationPhotos, setVerificationPhotos] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploadingPhotos, setUploadingPhotos] = useState(false);

  // Step 4 & 5: Handover & Financial Settlement
  const [certificate, setCertificate] = useState({
    actualExpenditure: work.totalUtilized || 0,
    fundReturnDetails: '',
    sachivESign: user.name,
    hmESign: ''
  });

  useEffect(() => {
    fetchExistingData();
  }, []);

  const fetchExistingData = async () => {
    try {
      const [inspRes, punchRes, photoRes] = await Promise.all([
        axios.get(`http://localhost:8080/api/works/verification/${work.id}/inspection`),
        axios.get(`http://localhost:8080/api/works/verification/${work.id}/punch-list`),
        axios.get(`http://localhost:8080/api/works/verification/${work.id}/photos`)
      ]);
      if (inspRes.data) setInspection(inspRes.data);
      if (punchRes.data) setPunchList(punchRes.data);
      if (photoRes.data) setVerificationPhotos(photoRes.data);
    } catch (err) {
      console.error('Error fetching verification data:', err);
    }
  };

  const handleSaveInspection = async () => {
    const isConfirmed = await showConfirmAlert(
      'Save Inspection?',
      'Are you sure you want to save these inspection details and proceed?'
    );
    
    if (!isConfirmed) return;

    try {
      setLoading(true);
      // Ensure date is in LocalDateTime format (ISO string or append time)
      const payload = {
        ...inspection,
        inspectionDate: inspection.inspectionDate.includes('T') 
          ? inspection.inspectionDate 
          : `${inspection.inspectionDate}T00:00:00`
      };
      await axios.post(`http://localhost:8080/api/works/verification/${work.id}/inspection`, payload);
      setStep(2);
    } catch (err) {
      showErrorAlert('Error', 'Failed to save inspection details.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPunchItem = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`http://localhost:8080/api/works/verification/${work.id}/punch-list`, newPunchItem);
      setPunchList([...punchList, res.data]);
      setNewPunchItem({ description: '', location: '', severity: 'Minor', dueDate: '' });
      showToast('Punch item added', 'success');
    } catch (err) {
      showErrorAlert('Error', 'Failed to add punch list item.');
    }
  };

  const handleResolvePunchItem = async (id) => {
    try {
      await axios.put(`http://localhost:8080/api/works/verification/punch-list/${id}/resolve`, {
        remarks: 'Resolved during final verification',
        photoAfter: ''
      });
      setPunchList(punchList.map(item => item.id === id ? { ...item, status: 'Resolved' } : item));
      showToast('Item resolved', 'success');
    } catch (err) {
      showErrorAlert('Error', 'Failed to resolve item.');
    }
  };

  const handleFileSelect = (e) => {
    setSelectedFiles([...selectedFiles, ...Array.from(e.target.files)]);
  };

  const handleUploadPhotos = async () => {
    if (selectedFiles.length === 0) return;
    setUploadingPhotos(true);

    const formData = new FormData();
    selectedFiles.forEach(file => formData.append('photos', file));
    
    // Attempt to get location for first photo
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (pos) => {
        formData.append('latitudes', pos.coords.latitude);
        formData.append('longitudes', pos.coords.longitude);
        await performUpload(formData);
      }, async () => {
        await performUpload(formData);
      });
    } else {
      await performUpload(formData);
    }
  };

  const performUpload = async (formData) => {
    try {
      const res = await axios.post(`http://localhost:8080/api/works/verification/${work.id}/photos`, formData);
      setVerificationPhotos([...verificationPhotos, ...res.data]);
      setSelectedFiles([]);
      showSuccessAlert('Success', 'Photos uploaded successfully');
    } catch (err) {
      showErrorAlert('Error', 'Failed to upload photos.');
    } finally {
      setUploadingPhotos(false);
    }
  };

  const handleFinalize = async () => {
    const openItems = punchList.filter(i => i.status === 'Open');
    if (openItems.length > 0) {
      showErrorAlert('Cannot Finalize', `Cannot finalize. ${openItems.length} punch list items are still open.`);
      return;
    }

    if (verificationPhotos.length < 2) {
      showErrorAlert('Photos Required', 'At least 2 mandatory inspection photos are required.');
      return;
    }

    const isConfirmed = await showConfirmAlert(
      'Finalize Work Closure?',
      'Are you sure you want to finalize the work closure? This action is permanent.'
    );

    if (!isConfirmed) return;

    try {
      setLoading(true);
      await axios.post(`http://localhost:8080/api/works/verification/${work.id}/finalize`, certificate);
      showSuccessAlert('Success', 'Work finalized and closed successfully');
      onComplete();
    } catch (err) {
      showErrorAlert('Error', err.response?.data?.error || 'Failed to finalize work closure.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="step-indicator">
      {[
        { n: 1, label: 'Inspection', icon: ClipboardCheck },
        { n: 2, label: 'Punch List', icon: List },
        { n: 3, label: 'Photos', icon: Camera },
        { n: 4, label: 'Handover', icon: FileCheck },
        { n: 5, label: 'Financials', icon: Landmark }
      ].map((s) => (
        <div key={s.n} className={`step-item ${step === s.n ? 'active' : ''} ${step > s.n ? 'completed' : ''}`}>
          <div className="step-icon"><s.icon size={18} /></div>
          <span>{s.label}</span>
          {s.n < 5 && <div className="step-line" />}
        </div>
      ))}
    </div>
  );

  return (
    <div className="verification-container">
      <div className="verification-header">
        <div className="work-brief">
          <h2>{t('title_work_verification')}: {work.workCode}</h2>
          <p>{work.title} | {work.schoolName}</p>
        </div>
        <button className="close-btn" onClick={onCancel}><X size={24} /></button>
      </div>

      {renderStepIndicator()}

      <div className="step-content">
        {step === 1 && (
          <div className="inspection-form animate-in">
            <h3>Step 1: Site Inspection</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>{t('label_inspector_name')}</label>
                <input 
                  type="text" 
                  value={inspection.inspectorName} 
                  onChange={e => setInspection({...inspection, inspectorName: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Inspection Date</label>
                <input 
                  type="date" 
                  value={inspection.inspectionDate} 
                  onChange={e => setInspection({...inspection, inspectionDate: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>{t('label_quality_assessment')}</label>
                <select 
                  value={inspection.qualityScore} 
                  onChange={e => setInspection({...inspection, qualityScore: e.target.value})}
                >
                  <option value="Excellent">Excellent</option>
                  <option value="Good">Good</option>
                  <option value="Satisfactory">Satisfactory</option>
                  <option value="Needs Improvement">Needs Improvement</option>
                </select>
              </div>
              <div className="form-checkbox">
                <input 
                  type="checkbox" 
                  checked={inspection.complianceWithSpecifications} 
                  onChange={e => setInspection({...inspection, complianceWithSpecifications: e.target.checked})}
                  id="compliance"
                />
                <label htmlFor="compliance">Complies with project specifications</label>
              </div>
              <div className="form-group full-width">
                <label>Inspection Notes</label>
                <textarea 
                  value={inspection.notes} 
                  onChange={e => setInspection({...inspection, notes: e.target.value})}
                  rows="4"
                  placeholder="Notes from site visit..."
                />
              </div>
            </div>
            <div className="step-actions">
              <button className="next-btn" onClick={handleSaveInspection} disabled={loading}>
                Save & Continue <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="punch-list-section animate-in">
            <h3>Step 2: Punch List Management</h3>
            <p className="section-desc">Add items that need correction or repair before final handover.</p>
            
            <form className="add-punch-form" onSubmit={handleAddPunchItem}>
              <div className="punch-inputs-row">
                <input 
                  type="text" 
                  placeholder="Item description" 
                  value={newPunchItem.description}
                  onChange={e => setNewPunchItem({...newPunchItem, description: e.target.value})}
                  required
                />
                <input 
                  type="text" 
                  placeholder="Location" 
                  value={newPunchItem.location}
                  onChange={e => setNewPunchItem({...newPunchItem, location: e.target.value})}
                />
                <select 
                  value={newPunchItem.severity}
                  onChange={e => setNewPunchItem({...newPunchItem, severity: e.target.value})}
                >
                  <option value="Minor">Minor</option>
                  <option value="Critical">Critical</option>
                </select>
                <button type="submit" className="add-btn"><Plus size={18} /> Add</button>
              </div>
            </form>

            <div className="punch-items-list">
              {punchList.map(item => (
                <div key={item.id} className={`punch-card ${item.status.toLowerCase()}`}>
                  <div className="punch-info">
                    <span className={`sev-tag ${item.severity.toLowerCase()}`}>{item.severity}</span>
                    <h4>{item.description}</h4>
                    <p><MapPin size={12} /> {item.location}</p>
                  </div>
                  <div className="punch-status-actions">
                    {item.status === 'Open' ? (
                      <button className="resolve-btn" onClick={() => handleResolvePunchItem(item.id)}>Mark Resolved</button>
                    ) : (
                      <span className="resolved-tag"><CheckCircle2 size={14} /> Resolved</span>
                    )}
                  </div>
                </div>
              ))}
              {punchList.length === 0 && <div className="empty-state-box">No punch items recorded.</div>}
            </div>

            <div className="step-actions">
              <button className="back-btn" onClick={() => setStep(1)}><ChevronLeft size={18} /> Back</button>
              <button className="next-btn" onClick={() => setStep(3)}>Continue <ChevronRight size={18} /></button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="photos-section animate-in">
            <h3>Step 3: Final Documentation (Photos)</h3>
            <p className="section-desc">Upload at least 2 mandatory inspection photos (Geo-tagging recommended).</p>
            
            <div className="upload-zone">
              <input type="file" multiple accept="image/*" onChange={handleFileSelect} id="photo-upload" hidden />
              <label htmlFor="photo-upload" className="upload-btn">
                <Camera size={24} />
                <span>Select Photos</span>
              </label>
              {selectedFiles.length > 0 && (
                <div className="selected-files-count">
                  {selectedFiles.length} files selected
                  <button className="upload-now-btn" onClick={handleUploadPhotos} disabled={uploadingPhotos}>
                    {uploadingPhotos ? 'Uploading...' : 'Upload Now'}
                  </button>
                </div>
              )}
            </div>

            <div className="photos-grid">
              {verificationPhotos.map((photo, i) => (
                <div key={i} className="photo-card">
                  <img src={`http://localhost:8080${photo.photoUrl}`} alt="Inspection" />
                  {photo.latitude && (
                    <div className="photo-meta-overlay">
                      <MapPin size={10} /> {photo.latitude.toFixed(4)}, {photo.longitude.toFixed(4)}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="step-actions">
              <button className="back-btn" onClick={() => setStep(2)}><ChevronLeft size={18} /> Back</button>
              <button className="next-btn" onClick={() => setStep(4)} disabled={verificationPhotos.length < 2}>
                Continue <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="handover-section animate-in">
            <h3>Step 4: Handover Certificate</h3>
            
            <div className="certificate-preview">
              <div className="cert-header">
                <img src="/logo192.png" alt="Logo" width="40" />
                <h4>WORK COMPLETION & HANDOVER CERTIFICATE</h4>
              </div>
              <div className="cert-body">
                <div className="cert-row"><strong>Work Code:</strong> {work.workCode}</div>
                <div className="cert-row"><strong>Project Title:</strong> {work.title}</div>
                <div className="cert-row"><strong>School:</strong> {work.schoolName}</div>
                <div className="cert-row"><strong>Completion Date:</strong> {new Date().toLocaleDateString()}</div>
                <div className="cert-row"><strong>Total Cost:</strong> ₹{certificate.actualExpenditure.toLocaleString()}</div>
              </div>
              <div className="cert-signs">
                <div className="sign-box">
                  <div className="sign-pad">{user.name}</div>
                  <label>Sachiv Signature</label>
                </div>
                <div className="sign-box">
                  <div className="sign-pad placeholder">Pending HM Signature</div>
                  <label>Head Master Signature</label>
                </div>
              </div>
            </div>

            <div className="step-actions">
              <button className="back-btn" onClick={() => setStep(3)}><ChevronLeft size={18} /> Back</button>
              <button className="next-btn" onClick={() => setStep(5)}>Continue to Financials <ChevronRight size={18} /></button>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="financials-section animate-in">
            <h3>Step 5: Financial Settlement</h3>
            
            <div className="settlement-grid">
              <div className="fin-card sanctioned">
                <label>Sanctioned Amount</label>
                <div className="val">₹{work.sanctionedAmount?.toLocaleString()}</div>
              </div>
              <div className="fin-card utilized">
                <label>Actual Expenditure</label>
                <input 
                  type="number" 
                  value={certificate.actualExpenditure}
                  onChange={e => setCertificate({...certificate, actualExpenditure: Number(e.target.value)})}
                />
              </div>
              <div className="fin-card balance">
                <label>Unspent Funds</label>
                <div className="val">₹{Math.max(0, work.sanctionedAmount - certificate.actualExpenditure).toLocaleString()}</div>
              </div>
            </div>

            <div className="form-group full-width mt-4">
              <label>Fund Return Details / Remarks</label>
              <textarea 
                value={certificate.fundReturnDetails}
                onChange={e => setCertificate({...certificate, fundReturnDetails: e.target.value})}
                placeholder="Details about unspent funds return or financial observations..."
                rows="3"
              />
            </div>

            <div className="step-actions">
              <button className="back-btn" onClick={() => setStep(4)}><ChevronLeft size={18} /> Back</button>
              <button className="finish-btn" onClick={handleFinalize} disabled={loading}>
                <CheckCircle2 size={18} /> Finalize & Close Work
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .verification-container { background: white; border-radius: 1.25rem; overflow: hidden; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); }
        .verification-header { padding: 1.5rem 2rem; background: #f8fafc; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
        .work-brief h2 { margin: 0; font-size: 1.25rem; color: #1e293b; }
        .work-brief p { margin: 0.25rem 0 0; color: #64748b; font-size: 0.9rem; }
        .close-btn { background: #f1f5f9; border: none; color: #64748b; cursor: pointer; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
        .close-btn:hover { background: #e2e8f0; color: #1e293b; }

        .step-indicator { display: flex; justify-content: space-between; padding: 1.5rem 3rem; background: #f8fafc; border-bottom: 1px solid #f1f5f9; }
        .step-item { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; position: relative; flex: 1; }
        .step-icon { width: 36px; height: 36px; border-radius: 50%; background: white; display: flex; align-items: center; justify-content: center; border: 2px solid #e2e8f0; color: #94a3b8; z-index: 2; transition: all 0.3s; }
        .step-item.active .step-icon { border-color: #0ea5e9; color: #0ea5e9; background: #f0f9ff; transform: scale(1.1); box-shadow: 0 0 0 4px rgba(14, 165, 233, 0.1); }
        .step-item.completed .step-icon { border-color: #10b981; color: white; background: #10b981; }
        .step-item span { font-size: 0.75rem; font-weight: 700; color: #64748b; }
        .step-item.active span { color: #0ea5e9; }
        .step-line { position: absolute; top: 18px; left: calc(50% + 18px); width: calc(100% - 36px); height: 2px; background: #e2e8f0; z-index: 1; }
        .step-item.completed .step-line { background: #10b981; }

        .step-content { padding: 2.5rem; min-height: 500px; max-width: 900px; margin: 0 auto; }
        .animate-in { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
        .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
        .form-group.full-width { grid-column: span 2; }
        .form-group label { font-weight: 700; color: #475569; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.025em; }
        .form-group input, .form-group select, .form-group textarea { padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: 0.5rem; font-size: 0.95rem; outline: none; transition: border-color 0.2s; }
        .form-group input:focus { border-color: #0ea5e9; }
        
        .form-checkbox { grid-column: span 2; display: flex; align-items: center; gap: 0.75rem; background: #f8fafc; padding: 1rem; border-radius: 0.75rem; border: 1px solid #e2e8f0; }
        .form-checkbox input { width: 1.25rem; height: 1.25rem; accent-color: #0ea5e9; }
        .form-checkbox label { font-weight: 600; color: #1e293b; cursor: pointer; }

        .add-punch-form { background: #f8fafc; padding: 1.5rem; border-radius: 1rem; border: 1px solid #e2e8f0; margin-bottom: 2rem; }
        .punch-inputs-row { display: grid; grid-template-columns: 1fr 150px 120px 100px; gap: 0.75rem; }
        .add-btn { background: #1e293b; color: white; border: none; border-radius: 0.5rem; font-weight: 700; cursor: pointer; transition: background 0.2s; }
        .add-btn:hover { background: #0f172a; }

        .punch-card { padding: 1.25rem; border: 1px solid #e2e8f0; border-radius: 1rem; display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem; background: white; transition: all 0.2s; }
        .punch-card:hover { border-color: #cbd5e1; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        .punch-card.resolved { opacity: 0.6; background: #f8fafc; }
        .sev-tag { font-size: 0.65rem; font-weight: 800; text-transform: uppercase; padding: 0.2rem 0.5rem; border-radius: 4px; margin-bottom: 0.5rem; display: inline-block; }
        .sev-tag.minor { background: #fef3c7; color: #92400e; }
        .sev-tag.critical { background: #fee2e2; color: #991b1b; }
        .punch-info h4 { margin: 0; font-size: 1rem; color: #1e293b; }
        .punch-info p { margin: 0.25rem 0 0; font-size: 0.8rem; color: #64748b; display: flex; align-items: center; gap: 0.25rem; }
        .resolve-btn { padding: 0.5rem 1rem; background: #e0f2fe; color: #0ea5e9; border: none; border-radius: 0.5rem; font-weight: 700; cursor: pointer; }
        .resolved-tag { color: #10b981; font-weight: 700; display: flex; align-items: center; gap: 0.4rem; font-size: 0.9rem; }

        .upload-zone { border: 2px dashed #e2e8f0; border-radius: 1rem; padding: 3rem; text-align: center; margin-bottom: 2rem; background: #f8fafc; }
        .upload-btn { display: flex; flex-direction: column; align-items: center; gap: 1rem; color: #64748b; cursor: pointer; }
        .upload-btn:hover { color: #0ea5e9; }
        .upload-now-btn { margin-left: 1rem; background: #0ea5e9; color: white; border: none; padding: 0.4rem 1rem; border-radius: 0.5rem; font-weight: 600; cursor: pointer; }

        .photos-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 1.5rem; }
        .photo-card { height: 140px; border-radius: 0.75rem; overflow: hidden; position: relative; border: 1px solid #e2e8f0; }
        .photo-card img { width: 100%; height: 100%; object-fit: cover; }
        .photo-meta-overlay { position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.6); color: white; padding: 0.3rem 0.6rem; font-size: 0.65rem; display: flex; align-items: center; gap: 0.25rem; }

        .certificate-preview { background: white; border: 1px solid #e2e8f0; border-radius: 1rem; padding: 3rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); }
        .cert-header { text-align: center; border-bottom: 2px solid #1e293b; padding-bottom: 1.5rem; margin-bottom: 2rem; }
        .cert-header h4 { margin: 1rem 0 0; letter-spacing: 0.05em; color: #1e293b; }
        .cert-body { margin-bottom: 3rem; }
        .cert-row { padding: 0.75rem 0; border-bottom: 1px solid #f1f5f9; font-size: 0.95rem; }
        .cert-signs { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; }
        .sign-box { text-align: center; }
        .sign-pad { height: 80px; border-bottom: 1px solid #94a3b8; display: flex; align-items: center; justify-content: center; font-family: 'Dancing Script', cursive; font-size: 1.5rem; color: #1e293b; margin-bottom: 0.5rem; }
        .sign-pad.placeholder { font-family: inherit; font-size: 0.85rem; color: #94a3b8; font-style: italic; }
        .sign-box label { font-size: 0.75rem; font-weight: 700; color: #64748b; text-transform: uppercase; }

        .settlement-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
        .fin-card { padding: 1.5rem; border-radius: 1rem; border: 1px solid #e2e8f0; }
        .fin-card label { display: block; font-size: 0.7rem; font-weight: 800; color: #64748b; text-transform: uppercase; margin-bottom: 0.5rem; }
        .fin-card .val { font-size: 1.25rem; font-weight: 800; color: #1e293b; }
        .fin-card.sanctioned { background: #f0f9ff; border-color: #bae6fd; }
        .fin-card.utilized input { width: 100%; border: none; background: transparent; font-size: 1.25rem; font-weight: 800; color: #0ea5e9; border-bottom: 2px solid #0ea5e9; padding: 0; outline: none; }
        .fin-card.balance { background: #f0fdf4; border-color: #bbf7d0; }
        .fin-card.balance .val { color: #10b981; }

        .step-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 3rem; padding-top: 2rem; border-top: 1px solid #f1f5f9; }
        .next-btn, .finish-btn { padding: 0.85rem 2rem; background: #0ea5e9; color: white; border: none; border-radius: 0.75rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; transition: all 0.2s; }
        .next-btn:hover { background: #0284c7; transform: translateY(-1px); }
        .finish-btn { background: #10b981; }
        .finish-btn:hover { background: #059669; }
        .back-btn { padding: 0.85rem 1.5rem; background: white; border: 1px solid #d1d5db; border-radius: 0.75rem; font-weight: 700; color: #475569; cursor: pointer; }
        
        .error-alert { background: #fee2e2; color: #991b1b; padding: 1rem; border-radius: 0.75rem; margin-bottom: 2rem; display: flex; align-items: center; gap: 0.75rem; font-weight: 600; border: 1px solid #fecaca; }
        .empty-state-box { padding: 2rem; text-align: center; color: #94a3b8; background: #f8fafc; border-radius: 0.75rem; border: 1px dashed #e2e8f0; }
        .mt-4 { margin-top: 1rem; }
      `}</style>
    </div>
  );
};

export default WorkVerification;
