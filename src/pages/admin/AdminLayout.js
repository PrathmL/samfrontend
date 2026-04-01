import React from 'react';
import AdminSidebar from './AdminSidebar';

const AdminLayout = ({ children }) => {
  return (
    <div className="admin-layout">
      <AdminSidebar />
      <main className="admin-main">
        <div className="admin-content-container">
          {children}
        </div>
      </main>

      <style>{`
        .admin-layout {
          display: flex;
          min-height: 100vh;
          background-color: #f0f4f8;
        }
        .admin-main {
          flex: 1;
          margin-left: 260px;
          padding: 1.5rem;
          transition: margin-left 0.3s ease;
          display: flex;
          flex-direction: column;
        }
        .admin-content-container {
          max-width: 1600px;
          width: 100%;
          margin: 0 auto;
          flex: 1;
          padding-top: 1rem;
        }

        @media (max-width: 1024px) {
          .admin-main {
            margin-left: 0;
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;
