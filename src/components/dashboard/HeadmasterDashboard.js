import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { 
  Plus, ClipboardList, Clock, CheckCircle2, 
  TrendingUp, Building2, User
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const HeadmasterDashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [requests, setRequests] = useState([]);
  const [activeWorks, setActiveWorks] = useState([]);

  useEffect(() => {
    if (user?.schoolId) {
      fetchWorkRequests();
      fetchActiveWorks();
    }
  }, [user?.schoolId]);

  const fetchWorkRequests = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/work-requests?schoolId=${user.schoolId}`);
      setRequests(res.data || []);
    } catch (err) {
      console.error('Error fetching requests:', err);
    }
  };

  const fetchActiveWorks = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/works/school/${user.schoolId}`);
      setActiveWorks(res.data || []);
    } catch (err) {
      console.error('Error fetching works:', err);
    }
  };

  return (
    <div className="hm-dashboard">
      <div className="welcome-section">
        <h1>{t('dash_school_dashboard')}</h1>
        <p>{t('dash_welcome')}, {user?.name}</p>
      </div>

      <div className="stats-grid-hm">
        <div className="stat-card-hm">
          <div className="stat-icon-hm" style={{ backgroundColor: '#eff6ff', color: '#3b82f6' }}>
            <Building2 size={24} />
          </div>
          <div className="stat-content-hm">
            <h3>{activeWorks.length}</h3>
            <p>{t('dash_total_works')}</p>
          </div>
        </div>
        <div className="stat-card-hm">
          <div className="stat-icon-hm" style={{ backgroundColor: '#fef3c7', color: '#d97706' }}>
            <Clock size={24} />
          </div>
          <div className="stat-content-hm">
            <h3>{requests.filter(r => r.status === 'PENDING_QUOTATION').length}</h3>
            <p>{t('dash_pending_requests')}</p>
          </div>
        </div>
        <div className="stat-card-hm">
          <div className="stat-icon-hm" style={{ backgroundColor: '#dcfce7', color: '#10b981' }}>
            <CheckCircle2 size={24} />
          </div>
          <div className="stat-content-hm">
            <h3>{activeWorks.filter(w => w.status === 'COMPLETED').length}</h3>
            <p>{t('dash_completed')}</p>
          </div>
        </div>
      </div>

      <style>{`
        .welcome-section { margin-bottom: 2rem; }
        .welcome-section h1 { margin: 0; font-size: 1.875rem; color: #1e293b; }
        .welcome-section p { color: #64748b; margin: 0.5rem 0 0; }
        .stats-grid-hm { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
        .stat-card-hm { background: white; padding: 1.5rem; border-radius: 0.75rem; display: flex; align-items: center; gap: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .stat-icon-hm { width: 48px; height: 48px; border-radius: 0.5rem; display: flex; align-items: center; justify-content: center; }
        .stat-content-hm h3 { margin: 0; font-size: 1.5rem; font-weight: 700; }
        .stat-content-hm p { margin: 0; color: #64748b; font-size: 0.8rem; }
      `}</style>
    </div>
  );
};

export default HeadmasterDashboard;
