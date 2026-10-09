import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
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
  Sparkles,
  ChevronLeft,
  ChevronRight,
  X,
  ZoomIn,
  MessageSquare,
  DoorClosed,
  Home,
  BedDouble,
  Car,
  Shirt,
  Bike,
  Utensils,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { formatVND } from '../../utils/formatters';
import { tokenStorage } from '../../utils/tokenStorage';
import { roomService } from '../../services/roomService';
import { reviewService } from '../../services/reviewService';
import { serviceService } from '../../services/serviceService';
import { userService } from '../../services/userService';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Input from '../../components/common/Input';

export const RoomDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = tokenStorage.getUser();

  const [roomData, setRoomData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [isNotFound, setIsNotFound] = useState(false);
  const [services, setServices] = useState([]);

  // Đánh giá của khách hàng lấy qua reviewService
  const [reviewsData, setReviewsData] = useState({
    averageRating: 0,
    totalReviews: 0,
    reviews: [],
  });
  const [isLoadingReviews, setIsLoadingReviews] = useState(true);
  const [reviewsError, setReviewsError] = useState(null);
  const reviewsRef = useRef(null);

  // Tải thông tin phòng và dịch vụ trực tiếp từ cơ sở dữ liệu
  useEffect(() => {
    const fetchRoomAndServices = async () => {
      setIsLoading(true);
      setFetchError(null);
      setIsNotFound(false);

      // Nếu ID trên URL không hợp lệ (không phải số nguyên dương)
      if (!id || isNaN(Number(id)) || Number(id) <= 0) {
        setIsNotFound(true);
        setIsLoading(false);
        return;
      }

      try {
        const res = await roomService.getRoomById(id);
        const rawData = res?.data || res;
        const data = rawData?.data || rawData;
        if (!data || (!data.id && !data.category)) {
          setIsNotFound(true);
          return;
        }
        setRoomData(data);
        if (data?.reviews !== undefined) {
          setReviewsData({
            averageRating: Number(data.averageRating) || 0,
            totalReviews: Number(data.totalReviews) || (Array.isArray(data.reviews) ? data.reviews.length : 0),
            reviews: Array.isArray(data.reviews) ? data.reviews : [],
          });
          setIsLoadingReviews(false);
          setReviewsError(null);
        }
      } catch (err) {
        console.warn('Lỗi tải chi tiết phòng:', err);
        const is404 =
          err?.status === 404 ||
          err?.response?.status === 404 ||
          String(err?.message || '').includes('404') ||
          String(err?.message || '').toLowerCase().includes('không tìm thấy') ||
          String(err?.message || '').toLowerCase().includes('not found');

        if (is404) {
          setIsNotFound(true);
        } else {
          setFetchError('Không thể kết nối đến máy chủ. Vui lòng thử lại sau.');
        }
      } finally {
        setIsLoading(false);
      }

      // Tải danh sách dịch vụ đi kèm từ CSDL (tương đồng với danh sách phòng)
      try {
        const srvRes = await serviceService.getServices();
        const srvRaw = srvRes?.data || srvRes || [];
        const srvList = Array.isArray(srvRaw) ? srvRaw : (srvRaw?.content || []);
        setServices(srvList.filter((s) => s.status === 'ACTIVE' || !s.status));
      } catch (srvErr) {
        console.warn('Lỗi tải danh mục dịch vụ đi kèm:', srvErr);
      }
    };

    fetchRoomAndServices();
  }, [id]);

  const [searchParams] = useSearchParams();
  const queryCheckIn = searchParams.get('checkIn');
  const queryCheckOut = searchParams.get('checkOut');
  const queryPhone = searchParams.get('phone');

  // Khởi tạo ngày động theo ngày thực tế (không dùng ngày cứng)
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const nextThreeDays = new Date(today);
  nextThreeDays.setDate(nextThreeDays.getDate() + 3);

  const defaultCheckIn = tomorrow.toISOString().split('T')[0];
  const defaultCheckOut = nextThreeDays.toISOString().split('T')[0];

  // Helper tính ngày kế tiếp
  const getNextDateISO = (baseDateStr) => {
    const base = baseDateStr ? new Date(baseDateStr) : new Date();
    const next = new Date(base);
    next.setDate(next.getDate() + 1);
    return next.toISOString().split('T')[0];
  };

  const category = roomData?.category || {};
  const roomName = roomData?.roomName || (category.name
    ? (roomData?.roomNumber ? `${category.name} (Phòng ${roomData.roomNumber})` : category.name)
    : (roomData?.roomNumber ? `Phòng ${roomData.roomNumber}` : `Phòng #${id}`));
  const basePrice = roomData?.pricePerNight || roomData?.basePrice || category.basePrice || 0;
  const capacity = roomData?.capacity || category.capacity || 0;
  const bedType = roomData?.bedType || category.bedType || '';
  const description = roomData?.description || category.description || '';
  // Diện tích từ cột area trong CSDL
  const size = roomData?.area || category.area || 0;

  // Ảnh phòng lấy 100% từ CSDL (cột images, imageUrls hoặc imageUrl), không dùng dữ liệu/ảnh mẫu
  let dbImages = [];
  if (Array.isArray(roomData?.images) && roomData.images.length > 0) {
    dbImages = roomData.images.filter(Boolean);
  } else if (Array.isArray(roomData?.imageUrls) && roomData.imageUrls.length > 0) {
    dbImages = roomData.imageUrls.filter(Boolean);
  } else if (typeof category.images === 'string' && category.images.trim()) {
    dbImages = category.images.split(',').map((u) => u.trim()).filter(Boolean);
  } else if (Array.isArray(category.images) && category.images.length > 0) {
    dbImages = category.images.filter(Boolean);
  }

  const mainImage = roomData?.imageUrl || category.imageUrl || (dbImages.length > 0 ? dbImages[0] : '');
  const images = dbImages.length > 0 ? dbImages : (mainImage ? [mainImage] : []);

  // Helper chọn icon đại diện cho dịch vụ
  const getServiceIcon = (name = '') => {
    const lower = String(name).toLowerCase();
    if (lower.includes('sáng') || lower.includes('buffet') || lower.includes('ăn')) return Utensils;
    if (lower.includes('xe') && (lower.includes('đưa') || lower.includes('sân bay') || lower.includes('ô tô'))) return Car;
    if (lower.includes('giặt') || lower.includes('là') || lower.includes('sấy')) return Shirt;
    if (lower.includes('xe máy') || lower.includes('moto') || lower.includes('thuê xe')) return Bike;
    if (lower.includes('cà phê') || lower.includes('nước uống')) return Coffee;
    return Sparkles;
  };

  // Danh sách tiện nghi phòng nghỉ lấy 100% từ cơ sở dữ liệu (cột amenities và bedType), không dùng dữ liệu tạo sẵn
  const parseAmenities = () => {
    const rawAmenities = roomData?.amenities || category.amenities;
    let list = [];
    if (Array.isArray(rawAmenities)) {
      list = rawAmenities.filter(Boolean);
    } else if (typeof rawAmenities === 'string' && rawAmenities.trim()) {
      list = rawAmenities.split(',').map((a) => a.trim()).filter(Boolean);
    }

    const bed = roomData?.bedType || category.bedType;
    if (bed && !list.includes(bed)) {
      list.unshift(bed);
    }

    // Hợp nhất danh sách không trùng lặp từ CSDL
    const mergedNames = Array.from(new Set(list));

    return mergedNames.map((name) => {
      let Icon = Sparkles;
      const lower = String(name).toLowerCase();
      if (lower.includes('wi-fi') || lower.includes('wifi') || lower.includes('mạng')) Icon = Wifi;
      else if (lower.includes('sáng') || lower.includes('buffet') || lower.includes('cà phê') || lower.includes('ấm đun') || lower.includes('nước khoáng')) Icon = Coffee;
      else if (lower.includes('tv') || lower.includes('tivi') || lower.includes('truyền hình')) Icon = Tv;
      else if (lower.includes('bồn tắm') || lower.includes('tắm') || lower.includes('vòi sen') || lower.includes('jacuzzi')) Icon = Bath;
      else if (lower.includes('điều hòa') || lower.includes('khí') || lower.includes('lạnh')) Icon = Wind;
      else if (lower.includes('két') || lower.includes('bảo mật') || lower.includes('an toàn')) Icon = ShieldCheck;
      else if (lower.includes('giường') || lower.includes('nệm') || lower.includes('bed')) Icon = Bed;
      else if (lower.includes('tầm nhìn') || lower.includes('ban công') || lower.includes('khu vực')) Icon = Maximize2;
      return { name: String(name), icon: Icon };
    });
  };

  const amenities = parseAmenities();

  const scrollToReviews = () => {
    if (reviewsRef.current) {
      reviewsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Tải danh sách đánh giá của phòng từ reviewService (Kết nối trực tiếp API Backend)
  useEffect(() => {
    const fetchReviews = async () => {
      if (!id) return;
      setIsLoadingReviews(true);
      setReviewsError(null);
      try {
        const res = await reviewService.getRoomReviews(id);
        const rawData = res?.data || res;
        const data = rawData?.data || rawData;
        if (data && (Array.isArray(data.reviews) || data.totalReviews !== undefined)) {
          setReviewsData({
            averageRating: Number(data.averageRating) || 0,
            totalReviews: Number(data.totalReviews) || (Array.isArray(data.reviews) ? data.reviews.length : 0),
            reviews: Array.isArray(data.reviews) ? data.reviews : [],
          });
          setReviewsError(null);
        }
      } catch (err) {
        console.warn('Ghi chú khi gọi API reviewService.getRoomReviews:', err?.message);
        // Nếu roomData chưa có dữ liệu đánh giá trả về từ getRoomById, mới hiển thị thông báo lỗi
        if (!roomData?.reviews) {
          setReviewsError(err?.message || 'Không thể kết nối đến API Đánh giá của máy chủ.');
        }
      } finally {
        setIsLoadingReviews(false);
      }
    };

    fetchReviews();
  }, [id, roomData?.reviews]);

  const room = {
    id: roomData?.id || id,
    roomNumber: roomData?.roomNumber || '',
    floor: roomData?.floor || null,
    status: roomData?.status || '',
    name: roomName,
    type: category.name || '',
    price: basePrice,
    size: size,
    maxGuests: capacity,
    bedType: bedType,
    rating: reviewsData.averageRating,
    reviewsCount: reviewsData.totalReviews,
    description: description,
    images: images,
    amenities: amenities,
  };

  // Hàm hiển thị số sao sáng chuẩn xác theo điểm số (hỗ trợ cả nửa sao ví dụ 4.5/5)
  const renderRatingStars = (ratingValue, size = 14) => {
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

  // State quản lý ảnh hiển thị trên trang
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // State quản lý Lightbox phóng to ảnh
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Lấy số điện thoại từ hồ sơ người dùng lưu trong localStorage / token
  const storedUser = tokenStorage.getUser() || {};
  const profilePhone = storedUser?.phone || '';

  // State quản lý thông tin đặt phòng
  const [checkIn, setCheckIn] = useState(queryCheckIn || defaultCheckIn);
  const [checkOut, setCheckOut] = useState(queryCheckOut || defaultCheckOut);
  const [phone, setPhone] = useState(profilePhone || queryPhone || '');
  const [phoneTouched, setPhoneTouched] = useState(Boolean(profilePhone || queryPhone));

  // Tự động điền số điện thoại theo số trong profile từ API khi người dùng đã đăng nhập
  useEffect(() => {
    const fetchProfilePhone = async () => {
      if (tokenStorage.isAuthenticated()) {
        try {
          const res = await userService.getProfile();
          const profile = res?.data || res;
          if (profile?.phone) {
            setPhone(profile.phone);
            setPhoneTouched(true);
            const current = tokenStorage.getUser() || {};
            tokenStorage.setUser({ ...current, ...profile });
          }
        } catch (_) {}
      }
    };

    fetchProfilePhone();
  }, []);

  // 1. Validate Ngày nhận phòng & Ngày trả phòng
  const dateError = useMemo(() => {
    if (!checkIn) return 'Vui lòng chọn ngày nhận phòng';
    if (!checkOut) return 'Vui lòng chọn ngày trả phòng';
    if (checkOut <= checkIn) {
      return 'Ngày trả phòng phải sau ngày nhận phòng';
    }
    return '';
  }, [checkIn, checkOut]);

  const isDateValid = !dateError;

  // 2. Validate Số điện thoại theo đúng regex: /^(0|\+84)[35789]\d{8}$/
  const cleanedPhone = (phone || '').trim().replace(/\s+/g, '');
  const phoneError = useMemo(() => {
    if (!cleanedPhone) {
      return phoneTouched ? 'Vui lòng nhập số điện thoại' : '';
    }
    if (!/^(0|\+84)[35789]\d{8}$/.test(cleanedPhone)) {
      return 'Số điện thoại không đúng định dạng';
    }
    return '';
  }, [cleanedPhone, phoneTouched]);

  const isPhoneValid = Boolean(cleanedPhone && /^(0|\+84)[35789]\d{8}$/.test(cleanedPhone));

  // 3. Điều kiện bắt buộc để được phép ấn sang bước thanh toán
  const isBookingFormValid = isDateValid && isPhoneValid;

  const handlePhoneChange = (e) => {
    setPhone(e.target.value);
    setPhoneTouched(true);
  };

  // Mở Lightbox phóng to
  const handleOpenLightbox = (index) => {
    if (!room.images || room.images.length === 0) return;
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  };

  // Chuyển ảnh lùi
  const handlePrevImage = () => {
    if (!room.images || room.images.length === 0) return;
    setLightboxIndex((prev) => (prev - 1 + room.images.length) % room.images.length);
  };

  // Chuyển ảnh tới
  const handleNextImage = () => {
    if (!room.images || room.images.length === 0) return;
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

  // Tính số đêm lưu trú an toàn
  const calculateNights = () => {
    if (!checkIn || !checkOut || checkOut <= checkIn) return 0;
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const nights = calculateNights();
  const roomPriceSubtotal = room.price * nights;
  const taxAndServiceFee = Math.round(roomPriceSubtotal * 0.1); // 10% VAT và phí phục vụ
  const totalAmount = roomPriceSubtotal + taxAndServiceFee;

  const handleBookingProceed = () => {
    setPhoneTouched(true);
    if (!isBookingFormValid) return;
    navigate(
      `/booking-payment?roomId=${room.id}&checkIn=${checkIn}&checkOut=${checkOut}&phone=${encodeURIComponent(
        cleanedPhone
      )}`
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-stone-500 font-medium">Đang tải thông tin chi tiết phòng từ CSDL...</span>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-stone-500 font-medium">Đang tải thông tin chi tiết phòng từ CSDL...</span>
      </div>
    );
  }

  // MÀN HÌNH 404 CUSTOM KHI TRUY CẬP ID KHÔNG TỒN TẠI (TUYỆT ĐỐI KHÔNG MÀN HÌNH TRẮNG HOẶC LỘ CODE LỖI)
  if (isNotFound) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16">
        <div className="max-w-md w-full bg-white rounded-3xl border border-stone-200 p-8 sm:p-10 text-center shadow-lg space-y-6">
          {/* Icon minh họa 404 sang trọng */}
          <div className="relative mx-auto w-20 h-20 rounded-3xl bg-amber-50 border border-amber-200/80 flex items-center justify-center text-amber-700 shadow-inner">
            <DoorClosed size={40} className="stroke-[1.75]" />
            <span className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full bg-stone-900 text-[#F7DFBC] text-[10px] font-bold uppercase tracking-wider shadow-xs">
              404
            </span>
          </div>

          <div className="space-y-2">
            <span className="inline-block text-[11px] font-bold text-amber-800 bg-amber-100/70 px-3 py-1 rounded-full uppercase tracking-wider">
              Không tìm thấy thông tin
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 font-serif">
              Phòng không tồn tại
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 leading-relaxed max-w-sm mx-auto">
              Phòng bạn đang tìm kiếm (mã #{id}) không tồn tại trên hệ thống, đã ngừng hoạt động hoặc đường dẫn truy cập không chính xác.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => navigate('/rooms')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold cursor-pointer transition-all shadow-xs hover:scale-102"
            >
              <BedDouble size={16} />
              <span>Xem danh sách phòng</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold cursor-pointer transition-all hover:scale-102"
            >
              <Home size={16} />
              <span>Về trang chủ</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // MÀN HÌNH BÁO SỰ CỐ KẾT NỐI MÁY CHỦ THÂN THIỆN (KHÔNG LỘ CODE LỖI HAY STACKTRACE)
  if (fetchError || !roomData) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-16">
        <div className="max-w-md w-full bg-white rounded-3xl border border-stone-200 p-8 sm:p-10 text-center shadow-lg space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center">
            <AlertTriangle size={32} />
          </div>
          <div className="space-y-2">
            <h3 className="text-stone-900 font-bold text-lg sm:text-xl font-serif">
              Tạm thời không thể tải dữ liệu
            </h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
              Hệ thống tạm thời không thể kết nối đến máy chủ hoặc đường truyền mạng bị gián đoạn. Quý khách vui lòng thử tải lại sau ít phút.
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold cursor-pointer transition-colors shadow-xs"
            >
              <RotateCcw size={15} />
              <span>Thử tải lại</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/rooms')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold cursor-pointer transition-colors"
            >
              <ArrowLeft size={15} />
              <span>Quay lại danh sách phòng</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

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
            {room.images && room.images.length > 0 ? (
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
            ) : (
              <div className="aspect-[16/11] rounded-3xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 text-xs font-medium">
                Chưa có hình ảnh trong cơ sở dữ liệu
              </div>
            )}

            {/* Dải ảnh thu nhỏ (thumbnails) - Chỉ hiển thị khi có từ 2 ảnh trở lên trong DB */}
            {room.images && room.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2.5">
                {room.images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    onDoubleClick={() => handleOpenLightbox(idx)}
                    className={`aspect-[4/3] rounded-xl overflow-hidden border-2 transition-all cursor-pointer relative group ${
                      activeImageIndex === idx
                        ? 'border-amber-600 ring-2 ring-amber-500/20 shadow-xs'
                        : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Ảnh ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Mô tả chi tiết không gian phòng */}
          {room.description && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-3">
              <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-2">
                Giới thiệu không gian phòng
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-normal">
                {room.description}
              </p>
            </div>
          )}

          {/* DỊCH VỤ, TIỆN NGHI PHÒNG NGHỈ (GỘP THÀNH 1 Ô DUY NHẤT, 100% DỮ LIỆU TỪ DATABASE) */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Dịch vụ, tiện nghi phòng nghỉ
                </h3>
                <p className="text-[11px] text-slate-400 font-light mt-0.5">
                  Dữ liệu tiện nghi và dịch vụ trích xuất trực tiếp từ cơ sở dữ liệu
                </p>
              </div>
              {(room.amenities.length > 0 || services.length > 0) && (
                <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/60">
                  {room.amenities.length + services.length} tiện ích & dịch vụ
                </span>
              )}
            </div>

            {/* 1. Tiện nghi phòng nghỉ từ Database */}
            {room.amenities && room.amenities.length > 0 && (
              <div className="space-y-2.5">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                  Tiện nghi phòng
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {room.amenities.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-2.5 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-slate-700 text-xs font-medium hover:bg-amber-50/50 hover:border-amber-200/50 transition-colors"
                      >
                        <Icon size={16} className="text-amber-600 shrink-0" />
                        <span className="truncate">{item.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 2. Dịch vụ đi kèm từ Database */}
            {services && services.length > 0 && (
              <div className="space-y-2.5 pt-3 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                  Dịch vụ đi kèm
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {services.map((srv) => {
                    const SrvIcon = getServiceIcon(srv.name);
                    return (
                      <div
                        key={srv.id}
                        className="p-3.5 rounded-2xl bg-stone-50/80 hover:bg-[#FAF6F0] border border-stone-200/80 hover:border-[#F7DFBC] transition-all flex items-start gap-3 group"
                      >
                        <div className="w-9 h-9 rounded-xl bg-white border border-stone-200 flex items-center justify-center text-amber-700 shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                          <SrvIcon size={18} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-1">
                            <h4 className="text-xs font-bold text-stone-900 truncate">
                              {srv.name}
                            </h4>
                            {srv.price > 0 ? (
                              <span className="text-[11px] font-mono font-bold text-amber-800 shrink-0">
                                +{formatVND(srv.price)}
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded shrink-0">
                                Miễn phí
                              </span>
                            )}
                          </div>
                          {srv.description && (
                            <p className="text-[11px] text-stone-500 font-light mt-1 line-clamp-2 leading-relaxed">
                              {srv.description}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {(!room.amenities || room.amenities.length === 0) && (!services || services.length === 0) && (
              <p className="text-xs text-slate-400 italic">
                Chưa có thông tin dịch vụ, tiện nghi trong cơ sở dữ liệu.
              </p>
            )}

            <div className="pt-2 border-t border-slate-100 flex items-center gap-2 text-[11px] text-stone-500 font-light">
              <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
              <span>Quý khách có thể lựa chọn dịch vụ này khi tiến hành đặt phòng hoặc đăng ký với lễ tân.</span>
            </div>
          </div>
        </div>

        {/* =================================================================== */}
        {/* CỘT PHẢI (50%): THÔNG TIN PHÒNG + THÔNG TIN ĐẶT PHÒNG               */}
        {/* =================================================================== */}
        <div className="space-y-6">
          {/* KHỐI 1: THÔNG TIN PHÒNG (DIỆN TÍCH, SỨC CHỨA, GIƯỜNG) */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-5">
            {/* Header thông tin phòng & Nút Xem đánh giá góc trên bên phải theo ảnh yêu cầu */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2.5 mb-2">
                  {room.type && <Badge variant="amber">{room.type}</Badge>}
                  {room.reviewsCount > 0 ? (
                    <button
                      type="button"
                      onClick={scrollToReviews}
                      className="flex items-center gap-1.5 text-xs font-bold text-slate-800 hover:text-amber-700 transition-colors cursor-pointer"
                      title="Xem các đánh giá từ khách hàng"
                    >
                      {renderRatingStars(room.rating, 13)}
                      <span>{room.rating}</span>
                      <span className="text-slate-400 font-normal">
                        ({room.reviewsCount} đánh giá từ khách)
                      </span>
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400 font-normal">
                      (Chưa có đánh giá)
                    </span>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-serif leading-snug">
                  {room.name}
                </h1>
              </div>

              {/* NÚT XEM ĐÁNH GIÁ (GÓC TRÊN BÊN PHẢI) */}
              <button
                type="button"
                onClick={scrollToReviews}
                className="px-3.5 py-2 rounded-2xl text-xs font-bold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/90 transition-all flex items-center gap-1.5 cursor-pointer shrink-0 shadow-2xs hover:scale-105 active:scale-95 group"
                title="Xem đánh giá của khách hàng từ cơ sở dữ liệu"
              >
                <MessageSquare size={14} className="text-amber-600 group-hover:scale-110 transition-transform" />
                <span>Xem đánh giá</span>
              </button>
            </div>

            {/* 3 Thông số cốt lõi: Diện tích, Sức chứa, Giường (từ CSDL) */}
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
                    {room.size > 0 ? `${room.size} m²` : '---'}
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
                    {room.maxGuests > 0 ? `${room.maxGuests} người` : '---'}
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
                    {room.bedType || '---'}
                  </span>
                </div>
              </div>
            </div>

            {/* Thông tin phòng trực tiếp từ CSDL: Vị trí tầng, Số phòng, Tình trạng phòng */}
            {(room.floor || room.roomNumber || room.status) && (
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                {room.floor && (
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="text-slate-400">Vị trí:</span>
                    <span className="font-bold text-slate-800">Tầng {room.floor}</span>
                  </span>
                )}
                {room.roomNumber && (
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="text-slate-400">Số phòng:</span>
                    <span className="font-bold text-slate-800">{room.roomNumber}</span>
                  </span>
                )}
                {room.status && (
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="text-slate-400">Tình trạng:</span>
                    <span className={`font-bold ${room.status === 'AVAILABLE' ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {room.status === 'AVAILABLE' ? 'Sẵn sàng đón khách' : room.status}
                    </span>
                  </span>
                )}
              </div>
            )}

            {/* Tiện nghi & Dịch vụ đi kèm tương đồng với Danh sách phòng */}
            {services.length > 0 && (
              <div className="pt-1">
                <span className="text-[11px] font-semibold text-stone-500 uppercase tracking-wider block mb-2">
                  Dịch vụ tiện ích sẵn có:
                </span>
                <div className="flex flex-wrap gap-2 text-xs">
                  {room.bedType && (
                    <span className="px-2.5 py-1 rounded-xl bg-stone-100 text-stone-700 border border-stone-200 font-medium">
                      • {room.bedType}
                    </span>
                  )}
                  {services.map((sv) => (
                    <span
                      key={sv.id}
                      className="px-2.5 py-1 rounded-xl bg-[#FAF6F0] text-[#5c3e21] border border-[#F7DFBC] font-medium flex items-center gap-1.5 shadow-2xs"
                    >
                      <span className="text-amber-700 font-bold">✓</span>
                      <span>{sv.name}</span>
                      {sv.price > 0 && (
                        <span className="text-[10px] text-stone-400 font-mono">
                          (+{formatVND(sv.price)})
                        </span>
                      )}
                    </span>
                  ))}
                </div>
              </div>
            )}
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
                  min={todayStr}
                  onChange={(e) => setCheckIn(e.target.value)}
                  className={`w-full text-xs font-medium border rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 bg-slate-50/50 cursor-pointer transition-colors ${
                    dateError ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-500' : 'border-slate-200 focus:ring-amber-500/20 focus:border-amber-600'
                  }`}
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
                  min={checkIn ? getNextDateISO(checkIn) : todayStr}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className={`w-full text-xs font-medium border rounded-xl px-3 py-2.5 text-slate-800 focus:outline-none focus:ring-2 bg-slate-50/50 cursor-pointer transition-colors ${
                    dateError ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-500' : 'border-slate-200 focus:ring-amber-500/20 focus:border-amber-600'
                  }`}
                  required
                />
              </div>

              {/* Thông báo lỗi ngày nếu khách hàng chọn sai */}
              {dateError && (
                <div className="sm:col-span-2 -mt-1">
                  <span className="text-xs font-medium text-rose-500 flex items-center gap-1.5 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200">
                    ⚠️ {dateError}
                  </span>
                </div>
              )}

              {/* Số điện thoại người đặt */}
              <div className="sm:col-span-2">
                <Input
                  label="Số điện thoại liên hệ nhận phòng *"
                  type="tel"
                  icon={Phone}
                  placeholder="Ví dụ: 0912 345 678 hoặc +84912345678"
                  value={phone}
                  onChange={handlePhoneChange}
                  onBlur={() => setPhoneTouched(true)}
                  error={phoneError}
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
                    Giá phòng ({nights > 0 ? `${nights} đêm` : '0 đêm'} × {formatVND(room.price)}):
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

            {/* Nút bấm đặt phòng & Cảnh báo khi bị vô hiệu hóa */}
            <div className="space-y-2">
              <Button
                type="button"
                variant="primary"
                size="lg"
                disabled={!isBookingFormValid}
                onClick={handleBookingProceed}
                className="w-full py-3.5 text-base font-bold shadow-xl shadow-amber-600/25 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              >
                Tiến hành Đặt phòng & Thanh toán
              </Button>

              {!isBookingFormValid && (
                <p className="text-[11px] text-center text-rose-500 font-medium">
                  {dateError || phoneError || 'Vui lòng kiểm tra lại ngày lưu trú hoặc số điện thoại'}
                </p>
              )}
            </div>

            <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400 text-center">
              <ShieldCheck size={14} className="text-emerald-600" />
              <span>Thông tin phòng & giá niêm yết trực tiếp từ cơ sở dữ liệu</span>
            </div>
          </div>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* KHỐI ĐÁNH GIÁ CỦA KHÁCH HÀNG (LẤY 100% TỪ CSDL MYSQL)                  */}
      {/* ===================================================================== */}
      <div ref={reviewsRef} id="customer-reviews" className="mt-12 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6 scroll-mt-24">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Star size={22} className="text-amber-500 fill-amber-500" />
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-serif">
                Đánh giá từ khách hàng
              </h2>
            </div>
            <p className="text-xs text-slate-500">
              Đánh giá thực tế từ các khách hàng đã từng lưu trú tại phòng này (dữ liệu từ cơ sở dữ liệu hệ thống)
            </p>
          </div>

          {room.reviewsCount > 0 ? (
            <div className="flex items-center gap-3 bg-amber-50/80 border border-amber-200/70 px-4 py-2.5 rounded-2xl shrink-0">
              <div className="text-2xl font-black text-amber-600 font-serif">
                {room.rating}
              </div>
              <div className="text-xs">
                {renderRatingStars(room.rating, 15)}
                <span className="text-slate-600 font-medium block mt-0.5">{room.reviewsCount} lượt đánh giá</span>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-2xl shrink-0 text-xs text-slate-500 font-medium">
              Chưa có lượt đánh giá nào
            </div>
          )}
        </div>

        {/* Trạng thái 1: Đang tải đánh giá */}
        {isLoadingReviews ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-2">
            <div className="w-6 h-6 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs text-slate-400">Đang tải đánh giá từ hệ thống...</span>
          </div>
        ) : reviewsError && (!reviewsData.reviews || reviewsData.reviews.length === 0) ? (
          /* Trạng thái 2: LỖI KHI API ĐÁNH GIÁ GẶP LỖI VÀ CHƯA CÓ DATA */
          <div className="p-6 sm:p-8 rounded-2xl bg-rose-50 border-2 border-rose-500 text-center space-y-2 shadow-xs">
            <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center font-bold text-lg">
              ⚠️
            </div>
            <h4 className="text-rose-900 font-bold text-sm sm:text-base">
              Lỗi kết nối API Đánh giá Backend
            </h4>
            <p className="text-xs text-rose-700 max-w-md mx-auto">
              {reviewsError}
            </p>
          </div>
        ) : reviewsData.reviews && reviewsData.reviews.length > 0 ? (
          /* Trạng thái 3: Hiển thị danh sách đánh giá của phòng */
          reviewsData.reviews.length <= 2 ? (
            /* BỐ CỤC 1: Nếu chỉ có 1 - 2 đánh giá -> Hiển thị dạng thẻ to, thoáng đãng full-width */
            <div className="space-y-4">
              {reviewsData.reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-6 sm:p-7 rounded-3xl bg-white border border-slate-200/80 shadow-2xs space-y-4 hover:shadow-xs transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      {rev.userAvatar ? (
                        <img
                          src={rev.userAvatar}
                          alt={rev.userName}
                          className="w-11 h-11 rounded-full object-cover border border-stone-200 shrink-0"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-full bg-[#f3ede3] text-[#735832] font-semibold text-sm flex items-center justify-center shrink-0">
                          {(rev.userName || 'N').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                          {rev.userName || 'Nguyễn Văn Khách'}
                        </h4>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {(() => {
                            if (!rev.createdAt) return 'Gần đây';
                            const d = new Date(rev.createdAt);
                            return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
                          })()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 pt-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={17}
                          className={
                            s <= Number(rev.rating)
                              ? 'fill-amber-400 text-amber-400'
                              : 'fill-transparent text-slate-300'
                          }
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 leading-relaxed font-light">
                    "{rev.comment}"
                  </p>
                </div>
              ))}
            </div>
          ) : (
            /* BỐ CỤC 2: Nếu có nhiều hơn 2 đánh giá -> Hiển thị dạng lưới thu nhỏ 2 cột gọn gàng như ảnh */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reviewsData.reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-3 hover:shadow-xs transition-shadow flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      {rev.userAvatar ? (
                        <img
                          src={rev.userAvatar}
                          alt={rev.userName}
                          className="w-9 h-9 rounded-full object-cover border border-stone-200 shrink-0"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-[#f3ede3] text-[#735832] font-semibold text-xs flex items-center justify-center shrink-0">
                          {(rev.userName || 'N').charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                          {rev.userName || 'Nguyễn Văn Khách'}
                        </h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {(() => {
                            if (!rev.createdAt) return 'Gần đây';
                            const d = new Date(rev.createdAt);
                            return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
                          })()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-0.5 shrink-0 pt-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          size={14}
                          className={
                            s <= Number(rev.rating)
                              ? 'fill-amber-400 text-amber-400'
                              : 'fill-transparent text-slate-300'
                          }
                        />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs sm:text-[13px] text-slate-600 leading-relaxed font-light mt-1">
                    "{rev.comment}"
                  </p>
                </div>
              ))}
            </div>
          )
        ) : (
          /* Trạng thái 4: Chưa có đánh giá nào */
          <div className="py-10 text-center space-y-2 bg-stone-50/50 rounded-2xl border border-dashed border-stone-200">
            <MessageSquare size={28} className="mx-auto text-stone-300" />
            <p className="text-xs text-stone-500 font-medium">
              Chưa có đánh giá nào cho phòng này trong hệ thống.
            </p>
            <p className="text-[11px] text-stone-400">
              Hãy đặt phòng và trở thành vị khách đầu tiên để lại đánh giá sau kỳ nghỉ!
            </p>
          </div>
        )}
      </div>

      {/* ===================================================================== */}
      {/* LIGHTBOX MODAL: PHÓNG TO ẢNH & ĐIỀU HƯỚNG CHUYỂN TIẾP CÁC ẢNH       */}
      {/* ===================================================================== */}
      {isLightboxOpen && room.images && room.images.length > 0 && (
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
