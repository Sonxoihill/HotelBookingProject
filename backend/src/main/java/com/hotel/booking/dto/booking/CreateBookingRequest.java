package com.hotel.booking.dto.booking;

import com.fasterxml.jackson.annotation.JsonAlias;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Schema(description = "Dữ liệu yêu cầu tạo mới đơn đặt phòng")
public class CreateBookingRequest {

    @NotNull(message = "ID phòng không được để trống")
    @Schema(description = "ID của phòng muốn đặt", example = "2", requiredMode = Schema.RequiredMode.REQUIRED)
    private Long roomId;

    @NotNull(message = "Ngày nhận phòng không được để trống")
    @JsonAlias({"checkInDate", "check_in"})
    @Schema(description = "Ngày nhận phòng (YYYY-MM-DD)", example = "2026-11-20", requiredMode = Schema.RequiredMode.REQUIRED)
    private LocalDate checkIn;

    @NotNull(message = "Ngày trả phòng không được để trống")
    @JsonAlias({"checkOutDate", "check_out"})
    @Schema(description = "Ngày trả phòng (YYYY-MM-DD)", example = "2026-11-22", requiredMode = Schema.RequiredMode.REQUIRED)
    private LocalDate checkOut;

    @Schema(description = "Tổng tiền tính toán (VNĐ). Nếu để trống hệ thống sẽ tự tính theo: giá phòng x số đêm x 1.1 VAT", example = "1540000")
    private BigDecimal totalAmount;

    @Schema(description = "Phương thức thanh toán: VNPAY, CREDIT_CARD, RECEPTION", example = "VNPAY")
    private String paymentMethod;

    @Schema(description = "Yêu cầu đặc biệt của khách hàng", example = "Phòng tầng cao, view ngắm biển, không hút thuốc")
    private String specialRequests;

    // Thông tin khách lưu trú bổ sung
    @JsonAlias({"customerName", "guestName"})
    @Schema(description = "Họ và tên khách lưu trú", example = "Nguyễn Văn Trọng")
    private String fullName;

    @JsonAlias({"customerPhone", "guestPhone"})
    @Schema(description = "Số điện thoại liên hệ", example = "0987654321")
    private String phone;

    @JsonAlias({"customerEmail", "guestEmail"})
    @Schema(description = "Email nhận thư xác nhận đặt phòng và hóa đơn điện tử", example = "nvt29062005@gmail.com")
    private String email;
}

