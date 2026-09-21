package com.hotel.booking.controller;

import com.hotel.booking.common.exception.UnauthorizedException;
import com.hotel.booking.common.response.ApiResponse;
import com.hotel.booking.config.JwtService;
import com.hotel.booking.dto.LoginRequestDto;
import com.hotel.booking.dto.LoginResponseDto;
import com.hotel.booking.dto.UserProfileDto;
import com.hotel.booking.entity.User;
import com.hotel.booking.enums.UserStatus;
import com.hotel.booking.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final JwtService jwtService;

    /**
     * API POST /api/v1/auth/login
     * Đăng nhập và nhận JWT token chuẩn
     */
    @PostMapping("/login")
    public ApiResponse<LoginResponseDto> login(@Valid @RequestBody LoginRequestDto request) {
        log.info("Yêu cầu đăng nhập cho email: {}", request.getEmail());

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Email hoặc mật khẩu không chính xác!"));

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new UnauthorizedException("Tài khoản của bạn đã bị khóa hoặc chưa kích hoạt!");
        }

        // Tạo JWT Token chuẩn
        String token = jwtService.generateToken(user);

        UserProfileDto profileDto = UserProfileDto.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .status(user.getStatus())
                .createdAt(user.getCreatedAt())
                .build();

        LoginResponseDto response = LoginResponseDto.builder()
                .token(token)
                .user(profileDto)
                .build();

        return ApiResponse.success("Đăng nhập thành công", response);
    }
}
