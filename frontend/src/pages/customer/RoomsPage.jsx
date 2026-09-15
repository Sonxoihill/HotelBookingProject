import React, { useState, useMemo } from 'react';
import RoomFilterBar from '../../components/customer/RoomFilterBar';
import RoomCard from '../../components/customer/RoomCard';
import RoomSidebarFilter from '../../components/customer/RoomSidebarFilter';
import { SlidersHorizontal, ArrowUpDown, Filter, X, RotateCcw } from 'lucide-react';
import { formatVND } from '../../utils/formatters';
import Button from '../../components/common/Button';

const INITIAL_ROOMS = [
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
    amenities: ['View biển Sơn Trà', 'Bữa sáng miễn phí', 'Bồn tắm nằm', 'Wi-Fi 5G'],
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
    amenities: ['Phòng khách riêng', 'Hồ bơi vô cực', 'Đưa đón sân bay', 'Bữa sáng miễn phí', 'Bồn tắm nằm'],
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
    amenities: ['Giường King 2m x 2m', 'Ban công vườn', 'Smart TV', 'Wi-Fi 5G', 'Bữa sáng miễn phí'],
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
    amenities: ['2 Giường đơn cao cấp', 'Wi-Fi 5G', 'Bàn làm việc', 'Bữa sáng miễn phí'],
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
    amenities: ['2 Phòng ngủ riêng', 'Bếp mini', 'View biển & núi', 'Bồn tắm nằm', 'Hồ bơi vô cực'],
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
    amenities: ['View thành phố về đêm', 'Minibar', 'Trà & cafe miễn phí', 'Smart TV', 'Wi-Fi 5G'],
    isAvailable: false,
  },
];

export const RoomsPage = () => {
  // Top search bar filters
  const [topFilters, setTopFilters] = useState({
    checkIn: '',
    checkOut: '',
    guests: '2',
    roomType: 'ALL',
  });

  // Sidebar filter states
  const [maxPrice, setMaxPrice] = useState(5000000);
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [sortBy, setSortBy] = useState('DEFAULT');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Compute room count per type from initial list
  const roomCountsByType = useMemo(() => {
    const counts = {};
    INITIAL_ROOMS.forEach((r) => {
      counts[r.roomType] = (counts[r.roomType] || 0) + 1;
    });
    return counts;
  }, []);

  // Compute unique list of amenities
  const availableAmenities = useMemo(() => {
    const set = new Set();
    INITIAL_ROOMS.forEach((r) => {
      (r.amenities || []).forEach((a) => set.add(a));
    });
    return Array.from(set);
  }, []);

  // Handlers for sidebar
  const handleToggleType = (typeId) => {
    setSelectedTypes((prev) =>
      prev.includes(typeId) ? prev.filter((t) => t !== typeId) : [...prev, typeId]
    );
  };

  const handleToggleAmenity = (amenity) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const handleResetFilters = () => {
    setMaxPrice(5000000);
    setSelectedTypes([]);
    setSelectedAmenities([]);
    setTopFilters((prev) => ({ ...prev, roomType: 'ALL' }));
  };

  const handleTopFilterSearch = (filters) => {
    setTopFilters(filters);
    // If top filter specifies a roomType other than ALL, sync it or let topFilter apply
  };

  // Filter & Sort logic
  const filteredRooms = useMemo(() => {
    let result = INITIAL_ROOMS.filter((room) => {
      // 1. Check top filter roomType
      if (topFilters.roomType && topFilters.roomType !== 'ALL') {
        if (room.roomType.toUpperCase() !== topFilters.roomType.toUpperCase()) {
          return false;
        }
      }

      // 2. Check top filter guest count
      if (topFilters.guests) {
        const guestsReq = parseInt(topFilters.guests, 10);
        if (!isNaN(guestsReq) && room.maxGuests < guestsReq) {
          return false;
        }
      }

      // 3. Check sidebar max price
      if (room.pricePerNight > maxPrice) {
        return false;
      }

      // 4. Check sidebar selected types
      if (selectedTypes.length > 0) {
        if (!selectedTypes.includes(room.roomType)) {
          return false;
        }
      }

      // 5. Check sidebar selected amenities
      if (selectedAmenities.length > 0) {
        const hasAllAmenities = selectedAmenities.every((amenity) =>
          (room.amenities || []).includes(amenity)
        );
        if (!hasAllAmenities) {
          return false;
        }
      }

      return true;
    });

    // Sort
    if (sortBy === 'PRICE_ASC') {
      result.sort((a, b) => a.pricePerNight - b.pricePerNight);
    } else if (sortBy === 'PRICE_DESC') {
      result.sort((a, b) => b.pricePerNight - a.pricePerNight);
    } else if (sortBy === 'RATING_DESC') {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [topFilters, maxPrice, selectedTypes, selectedAmenities, sortBy]);

  const activeFilterCount =
    (maxPrice < 5000000 ? 1 : 0) +
    selectedTypes.length +
    selectedAmenities.length +
    (topFilters.roomType !== 'ALL' ? 1 : 0);

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
          Lọc theo ngày nhận phòng, khoảng giá, hạng phòng và tiện nghi yêu thích của bạn.
        </p>
      </div>

      {/* Top Filter Bar */}
      <RoomFilterBar onSearch={handleTopFilterSearch} />

      {/* Main Content Area: Left Sidebar Filter + Right Room Grid */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* LEFT COLUMN: Sidebar Filter (Desktop sticky) */}
        <div className="hidden lg:block w-72 shrink-0 sticky top-24">
          <RoomSidebarFilter
            maxPrice={maxPrice}
            onMaxPriceChange={setMaxPrice}
            selectedTypes={selectedTypes}
            onToggleType={handleToggleType}
            selectedAmenities={selectedAmenities}
            onToggleAmenity={handleToggleAmenity}
            onResetFilters={handleResetFilters}
            roomCountsByType={roomCountsByType}
            availableAmenities={availableAmenities}
          />
        </div>

        {/* MOBILE FILTER MODAL / DRAWER */}
        {isMobileFilterOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden bg-black/50 backdrop-blur-xs">
            <div className="w-full max-w-xs bg-white h-full overflow-y-auto p-4 shadow-2xl ml-auto flex flex-col">
              <RoomSidebarFilter
                maxPrice={maxPrice}
                onMaxPriceChange={setMaxPrice}
                selectedTypes={selectedTypes}
                onToggleType={handleToggleType}
                selectedAmenities={selectedAmenities}
                onToggleAmenity={handleToggleAmenity}
                onResetFilters={handleResetFilters}
                roomCountsByType={roomCountsByType}
                availableAmenities={availableAmenities}
                onCloseMobile={() => setIsMobileFilterOpen(false)}
              />
              <div className="pt-4 mt-auto">
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => setIsMobileFilterOpen(false)}
                >
                  Xem {filteredRooms.length} phòng phù hợp
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* RIGHT COLUMN: Room List & Active Filter Bar */}
        <div className="flex-1 w-full space-y-5">
          {/* Controls Bar: Mobile filter button, counter, sorting */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* Mobile Filter Toggle Button */}
              <button
                type="button"
                onClick={() => setIsMobileFilterOpen(true)}
                className="lg:hidden flex items-center gap-1.5 px-3 py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl text-xs font-bold cursor-pointer hover:bg-amber-100 transition-colors"
              >
                <Filter size={14} />
                <span>Bộ lọc</span>
                {activeFilterCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-amber-600 text-white text-[10px] flex items-center justify-center font-mono">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <span className="text-xs text-slate-500 font-medium">
                Tìm thấy{' '}
                <strong className="text-slate-900 font-bold text-sm">
                  {filteredRooms.length}
                </strong>{' '}
                phòng khả dụng
              </span>
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-400 flex items-center gap-1 hidden sm:inline-flex">
                <ArrowUpDown size={13} /> Sắp xếp:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 cursor-pointer"
              >
                <option value="DEFAULT">Đề xuất phổ biến</option>
                <option value="PRICE_ASC">Giá: Thấp đến Cao</option>
                <option value="PRICE_DESC">Giá: Cao đến Thấp</option>
                <option value="RATING_DESC">Đánh giá cao nhất</option>
              </select>
            </div>
          </div>

          {/* Active Filter Chips */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-xs text-slate-400">Đang lọc:</span>

              {/* Price Chip */}
              {maxPrice < 5000000 && (
                <span className="inline-flex items-center gap-1 text-xs bg-amber-50 text-amber-800 border border-amber-200/80 px-2.5 py-1 rounded-full font-medium">
                  Giá ≤ {formatVND(maxPrice)}
                  <button
                    onClick={() => setMaxPrice(5000000)}
                    className="hover:text-amber-950 p-0.5"
                  >
                    <X size={12} />
                  </button>
                </span>
              )}

              {/* Room Types Chips */}
              {selectedTypes.map((type) => (
                <span
                  key={type}
                  className="inline-flex items-center gap-1 text-xs bg-amber-50 text-amber-800 border border-amber-200/80 px-2.5 py-1 rounded-full font-medium"
                >
                  Hạng: {type}
                  <button
                    onClick={() => handleToggleType(type)}
                    className="hover:text-amber-950 p-0.5"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}

              {/* Amenity Chips */}
              {selectedAmenities.map((amenity) => (
                <span
                  key={amenity}
                  className="inline-flex items-center gap-1 text-xs bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-full font-medium"
                >
                  {amenity}
                  <button
                    onClick={() => handleToggleAmenity(amenity)}
                    className="hover:text-slate-900 p-0.5"
                  >
                    <X size={12} />
                  </button>
                </span>
              ))}

              {/* Reset all button */}
              <button
                onClick={handleResetFilters}
                className="text-xs text-slate-500 hover:text-amber-600 underline ml-1 cursor-pointer font-medium"
              >
                Xóa tất cả
              </button>
            </div>
          )}

          {/* Room Cards Grid or Empty State */}
          {filteredRooms.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredRooms.map((room) => (
                <RoomCard key={room.id} room={room} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-4 shadow-xs my-6">
              <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
                <SlidersHorizontal size={28} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Không tìm thấy phòng phù hợp
              </h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                Rất tiếc, hiện tại không có phòng nào thỏa mãn toàn bộ tiêu chí lọc của bạn. Hãy thử nới lỏng khoảng giá hoặc bỏ bớt các tiện nghi yêu cầu.
              </p>
              <div className="pt-2">
                <Button
                  onClick={handleResetFilters}
                  variant="outline"
                  className="gap-2"
                >
                  <RotateCcw size={14} />
                  <span>Đặt lại bộ lọc tìm kiếm</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoomsPage;
