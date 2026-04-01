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
    <div className="admin-page-container">
      <div className="dashboard-header">
        <div className="header-text">
          <h1>{t('title_school_mgmt')}</h1>
          <p>Register and manage educational institutions under your jurisdiction</p>
        </div>
        <div className="header-actions">
          <button className="btn-icon-text primary" onClick={() => { resetForm(); setIsModalOpen(true); }}>
            <Plus size={18} /> {t('btn_add_school')}
          </button>
        </div>
      </div>

      <div className="section-card filter-card">
        <div className="filter-content">
          <div className="search-box">
            <Search size={18} />
            <input 
              type="text" 
              placeholder={`${t('btn_search')} ${t('field_school')}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <div className="select-wrapper">
              <Filter size={16} />
              <select value={selectedTaluka} onChange={(e) => setSelectedRole(e.target.value)}>
                <option value="ALL">All Talukas</option>
                {talukas.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="schools-grid">
        {schools
          .filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()) && (selectedTaluka === 'ALL' || s.talukaId?.toString() === selectedTaluka))
          .map(school => (
          <div key={school.id} className="school-card-v2">
            <div className="card-top">
              <div className="school-avatar">
                <GraduationCap size={24} />
              </div>
              <span className={`status-pill-v2 ${school.status?.toLowerCase()}`}>
                {school.status === 'Active' ? t('status_active') : t('status_inactive')}
              </span>
            </div>
            
            <div className="card-main">
              <h3>{school.name}</h3>
              <div className="info-rows">
                <div className="info-row">
                  <MapPin size={14} />
                  <span>{getTalukaName(school.talukaId)}</span>
                </div>
                <div className="info-row">
                  <Building2 size={14} />
                  <span className="code-tag">Code: {school.code}</span>
                </div>
              </div>
            </div>

            <div className="card-actions">
              <button className="action-btn-v2 secondary" onClick={() => handleEdit(school)} title={t('btn_edit')}>
                <Edit2 size={16} />
              </button>
              <button className="action-btn-v2 danger" onClick={() => handleDelete(school.id)} title={t('btn_delete')}>
                <Trash2 size={16} />
              </button>
              <button className="action-btn-v2 primary" onClick={() => handleViewDetails(school)}>
                {t('btn_view')}
              </button>
            </div>
          </div>
        ))}
        {schools.length === 0 && !loading && (
          <div className="empty-state-full">
            <School size={64} className="text-slate-200" />
            <p>No schools registered yet.</p>
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-container modal-md">
            <div className="modal-header">
              <div className="modal-title-area">
                <h2>{isViewMode ? t('btn_view') : (isEditMode ? t('btn_edit') : t('btn_add_school'))}</h2>
              </div>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-layout">
                  <div className="form-group">
                    <label>{t('field_name')}</label>
                    <div className="input-with-icon">
                      <GraduationCap size={18} />
                      <input type="text" required readOnly={isViewMode} value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Enter school name" />
                    </div>
                  </div>
                  <div className="form-row-2">
                    <div className="form-group">
                      <label>School Code</label>
                      <input type="text" required readOnly={isViewMode} value={formData.code} onChange={e => setFormData({...formData, code: e.target.value})} placeholder="e.g. SCH001" />
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
                  </div>
                  <div className="form-group">
                    <label>{t('field_address')}</label>
                    <textarea readOnly={isViewMode} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Enter school address" rows="3" />
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
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>{isViewMode ? t('btn_close') : t('btn_cancel')}</button>
                {!isViewMode && <button type="submit" className="btn-primary-action">{t('btn_save')}</button>}
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

        /* Buttons */
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

        /* School Grid */
        .schools-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.5rem; }
        
        .school-card-v2 { background: white; border-radius: 1.25rem; border: 1px solid #e2e8f0; padding: 1.5rem; display: flex; flex-direction: column; gap: 1.25rem; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); position: relative; overflow: hidden; }
        .school-card-v2:hover { transform: translateY(-4px); box-shadow: 0 12px 20px -5px rgba(0, 0, 0, 0.1); border-color: #cbd5e1; }
        
        .card-top { display: flex; justify-content: space-between; align-items: flex-start; }
        .school-avatar { width: 52px; height: 52px; background: #eff6ff; color: #3b82f6; border-radius: 1rem; display: flex; align-items: center; justify-content: center; }
        
        .status-pill-v2 { padding: 0.3rem 0.75rem; border-radius: 9999px; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.02em; }
        .status-pill-v2.active { background: #f0fdf4; color: #16a34a; border: 1px solid #dcfce7; }
        .status-pill-v2.inactive { background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0; }

        .card-main h3 { margin: 0 0 0.75rem 0; font-size: 1.15rem; font-weight: 800; color: #1e293b; line-height: 1.3; }
        .info-rows { display: flex; flex-direction: column; gap: 0.6rem; }
        .info-row { display: flex; align-items: center; gap: 0.6rem; color: #64748b; font-size: 0.9rem; font-weight: 500; }
        .code-tag { background: #f8fafc; padding: 0.1rem 0.5rem; border-radius: 4px; font-family: monospace; font-weight: 700; color: #475569; }

        .card-actions { display: flex; gap: 0.75rem; margin-top: 0.5rem; }
        .action-btn-v2 { height: 40px; border-radius: 0.75rem; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; font-weight: 700; font-size: 0.85rem; border: 1px solid transparent; }
        .action-btn-v2.secondary { width: 40px; background: white; border-color: #e2e8f0; color: #64748b; }
        .action-btn-v2.secondary:hover { border-color: #3b82f6; color: #3b82f6; background: #eff6ff; }
        .action-btn-v2.danger { width: 40px; background: white; border-color: #fee2e2; color: #ef4444; }
        .action-btn-v2.danger:hover { background: #fef2f2; border-color: #ef4444; }
        .action-btn-v2.primary { flex: 1; background: #f1f5f9; color: #1e293b; border-color: #e2e8f0; }
        .action-btn-v2.primary:hover { background: #e2e8f0; }

        /* Modal Styles */
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 23, 42, 0.75); backdrop-filter: blur(4px); display: flex; justify-content: center; align-items: center; z-index: 1100; padding: 1.5rem; }
        .modal-container { background: white; border-radius: 1.5rem; width: 100%; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }
        .modal-md { max-width: 550px; }
        
        .modal-header { padding: 1.5rem 2rem; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; background: #f8fafc; }
        .modal-title-area h2 { margin: 0; font-size: 1.25rem; font-weight: 800; color: #1e293b; }
        .close-btn { background: transparent; border: none; color: #94a3b8; cursor: pointer; }

        .modal-body { padding: 2rem; }
        .form-layout { display: flex; flex-direction: column; gap: 1.5rem; }
        .form-row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
        
        .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
        .form-group label { font-size: 0.8rem; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.025em; }
        
        .input-with-icon { position: relative; display: flex; align-items: center; }
        .input-with-icon svg { position: absolute; left: 1rem; color: #94a3b8; }
        .input-with-icon input { padding-left: 3rem !important; }
        
        .form-group input, .form-group select, .form-group textarea { padding: 0.75rem 1rem; border: 1px solid #e2e8f0; border-radius: 0.75rem; font-size: 0.95rem; color: #1e293b; transition: all 0.2s; width: 100%; background: #f8fafc; }
        .form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: #3b82f6; background: white; outline: none; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1); }
        .form-group select { appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 1rem center; background-size: 1.25rem; }
        
        .modal-footer { padding: 1.5rem 2rem; border-top: 1px solid #f1f5f9; display: flex; justify-content: flex-end; gap: 1rem; }
        .btn-primary-action { padding: 0.75rem 2rem; background: #1e293b; color: white; border: none; border-radius: 0.75rem; font-weight: 700; cursor: pointer; transition: all 0.2s; }
        .btn-primary-action:hover { background: #0f172a; transform: translateY(-1px); }
        .btn-secondary { padding: 0.75rem 1.5rem; background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; border-radius: 0.75rem; font-weight: 700; cursor: pointer; }

        .empty-state-full { grid-column: 1 / -1; padding: 5rem; text-align: center; color: #cbd5e1; display: flex; flex-direction: column; align-items: center; gap: 1rem; }
        .empty-state-full p { font-size: 1.1rem; font-weight: 600; color: #94a3b8; }

        @media (max-width: 768px) {
          .form-row-2 { grid-template-columns: 1fr; }
          .filter-content { flex-direction: column; align-items: stretch; gap: 1rem; }
          .schools-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default SchoolManagement;
