import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  School, Plus, Search, Edit2, 
  Trash2, MapPin, Building2, Users,
  CheckCircle, XCircle, Filter, X,
  GraduationCap
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { showDeleteAlert, showErrorAlert, showToast } from '../../utils/sweetAlertUtils';

const SchoolManagement = () => {
  const { t } = useTranslation();
  const [schools, setSchools] = useState([]);
  const [talukas, setTalukas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isViewMode, setIsViewMode] = useState(false);
  const [selectedSchool, setSelectedSchool] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTaluka, setSelectedRole] = useState('ALL');
  
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    talukaId: '',
    address: '',
    contactNumber: '',
    status: 'Active'
  });

  useEffect(() => {
    fetchSchools();
    fetchTalukas();
  }, []);

  const fetchSchools = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:8080/api/schools');
      setSchools(res.data || []);
    } catch (err) {
      console.error('Error fetching schools:', err);
    } finally {
      setLoading(false);
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

  const handleEdit = (school) => {
    setSelectedSchool(school);
    setIsEditMode(true);
    setIsViewMode(false);
    setFormData({
      name: school.name || '',
      code: school.code || '',
      talukaId: school.talukaId || '',
      address: school.address || '',
      contactNumber: school.contactNumber || '',
      status: school.status || 'Active'
    });
    setIsModalOpen(true);
  };

  const handleViewDetails = (school) => {
    setSelectedSchool(school);
    setIsEditMode(false);
    setIsViewMode(true);
    setFormData({
      name: school.name || '',
      code: school.code || '',
      talukaId: school.talukaId || '',
      address: school.address || '',
      contactNumber: school.contactNumber || '',
      status: school.status || 'Active'
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    const isConfirmed = await showDeleteAlert('this school');
    if (isConfirmed) {
      try {
        await axios.delete(`http://localhost:8080/api/schools/${id}`);
        showToast('School deleted successfully', 'success');
        fetchSchools();
      } catch (err) {
        showErrorAlert('Error', 'Failed to delete school');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isViewMode) return;
    try {
      const payload = {
        ...formData,
        talukaId: formData.talukaId === '' ? null : Number(formData.talukaId)
      };

      if (isEditMode) {
        await axios.put(`http://localhost:8080/api/schools/${selectedSchool.id}`, payload);
        showToast('School updated successfully', 'success');
      } else {
        await axios.post('http://localhost:8080/api/schools', payload);
        showToast('School created successfully', 'success');
      }
      setIsModalOpen(false);
      fetchSchools();
      resetForm();
    } catch (err) {
      console.error('Submit error:', err);
      const errorMessage = err.response?.data?.error || `Failed to ${isEditMode ? 'update' : 'create'} school`;
      showErrorAlert('Error', errorMessage);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '', code: '', talukaId: '',
      address: '', contactNumber: '', status: 'Active'
    });
    setIsEditMode(false);
    setIsViewMode(false);
    setSelectedSchool(null);
  };

  const getTalukaName = (id) => {
    const taluka = talukas.find(t => t.id === id);
    return taluka ? taluka.name : 'Unknown';
  };

  return (
    <div className="school-management">
      <div className="module-header">
        <div>
          <h1>{t('title_school_mgmt')}</h1>
          <p>Register and manage educational institutions under your jurisdiction</p>
        </div>
        <button className="add-btn" onClick={() => { resetForm(); setIsModalOpen(true); }}>
          <Plus size={20} /> {t('btn_add_school')}
        </button>
      </div>

      <div className="filter-bar">
        <div className="search-box">
          <Search size={20} />
          <input 
            type="text" 
            placeholder={`${t('btn_search')} ${t('field_school')}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="schools-grid">
        {schools.map(school => (
          <div key={school.id} className="school-card">
            <div className="school-card-header">
              <div className="school-icon-box">
                <GraduationCap size={24} />
              </div>
              <span className={`status-pill ${school.status?.toLowerCase()}`}>
                {school.status === 'Active' ? t('status_active') : t('status_inactive')}
              </span>
            </div>
            
            <div className="school-card-body">
              <h3>{school.name}</h3>
              <div className="school-meta">
                <div className="meta-row">
                  <MapPin size={16} />
                  <span>{getTalukaName(school.talukaId)}</span>
                </div>
                <div className="meta-row">
                  <Building2 size={16} />
                  <span>Code: {school.code}</span>
                </div>
              </div>
            </div>

            <div className="school-card-footer">
              <button className="edit-btn" onClick={() => handleEdit(school)}>{t('btn_edit')}</button>
              <button className="delete-btn-card" onClick={() => handleDelete(school.id)}><Trash2 size={16} /></button>
              <button className="details-btn" onClick={() => handleViewDetails(school)}>{t('btn_view')}</button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h2>{isViewMode ? t('btn_view') : (isEditMode ? t('btn_edit') : t('btn_add_school'))}</h2>
              <button onClick={() => setIsModalOpen(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-grid-single">
                  <div className="form-group">
                    <label>{t('field_name')}</label>
                    <input type="text" required readOnly={isViewMode} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>School Code</label>
                    <input type="text" required readOnly={isViewMode} value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} />
                  </div>
                  <div className="form-group">
                    <label>{t('field_taluka')}</label>
                    <select required disabled={isViewMode} value={formData.talukaId} onChange={e => setFormData({...formData, talukaId: e.target.value})}>
                      <option value="">Select Taluka</option>
                      {talukas.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>{t('field_address')}</label>
                    <textarea readOnly={isViewMode} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                  </div>
                  {(isEditMode || isViewMode) && (
                    <div className="form-group">
                      <label>{t('field_status')}</label>
                      <select disabled={isViewMode} value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                      </select>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="cancel-btn" onClick={() => setIsModalOpen(false)}>{isViewMode ? t('btn_close') : t('btn_cancel')}</button>
                {!isViewMode && <button type="submit" className="save-btn">{t('btn_save')}</button>}
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .school-management { padding: 0; }
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

        .schools-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1.5rem; }
        .school-card { background: white; border-radius: 1rem; border: 1px solid #e2e8f0; overflow: hidden; display: flex; flex-direction: column; transition: all 0.2s; }
        .school-card:hover { transform: translateY(-4px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
        
        .school-card-header { padding: 1.25rem; display: flex; justify-content: space-between; align-items: flex-start; }
        .school-icon-box { width: 48px; height: 48px; background: #f0f9ff; border-radius: 0.75rem; display: flex; align-items: center; justify-content: center; color: #0ea5e9; }
        
        .status-pill { padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.7rem; font-weight: 700; text-transform: uppercase; }
        .status-pill.active { background: #dcfce7; color: #16a34a; }
        .status-pill.inactive { background: #f1f5f9; color: #64748b; }

        .school-card-body { padding: 0 1.25rem 1.25rem; flex: 1; }
        .school-card-body h3 { margin: 0 0 0.75rem 0; font-size: 1.1rem; color: #1e293b; }
        .school-meta { display: flex; flex-direction: column; gap: 0.5rem; }
        .meta-row { display: flex; align-items: center; gap: 0.5rem; color: #64748b; font-size: 0.85rem; }

        .school-card-footer { padding: 1rem 1.25rem; background: #f8fafc; border-top: 1px solid #f1f5f9; display: flex; gap: 0.5rem; }
        .edit-btn { flex: 2; padding: 0.5rem; background: white; border: 1px solid #e2e8f0; border-radius: 0.5rem; font-size: 0.85rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .edit-btn:hover { border-color: #0ea5e9; color: #0ea5e9; }
        .delete-btn-card { flex: 1; display: flex; align-items: center; justify-content: center; background: white; border: 1px solid #e2e8f0; border-radius: 0.5rem; cursor: pointer; transition: all 0.2s; color: #64748b; }
        .delete-btn-card:hover { border-color: #ef4444; color: #ef4444; }
        .details-btn { flex: 2; padding: 0.5rem; background: #1e293b; color: white; border: none; border-radius: 0.5rem; font-size: 0.85rem; font-weight: 600; cursor: pointer; }

        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1100; }
        .modal { background: white; border-radius: 1.5rem; width: 100%; max-width: 500px; overflow: hidden; }
        .modal-header { padding: 1.5rem; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; }
        .modal-body { padding: 1.5rem; }
        .form-grid-single { display: flex; flex-direction: column; gap: 1.25rem; }
        .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
        .form-group label { font-size: 0.875rem; font-weight: 600; color: #475569; }
        .form-group input, .form-group select, .form-group textarea { padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.75rem; outline: none; }
        .modal-footer { padding: 1.5rem; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 1rem; }
        .save-btn { padding: 0.75rem 2rem; background: #0ea5e9; color: white; border: none; border-radius: 0.75rem; font-weight: 700; cursor: pointer; }
        .cancel-btn { padding: 0.75rem 2rem; background: #f1f5f9; color: #475569; border: none; border-radius: 0.75rem; font-weight: 700; cursor: pointer; }
      `}</style>
    </div>
  );
};

export default SchoolManagement;
