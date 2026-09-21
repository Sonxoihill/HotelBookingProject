import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { tokenStorage } from '../../utils/tokenStorage';
import { loginApi } from '../../services/authService';
import { Hotel, Mail, Lock, LogIn, AlertCircle, CheckCircle2 } from 'lucide-react';

export const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const nextErrors = {};

    if (!email.trim()) {
      nextErrors.email = 'Vui lòng nhập địa chỉ email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = 'Email không đúng định dạng (ví dụ: user@example.com)';
    }

    if (!password) {
      nextErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (password.length < 6) {
      nextErrors.password = 'Mật khẩu phải chứa ít nhất 6 ký tự';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');
    setSuccessMsg('');

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await loginApi({
        email: email.trim(),
        password: password,
      });

      const authData = response?.data || response;
      if (authData?.token) {
        tokenStorage.setToken(authData.token);
      }
      if (authData?.email) {
        tokenStorage.setUser({
          id: authData.id,
          email: authData.email,
          fullName: authData.fullName,
          role: authData.role,
        });
      }

      setSuccessMsg('Đăng nhập thành công! Đang chuyển hướng...');

      setTimeout(() => {
        const role = authData?.role;
        if (role === 'ADMIN') {
          navigate('/admin');
        } else if (role === 'RECEPTIONIST') {
          navigate('/receptionist');
        } else {
          navigate('/');
        }
      }, 700);
    } catch (err) {
      setApiError(err.message || 'Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin.');
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

        {/* Global Error Banner */}
        {apiError && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2.5 animate-in fade-in duration-200">
            <AlertCircle size={16} className="shrink-0 text-rose-500" />
            <span>{apiError}</span>
          </div>
        )}

        {/* Success Banner */}
        {successMsg && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2.5 animate-in fade-in duration-200">
            <CheckCircle2 size={16} className="shrink-0 text-emerald-500" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <Input
            id="login-email"
            label="Địa chỉ Email *"
            type="email"
            icon={Mail}
            placeholder="example@domain.com"
            value={email}
            error={errors.email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
            }}
            required
          />

          <Input
            id="login-password"
            label="Mật khẩu *"
            type="password"
            icon={Lock}
            placeholder="••••••••"
            value={password}
            error={errors.password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors((prev) => ({ ...prev, password: '' }));
            }}
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
            className="w-full py-2.5 text-sm font-bold gap-2 mt-2"
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
