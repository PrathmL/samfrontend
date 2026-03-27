import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Trash2, X, Check } from 'lucide-react';

const TalukaManagement = () => {
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
      } else {
        await axios.post('http://localhost:8080/api/talukas', formData);
      }
      setIsModalOpen(false);
      setEditingTaluka(null);
      setFormData({ name: '', district: 'Pune', code: '', status: 'Active' });
      fetchTalukas();
    } catch (error) {
      console.error('Error saving taluka:', error);
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
    if (window.confirm('Are you sure you want to delete this taluka?')) {
      try {
        await axios.delete(`http://localhost:8080/api/talukas/${id}`);
        fetchTalukas();
      } catch (error) {
        console.error('Error deleting taluka:', error);
      }
    }
  };

  return (
    <div className="management-container">
      <div className="management-header">
        <h1>Taluka Management</h1>
        <button className="add-button" onClick={() => setIsModalOpen(true)}>
          <Plus size={20} /> Add Taluka
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Taluka Name</th>
              <th>District</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {talukas.map((taluka) => (
              <tr key={taluka.id}>
                <td>{taluka.code}</td>
                <td>{taluka.name}</td>
                <td>{taluka.district}</td>
                <td>
                  <span className={`status-badge ${taluka.status.toLowerCase()}`}>
                    {taluka.status}
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="edit-btn" onClick={() => handleEdit(taluka)}><Edit2 size={18} /></button>
                    <button className="delete-btn" onClick={() => handleDelete(taluka.id)}><Trash2 size={18} /></button>
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
              <h2>{editingTaluka ? 'Edit Taluka' : 'Add New Taluka'}</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Taluka Name</label>
                  <input 
                    type="text" 
                    value={formData.name} 
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>Taluka Code</label>
                  <input 
                    type="text" 
                    value={formData.code} 
                    onChange={(e) => setFormData({...formData, code: e.target.value})}
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>District</label>
                  <input 
                    type="text" 
                    value={formData.district} 
                    readOnly
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
                  {editingTaluka ? 'Update Taluka' : 'Save Taluka'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .management-container {
          padding: 1rem;
        }
        .management-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
        }
        .add-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background-color: #0ea5e9;
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          cursor: pointer;
          font-weight: 600;
        }
        .table-container {
          background: white;
          border-radius: 0.5rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          overflow: hidden;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }
        th {
          background-color: #f1f5f9;
          padding: 1rem;
          font-weight: 600;
          color: #475569;
        }
        td {
          padding: 1rem;
          border-top: 1px solid #f1f5f9;
        }
        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.875rem;
          font-weight: 500;
        }
        .status-badge.active {
          background-color: #dcfce7;
          color: #166534;
        }
        .status-badge.inactive {
          background-color: #fee2e2;
          color: #991b1b;
        }
        .action-buttons {
          display: flex;
          gap: 0.5rem;
        }
        .edit-btn, .delete-btn {
          padding: 0.5rem;
          border: 1px solid #e2e8f0;
          border-radius: 0.25rem;
          background: white;
          cursor: pointer;
          color: #64748b;
        }
        .edit-btn:hover { color: #0ea5e9; border-color: #0ea5e9; }
        .delete-btn:hover { color: #ef4444; border-color: #ef4444; }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        .modal {
          background: white;
          border-radius: 0.75rem;
          width: 100%;
          max-width: 600px;
          padding: 2rem;
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        .close-btn { background: none; border: none; cursor: pointer; color: #64748b; }
        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .form-group label { font-weight: 600; color: #334155; font-size: 0.9rem; }
        .form-group input, .form-group select {
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
        }
        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 2rem;
        }
        .cancel-btn { padding: 0.75rem 1.5rem; border: 1px solid #d1d5db; border-radius: 0.5rem; background: white; cursor: pointer; }
        .save-btn { padding: 0.75rem 1.5rem; border: none; border-radius: 0.5rem; background: #0ea5e9; color: white; cursor: pointer; font-weight: 600; }
      `}</style>
    </div>
  );
};

export default TalukaManagement;
