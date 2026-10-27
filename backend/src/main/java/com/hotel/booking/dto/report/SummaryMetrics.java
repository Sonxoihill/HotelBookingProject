package com.hotel.booking.dto.report;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Các chỉ số KPI doanh thu tổng quan")
public class SummaryMetrics {

    @Schema(description = "Tổng doanh thu bao gồm tiền phòng và dịch vụ (VNĐ)", example = "44670000")
    private BigDecimal totalRevenue;

    @Schema(description = "Doanh thu thuần từ tiền phòng (VNĐ)", example = "38500000")
    private BigDecimal roomRevenue;

    @Schema(description = "Doanh thu phát sinh từ dịch vụ (VNĐ)", example = "6170000")
    private BigDecimal serviceRevenue;

    @Schema(description = "Số lượng đơn đặt phòng đã hoàn thành (CHECKED_OUT)", example = "10")
    private Long completedBookings;

    @Schema(description = "Công suất sử dụng phòng trung bình (%)", example = "78.5")
    private Double occupancyRate;

    @Schema(description = "Hạng phòng mang lại doanh thu cao nhất", example = "Executive Suite")
    private String topCategory;
}
