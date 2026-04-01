import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './components/auth/LoginPage';
import HomePage from './components/home/HomePage';
import MainLayout from './components/common/MainLayout';
import DashboardLayout from './components/common/DashboardLayout';
import AdminDashboardHome from './components/admin/AdminDashboardHome';
import UserManagement from './components/common/UserManagement';
import TalukaManagement from './components/common/TalukaManagement';
import SchoolManagement from './components/common/SchoolManagement';
import AdminWorkRequests from './components/admin/AdminWorkRequests';
import AdminWorkMonitoring from './components/admin/AdminWorkMonitoring';
import BlockerManagement from './components/common/BlockerManagement';
import BlockerAnalytics from './components/common/BlockerAnalytics';
import Alerts from './components/common/Alerts';
import WorkCreationForm from './components/common/WorkCreationForm';
import Reports from './components/common/Reports';
import Communication from './components/common/Communication';
import AuditLogs from './components/common/AuditLogs';
import HeadmasterDashboard from './components/headmaster/HeadmasterDashboard';
import HeadmasterWorkRequests from './components/headmaster/HeadmasterWorkRequests';
import HeadmasterActiveWorks from './components/headmaster/HeadmasterActiveWorks';
import ClerkDashboard from './components/clerk/ClerkDashboard';
import ClerkInventory from './components/clerk/ClerkInventory';
import ClerkQuotations from './components/clerk/ClerkQuotations';
import ClerkStockMovements from './components/clerk/ClerkStockMovements';
import ClerkLowStockAlerts from './components/clerk/ClerkLowStockAlerts';
import AdminFundRequests from './components/admin/AdminFundRequests';
import SachivDashboard from './components/sachiv/SachivDashboard';
import SachivWorkMonitoring from './components/sachiv/SachivWorkMonitoring';
import SachivWorkVerification from './components/sachiv/SachivWorkVerification';
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

          <Route path="/" element={<MainLayout><HomePage /></MainLayout>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
