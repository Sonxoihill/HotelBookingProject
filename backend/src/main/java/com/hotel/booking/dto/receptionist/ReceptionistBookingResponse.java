package com.hotel.booking.dto.receptionist;

import com.hotel.booking.enums.BookingStatus;
import com.hotel.booking.enums.RoomStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReceptionistBookingResponse {

    private Long id;
    private String code;
    private Long userId;
    private String guestName;
    private String guestPhone;
    private String guestEmail;
    private String guestTier;

    private Long roomId;
    private String roomNumber;
    private String roomCode;
    private String roomCategory;
    private Integer floor;
    private RoomStatus roomStatus;

    private LocalDate checkIn;
    private LocalDate checkOut;
    private Long numberOfNights;
    private LocalDateTime actualCheckIn;
    private LocalDateTime actualCheckOut;

    private BookingStatus status;
    private String statusLabel;

    private BigDecimal totalAmount;
    private BigDecimal paidAmount;
    private BigDecimal remainingAmount;

    private String cancelReason;
    private String notes;
    private LocalDateTime createdAt;
}
