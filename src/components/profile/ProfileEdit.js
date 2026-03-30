import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { User, Mail, Phone, Lock, Save, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { showErrorAlert, showWarningAlert, showToast } from '../../utils/sweetAlertUtils';

const ProfileEdit = () => {
  const { user, login } = useAuth();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobileNumber: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        mobileNumber: user.mobileNumber || '',
        password: '',
        confirmPassword: ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password && formData.password !== formData.confirmPassword) {
      showWarningAlert('Password Mismatch', 'Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        mobileNumber: formData.mobileNumber
      };
      
      if (formData.password) {
        payload.password = formData.password;
      }

      const res = await axios.put(`http://localhost:8080/api/users/${user.id}`, payload);
      
      // Update the user context with the new data
      const updatedUser = { ...user, ...res.data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      showToast('Profile updated successfully', 'success');
      setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
    } catch (err) {
      showErrorAlert('Error', err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-edit-container">
      <div className="module-header">
        <h1>{t('profile')}</h1>
        <p>{t('Manage your personal information and account security')}</p>
      </div>

      <div className="profile-card">
        <div className="profile-header-info">
          <div className="profile-avatar-large">
            {user?.name?.charAt(0)}
          </div>
          <div className="profile-main-meta">
            <h2>{user?.name}</h2>
            <span className="profile-role-badge">{user?.role}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-section">
            <h3>{t('Personal Information')}</h3>
            <div className="form-grid">
              <div className="form-group">
                <label><User size={16} /> {t('field_name')}</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  readOnly
                  className="read-only-input"
                />
              </div>
              <div className="form-group">
                <label><Mail size={16} /> {t('field_email')}</label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  readOnly
                  className="read-only-input"
                />
              </div>
              <div className="form-group">
                <label><Phone size={16} /> {t('field_mobile')}</label>
                <input 
                  type="text" 
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  readOnly
                  className="read-only-input"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>{t('Security')}</h3>
            <p className="section-hint">{t('Leave blank to keep current password')}</p>
            <div className="form-grid">
              <div className="form-group">
                <label><Lock size={16} /> {t('New Password')}</label>
                <input 
                  type="password" 
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label><Lock size={16} /> {t('Confirm Password')}</label>
                <input 
                  type="password" 
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="save-btn" disabled={loading}>
              <Save size={18} />
              {loading ? t('Saving...') : t('btn_save')}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .profile-edit-container { padding: 0; max-width: 800px; margin: 0 auto; }
        .module-header { margin-bottom: 2rem; }
        .module-header h1 { margin: 0; font-size: 1.75rem; color: #1e293b; }
        .module-header p { margin: 0.25rem 0 0; color: #64748b; }

        .profile-card { background: white; border-radius: 1rem; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
        .profile-header-info { background: #f8fafc; padding: 2rem; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; gap: 2rem; }
        
        .profile-avatar-large { width: 80px; height: 80px; background: #0ea5e9; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; font-weight: 800; border: 4px solid white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
        .profile-main-meta h2 { margin: 0; font-size: 1.5rem; color: #1e293b; }
        .profile-role-badge { display: inline-block; margin-top: 0.5rem; padding: 0.25rem 0.75rem; background: #e0f2fe; color: #0369a1; border-radius: 9999px; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; }

        .profile-form { padding: 2rem; }
        .form-section { margin-bottom: 2.5rem; }
        .form-section h3 { font-size: 1.1rem; color: #1e293b; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid #f1f5f9; }
        .section-hint { font-size: 0.85rem; color: #94a3b8; margin-top: -0.5rem; margin-bottom: 1rem; }
        
        .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; }
        .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
        .form-group label { display: flex; align-items: center; gap: 0.5rem; font-size: 0.85rem; font-weight: 700; color: #475569; }
        .form-group input { padding: 0.75rem; border: 1px solid #e2e8f0; border-radius: 0.5rem; outline: none; transition: all 0.2s; font-size: 0.95rem; }
        .form-group input:focus { border-color: #0ea5e9; box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1); }
        .form-group input.read-only-input { background-color: #f1f5f9; color: #64748b; cursor: not-allowed; border-color: #e2e8f0; }
        .form-group input.read-only-input:focus { border-color: #e2e8f0; box-shadow: none; }

        .form-actions { margin-top: 2rem; display: flex; justify-content: flex-end; }
        .save-btn { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 2rem; background: #0ea5e9; color: white; border: none; border-radius: 0.75rem; font-weight: 700; cursor: pointer; transition: all 0.2s; }
        .save-btn:hover { background: #0284c7; transform: translateY(-1px); }
        .save-btn:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }

        .alert { padding: 1rem; border-radius: 0.75rem; margin: 1.5rem 2rem 0; display: flex; align-items: center; gap: 0.75rem; font-size: 0.9rem; font-weight: 600; }
        .alert.success { background: #dcfce7; color: #15803d; border: 1px solid #bbf7d0; }
        .alert.error { background: #fee2e2; color: #b91c1c; border: 1px solid #fecaca; }
      `}</style>
    </div>
  );
};

export default ProfileEdit;
