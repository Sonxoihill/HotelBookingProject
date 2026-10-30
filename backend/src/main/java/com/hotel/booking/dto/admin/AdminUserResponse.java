package com.hotel.booking.dto.admin;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.hotel.booking.entity.User;
import com.hotel.booking.enums.Department;
import com.hotel.booking.enums.UserRole;
import com.hotel.booking.enums.UserStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "Thông tin tài khoản người dùng dành cho Quản trị viên")
public class AdminUserResponse {

    @Schema(description = "ID người dùng", example = "1")
    private Long id;

    @Schema(description = "Họ và tên", example = "Nguyễn Văn Lễ Tân")
    private String fullName;

    @Schema(description = "Email tài khoản", example = "receptionist@hotel.com")
    private String email;

    @Schema(description = "Số điện thoại", example = "0987654321")
    private String phone;

    @Schema(description = "Vai trò / quyền hạn: ADMIN, RECEPTIONIST, CUSTOMER, GUEST", example = "RECEPTIONIST")
    private UserRole role;

    @Schema(description = "Phòng ban làm việc", example = "FRONT_DESK")
    private Department department;

    @Schema(description = "Trạng thái tài khoản: ACTIVE, LOCKED", example = "ACTIVE")
    private UserStatus status;

    @Schema(description = "Thời điểm khởi tạo")
    private LocalDateTime createdAt;

    @Schema(description = "Mật khẩu tạm thời (chỉ trả về một lần khi Quản trị viên khởi tạo tài khoản mới)")
    private String temporaryPassword;

    public static AdminUserResponse fromEntity(User user) {
        if (user == null) return null;
        return AdminUserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .department(user.getDepartment())
                .status(user.getStatus())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
