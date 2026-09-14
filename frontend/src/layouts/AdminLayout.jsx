import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminNavbar from '../components/admin/AdminNavbar';

export const AdminLayout = () => {
  const location = useLocation();

  const getTitle = () => {
    if (location.pathname.includes('/rooms')) return 'Quản lý Loại phòng & Phòng';
    if (location.pathname.includes('/services')) return 'Quản lý Danh mục Dịch vụ';
    if (location.pathname.includes('/pricing')) return 'Cài đặt Giá linh hoạt';
    if (location.pathname.includes('/staff')) return 'Quản lý Nhân sự Lễ tân & Buồng phòng';
    return 'Báo cáo & Thống kê Doanh thu';
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans">
      {/* Sidebar riêng của Admin */}
      <AdminSidebar />

      {/* Vùng quản trị chính */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminNavbar title={getTitle()} />
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
