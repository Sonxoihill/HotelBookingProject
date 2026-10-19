package com.hotel.booking.dto.receptionist;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddServiceItemRequest {

    @NotNull(message = "serviceId không được để trống")
    private Long serviceId;

    @NotNull(message = "quantity không được để trống")
    @Min(value = 1, message = "Số lượng dịch vụ phải lớn hơn 0")
    private Integer quantity;
}
