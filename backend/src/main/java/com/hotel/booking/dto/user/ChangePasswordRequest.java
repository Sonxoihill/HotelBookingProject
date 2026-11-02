package com.hotel.booking.dto.user;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Yêu cầu đổi mật khẩu tài khoản cá nhân (UC03)")
public class ChangePasswordRequest {

    @NotBlank(message = "Mật khẩu hiện tại không được để trống")
    @Schema(description = "Mật khẩu hiện tại đang sử dụng", example = "123456", requiredMode = Schema.RequiredMode.REQUIRED)
    private String currentPassword;

    @NotBlank(message = "Mật khẩu mới không được để trống")
    @Size(min = 6, message = "Mật khẩu phải chứa ít nhất 6 ký tự")
    @Schema(description = "Mật khẩu mới (tối thiểu 6 ký tự)", example = "654321", requiredMode = Schema.RequiredMode.REQUIRED)
    private String newPassword;

    @NotBlank(message = "Xác nhận mật khẩu mới không được để trống")
    @Schema(description = "Xác nhận lại mật khẩu mới", example = "654321", requiredMode = Schema.RequiredMode.REQUIRED)
    private String confirmPassword;
}
