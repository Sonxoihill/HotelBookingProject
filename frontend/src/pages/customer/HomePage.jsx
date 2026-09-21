import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { roomService } from '../../services/roomService';
import RoomCard from '../../components/customer/RoomCard';
import { 
  ChevronRight, 
  Search, 
  Calendar, 
  Users, 
  Star, 
  Sparkles, 
  RefreshCw,
  AlertCircle
} from 'lucide-react';

export const HomePage = () => {
  const navigate = useNavigate();

  // Floating search bar states
  const [destination, setDestination] = useState("L'Étoile Sanctuary Phú Quốc");
  const [stayDates, setStayDates] = useState('24 Th4 - 28 Th10');
  const [guestsRoom, setGuestsRoom] = useState('2 Người lớn • 1 Phòng');

  // Rooms fetched from API GET /api/v1/rooms/public
  const [rooms, setRooms] = useState([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);
  const [roomError, setRoomError] = useState(null);

  const fetchRooms = async () => {
    setIsLoadingRooms(true);
    setRoomError(null);
    try {
      const response = await roomService.getPublicRooms({ page: 0, size: 6 });
      // response có thể là { success: true, data: { items: [...], totalElements: 5 } } hoặc data.items
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

  const handleSearch = (e) => {
    e.preventDefault();
    navigate('/rooms');
  };

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
        <div className="absolute -bottom-10 left-0 right-0 max-w-5xl mx-auto px-4 z-20">
          <form
            onSubmit={handleSearch}
            className="bg-white rounded-full p-2.5 sm:p-3 shadow-xl border border-stone-200/90 flex flex-col md:flex-row items-center justify-between gap-3"
          >
            {/* Field 1: Điểm đến / Loại phòng */}
            <div className="flex-1 w-full px-5 py-1 text-left border-b md:border-b-0 md:border-r border-stone-200">
              <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block">
                Điểm đến / Loại phòng
              </span>
              <select
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full text-xs font-semibold text-stone-800 bg-transparent focus:outline-none cursor-pointer truncate"
              >
                <option value="L'Étoile Sanctuary Phú Quốc">L'Étoile Sanctuary Phú Quốc</option>
                <option value="L'Étoile Luxury Resort Cam Ranh">L'Étoile Luxury Resort Cam Ranh</option>
                <option value="L'Étoile Highland Retreat Đà Lạt">L'Étoile Highland Retreat Đà Lạt</option>
              </select>
            </div>

            {/* Field 2: Ngày lưu trú */}
            <div className="flex-1 w-full px-5 py-1 text-left border-b md:border-b-0 md:border-r border-stone-200">
              <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block">
                Ngày lưu trú
              </span>
              <div className="flex items-center gap-2 text-xs font-semibold text-stone-800">
                <Calendar size={13} className="text-stone-400 shrink-0" />
                <input
                  type="text"
                  value={stayDates}
                  onChange={(e) => setStayDates(e.target.value)}
                  className="bg-transparent focus:outline-none w-full text-xs font-semibold text-stone-800 cursor-pointer"
                />
              </div>
            </div>

            {/* Field 3: Số khách */}
            <div className="flex-1 w-full px-5 py-1 text-left">
              <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400 block">
                Số khách
              </span>
              <div className="flex items-center gap-2 text-xs font-semibold text-stone-800">
                <Users size={13} className="text-stone-400 shrink-0" />
                <input
                  type="text"
                  value={guestsRoom}
                  onChange={(e) => setGuestsRoom(e.target.value)}
                  className="bg-transparent focus:outline-none w-full text-xs font-semibold text-stone-800 cursor-pointer"
                />
              </div>
            </div>

            {/* Submit button */}
            <div className="w-full md:w-auto shrink-0">
              <button
                type="submit"
                className="w-full md:w-auto bg-black hover:bg-stone-800 text-white rounded-full px-6 py-3.5 text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md"
              >
                <Search size={14} />
                <span>Tìm phòng ngay</span>
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* 2. BỘ SƯU TẬP PHÒNG TỪ DATABASE (GỌI API /api/v1/rooms/public) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.25em] text-amber-700 uppercase mb-1">
              <Sparkles size={13} />
              <span>Dữ liệu phòng thời gian thực</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-normal text-stone-900 font-serif">
              Không gian lưu trú tinh tuyển
            </h2>
          </div>
          <Link
            to="/rooms"
            className="text-xs font-semibold text-stone-700 hover:text-black flex items-center gap-1 transition-colors"
          >
            <span>Xem tất cả danh sách</span>
            <ChevronRight size={14} />
          </Link>
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
        {!isLoadingRooms && !roomError && rooms.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {rooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoadingRooms && !roomError && rooms.length === 0 && (
          <div className="text-center py-12 text-stone-500 text-sm">
            Hiện chưa có phòng nào trong hệ thống.
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
