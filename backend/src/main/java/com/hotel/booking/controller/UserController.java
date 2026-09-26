package com.hotel.booking.controller;

import com.hotel.booking.common.response.ApiResponse;
import com.hotel.booking.config.JwtUtil;
import com.hotel.booking.dto.user.ChangePasswordRequest;
import com.hotel.booking.dto.user.UpdateProfileRequest;
import com.hotel.booking.dto.user.UserProfileResponse;
import com.hotel.booking.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final JwtUtil jwtUtil;

    @GetMapping("/profile")
    public ApiResponse<UserProfileResponse> getProfile(
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        String email = jwtUtil.extractEmail(authHeader);
        UserProfileResponse profile = userService.getProfile(email);
        return ApiResponse.success("Lấy thông tin hồ sơ thành công", profile);
    }

    @PutMapping("/profile")
    public ApiResponse<UserProfileResponse> updateProfile(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @Valid @RequestBody UpdateProfileRequest request
    ) {
        String email = jwtUtil.extractEmail(authHeader);
        UserProfileResponse updated = userService.updateProfile(email, request);
        return ApiResponse.success("Cập nhật hồ sơ thành công", updated);
    }

    @PutMapping("/change-password")
    public ApiResponse<Void> changePassword(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @Valid @RequestBody ChangePasswordRequest request
    ) {
        String email = jwtUtil.extractEmail(authHeader);
        userService.changePassword(email, request);
        return ApiResponse.success("Đổi mật khẩu thành công!", null);
    }
}
