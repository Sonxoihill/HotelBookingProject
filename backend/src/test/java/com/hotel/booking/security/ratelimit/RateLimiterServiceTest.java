package com.hotel.booking.security.ratelimit;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class RateLimiterServiceTest {

    private RateLimitProperties properties;
    private RateLimiterService rateLimiterService;

    @BeforeEach
    void setUp() {
        properties = new RateLimitProperties();
        properties.setEnabled(true);
        properties.getBooking().setCapacity(5);
        properties.getBooking().setRefillTokens(5);
        properties.getBooking().setDurationSeconds(1);

        rateLimiterService = new RateLimiterService(properties);
    }

    @Test
    @DisplayName("SCRUM-122: IP gửi 5 request đầu tiên được chấp nhận, request thứ 6 bị chặn")
    void testRateLimit_ExceedThreshold() {
        String clientIp = "192.168.1.10";

        // 5 requests đầu tiên thành công
        for (int i = 0; i < 5; i++) {
            assertTrue(rateLimiterService.tryConsumeBooking(clientIp), "Request thứ " + (i + 1) + " phải thành công");
        }

        // Request thứ 6 bị chặn vì vượt quá capacity 5 req/giây
        assertFalse(rateLimiterService.tryConsumeBooking(clientIp), "Request thứ 6 trong cùng 1 giây phải bị từ chối");
    }

    @Test
    @DisplayName("SCRUM-122: Rate limit hoạt động độc lập theo từng IP khác nhau")
    void testRateLimit_IndependentPerIp() {
        String ip1 = "192.168.1.10";
        String ip2 = "192.168.1.20";

        // Sử dụng hết 5 quota của ip1
        for (int i = 0; i < 5; i++) {
            assertTrue(rateLimiterService.tryConsumeBooking(ip1));
        }
        assertFalse(rateLimiterService.tryConsumeBooking(ip1));

        // ip2 vẫn còn nguyên quota 5 request
        assertTrue(rateLimiterService.tryConsumeBooking(ip2), "IP2 không bị ảnh hưởng bởi IP1");
    }

    @Test
    @DisplayName("SCRUM-122: Khi tắt Rate Limiting (enabled=false) thì không bao giờ chặn")
    void testRateLimit_Disabled() {
        properties.setEnabled(false);
        String clientIp = "192.168.1.30";

        for (int i = 0; i < 20; i++) {
            assertTrue(rateLimiterService.tryConsumeBooking(clientIp));
        }
    }
}
