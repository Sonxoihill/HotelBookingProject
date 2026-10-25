package com.hotel.booking.security.jwt;

import com.hotel.booking.entity.User;
import com.hotel.booking.enums.UserRole;
import com.hotel.booking.enums.UserStatus;
import com.hotel.booking.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JwtAuthenticationFilterTest {

    @Mock
    private JwtUtils jwtUtils;

    @Mock
    private UserRepository userRepository;

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    @Mock
    private FilterChain filterChain;

    @InjectMocks
    private JwtAuthenticationFilter filter;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("AC Nghiệm thu UC16: Khóa tài khoản -> Token cũ gọi API không được cấp Authentication (nhận 401)")
    void testDoFilterInternal_WhenUserIsLocked_DoesNotSetAuthentication() throws Exception {
        when(request.getHeader("Authorization")).thenReturn("Bearer old_valid_token");
        when(jwtUtils.validateToken("old_valid_token")).thenReturn(true);
        when(jwtUtils.extractUsername("old_valid_token")).thenReturn("letan@hotel.com");

        User lockedUser = User.builder()
                .email("letan@hotel.com")
                .role(UserRole.RECEPTIONIST)
                .status(UserStatus.LOCKED) // Đã bị khóa
                .build();

        when(userRepository.findByEmail("letan@hotel.com")).thenReturn(Optional.of(lockedUser));

        filter.doFilterInternal(request, response, filterChain);

        // Security context authentication must remain null!
        assertNull(SecurityContextHolder.getContext().getAuthentication());
        verify(filterChain).doFilter(request, response);
    }

    @Test
    @DisplayName("AC Nghiệm thu UC16: Đổi quyền có hiệu lực ngay lập tức với token cũ do nạp role từ DB")
    void testDoFilterInternal_WhenRoleChanged_TakesRoleFromDatabase() throws Exception {
        when(request.getHeader("Authorization")).thenReturn("Bearer user_token_with_old_role");
        when(jwtUtils.validateToken("user_token_with_old_role")).thenReturn(true);
        when(jwtUtils.extractUsername("user_token_with_old_role")).thenReturn("staff@hotel.com");

        User promotedUser = User.builder()
                .email("staff@hotel.com")
                .role(UserRole.ADMIN) // Role mới đã cập nhật trong DB
                .status(UserStatus.ACTIVE)
                .build();

        when(userRepository.findByEmail("staff@hotel.com")).thenReturn(Optional.of(promotedUser));

        filter.doFilterInternal(request, response, filterChain);

        assertNotNull(SecurityContextHolder.getContext().getAuthentication());
        assertEquals("staff@hotel.com", SecurityContextHolder.getContext().getAuthentication().getName());
        assertTrue(SecurityContextHolder.getContext().getAuthentication().getAuthorities()
                .stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN")));
        verify(filterChain).doFilter(request, response);
    }
}
