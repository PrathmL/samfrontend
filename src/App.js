import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './components/auth/LoginPage';
import AdminLayout from './components/dashboard/AdminLayout';
import AdminDashboardHome from './components/dashboard/AdminDashboardHome';
import UserManagement from './components/dashboard/UserManagement';
import TalukaManagement from './components/dashboard/TalukaManagement';
import SchoolManagement from './components/dashboard/SchoolManagement';
import AdminWorkRequests from './components/dashboard/AdminWorkRequests';
import WorkCreationForm from './components/dashboard/WorkCreationForm';
import { 
  SachivDashboard,  
  ClerkDashboard 
} from './components/dashboard/Dashboards';
import HeadmasterDashboard from './components/dashboard/HeadmasterDashboard';


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
                <AdminLayout>
                  <Routes>
                    <Route path="dashboard" element={<AdminDashboardHome />} />
                    <Route path="users" element={<UserManagement />} />
                    <Route path="talukas" element={<TalukaManagement />} />
                    <Route path="schools" element={<SchoolManagement />} />
                    <Route path="work-requests" element={<AdminWorkRequests />} />
                    <Route path="create-work/:requestId" element={<WorkCreationForm />} />
                    <Route path="*" element={<Navigate to="dashboard" />} />
                  </Routes>
                </AdminLayout>
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/sachiv/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['SACHIV']}>
                <SachivDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/headmaster/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['HEADMASTER']}>
                <HeadmasterDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/clerk/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['CLERK']}>
                <ClerkDashboard />
              </ProtectedRoute>
            } 
          />

          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;