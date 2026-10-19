import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Home,
  Search,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  User,
  ShieldCheck,
  Building,
  RefreshCw,
  Hammer,
  Bookmark,
  Layers,
  Coins,
  Receipt,
} from 'lucide-react';
import { formatVND } from '../../utils/formatters';
import roomService from '../../services/roomService';
import CleaningStatusModal from '../../components/receptionist/CleaningStatusModal';

// Chuẩn hóa dữ liệu RoomGridResponse trả về từ API Backend
const normalizeRoom = (r) => {
  const code = r.roomNumber || r.roomCode || String(r.id || '');
  const status = r.status === 'CLEANING' ? 'DIRTY' : (r.status || 'AVAILABLE');
  const floorNumber = typeof r.floor === 'number' ? r.floor : parseInt(r.floor, 10) || 1;
  const floorStr = `Tầng ${floorNumber}`;

  return {
    ...r,
    id: r.id,
    roomCode: code,
    roomNumber: code,
    floor: floorStr,
    floorNumber,
    status,
    statusLabel: r.statusLabel || (status === 'AVAILABLE' ? 'Trống' : status === 'OCCUPIED' ? 'Đang sử dụng' : status === 'DIRTY' ? 'Cần dọn' : status === 'RESERVED' ? 'Đã giữ' : 'Bảo trì'),
    category: r.categoryName || r.type || 'Tiêu chuẩn',
    name: `${r.categoryName || 'Phòng'} ${code}`,
    fullName: `${r.categoryName || 'Phòng'} ${code}`,
    groupName: `${floorStr} • ${r.categoryName || 'Khu nghỉ'}`,
    pricePerNight: r.pricePerNight || r.basePrice || 0,
    specialNotes: r.notes || r.specialNotes || 'Phòng tiện nghi cao cấp.',
    guestName: r.guestName,
    guestPhone: r.guestPhone,
    bookingId: r.bookingId,
    bookingStatus: r.bookingStatus,
    checkIn: r.checkIn,
    checkOut: r.checkOut,
    actualCheckIn: r.actualCheckIn,
    totalAmount: r.totalAmount,
    paidAmount: r.paidAmount,
  };
};

export const RoomMatrixPage = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [selectedFloor, setSelectedFloor] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCleaningModalOpen, setIsCleaningModalOpen] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Gọi API GET /api/v1/receptionist/rooms/grid kèm query params Tầng & Trạng thái
  const fetchRoomGrid = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (selectedFloor !== 'ALL') {
        params.floor = Number(selectedFloor);
      }
      if (selectedStatus !== 'ALL') {
        params.status = selectedStatus;
      }

      const res = await roomService.getRoomGrid(params);
      const data = res?.data || res;

      if (Array.isArray(data)) {
        const mapped = data.map(normalizeRoom);
        setRooms(mapped);
        if (mapped.length > 0) {
          setSelectedRoomId((prev) => (mapped.some((x) => x.id === prev) ? prev : mapped[0].id));
        }
      } else {
        setRooms([]);
      }
    } catch (err) {
      console.error('API GET /api/v1/receptionist/rooms/grid lỗi kết nối:', err);
      showToast('Không thể tải sơ đồ phòng từ API máy chủ');
    } finally {
      setIsLoading(false);
    }
  }, [selectedFloor, selectedStatus]);

  useEffect(() => {
    fetchRoomGrid();
  }, [fetchRoomGrid]);

  // Đồng bộ thời gian thực: Khi lễ tân hoàn tất Check-out trên ReceptionistBookingsPage, phòng chuyển sang DIRTY (Cần dọn) ngay lập tức
  useEffect(() => {
    const handleCheckoutCompleted = (e) => {
      const { roomId } = e.detail || {};
      if (roomId) {
        setRooms((prevRooms) =>
          prevRooms.map((r) =>
            String(r.id) === String(roomId) || String(r.roomCode) === String(roomId)
              ? {
                  ...r,
                  status: 'DIRTY',
                  statusLabel: 'Cần dọn',
                  availableTime: 'Chờ buồng phòng',
                  inspectionStatus: 'Chưa dọn',
                  specialNotes: 'Khách vừa làm thủ tục trả phòng (Check-out), phòng chuyển sang trạng thái Cần dọn.',
                }
              : r
          )
        );
      }
      fetchRoomGrid();
    };

    window.addEventListener('hotel_checkout_completed', handleCheckoutCompleted);
    return () => {
      window.removeEventListener('hotel_checkout_completed', handleCheckoutCompleted);
    };
  }, [fetchRoomGrid]);

  // Xử lý xác nhận dọn xong phòng (gọi PATCH /api/v1/receptionist/rooms/{roomId}/clean và cập nhật State về AVAILABLE ngay lập tức)
  const handleCleanRoom = async (roomTarget) => {
    const rawTarget = roomTarget || rooms.find((r) => r.id === selectedRoomId);
    const targetId = typeof rawTarget === 'object' && rawTarget !== null
      ? (rawTarget.id || rawTarget.roomId)
      : (rawTarget || selectedRoomId);

    if (!targetId) return;

    const targetRoom = rooms.find((r) => String(r.id) === String(targetId) || String(r.roomCode) === String(targetId));
    const roomCode = targetRoom?.roomNumber || targetRoom?.roomCode || targetId;

    try {
      // 1. Gọi API PATCH /api/v1/receptionist/rooms/{roomId}/clean
      await roomService.cleanRoom(targetId);
      showToast(`Phòng ${roomCode} đã được dọn sạch và chuyển sang trạng thái Trống (AVAILABLE)!`);

      // 2. Cập nhật State danh sách phòng về AVAILABLE ngay lập tức theo Tiêu chí nghiệm thu (AC)
      setRooms((prevRooms) =>
        prevRooms.map((r) =>
          String(r.id) === String(targetId) || String(r.roomCode) === String(targetId)
            ? {
                ...r,
                status: 'AVAILABLE',
                statusLabel: 'Trống',
                availableTime: 'Sẵn sàng đón khách',
                inspectionStatus: 'Đã dọn sạch',
                specialNotes: 'Phòng đã được dọn sạch và kiểm định xong, sẵn sàng đón khách mới.',
              }
            : r
        )
      );
    } catch (error) {
      console.error('API PATCH /api/v1/receptionist/rooms/' + targetId + '/clean:', error);
      showToast(error?.response?.data?.message || error?.message || 'Lỗi khi cập nhật dọn phòng');
    } finally {
      setIsCleaningModalOpen(false);
    }
  };

  // Phòng đang được chọn trên cột bên phải
  const selectedRoom = useMemo(() => {
    return rooms.find((r) => r.id === selectedRoomId) || rooms[0] || {};
  }, [rooms, selectedRoomId]);

  // Thống kê số lượng theo Enum thời gian thực
  const stats = useMemo(() => {
    const total = rooms.length;
    const occupied = rooms.filter((r) => r.status === 'OCCUPIED').length;
    const available = rooms.filter((r) => r.status === 'AVAILABLE').length;
    const dirty = rooms.filter((r) => r.status === 'DIRTY').length;
    const reserved = rooms.filter((r) => r.status === 'RESERVED').length;
    const maintenance = rooms.filter((r) => r.status === 'MAINTENANCE').length;
    const occupancyRate = total > 0 ? ((occupied / total) * 100).toFixed(1) : 0;

    return { total, occupied, available, dirty, reserved, maintenance, occupancyRate };
  }, [rooms]);

  // Bộ lọc danh sách phòng
  const filteredRooms = useMemo(() => {
    return rooms.filter((r) => {
      // Lọc theo Tầng
      if (selectedFloor !== 'ALL' && Number(r.floorNumber) !== Number(selectedFloor)) {
        return false;
      }

      // Lọc theo Trạng thái
      if (selectedStatus !== 'ALL' && r.status !== selectedStatus) {
        return false;
      }

      // Lọc theo Hạng phòng
      if (selectedCategory !== 'Tất cả' && r.category !== selectedCategory) {
        return false;
      }

      // Tìm kiếm theo số phòng, tên phòng, tên khách
      if (searchTerm.trim()) {
        const term = searchTerm.toLowerCase();
        const matchCode = (r.roomCode || '').toLowerCase().includes(term);
        const matchName = (r.name || '').toLowerCase().includes(term);
        const matchGuest = (r.guestName || '').toLowerCase().includes(term);
        if (!matchCode && !matchName && !matchGuest) return false;
      }

      return true;
    });
  }, [rooms, selectedFloor, selectedStatus, selectedCategory, searchTerm]);

  // Nhóm các phòng theo Tầng / Group
  const groups = useMemo(() => {
    const map = new Map();
    filteredRooms.forEach((r) => {
      const gName = r.groupName || r.floor || 'Khu vực chính';
      if (!map.has(gName)) {
        map.set(gName, {
          title: gName,
          count: `${filteredRooms.filter((x) => (x.groupName || x.floor) === gName).length} phòng`,
          rooms: [],
        });
      }
      map.get(gName).rooms.push(r);
    });
    return Array.from(map.values());
  }, [filteredRooms]);

  return (
    <div className="p-6 sm:p-8 space-y-6 pb-12 max-w-[1600px] mx-auto select-none">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 bg-stone-900 text-white px-5 py-3.5 rounded-2xl shadow-xl border border-stone-700 flex items-center gap-3 animate-fade-in text-xs font-medium">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Page Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-stone-900 leading-tight">
            Sơ đồ phòng (Rack Matrix)
          </h1>
          <p className="text-xs text-stone-500 font-light mt-1">
            Theo dõi trạng thái phòng thời gian thực, quản lý khách lưu trú và xác nhận buồng phòng tức thời.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/receptionist/services')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <Coins size={14} />
            <span>Dịch vụ & Minibar</span>
          </button>

          <button
            type="button"
            onClick={fetchRoomGrid}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-stone-200/90 hover:border-stone-400 text-stone-700 text-xs font-semibold shadow-2xs transition-all cursor-pointer"
          >
            <RefreshCw size={13} className={isLoading ? 'animate-spin text-stone-500' : 'text-stone-400'} />
            <span>Làm mới dữ liệu</span>
          </button>
        </div>
      </div>

      {/* 2. 5 KPI Metric Cards đồng bộ chính xác Enum Backend */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Card 1: Tổng số phòng */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase text-stone-400 block mb-1">
              TỔNG SỐ PHÒNG
            </span>
            <div className="font-serif text-3xl font-bold text-stone-900 leading-none">
              {stats.total} <span className="text-xs font-normal font-sans text-stone-400 ml-1">phòng</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-stone-50 border border-stone-200/70 text-stone-500 flex items-center justify-center shrink-0">
            <Home size={18} />
          </div>
        </div>

        {/* Card 2: OCCUPIED -> Đang sử dụng (Màu Đỏ) */}
        <div
          onClick={() => setSelectedStatus(selectedStatus === 'OCCUPIED' ? 'ALL' : 'OCCUPIED')}
          className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all cursor-pointer shadow-2xs ${
            selectedStatus === 'OCCUPIED' ? 'border-rose-500 ring-2 ring-rose-500/10' : 'border-stone-200/90 hover:border-rose-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold tracking-wider uppercase text-rose-700 flex items-center gap-1.5">
              ĐANG SỬ DỤNG
              <span className="w-2 h-2 rounded-full bg-rose-600 inline-block animate-pulse"></span>
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold text-stone-900 leading-none">
              {stats.occupied}
            </span>
            <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200/60 px-2 py-0.5 rounded-full">
              {stats.occupancyRate}%
            </span>
          </div>
        </div>

        {/* Card 3: AVAILABLE -> Trống (Màu Xanh lá) */}
        <div
          onClick={() => setSelectedStatus(selectedStatus === 'AVAILABLE' ? 'ALL' : 'AVAILABLE')}
          className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all cursor-pointer shadow-2xs ${
            selectedStatus === 'AVAILABLE' ? 'border-emerald-500 ring-2 ring-emerald-500/10' : 'border-stone-200/90 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold tracking-wider uppercase text-emerald-700 flex items-center gap-1.5">
              TRỐNG SẴN SÀNG
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold text-stone-900 leading-none">
              {stats.available}
            </span>
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-full">
              Sạch sẽ
            </span>
          </div>
        </div>

        {/* Card 4: DIRTY -> Cần dọn (Màu Vàng) */}
        <div
          onClick={() => setSelectedStatus(selectedStatus === 'DIRTY' ? 'ALL' : 'DIRTY')}
          className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all cursor-pointer shadow-2xs ${
            selectedStatus === 'DIRTY' ? 'border-amber-500 ring-2 ring-amber-500/10' : 'border-stone-200/90 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold tracking-wider uppercase text-amber-800 flex items-center gap-1.5">
              CẦN DỌN
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold text-stone-900 leading-none">
              {stats.dirty}
            </span>
            <span className="text-[11px] font-semibold text-amber-900 bg-[#FDF4E7] border border-amber-200/70 px-2 py-0.5 rounded-full">
              Chờ dọn dẹp
            </span>
          </div>
        </div>

        {/* Card 5: RESERVED & MAINTENANCE */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200/90 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold tracking-wider uppercase text-blue-700 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block"></span>
              ĐÃ GIỮ: {stats.reserved}
            </span>
            <span className="text-[10px] font-bold tracking-wider uppercase text-stone-500 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-stone-400 inline-block"></span>
              BẢO TRÌ: {stats.maintenance}
            </span>
          </div>
          <div className="pt-2 text-[11px] text-stone-500 flex items-center justify-between border-t border-stone-100">
            <span className="cursor-pointer hover:text-blue-700" onClick={() => setSelectedStatus('RESERVED')}>
              Xem {stats.reserved} phòng giữ
            </span>
            <span className="cursor-pointer hover:text-stone-700" onClick={() => setSelectedStatus('MAINTENANCE')}>
              Xem {stats.maintenance} bảo trì
            </span>
          </div>
        </div>
      </div>

      {/* 3. Filter Bar: Tầng, Trạng thái, Hạng phòng & Tìm kiếm */}
      <div className="space-y-3 bg-white p-4 rounded-2xl border border-stone-200/90 shadow-2xs">
        {/* Row 1: Filter theo Tầng & Filter theo Trạng thái (API Query Params) */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-stone-100">
          {/* Lọc theo Tầng */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-stone-500 mr-1 flex items-center gap-1">
              <Layers size={13} />
              <span>Tầng:</span>
            </span>
            {[
              { id: 'ALL', label: 'Tất cả tầng' },
              { id: '1', label: 'Tầng 1' },
              { id: '2', label: 'Tầng 2' },
              { id: '3', label: 'Tầng 3' },
            ].map((floorTab) => (
              <button
                key={floorTab.id}
                type="button"
                onClick={() => setSelectedFloor(floorTab.id)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  String(selectedFloor) === String(floorTab.id)
                    ? 'bg-black text-white shadow-xs'
                    : 'bg-stone-50 text-stone-600 hover:text-stone-900 border border-stone-200 hover:bg-stone-100'
                }`}
              >
                {floorTab.label}
              </button>
            ))}
          </div>

          {/* Lọc theo Trạng thái Enum chuẩn xác */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs font-bold text-stone-500 mr-1">Trạng thái:</span>
            {[
              { id: 'ALL', label: 'Tất cả', color: 'bg-black text-white' },
              { id: 'AVAILABLE', label: 'Trống (Xanh lá)', activeBg: 'bg-emerald-600 text-white', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
              { id: 'OCCUPIED', label: 'Đang sử dụng (Đỏ)', activeBg: 'bg-rose-600 text-white', badge: 'bg-rose-50 text-rose-700 border-rose-200' },
              { id: 'DIRTY', label: 'Cần dọn (Vàng)', activeBg: 'bg-amber-600 text-white', badge: 'bg-amber-50 text-amber-800 border-amber-200' },
              { id: 'RESERVED', label: 'Đã giữ (Xanh dương)', activeBg: 'bg-blue-600 text-white', badge: 'bg-blue-50 text-blue-700 border-blue-200' },
              { id: 'MAINTENANCE', label: 'Bảo trì (Xám)', activeBg: 'bg-stone-600 text-white', badge: 'bg-stone-100 text-stone-700 border-stone-200' },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setSelectedStatus(st.id)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  selectedStatus === st.id
                    ? st.activeBg || 'bg-black text-white'
                    : 'bg-stone-50 text-stone-600 hover:text-stone-900 border border-stone-200 hover:bg-stone-100'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Row 2: Category Tabs & Search Box */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {['Tất cả', 'Biệt thự Villa', 'Suites Hướng Biển', 'Penthouse'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setSelectedCategory(tab)}
                className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  selectedCategory === tab
                    ? 'bg-stone-900 text-white shadow-2xs'
                    : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200/90 hover:bg-stone-50'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-80">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Tìm số phòng, tên khách, hạng phòng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 rounded-full bg-stone-50/60 border border-stone-200 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-400 focus:bg-white shadow-2xs"
            />
          </div>
        </div>
      </div>

      {/* 4. Main 2-Column Layout: Room Matrix Grid (Left 8 cols) + Sticky Detail Card (Right 4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Room Grid Groups */}
        <div className="lg:col-span-8 space-y-7">
          {groups.length === 0 ? (
            <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center space-y-3 shadow-2xs">
              <Building size={36} className="mx-auto text-stone-300" />
              <p className="font-serif text-lg font-bold text-stone-800">
                Không có phòng nào thỏa mãn bộ lọc
              </p>
              <p className="text-xs text-stone-400">
                Vui lòng chọn lại tầng, trạng thái hoặc từ khóa tìm kiếm.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedFloor('ALL');
                  setSelectedStatus('ALL');
                  setSelectedCategory('Tất cả');
                  setSearchTerm('');
                }}
                className="mt-2 px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs hover:bg-stone-800"
              >
                Xóa tất cả bộ lọc
              </button>
            </div>
          ) : (
            groups.map((group) => (
              <div key={group.title} className="space-y-3">
                {/* Group Header */}
                <div className="flex items-center justify-between text-xs pb-1 border-b border-stone-200/60">
                  <h3 className="font-serif text-base font-bold text-stone-900 flex items-center gap-2">
                    <span>{group.title}</span>
                  </h3>
                  <span className="text-stone-400 text-[11px] font-medium">
                    {group.count}
                  </span>
                </div>

                {/* Room Cards Grid (3 cards per row) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {group.rooms.map((room) => {
                    const isSelected = room.id === selectedRoomId;
                    const isOccupied = room.status === 'OCCUPIED';
                    const isAvailable = room.status === 'AVAILABLE';
                    const isDirty = room.status === 'DIRTY';
                    const isReserved = room.status === 'RESERVED';
                    const isMaintenance = room.status === 'MAINTENANCE';

                    return (
                      <div
                        key={room.id}
                        onClick={() => setSelectedRoomId(room.id)}
                        className={`bg-white rounded-2xl p-4 border transition-all cursor-pointer relative flex flex-col justify-between min-h-[148px] shadow-2xs ${
                          isSelected
                            ? 'border-stone-900 ring-2 ring-stone-900/15 shadow-sm'
                            : 'border-stone-200/90 hover:border-stone-300 hover:shadow-xs'
                        }`}
                      >
                        {/* Top Row: Room Code & Status Badge theo Enum */}
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-serif text-2xl font-bold text-stone-900">
                              {room.roomCode}
                            </span>

                            {/* Badge trạng thái chuẩn màu yêu cầu */}
                            <span
                              className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                                isOccupied
                                  ? 'bg-rose-600 text-white border-rose-600 shadow-2xs' // Đang sử dụng (Đỏ)
                                  : isAvailable
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80' // Trống (Xanh lá)
                                  : isDirty
                                  ? 'bg-[#FDF4E7] text-amber-800 border-amber-300/80 animate-pulse' // Cần dọn (Vàng)
                                  : isReserved
                                  ? 'bg-blue-50 text-blue-700 border-blue-200/80' // Đã giữ (Xanh dương)
                                  : 'bg-stone-100 text-stone-700 border-stone-300' // Bảo trì (Xám)
                              }`}
                            >
                              {isOccupied && 'Đang sử dụng'}
                              {isAvailable && 'Trống'}
                              {isDirty && 'Cần dọn'}
                              {isReserved && 'Đã giữ'}
                              {isMaintenance && 'Bảo trì'}
                            </span>
                          </div>

                          {/* Room Subtitle */}
                          <p className="text-[11px] text-stone-400 font-medium truncate">
                            {room.name || room.category}
                          </p>

                          {/* Middle Content */}
                          <div className="mt-2">
                            {isOccupied ? (
                              <p className="text-xs font-bold text-stone-800 truncate flex items-center gap-1">
                                <User size={12} className="text-rose-500 shrink-0" />
                                <span>{room.guestName}</span>
                              </p>
                            ) : isAvailable ? (
                              <p className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                                <CheckCircle2 size={12} className="shrink-0" />
                                <span>{room.availableTime || 'Sẵn sàng đón khách'}</span>
                              </p>
                            ) : isDirty ? (
                              <div className="flex items-center justify-between gap-1">
                                <p className="text-xs font-bold text-amber-800 truncate flex items-center gap-1">
                                  <Sparkles size={12} className="text-amber-600 shrink-0" />
                                  <span>{room.availableTime || 'Chờ buồng phòng'}</span>
                                </p>
                              </div>
                            ) : isReserved ? (
                              <p className="text-xs font-semibold text-blue-700 truncate flex items-center gap-1">
                                <Bookmark size={12} className="text-blue-500 shrink-0" />
                                <span>{room.guestName || 'Đã đặt trước'}</span>
                              </p>
                            ) : (
                              <p className="text-xs font-semibold text-stone-600 truncate flex items-center gap-1">
                                <Hammer size={12} className="text-stone-400 shrink-0" />
                                <span>{room.availableTime || 'Đang bảo trì'}</span>
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Bottom Row / Action button if DIRTY */}
                        <div className="pt-2 border-t border-stone-100 text-[11px] text-stone-400 font-medium">
                          {isDirty ? (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCleanRoom(room);
                              }}
                              className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-2xs"
                            >
                              <CheckCircle2 size={12} />
                              <span>Xác nhận đã dọn xong</span>
                            </button>
                          ) : isOccupied ? (
                            <div className="flex items-center justify-between">
                              <span>Trả: {room.checkOutDate || '---'}</span>
                              <span className="font-semibold text-stone-700">{room.membershipShort || 'VIP'}</span>
                            </div>
                          ) : isAvailable ? (
                            <div className="flex items-center justify-between text-emerald-700">
                              <span>{room.inspectionStatus || 'Đã kiểm định'}</span>
                              <span className="font-semibold text-stone-700">{formatVND(room.pricePerNight)}</span>
                            </div>
                          ) : isReserved ? (
                            <div className="flex items-center justify-between text-blue-700">
                              <span>{room.inspectionStatus || 'Đã cọc'}</span>
                              <span className="font-semibold text-blue-800">{room.roomTypeTag || 'Đã giữ chỗ'}</span>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between text-stone-600">
                              <span>{room.inspectionStatus || 'Bảo trì'}</span>
                              <span className="font-semibold">{room.roomTypeTag || 'Kỹ thuật'}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right: Sticky Selected Room Detail Card (4 cols) */}
        <div className="lg:col-span-4 sticky top-20">
          <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-md space-y-5">
            {/* Header: Room Code & Status Badge */}
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-serif text-3xl font-bold text-stone-900">
                    {selectedRoom.roomCode || '---'}
                  </span>

                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                      selectedRoom.status === 'OCCUPIED'
                        ? 'bg-rose-600 text-white border-rose-600'
                        : selectedRoom.status === 'AVAILABLE'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : selectedRoom.status === 'DIRTY'
                        ? 'bg-[#FDF4E7] text-amber-800 border-amber-300'
                        : selectedRoom.status === 'RESERVED'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-stone-100 text-stone-700 border-stone-200'
                    }`}
                  >
                    {selectedRoom.status === 'OCCUPIED' && 'Đang sử dụng (OCCUPIED)'}
                    {selectedRoom.status === 'AVAILABLE' && 'Trống (AVAILABLE)'}
                    {selectedRoom.status === 'DIRTY' && 'Cần dọn (DIRTY)'}
                    {selectedRoom.status === 'RESERVED' && 'Đã giữ (RESERVED)'}
                    {selectedRoom.status === 'MAINTENANCE' && 'Bảo trì (MAINTENANCE)'}
                  </span>
                </div>

                <span className="text-[11px] font-semibold text-amber-900 bg-[#FAF5EE] border border-amber-200/80 px-2.5 py-0.5 rounded-md">
                  {selectedRoom.floor || 'Tầng ---'}
                </span>
              </div>
              <p className="text-xs text-stone-500 mt-1 font-medium">
                {selectedRoom.fullName || selectedRoom.name}
              </p>
            </div>

            {/* Block 1: Khách lưu trú hoặc Tình trạng phòng */}
            {selectedRoom.status === 'OCCUPIED' ? (
              <div>
                <span className="text-[10px] font-bold tracking-wider uppercase text-stone-400 block mb-1">
                  KHÁCH LƯU TRÚ
                </span>
                <p className="text-base font-bold text-stone-900">
                  {selectedRoom.guestName}
                </p>
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 mt-0.5">
                  <span>◆</span>
                  <span>{selectedRoom.membership || 'VIP Member'}</span>
                </div>
              </div>
            ) : selectedRoom.status === 'DIRTY' ? (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 space-y-1">
                <span className="text-[10px] font-bold tracking-wider uppercase text-amber-900 flex items-center gap-1">
                  <AlertTriangle size={12} className="text-amber-600" />
                  PHÒNG CẦN DỌN DẸP VỆ SINH
                </span>
                <p className="text-xs text-amber-950 font-medium">
                  {selectedRoom.specialNotes || 'Phòng sau trả phòng cần được vệ sinh, thay ga gối và khử khuẩn trước khi đón khách.'}
                </p>
              </div>
            ) : selectedRoom.status === 'AVAILABLE' ? (
              <div>
                <span className="text-[10px] font-bold tracking-wider uppercase text-stone-400 block mb-1">
                  TÌNH TRẠNG PHÒNG
                </span>
                <p className="text-sm font-bold text-emerald-700 flex items-center gap-1.5">
                  <ShieldCheck size={16} />
                  <span>Phòng sạch đã kiểm định • Sẵn sàng đón khách</span>
                </p>
                <p className="text-xs text-stone-400 mt-0.5">
                  Đơn giá niêm yết: {formatVND(selectedRoom.pricePerNight || 8500000)} / đêm
                </p>
              </div>
            ) : selectedRoom.status === 'RESERVED' ? (
              <div>
                <span className="text-[10px] font-bold tracking-wider uppercase text-blue-700 block mb-1">
                  THÔNG TIN ĐẶT PHÒNG
                </span>
                <p className="text-sm font-bold text-blue-900">
                  {selectedRoom.guestName}
                </p>
                <p className="text-xs text-stone-500 mt-0.5">
                  {selectedRoom.dateRange || 'Chờ khách check-in theo lịch đặt'}
                </p>
              </div>
            ) : (
              <div>
                <span className="text-[10px] font-bold tracking-wider uppercase text-stone-400 block mb-1">
                  BẢO TRÌ THIẾT BỊ
                </span>
                <p className="text-sm font-bold text-stone-700">
                  Đang tiến hành bảo dưỡng kỹ thuật
                </p>
              </div>
            )}

            {/* Block 2: Thời gian lưu trú */}
            <div className="bg-[#F8F9FA] rounded-2xl p-3.5 border border-stone-200/70">
              <span className="text-[10px] font-bold tracking-wider uppercase text-stone-400 block mb-1">
                THỜI GIAN LƯU TRÚ / VẬN HÀNH
              </span>
              <p className="text-xs font-semibold text-stone-800">
                {selectedRoom.checkIn && selectedRoom.checkOut
                  ? `${selectedRoom.checkIn} → ${selectedRoom.checkOut}`
                  : (selectedRoom.dateRange || 'Chưa có thông tin lưu trú')}
              </p>
              {selectedRoom.guestPhone && (
                <p className="text-[11px] text-stone-500 mt-1">
                  SĐT: <span className="font-mono text-stone-700">{selectedRoom.guestPhone}</span>
                </p>
              )}
            </div>

            {/* Block 3: Tạm tính Folio */}
            <div className="pt-1 flex items-baseline justify-between">
              <span className="text-xs font-medium text-stone-500">Tạm tính Folio</span>
              <div className="font-serif text-2xl font-bold text-stone-900">
                {selectedRoom.totalAmount ? formatVND(selectedRoom.totalAmount) : (selectedRoom.folioAmount ? formatVND(selectedRoom.folioAmount) : '0 đ')}
              </div>
            </div>

            {/* Block 4: Ghi chú phục vụ */}
            <div>
              <span className="text-[10px] font-bold tracking-wider uppercase text-stone-400 block mb-1.5">
                GHI CHÚ PHỤC VỤ & VỆ SINH
              </span>
              <div className="bg-[#FAF5EE] rounded-2xl p-3.5 border border-amber-200/70">
                <p className="font-serif italic text-xs text-amber-950 leading-relaxed">
                  "{selectedRoom.specialNotes || 'Phòng tiêu chuẩn 5 sao L\'Étoile Retreat.'}"
                </p>
              </div>
            </div>

            {/* Block 5: Action Buttons */}
            <div className="space-y-2 pt-2">
              {/* Nút hành động nổi bật khi phòng DIRTY (Theo yêu cầu Plase 1) */}
              {selectedRoom.status === 'DIRTY' && (
                <button
                  type="button"
                  onClick={() => handleCleanRoom(selectedRoom)}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold tracking-wide transition-colors cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 size={16} />
                  <span>Xác nhận đã dọn xong</span>
                </button>
              )}

              {selectedRoom.status === 'OCCUPIED' && (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => navigate('/receptionist/services')}
                    className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold tracking-wide transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <Coins size={15} />
                    <span>Nạp Dịch vụ & Minibar</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/receptionist/bookings')}
                    className="w-full py-2.5 rounded-xl bg-[#0E1524] hover:bg-stone-800 text-white text-xs font-semibold tracking-wide transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-1.5"
                  >
                    <Receipt size={15} />
                    <span>Xem Folio / Trả phòng</span>
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={() => setIsCleaningModalOpen(true)}
                className="w-full py-2.5 rounded-xl bg-[#F0F4F8] hover:bg-[#E2EAF2] text-stone-700 text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Sparkles size={14} className="text-amber-600" />
                <span>Mở Popup Cập nhật Buồng phòng</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Bottom Footer */}
      <footer className="pt-6 border-t border-stone-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-stone-400">
        <div>
          © 2025 L'Étoile Luxury Boutique Retreat & Spa
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1.5 text-stone-600 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            PMS Lưới phòng đồng bộ thời gian thực
          </span>
          <span className="font-mono text-stone-500">API: /api/v1/receptionist/rooms/grid</span>
        </div>
      </footer>

      {/* Cleaning Status Modal */}
      <CleaningStatusModal
        isOpen={isCleaningModalOpen}
        onClose={() => setIsCleaningModalOpen(false)}
        room={selectedRoom}
        onConfirmClean={handleCleanRoom}
        onConfirm={({ status }) => {
          setRooms((prev) =>
            prev.map((r) =>
              r.id === selectedRoom.id || r.roomCode === selectedRoom.roomCode
                ? {
                    ...r,
                    status,
                    statusLabel:
                      status === 'AVAILABLE'
                        ? 'Trống'
                        : status === 'DIRTY'
                        ? 'Cần dọn'
                        : status === 'MAINTENANCE'
                        ? 'Bảo trì'
                        : r.statusLabel,
                  }
                : r
            )
          );
          showToast(`Đã cập nhật trạng thái phòng ${selectedRoom.roomCode} sang ${status}!`);
          setIsCleaningModalOpen(false);
        }}
      />
    </div>
  );
};

export default RoomMatrixPage;
