import axiosInstance from './axiosInstance';
import { getMockReviewsByRoomId } from '../mock/mockReviewsData';

/**
 * BIẾN CỜ KIỂM SOÁT MOCK DATA (Theo Plan 1 & Plan 2)
 * - Khi USE_MOCK = true: Chỉ đọc mock data, không gọi API backend.
 * - Khi USE_MOCK = false: Bắn thẳng request vào API thật. Nếu API chết, UI sẽ văng lỗi đỏ để dev bắt backend sửa.
 * - Sau này khi Backend đã có API đầy đủ, xóa cờ này và thư mục mock theo Plan 2.
 */
const USE_MOCK = true;

/**
 * Service quản lý Đánh giá & Phản hồi của khách hàng (lưu & lấy từ Database MySQL)
 */
export const reviewService = {
  // Lấy danh sách đánh giá của một phòng kèm điểm trung bình
  getRoomReviews: async (roomId) => {
    if (USE_MOCK) {
      // Nhánh Mock: trả về dữ liệu mẫu giả lập
      return Promise.resolve({
        data: getMockReviewsByRoomId(roomId),
      });
    }

    // Nhánh Real API: Bắn thẳng vào API thật, nếu lỗi thì throw thẳng lên UI
    return await axiosInstance.get(`/reviews/room/${roomId}`);
  },

  // Khách hàng gửi đánh giá mới
  createReview: async ({ bookingId, roomId, rating, comment }) => {
    if (USE_MOCK) {
      return Promise.resolve({
        data: {
          success: true,
          message: 'Đánh giá đã được gửi thành công (Chế độ Mock).',
        },
      });
    }

    return await axiosInstance.post('/reviews', {
      bookingId,
      roomId,
      rating,
      comment,
    });
  },

  // Lấy các đánh giá của chính người dùng hiện tại
  getMyReviews: async () => {
    if (USE_MOCK) {
      return Promise.resolve({ data: [] });
    }

    return await axiosInstance.get('/reviews/my-reviews');
  },
};

export default reviewService;
