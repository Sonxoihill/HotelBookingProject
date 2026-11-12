package com.hotel.booking.dto.admin;

import io.swagger.v3.oas.annotations.media.Schema;
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
@Schema(description = "Dữ liệu yêu cầu tạo mới hoặc cập nhật danh mục loại phòng (UC13b)")
public class RoomCategoryRequest {

    @NotBlank(message = "Tên loại phòng không được để trống")
    @Schema(description = "Tên loại phòng / hạng phòng", example = "Presidential Ocean Suite", requiredMode = Schema.RequiredMode.REQUIRED)
    private String name;

    @NotNull(message = "Giá cơ bản không được để trống")
    @DecimalMin(value = "0.01", inclusive = true, message = "Giá cơ bản phải lớn hơn 0")
    @Schema(description = "Giá cơ bản mỗi đêm (VNĐ)", example = "2500000", requiredMode = Schema.RequiredMode.REQUIRED)
    private BigDecimal basePrice;

    @NotNull(message = "Sức chứa không được để trống")
    @Min(value = 1, message = "Sức chứa tối thiểu là 1 người")
    @Schema(description = "Sức chứa tối đa (số khách)", example = "4", requiredMode = Schema.RequiredMode.REQUIRED)
    private Integer capacity;

    @NotNull(message = "Số giường không được để trống")
    @Min(value = 1, message = "Số giường tối thiểu là 1")
    @Schema(description = "Số lượng giường trong phòng", example = "2", requiredMode = Schema.RequiredMode.REQUIRED)
    private Integer bedCount;

    @NotNull(message = "Diện tích không được để trống")
    @DecimalMin(value = "0.01", inclusive = true, message = "Diện tích phải lớn hơn 0")
    @Schema(description = "Diện tích phòng (m²)", example = "85.0", requiredMode = Schema.RequiredMode.REQUIRED)
    private BigDecimal area;

    @Schema(description = "Mô tả loại giường", example = "2 Giường King size cao cấp")
    private String bedType;

    @Schema(description = "Mô tả chi tiết tiện nghi và không gian hạng phòng", example = "Phòng Tổng thống hướng biển toàn cảnh kèm phòng khách riêng và bồn tắm Jacuzzi.")
    private String description;

    @Schema(description = "Đường dẫn hình ảnh đại diện hạng phòng", example = "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b")
    private String imageUrl;
}
