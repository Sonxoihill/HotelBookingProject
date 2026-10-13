import React, { useState } from 'react';
import {
  Calendar,
  Download,
  Star,
  ChevronDown,
  PieChart as PieChartIcon,
  Sparkles,
  TrendingUp,
  ArrowUpRight,
  ChevronRight,
  DollarSign,
  Building2,
  BedDouble,
  CheckCircle2,
} from 'lucide-react';
import { formatVND } from '../../utils/formatters';

export const ReportStatisticsPage = () => {
  const [timeFilter, setTimeFilter] = useState('Tháng 10/2025');
  const [showAppliedToast, setShowAppliedToast] = useState(false);

  const handleApplyYield = () => {
    setShowAppliedToast(true);
    setTimeout(() => setShowAppliedToast(false), 3500);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {showAppliedToast && (
        <div className="fixed top-20 right-8 z-50 bg-stone-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-stone-700 flex items-center gap-3 animate-fade-in text-xs font-medium">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>Đã áp dụng đề xuất Yield AI: Tăng +12% giá Penthouse và kích hoạt gói ẩm thực!</span>
        </div>
      )}

      {/* 1. Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold tracking-[0.2em] text-amber-800 uppercase block mb-1">
            • EXECUTIVE ANALYTICS • UC-17
          </span>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-stone-900 leading-tight">
            Báo cáo & Thống kê
          </h1>
          <p className="text-xs text-stone-500 mt-1 max-w-2xl">
            Tổng hợp số liệu doanh thu, công suất phòng và hiệu quả vận hành khách sạn theo thời gian thực.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Time Filter Pills */}
          <div className="bg-stone-100/90 p-1 rounded-full border border-stone-200/70 flex items-center gap-1">
            {['Tháng 10/2025', 'Quý 3/2025', 'Năm 2025'].map((tab) => (
              <button
                key={tab}
                onClick={() => setTimeFilter(tab)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  timeFilter === tab
                    ? 'bg-black text-white shadow-xs font-semibold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Date Picker Button */}
          <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white border border-stone-200/90 text-stone-700 text-xs font-medium hover:bg-stone-50 shadow-2xs transition-colors cursor-pointer">
            <Calendar size={13} className="text-stone-400" />
            <span>Tùy chọn ngày</span>
          </button>

          {/* Export Button */}
          <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-black hover:bg-stone-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer">
            <Download size={13} />
            <span>Xuất báo cáo</span>
            <ChevronDown size={13} className="text-stone-400" />
          </button>
        </div>
      </div>

      {/* 2. 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Card 1: Tổng Doanh Thu */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-2xs hover:shadow-xs transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-700 border border-stone-200/70">
              <DollarSign size={16} />
            </div>
            <span className="flex items-center gap-0.5 text-[11px] font-bold text-amber-800 bg-[#FDF4E7] border border-amber-200/60 px-2 py-0.5 rounded-full">
              <ArrowUpRight size={12} />
              +14.2%
            </span>
          </div>
          <span className="text-[10px] font-bold tracking-wider uppercase text-stone-400 block mb-1">
            TỔNG DOANH THU THÁNG
          </span>
          <div className="font-serif text-2xl font-bold text-stone-900 tracking-tight leading-tight">
            1.845.000.000 <span className="text-base font-normal font-sans text-stone-500">đ</span>
          </div>
          <div className="text-[11px] text-stone-500 mt-2">
            <span className="font-medium text-emerald-600">+228M đ</span> so với tháng trước
          </div>
        </div>

        {/* Card 2: Công Suất Phòng */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-2xs hover:shadow-xs transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-700 border border-stone-200/70">
              <Building2 size={16} />
            </div>
            <span className="text-[11px] font-bold text-amber-800 bg-[#FDF4E7] border border-amber-200/60 px-2 py-0.5 rounded-full">
              RevPAR: 3.42M đ
            </span>
          </div>
          <span className="text-[10px] font-bold tracking-wider uppercase text-stone-400 block mb-1">
            CÔNG SUẤT PHÒNG TB (OCC)
          </span>
          <div className="font-serif text-2xl font-bold text-stone-900 tracking-tight leading-tight">
            84.6%
          </div>
          <div className="text-[11px] text-stone-500 mt-2 flex items-center justify-between">
            <span>ADR: <strong className="text-stone-700 font-semibold">4.050.000 đ</strong></span>
            <span className="text-stone-400">Mục tiêu 80%</span>
          </div>
        </div>

        {/* Card 3: Lượt Đặt Phòng */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-2xs hover:shadow-xs transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-700 border border-stone-200/70">
              <BedDouble size={16} />
            </div>
            <span className="text-[11px] font-bold text-stone-700 bg-stone-100 border border-stone-200/70 px-2 py-0.5 rounded-full">
              Hủy: 1.8% (Tối ưu)
            </span>
          </div>
          <span className="text-[10px] font-bold tracking-wider uppercase text-stone-400 block mb-1">
            LƯỢT ĐẶT PHÒNG (BOOKINGS)
          </span>
          <div className="font-serif text-2xl font-bold text-stone-900 tracking-tight leading-tight">
            342 <span className="text-base font-normal font-sans text-stone-500">lượt</span>
          </div>
          <div className="text-[11px] text-stone-500 mt-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>328 hoàn tất • 6 chờ nhận phòng</span>
          </div>
        </div>

        {/* Card 4: Mức Độ Hài Lòng */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-2xs hover:shadow-xs transition-all">
          <div className="flex items-center justify-between mb-3">
            <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-amber-500 border border-stone-200/70">
              <Star size={16} fill="currentColor" />
            </div>
            <span className="text-[11px] font-bold text-amber-800 bg-[#FDF4E7] border border-amber-200/60 px-2 py-0.5 rounded-full">
              98.2% Hài lòng
            </span>
          </div>
          <span className="text-[10px] font-bold tracking-wider uppercase text-stone-400 block mb-1">
            MỨC ĐỘ HÀI LÒNG (CSAT)
          </span>
          <div className="font-serif text-2xl font-bold text-stone-900 tracking-tight leading-tight">
            4.96 <span className="text-base font-normal font-sans text-stone-400">/ 5.0</span>
          </div>
          <div className="text-[11px] text-stone-500 mt-2">
            Dựa trên 189 lượt đánh giá định danh
          </div>
        </div>
      </div>

      {/* 3. Charts Row: Biến Động Doanh Số & Channel Mix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Biến Động Doanh Số (2/3 width) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-stone-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <span className="text-[10px] font-bold tracking-wider uppercase text-stone-400 block">
                  DOANH THU 30 NGÀY
                </span>
                <h2 className="font-serif text-lg font-bold text-stone-900">
                  Biến Động Doanh Số & Dòng Tiền
                </h2>
              </div>
              {/* Legends */}
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5 text-stone-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-black"></span>
                  <span>Tiền phòng</span>
                </div>
                <div className="flex items-center gap-1.5 text-stone-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#8E6941]"></span>
                  <span>Ẩm thực & Spa</span>
                </div>
                <div className="flex items-center gap-1.5 text-stone-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-stone-300"></span>
                  <span>Dịch vụ phát sinh</span>
                </div>
              </div>
            </div>

            {/* Custom Interactive SVG Chart matching image */}
            <div className="h-64 w-full relative pt-6">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 600 200" preserveAspectRatio="none">
                {/* Horizontal baseline */}
                <line x1="0" y1="180" x2="600" y2="180" stroke="#E7E5E4" strokeWidth="1" />

                {/* Stacked Vertical Bars for key checkpoints */}
                {[
                  { x: 40, room: 60, fb: 30, extra: 20 },
                  { x: 125, room: 75, fb: 40, extra: 25 },
                  { x: 210, room: 55, fb: 35, extra: 20 },
                  { x: 295, room: 80, fb: 45, extra: 30 },
                  { x: 380, room: 70, fb: 35, extra: 25 },
                  { x: 465, room: 65, fb: 40, extra: 20 },
                  { x: 550, room: 90, fb: 50, extra: 35 },
                ].map((bar, i) => {
                  const totalHeight = bar.room + bar.fb + bar.extra;
                  const baseY = 180;
                  const roomY = baseY - bar.room;
                  const fbY = roomY - bar.fb;
                  const extraY = fbY - bar.extra;

                  return (
                    <g key={i} className="transition-all hover:opacity-85 cursor-pointer">
                      {/* Tiền phòng (Black) */}
                      <rect x={bar.x - 5} y={roomY} width="10" height={bar.room} rx="2" fill="#0E1524" />
                      {/* Ẩm thực & Spa (Brown/Bronze) */}
                      <rect x={bar.x - 5} y={fbY} width="10" height={bar.fb} rx="2" fill="#8E6941" />
                      {/* Dịch vụ phát sinh (Light stone/gray) */}
                      <rect x={bar.x - 5} y={extraY} width="10" height={bar.extra} rx="2" fill="#D6D3D1" />
                    </g>
                  );
                })}

                {/* Smooth Curve Connecting Peaks */}
                <path
                  d="M 40 70 Q 80 50, 125 40 T 210 70 T 295 25 T 380 50 T 465 55 T 550 5"
                  fill="none"
                  stroke="#0E1524"
                  strokeWidth="2"
                />

                {/* Peak Nodes */}
                {[
                  { cx: 40, cy: 70 },
                  { cx: 125, cy: 40 },
                  { cx: 210, cy: 70 },
                  { cx: 295, cy: 25 },
                  { cx: 380, cy: 50 },
                  { cx: 465, cy: 55 },
                  { cx: 550, cy: 5 },
                ].map((node, i) => (
                  <circle
                    key={i}
                    cx={node.cx}
                    cy={node.cy}
                    r="4"
                    fill="#0E1524"
                    stroke="#FFFFFF"
                    strokeWidth="2"
                    className="hover:r-6 transition-all"
                  />
                ))}
              </svg>

              {/* X Axis Labels */}
              <div className="flex justify-between text-[11px] text-stone-500 pt-2 font-medium">
                <span>01/10</span>
                <span>05/10</span>
                <span>10/10</span>
                <span>15/10</span>
                <span>20/10</span>
                <span>25/10</span>
                <span className="font-bold text-stone-900">30/10 (HÔM NAY)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Tỷ Trọng Nguồn Channel Mix (1/3 width) */}
        <div className="bg-white rounded-2xl p-6 border border-stone-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[10px] font-bold tracking-wider uppercase text-stone-400 block">
                  PHÂN PHỐI ĐẶT PHÒNG
                </span>
                <h2 className="font-serif text-lg font-bold text-stone-900">
                  Tỷ Trọng Nguồn (Channel Mix)
                </h2>
              </div>
              <PieChartIcon size={18} className="text-stone-400" />
            </div>

            {/* Donut Chart Simulation */}
            <div className="relative w-44 h-44 mx-auto my-2 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                {/* Background track */}
                <circle cx="50" cy="50" r="38" stroke="#F5F5F4" strokeWidth="11" fill="none" />
                {/* Direct Web: 48% (circumference ~ 238.76 -> 48% is ~114.6) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  stroke="#0E1524"
                  strokeWidth="11"
                  strokeDasharray="114.6 238.76"
                  strokeDashoffset="0"
                  fill="none"
                  strokeLinecap="round"
                />
                {/* OTA: 32% (~76.4) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  stroke="#8E6941"
                  strokeWidth="11"
                  strokeDasharray="76.4 238.76"
                  strokeDashoffset="-118"
                  fill="none"
                  strokeLinecap="round"
                />
                {/* Concierge VIP: 20% (~47.7) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  stroke="#D6D3D1"
                  strokeWidth="11"
                  strokeDasharray="47.7 238.76"
                  strokeDashoffset="-196"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>

              {/* Center Donut Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="font-serif text-2xl font-bold text-stone-900 leading-none">
                  48%
                </span>
                <span className="text-[9px] font-bold tracking-wider text-stone-400 uppercase mt-0.5">
                  DIRECT WEB
                </span>
              </div>
            </div>
          </div>

          {/* Breakdown List */}
          <div className="space-y-2.5 pt-4 border-t border-stone-100 text-xs">
            <div className="flex items-center justify-between p-2 rounded-xl bg-stone-50 border border-stone-200/60">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-black shrink-0"></span>
                <span className="font-medium text-stone-800">Trực tiếp (Website & App)</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-stone-900 block">48%</span>
                <span className="text-[10px] text-stone-500">(885M)</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-stone-50 border border-stone-200/60">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#8E6941] shrink-0"></span>
                <span className="font-medium text-stone-800">OTA (Agoda, Booking.com)</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-stone-900 block">32%</span>
                <span className="text-[10px] text-stone-500">(590M)</span>
              </div>
            </div>

            <div className="flex items-center justify-between p-2 rounded-xl bg-stone-50 border border-stone-200/60">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-stone-400 shrink-0"></span>
                <span className="font-medium text-stone-800">Khách quen VIP • Concierge</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-stone-900 block">20%</span>
                <span className="text-[10px] text-stone-500">(370M)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Bottom Row: High-tier Revenue Story Card (Left) & Room Type Ranking Table (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Featured Dark Luxury Card (1/3 width) */}
        <div className="relative rounded-2xl overflow-hidden min-h-[380px] flex flex-col justify-end p-6 bg-stone-900 shadow-md">
          <img
            src="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&auto=format&fit=crop&q=80"
            alt="Biệt Thự Hướng Biển"
            className="absolute inset-0 w-full h-full object-cover opacity-45 scale-105 transition-transform duration-700 hover:scale-100"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>

          <div className="relative z-10 space-y-3">
            <span className="inline-block text-[10px] font-bold tracking-widest text-[#F7DFBC] bg-black/50 border border-[#F7DFBC]/30 px-2.5 py-1 rounded-full uppercase">
              CƠ CẤU DOANH THU CAO CẤP
            </span>
            <h3 className="font-serif text-2xl font-bold text-white leading-snug">
              Hiệu Quả Vượt Trội Từ Các Biệt Thự Hướng Biển
            </h3>
            <p className="text-xs text-stone-300 font-light leading-relaxed">
              Các hạng Penthouse và Villa đóng góp hơn 66% tổng dòng tiền lưu trú trong tháng với tỷ lệ khách đặt kéo dài trên 3.4 đêm.
            </p>
          </div>
        </div>

        {/* Right: Xếp Hạng Hiệu Suất Loại Phòng (2/3 width) */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-stone-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-5">
              <div>
                <span className="text-[10px] font-bold tracking-wider uppercase text-stone-400 block">
                  PHÂN TÍCH HẠNG PHÒNG
                </span>
                <h2 className="font-serif text-lg font-bold text-stone-900">
                  Xếp Hạng Hiệu Suất Loại Phòng
                </h2>
              </div>
              <button className="flex items-center gap-1 text-xs font-semibold text-stone-700 hover:text-black transition-colors cursor-pointer">
                <span>Xem tất cả 12 phòng</span>
                <ChevronRight size={14} />
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-[10px] font-bold uppercase tracking-wider text-stone-400 border-b border-stone-100 pb-2">
                    <th className="pb-3">LOẠI PHÒNG • VỊ TRÍ</th>
                    <th className="pb-3 text-right">DOANH THU</th>
                    <th className="pb-3 px-6">CÔNG SUẤT (OCC)</th>
                    <th className="pb-3 text-right">ĐÁNH GIÁ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {/* Row 1 */}
                  <tr className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3.5 pr-3">
                      <div className="flex items-center gap-3">
                        <img
                          src="https://images.unsplash.com/photo-1590490360182-c33d57733427?w=100&auto=format&fit=crop&q=80"
                          alt="Penthouse Ocean View"
                          className="w-10 h-10 rounded-xl object-cover ring-1 ring-stone-200 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-stone-900">Penthouse Ocean View</p>
                          <p className="text-[11px] text-stone-400">Tầng 05 • 04 Căn • 180m²</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 text-right whitespace-nowrap">
                      <p className="font-bold text-stone-900">680.000.000 đ</p>
                      <p className="text-[10px] text-stone-400">36.8% Tổng DT</p>
                    </td>
                    <td className="py-3.5 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-900 w-8">92%</span>
                        <div className="w-24 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                          <div className="h-full bg-stone-900 rounded-full" style={{ width: '92%' }}></div>
                        </div>
                        <span className="text-[10px] text-stone-500">Rất cao</span>
                      </div>
                    </td>
                    <td className="py-3.5 text-right whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 font-semibold text-stone-800">
                        <Star size={12} className="text-amber-500 fill-amber-500" />
                        4.98
                      </span>
                    </td>
                  </tr>

                  {/* Row 2 */}
                  <tr className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3.5 pr-3">
                      <div className="flex items-center gap-3">
                        <img
                          src="https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=100&auto=format&fit=crop&q=80"
                          alt="Garden Sanctuary Villa"
                          className="w-10 h-10 rounded-xl object-cover ring-1 ring-stone-200 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-stone-900">Garden Sanctuary Villa</p>
                          <p className="text-[11px] text-stone-400">Khu Vườn Thiền • 06 Căn • 140m²</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 text-right whitespace-nowrap">
                      <p className="font-bold text-stone-900">540.000.000 đ</p>
                      <p className="text-[10px] text-stone-400">29.2% Tổng DT</p>
                    </td>
                    <td className="py-3.5 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-900 w-8">88%</span>
                        <div className="w-24 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                          <div className="h-full bg-stone-900 rounded-full" style={{ width: '88%' }}></div>
                        </div>
                        <span className="text-[10px] text-stone-500">Ổn định</span>
                      </div>
                    </td>
                    <td className="py-3.5 text-right whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 font-semibold text-stone-800">
                        <Star size={12} className="text-amber-500 fill-amber-500" />
                        4.95
                      </span>
                    </td>
                  </tr>

                  {/* Row 3 */}
                  <tr className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3.5 pr-3">
                      <div className="flex items-center gap-3">
                        <img
                          src="https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=100&auto=format&fit=crop&q=80"
                          alt="Ocean Horizon Suite"
                          className="w-10 h-10 rounded-xl object-cover ring-1 ring-stone-200 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-stone-900">Ocean Horizon Suite</p>
                          <p className="text-[11px] text-stone-400">Tầng 03-04 • 08 Căn • 95m²</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 text-right whitespace-nowrap">
                      <p className="font-bold text-stone-900">420.000.000 đ</p>
                      <p className="text-[10px] text-stone-400">22.8% Tổng DT</p>
                    </td>
                    <td className="py-3.5 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-900 w-8">79%</span>
                        <div className="w-24 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                          <div className="h-full bg-stone-900 rounded-full" style={{ width: '79%' }}></div>
                        </div>
                        <span className="text-[10px] text-stone-500">Tốt</span>
                      </div>
                    </td>
                    <td className="py-3.5 text-right whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 font-semibold text-stone-800">
                        <Star size={12} className="text-amber-500 fill-amber-500" />
                        4.93
                      </span>
                    </td>
                  </tr>

                  {/* Row 4 */}
                  <tr className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3.5 pr-3">
                      <div className="flex items-center gap-3">
                        <img
                          src="https://images.unsplash.com/photo-1591088398332-8a7791972843?w=100&auto=format&fit=crop&q=80"
                          alt="Deluxe Pine Forest"
                          className="w-10 h-10 rounded-xl object-cover ring-1 ring-stone-200 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-stone-900">Deluxe Pine Forest</p>
                          <p className="text-[11px] text-stone-400">Khu Rừng Thông • 10 Căn • 70m²</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 text-right whitespace-nowrap">
                      <p className="font-bold text-stone-900">205.000.000 đ</p>
                      <p className="text-[10px] text-stone-400">11.2% Tổng DT</p>
                    </td>
                    <td className="py-3.5 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-900 w-8">75%</span>
                        <div className="w-24 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                          <div className="h-full bg-stone-900 rounded-full" style={{ width: '75%' }}></div>
                        </div>
                        <span className="text-[10px] text-stone-500">Mục tiêu đạt</span>
                      </div>
                    </td>
                    <td className="py-3.5 text-right whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 font-semibold text-stone-800">
                        <Star size={12} className="text-amber-500 fill-amber-500" />
                        4.91
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Bottom AI Yield Bar Banner */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-[#FDF4E7] text-amber-900 border border-amber-200/60 flex items-center justify-center shrink-0">
            <Sparkles size={18} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-stone-900">
              Đề xuất Tối ưu Doanh thu (Yield Management AI)
            </h4>
            <p className="text-xs text-stone-500 mt-0.5">
              Dự báo công suất cuối tuần tới (01/11 - 03/11) chạm 96%. Đề xuất tăng giá linh hoạt hạng <span className="font-semibold text-stone-700">Penthouse Ocean View +12%</span> và kích hoạt gói ưu đãi ẩm thực tại phòng.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button className="px-3.5 py-2 rounded-full border border-stone-200 text-stone-700 text-xs font-medium hover:bg-stone-50 transition-colors cursor-pointer">
            Xem chi tiết dự báo
          </button>
          <button
            onClick={handleApplyYield}
            className="px-4 py-2 rounded-full bg-black hover:bg-stone-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            Áp dụng điều chỉnh giá
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportStatisticsPage;
