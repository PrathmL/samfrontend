import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './components/auth/LoginPage';
import HomePage from './components/home/HomePage';
import MainLayout from './components/common/MainLayout';
import DashboardLayout from './components/dashboard/DashboardLayout';
import AdminDashboardHome from './components/dashboard/AdminDashboardHome';
import UserManagement from './components/dashboard/UserManagement';
import TalukaManagement from './components/dashboard/TalukaManagement';
import SchoolManagement from './components/dashboard/SchoolManagement';
import AdminWorkRequests from './components/dashboard/AdminWorkRequests';
import AdminWorkMonitoring from './components/dashboard/AdminWorkMonitoring';
import BlockerManagement from './components/dashboard/BlockerManagement';
import BlockerAnalytics from './components/dashboard/BlockerAnalytics';
import Alerts from './components/dashboard/Alerts';
import WorkCreationForm from './components/dashboard/WorkCreationForm';
import Reports from './components/dashboard/Reports';
import Communication from './components/dashboard/Communication';
import AuditLogs from './components/dashboard/AuditLogs';
import HeadmasterDashboard from './components/dashboard/HeadmasterDashboard';
import HeadmasterWorkRequests from './components/dashboard/HeadmasterWorkRequests';
import HeadmasterActiveWorks from './components/dashboard/HeadmasterActiveWorks';
import ClerkDashboard from './components/dashboard/ClerkDashboard';
import ClerkInventory from './components/dashboard/ClerkInventory';
import ClerkQuotations from './components/dashboard/ClerkQuotations';
import ClerkStockMovements from './components/dashboard/ClerkStockMovements';
import ClerkLowStockAlerts from './components/dashboard/ClerkLowStockAlerts';
import AdminFundRequests from './components/dashboard/AdminFundRequests';
import SachivDashboard from './components/dashboard/SachivDashboard';
import SachivWorkMonitoring from './components/dashboard/SachivWorkMonitoring';
import SachivWorkVerification from './components/dashboard/SachivWorkVerification';
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
