import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  CheckCircle, Clock, Building2, Search, Filter, 
  ChevronRight, FileText, AlertCircle, Calendar,
  ClipboardCheck, MapPin, CheckCircle2, Download,
  ExternalLink, ArrowLeft, X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { showErrorAlert } from '../../utils/sweetAlertUtils';
import WorkVerification from './WorkVerification';

const SachivWorkVerification = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [works, setWorks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending', 'verified'
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWork, setSelectedWork] = useState(null);
  const [showVerificationForm, setShowVerificationForm] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);
  const [selectedCert, setSelectedCert] = useState(null);

  useEffect(() => {
    if (user?.talukaId) {
      fetchWorks();
    }
  }, [user?.talukaId, activeTab]);

  const fetchWorks = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:8080/api/works/taluka/${user.talukaId}`);
      let allWorks = res.data || [];
      
      if (activeTab === 'pending') {
        // Show works pending closure OR completed works that somehow don't have a certificate yet
        setWorks(allWorks.filter(w => w.status === 'PENDING_CLOSURE' || (w.status === 'COMPLETED' && !w.hasCertificate)));
      } else if (activeTab === 'verified') {
        // Only show verified works that actually have certificates
        setWorks(allWorks.filter(w => w.status === 'COMPLETED' && w.hasCertificate));
      }
    } catch (err) {
      console.error('Error fetching works:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStartVerification = (work) => {
    setSelectedWork(work);
    setShowVerificationForm(true);
  };

  const handleViewCert = async (work) => {
    try {
      setLoading(true);
      const res = await axios.get(`http://localhost:8080/api/works/verification/${work.id}/certificate`);
      setSelectedCert(res.data);
      setSelectedWork(work);
      setShowCertModal(true);
    } catch (err) {
      showErrorAlert('Error', 'Certificate not found or failed to load.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationComplete = () => {
    setShowVerificationForm(false);
    setSelectedWork(null);
    fetchWorks();
  };

  const filteredWorks = works.filter(w => 
    w.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.workCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    w.schoolName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (showVerificationForm && selectedWork) {
    return (
      <div className="verification-flow">
        <button className="back-nav-btn" onClick={() => setShowVerificationForm(false)}>
          <ArrowLeft size={20} /> Back to List
        </button>
        <WorkVerification 
          work={selectedWork} 
          onComplete={handleVerificationComplete}
          onCancel={() => setShowVerificationForm(false)}
        />
      </div>
    );
  }

  return (
    <div className="sachiv-verification-container">
      <div className="module-header">
        <h1>{t('menu_verification')}</h1>
        <p>Manage and verify completed works awaiting closure</p>
      </div>

      <div className="verification-tabs">
        <button 
          className={`v-tab ${activeTab === 'pending' ? 'active' : ''}`}
          onClick={() => setActiveTab('pending')}
        >
          <Clock size={18} />
          <span>Pending Verification</span>
          {activeTab === 'pending' && works.length > 0 && <span className="count-badge">{works.length}</span>}
        </button>
        <button 
          className={`v-tab ${activeTab === 'verified' ? 'active' : ''}`}
          onClick={() => setActiveTab('verified')}
        >
          <CheckCircle2 size={18} />
          <span>Verified & Completed</span>
        </button>
      </div>

      <div className="list-controls">
        <div className="search-bar">
          <Search size={20} />
          <input 
            type="text" 
            placeholder="Search by code, title or school..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="works-list-grid">
        {filteredWorks.map(work => (
          <div key={work.id} className="work-verification-card">
            <div className="card-top">
              <span className="work-code">{work.workCode}</span>
              <span className="school-name"><Building2 size={14} /> {work.schoolName}</span>
            </div>
            <h3>{work.title}</h3>
            
            <div className="work-meta-grid">
              <div className="meta-item">
                <label>Budget</label>
                <span>₹{work.sanctionedAmount?.toLocaleString()}</span>
              </div>
              <div className="meta-item">
                <label>Utilized</label>
                <span className="text-blue">₹{work.totalUtilized?.toLocaleString()}</span>
              </div>
              <div className="meta-item">
                <label>Completed On</label>
                <span>{new Date(work.completedAt || work.lastUpdateAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="card-actions">
              {activeTab === 'pending' ? (
                <button className="verify-now-btn" onClick={() => handleStartVerification(work)}>
                  <ClipboardCheck size={18} /> Verify Now <ChevronRight size={16} />
                </button>
              ) : (
                <div className="verified-actions">
                  <span className="status-badge completed">
                    <CheckCircle2 size={14} /> Verified
                  </span>
                  <button className="view-cert-btn" onClick={() => handleViewCert(work)}>
                    <FileText size={16} /> Certificate
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {filteredWorks.length === 0 && !loading && (
          <div className="empty-verification">
            <div className="empty-icon">
              {activeTab === 'pending' ? <CheckCircle2 size={48} /> : <FileText size={48} />}
            </div>
            <h3>{activeTab === 'pending' ? 'All caught up!' : 'No verified works yet'}</h3>
            <p>
              {activeTab === 'pending' 
                ? 'No works are currently awaiting your verification.' 
                : 'Works you verify and complete will appear here.'}
            </p>
          </div>
        )}
      </div>

      {showCertModal && selectedCert && selectedWork && (
        <div className="modal-overlay">
          <div className="modal modal-lg">
            <div className="modal-header">
              <h2>Completion Certificate</h2>
              <button className="close-btn" onClick={() => setShowCertModal(false)}><X size={24} /></button>
            </div>
            <div className="modal-content">
              <div className="certificate-view">
                <div className="cert-preview-box">
                  <div className="cert-header">
                    <img src="/logo192.png" alt="Logo" width="50" />
                    <h3>E-SAMRUDDHA SHALA PROJECT</h3>
                    <h4>WORK COMPLETION & HANDOVER CERTIFICATE</h4>
                  </div>
                  
                  <div className="cert-meta">
                    <div className="cert-row"><span>Certificate No:</span> <strong>{selectedCert.certificateNumber}</strong></div>
                    <div className="cert-row"><span>Date Issued:</span> <strong>{new Date(selectedCert.createdAt).toLocaleDateString()}</strong></div>
                  </div>

                  <div className="cert-details">
                    <div className="cert-row"><span>Work Code:</span> {selectedWork.workCode}</div>
                    <div className="cert-row"><span>Project Title:</span> {selectedWork.title}</div>
                    <div className="cert-row"><span>School:</span> {selectedWork.schoolName}</div>
                    <div className="cert-row"><span>Final Completion Date:</span> {new Date(selectedCert.completionDate).toLocaleDateString()}</div>
                  </div>

                  <div className="cert-financials">
                    <h5>Financial Settlement Summary</h5>
                    <div className="fin-table">
                      <div className="fin-tr"><span>Sanctioned Amount:</span> <strong>₹{selectedCert.sanctionedFunds?.toLocaleString()}</strong></div>
                      <div className="fin-tr"><span>Actual Expenditure:</span> <strong>₹{selectedCert.actualExpenditure?.toLocaleString()}</strong></div>
                      <div className="fin-tr highlighted"><span>Unspent Balance:</span> <strong>₹{selectedCert.unspentFunds?.toLocaleString()}</strong></div>
                    </div>
                  </div>

                  <div className="cert-signatures">
                    <div className="sign-col">
                      <div className="sign-pad-view">{selectedCert.sachivESign}</div>
                      <label>Sachiv (Verified)</label>
                    </div>
                    <div className="sign-col">
                      <div className="sign-pad-view placeholder">Digitally Signed</div>
                      <label>Head Master</label>
                    </div>
                  </div>
                </div>
                
                <div className="cert-actions">
                  <button className="download-cert-btn" onClick={() => window.print()}>
                    <Download size={18} /> Download PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .sachiv-verification-container { padding: 0; }
        .module-header { margin-bottom: 2rem; }
        .module-header h1 { margin: 0; font-size: 1.75rem; color: #1e293b; }
        .module-header p { margin: 0.25rem 0 0; color: #64748b; }

        .verification-tabs { display: flex; gap: 1rem; margin-bottom: 2rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 0.5rem; }
        .v-tab { display: flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1.5rem; background: none; border: none; border-bottom: 3px solid transparent; color: #64748b; font-weight: 600; cursor: pointer; transition: all 0.2s; }
        .v-tab:hover { color: #0ea5e9; }
        .v-tab.active { color: #0ea5e9; border-bottom-color: #0ea5e9; }
        .count-badge { background: #0ea5e9; color: white; font-size: 0.7rem; padding: 0.1rem 0.5rem; border-radius: 99px; margin-left: 0.5rem; }

        .list-controls { margin-bottom: 2rem; }
        .search-bar { position: relative; display: flex; align-items: center; max-width: 500px; }
        .search-bar svg { position: absolute; left: 1rem; color: #94a3b8; }
        .search-bar input { width: 100%; padding: 0.75rem 1rem 0.75rem 3rem; border: 1px solid #e2e8f0; border-radius: 0.75rem; outline: none; background: white; transition: border-color 0.2s; }
        .search-bar input:focus { border-color: #0ea5e9; }

        .works-list-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 1.5rem; }
        .work-verification-card { background: white; padding: 1.5rem; border-radius: 1rem; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.05); transition: transform 0.2s; }
        .work-verification-card:hover { transform: translateY(-3px); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); }
        
        .card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
        .work-code { font-family: monospace; font-weight: 800; color: #94a3b8; background: #f8fafc; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.8rem; }
        .school-name { display: flex; align-items: center; gap: 0.4rem; font-size: 0.85rem; color: #64748b; font-weight: 600; }
        
        .work-verification-card h3 { margin: 0 0 1.5rem 0; font-size: 1.15rem; color: #1e293b; height: 3rem; overflow: hidden; line-height: 1.5; }
        
        .work-meta-grid { display: grid; grid-template-columns: 1fr 1fr 1.2fr; gap: 1rem; margin-bottom: 1.5rem; padding: 1rem; background: #f8fafc; border-radius: 0.75rem; }
        .meta-item label { display: block; font-size: 0.65rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; margin-bottom: 0.25rem; }
        .meta-item span { font-weight: 700; color: #334155; font-size: 0.9rem; }
        .text-blue { color: #0ea5e9 !important; }

        .card-actions { margin-top: auto; }
        .verify-now-btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 0.5rem; padding: 0.85rem; background: #0ea5e9; color: white; border: none; border-radius: 0.75rem; font-weight: 700; cursor: pointer; transition: background 0.2s; }
        .verify-now-btn:hover { background: #0284c7; }

        .verified-actions { display: flex; justify-content: space-between; align-items: center; }
        .status-badge { display: flex; align-items: center; gap: 0.4rem; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; padding: 0.4rem 0.75rem; border-radius: 99px; }
        .status-badge.completed { background: #dcfce7; color: #15803d; }
        .view-cert-btn { display: flex; align-items: center; gap: 0.4rem; padding: 0.5rem 1rem; background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; border-radius: 0.5rem; font-size: 0.85rem; font-weight: 600; cursor: pointer; }
        .view-cert-btn:hover { background: #e2e8f0; color: #1e293b; }

        .empty-verification { grid-column: 1 / -1; padding: 5rem 2rem; text-align: center; color: #94a3b8; }
        .empty-icon { width: 80px; height: 80px; background: #f1f5f9; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; color: #cbd5e1; }
        .empty-verification h3 { color: #475569; margin-bottom: 0.5rem; }

        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 23, 42, 0.75); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 2rem; }
        .modal { background: white; border-radius: 1.5rem; overflow: hidden; display: flex; flex-direction: column; width: 100%; max-width: 800px; max-height: 90vh; }
        .modal-header { padding: 1.5rem 2rem; border-bottom: 1px solid #e2e8f0; display: flex; justify-content: space-between; align-items: center; background: #f8fafc; }
        .modal-content { padding: 2rem; overflow-y: auto; flex-grow: 1; }
        .close-btn { background: #f1f5f9; border: none; color: #64748b; cursor: pointer; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; }

        .cert-preview-box { border: 2px solid #1e293b; padding: 3rem; background: white; position: relative; }
        .cert-header { text-align: center; border-bottom: 2px solid #1e293b; padding-bottom: 1.5rem; margin-bottom: 2rem; }
        .cert-header h3 { margin: 0.5rem 0; letter-spacing: 0.1em; color: #1e293b; }
        .cert-header h4 { color: #64748b; margin: 0; }
        
        .cert-meta { display: flex; justify-content: space-between; margin-bottom: 2rem; font-size: 0.85rem; color: #64748b; }
        .cert-details { margin-bottom: 2.5rem; }
        .cert-row { padding: 0.75rem 0; border-bottom: 1px solid #f1f5f9; display: flex; justify-content: space-between; }
        
        .cert-financials { background: #f8fafc; padding: 1.5rem; border-radius: 0.75rem; margin-bottom: 2.5rem; border: 1px solid #e2e8f0; }
        .cert-financials h5 { margin: 0 0 1rem 0; text-transform: uppercase; font-size: 0.75rem; color: #64748b; letter-spacing: 0.05em; }
        .fin-tr { display: flex; justify-content: space-between; padding: 0.4rem 0; }
        .fin-tr.highlighted { border-top: 1px solid #cbd5e1; margin-top: 0.5rem; padding-top: 0.75rem; color: #10b981; }

        .cert-signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 4rem; margin-top: 3rem; }
        .sign-col { text-align: center; }
        .sign-pad-view { height: 60px; border-bottom: 1px solid #94a3b8; margin-bottom: 0.5rem; display: flex; align-items: center; justify-content: center; font-family: 'Dancing Script', cursive; font-size: 1.5rem; }
        .sign-pad-view.placeholder { font-family: inherit; font-size: 0.8rem; color: #94a3b8; font-style: italic; }
        .sign-col label { font-size: 0.7rem; font-weight: 700; color: #64748b; text-transform: uppercase; }

        .cert-actions { margin-top: 2rem; display: flex; justify-content: center; }
        .download-cert-btn { display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 2rem; background: #1e293b; color: white; border: none; border-radius: 0.5rem; font-weight: 700; cursor: pointer; }
        .download-cert-btn:hover { background: #0f172a; }

        @media print {
          body * { visibility: hidden; }
          .cert-preview-box, .cert-preview-box * { visibility: visible; }
          .cert-preview-box { position: absolute; left: 0; top: 0; width: 100%; border: none; }
        }

        .back-nav-btn { display: flex; align-items: center; gap: 0.5rem; background: none; border: none; color: #64748b; font-weight: 600; cursor: pointer; margin-bottom: 1.5rem; transition: color 0.2s; }
        .back-nav-btn:hover { color: #1e293b; }
      `}</style>
    </div>
  );
};

export default SachivWorkVerification;
