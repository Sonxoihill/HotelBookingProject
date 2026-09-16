import React, { useState } from 'react';
import {
  X,
  ConciergeBell,
  Coins,
  Clock,
  Wine,
  Utensils,
  Car,
  Sparkles,
  CheckCircle2,
  FileText,
  ShieldCheck,
} from 'lucide-react';
import { formatVND } from '../../utils/formatters';

export const AddServiceModal = ({ isOpen, onClose, onAddService }) => {
  const [formData, setFormData] = useState({
    name: '',
    sku: 'SRV-' + Math.floor(1000 + Math.random() * 9000),
    category: 'Minibar & Đồ uống cao cấp',
    unit: 'Chai / Lon',
    price: 450000,
    department: 'Bộ phận F&B & Quầy Bar',
    slaTime: 'Phục vụ ngay trong 15 phút',
    allowRoomCharge: true,
    includeTaxAndService: true,
    vipDiscountPercent: 15,
    status: 'ACTIVE',
    description: 'Sản phẩm / Dịch vụ tiêu chuẩn 5 sao phục vụ trực tiếp tại phòng hoặc khuôn viên khu nghỉ dưỡng.',
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    onAddService({
      ...formData,
      price: Number(formData.price),
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
              <ConciergeBell size={18} />
            </div>
            <div>
              <span className="text-[10px] font-bold tracking-[0.2em] text-amber-800 uppercase block">
                DANH MỤC TIỆN ÍCH • THỰC ĐƠN & DỊCH VỤ
              </span>
              <h3 className="font-serif text-xl font-bold text-stone-900">
                Thêm Dịch Vụ / Tiện Ích Mới
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
                Tên dịch vụ / Sản phẩm *
              </label>
              <input
                type="text"
                required
                placeholder="Ví dụ: Rượu Vang Chateau Margaux Grand Cru"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-bold focus:outline-none focus:border-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Mã SKU / Định danh
              </label>
              <input
                type="text"
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
                <option value="Giặt ủi & Chăm sóc trang phục">Giặt ủi & Chăm sóc trang phục lấy nhanh</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Đơn vị tính (Unit)
              </label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-stone-900 bg-white"
              >
                <option value="Chai / Lon">Chai / Lon</option>
                <option value="Set / Suất">Set / Suất</option>
                <option value="Liệu trình (90 Phút)">Liệu trình (90 Phút)</option>
                <option value="Chuyến 1 chiều">Chuyến 1 chiều</option>
                <option value="Chuyến khứ hồi">Chuyến khứ hồi</option>
                <option value="Bộ / Món">Bộ / Món</option>
              </select>
            </div>
          </div>

          {/* Section 3: Đơn giá & Chính sách thuế phí */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5 flex items-center gap-1.5">
                <Coins size={13} className="text-stone-500" />
                <span>Đơn giá niêm yết (VND) *</span>
              </label>
              <input
                type="number"
                step="50000"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-bold focus:outline-none focus:border-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Ưu đãi giảm giá VIP Black Diamond (%)
              </label>
              <input
                type="number"
                min="0"
                max="50"
                value={formData.vipDiscountPercent}
                onChange={(e) => setFormData({ ...formData, vipDiscountPercent: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-stone-900"
              />
            </div>
          </div>

          {/* Section 4: Bộ phận tiếp nhận & Thời gian SLA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Bộ phận điều phối & chuẩn bị
              </label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-stone-900 bg-white"
              >
                <option value="Bộ phận F&B & Quầy Bar">Bộ phận F&B & Quầy Bar</option>
                <option value="Bếp trưởng & Bếp phòng">Bếp trưởng & Bếp phòng</option>
                <option value="L'Étoile Spa & Trị liệu">L'Étoile Spa & Trị liệu</option>
                <option value="Đội xe & Concierge sân bay">Đội xe & Concierge sân bay</option>
                <option value="Buồng phòng & Giặt ủi">Buồng phòng & Giặt ủi</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5 flex items-center gap-1.5">
                <Clock size={13} className="text-stone-500" />
                <span>Thời gian chuẩn bị (SLA)</span>
              </label>
              <select
                value={formData.slaTime}
                onChange={(e) => setFormData({ ...formData, slaTime: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs focus:outline-none focus:border-stone-900 bg-white"
              >
                <option value="Phục vụ ngay trong 15 phút">Phục vụ ngay trong 15 phút</option>
                <option value="Báo trước 30 phút">Báo trước 30 phút</option>
                <option value="Báo trước 02 giờ">Báo trước 02 giờ</option>
                <option value="Đặt trước 24 giờ">Đặt trước 24 giờ</option>
              </select>
            </div>
          </div>

          {/* Checkbox Options */}
          <div className="space-y-2 p-3 bg-stone-50 rounded-2xl border border-stone-200/80">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-stone-700">
              <input
                type="checkbox"
                checked={formData.allowRoomCharge}
                onChange={(e) => setFormData({ ...formData, allowRoomCharge: e.target.checked })}
                className="rounded border-stone-300 text-black focus:ring-black w-4 h-4"
              />
              <span>Cho phép Lễ tân nạp trực tiếp vào Folio phòng (Room Charge) khi thanh toán trả phòng</span>
            </label>

            <label className="flex items-center gap-2.5 cursor-pointer text-xs font-medium text-stone-700">
              <input
                type="checkbox"
                checked={formData.includeTaxAndService}
                onChange={(e) => setFormData({ ...formData, includeTaxAndService: e.target.checked })}
                className="rounded border-stone-300 text-black focus:ring-black w-4 h-4"
              />
              <span>Đơn giá đã bao gồm 5% Phí dịch vụ (SVC) & 8% Thuế VAT</span>
            </label>
          </div>

          {/* Mô tả dịch vụ */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Mô tả chi tiết sản phẩm / tiêu chuẩn phục vụ
            </label>
            <textarea
              rows="2"
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
              Lưu dịch vụ vào hệ thống
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddServiceModal;
