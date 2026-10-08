import axiosInstance from './axiosInstance';
import { USE_MOCK } from './config';
import { mockPaymentService } from '../mocks/mockServices';

/**
 * Service xử lý : Cổng thanh toán (Payment Gateway)
 */
export const paymentService = {
  /**
   * Tạo URL thanh toán VNPay để chuyển hướng khách hàng sang cổng VNPay
   *
   * [KIẾN TRÚC MỞ RỘNG - DỄ DÀNG GHÉP API BACKEND]:
   * - Khi USE_MOCK = true: Sử dụng mockPaymentService mô phỏng tạo URL redirect sang /booking/vnpay-return
   * - Khi USE_MOCK = false: Tự động chuyển hướng gọi API Backend thật
   *
   * @param {Object} paymentData Dữ liệu đơn đặt phòng & thanh toán { bookingId, amount, orderInfo, returnUrl, ... }
   * @returns {Promise<{ paymentUrl: string }>} URL thanh toán trả về
   */
  createVNPayUrl: async (paymentData) => {
    if (USE_MOCK) {
      return await mockPaymentService.createVNPayUrl(paymentData);
    }

    // KHI BACKEND CUNG CẤP API THẬT (Deploy lên develop):
    return await axiosInstance.post('/payments/create-payment-url', paymentData);
  },

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
