import React from 'react';
import { Outlet } from 'react-router-dom';
import ReceptionistSidebar from '../components/receptionist/ReceptionistSidebar';
import ReceptionistNavbar from '../components/receptionist/ReceptionistNavbar';

export const ReceptionistLayout = () => {
  return (
    <div className="flex h-screen bg-[#F8F9FA] overflow-hidden font-sans">
      {/* Sidebar riêng của Lễ tân */}
      <ReceptionistSidebar />

      {/* Vùng làm việc chính */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <ReceptionistNavbar />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default ReceptionistLayout;
