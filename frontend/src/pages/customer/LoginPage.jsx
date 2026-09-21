import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { authService } from '../../services/authService';
import { tokenStorage } from '../../utils/tokenStorage';
import { Hotel, Mail, Lock, LogIn, AlertCircle, Sparkles } from 'lucide-react';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Đọc thông báo redirect nếu có (từ ProtectedRoute hoặc 401 interceptor)
  const expiredMessage = location.state?.message || 
    (new URLSearchParams(location.search).get('expired') ? 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!' : null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Gọi API POST /api/v1/auth/login từ backend
      const response = await authService.login({ email, password });
      const token = response?.data?.token || response?.token;
      if (token) {
        tokenStorage.setToken(token);
      }
      const user = response?.data?.user || response?.user;
      if (user) {
        tokenStorage.setUser(user);
      }
      const role = user?.role || 'CUSTOMER';

      // Chuyển hướng theo Role hoặc về trang trước đó
      const fromPath = location.state?.from?.pathname;
      if (fromPath) {
        navigate(fromPath, { replace: true });
      } else if (role === 'ADMIN') {
        navigate('/admin', { replace: true });
      } else if (role === 'RECEPTIONIST') {
        navigate('/receptionist', { replace: true });
      } else {
        navigate('/profile', { replace: true });
      }
    } catch (err) {
      console.warn('Lỗi đăng nhập:', err);
      // Hiển thị thông báo lỗi từ backend (ví dụ: Email hoặc mật khẩu không chính xác)
      setError(err.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại tài khoản.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoAccount = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 p-8 shadow-xl space-y-6">
        {/* Brand */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center mx-auto shadow-md shadow-amber-600/20">
            <Hotel size={26} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 font-serif">Đăng Nhập Tài Khoản</h2>
          <p className="text-xs text-slate-500">
            Hệ thống Quản lý và Đặt phòng Khách sạn LuxeStay
          </p>
        </div>

        {/* Expired or Warning Message */}
        {expiredMessage && (
          <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-2xl flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0 text-amber-600" />
            <span>{expiredMessage}</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-2xl flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Địa chỉ Email"
            type="email"
            icon={Mail}
            placeholder="example@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <Input
            label="Mật khẩu"
            type="password"
            icon={Lock}
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 cursor-pointer text-slate-600">
              <input type="checkbox" className="rounded accent-amber-600" defaultChecked />
              <span>Ghi nhớ đăng nhập</span>
            </label>
            <span className="text-amber-600 hover:underline cursor-pointer">Quên mật khẩu?</span>
          </div>

          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            className="w-full py-2.5 text-sm font-bold gap-2"
          >
            <LogIn size={16} />
            <span>Đăng Nhập</span>
          </Button>
        </form>

        {/* Tài khoản mẫu tiện lợi */}
        <div className="pt-4 border-t border-slate-100 space-y-2">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <Sparkles size={12} className="text-amber-600" />
            <span>Tài khoản mẫu từ Database:</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
            <button
              type="button"
              onClick={() => handleDemoAccount('guest@example.com', '123456')}
              className="px-2 py-1.5 bg-slate-50 hover:bg-amber-50 hover:border-amber-300 border border-slate-200 rounded-xl font-medium text-slate-700 transition-colors"
            >
              Khách hàng
            </button>
            <button
              type="button"
              onClick={() => handleDemoAccount('receptionist@hotelbooking.com', '123456')}
              className="px-2 py-1.5 bg-slate-50 hover:bg-amber-50 hover:border-amber-300 border border-slate-200 rounded-xl font-medium text-slate-700 transition-colors"
            >
              Lễ tân
            </button>
            <button
              type="button"
              onClick={() => handleDemoAccount('admin@hotelbooking.com', '123456')}
              className="px-2 py-1.5 bg-slate-50 hover:bg-amber-50 hover:border-amber-300 border border-slate-200 rounded-xl font-medium text-slate-700 transition-colors"
            >
              Quản trị viên
            </button>
          </div>
        </div>

        <div className="pt-2 text-center text-xs text-slate-500">
          Chưa có tài khoản khách hàng?{' '}
          <Link to="/register" className="font-bold text-amber-600 hover:underline">
            Đăng ký ngay
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
