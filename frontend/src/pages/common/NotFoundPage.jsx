import React, { useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import { Home, AlertOctagon, LayoutDashboard, ConciergeBell, ArrowLeft } from 'lucide-react';
import { tokenStorage } from '../../utils/tokenStorage';

export const NotFoundPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Xác định đối tượng người dùng để điều hướng về đúng trang tương ứng:
  // - Admin -> Trang quản trị (/admin/dashboard)
  // - Lễ tân -> Trang lễ tân (/receptionist)
  // - Khách hàng / Khách vãng lai -> Trang chủ (/)
  const destination = useMemo(() => {
    const rawRole = tokenStorage.getUserRole();
    const role = rawRole ? String(rawRole).toUpperCase() : null;
    const path = location.pathname || '';

    // 1. Phân hệ Admin: Người dùng có role ADMIN hoặc URL xuất phát từ /admin/...
    if (role === 'ADMIN' || (!role && path.startsWith('/admin'))) {
      return {
        path: '/admin/dashboard',
        label: 'Về trang quản trị',
        Icon: LayoutDashboard,
      };
    }

    // 2. Phân hệ Lễ tân: Người dùng có role RECEPTIONIST hoặc URL xuất phát từ /receptionist/...
    if (role === 'RECEPTIONIST' || (!role && path.startsWith('/receptionist'))) {
      return {
        path: '/receptionist',
        label: 'Về trang lễ tân',
        Icon: ConciergeBell,
      };
    }

    // 3. Khách hàng (CUSTOMER, GUEST) hoặc người dùng chưa đăng nhập
    return {
      path: '/',
      label: 'Về trang chủ',
      Icon: Home,
    };
  }, [location.pathname]);

  const DestinationIcon = destination.Icon;

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
        <AlertOctagon size={36} />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-900 font-serif">404</h1>
      <h2 className="text-xl font-bold text-slate-800 mt-2">Trang không tồn tại</h2>
      <p className="text-xs text-slate-500 max-w-sm mt-1 mb-6">
        Đường dẫn bạn yêu cầu không tìm thấy trên hệ thống hoặc đã được di dời sang vị trí mới.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center justify-center px-4 py-2 text-sm rounded-lg font-medium border border-slate-300 hover:bg-slate-100 text-slate-700 transition-all duration-200 cursor-pointer gap-2"
        >
          <ArrowLeft size={16} />
          <span>Quay lại</span>
        </button>
        <Link to={destination.path}>
          <Button variant="primary" className="gap-2 cursor-pointer">
            <DestinationIcon size={16} />
            <span>{destination.label}</span>
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
