import React, { useState, useEffect } from 'react';
import {
  X,
  Building2,
  Maximize2,
  Users,
  Coins,
  BedDouble,
  Image as ImageIcon,
  AlertCircle,
} from 'lucide-react';
import { formatVND } from '../../utils/formatters';
import { validateSafeText, detectMaliciousCode } from '../../utils/sanitize';

export const AddRoomTypeModal = ({
  isOpen,
  onClose,
  onAddRoomType,
  onSave,
  initialData = null,
}) => {
  const isEditing = Boolean(initialData?.id);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    category: 'Penthouse',
    badge: 'VIP SIGNATURE',
    area: 85,
    capacity: 2,
    maxGuests: 2,
    maxChildren: 1,
    bedCount: 1,
    bedType: '01 Giường King Bed',
    basePrice: 5000000,
    imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&auto=format&fit=crop&q=80',
    description: 'Hạng phòng nghỉ dưỡng đẳng cấp đầy đủ tiện nghi tiêu chuẩn 5 sao.',
    status: 'ACTIVE',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      const parsedArea = initialData.area
        ? parseFloat(String(initialData.area).replace(/[^0-9.]/g, '')) || 50
        : 85;
      setFormData({
        id: initialData.id,
        name: initialData.name || '',
        code: initialData.code || '',
        category: initialData.category || 'Penthouse',
        badge: initialData.badge || 'VIP SIGNATURE',
        area: parsedArea,
        capacity: initialData.capacity || initialData.maxGuests || 2,
        maxGuests: initialData.maxGuests || initialData.capacity || 2,
        maxChildren: initialData.maxChildren ?? 1,
        bedCount: initialData.bedCount || initialData.numberOfBeds || 1,
        bedType: initialData.bedType || '01 Giường King Bed',
        basePrice: initialData.basePrice || initialData.price || 5000000,
        imageUrl: initialData.imageUrl || initialData.image || 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&auto=format&fit=crop&q=80',
        description: initialData.description || '',
        status: initialData.status || 'ACTIVE',
      });
    } else {
      setFormData({
        name: '',
        code: '',
        category: 'Penthouse',
        badge: 'VIP SIGNATURE',
        area: 85,
        capacity: 2,
        maxGuests: 2,
        maxChildren: 1,
        bedCount: 1,
        bedType: '01 Giường King Bed',
        basePrice: 5000000,
        imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&auto=format&fit=crop&q=80',
        description: 'Hạng phòng nghỉ dưỡng đẳng cấp đầy đủ tiện nghi tiêu chuẩn 5 sao.',
        status: 'ACTIVE',
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};

    // 1. Tên loại phòng: Bắt buộc, max 50 ký tự, chống mã độc
    const nameErr = validateSafeText(formData.name, {
      fieldName: 'Tên loại phòng',
      maxLength: 50,
      required: true,
    });
    if (nameErr) newErrors.name = nameErr;

    // 2. Mã định danh: Tùy chọn, max 50 ký tự, chống mã độc
    const codeErr = validateSafeText(formData.code, {
      fieldName: 'Mã định danh',
      maxLength: 50,
      required: false,
    });
    if (codeErr) newErrors.code = codeErr;

    // 3. Phân loại phong cách: max 50 ký tự, chống mã độc
    const categoryErr = validateSafeText(formData.category, {
      fieldName: 'Phân loại phong cách',
      maxLength: 50,
      required: false,
    });
    if (categoryErr) newErrors.category = categoryErr;

    // 4. Huy hiệu nhận diện: max 50 ký tự, chống mã độc
    const badgeErr = validateSafeText(formData.badge, {
      fieldName: 'Huy hiệu nhận diện',
      maxLength: 50,
      required: false,
    });
    if (badgeErr) newErrors.badge = badgeErr;

    // 5. Quy cách giường: max 50 ký tự, chống mã độc
    const bedTypeErr = validateSafeText(formData.bedType, {
      fieldName: 'Quy cách giường',
      maxLength: 50,
      required: false,
    });
    if (bedTypeErr) newErrors.bedType = bedTypeErr;

    // 6. Diện tích: Chỉ điền số, mặc định m², phải > 0
    const rawArea = String(formData.area ?? '').trim();
    if (!rawArea) {
      newErrors.area = 'Vui lòng nhập diện tích phòng.';
    } else {
      const areaNum = Number(rawArea);
      if (isNaN(areaNum) || areaNum <= 0) {
        newErrors.area = 'Diện tích chỉ điền số và phải lớn hơn 0 m².';
      }
    }

    // 7. Giá cơ bản
    const priceNum = Number(formData.basePrice);
    if (!formData.basePrice || isNaN(priceNum) || priceNum <= 0) {
      newErrors.basePrice = 'Giá cơ bản phải lớn hơn 0 VND.';
    }

    // 8. Chống mã độc cho mô tả và URL ảnh
    if (formData.description) {
      const descMalware = detectMaliciousCode(formData.description);
      if (descMalware.hasMalware) {
        newErrors.description = `Mô tả chứa mã độc hoặc ký tự nguy hiểm (${descMalware.reason}).`;
      }
    }

    if (formData.imageUrl) {
      const imgMalware = detectMaliciousCode(formData.imageUrl);
      if (imgMalware.hasMalware) {
        newErrors.imageUrl = `URL hình ảnh chứa mã độc hoặc ký tự nguy hiểm (${imgMalware.reason}).`;
      }
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
      code: formData.code?.trim() || `TYP-${Math.floor(100 + Math.random() * 900)}`,
      basePrice: Number(formData.basePrice),
      price: Number(formData.basePrice),
      capacity: Number(formData.capacity || formData.maxGuests),
      maxGuests: Number(formData.capacity || formData.maxGuests),
      maxChildren: Number(formData.maxChildren || 0),
      bedCount: Number(formData.bedCount || 1),
      numberOfBeds: Number(formData.bedCount || 1),
      area: parseFloat(String(formData.area)) || 50,
    };

    if (onSave) {
      onSave(payload);
    } else if (onAddRoomType) {
      onAddRoomType(payload);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
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
                {isEditing ? 'Cập Nhật Loại Phòng' : 'Thêm Loại Phòng Mới'}
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
          {/* Tên & Mã */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Tên loại phòng tiêu chuẩn <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                maxLength={50}
                placeholder="Ví dụ: Grand Celestial Penthouse (tối đa 50 ký tự)"
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
                Mã định danh (Code)
              </label>
              <input
                type="text"
                maxLength={50}
                placeholder="PNT-GCP-01"
                value={formData.code}
                onChange={(e) => {
                  setFormData({ ...formData, code: e.target.value });
                  if (errors.code) setErrors({ ...errors, code: null });
                }}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono focus:outline-none transition-colors ${
                  errors.code
                    ? 'border-rose-400 bg-rose-50/30 focus:border-rose-600'
                    : 'border-stone-300 focus:border-stone-900'
                }`}
              />
              {errors.code && (
                <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle size={12} />
                  <span>{errors.code}</span>
                </p>
              )}
            </div>
          </div>

          {/* Phân nhóm danh mục */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Phân loại phong cách
              </label>
              <input
                type="text"
                maxLength={50}
                placeholder="Ví dụ: Penthouse, Suites Hướng Biển..."
                value={formData.category}
                onChange={(e) => {
                  setFormData({ ...formData, category: e.target.value });
                  if (errors.category) setErrors({ ...errors, category: null });
                }}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none transition-colors bg-white ${
                  errors.category
                    ? 'border-rose-400 bg-rose-50/30 focus:border-rose-600'
                    : 'border-stone-300 focus:border-stone-900'
                }`}
              />
              {errors.category && (
                <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle size={12} />
                  <span>{errors.category}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Huy hiệu nhận diện (Badge)
              </label>
              <input
                type="text"
                maxLength={50}
                placeholder="Ví dụ: VIP SIGNATURE, PRIVATE POOL..."
                value={formData.badge}
                onChange={(e) => {
                  setFormData({ ...formData, badge: e.target.value });
                  if (errors.badge) setErrors({ ...errors, badge: null });
                }}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none transition-colors bg-white ${
                  errors.badge
                    ? 'border-rose-400 bg-rose-50/30 focus:border-rose-600'
                    : 'border-stone-300 focus:border-stone-900'
                }`}
              />
              {errors.badge && (
                <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle size={12} />
                  <span>{errors.badge}</span>
                </p>
              )}
            </div>
          </div>

          {/* Giá & Sức chứa & Giường & Diện tích */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5 flex items-center gap-1">
                <Coins size={12} className="text-stone-500" />
                <span>Giá cơ bản/đêm (VND) <span className="text-rose-500">*</span></span>
              </label>
              <input
                type="number"
                step="50000"
                min="1"
                value={formData.basePrice}
                onChange={(e) => {
                  setFormData({ ...formData, basePrice: e.target.value });
                  if (errors.basePrice) setErrors({ ...errors, basePrice: null });
                }}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-bold focus:outline-none transition-colors ${
                  errors.basePrice
                    ? 'border-rose-400 bg-rose-50/30 focus:border-rose-600'
                    : 'border-stone-300 focus:border-stone-900'
                }`}
              />
              {errors.basePrice && (
                <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle size={12} />
                  <span>{errors.basePrice}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5 flex items-center gap-1">
                <Users size={12} className="text-stone-500" />
                <span>Sức chứa (Khách)</span>
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value, maxGuests: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5 flex items-center gap-1">
                <BedDouble size={12} className="text-stone-500" />
                <span>Số giường</span>
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={formData.bedCount}
                onChange={(e) => setFormData({ ...formData, bedCount: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-stone-900"
              />
            </div>

            {/* Diện tích: Chỉ điền số, mặc định là mét vuông m² */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5 flex items-center gap-1">
                <Maximize2 size={12} className="text-stone-500" />
                <span>Diện tích (m²) <span className="text-rose-500">*</span></span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  placeholder="Ví dụ: 85"
                  value={formData.area}
                  onChange={(e) => {
                    setFormData({ ...formData, area: e.target.value });
                    if (errors.area) setErrors({ ...errors, area: null });
                  }}
                  className={`w-full pl-3.5 pr-8 py-2.5 rounded-xl border text-xs focus:outline-none transition-colors ${
                    errors.area
                      ? 'border-rose-400 bg-rose-50/30 focus:border-rose-600'
                      : 'border-stone-300 focus:border-stone-900'
                  }`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-stone-400 pointer-events-none">
                  m²
                </span>
              </div>
              {errors.area && (
                <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle size={12} />
                  <span>{errors.area}</span>
                </p>
              )}
            </div>
          </div>

          {/* Quy cách giường & Hình ảnh */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Quy cách giường chính
              </label>
              <input
                type="text"
                maxLength={50}
                placeholder="Ví dụ: 01 Giường King Bed 2.0m x 2.2m"
                value={formData.bedType}
                onChange={(e) => {
                  setFormData({ ...formData, bedType: e.target.value });
                  if (errors.bedType) setErrors({ ...errors, bedType: null });
                }}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none transition-colors ${
                  errors.bedType
                    ? 'border-rose-400 bg-rose-50/30 focus:border-rose-600'
                    : 'border-stone-300 focus:border-stone-900'
                }`}
              />
              {errors.bedType && (
                <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle size={12} />
                  <span>{errors.bedType}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5 flex items-center gap-1.5">
                <ImageIcon size={13} className="text-stone-500" />
                <span>URL Hình ảnh phòng đại diện</span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="url"
                  placeholder="https://..."
                  value={formData.imageUrl}
                  onChange={(e) => {
                    setFormData({ ...formData, imageUrl: e.target.value });
                    if (errors.imageUrl) setErrors({ ...errors, imageUrl: null });
                  }}
                  className={`flex-1 px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none transition-colors ${
                    errors.imageUrl
                      ? 'border-rose-400 bg-rose-50/30 focus:border-rose-600'
                      : 'border-stone-300 focus:border-stone-900'
                  }`}
                />
                {formData.imageUrl && (
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="w-10 h-9 rounded-lg object-cover ring-1 ring-stone-200 shrink-0"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                )}
              </div>
              {errors.imageUrl && (
                <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle size={12} />
                  <span>{errors.imageUrl}</span>
                </p>
              )}
            </div>
          </div>

          {/* Mô tả chi tiết */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Mô tả chi tiết loại phòng
            </label>
            <textarea
              rows="3"
              placeholder="Mô tả không gian, tầm nhìn, tiện nghi nổi bật..."
              value={formData.description}
              onChange={(e) => {
                setFormData({ ...formData, description: e.target.value });
                if (errors.description) setErrors({ ...errors, description: null });
              }}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none transition-colors ${
                errors.description
                  ? 'border-rose-400 bg-rose-50/30 focus:border-rose-600'
                  : 'border-stone-300 focus:border-stone-900'
              }`}
            ></textarea>
            {errors.description && (
              <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
                <AlertCircle size={12} />
                <span>{errors.description}</span>
              </p>
            )}
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
            <span className="text-[11px] text-stone-500">
              Định giá: <strong>{formatVND(formData.basePrice || 0)}</strong> / đêm
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
                {isEditing ? 'Lưu thay đổi' : 'Lưu loại phòng mới'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRoomTypeModal;
