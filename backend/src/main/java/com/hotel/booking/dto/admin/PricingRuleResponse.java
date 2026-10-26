package com.hotel.booking.dto.admin;

import com.hotel.booking.entity.PricingRule;
import com.hotel.booking.enums.PricingRuleType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Thông tin chi tiết quy tắc giá linh hoạt")
public class PricingRuleResponse {

    private Long id;
    private String name;
    private PricingRuleType ruleType;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal adjustmentPercent;
    private Boolean isActive;
    private Long categoryId;
    @Schema(description = "Tên loại phòng. Trả về null nghĩa là áp dụng cho Tất cả loại phòng")
    private String categoryName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static PricingRuleResponse fromEntity(PricingRule rule) {
        if (rule == null) return null;
        return PricingRuleResponse.builder()
                .id(rule.getId())
                .name(rule.getName())
                .ruleType(rule.getRuleType())
                .startDate(rule.getStartDate())
                .endDate(rule.getEndDate())
                .adjustmentPercent(rule.getAdjustmentPercent())
                .isActive(rule.getIsActive())
                .categoryId(rule.getCategory() != null ? rule.getCategory().getId() : null)
                .categoryName(rule.getCategory() != null ? rule.getCategory().getName() : null)
                .createdAt(rule.getCreatedAt())
                .updatedAt(rule.getUpdatedAt())
                .build();
    }
}
