package com.hotel.booking.dto.receptionist;

import com.fasterxml.jackson.annotation.JsonAlias;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Yêu cầu xác nhận Check-out từ Lễ tân")
public class CheckOutRequest {

    @Builder.Default
    @JsonAlias({"payment_method"})
    @Schema(description = "Phương thức thanh toán khoản còn lại (CASH, CREDIT_CARD, TRANSFER, VNPAY)", example = "CASH")
    private String paymentMethod = "CASH";

    @Schema(description = "Ghi chú khi trả phòng", example = "Khách hài lòng, thanh toán đủ tiền mặt tại quầy")
    private String notes;
}
