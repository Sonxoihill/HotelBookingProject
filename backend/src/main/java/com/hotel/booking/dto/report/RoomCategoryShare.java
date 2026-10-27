package com.hotel.booking.dto.report;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Tỷ trọng doanh thu và số lượng đơn theo từng loại phòng")
public class RoomCategoryShare {

    @Schema(description = "Tên loại phòng", example = "Deluxe Double")
    private String categoryName;

    @Schema(description = "Số lượng đơn đặt phòng hoàn thành", example = "4")
    private Long bookingCount;

    @Schema(description = "Doanh thu mang lại từ loại phòng (VNĐ)", example = "16330000")
    private BigDecimal revenue;

    @Schema(description = "Tỷ trọng phần trăm trên tổng doanh thu (%)", example = "36.6")
    private Double percentage;
}
