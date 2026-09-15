import React, { useState } from 'react';
import { AlertTriangle, Calendar, XCircle, ShieldAlert } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { formatVND, formatDate } from '../../utils/formatters';

const CANCEL_REASONS = [
  'Thay đổi lịch trình hoặc kế hoạch chuyến đi',
  'Tìm được nơi lưu trú khác phù hợp hơn',
  'Bận công việc hoặc việc gia đình đột xuất',
  'Đặt nhầm ngày nhận/trả phòng hoặc loại phòng',
  'Lý do sức khỏe hoặc điều kiện thời tiết không thuận lợi',
  'Lý do khác',
];

export const CancelBookingModal = ({
  isOpen,
  onClose,
  booking,
  onConfirmCancel,
}) => {
  const [selectedReason, setSelectedReason] = useState(CANCEL_REASONS[0]);
  const [detailedReason, setDetailedReason] = useState('');
  const [isConfirmedAgreement, setIsConfirmedAgreement] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isConfirmedAgreement) return;

    setIsSubmitting(true);
    try {
      const finalReason =
        selectedReason === 'Lý do khác' && detailedReason.trim()
          ? `Khác: ${detailedReason.trim()}`
          : detailedReason.trim()
          ? `${selectedReason} - ${detailedReason.trim()}`
          : selectedReason;

      if (onConfirmCancel) {
        await onConfirmCancel({
          bookingId: booking?.id,
          reason: finalReason,
        });
      }
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Hủy Đơn Đặt Phòng #${booking?.id || ''}`}
      maxWidth="max-w-xl"
      footer={
        <>
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
            disabled={!isConfirmedAgreement || isSubmitting}
            onClick={handleSubmit}
            className="gap-1.5 bg-rose-600 hover:bg-rose-700 text-white"
          >
            <XCircle size={15} />
            <span>Xác Nhận Hủy Đơn</span>
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Booking Brief Card */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 flex items-center gap-3">
          {booking?.imageUrl && (
            <img
              src={booking.imageUrl}
              alt={booking.roomName}
              className="w-16 h-16 rounded-lg object-cover shrink-0"
            />
          )}
          <div className="space-y-1 min-w-0 flex-1">
            <h4 className="font-bold text-slate-900 text-sm truncate">
              {booking?.roomName}
            </h4>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Calendar size={13} className="text-amber-600" />
                {formatDate(booking?.checkIn)} ➔ {formatDate(booking?.checkOut)}
              </span>
              <span className="font-bold text-amber-600">
                {formatVND(booking?.totalAmount)}
              </span>
            </div>
          </div>
        </div>

        {/* Policy Warning Box */}
        <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
          <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-amber-800">
              Chính sách hủy phòng & hoàn tiền:
            </p>
            <p className="text-amber-700 leading-relaxed">
              Quý khách được miễn phí hủy phòng trước thời điểm nhận phòng tối thiểu 24 giờ.
              Nếu quý khách đã thanh toán, số tiền hoàn sẽ được hoàn trả theo phương thức thanh toán ban đầu trong vòng 3 - 5 ngày làm việc.
            </p>
          </div>
        </div>

        {/* Reason Selection */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <ShieldAlert size={14} className="text-rose-600" />
            <span>Vui lòng chọn lý do hủy đặt phòng:</span>
          </label>

          <div className="space-y-1.5">
            {CANCEL_REASONS.map((reason) => {
              const isChecked = selectedReason === reason;
              return (
                <label
                  key={reason}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all select-none ${
                    isChecked
                      ? 'bg-rose-50/60 border-rose-300 text-rose-900 font-medium'
                      : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
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

        {/* Detailed Reason Textarea */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700">
            Chi tiết thêm về lý do hủy {selectedReason === 'Lý do khác' && <span className="text-rose-500">*</span>}
          </label>
          <textarea
            rows={3}
            value={detailedReason}
            onChange={(e) => setDetailedReason(e.target.value)}
            placeholder="Quý khách có thể chia sẻ thêm thông tin để khách sạn cải thiện dịch vụ tốt hơn..."
            className="w-full text-xs border border-slate-200 rounded-xl p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 resize-none bg-white"
          />
        </div>

        {/* Confirmation Checkbox */}
        <label className="flex items-start gap-2.5 pt-1 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isConfirmedAgreement}
            onChange={(e) => setIsConfirmedAgreement(e.target.checked)}
            className="mt-0.5 accent-rose-600 w-4 h-4 rounded"
          />
          <span className="text-xs text-slate-600 leading-snug">
            Tôi xác nhận muốn hủy đơn đặt phòng này và hiểu rằng hành động này không thể hoàn tác sau khi đã thực hiện.
          </span>
        </label>
      </form>
    </Modal>
  );
};

export default CancelBookingModal;
