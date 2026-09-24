package com.hotel.booking.dto.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateProfileRequest {

    @NotBlank(message = "Họ và tên không được để trống")
    @Size(min = 2, max = 100, message = "Họ và tên phải từ 2 đến 100 ký tự")
    private String fullName;

    @Pattern(
        regexp = "^$|^(0[0-9]{9}|\\+84[0-9]{9})$",
        message = "Số điện thoại không hợp lệ! Bắt buộc phải là 10 số (bắt đầu bằng 0 và 9 số sau từ 0-9) hoặc bắt đầu bằng +84 và 9 số sau (0-9)."
    )
    private String phone;

    private String avatarUrl;
}
