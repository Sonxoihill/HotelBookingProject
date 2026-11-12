import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import ReceptionistSidebar from '../components/receptionist/ReceptionistSidebar';
import ReceptionistNavbar from '../components/receptionist/ReceptionistNavbar';

export const ReceptionistLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#F8F9FA] overflow-hidden font-sans">
      {/* 1. Desktop Sidebar (Hiển thị cố định trên Desktop >= 1024px) */}
      <div className="hidden lg:flex shrink-0">
        <ReceptionistSidebar />
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
            <ReceptionistSidebar onClose={() => setIsSidebarOpen(false)} />
          </div>
        </div>
      )}

      {/* 3. Vùng làm việc chính */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <ReceptionistNavbar onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)} />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ReceptionistLayout;
