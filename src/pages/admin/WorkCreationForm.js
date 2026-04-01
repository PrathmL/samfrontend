import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Trash2, Check, ArrowRight, ArrowLeft, X, AlertTriangle } from 'lucide-react';
import { showToast, showErrorAlert, showSuccessAlert, showConfirmAlert } from '../../utils/sweetAlertUtils';

const WorkCreationForm = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [request, setRequest] = useState(null);
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(false);

  const [workData, setWorkData] = useState({
    workCode: '',
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
      setLoading(true);
      // Fetch work request details
      const reqRes = await axios.get(`http://localhost:8080/api/work-requests/${requestId}`);
      const requestData = reqRes.data;
      setRequest(requestData);
      
      // Fetch quotation
      try {
        const quotRes = await axios.get(`http://localhost:8080/api/work-requests/${requestId}/quotation`);
        const quotationData = quotRes.data;
        setQuotation(quotationData);
        
        // Auto-generate work code
        const workCode = `WRK${new Date().getFullYear().toString().substring(2)}${String(Math.floor(Math.random() * 1000)).padStart(4, '0')}`;
        
        setWorkData({
          workCode: workCode,
          title: requestData.title,
          description: requestData.description,
          type: requestData.type,
          sanctionedAmount: quotationData.grandTotal
        });
        
        // Set fund source with quoted amount
        setFundSources([{ sourceName: 'Government Grant', amount: quotationData.grandTotal }]);
      } catch (err) {
        console.error('No quotation found:', err);
        showErrorAlert('Error', 'Quotation not found for this request');
      }
    } catch (err) {
      console.error('Error fetching request:', err);
      showErrorAlert('Error', 'Failed to fetch work request details');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWork = async () => {
    // Validate total weightage
    const totalWeight = stages.reduce((sum, s) => sum + Number(s.weightage), 0);
    if (totalWeight !== 100) {
      showErrorAlert('Validation Error', `Total stage weightage must be 100%. Current total: ${totalWeight}%`);
      return;
    }
    
    // Validate total fund allocation
    const totalAllocated = fundSources.reduce((sum, f) => sum + Number(f.amount), 0);
    if (Math.abs(totalAllocated - Number(workData.sanctionedAmount)) > 0.01) {
      showErrorAlert('Validation Error', `Total allocated funds (₹${totalAllocated.toLocaleString()}) must equal sanctioned amount (₹${Number(workData.sanctionedAmount).toLocaleString()})`);
      return;
    }

    const isConfirmed = await showConfirmAlert(
      'Create Work?',
      'Are you sure you want to create this work from the request?'
    );

    if (!isConfirmed) return;
    
    setLoading(true);
    try {
      const payload = {
        workRequestId: parseInt(requestId),
        workCode: workData.workCode,
        title: workData.title,
        description: workData.description,
        type: workData.type,
        sanctionedAmount: workData.sanctionedAmount,
        stages: stages.map(s => ({
          name: s.name,
          description: s.description,
          weightage: parseInt(s.weightage),
          estimatedDurationDays: parseInt(s.estimatedDurationDays)
        })),
        fundSources: fundSources.map(f => ({
          sourceName: f.sourceName,
          amount: parseFloat(f.amount)
        }))
      };
      
      await axios.post('http://localhost:8080/api/works/create-from-request', payload);
      showSuccessAlert('Success', 'Work created successfully!');
      setTimeout(() => {
        navigate('/admin/work-requests');
      }, 2000);
    } catch (err) {
      showErrorAlert('Error', err.response?.data?.error || 'Failed to create work');
    } finally {
      setLoading(false);
    }
  };

  const addStage = () => {
    setStages([...stages, { name: '', description: '', weightage: 0, estimatedDurationDays: 0 }]);
  };
  
  const removeStage = (index) => {
    setStages(stages.filter((_, i) => i !== index));
  };
  
  const updateStage = (index, field, value) => {
    const newStages = [...stages];
    newStages[index][field] = value;
    setStages(newStages);
  };
  
  const addFundSource = () => {
    setFundSources([...fundSources, { sourceName: '', amount: 0 }]);
  };
  
  const removeFundSource = (index) => {
    setFundSources(fundSources.filter((_, i) => i !== index));
  };
  
  const updateFundSource = (index, field, value) => {
    const newSources = [...fundSources];
    newSources[index][field] = value;
    setFundSources(newSources);
  };

  const totalWeightage = stages.reduce((sum, s) => sum + (Number(s.weightage) || 0), 0);
  const totalAllocated = fundSources.reduce((sum, f) => sum + (Number(f.amount) || 0), 0);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="work-creation-container">
      <div className="page-header">
        <div className="header-text">
          <h1>Create Work from Request</h1>
          <p>Official project creation for Request: <strong>{request?.title}</strong> | Request ID: #{requestId}</p>
        </div>
        <button className="back-btn" onClick={() => navigate('/admin/work-requests')}>
          <ArrowLeft size={18} /> Back to Requests
        </button>
      </div>

      <div className="form-main-layout">
        <div className="form-sections-column">
          {/* Section 1: Basic Details */}
          <div className="form-section-card">
            <div className="section-header">
              <div className="section-number">1</div>
              <h2>Basic Work Details</h2>
            </div>
            <div className="section-content">
              <div className="form-grid">
                <div className="form-group">
                  <label>Work Code</label>
                  <input
                    type="text"
                    className="form-control"
                    value={workData.workCode}
                    onChange={(e) => setWorkData({...workData, workCode: e.target.value})}
                    placeholder="WRK-YYYY-XXXX"
                    required
                  />
                  <small className="form-help">Unique identification code for this project.</small>
                </div>
                <div className="form-group">
                  <label>Work Title</label>
                  <input
                    type="text"
                    className="form-control"
                    value={workData.title}
                    onChange={(e) => setWorkData({...workData, title: e.target.value})}
                    required
                  />
                </div>
                <div className="form-group full-width">
                  <label>Description</label>
                  <textarea
                    className="form-control"
                    value={workData.description}
                    onChange={(e) => setWorkData({...workData, description: e.target.value})}
                    rows="3"
                  />
                </div>
                <div className="form-group">
                  <label>Work Type</label>
                  <div className="readonly-value">{workData.type}</div>
                </div>
                <div className="form-group">
                  <label>Sanctioned Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    className="form-control amount-input"
                    value={workData.sanctionedAmount}
                    onChange={(e) => setWorkData({...workData, sanctionedAmount: e.target.value})}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Project Stages */}
          <div className="form-section-card">
            <div className="section-header">
              <div className="section-number">2</div>
              <h2>Project Execution Stages</h2>
              <button type="button" className="add-btn-sm" onClick={addStage}>
                <Plus size={16} /> Add Stage
              </button>
            </div>
            <div className="section-content">
              <div className="stages-list">
                {stages.map((stage, index) => (
                  <div key={index} className="stage-item-row">
                    <div className="stage-index">{index + 1}</div>
                    <div className="stage-fields-grid">
                      <div className="form-group">
                        <label>Stage Name</label>
                        <input
                          type="text"
                          className="form-control"
                          value={stage.name}
                          onChange={(e) => updateStage(index, 'name', e.target.value)}
                          placeholder="e.g., Foundation"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Weightage (%)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={stage.weightage}
                          onChange={(e) => updateStage(index, 'weightage', e.target.value)}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Duration (Days)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={stage.estimatedDurationDays}
                          onChange={(e) => updateStage(index, 'estimatedDurationDays', e.target.value)}
                        />
                      </div>
                      <div className="form-group full-width">
                        <label>Description</label>
                        <input
                          className="form-control"
                          value={stage.description}
                          onChange={(e) => updateStage(index, 'description', e.target.value)}
                          placeholder="Brief description of this stage's scope"
                        />
                      </div>
                    </div>
                    {stages.length > 1 && (
                      <button type="button" className="remove-row-btn" onClick={() => removeStage(index)}>
                        <X size={18} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div className={`validation-summary ${totalWeightage === 100 ? 'valid' : 'invalid'}`}>
                <span>Total Weightage Allocation:</span>
                <strong>{totalWeightage}%</strong>
                {totalWeightage !== 100 && <span className="error-hint">(Must equal 100%)</span>}
              </div>
            </div>
          </div>

          {/* Section 3: Fund Allocation */}
          <div className="form-section-card">
            <div className="section-header">
              <div className="section-number">3</div>
              <h2>Financial Resource Allocation</h2>
              <button type="button" className="add-btn-sm" onClick={addFundSource}>
                <Plus size={16} /> Add Source
              </button>
            </div>
            <div className="section-content">
              <div className="fund-sources-list">
                {fundSources.map((source, index) => (
                  <div key={index} className="fund-source-item">
                    <div className="form-group">
                      <label>Source Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={source.sourceName}
                        onChange={(e) => updateFundSource(index, 'sourceName', e.target.value)}
                        placeholder="e.g., Government Grant"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Amount (₹)</label>
                      <input
                        type="number"
                        step="0.01"
                        className="form-control amount-input"
                        value={source.amount}
                        onChange={(e) => updateFundSource(index, 'amount', e.target.value)}
                        required
                      />
                    </div>
                    {fundSources.length > 1 && (
                      <button type="button" className="remove-row-btn-inline" onClick={() => removeFundSource(index)}>
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <div className={`validation-summary ${Math.abs(totalAllocated - workData.sanctionedAmount) < 0.01 ? 'valid' : 'invalid'}`}>
                <span>Total Budget Allocation:</span>
                <strong>₹{totalAllocated.toLocaleString()} / ₹{parseFloat(workData.sanctionedAmount || 0).toLocaleString()}</strong>
                {Math.abs(totalAllocated - workData.sanctionedAmount) >= 0.01 && <span className="error-hint">(Must equal sanctioned amount)</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Review & Submission */}
        <div className="form-sidebar-column">
          <div className="sidebar-sticky-box">
            <div className="summary-card">
              <h3>Submission Review</h3>
              <div className="summary-details">
                <div className="summary-row">
                  <span>Project ID</span>
                  <strong>{workData.workCode || 'Not Set'}</strong>
                </div>
                <div className="summary-row">
                  <span>Total Budget</span>
                  <strong>₹{parseFloat(workData.sanctionedAmount || 0).toLocaleString()}</strong>
                </div>
                <div className="summary-row">
                  <span>Execution Stages</span>
                  <strong>{stages.length} Stages</strong>
                </div>
              </div>
              
              <div className="submission-actions">
                <button 
                  type="button" 
                  className="btn-create-final" 
                  onClick={handleCreateWork} 
                  disabled={loading || totalWeightage !== 100 || Math.abs(totalAllocated - workData.sanctionedAmount) >= 0.01}
                >
                  {loading ? 'Processing...' : 'Create Official Work'}
                  <Check size={18} />
                </button>
                <button type="button" className="btn-cancel-flat" onClick={() => navigate('/admin/work-requests')}>
                  Discard Changes
                </button>
              </div>
            </div>

            <div className="help-box">
              <div className="help-icon"><AlertTriangle size={20} /></div>
              <div className="help-content">
                <h4>Guidelines</h4>
                <ul>
                  <li>Ensure the Work Code follows official formatting.</li>
                  <li>Stage weightage must exactly total 100%.</li>
                  <li>Funding sources must cover the entire sanctioned budget.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .work-creation-container {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          padding-bottom: 3rem;
          color: #1e293b;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 1.5rem;
          margin-bottom: 0.5rem;
        }

        .header-text h1 { font-size: 1.75rem; font-weight: 800; margin: 0; color: #0f172a; }
        .header-text p { color: #64748b; margin: 0.5rem 0 0; font-size: 0.95rem; }

        .back-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.6rem 1rem;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          font-weight: 600;
          color: #475569;
          cursor: pointer;
          transition: all 0.2s;
        }

        .back-btn:hover { background: #f8fafc; border-color: #cbd5e1; }

        .form-main-layout {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 2rem;
          align-items: flex-start;
        }

        .form-sections-column {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-section-card {
          background: white;
          border-radius: 1rem;
          border: 1px solid #e2e8f0;
          overflow: hidden;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }

        .section-header {
          padding: 1.25rem 1.5rem;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .section-number {
          width: 28px;
          height: 28px;
          background: #1e293b;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.85rem;
          font-weight: 700;
        }

        .section-header h2 { margin: 0; font-size: 1.1rem; font-weight: 700; flex: 1; color: #1e293b; }

        .section-content { padding: 1.5rem; }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.25rem;
        }

        .form-group { display: flex; flex-direction: column; gap: 0.4rem; }
        .form-group.full-width { grid-column: span 2; }
        .form-group label { font-size: 0.85rem; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.025em; }

        .form-control {
          padding: 0.75rem 1rem;
          border: 1px solid #d1d5db;
          border-radius: 0.6rem;
          font-size: 0.95rem;
          transition: border-color 0.2s, box-shadow 0.2s;
          outline: none;
        }

        .form-control:focus { border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
        .readonly-value { padding: 0.75rem 1rem; background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 0.6rem; font-weight: 600; color: #1e293b; }
        .amount-input { font-weight: 700; color: #0ea5e9; }
        .form-help { font-size: 0.75rem; color: #94a3b8; margin-top: 0.25rem; }

        /* Stages & Funds Rows */
        .stages-list, .fund-sources-list { display: flex; flex-direction: column; gap: 1rem; }

        .stage-item-row {
          display: grid;
          grid-template-columns: 32px 1fr 40px;
          gap: 1rem;
          background: #f8fafc;
          padding: 1rem;
          border-radius: 0.75rem;
          border: 1px solid #f1f5f9;
          align-items: flex-start;
        }

        .stage-index {
          width: 32px;
          height: 32px;
          background: #e2e8f0;
          color: #475569;
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
        }

        .stage-fields-grid { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 1rem; }

        .fund-source-item {
          display: grid;
          grid-template-columns: 1fr 1fr 40px;
          gap: 1.25rem;
          align-items: flex-end;
          background: #f8fafc;
          padding: 1.25rem;
          border-radius: 0.75rem;
          border: 1px solid #f1f5f9;
        }

        .remove-row-btn, .remove-row-btn-inline {
          padding: 0.5rem;
          background: white;
          border: 1px solid #fee2e2;
          color: #ef4444;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .remove-row-btn:hover, .remove-row-btn-inline:hover { background: #fee2e2; color: #dc2626; }
        .add-btn-sm { display: flex; align-items: center; gap: 0.4rem; padding: 0.5rem 0.85rem; background: white; border: 1px solid #e2e8f0; border-radius: 0.5rem; font-size: 0.85rem; font-weight: 700; color: #0ea5e9; cursor: pointer; transition: all 0.2s; }
        .add-btn-sm:hover { background: #f0f9ff; border-color: #0ea5e9; }

        .validation-summary {
          margin-top: 1.5rem;
          padding: 1rem;
          border-radius: 0.75rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.95rem;
        }

        .validation-summary.valid { background: #f0fdf4; color: #15803d; border: 1px solid #dcfce7; }
        .validation-summary.invalid { background: #fff1f2; color: #be123c; border: 1px solid #ffe4e6; }
        .error-hint { font-size: 0.85rem; font-weight: 600; }

        /* Sidebar Styles */
        .sidebar-sticky-box { position: sticky; top: 1.5rem; display: flex; flex-direction: column; gap: 1.5rem; }

        .summary-card {
          background: #1e293b;
          color: white;
          border-radius: 1rem;
          padding: 1.5rem;
          box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
        }

        .summary-card h3 { font-size: 1.1rem; font-weight: 700; margin: 0 0 1.25rem 0; color: #f8fafc; }
        .summary-details { display: flex; flex-direction: column; gap: 0.85rem; margin-bottom: 1.5rem; }
        .summary-row { display: flex; justify-content: space-between; font-size: 0.9rem; padding-bottom: 0.85rem; border-bottom: 1px solid rgba(255,255,255,0.1); }
        .summary-row span { color: #94a3b8; }
        .summary-row strong { color: white; }

        .submission-actions { display: flex; flex-direction: column; gap: 0.75rem; }
        
        .btn-create-final {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          padding: 1rem;
          background: #0ea5e9;
          color: white;
          border: none;
          border-radius: 0.75rem;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-create-final:hover:not(:disabled) { background: #0284c7; transform: translateY(-2px); }
        .btn-create-final:disabled { opacity: 0.5; cursor: not-allowed; filter: grayscale(1); }

        .btn-cancel-flat {
          padding: 0.75rem;
          background: transparent;
          border: none;
          color: #94a3b8;
          font-weight: 600;
          cursor: pointer;
          font-size: 0.9rem;
        }
        .btn-cancel-flat:hover { color: #f8fafc; }

        .help-box {
          background: #fefce8;
          border: 1px solid #fef08a;
          border-radius: 1rem;
          padding: 1.25rem;
          display: flex;
          gap: 1rem;
        }

        .help-icon { color: #eab308; }
        .help-content h4 { margin: 0 0 0.5rem 0; font-size: 0.9rem; font-weight: 700; color: #854d0e; }
        .help-content ul { margin: 0; padding-left: 1.25rem; font-size: 0.8rem; color: #713f12; line-height: 1.5; }

        @media (max-width: 1024px) {
          .form-main-layout { grid-template-columns: 1fr; }
          .form-sidebar-column { order: -1; }
          .sidebar-sticky-box { position: static; }
        }

        @media (max-width: 768px) {
          .form-grid, .stage-fields-grid, .fund-source-item { grid-template-columns: 1fr; }
          .page-header { flex-direction: column; gap: 1rem; }
        }
      `}</style>
    </div>
  );
};

export default WorkCreationForm;