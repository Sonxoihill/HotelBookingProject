package com.hotel.booking.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;
import org.springframework.format.annotation.DateTimeFormat;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Yêu cầu tìm kiếm và lọc phòng")
public class RoomSearchRequest {

    @Schema(description = "Ngày nhận phòng (Định dạng: YYYY-MM-DD)", example = "2026-10-10", type = "string", format = "date")
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate checkIn;

    @Schema(description = "Ngày trả phòng (Định dạng: YYYY-MM-DD)", example = "2026-10-12", type = "string", format = "date")
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate checkOut;

    @Schema(description = "Giá phòng tối thiểu (VNĐ)", example = "500000")
    private BigDecimal minPrice;

    @Schema(description = "Giá phòng tối đa (VNĐ)", example = "3000000")
    private BigDecimal maxPrice;

    @Schema(description = "ID danh mục / hạng phòng", example = "1")
    private Long categoryId;

    @Schema(description = "Sức chứa tối thiểu (Số người lớn)", example = "2")
    private Integer capacity;
}

