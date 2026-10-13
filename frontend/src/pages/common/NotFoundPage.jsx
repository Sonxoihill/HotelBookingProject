import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import { Home, AlertOctagon } from 'lucide-react';

export const NotFoundPage = () => {
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
      <Link to="/">
        <Button variant="primary" className="gap-2">
          <Home size={16} />
          <span>Về trang chủ</span>
        </Button>
      </Link>
    </div>
  );
};

export default NotFoundPage;
