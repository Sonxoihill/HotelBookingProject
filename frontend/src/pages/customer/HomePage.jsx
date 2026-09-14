import React from 'react';
import { useNavigate } from 'react-router-dom';
import RoomFilterBar from '../../components/customer/RoomFilterBar';
import RoomCard from '../../components/customer/RoomCard';
import Button from '../../components/common/Button';
import { Sparkles, Shield, Award, Compass, ArrowRight } from 'lucide-react';

export const HomePage = () => {
  const navigate = useNavigate();

  const featuredRooms = [
    {
      id: 101,
      name: 'Phòng Deluxe Hướng Biển',
      roomType: 'Deluxe',
      pricePerNight: 1450000,
      maxGuests: 2,
      sizeSqM: 38,
      rating: 4.9,
      reviewsCount: 52,
      imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
      amenities: ['View biển Sơn Trà', 'Bữa sáng miễn phí', 'Bồn tắm nằm'],
    },
    {
      id: 102,
      name: 'Premier Suite Ban Công Riêng',
      roomType: 'Suite',
      pricePerNight: 2850000,
      maxGuests: 4,
      sizeSqM: 65,
      rating: 5.0,
      reviewsCount: 38,
      imageUrl: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
      amenities: ['Phòng khách riêng', 'Hồ bơi vô cực', 'Đưa đón sân bay'],
    },
    {
      id: 103,
      name: 'Standard Twin Room Hiện Đại',
      roomType: 'Standard',
      pricePerNight: 850000,
      maxGuests: 2,
      sizeSqM: 28,
      rating: 4.7,
      reviewsCount: 29,
      imageUrl: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80',
      amenities: ['2 Giường đơn cao cấp', 'Wi-Fi 5G', 'Smart TV 4K'],
    },
  ];

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Banner Section */}
      <section className="relative min-h-[520px] sm:min-h-[560px] flex items-center justify-center">
        {/* Background Image with overflow hidden isolated */}
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url('https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1920&q=80')",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-900/65 to-slate-900/45" />
          </div>
        </div>

        <div className="relative max-w-5xl mx-auto px-4 text-center space-y-6 pt-16 pb-24 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-xs font-semibold backdrop-blur-xs">
            <Sparkles size={14} />
            <span>Kỳ nghỉ dưỡng sang trọng bậc nhất bên bờ biển</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight font-serif leading-tight">
            Khám Phá Thiên Đường <br />
            <span className="text-amber-400 italic">Nghỉ Dưỡng Thượng Lưu</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-200 max-w-2xl mx-auto font-light">
            Chào mừng bạn đến với LuxeStay Hotel & Resort. Tận hưởng dịch vụ chuẩn quốc tế, không gian tinh tế và những khoảnh khắc đáng nhớ.
          </p>
        </div>
      </section>

      {/* Floating Filter Bar Container (Sits cleanly on top without being cut off) */}
      <div className="relative max-w-6xl mx-auto px-4 -mt-20 z-20">
        <RoomFilterBar onSearch={() => navigate('/rooms')} />
      </div>


      {/* Featured Rooms Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <span className="text-xs font-bold text-amber-600 uppercase tracking-widest block">
              Bộ sưu tập phòng nghỉ
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-1 font-serif">
              Hạng Phòng Nổi Bật
            </h2>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/rooms')} className="gap-2 self-start sm:self-auto">
            <span>Xem tất cả phòng</span>
            <ArrowRight size={16} />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {featuredRooms.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      </section>

      {/* Value Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-3xl p-8 lg:p-12 text-white grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
              <Award size={24} />
            </div>
            <h3 className="text-lg font-bold">Dịch vụ 5 Sao Chuẩn Quốc Tế</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tất cả các phòng đều được chăm chút kỹ lưỡng, tiện nghi hiện đại và đội ngũ nhân viên lễ tân hỗ trợ 24/7 chu đáo.
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center">
              <Shield size={24} />
            </div>
            <h3 className="text-lg font-bold">Thanh Toán Trực Tuyến An Toàn</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tích hợp đa dạng cổng thanh toán hàng đầu (VNPay, MoMo, Thẻ quốc tế) với cơ chế bảo mật tiêu chuẩn cao.
            </p>
          </div>

          <div className="space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
              <Compass size={24} />
            </div>
            <h3 className="text-lg font-bold">Vị Trí Đắc Địa Bên Bờ Biển</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Chỉ 2 phút đi bộ ra bãi cát trắng mịn, ngắm trọn vẹn bình minh và hoàng hôn tuyệt đẹp của bán đảo Sơn Trà.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
