import React, { useState, useEffect } from 'react';
import {
  X,
  Key,
  Layers,
  Sparkles,
  ShieldCheck,
  Compass,
  BedDouble,
  Radio,
  AlertCircle,
} from 'lucide-react';
import { validateSafeText, detectMaliciousCode } from '../../utils/sanitize';

export const AddRoomModal = ({
  isOpen,
  onClose,
  onAddRoom,
  onSave,
  roomTypes = [],
  initialData = null,
}) => {
  const isEditing = Boolean(initialData?.id);

  const [formData, setFormData] = useState({
    roomNumber: '',
    roomTypeId: roomTypes[0]?.id || '',
    floor: 'Tầng 1',
    zone: 'Khu trung tâm',
    viewType: 'Hướng biển toàn cảnh (Oceanfront)',
    bedType: '01 Giường King Bed',
    status: 'AVAILABLE',
    rfidCode: 'RFID-' + Math.floor(100000 + Math.random() * 900000),
    amenities: ['Bồn tắm Jacuzzi ngắm biển', 'Smart TV 75 inch 4K'],
    notes: '',
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id,
        roomNumber: initialData.roomNumber || initialData.code || '',
        roomTypeId: initialData.roomTypeId || initialData.categoryId || (roomTypes[0]?.id || ''),
        floor: initialData.floor ? `Tầng ${initialData.floor}` : 'Tầng 1',
        zone: initialData.zone || 'Khu trung tâm',
        viewType: initialData.viewType || 'Hướng biển toàn cảnh (Oceanfront)',
        bedType: initialData.bedType || '01 Giường King Bed',
        status: initialData.status || 'AVAILABLE',
        rfidCode: initialData.rfidCode || ('RFID-' + Math.floor(100000 + Math.random() * 900000)),
        amenities: initialData.amenities || ['Bồn tắm Jacuzzi ngắm biển', 'Smart TV 75 inch 4K'],
        notes: initialData.notes || '',
      });
    } else {
      setFormData({
        roomNumber: '',
        roomTypeId: roomTypes[0]?.id || '',
        floor: 'Tầng 1',
        zone: 'Khu trung tâm',
        viewType: 'Hướng biển toàn cảnh (Oceanfront)',
        bedType: '01 Giường King Bed',
        status: 'AVAILABLE',
        rfidCode: 'RFID-' + Math.floor(100000 + Math.random() * 900000),
        amenities: ['Bồn tắm Jacuzzi ngắm biển', 'Smart TV 75 inch 4K'],
        notes: '',
      });
    }
    setErrors({});
  }, [initialData, isOpen, roomTypes]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};

    // 1. Số phòng: Bắt buộc, max 50 ký tự, chống mã độc
    const roomNumberErr = validateSafeText(formData.roomNumber, {
      fieldName: 'Số phòng',
      maxLength: 50,
      required: true,
    });
    if (roomNumberErr) newErrors.roomNumber = roomNumberErr;

    // 2. Thuộc loại phòng: Bắt buộc
    if (!formData.roomTypeId) {
      newErrors.roomTypeId = 'Vui lòng chọn loại phòng áp dụng.';
    }

    // 3. Mã thẻ từ (RFID): max 50 ký tự, chống mã độc
    const rfidErr = validateSafeText(formData.rfidCode, {
      fieldName: 'Mã thẻ từ (RFID)',
      maxLength: 50,
      required: false,
    });
    if (rfidErr) newErrors.rfidCode = rfidErr;

    // 4. Ghi chú: Chống mã độc
    if (formData.notes) {
      const notesMalware = detectMaliciousCode(formData.notes);
      if (notesMalware.hasMalware) {
        newErrors.notes = `Ghi chú chứa mã độc hoặc ký tự nguy hiểm (${notesMalware.reason}).`;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const selectedType = roomTypes.find((r) => String(r.id) === String(formData.roomTypeId)) || roomTypes[0];
    const floorNumber = parseInt(String(formData.floor).replace(/\D/g, ''), 10) || 1;
    const categoryIdNum = Number(selectedType?.id || formData.roomTypeId);

    const payload = {
      ...formData,
      roomNumber: formData.roomNumber.trim(),
      floor: floorNumber,
      roomTypeId: categoryIdNum,
      categoryId: categoryIdNum,
      roomTypeName: selectedType?.name || 'Hạng phòng cao cấp',
      roomTypeCode: selectedType?.code || 'RM-CAT',
    };

    setIsSubmitting(true);
    try {
      if (onSave) {
        await onSave(payload);
      } else if (onAddRoom) {
        await onAddRoom(payload);
      }
    } catch (err) {
      console.error('Lỗi khi gửi dữ liệu phòng:', err);
      const serverErrs = err?.errors || err?.response?.data?.errors;
      if (serverErrs && typeof serverErrs === 'object') {
        setErrors((prev) => ({ ...prev, ...serverErrs }));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl border border-stone-200 my-8 animate-scale-up">
        {/* Modal Header */}
        <div className="p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0E1524] text-white flex items-center justify-center shadow-xs">
              <Key size={18} />
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-[0.2em] text-amber-800 uppercase block">
                KHO PHÒNG VẬT LÝ • KHỞI TẠO ĐỊNH DANH
              </span>
              <h3 className="font-serif text-xl font-bold text-stone-900">
                {isEditing ? 'Cập Nhật Phòng Vật Lý' : 'Thêm Phòng Vật Lý Mới'}
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

        {/* Modal Body */}
        <form noValidate onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Section 1: Định danh & Phân loại */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3 flex items-center gap-2">
              <Key size={14} /> 1. Thông Tin Định Danh & Phân Loại Phòng
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Số phòng / Số cửa <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  maxLength={50}
                  placeholder="Ví dụ: P.101, Villa-01 (tối đa 50 ký tự)"
                  value={formData.roomNumber}
                  onChange={(e) => {
                    setFormData({ ...formData, roomNumber: e.target.value });
                    if (errors.roomNumber) setErrors({ ...errors, roomNumber: null });
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-bold focus:outline-none transition-colors ${
                    errors.roomNumber
                      ? 'border-rose-400 bg-rose-50/30 focus:border-rose-600'
                      : 'border-stone-300 focus:border-stone-900'
                  }`}
                />
                {errors.roomNumber && (
                  <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle size={12} />
                    <span>{errors.roomNumber}</span>
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Thuộc loại phòng tiêu chuẩn <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.roomTypeId}
                  onChange={(e) => {
                    setFormData({ ...formData, roomTypeId: e.target.value });
                    if (errors.roomTypeId) setErrors({ ...errors, roomTypeId: null });
                  }}
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none transition-colors bg-white ${
                    errors.roomTypeId
                      ? 'border-rose-400 bg-rose-50/30 focus:border-rose-600'
                      : 'border-stone-300 focus:border-stone-900'
                  }`}
                >
                  {roomTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name} ({type.code || `ID:${type.id}`})
                    </option>
                  ))}
                </select>
                {errors.roomTypeId && (
                  <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle size={12} />
                    <span>{errors.roomTypeId}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Vị trí & Không gian */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3 flex items-center gap-2">
              <Layers size={14} /> 2. Tầng & Vị Trí Cụm Không Gian
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Tầng lầu
                </label>
                <select
                  value={formData.floor}
                  onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-stone-900 bg-white"
                >
                  <option value="Tầng 1">Tầng 1 (Khu Trệt & Sân Vườn)</option>
                  <option value="Tầng 2">Tầng 2 (Khối phòng Deluxe)</option>
                  <option value="Tầng 3">Tầng 3 (Khối phòng Executive)</option>
                  <option value="Tầng 4">Tầng 4 (Suites & Panorama)</option>
                  <option value="Tầng 5">Tầng 5 (Penthouse & Sky Villa)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Khu vực / Tòa tháp
                </label>
                <select
                  value={formData.zone}
                  onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-stone-900 bg-white"
                >
                  <option value="Khu trung tâm">Tòa A - Khối Trung Tâm</option>
                  <option value="Khu Cánh Đông">Tòa B - Khối Cánh Đông Hướng Biển</option>
                  <option value="Khu Cánh Tây">Tòa C - Khối Cánh Tây Hoàng Hôn</option>
                  <option value="Khu Biệt Thự Biển">Khu Biệt Thự Biển (Villa Sanctuary)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Hướng nhìn, Giường & RFID */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3 flex items-center gap-2">
              <Compass size={14} /> 3. Đặc Điểm Phòng & Mã Thẻ Khóa
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Tầm nhìn (View)
                </label>
                <select
                  value={formData.viewType}
                  onChange={(e) => setFormData({ ...formData, viewType: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-stone-900 bg-white"
                >
                  <option value="Hướng biển toàn cảnh (Oceanfront)">Hướng biển toàn cảnh</option>
                  <option value="Hướng vườn nhiệt đới (Garden View)">Hướng vườn nhiệt đới</option>
                  <option value="Hướng hồ bơi vô cực (Pool View)">Hướng hồ bơi vô cực</option>
                  <option value="Hướng thành phố & Đồi núi (City View)">Hướng thành phố / Núi</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Cấu hình giường
                </label>
                <select
                  value={formData.bedType}
                  onChange={(e) => setFormData({ ...formData, bedType: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-stone-900 bg-white"
                >
                  <option value="01 Giường King Bed">01 Giường King Bed</option>
                  <option value="02 Giường Twin">02 Giường Twin</option>
                  <option value="01 Queen + 01 Sofa Bed">01 Queen + 01 Sofa Bed</option>
                  <option value="Master King + Twin">Master King + Twin</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Mã thẻ RFID
                </label>
                <input
                  type="text"
                  maxLength={50}
                  value={formData.rfidCode}
                  onChange={(e) => {
                    setFormData({ ...formData, rfidCode: e.target.value });
                    if (errors.rfidCode) setErrors({ ...errors, rfidCode: null });
                  }}
                  className={`w-full px-3 py-2.5 rounded-xl border text-xs font-mono focus:outline-none transition-colors ${
                    errors.rfidCode
                      ? 'border-rose-400 bg-rose-50/30 focus:border-rose-600'
                      : 'border-stone-300 focus:border-stone-900'
                  }`}
                  placeholder="RFID-000000"
                />
                {errors.rfidCode && (
                  <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle size={12} />
                    <span>{errors.rfidCode}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Section 4: Ghi chú vận hành */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Ghi chú nội bộ
            </label>
            <textarea
              rows="2"
              value={formData.notes}
              onChange={(e) => {
                setFormData({ ...formData, notes: e.target.value });
                if (errors.notes) setErrors({ ...errors, notes: null });
              }}
              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs focus:outline-none transition-colors ${
                errors.notes
                  ? 'border-rose-400 bg-rose-50/30 focus:border-rose-600'
                  : 'border-stone-300 focus:border-stone-900'
              }`}
              placeholder="Ghi chú thêm về trang thiết bị, tình trạng phòng..."
            ></textarea>
            {errors.notes && (
              <p className="text-[11px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
                <AlertCircle size={12} />
                <span>{errors.notes}</span>
              </p>
            )}
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
            <span className="text-[11px] text-stone-400">
              * Dữ liệu buồng phòng sẽ được đồng bộ trực tiếp vào hệ thống PMS.
            </span>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-full border border-stone-200 text-xs font-semibold text-stone-600 hover:bg-stone-50 cursor-pointer disabled:opacity-50"
              >
                Hủy
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
                  <span>{isEditing ? 'Lưu thay đổi' : 'Xác nhận tạo phòng'}</span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRoomModal;
