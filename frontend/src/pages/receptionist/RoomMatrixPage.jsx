import React, { useState, useMemo } from 'react';
import {
  Home,
  Search,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertTriangle,
  User,
  CreditCard,
  ChevronRight,
  ShieldCheck,
  Building,
} from 'lucide-react';
import { formatVND } from '../../utils/formatters';

const INITIAL_ROOMS = [
  // Tầng 12 • Celestial Penthouse
  {
    id: 'P1201',
    roomCode: 'P1201',
    groupName: 'Tầng 12 • Celestial Penthouse',
    groupCount: '4 phòng',
    category: 'Penthouse',
    name: 'Grand Celestial',
    fullName: 'Grand Celestial Penthouse',
    floor: 'Tầng 12',
    status: 'OCCUPIED',
    statusLabel: 'Có khách',
    guestName: 'Đỗ Minh Quân',
    membership: 'Black Diamond VIP',
    membershipShort: 'VIP Member',
    checkOutDate: '18/10',
    dateRange: '14/10 — 18/10 (4 đêm)',
    folioAmount: 42850000,
    specialNotes: 'Dị ứng phấn hoa. Chuẩn bị sẵn tinh dầu tuyết tùng trầm ấm và 02 gối lông ngỗng mềm.',
  },
  {
    id: 'P1202',
    roomCode: 'P1202',
    groupName: 'Tầng 12 • Celestial Penthouse',
    category: 'Penthouse',
    name: 'Royal Sky',
    fullName: 'Royal Sky Penthouse',
    floor: 'Tầng 12',
    status: 'OCCUPIED',
    statusLabel: 'Có khách',
    guestName: 'Elena Rostova',
    membership: 'Platinum Member',
    membershipShort: 'Platinum',
    checkOutDate: '20/10',
    dateRange: '16/10 — 20/10 (4 đêm)',
    folioAmount: 38200000,
    specialNotes: 'Khách yêu cầu xe Maybach đón tiễn sân bay và setup hoa ly trắng tại phòng.',
  },
  {
    id: 'P1204',
    roomCode: 'P1204',
    groupName: 'Tầng 12 • Celestial Penthouse',
    category: 'Penthouse',
    name: 'Lunar Summit',
    fullName: 'Lunar Summit Penthouse',
    floor: 'Tầng 12',
    status: 'AVAILABLE',
    statusLabel: 'Sẵn sàng',
    availableTime: 'Đón khách: 14:30',
    inspectionStatus: 'Đã kiểm định HK',
    roomTypeTag: 'Penthouse',
    pricePerNight: 18500000,
  },

  // Tầng 8 • Ocean Horizon Suites
  {
    id: 'S801',
    roomCode: 'S801',
    groupName: 'Tầng 8 • Ocean Horizon Suites',
    groupCount: '4 phòng hiển thị',
    category: 'Suites Hướng Biển',
    name: 'Ocean Horizon',
    fullName: 'Ocean Horizon Suite S801',
    floor: 'Tầng 8',
    status: 'AVAILABLE',
    statusLabel: 'Sẵn sàng',
    availableTime: 'Trống khả dụng',
    inspectionStatus: 'Đã dọn sạch',
    roomTypeTag: '8.5 tr/đêm',
    pricePerNight: 8500000,
  },
  {
    id: 'S802',
    roomCode: 'S802',
    groupName: 'Tầng 8 • Ocean Horizon Suites',
    category: 'Suites Hướng Biển',
    name: 'Ocean Horizon',
    fullName: 'Ocean Horizon Suite S802',
    floor: 'Tầng 8',
    status: 'OCCUPIED',
    statusLabel: 'Có khách',
    guestName: 'Liam Vanderberg',
    membership: 'Executive Member',
    membershipShort: 'Executive',
    checkOutDate: '19/10',
    dateRange: '15/10 — 19/10 (4 đêm)',
    folioAmount: 18900000,
    specialNotes: 'Phục vụ điểm tâm tại ban công riêng lúc 08:30 sáng.',
  },
  {
    id: 'S803',
    roomCode: 'S803',
    groupName: 'Tầng 8 • Ocean Horizon Suites',
    category: 'Suites Hướng Biển',
    name: 'Ocean Horizon',
    fullName: 'Ocean Horizon Suite S803',
    floor: 'Tầng 8',
    status: 'CLEANING',
    statusLabel: 'Chờ dọn',
    availableTime: 'Check-out 09:15',
    inspectionStatus: 'Cần trước 14:00',
    roomTypeTag: 'Ưu tiên',
  },

  // Tầng Trệt • Biệt thự Garden Sanctuary
  {
    id: 'V101',
    roomCode: 'V101',
    groupName: 'Tầng Trệt • Biệt thự Garden Sanctuary',
    groupCount: '3 biệt thự',
    category: 'Biệt thự Villa',
    name: 'Garden Sanctuary Villa',
    fullName: 'Garden Sanctuary Villa V101',
    floor: 'Tầng Trệt',
    status: 'OCCUPIED',
    statusLabel: 'Có khách',
    guestName: 'Trần Bảo Ngọc',
    membership: 'VIP Diamond',
    membershipShort: 'Private Pool',
    checkOutDate: '18/10',
    dateRange: '13/10 — 18/10 (5 đêm)',
    folioAmount: 52400000,
    specialNotes: 'Yêu cầu phục vụ tiệc BBQ hải sản tại hồ bơi tối nay lúc 19:00.',
  },
  {
    id: 'V102',
    roomCode: 'V102',
    groupName: 'Tầng Trệt • Biệt thự Garden Sanctuary',
    category: 'Biệt thự Villa',
    name: 'Garden Sanctuary Villa',
    fullName: 'Garden Sanctuary Villa V102',
    floor: 'Tầng Trệt',
    status: 'OCCUPIED',
    statusLabel: 'Có khách',
    guestName: 'Bùi Hoàng Long',
    membership: 'VIP Member',
    membershipShort: 'Private Pool',
    checkOutDate: '22/10',
    dateRange: '16/10 — 22/10 (6 đêm)',
    folioAmount: 64800000,
    specialNotes: 'Khách đi cùng 02 trẻ nhỏ, chuẩn bị phao bơi và ghế ăn trẻ em.',
  },
  {
    id: 'V103',
    roomCode: 'V103',
    groupName: 'Tầng Trệt • Biệt thự Garden Sanctuary',
    category: 'Biệt thự Villa',
    name: 'Garden Sanctuary Villa',
    fullName: 'Garden Sanctuary Villa V103',
    floor: 'Tầng Trệt',
    status: 'AVAILABLE',
    statusLabel: 'Sẵn sàng',
    availableTime: 'Trống khả dụng',
    inspectionStatus: 'Hồ bơi sạch',
    roomTypeTag: '14.8 tr/đêm',
    pricePerNight: 14800000,
  },
];

export const RoomMatrixPage = () => {
  const [rooms, setRooms] = useState(INITIAL_ROOMS);
  const [selectedCategory, setSelectedCategory] = useState('Tất cả');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoomId, setSelectedRoomId] = useState('P1201');
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Selected room data
  const selectedRoom = useMemo(() => {
    return rooms.find((r) => r.id === selectedRoomId) || rooms[0];
  }, [rooms, selectedRoomId]);

  // Filtered rooms
  const filteredRooms = useMemo(() => {
    return rooms.filter((r) => {
      const matchCat =
        selectedCategory === 'Tất cả' ||
        (selectedCategory === 'Biệt thự Villa' && r.category === 'Biệt thự Villa') ||
        (selectedCategory === 'Suites Hướng Biển' && r.category === 'Suites Hướng Biển') ||
        (selectedCategory === 'Penthouse' && r.category === 'Penthouse');

      const matchSearch =
        r.roomCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (r.guestName && r.guestName.toLowerCase().includes(searchTerm.toLowerCase()));

      return matchCat && matchSearch;
    });
  }, [rooms, selectedCategory, searchTerm]);

  // Distinct groups
  const groups = useMemo(() => {
    const map = new Map();
    filteredRooms.forEach((r) => {
      if (!map.has(r.groupName)) {
        map.set(r.groupName, {
          title: r.groupName,
          count: r.groupCount || `${filteredRooms.filter((x) => x.groupName === r.groupName).length} phòng`,
          rooms: [],
        });
      }
      map.get(r.groupName).rooms.push(r);
    });
    return Array.from(map.values());
  }, [filteredRooms]);

  return (
    <div className="p-6 sm:p-8 space-y-6 pb-12 max-w-[1550px] mx-auto">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 bg-stone-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-stone-700 flex items-center gap-3 animate-fade-in text-xs font-medium">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Page Title */}
      <div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-stone-900 leading-tight">
          Sơ đồ phòng (Rack)
        </h1>
      </div>

      {/* 2. 4 KPI Cards matching image */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Tổng số phòng */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold tracking-wider uppercase text-stone-400 block mb-1">
              TỔNG SỐ PHÒNG
            </span>
            <div className="font-serif text-3xl font-bold text-stone-900 leading-none">
              48 <span className="text-xs font-normal font-sans text-stone-400 ml-1">khu nghỉ</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-stone-50 border border-stone-200/70 text-stone-500 flex items-center justify-center shrink-0">
            <Home size={18} />
          </div>
        </div>

        {/* Card 2: Đang có khách */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold tracking-wider uppercase text-stone-400 flex items-center gap-1.5">
              ĐANG CÓ KHÁCH
              <span className="w-2 h-2 rounded-full bg-rose-600 inline-block"></span>
            </span>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="font-serif text-3xl font-bold text-stone-900 leading-none">
              36
            </span>
            <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200/60 px-2 py-0.5 rounded-full">
              75.0% công suất
            </span>
          </div>
        </div>

        {/* Card 3: Sẵn sàng đón khách */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold tracking-wider uppercase text-stone-400 flex items-center gap-1.5">
              SẴN SÀNG ĐÓN KHÁCH
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            </span>
          </div>
          <div className="flex items-baseline gap-3">
            <span className="font-serif text-3xl font-bold text-stone-900 leading-none">
              06
            </span>
            <span className="text-[11px] font-semibold text-emerald-600">
              Trống & sạch sẽ
            </span>
          </div>
        </div>

        {/* Card 4: Cần dọn dẹp */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-bold tracking-wider uppercase text-stone-400 flex items-center gap-1.5">
              CẦN DỌN DẸP
              <span className="w-2 h-2 rounded-full bg-amber-500 inline-block"></span>
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif text-3xl font-bold text-stone-900 leading-none">
              06
            </span>
            <span className="text-[11px] font-semibold text-amber-900 bg-[#FDF4E7] border border-amber-200/70 px-2 py-0.5 rounded-full">
              4 chờ dọn • 2 đang dọn
            </span>
          </div>
        </div>
      </div>

      {/* 3. Category Filter Pills & Search Box */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="flex flex-wrap items-center gap-2">
          {['Tất cả', 'Biệt thự Villa', 'Suites Hướng Biển', 'Penthouse'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setSelectedCategory(tab)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${selectedCategory === tab
                  ? 'bg-black text-white shadow-xs'
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
            placeholder="Tìm số phòng, tên khách..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-full bg-white border border-stone-200/90 text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-900 shadow-2xs"
          />
        </div>
      </div>

      {/* 4. Main 2-Column Layout: Room Matrix Grid (Left) + Detail Card (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Room Grid Groups (8 cols) */}
        <div className="lg:col-span-8 space-y-7">
          {groups.map((group) => (
            <div key={group.title} className="space-y-3">
              {/* Group Header */}
              <div className="flex items-center justify-between text-xs pb-1 border-b border-stone-200/60">
                <h3 className="font-serif text-base font-bold text-stone-900">
                  {group.title}
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
                  const isCleaning = room.status === 'CLEANING';

                  return (
                    <div
                      key={room.id}
                      onClick={() => setSelectedRoomId(room.id)}
                      className={`bg-white rounded-2xl p-4 border transition-all cursor-pointer relative flex flex-col justify-between min-h-[140px] shadow-2xs ${isSelected
                          ? 'border-stone-900 ring-2 ring-stone-900/15 shadow-sm'
                          : 'border-stone-200/90 hover:border-stone-300 hover:shadow-xs'
                        }`}
                    >
                      {/* Top Row: Room Code & Status Badge */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-serif text-2xl font-bold text-stone-900">
                            {room.roomCode}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${isOccupied
                                ? 'bg-rose-600 text-white shadow-2xs'
                                : isAvailable
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/70'
                                  : 'bg-[#FDF4E7] text-amber-800 border border-amber-200/70'
                              }`}
                          >
                            {room.statusLabel}
                          </span>
                        </div>

                        {/* Room Subtitle */}
                        <p className="text-[11px] text-stone-400 font-medium truncate">
                          {room.name}
                        </p>

                        {/* Middle Content */}
                        <div className="mt-2">
                          {isOccupied ? (
                            <p className="text-xs font-bold text-stone-800 truncate">
                              {room.guestName}
                            </p>
                          ) : isAvailable ? (
                            <p className="text-xs font-semibold text-emerald-600">
                              {room.availableTime}
                            </p>
                          ) : (
                            <p className="text-xs font-medium text-amber-700">
                              {room.availableTime}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Bottom Footer Info */}
                      <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400 font-medium">
                        {isOccupied ? (
                          <>
                            <span>Trả phòng: {room.checkOutDate}</span>
                            <span className="font-semibold text-stone-700">{room.membershipShort}</span>
                          </>
                        ) : isAvailable ? (
                          <>
                            <span className="text-emerald-700">{room.inspectionStatus}</span>
                            <span className="font-semibold text-stone-700">{room.roomTypeTag}</span>
                          </>
                        ) : (
                          <>
                            <span className="text-amber-800">{room.inspectionStatus}</span>
                            <span className="font-semibold text-amber-800">{room.roomTypeTag}</span>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Right: Sticky Selected Room Detail Card (4 cols) */}
        <div className="lg:col-span-4 sticky top-20">
          <div className="bg-white rounded-3xl p-6 border border-stone-200/90 shadow-md space-y-5">
            {/* Header: Room Code & Badges */}
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-serif text-3xl font-bold text-stone-900">
                    {selectedRoom.roomCode}
                  </span>
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${selectedRoom.status === 'OCCUPIED'
                        ? 'bg-rose-600 text-white'
                        : selectedRoom.status === 'AVAILABLE'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}
                  >
                    {selectedRoom.statusLabel}
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-amber-900 bg-[#FAF5EE] border border-amber-200/80 px-2.5 py-0.5 rounded-md">
                  {selectedRoom.floor}
                </span>
              </div>
              <p className="text-xs text-stone-400 mt-1 font-medium">
                {selectedRoom.fullName || selectedRoom.name}
              </p>
            </div>

            {/* Block 1: Khách lưu trú (nếu có khách) */}
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
            ) : (
              <div>
                <span className="text-[10px] font-bold tracking-wider uppercase text-stone-400 block mb-1">
                  TÌNH TRẠNG PHÒNG
                </span>
                <p className="text-sm font-bold text-emerald-700">
                  Phòng sạch đã kiểm định • Sẵn sàng đón khách
                </p>
                <p className="text-xs text-stone-400 mt-0.5">
                  Đơn giá niêm yết: {formatVND(selectedRoom.pricePerNight || 12500000)} / đêm
                </p>
              </div>
            )}

            {/* Block 2: Thời gian lưu trú */}
            <div className="bg-[#F8F9FA] rounded-2xl p-3.5 border border-stone-200/70">
              <span className="text-[10px] font-bold tracking-wider uppercase text-stone-400 block mb-1">
                THỜI GIAN LƯU TRÚ
              </span>
              <p className="text-xs font-semibold text-stone-800">
                {selectedRoom.dateRange || 'Chưa gán khách lưu trú'}
              </p>
            </div>

            {/* Block 3: Tạm tính Folio */}
            <div className="pt-1 flex items-baseline justify-between">
              <span className="text-xs font-medium text-stone-500">Tạm tính Folio</span>
              <div className="font-serif text-2xl font-bold text-stone-900">
                {selectedRoom.folioAmount ? formatVND(selectedRoom.folioAmount) : '0 đ'}
              </div>
            </div>

            {/* Block 4: Ghi chú phục vụ */}
            <div>
              <span className="text-[10px] font-bold tracking-wider uppercase text-stone-400 block mb-1.5">
                GHI CHÚ PHỤC VỤ
              </span>
              <div className="bg-[#FAF5EE] rounded-2xl p-3.5 border border-amber-200/70">
                <p className="font-serif italic text-xs text-amber-950 leading-relaxed">
                  "{selectedRoom.specialNotes || 'Phòng VIP, duy trì nhiệt độ điều hòa 24°C và chuẩn bị trái cây tươi đón khách.'}"
                </p>
              </div>
            </div>

            {/* Block 5: Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => showToast(`Mở Folio chi tiết & thanh toán trả phòng cho ${selectedRoom.roomCode}`)}
                className="w-full py-3 rounded-xl bg-[#0E1524] hover:bg-stone-800 text-white text-xs font-semibold tracking-wide transition-colors cursor-pointer shadow-xs"
              >
                Xem Folio / Trả phòng
              </button>

              <button
                type="button"
                onClick={() => showToast(`Đã gửi thông báo lệnh dọn phòng ${selectedRoom.roomCode} tới bộ phận Buồng phòng!`)}
                className="w-full py-2.5 rounded-xl bg-[#F0F4F8] hover:bg-[#E2EAF2] text-stone-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                Báo dọn buồng phòng
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Bottom Footer matching image */}
      <footer className="pt-6 border-t border-stone-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-stone-400">
        <div>
          © 2025 L'Étoile Luxury Boutique Retreat & Spa
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1.5 text-stone-600 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            PMS Đồng bộ thời gian thực
          </span>
          <span className="font-mono text-stone-500">Terminal: FO-01</span>
        </div>
      </footer>
    </div>
  );
};

export default RoomMatrixPage;
