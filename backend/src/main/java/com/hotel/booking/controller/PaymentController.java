package com.hotel.booking.controller;

import com.hotel.booking.common.response.ApiResponse;
import com.hotel.booking.config.vnpay.VNPayUtil;
import com.hotel.booking.dto.payment.PaymentUrlResponse;
import com.hotel.booking.dto.payment.VNPayIpnResponse;
import com.hotel.booking.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/payment")
@RequiredArgsConstructor
@Tag(name = "Payment Management", description = "Các API thanh toán và Webhook cổng thanh toán VNPay Sandbox (SCRUM-94)")
public class PaymentController {

    private final PaymentService paymentService;

    @Operation(
            summary = "Tạo URL thanh toán VNPay Sandbox (SCRUM-94 API 1)",
            description = "Nhận bookingId và số tiền amount (tùy chọn, mặc định lấy từ booking), tạo chuỗi tham số và băm HMAC-SHA512 bằng vnp_HashSecret, trả về URL thanh toán VNPay để chuyển hướng khách hàng."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Tạo URL thanh toán thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Thông tin không hợp lệ"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Không tìm thấy đơn đặt phòng")
    })
    @GetMapping("/create-url")
    public ApiResponse<PaymentUrlResponse> createPaymentUrl(
            @Parameter(description = "Mã đơn đặt phòng", example = "1", required = true)
            @RequestParam("bookingId") Long bookingId,

            @Parameter(description = "Số tiền thanh toán (VNĐ). Nếu để trống sẽ lấy từ tổng tiền đơn hàng.", example = "1500000")
            @RequestParam(value = "amount", required = false) BigDecimal amount,

            HttpServletRequest request
    ) {
        String ipAddress = VNPayUtil.getIpAddress(request);
        String paymentUrl = paymentService.createVNPayPaymentUrl(bookingId, amount, ipAddress);
        return ApiResponse.success("Tạo URL thanh toán VNPay thành công", new PaymentUrlResponse(paymentUrl));
    }

    @Operation(
            summary = "Webhook IPN nhận kết quả thanh toán từ VNPay (SCRUM-94 API 2)",
            description = "Máy chủ VNPay gọi ngầm sang API này để thông báo kết quả giao dịch. Hệ thống verify checksum HMAC-SHA512 để chống giả mạo, cập nhật trạng thái đơn hàng (CONFIRMED nếu 00, FAILED nếu khác 00) và trả về định dạng chuẩn {\"RspCode\":\"00\",\"Message\":\"Confirm Success\"}."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Xử lý IPN thành công và trả về mã phản hồi cho VNPay")
    })
    @GetMapping("/vnpay-ipn")
    public VNPayIpnResponse processVNPayIpn(
            @Parameter(description = "Toàn bộ tham số VNPay gửi kèm query string")
            @RequestParam Map<String, String> params
    ) {
        return paymentService.processVNPayIpn(params);
    }

    @Operation(
            summary = "Xử lý kết quả trả về khi người dùng hoàn tất thanh toán trên VNPay",
            description = "API tiếp nhận URL callback từ trình duyệt người dùng sau khi hoàn tất thanh toán VNPay, xác thực chữ ký và trả về kết quả."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Xác thực kết quả thanh toán thành công")
    })
    @GetMapping("/vnpay-return")
    public ApiResponse<Map<String, Object>> processVNPayReturn(
            @Parameter(description = "Tham số VNPay trả về qua trình duyệt")
            @RequestParam Map<String, String> params
    ) {
        Map<String, Object> returnData = paymentService.processVNPayReturn(params);
        return ApiResponse.success("Xử lý kết quả thanh toán VNPay thành công", returnData);
    }
}
