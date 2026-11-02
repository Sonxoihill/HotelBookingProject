package com.hotel.booking;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hotel.booking.config.JwtUtil;
import com.hotel.booking.config.OpenApiConfig;
import com.hotel.booking.config.vnpay.VNPayConfig;
import com.hotel.booking.repository.*;
import com.hotel.booking.security.jwt.JwtAuthenticationFilter;
import com.hotel.booking.security.jwt.JwtUtils;
import com.hotel.booking.service.*;
import com.hotel.booking.service.admin.AdminPricingRuleService;
import com.hotel.booking.service.admin.AdminReportService;
import com.hotel.booking.service.admin.AdminUserService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springdoc.core.configuration.SpringDocConfiguration;
import org.springdoc.core.properties.SpringDocConfigProperties;
import org.springdoc.core.properties.SwaggerUiConfigParameters;
import org.springdoc.core.properties.SwaggerUiConfigProperties;
import org.springdoc.core.properties.SwaggerUiOAuthProperties;
import org.springdoc.webmvc.core.configuration.MultipleOpenApiSupportConfiguration;
import org.springdoc.webmvc.core.configuration.SpringDocWebMvcConfiguration;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.jackson.JacksonAutoConfiguration;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.data.jpa.mapping.JpaMetamodelMappingContext;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest
@AutoConfigureMockMvc(addFilters = false)
@Import({
        OpenApiConfig.class,
        SpringDocConfiguration.class,
        SpringDocConfigProperties.class,
        SpringDocWebMvcConfiguration.class,
        MultipleOpenApiSupportConfiguration.class,
        SwaggerUiConfigProperties.class,
        SwaggerUiConfigParameters.class,
        SwaggerUiOAuthProperties.class,
        JacksonAutoConfiguration.class
})
class OpenApiExportTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private JpaMetamodelMappingContext jpaMappingContext;
    @MockBean
    private AuthService authService;
    @MockBean
    private RoomService roomService;
    @MockBean
    private BookingService bookingService;
    @MockBean
    private PaymentService paymentService;
    @MockBean
    private ReviewService reviewService;
    @MockBean
    private UserService userService;
    @MockBean
    private ReceptionistService receptionistService;
    @MockBean
    private AdminRoomCategoryService adminRoomCategoryService;
    @MockBean
    private AdminRoomService adminRoomService;
    @MockBean
    private AdminServiceService adminServiceService;
    @MockBean
    private AdminPricingRuleService adminPricingRuleService;
    @MockBean
    private AdminUserService adminUserService;
    @MockBean
    private AdminReportService adminReportService;
    @MockBean
    private UserRepository userRepository;
    @MockBean
    private RoomCategoryRepository roomCategoryRepository;
    @MockBean
    private RoomRepository roomRepository;
    @MockBean
    private ServiceRepository serviceRepository;
    @MockBean
    private BookingRepository bookingRepository;
    @MockBean
    private VNPayConfig vnPayConfig;
    @MockBean
    private JwtUtil jwtUtil;
    @MockBean
    private JwtUtils jwtUtils;
    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    @DisplayName("SCRUM-171: Xuất đặc tả OpenAPI 3.0 ra docs/api/openapi.json và docs/api/openapi.yaml")
    void exportOpenApiSpecs() throws Exception {
        MvcResult jsonResult = mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andReturn();
        String rawJson = jsonResult.getResponse().getContentAsString(StandardCharsets.UTF_8);
        Object jsonNode = objectMapper.readValue(rawJson, Object.class);
        String prettyJson = objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(jsonNode);

        MvcResult yamlResult = mockMvc.perform(get("/v3/api-docs.yaml"))
                .andExpect(status().isOk())
                .andReturn();
        String yamlContent = yamlResult.getResponse().getContentAsString(StandardCharsets.UTF_8);

        assertFalse(prettyJson.isBlank());
        assertTrue(prettyJson.contains("\"openapi\" : \"3.0.1\"") || prettyJson.contains("\"openapi\": \"3.0.1\""));
        assertFalse(yamlContent.isBlank());
        assertTrue(yamlContent.contains("openapi: 3.0.1"));

        Path docsApiDir = Paths.get("..", "docs", "api").normalize();
        Files.createDirectories(docsApiDir);
        Files.writeString(docsApiDir.resolve("openapi.json"), prettyJson, StandardCharsets.UTF_8);
        Files.writeString(docsApiDir.resolve("openapi.yaml"), yamlContent, StandardCharsets.UTF_8);
    }
}
