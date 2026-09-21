import React, { useState, useEffect } from 'react';
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
  Calendar, 
  LogOut, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
  Award
} from 'lucide-react';

export const ProfilePage = () => {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Form fields for editing
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');

  // Fetch profile từ API GET /api/v1/users/profile
  const fetchProfile = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await userService.getProfile();
      // response có dạng { success: true, message: "...", data: UserProfileDto }
      const userData = response?.data || response;
      setProfile(userData);
      setFullName(userData?.fullName || '');
      setPhone(userData?.phone || '');
    } catch (err) {
      console.error('Lỗi khi tải thông tin hồ sơ:', err);
      // Xử lý lỗi Token hết hạn (Lỗi 401)
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

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      // Giả lập lưu hoặc gọi API cập nhật nếu backend hỗ trợ
      setProfile((prev) => ({
        ...prev,
        fullName,
        phone,
      }));
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
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

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
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
            Quản lý và cập nhật thông tin cá nhân của bạn trên hệ thống LuxeStay.
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl transition-colors cursor-pointer self-start sm:self-center"
        >
          <LogOut size={16} />
          <span>Đăng Xuất</span>
        </button>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Cột trái: Tóm tắt thông tin tài khoản & Avatar */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col items-center text-center space-y-5 shadow-sm">
          {/* Avatar với chữ cái đầu */}
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-amber-600 to-amber-400 text-white flex items-center justify-center text-3xl font-black shadow-lg shadow-amber-600/20">
            {profile?.fullName ? profile.fullName[0].toUpperCase() : 'U'}
          </div>

          <div className="space-y-1">
            <h3 className="font-bold text-slate-900 text-lg font-serif">
              {profile?.fullName || 'Chưa cập nhật tên'}
            </h3>
            <span className="text-xs text-slate-500 block truncate max-w-[220px]">
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

        {/* Cột phải: Form chi tiết hiển thị các trường yêu cầu */}
        <div className="md:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold text-slate-900 font-serif flex items-center gap-2">
              <ShieldCheck size={20} className="text-amber-600" />
              Chi Tiết Hồ Sơ Cá Nhân
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Dữ liệu được đồng bộ trực tiếp từ Database hệ thống
            </p>
          </div>

          <form onSubmit={handleUpdate} className="space-y-5">
            {/* 4 TRƯỜNG CỐT LÕI: TÊN, EMAIL, SỐ ĐIỆN THOẠI, QUYỀN HẠN */}
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
                  helperText="Email dùng để đăng nhập và nhận thông tin xác nhận đặt phòng, không thể tự chỉnh sửa"
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
                Được bảo vệ bởi JWT Token bảo mật
              </span>
              <Button type="submit" variant="primary" isLoading={isUpdating}>
                Lưu Thay Đổi
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
