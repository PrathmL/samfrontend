import React from 'react';
import AdminSidebar from './AdminSidebar';

const AdminLayout = ({ children }) => {
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-main">
        {children}
      </main>

      <style>{`
        .admin-layout {
          display: flex;
          min-height: 100vh;
          background-color: #f8fafc;
        }
        .admin-main {
          flex: 1;
          margin-left: 260px;
          padding: 2rem;
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;
