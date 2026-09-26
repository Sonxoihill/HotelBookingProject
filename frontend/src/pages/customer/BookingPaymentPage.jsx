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
import {
  ArrowLeft,
  CreditCard,
  QrCode,
  Building2,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Clock,
  TicketPercent,
  Check,
  Star,
  Hotel,
  Loader2,
} from 'lucide-react';

export const BookingPaymentPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Đọc thông số truyền từ trang trước
  const roomId = searchParams.get('roomId') || '1';
  const queryCheckIn = searchParams.get('checkIn') || '';
  const queryCheckOut = searchParams.get('checkOut') || '';
  const queryPhone = searchParams.get('phone') || '';

  // State phòng từ Database
  const [roomData, setRoomData] = useState(null);
  const [isLoadingRoom, setIsLoadingRoom] = useState(true);

  // State thông tin khách hàng
  const [formData, setFormData] = useState({
    fullName: '',
    phone: queryPhone || '',
    email: '',
    specialRequests: '',
  });

  // State phương thức thanh toán
  const [paymentMethod, setPaymentMethod] = useState('VNPAY');

  // State voucher giảm giá
  const [voucherCode, setVoucherCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [voucherMsg, setVoucherMsg] = useState('');

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
        const res = await roomService.getRoomById(roomId);
        const data = res?.data || res;
        setRoomData(data);

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
    ? `${category.name} (Phòng ${roomData?.roomNumber})`
    : `Phòng ${roomData?.roomNumber || roomId}`;
  const pricePerNight = category.basePrice || roomData?.basePrice || 500000;
  const imageUrl = category.imageUrl || roomData?.imageUrl || 'https://images.unsplash.com/photo-1590490360182-c33d57733427';
  const description = category.description || roomData?.description || 'Phòng nghỉ tiện nghi, sang trọng đẳng cấp quốc tế.';

  // Ngày nhận / trả phòng chuẩn hóa
  const checkInDate = queryCheckIn || '2026-10-15';
  const checkOutDate = queryCheckOut || '2026-10-18';

  // Tính số đêm lưu trú
  const calculateNights = () => {
    const start = new Date(checkInDate);
    const end = new Date(checkOutDate);
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  };

  const nights = calculateNights();

  // Tính toán chi phí
  const roomPriceSubtotal = pricePerNight * nights;
  const taxAndService = Math.round(roomPriceSubtotal * 0.1); // 10% thuế GTGT & phí dịch vụ
  const totalAmount = Math.max(0, roomPriceSubtotal + taxAndService - discount);

  // Xử lý áp dụng voucher
  const handleApplyVoucher = (e) => {
    e.preventDefault();
    if (!voucherCode.trim()) return;

    const code = voucherCode.trim().toUpperCase();
    if (code === 'LUXESTAY' || code === 'GIAM100K' || code === 'LETOILE2026') {
      setDiscount(100000);
      setVoucherMsg('Áp dụng mã giảm giá thành công (-100.000 ₫)');
    } else if (code === 'VIP200') {
      setDiscount(200000);
      setVoucherMsg('Áp dụng voucher VIP thành công (-200.000 ₫)');
    } else {
      setDiscount(0);
      setVoucherMsg('Mã giảm giá không hợp lệ hoặc đã hết hạn.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!isAgreed) {
      alert('Vui lòng đồng ý với điều khoản đặt phòng & chính sách để tiếp tục.');
      return;
    }

    if (!formData.fullName.trim() || !formData.phone.trim() || !formData.email.trim()) {
      setSubmitError('Vui lòng điền đầy đủ Họ và tên, Số điện thoại và Email!');
      return;
    }

    setIsSubmitting(true);
    try {
      // Gửi yêu cầu lưu vào cơ sở dữ liệu MySQL thật
      const res = await bookingService.createBooking({
        roomId: roomData?.id || Number(roomId) || 1,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        totalAmount: totalAmount,
        paymentMethod: paymentMethod,
        specialRequests: formData.specialRequests,
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim(),
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
        onClick={() => navigate(`/rooms/${roomId}`)}
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
              <img
                src={imageUrl}
                alt={roomName}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3">
                <Badge variant="amber">{category.name || 'Tiêu chuẩn'}</Badge>
              </div>
            </div>
            <div className="p-5 space-y-2">
              <div className="flex items-center gap-1 text-xs font-bold text-slate-800">
                <Star size={14} className="text-amber-500 fill-amber-500" />
                <span>4.9</span>
                <span className="text-slate-400 font-normal">(52 đánh giá từ khách)</span>
              </div>
              <h3 className="font-bold text-lg text-slate-900 font-serif">
                {roomName}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-light">
                {description}
              </p>
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

          {/* KHỐI 3: CHI TIẾT CHI PHÍ (GIÁ PHÒNG, THUẾ & DỊCH VỤ, GIẢM GIÁ, TỔNG TIỀN, Ô NHẬP VOUCHER, CHECKBOX ĐIỀU KHOẢN) */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
              Chi tiết chi phí
            </h3>

            {/* Ô nhập Voucher */}
            <form onSubmit={handleApplyVoucher} className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <TicketPercent size={14} className="text-amber-600" />
                <span>Mã giảm giá / Voucher</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nhập mã (VD: LUXESTAY, VIP200)"
                  value={voucherCode}
                  onChange={(e) => setVoucherCode(e.target.value)}
                  className="flex-1 uppercase text-xs border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                />
                <Button type="submit" variant="outline" size="sm" className="shrink-0 text-xs px-3">
                  Áp dụng
                </Button>
              </div>
              {voucherMsg && (
                <span
                  className={`text-[11px] block ${
                    discount > 0 ? 'text-emerald-600 font-semibold' : 'text-rose-500'
                  }`}
                >
                  {voucherMsg}
                </span>
              )}
            </form>

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

              {discount > 0 && (
                <div className="flex justify-between items-center text-emerald-600 font-semibold">
                  <span>Giảm giá (Voucher):</span>
                  <span>-{formatVND(discount)}</span>
                </div>
              )}

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
                <Input
                  label="Họ và tên *"
                  placeholder="Ví dụ: Nguyễn Văn An"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  required
                />

                <Input
                  label="Số điện thoại *"
                  type="tel"
                  placeholder="0912 345 678"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  required
                />

                <div className="sm:col-span-2">
                  <Input
                    label="Email nhận hóa đơn *"
                    type="email"
                    placeholder="email@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
                Phương thức thanh toán
              </h3>

              <div className="space-y-3">
                {/* 1. Cổng thanh toán VNPay (ATM, QR) */}
                <label
                  onClick={() => setPaymentMethod('VNPAY')}
                  className={`p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === 'VNPAY'
                      ? 'border-amber-600 bg-amber-50/40 shadow-xs'
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
                    checked={paymentMethod === 'VNPAY'}
                    onChange={() => setPaymentMethod('VNPAY')}
                    className="accent-amber-600 w-4 h-4"
                  />
                </label>

                {/* 2. Thẻ quốc tế Visa / Mastercard */}
                <label
                  onClick={() => setPaymentMethod('CARD')}
                  className={`p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === 'CARD'
                      ? 'border-amber-600 bg-amber-50/40 shadow-xs'
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
                    checked={paymentMethod === 'CARD'}
                    onChange={() => setPaymentMethod('CARD')}
                    className="accent-amber-600 w-4 h-4"
                  />
                </label>

                {/* 3. Thanh toán trực tiếp tại quầy lễ tân */}
                <label
                  onClick={() => setPaymentMethod('RECEPTION')}
                  className={`p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === 'RECEPTION' || paymentMethod === 'CASH'
                      ? 'border-amber-600 bg-amber-50/40 shadow-xs'
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
                    checked={paymentMethod === 'RECEPTION' || paymentMethod === 'CASH'}
                    onChange={() => setPaymentMethod('RECEPTION')}
                    className="accent-amber-600 w-4 h-4"
                  />
                </label>
              </div>
            </div>

            {submitError && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-semibold text-rose-800 animate-in fade-in">
                {submitError}
              </div>
            )}

            {/* Nút bấm xác nhận đặt phòng & thanh toán */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              disabled={!isAgreed}
              className="w-full py-4 text-base font-bold shadow-xl shadow-amber-600/25 cursor-pointer bg-[#C59D5F] hover:bg-[#b08b50] text-white"
            >
              Xác nhận Đặt phòng & Thanh toán ({formatVND(totalAmount)})
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
