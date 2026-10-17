package com.hotel.booking.dto.receptionist;

import com.fasterxml.jackson.annotation.JsonAlias;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Yêu cầu hủy đơn đặt phòng từ Lễ tân")
public class ReceptionistCancelBookingRequest {

    @NotBlank(message = "Lý do hủy phòng là bắt buộc")
    @JsonAlias({"reason", "cancel_reason"})
    @Schema(description = "Lý do hủy đơn đặt phòng", example = "Khách yêu cầu hủy chuyến đi", requiredMode = Schema.RequiredMode.REQUIRED)
    private String cancelReason;
}
