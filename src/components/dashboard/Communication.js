import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Send, History, FileText, User, 
  School as SchoolIcon, Bell, 
  MessageSquare, Plus, Trash2,
  Calendar, Info, AlertTriangle,
  ChevronRight, Search, Filter, X,
  MapPin, Globe, Inbox
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';

const Communication = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const isSender = user?.role === 'ADMIN' || user?.role === 'SACHIV';
  
  // Default to 'inbox' for HM/Clerk, 'send' for Admin/Sachiv
  const [activeTab, setActiveTab] = useState(isSender ? 'send' : 'inbox');
  
  const [talukas, setTalukas] = useState([]);
  const [schools, setSchools] = useState([]);
  const [history, setHistory] = useState([]); // Sent history
  const [receivedMessages, setReceivedMessages] = useState([]); // Inbox
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'ANNOUNCEMENT',
    talukaId: user?.role === 'SACHIV' ? user.talukaId : '',
    schoolId: '',
    recipientMode: user?.role === 'ADMIN' ? 'DISTRICT' : 'TALUKA'
  });

  const templates = [
    {
      id: 'reminder',
      name: 'Work Update Reminder',
      title: 'Reminder: Work Progress Update Due',
      message: 'Dear Headmaster, this is a reminder to update the progress of active works at your school. Please ensure all photos and financial data are uploaded.',
      type: 'REMINDER'
    },
    {
      id: 'meeting',
      name: 'Meeting Schedule',
      title: 'Notice: Monthly Review Meeting',
      message: 'A review meeting is scheduled for [Date] at [Time]. Attendance is mandatory for all relevant personnel.',
      type: 'MEETING'
    },
    {
      id: 'guideline',
      name: 'New Guidelines',
      title: 'Important: Revised Project Guidelines',
      message: 'New guidelines have been released. Please refer to the documentation for compliance and implementation details.',
      type: 'GUIDELINE'
    }
  ];

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchTalukas();
    }
    if (user?.role === 'SACHIV' || (user?.role === 'ADMIN' && formData.talukaId)) {
      fetchSchools(formData.talukaId || user?.talukaId);
    }
    
    if (isSender) {
      fetchHistory();
    } else {
      fetchReceivedMessages();
    }
  }, [formData.talukaId, user]);

  const fetchTalukas = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/talukas');
      setTalukas(res.data);
    } catch (err) {
      console.error('Error fetching talukas:', err);
    }
  };

  const fetchSchools = async (tId) => {
    if (!tId) return;
    try {
      const res = await axios.get(`http://localhost:8080/api/schools?talukaId=${tId}`);
      setSchools(res.data);
    } catch (err) {
      console.error('Error fetching schools:', err);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`http://localhost:8080/api/communications/sent/${user.id}`);
      setHistory(res.data);
    } catch (err) {
      console.error('Error fetching history:', err);
    }
  };

  const fetchReceivedMessages = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:8080/api/communications/received', {
        params: { 
          schoolId: user.schoolId || 0, 
          talukaId: user.talukaId || 0 
        }
      });
      setReceivedMessages(res.data || []);
    } catch (err) {
      console.error('Error fetching received messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = (template) => {
    setFormData({
      ...formData,
      title: template.title,
      message: template.message,
      type: template.type
    });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const payload = {
        title: formData.title,
        message: formData.message,
        type: formData.type,
        senderId: user.id,
        talukaId: formData.recipientMode === 'DISTRICT' ? null : formData.talukaId,
        schoolId: formData.recipientMode === 'SCHOOL' ? formData.schoolId : null,
        isBulk: formData.recipientMode !== 'SCHOOL'
      };

      await axios.post('http://localhost:8080/api/communications', payload);
      
      setSuccess('Notification sent successfully!');
      setFormData({
        ...formData,
        title: '',
        message: '',
        schoolId: ''
      });
      fetchHistory();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to send notification. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    try {
      await axios.delete(`http://localhost:8080/api/communications/${id}`);
      fetchHistory();
    } catch (err) {
      console.error('Error deleting message:', err);
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'ANNOUNCEMENT': return '#0ea5e9';
      case 'REMINDER': return '#f59e0b';
      case 'MEETING': return '#8b5cf6';
      case 'GUIDELINE': return '#10b981';
      default: return '#64748b';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'ANNOUNCEMENT': return <Bell size={16} />;
      case 'REMINDER': return <Calendar size={16} />;
      case 'MEETING': return <MessageSquare size={16} />;
      case 'GUIDELINE': return <FileText size={16} />;
      default: return <Info size={16} />;
    }
  };

  const translateMessageType = (type) => {
    switch(type) {
      case 'ANNOUNCEMENT': return t('type_announcement');
      case 'REMINDER': return t('type_reminder');
      case 'MEETING': return t('type_meeting');
      case 'GUIDELINE': return t('type_guideline');
      default: return type;
    }
  };

  return (
    <div className="comm-container">
      <div className="comm-header">
        <h1>{t('title_comm_module')}</h1>
        <p>
          {isSender 
            ? `Send notifications across the ${user?.role === 'ADMIN' ? 'District' : 'Taluka'}` 
            : t('subtitle_comm_hm')}
        </p>
      </div>

      <div className="comm-tabs">
        {isSender && (
          <button 
            className={`comm-tab ${activeTab === 'send' ? 'active' : ''}`}
            onClick={() => setActiveTab('send')}
          >
            <Send size={18} />
            {t('btn_send')}
          </button>
        )}
        
        <button 
          className={`comm-tab ${activeTab === 'inbox' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('inbox');
            fetchReceivedMessages();
          }}
        >
          <Inbox size={18} />
          {t('tab_inbox')}
        </button>

        {isSender && (
          <button 
            className={`comm-tab ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <History size={18} />
            {t('tab_sent')}
          </button>
        )}
      </div>

      <div className="comm-content">
        {activeTab === 'send' && isSender ? (
          <div className="send-layout">
            <div className="send-main">
              <form onSubmit={handleSend} className="comm-form">
                {success && <div className="comm-alert success">{success}</div>}
                {error && <div className="comm-alert error">{error}</div>}

                <div className="form-group">
                  <label>Recipient Scope</label>
                  <div className="mode-toggle">
                    {user?.role === 'ADMIN' && (
                      <button 
                        type="button"
                        className={`toggle-btn ${formData.recipientMode === 'DISTRICT' ? 'active' : ''}`}
                        onClick={() => setFormData({...formData, recipientMode: 'DISTRICT', talukaId: '', schoolId: ''})}
                      >
                        Entire District
                      </button>
                    )}
                    <button 
                      type="button"
                      className={`toggle-btn ${formData.recipientMode === 'TALUKA' ? 'active' : ''}`}
                      onClick={() => setFormData({...formData, recipientMode: 'TALUKA', schoolId: ''})}
                    >
                      Entire Taluka
                    </button>
                    <button 
                      type="button"
                      className={`toggle-btn ${formData.recipientMode === 'SCHOOL' ? 'active' : ''}`}
                      onClick={() => setFormData({...formData, recipientMode: 'SCHOOL'})}
                    >
                      Specific School
                    </button>
                  </div>
                </div>

                {user?.role === 'ADMIN' && formData.recipientMode !== 'DISTRICT' && (
                  <div className="form-group">
                    <label>{t('field_taluka')}</label>
                    <select 
                      value={formData.talukaId} 
                      onChange={(e) => setFormData({...formData, talukaId: e.target.value, schoolId: ''})}
                      required
                    >
                      <option value="">-- Choose Taluka --</option>
                      {talukas.map(t => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {formData.recipientMode === 'SCHOOL' && (
                  <div className="form-group">
                    <label>{t('field_school')}</label>
                    <select 
                      value={formData.schoolId} 
                      onChange={(e) => setFormData({...formData, schoolId: e.target.value})}
                      required
                      disabled={user?.role === 'ADMIN' && !formData.talukaId}
                    >
                      <option value="">-- Choose School --</option>
                      {schools.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="form-group">
                  <label>Message Type</label>
                  <select 
                    value={formData.type} 
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                  >
                    <option value="ANNOUNCEMENT">{t('type_announcement')}</option>
                    <option value="REMINDER">{t('type_reminder')}</option>
                    <option value="MEETING">{t('type_meeting')}</option>
                    <option value="GUIDELINE">{t('type_guideline')}</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>{t('field_title')}</label>
                  <input 
                    type="text" 
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    placeholder="Enter message subject"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Message Content</label>
                  <textarea 
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    placeholder="Type your message here..."
                    rows="6"
                    required
                  />
                </div>

                <button className="send-btn" disabled={loading}>
                  {loading ? 'Sending...' : (
                    <>
                      <Send size={18} />
                      {t('btn_send')}
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="send-sidebar">
              <h3>Quick Templates</h3>
              <div className="template-list">
                {templates.map(t => (
                  <div key={t.id} className="template-card" onClick={() => handleTemplateSelect(t)}>
                    <h4>{t.name}</h4>
                    <p>{t.title}</p>
                    <ChevronRight size={16} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : activeTab === 'inbox' ? (
          <div className="history-layout">
            {receivedMessages.length > 0 ? (
              <div className="history-list">
                {receivedMessages.map(msg => (
                  <div key={msg.id} className="history-card">
                    <div className="msg-header">
                      <div className="msg-type" style={{ backgroundColor: getTypeColor(msg.type) + '20', color: getTypeColor(msg.type) }}>
                        {getTypeIcon(msg.type)}
                        <span>{translateMessageType(msg.type)}</span>
                      </div>
                      <span className="msg-date">{new Date(msg.createdAt).toLocaleString()}</span>
                    </div>
                    <h3 className="msg-title">{msg.title}</h3>
                    <p className="msg-body">{msg.message}</p>
                    <div className="msg-footer">
                      <div className="msg-recipient">
                        <User size={14} />
                        <span>{t('msg_from_authorities')}</span>
                        {msg.isBulk && <span className="bulk-tag" style={{ marginLeft: '1rem', background: '#f1f5f9', padding: '0.1rem 0.4rem', borderRadius: '4px', fontSize: '0.7rem' }}>Broadcast</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-history">
                <Inbox size={48} />
                <h3>{t('empty_inbox_title')}</h3>
                <p>{t('empty_inbox_desc')}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="history-layout">
            {history.length > 0 ? (
              <div className="history-list">
                {history.map(msg => (
                  <div key={msg.id} className="history-card">
                    <div className="msg-header">
                      <div className="msg-type" style={{ backgroundColor: getTypeColor(msg.type) + '20', color: getTypeColor(msg.type) }}>
                        {getTypeIcon(msg.type)}
                        <span>{translateMessageType(msg.type)}</span>
                      </div>
                      <span className="msg-date">{new Date(msg.createdAt).toLocaleString()}</span>
                    </div>
                    <h3 className="msg-title">{msg.title}</h3>
                    <p className="msg-body">{msg.message}</p>
                    <div className="msg-footer">
                      <div className="msg-recipient">
                        {msg.isBulk ? (
                          msg.talukaId ? <MapPin size={14} /> : <Globe size={14} />
                        ) : <SchoolIcon size={14} />}
                        <span>To: {msg.isBulk ? (msg.talukaId ? 'Taluka-wide' : 'District-wide') : 'Specific School'}</span>
                      </div>
                      <button className="delete-btn" onClick={() => handleDelete(msg.id)}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-history">
                <History size={48} />
                <h3>No History</h3>
                <p>Sent messages will appear here.</p>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        .comm-container { padding: 0; }
        .comm-header { margin-bottom: 2rem; }
        .comm-header h1 { margin: 0; font-size: 1.875rem; color: #1e293b; }
        .comm-header p { color: #64748b; margin: 0.5rem 0 0; }

        .comm-tabs { display: flex; gap: 1rem; margin-bottom: 2rem; border-bottom: 1px solid #e2e8f0; padding-bottom: 1rem; }
        .comm-tab { display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem 1.5rem; background: none; border: none; border-radius: 0.5rem; color: #64748b; cursor: pointer; transition: all 0.2s; font-weight: 600; }
        .comm-tab:hover { background: #f1f5f9; color: #1e293b; }
        .comm-tab.active { background: #e0f2fe; color: #0ea5e9; }

        .send-layout { display: grid; grid-template-columns: 1fr 300px; gap: 2rem; align-items: start; }
        .send-main { background: white; padding: 2rem; border-radius: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; }
        
        .comm-form { display: flex; flex-direction: column; gap: 1.5rem; }
        .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
        .form-group label { font-weight: 600; color: #475569; font-size: 0.875rem; }
        .form-group input, .form-group select, .form-group textarea { padding: 0.75rem; border: 1px solid #d1d5db; border-radius: 0.5rem; font-size: 0.9rem; outline: none; transition: border-color 0.2s; }
        .form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: #0ea5e9; }

        .mode-toggle { display: flex; gap: 0.5rem; background: #f1f5f9; padding: 0.25rem; border-radius: 0.5rem; }
        .toggle-btn { flex: 1; padding: 0.5rem; border: none; background: none; border-radius: 0.4rem; font-size: 0.8rem; font-weight: 600; color: #64748b; cursor: pointer; transition: all 0.2s; }
        .toggle-btn.active { background: white; color: #0ea5e9; box-shadow: 0 1px 2px rgba(0,0,0,0.05); }

        .send-btn { display: flex; align-items: center; justify-content: center; gap: 0.75rem; padding: 1rem; background: #0ea5e9; color: white; border: none; border-radius: 0.5rem; font-weight: 600; cursor: pointer; transition: background 0.2s; margin-top: 1rem; }
        .send-btn:hover { background: #0284c7; }
        .send-btn:disabled { background: #94a3b8; cursor: not-allowed; }

        .send-sidebar { display: flex; flex-direction: column; gap: 1.5rem; }
        .send-sidebar h3 { margin: 0; font-size: 1.1rem; color: #1e293b; }
        .template-list { display: flex; flex-direction: column; gap: 0.75rem; }
        .template-card { position: relative; background: white; padding: 1rem; border-radius: 0.75rem; border: 1px solid #e2e8f0; cursor: pointer; transition: all 0.2s; }
        .template-card:hover { border-color: #0ea5e9; transform: translateX(4px); }
        .template-card h4 { margin: 0 0 0.25rem 0; font-size: 0.9rem; color: #1e293b; }
        .template-card p { margin: 0; font-size: 0.75rem; color: #64748b; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; padding-right: 1.5rem; }
        .template-card svg { position: absolute; right: 1rem; top: 50%; transform: translateY(-50%); color: #94a3b8; }

        .history-list { display: flex; flex-direction: column; gap: 1.5rem; }
        .history-card { background: white; padding: 1.5rem; border-radius: 1rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; }
        .msg-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
        .msg-type { display: flex; align-items: center; gap: 0.5rem; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; }
        .msg-date { font-size: 0.8rem; color: #94a3b8; }
        .msg-title { margin: 0 0 0.75rem 0; font-size: 1.1rem; color: #1e293b; }
        .msg-body { margin: 0 0 1.5rem 0; color: #475569; line-height: 1.6; white-space: pre-wrap; }
        .msg-footer { display: flex; justify-content: space-between; align-items: center; padding-top: 1rem; border-top: 1px solid #f1f5f9; }
        .msg-recipient { display: flex; align-items: center; gap: 0.5rem; color: #64748b; font-size: 0.875rem; }
        .delete-btn { padding: 0.5rem; background: none; border: none; color: #94a3b8; cursor: pointer; transition: color 0.2s; }
        .delete-btn:hover { color: #ef4444; }

        .empty-history { text-align: center; padding: 4rem; color: #94a3b8; background: white; border-radius: 1rem; border: 2px dashed #e2e8f0; }
        .empty-history svg { margin-bottom: 1rem; opacity: 0.5; }
        .empty-history h3 { margin: 0 0 0.5rem 0; color: #1e293b; }

        .comm-alert { padding: 1rem; border-radius: 0.5rem; margin-bottom: 1rem; font-size: 0.9rem; font-weight: 500; }
        .comm-alert.success { background: #dcfce7; color: #16a34a; }
        .comm-alert.error { background: #fee2e2; color: #dc2626; }
      `}</style>
    </div>
  );
};

export default Communication;
