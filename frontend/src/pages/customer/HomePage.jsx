import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Search, Calendar, Users, Loader2 } from 'lucide-react';
import RoomCard from '../../components/customer/RoomCard';
import { roomService } from '../../services/roomService';

export const HomePage = () => {
  const navigate = useNavigate();

  // Helper định dạng ngày YYYY-MM-DD
  const formatDateToISO = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getTodayISO = () => formatDateToISO(new Date());

  const getNextDateISO = (baseDateStr) => {
    const base = baseDateStr ? new Date(baseDateStr) : new Date();
    const next = new Date(base);
    next.setDate(next.getDate() + 1);
    return formatDateToISO(next);
  };

  const todayStr = getTodayISO();
  const tomorrowStr = getNextDateISO(todayStr);

  // Trạng thái tìm kiếm phòng
  const [checkIn, setCheckIn] = useState(todayStr);
  const [checkOut, setCheckOut] = useState(tomorrowStr);
  const [capacities, setCapacities] = useState([]);
  const [guests, setGuests] = useState('');
  const [searchError, setSearchError] = useState('');

  // Trạng thái danh sách phòng tải từ Database (SCRUM-40)
  const [rooms, setRooms] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);

  // Lấy số sức chứa (capacity) của phòng từ CSDL, tránh trùng lặp số sức chứa giống nhau
  useEffect(() => {
    const fetchCapacitiesFromDB = async () => {
      try {
        const response = await roomService.getPublicRooms({ page: 0, size: 100 });
        const pageData = response?.data || response;
        const roomList = pageData?.content || pageData?.items || [];

        // Tránh trùng lặp số sức chứa bằng Set
        const capacitySet = new Set();
        roomList.forEach((r) => {
          const cap = r.capacity || r.category?.capacity;
          if (cap) {
            capacitySet.add(Number(cap));
          }
        });

        // Sắp xếp tăng dần: ví dụ [1, 2, 4]
        const uniqueCapacities = Array.from(capacitySet).sort((a, b) => a - b);
        setCapacities(uniqueCapacities);
        if (uniqueCapacities.length > 0) {
          setGuests(String(uniqueCapacities[0]));
        }
      } catch (err) {
        console.error('Lỗi lấy sức chứa phòng từ database:', err);
      }
    };

    fetchCapacitiesFromDB();
  }, []);

  // Thay đổi ngày Check-in
  const handleCheckInChange = (e) => {
    const newCheckIn = e.target.value;
    setCheckIn(newCheckIn);
    if (checkOut && newCheckIn && checkOut <= newCheckIn) {
      setSearchError('Ngày Check-out phải sau ngày Check-in');
    } else {
      setSearchError('');
    }
  };

  // Thay đổi ngày Check-out
  const handleCheckOutChange = (e) => {
    const newCheckOut = e.target.value;
    setCheckOut(newCheckOut);
    if (newCheckOut && checkIn && newCheckOut <= checkIn) {
      setSearchError('Ngày Check-out phải sau ngày Check-in');
    } else {
      setSearchError('');
    }
  };

  // Gọi API GET /api/v1/rooms/public (truyền page, size)
  useEffect(() => {
    const fetchRooms = async () => {
      setIsLoadingRooms(true);
      try {
        const response = await roomService.getPublicRooms({
          page: currentPage - 1,
          size: 3,
        });

        const pageData = response?.data || response;
        if (pageData) {
          const roomList = pageData.content || pageData.items || [];
          setRooms(roomList);
          setTotalPages(pageData.totalPages || 1);
          setTotalElements(pageData.totalElements || roomList.length);
        }
      } catch (err) {
        console.error('Lỗi tải danh sách phòng trang chủ:', err);
      } finally {
        setIsLoadingRooms(false);
      }
    };

    fetchRooms();
  }, [currentPage]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    const element = document.getElementById('featured-rooms-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Xử lý khi nhấn nút "Tìm kiếm"
  const handleSearch = (e) => {
    e.preventDefault();
    if (!checkIn) {
      setSearchError('Vui lòng chọn ngày Check-in!');
      return;
    }
    if (!checkOut) {
      setSearchError('Vui lòng chọn ngày Check-out!');
      return;
    }
    if (checkOut <= checkIn) {
      setSearchError('Ngày Check-out phải sau ngày Check-in');
      return;
    }
    setSearchError('');
    navigate(`/rooms?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`);
  };

  return (
    <div className="space-y-20 pb-24 bg-[#FAF8F5]">
      {/* 1. HERO SECTION */}
      <section className="relative min-h-[560px] sm:min-h-[620px] flex items-center justify-center bg-stone-950 text-white">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=2000&q=85"
            alt="L'Étoile Luxury Resort"
            className="w-full h-full object-cover opacity-60 filter brightness-90"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-stone-950/40 to-[#FAF8F5]" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 text-center space-y-5 pt-12 pb-28 z-10">
          <div className="inline-flex items-center gap-2 text-[#F7DFBC] text-[11px] sm:text-xs tracking-[0.3em] uppercase font-semibold">
            <span>• L'ÉTOILE RESORTS & HOTELS •</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-normal font-serif tracking-tight leading-tight text-white">
            Nghệ thuật Sống Thượng Lưu & Trải nghiệm Độc bản
          </h1>

          <p className="text-xs sm:text-sm text-stone-200 max-w-2xl mx-auto font-light leading-relaxed">
            Định nghĩa lại sự xa hoa thông qua không gian kiến trúc biệt lập, dịch vụ cá nhân hóa tuyệt đối và những trải nghiệm nghỉ dưỡng đỉnh cao.
          </p>
        </div>

        {/* Thanh tìm kiếm phòng nổi trên Hero */}
        <div className="absolute -bottom-10 left-0 right-0 max-w-5xl mx-auto px-4 z-20">
          <form
            onSubmit={handleSearch}
            className="bg-white rounded-2xl md:rounded-full p-2.5 sm:p-3 shadow-xl border border-stone-200/90 flex flex-col md:flex-row items-center justify-between gap-3 text-stone-900"
          >
            {/* Field 1: Ngày Check-in */}
            <div className="flex-1 w-full px-5 py-1 text-left border-b md:border-b-0 md:border-r border-stone-200">
              <label htmlFor="home-checkin" className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block mb-0.5">
                Ngày Check-in
              </label>
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-[#C5A880] shrink-0" />
                <input
                  id="home-checkin"
                  type="date"
                  value={checkIn}
                  min={todayStr}
                  onChange={handleCheckInChange}
                  className="bg-transparent focus:outline-none w-full text-xs font-semibold text-stone-800 cursor-pointer"
                />
              </div>
            </div>

            {/* Field 2: Ngày Check-out */}
            <div className="flex-1 w-full px-5 py-1 text-left border-b md:border-b-0 md:border-r border-stone-200">
              <label htmlFor="home-checkout" className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block mb-0.5">
                Ngày Check-out
              </label>
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-[#C5A880] shrink-0" />
                <input
                  id="home-checkout"
                  type="date"
                  value={checkOut}
                  min={getNextDateISO(checkIn)}
                  onChange={handleCheckOutChange}
                  className="bg-transparent focus:outline-none w-full text-xs font-semibold text-stone-800 cursor-pointer"
                />
              </div>
            </div>

            {/* Field 3: Số lượng khách lưu trú (Số sức chứa của phòng trong database, tránh trùng lặp) */}
            <div className="flex-1 w-full px-5 py-1 text-left">
              <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block mb-0.5">
                Khách lưu trú
              </span>
              <div className="flex items-center gap-2">
                <Users size={14} className="text-[#C5A880] shrink-0" />
                <select
                  value={guests}
                  onChange={(e) => setGuests(e.target.value)}
                  className="w-full text-xs font-semibold text-stone-800 bg-transparent focus:outline-none cursor-pointer"
                >
                  {capacities.length === 0 ? (
                    <option value="">Đang tải sức chứa...</option>
                  ) : (
                    capacities.map((cap) => (
                      <option key={cap} value={cap}>
                        {cap} người
                      </option>
                    ))
                  )}
                </select>
              </div>
            </div>

            {/* Nút "Tìm kiếm" */}
            <div className="w-full md:w-auto shrink-0">
              <button
                type="submit"
                className="w-full md:w-auto bg-black hover:bg-stone-800 text-white rounded-full px-7 py-3.5 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md"
              >
                <Search size={14} />
                <span>Tìm kiếm</span>
              </button>
            </div>
          </form>

          {/* Cảnh báo lỗi ngày */}
          {searchError && (
            <div className="mt-2 text-center">
              <span className="inline-block bg-rose-600 text-white text-xs font-medium px-4 py-1 rounded-full shadow-md">
                ⚠️ {searchError}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* 2. BỘ SƯU TẬP ĐỘC QUYỀN - KHÔNG GIAN LƯU TRÚ TINH TUYỂN (DỮ LIỆU TỪ DATABASE) */}
      <section id="featured-rooms-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
          <div>
            <span className="text-[10px] font-bold tracking-[0.25em] text-stone-500 uppercase block mb-1">
              Bộ sưu tập phòng từ hệ thống
            </span>
            <h2 className="text-2xl sm:text-3xl font-normal text-stone-900 font-serif">
              Không gian lưu trú tinh tuyển
            </h2>
          </div>
          <Link
            to="/rooms"
            className="text-xs font-semibold text-stone-700 hover:text-black flex items-center gap-1 transition-colors"
          >
            <span>Xem tất cả danh sách phòng ({totalElements})</span>
            <ChevronRight size={14} />
          </Link>
        </div>

        {/* Trạng thái tải dữ liệu */}
        {isLoadingRooms ? (
          <div className="min-h-[300px] flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-amber-600 animate-spin" />
            <span className="text-xs text-stone-500 font-medium">Đang tải danh sách phòng từ hệ thống...</span>
          </div>
        ) : rooms.length === 0 ? (
          <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center space-y-3 shadow-2xs">
            <h3 className="font-serif text-lg font-medium text-stone-800">
              Hiện tại chưa có phòng nào khả dụng
            </h3>
            <p className="text-xs text-stone-500">
              Vui lòng quay lại sau hoặc liên hệ bộ phận hỗ trợ khách hàng.
            </p>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Grid các phòng thật từ Database */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
              {rooms.map((room) => (
                <RoomCard key={room.id} room={room} />
              ))}
            </div>

            {/* Các nút phân trang (Next, Prev, Số trang) khớp 100% với totalPages từ Backend */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-stone-200/70">
                <span className="text-xs text-stone-500">
                  Trang <strong className="text-stone-800 font-semibold">{currentPage}</strong> / <strong className="text-stone-800 font-semibold">{totalPages}</strong> (Tổng số {totalElements} phòng)
                </span>

                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    className="w-9 h-9 rounded-full border border-stone-200 flex items-center justify-center text-stone-600 hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    title="Trang trước"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                    <button
                      key={pageNum}
                      type="button"
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-9 h-9 rounded-full text-xs font-semibold cursor-pointer transition-colors ${currentPage === pageNum
                        ? 'bg-[#422C1A] text-white shadow-xs'
                        : 'border border-stone-200 text-stone-700 hover:bg-stone-100'
                        }`}
                    >
                      {pageNum}
                    </button>
                  ))}

                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    className="w-9 h-9 rounded-full border border-stone-200 flex items-center justify-center text-stone-600 hover:bg-stone-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                    title="Trang kế tiếp"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;
