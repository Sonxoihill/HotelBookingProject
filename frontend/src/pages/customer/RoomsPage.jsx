import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  SlidersHorizontal,
  Check,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Users,
  Headphones,
  Sparkles,
} from 'lucide-react';
import { formatVND } from '../../utils/formatters';

const ALL_ROOMS = [
  {
    id: '1',
    name: "L'Étoile Royal Sky Penthouse",
    badge: 'PENTHOUSE THƯỢNG HẠNG',
    floorInfo: 'Tầng cao nhất • 120 m²',
    priceNum: 18500000,
    priceFormatted: '18.500.000 đ',
    desc: 'Không gian đỉnh cao với tầm nhìn 360 độ ôm trọn biển trời, sở hữu hồ bơi vô cực riêng tư và dịch vụ quản gia cá nhân phục vụ 24/7.',
    tags: [
      'Hồ bơi vô cực riêng',
      'Quản gia riêng',
      'Ban công hướng biển',
      'Giường King siêu lớn',
    ],
    guests: '2-4 khách',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
    type: 'Penthouse Thượng Hạng',
  },
  {
    id: '2',
    name: 'Ocean Horizon Suite',
    badge: 'SUITE HƯỚNG BIỂN',
    floorInfo: 'Tầng 12 • 85 m²',
    priceNum: 12200000,
    priceFormatted: '12.200.000 đ',
    desc: 'Tận hưởng tiếng sóng vỗ rì rào ngay từ ban công lộng gió, phòng tắm lát đá cẩm thạch nguyên khối và bồn ngâm hướng toàn cảnh đại dương.',
    tags: [
      'Ban công hướng biển',
      'Bồn tắm cẩm thạch',
      'Máy pha cà phê espresso',
    ],
    guests: '2-3 khách',
    image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
    type: 'Suite Hướng Biển',
  },
  {
    id: '3',
    name: "L'Étoile Secret Garden Villa",
    badge: 'BIỆT THỰ HỒ BƠI RIÊNG',
    floorInfo: 'Khu vườn riêng • 210 m²',
    priceNum: 24800000,
    priceFormatted: '24.800.000 đ',
    desc: 'Không gian nghỉ dưỡng biệt lập ẩn mình giữa khu vườn nhiệt đới nguyên sinh, hồ bơi riêng biệt và hiên tắm nắng thư thái tuyệt đối.',
    tags: [
      'Hồ bơi vô cực riêng',
      'Sân vườn riêng biệt',
      'Quản gia riêng 24/7',
    ],
    guests: '4-6 khách',
    image: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=800&q=80',
    type: 'Biệt thự Hồ Bơi Riêng',
  },
  {
    id: '4',
    name: 'Presidential Lagoon Residence',
    badge: 'BIỆT THỰ HỒ BƠI RIÊNG',
    floorInfo: 'Bán đảo biệt lập • 350 m²',
    priceNum: 32000000,
    priceFormatted: '32.000.000 đ',
    desc: 'Tuyệt tác kiến trúc hướng trọn vịnh biển riêng tư, bến du thuyền cá nhân, phòng chiếu phim và hầm rượu vang độc quyền.',
    tags: [
      'Hồ bơi vô cực riêng',
      'Quản gia riêng 24/7',
      'Bồn tắm sục Jacuzzi',
      'Bến du thuyền riêng',
    ],
    guests: '6-8 khách',
    image: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80',
    type: 'Biệt thự Hồ Bơi Riêng',
  },
];

export const RoomsPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  const guestsParam = searchParams.get('guests');

  // Filter States
  const [selectedTypes, setSelectedTypes] = useState(() => {
    if (categoryParam) return [categoryParam];
    return ['Tất cả loại phòng'];
  });
  const [maxPrice, setMaxPrice] = useState(35000000);
  const [selectedAmenities, setSelectedAmenities] = useState([
    'Hồ bơi vô cực riêng',
    'Quản gia riêng 24/7',
  ]);
  const [capacityFilter, setCapacityFilter] = useState(() => {
    if (guestsParam && guestsParam !== 'ALL') {
      const g = parseInt(guestsParam, 10);
      if (g <= 2) return '1-2';
      if (g <= 4) return '3-4';
      return '5+';
    }
    return '1-2';
  });
  const [sortBy, setSortBy] = useState('DEFAULT');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (categoryParam) {
      setSelectedTypes([categoryParam]);
    }
    if (guestsParam && guestsParam !== 'ALL') {
      const g = parseInt(guestsParam, 10);
      if (g <= 2) setCapacityFilter('1-2');
      else if (g <= 4) setCapacityFilter('3-4');
      else setCapacityFilter('5+');
    }
  }, [categoryParam, guestsParam]);

  const roomTypes = [
    'Tất cả loại phòng',
    'Penthouse Thượng Hạng',
    'Suite Hướng Biển',
    'Biệt thự Hồ Bơi Riêng',
  ];

  const amenitiesList = [
    'Hồ bơi vô cực riêng',
    'Quản gia riêng 24/7',
    'Ban công hướng biển toàn cảnh',
    'Bồn tắm sục Jacuzzi',
  ];

  const handleToggleType = (type) => {
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
    setSelectedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity]
    );
  };

  const handleReset = () => {
    setSelectedTypes(['Tất cả loại phòng']);
    setMaxPrice(30000000);
    setSelectedAmenities([]);
    setCapacityFilter('1-2');
  };

  // Filtered rooms logic
  const filteredRooms = useMemo(() => {
    return ALL_ROOMS.filter((room) => {
      // Price check
      if (room.priceNum > maxPrice) return false;

      // Type check
      if (
        selectedTypes.length > 0 &&
        !selectedTypes.includes('Tất cả loại phòng')
      ) {
        if (!selectedTypes.includes(room.type)) return false;
      }

      return true;
    });
  }, [maxPrice, selectedTypes]);

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
            Khám phá không gian nghỉ dưỡng đỉnh cao
          </span>
          <h1 className="text-3xl sm:text-5xl font-normal font-serif tracking-tight leading-tight text-white">
            Bộ sưu tập Phòng nghỉ & Biệt thự Thượng hạng
          </h1>
          <p className="text-xs sm:text-sm text-stone-200 max-w-xl mx-auto font-light leading-relaxed">
            Từng căn phòng là một tác phẩm kiến trúc tinh tế, hòa quyện giữa thiên nhiên nguyên bản và sự tiện nghi tối tân dành riêng cho bạn.
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
            {/* Box Bộ lọc */}
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

              {/* 1. Loại phòng nghỉ */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-stone-800">
                  Loại phòng nghỉ
                </h4>
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
                          className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                            isChecked
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

              {/* 2. Khoảng giá mỗi đêm */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <h4 className="font-semibold text-stone-800">
                    Khoảng giá mỗi đêm
                  </h4>
                  <span className="font-bold text-stone-900 font-mono">
                    Đến {formatVND(maxPrice)}
                  </span>
                </div>
                <input
                  type="range"
                  min="3000000"
                  max="35000000"
                  step="500000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full h-1.5 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-black"
                />
                <div className="flex justify-between text-[11px] text-stone-400 font-mono">
                  <span>3.000.000 đ</span>
                  <span>30.000.000+ đ</span>
                </div>
              </div>

              <hr className="border-stone-100" />

              {/* 3. Tiện ích đặc quyền */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-stone-800">
                  Tiện ích đặc quyền
                </h4>
                <div className="space-y-2">
                  {amenitiesList.map((amenity) => {
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
                          className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                            isChecked
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
                  })}
                </div>
              </div>

              <hr className="border-stone-100" />

              {/* 4. Sức chứa tối thiểu */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-stone-800">
                  Sức chứa tối thiểu
                </h4>
                <div className="grid grid-cols-4 gap-2">
                  {['1-2', '3-4', '5+', 'VIP'].map((cap) => (
                    <button
                      key={cap}
                      type="button"
                      onClick={() => setCapacityFilter(cap)}
                      className={`py-1.5 text-xs rounded-full border transition-all cursor-pointer font-medium ${
                        capacityFilter === cap
                          ? 'bg-black text-white border-black shadow-2xs'
                          : 'bg-white text-stone-600 border-stone-200 hover:border-stone-400'
                      }`}
                    >
                      {cap}
                    </button>
                  ))}
                </div>
              </div>

              {/* Nút Áp dụng bộ lọc */}
              <button
                type="button"
                className="w-full bg-black hover:bg-stone-800 text-white rounded-full py-3 text-xs font-semibold transition-colors cursor-pointer shadow-sm"
              >
                Áp dụng bộ lọc
              </button>
            </div>

            {/* Thẻ Callout hỗ trợ trực tuyến 24/7 */}
            <div className="bg-[#101726] rounded-3xl p-6 text-white space-y-3 shadow-md border border-stone-800">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-[#F7DFBC]">
                <Headphones size={20} />
              </div>
              <h4 className="font-serif text-base font-medium">
                Hỗ trợ trực tuyến 24/7
              </h4>
              <p className="text-xs text-stone-400 leading-relaxed font-light">
                Đội ngũ chuyên viên tư vấn thượng lưu sẵn sàng hỗ trợ mọi yêu cầu riêng biệt của quý khách.
              </p>
              <div className="pt-2">
                <a
                  href="#contact"
                  className="inline-flex items-center gap-1.5 text-xs text-[#F7DFBC] hover:underline font-semibold"
                >
                  <span>Trò chuyện ngay</span>
                  <ArrowRight size={13} />
                </a>
              </div>
            </div>
          </div>

          {/* =================================================================== */}
          {/* CỘT PHẢI: DANH SÁCH PHÒNG DẠNG THẺ NGANG LỚN (lg:col-span-8)       */}
          {/* =================================================================== */}
          <div className="lg:col-span-8 space-y-6">
            {/* Top Bar: Counter & Sorting */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-stone-600">
              <span>
                Hiển thị <strong className="text-stone-900 font-semibold">{filteredRooms.length}</strong> trong tổng số 24 phòng nghỉ & biệt thự
              </span>

              <div className="flex items-center gap-2">
                <span className="text-stone-400">Sắp xếp theo:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-white border border-stone-200 rounded-xl px-3 py-1.5 text-xs text-stone-800 focus:outline-none cursor-pointer"
                >
                  <option value="DEFAULT">Đề xuất phù hợp nhất</option>
                  <option value="PRICE_ASC">Giá: Thấp đến Cao</option>
                  <option value="PRICE_DESC">Giá: Cao đến Thấp</option>
                </select>
              </div>
            </div>

            {/* List of Large Horizontal Room Cards */}
            <div className="space-y-6">
              {filteredRooms.map((room) => (
                <div
                  key={room.id}
                  className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col md:flex-row"
                >
                  {/* Photo on Left */}
                  <div className="relative md:w-80 aspect-[16/11] md:aspect-auto shrink-0 bg-stone-100 overflow-hidden">
                    <img
                      src={room.image}
                      alt={room.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                    />
                    <span className="absolute top-3.5 left-3.5 bg-black/80 backdrop-blur-xs text-white text-[9px] tracking-wider uppercase font-semibold px-3 py-1 rounded-full">
                      {room.badge}
                    </span>
                  </div>

                  {/* Content on Right */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      {/* Top row: Floor info & Price */}
                      <div className="flex items-start justify-between gap-4">
                        <span className="text-xs text-stone-400 font-medium">
                          {room.floorInfo}
                        </span>
                        <div className="text-right">
                          <span className="text-[10px] text-stone-400 block uppercase">
                            Giá từ mỗi đêm
                          </span>
                          <span className="text-lg sm:text-xl font-serif font-bold text-stone-900 block leading-tight">
                            {room.priceFormatted}
                          </span>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="font-serif text-xl sm:text-2xl font-normal text-stone-900">
                        {room.name}
                      </h3>

                      {/* Description */}
                      <p className="text-xs text-stone-500 font-light leading-relaxed">
                        {room.desc}
                      </p>

                      {/* Amenity tags with subtle borders */}
                      <div className="flex flex-wrap gap-2 pt-2">
                        {room.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-50 border border-stone-200 text-stone-700 text-[11px]"
                          >
                            <Sparkles size={11} className="text-[#C59D5F]" />
                            <span>{tag}</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Bottom CTA Row */}
                    <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-stone-500">
                        <Users size={14} className="text-stone-400" />
                        <span>Sức chứa: {room.guests}</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => navigate(`/rooms/${room.id}`)}
                        className="bg-black hover:bg-stone-800 text-white rounded-full px-5 py-2.5 text-xs font-medium flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
                      >
                        <span>Xem chi tiết & Đặt phòng</span>
                        <ArrowRight size={13} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="w-8 h-8 rounded-full border border-stone-200 flex items-center justify-center text-stone-600 hover:bg-stone-100 cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              {[1, 2, 3].map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
                    currentPage === page
                      ? 'bg-[#422C1A] text-white'
                      : 'border border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(3, p + 1))}
                className="w-8 h-8 rounded-full border border-stone-200 flex items-center justify-center text-stone-600 hover:bg-stone-100 cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomsPage;
