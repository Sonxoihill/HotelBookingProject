/**
 * Mock Data: Đơn đặt phòng và lịch sử giao dịch
 * Mô phỏng phản hồi từ Backend API /bookings
 */
export const MOCK_BOOKING_RESPONSE = {
  id: 1082,
  bookingCode: 'LX-20261082',
  status: 'CONFIRMED',
  totalAmount: 2640000,
  checkIn: '2026-10-15',
  checkOut: '2026-10-17',
  paymentMethod: 'VNPAY',
  paymentStatus: 'PAID',
  room: {
    id: 1,
    roomNumber: '101',
    categoryName: 'Deluxe Hướng Biển',
  },
  guest: {
    fullName: 'Nguyễn Văn An',
    phone: '0912345678',
    email: 'nguyenvanan@gmail.com',
  },
  createdAt: new Date().toISOString(),
};

/**
 * Giả lập tạo đơn đặt phòng mới trong bộ nhớ
 */
export const createMockBooking = (bookingData) => {
  const generatedId = Math.floor(1000 + Math.random() * 9000);
  return {
    id: generatedId,
    bookingCode: `LX-${generatedId}`,
    status: bookingData.paymentMethod === 'RECEPTION' ? 'PENDING' : 'CONFIRMED',
    totalAmount: bookingData.totalAmount || 1320000,
    checkIn: bookingData.checkIn,
    checkOut: bookingData.checkOut,
    paymentMethod: bookingData.paymentMethod,
    paymentStatus: bookingData.paymentMethod === 'RECEPTION' ? 'UNPAID' : 'PAID',
    guest: {
      fullName: bookingData.fullName,
      phone: bookingData.phone,
      email: bookingData.email,
    },
    specialRequests: bookingData.specialRequests || '',
    createdAt: new Date().toISOString(),
  };
};
