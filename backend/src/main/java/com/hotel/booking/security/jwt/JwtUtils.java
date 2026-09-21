package com.hotel.booking.security.jwt;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

/**
 * Tiện ích xử lý JWT (RFC 7519) sử dụng thuật toán HMAC-SHA256 tiêu chuẩn
 * Tương thích hoàn toàn với các thư viện JWT chuẩn (JJWT, Auth0, jwt.io).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtUtils {

    @Value("${jwt.secret:404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970}")
    private String jwtSecret;

    @Value("${jwt.expiration-ms:86400000}")
    private long jwtExpirationMs;

    private final ObjectMapper objectMapper;

    private static final String HMAC_SHA256 = "HmacSHA256";
    private static final Base64.Encoder URL_ENCODER = Base64.getUrlEncoder().withoutPadding();
    private static final Base64.Decoder URL_DECODER = Base64.getUrlDecoder();

    /**
     * Sinh JWT Token với subject là email và kèm claim role
     */
    public String generateToken(String email, String role) {
        try {
            long nowSec = Instant.now().getEpochSecond();
            long expSec = nowSec + (jwtExpirationMs / 1000);

            // 1. Header
            Map<String, Object> header = new HashMap<>();
            header.put("alg", "HS256");
            header.put("typ", "JWT");
            String encodedHeader = URL_ENCODER.encodeToString(objectMapper.writeValueAsBytes(header));

            // 2. Payload / Claims
            Map<String, Object> claims = new HashMap<>();
            claims.put("sub", email);
            claims.put("role", role);
            claims.put("iat", nowSec);
            claims.put("exp", expSec);
            String encodedPayload = URL_ENCODER.encodeToString(objectMapper.writeValueAsBytes(claims));

            // 3. Signature
            String dataToSign = encodedHeader + "." + encodedPayload;
            String signature = sign(dataToSign);

            return dataToSign + "." + signature;
        } catch (Exception e) {
            log.error("Lỗi khi tạo JWT token: {}", e.getMessage());
            throw new RuntimeException("Không thể tạo JWT Token", e);
        }
    }

    /**
     * Trích xuất username (email / subject) từ JWT token
     */
    public String extractUsername(String token) {
        Map<String, Object> claims = extractAllClaims(token);
        return claims != null ? (String) claims.get("sub") : null;
    }

    /**
     * Trích xuất role từ JWT token
     */
    public String extractRole(String token) {
        Map<String, Object> claims = extractAllClaims(token);
        return claims != null ? (String) claims.get("role") : null;
    }

    /**
     * Kiểm tra token đã hết hạn hay chưa
     */
    public boolean isTokenExpired(String token) {
        Map<String, Object> claims = extractAllClaims(token);
        if (claims == null || !claims.containsKey("exp")) {
            return true;
        }
        Number exp = (Number) claims.get("exp");
        long expSec = exp.longValue();
        return expSec < Instant.now().getEpochSecond();
    }

    /**
     * Xác thực tính toàn vẹn và thời hạn của token
     */
    public boolean validateToken(String token) {
        try {
            if (token == null || token.isBlank()) {
                return false;
            }
            String[] parts = token.split("\\.");
            if (parts.length != 3) {
                log.warn("Cấu trúc JWT token không hợp lệ (không đúng 3 phần)");
                return false;
            }

            String dataToSign = parts[0] + "." + parts[1];
            String expectedSignature = sign(dataToSign);

            if (!MessageDigest.isEqual(expectedSignature.getBytes(StandardCharsets.UTF_8),
                    parts[2].getBytes(StandardCharsets.UTF_8))) {
                log.warn("Chữ ký JWT không khớp");
                return false;
            }

            return !isTokenExpired(token);
        } catch (Exception e) {
            log.warn("Xác thực JWT token thất bại: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Đọc toàn bộ claims từ payload của token
     */
    public Map<String, Object> extractAllClaims(String token) {
        try {
            if (token == null || token.isBlank()) {
                return null;
            }
            String[] parts = token.split("\\.");
            if (parts.length < 2) {
                return null;
            }
            byte[] payloadBytes = URL_DECODER.decode(parts[1]);
            return objectMapper.readValue(payloadBytes, new TypeReference<Map<String, Object>>() {});
        } catch (Exception e) {
            log.error("Không thể giải mã claims từ JWT: {}", e.getMessage());
            return null;
        }
    }

    private String sign(String data) throws Exception {
        Mac mac = Mac.getInstance(HMAC_SHA256);
        SecretKeySpec secretKey = new SecretKeySpec(jwtSecret.getBytes(StandardCharsets.UTF_8), HMAC_SHA256);
        mac.init(secretKey);
        byte[] hmacBytes = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        return URL_ENCODER.encodeToString(hmacBytes);
    }
}
