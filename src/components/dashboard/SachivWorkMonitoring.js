import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart3, TrendingUp, Clock, CheckCircle2, 
  AlertTriangle, Search, Filter, ChevronRight,
  IndianRupee, Building2, MapPin, Briefcase, X, Calendar, Camera
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
  const [selectedWork, setSelectedWork] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleViewDetails = (work) => {
    setSelectedWork(work);
    setIsModalOpen(true);
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
                  <button className="view-details-btn" onClick={() => handleViewDetails(work)}>{t('btn_view')}</button>
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

      {isModalOpen && selectedWork && (
        <div className="modal-overlay">
          <div className="modal modal-xl">
            <div className="modal-header">
              <div className="header-info">
                <span className="req-id">{selectedWork.workCode}</span>
                <h2>{selectedWork.title}</h2>
              </div>
              <button className="close-x" onClick={() => setIsModalOpen(false)}><X size={24} /></button>
            </div>
            <div className="modal-content overflow-y-auto" style={{ maxHeight: '80vh' }}>
              <div className="work-details-layout">
                <div className="details-info-main">
                  <div className="info-grid-3">
                    <div className="info-card-sm">
                      <label><Building2 size={14} /> School</label>
                      <span>{selectedWork.schoolName}</span>
                    </div>
                    <div className="info-card-sm">
                      <label><Calendar size={14} /> Created On</label>
                      <span>{new Date(selectedWork.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="info-card-sm">
                      <label><IndianRupee size={14} /> Budget</label>
                      <span>₹{selectedWork.sanctionedAmount?.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="section-box">
                    <h4>Description</h4>
                    <p>{selectedWork.description}</p>
                  </div>

                  <div className="section-box">
                    <h4>Initial Work Request Photos</h4>
                    <div className="photo-gallery-horizontal">
                      {selectedWork.photoUrls?.map((photo, i) => (
                        <div key={i} className="gallery-photo-item">
                          <img src={`http://localhost:8080${photo.url}`} alt="Site" />
                          {(photo.latitude && photo.longitude) && (
                            <div className="photo-geotag">
                              <MapPin size={10} />
                              <span>{photo.latitude.toFixed(4)}, {photo.longitude.toFixed(4)}</span>
                            </div>
                          )}
                        </div>
                      ))}
                      {(!selectedWork.photoUrls || selectedWork.photoUrls.length === 0) && (
                        <p className="no-data-msg">No initial photos available</p>
                      )}
                    </div>
                  </div>

                  <div className="section-box">
                    <h4>Execution Progress Photos</h4>
                    <div className="updates-timeline">
                      {selectedWork.progressUpdates?.map((update, i) => (
                        <div key={update.id} className="update-item-card">
                          <div className="update-header">
                            <span className="update-pct">{update.progressPercentage}%</span>
                            <span className="update-date">{new Date(update.updatedAt).toLocaleString()}</span>
                            <span className="update-by">by {update.updatedBy}</span>
                          </div>
                          <p className="update-remarks">{update.remarks}</p>
                          <div className="update-photos-grid">
                            {update.photoUrls?.map((photo, pi) => (
                              <div key={pi} className="progress-photo-wrapper">
                                <img src={`http://localhost:8080${photo.url}`} alt="Progress" />
                                {(photo.latitude && photo.longitude) && (
                                  <div className="photo-geotag">
                                    <MapPin size={10} />
                                    <span>{photo.latitude.toFixed(4)}, {photo.longitude.toFixed(4)}</span>
                                  </div>
                                )}
                                {photo.geoLocation && !photo.latitude && (
                                  <div className="photo-geotag">
                                    <MapPin size={10} />
                                    <span>{photo.geoLocation}</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                      {(!selectedWork.progressUpdates || selectedWork.progressUpdates.length === 0) && (
                        <p className="no-data-msg">No progress updates submitted yet.</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="details-sidebar">
                  <div className="sidebar-sticky-top">
                    <div className="progress-radial-box">
                      <label>Overall Progress</label>
                      <div className="progress-big-val">{selectedWork.progressPercentage}%</div>
                      <div className="progress-bar-big">
                        <div className="fill" style={{ width: `${selectedWork.progressPercentage}%` }}></div>
                      </div>
                    </div>

                    <div className="financial-breakdown">
                      <h4>Financials</h4>
                      <div className="fin-row">
                        <span>Sanctioned</span>
                        <strong>₹{selectedWork.sanctionedAmount?.toLocaleString()}</strong>
                      </div>
                      <div className="fin-row">
                        <span>Utilized</span>
                        <strong className="text-blue">₹{selectedWork.totalUtilized?.toLocaleString()}</strong>
                      </div>
                      <div className="fin-row total">
                        <span>Balance</span>
                        <strong>₹{(selectedWork.sanctionedAmount - selectedWork.totalUtilized)?.toLocaleString()}</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .work-monitoring { padding: 0; }
        .module-header { margin-bottom: 2rem; }
        .module-header h1 { margin: 0; font-size: 1.75rem; color: #1e293b; }
        .module-header p { margin: 0.25rem 0 0; color: #64748b; }

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

        .monitoring-table-container { background: white; border-radius: 1rem; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
        .monitoring-table { width: 100%; border-collapse: collapse; }
        .monitoring-table th { background: #f8fafc; padding: 1rem; text-align: left; font-size: 0.8rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid #e2e8f0; }
        .monitoring-table td { padding: 1rem; border-top: 1px solid #f1f5f9; }

        .work-id-tag { font-size: 0.7rem; font-family: monospace; font-weight: 700; color: #94a3b8; margin-bottom: 0.2rem; }
        .work-title-main { font-weight: 700; color: #1e293b; font-size: 0.95rem; }
        .school-info-mini { display: flex; align-items: center; gap: 0.5rem; color: #475569; font-size: 0.9rem; }
        .progress-text { font-size: 0.85rem; font-weight: 700; color: #1e293b; margin-bottom: 0.4rem; }
        .progress-bar-mini { height: 6px; background: #f1f5f9; border-radius: 3px; overflow: hidden; }
        .bar-fill { height: 100%; background: #0ea5e9; border-radius: 3px; }
        .utilized-amt { font-weight: 700; color: #1e293b; font-size: 0.95rem; }
        .total-amt { font-size: 0.75rem; color: #94a3b8; }
        .status-dot-label { font-size: 0.85rem; font-weight: 700; text-transform: uppercase; }
        .view-details-btn { padding: 0.4rem 0.8rem; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 0.4rem; font-size: 0.8rem; font-weight: 600; color: #475569; cursor: pointer; transition: all 0.2s; }
        .view-details-btn:hover { background: #1e293b; color: white; }

        /* Details Modal Styles */
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 23, 42, 0.75); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 2000; padding: 2rem; }
        .modal-xl { max-width: 1200px !important; width: 100%; }
        .modal { background: white; border-radius: 1.5rem; overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25); }
        .modal-header { padding: 1.5rem 2rem; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; background: #f8fafc; }
        .header-info { display: flex; align-items: center; gap: 1rem; }
        .req-id { font-family: monospace; font-weight: 800; color: #94a3b8; background: white; padding: 0.25rem 0.75rem; border-radius: 0.5rem; border: 1px solid #e2e8f0; }
        .close-x { background: transparent; border: none; color: #64748b; cursor: pointer; padding: 0.5rem; border-radius: 0.5rem; }
        .close-x:hover { background: #f1f5f9; color: #1e293b; }

        .work-details-layout { display: grid; grid-template-columns: 1fr 320px; min-height: 500px; }
        .details-info-main { padding: 2rem; border-right: 1px solid #e2e8f0; }
        
        .info-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-bottom: 2rem; }
        .info-card-sm { background: #f8fafc; padding: 1rem; border-radius: 0.75rem; border: 1px solid #e2e8f0; }
        .info-card-sm label { display: flex; align-items: center; gap: 0.4rem; font-size: 0.7rem; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 0.4rem; }
        .info-card-sm span { font-weight: 700; color: #1e293b; font-size: 1rem; }

        .section-box { margin-bottom: 2.5rem; }
        .section-box h4 { font-size: 0.9rem; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 1rem; }
        .section-box p { line-height: 1.6; color: #334155; }

        .photo-gallery-horizontal { display: flex; gap: 1rem; overflow-x: auto; padding-bottom: 1rem; }
        .gallery-photo-item { flex: 0 0 200px; height: 140px; border-radius: 0.75rem; overflow: hidden; border: 1px solid #e2e8f0; }
        .gallery-photo-item img { width: 100%; height: 100%; object-fit: cover; }
        
        .gallery-photo-item { position: relative; }
        .photo-geotag { position: absolute; bottom: 0; left: 0; right: 0; background: rgba(0,0,0,0.6); color: white; padding: 0.2rem 0.5rem; font-size: 0.65rem; display: flex; align-items: center; gap: 0.25rem; }
        .progress-photo-wrapper { position: relative; border-radius: 0.5rem; overflow: hidden; height: 100px; }
        .progress-photo-wrapper img { width: 100%; height: 100%; object-fit: cover; }

        .updates-timeline { display: flex; flex-direction: column; gap: 1.5rem; }
        .update-item-card { border-left: 3px solid #0ea5e9; padding-left: 1.5rem; position: relative; }
        .update-item-card::before { content: ''; position: absolute; left: -8px; top: 0; width: 13px; height: 13px; border-radius: 50%; background: #0ea5e9; border: 3px solid white; }
        
        .update-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem; }
        .update-pct { font-weight: 800; color: #0ea5e9; background: #f0f9ff; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.85rem; }
        .update-date { font-size: 0.8rem; color: #94a3b8; }
        .update-by { font-size: 0.8rem; font-weight: 600; color: #64748b; }
        .update-remarks { font-size: 0.95rem; color: #475569; margin-bottom: 1rem; }
        
        .update-photos-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 0.75rem; }
        .update-photos-grid img { width: 100%; height: 100px; object-fit: cover; border-radius: 0.5rem; border: 1px solid #f1f5f9; }

        .details-sidebar { padding: 2rem; background: #f8fafc; }
        .sidebar-sticky-top { position: sticky; top: 0; }
        
        .progress-radial-box { text-align: center; margin-bottom: 2.5rem; padding: 1.5rem; background: white; border-radius: 1rem; border: 1px solid #e2e8f0; }
        .progress-big-val { font-size: 3rem; font-weight: 800; color: #1e293b; line-height: 1; margin: 0.5rem 0; }
        .progress-bar-big { height: 12px; background: #f1f5f9; border-radius: 6px; overflow: hidden; margin-top: 1rem; }
        .progress-bar-big .fill { height: 100%; background: linear-gradient(90deg, #3b82f6, #0ea5e9); border-radius: 6px; }

        .financial-breakdown h4 { font-size: 0.8rem; color: #64748b; text-transform: uppercase; margin-bottom: 1rem; }
        .fin-row { display: flex; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid #e2e8f0; font-size: 0.9rem; }
        .fin-row.total { border-top: 2px solid #e2e8f0; border-bottom: none; margin-top: 0.5rem; padding-top: 1rem; }
        .text-blue { color: #0ea5e9; }
        .no-data-msg { font-style: italic; color: #94a3b8; font-size: 0.9rem; }
      `}</style>
    </div>
  );
};

export default SachivWorkMonitoring;
