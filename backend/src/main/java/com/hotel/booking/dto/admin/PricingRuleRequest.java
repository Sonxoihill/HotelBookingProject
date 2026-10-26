package com.hotel.booking.dto.admin;

import com.hotel.booking.enums.PricingRuleType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Dữ liệu yêu cầu tạo mới hoặc cập nhật quy tắc giá linh hoạt")
public class PricingRuleRequest {

    @NotBlank(message = "Tên quy tắc không được để trống")
    @Schema(description = "Tên quy tắc giá", example = "Quốc Khánh 2/9/2027 +20%", requiredMode = Schema.RequiredMode.REQUIRED)
    private String name;

    @NotNull(message = "Loại quy tắc không được để trống")
    @Schema(description = "Loại quy tắc giá: HOLIDAY, PEAK_SEASON, WEEKEND", example = "HOLIDAY", requiredMode = Schema.RequiredMode.REQUIRED)
    private PricingRuleType ruleType;

    @NotNull(message = "Ngày bắt đầu không được để trống")
    @Schema(description = "Ngày bắt đầu áp dụng (YYYY-MM-DD)", example = "2027-09-01", requiredMode = Schema.RequiredMode.REQUIRED)
    private LocalDate startDate;

    @NotNull(message = "Ngày kết thúc không được để trống")
    @Schema(description = "Ngày kết thúc áp dụng (YYYY-MM-DD)", example = "2027-09-03", requiredMode = Schema.RequiredMode.REQUIRED)
    private LocalDate endDate;

    @NotNull(message = "Tỷ lệ điều chỉnh giá không được để trống")
    @Schema(description = "Tỷ lệ % điều chỉnh giá (dương là tăng, âm là giảm)", example = "20.00", requiredMode = Schema.RequiredMode.REQUIRED)
    private BigDecimal adjustmentPercent;

    @Schema(description = "ID loại phòng áp dụng. Để null nghĩa là áp dụng cho toàn bộ khách sạn", example = "2")
    private Long categoryId;

    @Builder.Default
    @Schema(description = "Trạng thái kích hoạt của quy tắc", example = "true")
    private Boolean isActive = true;
}
