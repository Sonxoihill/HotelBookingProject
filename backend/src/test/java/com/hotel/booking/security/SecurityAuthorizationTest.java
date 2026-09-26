package com.hotel.booking.security;

import com.hotel.booking.security.jwt.JwtUtils;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class SecurityAuthorizationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtUtils jwtUtils;

    @Test
    @DisplayName("Chưa đăng nhập truy cập /admin/ping -> Trả về HTTP 401 Unauthorized")
    void testAnonymousAccessToAdminEndpoint() throws Exception {
        mockMvc.perform(get("/admin/ping")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Chưa xác thực hoặc phiên đăng nhập đã hết hạn"));
    }

    @Test
    @DisplayName("Tài khoản CUSTOMER truy cập /admin/ping -> Bị chặn với HTTP 403 Forbidden")
    void testCustomerAccessToAdminEndpoint() throws Exception {
        String customerToken = jwtUtils.generateToken("guest@gmail.com", "CUSTOMER");

        mockMvc.perform(get("/admin/ping")
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Bạn không có quyền thực hiện hành động này"));
    }

    @Test
    @DisplayName("Tài khoản ADMIN truy cập /admin/ping -> Cho phép truy cập HTTP 200 OK")
    void testAdminAccessToAdminEndpoint() throws Exception {
        String adminToken = jwtUtils.generateToken("admin@gmail.com", "ADMIN");

        mockMvc.perform(get("/admin/ping")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.role").value("ADMIN"));
    }

    @Test
    @DisplayName("Tài khoản CUSTOMER truy cập /receptionist/ping -> Bị chặn với HTTP 403 Forbidden")
    void testCustomerAccessToReceptionistEndpoint() throws Exception {
        String customerToken = jwtUtils.generateToken("guest@gmail.com", "CUSTOMER");

        mockMvc.perform(get("/receptionist/ping")
                        .header("Authorization", "Bearer " + customerToken)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Bạn không có quyền thực hiện hành động này"));
    }

    @Test
    @DisplayName("Tài khoản RECEPTIONIST truy cập /receptionist/ping -> Cho phép truy cập HTTP 200 OK")
    void testReceptionistAccessToReceptionistEndpoint() throws Exception {
        String recToken = jwtUtils.generateToken("receptionist@gmail.com", "RECEPTIONIST");

        mockMvc.perform(get("/receptionist/ping")
                        .header("Authorization", "Bearer " + recToken)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.role").value("RECEPTIONIST"));
    }
}
