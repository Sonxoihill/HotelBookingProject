package com.hotel.booking.dto.receptionist;

import io.swagger.v3.oas.annotations.media.Schema;
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
@Schema(description = "Thông tin dịch vụ phụ trợ thêm vào hóa đơn lưu trú (UC11)")
public class AddServiceItemRequest {

    @NotNull(message = "serviceId không được để trống")
    @Schema(description = "ID của dịch vụ cần thêm (ví dụ: 1 = Bữa sáng Buffet, 5 = Nước ngọt Cocacola)", example = "1", requiredMode = Schema.RequiredMode.REQUIRED)
    private Long serviceId;

    @NotNull(message = "quantity không được để trống")
    @Min(value = 1, message = "Số lượng dịch vụ phải lớn hơn 0")
    @Schema(description = "Số lượng sử dụng (tối thiểu 1)", example = "2", requiredMode = Schema.RequiredMode.REQUIRED)
    private Integer quantity;
}
