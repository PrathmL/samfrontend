import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { 
  Package, AlertTriangle, TrendingUp, FileText, 
  Plus, Edit2, Trash2, X, Search, Filter, Download,
  ChevronRight, ChevronLeft, Menu, LogOut, User,
  Home, Briefcase, AlertCircle, Settings, Camera,
  CheckCircle, RefreshCw, Send, Box, DollarSign,
  Clock, Eye, Upload, ShoppingCart, List, BarChart3,
  Minus, Bell  // Add Minus and Bell here
} from 'lucide-react';

const ClerkDashboard = () => {
  const { user, logout } = useAuth();
  const [activeModule, setActiveModule] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Dashboard Stats
  const [stats, setStats] = useState({
    totalMaterials: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    totalInventoryValue: 0,
    pendingQuotations: 0,
    monthlyConsumption: 0
  });

  // Materials
  const [materials, setMaterials] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [materialFormData, setMaterialFormData] = useState({
    name: '',
    categoryId: '',
    description: '',
    unitOfMeasurement: 'pieces',
    minStockLevel: 10,
    unitPrice: 0,
    storageLocation: '',
    currentStock: 0
  });

  // Stock Movement
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [stockFormData, setStockFormData] = useState({
    materialId: '',
    movementType: 'IN',
    quantity: 0,
    unitPrice: 0,
    purpose: '',
    remarks: ''
  });

  // Quotations
  const [workRequests, setWorkRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isQuotationModalOpen, setIsQuotationModalOpen] = useState(false);
  const [quotationFormData, setQuotationFormData] = useState({
    materialCost: 0,
    laborCost: 0,
    additionalCosts: 0,
    materialDetails: '',
    laborDetails: '',
    additionalDetails: '',
    validUntil: ''
  });

  // Stock Movements History
  const [stockMovements, setStockMovements] = useState([]);
  const [lowStockAlerts, setLowStockAlerts] = useState([]);

  useEffect(() => {
    if (user && user.schoolId) {
      fetchDashboardData();
      fetchMaterials();
      fetchCategories();
      fetchWorkRequests();
      fetchStockMovements();
      fetchLowStockAlerts();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:8080/api/inventory/stats/${user.schoolId}`);
      setStats(res.data);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMaterials = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/inventory/materials`);
      setMaterials(res.data);
    } catch (err) {
      console.error('Error fetching materials:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/material-categories`);
      setCategories(res.data);
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchWorkRequests = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/work-requests`, {
        params: { schoolId: user.schoolId, status: 'PENDING_QUOTATION' }
      });
      setWorkRequests(res.data || []);
    } catch (err) {
      console.error('Error fetching work requests:', err);
    }
  };

  const fetchStockMovements = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/inventory/stock/movements/${user.schoolId}`);
      setStockMovements(res.data);
    } catch (err) {
      console.error('Error fetching stock movements:', err);
    }
  };

  const fetchLowStockAlerts = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/inventory/alerts/low-stock/${user.schoolId}`);
      setLowStockAlerts(res.data);
    } catch (err) {
      console.error('Error fetching low stock alerts:', err);
    }
  };

  const handleCreateMaterial = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingMaterial) {
        await axios.put(`http://localhost:8080/api/inventory/materials/${editingMaterial.id}`, materialFormData);
        setSuccess('Material updated successfully');
      } else {
        await axios.post('http://localhost:8080/api/inventory/materials', materialFormData);
        setSuccess('Material created successfully');
      }
      setIsMaterialModalOpen(false);
      resetMaterialForm();
      fetchMaterials();
      fetchDashboardData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save material');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStock = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('http://localhost:8080/api/inventory/stock/update', {
        ...stockFormData,
        schoolId: user.schoolId,
        performedById: user.id,
        performedByRole: 'CLERK'
      });
      setSuccess('Stock updated successfully');
      setIsStockModalOpen(false);
      resetStockForm();
      fetchMaterials();
      fetchStockMovements();
      fetchLowStockAlerts();
      fetchDashboardData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update stock');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitQuotation = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
        // Calculate grand total
        const materialCost = Number(quotationFormData.materialCost) || 0;
        const laborCost = Number(quotationFormData.laborCost) || 0;
        const additionalCosts = Number(quotationFormData.additionalCosts) || 0;
        const grandTotal = materialCost + laborCost + additionalCosts;
        
        // Prepare data for backend
        const quotationData = {
            workRequestId: selectedRequest.id,
            schoolId: user.schoolId,
            preparedById: user.id,
            materialCost: materialCost,
            laborCost: laborCost,
            additionalCosts: additionalCosts,
            materialDetails: quotationFormData.materialDetails,
            laborDetails: quotationFormData.laborDetails,
            additionalDetails: quotationFormData.additionalDetails,
            validUntil: quotationFormData.validUntil || null
        };
        
        console.log('Submitting quotation:', quotationData); // For debugging
        
        const response = await axios.post('http://localhost:8080/api/quotations', quotationData);
        
        setSuccess('Quotation submitted successfully');
        setIsQuotationModalOpen(false);
        resetQuotationForm();
        fetchWorkRequests();
        fetchDashboardData();
        setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
        console.error('Error submitting quotation:', err.response?.data || err.message);
        setError(err.response?.data?.error || 'Failed to submit quotation');
    } finally {
        setLoading(false);
    }
};

  const resetMaterialForm = () => {
    setMaterialFormData({
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

  const resetStockForm = () => {
    setStockFormData({
      materialId: '',
      movementType: 'IN',
      quantity: 0,
      unitPrice: 0,
      purpose: '',
      remarks: ''
    });
  };

  const resetQuotationForm = () => {
    setQuotationFormData({
      materialCost: 0,
      laborCost: 0,
      additionalCosts: 0,
      materialDetails: '',
      laborDetails: '',
      additionalDetails: '',
      validUntil: ''
    });
    setSelectedRequest(null);
  };

  const getStockStatusColor = (status) => {
    switch(status) {
      case 'LOW_STOCK': return '#f59e0b';
      case 'OUT_OF_STOCK': return '#ef4444';
      default: return '#10b981';
    }
  };

  const getStockStatusText = (status) => {
    switch(status) {
      case 'LOW_STOCK': return 'Low Stock';
      case 'OUT_OF_STOCK': return 'Out of Stock';
      default: return 'In Stock';
    }
  };

  // Navigation Menu Items
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'inventory', label: 'Inventory', icon: Package },
    { id: 'quotations', label: 'Quotations', icon: FileText },
    { id: 'stock-movements', label: 'Stock Movements', icon: TrendingUp },
    { id: 'alerts', label: 'Low Stock Alerts', icon: AlertTriangle },
    { id: 'profile', label: 'Profile', icon: User }
  ];

  const renderDashboard = () => (
    <div className="clerk-dashboard">
      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#e0f2fe', color: '#0284c7' }}>
            <Package size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats.totalMaterials}</h3>
            <p>Total Materials</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
            <AlertTriangle size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats.lowStockItems}</h3>
            <p>Low Stock Items</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#fee2e2', color: '#dc2626' }}>
            <AlertCircle size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats.outOfStockItems}</h3>
            <p>Out of Stock</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>
            <DollarSign size={24} />
          </div>
          <div className="stat-info">
            <h3>₹{stats.totalInventoryValue?.toLocaleString()}</h3>
            <p>Inventory Value</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#e0e7ff', color: '#4f46e5' }}>
            <FileText size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats.pendingQuotations}</h3>
            <p>Pending Quotations</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ backgroundColor: '#fce7f3', color: '#db2777' }}>
            <TrendingUp size={24} />
          </div>
          <div className="stat-info">
            <h3>₹{stats.monthlyConsumption?.toLocaleString()}</h3>
            <p>Monthly Consumption</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3>Quick Actions</h3>
        <div className="actions-grid">
          <button className="action-btn" onClick={() => setIsMaterialModalOpen(true)}>
            <Plus size={20} />
            <span>Add Material</span>
          </button>
          <button className="action-btn" onClick={() => setIsStockModalOpen(true)}>
            <RefreshCw size={20} />
            <span>Update Stock</span>
          </button>
          <button className="action-btn" onClick={() => setActiveModule('quotations')}>
            <FileText size={20} />
            <span>Prepare Quotation</span>
          </button>
          <button className="action-btn" onClick={() => setActiveModule('alerts')}>
            <AlertTriangle size={20} />
            <span>View Alerts</span>
          </button>
        </div>
      </div>

      {/* Recent Stock Movements */}
      <div className="recent-activities">
        <h3>Recent Stock Movements</h3>
        <div className="movements-list">
          {stockMovements.slice(0, 5).map(movement => (
            <div key={movement.id} className="movement-item">
              <div className={`movement-icon ${movement.movementType === 'IN' ? 'in' : 'out'}`}>
                {movement.movementType === 'IN' ? <Plus size={14} /> : <Minus size={14} />}
              </div>
              <div className="movement-details">
                <strong>{movement.materialName}</strong>
                <span>{movement.quantity} units {movement.movementType === 'IN' ? 'added' : 'used'}</span>
                <small>{new Date(movement.createdAt).toLocaleDateString()}</small>
              </div>
              <div className="movement-amount">
                ₹{movement.totalCost?.toLocaleString()}
              </div>
            </div>
          ))}
          {stockMovements.length === 0 && (
            <p className="no-data">No stock movements yet</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderInventory = () => (
    <div className="clerk-module">
      <div className="module-header">
        <h2>Inventory Management</h2>
        <button className="create-btn" onClick={() => setIsMaterialModalOpen(true)}>
          <Plus size={18} /> Add Material
        </button>
      </div>

      <div className="materials-table-container">
        <table className="materials-table">
          <thead>
            <tr>
              <th>Material</th>
              <th>Category</th>
              <th>Stock</th>
              <th>Unit</th>
              <th>Unit Price</th>
              <th>Total Value</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {materials.map(material => (
              <tr key={material.id}>
                <td>
                  <strong>{material.name}</strong>
                  {material.description && <small>{material.description}</small>}
                </td>
                <td>{material.categoryName || '-'}</td>
                <td>{material.currentStock}</td>
                <td>{material.unitOfMeasurement}</td>
                <td>₹{material.unitPrice?.toLocaleString()}</td>
                <td>₹{material.totalValue?.toLocaleString()}</td>
                <td>
                  <span className={`stock-badge ${material.stockStatus?.toLowerCase()}`}>
                    {getStockStatusText(material.stockStatus)}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="edit-btn" onClick={() => {
                      setEditingMaterial(material);
                      setMaterialFormData(material);
                      setIsMaterialModalOpen(true);
                    }}>
                      <Edit2 size={16} />
                    </button>
                    <button className="stock-btn" onClick={() => {
                      setStockFormData({ ...stockFormData, materialId: material.id });
                      setIsStockModalOpen(true);
                    }}>
                      <RefreshCw size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {materials.length === 0 && (
          <div className="empty-state">
            <Package size={48} />
            <p>No materials found. Add your first material!</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderQuotations = () => (
    <div className="clerk-module">
      <div className="module-header">
        <h2>Work Requests - Pending Quotations</h2>
      </div>

      <div className="requests-grid">
        {workRequests.map(request => (
          <div key={request.id} className="request-card">
            <div className="request-header">
              <h3>{request.title}</h3>
              <span className={`priority-badge ${request.priority?.toLowerCase()}`}>
                {request.priority}
              </span>
            </div>
            <p className="request-desc">{request.description}</p>
            <div className="request-meta">
              <span>Type: {request.type}</span>
              <span>Category: {request.category}</span>
            </div>
            {request.photoUrls && request.photoUrls.length > 0 && (
              <div className="request-photos">
                <small>Photos: {request.photoUrls.length} attached</small>
              </div>
            )}
            <button className="prepare-quote-btn" onClick={() => {
              setSelectedRequest(request);
              setIsQuotationModalOpen(true);
            }}>
              <FileText size={16} /> Prepare Quotation
            </button>
          </div>
        ))}
        {workRequests.length === 0 && (
          <div className="empty-state">
            <FileText size={48} />
            <p>No pending work requests. All caught up!</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderStockMovements = () => (
    <div className="clerk-module">
      <div className="module-header">
        <h2>Stock Movement History</h2>
        <button className="create-btn" onClick={() => setIsStockModalOpen(true)}>
          <RefreshCw size={18} /> Update Stock
        </button>
      </div>

      <div className="movements-table-container">
        <table className="movements-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Material</th>
              <th>Type</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Total</th>
              <th>Purpose</th>
              <th>Performed By</th>
            </tr>
          </thead>
          <tbody>
            {stockMovements.map(movement => (
              <tr key={movement.id}>
                <td>{new Date(movement.createdAt).toLocaleDateString()}</td>
                <td><strong>{movement.materialName}</strong></td>
                <td>
                  <span className={`movement-type ${movement.movementType === 'IN' ? 'in' : 'out'}`}>
                    {movement.movementType === 'IN' ? 'Stock In' : 'Stock Out'}
                  </span>
                </td>
                <td>{movement.quantity} {movement.unit}</td>
                <td>₹{movement.unitPrice?.toLocaleString()}</td>
                <td>₹{movement.totalCost?.toLocaleString()}</td>
                <td>{movement.purpose || '-'}</td>
                <td>{movement.performedBy}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {stockMovements.length === 0 && (
          <div className="empty-state">
            <TrendingUp size={48} />
            <p>No stock movements recorded yet</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderAlerts = () => (
    <div className="clerk-module">
      <div className="module-header">
        <h2>Low Stock Alerts</h2>
      </div>

      <div className="alerts-list">
        {lowStockAlerts.map(material => (
          <div key={material.id} className={`alert-card ${material.stockStatus?.toLowerCase()}`}>
            <div className="alert-icon">
              {material.currentStock <= 0 ? <AlertCircle size={24} /> : <AlertTriangle size={24} />}
            </div>
            <div className="alert-content">
              <h3>{material.name}</h3>
              <p>Current Stock: {material.currentStock} {material.unitOfMeasurement}</p>
              <p>Minimum Level: {material.minStockLevel} {material.unitOfMeasurement}</p>
              <p>Storage: {material.storageLocation || 'Not specified'}</p>
            </div>
            <button className="restock-btn" onClick={() => {
              setStockFormData({
                materialId: material.id,
                movementType: 'IN',
                quantity: material.minStockLevel * 2,
                purpose: 'Restocking',
                remarks: 'Auto restock due to low stock alert'
              });
              setIsStockModalOpen(true);
            }}>
              <RefreshCw size={16} /> Restock
            </button>
          </div>
        ))}
        {lowStockAlerts.length === 0 && (
          <div className="empty-state">
            <CheckCircle size={48} color="#10b981" />
            <p>No low stock alerts! All inventory levels are healthy.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderProfile = () => (
    <div className="clerk-module">
      <div className="module-header">
        <h2>My Profile</h2>
      </div>
      <div className="profile-card">
        <div className="profile-avatar">
          <User size={64} />
        </div>
        <div className="profile-info">
          <h3>{user?.name}</h3>
          <p>Role: Clerk</p>
          <p>Mobile: {user?.mobileNumber}</p>
          <p>Email: {user?.email || 'Not provided'}</p>
          <p>School ID: {user?.schoolId}</p>
        </div>
      </div>
    </div>
  );

  // Material Modal
  const renderMaterialModal = () => (
    <div className="modal-overlay">
      <div className="modal modal-lg">
        <div className="modal-header">
          <h2>{editingMaterial ? 'Edit Material' : 'Add New Material'}</h2>
          <button className="close-btn" onClick={() => setIsMaterialModalOpen(false)}><X size={24} /></button>
        </div>
        <form onSubmit={handleCreateMaterial}>
          <div className="form-grid">
            <div className="form-group full-width">
              <label>Material Name *</label>
              <input
                type="text"
                value={materialFormData.name}
                onChange={(e) => setMaterialFormData({...materialFormData, name: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select
                value={materialFormData.categoryId}
                onChange={(e) => setMaterialFormData({...materialFormData, categoryId: e.target.value})}
                required
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Unit of Measurement</label>
              <select
                value={materialFormData.unitOfMeasurement}
                onChange={(e) => setMaterialFormData({...materialFormData, unitOfMeasurement: e.target.value})}
              >
                <option value="pieces">Pieces</option>
                <option value="kg">Kilograms (kg)</option>
                <option value="bags">Bags</option>
                <option value="meters">Meters</option>
                <option value="liters">Liters</option>
                <option value="boxes">Boxes</option>
              </select>
            </div>
            <div className="form-group">
              <label>Minimum Stock Level</label>
              <input
                type="number"
                value={materialFormData.minStockLevel}
                onChange={(e) => setMaterialFormData({...materialFormData, minStockLevel: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Unit Price (₹)</label>
              <input
                type="number"
                step="0.01"
                value={materialFormData.unitPrice}
                onChange={(e) => setMaterialFormData({...materialFormData, unitPrice: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Storage Location</label>
              <input
                type="text"
                value={materialFormData.storageLocation}
                onChange={(e) => setMaterialFormData({...materialFormData, storageLocation: e.target.value})}
                placeholder="e.g., Store Room A, Shelf 2"
              />
            </div>
            <div className="form-group full-width">
              <label>Description</label>
              <textarea
                value={materialFormData.description}
                onChange={(e) => setMaterialFormData({...materialFormData, description: e.target.value})}
                rows="2"
              />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="cancel-btn" onClick={() => setIsMaterialModalOpen(false)}>Cancel</button>
            <button type="submit" className="save-btn" disabled={loading}>
              {loading ? 'Saving...' : (editingMaterial ? 'Update Material' : 'Save Material')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Stock Modal
  const renderStockModal = () => (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Update Stock</h2>
          <button className="close-btn" onClick={() => setIsStockModalOpen(false)}><X size={24} /></button>
        </div>
        <form onSubmit={handleUpdateStock}>
          <div className="form-group">
            <label>Material</label>
            <select
              value={stockFormData.materialId}
              onChange={(e) => setStockFormData({...stockFormData, materialId: e.target.value})}
              required
            >
              <option value="">Select Material</option>
              {materials.map(m => (
                <option key={m.id} value={m.id}>{m.name} (Current: {m.currentStock} {m.unitOfMeasurement})</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Movement Type</label>
            <select
              value={stockFormData.movementType}
              onChange={(e) => setStockFormData({...stockFormData, movementType: e.target.value})}
            >
              <option value="IN">Stock In (Add)</option>
              <option value="OUT">Stock Out (Remove)</option>
            </select>
          </div>
          <div className="form-group">
            <label>Quantity</label>
            <input
              type="number"
              step="0.01"
              value={stockFormData.quantity}
              onChange={(e) => setStockFormData({...stockFormData, quantity: e.target.value})}
              required
            />
          </div>
          {stockFormData.movementType === 'IN' && (
            <div className="form-group">
              <label>Unit Price (₹)</label>
              <input
                type="number"
                step="0.01"
                value={stockFormData.unitPrice}
                onChange={(e) => setStockFormData({...stockFormData, unitPrice: e.target.value})}
              />
            </div>
          )}
          <div className="form-group">
            <label>Purpose / Reason</label>
            <input
              type="text"
              value={stockFormData.purpose}
              onChange={(e) => setStockFormData({...stockFormData, purpose: e.target.value})}
              placeholder={stockFormData.movementType === 'IN' ? 'e.g., New purchase, Donation' : 'e.g., Used for work #123'}
            />
          </div>
          <div className="form-group">
            <label>Remarks (Optional)</label>
            <textarea
              value={stockFormData.remarks}
              onChange={(e) => setStockFormData({...stockFormData, remarks: e.target.value})}
              rows="2"
            />
          </div>
          <div className="modal-footer">
            <button type="button" className="cancel-btn" onClick={() => setIsStockModalOpen(false)}>Cancel</button>
            <button type="submit" className="save-btn" disabled={loading}>
              {loading ? 'Updating...' : 'Update Stock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  // Quotation Modal
  const renderQuotationModal = () => (
    <div className="modal-overlay">
        <div className="modal modal-lg">
            <div className="modal-header">
                <h2>Prepare Quotation</h2>
                <button className="close-btn" onClick={() => setIsQuotationModalOpen(false)}>
                    <X size={24} />
                </button>
            </div>
            <form onSubmit={handleSubmitQuotation}>
                <div className="form-section">
                    <h3>Work Request Details</h3>
                    <div className="info-box">
                        <p><strong>Title:</strong> {selectedRequest?.title}</p>
                        <p><strong>Description:</strong> {selectedRequest?.description}</p>
                        <p><strong>Priority:</strong> {selectedRequest?.priority}</p>
                        <p><strong>Type:</strong> {selectedRequest?.type}</p>
                        <p><strong>Category:</strong> {selectedRequest?.category}</p>
                    </div>
                </div>

                <div className="form-section">
                    <h3>Cost Estimation</h3>
                    <div className="form-grid">
                        <div className="form-group full-width">
                            <label>Material Details & Cost *</label>
                            <textarea
                                value={quotationFormData.materialDetails}
                                onChange={(e) => setQuotationFormData({
                                    ...quotationFormData, 
                                    materialDetails: e.target.value
                                })}
                                placeholder="List materials needed and their costs..."
                                rows="3"
                                required
                            />
                            <input
                                type="number"
                                step="0.01"
                                placeholder="Total Material Cost (₹)"
                                value={quotationFormData.materialCost}
                                onChange={(e) => setQuotationFormData({
                                    ...quotationFormData, 
                                    materialCost: e.target.value
                                })}
                                style={{ marginTop: '0.5rem' }}
                                required
                            />
                        </div>
                        <div className="form-group full-width">
                            <label>Labor Details & Cost</label>
                            <textarea
                                value={quotationFormData.laborDetails}
                                onChange={(e) => setQuotationFormData({
                                    ...quotationFormData, 
                                    laborDetails: e.target.value
                                })}
                                placeholder="Labor requirements and costs..."
                                rows="2"
                            />
                            <input
                                type="number"
                                step="0.01"
                                placeholder="Total Labor Cost (₹)"
                                value={quotationFormData.laborCost}
                                onChange={(e) => setQuotationFormData({
                                    ...quotationFormData, 
                                    laborCost: e.target.value
                                })}
                                style={{ marginTop: '0.5rem' }}
                            />
                        </div>
                        <div className="form-group full-width">
                            <label>Additional Costs</label>
                            <textarea
                                value={quotationFormData.additionalDetails}
                                onChange={(e) => setQuotationFormData({
                                    ...quotationFormData, 
                                    additionalDetails: e.target.value
                                })}
                                placeholder="Equipment rental, transportation, etc..."
                                rows="2"
                            />
                            <input
                                type="number"
                                step="0.01"
                                placeholder="Total Additional Cost (₹)"
                                value={quotationFormData.additionalCosts}
                                onChange={(e) => setQuotationFormData({
                                    ...quotationFormData, 
                                    additionalCosts: e.target.value
                                })}
                                style={{ marginTop: '0.5rem' }}
                            />
                        </div>
                        <div className="form-group">
                            <label>Valid Until</label>
                            <input
                                type="date"
                                value={quotationFormData.validUntil}
                                onChange={(e) => setQuotationFormData({
                                    ...quotationFormData, 
                                    validUntil: e.target.value
                                })}
                            />
                        </div>
                    </div>
                </div>

                <div className="total-amount">
                    <strong>Grand Total:</strong> 
                    ₹{(Number(quotationFormData.materialCost) + 
                       Number(quotationFormData.laborCost) + 
                       Number(quotationFormData.additionalCosts)).toLocaleString()}
                </div>

                <div className="modal-footer">
                    <button type="button" className="cancel-btn" onClick={() => setIsQuotationModalOpen(false)}>
                        Cancel
                    </button>
                    <button type="submit" className="save-btn" disabled={loading}>
                        {loading ? 'Submitting...' : 'Submit Quotation'}
                    </button>
                </div>
            </form>
        </div>
    </div>
);
  return (
    <div className="clerk-container">
      {/* Sidebar */}
      <div className={`sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
        <div className="sidebar-header">
          <h2>{sidebarCollapsed ? 'CL' : 'Clerk'}</h2>
          <button className="collapse-btn" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
            <Menu size={20} />
          </button>
        </div>
        <nav className="sidebar-nav">
          {menuItems.map(item => (
            <button
              key={item.id}
              className={`nav-item ${activeModule === item.id ? 'active' : ''}`}
              onClick={() => setActiveModule(item.id)}
            >
              <item.icon size={20} />
              {!sidebarCollapsed && <span>{item.label}</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="logout-btn" onClick={logout}>
            <LogOut size={20} />
            {!sidebarCollapsed && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`main-content ${sidebarCollapsed ? 'expanded' : ''}`}>
        <div className="top-bar">
          <div className="welcome-section">
            <h1>{menuItems.find(m => m.id === activeModule)?.label}</h1>
            <p>Welcome back, {user?.name}</p>
          </div>
          <div className="user-info">
            <div className="notification-bell">
              <Bell size={20} />
              <span className="badge">{stats.pendingQuotations}</span>
            </div>
            <div className="user-name">
              <User size={20} />
              <span>{user?.name?.split(' ')[0]}</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="alert error">
            <AlertTriangle size={18} />
            <span>{error}</span>
            <button onClick={() => setError('')}><X size={16} /></button>
          </div>
        )}
        {success && (
          <div className="alert success">
            <CheckCircle size={18} />
            <span>{success}</span>
            <button onClick={() => setSuccess('')}><X size={16} /></button>
          </div>
        )}

        {activeModule === 'dashboard' && renderDashboard()}
        {activeModule === 'inventory' && renderInventory()}
        {activeModule === 'quotations' && renderQuotations()}
        {activeModule === 'stock-movements' && renderStockMovements()}
        {activeModule === 'alerts' && renderAlerts()}
        {activeModule === 'profile' && renderProfile()}
      </div>

      {/* Modals */}
      {isMaterialModalOpen && renderMaterialModal()}
      {isStockModalOpen && renderStockModal()}
      {isQuotationModalOpen && renderQuotationModal()}

      <style>{`
        .clerk-container {
          display: flex;
          min-height: 100vh;
          background-color: #f8fafc;
        }

        /* Sidebar Styles - Same as Headmaster */
        .sidebar {
          width: 260px;
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          color: white;
          display: flex;
          flex-direction: column;
          position: fixed;
          height: 100vh;
          transition: width 0.3s ease;
          z-index: 100;
        }
        .sidebar.collapsed { width: 70px; }
        .sidebar-header { padding: 1.5rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #334155; }
        .sidebar-header h2 { margin: 0; font-size: 1.25rem; color: #38bdf8; }
        .collapse-btn { background: none; border: none; color: #94a3b8; cursor: pointer; }
        .sidebar-nav { flex: 1; padding: 1rem 0; display: flex; flex-direction: column; gap: 0.25rem; }
        .nav-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1.5rem; background: none; border: none; color: #cbd5e1; cursor: pointer; transition: all 0.2s; width: 100%; text-align: left; font-size: 0.95rem; }
        .nav-item:hover { background-color: #334155; color: white; }
        .nav-item.active { background-color: #0ea5e9; color: white; }
        .sidebar-footer { padding: 1rem; border-top: 1px solid #334155; }
        .logout-btn { display: flex; align-items: center; gap: 0.75rem; width: 100%; padding: 0.75rem; background: none; border: none; color: #cbd5e1; cursor: pointer; }
        .logout-btn:hover { color: #ef4444; }

        /* Main Content */
        .main-content { flex: 1; margin-left: 260px; padding: 1.5rem; transition: margin-left 0.3s ease; }
        .main-content.expanded { margin-left: 70px; }
        .top-bar { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; padding-bottom: 1rem; border-bottom: 1px solid #e2e8f0; }
        .welcome-section h1 { margin: 0; font-size: 1.5rem; color: #1e293b; }
        .welcome-section p { margin: 0.25rem 0 0; color: #64748b; font-size: 0.875rem; }
        .user-info { display: flex; align-items: center; gap: 1.5rem; }
        .notification-bell { position: relative; cursor: pointer; }
        .notification-bell .badge { position: absolute; top: -8px; right: -8px; background-color: #ef4444; color: white; font-size: 0.7rem; padding: 2px 5px; border-radius: 10px; }
        .user-name { display: flex; align-items: center; gap: 0.5rem; color: #334155; }

        /* Stats Grid */
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
        .stat-card { background: white; padding: 1rem; border-radius: 0.75rem; display: flex; align-items: center; gap: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .stat-icon { width: 48px; height: 48px; border-radius: 0.5rem; display: flex; align-items: center; justify-content: center; }
        .stat-info h3 { margin: 0; font-size: 1.5rem; font-weight: 700; }
        .stat-info p { margin: 0; color: #64748b; font-size: 0.8rem; }

        /* Quick Actions */
        .quick-actions { background: white; padding: 1.5rem; border-radius: 0.75rem; margin-bottom: 2rem; }
        .quick-actions h3 { margin: 0 0 1rem 0; }
        .actions-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; }
        .action-btn { display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem; background-color: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 0.5rem; cursor: pointer; transition: all 0.2s; }
        .action-btn:hover { background-color: #0ea5e9; color: white; }

        /* Movements List */
        .recent-activities { background: white; padding: 1.5rem; border-radius: 0.75rem; }
        .recent-activities h3 { margin: 0 0 1rem 0; }
        .movements-list { display: flex; flex-direction: column; gap: 0.75rem; }
        .movement-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem; border-bottom: 1px solid #f1f5f9; }
        .movement-icon { width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; }
        .movement-icon.in { background-color: #dcfce7; color: #16a34a; }
        .movement-icon.out { background-color: #fee2e2; color: #dc2626; }
        .movement-details { flex: 1; }
        .movement-details strong { display: block; font-size: 0.875rem; }
        .movement-details span { font-size: 0.75rem; color: #475569; }
        .movement-details small { font-size: 0.7rem; color: #94a3b8; }
        .movement-amount { font-weight: 600; color: #0ea5e9; }

        /* Tables */
        .materials-table-container, .movements-table-container { background: white; border-radius: 0.75rem; overflow-x: auto; }
        table { width: 100%; border-collapse: collapse; }
        th { background-color: #f1f5f9; padding: 1rem; text-align: left; font-weight: 600; color: #475569; }
        td { padding: 1rem; border-top: 1px solid #f1f5f9; }
        .stock-badge { display: inline-block; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; }
        .stock-badge.low_stock { background-color: #fef3c7; color: #d97706; }
        .stock-badge.out_of_stock { background-color: #fee2e2; color: #dc2626; }
        .stock-badge.normal { background-color: #dcfce7; color: #16a34a; }
        .movement-type { display: inline-block; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; }
        .movement-type.in { background-color: #dcfce7; color: #16a34a; }
        .movement-type.out { background-color: #fee2e2; color: #dc2626; }

        /* Requests Grid */
        .requests-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 1.5rem; }
        .request-card { background: #f8fafc; padding: 1rem; border-radius: 0.75rem; border: 1px solid #e2e8f0; }
        .request-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
        .request-header h3 { margin: 0; font-size: 1rem; }
        .priority-badge { padding: 0.2rem 0.6rem; border-radius: 9999px; font-size: 0.7rem; font-weight: 600; }
        .priority-badge.urgent, .priority-badge.high { background-color: #fee2e2; color: #dc2626; }
        .priority-badge.medium { background-color: #fef3c7; color: #d97706; }
        .priority-badge.low { background-color: #dcfce7; color: #16a34a; }
        .request-desc { color: #475569; font-size: 0.875rem; margin-bottom: 0.5rem; }
        .request-meta { display: flex; gap: 1rem; font-size: 0.75rem; color: #64748b; margin-bottom: 0.75rem; }
        .prepare-quote-btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.5rem; background-color: #0ea5e9; color: white; border: none; border-radius: 0.5rem; cursor: pointer; }

        /* Alerts */
        .alerts-list { display: flex; flex-direction: column; gap: 1rem; }
        .alert-card { display: flex; align-items: center; gap: 1rem; padding: 1rem; border-radius: 0.75rem; border-left: 4px solid; }
        .alert-card.low_stock { background-color: #fef3c7; border-left-color: #f59e0b; }
        .alert-card.out_of_stock { background-color: #fee2e2; border-left-color: #ef4444; }
        .alert-icon { width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; }
        .alert-content { flex: 1; }
        .alert-content h3 { margin: 0 0 0.25rem 0; font-size: 1rem; }
        .alert-content p { margin: 0; font-size: 0.875rem; color: #475569; }
        .restock-btn { display: flex; align-items: center; gap: 0.5rem; padding: 0.5rem 1rem; background-color: #0ea5e9; color: white; border: none; border-radius: 0.5rem; cursor: pointer; }

        /* Profile */
        .profile-card { background: #f8fafc; padding: 2rem; border-radius: 0.75rem; text-align: center; }
        .profile-avatar { width: 100px; height: 100px; background-color: #e2e8f0; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1rem; color: #64748b; }
        .profile-info h3 { margin: 0 0 0.5rem 0; }
        .profile-info p { margin: 0.25rem 0; color: #475569; }

        /* Form Sections */
        .form-section { margin-bottom: 1.5rem; }
        .form-section h3 { margin: 0 0 0.75rem 0; font-size: 1rem; color: #334155; }
        .info-box { background-color: #f1f5f9; padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem; }
        .info-box p { margin: 0.25rem 0; }
        .total-amount { text-align: right; padding: 1rem; background-color: #f1f5f9; border-radius: 0.5rem; margin: 1rem 0; font-size: 1.125rem; }

        /* Empty State */
        .empty-state { text-align: center; padding: 3rem; color: #94a3b8; }
        .empty-state svg { margin-bottom: 1rem; opacity: 0.5; }
        .no-data { text-align: center; padding: 2rem; color: #94a3b8; }

        /* Modals */
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
        .modal { background: white; border-radius: 0.75rem; width: 100%; max-width: 600px; max-height: 90vh; overflow-y: auto; padding: 2rem; }
        .modal-lg { max-width: 800px; }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .close-btn { background: none; border: none; cursor: pointer; color: #64748b; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
        .form-group.full-width { grid-column: span 2; }
        .form-group label { font-weight: 600; color: #334155; font-size: 0.875rem; }
        .form-group input, .form-group select, .form-group textarea { padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 0.9rem; }
        .modal-footer { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem; }
        .cancel-btn { padding: 0.75rem 1.5rem; border: 1px solid #d1d5db; border-radius: 0.5rem; background: white; cursor: pointer; }
        .save-btn { padding: 0.75rem 1.5rem; border: none; border-radius: 0.5rem; background: #0ea5e9; color: white; cursor: pointer; font-weight: 600; }
        .save-btn:disabled { background-color: #93c5fd; cursor: not-allowed; }

        /* Alerts */
        .alert { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; border-radius: 0.5rem; margin-bottom: 1rem; }
        .alert.error { background-color: #fee2e2; color: #dc2626; }
        .alert.success { background-color: #dcfce7; color: #16a34a; }
        .alert button { background: none; border: none; margin-left: auto; cursor: pointer; color: inherit; }
      `}</style>
    </div>
  );
};

export default ClerkDashboard;