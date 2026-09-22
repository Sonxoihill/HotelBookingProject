import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { roomService } from '../../services/roomService';
import RoomCard from '../../components/customer/RoomCard';
import { 
  ChevronRight, 
  Search, 
  Calendar, 
  Users, 
  BedDouble,
  Star, 
  Sparkles, 
  RefreshCw,
  AlertCircle,
  RotateCcw,
  X
} from 'lucide-react';

export const HomePage = () => {

  // 1. Search & Filter states
  const getTodayString = () => new Date().toISOString().split('T')[0];
  const getTomorrowString = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [checkInDate, setCheckInDate] = useState(getTodayString);
  const [checkOutDate, setCheckOutDate] = useState(getTomorrowString);
  const [guestsCount, setGuestsCount] = useState('ALL'); // 'ALL', '1', '2', '3', '4'
  const [searchKeyword, setSearchKeyword] = useState('');
  const [priceSort, setPriceSort] = useState('DEFAULT'); // 'DEFAULT', 'PRICE_ASC', 'PRICE_DESC'
  const [onlyAvailable, setOnlyAvailable] = useState(false);

  // Rooms fetched from API GET /api/v1/rooms/public
  const [rooms, setRooms] = useState([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);
  const [roomError, setRoomError] = useState(null);

  const fetchRooms = async () => {
    setIsLoadingRooms(true);
    setRoomError(null);
    try {
      const response = await roomService.getPublicRooms({ page: 0, size: 12 });
      const roomList = response?.data?.items || response?.items || response?.data || [];
      setRooms(roomList);
    } catch (err) {
      console.error('Lỗi tải danh sách phòng công khai:', err);
      setRoomError(err.message || 'Không thể kết nối đến máy chủ để tải danh sách phòng.');
    } finally {
      setIsLoadingRooms(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  // Tính số đêm lưu trú
  const calculateNights = (inDate, outDate) => {
    if (!inDate || !outDate) return 1;
    const start = new Date(inDate);
    const end = new Date(outDate);
    const diffTime = end.getTime() - start.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  };

  // Trích xuất danh sách hạng phòng duy nhất từ dữ liệu phòng thực tế
  const availableCategories = useMemo(() => {
    const cats = new Set();
    rooms.forEach((r) => {
      if (r.categoryName) cats.add(r.categoryName);
    });
    if (cats.size === 0) {
      return ['Standard Single', 'Deluxe Double', 'Family Suite'];
    }
    return Array.from(cats);
  }, [rooms]);

  // Bộ lọc dữ liệu phòng phía client
  const filteredRooms = useMemo(() => {
    let list = [...rooms];

    // 1. Lọc theo hạng phòng
    if (selectedCategory && selectedCategory !== 'ALL') {
      list = list.filter((r) => {
        const catName = r.categoryName || r.name || '';
        return catName.toLowerCase().includes(selectedCategory.toLowerCase());
      });
    }

    // 2. Lọc theo từ khóa tìm kiếm (tên, số phòng, mô tả, giường)
    if (searchKeyword.trim()) {
      const q = searchKeyword.toLowerCase().trim();
      list = list.filter((r) => {
        const catName = (r.categoryName || '').toLowerCase();
        const roomNum = (r.roomNumber || '').toString().toLowerCase();
        const desc = (r.description || '').toLowerCase();
        const bed = (r.bedType || '').toLowerCase();
        return catName.includes(q) || roomNum.includes(q) || desc.includes(q) || bed.includes(q);
      });
    }

    // 3. Lọc theo số lượng khách
    if (guestsCount && guestsCount !== 'ALL') {
      const minGuests = parseInt(guestsCount, 10);
      if (!isNaN(minGuests)) {
        list = list.filter((r) => (r.capacity || 2) >= minGuests);
      }
    }

    // 4. Lọc chỉ phòng có sẵn
    if (onlyAvailable) {
      list = list.filter((r) => !r.status || r.status === 'AVAILABLE');
    }

    // 5. Sắp xếp giá
    if (priceSort === 'PRICE_ASC') {
      list.sort((a, b) => (a.basePrice || a.price || 0) - (b.basePrice || b.price || 0));
    } else if (priceSort === 'PRICE_DESC') {
      list.sort((a, b) => (b.basePrice || b.price || 0) - (a.basePrice || a.price || 0));
    }

    return list;
  }, [rooms, selectedCategory, searchKeyword, guestsCount, onlyAvailable, priceSort]);

  // Kiểm tra xem có bộ lọc nào đang kích hoạt không
  const hasActiveFilters =
    selectedCategory !== 'ALL' ||
    guestsCount !== 'ALL' ||
    Boolean(searchKeyword.trim()) ||
    onlyAvailable ||
    priceSort !== 'DEFAULT';

  // Đặt lại toàn bộ bộ lọc
  const handleResetFilters = () => {
    setSelectedCategory('ALL');
    setGuestsCount('ALL');
    setSearchKeyword('');
    setOnlyAvailable(false);
    setPriceSort('DEFAULT');
    setCheckInDate(getTodayString());
    setCheckOutDate(getTomorrowString());
  };

  // Xử lý nút "Tìm phòng ngay"
  const handleSearch = (e) => {
    e?.preventDefault();
    const section = document.getElementById('rooms-section');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // VIP Reviews
  const vipReviews = [
    {
      id: 1,
      quote:
        '“Không gian kiến trúc tuyệt mỹ cùng dịch vụ quản gia chu đáo đến từng chi tiết nhỏ nhất. LuxeStay mang lại kỳ nghỉ vượt ngoài sự kỳ vọng của gia đình chúng tôi.”',
      name: 'Đỗ Minh Quân',
      role: 'Thành viên Black Diamond',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    },
    {
      id: 2,
      quote:
        '“Nhà hàng La Mer thực sự là một kiệt tác ẩm thực. Các món ăn kết hợp hương vị biển cả hoàn hảo trong một không gian lãng mạn bên bờ biển.”',
      name: 'Nguyễn Thùy Linh',
      role: 'Nhà thiết kế & Khách VIP',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80',
    },
    {
      id: 3,
      quote:
        '“Khu suối khoáng nóng và spa tại đây đem lại sự thư giãn tuyệt đối. Tôi cảm thấy hoàn toàn được tái tạo năng lượng sau chuỗi ngày làm việc căng thẳng.”',
      name: 'Alexander Trần',
      role: 'Giám đốc Điều hành Quỹ Đầu tư',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
    },
  ];

  return (
    <div className="space-y-20 pb-24 bg-[#FAF8F5]">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[560px] sm:min-h-[620px] flex items-center justify-center bg-stone-950 text-white">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2000&q=85"
            alt="LuxeStay Resort"
            className="w-full h-full object-cover opacity-60 filter brightness-90"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-stone-950/40 to-[#FAF8F5]" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 text-center space-y-5 pt-12 pb-28 z-10">
          <div className="inline-flex items-center gap-2 text-[#F7DFBC] text-[11px] sm:text-xs tracking-[0.3em] uppercase font-semibold">
            <span>• LUXESTAY RESORTS & HOTELS •</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-normal font-serif tracking-tight leading-tight text-white">
            Nghệ thuật Sống Thượng Lưu & Trải nghiệm Độc bản
          </h1>

          <p className="text-xs sm:text-sm text-stone-200 max-w-2xl mx-auto font-light leading-relaxed">
            Định nghĩa lại sự xa hoa thông qua không gian kiến trúc biệt lập, dịch vụ cá nhân hóa tuyệt đối và những trải nghiệm vị giác thăng hoa.
          </p>
        </div>

        {/* Floating Horizontal Search Bar Pill */}
        <div className="absolute -bottom-20 sm:-bottom-12 left-0 right-0 max-w-5xl mx-auto px-4 z-20">
          <form
            onSubmit={handleSearch}
            className="bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-full p-3 sm:p-3.5 shadow-2xl border border-stone-200/90 flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-2 transition-all"
          >
            {/* Field 1: Hạng phòng */}
            <div className="w-full md:flex-1 px-4 py-1 text-left border-b md:border-b-0 md:border-r border-stone-200">
              <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block mb-0.5">
                Hạng phòng nghỉ
              </span>
              <div className="flex items-center gap-2">
                <BedDouble size={15} className="text-[#C59D5F] shrink-0" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full text-xs font-semibold text-stone-800 bg-transparent focus:outline-none cursor-pointer truncate"
                >
                  <option value="ALL">Tất cả các hạng phòng</option>
                  {availableCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Field 2: Ngày lưu trú */}
            <div className="w-full md:flex-1 px-4 py-1 text-left border-b md:border-b-0 md:border-r border-stone-200">
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block">
                  Ngày lưu trú
                </span>
                <span className="text-[10px] font-semibold text-[#8C6239] bg-[#F7DFBC]/60 px-1.5 py-0.2 rounded-full">
                  {calculateNights(checkInDate, checkOutDate)} đêm
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold text-stone-800">
                <Calendar size={15} className="text-[#C59D5F] shrink-0" />
                <div className="flex items-center gap-1.5 w-full">
                  <input
                    type="date"
                    value={checkInDate}
                    min={getTodayString()}
                    onChange={(e) => {
                      const newIn = e.target.value;
                      setCheckInDate(newIn);
                      if (newIn >= checkOutDate) {
                        const nextD = new Date(newIn);
                        nextD.setDate(nextD.getDate() + 1);
                        setCheckOutDate(nextD.toISOString().split('T')[0]);
                      }
                    }}
                    className="bg-transparent focus:outline-none text-xs font-semibold text-stone-800 cursor-pointer w-[110px]"
                    title="Ngày nhận phòng"
                  />
                  <span className="text-stone-300 font-normal">→</span>
                  <input
                    type="date"
                    value={checkOutDate}
                    min={checkInDate || getTodayString()}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    className="bg-transparent focus:outline-none text-xs font-semibold text-stone-800 cursor-pointer w-[110px]"
                    title="Ngày trả phòng"
                  />
                </div>
              </div>
            </div>

            {/* Field 3: Số khách */}
            <div className="w-full md:flex-1 px-4 py-1 text-left border-b md:border-b-0 md:border-r border-stone-200">
              <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block mb-0.5">
                Số lượng khách
              </span>
              <div className="flex items-center gap-2 text-xs font-semibold text-stone-800">
                <Users size={15} className="text-[#C59D5F] shrink-0" />
                <select
                  value={guestsCount}
                  onChange={(e) => setGuestsCount(e.target.value)}
                  className="w-full text-xs font-semibold text-stone-800 bg-transparent focus:outline-none cursor-pointer truncate"
                >
                  <option value="ALL">Mọi số lượng khách</option>
                  <option value="1">1 Khách (Phòng đơn)</option>
                  <option value="2">2 Khách (Phòng đôi)</option>
                  <option value="3">3 Khách (Gia đình nhỏ)</option>
                  <option value="4">4+ Khách (Gia đình / Nhóm)</option>
                </select>
              </div>
            </div>

            {/* Action buttons */}
            <div className="w-full md:w-auto flex items-center gap-2 shrink-0">
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  title="Đặt lại bộ lọc"
                  className="p-3 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-full transition-colors cursor-pointer"
                >
                  <RotateCcw size={15} />
                </button>
              )}

              <button
                type="submit"
                className="w-full md:w-auto bg-[#2C1E11] hover:bg-[#432E1A] text-white rounded-full px-6 py-3 sm:py-3.5 text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md hover:shadow-lg active:scale-95"
              >
                <Search size={14} className="stroke-[2.5]" />
                <span>Tìm phòng ngay</span>
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* 2. BỘ SƯU TẬP PHÒNG TỪ DATABASE (GỌI API /api/v1/rooms/public) */}
      <section id="rooms-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-14 scroll-mt-24">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.25em] text-amber-700 uppercase mb-1">
              <Sparkles size={13} />
              <span>Dữ liệu phòng thời gian thực</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-normal text-stone-900 font-serif">
              Không gian lưu trú tinh tuyển
            </h2>
            <p className="text-xs text-stone-500 mt-1">
              Tùy chọn không gian nghỉ dưỡng đỉnh cao phù hợp với phong cách và kỳ nghỉ của quý khách.
            </p>
          </div>
          <Link
            to={`/rooms?category=${encodeURIComponent(selectedCategory !== 'ALL' ? selectedCategory : '')}&guests=${guestsCount !== 'ALL' ? guestsCount : ''}`}
            className="text-xs font-semibold text-stone-700 hover:text-black flex items-center gap-1 transition-colors self-start sm:self-auto"
          >
            <span>Xem tất cả danh sách</span>
            <ChevronRight size={14} />
          </Link>
        </div>

        {/* Search & Quick Filters Toolbar */}
        <div className="bg-white rounded-2xl border border-stone-200/90 p-3 sm:p-4 mb-6 shadow-2xs space-y-3">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* Quick Category Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
              <button
                type="button"
                onClick={() => setSelectedCategory('ALL')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === 'ALL'
                    ? 'bg-[#2C1E11] text-white shadow-2xs'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200/80 hover:text-stone-900'
                }`}
              >
                Tất cả ({rooms.length})
              </button>
              {availableCategories.map((cat) => {
                const count = rooms.filter((r) => (r.categoryName || '').includes(cat)).length;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-[#F7DFBC] text-[#2C1E11] font-semibold shadow-2xs'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200/80 hover:text-stone-900'
                    }`}
                  >
                    {cat} ({count})
                  </button>
                );
              })}
            </div>

            {/* Keyword Search Box & Sắp xếp */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Keyword Search */}
              <div className="relative flex-1 sm:w-56 min-w-[160px]">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder="Tìm số phòng, tên..."
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-full focus:outline-none focus:border-stone-400 text-stone-800 placeholder-stone-400 transition-colors"
                />
                {searchKeyword && (
                  <button
                    type="button"
                    onClick={() => setSearchKeyword('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"
                  >
                    <X size={12} />
                  </button>
                )}
              </div>

              {/* Sắp xếp giá */}
              <select
                value={priceSort}
                onChange={(e) => setPriceSort(e.target.value)}
                className="bg-stone-50 border border-stone-200 rounded-full px-3 py-1.5 text-xs text-stone-700 focus:outline-none cursor-pointer"
              >
                <option value="DEFAULT">Sắp xếp: Mặc định</option>
                <option value="PRICE_ASC">Giá: Thấp đến Cao</option>
                <option value="PRICE_DESC">Giá: Cao đến Thấp</option>
              </select>

              {/* Toggle: Chỉ phòng trống */}
              <button
                type="button"
                onClick={() => setOnlyAvailable(!onlyAvailable)}
                className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
                  onlyAvailable
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300 font-semibold'
                    : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${onlyAvailable ? 'bg-emerald-500' : 'bg-stone-400'}`}></span>
                <span>Chỉ phòng trống</span>
              </button>
            </div>
          </div>

          {/* Active Filters Summary Bar */}
          {hasActiveFilters && (
            <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex flex-wrap items-center gap-1.5 text-stone-600">
                <span className="text-[11px] text-stone-400 font-medium">Đang lọc theo:</span>

                {selectedCategory !== 'ALL' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[11px] font-medium border border-amber-200/80">
                    Hạng: {selectedCategory}
                    <button onClick={() => setSelectedCategory('ALL')} className="hover:text-rose-600 cursor-pointer">
                      <X size={11} />
                    </button>
                  </span>
                )}

                {guestsCount !== 'ALL' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[11px] font-medium border border-amber-200/80">
                    Sức chứa: ≥ {guestsCount} khách
                    <button onClick={() => setGuestsCount('ALL')} className="hover:text-rose-600 cursor-pointer">
                      <X size={11} />
                    </button>
                  </span>
                )}

                {searchKeyword && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[11px] font-medium border border-amber-200/80">
                    Từ khóa: "{searchKeyword}"
                    <button onClick={() => setSearchKeyword('')} className="hover:text-rose-600 cursor-pointer">
                      <X size={11} />
                    </button>
                  </span>
                )}

                {onlyAvailable && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[11px] font-medium border border-emerald-200/80">
                    Chỉ phòng trống
                    <button onClick={() => setOnlyAvailable(false)} className="hover:text-rose-600 cursor-pointer">
                      <X size={11} />
                    </button>
                  </span>
                )}

                {priceSort !== 'DEFAULT' && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 text-[11px] font-medium border border-stone-200">
                    {priceSort === 'PRICE_ASC' ? 'Giá tăng dần' : 'Giá giảm dần'}
                    <button onClick={() => setPriceSort('DEFAULT')} className="hover:text-rose-600 cursor-pointer">
                      <X size={11} />
                    </button>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <span className="text-stone-500 text-[11px]">
                  Tìm thấy <strong className="text-stone-900 font-semibold">{filteredRooms.length}</strong> / {rooms.length} phòng
                </span>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-[11px] text-rose-600 hover:text-rose-700 hover:underline font-medium cursor-pointer"
                >
                  Xóa tất cả
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Loading state skeleton */}
        {isLoadingRooms && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-3xl border border-stone-200/80 p-5 space-y-4 animate-pulse">
                <div className="aspect-[16/10] bg-stone-200 rounded-2xl"></div>
                <div className="h-5 bg-stone-200 rounded w-2/3"></div>
                <div className="h-4 bg-stone-100 rounded w-full"></div>
                <div className="h-10 bg-stone-200 rounded-xl mt-4"></div>
              </div>
            ))}
          </div>
        )}

        {/* Error state */}
        {!isLoadingRooms && roomError && (
          <div className="bg-amber-50 border border-amber-200 rounded-3xl p-8 text-center space-y-3 max-w-lg mx-auto">
            <AlertCircle size={28} className="text-amber-600 mx-auto" />
            <h3 className="font-bold text-stone-900 text-base">Không thể tải dữ liệu phòng từ Database</h3>
            <p className="text-xs text-stone-600">{roomError}</p>
            <button
              onClick={fetchRooms}
              className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-stone-900 hover:bg-black text-white text-xs font-semibold rounded-full transition-colors"
            >
              <RefreshCw size={13} />
              <span>Tải lại</span>
            </button>
          </div>
        )}

        {/* Room cards grid render from Database */}
        {!isLoadingRooms && !roomError && filteredRooms.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {filteredRooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        )}

        {/* Empty state when filter has no match */}
        {!isLoadingRooms && !roomError && filteredRooms.length === 0 && (
          <div className="bg-white border border-stone-200 rounded-3xl p-12 text-center space-y-4 max-w-md mx-auto shadow-2xs">
            <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
              <AlertCircle size={24} />
            </div>
            <h3 className="text-base font-serif font-bold text-stone-900">
              Không tìm thấy phòng phù hợp
            </h3>
            <p className="text-xs text-stone-500 leading-relaxed">
              Không có phòng nào thỏa mãn tiêu chí tìm kiếm hiện tại. Quý khách vui lòng thử điều chỉnh lại số khách, hạng phòng hoặc xóa bộ lọc.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#2C1E11] hover:bg-[#432E1A] text-white text-xs font-semibold rounded-full transition-colors cursor-pointer shadow-xs"
            >
              <RotateCcw size={13} />
              <span>Đặt lại tất cả bộ lọc</span>
            </button>
          </div>
        )}
      </section>

      {/* 3. ẨM THỰC & THƯ GIÃN MICHELIN */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10 space-y-1">
          <span className="text-[10px] font-bold tracking-[0.25em] text-stone-500 uppercase block">
            Ẩm thực & Thư giãn Michelin
          </span>
          <h2 className="text-2xl sm:text-3xl font-normal text-stone-900 font-serif">
            Đánh thức mọi giác quan
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs flex flex-col group">
            <div className="relative aspect-[16/10] overflow-hidden bg-stone-100">
              <img
                src="https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=800&q=80"
                alt="Nhà hàng La Mer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <span className="absolute top-4 left-4 bg-black/75 backdrop-blur-xs text-white text-[10px] tracking-wider uppercase font-semibold px-3 py-1 rounded-full">
                Nhà hàng La Mer
              </span>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <h3 className="font-serif text-xl font-medium text-stone-900">
                  Hương vị đại dương tinh tế
                </h3>
                <p className="text-xs text-stone-500 font-light leading-relaxed">
                  Dưới bàn tay tài hoa của bếp trưởng 3 sao Michelin, La Mer mang đến tiệc giao hưởng vị giác từ hải sản tươi sống và nguyên liệu thượng hạng nhập khẩu.
                </p>
              </div>
              <div>
                <Link to="/experiences">
                  <button className="border border-stone-300 hover:border-stone-900 text-stone-800 text-xs font-semibold px-5 py-2.5 rounded-full transition-colors cursor-pointer">
                    Khám phá thực đơn
                  </button>
                </Link>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-xs flex flex-col group">
            <div className="relative aspect-[16/10] overflow-hidden bg-stone-100">
              <img
                src="https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80"
                alt="Thermal Waters & Spa"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <span className="absolute top-4 left-4 bg-black/75 backdrop-blur-xs text-white text-[10px] tracking-wider uppercase font-semibold px-3 py-1 rounded-full">
                Thermal Waters & Spa
              </span>
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <h3 className="font-serif text-xl font-medium text-stone-900">
                  Suối khoáng nóng & Trị liệu toàn diện
                </h3>
                <p className="text-xs text-stone-500 font-light leading-relaxed">
                  Tận hưởng liệu pháp thuỷ trị liệu độc quyền kết hợp dược liệu cổ truyền, giúp thanh lọc cơ thể và tái tạo năng lượng sâu từ bên trong.
                </p>
              </div>
              <div>
                <Link to="/experiences">
                  <button className="border border-stone-300 hover:border-stone-900 text-stone-800 text-xs font-semibold px-5 py-2.5 rounded-full transition-colors cursor-pointer">
                    Đặt lịch trị liệu
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Ý KIẾN KHÁCH HÀNG VIP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10 space-y-1">
          <span className="text-[10px] font-bold tracking-[0.25em] text-stone-500 uppercase block">
            Ý kiến khách hàng
          </span>
          <h2 className="text-2xl sm:text-3xl font-normal text-stone-900 font-serif">
            Trải nghiệm từ các thành viên VIP
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {vipReviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white rounded-3xl border border-stone-200/90 p-6 shadow-xs flex flex-col justify-between space-y-6"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-1 text-[#C59D5F]">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} className="fill-[#C59D5F]" />
                  ))}
                </div>
                <p className="text-xs text-stone-600 italic font-serif leading-relaxed">
                  {rev.quote}
                </p>
              </div>

              <div className="flex items-center gap-3 pt-3 border-t border-stone-100">
                <img
                  src={rev.avatar}
                  alt={rev.name}
                  className="w-9 h-9 rounded-full object-cover border border-stone-200"
                />
                <div>
                  <h4 className="text-xs font-bold text-stone-900">{rev.name}</h4>
                  <span className="text-[11px] text-stone-400 font-light block">
                    {rev.role}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default HomePage;
