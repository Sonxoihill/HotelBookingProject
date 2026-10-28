package com.hotel.booking.dto.admin;

import com.hotel.booking.enums.UserRole;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Yêu cầu thay đổi phân quyền nhân sự")
public class UpdateUserRoleRequest {

    @NotNull(message = "Vai trò mới không được để trống")
    @Schema(description = "Vai trò quyền hạn mới: ADMIN, RECEPTIONIST, CUSTOMER, GUEST", example = "ADMIN", requiredMode = Schema.RequiredMode.REQUIRED)
    private UserRole role;
}
