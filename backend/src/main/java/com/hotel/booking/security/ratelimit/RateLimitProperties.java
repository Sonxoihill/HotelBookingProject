package com.hotel.booking.security.ratelimit;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
@ConfigurationProperties(prefix = "rate-limit")
public class RateLimitProperties {

    /**
     * Bật/tắt tính năng Rate Limiting toàn hệ thống
     */
    private boolean enabled = true;

    /**
     * Cấu hình giới hạn cho API đặt phòng (POST /bookings)
     */
    private BookingRateLimit booking = new BookingRateLimit();

    @Getter
    @Setter
    public static class BookingRateLimit {
        /**
         * Số lượng request tối đa có thể tiếp nhận trong 1 burst (mặc định 5 req)
         */
        private int capacity = 5;

        /**
         * Số token nạp lại mỗi chu kỳ (mặc định 5 token)
         */
        private int refillTokens = 5;

        /**
         * Chu kỳ nạp token theo giây (mặc định 1 giây)
         */
        private int durationSeconds = 1;
    }
}
