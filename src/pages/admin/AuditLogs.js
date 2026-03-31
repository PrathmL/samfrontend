import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ClipboardList, Search, Filter, 
  Calendar, User, Tag, ArrowUpDown,
  Download, RefreshCw, FileText
} from 'lucide-react';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearcherTerm] = useState('');
  const [filterAction, setFilterAction] = useState('ALL');
  const [filterRole, setFilterRole] = useState('ALL');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:8080/api/admin/audit-logs');
      setLogs(res.data);
    } catch (err) {
      console.error('Error fetching audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const headers = ['ID', 'Timestamp', 'Action', 'Performed By', 'Role', 'Details'];
    const csvData = filteredLogs.map(log => [
      log.id,
      new Date(log.createdAt).toLocaleString(),
      log.action,
      log.performedByName || 'System',
      log.performedByRole || '-',
      `"${log.details}"`
    ]);

    const csvContent = [headers, ...csvData].map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.performedByName && log.performedByName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesAction = filterAction === 'ALL' || log.action === filterAction;
    const matchesRole = filterRole === 'ALL' || log.performedByRole === filterRole;

    return matchesSearch && matchesAction && matchesRole;
  });

  const uniqueActions = ['ALL', ...new Set(logs.map(l => l.action))];
  const uniqueRoles = ['ALL', 'ADMIN', 'SACHIV', 'HEADMASTER', 'CLERK'];

  return (
    <div className="audit-container">
      <div className="audit-header">
        <div className="header-title">
          <h1>System Audit Logs</h1>
          <p>Track all administrative and system activities</p>
        </div>
        <div className="header-actions">
          <button className="refresh-btn" onClick={fetchLogs} title="Refresh Logs">
            <RefreshCw size={20} className={loading ? 'spinning' : ''} />
          </button>
          <button className="export-btn" onClick={handleExport}>
            <Download size={20} />
            Export CSV
          </button>
        </div>
      </div>

      <div className="audit-filters">
        <div className="search-box">
          <Search size={20} />
          <input 
            type="text" 
            placeholder="Search by action, user, or details..." 
            value={searchTerm}
            onChange={(e) => setSearcherTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-group">
          <div className="filter-item">
            <label><Tag size={16} /> Action</label>
            <select value={filterAction} onChange={(e) => setFilterAction(e.target.value)}>
              {uniqueActions.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div className="filter-item">
            <label><User size={16} /> Role</label>
            <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
              {uniqueRoles.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="audit-table-container">
        {loading ? (
          <div className="loading-state">
            <RefreshCw className="spinning" size={48} />
            <p>Loading system logs...</p>
          </div>
        ) : (
          <table className="audit-table">
            <thead>
              <tr>
                <th>Timestamp <ArrowUpDown size={14} /></th>
                <th>Action</th>
                <th>Performed By</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map(log => (
                <tr key={log.id}>
                  <td className="timestamp">
                    <Calendar size={14} />
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td>
                    <span className={`action-badge ${log.action.toLowerCase()}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="user-cell">
                    <div className="user-icon">
                      {log.performedByRole === 'ADMIN' ? 'A' : 
                       log.performedByRole === 'SACHIV' ? 'S' : 
                       log.performedByRole === 'HEADMASTER' ? 'H' : 'C'}
                    </div>
                    <div className="user-info">
                      <strong>{log.performedByName || 'System'}</strong>
                      <span>{log.performedByRole || 'SYSTEM'}</span>
                    </div>
                  </td>
                  <td className="details-cell">
                    {log.details}
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan="4" className="no-logs">
                    No audit logs found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      <style>{`
        .audit-container { padding: 0; }
        .audit-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
        .header-title h1 { margin: 0; font-size: 1.875rem; color: #1e293b; }
        .header-title p { color: #64748b; margin: 0.5rem 0 0; }
        .header-actions { display: flex; gap: 1rem; }

        .refresh-btn { padding: 0.75rem; background: white; border: 1px solid #e2e8f0; border-radius: 0.5rem; color: #64748b; cursor: pointer; transition: all 0.2s; }
        .refresh-btn:hover { background: #f8fafc; color: #1e293b; }
        .export-btn { display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem; background: #0ea5e9; color: white; border: none; border-radius: 0.5rem; font-weight: 600; cursor: pointer; }
        .export-btn:hover { background: #0284c7; }

        .audit-filters { display: flex; flex-wrap: wrap; gap: 2rem; background: white; padding: 1.5rem; border-radius: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; margin-bottom: 2rem; }
        .search-box { flex: 1; min-width: 300px; display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0.5rem; }
        .search-box input { background: none; border: none; outline: none; width: 100%; font-size: 0.95rem; }
        .filter-group { display: flex; gap: 1.5rem; }
        .filter-item { display: flex; flex-direction: column; gap: 0.4rem; }
        .filter-item label { display: flex; align-items: center; gap: 0.4rem; font-size: 0.8rem; font-weight: 600; color: #64748b; text-transform: uppercase; }
        .filter-item select { padding: 0.5rem 1rem; border: 1px solid #e2e8f0; border-radius: 0.4rem; background: #f8fafc; outline: none; min-width: 150px; }

        .audit-table-container { background: white; border-radius: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; overflow: hidden; }
        .audit-table { width: 100%; border-collapse: collapse; text-align: left; }
        .audit-table th { background: #f8fafc; padding: 1rem 1.5rem; font-weight: 600; color: #475569; border-bottom: 1px solid #e2e8f0; }
        .audit-table td { padding: 1.25rem 1.5rem; border-bottom: 1px solid #f1f5f9; font-size: 0.95rem; color: #1e293b; }
        
        .timestamp { color: #64748b; font-size: 0.85rem; display: flex; align-items: center; gap: 0.5rem; min-width: 180px; }
        .action-badge { padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }
        
        .action-badge.login { background: #e0f2fe; color: #0ea5e9; }
        .action-badge.user_creation { background: #dcfce7; color: #16a34a; }
        .action-badge.work_approval { background: #fef3c7; color: #d97706; }
        .action-badge.work_activation { background: #f0f9ff; color: #0369a1; }
        .action-badge.work_delete { background: #fee2e2; color: #dc2626; }
        
        .user-cell { display: flex; align-items: center; gap: 0.75rem; }
        .user-icon { width: 32px; height: 32px; border-radius: 50%; background: #f1f5f9; color: #64748b; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.8rem; border: 1px solid #e2e8f0; }
        .user-info { display: flex; flex-direction: column; }
        .user-info strong { font-size: 0.9rem; }
        .user-info span { font-size: 0.75rem; color: #64748b; }
        
        .details-cell { line-height: 1.5; color: #475569; max-width: 400px; }

        .spinning { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        .loading-state, .no-logs { padding: 4rem; text-align: center; color: #94a3b8; }
        .loading-state p { margin-top: 1rem; }
      `}</style>
    </div>
  );
};

export default AuditLogs;
