import React, { useState, useEffect } from 'react';
import {
  X,
  ConciergeBell,
  Coins,
  Clock,
  Sparkles,
  AlertCircle,
} from 'lucide-react';
import { formatVND } from '../../utils/formatters';

export const AddServiceModal = ({
  isOpen,
  onClose,
  onAddService,
  onSave,
  initialData = null,
}) => {
  const isEditing = Boolean(initialData?.id);

  const [formData, setFormData] = useState({
    name: '',
    sku: 'SRV-' + Math.floor(1000 + Math.random() * 9000),
    category: 'Minibar & Đồ uống cao cấp',
    unit: 'Chai / Lon',
    price: 150000,
    department: 'Bộ phận F&B & Quầy Bar',
    slaTime: 'Phục vụ ngay trong 15 phút',
    status: 'ACTIVE',
    description: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id,
        name: initialData.name || '',
        sku: initialData.sku || ('SRV-' + Math.floor(1000 + Math.random() * 9000)),
        category: initialData.category || 'Minibar & Đồ uống cao cấp',
        unit: initialData.unit || 'Chai / Lon',
        price: initialData.price || 150000,
        department: initialData.department || 'Bộ phận F&B & Quầy Bar',
        slaTime: initialData.slaTime || 'Phục vụ ngay trong 15 phút',
        status: initialData.status || 'ACTIVE',
        description: initialData.description || '',
      });
    } else {
      setFormData({
        name: '',
        sku: 'SRV-' + Math.floor(1000 + Math.random() * 9000),
        category: 'Minibar & Đồ uống cao cấp',
        unit: 'Chai / Lon',
        price: 150000,
        department: 'Bộ phận F&B & Quầy Bar',
        slaTime: 'Phục vụ ngay trong 15 phút',
        status: 'ACTIVE',
        description: '',
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};
    if (!formData.name?.trim()) {
      newErrors.name = 'Tên dịch vụ không được để trống.';
    }
    const priceNum = Number(formData.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      newErrors.price = 'Đơn giá dịch vụ phải lớn hơn 0 VND.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      ...formData,
      name: formData.name.trim(),
      sku: formData.sku?.trim() || `SRV-${Math.floor(1000 + Math.random() * 9000)}`,
      price: Number(formData.price),
      unit: formData.unit?.trim() || 'Lần',
      category: formData.category?.trim() || 'Dịch vụ chung',
      status: formData.status || 'ACTIVE',
      description: formData.description?.trim() || '',
    };

    if (onSave) {
      onSave(payload);
    } else if (onAddService) {
      onAddService(payload);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-stone-200 my-8 animate-scale-up">
        {/* Header */}
        <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0E1524] text-white flex items-center justify-center shadow-xs">
              <ConciergeBell size={18} />
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-[0.2em] text-amber-800 uppercase block">
                DANH MỤC TIỆN ÍCH • THỰC ĐƠN & DỊCH VỤ
              </span>
              <h3 className="font-serif text-xl font-bold text-stone-900">
                {isEditing ? 'Cập Nhật Dịch Vụ' : 'Thêm Dịch Vụ / Tiện Ích Mới'}
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
          {/* Section 1: Tên & Phân loại */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Tên dịch vụ / Sản phẩm <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Ví dụ: Rượu Vang Chateau Margaux Grand Cru"
                value={formData.name}
                onChange={(e) => {
                  setFormData({ ...formData, name: e.target.value });
                  if (errors.name) setErrors({ ...errors, name: null });
                }}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-bold focus:outline-none transition-colors ${
                  errors.name
                    ? 'border-rose-400 bg-rose-50/30 focus:border-rose-600'
                    : 'border-stone-300 focus:border-stone-900'
                }`}
              />
              {errors.name && (
                <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle size={12} />
                  <span>{errors.name}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Mã định danh (SKU)
              </label>
              <input
                type="text"
                placeholder="SRV-1001"
                value={formData.sku}
                onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-mono focus:outline-none focus:border-stone-900"
              />
            </div>
          </div>

          {/* Section 2: Nhóm dịch vụ & Đơn vị tính */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Nhóm danh mục dịch vụ
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-stone-900 bg-white"
              >
                <option value="Minibar & Đồ uống cao cấp">Minibar & Đồ uống cao cấp</option>
                <option value="In-room Dining (Ẩm thực tại phòng)">In-room Dining (Ẩm thực tại phòng)</option>
                <option value="Dịch vụ Spa & Wellness">Dịch vụ Spa & Trị liệu Wellness</option>
                <option value="Đưa đón xe sang Maybach">Đưa đón sân bay xe sang Maybach</option>
                <option value="Tour & Du thuyền riêng biệt">Tour & Du thuyền riêng biệt</option>
                <option value="Giặt ủi & Chăm sóc trang phục">Giặt ủi & Chăm sóc trang phục</option>
                <option value="Dịch vụ bổ sung khác">Dịch vụ bổ sung khác</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Đơn vị tính (Unit)
              </label>
              <input
                type="text"
                placeholder="Ví dụ: Chai, Set, Liệu trình, Chuyến, Lần..."
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-stone-900 bg-white"
              />
            </div>
          </div>

          {/* Section 3: Đơn giá & Trạng thái */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5 flex items-center gap-1.5">
                <Coins size={13} className="text-stone-500" />
                <span>Đơn giá niêm yết (VND) <span className="text-rose-500">*</span></span>
              </label>
              <input
                type="number"
                step="10000"
                min="1"
                value={formData.price}
                onChange={(e) => {
                  setFormData({ ...formData, price: e.target.value });
                  if (errors.price) setErrors({ ...errors, price: null });
                }}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-bold focus:outline-none transition-colors ${
                  errors.price
                    ? 'border-rose-400 bg-rose-50/30 focus:border-rose-600'
                    : 'border-stone-300 focus:border-stone-900'
                }`}
              />
              {errors.price && (
                <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle size={12} />
                  <span>{errors.price}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Trạng thái phục vụ
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-stone-900 bg-white"
              >
                <option value="ACTIVE">ACTIVE - Đang phục vụ</option>
                <option value="INACTIVE">INACTIVE - Tạm ngừng phục vụ</option>
              </select>
            </div>
          </div>

          {/* Section 4: Mô tả */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Mô tả chi tiết sản phẩm / tiêu chuẩn phục vụ
            </label>
            <textarea
              rows="3"
              placeholder="Mô tả thành phần, quy cách phục vụ, yêu cầu lưu ý..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-stone-900"
            ></textarea>
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
            <span className="text-[11px] text-stone-500">
              Đơn giá: <strong>{formatVND(formData.price || 0)}</strong> / {formData.unit || 'Lần'}
            </span>
            <div className="flex items-center gap-2.5">
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
                {isEditing ? 'Lưu thay đổi' : 'Lưu dịch vụ vào hệ thống'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddServiceModal;
