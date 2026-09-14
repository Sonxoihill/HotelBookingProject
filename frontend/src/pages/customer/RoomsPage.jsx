import React, { useState } from 'react';
import RoomFilterBar from '../../components/customer/RoomFilterBar';
import RoomCard from '../../components/customer/RoomCard';
import { SlidersHorizontal } from 'lucide-react';

export const RoomsPage = () => {
  const initialRooms = [
    {
      id: 101,
      name: 'Deluxe Ocean View Room',
      roomType: 'Deluxe',
      pricePerNight: 1450000,
      maxGuests: 2,
      sizeSqM: 38,
      rating: 4.9,
      reviewsCount: 52,
      imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80',
      amenities: ['View biển Sơn Trà', 'Bữa sáng miễn phí', 'Bồn tắm nằm'],
      isAvailable: true,
    },
    {
      id: 102,
      name: 'Presidential Royal Suite',
      roomType: 'Suite',
      pricePerNight: 3500000,
      maxGuests: 4,
      sizeSqM: 85,
      rating: 5.0,
      reviewsCount: 42,
      imageUrl: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
      amenities: ['Phòng khách riêng', 'Hồ bơi vô cực', 'Đưa đón sân bay'],
      isAvailable: true,
    },
    {
      id: 103,
      name: 'Superior Double King Bed',
      roomType: 'Superior',
      pricePerNight: 1100000,
      maxGuests: 2,
      sizeSqM: 32,
      rating: 4.8,
      reviewsCount: 35,
      imageUrl: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80',
      amenities: ['Giường King 2m x 2m', 'Ban công vườn', 'Smart TV'],
      isAvailable: true,
    },
    {
      id: 104,
      name: 'Standard Twin Room',
      roomType: 'Standard',
      pricePerNight: 850000,
      maxGuests: 2,
      sizeSqM: 28,
      rating: 4.7,
      reviewsCount: 29,
      imageUrl: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80',
      amenities: ['2 Giường đơn cao cấp', 'Wi-Fi 5G', 'Bàn làm việc'],
      isAvailable: true,
    },
    {
      id: 105,
      name: 'Executive Family Suite',
      roomType: 'Suite',
      pricePerNight: 2900000,
      maxGuests: 5,
      sizeSqM: 70,
      rating: 4.9,
      reviewsCount: 21,
      imageUrl: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80',
      amenities: ['2 Phòng ngủ riêng', 'Bếp mini', 'View biển & núi'],
      isAvailable: true,
    },
    {
      id: 106,
      name: 'Cozy City View Room',
      roomType: 'Standard',
      pricePerNight: 790000,
      maxGuests: 2,
      sizeSqM: 25,
      rating: 4.6,
      reviewsCount: 18,
      imageUrl: 'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?auto=format&fit=crop&w=800&q=80',
      amenities: ['View thành phố về đêm', 'Minibar', 'Trà & cafe miễn phí'],
      isAvailable: false,
    },
  ];

  const [rooms, setRooms] = useState(initialRooms);

  const handleFilter = (filters) => {
    let result = [...initialRooms];
    if (filters.roomType && filters.roomType !== 'ALL') {
      result = result.filter(
        (r) => r.roomType.toUpperCase() === filters.roomType.toUpperCase()
      );
    }
    setRooms(result);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header title */}
      <div>
        <span className="text-xs font-bold text-amber-600 uppercase tracking-widest block">
          Khám phá không gian nghỉ dưỡng
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 mt-1 font-serif">
          Danh Sách Phòng & Biệt Thự Nghỉ Dưỡng
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Lọc theo ngày nhận phòng, số lượng khách và hạng phòng yêu thích của bạn.
        </p>
      </div>

      {/* Filter Component */}
      <RoomFilterBar onSearch={handleFilter} />

      {/* Result Count */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-b border-slate-200/60 pb-3">
        <span className="font-semibold text-slate-700">
          Hiển thị {rooms.length} phòng khả dụng
        </span>
        <span className="flex items-center gap-1">
          <SlidersHorizontal size={13} /> Sắp xếp theo: Giá tốt nhất
        </span>
      </div>

      {/* Room Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {rooms.map((room) => (
          <RoomCard key={room.id} room={room} />
        ))}
      </div>
    </div>
  );
};

export default RoomsPage;
