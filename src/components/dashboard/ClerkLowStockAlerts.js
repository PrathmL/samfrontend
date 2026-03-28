import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { AlertTriangle, RefreshCw, CheckCircle, Package } from 'lucide-react';

const ClerkLowStockAlerts = () => {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.schoolId) {
      fetchAlerts();
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

  return (
    <div className="alerts-container">
      <div className="module-header">
        <h1>Low Stock Alerts</h1>
        <p>Materials that have fallen below the required minimum threshold</p>
      </div>

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
              <button className="restock-btn-action">
                <RefreshCw size={16} /> Mark for Restock
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
      `}</style>
    </div>
  );
};

export default ClerkLowStockAlerts;
