import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { LogOut, Plus, ClipboardList, Clock, CheckCircle2, XCircle } from 'lucide-react';

const BaseDashboard = ({ role, children }) => {
    const { user, logout } = useAuth();

    return (
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
            {/* Simple Sidebar for HM/Clerk/Sachiv */}
            <div style={{ width: '260px', backgroundColor: '#1e293b', color: 'white', padding: '1.5rem', position: 'fixed', height: '100vh' }}>
                <h2 style={{ color: '#38bdf8', marginBottom: '2rem' }}>ESSP {role}</h2>
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ padding: '0.75rem', backgroundColor: '#0ea5e9', borderRadius: '0.5rem', cursor: 'pointer' }}>Dashboard</div>
                    {/* Placeholder for other menu items */}
                </nav>
                <button 
                    onClick={logout}
                    style={{ position: 'absolute', bottom: '2rem', left: '1.5rem', right: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', background: 'none', border: '1px solid #334155', color: '#cbd5e1', cursor: 'pointer', borderRadius: '0.5rem' }}
                >
                    <LogOut size={18} /> Logout
                </button>
            </div>

            <main style={{ flex: 1, marginLeft: '260px', padding: '2rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h1>{role} Dashboard</h1>
                    <span>Welcome, <strong>{user?.name}</strong></span>
                </div>
                {children}
            </main>
        </div>
    );
};

// --- Head Master Dashboard ---
export const HeadmasterDashboard = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: 'Maintenance',
        category: 'Building',
        priority: 'Medium'
    });

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const res = await axios.get(`http://localhost:8080/api/work-requests?schoolId=${user.schoolId}`);
            setRequests(res.data);
        } catch (err) { console.error(err); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:8080/api/work-requests', {
                ...formData,
                schoolId: user.schoolId,
                createdById: user.id
            });
            setIsModalOpen(false);
            setFormData({ title: '', description: '', type: 'Maintenance', category: 'Building', priority: 'Medium' });
            fetchRequests();
        } catch (err) { console.error(err); }
    };

    return (
        <BaseDashboard role="Headmaster">
            <div style={{ marginBottom: '2rem' }}>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#0ea5e9', color: 'white', border: 'none', padding: '0.75rem 1.5rem', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '600' }}
                >
                    <Plus size={20} /> Create New Request
                </button>
            </div>

            <div style={{ backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: collapse }}>
                    <thead style={{ backgroundColor: '#f1f5f9' }}>
                        <tr>
                            <th style={{ padding: '1rem', textAlign: 'left' }}>Title</th>
                            <th style={{ padding: '1rem', textAlign: 'left' }}>Type</th>
                            <th style={{ padding: '1rem', textAlign: 'left' }}>Priority</th>
                            <th style={{ padding: '1rem', textAlign: 'left' }}>Status</th>
                            <th style={{ padding: '1rem', textAlign: 'left' }}>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.map(req => (
                            <tr key={req.id} style={{ borderTop: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '1rem' }}>{req.title}</td>
                                <td style={{ padding: '1rem' }}>{req.type}</td>
                                <td style={{ padding: '1rem' }}>{req.priority}</td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{ padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.875rem', backgroundColor: getStatusColor(req.status).bg, color: getStatusColor(req.status).text }}>
                                        {req.status.replace('_', ' ')}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem' }}>{new Date(req.createdAt).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '0.75rem', width: '100%', maxWidth: '500px' }}>
                        <h2>New Work Request</h2>
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                <label>Work Title</label>
                                <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #d1d5db' }} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                <label>Description</label>
                                <textarea required value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #d1d5db', minHeight: '100px' }} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                    <label>Type</label>
                                    <select value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #d1d5db' }}>
                                        <option>Maintenance</option>
                                        <option>Repair</option>
                                        <option>New Construction</option>
                                    </select>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                    <label>Priority</label>
                                    <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #d1d5db' }}>
                                        <option>Low</option>
                                        <option>Medium</option>
                                        <option>High</option>
                                        <option>Urgent</option>
                                    </select>
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '0.75rem 1.5rem', borderRadius: '0.5rem', border: '1px solid #d1d5db', backgroundColor: 'white', cursor: 'pointer' }}>Cancel</button>
                                <button type="submit" style={{ padding: '0.75rem 1.5rem', borderRadius: '0.5rem', border: 'none', backgroundColor: '#0ea5e9', color: 'white', fontWeight: '600', cursor: 'pointer' }}>Submit Request</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </BaseDashboard>
    );
};

// --- Clerk Dashboard ---
export const ClerkDashboard = () => {
    const { user } = useAuth();
    const [pendingRequests, setPendingRequests] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [quotationData, setQuotationData] = useState({
        materialCost: 0,
        laborCost: 0,
        additionalCosts: 0,
        materialDetails: ''
    });

    useEffect(() => {
        fetchPending();
    }, []);

    const fetchPending = async () => {
        try {
            const res = await axios.get('http://localhost:8080/api/work-requests?status=PENDING_QUOTATION');
            // Filter by clerk's school
            setPendingRequests(res.data.filter(r => r.schoolId === user.schoolId));
        } catch (err) { console.error(err); }
    };

    const handlePrepareQuotation = (req) => {
        setSelectedRequest(req);
        setIsModalOpen(true);
    };

    const handleSubmitQuotation = async (e) => {
        e.preventDefault();
        const grandTotal = Number(quotationData.materialCost) + Number(quotationData.laborCost) + Number(quotationData.additionalCosts);
        try {
            await axios.post(`http://localhost:8080/api/work-requests/${selectedRequest.id}/quotation`, {
                ...quotationData,
                grandTotal,
                submittedById: user.id
            });
            setIsModalOpen(false);
            setQuotationData({ materialCost: 0, laborCost: 0, additionalCosts: 0, materialDetails: '' });
            fetchPending();
        } catch (err) { console.error(err); }
    };

    return (
        <BaseDashboard role="Clerk">
            <div style={{ marginBottom: '1.5rem' }}>
                <h3>Pending Quotations</h3>
                <p style={{ color: '#64748b' }}>Requests from Head Master awaiting your quotation.</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                {pendingRequests.map(req => (
                    <div key={req.id} style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.75rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b' }}>#{req.id}</span>
                            <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', borderRadius: '4px', backgroundColor: '#fef3c7', color: '#92400e' }}>{req.priority}</span>
                        </div>
                        <h4 style={{ margin: '0 0 0.5rem 0' }}>{req.title}</h4>
                        <p style={{ fontSize: '0.875rem', color: '#475569', marginBottom: '1.5rem' }}>{req.description}</p>
                        <button 
                            onClick={() => handlePrepareQuotation(req)}
                            style={{ width: '100%', padding: '0.6rem', backgroundColor: '#0ea5e9', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer', fontWeight: '600' }}
                        >
                            Prepare Quotation
                        </button>
                    </div>
                ))}
                {pendingRequests.length === 0 && <p>No pending requests.</p>}
            </div>

            {isModalOpen && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
                    <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '0.75rem', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
                        <h2>Prepare Quotation</h2>
                        <p style={{ fontSize: '0.9rem', color: '#64748b' }}>For: {selectedRequest?.title}</p>
                        <form onSubmit={handleSubmitQuotation} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1.5rem' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                <label>Material Details & Costs</label>
                                <textarea placeholder="List materials and their individual costs..." required value={quotationData.materialDetails} onChange={e => setQuotationData({...quotationData, materialDetails: e.target.value})} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #d1d5db', minHeight: '80px' }} />
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                    <label>Material Total (₹)</label>
                                    <input type="number" required value={quotationData.materialCost} onChange={e => setQuotationData({...quotationData, materialCost: e.target.value})} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #d1d5db' }} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                    <label>Labor Total (₹)</label>
                                    <input type="number" required value={quotationData.laborCost} onChange={e => setQuotationData({...quotationData, laborCost: e.target.value})} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #d1d5db' }} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                <label>Additional Costs (₹)</label>
                                <input type="number" value={quotationData.additionalCosts} onChange={e => setQuotationData({...quotationData, additionalCosts: e.target.value})} style={{ padding: '0.75rem', borderRadius: '0.5rem', border: '1px solid #d1d5db' }} />
                            </div>
                            <div style={{ marginTop: '0.5rem', padding: '1rem', backgroundColor: '#f1f5f9', borderRadius: '0.5rem', textAlign: 'right' }}>
                                <span style={{ fontWeight: '600' }}>Grand Total: ₹{Number(quotationData.materialCost) + Number(quotationData.laborCost) + Number(quotationData.additionalCosts)}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                                <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '0.75rem 1.5rem', borderRadius: '0.5rem', border: '1px solid #d1d5db', backgroundColor: 'white', cursor: 'pointer' }}>Cancel</button>
                                <button type="submit" style={{ padding: '0.75rem 1.5rem', borderRadius: '0.5rem', border: 'none', backgroundColor: '#0ea5e9', color: 'white', fontWeight: '600', cursor: 'pointer' }}>Submit to Admin</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </BaseDashboard>
    );
};

export const AdminDashboard = () => <BaseDashboard role="Admin" />;
export const SachivDashboard = () => <BaseDashboard role="Sachiv" />;

const collapse = 'collapse';
const getStatusColor = (status) => {
    switch(status) {
        case 'PENDING_QUOTATION': return { bg: '#e0f2fe', text: '#0369a1' };
        case 'PENDING_APPROVAL': return { bg: '#fef3c7', text: '#92400e' };
        case 'APPROVED': return { bg: '#dcfce7', text: '#166534' };
        case 'REJECTED': return { bg: '#fee2e2', text: '#991b1b' };
        case 'WORK_CREATED': return { bg: '#f3e8ff', text: '#6b21a8' };
        default: return { bg: '#f1f5f9', text: '#475569' };
    }
};
