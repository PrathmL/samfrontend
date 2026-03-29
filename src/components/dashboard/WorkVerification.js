import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { 
  ClipboardCheck, List, FileCheck, 
  Plus, CheckCircle2, AlertCircle, 
  Camera, MapPin, User, ShieldCheck,
  ChevronRight, ChevronLeft, Download,
  Save, AlertTriangle, X
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const WorkVerification = ({ work, onComplete, onCancel }) => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Step 1: Inspection
  const [inspection, setInspection] = useState({
    inspectorName: '',
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

  // Step 3: Certificate
  const [certificate, setCertificate] = useState({
    sachivESign: '',
    hmESign: ''
  });

  useEffect(() => {
    fetchExistingData();
  }, []);

  const fetchExistingData = async () => {
    try {
      const [inspRes, punchRes] = await Promise.all([
        axios.get(`http://localhost:8080/api/works/verification/${work.id}/inspection`),
        axios.get(`http://localhost:8080/api/works/verification/${work.id}/punch-list`)
      ]);
      if (inspRes.data) setInspection(inspRes.data);
      if (punchRes.data) setPunchList(punchRes.data);
    } catch (err) {
      console.error('Error fetching verification data:', err);
    }
  };

  const handleSaveInspection = async () => {
    try {
      setLoading(true);
      await axios.post(`http://localhost:8080/api/works/verification/${work.id}/inspection`, inspection);
      setStep(2);
    } catch (err) {
      setError('Failed to save inspection details.');
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
    } catch (err) {
      setError('Failed to add punch list item.');
    }
  };

  const handleResolvePunchItem = async (id) => {
    try {
      await axios.put(`http://localhost:8080/api/works/verification/punch-list/${id}/resolve`, {
        remarks: 'Resolved during final verification',
        photoAfter: ''
      });
      setPunchList(punchList.map(item => item.id === id ? { ...item, status: 'Resolved' } : item));
    } catch (err) {
      setError('Failed to resolve item.');
    }
  };

  const handleGenerateCertificate = async () => {
    const openItems = punchList.filter(i => i.status === 'Open');
    if (openItems.length > 0) {
      setError(`Cannot generate certificate. ${openItems.length} punch list items are still open.`);
      return;
    }

    try {
      setLoading(true);
      await axios.post(`http://localhost:8080/api/works/verification/${work.id}/certificate`, certificate);
      onComplete();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate certificate.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="step-indicator">
      {[
        { n: 1, label: t('step_inspection'), icon: ClipboardCheck },
        { n: 2, label: t('step_punch_list'), icon: List },
        { n: 3, label: t('step_handover'), icon: FileCheck }
      ].map((s) => (
        <div key={s.n} className={`step-item ${step === s.n ? 'active' : ''} ${step > s.n ? 'completed' : ''}`}>
          <div className="step-icon"><s.icon size={20} /></div>
          <span>{s.label}</span>
          {s.n < 3 && <div className="step-line" />}
        </div>
      ))}
    </div>
  );

  return (
    <div className="verification-container">
      <div className="verification-header">
        <div className="work-brief">
          <h2>{t('title_work_verification')}: {work.workCode}</h2>
          <p>{work.title}</p>
        </div>
        <button className="close-btn" onClick={onCancel}><X size={24} /></button>
      </div>

      {renderStepIndicator()}

      <div className="step-content">
        {error && <div className="error-alert"><AlertTriangle size={18} /> {error}</div>}

        {step === 1 && (
          <div className="inspection-form">
            <h3>{t('step_inspection')}</h3>
            <div className="form-grid">
              <div className="form-group">
                <label>{t('label_inspector_name')}</label>
                <input 
                  type="text" 
                  value={inspection.inspectorName} 
                  onChange={e => setInspection({...inspection, inspectorName: e.target.value})}
                  placeholder="Enter your name"
                />
              </div>
              <div className="form-group">
                <label>{t('label_quality_assessment')}</label>
                <select 
                  value={inspection.qualityScore} 
                  onChange={e => setInspection({...inspection, qualityScore: e.target.value})}
                >
                  <option value="Excellent">{t('quality_excellent')}</option>
                  <option value="Good">{t('quality_good')}</option>
                  <option value="Satisfactory">{t('quality_satisfactory')}</option>
                  <option value="Needs Improvement">{t('quality_needs_improvement')}</option>
                </select>
              </div>
              <div className="form-group full-width">
                <label>{t('label_inspection_notes')}</label>
                <textarea 
                  value={inspection.notes} 
                  onChange={e => setInspection({...inspection, notes: e.target.value})}
                  rows="4"
                  placeholder="Describe your observations during site visit..."
                />
              </div>
              <div className="form-checkbox">
                <input 
                  type="checkbox" 
                  checked={inspection.complianceWithSpecifications} 
                  onChange={e => setInspection({...inspection, complianceWithSpecifications: e.target.checked})}
                  id="compliance"
                />
                <label htmlFor="compliance">{t('label_compliance')}</label>
              </div>
            </div>
            <div className="step-actions">
              <button className="next-btn" onClick={handleSaveInspection} disabled={loading}>
                {t('btn_save_continue')} <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="punch-list-section">
            <h3>{t('title_punch_list_mgmt')}</h3>
            <p className="section-desc">{t('desc_punch_list')}</p>
            
            <form className="add-punch-form" onSubmit={handleAddPunchItem}>
              <input 
                type="text" 
                placeholder={t('placeholder_issue_desc')} 
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
                <option value="Minor">{t('severity_minor')}</option>
                <option value="Critical">{t('severity_critical')}</option>
              </select>
              <button type="submit" className="add-btn"><Plus size={18} /> {t('btn_save')}</button>
            </form>

            <div className="punch-items-list">
              {punchList.map(item => (
                <div key={item.id} className={`punch-card ${item.status.toLowerCase()}`}>
                  <div className="punch-info">
                    <div className="punch-severity">{item.severity === 'Minor' ? t('severity_minor') : t('severity_critical')}</div>
                    <h4>{item.description}</h4>
                    <p><MapPin size={12} /> {item.location}</p>
                  </div>
                  <div className="punch-status-actions">
                    {item.status === 'Open' ? (
                      <button className="resolve-btn" onClick={() => handleResolvePunchItem(item.id)}>
                        {t('btn_mark_resolved')}
                      </button>
                    ) : (
                      <span className="resolved-tag"><CheckCircle2 size={14} /> {t('stat_resolved')}</span>
                    )}
                  </div>
                </div>
              ))}
              {punchList.length === 0 && <div className="empty-punch">{t('msg_no_punch_items')}</div>}
            </div>

            <div className="step-actions">
              <button className="back-btn" onClick={() => setStep(1)}><ChevronLeft size={18} /> Back</button>
              <button className="next-btn" onClick={() => setStep(3)}>{t('btn_continue_handover')} <ChevronRight size={18} /></button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="handover-section">
            <h3>{t('title_handover_cert')}</h3>
            
            <div className="summary-box">
              <div className="summary-item">
                <label>{t('field_sanctioned')}</label>
                <span>₹{work.sanctionedAmount?.toLocaleString()}</span>
              </div>
              <div className="summary-item">
                <label>{t('field_utilized_amt')}</label>
                <span>₹{work.totalUtilized?.toLocaleString()}</span>
              </div>
              <div className="summary-item">
                <label>{t('label_completion_date')}</label>
                <span>{new Date(work.completedAt || Date.now()).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="esign-section">
              <div className="esign-box">
                <label><ShieldCheck size={16} /> {t('label_sachiv_esign')}</label>
                <div className="esign-pad">
                  {user.name}
                  <small>{t('msg_digitally_verified')}</small>
                </div>
              </div>
              <div className="esign-box">
                <label><User size={16} /> {t('label_hm_esign')}</label>
                <div className="esign-pad placeholder">
                  {t('msg_pending_hm_sign')}
                </div>
              </div>
            </div>

            <div className="step-actions">
              <button className="back-btn" onClick={() => setStep(2)}><ChevronLeft size={18} /> Back</button>
              <button className="finish-btn" onClick={handleGenerateCertificate} disabled={loading}>
                <FileCheck size={18} /> {t('btn_generate_cert')}
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .verification-container { background: white; border-radius: 1rem; overflow: hidden; }
        .verification-header { padding: 1.5rem 2rem; background: #f8fafc; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
        .work-brief h2 { margin: 0; font-size: 1.25rem; color: #1e293b; }
        .work-brief p { margin: 0.25rem 0 0; color: #64748b; font-size: 0.9rem; }
        .close-btn { background: none; border: none; color: #94a3b8; cursor: pointer; }

        .step-indicator { display: flex; justify-content: center; padding: 2rem; gap: 4rem; border-bottom: 1px solid #f1f5f9; }
        .step-item { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; position: relative; color: #94a3b8; }
        .step-icon { width: 40px; height: 40px; border-radius: 50%; background: #f1f5f9; display: flex; align-items: center; justify-content: center; border: 2px solid #e2e8f0; transition: all 0.3s; }
        .step-item.active { color: #0ea5e9; }
        .step-item.active .step-icon { border-color: #0ea5e9; background: #e0f2fe; }
        .step-item.completed { color: #10b981; }
        .step-item.completed .step-icon { border-color: #10b981; background: #dcfce7; }
        .step-line { position: absolute; top: 20px; left: 60px; width: 100px; height: 2px; background: #e2e8f0; }
        .step-item.completed .step-line { background: #10b981; }

        .step-content { padding: 2rem; max-width: 800px; margin: 0 auto; min-height: 400px; }
        .error-alert { background: #fee2e2; color: #dc2626; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1.5rem; display: flex; align-items: center; gap: 0.5rem; font-weight: 500; }
        
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
        .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
        .form-group.full-width { grid-column: span 2; }
        .form-group label { font-weight: 600; color: #475569; font-size: 0.875rem; }
        .form-group input, .form-group select, .form-group textarea { padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 0.95rem; }
        .form-checkbox { grid-column: span 2; display: flex; align-items: center; gap: 0.75rem; margin-top: 0.5rem; }
        .form-checkbox input { width: 1.25rem; height: 1.25rem; }

        .add-punch-form { display: grid; grid-template-columns: 1fr 150px 120px 100px; gap: 0.75rem; margin-bottom: 2rem; }
        .add-btn { background: #1e293b; color: white; border: none; border-radius: 0.5rem; display: flex; align-items: center; justify-content: center; gap: 0.4rem; cursor: pointer; }
        .punch-items-list { display: flex; flex-direction: column; gap: 0.75rem; }
        .punch-card { padding: 1rem; border: 1px solid #e2e8f0; border-radius: 0.75rem; display: flex; justify-content: space-between; align-items: center; }
        .punch-card.resolved { background: #f8fafc; opacity: 0.7; }
        .punch-severity { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; margin-bottom: 0.25rem; }
        .punch-card.critical .punch-severity { color: #ef4444; }
        .punch-card.minor .punch-severity { color: #f59e0b; }
        .punch-info h4 { margin: 0; font-size: 1rem; }
        .punch-info p { margin: 0.25rem 0 0; font-size: 0.8rem; color: #64748b; display: flex; align-items: center; gap: 0.25rem; }
        .resolve-btn { padding: 0.5rem 1rem; background: #e0f2fe; color: #0ea5e9; border: none; border-radius: 0.4rem; font-weight: 600; cursor: pointer; }
        .resolved-tag { color: #10b981; font-weight: 600; display: flex; align-items: center; gap: 0.4rem; }

        .summary-box { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; background: #f8fafc; padding: 1.5rem; border-radius: 0.75rem; margin-bottom: 2rem; }
        .summary-item label { display: block; font-size: 0.75rem; color: #64748b; margin-bottom: 0.25rem; }
        .summary-item span { font-weight: 700; color: #1e293b; font-size: 1.1rem; }

        .esign-section { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 3rem; }
        .esign-box label { display: flex; align-items: center; gap: 0.5rem; font-weight: 600; color: #475569; font-size: 0.875rem; margin-bottom: 0.75rem; }
        .esign-pad { height: 100px; border: 2px dashed #cbd5e1; border-radius: 0.75rem; background: #f1f5f9; display: flex; flex-direction: column; align-items: center; justify-content: center; font-family: 'Dancing Script', cursive; font-size: 1.5rem; color: #1e293b; }
        .esign-pad.placeholder { font-family: inherit; font-size: 0.9rem; color: #94a3b8; }

        .step-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 3rem; border-top: 1px solid #f1f5f9; padding-top: 2rem; }
        .next-btn, .finish-btn { padding: 0.75rem 1.5rem; background: #0ea5e9; color: white; border: none; border-radius: 0.5rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; }
        .finish-btn { background: #10b981; }
        .back-btn { padding: 0.75rem 1.5rem; background: white; border: 1px solid #d1d5db; border-radius: 0.5rem; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 0.5rem; }
      `}</style>
    </div>
  );
};

export default WorkVerification;
