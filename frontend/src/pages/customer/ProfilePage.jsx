import React, { useState } from 'react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { tokenStorage } from '../../utils/tokenStorage';
import { User, Mail, Phone, MapPin, ShieldCheck, Lock } from 'lucide-react';

export const ProfilePage = () => {
  const user = tokenStorage.getUser() || {
    fullName: 'Nguyễn Văn An',
    email: 'an.nguyen@gmail.com',
    phone: '0912345678',
    address: 'Hải Châu, Đà Nẵng',
  };

  const [formData, setFormData] = useState(user);
  const [isSaved, setIsSaved] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    tokenStorage.setUser(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

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
          Cập nhật thông tin liên hệ và cài đặt bảo mật cho tài khoản của bạn.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left card avatar */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 flex flex-col items-center text-center space-y-4 shadow-xs">
          <div className="w-24 h-24 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-3xl font-black shadow-inner">
            {formData.fullName ? formData.fullName[0].toUpperCase() : 'U'}
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">{formData.fullName}</h3>
            <span className="text-xs text-slate-400">{formData.email}</span>
          </div>
          <div className="pt-2 border-t border-slate-100 w-full text-xs text-slate-500 space-y-1">
            <p>Hạng hội viên: <strong className="text-amber-600">Gold Member</strong></p>
            <p>Điểm thưởng: <strong className="text-slate-700">1,250 pts</strong></p>
          </div>
        </div>

        {/* Right form info */}
        <div className="md:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-6">
          <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
            Thông tin định danh
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Họ và tên"
                icon={User}
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              />
              <Input
                label="Số điện thoại"
                icon={Phone}
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              <div className="sm:col-span-2">
                <Input
                  label="Địa chỉ Email"
                  type="email"
                  icon={Mail}
                  value={formData.email}
                  disabled
                  helperText="Email liên kết tài khoản không thể chỉnh sửa"
                />
              </div>
              <div className="sm:col-span-2">
                <Input
                  label="Địa chỉ cư trú"
                  icon={MapPin}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
            </div>

            {isSaved && (
              <div className="p-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-semibold">
                ✓ Đã lưu cập nhật thông tin hồ sơ thành công!
              </div>
            )}

            <div className="pt-3 flex justify-end">
              <Button type="submit" variant="primary">
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
