import axiosInstance from './axiosInstance';

/**
 * Service xử lý:
 * - Đặt phòng (Khách hàng)
 * - Xem Lịch sử đặt phòng (Khách hàng)
 * - Quản lý Đơn đặt phòng (Lễ tân: xem, check-in, check-out, hủy)
 * Kết nối 100% API Backend thật qua /bookings
 */
export const bookingService = {
  // Khách hàng tạo yêu cầu đặt phòng mới
  createBooking: async (bookingData) => {
    return await axiosInstance.post('/bookings', bookingData);
  },

  // Khách hàng xem lịch sử các đơn đặt phòng của mình (GET /api/v1/bookings/my-history)
  getMyBookings: async (params) => {
    try {
      return await axiosInstance.get('/bookings/my-history', { params });
    } catch (err) {
      if (err?.status === 404 || err?.response?.status === 404) {
        return await axiosInstance.get('/bookings/my-bookings', { params });
      }
      throw err;
    }
  },

  // Lễ tân lấy toàn bộ danh sách đơn đặt phòng theo bộ lọc (UC10 - API 1)
  getAllBookings: async (params) => {
    return await axiosInstance.get('/receptionist/bookings', { params });
  },

  // Lễ tân duyệt đơn đặt phòng PENDING -> CONFIRMED (UC10 - API 2)
  approveBooking: async (bookingId) => {
    return await axiosInstance.patch(`/receptionist/bookings/${bookingId}/approve`);
  },

  // Lễ tân hủy đơn đặt phòng kèm lý do (UC10 - API 3)
  cancelReceptionistBooking: async (bookingId, cancelReason) => {
    return await axiosInstance.patch(`/receptionist/bookings/${bookingId}/cancel`, {
      cancelReason,
      reason: cancelReason,
    });
  },

  // Lễ tân làm thủ tục nhận phòng (Check-in) (UC10 - API 4)
  checkIn: async (bookingId) => {
    return await axiosInstance.patch(`/receptionist/bookings/${bookingId}/check-in`);
  },

  // Lễ tân lấy tóm tắt hóa đơn trước Check-out (UC10 - API 5)
  getCheckoutSummary: async (bookingId) => {
    return await axiosInstance.get(`/receptionist/bookings/${bookingId}/checkout-summary`);
  },

  // Lễ tân làm thủ tục trả phòng (Check-out) (UC10 - API 6)
  checkOut: async (bookingId, checkOutData = {}) => {
    return await axiosInstance.post(`/receptionist/bookings/${bookingId}/check-out`, checkOutData);
  },

  // Phase 2: Lễ tân thêm dịch vụ phát sinh vào đơn phòng (POST /api/v1/receptionist/bookings/{bookingId}/services) (UC11)
  addServiceToBooking: async (bookingId, serviceData) => {
    const payload = Array.isArray(serviceData) ? serviceData : [serviceData];
    return await axiosInstance.post(`/receptionist/bookings/${bookingId}/services`, payload);
  },

  // Phase 2: Lấy danh sách dịch vụ đã dùng và hóa đơn tóm tắt (GET /api/v1/receptionist/bookings/{bookingId}/services) (UC11)
  getBookingServices: async (bookingId) => {
    return await axiosInstance.get(`/receptionist/bookings/${bookingId}/services`);
  },

  // Khách hàng hủy đơn đặt phòng của mình (UC08)
  cancelMyBooking: async (bookingId, reason) => {
    return await axiosInstance.patch(`/bookings/${bookingId}/cancel`, {
      reason,
      cancelReason: reason,
    });
  },

  // Hủy đơn đặt phòng (tương thích ngược: mặc định gọi endpoint khách hàng)
  cancelBooking: async (bookingId, reason) => {
    return await axiosInstance.patch(`/bookings/${bookingId}/cancel`, {
      reason,
      cancelReason: reason,
    });
  },
};

export default bookingService;
