import React, { useState } from 'react';
import { formatVND, formatDate } from '../../utils/formatters';
import { BOOKING_STATUS } from '../../utils/constants';
import ReviewModal from '../../components/customer/ReviewModal';
import CancelBookingModal from '../../components/customer/CancelBookingModal';
import Button from '../../components/common/Button';
import { Calendar, Star, FileText, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

const INITIAL_BOOKINGS = [
  {
    id: 'BK-0943',
    roomName: 'Presidential Royal Suite',
    checkIn: '2026-09-28',
    checkOut: '2026-10-01',
    nights: 3,
    totalAmount: 10500000,
    status: 'CONFIRMED',
    hasReviewed: false,
    imageUrl: 'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'BK-1082',
    roomName: 'Deluxe Ocean View Room',
    checkIn: '2026-08-10',
    checkOut: '2026-08-13',
    nights: 3,
    totalAmount: 4350000,
    status: 'CHECKED_OUT',
    hasReviewed: false,
    imageUrl: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'BK-0751',
    roomName: 'Superior Double King Bed',
    checkIn: '2026-07-01',
    checkOut: '2026-07-03',
    nights: 2,
    totalAmount: 2200000,
    status: 'CANCELLED',
    hasReviewed: false,
    cancellationReason: 'Thay đổi lịch trình chuyến đi do bận công tác đột xuất',
    imageUrl: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=400&q=80',
  },
];

export const BookingHistoryPage = () => {
  const [bookings, setBookings] = useState(INITIAL_BOOKINGS);

  // Review modal state
  const [selectedBookingForReview, setSelectedBookingForReview] = useState(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  // Cancel modal state
  const [selectedBookingForCancel, setSelectedBookingForCancel] = useState(null);
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [alertSuccess, setAlertSuccess] = useState('');

  const handleOpenReview = (bk) => {
    setSelectedBookingForReview(bk);
    setIsReviewOpen(true);
  };

  const handleOpenCancel = (bk) => {
    setSelectedBookingForCancel(bk);
    setIsCancelOpen(true);
  };

  const handleConfirmCancel = async ({ bookingId, reason }) => {
    // Cập nhật trạng thái đơn thành CANCELLED kèm lý do hủy
    setBookings((prev) =>
      prev.map((item) =>
        item.id === bookingId
          ? {
              ...item,
              status: 'CANCELLED',
              cancellationReason: reason,
              cancelledAt: new Date().toISOString(),
            }
          : item
      )
    );

    setAlertSuccess(`Đã hủy thành công đơn đặt phòng #${bookingId}!`);
    setTimeout(() => setAlertSuccess(''), 5000);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <span className="text-xs font-bold text-amber-600 uppercase tracking-widest block">
          Lịch sử lưu trú cá nhân
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 mt-1 font-serif">
          Danh Sách Đơn Đặt Phòng Của Bạn
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Theo dõi trạng thái kỳ nghỉ, hóa đơn điện tử, hủy phòng hoặc gửi phản hồi chất lượng.
        </p>
      </div>

      {/* Success Notification Alert */}
      {alertSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center justify-between text-sm font-medium shadow-xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 size={18} className="text-emerald-600 shrink-0" />
            <span>{alertSuccess}</span>
          </div>
          <button
            onClick={() => setAlertSuccess('')}
            className="text-emerald-600 hover:text-emerald-800 text-xs font-bold cursor-pointer"
          >
            Đóng
          </button>
        </div>
      )}

      {/* Bookings List */}
      <div className="space-y-4">
        {bookings.map((bk) => {
          const statusMeta = BOOKING_STATUS[bk.status] || BOOKING_STATUS.PENDING;
          const canCancel = bk.status === 'PENDING' || bk.status === 'CONFIRMED';

          return (
            <div
              key={bk.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row gap-5 items-start md:items-center justify-between transition-all hover:border-slate-300"
            >
              {/* Left: Image & Details */}
              <div className="flex gap-4 items-start flex-1 min-w-0">
                <img
                  src={bk.imageUrl}
                  alt={bk.roomName}
                  className="w-20 h-20 rounded-xl object-cover shrink-0 mt-0.5"
                />
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-500">#{bk.id}</span>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${statusMeta.color}`}>
                      {statusMeta.label}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base truncate">
                    {bk.roomName}
                  </h3>

                  <p className="text-xs text-slate-500 flex items-center gap-2">
                    <Calendar size={13} className="text-amber-600 shrink-0" />
                    <span>
                      {formatDate(bk.checkIn)} ➔ {formatDate(bk.checkOut)} ({bk.nights} đêm)
                    </span>
                  </p>

                  {/* Hiển thị lý do hủy nếu đơn bị hủy */}
                  {bk.status === 'CANCELLED' && bk.cancellationReason && (
                    <div className="mt-2 text-xs bg-rose-50 text-rose-800 border border-rose-200/70 rounded-xl px-3 py-2 flex items-start gap-2">
                      <AlertCircle size={14} className="text-rose-600 shrink-0 mt-0.5" />
                      <div className="leading-relaxed">
                        <strong className="font-semibold text-rose-900">Lý do hủy:</strong>{' '}
                        {bk.cancellationReason}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Total Amount & Action Buttons */}
              <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-end sm:items-center md:items-end lg:items-center gap-4 sm:gap-6 self-end md:self-center shrink-0">
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block">Tổng tiền</span>
                  <span className="text-base font-extrabold text-amber-600">
                    {formatVND(bk.totalAmount)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Nút Đánh giá (chỉ khi đã trả phòng) */}
                  {bk.status === 'CHECKED_OUT' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenReview(bk)}
                      className="gap-1.5 border-amber-300 text-amber-700 hover:bg-amber-50"
                    >
                      <Star size={14} className="fill-amber-500 text-amber-500" />
                      <span>Đánh giá</span>
                    </Button>
                  )}

                  {/* Nút Hủy đơn (chỉ khi chưa nhận phòng: PENDING hoặc CONFIRMED) */}
                  {canCancel && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenCancel(bk)}
                      className="gap-1.5 border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 cursor-pointer"
                    >
                      <XCircle size={14} />
                      <span>Hủy đơn</span>
                    </Button>
                  )}

                  <Button variant="ghost" size="sm" className="gap-1 text-slate-600">
                    <FileText size={14} />
                    <span>Hóa đơn</span>
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        booking={selectedBookingForReview}
        onSubmit={async () => {
          setAlertSuccess('Cảm ơn quý khách đã gửi đánh giá chất lượng dịch vụ!');
          setTimeout(() => setAlertSuccess(''), 4000);
        }}
      />

      {/* Cancel Booking Modal */}
      <CancelBookingModal
        isOpen={isCancelOpen}
        onClose={() => setIsCancelOpen(false)}
        booking={selectedBookingForCancel}
        onConfirmCancel={handleConfirmCancel}
      />
    </div>
  );
};

export default BookingHistoryPage;
