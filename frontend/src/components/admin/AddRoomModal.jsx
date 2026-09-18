import React, { useState } from 'react';
import {
  X,
  Hotel,
  Key,
  Layers,
  Compass,
  BedDouble,
  Users,
  Wifi,
  Tv,
  Coffee,
  Sparkles,
  Bath,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';

export const AddRoomModal = ({ isOpen, onClose, onAddRoom, roomTypes = [] }) => {
  const [formData, setFormData] = useState({
    roomNumber: '',
    roomTypeId: roomTypes[0]?.id || 1,
    floor: 'Tầng 12',
    zone: 'Khu Penthouse & Suites',
    viewType: 'Hướng biển toàn cảnh (Oceanfront)',
    bedType: '01 Giường King Bed 2.0m x 2.2m',
    allowExtraBed: true,
    initialStatus: 'AVAILABLE',
    rfidCode: 'RFID-' + Math.floor(100000 + Math.random() * 900000),
    amenities: ['Bồn tắm Jacuzzi ngắm biển', 'Smart TV 75 inch 4K', 'Máy pha cà phê Nespresso', 'Ban công Panorama'],
    notes: 'Phòng đã hoàn tất kiểm tra nghiệm thu bàn giao.',
  });

  if (!isOpen) return null;

  const AVAILABLE_AMENITIES = [
    'Bồn tắm Jacuzzi ngắm biển',
    'Hồ bơi vô cực riêng',
    'Smart TV 75 inch 4K',
    'Máy pha cà phê Nespresso',
    'Két sắt điện tử chống cháy',
    'Ban công Panorama đón gió',
    'Rượu vang đón khách & Trái cây',
    'Quản gia riêng Butler 24/7',
  ];

  const toggleAmenity = (item) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(item)
        ? prev.amenities.filter((a) => a !== item)
        : [...prev.amenities, item],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.roomNumber.trim()) return;

    const selectedType = roomTypes.find((r) => r.id === Number(formData.roomTypeId)) || roomTypes[0];

    onAddRoom({
      ...formData,
      roomTypeName: selectedType?.name || 'Hạng phòng cao cấp',
      roomTypeCode: selectedType?.code || 'PNT-GCP-01',
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
              <Key size={18} />
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-[0.2em] text-amber-800 uppercase block">
                KHO PHÒNG VẬT LÝ • KHỞI TẠO ĐỊNH DANH
              </span>
              <h3 className="font-serif text-xl font-bold text-stone-900">
                Thêm Phòng Vật Lý Mới
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
          {/* Section 1: Định danh & Phân nhóm */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3 flex items-center gap-2">
              <Hotel size={14} className="text-stone-600" />
              <span>1. Thông tin định danh & Vị trí phòng</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Số phòng định danh *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: P1205, V107"
                  value={formData.roomNumber}
                  onChange={(e) => setFormData({ ...formData, roomNumber: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-bold focus:outline-none focus:border-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Thuộc loại phòng *
                </label>
                <select
                  value={formData.roomTypeId}
                  onChange={(e) => setFormData({ ...formData, roomTypeId: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-stone-900 bg-white"
                >
                  {roomTypes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Vị trí Tầng / Khuôn viên *
                </label>
                <select
                  value={formData.floor}
                  onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-stone-900 bg-white"
                >
                  <option value="Tầng 12">Tầng 12 (Sky Penthouse)</option>
                  <option value="Tầng 8">Tầng 8 (Ocean Suites)</option>
                  <option value="Tầng 5">Tầng 5 (Deluxe Wings)</option>
                  <option value="Tầng 3">Tầng 3 (Deluxe Wings)</option>
                  <option value="Tầng Trệt">Tầng Trệt (Khu Biệt thự Villa)</option>
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
                  <span>Mã thẻ từ khóa cửa thông minh (RFID)</span>
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

          {/* Section 2: Cấu hình giường & Trạng thái khởi tạo */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3 flex items-center gap-2">
              <BedDouble size={14} className="text-stone-600" />
              <span>2. Cấu hình giường & Tiêu chuẩn vận hành</span>
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
                  <option value="01 Giường King Bed 2.0m x 2.2m">01 Giường King Bed (2.0m x 2.2m)</option>
                  <option value="02 Giường Twin Beds 1.2m x 2.0m">02 Giường Twin Beds (1.2m x 2.0m)</option>
                  <option value="01 Super King 2.2m x 2.4m + 01 Sofa Bed">01 Super King + 01 Sofa Bed cao cấp</option>
                  <option value="02 Giường King Master Suites">02 Giường King Master Suites</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Trạng thái khởi tạo đưa vào PMS
                </label>
                <select
                  value={formData.initialStatus}
                  onChange={(e) => setFormData({ ...formData, initialStatus: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-stone-900 bg-white"
                >
                  <option value="AVAILABLE">Sẵn sàng đón khách (Clean & Ready)</option>
                  <option value="CLEANING">Đang vệ sinh / kiểm tra buồng</option>
                  <option value="MAINTENANCE">Bảo trì kỹ thuật (Out of Order)</option>
                </select>
              </div>
            </div>

            <div className="mt-3.5">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-stone-700">
                <input
                  type="checkbox"
                  checked={formData.allowExtraBed}
                  onChange={(e) => setFormData({ ...formData, allowExtraBed: e.target.checked })}
                  className="rounded border-stone-300 text-black focus:ring-black w-4 h-4"
                />
                <span>Cho phép kê thêm giường phụ (Extra Bed) khi khách yêu cầu (+850.000đ/đêm)</span>
              </label>
            </div>
          </div>

          {/* Section 3: Trang thiết bị & Tiện nghi phòng */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-2 flex items-center gap-2">
              <Sparkles size={14} className="text-amber-700" />
              <span>3. Trang thiết bị & Tiện nghi tiêu chuẩn</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
              {AVAILABLE_AMENITIES.map((amenity) => {
                const isSelected = formData.amenities.includes(amenity);
                return (
                  <button
                    type="button"
                    key={amenity}
                    onClick={() => toggleAmenity(amenity)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl text-xs font-medium border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#FAF5EE] text-amber-950 border-amber-300 font-semibold'
                        : 'bg-stone-50/70 text-stone-600 border-stone-200/80 hover:bg-stone-100'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${
                        isSelected ? 'bg-amber-800 text-white' : 'border border-stone-300'
                      }`}
                    >
                      {isSelected && <CheckCircle2 size={12} />}
                    </div>
                    <span className="truncate">{amenity}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 4: Ghi chú bàn giao */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Ghi chú nghiệp vụ / Kiểm toán phòng
            </label>
            <textarea
              rows="2"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-stone-900"
              placeholder="Ghi chú thêm về thiết bị, vật tư phòng..."
            ></textarea>
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
            <span className="text-[11px] text-stone-400">
              * Phòng mới sẽ hiển thị ngay trên sơ đồ Rack & Buồng phòng.
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
                Xác nhận tạo phòng
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRoomModal;
