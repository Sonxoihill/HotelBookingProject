package com.hotel.booking.dto.admin;

import com.hotel.booking.enums.Department;
import com.hotel.booking.enums.UserRole;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Yêu cầu cấp tài khoản nhân sự mới (UC16)")
public class CreateStaffRequest {

    @NotBlank(message = "Họ và tên không được để trống")
    @Schema(description = "Họ và tên nhân sự", example = "Trần Thị Lễ Tân", requiredMode = Schema.RequiredMode.REQUIRED)
    private String fullName;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không đúng định dạng")
    @Schema(description = "Email đăng nhập", example = "letan01@gmail.com", requiredMode = Schema.RequiredMode.REQUIRED)
    private String email;

    @Schema(description = "Số điện thoại liên hệ", example = "0912345678")
    private String phone;

    @NotNull(message = "Vai trò không được để trống")
    @Schema(description = "Vai trò nhân sự (chỉ RECEPTIONIST hoặc ADMIN)", example = "RECEPTIONIST", requiredMode = Schema.RequiredMode.REQUIRED)
    private UserRole role;

    @Schema(description = "Phòng ban làm việc", example = "FRONT_DESK")
    private Department department;
}
