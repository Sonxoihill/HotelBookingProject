package com.hotel.booking.service.admin.impl;

import com.hotel.booking.common.exception.AppException;
import com.hotel.booking.common.exception.ErrorCode;
import com.hotel.booking.dto.admin.PricingRuleRequest;
import com.hotel.booking.dto.admin.PricingRuleResponse;
import com.hotel.booking.entity.PricingRule;
import com.hotel.booking.entity.RoomCategory;
import com.hotel.booking.enums.PricingRuleType;
import com.hotel.booking.repository.PricingRuleRepository;
import com.hotel.booking.repository.RoomCategoryRepository;
import com.hotel.booking.service.admin.AdminPricingRuleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminPricingRuleServiceImpl implements AdminPricingRuleService {

    private final PricingRuleRepository pricingRuleRepository;
    private final RoomCategoryRepository roomCategoryRepository;

    @Override
    @Transactional(readOnly = true)
    public List<PricingRuleResponse> getPricingRules(PricingRuleType ruleType, Long categoryId, Boolean active) {
        return pricingRuleRepository.findAllWithFilters(ruleType, categoryId, active)
                .stream()
                .map(PricingRuleResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PricingRuleResponse getPricingRuleById(Long id) {
        PricingRule rule = pricingRuleRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy quy tắc giá"));
        return PricingRuleResponse.fromEntity(rule);
    }

    @Override
    @Transactional
    public PricingRuleResponse createPricingRule(PricingRuleRequest request) {
        validatePricingRule(null, request);

        RoomCategory category = null;
        if (request.getCategoryId() != null) {
            category = roomCategoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new AppException(ErrorCode.BAD_REQUEST, "Loại phòng không tồn tại"));
        }

        PricingRule rule = PricingRule.builder()
                .name(request.getName().trim())
                .ruleType(request.getRuleType())
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .adjustmentPercent(request.getAdjustmentPercent())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .category(category)
                .build();

        PricingRule saved = pricingRuleRepository.save(rule);
        log.info("Đã tạo mới quy tắc giá: id={}, name={}", saved.getId(), saved.getName());
        return PricingRuleResponse.fromEntity(saved);
    }

    @Override
    @Transactional
    public PricingRuleResponse updatePricingRule(Long id, PricingRuleRequest request) {
        PricingRule rule = pricingRuleRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy quy tắc giá"));

        validatePricingRule(id, request);

        RoomCategory category = null;
        if (request.getCategoryId() != null) {
            category = roomCategoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new AppException(ErrorCode.BAD_REQUEST, "Loại phòng không tồn tại"));
        }

        rule.setName(request.getName().trim());
        rule.setRuleType(request.getRuleType());
        rule.setStartDate(request.getStartDate());
        rule.setEndDate(request.getEndDate());
        rule.setAdjustmentPercent(request.getAdjustmentPercent());
        rule.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);
        rule.setCategory(category);

        PricingRule updated = pricingRuleRepository.save(rule);
        log.info("Đã cập nhật quy tắc giá: id={}, name={}", updated.getId(), updated.getName());
        return PricingRuleResponse.fromEntity(updated);
    }

    @Override
    @Transactional
    public void deletePricingRule(Long id) {
        PricingRule rule = pricingRuleRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy quy tắc giá"));
        pricingRuleRepository.delete(rule);
        log.info("Đã xóa quy tắc giá: id={}", id);
    }

    private void validatePricingRule(Long currentId, PricingRuleRequest request) {
        Map<String, String> errors = new HashMap<>();

        if (request.getStartDate() != null && request.getEndDate() != null) {
            if (request.getEndDate().isBefore(request.getStartDate())) {
                errors.put("endDate", "Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu");
            }
        }

        if (request.getAdjustmentPercent() != null) {
            if (request.getAdjustmentPercent().compareTo(BigDecimal.ZERO) == 0) {
                errors.put("adjustmentPercent", "Phần trăm điều chỉnh phải khác 0");
            } else if (request.getAdjustmentPercent().compareTo(BigDecimal.valueOf(-100)) <= 0) {
                errors.put("adjustmentPercent", "Tỷ lệ điều chỉnh giá không hợp lệ (không thể giảm quá 100%)");
            } else if (request.getAdjustmentPercent().compareTo(BigDecimal.valueOf(500)) > 0) {
                errors.put("adjustmentPercent", "Tỷ lệ điều chỉnh giá không được vượt quá 500%");
            }
        }

        if (!errors.isEmpty()) {
            String firstError = errors.values().iterator().next();
            throw new AppException(ErrorCode.BAD_REQUEST, firstError, errors);
        }

        // Kiểm tra trùng lặp thời gian áp dụng
        boolean isOverlapping = pricingRuleRepository.existsOverlappingRule(
                currentId,
                request.getCategoryId(),
                request.getStartDate(),
                request.getEndDate()
        );

        if (isOverlapping) {
            throw new AppException(ErrorCode.CONFLICT, "Khoảng thời gian áp dụng bị trùng lặp với một quy tắc giá khác");
        }
    }
}
