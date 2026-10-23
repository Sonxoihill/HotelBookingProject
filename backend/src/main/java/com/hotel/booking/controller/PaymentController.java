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

import com.hotel.booking.config.vnpay.VNPayConfig;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/payment")
@RequiredArgsConstructor
@Tag(name = "Payment Management", description = "Các API thanh toán và Webhook cổng thanh toán VNPay Sandbox (SCRUM-94)")
public class PaymentController {

    private final PaymentService paymentService;
    private final VNPayConfig vnPayConfig;

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

            @Parameter(description = "URL callback tùy biến sau khi hoàn tất thanh toán VNPay", required = false)
            @RequestParam(value = "returnUrl", required = false) String returnUrl,

            HttpServletRequest request
    ) {
        String ipAddress = VNPayUtil.getIpAddress(request);
        String paymentUrl;
        if (returnUrl != null && !returnUrl.trim().isEmpty()) {
            paymentUrl = paymentService.createVNPayPaymentUrl(bookingId, amount, ipAddress, returnUrl);
        } else {
            paymentUrl = paymentService.createVNPayPaymentUrl(bookingId, amount, ipAddress);
        }
        return ApiResponse.success("Tạo URL thanh toán VNPay thành công", new PaymentUrlResponse(paymentUrl));
    }

    @Operation(
            summary = "Webhook IPN nhận kết quả thanh toán từ VNPay (SCRUM-94 API 2 & SCRUM-121)",
            description = "Máy chủ VNPay gọi ngầm sang API này để thông báo kết quả giao dịch. Hệ thống kiểm tra IP nguồn hợp lệ (SCRUM-121), verify checksum HMAC-SHA512 để chống giả mạo, cập nhật trạng thái đơn hàng và trả về định dạng chuẩn {\"RspCode\":\"00\",\"Message\":\"Confirm Success\"}."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Xử lý IPN thành công và trả về mã phản hồi cho VNPay"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Truy cập bị từ chối do IP nguồn không thuộc danh sách máy chủ VNPay hợp lệ")
    })
    @GetMapping("/vnpay-ipn")
    public ResponseEntity<VNPayIpnResponse> processVNPayIpn(
            @Parameter(description = "Toàn bộ tham số VNPay gửi kèm query string")
            @RequestParam Map<String, String> params,
            HttpServletRequest request
    ) {
        String clientIp = VNPayUtil.getIpAddress(request);
        if (!vnPayConfig.isAllowedIp(clientIp)) {
            log.warn("VNPay IPN: Từ chối truy cập từ IP lạ không hợp lệ: {}", clientIp);
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(new VNPayIpnResponse("99", "Forbidden: Invalid IP " + clientIp));
        }

        VNPayIpnResponse response = paymentService.processVNPayIpn(params);
        return ResponseEntity.ok(response);
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
