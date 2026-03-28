import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  FileText, Download, Filter, 
  BarChart3, PieChart, TrendingUp, 
  Package, DollarSign, AlertCircle,
  Calendar, MapPin, School as SchoolIcon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Reports = () => {
  const { user } = useAuth();
  const [talukas, setTalukas] = useState([]);
  const [schools, setSchools] = useState([]);
  const [filters, setFilters] = useState({
    talukaId: user?.role === 'SACHIV' ? user.talukaId : '',
    schoolId: user?.role === 'CLERK' || user?.role === 'HEADMASTER' ? user.schoolId : '',
    status: 'ALL',
    format: 'pdf'
  });

  const [reportTypes, setReportTypes] = useState([
    { id: 'works', name: 'Work Progress Report', icon: TrendingUp, roles: ['ADMIN', 'SACHIV', 'HEADMASTER', 'CLERK'] },
    { id: 'inventory', name: 'Inventory Stock Report', icon: Package, roles: ['ADMIN', 'SACHIV', 'CLERK'] },
    { id: 'financial', name: 'Financial Expenditure Report', icon: DollarSign, roles: ['ADMIN', 'SACHIV', 'HEADMASTER'] },
    { id: 'blockers', name: 'Work Blockers Report', icon: AlertCircle, roles: ['ADMIN', 'SACHIV', 'HEADMASTER'] },
    { id: 'performance', name: 'Performance Ranking Report', icon: BarChart3, roles: ['ADMIN', 'SACHIV'] },
  ]);

  const [activeReport, setActiveReport] = useState(reportTypes.filter(r => r.roles.includes(user?.role))[0]?.id);

  useEffect(() => {
    fetchTalukas();
    if (filters.talukaId) {
      fetchSchools(filters.talukaId);
    }
  }, []);

  const fetchTalukas = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/talukas');
      setTalukas(res.data);
    } catch (err) {
      console.error('Error fetching talukas:', err);
    }
  };

  const fetchSchools = async (talukaId) => {
    try {
      const res = await axios.get(`http://localhost:8080/api/schools?talukaId=${talukaId}`);
      setSchools(res.data);
    } catch (err) {
      console.error('Error fetching schools:', err);
    }
  };

  const handleTalukaChange = (e) => {
    const id = e.target.value;
    setFilters({ ...filters, talukaId: id, schoolId: '' });
    if (id) {
      fetchSchools(id);
    } else {
      setSchools([]);
    }
  };

  const handleDownload = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.talukaId) params.append('talukaId', filters.talukaId);
      if (filters.schoolId) params.append('schoolId', filters.schoolId);
      if (filters.status && filters.status !== 'ALL') params.append('status', filters.status);
      params.append('format', filters.format);

      const url = `http://localhost:8080/api/reports/${activeReport}/export?${params.toString()}`;
      
      // Open in new tab or trigger download
      window.open(url, '_blank');
    } catch (err) {
      console.error('Error downloading report:', err);
      alert('Failed to generate report. Please try again.');
    }
  };

  const filteredReportTypes = reportTypes.filter(r => r.roles.includes(user?.role));

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h1>Reports Module</h1>
        <p>Generate and export comprehensive reports in multiple formats</p>
      </div>

      <div className="reports-content">
        <div className="report-sidebar">
          <h3>Report Types</h3>
          <div className="report-type-list">
            {filteredReportTypes.map(type => (
              <button 
                key={type.id}
                className={`report-type-btn ${activeReport === type.id ? 'active' : ''}`}
                onClick={() => setActiveReport(type.id)}
              >
                <type.icon size={20} />
                <span>{type.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="report-main">
          <div className="report-filters">
            <h3>Report Filters</h3>
            <div className="filters-grid">
              {user?.role === 'ADMIN' && (
                <div className="filter-group">
                  <label><MapPin size={16} /> Taluka</label>
                  <select value={filters.talukaId} onChange={handleTalukaChange}>
                    <option value="">All Talukas</option>
                    {talukas.map(t => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {(user?.role === 'ADMIN' || user?.role === 'SACHIV') && (
                <div className="filter-group">
                  <label><SchoolIcon size={16} /> School</label>
                  <select 
                    value={filters.schoolId} 
                    onChange={(e) => setFilters({ ...filters, schoolId: e.target.value })}
                    disabled={user?.role === 'ADMIN' && !filters.talukaId}
                  >
                    <option value="">All Schools</option>
                    {schools.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {activeReport === 'works' && (
                <div className="filter-group">
                  <label><TrendingUp size={16} /> Status</label>
                  <select value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value })}>
                    <option value="ALL">All Status</option>
                    <option value="ACTIVE">Active</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="ON_HOLD">On Hold</option>
                  </select>
                </div>
              )}

              <div className="filter-group">
                <label><FileText size={16} /> Export Format</label>
                <select value={filters.format} onChange={(e) => setFilters({ ...filters, format: e.target.value })}>
                  <option value="pdf">PDF Document</option>
                  <option value="excel">Excel Spreadsheet</option>
                  <option value="csv">CSV File</option>
                </select>
              </div>
            </div>

            <div className="report-summary">
              <h4>Report Summary</h4>
              <p>
                <strong>Type:</strong> {reportTypes.find(r => r.id === activeReport)?.name}<br />
                <strong>Scope:</strong> {filters.schoolId ? 'Single School' : filters.talukaId ? 'Taluka-wide' : 'District-wide'}<br />
                <strong>Format:</strong> {filters.format.toUpperCase()}
              </p>
            </div>

            <button className="download-btn" onClick={handleDownload}>
              <Download size={20} />
              Generate & Download Report
            </button>
          </div>

          <div className="report-preview-info">
            <div className="info-icon"><FileText size={48} /></div>
            <h3>Ready to Generate</h3>
            <p>Select your filters and click the button above to generate the report. Reports are generated in real-time with the latest data from the system.</p>
          </div>
        </div>
      </div>

      <style>{`
        .reports-container {
          padding: 0;
        }
        .reports-header {
          margin-bottom: 2rem;
        }
        .reports-header h1 {
          margin: 0;
          font-size: 1.875rem;
          color: #1e293b;
        }
        .reports-header p {
          color: #64748b;
          margin: 0.5rem 0 0;
        }
        .reports-content {
          display: grid;
          grid-template-columns: 300px 1fr;
          gap: 2rem;
          align-items: start;
        }
        .report-sidebar {
          background: white;
          padding: 1.5rem;
          border-radius: 1rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          border: 1px solid #e2e8f0;
        }
        .report-sidebar h3 {
          margin: 0 0 1.5rem;
          font-size: 1.1rem;
          color: #1e293b;
        }
        .report-type-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .report-type-btn {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem;
          background: none;
          border: 1px solid transparent;
          border-radius: 0.5rem;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s;
          text-align: left;
          width: 100%;
        }
        .report-type-btn:hover {
          background: #f1f5f9;
          color: #1e293b;
        }
        .report-type-btn.active {
          background: #e0f2fe;
          color: #0ea5e9;
          border-color: #bae6fd;
          font-weight: 600;
        }
        .report-main {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        .report-filters {
          background: white;
          padding: 1.5rem;
          border-radius: 1rem;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          border: 1px solid #e2e8f0;
        }
        .report-filters h3 {
          margin: 0 0 1.5rem;
          font-size: 1.1rem;
          color: #1e293b;
        }
        .filters-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .filter-group label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          font-weight: 600;
          color: #475569;
        }
        .filter-group select {
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 0.5rem;
          outline: none;
          background-color: #f8fafc;
        }
        .filter-group select:focus {
          border-color: #0ea5e9;
          box-shadow: 0 0 0 2px rgba(14, 165, 233, 0.1);
        }
        .report-summary {
          background: #f8fafc;
          padding: 1rem;
          border-radius: 0.5rem;
          margin-bottom: 2rem;
          border-left: 4px solid #0ea5e9;
        }
        .report-summary h4 {
          margin: 0 0 0.5rem;
          font-size: 0.9rem;
          color: #1e293b;
        }
        .report-summary p {
          margin: 0;
          font-size: 0.875rem;
          color: #475569;
          line-height: 1.5;
        }
        .download-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          width: 100%;
          padding: 1rem;
          background-color: #0ea5e9;
          color: white;
          border: none;
          border-radius: 0.5rem;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }
        .download-btn:hover {
          background-color: #0284c7;
        }
        .report-preview-info {
          background: white;
          padding: 3rem;
          border-radius: 1rem;
          text-align: center;
          border: 2px dashed #e2e8f0;
        }
        .info-icon {
          color: #94a3b8;
          margin-bottom: 1.5rem;
        }
        .report-preview-info h3 {
          margin: 0;
          color: #1e293b;
        }
        .report-preview-info p {
          color: #64748b;
          max-width: 400px;
          margin: 1rem auto 0;
        }
      `}</style>
    </div>
  );
};

export default Reports;
