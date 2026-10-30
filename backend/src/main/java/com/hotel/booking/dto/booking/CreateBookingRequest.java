package com.hotel.booking.dto.booking;

import com.fasterxml.jackson.annotation.JsonAlias;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
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

    @Deprecated
    @Schema(description = "Tổng tiền (VNĐ) - ĐÃ DEPRECATED: Hệ thống luôn tự động tính toán lại giá thông qua PricingCalculator để đảm bảo an toàn, không tin cậy dữ liệu client gửi lên", example = "1540000")
    private BigDecimal totalAmount;

    @Schema(description = "Phương thức thanh toán: VNPAY, CREDIT_CARD, RECEPTION", example = "VNPAY")
    private String paymentMethod;

    @Size(max = 100, message = "Phần ghi chú thêm không được vượt quá 100 ký tự")
    @Schema(description = "Yêu cầu đặc biệt của khách hàng", example = "Phòng tầng cao, view ngắm biển, không hút thuốc")
    private String specialRequests;

    // Thông tin khách lưu trú bổ sung
    @NotBlank(message = "Không được để trống trường Họ tên")
    @Pattern(regexp = "^[\\p{L}][\\p{L}\\s]{0,98}[\\p{L}]$", message = "Họ tên không đúng định dạng")
    @JsonAlias({"customerName", "guestName"})
    @Schema(description = "Họ và tên khách lưu trú", example = "Nguyễn Văn Trọng", requiredMode = Schema.RequiredMode.REQUIRED)
    private String fullName;

    @NotBlank(message = "Không được để trống trường SĐT")
    @Pattern(regexp = "^(0|\\+84)[35789]\\d{8}$", message = "SĐT không đúng định dạng")
    @JsonAlias({"customerPhone", "guestPhone"})
    @Schema(description = "Số điện thoại liên hệ", example = "0987654321", requiredMode = Schema.RequiredMode.REQUIRED)
    private String phone;

    @NotBlank(message = "Không được để trống trường Email")
    @Pattern(regexp = "^[a-zA-Z0-9.]+@gmail\\.com$", message = "Email không đúng định dạng")
    @JsonAlias({"customerEmail", "guestEmail"})
    @Schema(description = "Email nhận thư xác nhận đặt phòng và hóa đơn điện tử", example = "nvt29062005@gmail.com", requiredMode = Schema.RequiredMode.REQUIRED)
    private String email;
}

