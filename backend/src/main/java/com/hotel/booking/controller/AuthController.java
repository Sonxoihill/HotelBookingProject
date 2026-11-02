package com.hotel.booking.controller;

import com.hotel.booking.common.response.ApiResponse;
import com.hotel.booking.dto.request.LoginRequest;
import com.hotel.booking.dto.request.RegisterRequest;
import com.hotel.booking.dto.response.AuthResponse;
import com.hotel.booking.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "1. Khách hàng - Xác thực & Tài khoản (Authentication)", description = "Các API đăng ký tài khoản (UC01), đăng nhập nhận JWT Token (UC02) và kiểm tra phiên làm việc cho Khách hàng, Lễ tân và Quản trị viên")
public class AuthController {

        private final AuthService authService;

        @Operation(summary = "Đăng ký tài khoản khách hàng mới (UC01)", description = "Tạo tài khoản người dùng mới với vai trò mặc định là CUSTOMER, mã hóa mật khẩu bằng BCrypt và trả về JWT Token.")
        @ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Đăng ký tài khoản thành công", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiResponse.class))),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Dữ liệu đầu vào không hợp lệ (sai định dạng email, mật khẩu ngắn hoặc xác nhận mật khẩu không khớp)", content = @Content(mediaType = "application/json")),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Email hoặc số điện thoại đã tồn tại trong hệ thống", content = @Content(mediaType = "application/json"))
        })
        @PostMapping("/register")
        public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
                AuthResponse response = authService.register(request);
                return ResponseEntity.status(HttpStatus.CREATED)
                                .body(ApiResponse.success("Đăng ký tài khoản thành công", response));
        }

        @Operation(summary = "Đăng nhập hệ thống (UC02)", description = "Xác thực bằng email và mật khẩu cho tất cả các vai trò (ADMIN, RECEPTIONIST, CUSTOMER, GUEST). Kiểm tra trạng thái khóa tài khoản (LOCKED) và trả về chuỗi JWT Token.")
        @ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Đăng nhập thành công, trả về JWT Token", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiResponse.class))),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Dữ liệu đăng nhập không đúng định dạng", content = @Content(mediaType = "application/json")),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Email hoặc mật khẩu không chính xác, hoặc tài khoản đã bị khóa", content = @Content(mediaType = "application/json"))
        })
        @PostMapping({ "/login", "/login-receptionist", "/login-admin" })
        public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
                AuthResponse response = authService.login(request);
                return ResponseEntity.ok(ApiResponse.success("Đăng nhập thành công", response));
        }

        @Operation(summary = "Lấy thông tin tài khoản đang đăng nhập", description = "Trả về thông tin chi tiết của người dùng hiện tại dựa trên JWT Bearer Token.", security = @SecurityRequirement(name = "bearerAuth"))
        @ApiResponses(value = {
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Lấy thông tin người dùng thành công", content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiResponse.class))),
                        @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Chưa đăng nhập hoặc JWT Token đã hết hạn", content = @Content(mediaType = "application/json"))
        })
        @GetMapping("/me")
        public ResponseEntity<ApiResponse<AuthResponse>> getCurrentUser(Authentication authentication) {
                if (authentication == null || !authentication.isAuthenticated()) {
                        throw new com.hotel.booking.common.exception.UnauthorizedException(
                                        "Chưa xác thực hoặc phiên đăng nhập đã hết hạn");
                }
                String email = authentication.getName();
                AuthResponse response = authService.getCurrentUser(email);
                return ResponseEntity.ok(ApiResponse.success("Lấy thông tin người dùng thành công", response));
        }
}
