package com.hotel.booking.config.vnpay;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "vnpay")
public class VNPayConfig {

    private String tmnCode;
    private String hashSecret;
    private String payUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
    private String returnUrl = "http://localhost:5173/payment-result";
    private String version = "2.1.0";
    private String command = "pay";

    /**
     * Danh sách IP hợp lệ của máy chủ VNPay (SCRUM-121).
     * Mặc định bao gồm dải IP Sandbox/Production của VNPay và localhost cho dev/test.
     */
    private List<String> allowedIps = new ArrayList<>(Arrays.asList(
            "113.160.92.202", // VNPay Sandbox IP
            "113.52.45.78",   // VNPay Production IP
            "203.205.69.100", // VNPay IP
            "103.220.87.101", // VNPay IP
            "103.220.86.4",   // VNPay IP
            "127.0.0.1",
            "0:0:0:0:0:0:0:1",
            "localhost"
    ));

    public void setAllowedIps(List<String> allowedIps) {
        if (allowedIps != null) {
            this.allowedIps = allowedIps;
        }
    }

    /**
     * Hỗ trợ cấu hình qua chuỗi phân cách dấu phẩy trong file properties/yml
     */
    public void setAllowedIpsString(String ipsString) {
        if (ipsString != null && !ipsString.trim().isEmpty()) {
            this.allowedIps = Arrays.stream(ipsString.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .toList();
        }
    }

    /**
     * Kiểm tra IP của request có nằm trong danh sách IP hợp lệ của VNPay không
     */
    public boolean isAllowedIp(String clientIp) {
        if (clientIp == null || clientIp.trim().isEmpty()) {
            return false;
        }
        String cleanIp = clientIp.trim();
        return allowedIps.stream().anyMatch(allowed -> allowed.trim().equalsIgnoreCase(cleanIp));
    }
}
