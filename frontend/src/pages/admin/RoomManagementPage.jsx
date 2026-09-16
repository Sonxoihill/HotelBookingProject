import React, { useState, useMemo } from 'react';
import {
  Building2,
  Key,
  Wrench,
  Search,
  SlidersHorizontal,
  Plus,
  Edit2,
  Copy,
  Lock,
  Unlock,
  Users,
  CheckCircle2,
  Hotel,
} from 'lucide-react';
import { formatVND } from '../../utils/formatters';
import AddRoomModal from '../../components/admin/AddRoomModal';
import AddRoomTypeModal from '../../components/admin/AddRoomTypeModal';

const INITIAL_ROOM_TYPES = [
  {
    id: 1,
    name: 'Grand Celestial Penthouse',
    code: 'PNT-GCP-01',
    category: 'Penthouse',
    badge: 'VIP SIGNATURE',
    area: '420 m²',
    maxGuests: 4,
    price: 18500000,
    roomCountLabel: '04 Phòng',
    physicalRooms: ['P1201', 'P1202', 'P1203', 'P1204'],
    status: 'ACTIVE',
    statusLabel: 'Đang mở bán',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=160&auto=format&fit=crop&q=80',
  },
  {
    id: 2,
    name: 'Ocean Horizon Executive Suite',
    code: 'SUT-OHE-02',
    category: 'Suites Hướng Biển',
    badge: null,
    area: '85 m²',
    maxGuests: 3,
    price: 12200000,
    roomCountLabel: '08 Phòng',
    physicalRoomsRange: 'S801 → S808',
    status: 'ACTIVE',
    statusLabel: 'Đang mở bán',
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=160&auto=format&fit=crop&q=80',
  },
  {
    id: 3,
    name: 'Garden Sanctuary Pool Villa',
    code: 'VLA-GSP-03',
    category: 'Biệt thự Villa',
    badge: 'PRIVATE POOL',
    area: '210 m²',
    maxGuests: 6,
    price: 24800000,
    roomCountLabel: '06 Căn',
    physicalRoomsRange: 'V101 → V106',
    status: 'ACTIVE',
    statusLabel: 'Đang mở bán',
    image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=160&auto=format&fit=crop&q=80',
  },
  {
    id: 4,
    name: 'Deluxe Pine Forest View',
    code: 'DLX-PFV-04',
    category: 'Deluxe',
    badge: null,
    area: '55 m²',
    maxGuests: 2,
    price: 6500000,
    roomCountLabel: '30 Phòng',
    physicalRoomsRange: 'D201 → D510',
    status: 'ACTIVE',
    statusLabel: 'Đang mở bán',
    image: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=160&auto=format&fit=crop&q=80',
  },
];

export const RoomManagementPage = () => {
  const [roomTypes, setRoomTypes] = useState(INITIAL_ROOM_TYPES);
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [toastMessage, setToastMessage] = useState('');

  // Modals state
  const [isAddTypeModalOpen, setIsAddTypeModalOpen] = useState(false);
  const [isAddRoomModalOpen, setIsAddRoomModalOpen] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  const handleToggleStatus = (id) => {
    setRoomTypes((prev) =>
      prev.map((r) => {
        if (r.id === id) {
          const isNowActive = r.status !== 'ACTIVE';
          showToast(`Đã ${isNowActive ? 'mở bán' : 'tạm dừng bán'} hạng phòng "${r.name}"`);
          return {
            ...r,
            status: isNowActive ? 'ACTIVE' : 'PAUSED',
            statusLabel: isNowActive ? 'Đang mở bán' : 'Tạm dừng bán',
          };
        }
        return r;
      })
    );
  };

  const handleAddRoomType = (newTypeData) => {
    const created = {
      id: Date.now(),
      ...newTypeData,
      roomCountLabel: '01 Phòng mới',
      physicalRoomsRange: 'Chưa gán số phòng',
      status: 'ACTIVE',
      statusLabel: 'Đang mở bán',
      image: newTypeData.imageUrl || 'https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=160&auto=format&fit=crop&q=80',
    };
    setRoomTypes([...roomTypes, created]);
    showToast(`Đã cấu hình loại phòng "${created.name}" thành công!`);
  };

  const handleAddPhysicalRoom = (roomData) => {
    // Add physical room code to corresponding room type
    setRoomTypes((prev) =>
      prev.map((rt) => {
        if (rt.id === Number(roomData.roomTypeId)) {
          const updatedRooms = rt.physicalRooms ? [...rt.physicalRooms, roomData.roomNumber] : [roomData.roomNumber];
          return {
            ...rt,
            physicalRooms: updatedRooms,
            roomCountLabel: `${updatedRooms.length < 10 ? '0' + updatedRooms.length : updatedRooms.length} Phòng`,
          };
        }
        return rt;
      })
    );
    showToast(`Đã khởi tạo phòng vật lý "${roomData.roomNumber}" (${roomData.floor}) thành công!`);
  };

  const filteredRoomTypes = useMemo(() => {
    return roomTypes.filter((r) => {
      const matchFilter =
        activeFilter === 'ALL' ||
        (activeFilter === 'Penthouse' && r.category === 'Penthouse') ||
        (activeFilter === 'Suites' && r.category.includes('Suites')) ||
        (activeFilter === 'Villa' && r.category.includes('Villa'));

      const matchSearch =
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.code.toLowerCase().includes(searchTerm.toLowerCase());

      return matchFilter && matchSearch;
    });
  }, [roomTypes, activeFilter, searchTerm]);

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 bg-stone-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-stone-700 flex items-center gap-3 animate-fade-in text-xs font-medium">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Header & Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-bold tracking-[0.2em] text-amber-800 uppercase block mb-1">
            PHÂN HỆ CẤU HÌNH NGHỈ DƯỠNG • KHO PHÒNG VẬT LÝ
          </span>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-stone-900 leading-tight">
            Quản lý Loại phòng & Buồng phòng
          </h1>
          <p className="text-xs text-stone-500 mt-1 max-w-2xl">
            Cấu hình phân hạng phòng, số lượng phòng vật lý, tiện ích tiêu chuẩn và quản lý định danh phòng trong khu nghỉ dưỡng.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsAddRoomModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-stone-200/90 text-stone-700 text-xs font-semibold hover:bg-stone-50 shadow-2xs transition-colors cursor-pointer"
          >
            <Hotel size={14} className="text-stone-500" />
            <span>+ THÊM PHÒNG VẬT LÝ</span>
          </button>

          <button
            onClick={() => setIsAddTypeModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-black hover:bg-stone-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus size={14} />
            <span>+ THÊM LOẠI PHÒNG MỚI</span>
          </button>
        </div>
      </div>

      {/* 2. 3 KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1 */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold tracking-wider uppercase text-stone-400">
              PHÂN PHỔ DANH MỤC
            </span>
            <div className="w-8 h-8 rounded-xl bg-stone-100 flex items-center justify-center text-stone-700">
              <Building2 size={16} />
            </div>
          </div>
          <div className="font-serif text-2xl font-bold text-stone-900 tracking-tight leading-tight">
            {roomTypes.length < 10 ? '0' + roomTypes.length : roomTypes.length} <span className="text-sm font-normal font-sans text-stone-500">Hạng phòng chính</span>
          </div>
          <div className="text-[11px] text-stone-500 mt-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
            <span>100% Hoàn tất định mức chuẩn</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold tracking-wider uppercase text-stone-400">
              QUY MÔ KHẢ DỤNG
            </span>
            <div className="w-8 h-8 rounded-xl bg-[#FAF5EE] flex items-center justify-center text-amber-800">
              <Key size={16} />
            </div>
          </div>
          <div className="font-serif text-2xl font-bold text-stone-900 tracking-tight leading-tight">
            48 <span className="text-sm font-normal font-sans text-stone-500">Phòng vận hành</span>
          </div>
          <div className="text-[11px] text-stone-500 mt-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>Tỷ lệ sẵn sàng phân buồng 96%</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-bold tracking-wider uppercase text-stone-400">
              QUY TRÌNH KỸ THUẬT
            </span>
            <div className="w-8 h-8 rounded-xl bg-stone-100 flex items-center justify-center text-stone-700">
              <Wrench size={16} />
            </div>
          </div>
          <div className="font-serif text-2xl font-bold text-stone-900 tracking-tight leading-tight">
            02 <span className="text-sm font-normal font-sans text-stone-500">Phòng bảo trì</span>
          </div>
          <div className="text-[11px] text-stone-500 mt-2 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
            <span>Nâng cấp tiện nghi chu kỳ quý</span>
          </div>
        </div>
      </div>

      {/* 3. Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveFilter('ALL')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              activeFilter === 'ALL'
                ? 'bg-black text-white shadow-xs'
                : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200/80'
            }`}
          >
            Tất cả hạng phòng ({roomTypes.length})
          </button>
          <button
            onClick={() => setActiveFilter('Penthouse')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              activeFilter === 'Penthouse'
                ? 'bg-black text-white shadow-xs'
                : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200/80'
            }`}
          >
            Penthouse
          </button>
          <button
            onClick={() => setActiveFilter('Suites')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              activeFilter === 'Suites'
                ? 'bg-black text-white shadow-xs'
                : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200/80'
            }`}
          >
            Suites Hướng Biển
          </button>
          <button
            onClick={() => setActiveFilter('Villa')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
              activeFilter === 'Villa'
                ? 'bg-black text-white shadow-xs'
                : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200/80'
            }`}
          >
            Biệt thự Villa
          </button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-2">
          <div className="relative w-full sm:w-64">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Tìm theo mã phòng, tên hạng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-1.5 rounded-full bg-white border border-stone-200/90 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-900 shadow-2xs"
            />
          </div>
          <button
            title="Bộ lọc nâng cao"
            className="w-8 h-8 rounded-full border border-stone-200 bg-white flex items-center justify-center text-stone-600 hover:bg-stone-50 cursor-pointer shadow-2xs"
          >
            <SlidersHorizontal size={14} />
          </button>
        </div>
      </div>

      {/* 4. Room Types Table */}
      <div className="bg-white rounded-2xl border border-stone-200/90 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-stone-50/50 text-[10px] font-bold uppercase tracking-wider text-stone-400 border-b border-stone-100">
                <th className="py-3.5 px-6">HẠNG PHÒNG NGHỈ</th>
                <th className="py-3.5 px-4 text-center">DIỆN TÍCH & SỨC CHỨA</th>
                <th className="py-3.5 px-4 text-right">GIÁ TIÊU CHUẨN / ĐÊM</th>
                <th className="py-3.5 px-6">PHÒNG VẬT LÝ</th>
                <th className="py-3.5 px-4 text-center">TRẠNG THÁI</th>
                <th className="py-3.5 px-6 text-right">THAO TÁC QUẢN TRỊ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredRoomTypes.map((room) => (
                <tr key={room.id} className="hover:bg-stone-50/60 transition-colors">
                  {/* Hạng phòng nghỉ */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3.5">
                      <img
                        src={room.image}
                        alt={room.name}
                        className="w-14 h-12 rounded-xl object-cover ring-1 ring-stone-200 shrink-0 shadow-2xs"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-serif text-sm font-bold text-stone-900">{room.name}</p>
                          {room.badge && (
                            <span className="text-[9px] font-bold tracking-wider uppercase text-amber-900 bg-[#FDF4E7] border border-amber-200/70 px-1.5 py-0.5 rounded leading-none">
                              {room.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-stone-400 mt-0.5">
                          Mã định danh: <span className="font-mono text-stone-600">{room.code}</span>
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Diện tích & Sức chứa */}
                  <td className="py-4 px-4 text-center whitespace-nowrap">
                    <p className="font-bold text-stone-900">{room.area}</p>
                    <p className="text-[10px] text-stone-500 mt-0.5 flex items-center justify-center gap-1">
                      <Users size={11} className="text-stone-400" />
                      Tối đa {room.maxGuests} khách
                    </p>
                  </td>

                  {/* Giá tiêu chuẩn / đêm */}
                  <td className="py-4 px-4 text-right whitespace-nowrap">
                    <p className="font-serif text-sm font-bold text-stone-900">
                      {formatVND(room.price || room.basePrice)}
                    </p>
                    <p className="text-[9px] font-semibold text-stone-400 uppercase tracking-wider mt-0.5">
                      CHƯA VAT & PHÍ
                    </p>
                  </td>

                  {/* Phòng vật lý */}
                  <td className="py-4 px-6">
                    <p className="font-semibold text-stone-700 text-xs mb-1">
                      {room.roomCountLabel}
                    </p>
                    {room.physicalRooms ? (
                      <div className="flex flex-wrap gap-1">
                        {room.physicalRooms.map((p) => (
                          <span
                            key={p}
                            className="font-mono text-[10px] font-bold text-stone-700 bg-stone-100 border border-stone-200/80 px-1.5 py-0.5 rounded"
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="font-mono text-[11px] font-medium text-stone-600">
                        {room.physicalRoomsRange}
                      </span>
                    )}
                  </td>

                  {/* Trạng thái */}
                  <td className="py-4 px-4 text-center whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full ${
                        room.status === 'ACTIVE'
                          ? 'bg-stone-100 text-stone-700 border border-stone-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          room.status === 'ACTIVE' ? 'bg-stone-900' : 'bg-rose-500'
                        }`}
                      ></span>
                      {room.statusLabel}
                    </span>
                  </td>

                  {/* Thao tác */}
                  <td className="py-4 px-6 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => showToast(`Mở cấu hình hạng phòng: ${room.name}`)}
                        className="w-8 h-8 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-800 flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => showToast(`Đã sao chép cấu hình phòng: ${room.name}`)}
                        className="w-8 h-8 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-800 flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <Copy size={13} />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(room.id)}
                        className={`w-8 h-8 rounded-lg hover:bg-stone-100 flex items-center justify-center transition-colors cursor-pointer ${
                          room.status === 'ACTIVE'
                            ? 'text-stone-400 hover:text-rose-600'
                            : 'text-amber-600 hover:text-amber-800'
                        }`}
                      >
                        {room.status === 'ACTIVE' ? <Lock size={13} /> : <Unlock size={13} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div className="p-4 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-stone-500">
          <div>
            Hiển thị <strong className="text-stone-800 font-semibold">{filteredRoomTypes.length}</strong> trên <strong className="text-stone-800 font-semibold">{roomTypes.length}</strong> hạng phòng lưu trú • Toàn bộ danh mục khả dụng
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 cursor-pointer text-xs font-medium">
              Trước
            </button>
            <button className="w-8 h-8 rounded-lg bg-black text-white font-bold flex items-center justify-center text-xs">
              1
            </button>
            <button className="px-3 py-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 cursor-pointer text-xs font-medium">
              Sau
            </button>
          </div>
        </div>
      </div>

      {/* Add Room Type Modal */}
      <AddRoomTypeModal
        isOpen={isAddTypeModalOpen}
        onClose={() => setIsAddTypeModalOpen(false)}
        onAddRoomType={handleAddRoomType}
      />

      {/* Add Physical Room Modal */}
      <AddRoomModal
        isOpen={isAddRoomModalOpen}
        onClose={() => setIsAddRoomModalOpen(false)}
        onAddRoom={handleAddPhysicalRoom}
        roomTypes={roomTypes}
      />
    </div>
  );
};

export default RoomManagementPage;
