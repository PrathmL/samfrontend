import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart3, TrendingUp, Clock, CheckCircle2, 
  AlertTriangle, Search, Filter, ChevronRight,
  IndianRupee, Building2, MapPin, Briefcase
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';

const SachivWorkMonitoring = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setStatusFilter] = useState('ALL');

  useEffect(() => {
    if (user?.talukaId) {
      fetchWorks();
    }
  }, [user?.talukaId]);

  const fetchWorks = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:8080/api/works/taluka/${user.talukaId}`);
      setWorks(res.data || []);
    } catch (err) {
      console.error('Error fetching works:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE': return '#0ea5e9';
      case 'IN_PROGRESS': return '#3b82f6';
      case 'ON_HOLD': return '#f59e0b';
      case 'COMPLETED': return '#10b981';
      default: return '#64748b';
    }
  };

  const filteredWorks = works.filter(work => {
    const matchesSearch = work.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         work.schoolName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || work.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="work-monitoring">
      <div className="module-header">
        <h1>{t('title_work_monitoring')}</h1>
        <p>Tracking ongoing and completed education projects in your Taluka</p>
      </div>

      <div className="monitor-stats-row">
        <div className="mini-stat-card">
          <span className="mini-stat-label">{t('dash_in_progress')}</span>
          <span className="mini-stat-val">{works.filter(w => w.status === 'IN_PROGRESS' || w.status === 'ACTIVE').length}</span>
        </div>
        <div className="mini-stat-card">
          <span className="mini-stat-label">{t('dash_completed')}</span>
          <span className="mini-stat-val">{works.filter(w => w.status === 'COMPLETED').length}</span>
        </div>
      </div>

      <div className="monitoring-filters">
        <div className="search-box">
          <Search size={20} />
          <input 
            type="text" 
            placeholder={`${t('btn_search')} ${t('menu_active_works')}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="status-pills">
          <button className={filterStatus === 'ALL' ? 'active' : ''} onClick={() => setStatusFilter('ALL')}>All</button>
          <button className={filterStatus === 'ACTIVE' ? 'active' : ''} onClick={() => setStatusFilter('ACTIVE')}>Active</button>
          <button className={filterStatus === 'IN_PROGRESS' ? 'active' : ''} onClick={() => setStatusFilter('IN_PROGRESS')}>In Progress</button>
          <button className={filterStatus === 'COMPLETED' ? 'active' : ''} onClick={() => setStatusFilter('COMPLETED')}>Completed</button>
        </div>
      </div>

      <div className="monitoring-table-container">
        <table className="monitoring-table">
          <thead>
            <tr>
              <th>{t('field_title')}</th>
              <th>{t('field_school')}</th>
              <th>{t('field_progress')}</th>
              <th>{t('field_amount')}</th>
              <th>{t('field_status')}</th>
              <th>{t('field_actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredWorks.map(work => (
              <tr key={work.id}>
                <td>
                  <div className="work-id-tag">{work.workCode}</div>
                  <div className="work-title-main">{work.title}</div>
                </td>
                <td>
                  <div className="school-info-mini">
                    <Building2 size={14} />
                    <span>{work.schoolName}</span>
                  </div>
                </td>
                <td>
                  <div className="progress-cell">
                    <div className="progress-text">{work.progressPercentage}%</div>
                    <div className="progress-bar-mini">
                      <div className="bar-fill" style={{ width: `${work.progressPercentage}%` }}></div>
                    </div>
                  </div>
                </td>
                <td>
                  <div className="financial-cell">
                    <div className="utilized-amt">₹{work.totalUtilized?.toLocaleString()}</div>
                    <div className="total-amt">of ₹{work.sanctionedAmount?.toLocaleString()}</div>
                  </div>
                </td>
                <td>
                  <span className="status-dot-label" style={{ color: getStatusColor(work.status) }}>
                    ● {work.status}
                  </span>
                </td>
                <td>
                  <button className="view-details-btn">{t('btn_view')}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredWorks.length === 0 && !loading && (
          <div className="empty-state" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
            <Briefcase size={48} style={{ marginBottom: '1rem' }} />
            <p>No works found matching your criteria.</p>
          </div>
        )}
      </div>

      <style>{`
        .work-monitoring { padding: 0; }
        .module-header { margin-bottom: 2rem; }
        .module-header h1 { margin: 0; font-size: 1.875rem; color: #1e293b; }
        .module-header p { color: #64748b; margin: 0.5rem 0 0; }

        .monitor-stats-row { display: flex; gap: 1.5rem; margin-bottom: 2rem; }
        .mini-stat-card { background: white; padding: 1rem 1.5rem; border-radius: 0.75rem; border: 1px solid #e2e8f0; min-width: 150px; }
        .mini-stat-label { display: block; font-size: 0.75rem; color: #64748b; text-transform: uppercase; font-weight: 700; margin-bottom: 0.25rem; }
        .mini-stat-val { font-size: 1.5rem; font-weight: 800; color: #1e293b; }

        .monitoring-filters { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; gap: 2rem; }
        .search-box { flex: 1; position: relative; display: flex; align-items: center; }
        .search-box svg { position: absolute; left: 1rem; color: #94a3b8; }
        .search-box input { width: 100%; padding: 0.7rem 1rem 0.75rem 3rem; border: 1px solid #e2e8f0; border-radius: 0.75rem; outline: none; background: white; }

        .status-pills { display: flex; gap: 0.5rem; background: #f1f5f9; padding: 0.3rem; border-radius: 0.75rem; }
        .status-pills button { padding: 0.5rem 1.25rem; border: none; background: none; border-radius: 0.5rem; font-size: 0.85rem; font-weight: 600; color: #64748b; cursor: pointer; transition: all 0.2s; }
        .status-pills button.active { background: white; color: #0ea5e9; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }

        .monitoring-table-container { background: white; border-radius: 1rem; border: 1px solid #e2e8f0; overflow: hidden; }
        .monitoring-table { width: 100%; border-collapse: collapse; }
        .monitoring-table th { background: #f8fafc; padding: 1rem; text-align: left; font-size: 0.8rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; }
        .monitoring-table td { padding: 1rem; border-top: 1px solid #f1f5f9; }

        .work-id-tag { font-size: 0.7rem; font-family: monospace; font-weight: 700; color: #94a3b8; margin-bottom: 0.2rem; }
        .work-title-main { font-weight: 700; color: #1e293b; font-size: 0.95rem; }
        
        .school-info-mini { display: flex; align-items: center; gap: 0.5rem; color: #475569; font-size: 0.9rem; }
        
        .progress-cell { width: 120px; }
        .progress-text { font-size: 0.85rem; font-weight: 700; color: #1e293b; margin-bottom: 0.4rem; }
        .progress-bar-mini { height: 6px; background: #f1f5f9; border-radius: 3px; overflow: hidden; }
        .bar-fill { height: 100%; background: #0ea5e9; border-radius: 3px; }

        .utilized-amt { font-weight: 700; color: #1e293b; font-size: 0.95rem; }
        .total-amt { font-size: 0.75rem; color: #94a3b8; }

        .status-dot-label { font-size: 0.85rem; font-weight: 700; text-transform: uppercase; }
        .view-details-btn { padding: 0.4rem 0.8rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0.4rem; font-size: 0.8rem; font-weight: 600; color: #475569; cursor: pointer; transition: all 0.2s; }
        .view-details-btn:hover { background: #1e293b; color: white; }
      `}</style>
    </div>
  );
};

export default SachivWorkMonitoring;
