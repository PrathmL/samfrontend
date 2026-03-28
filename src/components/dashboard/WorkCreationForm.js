import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, Trash2, Check, ArrowRight, ArrowLeft, X, AlertTriangle } from 'lucide-react';

const WorkCreationForm = () => {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [request, setRequest] = useState(null);
  const [quotation, setQuotation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
        setError('Quotation not found for this request');
      }
    } catch (err) {
      console.error('Error fetching request:', err);
      setError('Failed to fetch work request details');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWork = async () => {
    // Validate total weightage
    const totalWeight = stages.reduce((sum, s) => sum + Number(s.weightage), 0);
    if (totalWeight !== 100) {
      setError(`Total stage weightage must be 100%. Current total: ${totalWeight}%`);
      return;
    }
    
    // Validate total fund allocation
    const totalAllocated = fundSources.reduce((sum, f) => sum + Number(f.amount), 0);
    if (Math.abs(totalAllocated - Number(workData.sanctionedAmount)) > 0.01) {
      setError(`Total allocated funds (₹${totalAllocated}) must equal sanctioned amount (₹${workData.sanctionedAmount})`);
      return;
    }
    
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
      
      const response = await axios.post('http://localhost:8080/api/works/create-from-request', payload);
      setSuccess('Work created successfully!');
      setTimeout(() => {
        navigate('/admin/work-requests');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create work');
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
      <div className="form-header">
        <h1>Create Work from Request</h1>
        <p>Request: {request?.title} | ID: #{requestId}</p>
      </div>

      {error && (
        <div className="error-message">
          <AlertTriangle size={18} />
          <span>{error}</span>
          <button onClick={() => setError('')}><X size={16} /></button>
        </div>
      )}

      <div className="form-card">
        {/* Basic Details Section */}
        <div className="form-section">
          <h2>1. Basic Work Details</h2>
          <div className="form-grid">
            <div className="form-group">
              <label>Work Code *</label>
              <input
                type="text"
                value={workData.workCode}
                onChange={(e) => setWorkData({...workData, workCode: e.target.value})}
                placeholder="Auto-generated"
                required
              />
            </div>
            <div className="form-group">
              <label>Work Title *</label>
              <input
                type="text"
                value={workData.title}
                onChange={(e) => setWorkData({...workData, title: e.target.value})}
                required
              />
            </div>
            <div className="form-group full-width">
              <label>Description</label>
              <textarea
                value={workData.description}
                onChange={(e) => setWorkData({...workData, description: e.target.value})}
                rows="3"
              />
            </div>
            <div className="form-group">
              <label>Work Type</label>
              <input type="text" value={workData.type} readOnly disabled />
            </div>
            <div className="form-group">
              <label>Sanctioned Amount (₹) *</label>
              <input
                type="number"
                step="0.01"
                value={workData.sanctionedAmount}
                onChange={(e) => setWorkData({...workData, sanctionedAmount: e.target.value})}
                required
              />
            </div>
          </div>
        </div>

        {/* Stages Section */}
        <div className="form-section">
          <div className="section-header">
            <h2>2. Project Stages</h2>
            <button type="button" className="add-btn" onClick={addStage}>
              <Plus size={18} /> Add Stage
            </button>
          </div>
          
          <div className="stages-container">
            {stages.map((stage, index) => (
              <div key={index} className="stage-card">
                <div className="stage-header">
                  <h3>Stage {index + 1}</h3>
                  {stages.length > 1 && (
                    <button type="button" className="remove-btn" onClick={() => removeStage(index)}>
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                <div className="stage-fields">
                  <div className="form-group">
                    <label>Stage Name</label>
                    <input
                      type="text"
                      value={stage.name}
                      onChange={(e) => updateStage(index, 'name', e.target.value)}
                      placeholder="e.g., Foundation Work"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Weightage (%)</label>
                    <input
                      type="number"
                      value={stage.weightage}
                      onChange={(e) => updateStage(index, 'weightage', e.target.value)}
                      placeholder="e.g., 20"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Est. Duration (Days)</label>
                    <input
                      type="number"
                      value={stage.estimatedDurationDays}
                      onChange={(e) => updateStage(index, 'estimatedDurationDays', e.target.value)}
                      placeholder="e.g., 15"
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Description</label>
                    <textarea
                      value={stage.description}
                      onChange={(e) => updateStage(index, 'description', e.target.value)}
                      rows="2"
                      placeholder="Describe what this stage includes"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className={`total-indicator ${totalWeightage === 100 ? 'valid' : 'invalid'}`}>
            Total Weightage: {totalWeightage}% {totalWeightage !== 100 && '(Must equal 100%)'}
          </div>
        </div>

        {/* Fund Allocation Section */}
        <div className="form-section">
          <div className="section-header">
            <h2>3. Fund Allocation</h2>
            <button type="button" className="add-btn" onClick={addFundSource}>
              <Plus size={18} /> Add Source
            </button>
          </div>
          
          <div className="fund-sources-container">
            {fundSources.map((source, index) => (
              <div key={index} className="fund-source-card">
                <div className="fund-source-header">
                  <h3>Source {index + 1}</h3>
                  {fundSources.length > 1 && (
                    <button type="button" className="remove-btn" onClick={() => removeFundSource(index)}>
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                <div className="fund-source-fields">
                  <div className="form-group">
                    <label>Source Name</label>
                    <input
                      type="text"
                      value={source.sourceName}
                      onChange={(e) => updateFundSource(index, 'sourceName', e.target.value)}
                      placeholder="e.g., Government Grant, School Fund"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Amount (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={source.amount}
                      onChange={(e) => updateFundSource(index, 'amount', e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className={`total-indicator ${Math.abs(totalAllocated - workData.sanctionedAmount) < 0.01 ? 'valid' : 'invalid'}`}>
            Total Allocated: ₹{totalAllocated.toLocaleString()} / ₹{workData.sanctionedAmount?.toLocaleString()}
            {Math.abs(totalAllocated - workData.sanctionedAmount) >= 0.01 && ' (Must equal sanctioned amount)'}
          </div>
        </div>

        {/* Review Section */}
        <div className="form-section">
          <h2>4. Review & Create</h2>
          <div className="review-card">
            <h3>Work Summary</h3>
            <div className="review-grid">
              <div><strong>Work Code:</strong> {workData.workCode}</div>
              <div><strong>Title:</strong> {workData.title}</div>
              <div><strong>Type:</strong> {workData.type}</div>
              <div><strong>Sanctioned Amount:</strong> ₹{workData.sanctionedAmount?.toLocaleString()}</div>
            </div>
            
            <h3>Stages ({stages.length})</h3>
            <div className="review-stages">
              {stages.map((stage, i) => (
                <div key={i} className="review-stage">
                  <span><strong>{stage.name}</strong> - {stage.weightage}%</span>
                  <span>{stage.estimatedDurationDays} days</span>
                </div>
              ))}
            </div>
            
            <h3>Fund Sources</h3>
            <div className="review-funds">
              {fundSources.map((source, i) => (
                <div key={i} className="review-fund">
                  <span>{source.sourceName}</span>
                  <span>₹{source.amount?.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="button" className="cancel-btn" onClick={() => navigate('/admin/work-requests')}>
            Cancel
          </button>
          <button type="button" className="submit-btn" onClick={handleCreateWork} disabled={loading}>
            {loading ? 'Creating...' : 'Create Work'}
          </button>
        </div>
      </div>

      <style>{`
        .work-creation-container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 2rem;
        }
        
        .form-header {
          margin-bottom: 2rem;
        }
        
        .form-header h1 {
          margin: 0 0 0.5rem 0;
          color: #1e293b;
        }
        
        .form-header p {
          margin: 0;
          color: #64748b;
        }
        
        .error-message {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 1rem;
          background-color: #fee2e2;
          color: #dc2626;
          border-radius: 0.5rem;
          margin-bottom: 1rem;
        }
        
        .error-message button {
          margin-left: auto;
          background: none;
          border: none;
          cursor: pointer;
          color: inherit;
        }
        
        .form-card {
          background: white;
          border-radius: 1rem;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
          overflow: hidden;
        }
        
        .form-section {
          padding: 2rem;
          border-bottom: 1px solid #e2e8f0;
        }
        
        .form-section:last-child {
          border-bottom: none;
        }
        
        .form-section h2 {
          margin: 0 0 1.5rem 0;
          font-size: 1.25rem;
          color: #0f172a;
        }
        
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        
        .section-header h2 {
          margin: 0;
        }
        
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }
        
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .form-group.full-width {
          grid-column: span 2;
        }
        
        .form-group label {
          font-weight: 600;
          color: #334155;
          font-size: 0.875rem;
        }
        
        .form-group input,
        .form-group textarea,
        .form-group select {
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          font-size: 0.9rem;
          font-family: inherit;
        }
        
        .form-group input:focus,
        .form-group textarea:focus,
        .form-group select:focus {
          outline: none;
          border-color: #0ea5e9;
          ring: 2px solid #0ea5e9;
        }
        
        .form-group input:disabled {
          background-color: #f1f5f9;
          cursor: not-allowed;
        }
        
        .stages-container,
        .fund-sources-container {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .stage-card,
        .fund-source-card {
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          padding: 1rem;
        }
        
        .stage-header,
        .fund-source-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid #e2e8f0;
        }
        
        .stage-header h3,
        .fund-source-header h3 {
          margin: 0;
          font-size: 1rem;
          color: #0f172a;
        }
        
        .stage-fields,
        .fund-source-fields {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        
        .add-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background-color: #f1f5f9;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          color: #0ea5e9;
          cursor: pointer;
          font-size: 0.875rem;
          font-weight: 600;
        }
        
        .add-btn:hover {
          background-color: #e0f2fe;
          border-color: #0ea5e9;
        }
        
        .remove-btn {
          background: none;
          border: none;
          color: #ef4444;
          cursor: pointer;
          padding: 0.25rem;
        }
        
        .remove-btn:hover {
          color: #dc2626;
        }
        
        .total-indicator {
          margin-top: 1rem;
          padding: 0.75rem;
          border-radius: 0.5rem;
          text-align: right;
          font-weight: 600;
        }
        
        .total-indicator.valid {
          background-color: #dcfce7;
          color: #166534;
        }
        
        .total-indicator.invalid {
          background-color: #fee2e2;
          color: #991b1b;
        }
        
        .review-card {
          background-color: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          padding: 1.5rem;
        }
        
        .review-card h3 {
          margin: 0 0 1rem 0;
          font-size: 1rem;
          color: #0f172a;
        }
        
        .review-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #e2e8f0;
        }
        
        .review-stages,
        .review-funds {
          margin-bottom: 1.5rem;
        }
        
        .review-stage,
        .review-fund {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 0;
          border-bottom: 1px solid #e2e8f0;
        }
        
        .review-stage:last-child,
        .review-fund:last-child {
          border-bottom: none;
        }
        
        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          padding: 1.5rem 2rem;
          background-color: #f8fafc;
          border-top: 1px solid #e2e8f0;
        }
        
        .cancel-btn {
          padding: 0.75rem 1.5rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          background: white;
          cursor: pointer;
          font-weight: 600;
        }
        
        .submit-btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 0.5rem;
          background: #0ea5e9;
          color: white;
          cursor: pointer;
          font-weight: 600;
        }
        
        .submit-btn:hover {
          background: #0284c7;
        }
        
        .submit-btn:disabled {
          background: #93c5fd;
          cursor: not-allowed;
        }
        
        .loading {
          text-align: center;
          padding: 3rem;
          color: #64748b;
        }
      `}</style>
    </div>
  );
};

export default WorkCreationForm;