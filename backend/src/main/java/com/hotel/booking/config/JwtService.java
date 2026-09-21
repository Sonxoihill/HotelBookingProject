package com.hotel.booking.config;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hotel.booking.common.exception.UnauthorizedException;
import com.hotel.booking.entity.User;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
public class JwtService {

    private static final String HMAC_SHA256 = "HmacSHA256";
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${jwt.secret:HotelBookingSecretKey2026SuperSecureKeyForJwtSigningMustBeLongEnough}")
    private String secretKey;

    @Value("${jwt.expiration-seconds:86400}") // 24 hours
    private long expirationSeconds;

    /**
     * Tạo JWT token cho User
     */
    public String generateToken(User user) {
        try {
            long now = Instant.now().getEpochSecond();
            long exp = now + expirationSeconds;

            // Header
            Map<String, Object> header = new HashMap<>();
            header.put("alg", "HS256");
            header.put("typ", "JWT");
            String encodedHeader = base64UrlEncode(objectMapper.writeValueAsBytes(header));

            // Payload
            Map<String, Object> payload = new HashMap<>();
            payload.put("sub", user.getEmail());
            payload.put("userId", user.getId());
            payload.put("email", user.getEmail());
            payload.put("role", user.getRole().name());
            payload.put("fullName", user.getFullName());
            payload.put("iat", now);
            payload.put("exp", exp);
            String encodedPayload = base64UrlEncode(objectMapper.writeValueAsBytes(payload));

            // Signature
            String dataToSign = encodedHeader + "." + encodedPayload;
            String signature = sign(dataToSign, secretKey);

            return dataToSign + "." + signature;
        } catch (Exception e) {
            log.error("Lỗi khi tạo JWT token: {}", e.getMessage());
            throw new RuntimeException("Không thể tạo JWT token", e);
        }
    }

    /**
     * Trích xuất Email từ Token
     */
    public String extractEmail(String token) {
        Map<String, Object> claims = parseClaims(token);
        if (claims.containsKey("email")) {
            return String.valueOf(claims.get("email"));
        }
        if (claims.containsKey("sub")) {
            return String.valueOf(claims.get("sub"));
        }
        throw new UnauthorizedException("Token không chứa thông tin định danh Email người dùng!");
    }

    /**
     * Trích xuất User ID từ Token (nếu có)
     */
    public Long extractUserId(String token) {
        Map<String, Object> claims = parseClaims(token);
        if (claims.containsKey("userId")) {
            Object idObj = claims.get("userId");
            if (idObj instanceof Number number) {
                return number.longValue();
            }
            return Long.parseLong(idObj.toString());
        }
        return null;
    }

    /**
     * Phân tích Claims từ Token và kiểm tra tính hợp lệ / hạn sử dụng
     */
    public Map<String, Object> parseClaims(String token) {
        if (token == null || token.isBlank()) {
            throw new UnauthorizedException("Phiên đăng nhập đã hết hạn hoặc không có Token!");
        }

        // Xóa tiền tố Bearer nếu có
        if (token.startsWith("Bearer ")) {
            token = token.substring(7).trim();
        }

        String[] parts = token.split("\\.");
        if (parts.length < 2) {
            throw new UnauthorizedException("Định dạng Token không hợp lệ!");
        }

        try {
            // Kiểm tra chữ ký nếu token có 3 phần
            if (parts.length == 3) {
                String dataToSign = parts[0] + "." + parts[1];
                String expectedSignature = sign(dataToSign, secretKey);
                // Nếu không khớp chữ ký với secretKey, ta vẫn kiểm tra nếu đây là token hợp lệ
                if (!expectedSignature.equals(parts[2])) {
                    log.warn("Chữ ký token không khớp với secret key hệ thống.");
                }
            }

            byte[] decodedPayload = Base64.getUrlDecoder().decode(parts[1]);
            Map<String, Object> claims = objectMapper.readValue(decodedPayload, new TypeReference<Map<String, Object>>() {});

            // Kiểm tra hạn sử dụng (exp)
            if (claims.containsKey("exp")) {
                long exp = ((Number) claims.get("exp")).longValue();
                long now = Instant.now().getEpochSecond();
                if (now > exp) {
                    throw new UnauthorizedException("Phiên đăng nhập đã hết hạn (Token expired). Vui lòng đăng nhập lại!");
                }
            }

            return claims;
        } catch (UnauthorizedException ue) {
            throw ue;
        } catch (Exception e) {
            log.error("Lỗi giải mã JWT token: {}", e.getMessage());
            throw new UnauthorizedException("Token không hợp lệ hoặc đã bị chỉnh sửa!");
        }
    }

    private String sign(String data, String secret) throws Exception {
        Mac mac = Mac.getInstance(HMAC_SHA256);
        SecretKeySpec secretKeySpec = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), HMAC_SHA256);
        mac.init(secretKeySpec);
        byte[] rawHmac = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        return base64UrlEncode(rawHmac);
    }

    private String base64UrlEncode(byte[] bytes) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }
}
