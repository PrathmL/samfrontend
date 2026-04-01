import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, UserPlus, Search, Edit2, 
  Trash2, Shield, Mail, Phone, MapPin, 
  CheckCircle, XCircle, Filter, X
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { showDeleteAlert, showErrorAlert, showToast } from '../../utils/sweetAlertUtils';

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
    status: 'Active'
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
      status: user.status || 'Active'
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    const isConfirmed = await showDeleteAlert('this user');
    if (isConfirmed) {
      try {
        await axios.delete(`http://localhost:8080/api/admin/users/${id}`);
        showToast('User deleted successfully', 'success');
        fetchUsers();
      } catch (err) {
        showErrorAlert('Error', 'Failed to delete user');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        schoolId: formData.schoolId === '' ? null : Number(formData.schoolId),
        talukaId: formData.talukaId === '' ? null : Number(formData.talukaId)
      };

      if (isEditMode) {
        await axios.put(`http://localhost:8080/api/admin/users/${selectedUser.id}`, payload);
        showToast('User updated successfully', 'success');
      } else {
        await axios.post('http://localhost:8080/api/admin/users', payload);
        showToast('User created successfully', 'success');
      }
      setIsModalOpen(false);
      fetchUsers();
      resetForm();
    } catch (err) {
      console.error('Submit error:', err);
      const errorMessage = err.response?.data?.error || `Failed to ${isEditMode ? 'update' : 'create'} user`;
      showErrorAlert('Error', errorMessage);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '', email: '', mobileNumber: '',
      password: '', role: 'CLERK', schoolId: '',
      talukaId: '', status: 'Active'
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
    <div className="admin-page-container">
      <div className="dashboard-header">
        <div className="header-text">
          <h1>{t('title_user_mgmt')}</h1>
          <p>Create and manage portal access for different stakeholders</p>
        </div>
        <div className="header-actions">
          <button className="btn-icon-text primary" onClick={() => { resetForm(); setIsModalOpen(true); }}>
            <UserPlus size={18} /> {t('btn_add_user')}
          </button>
        </div>
      </div>

      <div className="section-card filter-card">
        <div className="filter-content">
          <div className="search-box">
            <Search size={18} />
            <input 
              type="text" 
              placeholder={`${t('btn_search')} ${t('field_name')}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <div className="select-wrapper">
              <Filter size={16} />
              <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
                <option value="ALL">All Roles</option>
                <option value="ADMIN">Admin</option>
                <option value="SACHIV">Sachiv</option>
                <option value="HEADMASTER">Headmaster</option>
                <option value="CLERK">Clerk</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="section-card table-card">
        <div className="table-responsive">
          <table className="admin-table">
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
                    <div className="user-profile-cell">
                      <div className={`role-avatar-circle ${user.role?.toLowerCase()}`}>
                        {user.name?.charAt(0)}
                      </div>
                      <div className="user-meta-info">
                        <span className="name">{user.name}</span>
                        <span className="email">{user.email || 'No email provided'}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`role-badge-v2 ${user.role?.toLowerCase()}`}>
                      <Shield size={12} />
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <div className="contact-cell">
                      <Phone size={14} className="text-slate-400" />
                      <span>{user.mobileNumber}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge-v2 ${user.status?.toLowerCase() === 'active' ? 'active' : 'inactive'}`}>
                      {user.status === 'Active' ? t('status_active') : t('status_inactive')}
                    </span>
                  </td>
                  <td>
                    <div className="action-button-group">
                      <button className="icon-btn-v2 secondary" onClick={() => handleEdit(user)} title={t('btn_edit')}>
                        <Edit2 size={16} />
                      </button>
                      <button className="icon-btn-v2 danger" onClick={() => handleDelete(user.id)} title={t('btn_delete')}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="5" className="empty-state-row">
                    <Users size={48} className="text-slate-200" />
                    <p>No users found matching your criteria.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container modal-md">
            <div className="modal-header">
              <div className="modal-title-area">
                <h2>{isEditMode ? t('btn_edit') : t('btn_add_user')}</h2>
              </div>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body custom-scrollbar">
                <div className="form-layout-stacked">
                  <div className="form-row-2">
                    <div className="form-group">
                      <label>{t('field_name')} *</label>
                      <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Enter full name" />
                    </div>
                    <div className="form-group">
                      <label>{t('field_mobile')} *</label>
                      <div className="input-with-prefix">
                        <span className="prefix">+91</span>
                        <input type="tel" required value={formData.mobileNumber} onChange={e => setFormData({...formData, mobileNumber: e.target.value})} placeholder="10-digit mobile" />
                      </div>
                    </div>
                  </div>

                  <div className="form-row-2">
                    <div className="form-group">
                      <label>{t('field_email')}</label>
                      <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="email@example.com" />
                    </div>
                    <div className="form-group">
                      <label>{t('field_role')} *</label>
                      <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value, schoolId: '', talukaId: ''})}>
                        <option value="ADMIN">Admin</option>
                        <option value="SACHIV">Sachiv</option>
                        <option value="HEADMASTER">Headmaster</option>
                        <option value="CLERK">Clerk</option>
                      </select>
                    </div>
                  </div>

                  {/* Conditional Selection Fields */}
                  <div className="conditional-fields">
                    {(formData.role === 'HEADMASTER' || formData.role === 'CLERK') && (
                      <div className="form-group highlighted-selection">
                        <label>{t('field_school')} *</label>
                        <div className="select-with-icon">
                          <MapPin size={18} />
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
                      </div>
                    )}

                    {formData.role === 'SACHIV' && (
                      <div className="form-group highlighted-selection">
                        <label>{t('field_taluka')} *</label>
                        <div className="select-with-icon">
                          <MapPin size={18} />
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
                      </div>
                    )}
                  </div>

                  <div className="form-row-2">
                    <div className="form-group">
                      <label>{t('field_password')} {!isEditMode && '*'}</label>
                      <input type="password" required={!isEditMode} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder={isEditMode ? 'Leave blank to keep same' : 'Enter password'} />
                    </div>
                    
                    {isEditMode && (
                      <div className="form-group">
                        <label>{t('field_status')}</label>
                        <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>{t('btn_cancel')}</button>
                <button type="submit" className="btn-primary-action">{t('btn_save')}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .admin-page-container { display: flex; flex-direction: column; gap: 1.5rem; color: #1e293b; }

        .dashboard-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 0.5rem; }
        .header-text h1 { font-size: 1.75rem; font-weight: 800; margin: 0; letter-spacing: -0.02em; }
        .header-text p { color: #64748b; margin: 0.25rem 0 0; font-size: 1rem; }

        .btn-icon-text { display: flex; align-items: center; gap: 0.6rem; padding: 0.75rem 1.5rem; border-radius: 0.75rem; font-weight: 700; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; border: none; }
        .btn-icon-text.primary { background: #1e293b; color: white; }
        .btn-icon-text.primary:hover { background: #0f172a; transform: translateY(-2px); }

        /* Filter Card */
        .filter-card { background: white; border-radius: 1rem; border: 1px solid #e2e8f0; padding: 1.25rem 1.5rem; }
        .filter-content { display: flex; justify-content: space-between; align-items: center; gap: 2rem; }

        .search-box { flex: 1; position: relative; display: flex; align-items: center; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0.75rem; padding: 0 1rem; transition: all 0.2s; }
        .search-box:focus-within { border-color: #3b82f6; background: white; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
        .search-box svg { color: #94a3b8; }
        .search-box input { border: none; background: transparent; padding: 0.75rem; outline: none; width: 100%; font-size: 0.95rem; }

        .select-wrapper { display: flex; align-items: center; gap: 0.75rem; background: #f8fafc; padding: 0 1rem; border: 1px solid #e2e8f0; border-radius: 0.75rem; }
        .select-wrapper select { border: none; background: transparent; padding: 0.75rem 0; outline: none; font-weight: 600; color: #475569; min-width: 160px; }

        /* Table Design */
        .table-card { overflow: hidden; }
        .admin-table { width: 100%; border-collapse: collapse; text-align: left; }
        .admin-table th { background: #f8fafc; padding: 1rem 1.5rem; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: #64748b; border-bottom: 1px solid #f1f5f9; }
        .admin-table td { padding: 1rem 1.5rem; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }
        .admin-table tr:hover { background: #fcfcfd; }

        .user-profile-cell { display: flex; align-items: center; gap: 1rem; }
        .role-avatar-circle { width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 800; color: white; font-size: 1rem; }
        .role-avatar-circle.admin { background: #1e293b; }
        .role-avatar-circle.sachiv { background: #3b82f6; }
        .role-avatar-circle.headmaster { background: #10b981; }
        .role-avatar-circle.clerk { background: #f59e0b; }

        .user-meta-info { display: flex; flex-direction: column; }
        .user-meta-info .name { font-weight: 700; color: #1e293b; font-size: 0.95rem; }
        .user-meta-info .email { font-size: 0.8rem; color: #64748b; }

        .role-badge-v2 { display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.3rem 0.75rem; border-radius: 9999px; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; }
        .role-badge-v2.admin { background: #f1f5f9; color: #1e293b; border: 1px solid #e2e8f0; }
        .role-badge-v2.sachiv { background: #eff6ff; color: #1d4ed8; border: 1px solid #dbeafe; }
        .role-badge-v2.headmaster { background: #f0fdf4; color: #15803d; border: 1px solid #dcfce7; }
        .role-badge-v2.clerk { background: #fff7ed; color: #b45309; border: 1px solid #ffedd5; }

        .contact-cell { display: flex; align-items: center; gap: 0.5rem; font-size: 0.9rem; color: #475569; font-weight: 500; }

        .status-badge-v2 { padding: 0.3rem 0.75rem; border-radius: 9999px; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; }
        .status-badge-v2.active { background: #dcfce7; color: #166534; }
        .status-badge-v2.inactive { background: #f1f5f9; color: #64748b; }

        .action-button-group { display: flex; gap: 0.5rem; }
        .icon-btn-v2 { width: 36px; height: 36px; border-radius: 0.5rem; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; border: 1px solid #e2e8f0; background: white; color: #64748b; }
        .icon-btn-v2:hover { border-color: #3b82f6; color: #3b82f6; background: #eff6ff; }
        .icon-btn-v2.danger:hover { border-color: #ef4444; color: #ef4444; background: #fef2f2; }

        /* Modal Styles */
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 23, 42, 0.75); backdrop-filter: blur(4px); display: flex; justify-content: center; align-items: center; z-index: 1100; padding: 1.5rem; }
        .modal-container { background: white; border-radius: 1.5rem; width: 100%; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); display: flex; flex-direction: column; max-height: 90vh; }
        .modal-md { max-width: 600px; }
        
        .modal-header { padding: 1.5rem 2rem; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; background: #f8fafc; flex-shrink: 0; }
        .modal-title-area h2 { margin: 0; font-size: 1.25rem; font-weight: 800; color: #1e293b; }
        .close-btn { background: transparent; border: none; color: #94a3b8; cursor: pointer; }

        .modal-body { padding: 2rem; overflow-y: auto; }
        .form-layout-stacked { display: flex; flex-direction: column; gap: 1.5rem; }
        .form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
        
        .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
        .form-group label { font-size: 0.8rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.025em; }
        
        .form-group input, .form-group select { padding: 0.75rem 1rem; border: 1px solid #e2e8f0; border-radius: 0.75rem; font-size: 0.95rem; color: #1e293b; transition: all 0.2s; background: #f8fafc; width: 100%; }
        .form-group input:focus, .form-group select:focus { border-color: #3b82f6; background: white; outline: none; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1); }
        
        .input-with-prefix { position: relative; display: flex; align-items: center; }
        .input-with-prefix .prefix { position: absolute; left: 1rem; font-weight: 700; color: #94a3b8; font-size: 0.9rem; pointer-events: none; }
        .input-with-prefix input { padding-left: 3.25rem !important; }

        .conditional-fields { background: #f8fafc; border-radius: 1rem; border: 1px solid #e2e8f0; }
        .highlighted-selection { padding: 1.25rem; }
        .select-with-icon { position: relative; display: flex; align-items: center; }
        .select-with-icon svg { position: absolute; left: 1rem; color: #3b82f6; }
        .select-with-icon select { padding-left: 3rem !important; background: white; border-color: #cbd5e1; }

        .modal-footer { padding: 1.5rem 2rem; border-top: 1px solid #f1f5f9; display: flex; justify-content: flex-end; gap: 1rem; flex-shrink: 0; }
        .btn-primary-action { padding: 0.75rem 2rem; background: #1e293b; color: white; border: none; border-radius: 0.75rem; font-weight: 700; cursor: pointer; transition: all 0.2s; }
        .btn-primary-action:hover { background: #0f172a; transform: translateY(-1px); }
        .btn-secondary { padding: 0.75rem 1.5rem; background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; border-radius: 0.75rem; font-weight: 700; cursor: pointer; }

        .empty-state-row { text-align: center; padding: 4rem 2rem !important; display: flex; flex-direction: column; align-items: center; gap: 1rem; }
        .empty-state-row p { font-weight: 600; color: #94a3b8; margin: 0; }

        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }

        @media (max-width: 768px) {
          .form-row-2 { grid-template-columns: 1fr; }
          .filter-content { flex-direction: column; align-items: stretch; gap: 1rem; }
        }
      `}</style>
    </div>
  );
};

export default UserManagement;
