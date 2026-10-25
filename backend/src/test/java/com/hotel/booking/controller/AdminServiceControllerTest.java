package com.hotel.booking.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hotel.booking.common.exception.AppException;
import com.hotel.booking.common.exception.ErrorCode;
import com.hotel.booking.dto.admin.AdminServiceRequest;
import com.hotel.booking.entity.Service;
import com.hotel.booking.enums.ServiceStatus;
import com.hotel.booking.security.jwt.JwtAuthenticationFilter;
import com.hotel.booking.security.jwt.JwtUtils;
import com.hotel.booking.service.AdminServiceService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.jpa.mapping.JpaMetamodelMappingContext;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AdminServiceController.class)
@AutoConfigureMockMvc(addFilters = false)
class AdminServiceControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private JpaMetamodelMappingContext jpaMappingContext;

    @MockBean
    private AdminServiceService adminServiceService;

    @MockBean
    private JwtUtils jwtUtils;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    @DisplayName("GET /admin/services - Lấy toàn bộ dịch vụ (cả ACTIVE và INACTIVE) thành công (HTTP 200)")
    void testGetAllServices_Success() throws Exception {
        Service s1 = Service.builder().name("Bữa sáng Buffet").price(new BigDecimal("120000.00")).unit("Suất").status(ServiceStatus.ACTIVE).build();
        s1.setId(1L);
        Service s2 = Service.builder().name("Dịch vụ Ngừng HĐ").price(new BigDecimal("50000.00")).unit("Lần").status(ServiceStatus.INACTIVE).build();
        s2.setId(2L);

        when(adminServiceService.getAllServices()).thenReturn(List.of(s1, s2));

        mockMvc.perform(get("/admin/services"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.length()").value(2))
                .andExpect(jsonPath("$.data[1].status").value("INACTIVE"));
    }

    @Test
    @DisplayName("POST /admin/services - Tạo dịch vụ mới thành công (HTTP 201)")
    void testCreateService_Success() throws Exception {
        AdminServiceRequest request = AdminServiceRequest.builder()
                .name("Tour tham quan Đảo Cát Bà")
                .price(new BigDecimal("450000.00"))
                .unit("Vé")
                .description("Tour ngắm hoàng hôn vịnh Lan Hạ")
                .status(ServiceStatus.ACTIVE)
                .build();

        Service created = Service.builder()
                .name(request.getName())
                .price(request.getPrice())
                .unit(request.getUnit())
                .status(request.getStatus())
                .build();
        created.setId(11L);

        when(adminServiceService.createService(any(AdminServiceRequest.class))).thenReturn(created);

        mockMvc.perform(post("/admin/services")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.name").value("Tour tham quan Đảo Cát Bà"));
    }

    @Test
    @DisplayName("POST /admin/services - Trùng tên dịch vụ trả về HTTP 409")
    void testCreateService_DuplicateName() throws Exception {
        AdminServiceRequest request = AdminServiceRequest.builder()
                .name("Bữa sáng Buffet")
                .price(new BigDecimal("120000.00"))
                .unit("Suất")
                .build();

        when(adminServiceService.createService(any(AdminServiceRequest.class)))
                .thenThrow(new AppException(ErrorCode.CONFLICT, "Tên dịch vụ đã tồn tại"));

        mockMvc.perform(post("/admin/services")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Tên dịch vụ đã tồn tại"));
    }

    @Test
    @DisplayName("DELETE /admin/services/{id} - Dịch vụ đã phát sinh giao dịch chuyển INACTIVE trả về HTTP 200 kèm thông báo")
    void testDeleteService_HasTransactions_Deactivated() throws Exception {
        when(adminServiceService.deleteService(1L)).thenReturn(false);

        mockMvc.perform(delete("/admin/services/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Dịch vụ đã phát sinh giao dịch nên được chuyển sang trạng thái Ngừng hoạt động"));
    }

    @Test
    @DisplayName("DELETE /admin/services/{id} - Dịch vụ chưa phát sinh giao dịch xóa cứng thành công (HTTP 200)")
    void testDeleteService_NeverUsed_HardDeleted() throws Exception {
        when(adminServiceService.deleteService(99L)).thenReturn(true);

        mockMvc.perform(delete("/admin/services/99"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Xóa dịch vụ thành công"));
    }
}
