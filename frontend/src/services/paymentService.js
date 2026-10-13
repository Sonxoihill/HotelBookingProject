import axiosInstance from './axiosInstance';

/**
 * Service xử lý: Cổng thanh toán (Payment Gateway)
 * Kết nối 100% với Backend API thật (PaymentController - /payment):
 * - GET /payment/create-url: Tạo URL thanh toán VNPay Sandbox băm HMAC-SHA512
 * - GET /payment/vnpay-return: Xác thực kết quả thanh toán, cập nhật trạng thái đơn hàng và gửi email xác nhận
 */
export const paymentService = {
  /**
   * Tạo URL thanh toán VNPay Sandbox từ Backend (GET /payment/create-url)
   * @param {Object} data { bookingId: number, amount?: number }
   * @returns {Promise<{ paymentUrl: string }>} URL thanh toán trả về từ Backend
   */
  createVNPayUrl: async ({ bookingId, amount }) => {
    const params = { bookingId };
    if (amount) {
      params.amount = amount;
    }
    const res = await axiosInstance.get('/payment/create-url', { params });
    const data = res?.data || res;
    const url = data?.paymentUrl || data?.url || res?.paymentUrl || res?.url;
    return {
      paymentUrl: url,
      url: url,
    };
  },

  /**
   * Xác thực và xử lý kết quả thanh toán VNPay (GET /payment/vnpay-return)
   * Backend kiểm tra chữ ký HMAC-SHA512, cập nhật trạng thái đơn CONFIRMED trong Database và gửi email xác nhận
   * @param {Object} params Tham số trả về từ VNPay
   */
  verifyVNPayReturn: async (params) => {
    return await axiosInstance.get('/payment/vnpay-return', { params });
  },

  // Tạo URL thanh toán chung
  createPaymentUrl: async (params) => {
    return await axiosInstance.get('/payment/create-url', { params });
  },

  // Kiểm tra trạng thái giao dịch thanh toán từ Cổng thanh toán
  verifyPaymentStatus: async (params) => {
    return await axiosInstance.get('/payment/vnpay-return', { params });
  },

  // Lễ tân ghi nhận thanh toán tiền mặt tại quầy
  recordCashPayment: async (bookingId, cashData) => {
    return await axiosInstance.post(`/payments/cash/${bookingId}`, cashData);
  },
};

export default paymentService;
