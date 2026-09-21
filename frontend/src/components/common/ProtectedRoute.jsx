import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { tokenStorage } from '../../utils/tokenStorage';

/**
 * Component ProtectedRoute (AuthWrapper)
 * Kiểm tra xem người dùng đã đăng nhập (có JWT Token trong localStorage) hay chưa.
 * - Nếu KHÔNG có token: Đá về trang /login kèm vị trí muốn truy cập để redirect sau khi đăng nhập.
 * - Nếu CÓ token: Cho phép hiển thị nội dung bên trong (Route con).
 */
export const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const token = tokenStorage.getToken();

  if (!token) {
    // Không có Token -> Đá người dùng về /login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
