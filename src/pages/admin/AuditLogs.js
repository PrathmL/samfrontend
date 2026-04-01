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
    <div className="admin-page-container">
      <div className="dashboard-header">
        <div className="header-text">
          <h1>System Audit Logs</h1>
          <p>Track all administrative and system activities</p>
        </div>
        <div className="header-actions">
          <button className="btn-icon primary-ghost" onClick={fetchLogs} title="Refresh Logs">
            <RefreshCw size={20} className={loading ? 'spinning' : ''} />
          </button>
          <button className="btn-icon-text primary" onClick={handleExport}>
            <Download size={18} />
            Export CSV
          </button>
        </div>
      </div>

      <div className="section-card filter-card">
        <div className="filter-content">
          <div className="search-box">
            <Search size={18} />
            <input 
              type="text" 
              placeholder="Search by action, user, or details..." 
              value={searchTerm}
              onChange={(e) => setSearcherTerm(e.target.value)}
            />
          </div>
          
          <div className="filter-group">
            <div className="select-wrapper">
              <Tag size={16} />
              <select value={filterAction} onChange={(e) => setFilterAction(e.target.value)}>
                <option value="ALL">All Actions</option>
                {uniqueActions.filter(a => a !== 'ALL').map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
            <div className="select-wrapper">
              <User size={16} />
              <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
                <option value="ALL">All Roles</option>
                {uniqueRoles.filter(r => r !== 'ALL').map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="section-card table-card">
        {loading ? (
          <div className="loading-state">
            <RefreshCw className="spinning text-slate-300" size={48} />
            <p>Loading system logs...</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Timestamp <ArrowUpDown size={12} className="ml-1" /></th>
                  <th>Action</th>
                  <th>Performed By</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map(log => (
                  <tr key={log.id}>
                    <td className="timestamp-cell">
                      <div className="date-time">
                        <Calendar size={14} className="text-slate-400" />
                        <span className="date">{new Date(log.createdAt).toLocaleDateString('en-IN')}</span>
                        <span className="time text-slate-400">{new Date(log.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`action-badge-v2 ${log.action.toLowerCase()}`}>
                        {log.action.replace('_', ' ')}
                      </span>
                    </td>
                    <td>
                      <div className="user-profile-cell">
                        <div className={`role-avatar ${log.performedByRole?.toLowerCase() || 'system'}`}>
                          {log.performedByRole ? log.performedByRole.charAt(0) : 'S'}
                        </div>
                        <div className="user-info">
                          <span className="user-name">{log.performedByName || 'System'}</span>
                          <span className="user-role">{log.performedByRole || 'SYSTEM'}</span>
                        </div>
                      </div>
                    </td>
                    <td className="details-cell">
                      <div className="details-text" title={log.details}>
                        {log.details}
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredLogs.length === 0 && (
                  <tr>
                    <td colSpan="4" className="empty-state-row">
                      <ClipboardList size={48} className="text-slate-200" />
                      <p>No audit logs found matching your criteria.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        .admin-page-container { display: flex; flex-direction: column; gap: 1.5rem; color: #1e293b; }

        .dashboard-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 0.5rem; }
        .header-text h1 { font-size: 1.75rem; font-weight: 800; margin: 0; letter-spacing: -0.02em; }
        .header-text p { color: #64748b; margin: 0.25rem 0 0; font-size: 1rem; }
        .header-actions { display: flex; gap: 0.75rem; }

        /* Buttons */
        .btn-icon { padding: 0.75rem; background: white; border: 1px solid #e2e8f0; border-radius: 0.75rem; color: #64748b; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; }
        .btn-icon:hover { background: #f8fafc; color: #1e293b; border-color: #cbd5e1; }
        
        .btn-icon-text { display: flex; align-items: center; gap: 0.6rem; padding: 0.75rem 1.25rem; border-radius: 0.75rem; font-weight: 700; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; border: none; }
        .btn-icon-text.primary { background: #1e293b; color: white; }
        .btn-icon-text.primary:hover { background: #0f172a; transform: translateY(-1px); }
        .btn-icon-text.primary-ghost { background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; }

        /* Filters */
        .filter-card { background: white; border-radius: 1rem; border: 1px solid #e2e8f0; padding: 1.25rem 1.5rem; }
        .filter-content { display: flex; justify-content: space-between; align-items: center; gap: 2rem; }

        .search-box { flex: 1; position: relative; display: flex; align-items: center; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0.75rem; padding: 0 1rem; transition: all 0.2s; }
        .search-box:focus-within { border-color: #3b82f6; background: white; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
        .search-box svg { color: #94a3b8; }
        .search-box input { border: none; background: transparent; padding: 0.75rem; outline: none; width: 100%; font-size: 0.95rem; }

        .filter-group { display: flex; gap: 1rem; }
        .select-wrapper { display: flex; align-items: center; gap: 0.75rem; background: #f8fafc; padding: 0 1rem; border: 1px solid #e2e8f0; border-radius: 0.75rem; }
        .select-wrapper select { border: none; background: transparent; padding: 0.75rem 0; outline: none; font-weight: 600; color: #475569; min-width: 140px; font-size: 0.85rem; }

        /* Table Design */
        .table-card { overflow: hidden; }
        .admin-table { width: 100%; border-collapse: collapse; text-align: left; }
        .admin-table th { background: #f8fafc; padding: 1rem 1.5rem; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em; border-bottom: 1px solid #f1f5f9; }
        .admin-table td { padding: 1.1rem 1.5rem; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
        .admin-table tr:hover { background: #fcfcfd; }

        .timestamp-cell .date-time { display: flex; flex-direction: column; gap: 0.2rem; }
        .date-time .date { font-weight: 700; color: #1e293b; font-size: 0.9rem; }
        .date-time .time { font-size: 0.75rem; display: flex; align-items: center; gap: 0.25rem; }

        .action-badge-v2 { padding: 0.25rem 0.75rem; border-radius: 6px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.02em; }
        .action-badge-v2.login { background: #e0f2fe; color: #0369a1; }
        .action-badge-v2.user_creation { background: #dcfce7; color: #15803d; }
        .action-badge-v2.work_approval { background: #fef3c7; color: #92400e; }
        .action-badge-v2.work_activation { background: #f0f9ff; color: #0ea5e9; }
        .action-badge-v2.work_delete { background: #fee2e2; color: #b91c1c; }
        .action-badge-v2.update { background: #f1f5f9; color: #475569; }

        .user-profile-cell { display: flex; align-items: center; gap: 0.75rem; }
        .role-avatar { width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.8rem; }
        .role-avatar.admin { background: #1e293b; color: white; }
        .role-avatar.sachiv { background: #3b82f6; color: white; }
        .role-avatar.headmaster { background: #10b981; color: white; }
        .role-avatar.clerk { background: #f59e0b; color: white; }
        .role-avatar.system { background: #e2e8f0; color: #64748b; }

        .user-info { display: flex; flex-direction: column; }
        .user-name { font-size: 0.9rem; font-weight: 700; color: #1e293b; }
        .user-role { font-size: 0.7rem; color: #94a3b8; font-weight: 600; text-transform: uppercase; }

        .details-cell { max-width: 350px; }
        .details-text { font-size: 0.85rem; color: #64748b; line-height: 1.4; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

        .spinning { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        .loading-state, .empty-state-row { padding: 4rem; text-align: center; color: #94a3b8; display: flex; flex-direction: column; align-items: center; gap: 1rem; }
        .empty-state-row p { font-weight: 600; margin: 0; }

        @media (max-width: 1024px) {
          .filter-content { flex-direction: column; align-items: stretch; gap: 1rem; }
          .search-box { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default AuditLogs;
