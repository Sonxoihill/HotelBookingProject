import React, { useState } from 'react';
import {
  X,
  User,
  CreditCard,
  BedDouble,
  CheckCircle2,
} from 'lucide-react';
import { formatVND } from '../../utils/formatters';

export const NewBookingModal = ({ isOpen, onClose, onCreateBooking }) => {
  // Form state
  const [formData, setFormData] = useState({
    guestName: '',
    phone: '',
    email: '',
    idCard: '',
    membership: 'Khách vãng lai',
    roomCategory: 'Grand Oceanfront Penthouse',
    roomNumber: 'P1204',
    checkIn: '2026-10-18',
    checkOut: '2026-10-21',
    guestsCount: '2 người lớn',
    source: 'Walk-in',
    pricePerNight: 12500000,
    paymentStatus: 'Đã thanh toán 100%',
    paymentMethod: 'Thẻ tín dụng / POS',
    specialNotes: 'Khách yêu cầu phòng tầng cao, view biển thoáng đãng.',
    includeBreakfast: true,
    includeShuttle: false,
  });

  const roomOptions = [
    {
      category: 'Grand Oceanfront Penthouse',
      rooms: [
        { number: 'P1204', name: 'Lunar Summit (Tầng 12 - Trống)', price: 18500000 },
      ],
    },
    {
      category: 'Ocean Horizon Suite',
      rooms: [
        { number: 'S801', name: 'Ocean Horizon S801 (Tầng 8 - Trống)', price: 12200000 },
      ],
    },
    {
      category: 'Boutique Garden Villa',
      rooms: [
        { number: 'V103', name: 'Garden Sanctuary V103 (Trệt - Trống)', price: 14800000 },
      ],
    },
    {
      category: 'Deluxe Pine Forest View',
      rooms: [
        { number: 'D0509', name: 'Deluxe D0509 (Tầng 5 - Trống)', price: 8500000 },
      ],
    },
  ];

  if (!isOpen) return null;

  // Calculate nights
  const calculateNights = () => {
    if (!formData.checkIn || !formData.checkOut) return 1;
    const start = new Date(formData.checkIn);
    const end = new Date(formData.checkOut);
    const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  };

  const nights = calculateNights();
  const totalAmount = formData.pricePerNight * nights;

  const handleChange = (field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };

      // Auto update price when room number changes
      if (field === 'roomNumber') {
        for (const cat of roomOptions) {
          const matched = cat.rooms.find((r) => r.number === value);
          if (matched) {
            updated.pricePerNight = matched.price;
            updated.roomCategory = cat.category;
            break;
          }
        }
      }
      return updated;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.guestName.trim()) return;

    const newBooking = {
      id: `LET-${Math.floor(1000 + Math.random() * 9000)}`,
      source: formData.source,
      guestName: formData.guestName,
      membership: formData.membership,
      membershipColor:
        formData.membership.includes('Black Diamond')
          ? 'text-[#C59D5F]'
          : formData.membership.includes('Gold')
          ? 'text-[#B89355]'
          : 'text-stone-500',
      roomName: formData.roomCategory,
      roomDetail: `Phòng ${formData.roomNumber}`,
      dates: `${formData.checkIn} → ${formData.checkOut}`,
      duration: `${nights} đêm • ${formData.guestsCount}`,
      status:
        formData.paymentStatus === 'Đã thanh toán 100%'
          ? 'CHECK_IN_PENDING'
          : 'OCCUPIED',
      statusLabel:
        formData.paymentStatus === 'Đã thanh toán 100%'
          ? 'Chờ Check-in'
          : 'Đang ở',
      statusVariant:
        formData.paymentStatus === 'Đã thanh toán 100%' ? 'sand' : 'red',
      paymentNote: formData.paymentStatus,
      category: 'Hôm nay đến',
      actionType:
        formData.paymentStatus === 'Đã thanh toán 100%' ? 'CHECK_IN' : 'DETAILS',
    };

    if (onCreateBooking) {
      onCreateBooking(newBooking);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 select-none">
      <div className="bg-white rounded-3xl border border-stone-200 shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/60">
          <div className="space-y-0.5">
            <h3 className="font-serif text-xl font-semibold text-stone-900 flex items-center gap-2">
              <span>Tạo đơn đặt phòng mới (Reservation)</span>
            </h3>
            <p className="text-xs text-stone-500 font-light">
              Nhập thông tin khách hàng, chọn phòng khả dụng và ghi nhận thanh toán quầy.
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

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* 1. THÔNG TIN KHÁCH HÀNG */}
          <div className="space-y-3">
            <h4 className="font-bold text-stone-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5 border-b border-stone-100 pb-1.5">
              <User size={14} className="text-[#C59D5F]" />
              <span>1. Thông tin khách hàng</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label className="font-semibold text-stone-700">Họ và tên khách *</label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nguyễn Văn An"
                  value={formData.guestName}
                  onChange={(e) => handleChange('guestName', e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:border-stone-400"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700">Số điện thoại *</label>
                <input
                  type="tel"
                  required
                  placeholder="0912 345 678"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:border-stone-400"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700">Số CCCD / Hộ chiếu</label>
                <input
                  type="text"
                  placeholder="07920100xxxx"
                  value={formData.idCard}
                  onChange={(e) => handleChange('idCard', e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:border-stone-400"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700">Hạng hội viên L'Étoile</label>
                <select
                  value={formData.membership}
                  onChange={(e) => handleChange('membership', e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:border-stone-400"
                >
                  <option value="Khách vãng lai">Khách vãng lai</option>
                  <option value="Hội viên Thân thiết">Hội viên Thân thiết</option>
                  <option value="Gold Member">Gold Member</option>
                  <option value="Platinum Member">Platinum Member</option>
                  <option value="Hội viên Black Diamond">Hội viên Black Diamond (VIP)</option>
                </select>
              </div>
            </div>
          </div>

          {/* 2. CHỌN PHÒNG & THỜI GIAN LƯU TRÚ */}
          <div className="space-y-3">
            <h4 className="font-bold text-stone-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5 border-b border-stone-100 pb-1.5">
              <BedDouble size={14} className="text-[#C59D5F]" />
              <span>2. Chọn phòng & Lịch lưu trú</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label className="font-semibold text-stone-700">Số phòng chỉ định (Trống khả dụng) *</label>
                <select
                  value={formData.roomNumber}
                  onChange={(e) => handleChange('roomNumber', e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 font-semibold focus:outline-none focus:border-stone-400"
                >
                  {roomOptions.map((cat) => (
                    <optgroup key={cat.category} label={cat.category}>
                      {cat.rooms.map((r) => (
                        <option key={r.number} value={r.number}>
                          {r.number} - {r.name} ({formatVND(r.price)}/đêm)
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700">Số lượng khách</label>
                <select
                  value={formData.guestsCount}
                  onChange={(e) => handleChange('guestsCount', e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:border-stone-400"
                >
                  <option value="1 người lớn">1 người lớn</option>
                  <option value="2 người lớn">2 người lớn</option>
                  <option value="2 người lớn • 1 trẻ em">2 người lớn • 1 trẻ em</option>
                  <option value="3 người lớn">3 người lớn</option>
                  <option value="4 người lớn">4 người lớn</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700">Ngày nhận phòng (Check-in) *</label>
                <input
                  type="date"
                  required
                  value={formData.checkIn}
                  onChange={(e) => handleChange('checkIn', e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 font-mono focus:outline-none focus:border-stone-400"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700">Ngày trả phòng (Check-out) *</label>
                <input
                  type="date"
                  required
                  value={formData.checkOut}
                  onChange={(e) => handleChange('checkOut', e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 font-mono focus:outline-none focus:border-stone-400"
                />
              </div>
            </div>
          </div>

          {/* 3. THANH TOÁN & NGUỒN TIẾP NHẬN */}
          <div className="space-y-3">
            <h4 className="font-bold text-stone-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5 border-b border-stone-100 pb-1.5">
              <CreditCard size={14} className="text-[#C59D5F]" />
              <span>3. Thanh toán & Quyết toán</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="space-y-1">
                <label className="font-semibold text-stone-700">Nguồn đặt phòng</label>
                <select
                  value={formData.source}
                  onChange={(e) => handleChange('source', e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:border-stone-400"
                >
                  <option value="Walk-in">Khách Walk-in trực tiếp</option>
                  <option value="Hotline">Hotline Tổng đài</option>
                  <option value="Web Direct">Web Direct</option>
                  <option value="Doanh nghiệp">Khách Doanh nghiệp / Đối tác</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700">Trạng thái thanh toán</label>
                <select
                  value={formData.paymentStatus}
                  onChange={(e) => handleChange('paymentStatus', e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:border-stone-400"
                >
                  <option value="Đã thanh toán 100%">Đã thanh toán 100%</option>
                  <option value="Đặt cọc 50%">Đặt cọc 50%</option>
                  <option value="Thanh toán khi nhận phòng">Thanh toán khi nhận phòng</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-stone-700">Hình thức thanh toán</label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => handleChange('paymentMethod', e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-stone-900 focus:outline-none focus:border-stone-400"
                >
                  <option value="Thẻ tín dụng / POS">Thẻ tín dụng / POS</option>
                  <option value="Tiền mặt">Tiền mặt</option>
                  <option value="Chuyển khoản QR">Chuyển khoản QR ngân hàng</option>
                </select>
              </div>
            </div>

            {/* Bảng tạm tính giá */}
            <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200/80 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-stone-500 block">
                  Đơn giá: {formatVND(formData.pricePerNight)} × {nights} đêm
                </span>
                <span className="font-bold text-stone-900 text-sm">
                  Tổng tiền dự kiến
                </span>
              </div>
              <span className="font-serif text-xl font-bold text-stone-900">
                {formatVND(totalAmount)}
              </span>
            </div>
          </div>

          {/* 4. GHI CHÚ & YÊU CẦU ĐẶC BIỆT */}
          <div className="space-y-2">
            <label className="font-semibold text-stone-700 block">Ghi chú phục vụ của Quản gia</label>
            <textarea
              rows={2}
              value={formData.specialNotes}
              onChange={(e) => handleChange('specialNotes', e.target.value)}
              placeholder="Ghi chú sở thích khách hàng, dị ứng hoặc yêu cầu đặc biệt..."
              className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-stone-900 focus:outline-none focus:border-stone-400 resize-none"
            />
          </div>

          {/* Footer Submit Button */}
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
              <span>Xác nhận tạo đơn đặt phòng</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewBookingModal;
