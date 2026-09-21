import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { registerApi } from '../../services/authService';
import { Hotel, Mail, Lock, User, Phone, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = () => {
    const nextErrors = {};

    if (!formData.fullName.trim()) {
      nextErrors.fullName = 'Vui lòng nhập họ và tên';
    }

    if (!formData.email.trim()) {
      nextErrors.email = 'Vui lòng nhập địa chỉ email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      nextErrors.email = 'Email không đúng định dạng (ví dụ: user@example.com)';
    }

    if (!formData.password) {
      nextErrors.password = 'Vui lòng nhập mật khẩu';
    } else if (formData.password.length < 6) {
      nextErrors.password = 'Mật khẩu phải chứa ít nhất 6 ký tự';
    }

    if (!formData.confirmPassword) {
      nextErrors.confirmPassword = 'Vui lòng xác nhận lại mật khẩu';
    } else if (formData.password !== formData.confirmPassword) {
      nextErrors.confirmPassword = 'Mật khẩu xác nhận không trùng khớp';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
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
      await registerApi({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || undefined,
        password: formData.password,
      });

      setSuccessMsg('Đăng ký tài khoản thành công! Đang chuyển hướng sang trang đăng nhập...');

      setTimeout(() => {
        navigate('/login');
      }, 1200);
    } catch (err) {
      setApiError(err.message || 'Đăng ký tài khoản không thành công. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 p-8 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center mx-auto shadow-md shadow-amber-600/20">
            <Hotel size={26} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 font-serif">Đăng Ký Tài Khoản</h2>
          <p className="text-xs text-slate-500">
            Tạo tài khoản thành viên để nhận ưu đãi và trải nghiệm dịch vụ
          </p>
        </div>

        {/* Global Error Alert */}
        {apiError && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2.5 animate-in fade-in duration-200">
            <AlertCircle size={16} className="shrink-0 text-rose-500" />
            <span>{apiError}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2.5 animate-in fade-in duration-200">
            <CheckCircle2 size={16} className="shrink-0 text-emerald-500" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-3.5">
          <Input
            id="register-fullname"
            label="Họ và tên *"
            icon={User}
            placeholder="Nguyễn Văn A"
            value={formData.fullName}
            error={errors.fullName}
            onChange={(e) => handleChange('fullName', e.target.value)}
            required
          />

          <Input
            id="register-email"
            label="Địa chỉ Email *"
            type="email"
            icon={Mail}
            placeholder="example@domain.com"
            value={formData.email}
            error={errors.email}
            onChange={(e) => handleChange('email', e.target.value)}
            required
          />

          <Input
            id="register-phone"
            label="Số điện thoại"
            type="tel"
            icon={Phone}
            placeholder="0901234567"
            value={formData.phone}
            error={errors.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
          />

          <Input
            id="register-password"
            label="Mật khẩu *"
            type="password"
            icon={Lock}
            placeholder="Tối thiểu 6 ký tự"
            value={formData.password}
            error={errors.password}
            onChange={(e) => handleChange('password', e.target.value)}
            required
          />

          <Input
            id="register-confirm-password"
            label="Xác nhận mật khẩu *"
            type="password"
            icon={Lock}
            placeholder="Nhập lại mật khẩu"
            value={formData.confirmPassword}
            error={errors.confirmPassword}
            onChange={(e) => handleChange('confirmPassword', e.target.value)}
            required
          />

          <Button
            type="submit"
            variant="primary"
            isLoading={isLoading}
            className="w-full py-2.5 text-sm font-bold gap-2 mt-2"
          >
            <UserPlus size={16} />
            <span>Tạo Tài Khoản</span>
          </Button>
        </form>

        <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
          Đã có tài khoản thành viên?{' '}
          <Link to="/login" className="font-bold text-amber-600 hover:underline">
            Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
