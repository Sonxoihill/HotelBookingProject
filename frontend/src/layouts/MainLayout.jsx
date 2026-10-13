import React from 'react';
import { Outlet } from 'react-router-dom';
import CustomerHeader from '../components/customer/CustomerHeader';
import CustomerFooter from '../components/customer/CustomerFooter';

export const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Header cho khách hàng: Logo, Menu, Nút Đăng nhập/Đăng ký */}
      <CustomerHeader />

      {/* Vùng nội dung các trang khách hàng */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer chân trang */}
      <CustomerFooter />
    </div>
  );
};

export default MainLayout;
