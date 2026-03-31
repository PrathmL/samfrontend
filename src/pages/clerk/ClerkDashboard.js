import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { 
  Package, AlertTriangle, TrendingUp,
  RefreshCw, DollarSign, BarChart3
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line
} from 'recharts';

const ClerkDashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    totalMaterials: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    totalInventoryValue: 0,
    pendingQuotations: 0,
    monthlyConsumption: 0
  });
  const [inventoryData, setInventoryData] = useState([]);
  const [movementsData, setMovementsData] = useState([]);

  useEffect(() => {
    if (user?.schoolId) {
      fetchDashboardData();
      fetchInventory();
      fetchMovements();
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

  const fetchInventory = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/inventory/school/${user.schoolId}`);
      setInventoryData(res.data || []);
    } catch (err) {
      console.error('Error fetching inventory:', err);
    }
  };

  const fetchMovements = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/inventory/stock/movements/${user.schoolId}`);
      setMovementsData(res.data || []);
    } catch (err) {
      console.error('Error fetching movements:', err);
    }
  };

  const stockStatusData = useMemo(() => {
    const low = stats.lowStockItems;
    const out = stats.outOfStockItems;
    const healthy = stats.totalMaterials - low - out;

    return [
      { name: 'Healthy', value: healthy > 0 ? healthy : 0, color: '#10b981' },
      { name: 'Low Stock', value: low, color: '#f59e0b' },
      { name: 'Out of Stock', value: out, color: '#ef4444' }
    ];
  }, [stats]);

  const topItemsData = useMemo(() => {
    return inventoryData
      .sort((a, b) => (b.currentStock || 0) - (a.currentStock || 0))
      .slice(0, 5)
      .map(item => ({
        name: item.name.substring(0, 12),
        stock: item.currentStock || 0,
        unit: item.unitOfMeasurement
      }));
  }, [inventoryData]);

  const consumptionTrendData = useMemo(() => {
    // Group OUT movements by date (last 7 days)
    const last7Days = [...Array(7)].map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      return d.toISOString().split('T')[0];
    }).reverse();

    const dailyData = last7Days.reduce((acc, date) => {
      acc[date] = 0;
      return acc;
    }, {});

    movementsData.forEach(m => {
      if (m.movementType === 'OUT') {
        const date = new Date(m.createdAt).toISOString().split('T')[0];
        if (dailyData[date] !== undefined) {
          dailyData[date] += m.quantity || 0;
        }
      }
    });

    return last7Days.map(date => ({
      date: new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      quantity: dailyData[date]
    }));
  }, [movementsData]);

  const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="clerk-dashboard">
      <div className="welcome-section">
        <h1>{t('dash_inventory_dashboard')}</h1>
        <p>{t('dash_welcome')}, {user?.name}</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card" style={{ borderLeft: '4px solid #0ea5e9' }}>
          <div className="stat-icon" style={{ backgroundColor: '#e0f2fe', color: '#0284c7' }}>
            <Package size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats.totalMaterials}</h3>
            <p>{t('dash_total_materials')}</p>
          </div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid #f59e0b' }}>
          <div className="stat-icon" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
            <AlertTriangle size={24} />
          </div>
          <div className="stat-info">
            <h3>{stats.lowStockItems}</h3>
            <p>{t('dash_low_stock_items')}</p>
          </div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid #10b981' }}>
          <div className="stat-icon" style={{ backgroundColor: '#dcfce7', color: '#16a34a' }}>
            <DollarSign size={24} />
          </div>
          <div className="stat-info">
            <h3>₹{stats.totalInventoryValue?.toLocaleString()}</h3>
            <p>{t('dash_inventory_value')}</p>
          </div>
        </div>
        <div className="stat-card" style={{ borderLeft: '4px solid #6366f1' }}>
          <div className="stat-icon" style={{ backgroundColor: '#e0e7ff', color: '#6366f1' }}>
            <RefreshCw size={24} />
          </div>
          <div className="stat-info">
            <h3>₹{stats.monthlyConsumption?.toLocaleString()}</h3>
            <p>Monthly Consumption</p>
          </div>
        </div>
      </div>

      <div className="charts-grid-clerk">
        <div className="chart-card-clerk">
          <h3>Stock Health Status</h3>
          <div className="chart-container-clerk">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={stockStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stockStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="chart-card-clerk">
          <h3>Top Inventory Items</h3>
          <div className="chart-container-clerk">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={topItemsData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" fontSize={10} width={80} />
                <Tooltip />
                <Bar dataKey="stock" name="Current Stock" fill="#0ea5e9" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="chart-card-clerk full-width">
          <h3>7-Day Consumption Trend (Outward)</h3>
          <div className="chart-container-clerk" style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={consumptionTrendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="quantity" 
                  name="Consumption Qty" 
                  stroke="#6366f1" 
                  strokeWidth={3}
                  dot={{ r: 6 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <style>{`
        .clerk-dashboard { padding: 0; }
        .welcome-section { margin-bottom: 2rem; }
        .welcome-section h1 { margin: 0; font-size: 1.875rem; color: #1e293b; }
        .welcome-section p { color: #64748b; margin: 0.5rem 0 0; }
        
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1.5rem; margin-bottom: 2.5rem; }
        .stat-card { background: white; padding: 1.5rem; border-radius: 1rem; display: flex; align-items: center; gap: 1.25rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .stat-icon { width: 48px; height: 48px; border-radius: 0.75rem; display: flex; align-items: center; justify-content: center; }
        .stat-info h3 { margin: 0; font-size: 1.5rem; font-weight: 700; color: #1e293b; }
        .stat-info p { margin: 0; color: #64748b; font-size: 0.8rem; font-weight: 600; text-transform: uppercase; }

        .charts-grid-clerk { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 1.5rem; }
        .chart-card-clerk { background: white; padding: 1.5rem; border-radius: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; }
        .chart-card-clerk.full-width { grid-column: 1 / -1; }
        .chart-card-clerk h3 { margin: 0 0 1.5rem 0; font-size: 1.1rem; color: #1e293b; }
        .chart-container-clerk { width: 100%; height: 250px; }
      `}</style>
    </div>
  );
};

export default ClerkDashboard;
