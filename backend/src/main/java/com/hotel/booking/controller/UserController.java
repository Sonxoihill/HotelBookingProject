package com.hotel.booking.controller;

import com.hotel.booking.common.exception.ResourceNotFoundException;
import com.hotel.booking.common.exception.UnauthorizedException;
import com.hotel.booking.common.response.ApiResponse;
import com.hotel.booking.config.JwtService;
import com.hotel.booking.dto.UserProfileDto;
import com.hotel.booking.entity.User;
import com.hotel.booking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final JwtService jwtService;

    /**
     * API GET /api/v1/users/profile
     * Trích xuất Email/ID từ JWT Token, query DB trả về chi tiết User đang đăng nhập.
     */
    @GetMapping("/profile")
    public ApiResponse<UserProfileDto> getProfile(
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("Vui lòng đăng nhập hoặc cung cấp JWT Token hợp lệ!");
        }

        String token = authHeader.substring(7).trim();
        String email = jwtService.extractEmail(token);
        log.info("Truy vấn hồ sơ cá nhân cho email: {}", email);

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));

        UserProfileDto profileDto = UserProfileDto.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .status(user.getStatus())
                .createdAt(user.getCreatedAt())
                .build();

        return ApiResponse.success("Lấy thông tin hồ sơ thành công", profileDto);
    }
}
