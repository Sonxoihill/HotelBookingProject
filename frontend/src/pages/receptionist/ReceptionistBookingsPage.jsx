import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  QrCode,
  CheckCircle2,
  ChevronRight,
  Receipt,
  X,
  Sparkles,
  Coins,
  Check,
  XCircle,
  AlertCircle,
  Printer,
  Calendar,
  BedDouble,
  User,
  CreditCard,
  Building,
} from 'lucide-react';
import { formatVND, formatDate } from '../../utils/formatters';
import bookingService from '../../services/bookingService';
import NewBookingModal from '../../components/receptionist/NewBookingModal';

// Chuẩn hóa dữ liệu booking từ Backend API
const mapBooking = (b) => {
  const isCheckedIn = b.status === 'CHECKED_IN';
  const isConfirmed = b.status === 'CONFIRMED';
  const isPending = b.status === 'PENDING';
  const isCheckedOut = b.status === 'CHECKED_OUT';
  const isCancelled = b.status === 'CANCELLED';

  return {
    id: b.id,
    code: b.code || `#BK-${b.id}`,
    roomId: b.roomId || b.room?.id,
    roomNumber: b.roomNumber || b.roomCode || (b.roomId ? `Phòng ${b.roomId}` : '---'),
    roomCategory: b.roomCategory || b.room?.category?.name || 'Phòng nghỉ cao cấp',
    guestName: b.guestName || 'Khách lưu trú',
    guestPhone: b.guestPhone || '',
    guestEmail: b.guestEmail || '',
    guestTier: b.guestTier || 'VIP Member',
    dateRange: `${b.checkIn || '---'} → ${b.checkOut || '---'}`,
    checkIn: b.checkIn,
    checkOut: b.checkOut,
    stayDuration: b.numberOfNights ? `${b.numberOfNights} đêm` : 'Lưu trú',
    status: b.status,
    totalAmount: Number(b.totalAmount) || 0,
    paidAmount: Number(b.paidAmount) || 0,
    balanceDue: Number(b.remainingAmount) != null ? Number(b.remainingAmount) : Math.max(0, (Number(b.totalAmount) || 0) - (Number(b.paidAmount) || 0)),
    cancelReason: b.cancelReason || b.cancellationReason || '',
    serviceFee: Number(b.serviceFee) || Number(b.totalServiceAmount) || 0,
    services: Array.isArray(b.services) ? b.services : [],
    notes: b.notes || b.specialRequests || '',
  };
};

export const ReceptionistBookingsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Bộ lọc trạng thái theo đúng yêu cầu: PENDING, CONFIRMED, CHECKED_IN, CHECKED_OUT, CANCELLED
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewBookingModalOpen, setIsNewBookingModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // 1. Checkout modal state
  const [checkoutBooking, setCheckoutBooking] = useState(null);
  const [checkoutSummary, setCheckoutSummary] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [checkoutNotes, setCheckoutNotes] = useState('');
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);

  // Hóa đơn thanh toán sau Check-out thành công (Receipt view)
  const [receiptData, setReceiptData] = useState(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // 2. Cancel modal state (Lễ tân bắt buộc nhập cancelReason)
  const [cancelTargetBooking, setCancelTargetBooking] = useState(null);
  const [cancelReasonInput, setCancelReasonInput] = useState('');
  const [cancelError, setCancelError] = useState('');
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isProcessingCancel, setIsProcessingCancel] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Tải danh sách đơn đặt phòng từ Backend API (GET /api/v1/receptionist/bookings)
  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = { page: 0, size: 50 };
      if (activeTab !== 'ALL') {
        params.status = activeTab;
      }
      if (searchTerm.trim()) {
        params.keyword = searchTerm.trim();
      }

      const res = await bookingService.getAllBookings(params);
      const pageData = res?.data || res;
      const list = pageData?.items || pageData?.content || (Array.isArray(pageData) ? pageData : []);
      const mapped = list.map(mapBooking);
      setBookings(mapped);

      // Kiểm tra URL query param: nếu được chuyển từ trang Services sang Check-out
      const focusRoom = searchParams.get('focusRoom');
      const action = searchParams.get('action');
      if (focusRoom && action === 'checkout') {
        const target = mapped.find((b) => (b.roomNumber || '').includes(focusRoom));
        if (target) {
          handleOpenCheckout(target);
          showToast(`Đã mở quyết toán Check-out cho phòng ${focusRoom} kèm toàn bộ dịch vụ phát sinh!`);
        }
      }
    } catch (err) {
      console.error('Lỗi khi tải đơn đặt phòng từ API:', err);
      showToast('Lỗi khi tải đơn đặt phòng từ API');
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, searchTerm, searchParams]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Lắng nghe sự kiện đồng bộ từ trang Dịch vụ
  useEffect(() => {
    const handleFolioUpdate = () => {
      fetchBookings();
    };
    window.addEventListener('hotel_folio_updated', handleFolioUpdate);
    return () => {
      window.removeEventListener('hotel_folio_updated', handleFolioUpdate);
    };
  }, [fetchBookings]);

  // 1. Thao tác Duyệt đơn (PENDING -> CONFIRMED, gọi PATCH /api/v1/receptionist/bookings/{id}/approve)
  const handleApprove = async (booking) => {
    try {
      await bookingService.approveBooking(booking.id);
      showToast(`Đã duyệt đơn #${booking.id} thành công! Phòng đã được giữ chỗ.`);
      await fetchBookings();
    } catch (err) {
      console.error('Lỗi khi duyệt đơn:', err);
      showToast(err?.response?.data?.message || err?.message || 'Lỗi khi duyệt đơn đặt phòng');
    }
  };

  // 2. Thao tác Check-in (CONFIRMED -> CHECKED_IN, gọi PATCH /api/v1/receptionist/bookings/{id}/check-in)
  const handleCheckIn = async (booking) => {
    try {
      await bookingService.checkIn(booking.id);
      showToast(`Check-in thành công cho khách ${booking.guestName} vào ${booking.roomNumber}!`);
      await fetchBookings();
    } catch (err) {
      console.error('Lỗi khi Check-in:', err);
      showToast(err?.response?.data?.message || err?.message || 'Lỗi khi thực hiện Check-in');
    }
  };

  // 3. Mở Modal Hủy đơn cho Lễ tân (PENDING & CONFIRMED)
  const openCancelModal = (booking) => {
    setCancelTargetBooking(booking);
    setCancelReasonInput('');
    setCancelError('');
    setIsCancelModalOpen(true);
  };

  // Xác nhận Hủy đơn (gọi PATCH /api/v1/receptionist/bookings/{id}/cancel với cancelReason)
  const handleConfirmCancel = async (e) => {
    e.preventDefault();
    if (!cancelReasonInput.trim()) {
      setCancelError('Vui lòng nhập lý do hủy đơn đặt phòng (bắt buộc)!');
      return;
    }

    if (!cancelTargetBooking) return;
    setIsProcessingCancel(true);
    setCancelError('');

    try {
      await bookingService.cancelReceptionistBooking(cancelTargetBooking.id, cancelReasonInput.trim());
      showToast(`Đã hủy đơn đặt phòng #${cancelTargetBooking.id} thành công! Phòng đã được giải phóng.`);
      setIsCancelModalOpen(false);
      setCancelTargetBooking(null);
      await fetchBookings();
    } catch (err) {
      console.error('Lỗi khi hủy đơn:', err);
      setCancelError(err?.response?.data?.message || err?.message || 'Có lỗi xảy ra khi hủy đơn đặt phòng.');
    } finally {
      setIsProcessingCancel(false);
    }
  };

  // 4. Mở modal quyết toán Check-out và lấy tóm tắt từ backend (GET /api/v1/receptionist/bookings/{id}/checkout-summary)
  const handleOpenCheckout = async (booking) => {
    setCheckoutBooking(booking);
    setCheckoutSummary(null);
    setPaymentMethod('CASH');
    setCheckoutNotes('');
    setIsCheckoutModalOpen(true);

    try {
      const res = await bookingService.getCheckoutSummary(booking.id);
      const data = res?.data || res;
      if (data && (data.bookingId || data.services)) {
        setCheckoutSummary(data);
      }
    } catch (err) {
      console.error('Lỗi khi tải tóm tắt hóa đơn checkout:', err);
      showToast('Không thể tải chi tiết hóa đơn check-out từ máy chủ.');
    }
  };

  // Xác nhận Check-out: gọi POST /api/v1/receptionist/bookings/{id}/check-out
  const handleConfirmCheckout = async () => {
    if (!checkoutBooking) return;
    setIsProcessingCheckout(true);

    try {
      const payload = {
        paymentMethod,
        notes: checkoutNotes.trim() || undefined,
      };

      const res = await bookingService.checkOut(checkoutBooking.id, payload);
      const updated = res?.data || res;

      // Lưu dữ liệu để hiển thị Hóa đơn thanh toán hoàn chỉnh
      const finalReceipt = {
        bookingId: checkoutBooking.id,
        code: checkoutBooking.code,
        roomNumber: checkoutSummary?.roomNumber || checkoutBooking.roomNumber,
        roomCategory: checkoutSummary?.roomCategory || checkoutBooking.roomCategory,
        guestName: checkoutSummary?.guestName || checkoutBooking.guestName,
        guestPhone: checkoutSummary?.guestPhone || checkoutBooking.guestPhone,
        checkIn: checkoutSummary?.checkIn || checkoutBooking.checkIn,
        checkOut: checkoutSummary?.checkOut || checkoutBooking.checkOut,
        numberOfNights: checkoutSummary?.numberOfNights || 1,
        roomAmount: checkoutSummary?.roomAmount != null ? Number(checkoutSummary.roomAmount) : checkoutBooking.roomCharge,
        totalServiceAmount: checkoutSummary?.totalServiceAmount != null ? Number(checkoutSummary.totalServiceAmount) : (checkoutBooking.serviceFee || 0),
        services: checkoutSummary?.services || checkoutBooking.services || [],
        paidDeposit: checkoutSummary?.paidAmount != null ? Number(checkoutSummary.paidAmount) : checkoutBooking.paidAmount,
        settledAmount: checkoutSummary?.remainingAmount != null ? Number(checkoutSummary.remainingAmount) : checkoutBooking.balanceDue,
        totalAmount: checkoutSummary?.totalAmount != null ? Number(checkoutSummary.totalAmount) : (checkoutBooking.roomCharge + checkoutBooking.serviceFee),
        paymentMethod,
        checkoutTime: new Date().toLocaleString('vi-VN'),
      };

      setReceiptData(finalReceipt);
      setIsCheckoutModalOpen(false);
      setIsReceiptModalOpen(true);

      showToast(`Đã hoàn tất trả phòng (Check-out) thành công cho phòng ${checkoutBooking.roomNumber}!`);

      // Bắn sự kiện thời gian thực để RoomMatrixPage.jsx đổi trạng thái phòng sang DIRTY (Cần dọn)
      window.dispatchEvent(
        new CustomEvent('hotel_checkout_completed', {
          detail: {
            bookingId: checkoutBooking.id,
            roomId: checkoutBooking.roomId,
          },
        })
      );

      // Cập nhật lại danh sách đơn
      await fetchBookings();
    } catch (err) {
      console.error('Lỗi khi Check-out:', err);
      showToast(err?.response?.data?.message || err?.message || 'Lỗi khi thực hiện Check-out');
    } finally {
      setIsProcessingCheckout(false);
    }
  };

  // Mở xem Hóa đơn thanh toán cho đơn CHECKED_OUT
  const handleViewInvoice = async (booking) => {
    try {
      const res = await bookingService.getCheckoutSummary(booking.id);
      const data = res?.data || res;
      setReceiptData({
        bookingId: booking.id,
        code: booking.code,
        roomNumber: data?.roomNumber || booking.roomNumber,
        roomCategory: data?.roomCategory || booking.roomCategory,
        guestName: data?.guestName || booking.guestName,
        guestPhone: data?.guestPhone || booking.guestPhone,
        checkIn: data?.checkIn || booking.checkIn,
        checkOut: data?.checkOut || booking.checkOut,
        numberOfNights: data?.numberOfNights || 1,
        roomAmount: data?.roomAmount != null ? Number(data.roomAmount) : booking.roomCharge,
        totalServiceAmount: data?.totalServiceAmount != null ? Number(data.totalServiceAmount) : booking.serviceFee,
        services: data?.services || booking.services || [],
        paidDeposit: data?.paidAmount != null ? Number(data.paidAmount) : booking.paidAmount,
        settledAmount: 0,
        totalAmount: data?.totalAmount != null ? Number(data.totalAmount) : booking.totalAmount,
        paymentMethod: 'ĐÃ QUYẾT TOÁN',
        checkoutTime: formatDate(new Date()),
      });
      setIsReceiptModalOpen(true);
    } catch {
      showToast('Đang tải hóa đơn thanh toán...');
    }
  };

  // Lọc danh sách hiển thị
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const matchTab = activeTab === 'ALL' || b.status === activeTab;
      const term = searchTerm.toLowerCase().trim();
      const matchSearch =
        !term ||
        (b.code || '').toLowerCase().includes(term) ||
        (b.guestName || '').toLowerCase().includes(term) ||
        (b.guestPhone || '').toLowerCase().includes(term) ||
        (b.roomNumber || '').toLowerCase().includes(term);

      return matchTab && matchSearch;
    });
  }, [bookings, activeTab, searchTerm]);

  // Thống kê động theo Enum BookingStatus
  const stats = useMemo(() => {
    return {
      pending: bookings.filter((b) => b.status === 'PENDING').length,
      confirmed: bookings.filter((b) => b.status === 'CONFIRMED').length,
      staying: bookings.filter((b) => b.status === 'CHECKED_IN').length,
      completed: bookings.filter((b) => b.status === 'CHECKED_OUT').length,
      cancelled: bookings.filter((b) => b.status === 'CANCELLED').length,
      total: bookings.length,
    };
  }, [bookings]);

  // Bộ lọc trạng thái chuẩn
  const STATUS_TABS = [
    { id: 'ALL', label: 'Tất cả', count: stats.total },
    { id: 'PENDING', label: 'Chờ duyệt', count: stats.pending, color: 'text-amber-700' },
    { id: 'CONFIRMED', label: 'Đã duyệt', count: stats.confirmed, color: 'text-blue-700' },
    { id: 'CHECKED_IN', label: 'Đang ở (CHECKED_IN)', count: stats.staying, color: 'text-purple-700' },
    { id: 'CHECKED_OUT', label: 'Đã hoàn thành', count: stats.completed, color: 'text-emerald-700' },
    { id: 'CANCELLED', label: 'Đã hủy', count: stats.cancelled, color: 'text-rose-700' },
  ];

  return (
    <div className="p-6 sm:p-8 space-y-6 pb-12 max-w-[1550px] mx-auto select-none">
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
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-stone-900 leading-tight">
            Quản lý Đơn đặt phòng & Quyết toán Check-out
          </h1>
          <p className="text-xs text-stone-500 mt-1 max-w-2xl">
            Kết nối API Receptionist: Duyệt đơn, Check-in, Check-out nạp Folio và cập nhật buồng phòng DIRTY theo thời gian thực.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => navigate('/receptionist/services')}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Coins size={14} />
            <span>Dịch vụ & Minibar</span>
          </button>

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

      {/* 2. Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Chờ duyệt */}
        <div
          onClick={() => setActiveTab('PENDING')}
          className={`bg-white rounded-2xl p-5 border transition-all cursor-pointer shadow-2xs ${
            activeTab === 'PENDING' ? 'border-amber-500 ring-2 ring-amber-500/10' : 'border-stone-200/90 hover:border-amber-300'
          }`}
        >
          <span className="text-[10px] font-bold tracking-wider uppercase text-amber-700 block mb-1">
            CHỜ DUYỆT (PENDING)
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold text-amber-900 leading-none">
              {stats.pending < 10 ? `0${stats.pending}` : stats.pending}
            </span>
            <span className="text-xs text-amber-700 font-medium">cần phê duyệt</span>
          </div>
        </div>

        {/* Card 2: Đã duyệt / Chờ Check-in */}
        <div
          onClick={() => setActiveTab('CONFIRMED')}
          className={`bg-white rounded-2xl p-5 border transition-all cursor-pointer shadow-2xs ${
            activeTab === 'CONFIRMED' ? 'border-blue-500 ring-2 ring-blue-500/10' : 'border-stone-200/90 hover:border-blue-300'
          }`}
        >
          <span className="text-[10px] font-bold tracking-wider uppercase text-blue-700 block mb-1">
            ĐÃ DUYỆT (CHỜ CHECK-IN)
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold text-blue-900 leading-none">
              {stats.confirmed < 10 ? `0${stats.confirmed}` : stats.confirmed}
            </span>
            <span className="text-xs text-blue-700 font-medium">chờ nhận phòng</span>
          </div>
        </div>

        {/* Card 3: Đang ở (CHECKED_IN) */}
        <div
          onClick={() => setActiveTab('CHECKED_IN')}
          className={`bg-white rounded-2xl p-5 border transition-all cursor-pointer shadow-2xs ${
            activeTab === 'CHECKED_IN' ? 'border-purple-500 ring-2 ring-purple-500/10' : 'border-stone-200/90 hover:border-purple-300'
          }`}
        >
          <span className="text-[10px] font-bold tracking-wider uppercase text-purple-700 block mb-1">
            ĐANG Ở (CHECKED_IN)
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold text-purple-900 leading-none">
              {stats.staying < 10 ? `0${stats.staying}` : stats.staying}
            </span>
            <span className="text-xs text-purple-700 font-medium">đang lưu trú & nạp dịch vụ</span>
          </div>
        </div>

        {/* Card 4: Đã hoàn tất trả phòng */}
        <div
          onClick={() => setActiveTab('CHECKED_OUT')}
          className={`bg-white rounded-2xl p-5 border transition-all cursor-pointer shadow-2xs ${
            activeTab === 'CHECKED_OUT' ? 'border-emerald-500 ring-2 ring-emerald-500/10' : 'border-stone-200/90 hover:border-emerald-300'
          }`}
        >
          <span className="text-[10px] font-bold tracking-wider uppercase text-emerald-700 block mb-1">
            ĐÃ HOÀN THÀNH (CHECKED_OUT)
          </span>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold text-emerald-900 leading-none">
              {stats.completed < 10 ? `0${stats.completed}` : stats.completed}
            </span>
            <span className="text-xs text-emerald-700 font-medium">đã quyết toán Folio</span>
          </div>
        </div>
      </div>

      {/* 3. Filter Tabs (PENDING, CONFIRMED, CHECKED_IN, CHECKED_OUT, CANCELLED) & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex flex-wrap items-center gap-2">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'bg-black text-white shadow-xs'
                  : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200/90 hover:bg-stone-50'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  activeTab === tab.id ? 'bg-stone-800 text-stone-200' : 'bg-stone-100 text-stone-500'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-80">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Tìm mã đơn, tên khách, SĐT, số phòng..."
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
              <tr className="border-b border-stone-100 text-stone-400 font-semibold uppercase tracking-wider text-[10px] bg-stone-50/50">
                <th className="py-3.5 px-6">Mã đơn & Nguồn</th>
                <th className="py-3.5 px-6">Khách hàng</th>
                <th className="py-3.5 px-6">Phòng & Hạng</th>
                <th className="py-3.5 px-6">Lưu trú</th>
                <th className="py-3.5 px-6">Trạng thái (Enum)</th>
                <th className="py-3.5 px-6">Thanh toán & Dịch vụ</th>
                <th className="py-3.5 px-6 text-right">Thao tác</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-stone-100">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-400">
                    <p className="font-serif text-base font-bold text-stone-700">
                      Không tìm thấy đơn đặt phòng nào
                    </p>
                    <p className="text-xs text-stone-400 mt-1">
                      Thử thay đổi bộ lọc trạng thái hoặc từ khóa tìm kiếm.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-stone-50/60 transition-colors">
                    {/* Mã đơn */}
                    <td className="py-4 px-6">
                      <span className="font-mono font-bold text-stone-900 block">
                        #{b.id}
                      </span>
                      <span className="text-[10px] text-stone-400 block mt-0.5">
                        {b.code}
                      </span>
                    </td>

                    {/* Khách hàng */}
                    <td className="py-4 px-6">
                      <span className="font-semibold text-stone-900 block">
                        {b.guestName}
                      </span>
                      <span className="text-[11px] text-stone-500 block mt-0.5">
                        {b.guestPhone || b.guestEmail || b.guestTier}
                      </span>
                    </td>

                    {/* Phòng & Hạng */}
                    <td className="py-4 px-6">
                      <span className="font-semibold text-stone-800 block">
                        {b.roomNumber}
                      </span>
                      <span className="text-[11px] text-stone-400 block mt-0.5">
                        {b.roomCategory}
                      </span>
                    </td>

                    {/* Lưu trú */}
                    <td className="py-4 px-6">
                      <span className="font-mono text-stone-800 block">
                        {b.dateRange}
                      </span>
                      <span className="text-[11px] text-stone-400 block mt-0.5">
                        {b.stayDuration}
                      </span>
                    </td>

                    {/* Trạng thái chuẩn Enum BookingStatus */}
                    <td className="py-4 px-6">
                      {b.status === 'PENDING' ? (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                          <span>Chờ duyệt</span>
                        </span>
                      ) : b.status === 'CONFIRMED' ? (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                          <span>Đã duyệt</span>
                        </span>
                      ) : b.status === 'CHECKED_IN' ? (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-600 animate-pulse"></span>
                          <span>Đang ở (CHECKED_IN)</span>
                        </span>
                      ) : b.status === 'CHECKED_OUT' ? (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <Check size={12} strokeWidth={2.5} className="text-emerald-600" />
                          <span>Đã hoàn thành</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                          <XCircle size={12} />
                          <span>Đã hủy</span>
                        </span>
                      )}
                    </td>

                    {/* Thanh toán & Dịch vụ phát sinh */}
                    <td className="py-4 px-6">
                      <span className="font-bold text-stone-900 block">
                        {formatVND(b.totalAmount)}
                      </span>
                      {b.serviceFee > 0 ? (
                        <span className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60 inline-flex items-center gap-1 mt-1 font-medium">
                          <Sparkles size={10} />
                          <span>Dịch vụ: +{formatVND(b.serviceFee)}</span>
                        </span>
                      ) : (
                        <span className="text-[10px] text-stone-400 block mt-0.5">
                          Đã cọc: {formatVND(b.paidAmount)}
                        </span>
                      )}
                    </td>

                    {/* Thao tác theo đúng Enum BookingStatus */}
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      {/* 1. PENDING: Nút "Duyệt" (gọi approve) & "Hủy" (mở Modal nhập cancelReason) */}
                      {b.status === 'PENDING' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleApprove(b)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                            title="Duyệt đơn đặt phòng (PATCH /approve)"
                          >
                            <Check size={13} />
                            <span>Duyệt</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => openCancelModal(b)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition-colors cursor-pointer"
                            title="Hủy đơn đặt phòng (PATCH /cancel)"
                          >
                            <X size={13} />
                            <span>Hủy</span>
                          </button>
                        </div>
                      ) : b.status === 'CONFIRMED' ? (
                        /* 2. CONFIRMED: Nút "Check-in" (gọi check-in) & "Hủy" */
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleCheckIn(b)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-black hover:bg-stone-800 text-white text-xs font-bold transition-colors cursor-pointer shadow-2xs"
                            title="Làm thủ tục nhận phòng (PATCH /check-in)"
                          >
                            <span>Check-in</span>
                            <ChevronRight size={13} />
                          </button>
                          <button
                            type="button"
                            onClick={() => openCancelModal(b)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition-colors cursor-pointer"
                            title="Hủy đơn đặt phòng"
                          >
                            <X size={13} />
                            <span>Hủy</span>
                          </button>
                        </div>
                      ) : b.status === 'CHECKED_IN' ? (
                        /* 3. CHECKED_IN: Nút "Thêm dịch vụ" & "Check-out" */
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => navigate('/receptionist/services')}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold transition-colors cursor-pointer"
                            title="Chuyển đến trang Dịch vụ & Minibar"
                          >
                            <Coins size={13} />
                            <span>Thêm dịch vụ</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenCheckout(b)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-stone-900 hover:bg-black text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
                            title="Quyết toán Check-out & Folio"
                          >
                            <Receipt size={13} />
                            <span>Check-out</span>
                          </button>
                        </div>
                      ) : b.status === 'CHECKED_OUT' ? (
                        /* 4. CHECKED_OUT: Nút xem lại "Hóa đơn thanh toán" */
                        <button
                          type="button"
                          onClick={() => handleViewInvoice(b)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
                        >
                          <Receipt size={13} />
                          <span>Hóa đơn</span>
                        </button>
                      ) : (
                        /* 5. CANCELLED: Hiển thị lý do hủy */
                        <span className="text-[11px] text-stone-400 italic">
                          {b.cancelReason ? `Lý do: ${b.cancelReason}` : 'Đã hủy'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. MODAL THANH TOÁN CHECK-OUT (Hoàn thiện theo Ảnh 1) */}
      {isCheckoutModalOpen && checkoutBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 select-none">
          <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-xl w-full max-h-[92vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold text-purple-700 tracking-wider uppercase block">
                  QUYẾT TOÁN TRẢ PHÒNG (CHECK-OUT FOLIO)
                </span>
                <h3 className="font-serif text-xl font-bold text-stone-900">
                  {checkoutSummary?.roomNumber || checkoutBooking.roomNumber} • {checkoutSummary?.roomCategory || checkoutBooking.roomCategory}
                </h3>
                <p className="text-xs text-stone-500">
                  Khách hàng: <strong className="text-stone-900">{checkoutSummary?.guestName || checkoutBooking.guestName}</strong> ({checkoutBooking.guestTier}) • SĐT: {checkoutSummary?.guestPhone || checkoutBooking.guestPhone || '---'}
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
              {/* Thông tin lưu trú & Tiền phòng */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-stone-600">Thời gian lưu trú:</span>
                  <span className="font-semibold text-stone-900">
                    {checkoutSummary?.checkIn || checkoutBooking.checkIn} đến {checkoutSummary?.checkOut || checkoutBooking.checkOut} ({checkoutSummary?.numberOfNights || 1} đêm)
                  </span>
                </div>
                <div className="flex items-center justify-between border-t border-stone-200/60 pt-2">
                  <span className="text-stone-700 font-semibold">1. Tiền phòng lưu trú:</span>
                  <span className="font-serif font-bold text-stone-900 text-sm">
                    {formatVND(checkoutSummary?.roomAmount != null ? checkoutSummary.roomAmount : checkoutBooking.roomCharge)}
                  </span>
                </div>
              </div>

              {/* Phí dịch vụ phát sinh */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-stone-900 flex items-center gap-1.5">
                    <Sparkles size={14} className="text-amber-600" />
                    <span>2. Phí dịch vụ phát sinh (UC11):</span>
                  </span>
                  <span className="font-serif font-bold text-amber-900 text-sm">
                    {formatVND(checkoutSummary?.totalServiceAmount != null ? checkoutSummary.totalServiceAmount : (checkoutBooking.serviceFee || 0))}
                  </span>
                </div>

                <div className="bg-[#FAF5EE] rounded-2xl p-3.5 border border-amber-200/70 max-h-40 overflow-y-auto space-y-2">
                  {checkoutSummary?.services && checkoutSummary.services.length > 0 ? (
                    checkoutSummary.services.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between py-1 border-b border-amber-200/50 last:border-0 text-xs">
                        <div>
                          <span className="font-semibold text-amber-950 block">{item.serviceName}</span>
                          <span className="text-[10px] text-amber-800/80">
                            {formatVND(item.unitPrice)} × {item.quantity} {item.unit || 'Lần'}
                          </span>
                        </div>
                        <span className="font-serif font-bold text-amber-950">
                          {formatVND(item.totalPrice != null ? item.totalPrice : (item.unitPrice * item.quantity))}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-stone-400 italic text-center py-2">
                      Không có dịch vụ phát sinh trong kỳ nghỉ này.
                    </p>
                  )}
                </div>
              </div>

              {/* Tiền đã cọc / thanh toán trước */}
              <div className="space-y-2 pt-2 border-t border-stone-200">
                <div className="flex items-center justify-between text-stone-600">
                  <span>Tổng chi phí (Phòng + Dịch vụ):</span>
                  <span className="font-serif font-bold text-stone-900">
                    {formatVND(
                      checkoutSummary?.totalAmount != null
                        ? checkoutSummary.totalAmount
                        : ((checkoutSummary?.roomAmount || checkoutBooking.roomCharge || 0) + (checkoutSummary?.totalServiceAmount || checkoutBooking.serviceFee || 0))
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between text-emerald-700 font-semibold">
                  <span>3. Tiền đã cọc / thanh toán trước (paidAmount):</span>
                  <span>-{formatVND(checkoutSummary?.paidAmount != null ? checkoutSummary.paidAmount : checkoutBooking.paidAmount)}</span>
                </div>
              </div>

              {/* Tổng tiền cần thanh toán */}
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-baseline justify-between shadow-2xs">
                <div>
                  <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block">
                    4. TỔNG TIỀN CẦN THANH TOÁN (QUYẾT TOÁN)
                  </span>
                  <span className="text-[11px] text-rose-600 font-medium">
                    (Tiền phòng + Dịch vụ phát sinh - Tiền đã cọc)
                  </span>
                </div>
                <span className="font-serif text-2xl font-bold text-rose-700">
                  {formatVND(checkoutSummary?.remainingAmount != null ? checkoutSummary.remainingAmount : checkoutBooking.balanceDue)}
                </span>
              </div>

              {/* Phương thức thanh toán khoản còn lại */}
              <div className="space-y-1.5 pt-1">
                <label className="text-stone-700 font-semibold block">
                  Phương thức thanh toán khoản còn lại:
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'CASH', label: 'Tiền mặt' },
                    { id: 'CREDIT_CARD', label: 'Thẻ' },
                    { id: 'TRANSFER', label: 'Chuyển khoản' },
                    { id: 'VNPAY', label: 'VNPay' },
                  ].map((pm) => (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setPaymentMethod(pm.id)}
                      className={`py-2 px-2 rounded-xl border text-center font-semibold text-[11px] transition-all cursor-pointer ${
                        paymentMethod === pm.id
                          ? 'border-black bg-stone-900 text-white shadow-sm'
                          : 'border-stone-200 bg-stone-50 text-stone-700 hover:bg-stone-100'
                      }`}
                    >
                      {pm.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Ghi chú khi trả phòng */}
              <div className="space-y-1">
                <label className="text-stone-700 font-semibold block">
                  Ghi chú trả phòng (tùy chọn):
                </label>
                <input
                  type="text"
                  value={checkoutNotes}
                  onChange={(e) => setCheckoutNotes(e.target.value)}
                  placeholder="Ví dụ: Khách thanh toán đủ tiền mặt, hài lòng về dịch vụ..."
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs text-stone-900 focus:outline-none focus:border-stone-500"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-stone-100 flex items-center justify-end gap-3 bg-stone-50/70">
              <button
                type="button"
                onClick={() => setIsCheckoutModalOpen(false)}
                className="px-4 py-2 rounded-full border border-stone-200 text-stone-600 hover:bg-stone-100 text-xs font-semibold cursor-pointer"
              >
                Hủy
              </button>

              <button
                type="button"
                disabled={isProcessingCheckout}
                onClick={handleConfirmCheckout}
                className="px-6 py-2.5 rounded-full bg-black hover:bg-stone-800 text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <CheckCircle2 size={15} />
                <span>{isProcessingCheckout ? 'Đang quyết toán...' : 'Xác nhận Check-out'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 6. MODAL HÓA ĐƠN THANH TOÁN (Sau khi Check-out thành công hoặc xem lại) */}
      {isReceiptModalOpen && receiptData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in select-none">
          <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-lg w-full max-h-[92vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-6 bg-stone-900 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-[#C59D5F] block">
                  L'ÉTOILE RETREAT PMS
                </span>
                <h3 className="font-serif text-2xl font-bold mt-0.5">
                  Hóa Đơn Thanh Toán
                </h3>
                <p className="text-xs text-stone-300">
                  Mã đơn: #{receiptData.bookingId} • {receiptData.checkoutTime}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsReceiptModalOpen(false)}
                className="p-2 rounded-full hover:bg-stone-800 text-stone-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Nội dung Hóa đơn */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs font-sans">
              {/* Badge ĐÃ THANH TOÁN */}
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-emerald-600" />
                  <div>
                    <span className="font-bold text-emerald-900 block">ĐÃ THANH TOÁN HOÀN TẤT</span>
                    <span className="text-[11px] text-emerald-700">Trạng thái phòng đã chuyển sang Cần dọn (DIRTY)</span>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-800 px-2 py-0.5 bg-emerald-100 rounded-md">
                  CHECKED_OUT
                </span>
              </div>

              {/* Thông tin phòng & khách */}
              <div className="border border-stone-200 rounded-2xl p-4 space-y-2 bg-stone-50/50">
                <div className="flex justify-between">
                  <span className="text-stone-500">Khách hàng:</span>
                  <span className="font-bold text-stone-900">{receiptData.guestName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Số phòng:</span>
                  <span className="font-bold text-stone-900">{receiptData.roomNumber} ({receiptData.roomCategory})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Thời gian lưu trú:</span>
                  <span className="font-semibold text-stone-800">{receiptData.checkIn} → {receiptData.checkOut} ({receiptData.numberOfNights} đêm)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-stone-500">Hình thức thanh toán:</span>
                  <span className="font-bold text-stone-900">{receiptData.paymentMethod}</span>
                </div>
              </div>

              {/* Chi tiết khoản mục */}
              <div className="space-y-2">
                <span className="font-bold text-stone-900 block text-xs uppercase tracking-wide">
                  Chi tiết hóa đơn
                </span>

                <div className="border border-stone-200 rounded-2xl divide-y divide-stone-100 overflow-hidden">
                  <div className="p-3 flex justify-between">
                    <div>
                      <span className="font-semibold text-stone-900 block">Tiền phòng lưu trú</span>
                      <span className="text-[10px] text-stone-400">{receiptData.numberOfNights} đêm nghỉ dưỡng</span>
                    </div>
                    <span className="font-serif font-bold text-stone-900">{formatVND(receiptData.roomAmount)}</span>
                  </div>

                  {receiptData.services && receiptData.services.length > 0 && (
                    <div className="p-3 bg-amber-50/30 space-y-1.5">
                      <span className="font-semibold text-amber-950 block text-[11px]">
                        Dịch vụ phát sinh ({receiptData.services.length} món)
                      </span>
                      {receiptData.services.map((svc, idx) => (
                        <div key={idx} className="flex justify-between text-[11px]">
                          <span className="text-stone-600">
                            • {svc.serviceName} ({svc.quantity} {svc.unit || 'Lần'})
                          </span>
                          <span className="font-semibold text-stone-800">
                            {formatVND(svc.totalPrice != null ? svc.totalPrice : (svc.unitPrice * svc.quantity))}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="p-3 flex justify-between bg-stone-50 font-semibold text-stone-700">
                    <span>Tổng tiền thanh toán</span>
                    <span className="font-serif text-stone-900">{formatVND(receiptData.totalAmount)}</span>
                  </div>

                  <div className="p-3 flex justify-between text-emerald-700 font-semibold">
                    <span>Đã đặt cọc trước</span>
                    <span>-{formatVND(receiptData.paidDeposit)}</span>
                  </div>

                  <div className="p-3 flex justify-between bg-stone-900 text-white font-bold text-sm">
                    <span>Số tiền đã quyết toán tại quầy</span>
                    <span className="font-serif text-lg">{formatVND(receiptData.settledAmount)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-stone-100 flex items-center justify-end gap-3 bg-stone-50">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-full border border-stone-200 text-stone-700 hover:bg-stone-100 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
              >
                <Printer size={14} />
                <span>In hóa đơn</span>
              </button>

              <button
                type="button"
                onClick={() => setIsReceiptModalOpen(false)}
                className="px-6 py-2 rounded-full bg-black hover:bg-stone-800 text-white text-xs font-bold shadow-md cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 7. MODAL HỦY ĐƠN ĐẶT PHÒNG CHO LỄ TÂN (Bắt buộc nhập cancelReason) */}
      {isCancelModalOpen && cancelTargetBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in select-none">
          <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-md w-full overflow-hidden">
            <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-rose-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                  <XCircle size={18} />
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-stone-900">
                    Hủy đơn đặt phòng #{cancelTargetBooking.id}
                  </h3>
                  <p className="text-xs text-stone-500">
                    Phòng {cancelTargetBooking.roomNumber} • Khách: {cancelTargetBooking.guestName}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsCancelModalOpen(false)}
                className="p-2 rounded-full hover:bg-stone-200 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleConfirmCancel} className="p-6 space-y-4">
              {cancelError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{cancelError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-800 block">
                  Lý do hủy đơn đặt phòng *
                </label>
                <textarea
                  rows={3}
                  required
                  value={cancelReasonInput}
                  onChange={(e) => {
                    setCancelReasonInput(e.target.value);
                    setCancelError('');
                  }}
                  placeholder="Nhập lý do hủy (ví dụ: Khách báo hủy chuyến đi, trùng lịch, khách không đến...)"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs text-stone-900 focus:outline-none focus:border-stone-900 focus:bg-white transition-all resize-none"
                />
                <span className="text-[10px] text-stone-400 block">
                  Hệ thống sẽ cập nhật trạng thái đơn sang CANCELLED và giải phóng phòng về AVAILABLE.
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsCancelModalOpen(false)}
                  disabled={isProcessingCancel}
                  className="px-4 py-2 rounded-full border border-stone-200 text-stone-600 hover:bg-stone-100 text-xs font-semibold cursor-pointer"
                >
                  Bỏ qua
                </button>

                <button
                  type="submit"
                  disabled={isProcessingCancel || !cancelReasonInput.trim()}
                  className="px-6 py-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  <XCircle size={14} />
                  <span>{isProcessingCancel ? 'Đang hủy...' : 'Xác nhận hủy đơn'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. MODAL TẠO ĐƠN ĐẶT PHÒNG MỚI */}
      <NewBookingModal
        isOpen={isNewBookingModalOpen}
        onClose={() => setIsNewBookingModalOpen(false)}
        onBookingCreated={() => {
          fetchBookings();
          showToast('Đã tạo đơn đặt phòng mới thành công!');
        }}
      />
    </div>
  );
};

export default ReceptionistBookingsPage;
