import React, { useState, useEffect } from 'react';
import { validateSafeText } from '../../utils/sanitize';
import {
  X,
  BadgePercent,
  Calendar,
  AlertCircle,
  Info,
  CheckCircle2,
  Percent,
  Sliders,
} from 'lucide-react';

export const AddPricingRuleModal = ({
  isOpen,
  onClose,
  onSave,
  roomCategories = [],
  initialData = null,
}) => {
  const isEditing = Boolean(initialData?.id);

  // Helper định dạng ngày ISO
  const getTodayISO = () => new Date().toISOString().split('T')[0];
  const getDefaultEndISO = () => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d.toISOString().split('T')[0];
  };

  const initialFormState = {
    name: '',
    ruleType: 'WEEKEND', // 'WEEKEND', 'HOLIDAY', 'PEAK_SEASON'
    startDate: getTodayISO(),
    endDate: getDefaultEndISO(),
    adjustmentPercent: 15,
    categoryId: '', // '' hoặc null = Tất cả loại phòng
    isActive: true,
  };

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [serverErrors, setServerErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id,
        name: initialData.name || '',
        ruleType: initialData.ruleType || initialData.type || 'WEEKEND',
        startDate: initialData.startDate ? initialData.startDate.split('T')[0] : getTodayISO(),
        endDate: initialData.endDate ? initialData.endDate.split('T')[0] : getDefaultEndISO(),
        adjustmentPercent: initialData.adjustmentPercent ?? initialData.percentage ?? 15,
        categoryId: initialData.categoryId !== null && initialData.categoryId !== undefined ? String(initialData.categoryId) : '',
        isActive: initialData.isActive !== undefined ? Boolean(initialData.isActive) : true,
      });
    } else {
      setFormData(initialFormState);
    }
    setErrors({});
    setServerErrors({});
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  // Xóa form về mặc định & xóa toàn bộ lỗi khi bấm Hủy bỏ
  const handleCancel = () => {
    setFormData(initialFormState);
    setErrors({});
    setServerErrors({});
    onClose();
  };

  // Validate phía Client: endDate >= startDate, adjustmentPercent != 0, adjustmentPercent > -100, adjustmentPercent <= 500
  const validateClient = () => {
    const errs = {};

    const nameErr = validateSafeText(formData.name, {
      fieldName: 'Tên quy tắc',
      maxLength: 50,
      required: true,
    });
    if (nameErr) errs.name = nameErr;

    if (!formData.startDate) {
      errs.startDate = 'Ngày bắt đầu không được để trống';
    }

    if (!formData.endDate) {
      errs.endDate = 'Ngày kết thúc không được để trống';
    } else if (formData.startDate && formData.endDate < formData.startDate) {
      errs.dateRange = 'Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu';
    }

    const rawPercent = String(formData.adjustmentPercent ?? '').trim();
    if (rawPercent === '') {
      errs.adjustmentPercent = 'Tỷ lệ điều chỉnh giá không được để trống';
    } else {
      const percentNum = Number(rawPercent);
      if (isNaN(percentNum)) {
        errs.adjustmentPercent = 'Tỷ lệ điều chỉnh phải là số hợp lệ';
      } else if (percentNum === 0) {
        errs.adjustmentPercent = 'Phần trăm điều chỉnh phải khác 0';
      } else if (percentNum <= -100) {
        errs.adjustmentPercent = 'Tỷ lệ điều chỉnh giá không hợp lệ (không thể giảm quá 100%)';
      } else if (percentNum > 500) {
        errs.adjustmentPercent = 'Tỷ lệ điều chỉnh giá không được vượt quá 500%';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerErrors({});

    if (!validateClient()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        ruleType: formData.ruleType,
        type: formData.ruleType,
        startDate: formData.startDate,
        endDate: formData.endDate,
        adjustmentPercent: Number(formData.adjustmentPercent),
        // Lựa chọn "Tất cả loại phòng" gửi categoryId: null
        categoryId: formData.categoryId ? Number(formData.categoryId) : null,
        isActive: Boolean(formData.isActive),
      };

      await onSave(payload);
    } catch (err) {
      console.error('Lỗi khi lưu quy tắc giá:', err);
      const status = err.response?.status || err.status;
      const data = err.response?.data || err.data;
      const errorMsg = data?.message || err.message || '';

      const newServerErrors = {};

      // Bắt lỗi từ response Server: Lỗi trùng lặp (409) -> hiện chữ đỏ dưới ô Từ ngày/Đến ngày
      if (
        status === 409 ||
        errorMsg.toLowerCase().includes('trùng') ||
        errorMsg.toLowerCase().includes('conflict') ||
        errorMsg.toLowerCase().includes('overlap')
      ) {
        newServerErrors.dateRange =
          errorMsg || 'Khoảng thời gian này đã bị trùng lặp với quy tắc giá hiện có.';
      }

      // Map toàn bộ errors từ backend nếu có
      const backendFieldErrors = data?.errors || err?.errors;
      if (backendFieldErrors && typeof backendFieldErrors === 'object') {
        Object.entries(backendFieldErrors).forEach(([field, msg]) => {
          if (field === 'adjustmentPercent') {
            newServerErrors.adjustmentPercent = msg;
          } else if (field === 'startDate' || field === 'endDate') {
            newServerErrors.dateRange = msg;
          } else {
            newServerErrors[field] = msg;
          }
        });
      }

      // Lỗi phần trăm điều chỉnh từ message hoặc 400 Bad Request
      if (
        !newServerErrors.adjustmentPercent &&
        (status === 400 || status === 422) &&
        (errorMsg.includes('Phần trăm điều chỉnh phải khác 0') ||
          errorMsg.toLowerCase().includes('tỷ lệ') ||
          errorMsg.toLowerCase().includes('phần trăm') ||
          errorMsg.toLowerCase().includes('khác 0') ||
          errorMsg.toLowerCase().includes('percent') ||
          errorMsg.toLowerCase().includes('adjustment'))
      ) {
        newServerErrors.adjustmentPercent = errorMsg || 'Phần trăm điều chỉnh phải khác 0';
      }

      if (Object.keys(newServerErrors).length > 0) {
        setServerErrors(newServerErrors);
      } else {
        setServerErrors({ general: errorMsg || 'Có lỗi xảy ra khi lưu quy tắc giá.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl border border-stone-200 my-8 animate-scale-up">
        {/* Header */}
        <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0E1524] text-white flex items-center justify-center shadow-xs">
              <BadgePercent size={18} />
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-[0.2em] text-amber-800 uppercase block">
                CẤU HÌNH GIÁ LINH HOẠT • YIELD MANAGEMENT
              </span>
              <h3 className="font-serif text-xl font-bold text-stone-900">
                {isEditing ? 'Cập Nhật Quy Tắc Giá' : 'Thêm Quy Tắc Giá Mới'}
              </h3>
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="w-9 h-9 rounded-full hover:bg-stone-200 text-stone-400 hover:text-stone-700 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Server General Error */}
        {serverErrors.general && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle size={15} className="shrink-0 text-rose-600" />
            <span>{serverErrors.general}</span>
          </div>
        )}

        {/* Form */}
        <form noValidate onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* 1. Tên quy tắc */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Tên quy tắc định giá <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              maxLength={50}
              placeholder="Ví dụ: Phụ thu Cuối tuần Mùa hè 2026, Giảm giá Mùa thấp điểm... (tối đa 50 ký tự)"
              value={formData.name}
              onChange={(e) => {
                setFormData({ ...formData, name: e.target.value });
                if (errors.name) setErrors({ ...errors, name: null });
                if (serverErrors.name) setServerErrors({ ...serverErrors, name: null });
              }}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-bold focus:outline-none transition-colors ${
                errors.name || serverErrors.name
                  ? 'border-rose-400 bg-rose-50/30 focus:border-rose-600'
                  : 'border-stone-300 focus:border-stone-900'
              }`}
            />
            {(errors.name || serverErrors.name) && (
              <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
                <AlertCircle size={12} />
                <span>{serverErrors.name || errors.name}</span>
              </p>
            )}
          </div>

          {/* 2. Loại quy tắc */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Loại quy tắc áp dụng
            </label>
            <select
              value={formData.ruleType}
              onChange={(e) => setFormData({ ...formData, ruleType: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-medium focus:outline-none focus:border-stone-900 bg-white"
            >
              <option value="WEEKEND">WEEKEND - Cuối tuần (Thứ Sáu, Thứ Bảy, Chủ Nhật)</option>
              <option value="HOLIDAY">HOLIDAY - Dịp Lễ Tết (30/4, 1/5, Quốc Khánh, Tết Nguyên Đán)</option>
              <option value="PEAK_SEASON">PEAK_SEASON - Mùa cao điểm du lịch</option>
            </select>
          </div>

          {/* 3. Khoảng ngày áp dụng (Từ ngày -> Đến ngày) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5 flex items-center gap-1">
                <Calendar size={13} className="text-stone-500" />
                <span>Từ ngày <span className="text-rose-500">*</span></span>
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => {
                  setFormData({ ...formData, startDate: e.target.value });
                  if (errors.startDate) setErrors({ ...errors, startDate: null });
                  if (errors.dateRange) setErrors({ ...errors, dateRange: null });
                  if (serverErrors.dateRange) setServerErrors({ ...serverErrors, dateRange: null });
                }}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none transition-colors ${
                  errors.startDate || errors.dateRange || serverErrors.dateRange
                    ? 'border-rose-400 bg-rose-50/30 focus:border-rose-600'
                    : 'border-stone-300 focus:border-stone-900'
                }`}
              />
              {errors.startDate && (
                <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle size={12} />
                  <span>{errors.startDate}</span>
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5 flex items-center gap-1">
                <Calendar size={13} className="text-stone-500" />
                <span>Đến ngày <span className="text-rose-500">*</span></span>
              </label>
              <input
                type="date"
                min={formData.startDate || undefined}
                value={formData.endDate}
                onChange={(e) => {
                  setFormData({ ...formData, endDate: e.target.value });
                  if (errors.endDate) setErrors({ ...errors, endDate: null });
                  if (errors.dateRange) setErrors({ ...errors, dateRange: null });
                  if (serverErrors.dateRange) setServerErrors({ ...serverErrors, dateRange: null });
                }}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none transition-colors ${
                  errors.endDate || errors.dateRange || serverErrors.dateRange
                    ? 'border-rose-400 bg-rose-50/30 focus:border-rose-600'
                    : 'border-stone-300 focus:border-stone-900'
                }`}
              />
              {errors.endDate && (
                <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
                  <AlertCircle size={12} />
                  <span>{errors.endDate}</span>
                </p>
              )}
            </div>
          </div>

          {/* Lỗi khoảng thời gian hoặc trùng lặp (Server 409 hoặc Client) */}
          {(errors.dateRange || serverErrors.dateRange) && (
            <p className="text-[11px] text-rose-600 -mt-2 flex items-center gap-1.5 font-medium bg-rose-50 p-2.5 rounded-xl border border-rose-200">
              <AlertCircle size={14} className="shrink-0" />
              <span>{serverErrors.dateRange || errors.dateRange}</span>
            </p>
          )}

          {/* 4. Tỷ lệ điều chỉnh (%) (adjustmentPercent) */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Percent size={13} className="text-stone-500" />
                <span>Tỷ lệ điều chỉnh (%) <span className="text-rose-500">*</span></span>
              </span>
              <span className="text-[11px] font-normal text-stone-500 italic">
                Số âm = giảm giá (VD: -15% giảm, 20% tăng, khác 0)
              </span>
            </label>
            <div className="relative">
              <input
                type="number"
                step="any"
                placeholder="Ví dụ: 20 hoặc -10"
                value={formData.adjustmentPercent}
                onChange={(e) => {
                  setFormData({ ...formData, adjustmentPercent: e.target.value });
                  if (errors.adjustmentPercent) {
                    setErrors({ ...errors, adjustmentPercent: null });
                  }
                  if (serverErrors.adjustmentPercent) {
                    setServerErrors({ ...serverErrors, adjustmentPercent: null });
                  }
                }}
                className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-bold focus:outline-none transition-colors ${
                  errors.adjustmentPercent || serverErrors.adjustmentPercent
                    ? 'border-rose-400 bg-rose-50/30 focus:border-rose-600'
                    : 'border-stone-300 focus:border-stone-900'
                }`}
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-stone-400">
                %
              </span>
            </div>

            {/* Bắt lỗi tỷ lệ từ Server hoặc Client: hiện chữ đỏ dưới ô % */}
            {(errors.adjustmentPercent || serverErrors.adjustmentPercent) && (
              <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
                <AlertCircle size={12} />
                <span>{serverErrors.adjustmentPercent || errors.adjustmentPercent}</span>
              </p>
            )}

            <div className="mt-1.5 text-[11px] text-stone-500">
              {Number(formData.adjustmentPercent) > 0 ? (
                <span className="text-rose-600 font-semibold">
                  Tăng +{formData.adjustmentPercent}% so với giá cơ bản
                </span>
              ) : Number(formData.adjustmentPercent) < 0 ? (
                <span className="text-emerald-600 font-semibold">
                  Giảm {Math.abs(Number(formData.adjustmentPercent))}% so với giá cơ bản
                </span>
              ) : (
                <span className="text-rose-600 font-semibold">
                  Phần trăm điều chỉnh phải khác 0%
                </span>
              )}
            </div>
          </div>

          {/* 5. Dropdown Loại phòng áp dụng (Lựa chọn "Tất cả loại phòng" gửi categoryId: null) */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Loại phòng áp dụng
            </label>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-medium focus:outline-none focus:border-stone-900 bg-white"
            >
              <option value="">Tất cả loại phòng (Áp dụng toàn bộ hệ thống)</option>
              {roomCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} ({cat.code || `ID:${cat.id}`})
                </option>
              ))}
            </select>
          </div>

          {/* 6. Checkbox Kích hoạt */}
          <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-stone-800">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                className="rounded border-stone-300 text-black focus:ring-black w-4 h-4 cursor-pointer"
              />
              <span>Kích hoạt quy tắc giá này ngay sau khi lưu</span>
            </label>
            <p className="text-[11px] text-stone-500 ml-6.5 mt-0.5">
              Khi được kích hoạt, khách hàng đặt phòng trong khoảng thời gian này sẽ tự động nhận đơn giá mới.
            </p>
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-stone-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-full border border-stone-200 text-xs font-semibold text-stone-600 hover:bg-stone-50 cursor-pointer disabled:opacity-50"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 rounded-full bg-black text-white text-xs font-semibold hover:bg-stone-800 cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  <span>Đang lưu...</span>
                </>
              ) : (
                <span>{isEditing ? 'Lưu thay đổi' : 'Lưu quy tắc giá'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPricingRuleModal;
