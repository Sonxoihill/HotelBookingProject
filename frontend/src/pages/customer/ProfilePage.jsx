import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { userService } from '../../services/userService';
import { tokenStorage } from '../../utils/tokenStorage';
import { User, Mail, Phone, Lock, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

export const ProfilePage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: '',
    status: '',
  });

  const [profileErrors, setProfileErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // State quản lý Đổi Mật Khẩu
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Tải dữ liệu thật từ Database qua API GET /users/profile khi component mount
  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true);
      setErrorMessage('');
      try {
        const response = await userService.getProfile();
        const profile = response?.data || response;
        if (profile) {
          setFormData({
            fullName: profile.fullName || '',
            email: profile.email || '',
            phone: profile.phone || '',
            role: profile.role || 'GUEST',
            status: profile.status || 'ACTIVE',
          });
          // Cập nhật lại thông tin đồng bộ trong localStorage
          const existingUser = tokenStorage.getUser() || {};
          tokenStorage.setUser({
            ...existingUser,
            fullName: profile.fullName,
            email: profile.email,
            phone: profile.phone,
            role: profile.role,
          });
        }
      } catch (err) {
        console.error('Lỗi khi tải thông tin hồ sơ:', err);
        const errMsg = err.message || 'Không thể tải thông tin hồ sơ.';
        if (errMsg.includes('401') || errMsg.toLowerCase().includes('phiên đăng nhập')) {
          tokenStorage.clearAuth();
          navigate('/login');
          return;
        }
        setErrorMessage(errMsg);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  // Validate thông tin cá nhân theo đúng validate của RegisterPage
  const validateProfile = () => {
    const nextErrors = {};

    if (!formData.fullName.trim()) {
      nextErrors.fullName = 'Vui lòng nhập họ và tên';
    } else if (!/^[\p{L}\s]+$/u.test(formData.fullName.trim())) {
      nextErrors.fullName = 'Họ và tên không đúng định dạng ';
    }

    const cleanedPhone = (formData.phone || '').trim().replace(/\s+/g, '');
    if (!cleanedPhone) {
      nextErrors.phone = 'Vui lòng nhập số điện thoại';
    } else if (!/^(0|\+84)[35789]\d{8}$/.test(cleanedPhone)) {
      nextErrors.phone = 'Số điện thoại không đúng định dạng ';
    }

    setProfileErrors(nextErrors);
    return nextErrors;
  };

  const handleProfileChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (profileErrors[field]) {
      setProfileErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    const validationErrors = validateProfile();
    if (Object.keys(validationErrors).length > 0) {
      const firstErrorMsg = Object.values(validationErrors)[0];
      setErrorMessage(firstErrorMsg);
      return;
    }

    setIsSubmitting(true);
    const cleanedPhone = (formData.phone || '').trim().replace(/\s+/g, '');

    try {
      // Cập nhật Họ và tên và Số điện thoại vào database
      const response = await userService.updateProfile({
        fullName: formData.fullName.trim(),
        phone: cleanedPhone,
      });

      const updated = response?.data || response;
      setFormData((prev) => ({
        ...prev,
        fullName: updated.fullName || prev.fullName,
        phone: updated.phone || prev.phone,
      }));

      // Cập nhật user trong localStorage
      const existingUser = tokenStorage.getUser() || {};
      tokenStorage.setUser({
        ...existingUser,
        fullName: updated.fullName || formData.fullName,
        phone: updated.phone || cleanedPhone,
      });

      // Phát sự kiện để Header và các component khác đồng bộ thông tin mới
      window.dispatchEvent(new Event('storage'));

      setSuccessMessage('Cập nhật thông tin cá nhân thành công!');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      console.error('Lỗi cập nhật hồ sơ:', err);
      const errMsg = err.message || 'Có lỗi xảy ra khi cập nhật hồ sơ.';
      if (errMsg.includes('401') || errMsg.toLowerCase().includes('phiên đăng nhập')) {
        tokenStorage.clearAuth();
        navigate('/login');
        return;
      }

      if (err.errors && typeof err.errors === 'object') {
        setProfileErrors((prev) => ({ ...prev, ...err.errors }));
      }
      if (errMsg.includes('Số điện thoại') || errMsg.toLowerCase().includes('phone')) {
        setProfileErrors((prev) => ({ ...prev, phone: errMsg }));
      } else if (errMsg.includes('Họ và tên') || errMsg.toLowerCase().includes('fullname')) {
        setProfileErrors((prev) => ({ ...prev, fullName: errMsg }));
      }

      setErrorMessage(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Validate đổi mật khẩu theo đúng validate của RegisterPage
  const validatePassword = () => {
    const nextErrors = {};

    if (!passwordData.currentPassword) {
      nextErrors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
    }

    if (!passwordData.newPassword) {
      nextErrors.newPassword = 'Vui lòng nhập mật khẩu';
    } else if (passwordData.newPassword.length < 6) {
      nextErrors.newPassword = 'Mật khẩu phải chứa ít nhất 6 ký tự';
    }

    if (!passwordData.confirmPassword) {
      nextErrors.confirmPassword = 'Vui lòng xác nhận lại mật khẩu';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      nextErrors.confirmPassword = 'Mật khẩu xác nhận không trùng khớp';
    }

    setPasswordErrors(nextErrors);
    return nextErrors;
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }));
    if (passwordErrors[field]) {
      setPasswordErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  // Xử lý gửi yêu cầu Đổi Mật Khẩu
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordSuccess('');
    setPasswordError('');

    const validationErrors = validatePassword();
    if (Object.keys(validationErrors).length > 0) {
      const firstErrorMsg = Object.values(validationErrors)[0];
      setPasswordError(firstErrorMsg);
      return;
    }

    setIsChangingPassword(true);
    try {
      await userService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword,
      });

      setPasswordSuccess('Đổi mật khẩu thành công! Mật khẩu mới đã được lưu vào cơ sở dữ liệu.');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setPasswordErrors({});
      setTimeout(() => setPasswordSuccess(''), 5000);
    } catch (err) {
      console.error('Lỗi khi đổi mật khẩu:', err);
      const errMsg = err.message || 'Có lỗi xảy ra khi đổi mật khẩu.';
      if (err.errors && typeof err.errors === 'object') {
        setPasswordErrors((prev) => ({ ...prev, ...err.errors }));
      }
      setPasswordError(errMsg);
    } finally {
      setIsChangingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
        <span className="text-xs text-stone-500 font-medium">Đang tải thông tin hồ sơ...</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <span className="text-xs font-bold text-amber-600 uppercase tracking-widest block">
          Tài khoản khách hàng
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 mt-1 font-serif">
          Quản Lý Hồ Sơ Cá Nhân
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Cập nhật thông tin liên hệ và cài đặt tài khoản bảo mật của bạn.
        </p>
      </div>

      {/* Thông báo Thành công / Lỗi */}
      {successMessage && (
        <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 bg-rose-50 text-rose-800 border border-rose-200 rounded-2xl text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
          <AlertCircle size={16} className="text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left card avatar (Chế độ chỉ đọc - Read-only, không có nút đổi avatar) */}
        <div className="bg-white rounded-3xl border border-stone-200 p-6 flex flex-col items-center text-center space-y-4 shadow-xs">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center text-3xl font-black shadow-inner border border-amber-200">
              {formData.fullName ? formData.fullName.trim()[0].toUpperCase() : 'U'}
            </div>
          </div>

          <div>
            {/* Render Họ tên an toàn bằng JSX thuần túy chống XSS */}
            <h3 className="font-bold text-slate-900 text-base">{formData.fullName}</h3>
            <span className="text-xs text-slate-400">{formData.email}</span>
          </div>

          <div className="pt-2 border-t border-slate-100 w-full text-xs text-slate-500 space-y-1.5">
            <div className="flex items-center justify-between">
              <span>Vai trò:</span>
              <span className="px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-800 font-semibold text-[11px]">
                {formData.role}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span>Trạng thái:</span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold text-[11px]">
                {formData.status}
              </span>
            </div>
          </div>
        </div>

        {/* Cột phải: 2 khối (1. Thông tin cá nhân, 2. Đổi mật khẩu) */}
        <div className="md:col-span-2 space-y-8">
          {/* Khối 1: Thông tin cá nhân */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-6">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Thông tin cá nhân
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Họ và tên: Cho phép chỉnh sửa */}
                <div className="sm:col-span-2">
                  <Input
                    label="Họ và tên"
                    icon={User}
                    placeholder="Nhập họ và tên đầy đủ"
                    value={formData.fullName}
                    onChange={(e) => handleProfileChange('fullName', e.target.value)}
                    error={profileErrors.fullName}
                    required
                  />
                </div>

                {/* Số điện thoại */}
                <Input
                  label="Số điện thoại"
                  icon={Phone}
                  placeholder="Ví dụ: 0912345678 hoặc +84912345678"
                  value={formData.phone || ''}
                  onChange={(e) => handleProfileChange('phone', e.target.value)}
                  error={profileErrors.phone}
                  helperText={!profileErrors.phone ? "Định dạng: 0x hoặc +84x (x là 3, 5, 7, 8, 9) gồm 10 số" : undefined}
                  required
                />

                {/* Địa chỉ Email: Khóa cứng vì là mã định danh đăng nhập */}
                <Input
                  label="Địa chỉ Email"
                  type="email"
                  icon={Mail}
                  value={formData.email}
                  disabled
                  readOnly
                  helperText="Email dùng để đăng nhập vào tài khoản"
                />
              </div>

              <div className="pt-3 flex justify-end">
                <Button type="submit" variant="primary" isLoading={isSubmitting}>
                  Lưu Thay Đổi
                </Button>
              </div>
            </form>
          </div>

          {/* Khối 2: Chức năng Đổi Mật Khẩu tài khoản (lưu vào database) */}
          <div className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                  <Lock size={16} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Đổi Mật Khẩu Tài Khoản
                  </h3>
                  <p className="text-xs text-slate-400">
                    Mật khẩu phải chứa ít nhất 6 ký tự.
                  </p>
                </div>
              </div>
            </div>

            {/* Thông báo Thành công / Lỗi riêng cho Đổi mật khẩu */}
            {passwordSuccess && (
              <div className="p-3.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
                <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            {passwordError && (
              <div className="p-3.5 bg-rose-50 text-rose-800 border border-rose-200 rounded-2xl text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
                <AlertCircle size={16} className="text-rose-600 shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              {/* Mật khẩu hiện tại */}
              <Input
                label="Mật khẩu hiện tại"
                type="password"
                placeholder="••••••••"
                icon={Lock}
                value={passwordData.currentPassword}
                onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                error={passwordErrors.currentPassword}
                required
              />

              {/* Mật khẩu mới & Xác nhận mật khẩu mới */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Mật khẩu mới"
                  type="password"
                  placeholder="••••••••"
                  icon={Lock}
                  value={passwordData.newPassword}
                  onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                  error={passwordErrors.newPassword}
                  helperText={!passwordErrors.newPassword ? "Mật khẩu phải chứa ít nhất 6 ký tự" : undefined}
                  required
                />

                <Input
                  label="Xác nhận mật khẩu mới"
                  type="password"
                  placeholder="••••••••"
                  icon={Lock}
                  value={passwordData.confirmPassword}
                  onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                  error={passwordErrors.confirmPassword}
                  required
                />
              </div>

              <div className="pt-2 flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isChangingPassword}
                >
                  Lưu Thay Đổi Mật Khẩu
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
