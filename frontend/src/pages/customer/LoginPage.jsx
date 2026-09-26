import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { tokenStorage } from '../../utils/tokenStorage';
import { authService } from '../../services/authService';
import { Hotel, Mail, Lock, LogIn } from 'lucide-react';

export const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      const response = await authService.login({ email, password });
      const user = response?.user || tokenStorage.getUser();
      const role = user?.role;

      if (role === 'ADMIN') {
        navigate('/admin');
      } else if (role === 'RECEPTIONIST') {
        navigate('/receptionist');
      } else {
        navigate('/');
      }
    } catch (err) {
      console.error('Login error:', err);
      setErrorMsg(err.message || 'Đăng nhập không thành công. Vui lòng kiểm tra lại email/mật khẩu!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
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

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
              {errorMsg}
            </div>
          )}
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

        <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
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
