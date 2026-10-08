import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';
import { formatVND, formatDate } from '../../utils/formatters';
import { tokenStorage } from '../../utils/tokenStorage';
import { roomService } from '../../services/roomService';
import { bookingService } from '../../services/bookingService';
import { userService } from '../../services/userService';
import { paymentService } from '../../services/paymentService';
import {
  ArrowLeft,
  CreditCard,
  Building2,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Clock,
  Star,
  Loader2,
  Hotel,
} from 'lucide-react';

export const BookingPaymentPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Đọc thông số truyền từ trang trước
  const roomId = searchParams.get('roomId') || '';
  const queryCheckIn = searchParams.get('checkIn') || '';
  const queryCheckOut = searchParams.get('checkOut') || '';
  const queryPhone = searchParams.get('phone') || '';

  // State phòng từ Database
  const [roomData, setRoomData] = useState(null);
  const [isLoadingRoom, setIsLoadingRoom] = useState(true);

  // Lấy thông tin tài khoản đã lưu trong profile / tokenStorage
  const storedUser = tokenStorage.getUser() || {};

  // State thông tin khách hàng (tự động điền theo profile)
  const [formData, setFormData] = useState({
    fullName: storedUser?.fullName || '',
    phone: storedUser?.phone || queryPhone || '',
    email: storedUser?.email || '',
    specialRequests: '',
  });

  // State phương thức thanh toán (không gán dữ liệu mẫu, người dùng phải tự chọn)
  const [paymentMethod, setPaymentMethod] = useState('');

  // State đồng ý điều khoản
  const [isAgreed, setIsAgreed] = useState(true);

  // State xử lý gửi form
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdBooking, setCreatedBooking] = useState(null);
  const [submitError, setSubmitError] = useState('');

  // Tải thông tin phòng và người dùng từ cơ sở dữ liệu thật
  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingRoom(true);
      try {
        // 1. Tải thông tin phòng cụ thể từ Database
        if (roomId) {
          const res = await roomService.getRoomById(roomId);
          const data = res?.data || res;
          setRoomData(data);
        }

        // 2. Tải thông tin tài khoản nếu đã đăng nhập
        try {
          const profileRes = await userService.getProfile();
          const profile = profileRes?.data || profileRes;
          if (profile) {
            setFormData((prev) => ({
              ...prev,
              fullName: profile.fullName || prev.fullName,
              phone: profile.phone || queryPhone || prev.phone,
              email: profile.email || prev.email,
            }));
          }
        } catch (_) {
          const stored = tokenStorage.getUser() || {};
          setFormData((prev) => ({
            ...prev,
            fullName: stored.fullName || prev.fullName,
            phone: stored.phone || queryPhone || prev.phone,
            email: stored.email || prev.email,
          }));
        }
      } catch (err) {
        console.error('Lỗi khi tải chi tiết phòng đặt:', err);
      } finally {
        setIsLoadingRoom(false);
      }
    };

    fetchData();
  }, [roomId, queryPhone]);

  const category = roomData?.category || {};
  const roomName = category.name
    ? `${category.name} (Phòng ${roomData?.roomNumber || ''})`
    : (roomData?.roomNumber ? `Phòng ${roomData.roomNumber}` : (roomId ? `Phòng #${roomId}` : ''));
  const pricePerNight = category.basePrice || roomData?.basePrice || 0;
  const imageUrl = category.imageUrl || roomData?.imageUrl || '';
  const description = category.description || roomData?.description || '';

  // Ngày nhận / trả phòng chuẩn hóa (sử dụng ngày hiện tại nếu không truyền params, không dùng dữ liệu mẫu tĩnh)
  const today = new Date();
  const defaultCheckIn = today.toISOString().split('T')[0];
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultCheckOut = tomorrow.toISOString().split('T')[0];

  const checkInDate = queryCheckIn || defaultCheckIn;
  const checkOutDate = queryCheckOut || defaultCheckOut;

  // Tính số đêm lưu trú
  const calculateNights = () => {
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  };

  const nights = calculateNights();

  // Tính toán chi phí (không có voucher mẫu)
  const roomPriceSubtotal = pricePerNight * nights;
  const taxAndService = Math.round(roomPriceSubtotal * 0.1); // 10% thuế GTGT & phí dịch vụ
  const totalAmount = roomPriceSubtotal + taxAndService;

  // ============================================================================
  // VALIDATION LOGIC CHẶN REQUEST RÁC
  // ============================================================================

  // 1. Validate Số điện thoại: !/^(0|\+84)[35789]\d{8}$/
  const phoneTrimmed = (formData.phone || '').trim();
  const isPhoneValid = /^(0|\+84)[35789]\d{8}$/.test(phoneTrimmed);
  const phoneError = !phoneTrimmed
    ? 'Số điện thoại không được để trống'
    : (!isPhoneValid ? 'Số điện thoại không đúng định dạng (VD: 0912345678 hoặc +84912345678)' : '');

  // 2. Validate Email: !/^[a-zA-Z0-9.]+@gmail\.com$/
  const emailTrimmed = (formData.email || '').trim();
  const isEmailValid = /^[a-zA-Z0-9.]+@gmail\.com$/.test(emailTrimmed);
  const emailError = !emailTrimmed
    ? 'Email không được để trống'
    : (!isEmailValid ? 'Email phải có định dạng @gmail.com (VD: example@gmail.com)' : '');

  // 3. Validate Họ và tên (không được để trống, không được sửa)
  const fullNameTrimmed = (formData.fullName || '').trim();
  const isFullNameValid = fullNameTrimmed.length > 0;
  const fullNameError = !isFullNameValid ? 'Họ và tên không được để trống' : '';

  // 4. Validate Phương thức thanh toán
  const isPaymentMethodValid = Boolean(paymentMethod && paymentMethod.trim());

  // 5. Điều khoản
  const isTermsValid = Boolean(isAgreed);

  // Tổng hợp điều kiện hợp lệ toàn bộ form
  const isFormValid = isFullNameValid && isPhoneValid && isEmailValid && isPaymentMethodValid && isTermsValid;

  // Hàm hiển thị số sao sáng chuẩn xác theo điểm số (hỗ trợ cả nửa sao ví dụ 4.5/5)
  const renderRatingStars = (ratingValue, size = 13) => {
    const num = Number(ratingValue) || 0;
    return (
      <div className="flex items-center gap-0.5" title={`${num}/5 sao`}>
        {[1, 2, 3, 4, 5].map((s) => {
          const fillPercentage = Math.max(0, Math.min(100, Math.round((num - (s - 1)) * 100)));
          if (fillPercentage >= 75) {
            return (
              <Star
                key={s}
                size={size}
                className="fill-amber-400 text-amber-400 shrink-0"
              />
            );
          } else if (fillPercentage >= 25) {
            return (
              <div key={s} className="relative inline-block shrink-0" style={{ width: size, height: size }}>
                <Star
                  size={size}
                  className="absolute inset-0 fill-slate-100 text-slate-300"
                />
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${fillPercentage}%` }}
                >
                  <Star
                    size={size}
                    className="fill-amber-400 text-amber-400"
                  />
                </div>
              </div>
            );
          } else {
            return (
              <Star
                key={s}
                size={size}
                className="fill-slate-100 text-slate-300 shrink-0"
              />
            );
          }
        })}
      </div>
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    // Tuyệt đối chặn không cho gửi Request rác xuống Backend
    if (!isFormValid) {
      if (!isFullNameValid) {
        setSubmitError('Họ và tên không được để trống!');
      } else if (!phoneTrimmed) {
        setSubmitError('Vui lòng nhập số điện thoại!');
      } else if (!isPhoneValid) {
        setSubmitError('Số điện thoại không đúng định dạng (VD: 0912345678 hoặc +84912345678)!');
      } else if (!emailTrimmed) {
        setSubmitError('Vui lòng nhập địa chỉ email!');
      } else if (!isEmailValid) {
        setSubmitError('Email phải có định dạng @gmail.com!');
      } else if (!isPaymentMethodValid) {
        setSubmitError('Vui lòng chọn một phương thức thanh toán!');
      } else if (!isTermsValid) {
        setSubmitError('Vui lòng đồng ý với điều khoản đặt phòng & chính sách để tiếp tục!');
      }
      return;
    }

    setIsSubmitting(true);
    try {
      // FLOW 1: THANH TOÁN TRỰC TUYẾN QUA CỔNG VNPAY
      if (paymentMethod === 'VNPAY') {
        // Lưu thông tin đặt phòng để hỗ trợ quay lại thử lại khi thanh toán thất bại
        sessionStorage.setItem(
          'last_booking_attempt',
          JSON.stringify({
            roomId: roomData?.id || Number(roomId) || 1,
            checkIn: checkInDate,
            checkOut: checkOutDate,
            phone: phoneTrimmed,
          })
        );

        // Gọi hàm service riêng biệt tạo URL thanh toán
        // [PENDING BACKEND]: Khi Backend hoàn tất API /create-url, hàm này sẽ trả về URL và redirect
        const paymentRes = await paymentService.createVNPayUrl({
          roomId: roomData?.id || Number(roomId) || 1,
          checkIn: checkInDate,
          checkOut: checkOutDate,
          totalAmount: totalAmount,
          specialRequests: formData.specialRequests?.trim() || '',
          fullName: fullNameTrimmed,
          phone: phoneTrimmed,
          email: emailTrimmed,
          returnUrl: `${window.location.origin}/booking/vnpay-return`,
        });

        const vnpayUrl = paymentRes?.paymentUrl || paymentRes?.url || (typeof paymentRes === 'string' ? paymentRes : null);
        if (vnpayUrl) {
          // Redirect sang Cổng thanh toán VNPay
          window.location.href = vnpayUrl;
          return;
        } else {
          throw new Error('Hệ thống không nhận được URL thanh toán từ cổng VNPay.');
        }
      }

      // FLOW 2: CÁC PHƯƠNG THỨC KHÁC (THANH TOÁN TẠI QUẦY, THẺ...) GIỮ NGUYÊN BUSINESS LOGIC
      const res = await bookingService.createBooking({
        roomId: roomData?.id || Number(roomId) || 1,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        totalAmount: totalAmount,
        paymentMethod: paymentMethod,
        specialRequests: formData.specialRequests?.trim() || '',
        fullName: fullNameTrimmed,
        phone: phoneTrimmed,
        email: emailTrimmed,
      });

      const created = res?.data || res;
      setCreatedBooking(created);
    } catch (err) {
      console.error('Lỗi khi lưu đơn đặt phòng vào CSDL:', err);
      setSubmitError(err.message || 'Có lỗi xảy ra khi tạo đơn đặt phòng.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingRoom) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
        <span className="text-xs text-stone-500 font-medium">Đang chuẩn bị thông tin đặt phòng & thanh toán...</span>
      </div>
    );
  }

  // MÀN HÌNH EMPTY / KHÔNG TÌM THẤY DỮ LIỆU PHÒNG
  if (!roomData) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
          <Hotel size={32} />
        </div>
        <h2 className="text-xl font-bold text-slate-900 font-serif">
          Không Tìm Thấy Thông Tin Phòng
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Phòng yêu cầu hiện không tồn tại hoặc đã ngừng phục vụ. Quý khách vui lòng chọn phòng khác từ danh sách phòng nghỉ.
        </p>
        <Button variant="primary" onClick={() => navigate('/rooms')}>
          Xem Danh Sách Phòng
        </Button>
      </div>
    );
  }

  if (createdBooking) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-5">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 size={36} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 font-serif">
          Đặt Phòng & Giữ Chỗ Thành Công!
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          Đơn đặt phòng của bạn đã được lưu vào cơ sở dữ liệu hệ thống với mã đơn <strong className="text-slate-900 font-mono">#{createdBooking.id}</strong>.
          Tổng thanh toán là <strong className="text-[#C59D5F]">{formatVND(createdBooking.totalAmount || totalAmount)}</strong>.
          Chúng tôi đã gửi thông tin xác nhận về email <span className="text-amber-600 font-medium">{formData.email}</span>.
        </p>
        <div className="pt-4 flex justify-center gap-3">
          <Button variant="primary" onClick={() => navigate('/my-bookings')}>
            Xem Đặt Phòng Của Tôi
          </Button>
          <Button variant="outline" onClick={() => navigate('/')}>
            Về Trang Chủ
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* 1. Mũi tên quay lại chi tiết phòng */}
      <button
        type="button"
        onClick={() => navigate(roomId ? `/rooms/${roomId}` : '/rooms')}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
      >
        <ArrowLeft size={16} />
        <span>Quay lại chi tiết phòng</span>
      </button>

      <div>
        <span className="text-xs font-bold text-amber-600 uppercase tracking-widest block">
          Xác nhận đặt phòng trực tuyến
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1 font-serif">
          Đặt Phòng & Thanh Toán
        </h1>
      </div>

      {/* Bố cục 2 Cột Cân Đối */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* =================================================================== */}
        {/* CỘT TRÁI (5/12): ẢNH & GIỚI THIỆU + CHI TIẾT PHÒNG + CHI TIẾT CHI PHÍ */}
        {/* =================================================================== */}
        <div className="lg:col-span-5 space-y-6">
          {/* KHỐI 1: ẢNH & THÔNG TIN GIỚI THIỆU VỀ PHÒNG TỪ DATABASE */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={roomName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                  Không có hình ảnh phòng
                </div>
              )}
              {category.name && (
                <div className="absolute top-3 left-3">
                  <Badge variant="amber">{category.name}</Badge>
                </div>
              )}
            </div>
            <div className="p-5 space-y-2">
              {roomData?.totalReviews > 0 ? (
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  {renderRatingStars(roomData.averageRating, 13)}
                  <span>{roomData.averageRating}</span>
                  <span className="text-slate-400 font-normal">({roomData.totalReviews} đánh giá từ khách)</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 text-xs text-slate-400 font-normal">
                  <Star size={13} className="text-slate-300 fill-slate-100" />
                  <span>(Chưa có đánh giá)</span>
                </div>
              )}
              <h3 className="font-bold text-lg text-slate-900 font-serif">
                {roomName}
              </h3>
              {description && (
                <p className="text-xs text-slate-600 leading-relaxed font-light">
                  {description}
                </p>
              )}
            </div>
          </div>

          {/* KHỐI 2: CHI TIẾT PHÒNG CỦA BẠN */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
              Chi tiết phòng của bạn
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500">Hạng phòng & Số phòng</span>
                <span className="font-bold text-slate-800">{roomName}</span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500">Sức chứa & Loại giường</span>
                <span className="font-semibold text-slate-800">{category.capacity || 2} Khách • {category.bedType || '1 Giường đôi'}</span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Calendar size={13} className="text-amber-600" />
                  <span>Ngày nhận phòng</span>
                </span>
                <span className="font-semibold text-slate-800">{checkInDate}</span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Calendar size={13} className="text-amber-600" />
                  <span>Ngày trả phòng</span>
                </span>
                <span className="font-semibold text-slate-800">{checkOutDate}</span>
              </div>

              <div className="flex justify-between items-center py-1 border-t border-slate-100 pt-2">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Clock size={13} className="text-amber-600" />
                  <span>Tổng thời gian lưu trú</span>
                </span>
                <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                  {nights} đêm
                </span>
              </div>
            </div>
          </div>

          {/* KHỐI 3: CHI TIẾT CHI PHÍ (GIÁ PHÒNG, THUẾ & DỊCH VỤ, TỔNG TIỀN, CHECKBOX ĐIỀU KHOẢN) */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
              Chi tiết chi phí
            </h3>

            {/* Bảng giá kê khai */}
            <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <div className="flex justify-between items-center">
                <span>
                  Giá phòng ({nights} đêm × {formatVND(pricePerNight)}):
                </span>
                <span className="font-semibold text-slate-800">{formatVND(roomPriceSubtotal)}</span>
              </div>

              <div className="flex justify-between items-center">
                <span>Thuế GTGT & phí dịch vụ (10%):</span>
                <span className="font-semibold text-slate-800">{formatVND(taxAndService)}</span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Tổng tiền thanh toán
                </span>
                <span className="text-2xl font-black text-amber-600">
                  {formatVND(totalAmount)}
                </span>
              </div>
            </div>

            {/* Checkbox điều khoản */}
            <div className="pt-2 border-t border-slate-100">
              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600 leading-relaxed">
                <input
                  type="checkbox"
                  checked={isAgreed}
                  onChange={(e) => setIsAgreed(e.target.checked)}
                  className="mt-0.5 rounded accent-amber-600 w-4 h-4 cursor-pointer"
                />
                <span>
                  Tôi đồng ý với{' '}
                  <span className="text-amber-600 font-semibold underline">
                    điều khoản đặt phòng & chính sách
                  </span>{' '}
                  của khách sạn LuxeStay.
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* =================================================================== */}
        {/* CỘT PHẢI (7/12): THÔNG TIN CHI TIẾT CỦA BẠN + PHƯƠNG THỨC THANH TOÁN */}
        {/* =================================================================== */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* KHỐI 1: THÔNG TIN CHI TIẾT CỦA BẠN */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
                Thông tin chi tiết của bạn
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Họ và tên: Khóa cố định không được sửa */}
                <Input
                  id="fullName"
                  label="Họ và tên (Cố định theo tài khoản) *"
                  placeholder="Họ và tên của bạn"
                  value={formData.fullName}
                  readOnly
                  disabled
                  error={fullNameError}
                  className="bg-slate-100 cursor-not-allowed text-slate-700 font-medium select-none"
                  helperText="Họ và tên cố định theo tài khoản của bạn (không thể chỉnh sửa)"
                />

                {/* Số điện thoại: Bắt lỗi validation !/^(0|\+84)[35789]\d{8}$/ */}
                <Input
                  id="phone"
                  label="Số điện thoại *"
                  type="tel"
                  placeholder="Ví dụ: 0912345678 hoặc +84912345678"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  error={phoneError}
                  required
                />

                {/* Email nhận hóa đơn: Bắt lỗi validation !/^[a-zA-Z0-9.]+@gmail\.com$/ */}
                <div className="sm:col-span-2">
                  <Input
                    id="email"
                    label="Email nhận hóa đơn *"
                    type="email"
                    placeholder="Ví dụ: tenban@gmail.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    error={emailError}
                    required
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Yêu cầu của bạn (Yêu cầu đặc biệt)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Ví dụ: Cần chuẩn bị thêm gối, tầng cao yên tĩnh, giờ check-in dự kiến..."
                    value={formData.specialRequests}
                    onChange={(e) =>
                      setFormData({ ...formData, specialRequests: e.target.value })
                    }
                    className="w-full text-xs border border-slate-200 rounded-xl p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 resize-none bg-slate-50/50"
                  />
                </div>
              </div>
            </div>

            {/* KHỐI 2: PHƯƠNG THỨC THANH TOÁN (NGAY BÊN DƯỚI THÔNG TIN CỦA BẠN) */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-base font-bold text-slate-900">
                  Phương thức thanh toán *
                </h3>
                {!paymentMethod && (
                  <span className="text-xs text-rose-500 font-semibold animate-pulse">
                    * Vui lòng chọn 1 phương thức
                  </span>
                )}
              </div>

              <div className="space-y-3">
                {/* 1. Cổng thanh toán VNPay (ATM, QR) */}
                <label
                  onClick={() => setPaymentMethod('VNPAY')}
                  className={`p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === 'VNPAY'
                      ? 'border-amber-600 bg-amber-50/40 shadow-xs ring-1 ring-amber-600/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-blue-600 text-white font-black flex items-center justify-center text-xs shrink-0">
                      VNPAY
                    </div>
                    <div>
                      <span className="text-sm font-bold text-slate-900 block">
                        Cổng thanh toán VNPay (ATM, QR)
                      </span>
                      <span className="text-xs text-slate-500">
                        Quét mã VNPAY-QR qua ứng dụng ngân hàng hoặc thẻ ATM nội địa
                      </span>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="VNPAY"
                    checked={paymentMethod === 'VNPAY'}
                    onChange={() => setPaymentMethod('VNPAY')}
                    className="accent-amber-600 w-4 h-4 cursor-pointer"
                  />
                </label>

                {/* 2. Thẻ quốc tế Visa / Mastercard */}
                <label
                  onClick={() => setPaymentMethod('CREDIT_CARD')}
                  className={`p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === 'CREDIT_CARD'
                      ? 'border-amber-600 bg-amber-50/40 shadow-xs ring-1 ring-amber-600/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
                      <CreditCard size={20} />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-slate-900 block">
                        Thẻ quốc tế Visa / Mastercard
                      </span>
                      <span className="text-xs text-slate-500">
                        Hỗ trợ thanh toán toàn cầu qua thẻ Visa, MasterCard, JCB bảo mật cao
                      </span>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="CREDIT_CARD"
                    checked={paymentMethod === 'CREDIT_CARD'}
                    onChange={() => setPaymentMethod('CREDIT_CARD')}
                    className="accent-amber-600 w-4 h-4 cursor-pointer"
                  />
                </label>

                {/* 3. Thanh toán trực tiếp tại quầy lễ tân */}
                <label
                  onClick={() => setPaymentMethod('RECEPTION')}
                  className={`p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === 'RECEPTION'
                      ? 'border-amber-600 bg-amber-50/40 shadow-xs ring-1 ring-amber-600/20'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-emerald-700 text-white flex items-center justify-center shrink-0">
                      <Building2 size={20} />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-slate-900 block">
                        Thanh toán trực tiếp tại quầy lễ tân
                      </span>
                      <span className="text-xs text-slate-500">
                        Nhận phòng và thanh toán bằng tiền mặt hoặc chuyển khoản tại quầy khi check-in
                      </span>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="RECEPTION"
                    checked={paymentMethod === 'RECEPTION'}
                    onChange={() => setPaymentMethod('RECEPTION')}
                    className="accent-amber-600 w-4 h-4 cursor-pointer"
                  />
                </label>
              </div>
            </div>

            {submitError && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-semibold text-rose-800 animate-in fade-in">
                {submitError}
              </div>
            )}

            {/* Nút bấm xác nhận thanh toán: Bị mờ (disabled) khi thiếu thông tin hoặc sai định dạng */}
            <Button
              id="btn-confirm-payment"
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              disabled={!isFormValid || isSubmitting}
              className="w-full py-4 text-base font-bold shadow-xl shadow-amber-600/25 cursor-pointer bg-[#C59D5F] hover:bg-[#b08b50] text-white disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Xác nhận thanh toán{totalAmount > 0 ? ` (${formatVND(totalAmount)})` : ''}
            </Button>

            <div className="flex items-center justify-center gap-2 text-xs text-slate-400 text-center">
              <ShieldCheck size={16} className="text-emerald-600" />
              <span>Giao dịch bảo mật 100% • Thông tin được mã hóa an toàn</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookingPaymentPage;
