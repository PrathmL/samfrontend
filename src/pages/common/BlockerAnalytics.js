import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart3, PieChart, TrendingUp, Clock, MapPin, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const BlockerAnalytics = ({ talukaId = null }) => {
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const params = talukaId ? { talukaId } : {};
        const res = await axios.get('http://localhost:8080/api/blockers/stats', { params });
        setStats(res.data);
      } catch (err) {
        console.error('Error fetching analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [talukaId]);

  if (loading) return <div className="loading-analytics">{t('msg_loading_analytics')}</div>;
  if (!stats) return <div className="no-data">{t('msg_no_analytics')}</div>;

  const renderProgressBar = (value, total, color) => {
    const percentage = total > 0 ? (value / total) * 100 : 0;
    return (
      <div className="analytics-bar-row">
        <div className="bar-info">
          <span>{value}</span>
          <div className="bar-bg-container">
            <div className="bar-fill-actual" style={{ width: `${percentage}%`, backgroundColor: color }}></div>
          </div>
        </div>
      </div>
    );
  };

  const translateStatus = (status) => {
    switch(status) {
      case 'NEW': return t('status_new');
      case 'IN_PROGRESS': return t('status_in_progress');
      case 'RESOLVED': return t('stat_resolved');
      case 'ESCALATED': return t('stat_escalated');
      default: return status;
    }
  };

  const translatePriority = (priority) => {
    switch(priority) {
      case 'HIGH': return t('priority_high');
      case 'MEDIUM': return t('priority_medium');
      case 'LOW': return t('priority_low');
      default: return priority;
    }
  };

  const translateType = (type) => {
    switch(type) {
      case 'Material Shortage': return t('type_material_shortage');
      case 'Labor Availability': return t('type_labor_availability');
      case 'Fund Issues': return t('type_fund_issues');
      case 'Technical Issue': return t('type_technical_issue');
      case 'Administrative Delay': return t('type_admin_delay');
      default: return type;
    }
  };

  return (
    <div className="analytics-container">
      <div className="analytics-grid">
        {/* Status Distribution */}
        <div className="analytics-card">
          <div className="card-head">
            <PieChart size={18} />
            <h3>{t('dash_status_distribution')}</h3>
          </div>
          <div className="card-body">
            {Object.entries(stats.blockersByStatus || {}).map(([status, count]) => (
              <div key={status} className="stat-row">
                <label>{translateStatus(status)}</label>
                {renderProgressBar(count, stats.totalBlockers, getStatusColor(status))}
              </div>
            ))}
          </div>
        </div>

        {/* Priority Distribution */}
        <div className="analytics-card">
          <div className="card-head">
            <AlertCircle size={18} />
            <h3>{t('dash_priority_active')}</h3>
          </div>
          <div className="card-body">
            {Object.entries(stats.blockersByPriority || {}).map(([priority, count]) => (
              <div key={priority} className="stat-row">
                <label>{translatePriority(priority)}</label>
                {renderProgressBar(count, stats.totalBlockers - stats.resolvedBlockers, getPriorityColor(priority))}
              </div>
            ))}
          </div>
        </div>

        {/* Taluka-wise (Admin only) */}
        {!talukaId && stats.blockersByTaluka && (
          <div className="analytics-card full-width">
            <div className="card-head">
              <MapPin size={18} />
              <h3>{t('dash_blockers_taluka')}</h3>
            </div>
            <div className="taluka-grid">
              {Object.entries(stats.blockersByTaluka).map(([name, count]) => (
                <div key={name} className="taluka-stat-box">
                  <span className="t-val">{count}</span>
                  <span className="t-name">{name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Resolution Time */}
        <div className="analytics-card">
          <div className="card-head">
            <Clock size={18} />
            <h3>{t('dash_avg_resolution')}</h3>
          </div>
          <div className="card-body central">
            <div className="big-stat">
              {stats.averageResolutionTimeDays?.toFixed(1) || 0}
              <span>{t('dash_days')}</span>
            </div>
            <p>{t('dash_avg_desc')}</p>
          </div>
        </div>

        {/* Blocker Types */}
        <div className="analytics-card">
          <div className="card-head">
            <BarChart3 size={18} />
            <h3>{t('dash_common_types')}</h3>
          </div>
          <div className="card-body">
            {Object.entries(stats.blockersByType || {}).sort((a,b) => b[1] - a[1]).slice(0, 5).map(([type, count]) => (
              <div key={type} className="stat-row">
                <label>{translateType(type)}</label>
                {renderProgressBar(count, stats.totalBlockers, '#6366f1')}
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .analytics-container { padding: 0; }
        .analytics-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
        .analytics-card { background: white; border-radius: 1rem; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; }
        .analytics-card.full-width { grid-column: span 2; }
        
        .card-head { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1.5rem; color: #1e293b; }
        .card-head h3 { margin: 0; font-size: 1.1rem; }
        
        .stat-row { margin-bottom: 1rem; }
        .stat-row label { display: block; font-size: 0.8rem; color: #64748b; margin-bottom: 0.4rem; font-weight: 600; }
        
        .analytics-bar-row { display: flex; align-items: center; }
        .bar-info { flex: 1; display: flex; align-items: center; gap: 1rem; }
        .bar-info span { font-size: 0.85rem; font-weight: 700; color: #1e293b; min-width: 25px; }
        .bar-bg-container { flex: 1; height: 10px; background: #f1f5f9; border-radius: 5px; overflow: hidden; }
        .bar-fill-actual { height: 100%; border-radius: 5px; transition: width 0.5s ease-out; }
        
        .taluka-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 1rem; }
        .taluka-stat-box { background: #f8fafc; padding: 1rem; border-radius: 0.75rem; text-align: center; border: 1px solid #f1f5f9; }
        .t-val { display: block; font-size: 1.5rem; font-weight: 700; color: #0ea5e9; }
        .t-name { font-size: 0.8rem; color: #64748b; font-weight: 600; }
        
        .big-stat { font-size: 3rem; font-weight: 800; color: #1e293b; text-align: center; margin: 1rem 0; }
        .big-stat span { font-size: 1rem; color: #94a3b8; margin-left: 0.5rem; }
        .card-body.central { text-align: center; display: flex; flex-direction: column; justify-content: center; height: 150px; }
        .card-body.central p { font-size: 0.85rem; color: #64748b; margin: 0; }
        
        .loading-analytics { text-align: center; padding: 4rem; color: #94a3b8; }
      `}</style>
    </div>
  );
};

const getStatusColor = (status) => {
  switch(status) {
    case 'NEW': return '#f59e0b';
    case 'IN_PROGRESS': return '#3b82f6';
    case 'RESOLVED': return '#10b981';
    case 'ESCALATED': return '#ef4444';
    default: return '#94a3b8';
  }
};

const getPriorityColor = (p) => {
  switch(p) {
    case 'HIGH': return '#ef4444';
    case 'MEDIUM': return '#f59e0b';
    default: return '#10b981';
  }
};

export default BlockerAnalytics;
