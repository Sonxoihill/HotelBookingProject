import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  SlidersHorizontal,
  Check,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Users,
  Headphones,
  BedDouble,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { formatVND } from '../../utils/formatters';
import { roomService } from '../../services/roomService';
import { serviceService } from '../../services/serviceService';

export const RoomsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryCheckIn = searchParams.get('checkIn');
  const queryCheckOut = searchParams.get('checkOut');
  const queryGuests = searchParams.get('guests');

  // Dữ liệu phòng và dịch vụ thực tế lấy từ Database
  const [allRooms, setAllRooms] = useState([]);
  const [services, setServices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filter States: Loại phòng, Khoảng giá, Tiện nghi, Dịch vụ
  const [selectedTypes, setSelectedTypes] = useState(['Tất cả loại phòng']);
  const [maxPrice, setMaxPrice] = useState(5000000);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [selectedServices, setSelectedServices] = useState([]);
  const [sortBy, setSortBy] = useState('DEFAULT');
  const [currentPage, setCurrentPage] = useState(1);
  const [roomsPerPage, setRoomsPerPage] = useState(3);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 380, behavior: 'smooth' });
  };

  // Tải danh sách phòng và dịch vụ trực tiếp từ Database qua API
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // 1. Tải danh sách phòng từ CSDL
        const roomsRes = await roomService.getPublicRooms({ page: 0, size: 100 });
        const roomData = roomsRes?.data || roomsRes;
        const roomList = roomData?.content || roomData?.items || [];
        setAllRooms(roomList);

        if (roomList.length > 0) {
          const highestPrice = Math.max(
            ...roomList.map((r) => Number(r.category?.basePrice || r.basePrice || 2000000))
          );
          setMaxPrice(highestPrice + 500000);
        }

        // 2. Tải danh sách dịch vụ từ bảng services trong CSDL
        const servicesRes = await serviceService.getServices();
        const serviceList = servicesRes?.data || servicesRes || [];
        setServices(Array.isArray(serviceList) ? serviceList : []);
      } catch (err) {
        console.error('Lỗi tải dữ liệu từ CSDL:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Danh sách các loại phòng động 100% từ Database
  const roomTypes = useMemo(() => {
    const types = new Set();
    allRooms.forEach((r) => {
      const catName = r.category?.name;
      if (catName) types.add(catName);
    });
    return ['Tất cả loại phòng', ...Array.from(types)];
  }, [allRooms]);

  // Danh sách tiện nghi lấy từ các trường bedType và description của phòng trong Database
  const availableAmenities = useMemo(() => {
    const set = new Set();
    allRooms.forEach((r) => {
      const cat = r.category || {};
      if (cat.bedType) set.add(cat.bedType);
      const desc = cat.description || '';
      if (desc.toLowerCase().includes('phòng khách')) set.add('Phòng khách riêng');
      if (desc.toLowerCase().includes('view')) set.add('Tầm nhìn thoáng đãng');
      if (desc.toLowerCase().includes('tiện nghi')) set.add('Tiện nghi tiêu chuẩn');
    });
    return Array.from(set);
  }, [allRooms]);

  const minAvailablePrice = useMemo(() => {
    if (allRooms.length === 0) return 400000;
    return Math.min(...allRooms.map((r) => Number(r.category?.basePrice || r.basePrice || 400000)));
  }, [allRooms]);

  const maxAvailablePrice = useMemo(() => {
    if (allRooms.length === 0) return 5000000;
    return Math.max(...allRooms.map((r) => Number(r.category?.basePrice || r.basePrice || 5000000)));
  }, [allRooms]);

  const handleToggleType = (type) => {
    setCurrentPage(1);
    if (type === 'Tất cả loại phòng') {
      setSelectedTypes(['Tất cả loại phòng']);
      return;
    }
    setSelectedTypes((prev) => {
      const withoutAll = prev.filter((t) => t !== 'Tất cả loại phòng');
      if (withoutAll.includes(type)) {
        const next = withoutAll.filter((t) => t !== type);
        return next.length === 0 ? ['Tất cả loại phòng'] : next;
      } else {
        return [...withoutAll, type];
      }
    });
  };

  const handleToggleAmenity = (amenity) => {
    setCurrentPage(1);
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const handleToggleService = (serviceName) => {
    setCurrentPage(1);
    setSelectedServices((prev) =>
      prev.includes(serviceName) ? prev.filter((s) => s !== serviceName) : [...prev, serviceName]
    );
  };

  const handleReset = () => {
    setSelectedTypes(['Tất cả loại phòng']);
    setMaxPrice(maxAvailablePrice + 500000);
    setSelectedAmenities([]);
    setSelectedServices([]);
    setCurrentPage(1);
    if (queryCheckIn || queryCheckOut || queryGuests) {
      navigate('/rooms');
    }
  };

  // Logic lọc và sắp xếp phòng trực tiếp từ dữ liệu Database
  const filteredRooms = useMemo(() => {
    let result = allRooms.filter((room) => {
      const price = Number(room.category?.basePrice || room.basePrice || 0);
      const categoryName = room.category?.name || '';
      const bedType = room.category?.bedType || '';
      const description = room.category?.description || '';
      const roomCapacity = Number(room.category?.capacity || room.capacity || 0);
      const isAvailable = (room.status || 'AVAILABLE') === 'AVAILABLE';

      // 0. Nếu tìm kiếm từ trang chủ (Check-in, Check-out, Khách):
      // Chỉ hiển thị các phòng CÒN TRỐNG phù hợp với tiêu chí
      if (queryCheckIn && queryCheckOut) {
        if (!isAvailable) return false;
      }

      // Kiểm tra sức chứa phòng: phải đủ cho số khách yêu cầu
      if (queryGuests) {
        if (roomCapacity < Number(queryGuests)) return false;
      }

      // 1. Kiểm tra Loại phòng (từ Database)
      if (
        selectedTypes.length > 0 &&
        !selectedTypes.includes('Tất cả loại phòng')
      ) {
        if (!selectedTypes.includes(categoryName)) return false;
      }

      // 2. Kiểm tra Khoảng giá (thanh trượt từ Database)
      if (price > maxPrice) return false;

      // 3. Kiểm tra Tiện nghi (đối chiếu dữ liệu Database)
      if (selectedAmenities.length > 0) {
        const matchesAll = selectedAmenities.every((amenity) => {
          return (
            bedType === amenity ||
            description.toLowerCase().includes(amenity.toLowerCase())
          );
        });
        if (!matchesAll) return false;
      }

      // 4. Kiểm tra Dịch vụ (từ danh sách dịch vụ Database)
      if (selectedServices.length > 0) {
        const activeServiceNames = services.map((s) => s.name);
        const hasServices = selectedServices.every((srv) => activeServiceNames.includes(srv));
        if (!hasServices) return false;
      }

      return true;
    });

    // Sắp xếp
    if (sortBy === 'PRICE_ASC') {
      result.sort((a, b) => {
        const pA = Number(a.category?.basePrice || a.basePrice || 0);
        const pB = Number(b.category?.basePrice || b.basePrice || 0);
        return pA - pB;
      });
    } else if (sortBy === 'PRICE_DESC') {
      result.sort((a, b) => {
        const pA = Number(a.category?.basePrice || a.basePrice || 0);
        const pB = Number(b.category?.basePrice || b.basePrice || 0);
        return pB - pA;
      });
    }

    return result;
  }, [allRooms, maxPrice, selectedTypes, selectedAmenities, selectedServices, services, sortBy, queryCheckIn, queryCheckOut, queryGuests]);

  // Phân trang danh sách đã lọc
  const totalPages = Math.ceil(filteredRooms.length / roomsPerPage) || 1;
  const startIndex = (currentPage - 1) * roomsPerPage;
  const endIndex = Math.min(startIndex + roomsPerPage, filteredRooms.length);
  const paginatedRooms = useMemo(() => {
    return filteredRooms.slice(startIndex, startIndex + roomsPerPage);
  }, [filteredRooms, startIndex, roomsPerPage]);

  return (
    <div className="space-y-12 pb-20 bg-[#FAF8F5]">
      {/* 1. HERO BANNER SECTION */}
      <section className="relative min-h-[380px] sm:min-h-[440px] flex items-center justify-center bg-stone-900 text-white">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=2000&q=80"
            alt="L'Étoile Rooms & Suites"
            className="w-full h-full object-cover opacity-50 filter brightness-90"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-stone-950/70 via-stone-900/50 to-[#FAF8F5]" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 text-center space-y-3 pt-12 pb-16 z-10">
          <span className="text-[10px] sm:text-xs font-semibold tracking-[0.3em] text-[#F7DFBC] uppercase block">
            Khám phá không gian nghỉ dưỡng thực tế
          </span>
          <h1 className="text-3xl sm:text-5xl font-normal font-serif tracking-tight leading-tight text-white">
            Bộ Sưu Tập Phòng Nghỉ & Suites
          </h1>
          <p className="text-xs sm:text-sm text-stone-200 max-w-xl mx-auto font-light leading-relaxed">
            Dữ liệu phòng phòng nghỉ được đồng bộ trực tiếp từ hệ thống khách sạn, đảm bảo tính chính xác và tình trạng phòng thời gian thực.
          </p>
        </div>
      </section>

      {/* 2. MAIN 2-COLUMN LAYOUT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* =================================================================== */}
          {/* CỘT TRÁI: BỘ LỌC TÌM KIẾM (lg:col-span-4)                           */}
          {/* =================================================================== */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl border border-stone-200/90 p-6 shadow-2xs space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2 text-stone-900">
                  <SlidersHorizontal size={16} />
                  <h3 className="font-semibold text-sm">Bộ lọc tìm kiếm</h3>
                </div>
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs text-stone-400 hover:text-stone-800 transition-colors cursor-pointer"
                >
                  Đặt lại
                </button>
              </div>

              {/* 1. Loại phòng (Động từ Database) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-stone-800 uppercase tracking-wider">
                    Loại phòng
                  </h4>
                  {selectedTypes.length > 0 && !selectedTypes.includes('Tất cả loại phòng') && (
                    <span className="text-[10px] text-stone-500 font-medium bg-stone-100 px-2 py-0.5 rounded-full">
                      {selectedTypes.length} đã chọn
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  {roomTypes.map((type) => {
                    const isChecked = selectedTypes.includes(type);
                    return (
                      <label
                        key={type}
                        className="flex items-center gap-2.5 cursor-pointer text-xs text-stone-600 hover:text-stone-900 select-none"
                      >
                        <input
                          type="checkbox"
                          className="sr-only"
                          checked={isChecked}
                          onChange={() => handleToggleType(type)}
                        />
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isChecked
                              ? 'bg-black border-black text-white'
                              : 'border-stone-300 bg-white'
                            }`}
                        >
                          {isChecked && <Check size={11} strokeWidth={3} />}
                        </div>
                        <span className={isChecked ? 'font-medium text-stone-900' : ''}>
                          {type}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <hr className="border-stone-100" />

              {/* 2. Khoảng giá (Thanh trượt từ Database) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <h4 className="font-semibold text-stone-800 uppercase tracking-wider">
                    Khoảng giá
                  </h4>
                  <span className="font-bold text-stone-900 font-mono">
                    {maxPrice >= maxAvailablePrice ? 'Tất cả mức giá' : `Tối đa ${formatVND(maxPrice)}`}
                  </span>
                </div>
                <input
                  type="range"
                  min={minAvailablePrice}
                  max={maxAvailablePrice + 200000}
                  step="50000"
                  value={maxPrice}
                  onChange={(e) => {
                    setMaxPrice(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-black"
                />
                <div className="flex justify-between text-[11px] text-stone-400 font-mono">
                  <span>{formatVND(minAvailablePrice)}</span>
                  <span>{formatVND(maxAvailablePrice)}+</span>
                </div>
              </div>

              <hr className="border-stone-100" />

              {/* 3. Tiện nghi (Lấy động từ đặc điểm phòng trong Database) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-stone-800 uppercase tracking-wider">
                    Tiện nghi
                  </h4>
                  {selectedAmenities.length > 0 && (
                    <span className="text-[10px] text-stone-500 font-medium bg-stone-100 px-2 py-0.5 rounded-full">
                      {selectedAmenities.length} đã chọn
                    </span>
                  )}
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {availableAmenities.length === 0 ? (
                    <span className="text-xs text-stone-400 italic">Đang tải tiện nghi...</span>
                  ) : (
                    availableAmenities.map((amenity) => {
                      const isChecked = selectedAmenities.includes(amenity);
                      return (
                        <label
                          key={amenity}
                          className="flex items-center gap-2.5 cursor-pointer text-xs text-stone-600 hover:text-stone-900 select-none"
                        >
                          <input
                            type="checkbox"
                            className="sr-only"
                            checked={isChecked}
                            onChange={() => handleToggleAmenity(amenity)}
                          />
                          <div
                            className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${isChecked
                                ? 'bg-black border-black text-white'
                                : 'border-stone-300 bg-white'
                              }`}
                          >
                            {isChecked && <Check size={11} strokeWidth={3} />}
                          </div>
                          <span className={isChecked ? 'font-medium text-stone-900' : ''}>
                            {amenity}
                          </span>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>

              <hr className="border-stone-100" />

              {/* 4. Dịch vụ (Lấy trực tiếp từ bảng services trong Database) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-stone-800 uppercase tracking-wider">
                    Dịch vụ
                  </h4>
                  {selectedServices.length > 0 && (
                    <span className="text-[10px] text-stone-500 font-medium bg-stone-100 px-2 py-0.5 rounded-full">
                      {selectedServices.length} đã chọn
                    </span>
                  )}
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {services.length === 0 ? (
                    <span className="text-xs text-stone-400 italic">Đang tải dịch vụ...</span>
                  ) : (
                    services.map((service) => {
                      const isChecked = selectedServices.includes(service.name);
                      return (
                        <label
                          key={service.id}
                          className="flex items-center justify-between gap-2 p-1 rounded-lg hover:bg-stone-50 cursor-pointer text-xs text-stone-600 hover:text-stone-900 select-none transition-colors"
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <input
                              type="checkbox"
                              className="sr-only"
                              checked={isChecked}
                              onChange={() => handleToggleService(service.name)}
                            />
                            <div
                              className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${isChecked
                                  ? 'bg-black border-black text-white'
                                  : 'border-stone-300 bg-white'
                                }`}
                            >
                              {isChecked && <Check size={11} strokeWidth={3} />}
                            </div>
                            <span className={`truncate ${isChecked ? 'font-medium text-stone-900' : ''}`}>
                              {service.name}
                            </span>
                          </div>
                          {service.price && (
                            <span className="text-[10px] text-stone-400 font-mono shrink-0">
                              +{formatVND(service.price)}
                            </span>
                          )}
                        </label>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Thẻ Callout hỗ trợ */}
            <div className="bg-[#101726] rounded-3xl p-6 text-white space-y-3 shadow-md border border-stone-800">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-[#F7DFBC]">
                <Headphones size={20} />
              </div>
              <h4 className="font-serif text-base font-medium">
                Hỗ trợ đặt phòng trực tiếp
              </h4>
              <p className="text-xs text-stone-400 leading-relaxed font-light">
                Đội ngũ chăm sóc khách hàng sẵn sàng tư vấn lựa chọn phòng phù hợp nhất với nhu cầu của quý khách.
              </p>
            </div>
          </div>

          {/* =================================================================== */}
          {/* CỘT PHẢI: DANH SÁCH PHÒNG TỪ DATABASE (lg:col-span-8)               */}
          {/* =================================================================== */}
          <div className="lg:col-span-8 space-y-6">

            {/* Banner hiển thị tiêu chí tìm kiếm từ trang chủ */}
            {queryCheckIn && queryCheckOut && (
              <div className="bg-[#FAF6F0] rounded-2xl p-4 border border-[#F7DFBC]/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#1A1A1A] text-[#F7DFBC] flex items-center justify-center shrink-0">
                    <Sparkles size={18} />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                      Các phòng còn trống phù hợp với tiêu chí tìm kiếm
                    </span>
                    <p className="text-xs sm:text-sm font-semibold text-stone-900">
                      Nhận phòng: <span className="text-[#8C6239]">{queryCheckIn}</span> • Trả phòng: <span className="text-[#8C6239]">{queryCheckOut}</span>
                      {queryGuests && ` • Sức chứa: từ ${queryGuests} người`}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/rooms')}
                  className="text-xs text-stone-500 hover:text-stone-900 underline self-start sm:self-auto cursor-pointer"
                >
                  Xóa bộ lọc tìm kiếm
                </button>
              </div>
            )}

            {/* Trạng thái tải dữ liệu */}
            {isLoading ? (
              <div className="min-h-[300px] flex flex-col items-center justify-center space-y-3 bg-white rounded-3xl border border-stone-200 p-12">
                <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
                <span className="text-xs text-stone-500 font-medium">Đang tải danh sách phòng từ hệ thống...</span>
              </div>
            ) : paginatedRooms.length === 0 ? (
              <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center space-y-3">
                <h3 className="font-serif text-lg font-medium text-stone-800">
                  Không tìm thấy phòng trống phù hợp với tiêu chí tìm kiếm
                </h3>
                <p className="text-xs text-stone-500">
                  Vui lòng thử điều chỉnh lại ngày nhận/trả phòng, số lượng khách hoặc các tiêu chí lọc để có kết quả phù hợp hơn.
                </p>
                <button
                  type="button"
                  onClick={handleReset}
                  className="text-xs font-semibold text-amber-600 hover:underline pt-2 cursor-pointer"
                >
                  Đặt lại toàn bộ bộ lọc
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {paginatedRooms.map((room) => {
                  const category = room.category || {};
                  const roomName = category.name ? `${category.name} (Phòng ${room.roomNumber})` : `Phòng ${room.roomNumber}`;
                  const price = category.basePrice || room.basePrice || 0;
                  const capacity = category.capacity || room.capacity || 2;
                  const bedType = category.bedType || room.bedType || 'Giường tiêu chuẩn';
                  const description = category.description || room.description || '';
                  const imageUrl = category.imageUrl || room.imageUrl || 'https://images.unsplash.com/photo-1590490360182-c33d57733427';
                  const status = room.status || 'AVAILABLE';

                  return (
                    <div
                      key={room.id}
                      className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col md:flex-row"
                    >
                      {/* Photo on Left */}
                      <div className="relative md:w-80 aspect-[16/11] md:aspect-auto shrink-0 bg-stone-100 overflow-hidden">
                        <img
                          src={imageUrl}
                          alt={roomName}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                        />
                        <span className="absolute top-3.5 left-3.5 bg-black/80 backdrop-blur-xs text-white text-[9px] tracking-wider uppercase font-semibold px-3 py-1 rounded-full">
                          {category.name || 'Tiêu chuẩn'}
                        </span>
                        <span className="absolute bottom-3.5 left-3.5 bg-white/90 backdrop-blur-xs text-stone-900 text-[10px] font-semibold px-2.5 py-0.5 rounded-full">
                          Tầng {room.floor || 1}
                        </span>
                      </div>

                      {/* Content on Right */}
                      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-4">
                            <span className="text-xs text-stone-400 font-medium">
                              Số phòng: #{room.roomNumber}
                            </span>
                            <div className="text-right">
                              <span className="text-[10px] text-stone-400 block uppercase">
                                Giá từ mỗi đêm
                              </span>
                              <span className="text-lg sm:text-xl font-serif font-bold text-stone-900 block leading-tight">
                                {formatVND(price)}
                              </span>
                            </div>
                          </div>

                          <h3 className="font-serif text-xl sm:text-2xl font-normal text-stone-900">
                            {roomName}
                          </h3>

                          {description && (
                            <p className="text-xs text-stone-500 font-light leading-relaxed">
                              {description}
                            </p>
                          )}

                          <div className="flex flex-wrap gap-2 pt-2 text-xs text-stone-600">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-50 border border-stone-200">
                              <Users size={12} className="text-stone-400" />
                              <span>Sức chứa: {capacity} khách</span>
                            </span>
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-50 border border-stone-200">
                              <BedDouble size={12} className="text-stone-400" />
                              <span>{bedType}</span>
                            </span>
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border ${status === 'AVAILABLE'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                              }`}>
                              <span>{status === 'AVAILABLE' ? 'Phòng trống' : 'Đã có khách'}</span>
                            </span>
                          </div>

                          {/* Tiện nghi & Dịch vụ trực tiếp từ Database */}
                          <div className="flex flex-wrap gap-1.5 pt-1 text-[11px]">
                            {category.bedType && (
                              <span className="px-2 py-0.5 rounded-md bg-stone-100/90 text-stone-600 border border-stone-200/60 font-light">
                                • {category.bedType}
                              </span>
                            )}
                            {services.slice(0, 3).map((sv) => (
                              <span key={sv.id} className="px-2 py-0.5 rounded-md bg-[#F7DFBC]/30 text-[#422C1A] border border-[#F7DFBC]/70 font-light">
                                ✓ {sv.name}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Bottom CTA Row */}
                        <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                          <span className="text-xs text-stone-500 font-light">
                            Đã bao gồm thuế và phí dịch vụ
                          </span>

                          <button
                            type="button"
                            onClick={() => {
                              const detailUrl = queryCheckIn && queryCheckOut
                                ? `/rooms/${room.id}?checkIn=${queryCheckIn}&checkOut=${queryCheckOut}`
                                : `/rooms/${room.id}`;
                              navigate(detailUrl);
                            }}
                            className="bg-black hover:bg-stone-800 text-white rounded-full px-5 py-2.5 text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
                          >
                            <span>Xem chi tiết & Đặt phòng</span>
                            <ArrowRight size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination Controls */}
            {filteredRooms.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-stone-200/80">
                <span className="text-xs text-stone-500">
                  Đang xem trang <strong className="text-stone-800 font-semibold">{currentPage}</strong> / <strong className="text-stone-800 font-semibold">{totalPages}</strong> (Tổng cộng {filteredRooms.length} phòng)
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    className="w-9 h-9 rounded-full border border-stone-200 flex items-center justify-center text-stone-600 hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                    title="Trang trước"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => handlePageChange(page)}
                      className={`w-9 h-9 rounded-full text-xs font-semibold cursor-pointer transition-colors ${currentPage === page
                          ? 'bg-[#422C1A] text-white shadow-xs'
                          : 'border border-stone-200 text-stone-700 hover:bg-stone-100'
                        }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    className="w-9 h-9 rounded-full border border-stone-200 flex items-center justify-center text-stone-600 hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                    title="Trang kế tiếp"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomsPage;
