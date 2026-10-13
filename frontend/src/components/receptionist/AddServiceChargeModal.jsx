import React, { useState } from 'react';
import {
  X,
  Plus,
  Coins,
  Receipt,
  BedDouble,
  CheckCircle2,
  Coffee,
  Sparkles,
  Car,
  Utensils,
} from 'lucide-react';
import { formatVND } from '../../utils/formatters';

export const AddServiceChargeModal = ({ isOpen, onClose, onAddService }) => {
  const [selectedRoomCode, setSelectedRoomCode] = useState('P1201');
  const [category, setCategory] = useState('Minibar');
  const [selectedItemName, setSelectedItemName] = useState('Rượu vang Chateau Margaux Grand Cru');
  const [unitPrice, setUnitPrice] = useState(3800000);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('Khách dùng tại phòng Penthouse tối qua.');
  const [chargeToFolio, setChargeToFolio] = useState(true);

  // Available occupied rooms
  const occupiedRooms = [
    { code: 'P1201', guest: 'Đỗ Minh Quân', tier: 'Black Diamond VIP', room: 'Grand Celestial Penthouse' },
    { code: 'P1202', guest: 'Elena Rostova', tier: 'Platinum Member', room: 'Royal Sky Penthouse' },
    { code: 'S802', guest: 'Liam Vanderberg', tier: 'Executive Member', room: 'Ocean Horizon Suite' },
    { code: 'V101', guest: 'Trần Bảo Ngọc', tier: 'VIP Diamond', room: 'Garden Sanctuary Villa' },
    { code: 'V102', guest: 'Bùi Hoàng Long', tier: 'Gold Member', room: 'Garden Sanctuary Villa' },
  ];

  // Preset services catalog
  const serviceCatalog = {
    Minibar: [
      { name: 'Rượu vang Chateau Margaux Grand Cru', price: 3800000 },
      { name: 'Nước khoáng San Pellegrino 750ml (02 chai)', price: 240000 },
      { name: 'Bia Bỉ nhập khẩu Chimay Blue (02 chai)', price: 360000 },
      { name: 'Hạt macca Úc & Hạt điều sấy hữu cơ', price: 180000 },
      { name: 'Socola thủ công Marou cao cấp', price: 150000 },
    ],
    'In-room Dining': [
      { name: 'Set Bò Wagyu A5 sốt nấm Truffle phục vụ tại phòng', price: 2850000 },
      { name: 'Tháp hải sản hoàng gia La Mer tươi sống', price: 3200000 },
      { name: 'Bữa sáng Floating Breakfast tại hồ bơi riêng', price: 1450000 },
      { name: 'Tiệc trà chiều hoàng hôn phong cách Anh Quốc', price: 850000 },
    ],
    'Spa & Wellness': [
      { name: 'Liệu trình Massage đá nóng Thảo dược 90 phút', price: 2200000 },
      { name: 'Trị liệu bấm huyệt phục hồi năng lượng 60 phút', price: 1650000 },
      { name: 'Gói chăm sóc da mặt ngọc trai biển sâu 75 phút', price: 1950000 },
    ],
    'Đưa đón Maybach': [
      { name: 'Đưa đón sân bay Cam Ranh 1 chiều xe Maybach S680', price: 2500000 },
      { name: 'Tour tham quan vịnh biển nửa ngày có tài xế riêng', price: 4500000 },
    ],
    'Giặt là Laundry': [
      { name: 'Giặt hấp 01 bộ Âu phục cao cấp (Suit)', price: 350000 },
      { name: 'Giặt ủi đầm dạ hội lụa tơ tằm', price: 420000 },
      { name: 'Ủi phẳng khẩn cấp 30 phút', price: 200000 },
    ],
  };

  if (!isOpen) return null;

  const totalAmount = unitPrice * quantity;
  const currentRoom = occupiedRooms.find((r) => r.code === selectedRoomCode) || occupiedRooms[0];

  const handleCategoryChange = (newCat) => {
    setCategory(newCat);
    const firstItem = serviceCatalog[newCat][0];
    setSelectedItemName(firstItem.name);
    setUnitPrice(firstItem.price);
  };

  const handleItemChange = (itemName) => {
    setSelectedItemName(itemName);
    const item = serviceCatalog[category]?.find((i) => i.name === itemName);
    if (item) {
      setUnitPrice(item.price);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newRecord = {
      id: `SRV-${Math.floor(1000 + Math.random() * 9000)}`,
      time: 'Vừa xong',
      roomCode: currentRoom.code,
      roomName: currentRoom.room,
      guestName: currentRoom.guest,
      guestTier: currentRoom.tier,
      category,
      serviceName: selectedItemName,
      unitPrice,
      quantity,
      totalAmount,
      status: chargeToFolio ? 'FOLIO_CHARGED' : 'PAID_DIRECT',
      statusLabel: chargeToFolio ? 'Đã nạp vào Folio' : 'Đã thanh toán ngay',
      notes,
    };

    if (onAddService) {
      onAddService(newRecord);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 select-none">
      <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/60">
          <div className="space-y-0.5">
            <h3 className="font-serif text-xl font-semibold text-stone-900 flex items-center gap-2">
              <Coins size={18} className="text-[#C59D5F]" />
              <span>Ghi nhận Dịch vụ & Tiêu thụ Minibar</span>
            </h3>
            <p className="text-xs text-stone-500 font-light">
              Nạp dịch vụ phát sinh trực tiếp vào hóa đơn (Folio) phòng khách đang lưu trú.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full hover:bg-stone-200 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* 1. Chọn phòng đang có khách */}
          <div className="space-y-1.5">
            <label className="font-semibold text-stone-800 flex items-center gap-1.5">
              <BedDouble size={14} className="text-[#C59D5F]" />
              <span>Phòng khách hàng áp dụng phí *</span>
            </label>
            <select
              value={selectedRoomCode}
              onChange={(e) => setSelectedRoomCode(e.target.value)}
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-stone-900 font-semibold focus:outline-none focus:border-stone-400"
            >
              {occupiedRooms.map((r) => (
                <option key={r.code} value={r.code}>
                  Phòng {r.code} — {r.guest} ({r.tier}) • {r.room}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Danh mục dịch vụ */}
          <div className="space-y-2">
            <label className="font-semibold text-stone-800">
              Phân loại nhóm dịch vụ
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {Object.keys(serviceCatalog).map((catName) => (
                <button
                  key={catName}
                  type="button"
                  onClick={() => handleCategoryChange(catName)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium border text-left transition-all cursor-pointer ${
                    category === catName
                      ? 'bg-black text-white border-black shadow-2xs font-semibold'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                  }`}
                >
                  {catName}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Chi tiết dịch vụ / mặt hàng & Số lượng */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="font-semibold text-stone-800">
                Chi tiết dịch vụ / Mặt hàng Minibar *
              </label>
              <select
                value={selectedItemName}
                onChange={(e) => handleItemChange(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-stone-900 focus:outline-none focus:border-stone-400"
              >
                {serviceCatalog[category]?.map((item) => (
                  <option key={item.name} value={item.name}>
                    {item.name} ({formatVND(item.price)})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-stone-800">Số lượng</label>
              <input
                type="number"
                min="1"
                max="50"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2.5 text-stone-900 font-bold focus:outline-none focus:border-stone-400"
              />
            </div>
          </div>

          {/* Ghi chú */}
          <div className="space-y-1.5">
            <label className="font-semibold text-stone-800">Ghi chú thêm</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ghi chú người báo hoặc khung giờ sử dụng..."
              className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-stone-900 focus:outline-none focus:border-stone-400"
            />
          </div>

          {/* Bảng tính tổng tiền & Phương thức nạp Folio */}
          <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] text-stone-500 block">
                  Đơn giá: {formatVND(unitPrice)} × {quantity}
                </span>
                <span className="font-bold text-stone-900 text-sm">
                  Tổng tiền dịch vụ
                </span>
              </div>
              <span className="font-serif text-2xl font-bold text-stone-900">
                {formatVND(totalAmount)}
              </span>
            </div>

            <div className="pt-2 border-t border-stone-200 flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={chargeToFolio}
                  onChange={(e) => setChargeToFolio(e.target.checked)}
                  className="rounded text-black focus:ring-0 w-4 h-4 cursor-pointer accent-black"
                />
                <span className="text-xs font-semibold text-stone-800">
                  Tự động nạp vào hóa đơn tạm tính (Folio) phòng {currentRoom.code}
                </span>
              </label>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-2 border-t border-stone-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full border border-stone-200 hover:bg-stone-100 text-stone-600 font-medium transition-colors cursor-pointer"
            >
              Hủy
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-black hover:bg-stone-800 text-white font-semibold shadow-md transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle2 size={15} />
              <span>Xác nhận nạp dịch vụ</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddServiceChargeModal;
