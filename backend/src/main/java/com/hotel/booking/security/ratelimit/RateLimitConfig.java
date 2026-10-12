package com.hotel.booking.security.ratelimit;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.Ordered;

@Configuration
public class RateLimitConfig {

    @Bean
    public FilterRegistrationBean<RateLimitingFilter> rateLimitingFilterRegistration(
            RateLimiterService rateLimiterService,
            ObjectMapper objectMapper
    ) {
        RateLimitingFilter filter = new RateLimitingFilter(rateLimiterService, objectMapper);
        FilterRegistrationBean<RateLimitingFilter> registrationBean = new FilterRegistrationBean<>(filter);
        // Đặt độ ưu tiên cao nhất để chặn request ngay từ cửa Servlet trước khi đi sâu vào hệ thống
        registrationBean.setOrder(Ordered.HIGHEST_PRECEDENCE + 10);
        registrationBean.addUrlPatterns("/*");
        return registrationBean;
    }
}
