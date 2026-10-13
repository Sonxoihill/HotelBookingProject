import React, { useState } from 'react';
import {
  X,
  BadgePercent,
  SlidersHorizontal,
  Calendar,
  Zap,
  TrendingUp,
  Building2,
  ShieldAlert,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

export const AddPricingRuleModal = ({ isOpen, onClose, onAddRule }) => {
  const [formData, setFormData] = useState({
    name: '',
    ruleCode: 'RATE-DYN-' + Math.floor(100 + Math.random() * 900),
    type: 'OCCUPANCY_SURGE',
    targetScope: 'ALL',
    specificRooms: ['Grand Celestial Penthouse', 'Garden Sanctuary Pool Villa'],
    adjustmentType: 'PERCENT_INCREASE',
    adjustmentValue: 15,
    startDate: '2026-11-01',
    endDate: '2026-12-31',
    selectedDays: ['Friday', 'Saturday'],
    occupancyThreshold: 80,
    allowStacking: false,
    priceCeiling: 35000000,
    status: 'ACTIVE',
    notes: 'Quy tắc tự động tăng giá nhằm bảo vệ biên lợi nhuận khi công suất chạm ngưỡng cao.',
  });

  if (!isOpen) return null;

  const ROOM_OPTIONS = [
    'Grand Celestial Penthouse',
    'Ocean Horizon Executive Suite',
    'Garden Sanctuary Pool Villa',
    'Deluxe Pine Forest View',
  ];

  const DAYS_OF_WEEK = [
    { key: 'Monday', label: 'T2' },
    { key: 'Tuesday', label: 'T3' },
    { key: 'Wednesday', label: 'T4' },
    { key: 'Thursday', label: 'T5' },
    { key: 'Friday', label: 'T6' },
    { key: 'Saturday', label: 'T7' },
    { key: 'Sunday', label: 'CN' },
  ];

  const toggleDay = (dayKey) => {
    setFormData((prev) => ({
      ...prev,
      selectedDays: prev.selectedDays.includes(dayKey)
        ? prev.selectedDays.filter((d) => d !== dayKey)
        : [...prev.selectedDays, dayKey],
    }));
  };

  const toggleRoom = (roomName) => {
    setFormData((prev) => ({
      ...prev,
      specificRooms: prev.specificRooms.includes(roomName)
        ? prev.specificRooms.filter((r) => r !== roomName)
        : [...prev.specificRooms, roomName],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    let adjustmentString = `+${formData.adjustmentValue}%`;
    if (formData.adjustmentType === 'PERCENT_DECREASE') {
      adjustmentString = `Giảm ${formData.adjustmentValue}%`;
    } else if (formData.adjustmentType === 'FIXED_AMOUNT') {
      adjustmentString = `+${Number(formData.adjustmentValue).toLocaleString('vi-VN')} đ`;
    }

    onAddRule({
      ...formData,
      adjustment: adjustmentString,
      adjustmentScope: formData.targetScope === 'ALL' ? 'toàn bộ hạng phòng' : 'hạng phòng chỉ định',
      timeRange: `${formData.startDate} — ${formData.endDate}`,
      timeBadge: formData.type === 'OCCUPANCY_SURGE' ? 'TỰ ĐỘNG THEO CÔNG SUẤT' : 'CHÍNH SÁCH MÙA VỤ',
      target: formData.targetScope === 'ALL' ? 'Toàn bộ 42 phòng và villa' : formData.specificRooms.join(', '),
      status: 'ACTIVE',
      statusLabel: 'Đang kích hoạt',
      isActive: true,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-stone-200 my-8 animate-scale-up">
        {/* Header */}
        <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0E1524] text-white flex items-center justify-center shadow-xs">
              <BadgePercent size={18} />
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-[0.2em] text-amber-800 uppercase block">
                YIELD MANAGEMENT RMS • THUẬT TOÁN ĐỊNH GIÁ ĐỘNG
              </span>
              <h3 className="font-serif text-xl font-bold text-stone-900">
                Thiết Lập Quy Tắc Giá Linh Hoạt Mới
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full hover:bg-stone-200 text-stone-400 hover:text-stone-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Section 1: Tên & Phân loại chính sách */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Tên quy tắc định giá *
              </label>
              <input
                type="text"
                required
                placeholder="Ví dụ: Tăng giá tự động khi công suất vượt 80%"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-bold focus:outline-none focus:border-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Mã quy tắc RMS
              </label>
              <input
                type="text"
                value={formData.ruleCode}
                onChange={(e) => setFormData({ ...formData, ruleCode: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-mono focus:outline-none focus:border-stone-900"
              />
            </div>
          </div>

          {/* Section 2: Loại hình quy tắc & Phương thức điều chỉnh */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Loại hình quy tắc điều chỉnh
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-stone-900 bg-white"
              >
                <option value="OCCUPANCY_SURGE">Tăng giá tự động theo Công suất phòng (Yield AI)</option>
                <option value="WEEKEND_SURCHARGE">Phụ thu Cuối tuần (Weekend Surcharge)</option>
                <option value="PEAK_SEASON">Phụ thu Mùa cao điểm & Lễ Tết (Festive Season)</option>
                <option value="EARLY_BIRD">Ưu đãi Đặt phòng sớm (Early Bird Discount)</option>
                <option value="LONG_STAY">Ưu đãi Khách lưu trú dài hạn (Long Stay)</option>
                <option value="VIP_TIER">Đặc quyền Thành viên VIP Black Diamond</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Mức biến động giá áp dụng *
              </label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  value={formData.adjustmentType}
                  onChange={(e) => setFormData({ ...formData, adjustmentType: e.target.value })}
                  className="w-full px-2.5 py-2 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-stone-900 bg-white"
                >
                  <option value="PERCENT_INCREASE">Tăng giá theo % (+)</option>
                  <option value="PERCENT_DECREASE">Giảm giá theo % (-)</option>
                  <option value="FIXED_AMOUNT">Cộng tiền cố định (VND)</option>
                </select>
                <input
                  type="number"
                  required
                  value={formData.adjustmentValue}
                  onChange={(e) => setFormData({ ...formData, adjustmentValue: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs font-bold focus:outline-none focus:border-stone-900"
                  placeholder={formData.adjustmentType === 'FIXED_AMOUNT' ? '500000' : '15'}
                />
              </div>
            </div>
          </div>

          {/* Section 3: Điều kiện kích hoạt tự động (Ngưỡng công suất & Ngày trong tuần) */}
          <div className="p-4 bg-[#FAF8F5] rounded-2xl border border-stone-200/90 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                <Zap size={14} className="text-amber-700 fill-amber-700" />
                Ngưỡng công suất kích hoạt tự động (Occupancy Threshold)
              </span>
              <span className="text-xs font-bold text-amber-900 bg-white px-2.5 py-1 rounded-full border border-amber-200 shadow-2xs">
                {formData.occupancyThreshold}%
              </span>
            </div>
            <input
              type="range"
              min="50"
              max="95"
              step="5"
              value={formData.occupancyThreshold}
              onChange={(e) => setFormData({ ...formData, occupancyThreshold: e.target.value })}
              className="w-full accent-amber-800 cursor-pointer"
            />
            <p className="text-[11px] text-stone-500">
              * Khi tỷ lệ lấp đầy phòng chạm ngưỡng <strong className="text-stone-800">{formData.occupancyThreshold}%</strong>, thuật toán PMS sẽ tự động đẩy giá bán để tối ưu doanh thu RevPAR.
            </p>

            {/* Day of Week Selector */}
            <div className="pt-2 border-t border-stone-200/60">
              <span className="block text-[11px] font-semibold text-stone-700 mb-2">
                Áp dụng vào các ngày trong tuần:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {DAYS_OF_WEEK.map((d) => {
                  const isChecked = formData.selectedDays.includes(d.key);
                  return (
                    <button
                      type="button"
                      key={d.key}
                      onClick={() => toggleDay(d.key)}
                      className={`w-9 h-8 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-black text-white shadow-2xs'
                          : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 4: Phạm vi phòng áp dụng */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-2">
              Phạm vi hạng phòng áp dụng
            </label>
            <div className="flex items-center gap-4 mb-2">
              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                <input
                  type="radio"
                  name="targetScope"
                  value="ALL"
                  checked={formData.targetScope === 'ALL'}
                  onChange={() => setFormData({ ...formData, targetScope: 'ALL' })}
                  className="accent-black"
                />
                <span>Áp dụng toàn bộ 42 phòng và villa</span>
              </label>
              <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                <input
                  type="radio"
                  name="targetScope"
                  value="CUSTOM"
                  checked={formData.targetScope === 'CUSTOM'}
                  onChange={() => setFormData({ ...formData, targetScope: 'CUSTOM' })}
                  className="accent-black"
                />
                <span>Chọn hạng phòng cụ thể</span>
              </label>
            </div>

            {formData.targetScope === 'CUSTOM' && (
              <div className="grid grid-cols-2 gap-2 mt-2 p-3 bg-stone-50 rounded-xl border border-stone-200">
                {ROOM_OPTIONS.map((room) => {
                  const isChecked = formData.specificRooms.includes(room);
                  return (
                    <button
                      type="button"
                      key={room}
                      onClick={() => toggleRoom(room)}
                      className={`flex items-center gap-2 p-2 rounded-lg text-xs text-left transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-white text-stone-900 font-bold shadow-2xs border border-stone-300'
                          : 'text-stone-500 hover:bg-stone-100'
                      }`}
                    >
                      <div
                        className={`w-3.5 h-3.5 rounded flex items-center justify-center shrink-0 ${
                          isChecked ? 'bg-black text-white' : 'border border-stone-300'
                        }`}
                      >
                        {isChecked && <CheckCircle2 size={10} />}
                      </div>
                      <span className="truncate">{room}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 5: Trần giá an toàn & Cộng dồn */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5 flex items-center gap-1.5">
                <ShieldAlert size={13} className="text-stone-500" />
                <span>Trần giá tối đa bảo vệ khách (Price Ceiling)</span>
              </label>
              <input
                type="number"
                step="1000000"
                value={formData.priceCeiling}
                onChange={(e) => setFormData({ ...formData, priceCeiling: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-stone-900"
              />
            </div>

            <div className="flex items-center">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-stone-700 pt-4">
                <input
                  type="checkbox"
                  checked={formData.allowStacking}
                  onChange={(e) => setFormData({ ...formData, allowStacking: e.target.checked })}
                  className="rounded border-stone-300 text-black focus:ring-black w-4 h-4"
                />
                <span>Cho phép cộng dồn với mã giảm giá thành viên</span>
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full border border-stone-200 text-xs font-semibold text-stone-600 hover:bg-stone-50 cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-full bg-black text-white text-xs font-semibold hover:bg-stone-800 cursor-pointer shadow-xs"
            >
              Kích hoạt quy tắc giá
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPricingRuleModal;
