import React from 'react';
import { formatVND } from '../../utils/formatters';
import { ShieldCheck, CalendarCheck, Sparkles } from 'lucide-react';

export const BookingSummary = ({
  roomName = 'Deluxe Ocean View Room',
  checkIn = '2026-09-20',
  checkOut = '2026-09-23',
  nights = 3,
  pricePerNight = 1250000,
  taxRate = 0.08, // 8% VAT
  serviceFee = 100000, // Phí dịch vụ
}) => {
  const roomSubtotal = pricePerNight * nights;
  const tax = Math.round(roomSubtotal * taxRate);
  const total = roomSubtotal + tax + serviceFee;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
      <h3 className="font-bold text-lg text-slate-900 border-b border-slate-100 pb-3">
        Tóm tắt đơn đặt phòng
      </h3>

      <div>
        <h4 className="font-semibold text-slate-800">{roomName}</h4>
        <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
          <CalendarCheck size={14} className="text-amber-600" />
          <span>{nights} đêm: {checkIn} ➔ {checkOut}</span>
        </div>
      </div>

      <div className="space-y-2.5 text-sm pt-2 border-t border-slate-100">
        <div className="flex justify-between text-slate-600">
          <span>Tiền phòng ({nights} đêm)</span>
          <span className="font-medium text-slate-800">{formatVND(roomSubtotal)}</span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>Thuế VAT (8%)</span>
          <span className="font-medium text-slate-800">{formatVND(tax)}</span>
        </div>
        <div className="flex justify-between text-slate-600">
          <span>Phí phục vụ</span>
          <span className="font-medium text-slate-800">{formatVND(serviceFee)}</span>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
        <div>
          <span className="text-xs text-slate-400 block">Tổng thanh toán</span>
          <span className="text-2xl font-extrabold text-amber-600">{formatVND(total)}</span>
        </div>
        <span className="text-[11px] text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-1 rounded-md flex items-center gap-1 font-medium">
          <Sparkles size={12} /> Đã bao gồm thuế
        </span>
      </div>

      <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-500 flex items-start gap-2">
        <ShieldCheck size={16} className="text-emerald-600 shrink-0 mt-0.5" />
        <span>Cam kết bảo mật giao dịch, miễn phí hủy phòng trước 48 giờ.</span>
      </div>
    </div>
  );
};

export default BookingSummary;
