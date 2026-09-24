import React, { useState } from 'react';
import { Star, MessageSquare, CheckCircle2, Heart, Award } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';

const QUICK_TAGS = [
  'Phòng rất sạch sẽ',
  'Giường êm ái, ngủ ngon',
  'Nhân viên thân thiện',
  'View đẹp, thoáng đãng',
  'Thủ tục nhanh gọn',
  'Bữa sáng phong phú',
  'Dịch vụ tuyệt vời',
];

export const ReviewModal = ({ isOpen, onClose, booking, onSubmit }) => {
  const [rating, setRating] = useState(booking?.review?.rating || 5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState(booking?.review?.comment || '');
  const [selectedTags, setSelectedTags] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!booking) return null;

  const room = booking.room || {};
  const category = room.category || {};
  const roomName = category.name ? `${category.name} (Phòng ${room.roomNumber})` : `Đơn đặt phòng #${booking.id}`;

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const getRatingLabel = (stars) => {
    switch (stars) {
      case 5:
        return 'Tuyệt vời, vượt mong đợi! ⭐⭐⭐⭐⭐';
      case 4:
        return 'Rất tốt, hài lòng với kỳ nghỉ ⭐⭐⭐⭐';
      case 3:
        return 'Bình thường, chấp nhận được ⭐⭐⭐';
      case 2:
        return 'Chưa thực sự hài lòng ⭐⭐';
      case 1:
        return 'Trải nghiệm chưa tốt ⭐';
      default:
        return 'Chọn số sao đánh giá';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!comment.trim() && selectedTags.length === 0) {
      setErrorMessage('Vui lòng nhập nội dung bình luận hoặc chọn nhận xét nhanh!');
      return;
    }

    setIsSubmitting(true);
    try {
      const finalComment = [
        ...selectedTags,
        comment.trim(),
      ]
        .filter(Boolean)
        .join('. ');

      if (onSubmit) {
        await onSubmit({
          bookingId: booking.id,
          rating,
          comment: finalComment || 'Dịch vụ rất tốt!',
        });
      }
      onClose();
    } catch (err) {
      console.error('Lỗi khi gửi đánh giá:', err);
      setErrorMessage(err.message || 'Không thể gửi đánh giá.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Đánh Giá & Phản Hồi Kỳ Nghỉ"
      maxWidth="max-w-lg"
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isSubmitting}>
            Để sau
          </Button>
          <Button
            variant="primary"
            size="sm"
            isLoading={isSubmitting}
            onClick={handleSubmit}
            className="gap-1.5 bg-[#C59D5F] hover:bg-[#b08b50] text-white"
          >
            <CheckCircle2 size={15} />
            <span>Gửi Đánh Giá</span>
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-800 animate-in fade-in">
            {errorMessage}
          </div>
        )}

        {/* Thông tin phòng */}
        <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-2xl border border-stone-200/80">
          <div className="w-10 h-10 rounded-xl bg-[#C59D5F]/15 text-[#C59D5F] flex items-center justify-center font-bold text-sm shrink-0">
            <Award size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-stone-900 text-sm truncate">{roomName}</h4>
            <p className="text-[11px] text-stone-500">
              Mã đơn: #{booking.id} • Kỳ nghỉ: {booking.checkIn} - {booking.checkOut}
            </p>
          </div>
        </div>

        {/* Chấm điểm sao */}
        <div className="flex flex-col items-center justify-center p-5 bg-gradient-to-b from-amber-50/60 to-white rounded-2xl border border-amber-200/70 text-center space-y-2">
          <span className="text-xs font-semibold text-stone-700">
            Bạn đánh giá thế nào về kỳ nghỉ này?
          </span>
          <div className="flex items-center gap-2 pt-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="cursor-pointer p-1 transition-transform hover:scale-125 focus:outline-none"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
              >
                <Star
                  size={32}
                  className={`transition-colors duration-150 ${
                    (hoverRating || rating) >= star
                      ? 'text-amber-400 fill-amber-400 filter drop-shadow-sm'
                      : 'text-stone-300'
                  }`}
                />
              </button>
            ))}
          </div>
          <span className="text-xs font-bold text-amber-900 min-h-[1.25rem] transition-all">
            {getRatingLabel(hoverRating || rating)}
          </span>
        </div>

        {/* Thẻ cảm xúc / nhận xét nhanh */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-stone-700 block">
            Những điểm bạn thích nhất:
          </label>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_TAGS.map((tag) => {
              const isSelected = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#C59D5F] text-white shadow-2xs'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200/80'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* Text feedback */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-stone-700 block">
            Nội dung bình luận & đóng góp ý kiến:
          </label>
          <textarea
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Chia sẻ trải nghiệm của bạn về không gian phòng, dịch vụ, thái độ nhân viên..."
            className="w-full text-xs border border-stone-200 rounded-xl p-3 text-stone-800 focus:outline-none focus:ring-2 focus:ring-[#C59D5F]/30 focus:border-[#C59D5F] resize-none bg-white"
          />
        </div>
      </form>
    </Modal>
  );
};

export default ReviewModal;
