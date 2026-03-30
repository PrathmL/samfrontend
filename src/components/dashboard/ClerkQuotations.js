import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FileText, Search, X, CheckCircle2, 
  ChevronRight, IndianRupee, Clock, Plus, Trash2, Calendar, Tag, Eye, History, ClipboardList, AlertCircle, XCircle, MapPin
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { showToast, showErrorAlert, showSuccessAlert, showConfirmAlert } from '../../utils/sweetAlertUtils';

const ClerkQuotations = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [requests, setRequests] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState(false); // false for prepare, true for view
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'history'

  const [formData, setFormData] = useState({
    materialCost: 0,
    laborCost: 0,
    additionalCosts: 0,
    materialDetails: '',
    laborDetails: '',
    additionalDetails: '',
    validUntil: ''
  });

  const [quotationItems, setQuotationItems] = useState([]);

  useEffect(() => {
    if (user?.schoolId) {
      fetchWorkRequests();
      fetchMaterials();
    }
  }, [user?.schoolId, activeTab]);

  const fetchWorkRequests = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:8080/api/work-requests`, {
        params: { schoolId: user.schoolId }
      });
      
      const allRequests = res.data || [];
      if (activeTab === 'pending') {
        setRequests(allRequests.filter(r => r.status === 'PENDING_QUOTATION'));
      } else {
        setRequests(allRequests.filter(r => r.status !== 'PENDING_QUOTATION'));
      }
    } catch (err) {
      console.error('Error fetching work requests:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMaterials = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/inventory/materials`);
      setMaterials(res.data || []);
    } catch (err) {
      console.error('Error fetching materials:', err);
    }
  };

  const handlePrepareQuote = (req) => {
    setViewMode(false);
    setSelectedRequest(req);
    setIsModalOpen(true);
    resetForm();
  };

  const handleViewQuote = (req) => {
    setViewMode(true);
    setSelectedRequest(req);
    
    if (req.quotation) {
      setFormData({
        materialCost: req.quotation.materialCost || 0,
        laborCost: req.quotation.laborCost || 0,
        additionalCosts: req.quotation.additionalCosts || 0,
        materialDetails: req.quotation.materialDetails || '',
        laborDetails: req.quotation.laborDetails || '',
        additionalDetails: req.quotation.additionalDetails || '',
        validUntil: req.quotation.validUntil ? req.quotation.validUntil.split('T')[0] : ''
      });
      setQuotationItems(req.quotation.items || []);
    }
    
    setIsModalOpen(true);
  };

  const addItem = () => {
    setQuotationItems([...quotationItems, { materialId: '', materialName: '', quantity: 1, unitPrice: 0 }]);
  };

  const removeItem = (index) => {
    const newItems = [...quotationItems];
    newItems.splice(index, 1);
    setQuotationItems(newItems);
  };

  const updateItem = (index, field, value) => {
    const newItems = [...quotationItems];
    newItems[index][field] = value;
    
    if (field === 'materialName') {
      const material = materials.find(m => m.name.toLowerCase() === value.toLowerCase());
      if (material) {
        newItems[index].materialId = material.id;
        newItems[index].unitPrice = material.unitPrice;
      } else {
        newItems[index].materialId = '';
      }
    }
    
    setQuotationItems(newItems);
  };

  const calculateMaterialCost = () => {
    return quotationItems.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unitPrice)), 0);
  };

  useEffect(() => {
    if (!viewMode) {
      const matCost = calculateMaterialCost();
      setFormData(prev => ({ ...prev, materialCost: matCost }));
    }
  }, [quotationItems, viewMode]);

  const handleSubmitQuotation = async (e) => {
    e.preventDefault();
    
    const isConfirmed = await showConfirmAlert(
      t('confirm_submit_quote_title') || 'Submit Quotation?',
      t('confirm_submit_quote_text') || 'Are you sure you want to submit this quotation?'
    );
    
    if (!isConfirmed) return;

    setLoading(true);
    try {
      const payload = {
        workRequestId: selectedRequest.id,
        schoolId: user.schoolId,
        preparedById: user.id,
        ...formData,
        materialCost: calculateMaterialCost(),
        laborCost: Number(formData.laborCost),
        additionalCosts: Number(formData.additionalCosts),
        items: quotationItems.filter(item => item.materialName)
      };

      await axios.post('http://localhost:8080/api/quotations', payload);
      
      showSuccessAlert(t('success_quote_title') || 'Success', t('msg_quote_success'));
      setIsModalOpen(false);
      resetForm();
      fetchWorkRequests();
    } catch (err) {
      showErrorAlert('Error', t('msg_quote_fail'));
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      materialCost: 0,
      laborCost: 0,
      additionalCosts: 0,
      materialDetails: '',
      laborDetails: '',
      additionalDetails: '',
      validUntil: ''
    });
    setQuotationItems([]);
  };

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'PENDING_APPROVAL': return 'status-pending-approval';
      case 'APPROVED': return 'status-approved';
      case 'REJECTED': return 'status-rejected';
      case 'WORK_CREATED': return 'status-work-started';
      default: return 'status-default';
    }
  };

  const getStatusText = (status) => {
    return status.replace('_', ' ');
  };

  return (
    <div className="quotations-container">
      <div className="module-header">
        <h1>{t('menu_quotations')}</h1>
        <p>{t('subtitle_quotations')}</p>
      </div>

      <div className="tabs-container">
        <button 
          className={`tab-btn ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          <ClipboardList size={18} />
          <span>Pending Requests</span>
          {requests.length > 0 && activeTab === 'pending' && <span className="count-badge">{requests.length}</span>}
        </button>
        <button 
          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <History size={18} />
          <span>Quotation History</span>
        </button>
      </div>

      <div className="requests-grid">
        {requests.map(req => (
          <div key={req.id} className="request-card">
            <div className="request-header">
              <span className="req-id">#{req.id}</span>
              <span className={`priority-badge ${req.priority?.toLowerCase()}`}>{req.priority}</span>
            </div>
            
            <div className="badge-row">
              <div className="req-type-badge">{req.type} / {req.category}</div>
              {activeTab === 'history' && (
                <div className={`status-badge-small ${getStatusBadgeClass(req.status)}`}>
                  {getStatusText(req.status)}
                </div>
              )}
            </div>

            <h3>{req.title}</h3>
            <p className="req-desc">{req.description?.substring(0, 100)}...</p>
            
            <div className="req-meta">
              <div className="meta-item"><Clock size={14} /> {new Date(req.createdAt).toLocaleDateString()}</div>
              {req.expectedTimeline && (
                <div className="meta-item timeline"><Calendar size={14} /> {req.expectedTimeline}</div>
              )}
            </div>

            <div className="card-footer">
              {activeTab === 'pending' ? (
                <button className="prepare-btn" onClick={() => handlePrepareQuote(req)}>
                  {t('btn_prepare_quote')} <ChevronRight size={16} />
                </button>
              ) : (
                <div className="history-actions">
                  <div className="price-tag">
                    <IndianRupee size={14} />
                    <span>{req.quotation?.grandTotal?.toLocaleString()}</span>
                  </div>
                  <button className="view-btn-small" onClick={() => handleViewQuote(req)}>
                    <Eye size={16} /> {t('btn_view')}
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
            <div className="empty-state">
            {activeTab === 'pending' ? (
              <>
                <CheckCircle2 size={48} color="#10b981" />
                <h3>{t('all_clear')}</h3>
                <p>{t('empty_alerts_desc')}</p>
              </>
            ) : (
              <>
                <History size={48} color="#94a3b8" />
                <h3>{t('no_history')}</h3>
                <p>You haven't prepared any quotations yet.</p>
              </>
            )}
          </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal modal-lg">
            <div className="modal-header">
              <h2>{viewMode ? t('label_quotation_details') : t('btn_prepare_quote')}</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}><X size={24} /></button>
            </div>
            <form onSubmit={viewMode ? (e) => e.preventDefault() : handleSubmitQuotation}>
              <div className="modal-content overflow-y-auto" style={{ maxHeight: '75vh' }}>
                <div className="req-summary-enhanced">
                  <div className="summary-main">
                    <label>{t('label_for')}:</label>
                    <h4>{selectedRequest?.title}</h4>
                    <p>{selectedRequest?.description}</p>
                    
                    {/* Added Photo Gallery for Clerk */}
                    <div className="request-photos-section">
                      <h5>{t('initial_photos')}</h5>
                      <div className="photo-grid-clerk">
                        {selectedRequest?.photoUrls?.map((photo, i) => (
                          <div key={i} className="photo-item-clerk">
                            <img src={`http://localhost:8080${photo.url}`} alt="Request" />
                            {photo.latitude && photo.longitude && (
                              <div className="geotag-overlay">
                                <MapPin size={12} />
                                <span>{photo.latitude.toFixed(4)}, {photo.longitude.toFixed(4)}</span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="summary-side">
                    <div className="summary-item">
                      <Tag size={14} />
                      <span>{selectedRequest?.type} / {selectedRequest?.category}</span>
                    </div>
                    <div className="summary-item">
                      <Calendar size={14} />
                      <span>{selectedRequest?.expectedTimeline}</span>
                    </div>
                  </div>
                </div>

                {viewMode && selectedRequest?.status === 'REJECTED' && selectedRequest?.rejectionReason && (
                   <div className="rejection-alert">
                     <AlertCircle size={20} />
                     <div>
                       <strong>Rejection Reason:</strong>
                       <p>{selectedRequest.rejectionReason}</p>
                     </div>
                   </div>
                )}
                
                <div className="items-section">
                  <div className="section-header">
                    <h3>{t('field_material')}</h3>
                    {!viewMode && (
                      <button type="button" className="add-item-btn" onClick={addItem}>
                        <Plus size={16} /> {t('btn_add_item')}
                      </button>
                    )}
                  </div>
                  
                  <div className="items-list">
                    {quotationItems.length > 0 ? (
                      <div className="table-wrapper">
                        <table className="items-table">
                          <thead>
                            <tr>
                              <th>{t('field_name')}</th>
                              <th>{t('field_quantity')}</th>
                              <th>{t('field_unit_price')} (₹)</th>
                              <th>{t('field_total')}</th>
                              {!viewMode && <th></th>}
                            </tr>
                          </thead>
                          <tbody>
                            {quotationItems.map((item, index) => (
                              <tr key={index}>
                                <td>
                                  {viewMode ? item.materialName : (
                                    <input 
                                      type="text"
                                      required 
                                      className="table-input"
                                      value={item.materialName} 
                                      onChange={e => updateItem(index, 'materialName', e.target.value)}
                                      list={`materials-list-${index}`}
                                    />
                                  )}
                                  <datalist id={`materials-list-${index}`}>
                                    {materials.map(m => (
                                      <option key={m.id} value={m.name} />
                                    ))}
                                  </datalist>
                                </td>
                                <td>
                                  {viewMode ? item.quantity : (
                                    <input 
                                      type="number" 
                                      required 
                                      min="0.1" 
                                      step="0.1"
                                      className="table-input"
                                      value={item.quantity} 
                                      onChange={e => updateItem(index, 'quantity', e.target.value)} 
                                    />
                                  )}
                                </td>
                                <td>
                                  {viewMode ? item.unitPrice?.toLocaleString() : (
                                    <input 
                                      type="number" 
                                      required 
                                      className="table-input"
                                      value={item.unitPrice} 
                                      onChange={e => updateItem(index, 'unitPrice', e.target.value)} 
                                    />
                                  )}
                                </td>
                                <td className="total-cell">
                                  ₹{(item.quantity * item.unitPrice).toLocaleString()}
                                </td>
                                {!viewMode && (
                                  <td>
                                    <button type="button" className="icon-btn-danger" onClick={() => removeItem(index)}>
                                      <Trash2 size={16} />
                                    </button>
                                  </td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="no-items-msg">{t('msg_no_items')}</div>
                    )}
                  </div>
                </div>

                <div className="cost-details-grid">
                  <div className="form-group">
                    <label>{t('field_additional_details')}</label>
                    <textarea 
                      rows="3" 
                      readOnly={viewMode}
                      value={formData.materialDetails} 
                      onChange={e => setFormData({...formData, materialDetails: e.target.value})} 
                      placeholder={t('placeholder_material_notes')}
                    ></textarea>
                  </div>
                  <div className="form-group">
                    <label>{t('field_labor_cost')} (₹)</label>
                    <input 
                      type="number" 
                      readOnly={viewMode}
                      value={formData.laborCost} 
                      onChange={e => setFormData({...formData, laborCost: e.target.value})} 
                    />
                  </div>
                  <div className="form-group">
                    <label>{t('field_valid_until')}</label>
                    <input 
                      type="date" 
                      readOnly={viewMode}
                      value={formData.validUntil} 
                      onChange={e => setFormData({...formData, validUntil: e.target.value})} 
                    />
                  </div>
                </div>

                <div className="final-summary-box">
                  <div className="cost-line">
                    <span>{t('field_material')}</span>
                    <span>₹{formData.materialCost.toLocaleString()}</span>
                  </div>
                  <div className="cost-line">
                    <span>{t('field_labor_cost')}</span>
                    <span>₹{Number(formData.laborCost).toLocaleString()}</span>
                  </div>
                  <div className="cost-line grand-total-line">
                    <span>{t('field_total')}</span>
                    <strong>₹{(Number(formData.materialCost) + Number(formData.laborCost) + Number(formData.additionalCosts)).toLocaleString()}</strong>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="cancel-btn" onClick={() => setIsModalOpen(false)}>
                  {viewMode ? t('btn_close') : t('btn_cancel')}
                </button>
                {!viewMode && (
                  <button type="submit" className="submit-btn" disabled={loading}>
                    {loading ? 'Submitting...' : t('btn_submit')}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .quotations-container { padding: 0; }
        
        /* Tabs Styling */
        .tabs-container { display: flex; gap: 1rem; margin-top: 1.5rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.5rem; }
        .tab-btn { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1.5rem; background: transparent; border: none; border-bottom: 3px solid transparent; color: #64748b; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .tab-btn:hover { color: #0ea5e9; }
        .tab-btn.active { color: #0ea5e9; border-bottom-color: #0ea5e9; }
        .count-badge { background: #0ea5e9; color: white; font-size: 0.7rem; padding: 0.1rem 0.5rem; border-radius: 9999px; margin-left: 0.5rem; }

        .requests-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 1.5rem; margin-top: 2rem; }
        .request-card { background: white; padding: 1.5rem; border-radius: 1rem; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.05); display: flex; flex-direction: column; transition: transform 0.2s; }
        .request-card:hover { transform: translateY(-3px); box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
        
        .request-header { display: flex; justify-content: space-between; margin-bottom: 0.75rem; }
        .req-id { color: #94a3b8; font-weight: 700; font-family: monospace; font-size: 0.85rem; }
        
        .badge-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; gap: 0.5rem; }
        .req-type-badge { font-size: 0.7rem; font-weight: 800; color: #0ea5e9; text-transform: uppercase; letter-spacing: 0.025em; background: #f0f9ff; padding: 0.25rem 0.6rem; border-radius: 0.4rem; }
        
        .status-badge-small { font-size: 0.65rem; font-weight: 700; text-transform: uppercase; padding: 0.2rem 0.5rem; border-radius: 9999px; }
        .status-pending-approval { background: #fef3c7; color: #92400e; }
        .status-approved { background: #dcfce7; color: #15803d; }
        .status-rejected { background: #fee2e2; color: #b91c1c; }
        .status-work-started { background: #e0f2fe; color: #0369a1; }

        .request-card h3 { margin: 0 0 0.75rem 0; font-size: 1.15rem; color: #1e293b; height: 1.5em; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .req-desc { font-size: 0.9rem; color: #64748b; margin-bottom: 1.5rem; line-height: 1.5; flex-grow: 1; }
        
        .req-meta { display: flex; gap: 1rem; margin-bottom: 1.5rem; padding-top: 1rem; border-top: 1px solid #f1f5f9; }
        .meta-item { display: flex; align-items: center; gap: 0.4rem; font-size: 0.8rem; color: #94a3b8; }
        .meta-item.timeline { color: #0ea5e9; font-weight: 600; }

        .card-footer { margin-top: auto; }
        .prepare-btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.85rem; background: #0ea5e9; color: white; border: none; border-radius: 0.75rem; font-weight: 700; cursor: pointer; transition: background 0.2s; }
        .prepare-btn:hover { background: #0284c7; }

        .history-actions { display: flex; justify-content: space-between; align-items: center; }
        .price-tag { display: flex; align-items: center; gap: 0.25rem; color: #1e293b; font-weight: 800; font-size: 1.1rem; }
        .view-btn-small { display: flex; align-items: center; gap: 0.4rem; padding: 0.5rem 0.75rem; background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; border-radius: 0.5rem; font-size: 0.85rem; font-weight: 600; cursor: pointer; }
        .view-btn-small:hover { background: #e2e8f0; color: #1e293b; }

        /* Modal Styles */
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(4px); display: flex; justify-content: center; align-items: center; z-index: 2000; }
        .modal { background: white; border-radius: 1.25rem; width: 100%; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1); }
        .modal-lg { max-width: 950px; }
        .modal-header { padding: 1.5rem 2rem; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
        .modal-header h2 { margin: 0; font-size: 1.4rem; color: #1e293b; }
        .close-btn { background: transparent; border: none; color: #94a3b8; cursor: pointer; padding: 0.25rem; border-radius: 0.5rem; }
        .close-btn:hover { background: #f1f5f9; color: #1e293b; }

        .modal-content { padding: 2rem; }
        .overflow-y-auto { overflow-y: auto; }
        
        .req-summary-enhanced { background: #f8fafc; padding: 1.5rem; border-radius: 1rem; border: 1px solid #e2e8f0; display: flex; justify-content: space-between; margin-bottom: 2rem; }
        .summary-main { flex: 1; }
        .summary-main label { font-size: 0.75rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; }
        .summary-main h4 { margin: 0.25rem 0 0.5rem 0; color: #1e293b; font-size: 1.2rem; }
        .summary-main p { margin: 0; font-size: 0.95rem; color: #64748b; line-height: 1.5; }
        
        /* Photo Gallery for Clerk */
        .request-photos-section { margin-top: 1.5rem; }
        .request-photos-section h5 { margin: 0 0 0.75rem 0; font-size: 0.8rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
        .photo-grid-clerk { display: flex; gap: 0.75rem; overflow-x: auto; padding-bottom: 0.5rem; }
        .photo-item-clerk { flex: 0 0 120px; height: 90px; border-radius: 0.5rem; overflow: hidden; border: 1px solid #e2e8f0; position: relative; }
        .photo-item-clerk img { width: 100%; height: 100%; object-fit: cover; }
        .geotag-overlay { position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.6); color: white; padding: 0.15rem 0.35rem; font-size: 0.55rem; display: flex; align-items: center; gap: 0.2rem; }

        .summary-side { display: flex; flex-direction: column; gap: 0.75rem; min-width: 200px; padding-left: 2rem; border-left: 1px solid #e2e8f0; }
        .summary-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; font-weight: 600; color: #475569; }
        .summary-item svg { color: #0ea5e9; }

        .rejection-alert { background: #fff1f2; border: 1px solid #fecaca; border-radius: 0.75rem; padding: 1rem; display: flex; gap: 1rem; margin-bottom: 2rem; color: #991b1b; }
        .rejection-alert p { margin: 0.25rem 0 0; font-size: 0.9rem; }

        .items-section { margin-bottom: 2.5rem; }
        .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.25rem; }
        .section-header h3 { font-size: 1.1rem; color: #1e293b; margin: 0; font-weight: 700; }
        
        .table-wrapper { border: 1px solid #e2e8f0; border-radius: 0.75rem; overflow-x: auto; }
        .items-table { width: 100%; border-collapse: collapse; }
        .items-table th { background: #f8fafc; text-align: left; padding: 1rem; font-size: 0.8rem; font-weight: 700; color: #64748b; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; }
        .items-table td { padding: 1rem; border-bottom: 1px solid #f1f5f9; color: #1e293b; font-weight: 600; }
        .table-input { width: 100%; padding: 0.6rem; border: 1px solid #d1d5db; border-radius: 0.4rem; font-size: 0.9rem; outline: none; transition: border-color 0.2s; }
        .table-input:focus { border-color: #0ea5e9; }
        .total-cell { font-weight: 700; color: #1e293b; }
        .icon-btn-danger { background: transparent; border: none; color: #94a3b8; cursor: pointer; padding: 0.5rem; transition: color 0.2s; }
        .icon-btn-danger:hover { color: #ef4444; }

        .cost-details-grid { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 1.5rem; margin-bottom: 2.5rem; }
        .form-group label { display: block; font-size: 0.85rem; font-weight: 700; color: #475569; margin-bottom: 0.5rem; }
        .form-group input, .form-group textarea { width: 100%; padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 0.95rem; outline: none; }
        .form-group input:focus, .form-group textarea:focus { border-color: #0ea5e9; }

        .final-summary-box { background: #f1f5f9; padding: 1.5rem; border-radius: 1rem; margin-top: 1rem; max-width: 400px; margin-left: auto; }
        .cost-line { display: flex; justify-content: space-between; margin-bottom: 0.75rem; color: #64748b; font-weight: 600; }
        .grand-total-line { margin-top: 1rem; padding-top: 1rem; border-top: 2px solid #e2e8f0; color: #1e293b; font-size: 1.1rem; }
        .grand-total-line strong { font-size: 1.6rem; color: #0ea5e9; }

        .modal-footer { padding: 1.5rem 2rem; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 1rem; }
        .submit-btn { padding: 0.85rem 2rem; background: #10b981; color: white; border: none; border-radius: 0.75rem; cursor: pointer; font-weight: 700; transition: background 0.2s; }
        .submit-btn:hover { background: #059669; }
        .cancel-btn { padding: 0.85rem 2rem; background: #f1f5f9; color: #475569; border: none; border-radius: 0.75rem; cursor: pointer; font-weight: 700; }

        .priority-badge { padding: 0.2rem 0.6rem; border-radius: 9999px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; }
        .priority-badge.high, .priority-badge.urgent { background: #fee2e2; color: #dc2626; }
        .priority-badge.medium { background: #fef3c7; color: #d97706; }
        .priority-badge.low { background: #dcfce7; color: #16a34a; }

        .empty-state { grid-column: 1 / -1; padding: 5rem 2rem; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 1rem; color: #94a3b8; }
        .empty-state h3 { margin: 0; color: #475569; }
      `}</style>
    </div>
  );
};

export default ClerkQuotations;
