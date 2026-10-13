package com.hotel.booking.security.jwt;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class JwtUtilsTest {

    private JwtUtils jwtUtils;

    @BeforeEach
    void setUp() {
        jwtUtils = new JwtUtils(new ObjectMapper());
        ReflectionTestUtils.setField(jwtUtils, "jwtSecret", "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970");
        ReflectionTestUtils.setField(jwtUtils, "jwtExpirationMs", 3600000L); // 1 hour
    }

    @Test
    @DisplayName("Should generate valid JWT token with claims and verify successfully")
    void testGenerateAndValidateToken() {
        String email = "test@hotel.com";
        String role = "CUSTOMER";

        String token = jwtUtils.generateToken(email, role);

        assertNotNull(token);
        assertTrue(token.split("\\.").length == 3);

        assertTrue(jwtUtils.validateToken(token));
        assertEquals(email, jwtUtils.extractUsername(token));
        assertEquals(role, jwtUtils.extractRole(token));
        assertFalse(jwtUtils.isTokenExpired(token));
    }

    @Test
    @DisplayName("Should reject tampered token")
    void testTamperedToken() {
        String token = jwtUtils.generateToken("user@hotel.com", "CUSTOMER");
        String tamperedToken = token.substring(0, token.length() - 4) + "XXXX";

        assertFalse(jwtUtils.validateToken(tamperedToken));
    }

    @Test
    @DisplayName("Should detect expired token")
    void testExpiredToken() {
        // Set expiration to negative value (already expired)
        ReflectionTestUtils.setField(jwtUtils, "jwtExpirationMs", -10000L);
        String token = jwtUtils.generateToken("expired@hotel.com", "GUEST");

        assertTrue(jwtUtils.isTokenExpired(token));
        assertFalse(jwtUtils.validateToken(token));
    }
}
