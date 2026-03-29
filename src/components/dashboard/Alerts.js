import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { 
  AlertTriangle, Bell, CheckCircle2, Clock, X, Eye, 
  RefreshCw, Package, FileText, Briefcase, Minus, Trash2
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

const Alerts = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchAlerts = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:8080/api/alerts', {
        params: {
          userId: user.id,
          role: user.role,
          schoolId: user.schoolId,
          talukaId: user.talukaId
        }
      });
      setAlerts(res.data || []);
    } catch (err) {
      console.error('Error fetching alerts:', err);
      setError('Failed to load alerts');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const handleMarkAsRead = async (id) => {
    try {
      await axios.put(`http://localhost:8080/api/alerts/${id}/read`);
      setAlerts(alerts.map(a => a.id === id ? { ...a, status: 'READ' } : a));
    } catch (err) {
      console.error('Error marking as read:', err);
    }
  };

  const handleResolve = async (id) => {
    try {
      await axios.put(`http://localhost:8080/api/alerts/${id}/resolve`);
      setAlerts(alerts.filter(a => a.id !== id));
    } catch (err) {
      console.error('Error resolving alert:', err);
    }
  };

  const handleSnooze = async (id, days) => {
    try {
      await axios.put(`http://localhost:8080/api/alerts/${id}/snooze`, null, {
        params: { days }
      });
      setAlerts(alerts.filter(a => a.id !== id));
    } catch (err) {
      console.error('Error snoozing alert:', err);
    }
  };

  const getAlertIcon = (category) => {
    switch(category) {
      case 'NO_UPDATE': return <Clock size={20} />;
      case 'LOW_INVENTORY': return <Package size={20} />;
      case 'BLOCKER': return <AlertTriangle size={20} />;
      case 'OVER_BUDGET': return <FileText size={20} />;
      case 'WORK_REQUEST': return <Briefcase size={20} />;
      default: return <Bell size={20} />;
    }
  };

  const getAlertColor = (type) => {
    switch(type) {
      case 'CRITICAL': return { bg: '#fee2e2', border: '#ef4444', text: '#991b1b', icon: '#dc2626' };
      case 'WARNING': return { bg: '#fef3c7', border: '#f59e0b', text: '#92400e', icon: '#d97706' };
      case 'INFO': return { bg: '#e0f2fe', border: '#0ea5e9', text: '#0369a1', icon: '#0284c7' };
      default: return { bg: '#f1f5f9', border: '#94a3b8', text: '#475569', icon: '#64748b' };
    }
  };

  return (
    <div className="alerts-module">
      <div className="module-header">
        <div>
          <h2>{t('title_alerts')}</h2>
          <p>{t('subtitle_alerts')}</p>
        </div>
        <button className="refresh-btn" onClick={fetchAlerts} disabled={loading}>
          <RefreshCw size={18} className={loading ? 'spin' : ''} /> {t('btn_refresh')}
        </button>
      </div>

      <div className="alerts-container">
        {alerts.map(alert => {
          const colors = getAlertColor(alert.type);
          return (
            <div 
              key={alert.id} 
              className={`alert-card ${alert.status === 'UNREAD' ? 'unread' : ''}`}
              style={{ backgroundColor: colors.bg, borderLeft: `4px solid ${colors.border}` }}
            >
              <div className="alert-icon-box" style={{ color: colors.icon }}>
                {getAlertIcon(alert.category)}
              </div>
              <div className="alert-content">
                <div className="alert-top">
                  <span className="alert-cat">{alert.category?.replace('_', ' ')}</span>
                  <span className="alert-time">{new Date(alert.createdAt).toLocaleString()}</span>
                </div>
                <h3>{alert.title}</h3>
                <p>{alert.message}</p>
                
                <div className="alert-actions">
                  {alert.status === 'UNREAD' && (
                    <button className="action-btn read" onClick={() => handleMarkAsRead(alert.id)}>
                      {t('btn_mark_read')}
                    </button>
                  )}
                  <button className="action-btn resolve" onClick={() => handleResolve(alert.id)}>
                    <CheckCircle2 size={14} /> {t('btn_resolve')}
                  </button>
                  <button className="action-btn snooze" onClick={() => handleSnooze(alert.id, 1)}>
                    <Clock size={14} /> {t('btn_snooze')}
                  </button>
                </div>
              </div>
              <button className="close-alert" onClick={() => handleResolve(alert.id)}>
                <X size={18} />
              </button>
            </div>
          );
        })}

        {alerts.length === 0 && !loading && (
          <div className="empty-alerts">
            <CheckCircle2 size={48} color="#10b981" />
            <h3>{t('empty_alerts_title')}</h3>
            <p>{t('empty_alerts_desc')}</p>
          </div>
        )}
      </div>

      <style>{`
        .alerts-module { padding: 0; }
        .module-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
        .module-header h2 { margin: 0; color: #1e293b; }
        .module-header p { margin: 0.25rem 0 0; color: #64748b; }
        
        .refresh-btn { display: flex; align-items: center; gap: 0.5rem; background: white; border: 1px solid #e2e8f0; padding: 0.5rem 1rem; border-radius: 0.5rem; cursor: pointer; color: #475569; font-weight: 600; }
        .spin { animation: spin 1s linear infinite; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

        .alerts-container { display: flex; flex-direction: column; gap: 1rem; }
        .alert-card { position: relative; display: flex; gap: 1.25rem; padding: 1.25rem; border-radius: 0.75rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); transition: transform 0.2s; }
        .alert-card.unread { box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06); }
        .alert-card:hover { transform: scale(1.005); }
        
        .alert-icon-box { display: flex; align-items: center; justify-content: center; width: 40px; height: 40px; background: rgba(255,255,255,0.5); border-radius: 0.5rem; flex-shrink: 0; }
        
        .alert-content { flex: 1; }
        .alert-top { display: flex; justify-content: space-between; margin-bottom: 0.5rem; }
        .alert-cat { font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; }
        .alert-time { font-size: 0.75rem; color: #94a3b8; }
        
        .alert-content h3 { margin: 0 0 0.4rem 0; font-size: 1.1rem; color: #1e293b; }
        .alert-content p { margin: 0 0 1.25rem 0; font-size: 0.95rem; color: #475569; line-height: 1.5; }
        
        .alert-actions { display: flex; gap: 0.75rem; }
        .action-btn { display: flex; align-items: center; gap: 0.4rem; background: rgba(255,255,255,0.6); border: 1px solid rgba(0,0,0,0.05); padding: 0.4rem 0.8rem; border-radius: 0.4rem; font-size: 0.8rem; font-weight: 600; cursor: pointer; color: #475569; transition: all 0.2s; }
        .action-btn:hover { background: white; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
        .action-btn.read { color: #0ea5e9; }
        .action-btn.resolve { color: #10b981; }
        
        .close-alert { position: absolute; top: 1rem; right: 1rem; background: none; border: none; cursor: pointer; color: #94a3b8; opacity: 0.5; transition: opacity 0.2s; }
        .close-alert:hover { opacity: 1; }
        
        .empty-alerts { text-align: center; padding: 4rem; background: white; border-radius: 1rem; border: 2px dashed #e2e8f0; }
        .empty-alerts h3 { margin: 1rem 0 0.5rem 0; color: #1e293b; }
        .empty-alerts p { color: #64748b; }
      `}</style>
    </div>
  );
};

export default Alerts;
