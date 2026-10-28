package com.hotel.booking.service.admin;

import com.hotel.booking.common.exception.AppException;
import com.hotel.booking.common.exception.ErrorCode;
import com.hotel.booking.dto.admin.PricingRuleRequest;
import com.hotel.booking.dto.admin.PricingRuleResponse;
import com.hotel.booking.entity.PricingRule;
import com.hotel.booking.entity.RoomCategory;
import com.hotel.booking.enums.PricingRuleType;
import com.hotel.booking.repository.PricingRuleRepository;
import com.hotel.booking.repository.RoomCategoryRepository;
import com.hotel.booking.service.admin.impl.AdminPricingRuleServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminPricingRuleServiceImplTest {

    @Mock
    private PricingRuleRepository pricingRuleRepository;

    @Mock
    private RoomCategoryRepository roomCategoryRepository;

    @InjectMocks
    private AdminPricingRuleServiceImpl pricingRuleService;

    private RoomCategory deluxeCategory;

    @BeforeEach
    void setUp() {
        deluxeCategory = RoomCategory.builder()
                .name("Deluxe Double")
                .basePrice(new BigDecimal("950000"))
                .build();
        deluxeCategory.setId(2L);
    }

    @Test
    @DisplayName("Validation: Ném lỗi 400 khi endDate < startDate kèm field name")
    void testValidate_EndDateBeforeStartDate() {
        PricingRuleRequest request = PricingRuleRequest.builder()
                .name("Quy tắc sai ngày")
                .ruleType(PricingRuleType.HOLIDAY)
                .startDate(LocalDate.of(2027, 9, 5))
                .endDate(LocalDate.of(2027, 9, 1))
                .adjustmentPercent(new BigDecimal("20.00"))
                .build();

        AppException ex = assertThrows(AppException.class, () ->
                pricingRuleService.createPricingRule(request));

        assertEquals(ErrorCode.BAD_REQUEST, ex.getErrorCode());
        assertTrue(ex.getMessage().contains("Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu"));
        assertNotNull(ex.getErrors());
    }

    @Test
    @DisplayName("Validation: Ném lỗi 400 khi adjustmentPercent <= -100")
    void testValidate_AdjustmentPercentTooLow() {
        PricingRuleRequest request = PricingRuleRequest.builder()
                .name("Giảm quá 100%")
                .ruleType(PricingRuleType.HOLIDAY)
                .startDate(LocalDate.of(2027, 9, 1))
                .endDate(LocalDate.of(2027, 9, 3))
                .adjustmentPercent(new BigDecimal("-100.00"))
                .build();

        AppException ex = assertThrows(AppException.class, () ->
                pricingRuleService.createPricingRule(request));

        assertEquals(ErrorCode.BAD_REQUEST, ex.getErrorCode());
        assertTrue(ex.getMessage().contains("Tỷ lệ điều chỉnh giá không hợp lệ (không thể giảm quá 100%)"));
    }

    @Test
    @DisplayName("Validation: Ném lỗi 400 khi adjustmentPercent > 500")
    void testValidate_AdjustmentPercentTooHigh() {
        PricingRuleRequest request = PricingRuleRequest.builder()
                .name("Tăng quá 500%")
                .ruleType(PricingRuleType.HOLIDAY)
                .startDate(LocalDate.of(2027, 9, 1))
                .endDate(LocalDate.of(2027, 9, 3))
                .adjustmentPercent(new BigDecimal("550.00"))
                .build();

        AppException ex = assertThrows(AppException.class, () ->
                pricingRuleService.createPricingRule(request));

        assertEquals(ErrorCode.BAD_REQUEST, ex.getErrorCode());
        assertTrue(ex.getMessage().contains("500%"));
    }

    @Test
    @DisplayName("Overlap: Ném lỗi 409 khi khoảng thời gian trùng lặp với quy tắc khác")
    void testValidate_OverlapThrows409() {
        PricingRuleRequest request = PricingRuleRequest.builder()
                .name("Quy tắc trùng")
                .ruleType(PricingRuleType.HOLIDAY)
                .startDate(LocalDate.of(2027, 9, 1))
                .endDate(LocalDate.of(2027, 9, 3))
                .adjustmentPercent(new BigDecimal("20.00"))
                .categoryId(2L)
                .build();

        when(pricingRuleRepository.existsOverlappingRule(eq(null), eq(2L), eq(request.getStartDate()), eq(request.getEndDate())))
                .thenReturn(true);

        AppException ex = assertThrows(AppException.class, () ->
                pricingRuleService.createPricingRule(request));

        assertEquals(ErrorCode.CONFLICT, ex.getErrorCode());
        assertEquals("Khoảng thời gian áp dụng bị trùng lặp với một quy tắc giá khác", ex.getMessage());
    }

    @Test
    @DisplayName("Tạo mới thành công khi không có trùng lặp")
    void testCreate_Success() {
        PricingRuleRequest request = PricingRuleRequest.builder()
                .name("Hợp lệ")
                .ruleType(PricingRuleType.HOLIDAY)
                .startDate(LocalDate.of(2027, 9, 1))
                .endDate(LocalDate.of(2027, 9, 3))
                .adjustmentPercent(new BigDecimal("20.00"))
                .categoryId(2L)
                .build();

        when(pricingRuleRepository.existsOverlappingRule(any(), any(), any(), any())).thenReturn(false);
        when(roomCategoryRepository.findById(2L)).thenReturn(Optional.of(deluxeCategory));
        when(pricingRuleRepository.save(any(PricingRule.class))).thenAnswer(invocation -> {
            PricingRule r = invocation.getArgument(0);
            r.setId(10L);
            return r;
        });

        PricingRuleResponse response = pricingRuleService.createPricingRule(request);

        assertNotNull(response);
        assertEquals(10L, response.getId());
        assertEquals("Hợp lệ", response.getName());
        assertEquals("Deluxe Double", response.getCategoryName());
    }
}
