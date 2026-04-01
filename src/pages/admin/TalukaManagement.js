import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, X, Check } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { showDeleteAlert, showToast, showErrorAlert } from '../../utils/sweetAlertUtils';

const TalukaManagement = () => {
  const { t } = useTranslation();
  const [talukas, setTalukas] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTaluka, setEditingTaluka] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    district: 'Pune',
    code: '',
    status: 'Active'
  });

  useEffect(() => {
    fetchTalukas();
  }, []);

  const fetchTalukas = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/talukas');
      setTalukas(response.data);
    } catch (error) {
      console.error('Error fetching talukas:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTaluka) {
        await axios.put(`http://localhost:8080/api/talukas/${editingTaluka.id}`, formData);
        showToast('Taluka updated successfully', 'success');
      } else {
        await axios.post('http://localhost:8080/api/talukas', formData);
        showToast('Taluka created successfully', 'success');
      }
      setIsModalOpen(false);
      setEditingTaluka(null);
      setFormData({ name: '', district: 'Pune', code: '', status: 'Active' });
      fetchTalukas();
    } catch (error) {
      console.error('Error saving taluka:', error);
      showErrorAlert('Error', 'Failed to save taluka');
    }
  };

  const handleEdit = (taluka) => {
    setEditingTaluka(taluka);
    setFormData({
      name: taluka.name,
      district: taluka.district,
      code: taluka.code,
      status: taluka.status
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    const isConfirmed = await showDeleteAlert('this taluka');
    if (isConfirmed) {
      try {
        await axios.delete(`http://localhost:8080/api/talukas/${id}`);
        showToast('Taluka deleted successfully', 'success');
        fetchTalukas();
      } catch (error) {
        console.error('Error deleting taluka:', error);
        showErrorAlert('Error', 'Failed to delete taluka');
      }
    }
  };

  return (
    <div className="admin-page-container">
      <div className="dashboard-header">
        <div className="header-text">
          <h1>{t('menu_talukas')}</h1>
          <p>Manage administrative regions and their classifications</p>
        </div>
        <div className="header-actions">
          <button className="btn-icon-text primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} /> {t('btn_add_taluka')}
          </button>
        </div>
      </div>

      <div className="section-card table-card">
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t('field_code')}</th>
                <th>{t('field_taluka')}</th>
                <th>{t('field_district')}</th>
                <th>{t('field_status')}</th>
                <th>{t('field_actions')}</th>
              </tr>
            </thead>
            <tbody>
              {talukas.map((taluka) => (
                <tr key={taluka.id}>
                  <td className="font-mono font-bold text-slate-500">{taluka.code}</td>
                  <td className="font-bold text-slate-700">{taluka.name}</td>
                  <td>{taluka.district}</td>
                  <td>
                    <span className={`status-badge-v2 ${taluka.status.toLowerCase()}`}>
                      {taluka.status === 'Active' ? t('status_active') : t('status_inactive')}
                    </span>
                  </td>
                  <td>
                    <div className="action-button-group">
                      <button className="icon-btn-v2 secondary" onClick={() => handleEdit(taluka)} title={t('btn_edit')}>
                        <Edit2 size={16} />
                      </button>
                      <button className="icon-btn-v2 danger" onClick={() => handleDelete(taluka.id)} title={t('btn_delete')}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {talukas.length === 0 && (
                <tr>
                  <td colSpan="5" className="empty-state-row">
                    <p>No talukas found in the system.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container modal-sm">
            <div className="modal-header">
              <div className="modal-title-area">
                <h2>{editingTaluka ? t('btn_edit') + ' ' + t('field_taluka') : t('btn_add_taluka')}</h2>
              </div>
              <button className="close-btn" onClick={() => { setIsModalOpen(false); setEditingTaluka(null); }}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-layout-stacked">
                  <div className="form-group">
                    <label>{t('field_taluka')}</label>
                    <input 
                      type="text" 
                      value={formData.name} 
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Enter taluka name"
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>{t('field_code')}</label>
                    <input 
                      type="text" 
                      value={formData.code} 
                      onChange={(e) => setFormData({...formData, code: e.target.value})}
                      placeholder="e.g. TLK001"
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>{t('field_district')}</label>
                    <input 
                      type="text" 
                      value={formData.district} 
                      readOnly
                      className="bg-readonly"
                    />
                  </div>
                  <div className="form-group">
                    <label>{t('field_status')}</label>
                    <select 
                      value={formData.status} 
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                    >
                      <option value="Active">{t('status_active')}</option>
                      <option value="Inactive">{t('status_inactive')}</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => { setIsModalOpen(false); setEditingTaluka(null); }}>{t('btn_cancel')}</button>
                <button type="submit" className="btn-primary-action">
                  {editingTaluka ? t('btn_save') : t('btn_save')}
                </button>
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

        /* Table Design */
        .section-card { background: white; border-radius: 1rem; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
        .admin-table { width: 100%; border-collapse: collapse; text-align: left; }
        .admin-table th { background: #f8fafc; padding: 1rem 1.5rem; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em; border-bottom: 1px solid #f1f5f9; }
        .admin-table td { padding: 1rem 1.5rem; border-bottom: 1px solid #f1f5f9; vertical-align: middle; font-size: 0.95rem; }
        .admin-table tr:hover { background: #fcfcfd; }

        .status-badge-v2 { padding: 0.3rem 0.75rem; border-radius: 9999px; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.02em; }
        .status-badge-v2.active { background: #f0fdf4; color: #16a34a; border: 1px solid #dcfce7; }
        .status-badge-v2.inactive { background: #fef2f2; color: #dc2626; border: 1px solid #fee2e2; }

        .action-button-group { display: flex; gap: 0.5rem; }
        .icon-btn-v2 { width: 36px; height: 36px; border-radius: 0.5rem; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; border: 1px solid #e2e8f0; background: white; color: #64748b; }
        .icon-btn-v2:hover { border-color: #3b82f6; color: #3b82f6; background: #eff6ff; }
        .icon-btn-v2.danger:hover { border-color: #ef4444; color: #ef4444; background: #fef2f2; }

        /* Modal Redesign */
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 23, 42, 0.75); backdrop-filter: blur(4px); display: flex; justify-content: center; align-items: center; z-index: 1100; padding: 1.5rem; }
        .modal-container { background: white; border-radius: 1.5rem; width: 100%; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }
        .modal-sm { max-width: 450px; }

        .modal-header { padding: 1.5rem 2rem; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; background: #f8fafc; }
        .modal-title-area h2 { margin: 0; font-size: 1.25rem; font-weight: 800; color: #1e293b; }
        .close-btn { background: transparent; border: none; color: #94a3b8; cursor: pointer; }

        .modal-body { padding: 2rem; }
        .form-layout-stacked { display: flex; flex-direction: column; gap: 1.25rem; }
        .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
        .form-group label { font-size: 0.8rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.025em; }
        .form-group input, .form-group select { padding: 0.75rem 1rem; border: 1px solid #e2e8f0; border-radius: 0.75rem; font-size: 0.95rem; color: #1e293b; transition: all 0.2s; background: #f8fafc; }
        .form-group input:focus, .form-group select:focus { border-color: #3b82f6; background: white; outline: none; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1); }
        .bg-readonly { background: #f1f5f9 !important; color: #94a3b8 !important; }

        .modal-footer { padding: 1.5rem 2rem; border-top: 1px solid #f1f5f9; display: flex; justify-content: flex-end; gap: 1rem; }
        .btn-primary-action { padding: 0.75rem 2rem; background: #1e293b; color: white; border: none; border-radius: 0.75rem; font-weight: 700; cursor: pointer; transition: all 0.2s; }
        .btn-primary-action:hover { background: #0f172a; transform: translateY(-1px); }
        .btn-secondary { padding: 0.75rem 1.5rem; background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; border-radius: 0.75rem; font-weight: 700; cursor: pointer; }

        .empty-state-row { text-align: center; padding: 3rem !important; color: #94a3b8; font-weight: 500; font-style: italic; }
      `}</style>
    </div>
  );

};

export default TalukaManagement;
