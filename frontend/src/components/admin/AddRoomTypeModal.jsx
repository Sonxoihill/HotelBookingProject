import React, { useState } from 'react';
import {
  X,
  Building2,
  Tag,
  Maximize2,
  Users,
  Coins,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Image as ImageIcon,
} from 'lucide-react';
import { formatVND } from '../../utils/formatters';

export const AddRoomTypeModal = ({ isOpen, onClose, onAddRoomType }) => {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    category: 'Penthouse',
    badge: 'VIP SIGNATURE',
    area: '180 m²',
    maxGuests: 4,
    maxChildren: 2,
    basePrice: 15500000,
    serviceChargePercent: 5,
    vatPercent: 8,
    imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&auto=format&fit=crop&q=80',
    description: 'Hạng phòng nghỉ dưỡng đẳng cấp với hồ bơi vô cực riêng và tầm nhìn bao quát toàn cảnh vịnh biển.',
    amenities: [
      'Hồ bơi riêng',
      'Phục vụ bữa sáng Floating Breakfast',
      'Đưa đón Maybach sân bay',
      'Rượu vang Chateau Margaux đón khách',
    ],
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    onAddRoomType({
      ...formData,
      code: formData.code || `PNT-${Math.floor(100 + Math.random() * 900)}`,
      basePrice: Number(formData.basePrice),
      maxGuests: Number(formData.maxGuests),
      maxChildren: Number(formData.maxChildren),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-stone-200 my-8 animate-scale-up">
        {/* Modal Header */}
        <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0E1524] text-white flex items-center justify-center shadow-xs">
              <Building2 size={18} />
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-[0.2em] text-amber-800 uppercase block">
                CẤU HÌNH PHÂN HẠNG NGHỈ DƯỠNG
              </span>
              <h3 className="font-serif text-xl font-bold text-stone-900">
                Thêm Loại Phòng / Hạng Phòng Mới
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

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* 1. Tên hạng & Mã */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Tên hạng phòng tiêu chuẩn *
              </label>
              <input
                type="text"
                required
                placeholder="Ví dụ: Royal Presidential Sky Suite"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-bold focus:outline-none focus:border-stone-900"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Mã định danh (Code)
              </label>
              <input
                type="text"
                placeholder="PNT-ROYAL-01"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-mono focus:outline-none focus:border-stone-900"
              />
            </div>
          </div>

          {/* 2. Nhóm & Nhãn danh dự */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Phân nhóm danh mục
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-stone-900 bg-white"
              >
                <option value="Penthouse">Penthouse Đẳng Cấp</option>
                <option value="Suites Hướng Biển">Suites Hướng Biển (Ocean Suites)</option>
                <option value="Biệt thự Villa">Biệt thự Biển & Hồ bơi (Villas)</option>
                <option value="Deluxe">Deluxe Rừng Thông & Đồi</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Huy hiệu / Điểm nhấn nhận diện (Badge)
              </label>
              <select
                value={formData.badge}
                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-stone-900 bg-white"
              >
                <option value="VIP SIGNATURE">VIP SIGNATURE</option>
                <option value="PRIVATE POOL">PRIVATE POOL</option>
                <option value="BEST SELLER">BEST SELLER</option>
                <option value="PANORAMIC VIEW">PANORAMIC VIEW</option>
              </select>
            </div>
          </div>

          {/* 3. Diện tích & Sức chứa & Giá */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5 flex items-center gap-1">
                <Maximize2 size={12} className="text-stone-500" />
                <span>Diện tích</span>
              </label>
              <input
                type="text"
                placeholder="150 m²"
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5 flex items-center gap-1">
                <Users size={12} className="text-stone-500" />
                <span>Người lớn</span>
              </label>
              <input
                type="number"
                min="1"
                max="12"
                value={formData.maxGuests}
                onChange={(e) => setFormData({ ...formData, maxGuests: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5 flex items-center gap-1">
                <Users size={12} className="text-stone-500" />
                <span>Trẻ em tối đa</span>
              </label>
              <input
                type="number"
                min="0"
                max="6"
                value={formData.maxChildren}
                onChange={(e) => setFormData({ ...formData, maxChildren: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5 flex items-center gap-1">
                <Coins size={12} className="text-stone-500" />
                <span>Giá gốc/đêm (VND) *</span>
              </label>
              <input
                type="number"
                step="100000"
                required
                value={formData.basePrice}
                onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-bold focus:outline-none focus:border-stone-900"
              />
            </div>
          </div>

          {/* 4. Hình ảnh phòng mẫu */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5 flex items-center gap-1.5">
              <ImageIcon size={13} className="text-stone-500" />
              <span>URL Hình ảnh phòng đại diện</span>
            </label>
            <div className="flex items-center gap-3">
              <input
                type="url"
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-stone-900"
              />
              <img
                src={formData.imageUrl}
                alt="Preview"
                className="w-12 h-10 rounded-xl object-cover ring-1 ring-stone-200 shrink-0"
              />
            </div>
          </div>

          {/* 5. Mô tả & Trải nghiệm phòng */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Mô tả chi tiết trải nghiệm lưu trú
            </label>
            <textarea
              rows="3"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-stone-900"
            ></textarea>
          </div>

          {/* Footer Buttons */}
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
              Lưu loại phòng mới
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRoomTypeModal;
