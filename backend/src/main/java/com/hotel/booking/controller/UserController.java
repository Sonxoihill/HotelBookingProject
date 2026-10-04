package com.hotel.booking.controller;

import com.hotel.booking.common.response.ApiResponse;
import com.hotel.booking.config.JwtUtil;
import com.hotel.booking.dto.user.ChangePasswordRequest;
import com.hotel.booking.dto.user.UpdateProfileRequest;
import com.hotel.booking.dto.user.UserProfileResponse;
import com.hotel.booking.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
@Tag(name = "User Management", description = "Các API quản lý thông tin cá nhân và thay đổi mật khẩu")
@SecurityRequirement(name = "bearerAuth")
public class UserController {

    private final UserService userService;
    private final JwtUtil jwtUtil;

    @Operation(summary = "Lấy thông tin hồ sơ cá nhân", description = "Trả về thông tin chi tiết tài khoản của người dùng đang đăng nhập.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Lấy thông tin hồ sơ thành công")
    })
    @GetMapping("/profile")
    public ApiResponse<UserProfileResponse> getProfile(
            @Parameter(hidden = true)
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        String email = jwtUtil.extractEmail(authHeader);
        UserProfileResponse profile = userService.getProfile(email);
        return ApiResponse.success("Lấy thông tin hồ sơ thành công", profile);
    }

    @Operation(summary = "Cập nhật thông tin hồ sơ", description = "Cập nhật họ tên, số điện thoại, địa chỉ cá nhân.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Cập nhật hồ sơ thành công")
    })
    @PutMapping("/profile")
    public ApiResponse<UserProfileResponse> updateProfile(
            @Parameter(hidden = true)
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @Valid @RequestBody UpdateProfileRequest request
    ) {
        String email = jwtUtil.extractEmail(authHeader);
        UserProfileResponse updated = userService.updateProfile(email, request);
        return ApiResponse.success("Cập nhật hồ sơ thành công", updated);
    }

    @Operation(summary = "Đổi mật khẩu", description = "Thay đổi mật khẩu đăng nhập với việc xác thực mật khẩu cũ.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Đổi mật khẩu thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Mật khẩu cũ không chính xác hoặc mật khẩu mới không hợp lệ")
    })
    @PutMapping("/change-password")
    public ApiResponse<Void> changePassword(
            @Parameter(hidden = true)
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @Valid @RequestBody ChangePasswordRequest request
    ) {
        String email = jwtUtil.extractEmail(authHeader);
        userService.changePassword(email, request);
        return ApiResponse.success("Đổi mật khẩu thành công!", null);
    }
}
