import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Briefcase, TrendingUp, Clock, CheckCircle2, 
  DollarSign, Camera, FileText, ChevronRight,
  Plus, X, RefreshCw, MapPin, AlertCircle, Save,
  Package, IndianRupee, Trash2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';

const HeadmasterActiveWorks = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedWork, setSelectedWork] = useState(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

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
  const [workItems, setWorkItems] = useState([]);
  const [itemUsage, setItemUsage] = useState({}); // {itemIdx: quantityUsed}

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
      
      // Initialize item usage state using item ID or index
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
    setUpdateFormData({
      stageId: work.stages?.find(s => s.status !== 'COMPLETED')?.id || '',
      progressPercentage: 0,
      remarks: '',
      materialCost: 0,
      laborCost: 0,
      otherCost: 0
    });
    fetchWorkItems(work.id);
    setIsUpdateModalOpen(true);
  };

  const handleItemUsageChange = (index, value) => {
    setItemUsage({
      ...itemUsage,
      [index]: value
    });
  };

  const handleProgressSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

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
    
    // Prepare item usage as JSON
    const usageList = workItems
      .map((item, index) => ({
        materialId: item.materialId,
        materialName: item.materialName,
        quantityUsed: Number(itemUsage[index] || 0)
      }))
      .filter(u => u.quantityUsed > 0);

    data.append('itemUsage', JSON.stringify(usageList));
    
    updatePhotos.forEach(photo => {
      data.append('photos', photo);
    });

    try {
      await axios.post('http://localhost:8080/api/works/progress', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setSuccess('Progress updated successfully!');
      setIsUpdateModalOpen(false);
      fetchWorks();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update progress. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return '#0ea5e9';
      case 'IN_PROGRESS': return '#3b82f6';
      case 'ON_HOLD': return '#f59e0b';
      case 'PENDING_CLOSURE': return '#d97706';
      case 'COMPLETED': return '#10b981';
      default: return '#64748b';
    }
  };

  return (
    <div className="active-works-container">
      <div className="module-header">
        <div>
          <h1>{t('menu_active_works')}</h1>
          <p>Monitor execution and update progress of ongoing projects</p>
        </div>
      </div>

      {success && <div className="alert success">{success}</div>}
      {error && <div className="alert error">{error}</div>}

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
                  <div className="work-stat">
                    <Clock size={14} />
                    <span>Last update: {work.lastUpdateAt ? new Date(work.lastUpdateAt).toLocaleDateString() : 'Never'}</span>
                  </div>
                </div>

                <div className="work-actions-row">
                  <button className="update-btn" onClick={() => handleUpdateClick(work)}>
                    <RefreshCw size={16} /> {t('btn_update')}
                  </button>
                  <button className="view-btn-sm" onClick={() => { setSelectedWork(work); fetchWorkItems(work.id); }}>
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
            <p>Once a work request is approved and activated by Admin, it will appear here.</p>
          </div>
        )}
      </div>

      {/* Update Progress Modal */}
      {isUpdateModalOpen && selectedWork && (
        <div className="modal-overlay">
          <div className="modal modal-lg">
            <div className="modal-header">
              <h2>{t('btn_update')}: {selectedWork.workCode}</h2>
              <button className="close-btn" onClick={() => setIsUpdateModalOpen(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleProgressSubmit}>
              <div className="modal-content overflow-y-auto" style={{ maxHeight: '75vh' }}>
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>{t('field_stage')}</label>
                    <select 
                      value={updateFormData.stageId} 
                      onChange={e => setUpdateFormData({...updateFormData, stageId: e.target.value})}
                      required
                    >
                      <option value="">-- Choose Stage --</option>
                      {selectedWork.stages?.map(stage => (
                        <option key={stage.id} value={stage.id}>
                          {stage.name} (Current: {stage.progressPercentage}%)
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-group">
                    <label>{t('field_progress')} (%)</label>
                    <input 
                      type="number" 
                      min="0" 
                      max="100" 
                      required
                      value={updateFormData.progressPercentage}
                      onChange={e => setUpdateFormData({...updateFormData, progressPercentage: e.target.value})}
                    />
                  </div>

                  <div className="form-group">
                    <label>{t('field_date')}</label>
                    <input type="date" defaultValue={new Date().toISOString().split('T')[0]} readOnly />
                  </div>

                  <div className="form-group full-width">
                    <label>{t('field_remarks')}</label>
                    <textarea 
                      rows="3" 
                      required
                      value={updateFormData.remarks}
                      onChange={e => setUpdateFormData({...updateFormData, remarks: e.target.value})}
                      placeholder="Describe what work was done..."
                    />
                  </div>

                  {workItems.length > 0 && (
                    <div className="full-width">
                      <div className="form-section-title">Item Usage for this Update</div>
                      <div className="items-usage-grid">
                        <div className="usage-header">
                          <span style={{ flex: 2 }}>{t('field_material')}</span>
                          <span style={{ flex: 1 }}>Total Required</span>
                          <span style={{ flex: 1 }}>{t('field_quantity')}</span>
                        </div>
                        {workItems.map((item, index) => (
                          <div key={index} className="usage-row">
                            <div style={{ flex: 2 }}>
                              <div className="item-main-name">{item.materialName}</div>
                              {item.materialId && <span className="item-sub-id">Inventory Linked</span>}
                            </div>
                            <div style={{ flex: 1 }} className="item-req-val">{item.quantity}</div>
                            <div style={{ flex: 1 }}>
                              <input 
                                type="number" 
                                step="0.1"
                                min="0"
                                className="usage-input"
                                value={itemUsage[index] || 0}
                                onChange={e => handleItemUsageChange(index, e.target.value)}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="form-section-title">Financial Data (Expenditure since last update)</div>
                  
                  <div className="form-group">
                    <label>{t('field_material_cost')} (₹)</label>
                    <input 
                      type="number" 
                      value={updateFormData.materialCost}
                      onChange={e => setUpdateFormData({...updateFormData, materialCost: e.target.value})}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>{t('field_labor_cost')} (₹)</label>
                    <input 
                      type="number" 
                      value={updateFormData.laborCost}
                      onChange={e => setUpdateFormData({...updateFormData, laborCost: e.target.value})}
                    />
                  </div>

                  <div className="form-group full-width">
                    <label>{t('field_photos')}</label>
                    <div className="file-upload">
                      <input type="file" multiple accept="image/*" onChange={e => setUpdatePhotos([...e.target.files])} id="update-photos" />
                      <label htmlFor="update-photos">
                        <Camera size={20} />
                        <span>{updatePhotos.length > 0 ? `${updatePhotos.length} photos selected` : 'Click to upload photos...'}</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="cancel-btn" onClick={() => setIsUpdateModalOpen(false)}>{t('btn_cancel')}</button>
                <button type="submit" className="submit-btn" disabled={loading}>
                  {loading ? 'Updating...' : t('btn_save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Work Detail / View Modal */}
      {selectedWork && !isUpdateModalOpen && (
        <div className="modal-overlay">
          <div className="modal modal-lg">
            <div className="modal-header">
              <h2>{selectedWork.title} ({selectedWork.workCode})</h2>
              <button className="close-btn" onClick={() => setSelectedWork(null)}><X size={24} /></button>
            </div>
            <div className="modal-content overflow-y-auto" style={{ maxHeight: '75vh' }}>
              <div className="details-layout-active">
                <div className="stages-overview">
                  <h4>{t('title_construction_stages')}</h4>
                  <div className="stages-list-mini">
                    {selectedWork.stages?.map((stage, i) => (
                      <div key={stage.id} className={`stage-card-mini ${stage.status?.toLowerCase()}`}>
                        <div className="stage-num">{i+1}</div>
                        <div className="stage-info-mini">
                          <strong>{stage.name}</strong>
                          <div className="stage-progress-mini">
                            <div className="bar"><div className="fill" style={{ width: `${stage.progressPercentage}%` }}></div></div>
                            <span>{stage.progressPercentage}%</span>
                          </div>
                        </div>
                        {stage.status === 'COMPLETED' && <CheckCircle2 size={16} color="#10b981" />}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="side-cards">
                  <div className="financial-summary-card">
                    <h4>{t('title_financial_summary')}</h4>
                    <div className="fin-row">
                      <span>{t('field_sanctioned')}</span>
                      <strong>₹{selectedWork.sanctionedAmount?.toLocaleString()}</strong>
                    </div>
                    <div className="fin-row">
                      <span>{t('field_utilized_amt')}</span>
                      <strong style={{ color: '#0ea5e9' }}>₹{selectedWork.totalUtilized?.toLocaleString()}</strong>
                    </div>
                    <div className="fin-row total">
                      <span>{t('field_balance')}</span>
                      <strong>₹{(selectedWork.sanctionedAmount - selectedWork.totalUtilized)?.toLocaleString()}</strong>
                    </div>
                  </div>
                  
                  <div className="inventory-summary-card mt-4">
                    <h4>{t('title_quotation_items')}</h4>
                    <div className="items-mini-list">
                      <div className="item-mini-header">
                        <span>{t('field_name')}</span>
                        <span>{t('field_quantity')}</span>
                      </div>
                      {workItems.map((item, index) => (
                        <div key={index} className="item-mini-row">
                          <span>{item.materialName}</span>
                          <strong>{item.quantity}</strong>
                        </div>
                      ))}
                      {workItems.length === 0 && <p className="no-items-text">No items linked to this work.</p>}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setSelectedWork(null)}>{t('btn_cancel')}</button>
              <button className="submit-btn" onClick={() => handleUpdateClick(selectedWork)}>{t('btn_update')}</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .active-works-container { padding: 0; }
        .module-header { margin-bottom: 2rem; }
        .module-header h1 { margin: 0; font-size: 1.875rem; color: #1e293b; }
        .module-header p { color: #64748b; margin: 0.5rem 0 0; }

        .works-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 1.5rem; }
        .work-card-active { background: white; padding: 1.5rem; border-radius: 1rem; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.1); transition: transform 0.2s; }
        .work-card-active:hover { transform: translateY(-4px); box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
        
        .work-card-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
        .work-code-badge { font-family: monospace; font-weight: 700; color: #0ea5e9; background: #f0f9ff; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.8rem; }
        .work-status-dot { padding: 0.2rem 0.6rem; border-radius: 9999px; color: white; font-size: 0.65rem; font-weight: 700; text-transform: uppercase; }

        .work-card-active h3 { margin: 0 0 1.25rem 0; font-size: 1.1rem; color: #1e293b; height: 2.8rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
        
        .work-progress-section { margin-bottom: 1.5rem; }
        .progress-label-row { display: flex; justify-content: space-between; font-size: 0.8rem; color: #64748b; margin-bottom: 0.5rem; }
        .progress-bar-bg { height: 10px; background: #f1f5f9; border-radius: 5px; overflow: hidden; }
        .progress-bar-fill { height: 100%; background: linear-gradient(90deg, #3b82f6, #0ea5e9); border-radius: 5px; }

        .work-stats-mini { display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1.5rem; padding: 0.75rem; background: #f8fafc; border-radius: 0.5rem; }
        .work-stat { display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem; color: #475569; }

        .work-actions-row { display: flex; gap: 0.75rem; }
        .update-btn { flex: 1; display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.6rem; background: #1e293b; color: white; border: none; border-radius: 0.5rem; cursor: pointer; font-size: 0.85rem; font-weight: 600; }
        .view-btn-sm { padding: 0.6rem 1rem; background: white; border: 1px solid #d1d5db; border-radius: 0.5rem; color: #475569; font-size: 0.85rem; cursor: pointer; }

        .details-layout-active { display: grid; grid-template-columns: 1fr 280px; gap: 2rem; }
        .stages-list-mini { display: flex; flex-direction: column; gap: 0.75rem; margin-top: 1rem; }
        .stage-card-mini { display: flex; align-items: center; gap: 1rem; padding: 0.75rem; background: #f8fafc; border-radius: 0.5rem; border: 1px solid #e2e8f0; }
        .stage-num { width: 24px; height: 24px; border-radius: 50%; background: #e2e8f0; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; color: #475569; }
        .stage-info-mini { flex: 1; }
        .stage-info-mini strong { font-size: 0.85rem; display: block; margin-bottom: 0.25rem; }
        .stage-progress-mini { display: flex; align-items: center; gap: 0.75rem; }
        .stage-progress-mini .bar { flex: 1; height: 4px; background: #e2e8f0; border-radius: 2px; }
        .stage-progress-mini .fill { height: 100%; background: #0ea5e9; border-radius: 2px; }
        .stage-progress-mini span { font-size: 0.7rem; color: #64748b; min-width: 25px; }
        
        .stage-card-mini.completed { border-left: 4px solid #10b981; }
        .stage-card-mini.completed .stage-num { background: #dcfce7; color: #10b981; }

        .financial-summary-card, .inventory-summary-card { background: white; padding: 1.5rem; border-radius: 0.75rem; border: 1px solid #e2e8f0; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
        .fin-row { display: flex; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid #f1f5f9; font-size: 0.9rem; }
        .fin-row.total { border-bottom: none; padding-top: 1rem; margin-top: 0.5rem; border-top: 2px solid #f1f5f9; }
        
        .item-mini-header { display: flex; justify-content: space-between; font-weight: 700; font-size: 0.7rem; color: #94a3b8; text-transform: uppercase; margin-bottom: 0.5rem; }
        .item-mini-row { display: flex; justify-content: space-between; padding: 0.5rem 0; border-bottom: 1px dashed #f1f5f9; font-size: 0.85rem; }
        .no-items-text { font-size: 0.85rem; color: #94a3b8; font-style: italic; }

        .form-section-title { font-weight: 700; color: #1e293b; margin: 1.5rem 0 0.5rem; grid-column: span 2; font-size: 0.95rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.5rem; }
        
        .items-usage-grid { background: #f8fafc; border-radius: 0.5rem; border: 1px solid #e2e8f0; padding: 1rem; }
        .usage-header { display: flex; gap: 1rem; font-weight: 700; font-size: 0.75rem; color: #64748b; text-transform: uppercase; margin-bottom: 0.75rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.5rem; }
        .usage-row { display: flex; gap: 1rem; align-items: center; padding: 0.75rem 0; border-bottom: 1px dashed #e2e8f0; }
        .usage-row:last-child { border-bottom: none; }
        .item-main-name { font-size: 0.9rem; font-weight: 600; color: #1e293b; }
        .item-sub-id { font-size: 0.7rem; color: #10b981; display: block; }
        .item-req-val { font-size: 0.9rem; color: #64748b; font-weight: 500; }
        .usage-input { width: 100%; padding: 0.4rem; border: 1px solid #d1d5db; border-radius: 0.25rem; text-align: right; }
        
        .overflow-y-auto { overflow-y: auto; }
        .mt-4 { margin-top: 1rem; }
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
        .modal { background: white; border-radius: 1rem; width: 100%; max-width: 900px; }
        .modal-header { padding: 1.5rem; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; }
        .modal-content { padding: 1.5rem; }
        .modal-footer { padding: 1.5rem; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 1rem; }
        .alert { padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem; }
        .alert.success { background: #dcfce7; color: #16a34a; }
        .submit-btn { padding: 0.6rem 1.5rem; background: #0ea5e9; color: white; border: none; border-radius: 0.4rem; cursor: pointer; font-weight: 600; }
        .cancel-btn { padding: 0.6rem 1.5rem; background: #f1f5f9; color: #475569; border: none; border-radius: 0.4rem; cursor: pointer; font-weight: 600; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .full-width { grid-column: span 2; }
        .form-group { display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 1rem; }
        .form-group input, .form-group select, .form-group textarea { padding: 0.6rem; border: 1px solid #d1d5db; border-radius: 0.4rem; width: 100%; }
        .file-upload input { display: none; }
        .file-upload label { display: flex; align-items: center; gap: 0.5rem; padding: 1rem; background: #f8fafc; border: 2px dashed #e2e8f0; border-radius: 0.5rem; cursor: pointer; color: #64748b; }
      `}</style>
    </div>
  );
};

export default HeadmasterActiveWorks;
