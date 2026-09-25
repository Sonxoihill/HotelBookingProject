package com.hotel.booking.dto.booking;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateBookingRequest {

    @NotNull(message = "ID phòng không được để trống")
    private Long roomId;

    @NotNull(message = "Ngày nhận phòng không được để trống")
    private LocalDate checkIn;

    @NotNull(message = "Ngày trả phòng không được để trống")
    private LocalDate checkOut;

    private BigDecimal totalAmount;

    private String paymentMethod; // VNPAY, CREDIT_CARD, RECEPTION

    private String specialRequests;

    // Thông tin khách lưu trú bổ sung
    private String fullName;
    private String phone;
    private String email;
}
