/**
 * bookingFolioSync.js (Deprecated)
 * Toàn bộ dữ liệu giả (MockData) đã được loại bỏ hoàn toàn.
 * Dự án chuyển sang kết nối trực tiếp 100% với REST API Backend:
 * - GET /api/v1/services
 * - GET /api/v1/receptionist/rooms/grid
 * - GET /api/v1/receptionist/bookings
 * - POST /api/v1/receptionist/bookings/{bookingId}/services
 * - GET /api/v1/receptionist/bookings/{bookingId}/services
 * - GET /api/v1/receptionist/bookings/{bookingId}/checkout-summary
 * - POST /api/v1/receptionist/bookings/{bookingId}/check-out
 */

export const PRESET_10_SERVICES = [];
export const INITIAL_CHECKED_IN_BOOKINGS = [];

export const calculateBookingTotals = (booking) => {
  if (!booking) return null;
  return booking;
};

export const bookingFolioSync = {
  getCheckedInBookings: () => [],
  getBookingById: () => null,
  addServiceToBooking: () => {},
  resetToDefault: () => {},
};

export default bookingFolioSync;
