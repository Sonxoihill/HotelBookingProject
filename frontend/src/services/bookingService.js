import axiosInstance from './axiosInstance';
import { USE_MOCK } from './config';
import { mockBookingService } from '../mocks/mockServices';

/**
 * Service xử lý:
 * - Đặt phòng (Khách hàng)
 * - Xem Lịch sử đặt phòng (Khách hàng)
 * - Quản lý Đơn đặt phòng (Lễ tân: xem, check-in, check-out, hủy)
 */
export const bookingService = {
  // Khách hàng tạo yêu cầu đặt phòng mới
  createBooking: async (bookingData) => {
    if (USE_MOCK) {
      return await mockBookingService.createBooking(bookingData);
    }
    return await axiosInstance.post('/bookings', bookingData);
  },

  // Khách hàng xem lịch sử các đơn đặt phòng của mình
  getMyBookings: async (params) => {
    return await axiosInstance.get('/bookings/my-history', { params });
  },

  // Lễ tân lấy toàn bộ danh sách đơn đặt phòng theo bộ lọc
  getAllBookings: async (params) => {
    return await axiosInstance.get('/receptionist/bookings', { params });
  },

  // Lễ tân làm thủ tục nhận phòng (Check-in)
  checkIn: async (bookingId, checkInData = {}) => {
    return await axiosInstance.post(`/receptionist/bookings/${bookingId}/check-in`, checkInData);
  },

  // Lễ tân làm thủ tục trả phòng (Check-out)
  checkOut: async (bookingId, checkOutData = {}) => {
    return await axiosInstance.post(`/receptionist/bookings/${bookingId}/check-out`, checkOutData);
  },

  // Hủy đơn đặt phòng
  cancelBooking: async (bookingId, reason) => {
    return await axiosInstance.patch(`/bookings/${bookingId}/cancel`, { reason });
  },
};

export default bookingService;
