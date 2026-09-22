import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../../services/userService';
import { authService } from '../../services/authService';
import { tokenStorage } from '../../utils/tokenStorage';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import {
  User,
  Mail,
  Phone,
  ShieldCheck,
  LogOut,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Camera,
  Upload,
  Trash2,
  X,
  Sparkles
} from 'lucide-react';

export const ProfilePage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Form fields for editing
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  // Avatar upload & Security states
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [avatarError, setAvatarError] = useState(null);
  const [avatarSuccess, setAvatarSuccess] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  // Helper chuyển đổi URL ảnh từ backend thành URL đầy đủ
  const getAvatarUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const backendBase = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1').replace(/\/api\/v1\/?$/, '');
    return `${backendBase}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  // Fetch profile từ API GET /api/v1/users/profile
  const fetchProfile = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await userService.getProfile();
      const userData = response?.data || response;
      setProfile(userData);
      setFullName(userData?.fullName || '');
      setPhone(userData?.phone || '');
    } catch (err) {
      console.error('Lỗi khi tải thông tin hồ sơ:', err);
      if (err.message?.includes('401') || err.message?.includes('hết hạn') || err.message?.includes('Unauthorized')) {
        tokenStorage.clearAuth();
        navigate('/login', {
          replace: true,
          state: { message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!' }
        });
        return;
      }
      setError(err.message || 'Không thể tải thông tin hồ sơ người dùng.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Cập nhật thông tin họ tên & số điện thoại
  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const response = await userService.updateProfile({ fullName, phone });
      const updatedUser = response?.data || response;
      setProfile(updatedUser);
      tokenStorage.setUser(updatedUser);
      window.dispatchEvent(new Event('storage'));
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3500);
    } catch (err) {
      alert('Không thể cập nhật hồ sơ: ' + err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = async () => {
    await authService.logout();
    navigate('/login', { replace: true });
  };

  // =========================================================================
  // XỬ LÝ & BẢO MẬT ẢNH ĐẠI DIỆN (CHỐNG CHÈN MÃ ĐỘC)
  // =========================================================================

  /**
   * Khử độc tố hình ảnh bằng HTML5 Canvas:
   * Vẽ lại toàn bộ pixel lên Canvas và xuất ra tệp JPEG thuần túy.
   * Kỹ thuật này triệt tiêu hoàn toàn các mã độc nhúng (XSS payload, mã SVG, script PHP/HTML, EXIF exploit).
   */
  const sanitizeImageWithCanvas = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          if (img.width < 10 || img.height < 10 || img.width > 4096 || img.height > 4096) {
            reject(new Error('Kích thước ảnh không hợp lệ (Phải từ 10x10 đến 4096x4096 pixel).'));
            return;
          }

          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);

          canvas.toBlob((blob) => {
            if (!blob) {
              reject(new Error('Không thể chuẩn hóa dữ liệu điểm ảnh.'));
              return;
            }
            const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').toLowerCase();
            const cleanFile = new File([blob], safeName, { type: 'image/jpeg' });
            resolve(cleanFile);
          }, 'image/jpeg', 0.92);
        };
        img.onerror = () => {
          reject(new Error('Tệp tin bị hỏng hoặc không phải là hình ảnh hợp lệ.'));
        };
        img.src = e.target.result;
      };
      reader.onerror = () => reject(new Error('Không thể đọc dữ liệu tệp tin.'));
      reader.readAsDataURL(file);
    });
  };

  const validateAndPrepareFile = async (file) => {
    setAvatarError(null);
    if (!file) return;

    // Chốt chặn 1: Giới hạn dung lượng tối đa 2MB
    if (file.size > 2 * 1024 * 1024) {
      setAvatarError('Dung lượng tệp vượt quá giới hạn (Tối đa 2MB).');
      return;
    }

    // Chốt chặn 2: Kiểm tra đuôi tệp (Nghiêm cấm SVG, HTML, EXE, JS, PHP)
    const ext = file.name.split('.').pop()?.toLowerCase();
    const ALLOWED_EXTS = ['jpg', 'jpeg', 'png', 'webp'];
    if (!ALLOWED_EXTS.includes(ext)) {
      setAvatarError('Định dạng tệp không được phép! Chỉ chấp nhận JPG, PNG, WEBP (Nghiêm cấm SVG, HTML, JS, PHP để phòng ngừa mã độc).');
      return;
    }

    // Chốt chặn 3: Khử độc và chuẩn hóa điểm ảnh qua Canvas
    try {
      const sanitized = await sanitizeImageWithCanvas(file);
      setPreviewFile(sanitized);
      setPreviewUrl(URL.createObjectURL(sanitized));
      setIsModalOpen(true);
    } catch (err) {
      setAvatarError(err.message || 'Tệp tin không đúng định dạng hình ảnh hợp lệ.');
    }
  };

  const handleFileInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndPrepareFile(file);
    }
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndPrepareFile(file);
    }
  };

  // Xác nhận tải lên ảnh đại diện đã được làm sạch
  const handleConfirmUpload = async () => {
    if (!previewFile) return;

    setIsUploadingAvatar(true);
    setAvatarError(null);

    try {
      const formData = new FormData();
      formData.append('file', previewFile);

      const response = await userService.uploadAvatar(formData);
      const updatedUser = response?.data || response;

      setProfile(updatedUser);
      tokenStorage.setUser(updatedUser);
      window.dispatchEvent(new Event('storage'));

      setIsModalOpen(false);
      setPreviewFile(null);
      setPreviewUrl(null);
      setAvatarSuccess(true);
      setTimeout(() => setAvatarSuccess(false), 3500);
    } catch (err) {
      setAvatarError(err.response?.data?.message || err.message || 'Tải lên ảnh đại diện thất bại.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Xóa ảnh đại diện hiện tại
  const handleDeleteAvatar = async () => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa ảnh đại diện và quay về chữ cái đầu mặc định?')) {
      return;
    }

    setIsUploadingAvatar(true);
    setAvatarError(null);
    try {
      const response = await userService.deleteAvatar();
      const updatedUser = response?.data || response;

      setProfile(updatedUser);
      tokenStorage.setUser(updatedUser);
      window.dispatchEvent(new Event('storage'));

      setAvatarSuccess(true);
      setTimeout(() => setAvatarSuccess(false), 3500);
    } catch (err) {
      setAvatarError(err.response?.data?.message || err.message || 'Không thể xóa ảnh đại diện.');
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  // Helper chuyển đổi Role sang tiếng Việt và màu Badge
  const getRoleBadge = (role) => {
    switch (role?.toUpperCase()) {
      case 'ADMIN':
        return <Badge variant="rose">Quản Trị Viên (ADMIN)</Badge>;
      case 'RECEPTIONIST':
        return <Badge variant="sky">Lễ Tân Khách Sạn</Badge>;
      case 'CUSTOMER':
      case 'GUEST':
      default:
        return <Badge variant="emerald">Khách Hàng Thành Viên</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded-lg w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="h-64 bg-slate-200 rounded-3xl"></div>
            <div className="md:col-span-2 h-96 bg-slate-200 rounded-3xl"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <AlertCircle size={28} />
        </div>
        <h2 className="text-xl font-bold text-slate-900 font-serif">Lỗi Tải Hồ Sơ</h2>
        <p className="text-sm text-slate-600">{error}</p>
        <div className="flex justify-center gap-3 pt-2">
          <Button variant="primary" onClick={fetchProfile} className="gap-2">
            <RefreshCw size={16} />
            <span>Thử lại</span>
          </Button>
          <Button variant="outline" onClick={handleLogout}>
            Đăng nhập lại
          </Button>
        </div>
      </div>
    );
  }

  const currentAvatarSrc = getAvatarUrl(profile?.avatarUrl);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Header Profile */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <span className="text-xs font-bold text-amber-600 uppercase tracking-widest block">
            Hồ Sơ Khách Hàng
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 mt-1 font-serif">
            Thông Tin Tài Khoản
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Quản lý và cập nhật thông tin cá nhân của bạn trên hệ thống L'ÉTOILE Resorts.
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors cursor-pointer self-start sm:self-center shadow-2xs"
        >
          <LogOut size={16} />
          <span>Đăng Xuất</span>
        </button>
      </div>

      {/* Thông báo cập nhật avatar thành công */}
      {avatarSuccess && (
        <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-2xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            <span>Đã cập nhật ảnh đại diện an toàn thành công!</span>
          </div>
          <button onClick={() => setAvatarSuccess(false)} className="text-emerald-500 hover:text-emerald-800">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Thông báo lỗi avatar */}
      {avatarError && (
        <div className="p-4 bg-rose-50 text-rose-800 border border-rose-200 rounded-2xl text-xs font-semibold flex items-center justify-between shadow-2xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="text-rose-600 shrink-0" />
            <span>{avatarError}</span>
          </div>
          <button onClick={() => setAvatarError(null)} className="text-rose-500 hover:text-rose-800">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* =================================================================== */}
        {/* CỘT TRÁI: AVATAR INTERACTIVE & TÓM TẮT TÀI KHOẢN                   */}
        {/* =================================================================== */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 flex flex-col items-center text-center space-y-6 shadow-sm">
          {/* Avatar Container with Interactive Hover & Drag/Drop */}
          <div className="space-y-3 flex flex-col items-center">
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden cursor-pointer group select-none transition-all duration-300 shadow-md ${isDragOver
                ? 'ring-4 ring-amber-500 scale-105'
                : 'hover:shadow-xl hover:scale-102 ring-2 ring-slate-200/80 hover:ring-amber-500/80'
                }`}
              title="Nhấn để chọn ảnh hoặc kéo thả ảnh vào đây"
            >
              {currentAvatarSrc ? (
                <img
                  src={currentAvatarSrc}
                  alt={profile?.fullName || 'Avatar'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-[#8C6239] via-[#C59D5F] to-[#F7DFBC] text-[#2C1E11] flex items-center justify-center text-4xl font-extrabold font-serif">
                  {profile?.fullName ? profile.fullName.trim()[0].toUpperCase() : 'U'}
                </div>
              )}

              {/* Hover Dark Overlay with Camera Icon */}
              <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white gap-1 p-2">
                <Camera size={22} className="text-amber-200 animate-bounce" />
                <span className="text-[10px] font-semibold tracking-wide uppercase">
                  Đổi ảnh đại diện
                </span>
                <span className="text-[9px] text-stone-300">
                  Kéo thả hoặc Nhấn
                </span>
              </div>

              {/* Camera Badge in bottom right for touch/mobile devices */}
              <div className="absolute bottom-2 right-2 w-7 h-7 rounded-xl bg-white text-stone-800 shadow-md flex items-center justify-center border border-slate-200 md:group-hover:hidden">
                <Camera size={14} />
              </div>
            </div>

            {/* Nút hành động nhanh về Avatar */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium transition-colors cursor-pointer"
              >
                <Upload size={13} />
                <span>Tải ảnh mới</span>
              </button>

              {currentAvatarSrc && (
                <button
                  type="button"
                  onClick={handleDeleteAvatar}
                  disabled={isUploadingAvatar}
                  title="Xóa ảnh đại diện"
                  className="p-1.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 transition-colors cursor-pointer border border-rose-200"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>

          <div className="space-y-1 w-full pt-2">
            <h3 className="font-bold text-slate-900 text-lg font-serif">
              {profile?.fullName || 'Chưa cập nhật tên'}
            </h3>
            <span className="text-xs text-slate-500 block truncate max-w-[220px] mx-auto">
              {profile?.email}
            </span>
            <div className="pt-2">
              {getRoleBadge(profile?.role)}
            </div>
          </div>

          <div className="w-full pt-4 border-t border-slate-100 text-left space-y-3 text-xs text-slate-600">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Mã người dùng:</span>
              <span className="font-mono font-bold text-slate-800">#{profile?.id || 'N/A'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Trạng thái:</span>
              <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
                <CheckCircle2 size={13} /> {profile?.status || 'ACTIVE'}
              </span>
            </div>
            {profile?.createdAt && (
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Ngày tham gia:</span>
                <span className="font-medium text-slate-700">
                  {new Date(profile.createdAt).toLocaleDateString('vi-VN')}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* =================================================================== */}
        {/* CỘT PHẢI: FORM CHỈNH SỬA THÔNG TIN CHI TIẾT                        */}
        {/* =================================================================== */}
        <div className="md:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold text-slate-900 font-serif flex items-center gap-2">
              <ShieldCheck size={20} className="text-amber-600" />
              Chi Tiết Hồ Sơ Cá Nhân
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Dữ liệu được mã hóa và bảo mật tuyệt đối trên hệ thống LuxeStay.
            </p>
          </div>

          <form onSubmit={handleUpdate} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* 1. TÊN */}
              <Input
                label="Họ và tên *"
                icon={User}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nhập họ và tên của bạn"
                required
              />

              {/* 2. SỐ ĐIỆN THOẠI */}
              <Input
                label="Số điện thoại"
                icon={Phone}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="090xxxxxxx"
              />

              {/* 3. EMAIL (Disabled) */}
              <div className="sm:col-span-2">
                <Input
                  label="Địa chỉ Email (Định danh hệ thống)"
                  type="email"
                  icon={Mail}
                  value={profile?.email || ''}
                  disabled
                  helperText="Email dùng để đăng nhập và xác thực phiên, không thể tự chỉnh sửa"
                />
              </div>

              {/* 4. QUYỀN HẠN */}
              <div className="sm:col-span-2 bg-amber-50/60 border border-amber-200/70 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-amber-900 block">
                    Quyền Hạn Tài Khoản
                  </span>
                  <span className="text-xs text-amber-700/80">
                    Quyền hạn quyết định các chức năng bạn có thể truy cập trên hệ thống
                  </span>
                </div>
                <div className="font-bold text-sm text-amber-900">
                  {getRoleBadge(profile?.role)}
                </div>
              </div>
            </div>

            {updateSuccess && (
              <div className="p-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 size={16} />
                <span>Đã lưu cập nhật thông tin thành công!</span>
              </div>
            )}

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Bảo vệ bởi chữ ký JWT chuẩn & Phòng vệ mã độc
              </span>
              <Button type="submit" variant="primary" isLoading={isUpdating}>
                Lưu Thay Đổi
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* =================================================================== */}
      {/* MODAL XÁC NHẬN & KIỂM TRA BẢO MẬT ẢNH TRƯỚC KHI TẢI LÊN            */}
      {/* =================================================================== */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-md w-full p-6 space-y-6">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck size={20} className="text-emerald-600" />
                <h3 className="font-serif font-bold text-stone-900 text-base">
                  Xác Nhận Thay Đổi Ảnh Đại Diện
                </h3>
              </div>
              <button
                type="button"
                onClick={() => { setIsModalOpen(false); setPreviewUrl(null); }}
                className="text-stone-400 hover:text-stone-700 p-1"
              >
                <X size={18} />
              </button>
            </div>

            {/* Preview Image */}
            <div className="flex flex-col items-center space-y-4">
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-stone-100 shadow-lg bg-stone-100">
                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                disabled={isUploadingAvatar}
                onClick={() => { setIsModalOpen(false); setPreviewUrl(null); }}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-full transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                disabled={isUploadingAvatar}
                onClick={handleConfirmUpload}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold bg-[#2C1E11] hover:bg-[#432E1A] text-white rounded-full transition-all cursor-pointer shadow-md hover:shadow-lg disabled:opacity-50"
              >
                {isUploadingAvatar ? (
                  <>
                    <RefreshCw size={13} className="animate-spin" />
                    <span>Đang mã hóa & tải lên...</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={14} className="text-amber-200" />
                    <span>Lưu làm ảnh đại diện</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
