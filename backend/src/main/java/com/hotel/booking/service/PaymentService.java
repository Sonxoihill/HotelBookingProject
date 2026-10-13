package com.hotel.booking.service;

import com.hotel.booking.dto.payment.VNPayIpnResponse;

import java.math.BigDecimal;
import java.util.Map;

public interface PaymentService {

    /**
     * Tạo URL thanh toán VNPay Sandbox (SCRUM-94 API 1)
     *
     * @param bookingId ID đơn đặt phòng
     * @param amount    Số tiền thanh toán (nếu null lấy từ booking.totalAmount)
     * @param ipAddress Địa chỉ IP của client
     * @return Chuỗi URL chuyển hướng sang cổng VNPay
     */
    String createVNPayPaymentUrl(Long bookingId, BigDecimal amount, String ipAddress);

    /**
     * Webhook IPN xử lý kết quả giao dịch gọi ngầm từ máy chủ VNPay (SCRUM-94 API 2)
     *
     * @param params Toàn bộ tham số VNPay gửi qua query string
     * @return Phản hồi chuẩn format {"RspCode": "...", "Message": "..."}
     */
    VNPayIpnResponse processVNPayIpn(Map<String, String> params);

    /**
     * Xử lý kết quả trả về khi khách hàng quay lại từ cổng thanh toán VNPay
     *
     * @param params Các tham số callback từ VNPay
     * @return Kết quả giao dịch đã được xác thực
     */
    Map<String, Object> processVNPayReturn(Map<String, String> params);
}
