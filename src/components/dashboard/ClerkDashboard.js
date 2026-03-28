import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { 
  Package, AlertTriangle, TrendingUp,
  RefreshCw, DollarSign
} from 'lucide-react';

const ClerkDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalMaterials: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    totalInventoryValue: 0,
    pendingQuotations: 0,
    monthlyConsumption: 0
  });

  useEffect(() => {
    if (user?.schoolId) {
      fetchDashboardData();
    }
  }, [user?.schoolId]);

  const fetchDashboardData = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/inventory/stats/${user.schoolId}`);
      if (res.data) setStats(res.data);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    }
  };

  return (
    <div className="clerk-dashboard">
      <div className="welcome-section">
        <h1>Inventory Dashboard</h1>
        <p>Welcome back, {user?.name}</p>
      </div>

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
          <div className="stat-icon" style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>
            <DollarSign size={24} />
          </div>
          <div className="stat-info">
            <h3>₹{stats.totalInventoryValue?.toLocaleString()}</h3>
            <p>Inventory Value</p>
          </div>
        </div>
      </div>

      <style>{`
        .welcome-section { margin-bottom: 2rem; }
        .welcome-section h1 { margin: 0; font-size: 1.875rem; color: #1e293b; }
        .welcome-section p { color: #64748b; margin: 0.5rem 0 0; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
        .stat-card { background: white; padding: 1.5rem; border-radius: 0.75rem; display: flex; align-items: center; gap: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .stat-icon { width: 48px; height: 48px; border-radius: 0.5rem; display: flex; align-items: center; justify-content: center; }
        .stat-info h3 { margin: 0; font-size: 1.5rem; font-weight: 700; }
        .stat-info p { margin: 0; color: #64748b; font-size: 0.8rem; }
      `}</style>
    </div>
  );
};

export default ClerkDashboard;
