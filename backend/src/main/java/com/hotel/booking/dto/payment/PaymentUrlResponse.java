package com.hotel.booking.dto.payment;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Dữ liệu phản hồi đường dẫn thanh toán VNPay")
public class PaymentUrlResponse {

    @JsonProperty("paymentUrl")
    @Schema(
            description = "Đường dẫn URL chuyển hướng đến cổng thanh toán VNPay Sandbox",
            example = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=150000000&vnp_Command=pay&vnp_CreateDate=20261007223000&vnp_CurrCode=VND&vnp_IpAddr=127.0.0.1&vnp_Locale=vn&vnp_OrderInfo=Thanh+toan+dat+phong+%231&vnp_OrderType=other&vnp_ReturnUrl=http%3A%2F%2Flocalhost%3A8080%2Fapi%2Fv1%2Fpayment%2Fvnpay-return&vnp_TmnCode=CGXZLS0Z&vnp_TxnRef=1_1728315000000&vnp_Version=2.1.0&vnp_SecureHash=..."
    )
    private String paymentUrl;

    @JsonProperty("url")
    @Schema(description = "Bí danh tương đương với paymentUrl (hỗ trợ tương thích frontend)")
    public String getUrl() {
        return paymentUrl;
    }
}

