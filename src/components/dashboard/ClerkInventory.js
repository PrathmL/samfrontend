import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus, Edit2, RefreshCw, Package, 
  Search, X, Save, AlertTriangle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { showToast, showErrorAlert, showSuccessAlert, showConfirmAlert } from '../../utils/sweetAlertUtils';

const ClerkInventory = () => {
  const { user } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    description: '',
    unitOfMeasurement: 'pieces',
    minStockLevel: 10,
    unitPrice: 0,
    storageLocation: '',
    currentStock: 0
  });

  const [stockFormData, setStockFormData] = useState({
    materialId: '',
    movementType: 'IN',
    quantity: 0,
    unitPrice: 0,
    purpose: '',
    remarks: ''
  });

  useEffect(() => {
    fetchMaterials();
    fetchCategories();
  }, []);

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:8080/api/inventory/materials`);
      setMaterials(res.data || []);
    } catch (err) {
      console.error('Error fetching materials:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/material-categories`);
      setCategories(res.data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isConfirmed = await showConfirmAlert(
      editingMaterial ? 'Update Material?' : 'Add Material?',
      editingMaterial ? 'Are you sure you want to update this material?' : 'Are you sure you want to add this new material?'
    );

    if (!isConfirmed) return;

    setLoading(true);
    try {
      if (editingMaterial) {
        await axios.put(`http://localhost:8080/api/inventory/materials/${editingMaterial.id}`, formData);
        showToast('Material updated successfully', 'success');
      } else {
        await axios.post('http://localhost:8080/api/inventory/materials', formData);
        showToast('Material created successfully', 'success');
      }
      setIsModalOpen(false);
      resetForm();
      fetchMaterials();
    } catch (err) {
      showErrorAlert('Error', 'Failed to save material');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStock = async (e) => {
    e.preventDefault();

    const isConfirmed = await showConfirmAlert(
      'Update Stock?',
      `Are you sure you want to update the stock for this material?`
    );

    if (!isConfirmed) return;

    setLoading(true);
    try {
      await axios.post('http://localhost:8080/api/inventory/stock/update', {
        ...stockFormData,
        schoolId: user.schoolId,
        performedById: user.id,
        performedByRole: 'CLERK'
      });
      showSuccessAlert('Success', 'Stock updated successfully');
      setIsStockModalOpen(false);
      fetchMaterials();
    } catch (err) {
      showErrorAlert('Error', 'Failed to update stock');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      categoryId: '',
      description: '',
      unitOfMeasurement: 'pieces',
      minStockLevel: 10,
      unitPrice: 0,
      storageLocation: '',
      currentStock: 0
    });
    setEditingMaterial(null);
  };

  return (
    <div className="inventory-container">
      <div className="module-header">
        <div>
          <h1>Inventory Management</h1>
          <p>Track and manage school construction materials</p>
        </div>
        <button className="create-btn" onClick={() => { resetForm(); setIsModalOpen(true); }}>
          <Plus size={20} /> Add Material
        </button>
      </div>

      <div className="materials-table-container">
        <table className="materials-table">
          <thead>
            <tr>
              <th>Material</th>
              <th>Category</th>
              <th>Current Stock</th>
              <th>Unit</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {materials.map(m => (
              <tr key={m.id}>
                <td><strong>{m.name}</strong></td>
                <td>{m.categoryName}</td>
                <td>
                  <span className={m.currentStock <= m.minStockLevel ? 'low-stock' : ''}>
                    {m.currentStock}
                  </span>
                </td>
                <td>{m.unitOfMeasurement}</td>
                <td>₹{m.unitPrice}</td>
                <td className="action-cell">
                  <button className="edit-btn" onClick={() => { setEditingMaterial(m); setFormData(m); setIsModalOpen(true); }}>
                    <Edit2 size={16} />
                  </button>
                  <button className="stock-btn" onClick={() => { setStockFormData({...stockFormData, materialId: m.id}); setIsStockModalOpen(true); }}>
                    <RefreshCw size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal modal-lg">
            <div className="modal-header">
              <h2>{editingMaterial ? 'Edit Material' : 'Add New Material'}</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-content">
                <div className="form-grid">
                  <div className="form-group full-width">
                    <label>Material Name *</label>
                    <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <select value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})} required>
                      <option value="">Select Category</option>
                      {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Unit</label>
                    <select value={formData.unitOfMeasurement} onChange={e => setFormData({...formData, unitOfMeasurement: e.target.value})}>
                      <option value="pieces">Pieces</option>
                      <option value="kg">kg</option>
                      <option value="bags">Bags</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="cancel-btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="submit-btn">{editingMaterial ? 'Update' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Update Modal */}
      {isStockModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>Update Stock</h2>
              <button className="close-btn" onClick={() => setIsStockModalOpen(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleUpdateStock}>
              <div className="modal-content">
                <div className="form-group">
                  <label>Type</label>
                  <select value={stockFormData.movementType} onChange={e => setStockFormData({...stockFormData, movementType: e.target.value})}>
                    <option value="IN">Stock IN (+)</option>
                    <option value="OUT">Stock OUT (-)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Quantity</label>
                  <input type="number" required value={stockFormData.quantity} onChange={e => setStockFormData({...stockFormData, quantity: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Purpose</label>
                  <input type="text" value={stockFormData.purpose} onChange={e => setStockFormData({...stockFormData, purpose: e.target.value})} placeholder="e.g., Daily usage" />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="cancel-btn" onClick={() => setIsStockModalOpen(false)}>Cancel</button>
                <button type="submit" className="submit-btn">Update Stock</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .inventory-container { padding: 0; }
        .materials-table-container { background: white; border-radius: 1rem; border: 1px solid #e2e8f0; overflow: hidden; margin-top: 2rem; }
        .materials-table { width: 100%; border-collapse: collapse; }
        .materials-table th { background: #f8fafc; padding: 1rem; text-align: left; color: #475569; }
        .materials-table td { padding: 1rem; border-top: 1px solid #f1f5f9; }
        .low-stock { color: #ef4444; font-weight: 700; }
        .action-cell { display: flex; gap: 0.5rem; }
        .edit-btn, .stock-btn { padding: 0.5rem; border-radius: 0.4rem; border: 1px solid #e2e8f0; cursor: pointer; background: white; }
        .edit-btn:hover { color: #0ea5e9; border-color: #0ea5e9; }
        .stock-btn:hover { color: #10b981; border-color: #10b981; }
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
        .modal { background: white; border-radius: 1rem; width: 100%; max-width: 500px; }
        .modal-lg { max-width: 800px; }
        .modal-header { padding: 1.5rem; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; }
        .modal-content { padding: 1.5rem; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .full-width { grid-column: span 2; }
        .form-group { display: flex; flex-direction: column; gap: 0.4rem; margin-bottom: 1rem; }
        .form-group input, .form-group select { padding: 0.6rem; border: 1px solid #d1d5db; border-radius: 0.4rem; }
        .modal-footer { padding: 1.5rem; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 1rem; }
        .submit-btn { padding: 0.6rem 1.5rem; background: #0ea5e9; color: white; border: none; border-radius: 0.4rem; cursor: pointer; }
        .alert { padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem; }
        .alert.success { background: #dcfce7; color: #16a34a; }
      `}</style>
    </div>
  );
};

export default ClerkInventory;
