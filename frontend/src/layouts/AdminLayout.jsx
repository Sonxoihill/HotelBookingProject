import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';
import AdminNavbar from '../components/admin/AdminNavbar';

export const AdminLayout = () => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const getBreadcrumb = () => {
    if (location.pathname.includes('/room-categories')) return 'Quản lý Loại Phòng';
    if (location.pathname.includes('/rooms')) return 'Quản lý Phòng';
    if (location.pathname.includes('/services')) return 'Quản lý Dịch vụ';
    if (location.pathname.includes('/pricing')) return 'Cài đặt Giá linh hoạt';
    if (location.pathname.includes('/users') || location.pathname.includes('/staff')) return 'Quản lý Người dùng';
    if (location.pathname.includes('/dashboard')) return 'Thống kê & Báo cáo';
    return 'Bàn Quản Trị Trung Tâm';
  };

  return (
    <div className="flex h-screen bg-[#F8F9FA] text-stone-800 overflow-hidden font-sans">
      {/* 1. Desktop Sidebar (Hiển thị cố định trên Desktop >= 1024px) */}
      <div className="hidden lg:flex shrink-0">
        <AdminSidebar />
      </div>

      {/* 2. Mobile/Tablet Sidebar Drawer & Backdrop (< 1024px) */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop Overlay */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setIsSidebarOpen(false)}
          />

          {/* Slide-in Drawer */}
          <div className="fixed inset-y-0 left-0 w-64 max-w-[85vw] bg-white shadow-2xl flex flex-col z-50 animate-in slide-in-from-left duration-250">
            <AdminSidebar onClose={() => setIsSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* 3. Vùng quản trị chính */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <AdminNavbar
          breadcrumbSub={getBreadcrumb()}
          onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-[1440px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
