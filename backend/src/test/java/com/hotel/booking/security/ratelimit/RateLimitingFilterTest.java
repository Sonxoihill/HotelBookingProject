package com.hotel.booking.security.ratelimit;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

class RateLimitingFilterTest {

    private RateLimiterService rateLimiterService;
    private ObjectMapper objectMapper;
    private RateLimitingFilter rateLimitingFilter;
    private FilterChain filterChain;

    @BeforeEach
    void setUp() {
        rateLimiterService = mock(RateLimiterService.class);
        objectMapper = new ObjectMapper();
        objectMapper.findAndRegisterModules();
        rateLimitingFilter = new RateLimitingFilter(rateLimiterService, objectMapper);
        filterChain = mock(FilterChain.class);
    }

    @Test
    @DisplayName("SCRUM-122: Khi request POST /bookings trong giới hạn cho phép -> Cho qua filter Chain")
    void testBooking_WithinLimit_Allowed() throws Exception {
        when(rateLimiterService.tryConsumeBooking(anyString())).thenReturn(true);

        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/v1/bookings");
        request.setServletPath("/bookings");
        MockHttpServletResponse response = new MockHttpServletResponse();

        rateLimitingFilter.doFilterInternal(request, response, filterChain);

        verify(filterChain, times(1)).doFilter(request, response);
        assertEquals(HttpServletResponse.SC_OK, response.getStatus());
    }

    @Test
    @DisplayName("SCRUM-122: Khi request POST /bookings vượt giới hạn -> Trả về HTTP 429 Too Many Requests ngay từ filter")
    void testBooking_ExceedLimit_BlockedWith429() throws Exception {
        when(rateLimiterService.tryConsumeBooking("203.0.113.5")).thenReturn(false);

        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/v1/bookings");
        request.setServletPath("/bookings");
        request.addHeader("X-Forwarded-For", "203.0.113.5");
        MockHttpServletResponse response = new MockHttpServletResponse();

        rateLimitingFilter.doFilterInternal(request, response, filterChain);

        // Đảm bảo không cho request đi sâu vào tầng tiếp theo
        verify(filterChain, never()).doFilter(request, response);
        // Trả về đúng mã lỗi 429
        assertEquals(429, response.getStatus());
        assertEquals("1", response.getHeader("Retry-After"));
        assertTrue(response.getContentAsString().contains("Rate Limit Exceeded"));
    }

    @Test
    @DisplayName("Request GET khác không bị ảnh hưởng bởi rate limiting của booking")
    void testOtherRequests_NotAffected() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/rooms");
        request.setServletPath("/rooms");
        MockHttpServletResponse response = new MockHttpServletResponse();

        rateLimitingFilter.doFilterInternal(request, response, filterChain);

        verify(filterChain, times(1)).doFilter(request, response);
        verify(rateLimiterService, never()).tryConsumeBooking(anyString());
    }
}
