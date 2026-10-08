import { getMockRoomById, MOCK_ROOMS } from './mockRooms';
import { getMockUserProfile } from './mockUser';
import { createMockBooking } from './mockBookings';
import { createMockVNPayUrl } from './mockPayment';

// Helper tạo độ trễ mạng mô phỏng (mặc định 300ms)
const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Mock Service cho Phòng (Room)
 */
export const mockRoomService = {
  getRoomById: async (roomId) => {
    await delay(350);
    const room = getMockRoomById(roomId) || MOCK_ROOMS[0];
    if (!room) {
      const err = new Error('Không tìm thấy thông tin phòng yêu cầu.');
      err.status = 404;
      throw err;
    }
    return { data: room };
  },
};

/**
 * Mock Service cho Tài khoản & Hồ sơ (User Profile)
 */
export const mockUserService = {
  getProfile: async () => {
    await delay(250);
    return { data: getMockUserProfile() };
  },
};

/**
 * Mock Service cho Đơn đặt phòng (Booking)
 */
export const mockBookingService = {
  createBooking: async (bookingData) => {
    await delay(500);
    const created = createMockBooking(bookingData);
    return { data: created };
  },
};

/**
 * Mock Service cho Cổng thanh toán (Payment)
 */
export const mockPaymentService = {
  createVNPayUrl: async (paymentData) => {
    await delay(500);
    // Tạo URL giả lập redirect sang trang /booking/vnpay-return với mã vnp_ResponseCode=00
    const mockUrl = createMockVNPayUrl(paymentData, 'SUCCESS');
    return {
      paymentUrl: mockUrl,
      url: mockUrl,
      message: 'Khởi tạo giao dịch VNPay giả lập thành công',
    };
  },
};
