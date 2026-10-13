import React, { useState, useMemo } from 'react';
import {
  Users,
  Clock,
  Briefcase,
  ShieldCheck,
  Search,
  Plus,
  Edit2,
  Lock,
  Unlock,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Sun,
  Sunset,
  Wrench,
  ConciergeBell,
  X,
} from 'lucide-react';
import AddStaffModal from '../../components/admin/AddStaffModal';

const INITIAL_STAFF = [
  {
    id: 1,
    name: 'Mai Huyền Trâm',
    email: 'huyen.tram@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=120&auto=format&fit=crop&q=80',
    code: '0842',
    department: 'Lễ tân chính',
    roleTag: 'FRONT DESK AGENT',
    category: 'RECEPTION',
    shift: 'Ca sáng',
    shiftTime: '06:00 – 14:00',
    shiftIcon: Sun,
    status: 'ACTIVE',
    statusLabel: 'ĐANG HOẠT ĐỘNG',
  },
  {
    id: 2,
    name: 'Lê Thị Thảo',
    email: 'thao.le@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
    code: '0512',
    department: 'Tổ trưởng Buồng phòng',
    roleTag: 'HOUSEKEEPING SUPERVISOR',
    category: 'HOUSEKEEPING',
    shift: 'Ca sáng',
    shiftTime: '07:00 – 15:30',
    shiftIcon: Sun,
    status: 'ACTIVE',
    statusLabel: 'ĐANG HOẠT ĐỘNG',
  },
  {
    id: 3,
    name: 'Vũ Mạnh Cường',
    email: 'cuong.vu@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    code: '0630',
    department: 'Nhân viên Buồng phòng',
    roleTag: 'TẦNG CAO (PENTHOUSE & VILLA)',
    category: 'HOUSEKEEPING',
    shift: 'Ca chiều',
    shiftTime: '14:00 – 22:00',
    shiftIcon: Sunset,
    status: 'ACTIVE',
    statusLabel: 'ĐANG HOẠT ĐỘNG',
  },
  {
    id: 4,
    name: 'Trần Quốc Bảo',
    email: 'bao.tran@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80',
    code: '0219',
    department: 'Kỹ thuật viên MEP',
    roleTag: 'BẢO TRÌ TIỆN NGHI PHÒNG',
    category: 'MAINTENANCE',
    shift: 'Trực kỹ thuật',
    shiftTime: 'Sẵn sàng 24/7',
    shiftIcon: Wrench,
    status: 'ACTIVE',
    statusLabel: 'ĐANG HOẠT ĐỘNG',
  },
  {
    id: 5,
    name: 'Phan Anh Tuấn',
    email: 'tuan.phan@gmail.com',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&auto=format&fit=crop&q=80',
    code: '0311',
    department: 'Quản gia riêng Biệt thự',
    roleTag: 'BUTLER SERVICE ELITE',
    category: 'MANAGEMENT',
    shift: 'Theo yêu cầu khách VIP',
    shiftTime: 'Chuyên trách Biệt thự',
    shiftIcon: ConciergeBell,
    status: 'ACTIVE',
    statusLabel: 'ĐANG HOẠT ĐỘNG',
  },
];

export const StaffManagementPage = () => {
  const [staffList, setStaffList] = useState(INITIAL_STAFF);
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleToggleLock = (id) => {
    setStaffList((prev) =>
      prev.map((s) => {
        if (s.id === id) {
          const isNowActive = s.status !== 'ACTIVE';
          showToast(`Đã ${isNowActive ? 'mở khóa' : 'khóa tạm thời'} tài khoản của ${s.name}`);
          return {
            ...s,
            status: isNowActive ? 'ACTIVE' : 'LOCKED',
            statusLabel: isNowActive ? 'ĐANG HOẠT ĐỘNG' : 'TẠM KHÓA',
          };
        }
        return s;
      })
    );
  };

  const handleAddStaff = (staffData) => {
    const created = {
      id: Date.now(),
      ...staffData,
      shiftIcon: staffData.shift.includes('chiều')
        ? Sunset
        : staffData.shift.includes('kỹ thuật')
        ? Wrench
        : Sun,
    };
    setStaffList([created, ...staffList]);
    showToast(`Đã cấp tài khoản ca trực cho nhân sự "${created.name}" thành công!`);
  };

  const filteredStaff = useMemo(() => {
    return staffList.filter((s) => {
      const matchTab =
        activeTab === 'ALL' ||
        (activeTab === 'RECEPTION' && s.category === 'RECEPTION') ||
        (activeTab === 'HOUSEKEEPING' && s.category === 'HOUSEKEEPING') ||
        (activeTab === 'MANAGEMENT' && s.category === 'MANAGEMENT');

      const matchSearch =
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.code.includes(searchTerm);

      return matchTab && matchSearch;
    });
  }, [staffList, activeTab, searchTerm]);

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 bg-stone-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-stone-700 flex items-center gap-3 animate-fade-in text-xs font-medium">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold tracking-[0.2em] text-amber-800 uppercase block mb-1">
            • NHÂN SỰ KHÁCH SẠN CAO CẤP
          </span>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-stone-900 leading-tight">
            Quản lý Nhân sự & Phân quyền
          </h1>
          <p className="text-xs text-stone-500 mt-1 max-w-2xl">
            Quản lý danh sách nhân sự, tài khoản ca trực, phân vai trò nghiệp vụ (Lễ tân, Buồng phòng, Quản lý sảnh, Thu ngân).
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsRoleModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-stone-200/90 text-stone-700 text-xs font-semibold hover:bg-stone-50 shadow-2xs transition-colors cursor-pointer"
          >
            <ShieldCheck size={14} className="text-stone-500" />
            <span>Phân quyền vai trò (Role Matrix)</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-black hover:bg-stone-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus size={14} />
            <span>+ Thêm nhân viên mới</span>
          </button>
        </div>
      </div>

      {/* 2. 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold tracking-wider uppercase text-stone-400">
              TỔNG NHÂN SỰ
            </span>
            <div className="w-7 h-7 rounded-lg bg-stone-100 flex items-center justify-center text-stone-600">
              <Users size={14} />
            </div>
          </div>
          <div className="font-serif text-2xl font-bold text-stone-900 tracking-tight leading-tight">
            {staffList.length} <span className="text-sm font-normal font-sans text-stone-500">thành viên</span>
          </div>
          <div className="text-[11px] text-stone-500 mt-2 flex items-center justify-between">
            <span>Quy mô biên chế L'Étoile</span>
            <span className="font-bold text-stone-800 text-[10px] bg-stone-100 px-1.5 py-0.5 rounded">ĐỦ 100%</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold tracking-wider uppercase text-stone-400">
              NHÂN SỰ TRONG CA TRỰC
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#FAF5EE] flex items-center justify-center text-amber-800">
              <Clock size={14} />
            </div>
          </div>
          <div className="font-serif text-2xl font-bold text-stone-900 tracking-tight leading-tight">
            18 <span className="text-sm font-normal font-sans text-stone-500">trên sàn</span>
          </div>
          <div className="text-[11px] text-stone-500 mt-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
            <span>Ca sáng & Trực kỹ thuật</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold tracking-wider uppercase text-stone-400">
              PHÂN HỆ NGHIỆP VỤ
            </span>
            <div className="w-7 h-7 rounded-lg bg-stone-100 flex items-center justify-center text-stone-600">
              <Briefcase size={14} />
            </div>
          </div>
          <div className="font-serif text-2xl font-bold text-stone-900 tracking-tight leading-tight">
            04 <span className="text-sm font-normal font-sans text-stone-500">bộ phận cốt lõi</span>
          </div>
          <div className="text-[11px] text-stone-500 mt-2">
            Lễ tân, Buồng, Kỹ thuật, Butler
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold tracking-wider uppercase text-stone-400">
              CHỈ SỐ VẬN HÀNH
            </span>
            <div className="w-7 h-7 rounded-lg bg-stone-100 flex items-center justify-center text-stone-600">
              <ShieldCheck size={14} />
            </div>
          </div>
          <div className="font-serif text-2xl font-bold text-stone-900 tracking-tight leading-tight">
            100% <span className="text-sm font-normal font-sans text-stone-500">Ổn định</span>
          </div>
          <div className="text-[11px] text-stone-500 mt-2 flex items-center justify-between">
            <span>Hệ thống phân quyền PMS</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          </div>
        </div>
      </div>

      {/* 3. Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'ALL'
                ? 'bg-black text-white shadow-xs'
                : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200/80'
            }`}
          >
            Tất cả nhân viên ({staffList.length})
          </button>
          <button
            onClick={() => setActiveTab('RECEPTION')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'RECEPTION'
                ? 'bg-black text-white shadow-xs'
                : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200/80'
            }`}
          >
            Lễ tân (Front Desk)
          </button>
          <button
            onClick={() => setActiveTab('HOUSEKEEPING')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'HOUSEKEEPING'
                ? 'bg-black text-white shadow-xs'
                : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200/80'
            }`}
          >
            Buồng phòng (Housekeeping)
          </button>
          <button
            onClick={() => setActiveTab('MANAGEMENT')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'MANAGEMENT'
                ? 'bg-black text-white shadow-xs'
                : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200/80'
            }`}
          >
            Quản lý & Butler
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Tìm theo tên, mã NV, SĐT..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3.5 py-1.5 rounded-full bg-white border border-stone-200/90 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-900 shadow-2xs"
          />
        </div>
      </div>

      {/* 4. Staff Table */}
      <div className="bg-white rounded-2xl border border-stone-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-stone-50/50 text-[10px] font-bold uppercase tracking-wider text-stone-400 border-b border-stone-100">
                <th className="py-3.5 px-6">NHÂN VIÊN</th>
                <th className="py-3.5 px-4 text-center">MÃ NHÂN SỰ</th>
                <th className="py-3.5 px-4">BỘ PHẬN & VAI TRÒ</th>
                <th className="py-3.5 px-4">CA TRỰC HIỆN TẠI</th>
                <th className="py-3.5 px-4 text-center">TRẠNG THÁI</th>
                <th className="py-3.5 px-6 text-right">THAO TÁC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredStaff.map((staff) => {
                const ShiftIcon = staff.shiftIcon || Sun;
                return (
                  <tr key={staff.id} className="hover:bg-stone-50/60 transition-colors">
                    {/* Nhân viên & Avatar */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={staff.avatar}
                          alt={staff.name}
                          className="w-10 h-10 rounded-full object-cover ring-1 ring-stone-200 shadow-2xs shrink-0"
                        />
                        <div>
                          <p className="font-bold text-stone-900 text-xs">{staff.name}</p>
                          <p className="text-[11px] text-stone-400">{staff.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Mã NV */}
                    <td className="py-4 px-4 text-center">
                      <div className="inline-block font-mono font-bold text-stone-700 bg-stone-100 px-2 py-0.5 rounded text-[11px] border border-stone-200/70">
                        NV - {staff.code}
                      </div>
                    </td>

                    {/* Bộ phận & vai trò */}
                    <td className="py-4 px-4">
                      <p className="font-bold text-stone-900">{staff.department}</p>
                      <p className="text-[9px] font-bold tracking-wider uppercase text-stone-400 mt-0.5">
                        {staff.roleTag}
                      </p>
                    </td>

                    {/* Ca trực */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-stone-100 text-stone-600 flex items-center justify-center shrink-0">
                          <ShiftIcon size={13} />
                        </div>
                        <div>
                          <p className="font-semibold text-stone-800">{staff.shift}</p>
                          <p className="text-[10px] text-stone-400">{staff.shiftTime}</p>
                        </div>
                      </div>
                    </td>

                    {/* Trạng thái */}
                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                          staff.status === 'ACTIVE'
                            ? 'bg-[#FDF4E7] text-amber-900 border border-amber-200/70'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            staff.status === 'ACTIVE' ? 'bg-amber-600' : 'bg-rose-500'
                          }`}
                        ></span>
                        {staff.statusLabel}
                      </span>
                    </td>

                    {/* Thao tác */}
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => showToast(`Mở hồ sơ chỉnh sửa cho: ${staff.name}`)}
                          className="w-8 h-8 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-800 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleToggleLock(staff.id)}
                          className={`w-8 h-8 rounded-lg hover:bg-stone-100 flex items-center justify-center transition-colors cursor-pointer ${
                            staff.status === 'ACTIVE'
                              ? 'text-stone-400 hover:text-rose-600'
                              : 'text-amber-600 hover:text-amber-800'
                          }`}
                        >
                          {staff.status === 'ACTIVE' ? <Lock size={13} /> : <Unlock size={13} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-stone-500">
          <div>
            Hiển thị <strong className="text-stone-800 font-semibold">{filteredStaff.length}</strong> trong tổng số <strong className="text-stone-800 font-semibold">42</strong> nhân sự đang vận hành
          </div>
          <div className="flex items-center gap-1">
            <button className="w-8 h-8 rounded-lg border border-stone-200 flex items-center justify-center text-stone-400 hover:text-stone-800 hover:bg-stone-50 cursor-pointer">
              <ChevronLeft size={14} />
            </button>
            <button className="w-8 h-8 rounded-lg bg-black text-white font-bold flex items-center justify-center text-xs">
              1
            </button>
            <button className="w-8 h-8 rounded-lg border border-stone-200 flex items-center justify-center text-stone-700 hover:bg-stone-50 cursor-pointer">
              2
            </button>
            <button className="w-8 h-8 rounded-lg border border-stone-200 flex items-center justify-center text-stone-700 hover:bg-stone-50 cursor-pointer">
              3
            </button>
            <button className="w-8 h-8 rounded-lg border border-stone-200 flex items-center justify-center text-stone-400 hover:text-stone-800 hover:bg-stone-50 cursor-pointer">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* 5. Bottom Security Audit Banner */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#FAF5EE] text-amber-900 border border-amber-200/60 flex items-center justify-center shrink-0">
            <ShieldCheck size={18} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-stone-900">
              Quy chuẩn kiểm toán bảo mật tài khoản nhân sự
            </h4>
            <p className="text-xs text-stone-500 mt-0.5">
              Mọi thao tác thay đổi phân quyền ca trực hoặc thông tin nhạy cảm của khách lưu trú đều được mã hóa và ghi nhật ký theo chuẩn bảo mật khách sạn quốc tế.
            </p>
          </div>
        </div>

        <button
          onClick={() => showToast('Mở bảng ghi nhật ký bảo mật Audit Logs 24/7...')}
          className="flex items-center gap-1.5 text-xs font-semibold text-stone-800 hover:text-black transition-colors shrink-0 cursor-pointer"
        >
          <span>Xem nhật ký phân quyền (Audit Logs)</span>
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Add Staff Modal */}
      <AddStaffModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddStaff={handleAddStaff}
      />

      {/* Role Matrix Modal */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl border border-stone-200 animate-scale-up">
            <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
              <div>
                <h3 className="font-serif text-lg font-bold text-stone-900">Ma trận Phân quyền (Role Matrix)</h3>
                <p className="text-xs text-stone-500">Cấu hình cấp phép bảo mật theo từng vai trò nghiệp vụ PMS</p>
              </div>
              <button
                onClick={() => setIsRoleModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-stone-200 text-stone-400 hover:text-stone-700 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="border border-stone-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-stone-50 text-[10px] uppercase font-bold text-stone-500 border-b border-stone-200">
                    <tr>
                      <th className="py-2.5 px-4">Quyền hạn hệ thống</th>
                      <th className="py-2.5 px-3 text-center">Lễ tân</th>
                      <th className="py-2.5 px-3 text-center">Buồng phòng</th>
                      <th className="py-2.5 px-3 text-center">Quản trị</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    <tr>
                      <td className="py-2.5 px-4 font-semibold text-stone-800">Xem sơ đồ phòng & Rack</td>
                      <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓</td>
                      <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓</td>
                      <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-semibold text-stone-800">Check-in / Check-out & Folio</td>
                      <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓</td>
                      <td className="py-2.5 px-3 text-center text-stone-300">—</td>
                      <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-semibold text-stone-800">Cập nhật trạng thái buồng phòng</td>
                      <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓</td>
                      <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓</td>
                      <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-semibold text-stone-800">Cài đặt giá linh hoạt RMS</td>
                      <td className="py-2.5 px-3 text-center text-stone-300">—</td>
                      <td className="py-2.5 px-3 text-center text-stone-300">—</td>
                      <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-semibold text-stone-800">Quản lý tài khoản & ca trực</td>
                      <td className="py-2.5 px-3 text-center text-stone-300">—</td>
                      <td className="py-2.5 px-3 text-center text-stone-300">—</td>
                      <td className="py-2.5 px-3 text-center text-emerald-600 font-bold">✓</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setIsRoleModalOpen(false)}
                  className="px-5 py-2 rounded-full bg-black text-white text-xs font-semibold hover:bg-stone-800 cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagementPage;
