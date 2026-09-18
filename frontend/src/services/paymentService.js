import axiosInstance from './axiosInstance';

/**
 * Service xử lý : Cổng thanh toán (Payment Gateway)
 */
export const paymentService = {
  // Tạo URL thanh toán chuyển hướng sang Cổng thanh toán (VNPAY, MoMo, ZaloPay,...)
  createPaymentUrl: async (paymentData) => {
    return await axiosInstance.post('/payments/create-payment-url', paymentData);
  },

  // Kiểm tra trạng thái giao dịch thanh toán từ Cổng thanh toán
  verifyPaymentStatus: async (params) => {
    return await axiosInstance.get('/payments/vnpay-return', { params });
  },

  // Lễ tân ghi nhận thanh toán tiền mặt tại quầy
  recordCashPayment: async (bookingId, cashData) => {
    return await axiosInstance.post(`/payments/cash/${bookingId}`, cashData);
  },
};

export default paymentService;
