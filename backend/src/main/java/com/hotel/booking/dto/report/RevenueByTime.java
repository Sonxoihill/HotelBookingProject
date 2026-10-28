package com.hotel.booking.dto.report;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Doanh thu phân bổ theo mốc thời gian (ngày hoặc tháng)")
public class RevenueByTime {

    @Schema(description = "Nhãn mốc thời gian (YYYY-MM hoặc YYYY-MM-DD)", example = "2026-09")
    private String label;

    @Schema(description = "Doanh thu tiền phòng (VNĐ)", example = "7800000")
    private BigDecimal roomRevenue;

    @Schema(description = "Doanh thu dịch vụ (VNĐ)", example = "600000")
    private BigDecimal serviceRevenue;

    @Schema(description = "Tổng doanh thu mốc thời gian (VNĐ)", example = "8400000")
    private BigDecimal totalRevenue;

    @Schema(description = "Công suất sử dụng phòng (%)", example = "82.4")
    private Double occupancyRate;
}
