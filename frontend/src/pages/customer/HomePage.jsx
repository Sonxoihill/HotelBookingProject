import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronRight, ChevronLeft, Search, Calendar, Users, MapPin, Star } from 'lucide-react';

export const HomePage = () => {
  const navigate = useNavigate();

  // Floating search bar states
  const [destination, setDestination] = useState("L'Étoile Sanctuary Phú Quốc");
  const [stayDates, setStayDates] = useState('24 Th4 - 28 Th10');
  const [guestsRoom, setGuestsRoom] = useState('2 Người lớn • 1 Phòng');

  // Featured luxury rooms (Image 1)
  const featuredRooms = [
    {
      id: '1',
      title: 'Penthouse Ocean View',
      badge: 'PENTHOUSE SUITE',
      rating: '4.98',
      desc: 'Tầm nhìn toàn cảnh đại dương vô tận từ tầng cao nhất, hồ bơi vô cực riêng tư và dịch vụ quản gia...',
      guests: '2 Khách',
      size: '120m²',
      feature: 'Hồ bơi riêng',
      price: '18.700.000 đ',
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: '2',
      title: 'Royal Executive Suite',
      badge: 'ROYAL SUITE',
      rating: '4.95',
      desc: 'Không gian hoàng gia cổ điển kết hợp giữa nội thất tinh xảo Pháp và tiện nghi công nghệ hiện đại thông...',
      guests: '2 Khách',
      size: '95m²',
      feature: 'Ban công lớn',
      price: '12.200.000 đ',
      image: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: '3',
      title: 'Garden Villa',
      badge: 'GARDEN VILLA',
      rating: '4.99',
      desc: 'Ẩn mình giữa khu vườn nhiệt đới xanh mát, mang lại sự riêng tư tuyệt đối cùng bồn tắm lộ thiên thư giãn.',
      guests: '4 Khách',
      size: '210m²',
      feature: 'Khu vườn riêng',
      price: '24.000.000 đ',
      image: 'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=800&q=80',
    },
  ];

  // VIP Reviews
  const vipReviews = [
    {
      id: 1,
      quote:
        '“Không gian kiến trúc tuyệt mỹ cùng dịch vụ quản gia chu đáo đến từng chi tiết nhỏ nhất. L\'Étoile mang lại kỳ nghỉ vượt ngoài sự kỳ vọng của gia đình chúng tôi.”',
      name: 'Đỗ Minh Quân',
      role: 'Thành viên Black Diamond',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    },
    {
      id: 2,
      quote:
        '“Nhà hàng La Mer thực sự là một kiệt tác ẩm thực. Các món ăn kết hợp hương vị biển cả hoàn hảo trong một không gian lãng mạn bên bờ biển.”',
      name: 'Nguyễn Thùy Linh',
      role: 'Nhà thiết kế trang sức & Khách VIP',
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
                <span>Chọn phòng ngay</span>
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* 2. BỘ SƯU TẬP ĐỘC QUYỀN - KHÔNG GIAN LƯU TRÚ TINH TUYỂN */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-3">
          <div>
            <span className="text-[10px] font-bold tracking-[0.25em] text-stone-500 uppercase block mb-1">
              Bộ sưu tập độc quyền
            </span>
            <h2 className="text-2xl sm:text-3xl font-normal text-stone-900 font-serif">
              Không gian lưu trú tinh tuyển
            </h2>
          </div>
          <Link
            to="/rooms"
            className="text-xs font-semibold text-stone-700 hover:text-black flex items-center gap-1 transition-colors"
          >
            <span>Xem tất cả phòng (12)</span>
            <ChevronRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
          {featuredRooms.map((room) => (
            <div
              key={room.id}
              className="bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col group"
            >
              {/* Image & Badges */}
              <div className="relative aspect-[16/11] overflow-hidden bg-stone-100">
                <img
                  src={room.image}
                  alt={room.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <span className="absolute top-3 left-3 bg-black/75 backdrop-blur-xs text-white text-[10px] tracking-wider uppercase font-semibold px-3 py-1 rounded-full">
                  {room.badge}
                </span>
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs text-stone-900 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
                  <Star size={12} className="text-[#C59D5F] fill-[#C59D5F]" />
                  <span>{room.rating}</span>
                </div>
              </div>

              {/* Details */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="font-serif text-lg font-medium text-stone-900 group-hover:text-[#B89355] transition-colors">
                    {room.title}
                  </h3>
                  <p className="text-xs text-stone-500 line-clamp-2 font-light leading-relaxed">
                    {room.desc}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-stone-500 pt-1">
                    <span>{room.guests}</span>
                    <span>•</span>
                    <span>{room.size}</span>
                    <span>•</span>
                    <span>{room.feature}</span>
                  </div>
                </div>

                {/* Price & Button */}
                <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] tracking-wider text-stone-400 uppercase block">
                      Giá mỗi đêm
                    </span>
                    <span className="text-sm sm:text-base font-bold text-stone-900 font-serif">
                      {room.price}
                    </span>
                  </div>
                  <Link to="/rooms">
                    <button className="bg-[#422C1A] hover:bg-[#2C1C10] text-white text-xs font-medium px-5 py-2 rounded-full transition-colors cursor-pointer">
                      Đặt ngay
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. ẨM THỰC & THƯ GIÃN MICHELIN - ĐÁNH THỨC MỌI GIÁC QUAN */}
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
          {/* Card 1: Ẩm thực */}
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs flex flex-col group">
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

          {/* Card 2: Spa */}
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs flex flex-col group">
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

      {/* 4. Ý KIẾN KHÁCH HÀNG - TRẢI NGHIỆM TỪ CÁC THÀNH VIÊN VIP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-[10px] font-bold tracking-[0.25em] text-stone-500 uppercase block mb-1">
              Ý kiến khách hàng
            </span>
            <h2 className="text-2xl sm:text-3xl font-normal text-stone-900 font-serif">
              Trải nghiệm từ các thành viên VIP
            </h2>
          </div>

          {/* Nav arrows */}
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 rounded-full border border-stone-300 flex items-center justify-center text-stone-600 hover:border-stone-900 hover:text-black transition-colors">
              <ChevronLeft size={16} />
            </button>
            <button className="w-8 h-8 rounded-full border border-stone-300 flex items-center justify-center text-stone-600 hover:border-stone-900 hover:text-black transition-colors">
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {vipReviews.map((rev) => (
            <div
              key={rev.id}
              className="bg-white rounded-2xl border border-stone-200/90 p-6 shadow-2xs flex flex-col justify-between space-y-6"
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
