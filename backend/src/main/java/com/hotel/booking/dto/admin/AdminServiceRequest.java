package com.hotel.booking.dto.admin;

import com.hotel.booking.enums.ServiceStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminServiceRequest {

    @NotBlank(message = "Tên dịch vụ không được để trống")
    private String name;

    @NotNull(message = "Giá dịch vụ không được để trống")
    @DecimalMin(value = "0.01", inclusive = true, message = "Giá dịch vụ phải lớn hơn 0")
    private BigDecimal price;

    @NotBlank(message = "Đơn vị tính không được để trống")
    private String unit;

    private String description;

    private ServiceStatus status;
}
