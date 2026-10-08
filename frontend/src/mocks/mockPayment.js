/**
 * Mock Data: Xử lý thanh toán VNPay
 * Mô phỏng phản hồi tạo URL và các kịch bản kết quả VNPay
 */

/**
 * Giả lập tạo URL chuyển hướng VNPay
 * @param {Object} paymentData Dữ liệu đơn thanh toán
 * @param {string} scenario Kịch bản: 'SUCCESS' (00) hoặc 'CANCEL' (24) hoặc 'ERROR' (99)
 */
export const createMockVNPayUrl = (paymentData, scenario = 'SUCCESS') => {
  const bookingId = paymentData?.roomId || paymentData?.bookingId || Math.floor(1000 + Math.random() * 9000);
  const amount = (paymentData?.totalAmount || paymentData?.amount || 1320000) * 100; // VNPay nhân 100
  const now = new Date();
  const payDateStr = now.toISOString().replace(/[-:T]/g, '').slice(0, 14);

  const params = new URLSearchParams();
  params.set('vnp_TxnRef', String(bookingId));
  params.set('vnp_Amount', String(amount));
  params.set('vnp_BankCode', 'NCB');
  params.set('vnp_TransactionNo', String(Math.floor(10000000 + Math.random() * 90000000)));
  params.set('vnp_PayDate', payDateStr);
  params.set('vnp_OrderInfo', encodeURIComponent(`Thanh toan dat phong #${bookingId} - Khach san LuxeStay`));

  if (scenario === 'CANCEL') {
    params.set('vnp_ResponseCode', '24');
  } else if (scenario === 'ERROR') {
    params.set('vnp_ResponseCode', '99');
  } else {
    // Mặc định thành công
    params.set('vnp_ResponseCode', '00');
  }

  // URL trả về Frontend
  const returnBase = paymentData?.returnUrl || '/booking/vnpay-return';
  return `${returnBase}?${params.toString()}`;
};
