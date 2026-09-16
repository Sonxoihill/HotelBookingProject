import React, { useState } from 'react';
import {
  SlidersHorizontal,
  TrendingUp,
  BedDouble,
  Zap,
  RotateCw,
  Plus,
  MoreVertical,
  Edit2,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  PartyPopper,
  Plane,
  Diamond,
} from 'lucide-react';
import { formatVND } from '../../utils/formatters';
import AddPricingRuleModal from '../../components/admin/AddPricingRuleModal';

const INITIAL_RULES = [
  {
    id: 1,
    name: 'Mùa Cao Điểm Lễ Hội & Cuối Năm (Festive Season 2025)',
    target: 'Toàn bộ 42 phòng và villa nghỉ dưỡng',
    icon: PartyPopper,
    timeRange: '20/12/2025 — 05/01/2026',
    timeBadge: '17 NGÀY CAO ĐIỂM',
    adjustment: '+30%',
    adjustmentScope: 'trên toàn bộ hạng phòng',
    status: 'UPCOMING',
    statusLabel: 'Sắp diễn ra',
    isActive: true,
  },
  {
    id: 2,
    name: 'Cuối tuần Thượng lưu (Weekend Surcharge)',
    target: 'Tất cả đặt phòng cá nhân & gia đình',
    icon: BedDouble,
    timeRange: 'Thứ 6 & Thứ 7 hàng tuần',
    timeBadge: 'LẶP LẠI ĐỊNH KỲ',
    adjustment: '+15%',
    adjustmentScope: 'giá niêm yết',
    status: 'ACTIVE',
    statusLabel: 'Đang kích hoạt',
    isActive: true,
  },
  {
    id: 3,
    name: 'Ưu đãi Đặt sớm (Early Bird 30 ngày)',
    target: 'Không hoàn hủy linh hoạt, thanh toán ngay',
    icon: Plane,
    timeRange: 'Đặt trước từ 30 ngày',
    timeBadge: 'ÁP DỤNG QUANH NĂM',
    adjustment: 'Giảm 10%',
    adjustmentScope: 'giá phòng',
    status: 'ACTIVE',
    statusLabel: 'Đang kích hoạt',
    isActive: true,
  },
  {
    id: 4,
    name: 'Đặc quyền Hội viên Black Diamond VIP',
    target: 'Thành viên định danh thẻ Hạng Kim Cương',
    icon: Diamond,
    timeRange: 'Quanh năm (365 Ngày)',
    timeBadge: 'KHÔNG GIỚI HẠN',
    adjustment: 'Giảm 15%',
    adjustmentScope: 'giá tốt nhất + MIỄN PHÍ NÂNG HẠNG',
    status: 'ACTIVE',
    statusLabel: 'Đang kích hoạt',
    isActive: true,
  },
];

export const PriceSettingPage = () => {
  const [rules, setRules] = useState(INITIAL_RULES);
  const [selectedWeek, setSelectedWeek] = useState('Tuần này (17 - 23/11)');
  const [toastMessage, setToastMessage] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleToggleRule = (id) => {
    setRules((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const nextState = !r.isActive;
          showToast(`Đã ${nextState ? 'kích hoạt' : 'tạm dừng'} quy tắc "${r.name}"`);
          return { ...r, isActive: nextState };
        }
        return r;
      })
    );
  };

  const handleAddRule = (newRuleData) => {
    const created = {
      id: Date.now(),
      icon: Sparkles,
      ...newRuleData,
    };
    setRules([created, ...rules]);
    showToast(`Đã thiết lập & kích hoạt quy tắc giá "${created.name}" thành công!`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 bg-stone-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-stone-700 flex items-center gap-3 animate-fade-in text-xs font-medium">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold tracking-[0.2em] text-amber-800 uppercase block mb-1">
            CẤU HÌNH TỐI ƯU DOANH THU • YIELD MANAGEMENT RMS
          </span>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-stone-900 leading-tight">
            Cài đặt Giá linh hoạt
          </h1>
          <p className="text-xs text-stone-500 mt-1 max-w-2xl">
            Thiết lập chính sách giá động theo mùa cao điểm, ngày cuối tuần, thời gian đặt sớm (Early Bird) và quy tắc giảm giá hội viên VIP.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => showToast('Đang đồng bộ chính sách giá linh hoạt tới toàn bộ Booking Engine & OTA...')}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-stone-200/90 text-stone-700 text-xs font-semibold hover:bg-stone-50 shadow-2xs transition-colors cursor-pointer"
          >
            <RotateCw size={13} className="text-stone-500" />
            <span>Áp dụng cho toàn hệ thống</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-black hover:bg-stone-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus size={14} />
            <span>Thêm quy tắc giá mới</span>
          </button>
        </div>
      </div>

      {/* 2. 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold tracking-wider uppercase text-stone-400">
              QUY TẮC ĐANG CHẠY
            </span>
            <SlidersHorizontal size={15} className="text-stone-400" />
          </div>
          <div className="font-serif text-2xl font-bold text-stone-900 tracking-tight leading-tight">
            {rules.filter((r) => r.isActive).length < 10 ? '0' + rules.filter((r) => r.isActive).length : rules.filter((r) => r.isActive).length} <span className="text-sm font-normal font-sans text-stone-500">/ {rules.length} quy tắc khả dụng</span>
          </div>
          <div className="text-[11px] text-stone-500 mt-2">
            Đồng bộ tự động qua Booking Engine
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold tracking-wider uppercase text-stone-400">
              REVPAR DỰ KIẾN (TUẦN NÀY)
            </span>
            <TrendingUp size={15} className="text-emerald-500" />
          </div>
          <div className="font-serif text-2xl font-bold text-stone-900 tracking-tight leading-tight flex items-center gap-2">
            5.420.000 <span className="text-sm font-normal font-sans text-stone-500">đ</span>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200/60">
              +18.4%
            </span>
          </div>
          <div className="text-[11px] text-stone-500 mt-2">
            So với chu kỳ cùng kỳ tháng trước
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold tracking-wider uppercase text-stone-400">
              CÔNG SUẤT PHÒNG DỰ BÁO
            </span>
            <BedDouble size={15} className="text-stone-400" />
          </div>
          <div className="font-serif text-2xl font-bold text-stone-900 tracking-tight leading-tight flex items-baseline gap-2">
            84.2%
            <span className="text-xs font-semibold text-amber-800 bg-[#FDF4E7] px-2 py-0.5 rounded-full">
              Ngưỡng cao
            </span>
          </div>
          <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden mt-3">
            <div className="h-full bg-stone-900 rounded-full" style={{ width: '84.2%' }}></div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold tracking-wider uppercase text-stone-400">
              QUY TẮC TỰ ĐỘNG NGƯỠNG 80%
            </span>
            <Zap size={15} className="text-amber-500 fill-amber-500" />
          </div>
          <div className="font-serif text-2xl font-bold text-stone-900 tracking-tight leading-tight flex items-center gap-2">
            +10%
            <span className="text-xs font-semibold text-amber-800 bg-[#FDF4E7] px-2 py-0.5 rounded-full">
              Tự động
            </span>
          </div>
          <div className="text-[11px] text-stone-500 mt-2">
            Kích hoạt khi số phòng trống &lt; 20%
          </div>
        </div>
      </div>

      {/* 3. Section 1: Bảng quy tắc định giá linh hoạt đang kích hoạt */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200/90 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-stone-100">
          <div className="flex items-center gap-3">
            <h2 className="font-serif text-lg font-bold text-stone-900">
              Bảng quy tắc định giá linh hoạt đang kích hoạt
            </h2>
            <span className="text-xs font-semibold text-stone-600 bg-stone-100 px-2.5 py-0.5 rounded-full border border-stone-200">
              Active Rules ({rules.filter((r) => r.isActive).length})
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-stone-500 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Cập nhật realtime qua PMS Engine</span>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-[10px] font-bold uppercase tracking-wider text-stone-400 border-b border-stone-100 pb-2">
                <th className="pb-3">TÊN QUY TẮC & ĐỐI TƯỢNG</th>
                <th className="pb-3">THỜI GIAN ÁP DỤNG</th>
                <th className="pb-3">BIẾN ĐỘNG ĐIỀU CHỈNH</th>
                <th className="pb-3 text-center">TRẠNG THÁI</th>
                <th className="pb-3 text-center">BẬT / TẮT</th>
                <th className="pb-3 text-right">THAO TÁC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {rules.map((rule) => {
                const Icon = rule.icon || Sparkles;
                return (
                  <tr key={rule.id} className="hover:bg-stone-50/60 transition-colors">
                    {/* Tên quy tắc */}
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-stone-100 text-stone-700 flex items-center justify-center shrink-0 border border-stone-200/60">
                          <Icon size={16} />
                        </div>
                        <div>
                          <p className="font-bold text-stone-900">{rule.name}</p>
                          <p className="text-[11px] text-stone-500 mt-0.5">{rule.target}</p>
                        </div>
                      </div>
                    </td>

                    {/* Thời gian */}
                    <td className="py-4 whitespace-nowrap">
                      <p className="font-semibold text-stone-800">{rule.timeRange}</p>
                      <span className="inline-block text-[9px] font-bold tracking-wider uppercase text-stone-500 bg-stone-100 px-1.5 py-0.5 rounded mt-0.5">
                        {rule.timeBadge}
                      </span>
                    </td>

                    {/* Biến động */}
                    <td className="py-4">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#FAF8F5] border border-stone-200/80 text-stone-800">
                        <span className="font-bold text-stone-900">{rule.adjustment}</span>
                        <span className="text-[11px] text-stone-600">{rule.adjustmentScope}</span>
                      </div>
                    </td>

                    {/* Trạng thái */}
                    <td className="py-4 text-center whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full ${
                          rule.status === 'ACTIVE'
                            ? 'bg-[#FDF4E7] text-amber-900 border border-amber-200/70'
                            : 'bg-stone-100 text-stone-600 border border-stone-200'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            rule.status === 'ACTIVE' ? 'bg-amber-600' : 'bg-stone-400'
                          }`}
                        ></span>
                        {rule.statusLabel}
                      </span>
                    </td>

                    {/* Toggle Switch */}
                    <td className="py-4 text-center">
                      <button
                        onClick={() => handleToggleRule(rule.id)}
                        className={`w-10 h-5 flex items-center rounded-full p-0.5 cursor-pointer transition-colors duration-200 ${
                          rule.isActive ? 'bg-black' : 'bg-stone-300'
                        }`}
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                            rule.isActive ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </td>

                    {/* Thao tác */}
                    <td className="py-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => showToast(`Mở chỉnh sửa quy tắc: ${rule.name}`)}
                          className="w-8 h-8 rounded-lg hover:bg-stone-100 text-stone-500 hover:text-stone-800 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => showToast(`Cấu hình chi tiết cho ${rule.name}`)}
                          className="w-8 h-8 rounded-lg hover:bg-stone-100 text-stone-500 hover:text-stone-800 flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <MoreVertical size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. Section 2: Ma trận bảng giá theo ngày trong tuần & Hạng phòng (RATE MATRIX PREVIEW) */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200/90 shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-serif text-lg font-bold text-stone-900">
                Ma trận bảng giá theo ngày trong tuần & Hạng phòng
              </h2>
              <span className="text-[10px] font-bold tracking-wider uppercase text-stone-600 bg-stone-100 px-2 py-0.5 rounded border border-stone-200">
                RATE MATRIX PREVIEW
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Mô phỏng đơn giá thực tế được áp dụng tự động dựa trên quy tắc đang bật và thuật toán tối ưu hóa doanh thu.
            </p>
          </div>

          {/* Week Tabs */}
          <div className="flex items-center gap-2">
            <div className="bg-stone-100 p-1 rounded-full border border-stone-200/70 flex items-center gap-1 text-xs">
              {['Tuần này (17 - 23/11)', 'Tuần tới (24 - 30/11)'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedWeek(tab)}
                  className={`px-3.5 py-1.5 rounded-full font-medium transition-all cursor-pointer ${
                    selectedWeek === tab
                      ? 'bg-black text-white shadow-xs font-semibold'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <button className="w-8 h-8 rounded-full border border-stone-200 flex items-center justify-center text-stone-600 hover:bg-stone-50 cursor-pointer">
              <Calendar size={14} />
            </button>
          </div>
        </div>

        {/* Warning Alert Banner */}
        <div className="p-4 rounded-xl bg-[#FAF8F5] border border-amber-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle size={15} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-stone-900">
                  Tự động tăng giá khi công suất vượt 80%
                </span>
                <span className="text-[9px] font-bold tracking-wider uppercase text-amber-800 bg-amber-100/80 px-1.5 py-0.5 rounded">
                  CƠ CHẾ BẢO VỆ BIÊN LỢI NHUẬN
                </span>
              </div>
              <p className="text-xs text-stone-600 mt-0.5">
                Ngày Thứ Sáu (21/11) và Thứ Bảy (22/11) đã chạm ngưỡng công suất <strong className="text-stone-900">86%</strong> và <strong className="text-stone-900">92%</strong>. Thuật toán đã tự động nâng +10% trên toàn bộ đơn giá hiển thị bên dưới.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-900 bg-white px-3 py-1.5 rounded-full border border-amber-200 shrink-0 shadow-2xs">
            <Zap size={13} className="text-amber-600 fill-amber-600" />
            <span>Đang bảo lưu 4 phòng dự phòng VIP</span>
          </div>
        </div>

        {/* Matrix Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-center text-xs border-collapse">
            <thead>
              <tr className="text-[11px] font-semibold text-stone-600 border-b border-stone-200">
                <th className="text-left py-3.5 px-3 font-bold uppercase tracking-wider text-stone-500 text-[10px] w-64">
                  HẠNG PHÒNG NGHỈ DƯỠNG
                </th>
                <th className="py-3 px-2">T2 <span className="font-normal text-stone-400">17/11</span></th>
                <th className="py-3 px-2">T3 <span className="font-normal text-stone-400">18/11</span></th>
                <th className="py-3 px-2">T4 <span className="font-normal text-stone-400">19/11</span></th>
                <th className="py-3 px-2">T5 <span className="font-normal text-stone-400">20/11</span></th>
                <th className="py-3 px-2 bg-[#FAF5EE] text-amber-950 font-bold border-x border-amber-200/50">
                  T6 <span className="font-normal text-amber-800">21/11</span>
                  <div className="text-[9px] text-amber-700 font-bold">(+25%)</div>
                </th>
                <th className="py-3 px-2 bg-[#FAF5EE] text-amber-950 font-bold border-r border-amber-200/50">
                  T7 <span className="font-normal text-amber-800">22/11</span>
                  <div className="text-[9px] text-amber-700 font-bold">(+25%)</div>
                </th>
                <th className="py-3 px-2">CN <span className="font-normal text-stone-400">23/11</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {/* Row 1: L'Étoile Suite */}
              <tr className="hover:bg-stone-50/70 transition-colors">
                <td className="text-left py-4 px-3">
                  <div className="flex items-center gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1590490360182-c33d57733427?w=80&auto=format&fit=crop&q=80"
                      alt="L'Étoile Suite"
                      className="w-10 h-10 rounded-xl object-cover ring-1 ring-stone-200 shrink-0"
                    />
                    <div>
                      <p className="font-bold text-stone-900">L'Étoile Suite</p>
                      <p className="text-[10px] text-stone-500">65m² • Hướng biển</p>
                      <p className="text-[10px] text-stone-400">Giá gốc: 4.200.000đ</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-2">
                  <p className="font-bold text-stone-900">4.200.000đ</p>
                  <span className="text-[10px] text-stone-400">Tiêu chuẩn</span>
                </td>
                <td className="py-4 px-2">
                  <p className="font-bold text-stone-900">4.200.000đ</p>
                  <span className="text-[10px] text-stone-400">Tiêu chuẩn</span>
                </td>
                <td className="py-4 px-2">
                  <p className="font-bold text-stone-900">4.200.000đ</p>
                  <span className="text-[10px] text-stone-400">Tiêu chuẩn</span>
                </td>
                <td className="py-4 px-2">
                  <p className="font-bold text-stone-900">4.200.000đ</p>
                  <span className="text-[10px] text-stone-400">Tiêu chuẩn</span>
                </td>
                <td className="py-4 px-2 bg-[#FAF5EE] border-x border-amber-200/50">
                  <p className="font-bold text-amber-950">5.250.000đ</p>
                  <span className="text-[10px] text-amber-800 font-medium">Cuối tuần + Vượt 80%</span>
                </td>
                <td className="py-4 px-2 bg-[#FAF5EE] border-r border-amber-200/50">
                  <p className="font-bold text-amber-950">5.250.000đ</p>
                  <span className="text-[10px] text-amber-800 font-medium">Cuối tuần + Vượt 80%</span>
                </td>
                <td className="py-4 px-2">
                  <p className="font-bold text-stone-900">4.200.000đ</p>
                  <span className="text-[10px] text-stone-400">Tiêu chuẩn</span>
                </td>
              </tr>

              {/* Row 2: Penthouse Horizon */}
              <tr className="hover:bg-stone-50/70 transition-colors">
                <td className="text-left py-4 px-3">
                  <div className="flex items-center gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=80&auto=format&fit=crop&q=80"
                      alt="Penthouse Horizon"
                      className="w-10 h-10 rounded-xl object-cover ring-1 ring-stone-200 shrink-0"
                    />
                    <div>
                      <p className="font-bold text-stone-900">Penthouse Horizon</p>
                      <p className="text-[10px] text-stone-500">120m² • Ban công riêng</p>
                      <p className="text-[10px] text-stone-400">Giá gốc: 9.500.000đ</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-2">
                  <p className="font-bold text-stone-900">9.500.000đ</p>
                  <span className="text-[10px] text-stone-400">Tiêu chuẩn</span>
                </td>
                <td className="py-4 px-2">
                  <p className="font-bold text-stone-900">9.500.000đ</p>
                  <span className="text-[10px] text-stone-400">Tiêu chuẩn</span>
                </td>
                <td className="py-4 px-2">
                  <p className="font-bold text-stone-900">9.500.000đ</p>
                  <span className="text-[10px] text-stone-400">Tiêu chuẩn</span>
                </td>
                <td className="py-4 px-2">
                  <p className="font-bold text-stone-900">9.500.000đ</p>
                  <span className="text-[10px] text-stone-400">Tiêu chuẩn</span>
                </td>
                <td className="py-4 px-2 bg-[#FAF5EE] border-x border-amber-200/50">
                  <p className="font-bold text-amber-950">11.875.000đ</p>
                  <span className="text-[10px] text-amber-800 font-medium">Cuối tuần + Vượt 80%</span>
                </td>
                <td className="py-4 px-2 bg-[#FAF5EE] border-r border-amber-200/50">
                  <p className="font-bold text-amber-950">11.875.000đ</p>
                  <span className="text-[10px] text-amber-800 font-medium">Cuối tuần + Vượt 80%</span>
                </td>
                <td className="py-4 px-2">
                  <p className="font-bold text-stone-900">9.500.000đ</p>
                  <span className="text-[10px] text-stone-400">Tiêu chuẩn</span>
                </td>
              </tr>

              {/* Row 3: Signature Pool Villa */}
              <tr className="hover:bg-stone-50/70 transition-colors">
                <td className="text-left py-4 px-3">
                  <div className="flex items-center gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=80&auto=format&fit=crop&q=80"
                      alt="Signature Pool Villa"
                      className="w-10 h-10 rounded-xl object-cover ring-1 ring-stone-200 shrink-0"
                    />
                    <div>
                      <p className="font-bold text-stone-900">Signature Pool Villa</p>
                      <p className="text-[10px] text-stone-500">220m² • Hồ bơi riêng</p>
                      <p className="text-[10px] text-stone-400">Giá gốc: 16.000.000đ</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-2">
                  <p className="font-bold text-stone-900">16.000.000đ</p>
                  <span className="text-[10px] text-stone-400">Tiêu chuẩn</span>
                </td>
                <td className="py-4 px-2">
                  <p className="font-bold text-stone-900">16.000.000đ</p>
                  <span className="text-[10px] text-stone-400">Tiêu chuẩn</span>
                </td>
                <td className="py-4 px-2">
                  <p className="font-bold text-stone-900">16.000.000đ</p>
                  <span className="text-[10px] text-stone-400">Tiêu chuẩn</span>
                </td>
                <td className="py-4 px-2">
                  <p className="font-bold text-stone-900">16.000.000đ</p>
                  <span className="text-[10px] text-stone-400">Tiêu chuẩn</span>
                </td>
                <td className="py-4 px-2 bg-[#FAF5EE] border-x border-amber-200/50">
                  <p className="font-bold text-amber-950">20.000.000đ</p>
                  <span className="text-[10px] text-amber-800 font-medium">Cuối tuần + Vượt 80%</span>
                </td>
                <td className="py-4 px-2 bg-[#FAF5EE] border-r border-amber-200/50">
                  <p className="font-bold text-amber-950">20.000.000đ</p>
                  <span className="text-[10px] text-amber-800 font-medium">Cuối tuần + Vượt 80%</span>
                </td>
                <td className="py-4 px-2">
                  <p className="font-bold text-stone-900">16.000.000đ</p>
                  <span className="text-[10px] text-stone-400">Tiêu chuẩn</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer legend */}
        <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] text-stone-500">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#8E6941]"></span>
              <span>Thứ 6 & Thứ 7: Surcharge +15%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-black"></span>
              <span>Tự động kích hoạt +10% do đạt 80% công suất</span>
            </div>
          </div>
          <div className="font-semibold text-stone-400 uppercase tracking-wider text-[10px]">
            TIỀN TỆ: VND (ĐÃ BAO GỒM 5% SVC & 8% VAT)
          </div>
        </div>
      </div>

      {/* Add Pricing Rule Modal */}
      <AddPricingRuleModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddRule={handleAddRule}
      />
    </div>
  );
};

export default PriceSettingPage;
