import axiosInstance from './axiosInstance';

/**
 * Service quản lý Đánh giá & Phản hồi của khách hàng (lưu & lấy từ Database MySQL)
 */
export const reviewService = {
  // Lấy danh sách đánh giá của một phòng kèm điểm trung bình từ CSDL
  getRoomReviews: async (roomId) => {
    return await axiosInstance.get(`/reviews/room/${roomId}`);
  },

  // Khách hàng gửi đánh giá mới (lưu trực tiếp vào bảng reviews trong MySQL)
  createReview: async ({ bookingId, roomId, rating, comment }) => {
    return await axiosInstance.post('/reviews', {
      bookingId,
      roomId,
      rating,
      comment,
    });
  },

  // Lấy các đánh giá của chính người dùng hiện tại
  getMyReviews: async () => {
    return await axiosInstance.get('/reviews/my-reviews');
  },
};

export default reviewService;
