import React, { useState } from 'react';
import { formatDate } from '../../utils/formatters';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import {
  Plus,
  Trash2,
  Calendar,
  Check,
  Tag,
  TrendingUp,
  TrendingDown,
  Layers,
} from 'lucide-react';

const RULE_TYPES = [
  { value: 'WEEKEND', label: 'Phụ thu Cuối tuần', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  { value: 'HOLIDAY', label: 'Ngày Lễ / Tết', color: 'bg-rose-50 text-rose-700 border-rose-200' },
  { value: 'PEAK_SEASON', label: 'Mùa Cao Điểm', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { value: 'DISCOUNT', label: 'Khuyến Mãi / Giảm Giá', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { value: 'SPECIAL_EVENT', label: 'Sự Kiện Đặc Biệt', color: 'bg-purple-50 text-purple-700 border-purple-200' },
];

const AVAILABLE_ROOM_TYPES = [
  'Standard Twin',
  'Standard Double',
  'Superior King',
  'Deluxe Ocean View',
  'Premier Suite',
  'Presidential Royal Suite',
];

export const PriceSettingPage = () => {
  const [rules, setRules] = useState([
    {
      id: 1,
      name: 'Phụ thu Cuối tuần (Thứ 6, Thứ 7, CN)',
      type: 'WEEKEND',
      adjustmentPercentage: 20, // +20%
      targetRooms: ['Standard Twin', 'Standard Double', 'Superior King', 'Deluxe Ocean View', 'Premier Suite', 'Presidential Royal Suite'],
      startDate: '2026-01-01',
      endDate: '2026-12-31',
      isActive: true,
    },
    {
      id: 2,
      name: 'Mùa Cao Điểm Du Lịch Hè',
      type: 'PEAK_SEASON',
      adjustmentPercentage: 30, // +30%
      targetRooms: ['Deluxe Ocean View', 'Premier Suite', 'Presidential Royal Suite'],
      startDate: '2026-06-01',
      endDate: '2026-08-31',
      isActive: true,
    },
    {
      id: 3,
      name: 'Khuyến Mãi Kích Cầu Mùa Thấp Điểm',
      type: 'DISCOUNT',
      adjustmentPercentage: -15, // -15%
      targetRooms: ['Standard Twin', 'Standard Double', 'Superior King'],
      startDate: '2026-10-01',
      endDate: '2026-11-30',
      isActive: false,
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [newRule, setNewRule] = useState({
    name: '',
    type: 'HOLIDAY',
    startDate: '',
    endDate: '',
    adjustmentDirection: 'INCREASE', // 'INCREASE' | 'DECREASE'
    adjustmentPercent: 15,
    targetRooms: [...AVAILABLE_ROOM_TYPES],
  });

  const handleToggleRoomType = (type) => {
    setNewRule((prev) => {
      const exists = prev.targetRooms.includes(type);
      if (exists) {
        return {
          ...prev,
          targetRooms: prev.targetRooms.filter((t) => t !== type),
        };
      }
      return {
        ...prev,
        targetRooms: [...prev.targetRooms, type],
      };
    });
  };

  const handleSelectAllRoomTypes = () => {
    if (newRule.targetRooms.length === AVAILABLE_ROOM_TYPES.length) {
      setNewRule((prev) => ({ ...prev, targetRooms: [] }));
    } else {
      setNewRule((prev) => ({ ...prev, targetRooms: [...AVAILABLE_ROOM_TYPES] }));
    }
  };

  const handleAddRule = (e) => {
    e.preventDefault();

    if (!newRule.name.trim()) {
      alert('Vui lòng nhập tên quy tắc giá.');
      return;
    }

    if (newRule.targetRooms.length === 0) {
      alert('Vui lòng chọn ít nhất một loại phòng áp dụng.');
      return;
    }

    const percentValue =
      newRule.adjustmentDirection === 'DECREASE'
        ? -Math.abs(Number(newRule.adjustmentPercent) || 0)
        : Math.abs(Number(newRule.adjustmentPercent) || 0);

    const createdRule = {
      id: Date.now(),
      name: newRule.name.trim(),
      type: newRule.type,
      adjustmentPercentage: percentValue,
      targetRooms: newRule.targetRooms,
      startDate: newRule.startDate || '2026-09-15',
      endDate: newRule.endDate || '2026-10-15',
      isActive: true,
    };

    setRules([createdRule, ...rules]);
    setIsModalOpen(false);

    // Reset form
    setNewRule({
      name: '',
      type: 'HOLIDAY',
      startDate: '',
      endDate: '',
      adjustmentDirection: 'INCREASE',
      adjustmentPercent: 15,
      targetRooms: [...AVAILABLE_ROOM_TYPES],
    });
  };

  const toggleStatus = (id) => {
    setRules((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isActive: !r.isActive } : r))
    );
  };

  const handleDeleteRule = (id) => {
    if (window.confirm('Bạn có chắc muốn xóa quy tắc giá linh hoạt này?')) {
      setRules((prev) => prev.filter((r) => r.id !== id));
    }
  };

  const getRuleTypeMeta = (typeValue) => {
    return (
      RULE_TYPES.find((t) => t.value === typeValue) || {
        label: typeValue,
        color: 'bg-slate-100 text-slate-700 border-slate-200',
      }
    );
  };

  // Tính thử ví dụ giá
  const sampleBasePrice = 1000000;
  const calculatedPercent =
    newRule.adjustmentDirection === 'DECREASE'
      ? -Math.abs(Number(newRule.adjustmentPercent) || 0)
      : Math.abs(Number(newRule.adjustmentPercent) || 0);
  const sampleNewPrice = Math.round(sampleBasePrice * (1 + calculatedPercent / 100));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Cài Đặt Giá Linh Hoạt
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Thiết lập biểu giá thông minh theo ngày lễ tết, cuối tuần và mùa cao/thấp điểm
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          className="gap-1.5"
        >
          <Plus size={16} />
          <span>Tạo Quy Tắc Giá Mới</span>
        </Button>
      </div>

      {/* Rules Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs text-slate-600">
          <thead className="bg-slate-50 text-slate-700 uppercase font-semibold text-[11px] border-b border-slate-200">
            <tr>
              <th className="px-5 py-3.5">Tên quy tắc giá</th>
              <th className="px-5 py-3.5">Loại quy tắc</th>
              <th className="px-5 py-3.5">Mức điều chỉnh</th>
              <th className="px-5 py-3.5">Loại phòng áp dụng</th>
              <th className="px-5 py-3.5">Thời gian hiệu lực</th>
              <th className="px-5 py-3.5">Trạng thái</th>
              <th className="px-5 py-3.5 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rules.map((r) => {
              const typeMeta = getRuleTypeMeta(r.type);
              const isAllRooms = r.targetRooms.length >= AVAILABLE_ROOM_TYPES.length;

              return (
                <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-3.5 font-bold text-slate-900">{r.name}</td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-md border ${typeMeta.color}`}
                    >
                      {typeMeta.label}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded ${
                        r.adjustmentPercentage > 0
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {r.adjustmentPercentage > 0 ? (
                        <TrendingUp size={12} />
                      ) : (
                        <TrendingDown size={12} />
                      )}
                      {r.adjustmentPercentage > 0
                        ? `+${r.adjustmentPercentage}%`
                        : `${r.adjustmentPercentage}%`}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 max-w-xs">
                    {isAllRooms ? (
                      <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full text-[11px]">
                        Tất cả các loại phòng ({r.targetRooms.length})
                      </span>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {r.targetRooms.map((t, idx) => (
                          <span
                            key={idx}
                            className="bg-slate-100 text-slate-700 text-[10px] px-1.5 py-0.5 rounded border border-slate-200"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">
                    {formatDate(r.startDate)} ➔ {formatDate(r.endDate)}
                  </td>
                  <td className="px-5 py-3.5">
                    <button
                      type="button"
                      onClick={() => toggleStatus(r.id)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full cursor-pointer transition-colors ${
                        r.isActive
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                          : 'bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-200'
                      }`}
                    >
                      {r.isActive ? 'Đang áp dụng' : 'Tạm dừng'}
                    </button>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => handleDeleteRule(r.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Xóa quy tắc"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* MODAL: TẠO QUY TẮC GIÁ LINH HOẠT MỚI */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Tạo Quy Tắc Giá Linh Hoạt Mới"
        maxWidth="max-w-2xl"
        footer={
          <>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              Hủy
            </Button>
            <Button type="button" variant="primary" size="sm" onClick={handleAddRule}>
              Lưu & Áp Dụng Quy Tắc
            </Button>
          </>
        }
      >
        <form onSubmit={handleAddRule} className="space-y-4">
          {/* 1. Tên quy tắc */}
          <Input
            label="Tên quy tắc giá *"
            placeholder="Ví dụ: Phụ thu Lễ 30/4 - 1/5, Khuyến mãi chào hè..."
            value={newRule.name}
            onChange={(e) => setNewRule({ ...newRule, name: e.target.value })}
            required
          />

          {/* 2. Loại quy tắc */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <Tag size={13} className="text-amber-600" />
              <span>Loại quy tắc giá *</span>
            </label>
            <select
              value={newRule.type}
              onChange={(e) => setNewRule({ ...newRule, type: e.target.value })}
              className="w-full text-xs border border-slate-200 rounded-lg p-2.5 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 cursor-pointer"
            >
              {RULE_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Từ ngày - Đến ngày */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Calendar size={13} className="text-amber-600" />
                <span>Từ ngày *</span>
              </label>
              <input
                type="date"
                value={newRule.startDate}
                onChange={(e) => setNewRule({ ...newRule, startDate: e.target.value })}
                required
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Calendar size={13} className="text-amber-600" />
                <span>Đến ngày *</span>
              </label>
              <input
                type="date"
                value={newRule.endDate}
                onChange={(e) => setNewRule({ ...newRule, endDate: e.target.value })}
                required
                className="w-full text-xs border border-slate-200 rounded-lg p-2.5 text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
              />
            </div>
          </div>

          {/* 4. Phần trăm điều chỉnh */}
          <div className="space-y-2 p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
            <label className="text-xs font-semibold text-slate-700 block">
              Phần trăm điều chỉnh giá (%) *
            </label>

            <div className="flex flex-wrap items-center gap-2">
              {/* Nút chọn Tăng (+) hoặc Giảm (-) */}
              <div className="flex rounded-lg border border-slate-200 bg-white p-0.5">
                <button
                  type="button"
                  onClick={() => setNewRule({ ...newRule, adjustmentDirection: 'INCREASE' })}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                    newRule.adjustmentDirection === 'INCREASE'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <TrendingUp size={13} />
                  <span>Tăng giá (+)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setNewRule({ ...newRule, adjustmentDirection: 'DECREASE' })}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                    newRule.adjustmentDirection === 'DECREASE'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <TrendingDown size={13} />
                  <span>Giảm giá (-)</span>
                </button>
              </div>

              {/* Ô nhập số % */}
              <div className="relative flex-1 min-w-[120px]">
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={newRule.adjustmentPercent}
                  onChange={(e) =>
                    setNewRule({
                      ...newRule,
                      adjustmentPercent: Math.max(1, Math.min(100, Number(e.target.value))),
                    })
                  }
                  required
                  placeholder="Ví dụ: 20"
                  className="w-full text-xs font-bold border border-slate-200 rounded-lg p-2.5 pr-8 text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                />
                <span className="absolute right-3 top-2.5 text-xs font-bold text-slate-400">
                  %
                </span>
              </div>
            </div>

            {/* Minh họa giá sau áp dụng */}
            <div className="text-[11px] text-slate-500 pt-1 flex items-center justify-between">
              <span>
                Mức điều chỉnh:{' '}
                <strong
                  className={
                    newRule.adjustmentDirection === 'INCREASE'
                      ? 'text-amber-700'
                      : 'text-emerald-700'
                  }
                >
                  {newRule.adjustmentDirection === 'INCREASE' ? '+' : '-'}
                  {newRule.adjustmentPercent}%
                </strong>
              </span>
              <span>
                Phòng 1.000.000 ₫ ➔{' '}
                <strong className="text-slate-800 font-bold">
                  {new Intl.NumberFormat('vi-VN').format(sampleNewPrice)} ₫
                </strong>
              </span>
            </div>
          </div>

          {/* 5. Loại phòng (có thể chọn nhiều) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <Layers size={13} className="text-amber-600" />
                <span>Loại phòng áp dụng (chọn nhiều) *</span>
              </label>

              <button
                type="button"
                onClick={handleSelectAllRoomTypes}
                className="text-xs text-amber-600 hover:text-amber-700 font-semibold cursor-pointer underline"
              >
                {newRule.targetRooms.length === AVAILABLE_ROOM_TYPES.length
                  ? 'Bỏ chọn tất cả'
                  : 'Chọn tất cả'}
              </button>
            </div>

            {/* Checkbox Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 border border-slate-200 rounded-xl bg-slate-50/50">
              {AVAILABLE_ROOM_TYPES.map((type) => {
                const isSelected = newRule.targetRooms.includes(type);
                return (
                  <label
                    key={type}
                    className={`flex items-center gap-2.5 p-2 rounded-lg border text-xs cursor-pointer transition-all select-none ${
                      isSelected
                        ? 'bg-amber-50 border-amber-300 text-amber-900 font-semibold'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleRoomType(type)}
                      className="sr-only"
                    />
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-amber-600 border-amber-600 text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <Check size={11} strokeWidth={3} />}
                    </div>
                    <span className="truncate">{type}</span>
                  </label>
                );
              })}
            </div>

            <p className="text-[11px] text-slate-400">
              Đã chọn: <strong className="text-slate-700">{newRule.targetRooms.length}</strong> /{' '}
              {AVAILABLE_ROOM_TYPES.length} loại phòng
            </p>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PriceSettingPage;
