package com.hotel.booking.service.impl;

import com.hotel.booking.common.exception.AppException;
import com.hotel.booking.common.exception.ErrorCode;
import com.hotel.booking.dto.response.NightQuote;
import com.hotel.booking.dto.response.PriceQuote;
import com.hotel.booking.entity.PricingRule;
import com.hotel.booking.entity.RoomCategory;
import com.hotel.booking.enums.PricingRuleType;
import com.hotel.booking.repository.PricingRuleRepository;
import com.hotel.booking.service.PricingCalculator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class PricingCalculatorImpl implements PricingCalculator {

    private final PricingRuleRepository pricingRuleRepository;

    @Override
    @Transactional(readOnly = true)
    public PriceQuote calculate(RoomCategory category, LocalDate checkIn, LocalDate checkOut) {
        if (checkIn == null || checkOut == null) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Ngày nhận phòng và trả phòng không được để trống");
        }
        if (!checkOut.isAfter(checkIn)) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Ngày trả phòng phải sau ngày nhận phòng");
        }

        BigDecimal basePrice = (category != null && category.getBasePrice() != null)
                ? category.getBasePrice()
                : BigDecimal.valueOf(500000);

        LocalDate lastNight = checkOut.minusDays(1);
        Long categoryId = (category != null) ? category.getId() : null;

        // Query 1 lần duy nhất tất cả quy tắc giao với khoảng lưu trú [checkIn, checkOut)
        List<PricingRule> applicableRules = pricingRuleRepository.findApplicableRules(categoryId, checkIn, lastNight);

        List<NightQuote> nightQuotes = new ArrayList<>();
        LocalDate current = checkIn;

        while (!current.isAfter(lastNight)) {
            final LocalDate nightDate = current;

            // Lọc quy tắc áp dụng cho đêm hiện tại
            List<PricingRule> matched = applicableRules.stream().filter(rule -> {
                if (nightDate.isBefore(rule.getStartDate()) || nightDate.isAfter(rule.getEndDate())) {
                    return false;
                }
                // WEEKEND chỉ áp dụng cho đêm Thứ 6, Thứ 7, Chủ nhật
                if (rule.getRuleType() == PricingRuleType.WEEKEND) {
                    DayOfWeek dow = nightDate.getDayOfWeek();
                    return dow == DayOfWeek.FRIDAY || dow == DayOfWeek.SATURDAY || dow == DayOfWeek.SUNDAY;
                }
                return true;
            }).collect(Collectors.toList());

            PricingRule bestRule = null;
            if (!matched.isEmpty()) {
                // Ưu tiên 1: Quy tắc riêng của loại phòng ghi đè quy tắc toàn khách sạn
                List<PricingRule> categoryRules = matched.stream()
                        .filter(r -> r.getCategory() != null)
                        .collect(Collectors.toList());
                List<PricingRule> candidatePool = !categoryRules.isEmpty() ? categoryRules : matched;

                // Ưu tiên 2: HOLIDAY > PEAK_SEASON > WEEKEND
                bestRule = candidatePool.stream()
                        .min(Comparator.comparingInt((PricingRule r) -> {
                            if (r.getRuleType() == PricingRuleType.HOLIDAY) return 1;
                            if (r.getRuleType() == PricingRuleType.PEAK_SEASON) return 2;
                            if (r.getRuleType() == PricingRuleType.WEEKEND) return 3;
                            return 4;
                        }).thenComparing(PricingRule::getId, Comparator.reverseOrder()))
                        .orElse(null);
            }

            BigDecimal finalPrice;
            String appliedRuleName;
            BigDecimal adjustmentPercent;

            if (bestRule != null) {
                appliedRuleName = bestRule.getName();
                adjustmentPercent = bestRule.getAdjustmentPercent();
                // Giá mỗi đêm = basePrice * (1 + adjustmentPercent / 100), làm tròn số nguyên
                BigDecimal multiplier = BigDecimal.ONE.add(
                        adjustmentPercent.divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP));
                finalPrice = basePrice.multiply(multiplier).setScale(0, RoundingMode.HALF_UP);
            } else {
                appliedRuleName = null;
                adjustmentPercent = BigDecimal.ZERO;
                finalPrice = basePrice.setScale(0, RoundingMode.HALF_UP);
            }

            nightQuotes.add(NightQuote.builder()
                    .date(nightDate)
                    .basePrice(basePrice.setScale(0, RoundingMode.HALF_UP))
                    .appliedRuleName(appliedRuleName)
                    .adjustmentPercent(adjustmentPercent)
                    .finalPrice(finalPrice)
                    .build());

            current = current.plusDays(1);
        }

        BigDecimal subtotal = nightQuotes.stream()
                .map(NightQuote::getFinalPrice)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // 10% VAT
        BigDecimal vat = subtotal.multiply(BigDecimal.valueOf(0.10)).setScale(0, RoundingMode.HALF_UP);
        BigDecimal total = subtotal.add(vat);

        return PriceQuote.builder()
                .nights(nightQuotes)
                .subtotal(subtotal)
                .vat(vat)
                .total(total)
                .build();
    }
}
