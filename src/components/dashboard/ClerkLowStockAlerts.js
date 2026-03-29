import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { AlertTriangle, RefreshCw, CheckCircle, Package, X, Plus, Trash2 } from 'lucide-react';

const ClerkLowStockAlerts = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [quotationItems, setQuotationItems] = useState([]);
  const [formData, setFormData] = useState({
    materialCost: 0,
    laborCost: 0,
    additionalCosts: 0,
    materialDetails: '',
    validUntil: ''
  });

  useEffect(() => {
    if (user?.schoolId) {
      fetchAlerts();
      fetchMaterials();
    }
  }, [user?.schoolId]);

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:8080/api/inventory/alerts/low-stock/${user.schoolId}`);
      setAlerts(res.data || []);
    } catch (err) {
      console.error('Error fetching alerts:', err);
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

  const handleRestockClick = (item) => {
    setQuotationItems([{ 
      materialId: item.id, 
      quantity: item.minStockLevel * 2, 
      unitPrice: item.unitPrice,
      name: item.name
    }]);
    setIsModalOpen(true);
  };

  const addItem = () => {
    setQuotationItems([...quotationItems, { materialId: '', quantity: 1, unitPrice: 0 }]);
  };

  const removeItem = (index) => {
    const newItems = [...quotationItems];
    newItems.splice(index, 1);
    setQuotationItems(newItems);
  };

  const updateItem = (index, field, value) => {
    const newItems = [...quotationItems];
    newItems[index][field] = value;
    
    if (field === 'materialId') {
      const material = materials.find(m => m.id.toString() === value);
      if (material) {
        newItems[index].unitPrice = material.unitPrice;
        newItems[index].name = material.name;
      }
    }
    
    setQuotationItems(newItems);
  };

  const calculateMaterialCost = () => {
    return quotationItems.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.unitPrice)), 0);
  };

  const handleSubmitQuotation = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        quotationType: 'REPLENISHMENT',
        schoolId: user.schoolId,
        preparedById: user.id,
        ...formData,
        materialCost: calculateMaterialCost(),
        items: quotationItems.filter(item => item.materialId)
      };

      await axios.post('http://localhost:8080/api/quotations', payload);
      
      setSuccess('Fund request quotation submitted successfully');
      setIsModalOpen(false);
      setQuotationItems([]);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to submit fund request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="alerts-container">
      <div className="module-header">
        <h1>Low Stock Alerts</h1>
        <p>Materials that have fallen below the required minimum threshold</p>
      </div>

      {success && <div className="alert success">{success}</div>}
      {error && <div className="alert error">{error}</div>}

      <div className="alerts-list">
        {alerts.map(item => (
          <div key={item.id} className={`alert-card-item ${item.currentStock <= 0 ? 'critical' : 'warning'}`}>
            <div className="alert-icon-box">
              <AlertTriangle size={24} />
            </div>
            <div className="alert-info-box">
              <h3>{item.name}</h3>
              <div className="stock-info-row">
                <div className="stock-data">
                  <label>Current Stock</label>
                  <span className="stock-val">{item.currentStock} {item.unitOfMeasurement}</span>
                </div>
                <div className="stock-data">
                  <label>Min Level</label>
                  <span>{item.minStockLevel} {item.unitOfMeasurement}</span>
                </div>
              </div>
              <p className="location-info"><strong>Storage:</strong> {item.storageLocation || 'Main Store'}</p>
            </div>
            <div className="alert-actions-box">
              <button className="restock-btn-action" onClick={() => handleRestockClick(item)}>
                <RefreshCw size={16} /> Prepare Fund Request
              </button>
            </div>
          </div>
        ))}

        {alerts.length === 0 && !loading && (
          <div className="empty-state">
            <CheckCircle size={64} color="#10b981" />
            <h3>Inventory Healthy</h3>
            <p>All materials are currently above their minimum stock levels.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal modal-lg">
            <div className="modal-header">
              <h2>Prepare Fund Request Quotation</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmitQuotation}>
              <div className="modal-content overflow-y-auto" style={{ maxHeight: '70vh' }}>
                <div className="items-section">
                  <div className="section-header">
                    <h3>Items to Replenish</h3>
                    <button type="button" className="add-item-btn" onClick={addItem}>
                      <Plus size={16} /> Add Item
                    </button>
                  </div>
                  
                  <div className="items-list">
                    {quotationItems.map((item, index) => (
                      <div key={index} className="item-row">
                        <div className="form-group flex-2">
                          <label>Material</label>
                          <select 
                            required 
                            value={item.materialId} 
                            onChange={e => updateItem(index, 'materialId', e.target.value)}
                          >
                            <option value="">Select Material</option>
                            {materials.map(m => (
                              <option key={m.id} value={m.id}>{m.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="form-group flex-1">
                          <label>Quantity</label>
                          <input 
                            type="number" 
                            required 
                            min="1"
                            value={item.quantity} 
                            onChange={e => updateItem(index, 'quantity', e.target.value)} 
                          />
                        </div>
                        <div className="form-group flex-1">
                          <label>Est. Unit Price</label>
                          <input 
                            type="number" 
                            required 
                            value={item.unitPrice} 
                            onChange={e => updateItem(index, 'unitPrice', e.target.value)} 
                          />
                        </div>
                        <div className="form-group flex-1">
                          <label>Total</label>
                          <div className="read-only-val">₹{(item.quantity * item.unitPrice).toLocaleString()}</div>
                        </div>
                        <button type="button" className="remove-item-btn" onClick={() => removeItem(index)}>
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>Justification / Notes</label>
                    <textarea rows="3" value={formData.materialDetails} onChange={e => setFormData({...formData, materialDetails: e.target.value})} placeholder="Why are these items needed now?"></textarea>
                  </div>
                </div>

                <div className="total-box">
                  <span>Grand Total Requested:</span>
                  <strong>₹{calculateMaterialCost().toLocaleString()}</strong>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="cancel-btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="submit-btn" disabled={loading}>Submit Fund Request</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .alerts-container { padding: 0; }
        .alerts-list { display: flex; flex-direction: column; gap: 1rem; margin-top: 2rem; }
        .alert-card-item { display: flex; align-items: center; gap: 1.5rem; background: white; padding: 1.5rem; border-radius: 1rem; border: 1px solid #e2e8f0; border-left: 6px solid; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .alert-card-item.warning { border-left-color: #f59e0b; }
        .alert-card-item.critical { border-left-color: #ef4444; background: #fff1f2; }
        .alert-icon-box { color: #f59e0b; }
        .alert-card-item.critical .alert-icon-box { color: #ef4444; }
        .alert-info-box { flex: 1; }
        .alert-info-box h3 { margin: 0 0 0.75rem 0; font-size: 1.1rem; }
        .stock-info-row { display: flex; gap: 2rem; margin-bottom: 0.5rem; }
        .stock-data label { display: block; font-size: 0.75rem; color: #64748b; text-transform: uppercase; margin-bottom: 0.25rem; }
        .stock-data span { font-weight: 600; font-size: 1rem; }
        .stock-val { color: #ef4444; }
        .location-info { margin: 0; font-size: 0.85rem; color: #475569; }
        .restock-btn-action { display: flex; align-items: center; gap: 0.5rem; padding: 0.6rem 1.2rem; background: #1e293b; color: white; border: none; border-radius: 0.5rem; cursor: pointer; font-weight: 600; }
        .empty-state { text-align: center; padding: 5rem; color: #94a3b8; background: white; border-radius: 1rem; border: 2px dashed #e2e8f0; }

        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
        .modal { background: white; border-radius: 1rem; width: 100%; max-width: 900px; }
        .modal-header { padding: 1.5rem; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; }
        .modal-content { padding: 1.5rem; }
        .modal-footer { padding: 1.5rem; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 1rem; }
        
        .items-section { margin-bottom: 1.5rem; }
        .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
        .add-item-btn { display: flex; align-items: center; gap: 0.4rem; padding: 0.4rem 0.8rem; background: #f1f5f9; color: #0ea5e9; border: 1px solid #0ea5e9; border-radius: 0.4rem; font-size: 0.8rem; font-weight: 600; cursor: pointer; }
        
        .item-row { display: flex; gap: 1rem; align-items: flex-end; margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 1px dashed #e2e8f0; }
        .flex-2 { flex: 2; }
        .flex-1 { flex: 1; }
        .read-only-val { padding: 0.6rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0.4rem; color: #64748b; font-weight: 600; }
        .remove-item-btn { padding: 0.6rem; color: #94a3b8; background: none; border: none; cursor: pointer; }
        .remove-item-btn:hover { color: #ef4444; }

        .form-group { display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 1rem; }
        .form-group input, .form-group select, .form-group textarea { padding: 0.6rem; border: 1px solid #d1d5db; border-radius: 0.4rem; width: 100%; }
        
        .total-box { margin-top: 1rem; padding: 1.5rem; background: #f1f5f9; border-radius: 0.5rem; display: flex; justify-content: space-between; align-items: center; }
        .total-box strong { font-size: 1.5rem; color: #0ea5e9; }
        
        .submit-btn { padding: 0.6rem 1.5rem; background: #10b981; color: white; border: none; border-radius: 0.4rem; cursor: pointer; font-weight: 600; }
        .cancel-btn { padding: 0.6rem 1.5rem; background: #f1f5f9; color: #475569; border: none; border-radius: 0.4rem; cursor: pointer; font-weight: 600; }
        .alert.success { background: #dcfce7; color: #16a34a; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem; }
        .overflow-y-auto { overflow-y: auto; }
      `}</style>
    </div>
  );
};

export default ClerkLowStockAlerts;
