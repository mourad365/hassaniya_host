
import React from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';

const AdminLayout = ({ children }) => {
  return (
    <div className="flex min-h-screen bg-sand-medium/50" dir="rtl">
      <AdminSidebar />
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
