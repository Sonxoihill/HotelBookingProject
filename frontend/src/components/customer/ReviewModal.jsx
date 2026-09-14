import React, { useState } from 'react';
import { Star } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';

export const ReviewModal = ({ isOpen, onClose, booking, onSubmit }) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit({ bookingId: booking?.id, rating, comment });
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
      title="Đánh giá kỳ nghỉ & Dịch vụ"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Để sau
          </Button>
          <Button
            variant="primary"
            size="sm"
            isLoading={isSubmitting}
            onClick={handleSubmit}
          >
            Gửi đánh giá
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <p className="text-sm font-semibold text-slate-800">
            {booking?.roomName || 'Phòng Suite Hướng Biển'}
          </p>
          <p className="text-xs text-slate-500">Mã đơn đặt: #{booking?.id || 'BK-1082'}</p>
        </div>

        {/* Star Selection */}
        <div className="flex flex-col items-center justify-center p-4 bg-amber-50/50 rounded-xl border border-amber-100/60">
          <span className="text-xs text-slate-600 mb-2 font-medium">Bạn cảm thấy kỳ nghỉ thế nào?</span>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="cursor-pointer p-1 text-slate-300 hover:scale-110 transition-transform"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
              >
                <Star
                  size={28}
                  className={`${
                    (hoverRating || rating) >= star
                      ? 'text-amber-500 fill-amber-500'
                      : 'text-slate-300'
                  }`}
                />
              </button>
            ))}
          </div>
          <span className="text-xs font-semibold text-amber-700 mt-2">
            {rating === 5 && 'Tuyệt vời, vượt mong đợi!'}
            {rating === 4 && 'Rất tốt, hài lòng'}
            {rating === 3 && 'Bình thường'}
            {rating === 2 && 'Chưa hài lòng'}
            {rating === 1 && 'Trải nghiệm kém'}
          </span>
        </div>

        {/* Text feedback */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-700">
            Chia sẻ cảm nhận chi tiết của bạn
          </label>
          <textarea
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Chia sẻ về sự sạch sẽ của phòng, thái độ phục vụ của lễ tân, tiện ích hồ bơi..."
            className="w-full text-sm border border-slate-200 rounded-lg p-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 resize-none"
          />
        </div>
      </form>
    </Modal>
  );
};

export default ReviewModal;
