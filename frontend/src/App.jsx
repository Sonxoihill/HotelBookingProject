import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import MainLayout from './layouts/MainLayout';
import ReceptionistLayout from './layouts/ReceptionistLayout';
import AdminLayout from './layouts/AdminLayout';

// Customer Pages
import HomePage from './pages/customer/HomePage';
import RoomsPage from './pages/customer/RoomsPage';
import RoomDetailPage from './pages/customer/RoomDetailPage';
import ExperiencesPage from './pages/customer/ExperiencesPage';
import BookingPaymentPage from './pages/customer/BookingPaymentPage';
import BookingHistoryPage from './pages/customer/BookingHistoryPage';
import ProfilePage from './pages/customer/ProfilePage';
import LoginPage from './pages/customer/LoginPage';
import RegisterPage from './pages/customer/RegisterPage';
import VNPayReturnPage from './pages/customer/VNPayReturnPage';

// Receptionist Pages
import RoomMatrixPage from './pages/receptionist/RoomMatrixPage';
import ReceptionistBookingsPage from './pages/receptionist/ReceptionistBookingsPage';
import ReceptionistServicesPage from './pages/receptionist/ReceptionistServicesPage';
import HousekeepingManagementPage from './pages/receptionist/HousekeepingManagementPage';

// Admin Pages
import ReportStatisticsPage from './pages/admin/ReportStatisticsPage';
import RoomCategoryManagementPage from './pages/admin/RoomCategoryManagementPage';
import RoomManagementPage from './pages/admin/RoomManagementPage';
import ServiceManagementPage from './pages/admin/ServiceManagementPage';
import PriceSettingPage from './pages/admin/PriceSettingPage';
import StaffManagementPage from './pages/admin/StaffManagementPage';

// Common Pages
import NotFoundPage from './pages/common/NotFoundPage';
import ForbiddenPage from './pages/common/ForbiddenPage';
import ProtectedRoute from './components/common/ProtectedRoute';
import ErrorBoundary from './components/common/ErrorBoundary';

export function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <Routes>
        {/* =================================================================== */}
        {/* PHÂN HỆ 1: KHÁCH HÀNG & NGƯỜI DÙNG (Sử dụng MainLayout)            */}
        {/* =================================================================== */}
        <Route path="/" element={<MainLayout />}>
          {/* Trang chủ & Tìm kiếm phòng (Công khai) */}
          <Route index element={<HomePage />} />

          {/* Danh sách phòng & Bộ lọc (Công khai) */}
          <Route path="rooms" element={<RoomsPage />} />

          {/* Trải nghiệm dịch vụ (Công khai) */}
          <Route path="experiences" element={<ExperiencesPage />} />

          {/* Xem chi tiết phòng (Công khai) */}
          <Route path="rooms/:id" element={<RoomDetailPage />} />

          {/* Các trang yêu cầu đăng nhập đối với Khách hàng */}
          <Route element={<ProtectedRoute />}>
            {/* Đặt phòng & Cổng thanh toán */}
            <Route path="booking-payment" element={<BookingPaymentPage />} />

            {/* Lịch sử đặt phòng & Đánh giá phản hồi */}
            <Route path="my-bookings" element={<BookingHistoryPage />} />

            {/* Quản lý hồ sơ cá nhân */}
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          {/* Kết quả phản hồi từ Cổng thanh toán VNPay (Callback) */}
          <Route path="booking/vnpay-return" element={<VNPayReturnPage />} />
          <Route path="api/v1/payment/vnpay-return" element={<VNPayReturnPage />} />

          {/* Đăng nhập */}
          <Route path="login" element={<LoginPage />} />

          {/* Đăng ký tài khoản */}
          <Route path="register" element={<RegisterPage />} />
        </Route>

        {/* =================================================================== */}
        {/* PHÂN HỆ 2: QUẦY LỄ TÂN (Sử dụng ReceptionistLayout)                */}
        {/* Phân quyền bảo vệ: Chỉ RECEPTIONIST hoặc ADMIN                      */}
        {/* =================================================================== */}
        <Route element={<ProtectedRoute allowedRoles={['RECEPTIONIST', 'ADMIN']} />}>
          <Route path="/receptionist" element={<ReceptionistLayout />}>
            {/* Sơ đồ phòng & : Cập nhật Trạng thái dọn phòng */}
            <Route index element={<RoomMatrixPage />} />

            {/* Quản lý Đơn đặt phòng & : Quản lý Dịch vụ phát sinh */}
            <Route path="bookings" element={<ReceptionistBookingsPage />} />

            {/* Dịch vụ & Minibar */}
            <Route path="services" element={<ReceptionistServicesPage />} />

            {/* Quản lý Buồng phòng */}
            <Route path="housekeeping" element={<HousekeepingManagementPage />} />
          </Route>
        </Route>

        {/* =================================================================== */}
        {/* PHÂN HỆ 3: QUẢN TRỊ VIÊN (Sử dụng AdminLayout)                     */}
        {/* Phân quyền bảo vệ: Chỉ ADMIN (Chặn hoàn toàn role CUSTOMER)          */}
        {/* =================================================================== */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route path="/admin" element={<AdminLayout />}>
            {/* Tự động chuyển hướng /admin sang /admin/dashboard */}
            <Route index element={<Navigate to="/admin/dashboard" replace />} />

            {/* Dashboard & Thống kê */}
            <Route path="dashboard" element={<ReportStatisticsPage />} />

            {/* Quản lý Loại phòng */}
            <Route path="room-categories" element={<RoomCategoryManagementPage />} />

            {/* Quản lý Buồng phòng */}
            <Route path="rooms" element={<RoomManagementPage />} />

            {/* Quản lý Dịch vụ */}
            <Route path="services" element={<ServiceManagementPage />} />

            {/* Cài đặt Giá linh hoạt */}
            <Route path="pricing" element={<PriceSettingPage />} />

            {/* Quản lý Người dùng & Nhân sự */}
            <Route path="users" element={<StaffManagementPage />} />
            <Route path="staff" element={<Navigate to="/admin/users" replace />} />
          </Route>
        </Route>

        {/* =================================================================== */}
        {/* TRANG LỖI HỆ THỐNG                                                  */}
        {/* =================================================================== */}
        <Route path="/403" element={<ForbiddenPage />} />
        <Route path="/unauthorized" element={<ForbiddenPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </ErrorBoundary>
  </BrowserRouter>
  );
}

export default App;
