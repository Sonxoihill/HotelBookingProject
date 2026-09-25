package com.hotel.booking.dto.booking;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CancelBookingRequest {

    @NotBlank(message = "Lý do hủy phòng là bắt buộc")
    private String reason;
}
