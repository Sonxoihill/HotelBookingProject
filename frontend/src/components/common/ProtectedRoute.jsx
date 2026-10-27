import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { tokenStorage } from '../../utils/tokenStorage';

/**
 * Route Guard Component (SCRUM-36)
 * - Kiểm tra trạng thái đăng nhập và hiệu lực của JWT token.
 * - Kiểm tra quyền (Role-Based Access Control) theo danh sách allowedRoles.
 * - Nếu chưa đăng nhập: Chuyển hướng về /login (lưu lại đường dẫn hiện tại vào state.from).
 * - Nếu đăng nhập nhưng không có quyền tương ứng: Chuyển hướng về /unauthorized (403).
 */
export const ProtectedRoute = ({ allowedRoles = [] }) => {
  const location = useLocation();

  // 1. Kiểm tra xác thực token (chưa đăng nhập hoặc token đã hết hạn) -> Chuyển về /login
  if (!tokenStorage.isAuthenticated()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Kiểm tra phân quyền Role nếu có chỉ định allowedRoles
  // Nếu role là GUEST, CUSTOMER, hoặc RECEPTIONIST khi vào route ADMIN -> Chuyển về /403
  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = tokenStorage.getUserRole();
    const cleanRole = userRole ? String(userRole).replace(/^ROLE_/, '').toUpperCase() : '';
    const hasPermission = allowedRoles.some((role) => {
      const cleanAllowed = String(role).replace(/^ROLE_/, '').toUpperCase();
      return cleanRole === cleanAllowed || userRole === role;
    });

    if (!hasPermission) {
      return <Navigate to="/403" replace />;
    }
  }

  // 3. Hợp lệ -> Cho phép truy cập vào các route con
  return <Outlet />;
};

export default ProtectedRoute;
