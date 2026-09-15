import React from 'react';
import { SlidersHorizontal, RotateCcw, X, Check } from 'lucide-react';
import { formatVND } from '../../utils/formatters';

export const RoomSidebarFilter = ({
  maxPrice,
  onMaxPriceChange,
  selectedTypes,
  onToggleType,
  selectedAmenities,
  onToggleAmenity,
  onResetFilters,
  roomCountsByType = {},
  availableAmenities = [],
  onCloseMobile,
  className = '',
}) => {
  const roomTypesList = [
    { id: 'Standard', label: 'Standard' },
    { id: 'Superior', label: 'Superior' },
    { id: 'Deluxe', label: 'Deluxe' },
    { id: 'Suite', label: 'President Suite' },
  ];

  const quickPrices = [
    { label: 'Tất cả', value: 5000000 },
    { label: '< 1 triệu', value: 1000000 },
    { label: '< 2 triệu', value: 2000000 },
    { label: '< 3.5 triệu', value: 3500000 },
  ];

  const hasActiveFilters =
    maxPrice < 5000000 ||
    selectedTypes.length > 0 ||
    selectedAmenities.length > 0;

  return (
    <aside
      className={`bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-6 ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={18} className="text-amber-600" />
          <h2 className="font-bold text-slate-900 text-base">Bộ Lọc Tìm Kiếm</h2>
        </div>

        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              type="button"
              className="text-xs text-amber-600 hover:text-amber-700 font-semibold flex items-center gap-1 hover:underline transition-all cursor-pointer"
            >
              <RotateCcw size={12} />
              <span>Đặt lại</span>
            </button>
          )}
          {onCloseMobile && (
            <button
              onClick={onCloseMobile}
              type="button"
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-500 lg:hidden cursor-pointer"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      {/* 1. KHOẢNG GIÁ */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Khoảng Giá Mỗi Đêm
          </h3>
          <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/50">
            {maxPrice >= 5000000 ? 'Tất cả mức giá' : `Tối đa ${formatVND(maxPrice)}`}
          </span>
        </div>

        {/* Range Slider */}
        <div className="pt-1">
          <input
            type="range"
            min="500000"
            max="5000000"
            step="100000"
            value={maxPrice}
            onChange={(e) => onMaxPriceChange(Number(e.target.value))}
            className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-amber-600"
          />
          <div className="flex justify-between text-[11px] text-slate-400 mt-1">
            <span>500.000 ₫</span>
            <span>5.000.000 ₫+</span>
          </div>
        </div>

        {/* Quick select pills */}
        <div className="grid grid-cols-2 gap-1.5 pt-1">
          {quickPrices.map((item) => {
            const isSelected = maxPrice === item.value;
            return (
              <button
                key={item.label}
                type="button"
                onClick={() => onMaxPriceChange(item.value)}
                className={`text-xs py-1.5 px-2 rounded-lg border text-center transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-amber-600 text-white border-amber-600 font-semibold shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200/80'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      <hr className="border-slate-100" />

      {/* 2. LOẠI PHÒNG */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Hạng Phòng
          </h3>
          {selectedTypes.length > 0 && (
            <span className="text-[11px] text-slate-400">
              Đã chọn: {selectedTypes.length}
            </span>
          )}
        </div>

        <div className="space-y-2">
          {roomTypesList.map((type) => {
            const isChecked = selectedTypes.includes(type.id);
            const count = roomCountsByType[type.id] || 0;
            return (
              <label
                key={type.id}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors group select-none"
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={isChecked}
                  onChange={() => onToggleType(type.id)}
                />
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                      isChecked
                        ? 'bg-amber-600 border-amber-600 text-white'
                        : 'border-slate-300 group-hover:border-amber-500 bg-white'
                    }`}
                  >
                    {isChecked && <Check size={11} strokeWidth={3} />}
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      isChecked ? 'text-slate-900 font-semibold' : 'text-slate-700'
                    }`}
                  >
                    {type.label}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full font-mono">
                  {count}
                </span>
              </label>
            );
          })}
        </div>
      </div>

      <hr className="border-slate-100" />

      {/* 3. TIỆN NGHI */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Tiện Nghi Phòng
          </h3>
          {selectedAmenities.length > 0 && (
            <span className="text-[11px] text-slate-400">
              Đã chọn: {selectedAmenities.length}
            </span>
          )}
        </div>

        <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
          {availableAmenities.map((amenity) => {
            const isChecked = selectedAmenities.includes(amenity);
            return (
              <label
                key={amenity}
                className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors group select-none"
              >
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={isChecked}
                  onChange={() => onToggleAmenity(amenity)}
                />
                <div
                  className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                    isChecked
                      ? 'bg-amber-600 border-amber-600 text-white'
                      : 'border-slate-300 group-hover:border-amber-500 bg-white'
                  }`}
                >
                  {isChecked && <Check size={11} strokeWidth={3} />}
                </div>
                <span
                  className={`text-xs font-medium truncate ${
                    isChecked ? 'text-slate-900 font-semibold' : 'text-slate-600'
                  }`}
                >
                  {amenity}
                </span>
              </label>
            );
          })}
        </div>
      </div>
    </aside>
  );
};

export default RoomSidebarFilter;
