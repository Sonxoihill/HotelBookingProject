package com.hotel.booking.controller;

import com.hotel.booking.common.response.ApiResponse;
import com.hotel.booking.config.vnpay.VNPayConfig;
import com.hotel.booking.config.vnpay.VNPayUtil;
import com.hotel.booking.dto.payment.PaymentUrlResponse;
import com.hotel.booking.dto.payment.VNPayIpnResponse;
import com.hotel.booking.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/payment")
@RequiredArgsConstructor
@Tag(name = "5. Khách hàng - Thanh toán VNPay Sandbox (Payment)", description = "Các API tạo URL thanh toán VNPay HMAC-SHA512, xử lý Webhook IPN và Return URL (UC06 - SCRUM-94)")
public class PaymentController {

    private final PaymentService paymentService;
    private final VNPayConfig vnPayConfig;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @Schema(description = "Dữ liệu yêu cầu khởi tạo đường dẫn thanh toán VNPay Sandbox")
    public static class CreateVNPayUrlRequest {
        @Schema(description = "Mã đơn đặt phòng cần thanh toán", example = "4", requiredMode = Schema.RequiredMode.REQUIRED)
        private Long bookingId;

        @Schema(description = "Số tiền thanh toán (VNĐ). Nếu để trống sẽ tự động lấy theo tổng tiền đơn đặt phòng", example = "1500000")
        private BigDecimal amount;

        @Schema(description = "URL callback tùy biến sau khi hoàn tất thanh toán trên cổng VNPay", example = "http://localhost:5173/api/v1/payment/vnpay-return")
        private String returnUrl;
    }

    @Operation(
            summary = "Tạo URL thanh toán VNPay Sandbox qua Query Params (GET)",
            description = "Nhận bookingId và số tiền amount (tùy chọn, mặc định lấy từ booking), tạo chuỗi tham số và ký số HMAC-SHA512 bằng vnp_HashSecret, trả về URL thanh toán VNPay Sandbox để chuyển hướng khách hàng."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Tạo URL thanh toán VNPay thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Thông tin đơn hàng hoặc số tiền không hợp lệ"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Không tìm thấy đơn đặt phòng theo bookingId")
    })
    @GetMapping({"/create-url", "/create-vnpay-url"})
    public ApiResponse<PaymentUrlResponse> createPaymentUrl(
            @Parameter(description = "Mã đơn đặt phòng", example = "4", required = true)
            @RequestParam("bookingId") Long bookingId,

            @Parameter(description = "Số tiền thanh toán (VNĐ). Nếu để trống sẽ lấy từ tổng tiền đơn hàng.", example = "1500000")
            @RequestParam(value = "amount", required = false) BigDecimal amount,

            @Parameter(description = "URL callback tùy biến sau khi hoàn tất thanh toán VNPay", example = "http://localhost:5173/api/v1/payment/vnpay-return")
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
            summary = "Tạo URL thanh toán VNPay Sandbox qua JSON Body (POST)",
            description = "Nhận thông tin đơn đặt phòng (bookingId, amount, returnUrl) từ JSON Request Body hoặc Query Params, ký số HMAC-SHA512 và trả về URL thanh toán VNPay Sandbox."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Tạo URL thanh toán VNPay thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Thiếu bookingId hoặc dữ liệu không hợp lệ"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Không tìm thấy đơn đặt phòng theo bookingId")
    })
    @PostMapping({"/create-vnpay-url", "/create-url"})
    public ApiResponse<PaymentUrlResponse> createPaymentUrlPost(
            @Parameter(description = "Mã đơn đặt phòng (tùy chọn nếu đã truyền trong JSON Body)", example = "4")
            @RequestParam(value = "bookingId", required = false) Long bookingIdParam,
            @Parameter(description = "Số tiền thanh toán (VNĐ)", example = "1500000")
            @RequestParam(value = "amount", required = false) BigDecimal amountParam,
            @RequestBody(required = false) CreateVNPayUrlRequest body,
            HttpServletRequest request
    ) {
        Long bookingId = (body != null && body.getBookingId() != null) ? body.getBookingId() : bookingIdParam;
        BigDecimal amount = (body != null && body.getAmount() != null) ? body.getAmount() : amountParam;
        String returnUrl = (body != null) ? body.getReturnUrl() : null;

        if (bookingId == null) {
            bookingId = 1L;
        }

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
            summary = "Webhook IPN nhận kết quả thanh toán từ VNPay (SCRUM-94 & SCRUM-121)",
            description = "Máy chủ VNPay gọi ngầm sang API này để thông báo kết quả giao dịch. Hệ thống kiểm tra IP nguồn hợp lệ trong whitelist (SCRUM-121), xác thực chữ ký HMAC-SHA512 chống giả mạo, cập nhật trạng thái đơn hàng sang CONFIRMED và trả về định dạng chuẩn {\"RspCode\":\"00\",\"Message\":\"Confirm Success\"}."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Xử lý IPN thành công và trả về mã phản hồi chuẩn VNPay"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Truy cập bị từ chối do IP nguồn không thuộc danh sách máy chủ VNPay hợp lệ")
    })
    @GetMapping("/vnpay-ipn")
    public ResponseEntity<VNPayIpnResponse> processVNPayIpn(
            @Parameter(description = "Toàn bộ tham số VNPay gửi kèm qua query string (vnp_TxnRef, vnp_Amount, vnp_ResponseCode, vnp_SecureHash...)")
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
            summary = "Xử lý kết quả trả về (Return URL) khi khách hoàn tất thanh toán trên VNPay",
            description = "API tiếp nhận URL callback từ trình duyệt người dùng sau khi hoàn tất thanh toán trên cổng VNPay, xác thực chữ ký bảo mật và trả về kết quả giao dịch."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Xác thực kết quả thanh toán thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Tham số trả về không hợp lệ hoặc sai chữ ký")
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
