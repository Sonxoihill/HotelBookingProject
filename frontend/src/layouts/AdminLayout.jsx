import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminNavbar from '../components/admin/AdminNavbar';

export const AdminLayout = () => {
  const location = useLocation();

  const getBreadcrumb = () => {
    if (location.pathname.includes('/rooms')) return 'Bàn Quản Trị Trung Tâm';
    if (location.pathname.includes('/services')) return 'Bàn Quản Trị Trung Tâm';
    if (location.pathname.includes('/pricing')) return 'Bàn Quản Trị Trung Tâm';
    if (location.pathname.includes('/staff')) return 'Bàn Quản Trị Trung Tâm';
    return 'Bàn Quản Trị Trung Tâm';
  };

  return (
    <div className="flex h-screen bg-[#F8F9FA] text-stone-800 overflow-hidden font-sans">
      {/* Sidebar riêng của Admin */}
      <AdminSidebar />

      {/* Vùng quản trị chính */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminNavbar breadcrumbSub={getBreadcrumb()} />
        <main className="flex-1 p-6 sm:p-8 overflow-y-auto">
          <div className="max-w-[1440px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
