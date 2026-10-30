package com.hotel.booking.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Báo giá chi tiết cho từng đêm lưu trú")
public class NightQuote {

    @Schema(description = "Ngày lưu trú (đêm)", example = "2027-09-01")
    private LocalDate date;

    @Schema(description = "Giá gốc mỗi đêm niêm yết của loại phòng", example = "950000")
    private BigDecimal basePrice;

    @Schema(description = "Tên quy tắc giá áp dụng", example = "Quốc Khánh 2/9/2027 +20%")
    private String appliedRuleName;

    @Schema(description = "Tỷ lệ phần trăm điều chỉnh giá áp dụng", example = "20.00")
    private BigDecimal adjustmentPercent;

    @Schema(description = "Giá sau khi điều chỉnh cho đêm này", example = "1140000")
    private BigDecimal finalPrice;
}
