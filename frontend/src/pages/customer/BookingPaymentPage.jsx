import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Badge from '../../components/common/Badge';
import { formatVND, formatDate } from '../../utils/formatters';
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
} from 'lucide-react';

export const BookingPaymentPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Đọc thông số truyền từ trang Chi tiết phòng
  const roomId = searchParams.get('roomId') || '101';
  const queryCheckIn = searchParams.get('checkIn') || '2026-09-20';
  const queryCheckOut = searchParams.get('checkOut') || '2026-09-23';
  const queryPhone = searchParams.get('phone') || '0912345678';

  // Thông tin phòng mẫu
  const room = {
    id: roomId,
    name: 'Phòng Deluxe Hướng Biển (Deluxe Ocean View)',
    type: 'Deluxe Ocean View',
    pricePerNight: 1450000,
    imageUrl:
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
    description:
      'Tầm nhìn toàn cảnh biển Sơn Trà thơ mộng. Thiết kế phong cách nhiệt đới hiện đại, sàn gỗ tự nhiên cao cấp, bồn tắm nằm ngắm biển, đầy đủ tiện nghi 5 sao quốc tế.',
    rating: 4.9,
    reviewsCount: 52,
  };

  // Tính số đêm lưu trú
  const calculateNights = () => {
    if (!queryCheckIn || !queryCheckOut) return 3;
    const start = new Date(queryCheckIn);
    const end = new Date(queryCheckOut);
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 3;
  };

  const nights = calculateNights();

  // State thông tin khách hàng
  const [formData, setFormData] = useState({
    fullName: 'Nguyễn Văn An',
    phone: queryPhone,
    email: 'an.nguyen@gmail.com',
    specialRequests: 'Yêu cầu phòng tầng cao, view biển thoáng mát.',
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
  const [isSuccess, setIsSuccess] = useState(false);

  // Tính toán chi phí
  const roomPriceSubtotal = room.pricePerNight * nights;
  const taxAndService = Math.round(roomPriceSubtotal * 0.1); // 10% thuế & phí
  const totalAmount = Math.max(0, roomPriceSubtotal + taxAndService - discount);

  // Xử lý áp dụng voucher
  const handleApplyVoucher = (e) => {
    e.preventDefault();
    if (!voucherCode.trim()) return;

    if (voucherCode.trim().toUpperCase() === 'LUXESTAY' || voucherCode.trim().toUpperCase() === 'GIAM100K') {
      setDiscount(100000);
      setVoucherMsg('Áp dụng mã giảm giá thành công (-100.000 ₫)');
    } else if (voucherCode.trim().toUpperCase() === 'VIP200') {
      setDiscount(200000);
      setVoucherMsg('Áp dụng voucher VIP thành công (-200.000 ₫)');
    } else {
      setDiscount(0);
      setVoucherMsg('Mã giảm giá không hợp lệ hoặc đã hết hạn.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isAgreed) {
      alert('Vui lòng đồng ý với điều khoản đặt phòng & chính sách để tiếp tục.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1200);
  };

  if (isSuccess) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-5">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 size={36} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 font-serif">
          Đặt Phòng & Xác Nhận Thành Công!
        </h2>
        <p className="text-sm text-slate-600">
          Mã đơn đặt phòng của bạn là <strong className="text-slate-900">#BK-9281</strong>. Chúng tôi đã gửi email xác nhận cùng hóa đơn điện tử về địa chỉ <span className="text-amber-600 font-medium">{formData.email}</span>.
        </p>
        <div className="pt-4 flex justify-center gap-3">
          <Button variant="primary" onClick={() => navigate('/my-bookings')}>
            Xem Lịch Sử Đặt Phòng
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
          {/* KHỐI 1: 1 ẢNH & THÔNG TIN GIỚI THIỆU VỀ PHÒNG */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
              <img
                src={room.imageUrl}
                alt={room.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 left-3">
                <Badge variant="amber">{room.type}</Badge>
              </div>
            </div>
            <div className="p-5 space-y-2">
              <div className="flex items-center gap-1 text-xs font-bold text-slate-800">
                <Star size={14} className="text-amber-500 fill-amber-500" />
                <span>{room.rating}</span>
                <span className="text-slate-400 font-normal">({room.reviewsCount} đánh giá)</span>
              </div>
              <h3 className="font-bold text-lg text-slate-900 font-serif">
                {room.name}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {room.description}
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
                <span className="text-slate-500">Loại phòng</span>
                <span className="font-bold text-slate-800">{room.type}</span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Calendar size={13} className="text-amber-600" />
                  <span>Ngày nhận phòng</span>
                </span>
                <span className="font-semibold text-slate-800">{formatDate(queryCheckIn)}</span>
              </div>

              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500 flex items-center gap-1.5">
                  <Calendar size={13} className="text-amber-600" />
                  <span>Ngày trả phòng</span>
                </span>
                <span className="font-semibold text-slate-800">{formatDate(queryCheckOut)}</span>
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
                  Giá phòng ({nights} đêm × {formatVND(room.pricePerNight)}):
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
                    placeholder="email@gmail.com"
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
                  onClick={() => setPaymentMethod('CASH')}
                  className={`p-4 rounded-2xl border-2 flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === 'CASH'
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
                    checked={paymentMethod === 'CASH'}
                    onChange={() => setPaymentMethod('CASH')}
                    className="accent-amber-600 w-4 h-4"
                  />
                </label>
              </div>
            </div>

            {/* Nút bấm xác nhận đặt phòng & thanh toán */}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              disabled={!isAgreed}
              className="w-full py-4 text-base font-bold shadow-xl shadow-amber-600/25 cursor-pointer"
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
