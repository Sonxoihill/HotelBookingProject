package com.hotel.booking.dto.payment;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Dữ liệu phản hồi cho Webhook IPN của VNPay")
public class VNPayIpnResponse {

    @JsonProperty("RspCode")
    @Schema(description = "Mã phản hồi chuẩn VNPay (00: Thành công, 01: Không tìm thấy đơn, 02: Đơn đã xác nhận, 04: Số tiền không hợp lệ, 97: Chữ ký không hợp lệ, 99: Lỗi khác)", example = "00")
    private String rspCode;

    @JsonProperty("Message")
    @Schema(description = "Thông báo kết quả xử lý", example = "Confirm Success")
    private String message;
}

