import React, { useState } from 'react';
import {
  X,
  Users,
  Briefcase,
  Clock,
  ShieldCheck,
  Mail,
  Phone,
  CreditCard,
  MapPin,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export const AddStaffModal = ({ isOpen, onClose, onAddStaff }) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '0' + Math.floor(100 + Math.random() * 900),
    email: '',
    phone: '',
    idCard: '',
    department: 'Lễ tân chính (Front Desk)',
    roleTag: 'FRONT DESK AGENT',
    category: 'RECEPTION',
    shift: 'Ca sáng',
    shiftTime: '06:00 – 14:00',
    assignedZone: 'Quầy Lễ tân sảnh chính (Main Lobby)',
    permissions: [
      'VIEW_RACK',
      'CHECKIN_CHECKOUT',
      'ROOM_SERVICE_CHARGE',
    ],
    status: 'ACTIVE',
    password: '123456',
  });

  if (!isOpen) return null;

  const ALL_PERMISSIONS = [
    { key: 'VIEW_RACK', label: 'Xem sơ đồ phòng & buồng phòng (Rack)' },
    { key: 'CHECKIN_CHECKOUT', label: 'Tạo đặt phòng mới, Check-in & Check-out' },
    { key: 'ROOM_SERVICE_CHARGE', label: 'Nạp dịch vụ, Minibar & Quản lý Folio' },
    { key: 'HOUSEKEEPING_INSPECT', label: 'Nghiệm thu phòng sạch & Đổi trạng thái buồng' },
    { key: 'PRICING_RMS', label: 'Cài đặt chính sách giá linh hoạt RMS' },
    { key: 'REPORTS_FINANCE', label: 'Xem báo cáo doanh thu & Dòng tiền' },
    { key: 'STAFF_ADMIN', label: 'Quản trị nhân sự & Phân quyền bảo mật' },
  ];

  const togglePermission = (permKey) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permKey)
        ? prev.permissions.filter((k) => k !== permKey)
        : [...prev.permissions, permKey],
    }));
  };

  const handleDepartmentChange = (dept) => {
    let cat = 'RECEPTION';
    let role = 'FRONT DESK AGENT';
    let perms = ['VIEW_RACK', 'CHECKIN_CHECKOUT', 'ROOM_SERVICE_CHARGE'];

    if (dept.includes('Buồng phòng')) {
      cat = 'HOUSEKEEPING';
      role = 'HOUSEKEEPING SUPERVISOR';
      perms = ['VIEW_RACK', 'HOUSEKEEPING_INSPECT'];
    } else if (dept.includes('Kỹ thuật')) {
      cat = 'MAINTENANCE';
      role = 'MEP TECHNICIAN';
      perms = ['VIEW_RACK'];
    } else if (dept.includes('Quản lý')) {
      cat = 'MANAGEMENT';
      role = 'DUTY MANAGER';
      perms = ['VIEW_RACK', 'CHECKIN_CHECKOUT', 'ROOM_SERVICE_CHARGE', 'HOUSEKEEPING_INSPECT', 'PRICING_RMS', 'REPORTS_FINANCE'];
    } else if (dept.includes('Butler')) {
      cat = 'MANAGEMENT';
      role = 'BUTLER SERVICE ELITE';
      perms = ['VIEW_RACK', 'ROOM_SERVICE_CHARGE'];
    }

    setFormData((prev) => ({
      ...prev,
      department: dept,
      category: cat,
      roleTag: role,
      permissions: perms,
    }));
  };

  const handleShiftChange = (shiftName) => {
    let time = '06:00 – 14:00';
    if (shiftName === 'Ca chiều') time = '14:00 – 22:00';
    if (shiftName === 'Ca đêm') time = '22:00 – 06:00';
    if (shiftName === 'Hành chính') time = '08:00 – 17:00';
    if (shiftName === 'Trực kỹ thuật 24/7') time = 'Sẵn sàng 24/7';

    setFormData((prev) => ({
      ...prev,
      shift: shiftName,
      shiftTime: time,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    onAddStaff({
      ...formData,
      email: formData.email || `${formData.name.toLowerCase().replace(/\s+/g, '.')}@gmail.com`,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      status: 'ACTIVE',
      statusLabel: 'ĐANG HOẠT ĐỘNG',
      password: formData.password || '123456',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-stone-200 my-8 animate-scale-up">
        {/* Header */}
        <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0E1524] text-white flex items-center justify-center shadow-xs">
              <Users size={18} />
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-[0.2em] text-amber-800 uppercase block">
                NHÂN SỰ KHÁCH SẠN • PHÂN QUYỀN VAI TRÒ
              </span>
              <h3 className="font-serif text-xl font-bold text-stone-900">
                Thêm Nhân Sự & Cấp Tài Khoản Ca Trực
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full hover:bg-stone-200 text-stone-400 hover:text-stone-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Section 1: Hồ sơ cơ bản */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3 flex items-center gap-2">
              <Briefcase size={14} className="text-stone-600" />
              <span>1. Thông tin cá nhân & Định danh</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Họ và tên nhân viên *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Hoàng Minh Châu"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-bold focus:outline-none focus:border-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Mã nhân sự
                </label>
                <input
                  type="text"
                  value={`NV-${formData.code}`}
                  disabled
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-100 text-xs font-mono font-bold text-stone-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-3.5">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5 flex items-center gap-1.5">
                  <Mail size={13} className="text-stone-500" />
                  <span>Email liên hệ (@gmail.com)</span>
                </label>
                <input
                  type="email"
                  placeholder="chau.hoang@gmail.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5 flex items-center gap-1.5">
                  <Phone size={13} className="text-stone-500" />
                  <span>Số điện thoại liên hệ trực ca</span>
                </label>
                <input
                  type="tel"
                  placeholder="0918 345 678"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-stone-900"
                />
              </div>
            </div>

            <div className="mt-3.5">
              <label className="block text-xs font-semibold text-stone-700 mb-1.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Lock size={13} className="text-stone-500" />
                  <span>Mật khẩu cấp tài khoản</span>
                </span>
                <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md font-mono">Mặc định: 123456</span>
              </label>
              <input
                type="text"
                placeholder="123456"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-stone-900 font-mono"
              />
            </div>
          </div>

          {/* Section 2: Bộ phận, Ca trực & Khu vực */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3 flex items-center gap-2">
              <Clock size={14} className="text-stone-600" />
              <span>2. Vị trí nghiệp vụ & Lịch ca trực</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Bộ phận nghiệp vụ
                </label>
                <select
                  value={formData.department}
                  onChange={(e) => handleDepartmentChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-stone-900 bg-white"
                >
                  <option value="Lễ tân chính (Front Desk)">Lễ tân sảnh chính (Front Desk Agent)</option>
                  <option value="Tổ trưởng Buồng phòng">Tổ trưởng Buồng phòng (Housekeeping Supervisor)</option>
                  <option value="Nhân viên Buồng phòng">Nhân viên Buồng phòng (Housekeeping Staff)</option>
                  <option value="Kỹ thuật viên MEP">Kỹ thuật viên MEP & Bảo trì tiện nghi</option>
                  <option value="Quản gia riêng Biệt thự">Quản gia riêng Butler Service Elite</option>
                  <option value="Giám đốc trực sảnh (Duty Manager)">Giám đốc trực sảnh (Duty Manager)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Ca làm việc định kỳ
                </label>
                <select
                  value={formData.shift}
                  onChange={(e) => handleShiftChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-stone-900 bg-white"
                >
                  <option value="Ca sáng">Ca sáng (06:00 – 14:00)</option>
                  <option value="Ca chiều">Ca chiều (14:00 – 22:00)</option>
                  <option value="Ca đêm">Ca đêm (22:00 – 06:00)</option>
                  <option value="Hành chính">Hành chính (08:00 – 17:00)</option>
                  <option value="Trực kỹ thuật 24/7">Trực kỹ thuật 24/7</option>
                </select>
              </div>
            </div>

            <div className="mt-3.5">
              <label className="block text-xs font-semibold text-stone-700 mb-1.5 flex items-center gap-1.5">
                <MapPin size={13} className="text-stone-500" />
                <span>Khu vực phụ trách chuyên trách</span>
              </label>
              <select
                value={formData.assignedZone}
                onChange={(e) => setFormData({ ...formData, assignedZone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-stone-900 bg-white"
              >
                <option value="Quầy Lễ tân sảnh chính (Main Lobby)">Quầy Lễ tân sảnh chính (Main Lobby)</option>
                <option value="Khu Penthouse Sky (Tầng 12)">Khu Penthouse Sky (Tầng 12)</option>
                <option value="Khu Biệt thự hướng biển (Sanctuary Villas)">Khu Biệt thự hướng biển (Sanctuary Villas)</option>
                <option value="Toàn bộ khuôn viên khu nghỉ dưỡng">Toàn bộ khuôn viên khu nghỉ dưỡng</option>
              </select>
            </div>
          </div>

          {/* Section 3: Ma trận phân quyền truy cập PMS */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2 flex items-center gap-2">
              <ShieldCheck size={14} className="text-emerald-700" />
              <span>3. Cấp phép quyền hạn hệ thống (Role Matrix Permissions)</span>
            </h4>
            <div className="space-y-2 bg-[#FAF8F5] p-3.5 rounded-2xl border border-stone-200/90">
              {ALL_PERMISSIONS.map((p) => {
                const isChecked = formData.permissions.includes(p.key);
                return (
                  <label
                    key={p.key}
                    className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-stone-700 hover:text-stone-950"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => togglePermission(p.key)}
                      className="rounded border-stone-300 text-black focus:ring-black w-4 h-4"
                    />
                    <span className={isChecked ? 'font-bold text-stone-900' : ''}>
                      {p.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full border border-stone-200 text-xs font-semibold text-stone-600 hover:bg-stone-50 cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-full bg-black text-white text-xs font-semibold hover:bg-stone-800 cursor-pointer shadow-xs"
            >
              Tạo tài khoản nhân sự
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStaffModal;
