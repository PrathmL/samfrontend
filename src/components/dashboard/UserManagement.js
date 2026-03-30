import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, UserPlus, Search, Edit2, 
  Trash2, Shield, Mail, Phone, MapPin, 
  CheckCircle, XCircle, Filter, X
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const UserManagement = () => {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [schools, setSchools] = useState([]);
  const [talukas, setTalukas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('ALL');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobileNumber: '',
    password: '',
    role: 'CLERK',
    schoolId: '',
    talukaId: '',
    active: true
  });

  useEffect(() => {
    fetchUsers();
    fetchSchools();
    fetchTalukas();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:8080/api/admin/users');
      setUsers(res.data || []);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSchools = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/schools');
      setSchools(res.data || []);
    } catch (err) {
      console.error('Error fetching schools:', err);
    }
  };

  const fetchTalukas = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/talukas');
      setTalukas(res.data || []);
    } catch (err) {
      console.error('Error fetching talukas:', err);
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setIsEditMode(true);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      mobileNumber: user.mobileNumber || '',
      password: '', // Keep empty for security, handle specially in backend or only if provided
      role: user.role || 'CLERK',
      schoolId: user.schoolId || '',
      talukaId: user.talukaId || '',
      active: user.active ?? true
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`http://localhost:8080/api/admin/users/${id}`);
        fetchUsers();
      } catch (err) {
        alert('Failed to delete user');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        await axios.put(`http://localhost:8080/api/admin/users/${selectedUser.id}`, formData);
      } else {
        await axios.post('http://localhost:8080/api/admin/users', formData);
      }
      setIsModalOpen(false);
      fetchUsers();
      resetForm();
    } catch (err) {
      alert(`Failed to ${isEditMode ? 'update' : 'create'} user`);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '', email: '', mobileNumber: '',
      password: '', role: 'CLERK', schoolId: '',
      talukaId: '', active: true
    });
    setIsEditMode(false);
    setSelectedUser(null);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.mobileNumber?.includes(searchTerm);
    const matchesRole = selectedRole === 'ALL' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="user-management">
      <div className="module-header">
        <div>
          <h1>{t('title_user_mgmt')}</h1>
          <p>Create and manage portal access for different stakeholders</p>
        </div>
        <button className="add-btn" onClick={() => { resetForm(); setIsModalOpen(true); }}>
          <UserPlus size={20} /> {t('btn_add_user')}
        </button>
      </div>

      <div className="filter-bar">
        <div className="search-box">
          <Search size={20} />
          <input 
            type="text" 
            placeholder={`${t('btn_search')} ${t('field_name')}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="role-filter">
          <Filter size={20} />
          <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
            <option value="ALL">All Roles</option>
            <option value="ADMIN">Admin</option>
            <option value="SACHIV">Sachiv</option>
            <option value="HEADMASTER">Headmaster</option>
            <option value="CLERK">Clerk</option>
          </select>
        </div>
      </div>

      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>{t('field_name')}</th>
              <th>{t('field_role')}</th>
              <th>{t('field_mobile')}</th>
              <th>{t('field_status')}</th>
              <th>{t('field_actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id}>
                <td>
                  <div className="user-info-cell">
                    <div className="user-avatar">{user.name?.charAt(0)}</div>
                    <div>
                      <div className="user-name-text">{user.name}</div>
                      <div className="user-email-text">{user.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`role-badge ${user.role?.toLowerCase()}`}>
                    {user.role}
                  </span>
                </td>
                <td>{user.mobileNumber}</td>
                <td>
                  <span className={`status-badge ${user.active ? 'active' : 'inactive'}`}>
                    {user.active ? t('status_active') : t('status_inactive')}
                  </span>
                </td>
                <td>
                  <div className="action-btns">
                    <button className="edit-btn-icon" onClick={() => handleEdit(user)}><Edit2 size={16} /></button>
                    <button className="delete-btn-icon" onClick={() => handleDelete(user.id)}><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{isEditMode ? t('btn_edit') : t('btn_add_user')}</h2>
              <button onClick={() => setIsModalOpen(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label>{t('field_name')}</label>
                    <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>{t('field_mobile')}</label>
                    <input type="tel" required value={formData.mobileNumber} onChange={e => setFormData({...formData, mobileNumber: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>{t('field_email')}</label>
                    <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>{t('field_role')}</label>
                    <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value, schoolId: '', talukaId: ''})}>
                      <option value="ADMIN">Admin</option>
                      <option value="SACHIV">Sachiv</option>
                      <option value="HEADMASTER">Headmaster</option>
                      <option value="CLERK">Clerk</option>
                    </select>
                  </div>

                  {/* Conditional School Dropdown for HM and Clerk */}
                  {(formData.role === 'HEADMASTER' || formData.role === 'CLERK') && (
                    <div className="form-group full-width-modal">
                      <label>{t('field_school')} *</label>
                      <select 
                        required 
                        value={formData.schoolId} 
                        onChange={e => setFormData({...formData, schoolId: e.target.value})}
                      >
                        <option value="">Select School</option>
                        {schools.map(s => (
                          <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Conditional Taluka Dropdown for Sachiv */}
                  {formData.role === 'SACHIV' && (
                    <div className="form-group full-width-modal">
                      <label>{t('field_taluka')}</label>
                      <select 
                        required 
                        value={formData.talukaId} 
                        onChange={e => setFormData({...formData, talukaId: e.target.value})}
                      >
                        <option value="">Select Taluka</option>
                        {talukas.map(t => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="form-group">
                    <label>{t('field_password')}</label>
                    <input type="password" required={!isEditMode} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder={isEditMode ? 'Leave blank to keep same' : ''} />
                  </div>
                  
                  {isEditMode && (
                    <div className="form-group">
                      <label>{t('field_status')}</label>
                      <select value={formData.active} onChange={e => setFormData({...formData, active: e.target.value === 'true'})}>
                        <option value="true">Active</option>
                        <option value="false">Inactive</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="cancel-btn" onClick={() => setIsModalOpen(false)}>{t('btn_cancel')}</button>
                <button type="submit" className="save-btn">{t('btn_save')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .user-management { padding: 0; }
        .module-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
        .module-header h1 { margin: 0; font-size: 1.75rem; color: #1e293b; }
        .module-header p { margin: 0.25rem 0 0; color: #64748b; }
        
        .add-btn { display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem; background: #0ea5e9; color: white; border: none; border-radius: 0.75rem; font-weight: 700; cursor: pointer; transition: all 0.2s; }
        .add-btn:hover { background: #0284c7; transform: translateY(-2px); }

        .filter-bar { display: flex; gap: 1rem; margin-bottom: 2rem; }
        .search-box { flex: 1; position: relative; display: flex; align-items: center; }
        .search-box svg { position: absolute; left: 1rem; color: #94a3b8; }
        .search-box input { width: 100%; padding: 0.75rem 1rem 0.75rem 3rem; border: 1px solid #e2e8f0; border-radius: 0.75rem; outline: none; transition: border-color 0.2s; }
        .search-box input:focus { border-color: #0ea5e9; }

        .role-filter { display: flex; align-items: center; gap: 0.75rem; background: white; padding: 0 1rem; border: 1px solid #e2e8f0; border-radius: 0.75rem; }
        .role-filter select { border: none; padding: 0.75rem 0; outline: none; font-weight: 600; color: #475569; }

        .users-table-container { background: white; border-radius: 1rem; border: 1px solid #e2e8f0; overflow: hidden; }
        .users-table { width: 100%; border-collapse: collapse; }
        .users-table th { background: #f8fafc; padding: 1rem; text-align: left; font-size: 0.85rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
        .users-table td { padding: 1rem; border-top: 1px solid #f1f5f9; }

        .user-info-cell { display: flex; align-items: center; gap: 1rem; }
        .user-avatar { width: 40px; height: 40px; border-radius: 50%; background: #e0f2fe; color: #0ea5e9; display: flex; align-items: center; justify-content: center; font-weight: 700; }
        .user-name-text { font-weight: 700; color: #1e293b; }
        .user-email-text { font-size: 0.85rem; color: #64748b; }

        .role-badge { padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }
        .role-badge.admin { background: #fee2e2; color: #dc2626; }
        .role-badge.sachiv { background: #fef3c7; color: #d97706; }
        .role-badge.headmaster { background: #dcfce7; color: #16a34a; }
        .role-badge.clerk { background: #e0f2fe; color: #0ea5e9; }

        .status-badge { padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 700; }
        .status-badge.active { background: #dcfce7; color: #16a34a; }
        .status-badge.inactive { background: #f1f5f9; color: #64748b; }

        .action-btns { display: flex; gap: 0.5rem; }
        .edit-btn-icon, .delete-btn-icon { width: 32px; height: 32px; border-radius: 0.5rem; display: flex; align-items: center; justify-content: center; border: 1px solid #e2e8f0; background: white; cursor: pointer; transition: all 0.2s; }
        .edit-btn-icon:hover { color: #0ea5e9; border-color: #0ea5e9; }
        .delete-btn-icon:hover { color: #ef4444; border-color: #ef4444; }

        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1100; }
        .modal { background: white; border-radius: 1.5rem; width: 100%; max-width: 600px; overflow: hidden; }
        .modal-header { padding: 1.5rem; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
        .modal-body { padding: 1.5rem; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
        .full-width-modal { grid-column: span 2; }
        .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
        .form-group label { font-size: 0.875rem; font-weight: 600; color: #475569; }
        .form-group input, .form-group select { padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.75rem; outline: none; }
        .modal-footer { padding: 1.5rem; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 1rem; }
        .save-btn { padding: 0.75rem 2rem; background: #0ea5e9; color: white; border: none; border-radius: 0.75rem; font-weight: 700; cursor: pointer; }
        .cancel-btn { padding: 0.75rem 2rem; background: #f1f5f9; color: #475569; border: none; border-radius: 0.75rem; font-weight: 700; cursor: pointer; }
      `}</style>
    </div>
  );
};

export default UserManagement;
