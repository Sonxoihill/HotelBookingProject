package com.hotel.booking.dto.admin;

import com.hotel.booking.enums.RoomStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Dữ liệu yêu cầu tạo mới hoặc cập nhật phòng vật lý (UC13a)")
public class AdminRoomRequest {

    @NotBlank(message = "Số phòng không được để trống")
    @Schema(description = "Số hiệu phòng (duy nhất)", example = "401", requiredMode = Schema.RequiredMode.REQUIRED)
    private String roomNumber;

    @NotNull(message = "Tầng không được để trống")
    @Min(value = 1, message = "Tầng phải từ 1 trở lên")
    @Schema(description = "Số tầng của phòng (từ 1 trở lên)", example = "4", requiredMode = Schema.RequiredMode.REQUIRED)
    private Integer floor;

    @NotNull(message = "Loại phòng không được để trống")
    @Schema(description = "ID loại phòng (Room Category)", example = "2", requiredMode = Schema.RequiredMode.REQUIRED)
    private Long categoryId;

    @Schema(description = "Trạng thái phòng vật lý (AVAILABLE, RESERVED, OCCUPIED, DIRTY, MAINTENANCE)", example = "AVAILABLE")
    private RoomStatus status;
}
