import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  QrCode,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Calendar,
  CreditCard,
  User,
  ShieldCheck,
  FileText,
} from 'lucide-react';
import NewBookingModal from '../../components/receptionist/NewBookingModal';

const INITIAL_BOOKINGS = [
  {
    id: 'LET-8821',
    code: '#LET-8821',
    source: 'Web Direct',
    guestName: 'Phạm Long Hải',
    guestTier: 'Hội viên Black Diamond',
    tierVariant: 'amber',
    roomCategory: 'Grand Oceanfront Penthouse',
    roomNumber: 'Phòng P1202 • Tầng 12',
    dateRange: 'Hôm nay → 28/10',
    stayDuration: '3 đêm • 2 khách',
    status: 'CHECKIN_PENDING',
    statusLabel: 'Chờ Check-in',
    statusVariant: 'sand',
    paymentNote: 'Đã thanh toán 100%',
    actionType: 'CHECKIN',
  },
  {
    id: 'LET-8794',
    code: '#LET-8794',
    source: 'Booking.com',
    guestName: 'Elena Rostova',
    guestTier: 'Gold Member',
    tierVariant: 'stone',
    roomCategory: 'Boutique Garden Villa',
    roomNumber: 'Biệt thự V04',
    dateRange: '21/10 → Hôm nay, 12:00',
    stayDuration: '4 đêm • Trả phòng trễ 13:30',
    status: 'CHECKOUT_PENDING',
    statusLabel: 'Chờ Check-out',
    statusVariant: 'slate',
    paymentNote: 'Còn lại: 18.250.000 đ',
    actionType: 'CHECKOUT',
  },
  {
    id: 'LET-8802',
    code: '#LET-8802',
    source: 'Walk-in',
    guestName: 'Nguyễn Vũ Minh Khang',
    guestTier: 'Khách vãng lai',
    tierVariant: 'stone',
    roomCategory: 'Deluxe Pine Forest View',
    roomNumber: 'Phòng D0508 • Tầng 5',
    dateRange: '23/10 → 26/10',
    stayDuration: 'Ngày 2/3',
    status: 'STAYING',
    statusLabel: 'Đang ở',
    statusVariant: 'red',
    paymentNote: 'Đã cọc tiền phòng',
    actionType: 'DETAILS',
  },
  {
    id: 'LET-8770',
    code: '#LET-8770',
    source: 'Agoda',
    guestName: 'Trần Hữu Nam',
    guestTier: 'Hội viên Thân thiết',
    tierVariant: 'stone',
    roomCategory: 'Executive Heritage Suite',
    roomNumber: 'Phòng S0801',
    dateRange: '20/10 → 24/10',
    stayDuration: 'Đã trả sáng nay (08:30)',
    status: 'COMPLETED',
    statusLabel: 'Đã hoàn tất',
    statusVariant: 'neutral',
    paymentNote: 'Đã quyết toán xong',
    actionType: 'INVOICE',
  },
];

export const ReceptionistBookingsPage = () => {
  const [bookings, setBookings] = useState(INITIAL_BOOKINGS);
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewBookingModalOpen, setIsNewBookingModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleCreateBooking = (newBookingData) => {
    const created = {
      id: `LET-${Math.floor(8800 + Math.random() * 100)}`,
      code: `#LET-${Math.floor(8800 + Math.random() * 100)}`,
      source: newBookingData.source || 'Walk-in',
      guestName: newBookingData.guestName,
      guestTier: newBookingData.membership || 'Khách vãng lai',
      tierVariant: newBookingData.membership?.includes('VIP') ? 'amber' : 'stone',
      roomCategory: newBookingData.roomCategory || 'Grand Oceanfront Penthouse',
      roomNumber: `Phòng ${newBookingData.roomNumber || 'P1204'}`,
      dateRange: `${newBookingData.checkIn} → ${newBookingData.checkOut}`,
      stayDuration: `${newBookingData.guestsCount || '2 khách'}`,
      status: 'CHECKIN_PENDING',
      statusLabel: 'Chờ Check-in',
      statusVariant: 'sand',
      paymentNote: newBookingData.paymentStatus || 'Đã thanh toán 100%',
      actionType: 'CHECKIN',
    };

    setBookings([created, ...bookings]);
    showToast(`Đã tạo đơn đặt phòng thành công cho khách hàng ${created.guestName}!`);
  };

  const handleAction = (booking) => {
    if (booking.actionType === 'CHECKIN') {
      setBookings((prev) =>
        prev.map((b) =>
          b.id === booking.id
            ? { ...b, status: 'STAYING', statusLabel: 'Đang ở', statusVariant: 'red', actionType: 'DETAILS' }
            : b
        )
      );
      showToast(`Đã hoàn tất nhận phòng (Check-in) cho ${booking.guestName}!`);
    } else if (booking.actionType === 'CHECKOUT') {
      setBookings((prev) =>
        prev.map((b) =>
          b.id === booking.id
            ? { ...b, status: 'COMPLETED', statusLabel: 'Đã hoàn tất', statusVariant: 'neutral', actionType: 'INVOICE' }
            : b
        )
      );
      showToast(`Đã hoàn tất thủ tục trả phòng (Check-out) cho ${booking.guestName}!`);
    } else if (booking.actionType === 'INVOICE') {
      showToast(`Đang xuất hóa đơn điện tử VAT cho đơn ${booking.code}...`);
    } else {
      showToast(`Mở chi tiết đơn đặt phòng ${booking.code}`);
    }
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const matchTab =
        activeTab === 'ALL' ||
        (activeTab === 'CHECKIN' && b.status === 'CHECKIN_PENDING') ||
        (activeTab === 'CHECKOUT' && b.status === 'CHECKOUT_PENDING') ||
        (activeTab === 'STAYING' && b.status === 'STAYING');

      const matchSearch =
        b.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.guestName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.roomNumber.toLowerCase().includes(searchTerm.toLowerCase());

      return matchTab && matchSearch;
    });
  }, [bookings, activeTab, searchTerm]);

  return (
    <div className="p-6 sm:p-8 space-y-6 pb-12 max-w-[1550px] mx-auto">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 bg-stone-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-stone-700 flex items-center gap-3 animate-fade-in text-xs font-medium">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header & Actions matching image */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-stone-900 leading-tight">
            Đơn đặt phòng
          </h1>
          <p className="text-xs text-stone-500 mt-1 max-w-2xl">
            Quản lý lịch lưu trú, đón tiếp khách và xử lý nhận phòng nhanh.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => showToast('Đang kết nối đầu đọc mã quét CCCD / Hộ chiếu điện tử...')}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-stone-200/90 text-stone-700 text-xs font-semibold hover:bg-stone-50 shadow-2xs transition-colors cursor-pointer"
          >
            <QrCode size={14} className="text-stone-500" />
            <span>Quét CCCD / Hộ chiếu</span>
          </button>

          <button
            type="button"
            onClick={() => setIsNewBookingModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2 rounded-full bg-black hover:bg-stone-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus size={14} />
            <span>+ Tạo đặt phòng mới</span>
          </button>
        </div>
      </div>

      {/* 2. 4 KPI Cards matching image */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Đến hôm nay */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-2xs">
          <span className="text-[10px] font-bold tracking-wider uppercase text-stone-400 block mb-1">
            ĐẾN HÔM NAY
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold text-stone-900 leading-none">
              12
            </span>
            <span className="text-xs text-stone-500 font-medium">
              8 đã nhận
            </span>
          </div>
        </div>

        {/* Card 2: Đi hôm nay */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-2xs">
          <span className="text-[10px] font-bold tracking-wider uppercase text-stone-400 block mb-1">
            ĐI HÔM NAY
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold text-stone-900 leading-none">
              09
            </span>
            <span className="text-xs text-stone-500 font-medium">
              7 đã trả
            </span>
          </div>
        </div>

        {/* Card 3: Đang lưu trú */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-2xs">
          <span className="text-[10px] font-bold tracking-wider uppercase text-stone-400 block mb-1">
            ĐANG LƯU TRÚ
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold text-stone-900 leading-none">
              24
            </span>
            <span className="text-xs text-stone-500 font-medium">
              phòng
            </span>
          </div>
        </div>

        {/* Card 4: Doanh thu hôm nay */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-2xs">
          <span className="text-[10px] font-bold tracking-wider uppercase text-stone-400 block mb-1">
            DOANH THU HÔM NAY
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold text-stone-900 leading-none">
              184.5M
            </span>
            <span className="text-xs text-stone-500 font-medium">
              VND
            </span>
          </div>
        </div>
      </div>

      {/* 3. Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        {/* Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('ALL')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'ALL'
                ? 'bg-black text-white shadow-xs'
                : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200/90 hover:bg-stone-50'
            }`}
          >
            Tất cả (34)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('CHECKIN')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'CHECKIN'
                ? 'bg-black text-white shadow-xs'
                : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200/90 hover:bg-stone-50'
            }`}
          >
            Hôm nay đến (12)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('CHECKOUT')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'CHECKOUT'
                ? 'bg-black text-white shadow-xs'
                : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200/90 hover:bg-stone-50'
            }`}
          >
            Hôm nay đi (9)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('STAYING')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'STAYING'
                ? 'bg-black text-white shadow-xs'
                : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200/90 hover:bg-stone-50'
            }`}
          >
            Đang lưu trú (24)
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Tìm theo mã đơn, họ tên khách..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-full bg-white border border-stone-200/90 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-900 shadow-2xs"
          />
        </div>
      </div>

      {/* 4. Bookings Table matching image */}
      <div className="bg-white rounded-2xl border border-stone-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-stone-50/50 text-[10px] font-bold uppercase tracking-wider text-stone-400 border-b border-stone-100">
                <th className="py-3.5 px-6">MÃ ĐƠN</th>
                <th className="py-3.5 px-4">KHÁCH HÀNG</th>
                <th className="py-3.5 px-4">HẠNG PHÒNG & SỐ PHÒNG</th>
                <th className="py-3.5 px-4">THỜI GIAN LƯU TRÚ</th>
                <th className="py-3.5 px-4">TRẠNG THÁI</th>
                <th className="py-3.5 px-6 text-right">THAO TÁC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredBookings.map((b) => (
                <tr key={b.id} className="hover:bg-stone-50/60 transition-colors">
                  {/* Mã đơn */}
                  <td className="py-4 px-6">
                    <p className="font-bold text-stone-900">{b.code}</p>
                    <p className="text-[11px] text-stone-400 mt-0.5">{b.source}</p>
                  </td>

                  {/* Khách hàng */}
                  <td className="py-4 px-4">
                    <p className="font-bold text-stone-900">{b.guestName}</p>
                    <p
                      className={`text-[11px] mt-0.5 ${
                        b.tierVariant === 'amber'
                          ? 'text-amber-700 font-bold'
                          : 'text-stone-500 font-medium'
                      }`}
                    >
                      {b.guestTier}
                    </p>
                  </td>

                  {/* Hạng phòng & Số phòng */}
                  <td className="py-4 px-4">
                    <p className="font-bold text-stone-800">{b.roomCategory}</p>
                    <p className="text-[11px] text-stone-400 mt-0.5">{b.roomNumber}</p>
                  </td>

                  {/* Thời gian lưu trú */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <p className="font-semibold text-stone-800">{b.dateRange}</p>
                    <p className="text-[11px] text-stone-400 mt-0.5">{b.stayDuration}</p>
                  </td>

                  {/* Trạng thái */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <div>
                      {b.statusVariant === 'sand' && (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full bg-[#FAF5EE] text-amber-900 border border-amber-200/70">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
                          {b.statusLabel}
                        </span>
                      )}
                      {b.statusVariant === 'slate' && (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 border border-stone-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-stone-400"></span>
                          {b.statusLabel}
                        </span>
                      )}
                      {b.statusVariant === 'red' && (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
                          {b.statusLabel}
                        </span>
                      )}
                      {b.statusVariant === 'neutral' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full bg-stone-100 text-stone-600">
                          {b.statusLabel}
                        </span>
                      )}
                      <p className="text-[11px] text-stone-400 mt-1">{b.paymentNote}</p>
                    </div>
                  </td>

                  {/* Thao tác */}
                  <td className="py-4 px-6 text-right whitespace-nowrap">
                    {b.actionType === 'CHECKIN' ? (
                      <button
                        type="button"
                        onClick={() => handleAction(b)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-black text-white text-xs font-semibold hover:bg-stone-800 transition-colors cursor-pointer shadow-xs"
                      >
                        <span>Nhận phòng</span>
                        <ChevronRight size={13} />
                      </button>
                    ) : b.actionType === 'CHECKOUT' ? (
                      <button
                        type="button"
                        onClick={() => handleAction(b)}
                        className="inline-flex items-center px-4 py-2 rounded-xl bg-white border border-stone-200 text-stone-700 text-xs font-semibold hover:bg-stone-50 transition-colors cursor-pointer shadow-2xs"
                      >
                        <span>Trả phòng</span>
                      </button>
                    ) : b.actionType === 'DETAILS' ? (
                      <button
                        type="button"
                        onClick={() => handleAction(b)}
                        className="text-xs font-semibold text-stone-700 hover:text-black transition-colors cursor-pointer"
                      >
                        Chi tiết
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleAction(b)}
                        className="text-xs font-semibold text-stone-600 hover:text-black transition-colors cursor-pointer"
                      >
                        Hóa đơn VAT
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div className="p-4 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-stone-500">
          <div>
            Hiển thị 1 - {filteredBookings.length} trên 34 đơn lưu trú
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
            <button className="w-8 h-8 rounded-lg border border-stone-200 flex items-center justify-center text-stone-400 hover:text-stone-800 hover:bg-stone-50 cursor-pointer">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* 5. Bottom Footer matching image */}
      <footer className="pt-6 border-t border-stone-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-stone-400">
        <div>
          © 2025 L'Étoile Luxury Retreat
        </div>
        <div className="text-[11px] text-stone-500">
          Hệ thống Front Desk • Phiên bản 4.12
        </div>
      </footer>

      {/* New Booking Modal */}
      <NewBookingModal
        isOpen={isNewBookingModalOpen}
        onClose={() => setIsNewBookingModalOpen(false)}
        onCreateBooking={handleCreateBooking}
      />
    </div>
  );
};

export default ReceptionistBookingsPage;
