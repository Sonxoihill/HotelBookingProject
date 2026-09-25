package com.hotel.booking.config;

import com.hotel.booking.common.exception.UnauthorizedException;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Map;

@Component
public class JwtUtil {

    private final SecretKey secretKey;
    private final long expirationMs;

    public JwtUtil(
            @Value("${jwt.secret:hotelbookingsecretkeysupersecureforjwtauthentication2026hotelbooking}") String secret,
            @Value("${jwt.expiration:86400000}") long expirationMs
    ) {
        this.secretKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.expirationMs = expirationMs;
    }

    public String generateToken(String email, Map<String, Object> extraClaims) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationMs);

        return Jwts.builder()
                .subject(email)
                .claims(extraClaims)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(secretKey)
                .compact();
    }

    public String generateToken(String email) {
        return generateToken(email, Map.of());
    }

    public String extractEmail(String authorizationHeader) {
        if (authorizationHeader == null || authorizationHeader.trim().isEmpty()) {
            throw new UnauthorizedException("Phiên đăng nhập đã hết hạn hoặc không hợp lệ: Thiếu Authorization header!");
        }

        String token = authorizationHeader.trim();
        if (token.startsWith("Bearer ")) {
            token = token.substring(7).trim();
        }

        if (token.isEmpty()) {
            throw new UnauthorizedException("Phiên đăng nhập không hợp lệ: Token rỗng!");
        }

        try {
            Claims claims = Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            String subject = claims.getSubject();
            if (subject == null || subject.trim().isEmpty()) {
                throw new UnauthorizedException("Token không chứa thông tin định danh người dùng!");
            }
            return subject.trim();
        } catch (JwtException | IllegalArgumentException ex) {
            throw new UnauthorizedException("Token không hợp lệ hoặc đã hết hạn: " + ex.getMessage());
        }
    }
}
