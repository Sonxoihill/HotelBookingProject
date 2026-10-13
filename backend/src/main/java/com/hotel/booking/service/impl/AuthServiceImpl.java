package com.hotel.booking.service.impl;

import com.hotel.booking.common.exception.BadRequestException;
import com.hotel.booking.common.exception.ConflictException;
import com.hotel.booking.common.exception.ErrorCode;
import com.hotel.booking.common.exception.UnauthorizedException;
import com.hotel.booking.dto.request.LoginRequest;
import com.hotel.booking.dto.request.RegisterRequest;
import com.hotel.booking.dto.response.AuthResponse;
import com.hotel.booking.entity.User;
import com.hotel.booking.enums.UserRole;
import com.hotel.booking.enums.UserStatus;
import com.hotel.booking.repository.UserRepository;
import com.hotel.booking.security.jwt.JwtUtils;
import com.hotel.booking.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (request.getConfirmPassword() == null || !request.getConfirmPassword().equals(request.getPassword())) {
            log.warn("Registration failed: Password confirmation does not match");
            throw new BadRequestException("Mật khẩu xác nhận không trùng khớp");
        }

        String email = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            log.warn("Registration failed: Email {} already exists", email);
            throw new ConflictException(ErrorCode.EMAIL_ALREADY_EXISTS, "Email đã được sử dụng");
        }

        String phone = normalizePhone(request.getPhone());
        if (phone != null && !phone.isEmpty()) {
            if (userRepository.existsByPhone(phone)) {
                log.warn("Registration failed: Phone {} already exists", phone);
                throw new ConflictException(ErrorCode.PHONE_ALREADY_EXISTS, "Số điện thoại đã được sử dụng");
            }
        }

        User user = User.builder()
                .fullName(request.getFullName().trim())
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(phone)
                .role(UserRole.CUSTOMER)
                .status(UserStatus.ACTIVE)
                .build();

        User savedUser = userRepository.save(user);
        log.info("New user registered successfully with ID: {}", savedUser.getId());

        String token = jwtUtils.generateToken(savedUser.getEmail(), savedUser.getRole().name());

        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .id(savedUser.getId())
                .email(savedUser.getEmail())
                .fullName(savedUser.getFullName())
                .role(savedUser.getRole().name())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.warn("Login failed: User with email {} not found", email);
                    return new UnauthorizedException("Email hoặc mật khẩu không chính xác");
                });

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            log.warn("Login failed: Incorrect password for email {}", email);
            throw new UnauthorizedException("Email hoặc mật khẩu không chính xác");
        }

        if (user.getStatus() != UserStatus.ACTIVE) {
            log.warn("Login failed: Account {} is not ACTIVE", email);
            throw new UnauthorizedException("Tài khoản đã bị tạm khóa hoặc ngừng kích hoạt");
        }

        String token = jwtUtils.generateToken(user.getEmail(), user.getRole().name());
        log.info("User {} logged in successfully", email);

        return AuthResponse.builder()
                .token(token)
                .type("Bearer")
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse getCurrentUser(String email) {
        if (email == null || email.isBlank()) {
            throw new UnauthorizedException("Chưa xác thực hoặc phiên đăng nhập đã hết hạn");
        }

        User user = userRepository.findByEmail(email.trim().toLowerCase())
                .orElseThrow(() -> new UnauthorizedException("Người dùng không tồn tại hoặc đã bị xóa"));

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new UnauthorizedException("Tài khoản đã bị tạm khóa hoặc ngừng kích hoạt");
        }

        return AuthResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .type("Bearer")
                .build();
    }

    private String normalizePhone(String phone) {
        if (phone == null) return null;
        String p = phone.trim().replaceAll("\\s+", "");
        if (p.startsWith("+84")) {
            p = "0" + p.substring(3);
        } else if (p.startsWith("84") && p.length() == 11) {
            p = "0" + p.substring(2);
        }
        return p;
    }
}
