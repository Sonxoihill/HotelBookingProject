import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Plus,
  QrCode,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Receipt,
  X,
  Sparkles,
} from 'lucide-react';
import { formatVND } from '../../utils/formatters';
import { bookingFolioSync } from '../../utils/bookingFolioSync';
import bookingService from '../../services/bookingService';
import NewBookingModal from '../../components/receptionist/NewBookingModal';

const INITIAL_BASE_BOOKINGS = [
  {
    id: 'BK-8821',
    code: '#BK-8821',
    source: 'Web Direct',
    guestName: 'Đỗ Minh Quân',
    guestTier: 'Black Diamond VIP',
    tierVariant: 'amber',
    roomCategory: 'Grand Celestial Penthouse',
    roomNumber: 'Phòng P1201 • Tầng 12',
    dateRange: '14/10 → 18/10',
    stayDuration: '4 đêm • 2 khách',
    status: 'CHECKED_IN',
    statusLabel: 'Đang ở',
    statusVariant: 'purple',
    roomCharge: 88000000,
    deposit: 50000000,
    paymentNote: 'Đã cọc 50.000.000 đ',
    actionType: 'CHECKOUT',
  },
  {
    id: 'BK-8819',
    code: '#BK-8819',
    source: 'Walk-in',
    guestName: 'Trần Bảo Ngọc',
    guestTier: 'VIP Diamond',
    tierVariant: 'amber',
    roomCategory: 'Garden Sanctuary Villa',
    roomNumber: 'Biệt thự V101 • Tầng Trệt',
    dateRange: '13/10 → 18/10',
    stayDuration: '5 đêm • 4 khách',
    status: 'CHECKED_IN',
    statusLabel: 'Đang ở',
    statusVariant: 'purple',
    roomCharge: 74000000,
    deposit: 40000000,
    paymentNote: 'Đã cọc 40.000.000 đ',
    actionType: 'CHECKOUT',
  },
  {
    id: 'BK-8815',
    code: '#BK-8815',
    source: 'Booking.com',
    guestName: 'Elena Rostova',
    guestTier: 'Platinum Member',
    tierVariant: 'stone',
    roomCategory: 'Royal Sky Penthouse',
    roomNumber: 'Phòng P1202 • Tầng 12',
    dateRange: '16/10 → 20/10',
    stayDuration: '4 đêm • 2 khách',
    status: 'CHECKED_IN',
    statusLabel: 'Đang ở',
    statusVariant: 'purple',
    roomCharge: 98000000,
    deposit: 50000000,
    paymentNote: 'Đã cọc 50.000.000 đ',
    actionType: 'CHECKOUT',
  },
  {
    id: 'BK-8810',
    code: '#BK-8810',
    source: 'Agoda',
    guestName: 'Liam Vanderberg',
    guestTier: 'Executive Member',
    tierVariant: 'stone',
    roomCategory: 'Ocean Horizon Suite',
    roomNumber: 'Phòng S802 • Tầng 8',
    dateRange: '15/10 → 19/10',
    stayDuration: '4 đêm • 2 khách',
    status: 'CHECKED_IN',
    statusLabel: 'Đang ở',
    statusVariant: 'purple',
    roomCharge: 34000000,
    deposit: 20000000,
    paymentNote: 'Đã cọc 20.000.000 đ',
    actionType: 'CHECKOUT',
  },
  {
    id: 'BK-8770',
    code: '#BK-8770',
    source: 'Agoda',
    guestName: 'Trần Hữu Nam',
    guestTier: 'Hội viên Thân thiết',
    tierVariant: 'stone',
    roomCategory: 'Executive Heritage Suite',
    roomNumber: 'Phòng S0801 • Tầng 8',
    dateRange: '10/10 → 14/10',
    stayDuration: 'Đã trả phòng',
    status: 'CHECKED_OUT',
    statusLabel: 'Đã trả phòng',
    statusVariant: 'neutral',
    roomCharge: 24000000,
    deposit: 24000000,
    paymentNote: 'Đã quyết toán xong',
    actionType: 'INVOICE',
  },
  {
    id: 'BK-8830',
    code: '#BK-8830',
    source: 'Web Direct',
    guestName: 'Hoàng Minh Tuấn',
    guestTier: 'Khách mới',
    tierVariant: 'stone',
    roomCategory: 'Standard Single View Biển',
    roomNumber: 'Phòng P0302 • Tầng 3',
    dateRange: 'Hôm nay → 20/10',
    stayDuration: '2 đêm • 1 khách',
    status: 'CONFIRMED',
    statusLabel: 'Chờ Check-in',
    statusVariant: 'sand',
    roomCharge: 3500000,
    deposit: 3500000,
    paymentNote: 'Đã thanh toán 100%',
    actionType: 'CHECKIN',
  },
];

export const ReceptionistBookingsPage = () => {
  const [searchParams] = useSearchParams();
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewBookingModalOpen, setIsNewBookingModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Checkout modal state
  const [checkoutBooking, setCheckoutBooking] = useState(null);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Đồng bộ danh sách đơn đặt phòng từ bookingFolioSync
  useEffect(() => {
    const syncCheckedIn = bookingFolioSync.getCheckedInBookings();

    const merged = INITIAL_BASE_BOOKINGS.map((base) => {
      const matchSync = syncCheckedIn.find((s) => s.id === base.id || s.code === base.code);
      if (matchSync) {
        return {
          ...base,
          ...matchSync,
          paymentNote: `Cần thanh toán: ${formatVND(matchSync.balanceDue)}`,
        };
      }
      return base;
    });

    setBookings(merged);

    // Kiểm tra URL query param: nếu được chuyển từ trang Services sang Check-out
    const focusRoom = searchParams.get('focusRoom');
    const action = searchParams.get('action');
    if (focusRoom && action === 'checkout') {
      const target = merged.find((b) => (b.roomNumber || b.roomCode || '').includes(focusRoom));
      if (target) {
        setCheckoutBooking(target);
        setIsCheckoutModalOpen(true);
        showToast(`Đã mở quyết toán Check-out cho phòng ${focusRoom} kèm toàn bộ dịch vụ phát sinh!`);
      }
    }
  }, [searchParams]);

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
      status: 'CONFIRMED',
      statusLabel: 'Chờ Check-in',
      statusVariant: 'sand',
      roomCharge: 15000000,
      deposit: 15000000,
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
            ? { ...b, status: 'CHECKED_IN', statusLabel: 'Đang ở', statusVariant: 'purple', actionType: 'CHECKOUT' }
            : b
        )
      );
      showToast(`Đã hoàn tất nhận phòng (Check-in) cho ${booking.guestName}!`);
    } else if (booking.actionType === 'CHECKOUT') {
      // Mở modal quyết toán Check-out đồng bộ dịch vụ phát sinh
      setCheckoutBooking(booking);
      setIsCheckoutModalOpen(true);
    } else if (booking.actionType === 'INVOICE') {
      showToast(`Đang xuất hóa đơn điện tử VAT cho đơn ${booking.code}...`);
    } else {
      showToast(`Mở chi tiết đơn đặt phòng ${booking.code}`);
    }
  };

  // Xác nhận Check-out và thanh toán toàn bộ chi phí
  const handleConfirmCheckout = async () => {
    if (!checkoutBooking) return;
    setIsProcessingCheckout(true);

    try {
      try {
        await bookingService.checkOut(checkoutBooking.id);
      } catch (err) {
        console.warn('API POST /api/v1/receptionist/bookings/' + checkoutBooking.id + '/check-out offline:', err);
      }

      setBookings((prev) =>
        prev.map((b) =>
          b.id === checkoutBooking.id
            ? {
                ...b,
                status: 'CHECKED_OUT',
                statusLabel: 'Đã trả phòng',
                statusVariant: 'neutral',
                actionType: 'INVOICE',
                paymentNote: 'Đã quyết toán xong (0 đ)',
                balanceDue: 0,
              }
            : b
        )
      );

      showToast(`Đã hoàn tất trả phòng (Check-out) thành công cho ${checkoutBooking.guestName}!`);
      setIsCheckoutModalOpen(false);
    } finally {
      setIsProcessingCheckout(false);
    }
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const matchTab =
        activeTab === 'ALL' ||
        (activeTab === 'CHECKIN' && (b.status === 'CONFIRMED' || b.status === 'PENDING')) ||
        (activeTab === 'CHECKOUT' && b.status === 'CHECKED_IN') ||
        (activeTab === 'STAYING' && b.status === 'CHECKED_IN');

      const matchSearch =
        (b.code || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.guestName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.roomNumber || '').toLowerCase().includes(searchTerm.toLowerCase());

      return matchTab && matchSearch;
    });
  }, [bookings, activeTab, searchTerm]);

  return (
    <div className="p-6 sm:p-8 space-y-6 pb-12 max-w-[1550px] mx-auto select-none">
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
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-stone-900 leading-tight">
            Đơn đặt phòng & Quyết toán Check-out
          </h1>
          <p className="text-xs text-stone-500 mt-1 max-w-2xl">
            Quản lý lịch lưu trú, đón tiếp khách và quyết toán hóa đơn tích hợp dịch vụ phát sinh khi trả phòng.
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

      {/* 2. 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-2xs">
          <span className="text-[10px] font-bold tracking-wider uppercase text-stone-400 block mb-1">
            ĐẾN HÔM NAY (CHECK-IN)
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold text-stone-900 leading-none">
              01
            </span>
            <span className="text-xs text-stone-500 font-medium">chờ nhận phòng</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-2xs">
          <span className="text-[10px] font-bold tracking-wider uppercase text-purple-700 block mb-1">
            ĐANG Ở (CHECKED_IN)
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold text-stone-900 leading-none">
              04
            </span>
            <span className="text-xs text-purple-700 font-medium">đang lưu trú</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-2xs">
          <span className="text-[10px] font-bold tracking-wider uppercase text-amber-800 block mb-1">
            CHỜ CHECK-OUT
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold text-stone-900 leading-none">
              04
            </span>
            <span className="text-xs text-amber-800 font-medium">cần quyết toán Folio</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-2xs">
          <span className="text-[10px] font-bold tracking-wider uppercase text-stone-400 block mb-1">
            ĐÃ HOÀN TẤT
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold text-stone-900 leading-none">
              01
            </span>
            <span className="text-xs text-emerald-700 font-medium">đã trả phòng</span>
          </div>
        </div>
      </div>

      {/* 3. Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'ALL', label: `Tất cả (${bookings.length})` },
            { id: 'CHECKIN', label: 'Chờ Check-in' },
            { id: 'STAYING', label: 'Đang ở (CHECKED_IN)' },
            { id: 'CHECKOUT', label: 'Chờ Check-out' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-black text-white shadow-xs'
                  : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200/90 hover:bg-stone-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-80">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Tìm mã đơn, tên khách, số phòng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-full bg-white border border-stone-200/90 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-900 shadow-2xs"
          />
        </div>
      </div>

      {/* 4. Bookings Data Table */}
      <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50/50 text-stone-400 font-semibold uppercase tracking-wider text-[10px]">
                <th className="py-4 px-6">Mã đơn & Nguồn</th>
                <th className="py-4 px-6">Khách hàng</th>
                <th className="py-4 px-6">Hạng phòng & Số phòng</th>
                <th className="py-4 px-6">Thời gian lưu trú</th>
                <th className="py-4 px-6">Trạng thái</th>
                <th className="py-4 px-6">Thanh toán & Phí phát sinh</th>
                <th className="py-4 px-6 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredBookings.map((b) => (
                <tr key={b.id} className="hover:bg-stone-50/70 transition-colors">
                  <td className="py-4 px-6">
                    <span className="font-mono font-bold text-stone-900 block text-xs">
                      {b.code}
                    </span>
                    <span className="text-stone-400 text-[11px] block mt-0.5">
                      {b.source}
                    </span>
                  </td>

                  <td className="py-4 px-6">
                    <span className="font-serif font-bold text-stone-900 text-sm block">
                      {b.guestName}
                    </span>
                    <span className="text-[11px] text-amber-700 font-medium">
                      {b.guestTier}
                    </span>
                  </td>

                  <td className="py-4 px-6">
                    <span className="font-semibold text-stone-800 block">
                      {b.roomCategory}
                    </span>
                    <span className="text-[11px] text-stone-400 block mt-0.5">
                      {b.roomNumber}
                    </span>
                  </td>

                  <td className="py-4 px-6">
                    <span className="font-mono text-stone-800 block">
                      {b.dateRange}
                    </span>
                    <span className="text-[11px] text-stone-400 block mt-0.5">
                      {b.stayDuration}
                    </span>
                  </td>

                  <td className="py-4 px-6">
                    {b.status === 'CHECKED_IN' ? (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse"></span>
                        <span>Đang ở (CHECKED_IN)</span>
                      </span>
                    ) : b.status === 'CHECKED_OUT' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full bg-stone-100 text-stone-600">
                        <span>Đã trả phòng</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                        <span>Chờ nhận phòng</span>
                      </span>
                    )}
                  </td>

                  {/* Thanh toán & Dịch vụ phát sinh */}
                  <td className="py-4 px-6">
                    <span className="font-bold text-stone-900 block">
                      {b.paymentNote}
                    </span>
                    {b.serviceFee > 0 && (
                      <span className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60 inline-flex items-center gap-1 mt-1">
                        <Sparkles size={10} />
                        <span>Dịch vụ: +{formatVND(b.serviceFee)}</span>
                      </span>
                    )}
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
                    ) : b.status === 'CHECKED_IN' ? (
                      <button
                        type="button"
                        onClick={() => handleAction(b)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                      >
                        <Receipt size={13} />
                        <span>Trả phòng & Quyết toán</span>
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
      </div>

      {/* 5. CHECKOUT INVOICE MODAL (Quyết toán trả phòng đồng bộ toàn bộ dịch vụ phát sinh) */}
      {isCheckoutModalOpen && checkoutBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 select-none">
          <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/60">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-purple-700 tracking-wider uppercase block">
                  QUYẾT TOÁN TRẢ PHÒNG (CHECK-OUT FOLIO)
                </span>
                <h3 className="font-serif text-xl font-bold text-stone-900">
                  {checkoutBooking.roomNumber || checkoutBooking.roomCategory}
                </h3>
                <p className="text-xs text-stone-500">
                  Khách hàng: <strong>{checkoutBooking.guestName}</strong> ({checkoutBooking.guestTier})
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsCheckoutModalOpen(false)}
                className="p-2 rounded-full hover:bg-stone-200 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-stone-600">Thời gian lưu trú:</span>
                  <span className="font-semibold text-stone-900">{checkoutBooking.dateRange} ({checkoutBooking.stayDuration})</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-600">Tiền phòng lưu trú:</span>
                  <span className="font-serif font-bold text-stone-900">{formatVND(checkoutBooking.roomCharge)}</span>
                </div>
              </div>

              {/* Chi tiết dịch vụ phát sinh đã nạp từ Phase 2 */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-900 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-amber-600" />
                    <span>Dịch vụ phát sinh đã nạp (Đồng bộ thời gian thực):</span>
                  </span>
                  <span className="font-serif font-bold text-amber-900">
                    {formatVND(checkoutBooking.serviceFee || 0)}
                  </span>
                </div>

                <div className="bg-[#FAF5EE] rounded-2xl p-3.5 border border-amber-200/70 max-h-40 overflow-y-auto space-y-2">
                  {checkoutBooking.services && checkoutBooking.services.length > 0 ? (
                    checkoutBooking.services.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between py-1 border-b border-amber-200/50 last:border-0 text-xs">
                        <div>
                          <span className="font-semibold text-amber-950 block">{item.serviceName}</span>
                          <span className="text-[10px] text-amber-800/80">
                            {formatVND(item.unitPrice)} × {item.quantity} {item.unit}
                          </span>
                        </div>
                        <span className="font-serif font-bold text-amber-950">
                          {formatVND(item.totalAmount)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-stone-400 italic text-center py-2">
                      Không có dịch vụ phát sinh trong đợt lưu trú.
                    </p>
                  )}
                </div>
              </div>

              {/* Thuế VAT & Tiền cọc */}
              <div className="space-y-2 pt-2 border-t border-stone-200">
                <div className="flex items-center justify-between text-stone-600">
                  <span>Thuế GTGT VAT (8%):</span>
                  <span>{formatVND(checkoutBooking.vatTax || Math.round((checkoutBooking.roomCharge + (checkoutBooking.serviceFee || 0)) * 0.08))}</span>
                </div>
                <div className="flex items-center justify-between text-stone-600">
                  <span>Tổng hóa đơn tạm tính:</span>
                  <span className="font-serif font-bold text-stone-900">
                    {formatVND(checkoutBooking.grandTotal || (checkoutBooking.roomCharge + (checkoutBooking.serviceFee || 0)))}
                  </span>
                </div>
                <div className="flex items-center justify-between text-emerald-700 font-semibold">
                  <span>Đã thanh toán / Tiền đặt cọc:</span>
                  <span>-{formatVND(checkoutBooking.deposit || 0)}</span>
                </div>
              </div>

              {/* Tổng tiền cần thanh toán quyết toán khi Check-out (AC) */}
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-baseline justify-between">
                <div>
                  <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">
                    SỐ TIỀN CẦN THANH TOÁN QUYẾT TOÁN
                  </span>
                  <span className="text-[11px] text-rose-600 font-medium">
                    (Tiền phòng + Phí dịch vụ phát sinh - Đặt cọc)
                  </span>
                </div>
                <span className="font-serif text-2xl font-bold text-rose-700">
                  {formatVND(checkoutBooking.balanceDue || 0)}
                </span>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-stone-100 flex items-center justify-end gap-3 bg-stone-50/60">
              <button
                type="button"
                onClick={() => setIsCheckoutModalOpen(false)}
                className="px-4 py-2 rounded-full border border-stone-200 text-stone-600 hover:bg-stone-100 text-xs font-semibold cursor-pointer"
              >
                Đóng
              </button>

              <button
                type="button"
                disabled={isProcessingCheckout}
                onClick={handleConfirmCheckout}
                className="px-6 py-2.5 rounded-full bg-black hover:bg-stone-800 text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 size={15} />
                <span>{isProcessingCheckout ? 'Đang quyết toán...' : 'Xác nhận thanh toán & Trả phòng'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

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
