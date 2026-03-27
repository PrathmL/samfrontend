import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Trash2, Check, ArrowRight, ArrowLeft } from 'lucide-react';

const WorkCreationForm = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [request, setRequest] = useState(null);
  const [quotation, setQuotation] = useState(null);
  const [workId, setWorkId] = useState(null);

  const [workData, setWorkData] = useState({
    workCode: `WRK-${Date.now().toString().slice(-6)}`,
    title: '',
    description: '',
    type: '',
    sanctionedAmount: 0
  });

  const [stages, setStages] = useState([
    { name: 'Foundation', description: 'Initial earthwork and foundation', weightage: 20, estimatedDurationDays: 15 },
    { name: 'Structure', description: 'Main building structure', weightage: 40, estimatedDurationDays: 30 },
    { name: 'Finishing', description: 'Plastering and painting', weightage: 30, estimatedDurationDays: 20 },
    { name: 'Handover', description: 'Final cleanup and inspection', weightage: 10, estimatedDurationDays: 5 }
  ]);

  const [fundSources, setFundSources] = useState([
    { sourceName: 'Government Grant', amount: 0 }
  ]);

  useEffect(() => {
    if (requestId) {
      fetchRequestDetails();
    }
  }, [requestId]);

  const fetchRequestDetails = async () => {
    try {
      const reqRes = await axios.get(`http://localhost:8080/api/work-requests/${requestId}`);
      const quotRes = await axios.get(`http://localhost:8080/api/work-requests/${requestId}/quotation`);
      
      setRequest(reqRes.data);
      setQuotation(quotRes.data);
      
      setWorkData(prev => ({
        ...prev,
        title: reqRes.data.title,
        description: reqRes.data.description,
        type: reqRes.data.type,
        sanctionedAmount: quotRes.data.grandTotal
      }));

      // Initialize primary fund source with quoted amount
      setFundSources([{ sourceName: 'Government Grant', amount: quotRes.data.grandTotal }]);
    } catch (err) { console.error(err); }
  };

  const handleCreateWork = async () => {
    try {
      const res = await axios.post('http://localhost:8080/api/works', {
        ...workData,
        workRequestId: requestId,
        schoolId: request.schoolId,
        status: 'DRAFT'
      });
      setWorkId(res.data.id);
      setStep(2);
    } catch (err) { console.error(err); }
  };

  const handleSaveStages = async () => {
    const totalWeight = stages.reduce((sum, s) => sum + Number(s.weightage), 0);
    if (totalWeight !== 100) {
      alert(`Total weightage must be 100%. Current total: ${totalWeight}%`);
      return;
    }
    try {
      await axios.post(`http://localhost:8080/api/works/${workId}/stages`, stages);
      setStep(3);
    } catch (err) { console.error(err); }
  };

  const handleSaveFunds = async () => {
    const totalAllocated = fundSources.reduce((sum, f) => sum + Number(f.amount), 0);
    if (totalAllocated !== Number(workData.sanctionedAmount)) {
      alert(`Total allocated funds (₹${totalAllocated}) must equal sanctioned amount (₹${workData.sanctionedAmount})`);
      return;
    }
    try {
      await axios.post(`http://localhost:8080/api/works/${workId}/fund-sources`, fundSources);
      setStep(4);
    } catch (err) { console.error(err); }
  };

  const handleActivate = async () => {
    try {
      await axios.post(`http://localhost:8080/api/works/${workId}/activate`);
      navigate('/admin/work-requests');
    } catch (err) { console.error(err); }
  };

  const addStage = () => setStages([...stages, { name: '', description: '', weightage: 0, estimatedDurationDays: 0 }]);
  const removeStage = (index) => setStages(stages.filter((_, i) => i !== index));

  const addFundSource = () => setFundSources([...fundSources, { sourceName: '', amount: 0 }]);
  const removeFundSource = (index) => setFundSources(fundSources.filter((_, i) => i !== index));

  return (
    <div className="work-creation-container">
      <div className="stepper">
        <div className={`step ${step >= 1 ? 'active' : ''}`}>1. Basic Details</div>
        <div className={`step ${step >= 2 ? 'active' : ''}`}>2. Stage Management</div>
        <div className={`step ${step >= 3 ? 'active' : ''}`}>3. Fund Allocation</div>
        <div className={`step ${step >= 4 ? 'active' : ''}`}>4. Review & Activate</div>
      </div>

      <div className="form-card">
        {step === 1 && (
          <div className="step-content">
            <h2>Basic Work Details</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Work Code</label>
                <input type="text" value={workData.workCode} readOnly />
              </div>
              <div className="form-group">
                <label>Title</label>
                <input type="text" value={workData.title} onChange={e => setWorkData({...workData, title: e.target.value})} />
              </div>
              <div className="form-group full-width">
                <label>Description</label>
                <textarea value={workData.description} onChange={e => setWorkData({...workData, description: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Work Type</label>
                <input type="text" value={workData.type} readOnly />
              </div>
              <div className="form-group">
                <label>Sanctioned Amount (₹)</label>
                <input type="number" value={workData.sanctionedAmount} onChange={e => setWorkData({...workData, sanctionedAmount: e.target.value})} />
              </div>
            </div>
            <div className="step-footer">
              <button className="next-btn" onClick={handleCreateWork}>Next: Stages <ArrowRight size={18} /></button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="step-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2>Project Stages</h2>
              <button className="add-btn" onClick={addStage}><Plus size={18} /> Add Stage</button>
            </div>
            <div className="stages-list">
              {stages.map((stage, index) => (
                <div key={index} className="stage-row">
                  <input placeholder="Stage Name" value={stage.name} onChange={e => {
                    const newStages = [...stages];
                    newStages[index].name = e.target.value;
                    setStages(newStages);
                  }} />
                  <input placeholder="Weight %" type="number" style={{ width: '100px' }} value={stage.weightage} onChange={e => {
                    const newStages = [...stages];
                    newStages[index].weightage = e.target.value;
                    setStages(newStages);
                  }} />
                  <input placeholder="Days" type="number" style={{ width: '100px' }} value={stage.estimatedDurationDays} onChange={e => {
                    const newStages = [...stages];
                    newStages[index].estimatedDurationDays = e.target.value;
                    setStages(newStages);
                  }} />
                  <button className="delete-btn" onClick={() => removeStage(index)}><Trash2 size={18} /></button>
                </div>
              ))}
            </div>
            <div className="total-indicator">
              Total Weightage: {stages.reduce((sum, s) => sum + Number(s.weightage), 0)}% / 100%
            </div>
            <div className="step-footer">
              <button className="back-btn" onClick={() => setStep(1)}><ArrowLeft size={18} /> Back</button>
              <button className="next-btn" onClick={handleSaveStages}>Next: Funds <ArrowRight size={18} /></button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="step-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2>Fund Allocation</h2>
              <button className="add-btn" onClick={addFundSource}><Plus size={18} /> Add Source</button>
            </div>
            <div className="funds-list">
              {fundSources.map((source, index) => (
                <div key={index} className="fund-row">
                  <input placeholder="Source Name" value={source.sourceName} onChange={e => {
                    const newSources = [...fundSources];
                    newSources[index].sourceName = e.target.value;
                    setFundSources(newSources);
                  }} />
                  <input placeholder="Amount (₹)" type="number" value={source.amount} onChange={e => {
                    const newSources = [...fundSources];
                    newSources[index].amount = e.target.value;
                    setFundSources(newSources);
                  }} />
                  <button className="delete-btn" onClick={() => removeFundSource(index)}><Trash2 size={18} /></button>
                </div>
              ))}
            </div>
            <div className="total-indicator">
              Total Allocated: ₹{fundSources.reduce((sum, f) => sum + Number(f.amount), 0)} / ₹{workData.sanctionedAmount}
            </div>
            <div className="step-footer">
              <button className="back-btn" onClick={() => setStep(2)}><ArrowLeft size={18} /> Back</button>
              <button className="next-btn" onClick={handleSaveFunds}>Next: Review <ArrowRight size={18} /></button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="step-content">
            <h2>Review and Activate Work</h2>
            <div className="review-section">
              <div className="review-grid">
                <div className="review-item"><strong>Title:</strong> {workData.title}</div>
                <div className="review-item"><strong>Code:</strong> {workData.workCode}</div>
                <div className="review-item"><strong>Total Budget:</strong> ₹{workData.sanctionedAmount}</div>
                <div className="review-item"><strong>Stages:</strong> {stages.length}</div>
              </div>
              
              <div className="review-table-mini">
                <h4>Stages Summary</h4>
                {stages.map((s, i) => (
                  <div key={i} className="mini-row"><span>{s.name}</span> <span>{s.weightage}%</span></div>
                ))}
              </div>
            </div>
            <div className="step-footer">
              <button className="back-btn" onClick={() => setStep(3)}><ArrowLeft size={18} /> Back</button>
              <button className="activate-btn" onClick={handleActivate}><Check size={18} /> Activate Work</button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .work-creation-container { max-width: 900px; margin: 0 auto; padding: 2rem; }
        .stepper { display: flex; justify-content: space-between; margin-bottom: 3rem; position: relative; }
        .stepper::before { content: ''; position: absolute; top: 50%; left: 0; right: 0; height: 2px; background: #e2e8f0; z-index: -1; }
        .step { background: white; border: 2px solid #e2e8f0; padding: 0.5rem 1.5rem; border-radius: 9999px; font-weight: 600; color: #64748b; }
        .step.active { border-color: #0ea5e9; color: #0ea5e9; }
        
        .form-card { background: white; padding: 2.5rem; border-radius: 1rem; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-top: 1.5rem; }
        .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
        .form-group.full-width { grid-column: span 2; }
        .form-group label { font-weight: 600; color: #334155; }
        .form-group input, .form-group textarea { padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 1rem; }
        .form-group textarea { min-height: 100px; resize: vertical; }

        .stage-row, .fund-row { display: flex; gap: 1rem; margin-bottom: 1rem; }
        .stage-row input, .fund-row input { flex: 1; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; }
        
        .total-indicator { margin-top: 1.5rem; padding: 1rem; background: #f8fafc; border-radius: 0.5rem; font-weight: 700; text-align: right; }
        
        .step-footer { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 3rem; }
        .next-btn, .activate-btn { display: flex; align-items: center; gap: 0.5rem; background: #0ea5e9; color: white; border: none; padding: 0.75rem 2rem; border-radius: 0.5rem; font-weight: 600; cursor: pointer; }
        .activate-btn { background: #10b981; }
        .back-btn { display: flex; align-items: center; gap: 0.5rem; background: white; border: 1px solid #d1d5db; padding: 0.75rem 2rem; border-radius: 0.5rem; font-weight: 600; cursor: pointer; }
        .delete-btn { color: #ef4444; background: none; border: none; cursor: pointer; }
        .add-btn { display: flex; align-items: center; gap: 0.4rem; color: #0ea5e9; background: none; border: 1px solid #0ea5e9; padding: 0.4rem 1rem; border-radius: 0.4rem; cursor: pointer; font-weight: 600; }

        .review-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 2rem; }
        .review-item { padding: 1rem; background: #f1f5f9; border-radius: 0.5rem; }
        .review-table-mini { margin-top: 1rem; }
        .mini-row { display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px solid #eee; }
      `}</style>
    </div>
  );
};

export default WorkCreationForm;
