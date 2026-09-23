import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { registerApi } from '../../services/authService';
import { Hotel, Mail, Lock, User, Phone, UserPlus, AlertCircle, CheckCircle2, X } from 'lucide-react';

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
  const [toast, setToast] = useState(null);
  const toastTimeoutRef = useRef(null);

  const showToast = (message, type = 'error') => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToast({ message, type });
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const validateForm = () => {
    const nextErrors = {};

    if (!formData.fullName.trim()) {
      nextErrors.fullName = 'Vui lòng nhập họ và tên';
    } else if (!/^[\p{L}\s]+$/u.test(formData.fullName.trim())) {
      nextErrors.fullName = 'Họ và tên không đúng định dạng ';
    }

    if (!formData.email.trim()) {
      nextErrors.email = 'Vui lòng nhập địa chỉ email';
    } else if (!/^[a-zA-Z0-9.]+@gmail\.com$/i.test(formData.email.trim())) {
      nextErrors.email = 'Email không đúng định dạng';
    }

    const cleanedPhone = formData.phone.trim().replace(/\s+/g, '');
    if (!cleanedPhone) {
      nextErrors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^(0|\+84)[35789]\d{8}$/.test(cleanedPhone)) {
      nextErrors.phone = 'Số điện thoại không đúng định dạng ';
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
    return nextErrors;
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

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      const firstErrorMsg = Object.values(validationErrors)[0];
      showToast(firstErrorMsg, 'error');
      return;
    }

    setIsLoading(true);

    try {
      await registerApi({
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim().replace(/\s+/g, ''),
        password: formData.password,
      });

      setSuccessMsg('Đăng ký tài khoản thành công! Đang chuyển hướng sang trang đăng nhập...');
      showToast('Đăng ký tài khoản thành công! Đang chuyển hướng...', 'success');

      setTimeout(() => {
        navigate('/login');
      }, 1200);
    } catch (err) {
      const msg = err.message || 'Đăng ký tài khoản không thành công. Vui lòng thử lại.';

      // Map danh sách lỗi chi tiết từ backend (HTTP 400 Validation Error)
      if (err.errors && typeof err.errors === 'object') {
        setErrors((prev) => ({ ...prev, ...err.errors }));
      }

      if (msg.includes('Số điện thoại') || msg.toLowerCase().includes('phone')) {
        setErrors((prev) => ({ ...prev, phone: msg }));
      } else if (msg.includes('Email') || msg.toLowerCase().includes('email')) {
        setErrors((prev) => ({ ...prev, email: msg }));
      }
      setApiError(msg);
      showToast(msg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative">
      {/* Toast Notification */}
      {toast && (
        <div
          role="alert"
          aria-live="assertive"
          className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border text-sm transition-all duration-300 animate-in fade-in slide-in-from-top-4 ${
            toast.type === 'error'
              ? 'bg-rose-950/95 text-rose-100 border-rose-700/60 shadow-rose-950/40 backdrop-blur-md'
              : 'bg-emerald-950/95 text-emerald-100 border-emerald-700/60 shadow-emerald-950/40 backdrop-blur-md'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle size={20} className="text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
          )}
          <div className="flex flex-col">
            <span className={`font-bold text-[11px] uppercase tracking-wider ${toast.type === 'error' ? 'text-rose-300' : 'text-emerald-300'}`}>
              {toast.type === 'error' ? 'Cảnh báo lỗi' : 'Thành công'}
            </span>
            <span className="text-xs text-white/95 font-medium">{toast.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="ml-3 p-1 hover:bg-white/10 rounded-lg transition-colors text-white/70 hover:text-white"
            aria-label="Đóng thông báo"
          >
            <X size={15} />
          </button>
        </div>
      )}

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
            placeholder="example@gmail.com"
            value={formData.email}
            error={errors.email}
            onChange={(e) => handleChange('email', e.target.value)}
            required
          />

          <Input
            id="register-phone"
            label="Số điện thoại *"
            type="tel"
            icon={Phone}
            placeholder="0901234567"
            value={formData.phone}
            error={errors.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            required
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
