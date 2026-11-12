package com.hotel.booking.dto.admin;

import com.hotel.booking.enums.ServiceStatus;
import io.swagger.v3.oas.annotations.media.Schema;
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
@Schema(description = "Dữ liệu yêu cầu tạo mới hoặc cập nhật dịch vụ khách sạn (UC14)")
public class AdminServiceRequest {

    @NotBlank(message = "Tên dịch vụ không được để trống")
    @Schema(description = "Tên dịch vụ phụ trợ", example = "Bữa tối lãng mạn trên tầng thượng", requiredMode = Schema.RequiredMode.REQUIRED)
    private String name;

    @NotNull(message = "Giá dịch vụ không được để trống")
    @DecimalMin(value = "0.01", inclusive = true, message = "Giá dịch vụ phải lớn hơn 0")
    @Schema(description = "Đơn giá dịch vụ (VNĐ)", example = "450000", requiredMode = Schema.RequiredMode.REQUIRED)
    private BigDecimal price;

    @NotBlank(message = "Đơn vị tính không được để trống")
    @Schema(description = "Đơn vị tính (Suất, Lần, Chuyến, Kg, Lon, Bộ...)", example = "Suất", requiredMode = Schema.RequiredMode.REQUIRED)
    private String unit;

    @Schema(description = "Mô tả chi tiết dịch vụ", example = "Thực đơn Âu 4 món kèm rượu vang và nến")
    private String description;

    @Schema(description = "Trạng thái dịch vụ (ACTIVE, INACTIVE)", example = "ACTIVE")
    private ServiceStatus status;
}
