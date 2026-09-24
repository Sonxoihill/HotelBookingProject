import React from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  CreditCard,
  BedDouble,
  Users,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  Star,
  CheckCircle2,
  FileText,
  Building,
} from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { formatVND, formatDate } from '../../utils/formatters';

export const BookingDetailModal = ({
  isOpen,
  onClose,
  booking,
  onOpenCancel,
  onOpenReview,
  canCancel,
}) => {
  if (!booking) return null;

  const room = booking.room || {};
  const category = room.category || {};
  const user = booking.user || {};

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CONFIRMED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Xác nhận
          </span>
        );
      case 'PENDING':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
            Đang xử lý
          </span>
        );
      case 'CHECKED_OUT':
      case 'COMPLETED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            Đã hoàn thành
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
            Đã hủy
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-stone-100 text-stone-700">
            {status}
          </span>
        );
    }
  };

  // Tính số đêm
  const calculateNights = (inDate, outDate) => {
    if (!inDate || !outDate) return 1;
    const d1 = new Date(inDate);
    const d2 = new Date(outDate);
    const diff = Math.round((d2 - d1) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 1;
  };

  const nights = calculateNights(booking.checkIn, booking.checkOut);
  const basePrice = category.basePrice || room.basePrice || (booking.totalAmount ? booking.totalAmount / nights : 500000);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Chi Tiết Đơn Đặt Phòng #${booking.id}`}
      maxWidth="max-w-2xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
              <Button
                type="button"
                variant="danger"
                size="sm"
                className="gap-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200"
                onClick={() => {
                  onClose();
                  onOpenCancel(booking);
                }}
              >
                <XCircle size={14} />
                <span>Yêu cầu hủy đơn</span>
              </Button>
            )}

            {(booking.status === 'CHECKED_OUT' || booking.status === 'COMPLETED') && (
              <Button
                type="button"
                variant="primary"
                size="sm"
                className="gap-1.5 bg-amber-600 hover:bg-amber-700 text-white"
                onClick={() => {
                  onClose();
                  onOpenReview(booking);
                }}
              >
                <Star size={14} />
                <span>{booking.review ? 'Xem / Cập nhật đánh giá' : 'Đánh giá & Phản hồi'}</span>
              </Button>
            )}
          </div>

          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            Đóng
          </Button>
        </div>
      }
    >
      <div className="space-y-6 text-stone-800">
        {/* 1. Header Card với trạng thái & mã đơn */}
        <div className="flex items-center justify-between p-4 bg-stone-50 rounded-2xl border border-stone-200/80">
          <div>
            <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">
              Mã đơn đặt phòng
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-base font-mono font-extrabold text-stone-900">
                #{booking.id}
              </span>
              <span className="text-xs text-stone-500">
                • Tạo lúc: {formatDate(booking.createdAt || new Date())}
              </span>
            </div>
          </div>
          <div>{getStatusBadge(booking.status)}</div>
        </div>

        {/* Thông báo nếu đơn đã bị hủy */}
        {booking.status === 'CANCELLED' && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-1.5 text-xs text-rose-900 animate-in fade-in">
            <div className="flex items-center gap-1.5 font-bold text-rose-800">
              <XCircle size={15} />
              <span>Đơn đặt phòng này đã được hủy</span>
            </div>
            <p className="text-rose-700 leading-relaxed">
              <strong>Lý do hủy:</strong> {booking.cancellationReason || 'Khách hàng yêu cầu hủy đơn qua hệ thống.'}
            </p>
            {booking.cancelledAt && (
              <span className="text-[11px] text-rose-500 block">
                Thời điểm hủy: {formatDate(booking.cancelledAt)}
              </span>
            )}
          </div>
        )}

        {/* Thông tin đánh giá nếu đã đánh giá */}
        {booking.review && (
          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2 text-xs text-amber-900">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 font-bold text-amber-900">
                <Star size={15} className="fill-amber-500 text-amber-500" />
                <span>Đánh giá từ khách hàng:</span>
              </div>
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={13}
                    className={s <= booking.review.rating ? 'fill-amber-500 text-amber-500' : 'text-stone-300'}
                  />
                ))}
              </div>
            </div>
            <p className="italic text-stone-700 bg-white/70 p-2.5 rounded-xl border border-amber-100">
              "{booking.review.comment}"
            </p>
          </div>
        )}

        {/* 2. Thông tin Phòng nghỉ */}
        <div className="border border-stone-200/80 rounded-2xl p-4 space-y-3">
          <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
            <Building size={14} className="text-[#C59D5F]" />
            <span>Thông tin phòng nghỉ</span>
          </h4>

          <div className="flex flex-col sm:flex-row gap-4">
            {(category.imageUrl || room.imageUrl) && (
              <img
                src={category.imageUrl || room.imageUrl}
                alt={category.name || 'Room'}
                className="w-full sm:w-36 h-28 rounded-xl object-cover border border-stone-200 shrink-0"
              />
            )}
            <div className="space-y-1.5 min-w-0 flex-1">
              <h5 className="font-serif font-bold text-base text-stone-900">
                {category.name || ''} {room.roomNumber ? `(Phòng ${room.roomNumber})` : ''}
              </h5>
              {category.description && (
                <p className="text-xs text-stone-500 line-clamp-2">
                  {category.description}
                </p>
              )}
              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-stone-600">
                {(category.bedType || room.bedType) && (
                  <span className="flex items-center gap-1">
                    <BedDouble size={14} className="text-[#C59D5F]" />
                    <span>{category.bedType || room.bedType}</span>
                  </span>
                )}
                {(category.capacity || room.capacity) && (
                  <span className="flex items-center gap-1">
                    <Users size={14} className="text-[#C59D5F]" />
                    <span>Sức chứa: {category.capacity || room.capacity} người</span>
                  </span>
                )}
                {room.floor && (
                  <span className="flex items-center gap-1">
                    <MapPin size={14} className="text-[#C59D5F]" />
                    <span>Tầng {room.floor}</span>
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 3. Lịch trình lưu trú */}
        <div className="border border-stone-200/80 rounded-2xl p-4 space-y-3">
          <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar size={14} className="text-[#C59D5F]" />
            <span>Lịch trình lưu trú</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-stone-50 rounded-xl text-xs">
            <div>
              <span className="text-[10px] text-stone-400 uppercase font-semibold block">Nhận phòng (Check-in)</span>
              <span className="font-bold text-stone-900 block text-sm mt-0.5">{booking.checkIn}</span>
              <span className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5">
                <Clock size={11} /> Sau 14:00
              </span>
            </div>
            <div>
              <span className="text-[10px] text-stone-400 uppercase font-semibold block">Trả phòng (Check-out)</span>
              <span className="font-bold text-stone-900 block text-sm mt-0.5">{booking.checkOut}</span>
              <span className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5">
                <Clock size={11} /> Trước 12:00
              </span>
            </div>
            <div>
              <span className="text-[10px] text-stone-400 uppercase font-semibold block">Thời lượng</span>
              <span className="font-bold text-[#C59D5F] block text-sm mt-0.5">{nights} đêm</span>
              <span className="text-[11px] text-stone-500 block mt-0.5">Kỳ nghỉ trọn vẹn</span>
            </div>
          </div>
        </div>

        {/* 4. Thông tin khách lưu trú */}
        <div className="border border-stone-200/80 rounded-2xl p-4 space-y-3">
          <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
            <User size={14} className="text-[#C59D5F]" />
            <span>Thông tin khách hàng</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-stone-700">
            <div className="flex items-center gap-2">
              <User size={14} className="text-stone-400 shrink-0" />
              <div>
                <span className="text-[10px] text-stone-400 block">Họ và tên</span>
                <span className="font-semibold text-stone-900">{user.fullName || 'Khách hàng'}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={14} className="text-stone-400 shrink-0" />
              <div>
                <span className="text-[10px] text-stone-400 block">Số điện thoại</span>
                <span className="font-semibold text-stone-900">{user.phone || '0903456789'}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Mail size={14} className="text-stone-400 shrink-0" />
              <div className="truncate">
                <span className="text-[10px] text-stone-400 block">Email</span>
                <span className="font-semibold text-stone-900 truncate">{user.email || 'guest@example.com'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 5. Chi tiết thanh toán */}
        <div className="border border-stone-200/80 rounded-2xl p-4 space-y-3">
          <h4 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
            <CreditCard size={14} className="text-[#C59D5F]" />
            <span>Chi tiết thanh toán</span>
          </h4>

          <div className="space-y-2 text-xs divide-y divide-stone-100">
            <div className="flex items-center justify-between pt-1">
              <span className="text-stone-600">
                Giá phòng ({formatVND(basePrice)} × {nights} đêm)
              </span>
              <span className="font-medium text-stone-900">{formatVND(basePrice * nights)}</span>
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="text-stone-600">Thuế GTGT (VAT 8%) & Phí dịch vụ (5%)</span>
              <span className="text-emerald-700 font-medium">Đã bao gồm trong giá</span>
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="font-bold text-sm text-stone-900">Tổng thanh toán</span>
              <span className="font-mono font-extrabold text-base text-[#C59D5F]">
                {formatVND(booking.totalAmount)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default BookingDetailModal;
