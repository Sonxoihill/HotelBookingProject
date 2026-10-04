package com.hotel.booking.config;

import io.swagger.v3.oas.models.OpenAPI;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class OpenApiConfigTest {

    private final OpenApiConfig openApiConfig = new OpenApiConfig();

    @Test
    @DisplayName("OpenAPI Bean should have valid title, version and security schemes")
    void testOpenApiConfiguration() {
        OpenAPI openAPI = openApiConfig.openAPI();

        assertNotNull(openAPI);
        assertNotNull(openAPI.getInfo());
        assertEquals("Hotel Booking Management System API", openAPI.getInfo().getTitle());
        assertEquals("1.0.0", openAPI.getInfo().getVersion());

        // Verify Bearer Auth Security Scheme
        assertNotNull(openAPI.getComponents());
        assertNotNull(openAPI.getComponents().getSecuritySchemes());
        assertTrue(openAPI.getComponents().getSecuritySchemes().containsKey("bearerAuth"));
        assertEquals("bearer", openAPI.getComponents().getSecuritySchemes().get("bearerAuth").getScheme());
        assertEquals("JWT", openAPI.getComponents().getSecuritySchemes().get("bearerAuth").getBearerFormat());

        // Verify Servers
        assertNotNull(openAPI.getServers());
        assertFalse(openAPI.getServers().isEmpty());
    }
}
