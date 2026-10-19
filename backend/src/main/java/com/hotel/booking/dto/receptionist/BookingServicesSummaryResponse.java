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
public class BookingServicesSummaryResponse {

    private Long bookingId;
    private Long roomId;
    private String roomNumber;
    private String roomCode;
    private String roomType;
    private String categoryName;
    private Long userId;
    private String guestName;
    private String guestPhone;
    private BookingStatus bookingStatus;
    private LocalDate checkIn;
    private LocalDate checkOut;
    private LocalDateTime actualCheckIn;
    private String notes;

    private BigDecimal roomAmount;
    private BigDecimal totalServiceAmount;
    private BigDecimal totalAmount;
    private BigDecimal paidAmount;
    private BigDecimal remainingAmount;

    @Builder.Default
    private List<BookingServiceDetailResponse> services = new ArrayList<>();
}
