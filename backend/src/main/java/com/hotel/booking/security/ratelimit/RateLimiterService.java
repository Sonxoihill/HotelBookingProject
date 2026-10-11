package com.hotel.booking.security.ratelimit;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class RateLimiterService {

    private final RateLimitProperties properties;
    private final Map<String, Bucket> bookingBuckets = new ConcurrentHashMap<>();

    /**
     * Tiêu thụ 1 token cho request đặt phòng từ IP được chỉ định.
     * @param clientIp Địa chỉ IP của client
     * @return true nếu request được chấp thuận, false nếu đã vượt ngưỡng rate limit
     */
    public boolean tryConsumeBooking(String clientIp) {
        if (!properties.isEnabled()) {
            return true;
        }

        Bucket bucket = bookingBuckets.computeIfAbsent(clientIp, this::createBookingBucket);
        boolean consumed = bucket.tryConsume(1);
        if (!consumed) {
            log.warn("Rate limit bị kích hoạt: IP {} đã gửi quá số lượng request cho phép tới API Đặt phòng!", clientIp);
        }
        return consumed;
    }

    private Bucket createBookingBucket(String clientIp) {
        int capacity = properties.getBooking().getCapacity();
        int refillTokens = properties.getBooking().getRefillTokens();
        int durationSeconds = properties.getBooking().getDurationSeconds();

        Bandwidth limit = Bandwidth.builder()
                .capacity(capacity)
                .refillGreedy(refillTokens, Duration.ofSeconds(durationSeconds))
                .build();

        return Bucket.builder()
                .addLimit(limit)
                .build();
    }

    /**
     * Dọn dẹp cache bucket (dùng khi cần thiết hoặc test)
     */
    public void clearBuckets() {
        bookingBuckets.clear();
    }
}
