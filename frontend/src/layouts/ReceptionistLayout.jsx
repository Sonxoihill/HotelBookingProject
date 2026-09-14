import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import ReceptionistSidebar from '../components/receptionist/ReceptionistSidebar';
import ReceptionistNavbar from '../components/receptionist/ReceptionistNavbar';

export const ReceptionistLayout = () => {
  const location = useLocation();

  const getTitle = () => {
    if (location.pathname.includes('/bookings')) {
      return 'Quản lý Đơn đặt phòng & Dịch vụ phát sinh';
    }
    return 'Sơ đồ phòng khách sạn trực quan';
  };

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden font-sans">
      {/* Sidebar riêng của Lễ tân */}
      <ReceptionistSidebar />

      {/* Vùng làm việc chính */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <ReceptionistNavbar title={getTitle()} />
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ReceptionistLayout;
