package com.hotel.booking.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Báo giá tổng hợp toàn bộ kỳ lưu trú bao gồm danh sách từng đêm và thuế VAT")
public class PriceQuote {

    @Schema(description = "Báo giá chi tiết cho từng đêm")
    private List<NightQuote> nights;

    @Schema(description = "Tổng tiền phòng các đêm trước thuế (VNĐ)", example = "2280000")
    private BigDecimal subtotal;

    @Schema(description = "Thuế GTGT / VAT (10%)", example = "228000")
    private BigDecimal vat;

    @Schema(description = "Tổng số tiền thanh toán cuối cùng đã gồm VAT (VNĐ)", example = "2508000")
    private BigDecimal total;
}
