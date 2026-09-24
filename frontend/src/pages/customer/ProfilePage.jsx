import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { userService } from '../../services/userService';
import { tokenStorage } from '../../utils/tokenStorage';
import { User, Mail, Phone, ShieldCheck, AlertCircle, CheckCircle2, Loader2, Lock, Eye, EyeOff, Check } from 'lucide-react';

export const ProfilePage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: '',
    status: '',
  });

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
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Ràng buộc bảo mật mật khẩu
  const isLengthValid = passwordData.newPassword.length >= 8;
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(passwordData.newPassword);
  const isMatch = passwordData.confirmPassword.length > 0 && passwordData.newPassword === passwordData.confirmPassword;

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage('');
    setErrorMessage('');

    if (!formData.fullName || !formData.fullName.trim()) {
      setErrorMessage('Họ và tên không được để trống!');
      setIsSubmitting(false);
      return;
    }

    const phoneTrimmed = formData.phone ? formData.phone.trim() : '';
    if (!phoneTrimmed) {
      setErrorMessage('Số điện thoại không được để trống!');
      setIsSubmitting(false);
      return;
    }

    // Ràng buộc số điện thoại: Bắt đầu bằng 0 (đủ 10 số) hoặc +84 và 9 số sau (0-9)
    const phoneRegex = /^(0[0-9]{9}|\+84[0-9]{9})$/;
    if (!phoneRegex.test(phoneTrimmed)) {
      setErrorMessage(
        'Số điện thoại không hợp lệ! Số điện thoại bắt buộc phải là 10 số (bắt đầu bằng 0 và 9 số sau từ 0-9) hoặc bắt đầu bằng +84 và 9 số sau (0-9).'
      );
      setIsSubmitting(false);
      return;
    }

    try {
      // Cập nhật Họ và tên và Số điện thoại vào database
      const response = await userService.updateProfile({
        fullName: formData.fullName.trim(),
        phone: phoneTrimmed,
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
        phone: updated.phone || phoneTrimmed,
      });

      // Phát sự kiện để Header và các component khác đồng bộ thông tin mới
      window.dispatchEvent(new Event('storage'));

      setSuccessMessage('Cập nhật thông tin cá nhân thành công! Số điện thoại đã được lưu vào cơ sở dữ liệu.');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      console.error('Lỗi cập nhật hồ sơ:', err);
      const errMsg = err.message || 'Có lỗi xảy ra khi cập nhật hồ sơ.';
      if (errMsg.includes('401') || errMsg.toLowerCase().includes('phiên đăng nhập')) {
        tokenStorage.clearAuth();
        navigate('/login');
        return;
      }
      setErrorMessage(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Xử lý gửi yêu cầu Đổi Mật Khẩu
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordSuccess('');
    setPasswordError('');

    if (!passwordData.currentPassword) {
      setPasswordError('Vui lòng nhập mật khẩu hiện tại!');
      return;
    }

    if (!isLengthValid) {
      setPasswordError('Mật khẩu mới phải có từ 8 ký tự trở lên!');
      return;
    }

    if (!hasSpecialChar) {
      setPasswordError('Mật khẩu mới phải chứa ít nhất 1 ký hiệu đặc biệt (ví dụ: @, #, $, %, !...)!');
      return;
    }

    if (!isMatch) {
      setPasswordError('Xác nhận mật khẩu mới không trùng khớp!');
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
      setTimeout(() => setPasswordSuccess(''), 5000);
    } catch (err) {
      console.error('Lỗi khi đổi mật khẩu:', err);
      const errMsg = err.message || 'Có lỗi xảy ra khi đổi mật khẩu.';
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

        {/* Cột phải: 2 khối (1. Thông tin định danh, 2. Đổi mật khẩu) */}
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
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    required
                  />
                </div>

                {/* Số điện thoại */}
                <Input
                  label="Số điện thoại"
                  icon={Phone}
                  placeholder="Ví dụ: 0912345678 hoặc +84912345678"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  helperText="Bắt buộc: 10 số bắt đầu bằng 0 hoặc +84 kèm 9 số sau (0-9)"
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
                    Mật khẩu phải từ 8 ký tự trở lên và có ký hiệu đặc biệt.
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
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700 block">
                  Mật khẩu hiện tại <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword.current ? 'text' : 'password'}
                    placeholder="Nhập mật khẩu hiện tại của bạn"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    required
                    className="w-full px-4 py-2.5 pr-10 text-xs sm:text-sm bg-stone-50/50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-600 focus:bg-white transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword({ ...showPassword, current: !showPassword.current })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer"
                  >
                    {showPassword.current ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Mật khẩu mới & Xác nhận mật khẩu mới */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Mật khẩu mới <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword.new ? 'text' : 'password'}
                      placeholder="Ít nhất 8 ký tự & ký hiệu đặc biệt"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      required
                      className="w-full px-4 py-2.5 pr-10 text-xs sm:text-sm bg-stone-50/50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-600 focus:bg-white transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer"
                    >
                      {showPassword.new ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-700 block">
                    Xác nhận mật khẩu mới <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword.confirm ? 'text' : 'password'}
                      placeholder="Nhập lại mật khẩu mới"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      required
                      className="w-full px-4 py-2.5 pr-10 text-xs sm:text-sm bg-stone-50/50 border border-stone-200 rounded-xl focus:outline-none focus:border-amber-600 focus:bg-white transition-all font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer"
                    >
                      {showPassword.confirm ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>
              <div className="pt-2 flex justify-end">
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isChangingPassword}
                  disabled={!isLengthValid || !hasSpecialChar || !isMatch || !passwordData.currentPassword}
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
