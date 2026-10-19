package com.hotel.booking.dto.booking;

import com.fasterxml.jackson.annotation.JsonAlias;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Dữ liệu yêu cầu hủy đơn đặt phòng")
public class CancelBookingRequest {

    @NotBlank(message = "Lý do hủy phòng là bắt buộc")
    @JsonAlias({"cancelReason", "cancel_reason"})
    @Schema(description = "Lý do hủy phòng", example = "Thay đổi lịch trình công tác đột xuất", requiredMode = Schema.RequiredMode.REQUIRED)
    private String reason;
}

