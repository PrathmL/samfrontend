import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart3, TrendingUp, Clock, CheckCircle2, 
  AlertTriangle, Search, Filter, ChevronRight,
  IndianRupee, Building2, MapPin, X, Camera, Calendar
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const AdminWorkMonitoring = () => {
  const { t } = useTranslation();
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setStatusFilter] = useState('ALL');
  const [selectedWork, setSelectedWork] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchWorks();
  }, []);

  const fetchWorks = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:8080/api/works');
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
    <div className="admin-page-container">
      <div className="dashboard-header">
        <div className="header-text">
          <h1>{t('title_work_monitoring')}</h1>
          <p>Comprehensive tracking of all ongoing and completed education projects</p>
        </div>
        <div className="header-actions">
          <div className="stats-mini-container">
            <div className="stat-mini-item">
              <span className="label">{t('dash_in_progress')}</span>
              <span className="value">{works.filter(w => w.status === 'IN_PROGRESS' || w.status === 'ACTIVE').length}</span>
            </div>
            <div className="stat-mini-item">
              <span className="label">{t('dash_completed')}</span>
              <span className="value text-success">{works.filter(w => w.status === 'COMPLETED').length}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="section-card filter-card">
        <div className="filter-content">
          <div className="search-box">
            <Search size={18} />
            <input 
              type="text" 
              placeholder={`${t('btn_search')} ${t('menu_active_works')}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="status-tabs-wrapper">
            <div className="status-tabs">
              {['ALL', 'ACTIVE', 'IN_PROGRESS', 'COMPLETED'].map(status => (
                <button 
                  key={status}
                  className={`tab-btn ${filterStatus === status ? 'active' : ''}`} 
                  onClick={() => setStatusFilter(status)}
                >
                  {status.charAt(0) + status.slice(1).toLowerCase().replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="section-card table-card">
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t('field_title')}</th>
                <th>{t('field_school')}</th>
                <th className="hide-tablet">{t('field_progress')}</th>
                <th>{t('field_amount')}</th>
                <th>{t('field_status')}</th>
                <th>{t('field_actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredWorks.map(work => (
                <tr key={work.id}>
                  <td>
                    <div className="work-title-cell">
                      <span className="work-code"># {work.workCode}</span>
                      <span className="work-title">{work.title}</span>
                    </div>
                  </td>
                  <td>
                    <div className="school-info-cell">
                      <Building2 size={16} className="text-slate-400" />
                      <span>{work.schoolName}</span>
                    </div>
                  </td>
                  <td className="hide-tablet">
                    <div className="progress-cell">
                      <div className="progress-label">
                        <span className="pct">{work.progressPercentage}%</span>
                      </div>
                      <div className="progress-track">
                        <div className="progress-fill" style={{ width: `${work.progressPercentage}%` }}></div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="financial-cell">
                      <div className="utilized">₹{work.totalUtilized?.toLocaleString('en-IN')}</div>
                      <div className="total hide-mobile">of ₹{work.sanctionedAmount?.toLocaleString('en-IN')}</div>
                    </div>
                  </td>
                  <td>
                    <span className="status-indicator" style={{ '--status-color': getStatusColor(work.status) }}>
                      <span className="dot"></span>
                      <span className="status-text">{work.status}</span>
                    </span>
                  </td>
                  <td>
                    <button className="btn-icon-only primary-ghost" onClick={() => handleViewDetails(work)} title={t('btn_view')}>
                      <ChevronRight size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredWorks.length === 0 && !loading && (
            <div className="empty-state">
              <BarChart3 size={48} />
              <p>No works found matching your criteria</p>
            </div>
          )}
        </div>
      </div>

      {isModalOpen && selectedWork && (
        <div className="modal-overlay">
          <div className="modal-container modal-xl">
            <div className="modal-header">
              <div className="modal-title-area">
                <span className="modal-tag"># {selectedWork.workCode}</span>
                <h2>{selectedWork.title}</h2>
              </div>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}><X size={24} /></button>
            </div>
            <div className="modal-body custom-scrollbar">
              <div className="modal-layout">
                <div className="modal-main">
                  <div className="info-grid">
                    <div className="info-item">
                      <div className="info-icon blue"><Building2 size={20} /></div>
                      <div className="info-text">
                        <label>School</label>
                        <span>{selectedWork.schoolName}</span>
                      </div>
                    </div>
                    <div className="info-item">
                      <div className="info-icon orange"><Calendar size={20} /></div>
                      <div className="info-text">
                        <label>Created On</label>
                        <span>{new Date(selectedWork.createdAt).toLocaleDateString('en-IN')}</span>
                      </div>
                    </div>
                    <div className="info-item">
                      <div className="info-icon green"><IndianRupee size={20} /></div>
                      <div className="info-text">
                        <label>Budget</label>
                        <span>₹{selectedWork.sanctionedAmount?.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="content-section">
                    <h4 className="section-title">Description</h4>
                    <p className="description-text">{selectedWork.description}</p>
                  </div>

                  <div className="content-section">
                    <h4 className="section-title">Initial Site Photos</h4>
                    <div className="photo-scroll-container">
                      <div className="photo-grid-horizontal">
                        {selectedWork.photoUrls?.map((photo, i) => (
                          <div key={i} className="photo-card-v2">
                            <img src={`http://localhost:8080${photo.url}`} alt="Site" />
                            {(photo.latitude && photo.longitude) && (
                              <div className="geotag-overlay">
                                <MapPin size={12} />
                                <span>{photo.latitude.toFixed(4)}, {photo.longitude.toFixed(4)}</span>
                              </div>
                            )}
                          </div>
                        ))}
                        {(!selectedWork.photoUrls || selectedWork.photoUrls.length === 0) && (
                          <div className="no-photos-placeholder">
                            <Camera size={32} />
                            <p>{t('no_initial_photos')}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="content-section">
                    <h4 className="section-title">Execution Timeline</h4>
                    <div className="timeline-v2">
                      {selectedWork.progressUpdates?.map((update, i) => (
                        <div key={update.id} className="timeline-item-v2">
                          <div className="timeline-dot-v2"></div>
                          <div className="timeline-content-v2">
                            <div className="update-header-v2">
                              <span className="update-badge-v2">{update.progressPercentage}%</span>
                              <div className="update-meta-v2">
                                <span className="author">by {update.updatedBy}</span>
                                <span className="date">{new Date(update.updatedAt).toLocaleDateString('en-IN')}</span>
                              </div>
                            </div>
                            <p className="update-remarks-v2">{update.remarks}</p>
                            {update.photoUrls?.length > 0 && (
                              <div className="update-photos-v2">
                                {update.photoUrls.map((photo, pi) => (
                                  <div key={pi} className="update-img-wrapper">
                                    <img src={`http://localhost:8080${photo.url}`} alt="Progress" />
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      {(!selectedWork.progressUpdates || selectedWork.progressUpdates.length === 0) && (
                        <div className="empty-timeline">
                          <Clock size={24} />
                          <p>No progress updates submitted yet.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="modal-sidebar">
                  <div className="sticky-sidebar">
                    <div className="progress-viz-card">
                      <label className="viz-label">Project Completion</label>
                      <div className="viz-container">
                        <div className="circular-progress-net">
                          <svg viewBox="0 0 36 36" className="circular-chart">
                            <path className="circle-bg"
                              d="M18 2.0845
                                a 15.9155 15.9155 0 0 1 0 31.831
                                a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <path className="circle"
                              strokeDasharray={`${selectedWork.progressPercentage}, 100`}
                              d="M18 2.0845
                                a 15.9155 15.9155 0 0 1 0 31.831
                                a 15.9155 15.9155 0 0 1 0 -31.831"
                            />
                            <text x="18" y="20.35" className="percentage">{selectedWork.progressPercentage}%</text>
                          </svg>
                        </div>
                        <div className="viz-status">
                          <span className="status-label">Current Status</span>
                          <span className="status-value" style={{ color: getStatusColor(selectedWork.status) }}>{selectedWork.status}</span>
                        </div>
                      </div>
                    </div>

                    <div className="financial-breakdown-card">
                      <h4 className="card-title">Financial Breakdown</h4>
                      <div className="fin-list">
                        <div className="fin-row-v2">
                          <span className="label">Sanctioned</span>
                          <span className="val font-bold">₹{selectedWork.sanctionedAmount?.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="fin-row-v2 highlight-blue">
                          <span className="label">Total Utilized</span>
                          <span className="val font-bold">₹{selectedWork.totalUtilized?.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="fin-row-v2 total-row">
                          <span className="label">Balance</span>
                          <span className="val font-extrabold">₹{(selectedWork.sanctionedAmount - selectedWork.totalUtilized)?.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary-v2" onClick={() => setIsModalOpen(false)}>{t('btn_close')}</button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .admin-page-container {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          color: #1e293b;
          width: 100%;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 0.5rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .header-text h1 {
          font-size: clamp(1.25rem, 5vw, 1.75rem);
          font-weight: 800;
          margin: 0;
          letter-spacing: -0.02em;
        }

        .header-text p {
          color: #64748b;
          margin: 0.25rem 0 0;
          font-size: 0.95rem;
        }

        .stats-mini-container {
          display: flex;
          gap: 0.75rem;
        }

        .stat-mini-item {
          background: white;
          padding: 0.5rem 1rem;
          border-radius: 0.75rem;
          border: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          min-width: 100px;
        }

        .stat-mini-item .label {
          font-size: 0.65rem;
          text-transform: uppercase;
          font-weight: 700;
          color: #64748b;
        }

        .stat-mini-item .value {
          font-size: 1.1rem;
          font-weight: 800;
          color: #1e293b;
        }

        /* Filter Card */
        .filter-card {
          background: white;
          border-radius: 1rem;
          border: 1px solid #e2e8f0;
          padding: 1.25rem;
        }

        .filter-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1.5rem;
          flex-wrap: wrap;
        }

        .search-box {
          flex: 1;
          min-width: 250px;
          position: relative;
          display: flex;
          align-items: center;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 0.75rem;
          padding: 0 1rem;
          transition: all 0.2s;
        }

        .search-box:focus-within {
          border-color: #3b82f6;
          background: white;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .search-box input {
          border: none;
          background: transparent;
          padding: 0.7rem 0.75rem;
          outline: none;
          width: 100%;
          font-size: 0.95rem;
        }

        .status-tabs-wrapper {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          max-width: 100%;
        }

        .status-tabs {
          display: flex;
          background: #f1f5f9;
          padding: 0.25rem;
          border-radius: 0.75rem;
          gap: 0.25rem;
          width: max-content;
        }

        .tab-btn {
          padding: 0.5rem 1rem;
          border: none;
          background: transparent;
          border-radius: 0.5rem;
          font-size: 0.85rem;
          font-weight: 600;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .tab-btn.active {
          background: white;
          color: #3b82f6;
          box-shadow: 0 1px 2px rgba(0,0,0,0.05);
        }

        /* Table */
        .admin-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .admin-table th {
          background: #f8fafc;
          padding: 1rem;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          color: #64748b;
          border-bottom: 1px solid #f1f5f9;
        }

        .admin-table td {
          padding: 1rem;
          border-bottom: 1px solid #f1f5f9;
          vertical-align: middle;
        }

        .work-title-cell { display: flex; flex-direction: column; }
        .work-code { font-family: monospace; font-size: 0.7rem; color: #94a3b8; font-weight: 700; }
        .work-title { font-weight: 700; color: #1e293b; font-size: 0.9rem; }

        .progress-cell { width: 100px; }
        .progress-track { height: 6px; background: #f1f5f9; border-radius: 3px; overflow: hidden; }
        .progress-fill { height: 100%; background: #3b82f6; }

        .financial-cell .utilized { font-weight: 700; font-size: 0.9rem; }
        .financial-cell .total { font-size: 0.75rem; color: #94a3b8; }

        .status-indicator { display: inline-flex; align-items: center; gap: 0.4rem; font-size: 0.75rem; font-weight: 700; color: var(--status-color); }
        .status-indicator .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--status-color); }

        .btn-icon-only {
          padding: 0.5rem;
          border-radius: 0.5rem;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          color: #64748b;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-icon-only:hover { background: #1e293b; color: white; border-color: #1e293b; }

        /* Modal Overlay */
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(4px);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          padding: 1rem;
        }

        .modal-container {
          background: white;
          border-radius: 1.25rem;
          width: 100%;
          max-width: 1100px;
          max-height: 95vh;
          display: flex;
          flex-direction: column;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          overflow: hidden;
        }

        .modal-header {
          padding: 1.25rem 1.5rem;
          background: #f8fafc;
          border-bottom: 1px solid #f1f5f9;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-shrink: 0;
        }

        .modal-title-area h2 { margin: 0; font-size: 1.25rem; font-weight: 800; color: #1e293b; }
        .modal-tag { font-family: monospace; font-size: 0.75rem; color: #94a3b8; font-weight: 700; }

        .close-btn { background: transparent; border: none; color: #94a3b8; cursor: pointer; padding: 4px; border-radius: 6px; }
        .close-btn:hover { background: #fee2e2; color: #ef4444; }

        .modal-body { padding: 0; overflow-y: auto; flex: 1; }
        .modal-layout { display: grid; grid-template-columns: 1fr 340px; }

        .modal-main { padding: 1.5rem; border-right: 1px solid #f1f5f9; }
        .modal-sidebar { padding: 1.5rem; background: #fcfcfd; }

        .info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
        .info-item { display: flex; gap: 0.75rem; align-items: center; background: white; padding: 0.75rem; border-radius: 0.75rem; border: 1px solid #f1f5f9; }
        .info-icon { width: 40px; height: 40px; border-radius: 0.6rem; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .info-icon.blue { background: #eff6ff; color: #3b82f6; }
        .info-icon.orange { background: #fff7ed; color: #f97316; }
        .info-icon.green { background: #f0fdf4; color: #10b981; }
        .info-text label { display: block; font-size: 0.65rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; }
        .info-text span { font-weight: 700; color: #334155; font-size: 0.9rem; }

        .content-section { margin-bottom: 2rem; }
        .section-title { font-size: 0.8rem; font-weight: 700; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em; margin-bottom: 1rem; }
        .description-text { line-height: 1.6; color: #475569; background: #f8fafc; padding: 1rem; border-radius: 0.75rem; border: 1px solid #e2e8f0; margin: 0; font-size: 0.95rem; }

        .photo-scroll-container { overflow-x: auto; padding-bottom: 0.5rem; }
        .photo-grid-horizontal { display: flex; gap: 1rem; width: max-content; }
        .photo-card-v2 { width: 220px; height: 150px; border-radius: 0.75rem; overflow: hidden; position: relative; border: 1px solid #e2e8f0; flex-shrink: 0; }
        .photo-card-v2 img { width: 100%; height: 100%; object-fit: cover; }
        .geotag-overlay { position: absolute; bottom: 0; left: 0; right: 0; background: rgba(15, 23, 42, 0.7); color: white; padding: 0.35rem 0.5rem; font-size: 0.65rem; display: flex; align-items: center; gap: 4px; }

        /* Timeline v2 */
        .timeline-v2 { display: flex; flex-direction: column; gap: 1rem; }
        .timeline-item-v2 { display: flex; gap: 1rem; position: relative; }
        .timeline-dot-v2 { width: 10px; height: 10px; border-radius: 50%; background: #3b82f6; margin-top: 6px; flex-shrink: 0; position: relative; z-index: 1; border: 2px solid white; box-shadow: 0 0 0 2px #3b82f6; }
        .timeline-item-v2:not(:last-child)::after { content: ''; position: absolute; left: 4px; top: 16px; bottom: -10px; width: 2px; background: #e2e8f0; }
        .timeline-content-v2 { flex: 1; background: white; padding: 1rem; border-radius: 0.75rem; border: 1px solid #f1f5f9; }
        .update-header-v2 { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
        .update-badge-v2 { background: #3b82f6; color: white; font-weight: 800; font-size: 0.75rem; padding: 0.2rem 0.5rem; border-radius: 4px; }
        .update-meta-v2 { display: flex; gap: 0.75rem; font-size: 0.75rem; color: #94a3b8; font-weight: 600; }
        .update-remarks-v2 { font-size: 0.9rem; color: #475569; margin: 0 0 0.75rem 0; }
        .update-photos-v2 { display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr)); gap: 0.5rem; }
        .update-img-wrapper { height: 80px; border-radius: 0.5rem; overflow: hidden; }
        .update-img-wrapper img { width: 100%; height: 100%; object-fit: cover; }

        /* Circular Progress Net */
        .progress-viz-card { background: white; padding: 1.5rem; border-radius: 1rem; border: 1px solid #e2e8f0; margin-bottom: 1rem; text-align: center; }
        .viz-label { display: block; font-size: 0.75rem; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 1.5rem; }
        .viz-container { display: flex; flex-direction: column; align-items: center; gap: 1.5rem; }
        
        .circular-progress-net { width: 140px; height: 140px; }
        .circular-chart { display: block; margin: 0 auto; max-width: 100%; max-height: 250px; }
        .circle-bg { fill: none; stroke: #f1f5f9; stroke-width: 2.8; }
        .circle { fill: none; stroke-width: 2.8; stroke-linecap: round; stroke: #3b82f6; transition: stroke-dasharray 0.6s ease; }
        .percentage { fill: #1e293b; font-family: sans-serif; font-size: 0.5rem; text-anchor: middle; font-weight: 800; }

        .viz-status { display: flex; flex-direction: column; gap: 4px; }
        .viz-status .status-label { font-size: 0.7rem; color: #94a3b8; font-weight: 600; }
        .viz-status .status-value { font-weight: 800; font-size: 1rem; text-transform: uppercase; }

        /* Financial Breakdown Card */
        .financial-breakdown-card { background: white; padding: 1.25rem; border-radius: 1rem; border: 1px solid #e2e8f0; }
        .fin-list { display: flex; flex-direction: column; gap: 0.75rem; }
        .fin-row-v2 { display: flex; justify-content: space-between; font-size: 0.85rem; padding: 0.5rem 0; border-bottom: 1px dashed #f1f5f9; }
        .highlight-blue { color: #3b82f6; }
        .total-row { border-top: 1px solid #e2e8f0; border-bottom: none; margin-top: 0.25rem; padding-top: 0.75rem; color: #1e293b; }

        .modal-footer { padding: 1rem 1.5rem; border-top: 1px solid #f1f5f9; display: flex; justify-content: flex-end; flex-shrink: 0; }
        .btn-secondary-v2 { background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; padding: 0.6rem 1.5rem; border-radius: 0.5rem; font-weight: 700; cursor: pointer; font-size: 0.9rem; }

        /* Utility classes */
        .font-extrabold { font-weight: 800; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 3px; }

        @media (max-width: 1024px) {
          .modal-layout { grid-template-columns: 1fr; }
          .modal-main { border-right: none; }
          .modal-sidebar { border-top: 1px solid #f1f5f9; }
          .sticky-sidebar { position: static; display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; align-items: start; }
          .progress-viz-card { margin-bottom: 0; }
        }

        @media (max-width: 768px) {
          .hide-tablet { display: none; }
          .dashboard-header { flex-direction: column; align-items: flex-start; }
          .stats-mini-container { width: 100%; }
          .stat-mini-item { flex: 1; }
          .filter-content { flex-direction: column; align-items: stretch; }
          .search-box { min-width: 0; }
          .status-tabs-wrapper { margin: 0 -1.25rem; padding: 0 1.25rem; }
          
          .sticky-sidebar { grid-template-columns: 1fr; }
          .circular-progress-net { width: 120px; height: 120px; }
        }

        @media (max-width: 480px) {
          .hide-mobile { display: none; }
          .status-text { display: none; }
          .status-indicator .dot { width: 10px; height: 10px; }
          .admin-table th, .admin-table td { padding: 0.75rem; }
          .modal-overlay { padding: 0; }
          .modal-container { border-radius: 0; max-height: 100vh; height: 100vh; }
          .modal-header { padding: 1rem; }
          .modal-body { padding: 0; }
          .modal-main, .modal-sidebar { padding: 1rem; }
          .info-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default AdminWorkMonitoring;
