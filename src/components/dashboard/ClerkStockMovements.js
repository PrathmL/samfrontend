import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { TrendingUp, Plus, Minus, Search, Calendar } from 'lucide-react';

const ClerkStockMovements = () => {
  const { user } = useAuth();
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.schoolId) {
      fetchMovements();
    }
  }, [user?.schoolId]);

  const fetchMovements = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:8080/api/inventory/stock/movements/${user.schoolId}`);
      setMovements(res.data || []);
    } catch (err) {
      console.error('Error fetching movements:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="movements-container">
      <div className="module-header">
        <h1>Stock Movement History</h1>
        <p>Complete audit trail of inventory additions and usage</p>
      </div>

      <div className="movements-table-container">
        <table className="movements-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Material</th>
              <th>Type</th>
              <th>Quantity</th>
              <th>Total Cost</th>
              <th>Purpose</th>
              <th>Clerk</th>
            </tr>
          </thead>
          <tbody>
            {movements.map(m => (
              <tr key={m.id}>
                <td className="date-cell"><Calendar size={14} /> {new Date(m.createdAt).toLocaleDateString()}</td>
                <td><strong>{m.materialName}</strong></td>
                <td>
                  <span className={`type-badge ${m.movementType?.toLowerCase()}`}>
                    {m.movementType === 'IN' ? <Plus size={12} /> : <Minus size={12} />}
                    {m.movementType}
                  </span>
                </td>
                <td>{m.quantity} {m.unit}</td>
                <td>₹{m.totalCost?.toLocaleString()}</td>
                <td>{m.purpose}</td>
                <td>{m.performedBy}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {movements.length === 0 && !loading && (
          <div className="empty-state">
            <TrendingUp size={48} />
            <p>No stock movements recorded yet.</p>
          </div>
        )}
      </div>

      <style>{`
        .movements-container { padding: 0; }
        .movements-table-container { background: white; border-radius: 1rem; border: 1px solid #e2e8f0; overflow: hidden; margin-top: 2rem; }
        .movements-table { width: 100%; border-collapse: collapse; }
        .movements-table th { background: #f8fafc; padding: 1rem; text-align: left; color: #475569; }
        .movements-table td { padding: 1rem; border-top: 1px solid #f1f5f9; }
        .date-cell { display: flex; align-items: center; gap: 0.5rem; color: #64748b; font-size: 0.85rem; }
        .type-badge { display: inline-flex; align-items: center; gap: 0.25rem; padding: 0.25rem 0.6rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 700; }
        .type-badge.in { background: #dcfce7; color: #16a34a; }
        .type-badge.out { background: #fee2e2; color: #dc2626; }
        .empty-state { text-align: center; padding: 4rem; color: #94a3b8; }
      `}</style>
    </div>
  );
};

export default ClerkStockMovements;
