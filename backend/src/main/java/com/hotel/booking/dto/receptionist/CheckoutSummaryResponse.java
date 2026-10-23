package com.hotel.booking.dto.receptionist;

import com.hotel.booking.enums.BookingStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CheckoutSummaryResponse {

    private Long bookingId;
    private String bookingCode;
    private Long roomId;
    private String roomNumber;
    private String roomCategory;
    private Long userId;
    private String guestName;
    private String guestPhone;
    private String guestEmail;
    private BookingStatus bookingStatus;

    private LocalDate checkIn;
    private LocalDate checkOut;
    private LocalDateTime actualCheckIn;
    private LocalDateTime checkoutTime;

    private Long numberOfNights;
    private BigDecimal roomPricePerNight;
    private BigDecimal roomAmount;          // Tiền phòng
    private BigDecimal totalServiceAmount;   // Tổng tiền dịch vụ phát sinh (UC11)
    private BigDecimal totalAmount;          // Tổng cộng = Tiền phòng + Dịch vụ
    private BigDecimal paidAmount;           // Tiền đã trả trước
    private BigDecimal remainingAmount;      // Số tiền cần thu thêm = totalAmount - paidAmount

    @Builder.Default
    private List<BookingServiceDetailResponse> services = new ArrayList<>();
}
