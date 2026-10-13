import React from 'react';
import { Link } from 'react-router-dom';
import { Users, BedDouble, Star } from 'lucide-react';
import { formatVND } from '../../utils/formatters';
import Button from '../common/Button';
import Badge from '../common/Badge';

export const RoomCard = ({ room }) => {
  if (!room) return null;

  const id = room.id;
  const roomNumber = room.roomNumber || '';
  const floor = room.floor;
  const status = room.status || 'AVAILABLE';
  const category = room.category || {};

  const name = category.name ? `${category.name} (Phòng ${roomNumber})` : `Phòng ${roomNumber}`;
  const roomType = category.name || 'Tiêu chuẩn';
  const pricePerNight = category.basePrice || room.basePrice || 0;
  const maxGuests = category.capacity || room.capacity || 2;
  const bedType = category.bedType || room.bedType || 'Giường tiêu chuẩn';
  const description = category.description || room.description || '';
  const imageUrl = category.imageUrl || room.imageUrl || 'https://images.unsplash.com/photo-1590490360182-c33d57733427';
  const isAvailable = status === 'AVAILABLE';

  return (
    <div className="bg-white rounded-3xl border border-stone-200/90 shadow-2xs hover:shadow-lg transition-all duration-300 overflow-hidden flex flex-col group">
      {/* Image & Badges */}
      <div className="relative aspect-[16/11] overflow-hidden bg-stone-100">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge variant="amber">{roomType}</Badge>
          {!isAvailable && <Badge variant="rose">Đã đặt</Badge>}
        </div>
        <div className="absolute top-3 right-3 bg-black/70 backdrop-blur-xs text-white text-[10px] tracking-wider uppercase font-semibold px-2.5 py-0.5 rounded-full">
          Tầng {floor || 1}
        </div>
      </div>

      {/* Details */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <h3 className="font-serif text-lg font-medium text-stone-900 group-hover:text-amber-800 transition-colors line-clamp-1">
            {name}
          </h3>

          {description && (
            <p className="text-xs text-stone-500 line-clamp-2 font-light leading-relaxed">
              {description}
            </p>
          )}

          <div className="flex items-center gap-4 text-xs text-stone-600 pt-2 border-t border-stone-100">
            <span className="flex items-center gap-1.5 font-medium">
              <Users size={14} className="text-stone-400" /> {maxGuests} Khách
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 font-medium">
              <BedDouble size={14} className="text-stone-400" /> {bedType}
            </span>
          </div>
        </div>

        {/* Pricing & CTA */}
        <div className="pt-4 border-t border-stone-100 flex items-center justify-between gap-2">
          <div>
            <span className="text-[10px] tracking-wider text-stone-400 uppercase block">
              Giá mỗi đêm từ
            </span>
            <span className="text-base sm:text-lg font-bold text-stone-900 font-serif">
              {formatVND(pricePerNight)}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link to={`/rooms/${id}`}>
              <Button variant="outline" size="sm" className="rounded-full px-3 text-xs font-semibold hover:border-stone-400">
                Xem chi tiết
              </Button>
            </Link>
            <Link to={`/booking-payment?roomId=${id}`}>
              <Button variant="primary" size="sm" className="rounded-full px-3 text-xs font-semibold bg-[#C59D5F] hover:bg-[#b08b50] text-white">
                Đặt ngay
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomCard;
