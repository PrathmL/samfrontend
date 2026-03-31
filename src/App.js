import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './components/auth/LoginPage';
import HomePage from './components/home/HomePage';
import DashboardLayout from './pages/common/DashboardLayout';
import AdminDashboardHome from './pages/admin/AdminDashboardHome';
import UserManagement from './pages/admin/UserManagement';
import TalukaManagement from './pages/admin/TalukaManagement';
import SchoolManagement from './pages/admin/SchoolManagement';
import AdminWorkRequests from './pages/admin/AdminWorkRequests';
import AdminWorkMonitoring from './pages/admin/AdminWorkMonitoring';
import BlockerManagement from './pages/common/BlockerManagement';
import BlockerAnalytics from './pages/common/BlockerAnalytics';
import Alerts from './pages/common/Alerts';
import WorkCreationForm from './pages/admin/WorkCreationForm';
import Reports from './pages/common/Reports';
import Communication from './pages/common/Communication';
import AuditLogs from './pages/admin/AuditLogs';
import HeadmasterDashboard from './pages/headmaster/HeadmasterDashboard';
import HeadmasterWorkRequests from './pages/headmaster/HeadmasterWorkRequests';
import HeadmasterActiveWorks from './pages/headmaster/HeadmasterActiveWorks';
import ClerkDashboard from './pages/clerk/ClerkDashboard';
import ClerkInventory from './pages/clerk/ClerkInventory';
import ClerkQuotations from './pages/clerk/ClerkQuotations';
import ClerkStockMovements from './pages/clerk/ClerkStockMovements';
import ClerkLowStockAlerts from './pages/clerk/ClerkLowStockAlerts';
import AdminFundRequests from './pages/admin/AdminFundRequests';
import SachivDashboard from './pages/sachiv/SachivDashboard';
import SachivWorkMonitoring from './pages/sachiv/SachivWorkMonitoring';
import SachivWorkVerification from './pages/sachiv/SachivWorkVerification';
import ProfileEdit from './components/profile/ProfileEdit';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/login" />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          
          {/* Admin Routes */}
          <Route 
            path="/admin/*" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <DashboardLayout>
                  <Routes>
                    <Route path="dashboard" element={<AdminDashboardHome />} />
                    <Route path="users" element={<UserManagement />} />
                    <Route path="talukas" element={<TalukaManagement />} />
                    <Route path="schools" element={<SchoolManagement />} />
                    <Route path="work-monitoring" element={<AdminWorkMonitoring />} />
                    <Route path="work-requests" element={<AdminWorkRequests />} />
                    <Route path="fund-requests" element={<AdminFundRequests />} />
                    <Route path="blockers" element={<BlockerManagement />} />
                    <Route path="analytics" element={<BlockerAnalytics />} />
                    <Route path="alerts" element={<Alerts />} />
                    <Route path="reports" element={<Reports />} />
                    <Route path="communication" element={<Communication />} />
                    <Route path="audit-logs" element={<AuditLogs />} />
                    <Route path="profile" element={<ProfileEdit />} />
                    <Route path="create-work/:requestId" element={<WorkCreationForm />} />
                    <Route path="*" element={<Navigate to="dashboard" replace />} />
                  </Routes>
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />
          
          {/* Sachiv Routes */}
          <Route 
            path="/sachiv/*" 
            element={
              <ProtectedRoute allowedRoles={['SACHIV']}>
                <DashboardLayout>
                  <Routes>
                    <Route path="dashboard" element={<SachivDashboard />} />
                    <Route path="works" element={<SachivWorkMonitoring />} />
                    <Route path="blockers" element={<BlockerManagement />} />
                    <Route path="analytics" element={<BlockerAnalytics />} />
                    <Route path="alerts" element={<Alerts />} />
                    <Route path="verification" element={<SachivWorkVerification />} />
                    <Route path="reports" element={<Reports />} />
                    <Route path="communication" element={<Communication />} />
                    <Route path="profile" element={<ProfileEdit />} />
                    <Route path="*" element={<Navigate to="dashboard" replace />} />
                  </Routes>
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />
          
          {/* Headmaster Routes */}
          <Route 
            path="/headmaster/*" 
            element={
              <ProtectedRoute allowedRoles={['HEADMASTER']}>
                <DashboardLayout>
                  <Routes>
                    <Route path="dashboard" element={<HeadmasterDashboard />} />
                    <Route path="requests" element={<HeadmasterWorkRequests />} />
                    <Route path="works" element={<HeadmasterActiveWorks />} />
                    <Route path="blockers" element={<BlockerManagement />} />
                    <Route path="alerts" element={<Alerts />} />
                    <Route path="reports" element={<Reports />} />
                    <Route path="communication" element={<Communication />} />
                    <Route path="profile" element={<ProfileEdit />} />
                    <Route path="*" element={<Navigate to="dashboard" replace />} />
                  </Routes>
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />
          
          {/* Clerk Routes */}
          <Route 
            path="/clerk/*" 
            element={
              <ProtectedRoute allowedRoles={['CLERK']}>
                <DashboardLayout>
                  <Routes>
                    <Route path="dashboard" element={<ClerkDashboard />} />
                    <Route path="inventory" element={<ClerkInventory />} />
                    <Route path="quotations" element={<ClerkQuotations />} />
                    <Route path="blockers" element={<BlockerManagement />} />
                    <Route path="reports" element={<Reports />} />
                    <Route path="communication" element={<Communication />} />
                    <Route path="alerts" element={<Alerts />} />
                    <Route path="stock-movements" element={<ClerkStockMovements />} />
                    <Route path="low-stock-alerts" element={<ClerkLowStockAlerts />} />
                    <Route path="profile" element={<ProfileEdit />} />
                    <Route path="*" element={<Navigate to="dashboard" replace />} />
                  </Routes>
                </DashboardLayout>
              </ProtectedRoute>
            } 
          />

          <Route path="/" element={<HomePage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
