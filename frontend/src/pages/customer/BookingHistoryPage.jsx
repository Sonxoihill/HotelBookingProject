import React, { useState } from 'react';
import { formatVND, formatDate } from '../../utils/formatters';
import { BOOKING_STATUS } from '../../utils/constants';
import ReviewModal from '../../components/customer/ReviewModal';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { Calendar, Clock, Star, FileText, CheckCircle2 } from 'lucide-react';

export const BookingHistoryPage = () => {
  const [selectedBookingForReview, setSelectedBookingForReview] = useState(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);

  const bookings = [
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
  ];

  const handleOpenReview = (bk) => {
    setSelectedBookingForReview(bk);
    setIsReviewOpen(true);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <span className="text-xs font-bold text-amber-600 uppercase tracking-widest block">
          Lịch sử lưu trú cá nhân
        </span>
        <h1 className="text-3xl font-extrabold text-slate-900 mt-1 font-serif">
          Danh Sách Đơn Đặt Phòng Của Bạn
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Theo dõi trạng thái kỳ nghỉ, hóa đơn điện tử và gửi phản hồi, đánh giá chất lượng.
        </p>
      </div>

      <div className="space-y-4">
        {bookings.map((bk) => {
          const statusMeta = BOOKING_STATUS[bk.status] || BOOKING_STATUS.PENDING;
          return (
            <div
              key={bk.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row gap-5 items-start md:items-center justify-between"
            >
              <div className="flex gap-4 items-center">
                <img
                  src={bk.imageUrl}
                  alt={bk.roomName}
                  className="w-20 h-20 rounded-xl object-cover shrink-0"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-500">#{bk.id}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusMeta.color}`}>
                      {statusMeta.label}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-base">{bk.roomName}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-2">
                    <Calendar size={13} className="text-amber-600" />
                    <span>{formatDate(bk.checkIn)} ➔ {formatDate(bk.checkOut)} ({bk.nights} đêm)</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6 self-end md:self-center">
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 block">Tổng tiền</span>
                  <span className="text-base font-extrabold text-amber-600">
                    {formatVND(bk.totalAmount)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Nút Đánh giá ( extend từ ) */}
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

      {/* Review Modal Triggered by  */}
      <ReviewModal
        isOpen={isReviewOpen}
        onClose={() => setIsReviewOpen(false)}
        booking={selectedBookingForReview}
        onSubmit={async (data) => {
          alert('Cảm ơn quý khách đã gửi đánh giá chất lượng dịch vụ!');
        }}
      />
    </div>
  );
};

export default BookingHistoryPage;
