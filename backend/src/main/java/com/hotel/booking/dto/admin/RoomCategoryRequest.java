package com.hotel.booking.dto.admin;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoomCategoryRequest {

    @NotBlank(message = "Tên loại phòng không được để trống")
    private String name;

    @NotNull(message = "Giá cơ bản không được để trống")
    @DecimalMin(value = "0.01", inclusive = true, message = "Giá cơ bản phải lớn hơn 0")
    private BigDecimal basePrice;

    @NotNull(message = "Sức chứa không được để trống")
    @Min(value = 1, message = "Sức chứa tối thiểu là 1 người")
    private Integer capacity;

    @NotNull(message = "Số giường không được để trống")
    @Min(value = 1, message = "Số giường tối thiểu là 1")
    private Integer bedCount;

    @NotNull(message = "Diện tích không được để trống")
    @DecimalMin(value = "0.01", inclusive = true, message = "Diện tích phải lớn hơn 0")
    private BigDecimal area;

    private String bedType;

    private String description;

    private String imageUrl;
}
