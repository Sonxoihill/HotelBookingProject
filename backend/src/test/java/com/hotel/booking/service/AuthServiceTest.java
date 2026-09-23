package com.hotel.booking.service;

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
import com.hotel.booking.service.impl.AuthServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtUtils jwtUtils;

    @InjectMocks
    private AuthServiceImpl authService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder()
                .email("guest@gmail.com")
                .password("encoded_pass")
                .fullName("Nguyễn Khách")
                .phone("0901234567")
                .role(UserRole.CUSTOMER)
                .status(UserStatus.ACTIVE)
                .build();
        sampleUser.setId(10L);
    }

    @Test
    @DisplayName("Đăng ký thành công tài khoản mới")
    void testRegisterSuccess() {
        RegisterRequest request = RegisterRequest.builder()
                .fullName("Nguyễn Khách")
                .email("guest@gmail.com")
                .password("123456")
                .phone("0901234567")
                .build();

        when(userRepository.existsByEmail("guest@gmail.com")).thenReturn(false);
        when(userRepository.existsByPhone("0901234567")).thenReturn(false);
        when(passwordEncoder.encode("123456")).thenReturn("encoded_pass");
        when(userRepository.save(any(User.class))).thenReturn(sampleUser);
        when(jwtUtils.generateToken("guest@gmail.com", "CUSTOMER")).thenReturn("mock.jwt.token");

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals("mock.jwt.token", response.getToken());
        assertEquals("guest@gmail.com", response.getEmail());
        assertEquals("CUSTOMER", response.getRole());
        assertEquals(10L, response.getId());
        verify(userRepository, times(1)).save(any(User.class));
    }

    @Test
    @DisplayName("Đăng ký thất bại khi email đã tồn tại")
    void testRegisterDuplicateEmail() {
        RegisterRequest request = RegisterRequest.builder()
                .fullName("Trùng Email")
                .email("guest@gmail.com")
                .password("123456")
                .build();

        when(userRepository.existsByEmail("guest@gmail.com")).thenReturn(true);

        assertThrows(ConflictException.class, () -> authService.register(request));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Đăng ký thất bại khi số điện thoại đã tồn tại")
    void testRegisterDuplicatePhone() {
        RegisterRequest request = RegisterRequest.builder()
                .fullName("Trùng Số Điện Thoại")
                .email("guest@gmail.com")
                .password("123456")
                .phone("0901234567")
                .build();

        when(userRepository.existsByEmail("guest@gmail.com")).thenReturn(false);
        when(userRepository.existsByPhone("0901234567")).thenReturn(true);

        ConflictException ex = assertThrows(ConflictException.class, () -> authService.register(request));
        assertEquals(ErrorCode.PHONE_ALREADY_EXISTS, ex.getErrorCode());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    @DisplayName("Đăng nhập thành công với email và mật khẩu đúng")
    void testLoginSuccess() {
        LoginRequest request = LoginRequest.builder()
                .email("guest@gmail.com")
                .password("123456")
                .build();

        when(userRepository.findByEmail("guest@gmail.com")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("123456", "encoded_pass")).thenReturn(true);
        when(jwtUtils.generateToken("guest@gmail.com", "CUSTOMER")).thenReturn("valid.jwt.token");

        AuthResponse response = authService.login(request);

        assertNotNull(response);
        assertEquals("valid.jwt.token", response.getToken());
        assertEquals("guest@gmail.com", response.getEmail());
        assertEquals(10L, response.getId());
    }

    @Test
    @DisplayName("Đăng nhập thất bại khi sai mật khẩu")
    void testLoginWrongPassword() {
        LoginRequest request = LoginRequest.builder()
                .email("guest@gmail.com")
                .password("wrongpassword")
                .build();

        when(userRepository.findByEmail("guest@gmail.com")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("wrongpassword", "encoded_pass")).thenReturn(false);

        assertThrows(UnauthorizedException.class, () -> authService.login(request));
    }

    @Test
    @DisplayName("Đăng nhập thất bại khi email không tồn tại")
    void testLoginUserNotFound() {
        LoginRequest request = LoginRequest.builder()
                .email("nonexistent@gmail.com")
                .password("123456")
                .build();

        when(userRepository.findByEmail("nonexistent@gmail.com")).thenReturn(Optional.empty());

        assertThrows(UnauthorizedException.class, () -> authService.login(request));
    }

    @Test
    @DisplayName("Đăng nhập thất bại khi tài khoản bị khóa")
    void testLoginInactiveAccount() {
        sampleUser.setStatus(UserStatus.INACTIVE);

        LoginRequest request = LoginRequest.builder()
                .email("guest@gmail.com")
                .password("123456")
                .build();

        when(userRepository.findByEmail("guest@gmail.com")).thenReturn(Optional.of(sampleUser));
        when(passwordEncoder.matches("123456", "encoded_pass")).thenReturn(true);

        assertThrows(UnauthorizedException.class, () -> authService.login(request));
    }
}
