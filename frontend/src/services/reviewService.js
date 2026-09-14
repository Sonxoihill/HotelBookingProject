import axiosInstance from './axiosInstance';

/**
 * Service xử lý : Đánh giá & Phản hồi
 */
export const reviewService = {
  // Gửi đánh giá cho một đơn đặt phòng sau khi trả phòng
  createReview: async (reviewData) => {
    return await axiosInstance.post('/reviews', reviewData);
  },

  // Lấy danh sách đánh giá của một phòng cụ thể
  getRoomReviews: async (roomId, params) => {
    return await axiosInstance.get(`/rooms/${roomId}/reviews`, { params });
  },
};

export default reviewService;
