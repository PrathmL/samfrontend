import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, X } from 'lucide-react';

const SchoolManagement = () => {
  const [schools, setSchools] = useState([]);
  const [talukas, setTalukas] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    talukaId: '',
    address: '',
    contactDetails: '',
    establishedYear: new Date().getFullYear(),
    status: 'Active'
  });

  useEffect(() => {
    fetchSchools();
    fetchTalukas();
  }, []);

  const fetchSchools = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/schools');
      setSchools(response.data);
    } catch (error) {
      console.error('Error fetching schools:', error);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSchool) {
        await axios.put(`http://localhost:8080/api/schools/${editingSchool.id}`, formData);
      } else {
        await axios.post('http://localhost:8080/api/schools', formData);
      }
      setIsModalOpen(false);
      setEditingSchool(null);
      resetForm();
      fetchSchools();
    } catch (error) {
      console.error('Error saving school:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      talukaId: '',
      address: '',
      contactDetails: '',
      establishedYear: new Date().getFullYear(),
      status: 'Active'
    });
  };

  const handleEdit = (school) => {
    setEditingSchool(school);
    setFormData({
      name: school.name,
      code: school.code,
      talukaId: school.talukaId,
      address: school.address,
      contactDetails: school.contactDetails,
      establishedYear: school.establishedYear,
      status: school.status
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this school?')) {
      try {
        await axios.delete(`http://localhost:8080/api/schools/${id}`);
        fetchSchools();
      } catch (error) {
        console.error('Error deleting school:', error);
      }
    }
  };

  const getTalukaName = (id) => {
    return talukas.find(t => t.id === id)?.name || 'Unknown';
  };

  return (
    <div className="management-container">
      <div className="management-header">
        <h1>School Management</h1>
        <button className="add-button" onClick={() => { resetForm(); setIsModalOpen(true); }}>
          <Plus size={20} /> Add School
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>School Name</th>
              <th>Taluka</th>
              <th>Established</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {schools.map((school) => (
              <tr key={school.id}>
                <td>{school.code}</td>
                <td>{school.name}</td>
                <td>{getTalukaName(school.talukaId)}</td>
                <td>{school.establishedYear}</td>
                <td>
                  <span className={`status-badge ${school.status.toLowerCase()}`}>
                    {school.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="edit-btn" onClick={() => handleEdit(school)}><Edit2 size={18} /></button>
                    <button className="delete-btn" onClick={() => handleDelete(school.id)}><Trash2 size={18} /></button>
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
              <h2>{editingSchool ? 'Edit School' : 'Add New School'}</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>School Name</label>
                  <input 
                    type="text" 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>School Code</label>
                  <input 
                    type="text" 
                    value={formData.code} 
                    onChange={(e) => setFormData({...formData, code: e.target.value})}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Taluka</label>
                  <select 
                    value={formData.talukaId} 
                    onChange={(e) => setFormData({...formData, talukaId: e.target.value})}
                    required
                  >
                    <option value="">Select Taluka</option>
                    {talukas.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Established Year</label>
                  <input 
                    type="number" 
                    value={formData.establishedYear} 
                    onChange={(e) => setFormData({...formData, establishedYear: e.target.value})}
                  />
                </div>
                <div className="form-group full-width">
                  <label>Address</label>
                  <input 
                    type="text" 
                    value={formData.address} 
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Contact Details</label>
                  <input 
                    type="text" 
                    value={formData.contactDetails} 
                    onChange={(e) => setFormData({...formData, contactDetails: e.target.value})}
                  />
                </div>
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
                <button type="submit" className="save-btn">
                  {editingSchool ? 'Update School' : 'Save School'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .management-container { padding: 1rem; }
        .management-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
        .add-button { display: flex; align-items: center; gap: 0.5rem; background-color: #0ea5e9; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 0.5rem; cursor: pointer; font-weight: 600; }
        .table-container { background: white; border-radius: 0.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); overflow: hidden; }
        table { width: 100%; border-collapse: collapse; text-align: left; }
        th { background-color: #f1f5f9; padding: 1rem; font-weight: 600; color: #475569; }
        td { padding: 1rem; border-top: 1px solid #f1f5f9; }
        .status-badge { padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.875rem; font-weight: 500; }
        .status-badge.active { background-color: #dcfce7; color: #166534; }
        .status-badge.inactive { background-color: #fee2e2; color: #991b1b; }
        .action-buttons { display: flex; gap: 0.5rem; }
        .edit-btn, .delete-btn { padding: 0.5rem; border: 1px solid #e2e8f0; border-radius: 0.25rem; background: white; cursor: pointer; color: #64748b; }
        .edit-btn:hover { color: #0ea5e9; border-color: #0ea5e9; }
        .delete-btn:hover { color: #ef4444; border-color: #ef4444; }
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; justify-content: center; align-items: center; z-index: 1000; }
        .modal { background: white; border-radius: 0.75rem; width: 100%; max-width: 700px; padding: 2rem; }
        .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
        .close-btn { background: none; border: none; cursor: pointer; color: #64748b; }
        .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
        .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
        .form-group.full-width { grid-column: span 2; }
        .form-group label { font-weight: 600; color: #334155; font-size: 0.9rem; }
        .form-group input, .form-group select { padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; }
        .modal-footer { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2rem; }
        .cancel-btn { padding: 0.75rem 1.5rem; border: 1px solid #d1d5db; border-radius: 0.5rem; background: white; cursor: pointer; }
        .save-btn { padding: 0.75rem 1.5rem; border: none; border-radius: 0.5rem; background: #0ea5e9; color: white; cursor: pointer; font-weight: 600; }
      `}</style>
    </div>
  );
};

export default SchoolManagement;
