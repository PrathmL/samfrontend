import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FileText, Search, X, CheckCircle2, 
  ChevronRight, IndianRupee, Clock, Plus, Trash2, Calendar
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';

const ClerkQuotations = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [requests, setRequests] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

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
  }, [user?.schoolId]);

  const fetchWorkRequests = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:8080/api/work-requests`, {
        params: { schoolId: user.schoolId, status: 'PENDING_QUOTATION' }
      });
      setRequests(res.data || []);
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
    setSelectedRequest(req);
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
    const matCost = calculateMaterialCost();
    setFormData(prev => ({ ...prev, materialCost: matCost }));
  }, [quotationItems]);

  const handleSubmitQuotation = async (e) => {
    e.preventDefault();
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
      
      setSuccess(t('msg_quote_success'));
      setIsModalOpen(false);
      resetForm();
      fetchWorkRequests();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(t('msg_quote_fail'));
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
    setSelectedRequest(null);
  };

  return (
    <div className="quotations-container">
      <div className="module-header">
        <h1>{t('menu_quotations')}</h1>
        <p>{t('subtitle_quotations')}</p>
      </div>

      {success && <div className="alert success">{success}</div>}
      {error && <div className="alert error">{error}</div>}

      <div className="requests-grid">
        {requests.map(req => (
          <div key={req.id} className="request-card">
            <div className="request-header">
              <span className="req-id">#{req.id}</span>
              <span className={`priority-badge ${req.priority?.toLowerCase()}`}>{req.priority}</span>
            </div>
            <div className="req-type-badge">{req.type} / {req.category}</div>
            <h3>{req.title}</h3>
            <p className="req-desc">{req.description?.substring(0, 120)}...</p>
            <div className="req-meta">
              <div className="meta-item"><Clock size={14} /> {new Date(req.createdAt).toLocaleDateString()}</div>
              {req.expectedTimeline && (
                <div className="meta-item timeline"><Calendar size={14} /> {req.expectedTimeline}</div>
              )}
            </div>
            <button className="prepare-btn" onClick={() => handlePrepareQuote(req)}>
              {t('btn_prepare_quote')} <ChevronRight size={16} />
            </button>
          </div>
        ))}
        {requests.length === 0 && !loading && (
          <div className="empty-state">
            <CheckCircle2 size={48} color="#10b981" />
            <h3>All Clear!</h3>
            <p>No work requests are pending quotations.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal modal-lg">
            <div className="modal-header">
              <h2>{t('btn_prepare_quote')}</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmitQuotation}>
              <div className="modal-content overflow-y-auto" style={{ maxHeight: '70vh' }}>
                <div className="req-summary">
                  <strong>{t('label_for')}:</strong> {selectedRequest?.title}
                </div>
                
                <div className="items-section">
                  <div className="section-header">
                    <h3>{t('field_material')}</h3>
                    <button type="button" className="add-item-btn" onClick={addItem}>
                      <Plus size={16} /> {t('btn_add_item')}
                    </button>
                  </div>
                  
                  <div className="items-list">
                    {quotationItems.map((item, index) => (
                      <div key={index} className="item-row">
                        <div className="form-group flex-2">
                          <label>{t('field_name')}</label>
                          <input 
                            type="text"
                            required 
                            placeholder="e.g. Cement, Bricks, etc."
                            value={item.materialName} 
                            onChange={e => updateItem(index, 'materialName', e.target.value)}
                            list={`materials-list-${index}`}
                          />
                          <datalist id={`materials-list-${index}`}>
                            {materials.map(m => (
                              <option key={m.id} value={m.name} />
                            ))}
                          </datalist>
                        </div>
                        <div className="form-group flex-1">
                          <label>{t('field_quantity')}</label>
                          <input 
                            type="number" 
                            required 
                            min="0.1" 
                            step="0.1"
                            value={item.quantity} 
                            onChange={e => updateItem(index, 'quantity', e.target.value)} 
                          />
                        </div>
                        <div className="form-group flex-1">
                          <label>{t('field_unit_price')} (₹)</label>
                          <input 
                            type="number" 
                            required 
                            value={item.unitPrice} 
                            onChange={e => updateItem(index, 'unitPrice', e.target.value)} 
                          />
                        </div>
                        <div className="form-group flex-1">
                          <label>{t('field_total')}</label>
                          <div className="read-only-val">₹{(item.quantity * item.unitPrice).toLocaleString()}</div>
                        </div>
                        <button type="button" className="remove-item-btn" onClick={() => removeItem(index)}>
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                    {quotationItems.length === 0 && (
                      <div className="no-items-msg">{t('msg_no_items')}</div>
                    )}
                  </div>
                </div>

                <div className="form-grid mt-4">
                  <div className="form-group full-width">
                    <label>{t('field_additional_details')}</label>
                    <textarea rows="2" value={formData.materialDetails} onChange={e => setFormData({...formData, materialDetails: e.target.value})} placeholder={t('placeholder_material_notes')}></textarea>
                  </div>
                  <div className="form-group">
                    <label>{t('field_labor_cost')} (₹)</label>
                    <input type="number" value={formData.laborCost} onChange={e => setFormData({...formData, laborCost: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>{t('field_valid_until')}</label>
                    <input type="date" value={formData.validUntil} onChange={e => setFormData({...formData, validUntil: e.target.value})} />
                  </div>
                </div>
                <div className="total-box">
                  <div className="cost-breakdown">
                    <span>{t('field_material')}: ₹{calculateMaterialCost().toLocaleString()}</span>
                    <span>{t('field_labor_cost')}: ₹{Number(formData.laborCost).toLocaleString()}</span>
                  </div>
                  <div className="grand-total">
                    <span>{t('field_total')}:</span>
                    <strong>₹{(calculateMaterialCost() + Number(formData.laborCost) + Number(formData.additionalCosts)).toLocaleString()}</strong>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="cancel-btn" onClick={() => setIsModalOpen(false)}>{t('btn_cancel')}</button>
                <button type="submit" className="submit-btn" disabled={loading}>{t('btn_submit')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .quotations-container { padding: 0; }
        .requests-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 1.5rem; margin-top: 2rem; }
        .request-card { background: white; padding: 1.5rem; border-radius: 1rem; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .request-header { display: flex; justify-content: space-between; margin-bottom: 1rem; }
        .req-id { color: #94a3b8; font-weight: 700; font-family: monospace; }
        .priority-badge { padding: 0.2rem 0.6rem; border-radius: 9999px; font-size: 0.7rem; font-weight: 700; }
        .priority-badge.high { background: #fee2e2; color: #dc2626; }
        .priority-badge.medium { background: #fef3c7; color: #d97706; }
        .priority-badge.low { background: #dcfce7; color: #16a34a; }
        .req-desc { font-size: 0.9rem; color: #475569; margin-bottom: 1.5rem; line-height: 1.5; }
        .prepare-btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.75rem; background: #0ea5e9; color: white; border: none; border-radius: 0.5rem; font-weight: 600; cursor: pointer; }
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
        .modal { background: white; border-radius: 1rem; width: 100%; max-width: 500px; }
        .modal-lg { max-width: 900px; }
        .modal-header { padding: 1.5rem; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; }
        .modal-content { padding: 1.5rem; }
        .req-summary { background: #f8fafc; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1.5rem; border-left: 4px solid #0ea5e9; }
        
        .items-section { margin-bottom: 2rem; }
        .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
        .section-header h3 { font-size: 1.1rem; color: #1e293b; margin: 0; }
        .add-item-btn { display: flex; align-items: center; gap: 0.4rem; padding: 0.5rem 1rem; background: #f1f5f9; color: #0ea5e9; border: 1px solid #0ea5e9; border-radius: 0.4rem; font-size: 0.875rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .add-item-btn:hover { background: #0ea5e9; color: white; }
        
        .item-row { display: flex; gap: 1rem; align-items: flex-end; margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px dashed #e2e8f0; }
        .flex-2 { flex: 2; }
        .flex-1 { flex: 1; }
        .read-only-val { padding: 0.6rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0.4rem; color: #64748b; font-weight: 600; }
        .remove-item-btn { padding: 0.6rem; color: #94a3b8; background: none; border: none; cursor: pointer; transition: color 0.2s; }
        .remove-item-btn:hover { color: #ef4444; }
        .no-items-msg { padding: 2rem; text-align: center; background: #f8fafc; border: 2px dashed #e2e8f0; border-radius: 0.5rem; color: #94a3b8; }
        
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .full-width { grid-column: span 2; }
        .form-group { display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 1rem; }
        .form-group input, .form-group select, .form-group textarea { padding: 0.6rem; border: 1px solid #d1d5db; border-radius: 0.4rem; width: 100%; }
        
        .total-box { margin-top: 1rem; padding: 1.5rem; background: #f1f5f9; border-radius: 0.5rem; display: flex; justify-content: space-between; align-items: center; }
        .cost-breakdown { display: flex; flex-direction: column; gap: 0.25rem; font-size: 0.9rem; color: #64748b; }
        .grand-total { text-align: right; }
        .grand-total span { display: block; font-size: 0.875rem; color: #64748b; margin-bottom: 0.25rem; }
        .grand-total strong { font-size: 1.5rem; color: #0ea5e9; }
        
        .modal-footer { padding: 1.5rem; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 1rem; }
        .submit-btn { padding: 0.6rem 1.5rem; background: #10b981; color: white; border: none; border-radius: 0.4rem; cursor: pointer; font-weight: 600; }
        .cancel-btn { padding: 0.6rem 1.5rem; background: #f1f5f9; color: #475569; border: none; border-radius: 0.4rem; cursor: pointer; font-weight: 600; }
        .alert { padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem; }
        .alert.success { background: #dcfce7; color: #16a34a; }
        .mt-4 { margin-top: 1rem; }
        .overflow-y-auto { overflow-y: auto; }
      `}</style>
    </div>
  );
};

export default ClerkQuotations;
