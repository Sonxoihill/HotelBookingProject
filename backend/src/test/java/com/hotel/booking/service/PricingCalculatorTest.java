package com.hotel.booking.service;

import com.hotel.booking.common.exception.AppException;
import com.hotel.booking.dto.response.NightQuote;
import com.hotel.booking.dto.response.PriceQuote;
import com.hotel.booking.entity.PricingRule;
import com.hotel.booking.entity.RoomCategory;
import com.hotel.booking.enums.PricingRuleType;
import com.hotel.booking.repository.PricingRuleRepository;
import com.hotel.booking.service.impl.PricingCalculatorImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class PricingCalculatorTest {

    @Mock
    private PricingRuleRepository pricingRuleRepository;

    @InjectMocks
    private PricingCalculatorImpl pricingCalculator;

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
    @DisplayName("AC Nghiệm thu UC15 & UC06: Đặt phòng Deluxe đêm 01/09/2027 và 02/09/2027 -> mỗi đêm 1.140.000đ, tổng 2.508.000đ (VAT 10%)")
    void testCalculate_AcceptanceCriteria_DeluxeNationalHoliday() {
        LocalDate checkIn = LocalDate.of(2027, 9, 1);
        LocalDate checkOut = LocalDate.of(2027, 9, 3); // 2 nights: 01/09 and 02/09

        PricingRule nationalHolidayRule = PricingRule.builder()
                .id(10L)
                .name("Quốc Khánh 2/9/2027 +20%")
                .ruleType(PricingRuleType.HOLIDAY)
                .startDate(LocalDate.of(2027, 9, 1))
                .endDate(LocalDate.of(2027, 9, 3))
                .adjustmentPercent(new BigDecimal("20.00"))
                .isActive(true)
                .category(deluxeCategory)
                .build();

        when(pricingRuleRepository.findApplicableRules(eq(2L), eq(checkIn), eq(LocalDate.of(2027, 9, 2))))
                .thenReturn(List.of(nationalHolidayRule));

        PriceQuote quote = pricingCalculator.calculate(deluxeCategory, checkIn, checkOut);

        assertNotNull(quote);
        assertEquals(2, quote.getNights().size());

        // Night 1: 01/09/2027
        NightQuote night1 = quote.getNights().get(0);
        assertEquals(LocalDate.of(2027, 9, 1), night1.getDate());
        assertEquals(new BigDecimal("950000"), night1.getBasePrice());
        assertEquals("Quốc Khánh 2/9/2027 +20%", night1.getAppliedRuleName());
        assertEquals(new BigDecimal("20.00"), night1.getAdjustmentPercent());
        assertEquals(new BigDecimal("1140000"), night1.getFinalPrice());

        // Night 2: 02/09/2027
        NightQuote night2 = quote.getNights().get(1);
        assertEquals(LocalDate.of(2027, 9, 2), night2.getDate());
        assertEquals(new BigDecimal("950000"), night2.getBasePrice());
        assertEquals("Quốc Khánh 2/9/2027 +20%", night2.getAppliedRuleName());
        assertEquals(new BigDecimal("20.00"), night2.getAdjustmentPercent());
        assertEquals(new BigDecimal("1140000"), night2.getFinalPrice());

        // Subtotal = 1.140.000 * 2 = 2.280.000
        assertEquals(new BigDecimal("2280000"), quote.getSubtotal());

        // VAT 10% = 228.000
        assertEquals(new BigDecimal("228000"), quote.getVat());

        // Total = 2.280.000 + 228.000 = 2.508.000
        assertEquals(new BigDecimal("2508000"), quote.getTotal());
    }

    @Test
    @DisplayName("Thứ tự ưu tiên 1: Quy tắc riêng của loại phòng ghi đè quy tắc toàn khách sạn")
    void testCalculate_CategoryRuleOverridesHotelWideRule() {
        LocalDate checkIn = LocalDate.of(2027, 7, 1);
        LocalDate checkOut = LocalDate.of(2027, 7, 2);

        PricingRule globalRule = PricingRule.builder()
                .id(1L)
                .name("Hè toàn khách sạn +10%")
                .ruleType(PricingRuleType.PEAK_SEASON)
                .startDate(LocalDate.of(2027, 6, 1))
                .endDate(LocalDate.of(2027, 8, 31))
                .adjustmentPercent(new BigDecimal("10.00"))
                .category(null) // hotel-wide
                .build();

        PricingRule categoryRule = PricingRule.builder()
                .id(2L)
                .name("Hè Deluxe đặc biệt +30%")
                .ruleType(PricingRuleType.PEAK_SEASON)
                .startDate(LocalDate.of(2027, 6, 1))
                .endDate(LocalDate.of(2027, 8, 31))
                .adjustmentPercent(new BigDecimal("30.00"))
                .category(deluxeCategory) // specific to deluxe
                .build();

        when(pricingRuleRepository.findApplicableRules(eq(2L), eq(checkIn), eq(checkIn)))
                .thenReturn(List.of(globalRule, categoryRule));

        PriceQuote quote = pricingCalculator.calculate(deluxeCategory, checkIn, checkOut);

        // Should pick the category rule (+30%): 950.000 * 1.3 = 1.235.000
        assertEquals(new BigDecimal("1235000"), quote.getNights().get(0).getFinalPrice());
        assertEquals("Hè Deluxe đặc biệt +30%", quote.getNights().get(0).getAppliedRuleName());
    }

    @Test
    @DisplayName("Thứ tự ưu tiên 2: HOLIDAY > PEAK_SEASON > WEEKEND")
    void testCalculate_HolidayOverridesPeakSeasonAndWeekend() {
        // 2027-09-03 is Friday (Weekend eligible)
        LocalDate checkIn = LocalDate.of(2027, 9, 3);
        LocalDate checkOut = LocalDate.of(2027, 9, 4);

        PricingRule holidayRule = PricingRule.builder()
                .id(1L)
                .name("Nghỉ Lễ +50%")
                .ruleType(PricingRuleType.HOLIDAY)
                .startDate(LocalDate.of(2027, 9, 1))
                .endDate(LocalDate.of(2027, 9, 5))
                .adjustmentPercent(new BigDecimal("50.00"))
                .category(null)
                .build();

        PricingRule weekendRule = PricingRule.builder()
                .id(2L)
                .name("Cuối tuần +15%")
                .ruleType(PricingRuleType.WEEKEND)
                .startDate(LocalDate.of(2027, 1, 1))
                .endDate(LocalDate.of(2027, 12, 31))
                .adjustmentPercent(new BigDecimal("15.00"))
                .category(null)
                .build();

        when(pricingRuleRepository.findApplicableRules(eq(2L), eq(checkIn), eq(checkIn)))
                .thenReturn(List.of(holidayRule, weekendRule));

        PriceQuote quote = pricingCalculator.calculate(deluxeCategory, checkIn, checkOut);

        // HOLIDAY wins over WEEKEND
        assertEquals("Nghỉ Lễ +50%", quote.getNights().get(0).getAppliedRuleName());
        assertEquals(new BigDecimal("1425000"), quote.getNights().get(0).getFinalPrice());
    }

    @Test
    @DisplayName("Quy tắc WEEKEND chỉ áp dụng cho Thứ 6, Thứ 7, Chủ nhật; ngày thường giữ giá gốc")
    void testCalculate_WeekendOnlyAppliesOnWeekendDays() {
        // 2027-09-02 is Thursday (not weekend), 2027-09-03 is Friday (weekend)
        LocalDate checkIn = LocalDate.of(2027, 9, 2);
        LocalDate checkOut = LocalDate.of(2027, 9, 4);

        PricingRule weekendRule = PricingRule.builder()
                .id(1L)
                .name("Cuối tuần +10%")
                .ruleType(PricingRuleType.WEEKEND)
                .startDate(LocalDate.of(2027, 1, 1))
                .endDate(LocalDate.of(2027, 12, 31))
                .adjustmentPercent(new BigDecimal("10.00"))
                .category(null)
                .build();

        when(pricingRuleRepository.findApplicableRules(eq(2L), eq(checkIn), eq(LocalDate.of(2027, 9, 3))))
                .thenReturn(List.of(weekendRule));

        PriceQuote quote = pricingCalculator.calculate(deluxeCategory, checkIn, checkOut);

        // Night 1 (Thursday): Base price 950.000, no rule
        assertNull(quote.getNights().get(0).getAppliedRuleName());
        assertEquals(new BigDecimal("950000"), quote.getNights().get(0).getFinalPrice());

        // Night 2 (Friday): Weekend rule applied 950.000 * 1.10 = 1.045.000
        assertEquals("Cuối tuần +10%", quote.getNights().get(1).getAppliedRuleName());
        assertEquals(new BigDecimal("1045000"), quote.getNights().get(1).getFinalPrice());
    }

    @Test
    @DisplayName("Báo lỗi 400 khi ngày trả phòng <= ngày nhận phòng")
    void testCalculate_InvalidDates_ThrowsBadRequest() {
        LocalDate checkIn = LocalDate.of(2027, 9, 3);
        LocalDate checkOut = LocalDate.of(2027, 9, 1);

        assertThrows(AppException.class, () ->
                pricingCalculator.calculate(deluxeCategory, checkIn, checkOut));
    }
}
