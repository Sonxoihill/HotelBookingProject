import React, { useState } from 'react';
import { AlertTriangle, Calendar, XCircle, ShieldAlert, CheckCircle2 } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { formatVND, formatDate } from '../../utils/formatters';

const CANCEL_REASONS = [
  'Thay đổi lịch trình hoặc kế hoạch chuyến đi',
  'Tìm được nơi lưu trú khác phù hợp hơn',
  'Bận công việc hoặc việc gia đình đột xuất',
  'Đặt nhầm ngày nhận/trả phòng hoặc loại phòng',
  'Lý do sức khỏe hoặc điều kiện thời tiết không thuận lợi',
  'Lý do khác (vui lòng ghi rõ)',
];

export const CancelBookingModal = ({
  isOpen,
  onClose,
  booking,
  onConfirmCancel,
}) => {
  const [selectedReason, setSelectedReason] = useState(CANCEL_REASONS[0]);
  const [detailedReason, setDetailedReason] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isConfirmedAgreement, setIsConfirmedAgreement] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!booking) return null;

  // Kiểm tra tính hợp lệ của đơn hàng
  const isValidStatus = booking.status === 'PENDING' || booking.status === 'CONFIRMED';
  
  // Kiểm tra thời hạn hủy (phải trước ngày check-in)
  const isBeforeCheckIn = () => {
    if (!booking.checkIn) return true;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const checkInDate = new Date(booking.checkIn);
    checkInDate.setHours(0, 0, 0, 0);
    return checkInDate >= now;
  };

  const isEligible = isValidStatus && isBeforeCheckIn();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!isEligible) {
      setErrorMessage('Đơn hàng không đủ điều kiện hủy!');
      return;
    }

    // Bắt buộc nhập lý do hủy
    let finalReason = selectedReason;
    if (selectedReason === 'Lý do khác (vui lòng ghi rõ)') {
      if (!detailedReason || !detailedReason.trim()) {
        setErrorMessage('Vui lòng nhập chi tiết lý do hủy (đây là thông tin bắt buộc)!');
        return;
      }
      finalReason = detailedReason.trim();
    } else {
      if (detailedReason.trim()) {
        finalReason = `${selectedReason} - ${detailedReason.trim()}`;
      }
    }

    if (!finalReason || !finalReason.trim()) {
      setErrorMessage('Vui lòng nhập lý do hủy đặt phòng (đây là thông tin bắt buộc)!');
      return;
    }

    if (!isConfirmedAgreement) {
      setErrorMessage('Vui lòng đánh dấu xác nhận đồng ý với điều khoản hủy phòng!');
      return;
    }

    setIsSubmitting(true);
    try {
      if (onConfirmCancel) {
        await onConfirmCancel({
          bookingId: booking.id,
          reason: finalReason,
        });
      }
      onClose();
    } catch (err) {
      console.error('Lỗi khi hủy đơn:', err);
      setErrorMessage(err.message || 'Không thể hủy đơn đặt phòng.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Yêu Cầu Hủy Đơn Đặt Phòng #${booking?.id || ''}`}
      maxWidth="max-w-xl"
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Quay lại
          </Button>
          <Button
            type="button"
            variant="danger"
            size="sm"
            isLoading={isSubmitting}
            disabled={!isEligible || isSubmitting}
            onClick={handleSubmit}
            className="gap-1.5 bg-rose-600 hover:bg-rose-700 text-white"
          >
            <XCircle size={15} />
            <span>Xác Nhận Hủy</span>
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Thông báo lỗi nếu không đủ điều kiện */}
        {!isEligible && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-800 flex items-center gap-2">
            <XCircle size={16} className="text-rose-600 shrink-0" />
            <span>Đơn hàng không đủ điều kiện hủy! (Đơn không ở trạng thái Đang xử lý / Xác nhận hoặc đã quá thời hạn cho phép hủy).</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-800 flex items-center gap-2 animate-in fade-in">
            <AlertTriangle size={15} className="text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Tóm tắt thông tin đơn cần hủy */}
        <div className="bg-stone-50 border border-stone-200/80 rounded-2xl p-3.5 flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-900 flex items-center justify-center shrink-0 font-bold font-mono text-sm">
            #{booking.id}
          </div>
          <div className="space-y-1 min-w-0 flex-1">
            <h4 className="font-bold text-stone-900 text-sm truncate">
              {booking.room?.category?.name ? `${booking.room.category.name} (Phòng ${booking.room.roomNumber})` : `Đơn đặt phòng #${booking.id}`}
            </h4>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-500">
              <span className="flex items-center gap-1">
                <Calendar size={13} className="text-[#C59D5F]" />
                {booking.checkIn} ➔ {booking.checkOut}
              </span>
              <span className="font-bold text-stone-900">
                {formatVND(booking.totalAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* Cảnh báo chính sách */}
        <div className="p-3.5 bg-amber-50/80 border border-amber-200/80 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
          <AlertTriangle size={17} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-amber-800">
              Chính sách hủy đơn & giải phóng phòng trống:
            </p>
            <p className="text-amber-700 leading-relaxed text-[11px]">
              Khi bạn bấm xác nhận hủy, hệ thống sẽ chuyển trạng thái đơn sang <strong>"Đã hủy"</strong> và tự động cập nhật lại số lượng phòng trống khả dụng để phục vụ khách hàng khác.
            </p>
          </div>
        </div>

        {/* Lý do hủy: Bắt buộc chọn hoặc nhập */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-stone-800 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <ShieldAlert size={14} className="text-rose-600" />
              <span>Vui lòng chọn lý do hủy đặt phòng:</span>
            </span>
            <span className="text-[10px] text-rose-500 uppercase font-semibold">* Bắt buộc</span>
          </label>

          <div className="space-y-1.5">
            {CANCEL_REASONS.map((reason) => {
              const isChecked = selectedReason === reason;
              return (
                <label
                  key={reason}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all select-none ${
                    isChecked
                      ? 'bg-rose-50/80 border-rose-300 text-rose-900 font-semibold shadow-2xs'
                      : 'bg-white hover:bg-stone-50 border-stone-200 text-stone-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="cancelReason"
                    value={reason}
                    checked={isChecked}
                    onChange={() => setSelectedReason(reason)}
                    className="accent-rose-600 w-3.5 h-3.5"
                  />
                  <span>{reason}</span>
                </label>
              );
            })}
          </div>
        </div>

        {/* Textarea nhập lý do chi tiết */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-stone-700 flex items-center justify-between">
            <span>Chi tiết thêm về lý do hủy:</span>
            {selectedReason === 'Lý do khác (vui lòng ghi rõ)' && (
              <span className="text-[11px] text-rose-600 font-bold">* Vui lòng ghi rõ lý do</span>
            )}
          </label>
          <textarea
            rows={3}
            value={detailedReason}
            onChange={(e) => setDetailedReason(e.target.value)}
            placeholder={
              selectedReason === 'Lý do khác (vui lòng ghi rõ)'
                ? 'Nhập lý do cụ thể bạn muốn hủy đơn đặt phòng này...'
                : 'Nhập thêm chi tiết hoặc đóng góp ý kiến cho khách sạn (không bắt buộc)...'
            }
            className="w-full text-xs border border-stone-200 rounded-xl p-3 text-stone-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 resize-none bg-white"
            required={selectedReason === 'Lý do khác (vui lòng ghi rõ)'}
          />
        </div>

        {/* Cam kết */}
        <label className="flex items-start gap-2.5 pt-1 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isConfirmedAgreement}
            onChange={(e) => setIsConfirmedAgreement(e.target.checked)}
            className="mt-0.5 accent-rose-600 w-4 h-4 rounded"
          />
          <span className="text-xs text-stone-600 leading-snug">
            Tôi xác nhận muốn hủy đơn đặt phòng này và hiểu rằng trạng thái sẽ chuyển thành "Đã hủy".
          </span>
        </label>
      </form>
    </Modal>
  );
};

export default CancelBookingModal;
