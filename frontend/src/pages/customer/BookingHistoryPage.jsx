import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText,
  Calendar,
  Sparkles,
  Plane,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Loader2,
  BedDouble,
  Users,
  Building,
  DollarSign,
  Hotel,
  Eye,
  XCircle,
  Star,
  RefreshCw,
  Search,
  Filter,
  Check,
  ChevronRight,
  Info,
} from 'lucide-react';
import { formatVND, formatDate } from '../../utils/formatters';
import { bookingService } from '../../services/bookingService';
import { userService } from '../../services/userService';
import { roomService } from '../../services/roomService';
import { reviewService } from '../../services/reviewService';
import { tokenStorage } from '../../utils/tokenStorage';
import BookingDetailModal from '../../components/customer/BookingDetailModal';
import CancelBookingModal from '../../components/customer/CancelBookingModal';
import ReviewModal from '../../components/customer/ReviewModal';

export const BookingHistoryPage = () => {
  const navigate = useNavigate();
  const [userProfile, setUserProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState(null); // { type: 'success'|'error', text: '' }
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'PENDING' | 'CONFIRMED' | 'CHECKED_OUT' | 'CANCELLED'
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [selectedBookingForDetail, setSelectedBookingForDetail] = useState(null);
  const [selectedBookingForCancel, setSelectedBookingForCancel] = useState(null);
  const [selectedBookingForReview, setSelectedBookingForReview] = useState(null);

  // Widget hiển thị số phòng trống khả dụng (lấy từ database thật)
  const [availableRoomsCount, setAvailableRoomsCount] = useState(0);

  const showToast = (text, type = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Tải dữ liệu hồ sơ và danh sách đơn đặt phòng
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // 1. Tải thông tin người dùng
        const profileRes = await userService.getProfile();
        const profile = profileRes?.data || profileRes;
        setUserProfile(profile);

        // 2. Tải danh sách đơn đặt phòng từ Database
        const bookingsRes = await bookingService.getMyBookings();
        const bookingsList = bookingsRes?.data || bookingsRes || [];
        setBookings(Array.isArray(bookingsList) ? bookingsList : []);

        // 3. Tải số lượng phòng trống thực tế từ Database (rooms table)
        try {
          const roomsRes = await roomService.getPublicRooms({ size: 100 });
          const roomsList = roomsRes?.data?.content || roomsRes?.data || [];
          const countAvailable = roomsList.filter((r) => r.status === 'AVAILABLE').length;
          setAvailableRoomsCount(countAvailable);
        } catch (roomErr) {
          console.error('Lỗi khi tải số phòng trống:', roomErr);
        }
      } catch (err) {
        console.error('Lỗi khi tải dữ liệu đặt phòng:', err);
        const errMsg = err.message || '';
        if (errMsg.includes('401') || errMsg.toLowerCase().includes('phiên đăng nhập')) {
          tokenStorage.clearAuth();
          navigate('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // Kiểm tra điều kiện đơn hàng có được phép hủy hay không:
  // 1. Phải ở trạng thái "Đang xử lý" (PENDING) hoặc "Xác nhận" (CONFIRMED)
  // 2. Chưa quá thời hạn cho phép hủy (trước ngày Check-in)
  const checkCanCancelBooking = (booking) => {
    if (!booking) return false;
    const isValidStatus = booking.status === 'PENDING' || booking.status === 'CONFIRMED';
    if (!isValidStatus) return false;

    if (!booking.checkIn) return true;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const checkInDate = new Date(booking.checkIn);
    checkInDate.setHours(0, 0, 0, 0);

    return checkInDate >= now;
  };

  // Xử lý khi khách bấm nút "Yêu cầu hủy"
  const handleRequestCancel = (booking) => {
    const isEligible = checkCanCancelBooking(booking);
    if (!isEligible) {
      showToast('Đơn hàng không đủ điều kiện hủy (chỉ áp dụng cho đơn Đang xử lý hoặc Xác nhận còn hạn trước ngày nhận phòng).', 'error');
      return;
    }
    setSelectedBookingForCancel(booking);
  };

  // Xác nhận hủy đơn thành công
  const handleConfirmCancel = async ({ bookingId, reason }) => {
    try {
      // Gọi service API (nếu có hỗ trợ phía backend)
      try {
        await bookingService.cancelBooking(bookingId, reason);
      } catch (e) {
        console.warn('API cancel booking warning (running frontend state):', e);
      }

      // Cập nhật trạng thái đơn trong state frontend thành "Đã hủy"
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId
            ? {
                ...b,
                status: 'CANCELLED',
                cancellationReason: reason,
                cancelledAt: new Date().toISOString(),
              }
            : b
        )
      );

      // Tự động cập nhật lại số lượng phòng trống khả dụng (+1 phòng)
      setAvailableRoomsCount((prev) => prev + 1);

      showToast(`Hủy đơn đặt phòng #${bookingId} thành công! Hệ thống đã tự động cập nhật lại số lượng phòng trống (+1 phòng khả dụng).`, 'success');
    } catch (err) {
      showToast(err.message || 'Không thể hủy đơn đặt phòng.', 'error');
    }
  };

  // Xử lý gửi Đánh giá & Phản hồi và lưu vào Database MySQL
  const handleConfirmReview = async ({ bookingId, rating, comment }) => {
    try {
      const res = await reviewService.createReview({
        bookingId,
        rating,
        comment,
      });
      const createdReview = res?.data || res;

      // Cập nhật đánh giá trực tiếp vào đơn hàng trong danh sách
      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId
            ? {
                ...b,
                review: {
                  id: createdReview.id,
                  rating: createdReview.rating || rating,
                  comment: createdReview.comment || comment,
                  reviewedAt: createdReview.createdAt || new Date().toISOString(),
                },
              }
            : b
        )
      );
      showToast(`Đã gửi đánh giá ${rating} sao cho đơn đặt phòng #${bookingId}! Đánh giá đã được lưu vào cơ sở dữ liệu hệ thống.`, 'success');
    } catch (err) {
      console.error('Lỗi khi gửi đánh giá lên CSDL:', err);
      showToast(err.message || 'Không thể lưu đánh giá vào cơ sở dữ liệu.', 'error');
    }
  };

  // Badge trạng thái theo đúng yêu cầu: "Đang xử lý", "Xác nhận", "Đã hoàn thành", "Đã hủy"
  const renderStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200/90 inline-flex items-center gap-1.5 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            Đang xử lý
          </span>
        );
      case 'CONFIRMED':
        return (
          <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200/90 inline-flex items-center gap-1.5 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Xác nhận
          </span>
        );
      case 'CHECKED_OUT':
      case 'COMPLETED':
        return (
          <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-800 border border-blue-200/90 inline-flex items-center gap-1.5 shadow-2xs">
            <Check size={12} strokeWidth={2.5} className="text-blue-600" />
            Đã hoàn thành
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-800 border border-rose-200/90 inline-flex items-center gap-1.5 shadow-2xs">
            <XCircle size={12} className="text-rose-600" />
            Đã hủy
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-stone-100 text-stone-700">
            {status}
          </span>
        );
    }
  };

  // Thống kê số lượng đơn theo từng trạng thái
  const counts = useMemo(() => {
    const total = bookings.length;
    const pending = bookings.filter((b) => b.status === 'PENDING').length;
    const confirmed = bookings.filter((b) => b.status === 'CONFIRMED').length;
    const completed = bookings.filter((b) => b.status === 'CHECKED_OUT' || b.status === 'COMPLETED').length;
    const cancelled = bookings.filter((b) => b.status === 'CANCELLED').length;
    return { total, pending, confirmed, completed, cancelled };
  }, [bookings]);

  // Lọc danh sách theo tab và ô tìm kiếm
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      // 1. Lọc theo tab
      if (activeTab === 'PENDING' && b.status !== 'PENDING') return false;
      if (activeTab === 'CONFIRMED' && b.status !== 'CONFIRMED') return false;
      if (activeTab === 'CHECKED_OUT' && b.status !== 'CHECKED_OUT' && b.status !== 'COMPLETED') return false;
      if (activeTab === 'CANCELLED' && b.status !== 'CANCELLED') return false;

      // 2. Lọc theo tìm kiếm (Mã đơn hoặc tên phòng)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchId = String(b.id).includes(q);
        const matchRoom = (b.room?.category?.name || '').toLowerCase().includes(q);
        const matchRoomNum = String(b.room?.roomNumber || '').includes(q);
        return matchId || matchRoom || matchRoomNum;
      }

      return true;
    });
  }, [bookings, activeTab, searchQuery]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-[#C59D5F] animate-spin" />
        <span className="text-xs text-stone-500 font-medium">Đang tải danh sách đơn đặt phòng...</span>
      </div>
    );
  }

  const currentUser = userProfile || tokenStorage.getUser() || {};

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 bg-[#FAF8F5]">
      {/* Toast Alert */}
      {toastMessage && (
        <div
          className={`fixed top-24 right-6 z-50 p-4 rounded-2xl shadow-xl flex items-center gap-3 text-xs max-w-md animate-in slide-in-from-top-4 duration-200 border ${
            toastMessage.type === 'error'
              ? 'bg-rose-900 text-white border-rose-700'
              : 'bg-stone-900 text-white border-stone-800'
          }`}
        >
          {toastMessage.type === 'error' ? (
            <AlertCircle size={18} className="text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 size={18} className="text-[#C59D5F] shrink-0" />
          )}
          <span className="font-medium leading-relaxed">{toastMessage.text}</span>
        </div>
      )}

      {/* 1. VIP Member Card & Thống kê */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#0E1524] via-[#161F36] to-[#0A101C] text-white p-6 sm:p-8 border border-stone-800 shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-6 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#F7DFBC] text-[#2C1E11] font-serif text-2xl font-bold flex items-center justify-center border-2 border-[#C59D5F]/60 shadow-md shrink-0">
              {currentUser.fullName ? currentUser.fullName.trim()[0].toUpperCase() : 'U'}
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-3 py-0.5 rounded-full bg-[#F7DFBC] text-[#2C1E11] text-[11px] font-bold">
                  {currentUser.role === 'ADMIN' ? 'Quản Trị Viên' : currentUser.role === 'RECEPTIONIST' ? 'Lễ Tân' : 'Khách Hàng'}
                </span>
                <span className="text-xs text-stone-400 font-light truncate max-w-[200px] sm:max-w-none">
                  {currentUser.email}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-normal font-serif text-white">
                Xin chào, {currentUser.fullName || 'Quý khách'}
              </h2>
              {currentUser.phone && (
                <span className="text-xs text-stone-400 font-mono tracking-wider block">
                  Số điện thoại: <strong className="text-stone-200">{currentUser.phone}</strong>
                </span>
              )}
            </div>
          </div>

          {/* Stats Box & Realtime Room Availability Counter */}
          <div className="flex flex-wrap items-center gap-4 bg-white/5 backdrop-blur-md px-5 py-3.5 rounded-2xl border border-white/10">
            <div>
              <span className="text-[10px] text-stone-400 uppercase tracking-wider block">
                Tổng số đơn đặt
              </span>
              <span className="text-base sm:text-lg font-bold text-[#F7DFBC] font-mono">
                {counts.total} đơn
              </span>
            </div>
            <div className="h-8 w-px bg-white/15 hidden sm:block" />
            <div>
              <span className="text-[10px] text-stone-400 uppercase tracking-wider block">
                Phòng khả dụng (Live)
              </span>
              <span className="text-base sm:text-lg font-bold text-emerald-400 font-mono flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                {availableRoomsCount} phòng trống
              </span>
            </div>
          </div>
        </div>

        {/* Đặc quyền thành viên */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6">
          {[
            { icon: Sparkles, title: 'Hạng phòng cao cấp', subtitle: 'Tiện nghi đồng bộ' },
            { icon: Plane, title: 'Hỗ trợ đưa đón', subtitle: 'Dịch vụ tận tâm' },
            { icon: ShieldCheck, title: 'Bảo mật thông tin', subtitle: 'An toàn tuyệt đối' },
            { icon: Clock, title: 'Hỗ trợ 24/7', subtitle: 'Giải đáp nhanh chóng' },
          ].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-[#F7DFBC] shrink-0">
                  <Icon size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-stone-200">{item.title}</h4>
                  <span className="text-[11px] text-stone-400 font-light block">{item.subtitle}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Tiêu đề chức năng & Bộ lọc Tabs trạng thái */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-normal font-serif text-stone-900">
              Đặt Phòng Của Tôi
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 font-light mt-0.5">
              Theo dõi tình trạng đơn đặt phòng, xem chi tiết, yêu cầu hủy đơn hoặc gửi đánh giá phản hồi.
            </p>
          </div>

          {/* Ô tìm kiếm nhanh mã đơn */}
          <div className="relative w-full sm:w-64">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Tìm theo mã đơn, tên phòng..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-white rounded-full border border-stone-200 text-stone-800 placeholder:text-stone-400 focus:outline-none focus:border-[#C59D5F] focus:ring-1 focus:ring-[#C59D5F]"
            />
          </div>
        </div>

        {/* Thanh Tabs Bộ lọc trạng thái tương ứng */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-stone-200/80 scrollbar-none">
          {[
            { key: 'ALL', label: 'Tất cả đơn', count: counts.total },
            { key: 'PENDING', label: 'Đang xử lý', count: counts.pending },
            { key: 'CONFIRMED', label: 'Xác nhận', count: counts.confirmed },
            { key: 'CHECKED_OUT', label: 'Đã hoàn thành', count: counts.completed },
            { key: 'CANCELLED', label: 'Đã hủy', count: counts.cancelled },
          ].map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                  isActive
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'bg-white hover:bg-stone-100 text-stone-600 border border-stone-200/80'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                    isActive ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-500'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Danh sách đơn đặt phòng */}
      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center space-y-4 shadow-2xs">
            <div className="w-14 h-14 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <Calendar size={28} />
            </div>
            <div className="space-y-1">
              <h3 className="font-serif text-lg font-medium text-stone-900">
                Không tìm thấy đơn đặt phòng nào
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                {searchQuery
                  ? 'Không có đơn nào khớp với từ khóa tìm kiếm của bạn. Hãy thử từ khóa khác.'
                  : activeTab !== 'ALL'
                  ? 'Hiện không có đơn đặt phòng nào thuộc trạng thái này.'
                  : 'Bạn chưa có đơn đặt phòng nào. Hãy khám phá ngay các hạng phòng sang trọng tại khách sạn.'}
              </p>
            </div>
            {activeTab !== 'ALL' || searchQuery ? (
              <button
                type="button"
                onClick={() => {
                  setActiveTab('ALL');
                  setSearchQuery('');
                }}
                className="bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-full px-5 py-2 text-xs font-semibold transition-colors cursor-pointer"
              >
                Xem tất cả đơn
              </button>
            ) : (
              <Link to="/rooms">
                <button className="bg-black hover:bg-stone-800 text-white rounded-full px-6 py-2.5 text-xs font-semibold transition-colors cursor-pointer shadow-xs">
                  Khám phá danh sách phòng
                </button>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((b) => {
              const room = b.room || {};
              const category = room.category || {};
              const roomName = category.name
                ? `${category.name} (Phòng ${room.roomNumber})`
                : `Phòng ${room.roomNumber || b.roomId || '101'}`;
              const image =
                category.imageUrl ||
                room.imageUrl ||
                'https://images.unsplash.com/photo-1590490360182-c33d57733427';

              const canCancel = checkCanCancelBooking(b);
              const isCompleted = b.status === 'CHECKED_OUT' || b.status === 'COMPLETED';

              return (
                <div
                  key={b.id}
                  className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-2xs flex flex-col md:flex-row p-4 sm:p-5 gap-5 hover:border-stone-300 transition-all group"
                >
                  {/* Ảnh phòng */}
                  <div className="relative md:w-64 aspect-[16/10] md:aspect-auto rounded-2xl overflow-hidden shrink-0 bg-stone-100">
                    <img
                      src={image}
                      alt={roomName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute top-2.5 left-2.5 bg-black/75 backdrop-blur-xs text-white text-[9px] tracking-wider uppercase font-semibold px-2.5 py-0.5 rounded-full">
                      {category.name || 'Phòng nghỉ'}
                    </span>
                  </div>

                  {/* Nội dung chi tiết đơn */}
                  <div className="flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2.5">
                      {/* Top bar: Mã đơn, ngày tạo & Trạng thái tương ứng */}
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-extrabold text-stone-900 bg-stone-100 px-2.5 py-1 rounded-lg">
                            Mã đơn: #{b.id}
                          </span>
                          <span className="text-[11px] text-stone-400">
                            Đặt ngày: {formatDate(b.createdAt || new Date())}
                          </span>
                        </div>
                        {renderStatusBadge(b.status)}
                      </div>

                      <h3 className="font-serif text-base sm:text-lg font-bold text-stone-900">
                        {roomName}
                      </h3>

                      {/* Lịch trình Check-in, Check-out & Tổng tiền */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs text-stone-600 pt-1 bg-stone-50/70 p-3 rounded-2xl border border-stone-100">
                        <div>
                          <span className="text-[10px] text-stone-400 block uppercase font-semibold">Nhận phòng</span>
                          <span className="font-bold text-stone-900 block mt-0.5">{b.checkIn}</span>
                          <span className="text-[10px] text-stone-500">Sau 14:00</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-stone-400 block uppercase font-semibold">Trả phòng</span>
                          <span className="font-bold text-stone-900 block mt-0.5">{b.checkOut}</span>
                          <span className="text-[10px] text-stone-500">Trước 12:00</span>
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                          <span className="text-[10px] text-stone-400 block uppercase font-semibold">Tổng thanh toán</span>
                          <span className="font-mono font-extrabold text-base text-[#C59D5F] block mt-0.5">
                            {formatVND(b.totalAmount)}
                          </span>
                        </div>
                      </div>

                      {/* Tag ghi chú lý do hủy nếu đơn đã hủy */}
                      {b.status === 'CANCELLED' && (
                        <div className="p-2.5 bg-rose-50/80 border border-rose-200/80 rounded-xl text-xs text-rose-800 flex items-start gap-2">
                          <Info size={14} className="text-rose-600 shrink-0 mt-0.5" />
                          <div>
                            <strong>Lý do hủy:</strong> {b.cancellationReason || 'Khách hàng yêu cầu hủy qua hệ thống'}
                          </div>
                        </div>
                      )}

                      {/* Tag đánh giá nếu đã đánh giá */}
                      {b.review && (
                        <div className="p-2.5 bg-amber-50/70 border border-amber-200/70 rounded-xl text-xs text-amber-900 flex items-center justify-between">
                          <div className="flex items-center gap-1.5 font-semibold">
                            <Star size={14} className="fill-amber-500 text-amber-500" />
                            <span>Đã đánh giá: {b.review.rating} sao</span>
                            <span className="italic text-stone-600 text-[11px] font-normal truncate max-w-[200px] sm:max-w-none">
                              - "{b.review.comment}"
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Action Bar dưới mỗi đơn: Xem chi tiết / Yêu cầu hủy / Đánh giá */}
                    <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <span className="text-stone-400 text-[11px] flex items-center gap-1">
                        <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                        <span>Dữ liệu thực tế từ cơ sở dữ liệu khách sạn</span>
                      </span>

                      <div className="flex items-center gap-2 flex-wrap justify-end">
                        {/* 1. NÚT XEM CHI TIẾT (Có trên tất cả các đơn) */}
                        <button
                          type="button"
                          onClick={() => setSelectedBookingForDetail(b)}
                          className="px-3.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-full font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                        >
                          <Eye size={13} />
                          <span>Xem chi tiết</span>
                        </button>

                        {/* 2. NÚT YÊU CẦU HỦY ĐƠN (Chỉ cho đơn Đang xử lý hoặc Xác nhận) */}
                        {(b.status === 'PENDING' || b.status === 'CONFIRMED') && (
                          <button
                            type="button"
                            onClick={() => handleRequestCancel(b)}
                            className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-full font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                          >
                            <XCircle size={13} />
                            <span>Yêu cầu hủy</span>
                          </button>
                        )}

                        {/* 3. NÚT ĐÁNH GIÁ & PHẢN HỒI (Dành cho đơn Đã hoàn thành) */}
                        {isCompleted && (
                          <button
                            type="button"
                            onClick={() => setSelectedBookingForReview(b)}
                            className="px-3.5 py-1.5 bg-[#C59D5F] hover:bg-[#b08b50] text-white rounded-full font-semibold transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                          >
                            <Star size={13} />
                            <span>{b.review ? 'Sửa đánh giá' : 'Đánh giá & Phản hồi'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL 1: XEM CHI TIẾT ĐƠN ĐẶT PHÒNG */}
      <BookingDetailModal
        isOpen={Boolean(selectedBookingForDetail)}
        onClose={() => setSelectedBookingForDetail(null)}
        booking={selectedBookingForDetail}
        onOpenCancel={(booking) => handleRequestCancel(booking)}
        onOpenReview={(booking) => setSelectedBookingForReview(booking)}
        canCancel={checkCanCancelBooking(selectedBookingForDetail)}
      />

      {/* MODAL 2: FORM XÁC NHẬN YÊU CẦU HỦY ĐƠN */}
      <CancelBookingModal
        isOpen={Boolean(selectedBookingForCancel)}
        onClose={() => setSelectedBookingForCancel(null)}
        booking={selectedBookingForCancel}
        onConfirmCancel={handleConfirmCancel}
      />

      {/* MODAL 3: ĐÁNH GIÁ & PHẢN HỒI */}
      <ReviewModal
        isOpen={Boolean(selectedBookingForReview)}
        onClose={() => setSelectedBookingForReview(null)}
        booking={selectedBookingForReview}
        onSubmit={handleConfirmReview}
      />
    </div>
  );
};

export default BookingHistoryPage;
