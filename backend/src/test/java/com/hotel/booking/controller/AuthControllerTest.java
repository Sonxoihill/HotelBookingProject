package com.hotel.booking.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hotel.booking.common.exception.ConflictException;
import com.hotel.booking.common.exception.ErrorCode;
import com.hotel.booking.dto.request.LoginRequest;
import com.hotel.booking.dto.request.RegisterRequest;
import com.hotel.booking.dto.response.AuthResponse;
import com.hotel.booking.security.jwt.JwtAuthenticationFilter;
import com.hotel.booking.security.jwt.JwtUtils;
import com.hotel.booking.service.AuthService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.jpa.mapping.JpaMetamodelMappingContext;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest {

        @Autowired
        private MockMvc mockMvc;

        @Autowired
        private ObjectMapper objectMapper;

        @MockBean
        private JpaMetamodelMappingContext jpaMappingContext;

        @MockBean
        private AuthService authService;

        @MockBean
        private JwtUtils jwtUtils;

        @MockBean
        private JwtAuthenticationFilter jwtAuthenticationFilter;

        @Test
        @DisplayName("POST /auth/register - Đăng ký thành công trả về HTTP 201 Created")
        void testRegisterSuccess() throws Exception {
                RegisterRequest request = RegisterRequest.builder()
                                .fullName("Nguyễn Khách")
                                .email("guest@gmail.com")
                                .password("123456")
                                .phone("0901234567")
                                .build();

                AuthResponse authResponse = AuthResponse.builder()
                                .token("mock.jwt.token")
                                .type("Bearer")
                                .id(1L)
                                .email("guest@gmail.com")
                                .fullName("Nguyễn Khách")
                                .role("CUSTOMER")
                                .build();

                when(authService.register(any(RegisterRequest.class))).thenReturn(authResponse);

                mockMvc.perform(post("/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isCreated())
                                .andExpect(jsonPath("$.success").value(true))
                                .andExpect(jsonPath("$.message").value("Đăng ký tài khoản thành công"))
                                .andExpect(jsonPath("$.data.token").value("mock.jwt.token"))
                                .andExpect(jsonPath("$.data.role").value("CUSTOMER"));
        }

        @Test
        @DisplayName("POST /auth/register - Lỗi validation khi dữ liệu trống hoặc không đúng định dạng")
        void testRegisterValidationFailure() throws Exception {
                RegisterRequest invalidRequest = RegisterRequest.builder()
                                .fullName("") // Blank
                                .email("invalid-email@other.com") // Not gmail
                                .password("123") // Less than 6 chars
                                .build();

                mockMvc.perform(post("/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(invalidRequest)))
                                .andExpect(status().isBadRequest())
                                .andExpect(jsonPath("$.success").value(false))
                                .andExpect(jsonPath("$.errors.fullName").exists())
                                .andExpect(jsonPath("$.errors.email").exists())
                                .andExpect(jsonPath("$.errors.password").exists());
        }

        @Test
        @DisplayName("POST /auth/register - Lỗi validation khi tên chứa ký tự đặc biệt")
        void testRegisterSpecialCharsInName() throws Exception {
                RegisterRequest invalidRequest = RegisterRequest.builder()
                                .fullName("Nguyễn Văn @#") // Contains special characters
                                .email("test@gmail.com")
                                .password("123456")
                                .phone("0901234567")
                                .build();

                mockMvc.perform(post("/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(invalidRequest)))
                                .andExpect(status().isBadRequest())
                                .andExpect(jsonPath("$.success").value(false))
                                .andExpect(jsonPath("$.errors.fullName").exists());
        }

        @Test
        @DisplayName("POST /auth/register - Lỗi validation khi email chứa ký tự đặc biệt ")
        void testRegisterSpecialCharsInEmail() throws Exception {
                RegisterRequest invalidRequest = RegisterRequest.builder()
                                .fullName("Nguyễn Văn An")
                                .email("user-test+1@gmail.com") // Contains - and +
                                .password("123456")
                                .phone("0901234567")
                                .build();

                mockMvc.perform(post("/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(invalidRequest)))
                                .andExpect(status().isBadRequest())
                                .andExpect(jsonPath("$.success").value(false))
                                .andExpect(jsonPath("$.errors.email").exists());
        }

        @Test
        @DisplayName("POST /auth/register - Lỗi validation khi số điện thoại không đúng định dạng")
        void testRegisterInvalidPhone() throws Exception {
                RegisterRequest invalidRequest = RegisterRequest.builder()
                                .fullName("Nguyễn Văn An")
                                .email("valid@gmail.com")
                                .password("123456")
                                .phone("0123456789") // Invalid prefix 01
                                .build();

                mockMvc.perform(post("/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(invalidRequest)))
                                .andExpect(status().isBadRequest())
                                .andExpect(jsonPath("$.success").value(false))
                                .andExpect(jsonPath("$.errors.phone").exists());
        }

        @Test
        @DisplayName("POST /auth/register - Lỗi validation khi số điện thoại để trống")
        void testRegisterBlankPhone() throws Exception {
                RegisterRequest invalidRequest = RegisterRequest.builder()
                                .fullName("Nguyễn Văn An")
                                .email("valid@gmail.com")
                                .password("123456")
                                .phone("")
                                .build();

                mockMvc.perform(post("/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(invalidRequest)))
                                .andExpect(status().isBadRequest())
                                .andExpect(jsonPath("$.success").value(false))
                                .andExpect(jsonPath("$.errors.phone").exists());
        }

        @Test
        @DisplayName("POST /auth/register - Trùng email trả về HTTP 409 Conflict")
        void testRegisterConflictEmail() throws Exception {
                RegisterRequest request = RegisterRequest.builder()
                                .fullName("Nguyễn Khách")
                                .email("exists@gmail.com")
                                .password("123456")
                                .phone("0901234567")
                                .build();

                when(authService.register(any(RegisterRequest.class)))
                                .thenThrow(new ConflictException(ErrorCode.EMAIL_ALREADY_EXISTS,
                                                "Email đã được sử dụng"));

                mockMvc.perform(post("/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isConflict())
                                .andExpect(jsonPath("$.success").value(false))
                                .andExpect(jsonPath("$.message").value("Email đã được sử dụng"));
        }

        @Test
        @DisplayName("POST /auth/register - Trùng số điện thoại trả về HTTP 409 Conflict")
        void testRegisterConflictPhone() throws Exception {
                RegisterRequest request = RegisterRequest.builder()
                                .fullName("Nguyễn Khách")
                                .email("guest@gmail.com")
                                .password("123456")
                                .phone("0901234567")
                                .build();

                when(authService.register(any(RegisterRequest.class)))
                                .thenThrow(new ConflictException(ErrorCode.PHONE_ALREADY_EXISTS,
                                                "Số điện thoại đã được sử dụng"));

                mockMvc.perform(post("/auth/register")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isConflict())
                                .andExpect(jsonPath("$.success").value(false))
                                .andExpect(jsonPath("$.message").value("Số điện thoại đã được sử dụng"));
        }

        @Test
        @DisplayName("POST /auth/login - Đăng nhập thành công trả về HTTP 200 OK")
        void testLoginSuccess() throws Exception {
                LoginRequest request = LoginRequest.builder()
                                .email("guest@gmail.com")
                                .password("123456")
                                .build();

                AuthResponse authResponse = AuthResponse.builder()
                                .token("jwt.login.token")
                                .type("Bearer")
                                .id(1L)
                                .email("guest@gmail.com")
                                .fullName("Nguyễn Khách")
                                .role("CUSTOMER")
                                .build();

                when(authService.login(any(LoginRequest.class))).thenReturn(authResponse);

                mockMvc.perform(post("/auth/login")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content(objectMapper.writeValueAsString(request)))
                                .andExpect(status().isOk())
                                .andExpect(jsonPath("$.success").value(true))
                                .andExpect(jsonPath("$.data.token").value("jwt.login.token"))
                                .andExpect(jsonPath("$.data.role").value("CUSTOMER"));
        }
}
