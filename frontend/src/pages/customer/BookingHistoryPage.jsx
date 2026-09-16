import React, { useState } from 'react';
import {
  FileText,
  Bell,
  Sparkles,
  Plane,
  Clock,
  Star,
  CheckCircle2,
  MessageSquare,
  ShieldCheck,
} from 'lucide-react';

export const BookingHistoryPage = () => {
  const [selectedYear, setSelectedYear] = useState('2024');
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // 1. Dữ liệu thành viên VIP
  const memberProfile = {
    name: 'Nguyễn Hoàng Minh Châu',
    memberId: '#LET-BD-99281',
    tier: 'Black Diamond',
    memberSince: '2021',
    rewardPoints: '48,500 pts',
    stayNightsYear: '34 đêm',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=160&q=80',
    privileges: [
      {
        icon: Sparkles,
        title: 'Nâng hạng phòng',
        subtitle: 'Miễn phí tùy tình trạng',
      },
      {
        icon: Plane,
        title: 'Đưa đón sân bay',
        subtitle: 'Xe riêng hạng sang',
      },
      {
        icon: ShieldCheck,
        title: 'Spa & Wellness',
        subtitle: 'Giảm 25% mọi dịch vụ',
      },
      {
        icon: Clock,
        title: 'Check-in linh hoạt',
        subtitle: 'Sớm & Muộn tùy ý',
      },
    ],
  };

  // 2. Đơn đặt phòng hiện tại
  const currentBookings = [
    {
      id: 'LET-8921',
      badge: 'PENTHOUSE OCEAN SUITE',
      status: 'Đã xác nhận',
      statusColor: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
      paymentStatus: 'Đã thanh toán 100%',
      hotelName: "L'Étoile Luxury Resort Cam Ranh",
      dates: '14/10/2024 - 18/10/2024',
      guests: '2 Người lớn • 1 Phòng',
      amountLabel: 'Tổng giá trị',
      amountValue: '34,500,000 VND',
      included: 'Bao gồm ăn sáng cao cấp & xe đưa đón sân bay',
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'LET-8854',
      badge: 'MOUNTAIN VILLA',
      status: 'Sắp diễn ra',
      statusColor: 'bg-amber-50 text-amber-800 border border-amber-200',
      paymentStatus: 'Đặt cọc 50%',
      hotelName: "L'Étoile Highland Retreat Đà Lạt",
      dates: '02/11/2024 - 05/11/2024',
      guests: '2 Người lớn • 1 Villa',
      amountLabel: 'Còn lại thanh toán',
      amountValue: '12,800,000 VND',
      included: 'Bao gồm tiệc trà chiều hoàng hôn tại đồi thông',
      image: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=600&q=80',
    },
  ];

  // 3. Lịch sử kỳ nghỉ
  const pastStays = [
    {
      id: 'LET-7492',
      hotel: "L'Étoile Riverside Sài Gòn",
      dates: '10/08/2024 - 13/08/2024',
      roomType: 'Deluxe Suite',
      totalCost: '18,200,000 VND',
      rating: 5.0,
    },
    {
      id: 'LET-6102',
      hotel: "L'Étoile Heritage Phú Quốc",
      dates: '20/05/2024 - 25/05/2024',
      roomType: 'Beachfront Villa',
      totalCost: '45,000,000 VND',
      rating: 5.0,
    },
    {
      id: 'LET-5291',
      hotel: "L'Étoile Alpine Lodge Sa Pa",
      dates: '12/02/2024 - 15/02/2024',
      roomType: 'Panoramic Suite',
      totalCost: '22,400,000 VND',
      rating: 4.0,
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10 bg-[#FAF8F5]">
      {/* Toast alert */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-50 p-4 bg-stone-900 text-white rounded-2xl shadow-xl flex items-center gap-3 text-xs animate-in fade-in">
          <CheckCircle2 size={16} className="text-[#C59D5F]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. VIP Member Card */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#0E1524] via-[#161F36] to-[#0A101C] text-white p-6 sm:p-8 border border-stone-800 shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-white/10">
          {/* User profile info */}
          <div className="flex items-center gap-4">
            <img
              src={memberProfile.avatar}
              alt={memberProfile.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-[#C59D5F]/60 p-0.5 shadow-md"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-3 py-0.5 rounded-full bg-[#F7DFBC] text-[#2C1E11] text-[11px] font-bold">
                  {memberProfile.tier}
                </span>
                <span className="text-xs text-stone-400 font-light">
                  Thành viên từ {memberProfile.memberSince}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-normal font-serif text-white">
                Xin chào, {memberProfile.name}
              </h2>
              <span className="text-xs text-stone-400 font-mono tracking-wider block">
                ID Thành viên: <strong className="text-stone-200">{memberProfile.memberId}</strong>
              </span>
            </div>
          </div>

          {/* Stats Glassmorphic Box */}
          <div className="flex items-center gap-6 bg-white/5 backdrop-blur-md px-6 py-3.5 rounded-2xl border border-white/10">
            <div>
              <span className="text-[10px] text-stone-400 uppercase tracking-wider block">
                Điểm tích lũy
              </span>
              <span className="text-base sm:text-lg font-bold text-[#F7DFBC] font-mono">
                {memberProfile.rewardPoints}
              </span>
            </div>
            <div className="h-8 w-px bg-white/15" />
            <div>
              <span className="text-[10px] text-stone-400 uppercase tracking-wider block">
                Đêm nghỉ năm nay
              </span>
              <span className="text-base sm:text-lg font-bold text-white font-mono">
                {memberProfile.stayNightsYear}
              </span>
            </div>
          </div>
        </div>

        {/* 4 VIP Privileges Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
          {memberProfile.privileges.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[#F7DFBC] shrink-0">
                  <Icon size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-stone-200">
                    {item.title}
                  </h4>
                  <span className="text-[11px] text-stone-400 font-light block">
                    {item.subtitle}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Đơn đặt phòng hiện tại */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-normal font-serif text-stone-900">
              Đơn đặt phòng hiện tại
            </h2>
            <p className="text-xs text-stone-500 font-light">
              Các kỳ nghỉ sắp diễn ra và đã xác nhận của bạn
            </p>
          </div>
          <span className="px-3 py-1 rounded-full bg-[#F7DFBC] text-[#2C1E11] text-xs font-semibold">
            {currentBookings.length} đơn đặt phòng
          </span>
        </div>

        <div className="space-y-4">
          {currentBookings.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-2xs flex flex-col md:flex-row p-4 sm:p-5 gap-5"
            >
              {/* Photo on left */}
              <div className="relative md:w-64 aspect-[16/10] md:aspect-auto rounded-2xl overflow-hidden shrink-0 bg-stone-100">
                <img
                  src={b.image}
                  alt={b.hotelName}
                  className="w-full h-full object-cover"
                />
                <span className="absolute top-2.5 left-2.5 bg-black/75 backdrop-blur-xs text-white text-[9px] tracking-wider uppercase font-semibold px-2.5 py-0.5 rounded-full">
                  {b.badge}
                </span>
              </div>

              {/* Details on right */}
              <div className="flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-stone-900">
                        #{b.id}
                      </span>
                      <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${b.statusColor}`}>
                        {b.status}
                      </span>
                    </div>
                    <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-[#FBF4EA] text-[#A27734] border border-[#F7E1BC]">
                      {b.paymentStatus}
                    </span>
                  </div>

                  <h3 className="font-serif text-base sm:text-lg font-medium text-stone-900">
                    {b.hotelName}
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-stone-600 pt-1">
                    <div>
                      <span className="text-[10px] text-stone-400 block uppercase">Thời gian</span>
                      <span className="font-semibold text-stone-800">{b.dates}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400 block uppercase">Khách</span>
                      <span className="font-semibold text-stone-800">{b.guests}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400 block uppercase">{b.amountLabel}</span>
                      <span className="font-bold text-stone-900">{b.amountValue}</span>
                    </div>
                  </div>
                </div>

                {/* Bottom row actions */}
                <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <span className="text-stone-500 font-light flex items-center gap-1">
                    <CheckCircle2 size={13} className="text-stone-400" />
                    <span>{b.included}</span>
                  </span>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => showToast(`Đang mở hóa đơn điện tử #${b.id}`)}
                      className="text-stone-600 hover:text-stone-900 font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <FileText size={13} />
                      <span>Xem hóa đơn</span>
                    </button>
                    <button
                      onClick={() => showToast(`Đã gửi yêu cầu dịch vụ cho đơn #${b.id} tới Quản gia L'Étoile`)}
                      className="text-stone-600 hover:text-stone-900 font-medium flex items-center gap-1 cursor-pointer"
                    >
                      <Bell size={13} />
                      <span>Yêu cầu dịch vụ</span>
                    </button>
                    <button
                      onClick={() => showToast(`Vui lòng liên hệ Hotline +84 28 3912 8888 để đổi lịch đơn #${b.id}`)}
                      className="bg-black hover:bg-stone-800 text-white px-4 py-1.5 rounded-full font-medium transition-colors cursor-pointer"
                    >
                      Đổi lịch
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Lịch sử kỳ nghỉ (Bảng dữ liệu chuẩn Image 3) */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-normal font-serif text-stone-900">
              Lịch sử kỳ nghỉ
            </h2>
            <p className="text-xs text-stone-500 font-light">
              Danh sách các kỳ nghỉ đã hoàn thành và hóa đơn điện tử
            </p>
          </div>

          <div className="relative">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="bg-stone-50 border border-stone-200 rounded-xl px-3 py-1.5 text-xs text-stone-700 font-medium focus:outline-none cursor-pointer"
            >
              <option value="2024">Tất cả các năm (2024)</option>
              <option value="2023">Năm 2023</option>
              <option value="2022">Năm 2022</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-200 text-stone-400 font-medium uppercase tracking-wider text-[10px]">
                <th className="pb-3 font-semibold">Mã đơn & Khách sạn</th>
                <th className="pb-3 font-semibold">Thời gian lưu trú</th>
                <th className="pb-3 font-semibold">Loại phòng</th>
                <th className="pb-3 font-semibold">Tổng chi phí</th>
                <th className="pb-3 font-semibold">Đánh giá của bạn</th>
                <th className="pb-3 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {pastStays.map((stay) => (
                <tr key={stay.id} className="hover:bg-stone-50/70 transition-colors">
                  <td className="py-4">
                    <span className="font-mono font-bold text-stone-900 block">
                      #{stay.id}
                    </span>
                    <span className="text-stone-500 font-light">
                      {stay.hotel}
                    </span>
                  </td>
                  <td className="py-4 font-mono text-stone-700">
                    {stay.dates}
                  </td>
                  <td className="py-4">
                    <span className="px-2.5 py-1 rounded-full bg-[#FBF4EA] text-[#7A4B17] text-[11px] font-medium border border-[#F7E1BC]">
                      {stay.roomType}
                    </span>
                  </td>
                  <td className="py-4 font-bold text-stone-900 font-mono">
                    {stay.totalCost}
                  </td>
                  <td className="py-4">
                    <div className="flex items-center gap-1 text-[#C59D5F]">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          className={i < Math.floor(stay.rating) ? 'fill-[#C59D5F]' : 'text-stone-300'}
                        />
                      ))}
                      <span className="font-bold text-stone-800 ml-1 text-[11px]">
                        {stay.rating.toFixed(1)}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 text-right">
                    <div className="inline-flex items-center gap-3 text-stone-500">
                      <button
                        onClick={() => showToast(`Đang tải hóa đơn #${stay.id}`)}
                        title="Tải hóa đơn"
                        className="hover:text-stone-900 cursor-pointer p-1"
                      >
                        <FileText size={15} />
                      </button>
                      <button
                        onClick={() => showToast(`Cảm ơn bạn đã phản hồi kỳ nghỉ #${stay.id}`)}
                        title="Xem phản hồi"
                        className="hover:text-stone-900 cursor-pointer p-1"
                      >
                        <MessageSquare size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BookingHistoryPage;
