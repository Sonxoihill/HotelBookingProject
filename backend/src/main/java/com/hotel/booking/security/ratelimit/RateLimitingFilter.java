package com.hotel.booking.security.ratelimit;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hotel.booking.common.response.ApiResponse;
import com.hotel.booking.config.vnpay.VNPayUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Slf4j
@RequiredArgsConstructor
public class RateLimitingFilter extends OncePerRequestFilter {

    private final RateLimiterService rateLimiterService;
    private final ObjectMapper objectMapper;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        String uri = request.getRequestURI();
        String servletPath = request.getServletPath();
        String method = request.getMethod();

        // Kiểm tra xem có phải API tạo đặt phòng POST /bookings hay không
        boolean isBookingCreation = "POST".equalsIgnoreCase(method) &&
                ((uri != null && (uri.endsWith("/bookings") || uri.endsWith("/bookings/"))) ||
                 "/bookings".equals(servletPath) || "/bookings/".equals(servletPath));

        if (isBookingCreation) {
            String clientIp = VNPayUtil.getIpAddress(request);
            boolean allowed = rateLimiterService.tryConsumeBooking(clientIp);

            if (!allowed) {
                log.warn("Rate limit kích hoạt: Chặn request đặt phòng spam từ IP: {}", clientIp);
                response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value()); // HTTP 429
                response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                response.setCharacterEncoding(StandardCharsets.UTF_8.name());
                response.setHeader("Retry-After", "1");

                ApiResponse<Void> apiResponse = ApiResponse.error(
                        "Quá nhiều yêu cầu đặt phòng từ địa chỉ IP của bạn (Rate Limit Exceeded). Vui lòng thử lại sau giây lát!"
                );
                response.getWriter().write(objectMapper.writeValueAsString(apiResponse));
                return;
            }
        }

        filterChain.doFilter(request, response);
    }
}
