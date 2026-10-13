import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import { ShieldAlert, Home, LogIn } from 'lucide-react';

export const ForbiddenPage = () => {
  useEffect(() => {
    document.title = '403 Forbidden - LuxeStay';
  }, []);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4 shadow-sm shadow-rose-200">
        <ShieldAlert size={36} />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-900 font-serif">403 - Quyền Truy Cập Bị Từ Chối </h1>
      <p className="text-xs text-slate-500 max-w-md mt-2 mb-6">
        Bạn không có quyền hạn cần thiết để truy cập vào phân hệ này. Vui lòng đăng nhập với tài khoản có quyền Lễ tân hoặc Quản trị viên tương ứng.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link to="/login">
          <Button variant="primary" className="gap-2">
            <LogIn size={16} />
            <span>Đăng nhập tài khoản khác</span>
          </Button>
        </Link>
        <Link to="/">
          <Button variant="outline" className="gap-2">
            <Home size={16} />
            <span>Về trang chủ</span>
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default ForbiddenPage;
