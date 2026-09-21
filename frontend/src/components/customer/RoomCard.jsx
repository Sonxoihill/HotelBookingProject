import React from 'react';
import { Link } from 'react-router-dom';
import { Users, BedDouble, Star, CheckCircle, Sparkles } from 'lucide-react';
import { formatVND } from '../../utils/formatters';
import Button from '../common/Button';
import Badge from '../common/Badge';

/**
 * Component RoomCard.jsx
 * Hiển thị thẻ phòng gồm: Ảnh, Tên loại phòng, Giá tiền và các thông số tiện ích.
 */
export const RoomCard = ({ room }) => {
  if (!room) return null;

  // Hỗ trợ cả RoomPublicDto từ backend và mock object
  const id = room.id || 1;
  const roomNumber = room.roomNumber || '';
  const roomType = room.categoryName || room.name || room.roomType || 'Phòng Cao Cấp';
  const price = room.basePrice || room.pricePerNight || room.price || 500000;
  const capacity = room.capacity || room.maxGuests || 2;
  const bedType = room.bedType || '1 Giường King';
  const imageUrl = room.imageUrl || room.image || 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80';
  const description = room.description || 'Không gian nghỉ dưỡng sang trọng, tiện nghi và ấm cúng.';
  const isAvailable = room.status ? room.status === 'AVAILABLE' : true;

  return (
    <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col group">
      {/* 1. ẢNH PHÒNG */}
      <div className="relative aspect-[16/10] overflow-hidden bg-stone-100">
        <img
          src={imageUrl}
          alt={roomType}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          loading="lazy"
        />

        {/* Badge Số phòng & Trạng thái */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          {roomNumber && (
            <span className="bg-stone-950/80 backdrop-blur-xs text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-xs">
              Phòng {roomNumber}
            </span>
          )}
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-xs backdrop-blur-xs ${
            isAvailable ? 'bg-emerald-600/90 text-white' : 'bg-rose-600/90 text-white'
          }`}>
            {isAvailable ? 'Có sẵn' : 'Đã đặt'}
          </span>
        </div>

        {/* Rating badge */}
        <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-xs text-stone-900 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
          <Star size={13} className="text-amber-500 fill-amber-500" />
          <span>4.9</span>
          <span className="text-stone-400 font-normal text-[10px]">(98)</span>
        </div>
      </div>

      {/* 2. CHI TIẾT & TÊN LOẠI PHÒNG */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          {/* Tên loại phòng */}
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-serif text-xl font-bold text-stone-900 group-hover:text-amber-600 transition-colors line-clamp-1">
              {roomType}
            </h3>
          </div>

          <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed font-light">
            {description}
          </p>

          {/* Tiện nghi cơ bản */}
          <div className="flex items-center gap-4 text-xs text-stone-600 pt-2 border-t border-stone-100">
            <span className="inline-flex items-center gap-1.5 font-medium">
              <Users size={14} className="text-amber-600 shrink-0" />
              {capacity} Khách
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1.5 font-medium">
              <BedDouble size={14} className="text-amber-600 shrink-0" />
              {bedType}
            </span>
          </div>
        </div>

        {/* 3. GIÁ TIỀN & HÀNH ĐỘNG */}
        <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
          <div>
            <span className="text-[10px] tracking-wider text-stone-400 uppercase font-bold block">
              Giá mỗi đêm
            </span>
            <span className="text-lg sm:text-xl font-extrabold text-stone-950 font-serif">
              {formatVND(price)}
            </span>
          </div>

          <Link to={`/rooms/${id}`}>
            <button className="bg-[#422C1A] hover:bg-[#2A1B10] text-white text-xs font-semibold px-4 py-2.5 rounded-full transition-all shadow-sm hover:shadow-md cursor-pointer inline-flex items-center gap-1.5">
              <span>Xem & Đặt</span>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RoomCard;
