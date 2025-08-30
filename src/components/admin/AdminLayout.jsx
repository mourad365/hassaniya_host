
import React from 'react';
import AdminSidebar from '@/components/admin/AdminSidebar';

const AdminLayout = ({ children }) => {
  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-sand-medium/50" dir="rtl">
      <AdminSidebar />
      <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
        <div className="max-w-full">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
