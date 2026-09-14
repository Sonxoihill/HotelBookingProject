import React, { useState } from 'react';
import { Search, Calendar, Users, SlidersHorizontal } from 'lucide-react';
import Button from '../common/Button';

export const RoomFilterBar = ({ onSearch, className = '' }) => {
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState('2');
  const [roomType, setRoomType] = useState('ALL');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onSearch) {
      onSearch({ checkIn, checkOut, guests, roomType });
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`bg-white rounded-2xl shadow-xl border border-slate-100 p-4 lg:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end ${className}`}
    >
      {/* Check In */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
          <Calendar size={14} className="text-amber-600" />
          <span>Ngày nhận phòng</span>
        </label>
        <input
          type="date"
          value={checkIn}
          onChange={(e) => setCheckIn(e.target.value)}
          className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
        />
      </div>

      {/* Check Out */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
          <Calendar size={14} className="text-amber-600" />
          <span>Ngày trả phòng</span>
        </label>
        <input
          type="date"
          value={checkOut}
          onChange={(e) => setCheckOut(e.target.value)}
          className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
        />
      </div>

      {/* Guests */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
          <Users size={14} className="text-amber-600" />
          <span>Số lượng khách</span>
        </label>
        <select
          value={guests}
          onChange={(e) => setGuests(e.target.value)}
          className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 bg-white"
        >
          <option value="1">1 Người lớn</option>
          <option value="2">2 Người lớn</option>
          <option value="3">3 Người lớn</option>
          <option value="4">4+ Người (Gia đình)</option>
        </select>
      </div>

      {/* Room Type */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
          <SlidersHorizontal size={14} className="text-amber-600" />
          <span>Loại phòng</span>
        </label>
        <select
          value={roomType}
          onChange={(e) => setRoomType(e.target.value)}
          className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 bg-white"
        >
          <option value="ALL">Tất cả hạng phòng</option>
          <option value="STANDARD">Standard</option>
          <option value="SUPERIOR">Superior</option>
          <option value="DELUXE">Deluxe</option>
          <option value="SUITE">President Suite</option>
        </select>
      </div>

      {/* Search Button */}
      <div>
        <Button type="submit" variant="primary" className="w-full h-[42px] gap-2 font-semibold">
          <Search size={16} />
          <span>Tìm phòng trống</span>
        </Button>
      </div>
    </form>
  );
};

export default RoomFilterBar;
