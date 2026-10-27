package com.hotel.booking.dto.report;

import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
@Schema(description = "Dữ liệu báo cáo thống kê doanh thu toàn diện (UC17)")
public class RevenueReportResponse {

    @Schema(description = "Có dữ liệu hoàn thành trong khoảng thời gian không", example = "true")
    private Boolean hasData;

    @Schema(description = "Thông báo trạng thái dữ liệu", example = "Thành công")
    private String message;

    @Schema(description = "Các chỉ số KPI tổng quan")
    private SummaryMetrics summaryMetrics;

    @Builder.Default
    @Schema(description = "Dữ liệu biểu đồ doanh thu theo mốc thời gian")
    private List<RevenueByTime> revenueByTime = new ArrayList<>();

    @Builder.Default
    @Schema(description = "Dữ liệu biểu đồ tỷ trọng doanh thu theo loại phòng")
    private List<RoomCategoryShare> roomCategoryShare = new ArrayList<>();

    public static RevenueReportResponse noData() {
        return RevenueReportResponse.builder()
                .hasData(false)
                .message("Không có dữ liệu trong khoảng thời gian này")
                .summaryMetrics(null)
                .revenueByTime(new ArrayList<>())
                .roomCategoryShare(new ArrayList<>())
                .build();
    }
}
