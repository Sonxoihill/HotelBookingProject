import React, { useState, useEffect } from 'react';
import {
  X,
  Hotel,
  Key,
  Layers,
  Compass,
  BedDouble,
  Sparkles,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

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

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id,
        roomNumber: initialData.roomNumber || initialData.code || '',
        roomTypeId: initialData.roomTypeId || initialData.categoryId || (roomTypes[0]?.id || ''),
        floor: initialData.floor ? (String(initialData.floor).startsWith('Tầng') ? initialData.floor : `Tầng ${initialData.floor}`) : 'Tầng 1',
        zone: initialData.zone || 'Khu trung tâm',
        viewType: initialData.viewType || 'Hướng biển toàn cảnh (Oceanfront)',
        bedType: initialData.bedType || '01 Giường King Bed',
        status: ['AVAILABLE', 'DIRTY', 'MAINTENANCE'].includes(initialData.status) ? initialData.status : 'AVAILABLE',
        rfidCode: initialData.rfidCode || ('RFID-' + Math.floor(100000 + Math.random() * 900000)),
        amenities: Array.isArray(initialData.amenities) ? initialData.amenities : ['Bồn tắm Jacuzzi ngắm biển'],
        notes: initialData.notes || initialData.specialNotes || '',
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
    if (!formData.roomNumber?.trim()) {
      newErrors.roomNumber = 'Số phòng định danh không được để trống.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const selectedType = roomTypes.find((r) => String(r.id) === String(formData.roomTypeId)) || roomTypes[0];
    const floorNumber = parseInt(String(formData.floor).replace(/\D/g, ''), 10) || 1;

    const payload = {
      ...formData,
      roomNumber: formData.roomNumber.trim(),
      floor: floorNumber,
      roomTypeId: selectedType?.id || formData.roomTypeId,
      categoryId: selectedType?.id || formData.roomTypeId,
      roomTypeName: selectedType?.name || 'Hạng phòng cao cấp',
      roomTypeCode: selectedType?.code || 'RM-CAT',
    };

    if (onSave) {
      onSave(payload);
    } else if (onAddRoom) {
      onAddRoom(payload);
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
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Section 1: Định danh & Phân loại */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3 flex items-center gap-2">
              <Hotel size={14} className="text-stone-600" />
              <span>1. Thông tin định danh & Vị trí phòng</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Số phòng định danh <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: 101, 201, P1205"
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
                  Thuộc loại phòng <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.roomTypeId}
                  onChange={(e) => setFormData({ ...formData, roomTypeId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-stone-900 bg-white"
                >
                  {roomTypes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.code || `ID:${t.id}`})
                    </option>
                  ))}
                  {roomTypes.length === 0 && (
                    <option value="">Chưa có loại phòng</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Vị trí Tầng <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.floor}
                  onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-stone-900 bg-white"
                >
                  <option value="Tầng 1">Tầng 1</option>
                  <option value="Tầng 2">Tầng 2</option>
                  <option value="Tầng 3">Tầng 3</option>
                  <option value="Tầng 4">Tầng 4</option>
                  <option value="Tầng 5">Tầng 5</option>
                  <option value="Tầng 6">Tầng 6</option>
                  <option value="Tầng 7">Tầng 7</option>
                  <option value="Tầng 8">Tầng 8</option>
                  <option value="Tầng 9">Tầng 9</option>
                  <option value="Tầng 10">Tầng 10</option>
                  <option value="Tầng 11">Tầng 11</option>
                  <option value="Tầng 12">Tầng 12</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-3.5">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5 flex items-center gap-1.5">
                  <Compass size={13} className="text-stone-500" />
                  <span>Tầm nhìn (View Type)</span>
                </label>
                <select
                  value={formData.viewType}
                  onChange={(e) => setFormData({ ...formData, viewType: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-stone-900 bg-white"
                >
                  <option value="Hướng biển toàn cảnh (Oceanfront)">Hướng biển toàn cảnh (Oceanfront)</option>
                  <option value="Hướng vườn thiền & Hồ bơi (Garden Sanctuary)">Hướng vườn thiền & Hồ bơi (Garden Sanctuary)</option>
                  <option value="Hướng đồi thông lộng gió (Pine Forest)">Hướng đồi thông lộng gió (Pine Forest)</option>
                  <option value="Hướng thành phố biển (City Panoramic)">Hướng thành phố biển (City Panoramic)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5 flex items-center gap-1.5">
                  <Key size={13} className="text-stone-500" />
                  <span>Mã thẻ từ khóa cửa (RFID)</span>
                </label>
                <input
                  type="text"
                  value={formData.rfidCode}
                  onChange={(e) => setFormData({ ...formData, rfidCode: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-mono focus:outline-none focus:border-stone-900"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Trạng thái & Giường */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3 flex items-center gap-2">
              <BedDouble size={14} className="text-stone-600" />
              <span>2. Cấu hình vận hành & Trạng thái phòng</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Quy cách giường chính
                </label>
                <select
                  value={formData.bedType}
                  onChange={(e) => setFormData({ ...formData, bedType: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-stone-900 bg-white"
                >
                  <option value="01 Giường King Bed">01 Giường King Bed</option>
                  <option value="02 Giường Twin Beds">02 Giường Twin Beds</option>
                  <option value="01 Super King + 01 Sofa Bed">01 Super King + 01 Sofa Bed</option>
                  <option value="02 Giường King Master">02 Giường King Master</option>
                </select>
              </div>

              {/* DROPDOWN TRẠNG THÁI: Chỉ hiển thị 3 lựa chọn AVAILABLE, DIRTY, MAINTENANCE */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Trạng thái vận hành <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-semibold focus:outline-none focus:border-stone-900 bg-white"
                >
                  <option value="AVAILABLE">AVAILABLE - Sẵn sàng đón khách</option>
                  <option value="DIRTY">DIRTY - Cần dọn dẹp</option>
                  <option value="MAINTENANCE">MAINTENANCE - Bảo trì kỹ thuật</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Ghi chú */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Ghi chú nghiệp vụ / Kiểm toán buồng phòng
            </label>
            <textarea
              rows="2"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-stone-900"
              placeholder="Ghi chú thêm về trang thiết bị, tình trạng phòng..."
            ></textarea>
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
                className="px-4 py-2 rounded-full border border-stone-200 text-xs font-semibold text-stone-600 hover:bg-stone-50 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-6 py-2 rounded-full bg-black text-white text-xs font-semibold hover:bg-stone-800 cursor-pointer shadow-xs"
              >
                {isEditing ? 'Lưu thay đổi' : 'Xác nhận tạo phòng'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRoomModal;
