import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Maximize2, Wifi, Coffee, Star } from 'lucide-react';
import { formatVND } from '../../utils/formatters';
import Button from '../common/Button';
import Badge from '../common/Badge';

export const RoomCard = ({ room }) => {
  const {
    id = 1,
    name = 'Deluxe Ocean View Room',
    roomType = 'Deluxe',
    pricePerNight = 1250000,
    maxGuests = 2,
    sizeSqM = 35,
    rating = 4.9,
    reviewsCount = 48,
    imageUrl = 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80',
    amenities = ['Wi-Fi tốc độ cao', 'Bữa sáng miễn phí', 'Ban công view biển'],
    isAvailable = true,
  } = room || {};

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group">
      {/* Image & Badges */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge variant="amber">{roomType}</Badge>
          {!isAvailable && <Badge variant="rose">Hết phòng</Badge>}
        </div>
        <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-xs px-2.5 py-1 rounded-full text-xs font-bold text-slate-800 flex items-center gap-1 shadow-xs">
          <Star size={13} className="text-amber-500 fill-amber-500" />
          <span>{rating}</span>
          <span className="text-slate-400 font-normal">({reviewsCount})</span>
        </div>
      </div>

      {/* Details */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-lg text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-1">
            {name}
          </h3>

          <div className="flex items-center gap-4 mt-2.5 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Users size={14} className="text-slate-400" /> {maxGuests} Khách
            </span>
            <span className="flex items-center gap-1">
              <Maximize2 size={14} className="text-slate-400" /> {sizeSqM} m²
            </span>
          </div>

          {/* Amenities tags */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {amenities.slice(0, 3).map((item, idx) => (
              <span
                key={idx}
                className="text-[11px] px-2 py-0.5 rounded bg-slate-50 text-slate-600 border border-slate-100"
              >
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Pricing & CTA */}
        <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 block">Giá mỗi đêm từ</span>
            <span className="text-lg font-bold text-amber-600">{formatVND(pricePerNight)}</span>
          </div>
          <Link to={`/rooms/${id}`}>
            <Button variant="primary" size="sm">
              Xem phòng
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RoomCard;
