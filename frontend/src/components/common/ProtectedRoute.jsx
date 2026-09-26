import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { tokenStorage } from '../../utils/tokenStorage';

export const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const token = tokenStorage.getToken();

  if (!token) {
    // Không có Token trong localStorage -> redirect ngay về /login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
