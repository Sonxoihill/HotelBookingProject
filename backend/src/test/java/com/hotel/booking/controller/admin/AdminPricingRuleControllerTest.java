package com.hotel.booking.controller.admin;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hotel.booking.common.exception.AppException;
import com.hotel.booking.common.exception.ErrorCode;
import com.hotel.booking.common.exception.GlobalExceptionHandler;
import com.hotel.booking.dto.admin.PricingRuleRequest;
import com.hotel.booking.dto.admin.PricingRuleResponse;
import com.hotel.booking.enums.PricingRuleType;
import com.hotel.booking.service.admin.AdminPricingRuleService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class AdminPricingRuleControllerTest {

    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

    @Mock
    private AdminPricingRuleService pricingRuleService;

    @InjectMocks
    private AdminPricingRuleController adminPricingRuleController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(adminPricingRuleController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    @DisplayName("UC15: Lấy danh sách quy tắc giá với bộ lọc thành công")
    void testGetPricingRules_Success() throws Exception {
        PricingRuleResponse ruleResponse = PricingRuleResponse.builder()
                .id(1L)
                .name("Quốc Khánh 2/9/2027 +20%")
                .ruleType(PricingRuleType.HOLIDAY)
                .startDate(LocalDate.of(2027, 9, 1))
                .endDate(LocalDate.of(2027, 9, 3))
                .adjustmentPercent(new BigDecimal("20.00"))
                .isActive(true)
                .categoryId(2L)
                .categoryName("Deluxe Double")
                .build();

        when(pricingRuleService.getPricingRules(eq(PricingRuleType.HOLIDAY), eq(2L), eq(true)))
                .thenReturn(List.of(ruleResponse));

        mockMvc.perform(get("/admin/pricing-rules")
                        .param("ruleType", "HOLIDAY")
                        .param("categoryId", "2")
                        .param("active", "true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data[0].name").value("Quốc Khánh 2/9/2027 +20%"))
                .andExpect(jsonPath("$.data[0].categoryName").value("Deluxe Double"));
    }

    @Test
    @DisplayName("UC15: Tạo mới quy tắc giá thành công (201 Created)")
    void testCreatePricingRule_Success() throws Exception {
        PricingRuleRequest request = PricingRuleRequest.builder()
                .name("Giáng sinh 2026 +30%")
                .ruleType(PricingRuleType.HOLIDAY)
                .startDate(LocalDate.of(2026, 12, 24))
                .endDate(LocalDate.of(2026, 12, 26))
                .adjustmentPercent(new BigDecimal("30.00"))
                .categoryId(1L)
                .isActive(true)
                .build();

        PricingRuleResponse response = PricingRuleResponse.builder()
                .id(5L)
                .name("Giáng sinh 2026 +30%")
                .ruleType(PricingRuleType.HOLIDAY)
                .startDate(LocalDate.of(2026, 12, 24))
                .endDate(LocalDate.of(2026, 12, 26))
                .adjustmentPercent(new BigDecimal("30.00"))
                .isActive(true)
                .categoryId(1L)
                .categoryName("Standard Room")
                .build();

        when(pricingRuleService.createPricingRule(any(PricingRuleRequest.class))).thenReturn(response);

        mockMvc.perform(post("/admin/pricing-rules")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(5))
                .andExpect(jsonPath("$.data.name").value("Giáng sinh 2026 +30%"));
    }

    @Test
    @DisplayName("UC15 Luồng 5a: Báo lỗi 400 khi ngày kết thúc < ngày bắt đầu, kèm tên field")
    void testCreatePricingRule_EndDateBeforeStartDate_Returns400() throws Exception {
        PricingRuleRequest request = PricingRuleRequest.builder()
                .name("Quy tắc lỗi ngày")
                .ruleType(PricingRuleType.HOLIDAY)
                .startDate(LocalDate.of(2027, 9, 5))
                .endDate(LocalDate.of(2027, 9, 1)) // endDate < startDate
                .adjustmentPercent(new BigDecimal("20.00"))
                .build();

        when(pricingRuleService.createPricingRule(any(PricingRuleRequest.class)))
                .thenThrow(new AppException(ErrorCode.BAD_REQUEST, "Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu",
                        Map.of("endDate", "Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu")));

        mockMvc.perform(post("/admin/pricing-rules")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu"))
                .andExpect(jsonPath("$.errors.endDate").value("Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu"));
    }

    @Test
    @DisplayName("UC15 Luồng 5a: Báo lỗi 400 khi adjustmentPercent <= -100%, kèm tên field")
    void testCreatePricingRule_AdjustmentTooLow_Returns400() throws Exception {
        PricingRuleRequest request = PricingRuleRequest.builder()
                .name("Quy tắc giảm quá 100%")
                .ruleType(PricingRuleType.HOLIDAY)
                .startDate(LocalDate.of(2027, 9, 1))
                .endDate(LocalDate.of(2027, 9, 3))
                .adjustmentPercent(new BigDecimal("-105.00")) // < -100%
                .build();

        when(pricingRuleService.createPricingRule(any(PricingRuleRequest.class)))
                .thenThrow(new AppException(ErrorCode.BAD_REQUEST, "Tỷ lệ điều chỉnh giá không hợp lệ (không thể giảm quá 100%)",
                        Map.of("adjustmentPercent", "Tỷ lệ điều chỉnh giá không hợp lệ (không thể giảm quá 100%)")));

        mockMvc.perform(post("/admin/pricing-rules")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errors.adjustmentPercent").value("Tỷ lệ điều chỉnh giá không hợp lệ (không thể giảm quá 100%)"));
    }

    @Test
    @DisplayName("UC15 Luồng 5a: Trùng lặp khoảng thời gian áp dụng -> HTTP 409 Conflict")
    void testCreatePricingRule_OverlapConflict_Returns409() throws Exception {
        PricingRuleRequest request = PricingRuleRequest.builder()
                .name("Quy tắc trùng thời gian")
                .ruleType(PricingRuleType.HOLIDAY)
                .startDate(LocalDate.of(2027, 9, 1))
                .endDate(LocalDate.of(2027, 9, 3))
                .adjustmentPercent(new BigDecimal("20.00"))
                .categoryId(2L)
                .build();

        when(pricingRuleService.createPricingRule(any(PricingRuleRequest.class)))
                .thenThrow(new AppException(ErrorCode.CONFLICT, "Khoảng thời gian áp dụng bị trùng lặp với một quy tắc giá khác"));

        mockMvc.perform(post("/admin/pricing-rules")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Khoảng thời gian áp dụng bị trùng lặp với một quy tắc giá khác"));
    }

    @Test
    @DisplayName("UC15: Xóa quy tắc giá thành công")
    void testDeletePricingRule_Success() throws Exception {
        doNothing().when(pricingRuleService).deletePricingRule(1L);

        mockMvc.perform(delete("/admin/pricing-rules/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));

        verify(pricingRuleService).deletePricingRule(1L);
    }
}
