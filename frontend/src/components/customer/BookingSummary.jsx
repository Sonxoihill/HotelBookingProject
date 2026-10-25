import React from 'react';
import { formatVND } from '../../utils/formatters';
import { ShieldCheck, CalendarCheck, Sparkles, AlertCircle, Info, Calendar } from 'lucide-react';

export const BookingSummary = ({
  roomName = 'Hạng phòng cao cấp',
  checkIn = '',
  checkOut = '',
  nights = 1,
  priceQuote = null,
  isLoadingQuote = false,
  quoteError = '',
  basePrice = 0,
}) => {
  // Helper định dạng ngày dd/MM hoặc dd/MM/yyyy
  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return '';
    try {
      const parts = String(dateStr).split('T')[0].split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}`;
      }
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      return `${day}/${month}`;
    } catch {
      return dateStr;
    }
  };

  // Trích xuất danh sách giá từng đêm từ dữ liệu priceQuote trả về từ API
  const dailyPrices =
    priceQuote?.dailyPrices ||
    priceQuote?.dailyRates ||
    priceQuote?.nightlyPrices ||
    priceQuote?.details ||
    priceQuote?.items ||
    [];

  // Trích xuất Tạm tính, VAT, Tổng tiền từ priceQuote (không tự tính)
  const subtotal =
    priceQuote?.subtotal ??
    priceQuote?.roomSubtotal ??
    priceQuote?.totalBasePrice ??
    (dailyPrices.length > 0
      ? dailyPrices.reduce((sum, item) => sum + Number(item.price || item.finalPrice || 0), 0)
      : basePrice * nights);

  const vat =
    priceQuote?.vat ??
    priceQuote?.tax ??
    priceQuote?.vatAmount ??
    Math.round(subtotal * 0.08);

  const totalAmount =
    priceQuote?.totalAmount ??
    priceQuote?.total ??
    priceQuote?.finalTotal ??
    (subtotal + vat);

  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 p-5 sm:p-6 shadow-sm space-y-5 font-sans">
      <div className="flex items-center justify-between border-b border-stone-100 pb-3">
        <h3 className="font-serif font-bold text-lg text-stone-900">
          Tóm tắt bảng giá đặt phòng
        </h3>
        <span className="text-[11px] font-semibold text-amber-900 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/70">
          Báo giá linh hoạt
        </span>
      </div>

      <div>
        <h4 className="font-semibold text-stone-800 text-sm">{roomName}</h4>
        {checkIn && checkOut && (
          <div className="flex items-center gap-2 text-xs text-stone-500 mt-1 font-mono">
            <CalendarCheck size={14} className="text-amber-700 shrink-0" />
            <span>
              {nights} đêm: {checkIn} ➔ {checkOut}
            </span>
          </div>
        )}
      </div>

      {/* Hiển thị bảng giá từng đêm từ dữ liệu trả về */}
      {isLoadingQuote ? (
        <div className="py-6 flex flex-col items-center justify-center gap-2 text-stone-400 bg-stone-50/70 rounded-xl border border-stone-200/60">
          <div className="w-5 h-5 border-2 border-stone-900 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-medium">Đang tính toán giá từng đêm theo quy tắc linh hoạt...</span>
        </div>
      ) : dailyPrices && dailyPrices.length > 0 ? (
        <div className="space-y-2 pt-1 border-t border-stone-100">
          <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-stone-400 pb-1">
            <span>Chi tiết từng đêm lưu trú</span>
            <span>Đơn giá</span>
          </div>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {dailyPrices.map((item, idx) => {
              const nightDate = item.date || item.nightDate || '';
              const nightPrice = item.price || item.finalPrice || item.rate || 0;
              const ruleName = item.ruleName || item.appliedRuleName || item.rule || '';
              const percent = item.adjustmentPercent ?? item.percentage ?? 0;
              const hasAdjustment = Boolean(ruleName || percent !== 0);

              // Đêm nào có điều chỉnh thì hiển thị tên quy tắc (Ví dụ: "02/09 – Quốc Khánh +20%: 1.140.000đ")
              let label = `${formatDateDisplay(nightDate) || `Đêm ${idx + 1}`}`;
              if (hasAdjustment) {
                const ruleText = ruleName ? `${ruleName}` : 'Điều chỉnh';
                const percentText = percent ? ` (${percent > 0 ? '+' : ''}${percent}%)` : '';
                label = `${label} – ${ruleText}${percentText}`;
              }

              return (
                <div
                  key={nightDate || idx}
                  className={`flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg border transition-colors ${
                    hasAdjustment
                      ? 'bg-amber-50/70 border-amber-200 text-amber-950 font-medium'
                      : 'bg-stone-50/60 border-stone-200/70 text-stone-700'
                  }`}
                >
                  <span className="truncate pr-2">{label}</span>
                  <span className="font-bold text-stone-900 shrink-0">
                    {formatVND(nightPrice)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      {/* Hiển thị Tạm tính, VAT, Tổng tiền */}
      <div className="space-y-2.5 text-xs pt-3 border-t border-stone-100">
        <div className="flex justify-between text-stone-600">
          <span>Tạm tính tiền phòng ({nights} đêm)</span>
          <span className="font-semibold text-stone-900">{formatVND(subtotal)}</span>
        </div>
        <div className="flex justify-between text-stone-600">
          <span>Thuế VAT</span>
          <span className="font-semibold text-stone-900">{formatVND(vat)}</span>
        </div>
      </div>

      <div className="pt-3 border-t border-stone-100 flex justify-between items-center">
        <div>
          <span className="text-[11px] text-stone-400 font-semibold uppercase tracking-wider block">
            Tổng thanh toán
          </span>
          <span className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
            {formatVND(totalAmount)}
          </span>
        </div>
        <span className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1 font-semibold">
          <Sparkles size={12} className="text-emerald-600" /> Đã gồm thuế phí
        </span>
      </div>

      <div className="bg-stone-50 rounded-xl p-3 text-[11px] text-stone-500 flex items-start gap-2 border border-stone-200/70">
        <ShieldCheck size={15} className="text-emerald-600 shrink-0 mt-0.5" />
        <span>Giá được áp dụng trực tiếp theo chính sách giá linh hoạt của khu nghỉ dưỡng.</span>
      </div>
    </div>
  );
};

export default BookingSummary;
