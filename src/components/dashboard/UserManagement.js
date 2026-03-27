import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, X, Search, Filter, Eye, EyeOff, Power, RefreshCw, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const UserManagement = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [talukas, setTalukas] = useState([]);
  const [schools, setSchools] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [activeTab, setActiveTab] = useState('SACHIV');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [stats, setStats] = useState({
    totalActive: 0,
    totalSachivs: 0,
    totalHeadMasters: 0,
    totalClerks: 0
  });

  const [formData, setFormData] = useState({
    name: '',
    mobileNumber: '',
    email: '',
    password: '',
    role: 'SACHIV',
    status: 'Active',
    talukaId: '',
    schoolId: ''
  });

  useEffect(() => {
    fetchUsers();
    fetchTalukas();
    fetchSchools();
    fetchStats();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, activeTab, searchTerm, statusFilter]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/admin/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users');
    }
  };

  const fetchTalukas = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/talukas');
      setTalukas(response.data);
    } catch (error) {
      console.error('Error fetching talukas:', error);
    }
  };

  const fetchSchools = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/schools');
      setSchools(response.data);
    } catch (error) {
      console.error('Error fetching schools:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/admin/users/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const filterUsers = () => {
    let filtered = users.filter(user => user.role === activeTab);
    
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.mobileNumber?.includes(searchTerm) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }
    
    setFilteredUsers(filtered);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const dataToSend = { ...formData, role: activeTab };
      
      if (editingUser) {
        await axios.put(`http://localhost:8080/api/admin/users/${editingUser.id}`, dataToSend);
        setSuccess('User updated successfully');
      } else {
        await axios.post('http://localhost:8080/api/admin/users', dataToSend);
        setSuccess('User created successfully');
      }
      
      setIsModalOpen(false);
      setEditingUser(null);
      resetForm();
      fetchUsers();
      fetchStats();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to save user');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      mobileNumber: '',
      email: '',
      password: '',
      role: activeTab,
      status: 'Active',
      talukaId: '',
      schoolId: ''
    });
    setShowPassword(false);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      name: user.name,
      mobileNumber: user.mobileNumber,
      email: user.email,
      password: '',
      role: user.role,
      status: user.status,
      talukaId: user.talukaId || '',
      schoolId: user.schoolId || ''
    });
    setActiveTab(user.role);
    setIsModalOpen(true);
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name}?`)) {
      try {
        await axios.delete(`http://localhost:8080/api/admin/users/${id}`);
        setSuccess('User deleted successfully');
        fetchUsers();
        fetchStats();
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        setError('Failed to delete user');
      }
    }
  };

  const handleToggleStatus = async (id, currentStatus, name) => {
    const action = currentStatus === 'Active' ? 'deactivate' : 'activate';
    if (window.confirm(`Are you sure you want to ${action} ${name}?`)) {
      try {
        await axios.post(`http://localhost:8080/api/admin/users/${id}/${action}`);
        setSuccess(`User ${action}d successfully`);
        fetchUsers();
        fetchStats();
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        setError(`Failed to ${action} user`);
      }
    }
  };

  const handleResetPassword = async (id, name) => {
    if (window.confirm(`Reset password for ${name}? Password will be set to their mobile number.`)) {
      try {
        await axios.post(`http://localhost:8080/api/admin/users/${id}/reset-password`, {
          newPassword: ''
        });
        setSuccess('Password reset successfully');
        setTimeout(() => setSuccess(''), 3000);
      } catch (error) {
        setError('Failed to reset password');
      }
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'Active': return { bg: '#dcfce7', text: '#166534', icon: CheckCircle };
      case 'Inactive': return { bg: '#fee2e2', text: '#991b1b', icon: XCircle };
      default: return { bg: '#f1f5f9', text: '#475569', icon: AlertCircle };
    }
  };

  return (
    <div className="management-container">
      <div className="management-header">
        <h1>User Management</h1>
        <button className="add-button" onClick={() => { resetForm(); setIsModalOpen(true); }}>
          <Plus size={20} /> Add {activeTab.toLowerCase()}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-cards">
        <div className="stat-card-mini">
          <div className="stat-value-mini">{stats.totalSachivs}</div>
          <div className="stat-label-mini">Sachivs</div>
        </div>
        <div className="stat-card-mini">
          <div className="stat-value-mini">{stats.totalHeadMasters}</div>
          <div className="stat-label-mini">Head Masters</div>
        </div>
        <div className="stat-card-mini">
          <div className="stat-value-mini">{stats.totalClerks}</div>
          <div className="stat-label-mini">Clerks</div>
        </div>
        <div className="stat-card-mini">
          <div className="stat-value-mini">{stats.totalActive}</div>
          <div className="stat-label-mini">Active Users</div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="alert error">
          <AlertCircle size={18} />
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

      {/* Tabs */}
      <div className="tabs">
        <button className={activeTab === 'SACHIV' ? 'active' : ''} onClick={() => setActiveTab('SACHIV')}>
          Sachivs
        </button>
        <button className={activeTab === 'HEADMASTER' ? 'active' : ''} onClick={() => setActiveTab('HEADMASTER')}>
          Head Masters
        </button>
        <button className={activeTab === 'CLERK' ? 'active' : ''} onClick={() => setActiveTab('CLERK')}>
          Clerks
        </button>
      </div>

      {/* Search and Filters */}
      <div className="filters-bar">
        <div className="search-box">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by name, mobile, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-box">
          <Filter size={18} />
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="ALL">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Mobile</th>
              <th>Email</th>
              {activeTab === 'SACHIV' && <th>Taluka</th>}
              {(activeTab === 'HEADMASTER' || activeTab === 'CLERK') && <th>School</th>}
              <th>Status</th>
              <th>Created</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map((user) => {
              const StatusIcon = getStatusColor(user.status).icon;
              return (
                <tr key={user.id}>
                  <td><strong>{user.name}</strong></td>
                  <td>{user.mobileNumber}</td>
                  <td>{user.email || '-'}</td>
                  {activeTab === 'SACHIV' && <td>{user.talukaName || 'N/A'}</td>}
                  {(activeTab === 'HEADMASTER' || activeTab === 'CLERK') && (
                    <td>{user.schoolName || 'N/A'}</td>
                  )}
                  <td>
                    <span className={`status-badge ${user.status.toLowerCase()}`}>
                      <StatusIcon size={12} />
                      {user.status}
                    </span>
                  </td>
                  <td className="date-cell">{user.createdAt?.split(' ')[0] || '-'}</td>
                  <td>
                    <div className="action-buttons">
                      <button className="edit-btn" onClick={() => handleEdit(user)} title="Edit">
                        <Edit2 size={16} />
                      </button>
                      <button className="reset-pwd-btn" onClick={() => handleResetPassword(user.id, user.name)} title="Reset Password">
                        <RefreshCw size={16} />
                      </button>
                      <button className="toggle-status-btn" onClick={() => handleToggleStatus(user.id, user.status, user.name)} title={user.status === 'Active' ? 'Deactivate' : 'Activate'}>
                        <Power size={16} />
                      </button>
                      <button className="delete-btn" onClick={() => handleDelete(user.id, user.name)} title="Delete">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filteredUsers.length === 0 && (
          <div className="empty-state">
            <p>No users found.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{editingUser ? 'Edit' : 'Add'} {activeTab.toLowerCase()}</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group full-width">
                  <label>Full Name *</label>
                  <input 
                    type="text" 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Mobile Number *</label>
                  <input 
                    type="tel" 
                    value={formData.mobileNumber} 
                    onChange={(e) => setFormData({...formData, mobileNumber: e.target.value})}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input 
                    type="email" 
                    value={formData.email} 
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Password {editingUser && '(Leave blank to keep current)'}</label>
                  <div className="password-input-wrapper">
                    <input 
                      type={showPassword ? "text" : "password"}
                      value={formData.password} 
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      required={!editingUser}
                      placeholder={!editingUser ? "Default: mobile number" : "New password"}
                    />
                    <button type="button" className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {activeTab === 'SACHIV' && (
                  <div className="form-group">
                    <label>Assign Taluka *</label>
                    <select 
                      value={formData.talukaId} 
                      onChange={(e) => setFormData({...formData, talukaId: e.target.value})}
                      required
                    >
                      <option value="">Select Taluka</option>
                      {talukas.filter(t => t.status === 'Active').map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {(activeTab === 'HEADMASTER' || activeTab === 'CLERK') && (
                  <div className="form-group">
                    <label>Assign School *</label>
                    <select 
                      value={formData.schoolId} 
                      onChange={(e) => setFormData({...formData, schoolId: e.target.value})}
                      required
                    >
                      <option value="">Select School</option>
                      {schools.filter(s => s.status === 'Active').map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="form-group">
                  <label>Status</label>
                  <select 
                    value={formData.status} 
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="cancel-btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="save-btn" disabled={loading}>
                  {loading ? 'Saving...' : (editingUser ? 'Update User' : 'Save User')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .management-container { padding: 1rem; }
        .management-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .add-button { display: flex; align-items: center; gap: 0.5rem; background-color: #0ea5e9; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; cursor: pointer; font-weight: 600; }
        
        .stats-cards { display: flex; gap: 1rem; margin-bottom: 1.5rem; }
        .stat-card-mini { background: white; padding: 1rem 1.5rem; border-radius: 0.75rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); text-align: center; flex: 1; }
        .stat-value-mini { font-size: 1.75rem; font-weight: 700; color: #0ea5e9; }
        .stat-label-mini { font-size: 0.8rem; color: #64748b; }
        
        .alert { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1rem; border-radius: 0.5rem; margin-bottom: 1rem; }
        .alert.error { background-color: #fee2e2; color: #991b1b; }
        .alert.success { background-color: #dcfce7; color: #166534; }
        .alert button { background: none; border: none; margin-left: auto; cursor: pointer; color: inherit; }
        
        .tabs { display: flex; gap: 1rem; margin-bottom: 1.5rem; border-bottom: 2px solid #e2e8f0; }
        .tabs button { padding: 0.75rem 1.5rem; border: none; background: none; cursor: pointer; font-weight: 600; color: #64748b; border-bottom: 2px solid transparent; margin-bottom: -2px; }
        .tabs button.active { color: #0ea5e9; border-bottom-color: #0ea5e9; }
        
        .filters-bar { display: flex; gap: 1rem; margin-bottom: 1.5rem; }
        .search-box { display: flex; align-items: center; gap: 0.5rem; background: white; border: 1px solid #e2e8f0; border-radius: 0.5rem; padding: 0.5rem 0.75rem; flex: 1; }
        .search-box input { border: none; outline: none; flex: 1; }
        .filter-box { display: flex; align-items: center; gap: 0.5rem; background: white; border: 1px solid #e2e8f0; border-radius: 0.5rem; padding: 0.5rem 0.75rem; }
        .filter-box select { border: none; outline: none; background: transparent; }
        
        .table-container { background: white; border-radius: 0.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow-x: auto; }
        table { width: 100%; border-collapse: collapse; text-align: left; }
        th { background-color: #f1f5f9; padding: 1rem; font-weight: 600; color: #475569; }
        td { padding: 1rem; border-top: 1px solid #f1f5f9; }
        .date-cell { font-size: 0.85rem; color: #64748b; }
        
        .status-badge { display: inline-flex; align-items: center; gap: 0.25rem; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; }
        .status-badge.active { background-color: #dcfce7; color: #166534; }
        .status-badge.inactive { background-color: #fee2e2; color: #991b1b; }
        
        .action-buttons { display: flex; gap: 0.5rem; }
        .edit-btn, .reset-pwd-btn, .toggle-status-btn, .delete-btn { padding: 0.5rem; border: 1px solid #e2e8f0; border-radius: 0.25rem; background: white; cursor: pointer; color: #64748b; display: inline-flex; align-items: center; }
        .edit-btn:hover { color: #0ea5e9; border-color: #0ea5e9; }
        .reset-pwd-btn:hover { color: #f59e0b; border-color: #f59e0b; }
        .toggle-status-btn:hover { color: #8b5cf6; border-color: #8b5cf6; }
        .delete-btn:hover { color: #ef4444; border-color: #ef4444; }
        
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
        .modal { background: white; border-radius: 0.75rem; width: 100%; max-width: 700px; padding: 2rem; max-height: 90vh; overflow-y: auto; }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .close-btn { background: none; border: none; cursor: pointer; color: #64748b; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
        .form-group.full-width { grid-column: span 2; }
        .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
        .form-group label { font-weight: 600; color: #334155; font-size: 0.9rem; }
        .form-group input, .form-group select { padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; }
        .password-input-wrapper { position: relative; display: flex; }
        .password-input-wrapper input { flex: 1; }
        .toggle-password { position: absolute; right: 0.75rem; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: #64748b; }
        .modal-footer { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem; }
        .cancel-btn { padding: 0.75rem 1.5rem; border: 1px solid #d1d5db; border-radius: 0.5rem; background: white; cursor: pointer; }
        .save-btn { padding: 0.75rem 1.5rem; border: none; border-radius: 0.5rem; background: #0ea5e9; color: white; cursor: pointer; font-weight: 600; }
        .save-btn:disabled { background-color: #93c5fd; cursor: not-allowed; }
        
        .empty-state { text-align: center; padding: 3rem; color: #94a3b8; }
      `}</style>
    </div>
  );
};

export default UserManagement;