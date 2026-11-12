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
@Tag(name = "7. Khách hàng - Hồ sơ Cá nhân (User Profile)", description = "Các API quản lý thông tin hồ sơ cá nhân và đổi mật khẩu tài khoản (UC03)")
@SecurityRequirement(name = "bearerAuth")
public class UserController {

    private final UserService userService;
    private final JwtUtil jwtUtil;

    @Operation(summary = "Lấy thông tin hồ sơ cá nhân (UC03)", description = "Trả về thông tin chi tiết tài khoản của người dùng đang đăng nhập.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Lấy thông tin hồ sơ thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Chưa đăng nhập hoặc JWT Token hết hạn")
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

    @Operation(summary = "Cập nhật thông tin hồ sơ cá nhân (UC03)", description = "Cập nhật họ tên và số điện thoại liên hệ của người dùng đang đăng nhập.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Cập nhật hồ sơ thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Họ tên hoặc số điện thoại không đúng định dạng"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Chưa đăng nhập hoặc JWT Token hết hạn")
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

    @Operation(summary = "Đổi mật khẩu đăng nhập (UC03)", description = "Thay đổi mật khẩu đăng nhập sau khi xác thực mật khẩu hiện tại trùng khớp.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Đổi mật khẩu thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Mật khẩu hiện tại không chính xác hoặc mật khẩu mới không hợp lệ"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Chưa đăng nhập hoặc JWT Token hết hạn")
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
