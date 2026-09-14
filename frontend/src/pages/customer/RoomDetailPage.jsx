import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Users,
  Maximize2,
  Bed,
  Wifi,
  Coffee,
  Tv,
  Bath,
  Wind,
  ShieldCheck,
  Star,
  ArrowLeft,
  Calendar,
  Phone,
  CreditCard,
  Sparkles,
  Info,
  ChevronLeft,
  ChevronRight,
  X,
  ZoomIn,
} from 'lucide-react';
import { formatVND } from '../../utils/formatters';
import { tokenStorage } from '../../utils/tokenStorage';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Input from '../../components/common/Input';

export const RoomDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = tokenStorage.getUser();

  const room = {
    id: id || 101,
    name: 'Phòng Deluxe Hướng Biển (Deluxe Ocean View)',
    type: 'Deluxe',
    price: 1450000,
    size: 38,
    maxGuests: 2,
    bedType: '1 Giường đôi King size (2.0m x 2.0m)',
    rating: 4.9,
    reviewsCount: 52,
    description:
      'Phòng Deluxe Ocean View tại LuxeStay mang đến tầm nhìn toàn cảnh biển Sơn Trà thơ mộng. Thiết kế sang trọng pha trộn phong cách nhiệt đới hiện đại, sàn gỗ tự nhiên cao cấp, bồn tắm nằm nhìn ra đại dương cùng các trang thiết bị tiện nghi bậc nhất.',
    images: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1600&q=85',
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1600&q=85',
    ],
    amenities: [
      { name: 'Wi-Fi 5G tốc độ cao', icon: Wifi },
      { name: 'Bữa sáng Buffet miễn phí', icon: Coffee },
      { name: 'Smart TV LED 55 inch', icon: Tv },
      { name: 'Bồn tắm nằm view biển', icon: Bath },
      { name: 'Điều hòa 2 chiều lọc khí', icon: Wind },
    ],
  };

  // State quản lý ảnh hiển thị trên trang
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // State quản lý Lightbox phóng to ảnh
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // State quản lý thông tin đặt phòng
  const [checkIn, setCheckIn] = useState('2026-09-20');
  const [checkOut, setCheckOut] = useState('2026-09-23');
  const [phone, setPhone] = useState(currentUser?.phone || '0912345678');

  // Mở Lightbox phóng to
  const handleOpenLightbox = (index) => {
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  };

  // Chuyển ảnh lùi
  const handlePrevImage = () => {
    setLightboxIndex((prev) => (prev - 1 + room.images.length) % room.images.length);
  };

  // Chuyển ảnh tới
  const handleNextImage = () => {
    setLightboxIndex((prev) => (prev + 1) % room.images.length);
  };

  // Lắng nghe phím tắt điều hướng trong Lightbox (Mũi tên trái/phải & phím ESC)
  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsLightboxOpen(false);
      } else if (e.key === 'ArrowLeft') {
        handlePrevImage();
      } else if (e.key === 'ArrowRight') {
        handleNextImage();
      }
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isLightboxOpen]);

  // Tính số đêm lưu trú
  const calculateNights = () => {
    if (!checkIn || !checkOut) return 1;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  };

  const nights = calculateNights();
  const roomPriceSubtotal = room.price * nights;
  const taxAndServiceFee = Math.round(roomPriceSubtotal * 0.1); // 10% VAT và phí phục vụ
  const totalAmount = roomPriceSubtotal + taxAndServiceFee;

  const handleBookingProceed = () => {
    navigate(
      `/booking-payment?roomId=${room.id}&checkIn=${checkIn}&checkOut=${checkOut}&phone=${encodeURIComponent(
        phone
      )}`
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Nút quay lại */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
      >
        <ArrowLeft size={16} />
        <span>Quay lại danh sách phòng</span>
      </button>

      {/* Bố cục 2 cột cân xứng 50/50: Trái (Ảnh & Mô tả 50%) - Phải (Thông tin phòng & Đặt phòng 50%) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10 items-start">
        {/* =================================================================== */}
        {/* CỘT TRÁI (50%): BỘ SƯU TẬP ẢNH & TIỆN NGHI PHÒNG                    */}
        {/* =================================================================== */}
        <div className="space-y-6">
          {/* Khung ảnh chính (Nhấp để phóng to toàn màn hình) */}
          <div className="space-y-3">
            <div
              onClick={() => handleOpenLightbox(activeImageIndex)}
              className="relative aspect-[16/11] rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 shadow-md cursor-pointer group"
            >
              <img
                src={room.images[activeImageIndex]}
                alt={room.name}
                className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
              />

              {/* Lớp phủ & Nút báo nhấp phóng to */}
              <div className="absolute inset-0 bg-slate-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="px-4 py-2 rounded-full bg-white/95 text-slate-900 text-xs font-bold flex items-center gap-2 shadow-xl backdrop-blur-xs transform translate-y-2 group-hover:translate-y-0 transition-transform">
                  <ZoomIn size={16} className="text-amber-600" />
                  <span>Nhấp để phóng to ảnh</span>
                </div>
              </div>

              {/* Huy hiệu số lượng ảnh */}
              <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-slate-900/70 text-white text-[11px] font-semibold backdrop-blur-xs">
                {activeImageIndex + 1} / {room.images.length}
              </div>
            </div>

            {/* Dải ảnh thu nhỏ (thumbnails) */}
            <div className="grid grid-cols-4 gap-2.5">
              {room.images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  onDoubleClick={() => handleOpenLightbox(idx)}
                  className={`aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all cursor-pointer relative group ${activeImageIndex === idx
                    ? 'border-amber-600 ring-2 ring-amber-500/20 shadow-xs'
                    : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                >
                  <img
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>

          {/* Mô tả chi tiết & Tiện nghi phòng */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
              Giới thiệu không gian phòng
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed font-normal">
              {room.description}
            </p>

            {/* Tiện nghi phòng */}
            <div className="pt-2">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                Tiện nghi phòng nghỉ
              </h4>
              <div className="grid grid-cols-2 gap-2.5">
                {room.amenities.map((item, idx) => {
                  const Icon = item.icon;
                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-100 text-slate-700 text-xs font-medium"
                    >
                      <Icon size={15} className="text-amber-600 shrink-0" />
                      <span className="truncate">{item.name}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* =================================================================== */}
        {/* CỘT PHẢI (50%): THÔNG TIN PHÒNG + THÔNG TIN ĐẶT PHÒNG               */}
        {/* =================================================================== */}
        <div className="space-y-6">
          {/* KHỐI 1: THÔNG TIN PHÒNG (DIỆN TÍCH, SỨC CHỨA, GIƯỜNG) */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div>
              <div className="flex items-center gap-2.5 mb-2">
                <Badge variant="amber">{room.type}</Badge>
                <div className="flex items-center gap-1 text-xs font-bold text-slate-800">
                  <Star size={14} className="text-amber-500 fill-amber-500" />
                  <span>{room.rating}</span>
                  <span className="text-slate-400 font-normal">
                    ({room.reviewsCount} đánh giá từ khách)
                  </span>
                </div>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-serif leading-snug">
                {room.name}
              </h1>
            </div>

            {/* 3 Thông số cốt lõi: Diện tích, Sức chứa, Giường */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
              {/* 1. Diện tích */}
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/60 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                  <Maximize2 size={20} />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider block">
                    Diện tích
                  </span>
                  <span className="text-base font-extrabold text-slate-900">
                    {room.size} m²
                  </span>
                </div>
              </div>

              {/* 2. Sức chứa */}
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/60 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                  <Users size={20} />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-blue-800 uppercase tracking-wider block">
                    Sức chứa
                  </span>
                  <span className="text-base font-extrabold text-slate-900">
                    {room.maxGuests} Người lớn
                  </span>
                </div>
              </div>

              {/* 3. Giường */}
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/60 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                  <Bed size={20} />
                </div>
                <div>
                  <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider block">
                    Loại giường
                  </span>
                  <span className="text-sm font-bold text-slate-900 line-clamp-1" title={room.bedType}>
                    King Size
                  </span>
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-500 flex items-center gap-1.5 bg-slate-50 p-3 rounded-xl">
              <Info size={14} className="text-slate-400 shrink-0" />
              <span>Quy cách giường: {room.bedType}. Miễn phí cũi trẻ em dưới 2 tuổi theo yêu cầu.</span>
            </div>
          </div>

          {/* KHỐI 2: THÔNG TIN ĐẶT PHÒNG (CHECK-IN, CHECK-OUT, SỐ ĐIỆN THOẠI, GIÁ PHÒNG, THUẾ & DỊCH VỤ, TỔNG TIỀN) */}
          <div className="bg-white rounded-3xl border-2 border-amber-500/20 p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Calendar size={18} className="text-amber-600" />
                <span>Thông tin đặt phòng</span>
              </h2>
              <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                {formatVND(room.price)} / đêm
              </span>
            </div>

            {/* Các trường nhập: Check-in, Check-out, Số điện thoại */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Ngày nhận phòng */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Calendar size={14} className="text-amber-600" />
                  <span>Ngày nhận phòng*</span>
                </label>
                <input
                  type="date"
                  value={checkIn}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className="w-full text-xs font-medium border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 bg-slate-50/50"
                  required
                />
              </div>

              {/* Ngày trả phòng */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                  <Calendar size={14} className="text-amber-600" />
                  <span>Ngày trả phòng*</span>
                </label>
                <input
                  type="date"
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="w-full text-xs font-medium border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 bg-slate-50/50"
                  required
                />
              </div>

              {/* Số điện thoại người đặt */}
              <div className="sm:col-span-2">
                <Input
                  label="Số điện thoại liên hệ nhận phòng *"
                  type="tel"
                  icon={Phone}
                  placeholder="Ví dụ: 0912 345 678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Bảng kê khai chi phí minh bạch */}
            <div className="bg-slate-50 rounded-2xl p-4.5 space-y-3 border border-slate-200/70">
              <span className="text-xs font-bold text-slate-800 block uppercase tracking-wider">
                Bảng chi tiết giá thanh toán
              </span>

              <div className="space-y-2 text-xs text-slate-600">
                {/* 1. Giá phòng */}
                <div className="flex items-center justify-between">
                  <span>
                    Giá phòng ({nights} đêm × {formatVND(room.price)}):
                  </span>
                  <span className="font-bold text-slate-900">
                    {formatVND(roomPriceSubtotal)}
                  </span>
                </div>

                {/* 2. Thuế & dịch vụ */}
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <span>Thuế GTGT & Phí dịch vụ (10%):</span>
                  </span>
                  <span className="font-bold text-slate-900">
                    {formatVND(taxAndServiceFee)}
                  </span>
                </div>
              </div>

              {/* 3. Tổng tiền */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Tổng tiền thanh toán
                  </span>
                  <span className="text-[11px] text-emerald-600 font-semibold">
                    (Đã bao gồm toàn bộ thuế & phí)
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-2xl sm:text-3xl font-black text-amber-600 tracking-tight">
                    {formatVND(totalAmount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Nút bấm đặt phòng */}
            <Button
              type="button"
              variant="primary"
              size="lg"
              onClick={handleBookingProceed}
              className="w-full py-3.5 text-base font-bold shadow-xl shadow-amber-600/25 cursor-pointer"
            >
              Tiến hành Đặt phòng & Thanh toán
            </Button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 text-center">
              <ShieldCheck size={14} className="text-emerald-600" />
              <span>Xác nhận tức thì • Hủy miễn phí trước ngày nhận phòng 48 giờ</span>
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* LIGHTBOX MODAL: PHÓNG TO ẢNH & ĐIỀU HƯỚNG CHUYỂN TIẾP CÁC ẢNH       */}
      {/* ===================================================================== */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 select-none animate-in fade-in duration-200">
          {/* Top bar của Lightbox */}
          <div className="flex items-center justify-between text-white z-10">
            <div>
              <h3 className="text-sm sm:text-base font-bold truncate max-w-md">
                {room.name}
              </h3>
              <p className="text-xs text-slate-400">
                Ảnh {lightboxIndex + 1} trên tổng số {room.images.length} ảnh
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="Đóng (Phím ESC)"
            >
              <X size={24} />
            </button>
          </div>

          {/* Vùng hiển thị ảnh phóng to ở trung tâm kèm 2 nút chuyển tiếp */}
          <div className="relative flex-1 flex items-center justify-center my-4 overflow-hidden">
            {/* Nút lùi ảnh (Trái) */}
            <button
              type="button"
              onClick={handlePrevImage}
              className="absolute left-2 sm:left-6 z-20 p-3 rounded-full bg-black/50 hover:bg-amber-600 text-white transition-all transform hover:scale-110 cursor-pointer shadow-xl backdrop-blur-xs"
              title="Ảnh trước (Mũi tên trái)"
            >
              <ChevronLeft size={28} />
            </button>

            {/* Ảnh phóng to chính */}
            <div className="max-w-5xl max-h-[75vh] w-full h-full flex items-center justify-center p-2">
              <img
                src={room.images[lightboxIndex]}
                alt={`${room.name} - ${lightboxIndex + 1}`}
                className="max-h-[75vh] max-w-full object-contain rounded-2xl shadow-2xl transition-all duration-300 animate-in zoom-in-95"
              />
            </div>

            {/* Nút tới ảnh (Phải) */}
            <button
              type="button"
              onClick={handleNextImage}
              className="absolute right-2 sm:right-6 z-20 p-3 rounded-full bg-black/50 hover:bg-amber-600 text-white transition-all transform hover:scale-110 cursor-pointer shadow-xl backdrop-blur-xs"
              title="Ảnh tiếp theo (Mũi tên phải)"
            >
              <ChevronRight size={28} />
            </button>
          </div>

          {/* Dải thumbnail thu nhỏ dưới đáy Lightbox để nhảy ảnh nhanh */}
          <div className="flex items-center justify-center gap-3 overflow-x-auto py-2 z-10">
            {room.images.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setLightboxIndex(idx)}
                className={`w-16 h-12 rounded-lg overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${lightboxIndex === idx
                  ? 'border-amber-500 scale-105 shadow-md shadow-amber-500/30'
                  : 'border-white/30 opacity-50 hover:opacity-100'
                  }`}
              >
                <img
                  src={img}
                  alt={`Thumbnail mini ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoomDetailPage;
