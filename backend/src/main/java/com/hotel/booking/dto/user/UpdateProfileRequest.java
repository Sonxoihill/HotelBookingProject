package com.hotel.booking.dto.user;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Yêu cầu cập nhật thông tin hồ sơ cá nhân (UC03)")
public class UpdateProfileRequest {

    @NotBlank(message = "Họ và tên không được để trống")
    @Pattern(regexp = "^[\\p{L}\\s]+$", message = "Họ và tên không đúng định dạng.")
    @Schema(description = "Họ và tên đầy đủ của người dùng", example = "Nguyễn Văn Khách", requiredMode = Schema.RequiredMode.REQUIRED)
    private String fullName;

    @NotBlank(message = "Số điện thoại không được để trống")
    @Pattern(
        regexp = "^(0|\\+84)[35789]\\d{8}$",
        message = "Số điện thoại không đúng định dạng."
    )
    @Schema(description = "Số điện thoại liên hệ (10 chữ số)", example = "0903456789", requiredMode = Schema.RequiredMode.REQUIRED)
    private String phone;
}
