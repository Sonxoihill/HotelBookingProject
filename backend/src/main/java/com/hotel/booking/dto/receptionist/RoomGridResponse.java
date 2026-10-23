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
public class RoomGridResponse {

    // Room info
    private Long id;
    private String roomNumber;
    private String roomCode;
    private Integer floor;
    private RoomStatus status;
    private String statusLabel;
    private String categoryName;
    private String type;
    private Long categoryId;
    private BigDecimal basePrice;
    private BigDecimal pricePerNight;
    private Integer capacity;
    private String bedType;
    private String imageUrl;

    // Active booking summary (CHECKED_IN / CONFIRMED)
    private Long bookingId;
    private BookingStatus bookingStatus;
    private String guestName;
    private String guestPhone;
    private LocalDateTime actualCheckIn;
    private LocalDate checkIn;
    private LocalDate checkOut;
    private String notes;
    private String specialNotes;
    private BigDecimal totalAmount;
    private BigDecimal paidAmount;

    public RoomGridResponse(
            Long id,
            String roomNumber,
            Integer floor,
            RoomStatus status,
            String categoryName,
            Long categoryId,
            BigDecimal basePrice,
            Integer capacity,
            String bedType,
            String imageUrl,
            Long bookingId,
            BookingStatus bookingStatus,
            String guestName,
            String guestPhone,
            LocalDateTime actualCheckIn,
            LocalDate checkIn,
            LocalDate checkOut,
            String notes,
            BigDecimal totalAmount,
            BigDecimal paidAmount
    ) {
        this.id = id;
        this.roomNumber = roomNumber;
        this.roomCode = roomNumber;
        this.floor = floor;
        this.status = status;
        this.statusLabel = getStatusLabel(status);
        this.categoryName = categoryName;
        this.type = categoryName;
        this.categoryId = categoryId;
        this.basePrice = basePrice;
        this.pricePerNight = basePrice;
        this.capacity = capacity;
        this.bedType = bedType;
        this.imageUrl = imageUrl;
        this.bookingId = bookingId;
        this.bookingStatus = bookingStatus;
        this.guestName = guestName;
        this.guestPhone = guestPhone;
        this.actualCheckIn = actualCheckIn;
        this.checkIn = checkIn;
        this.checkOut = checkOut;
        this.notes = notes;
        this.specialNotes = notes;
        this.totalAmount = totalAmount;
        this.paidAmount = paidAmount;
    }

    public static String getStatusLabel(RoomStatus status) {
        if (status == null) return "";
        return switch (status) {
            case AVAILABLE -> "Trống";
            case OCCUPIED -> "Đang có khách";
            case DIRTY -> "Cần dọn";
            case RESERVED -> "Đã đặt";
            case MAINTENANCE -> "Đang bảo trì";
            case ON_HOLD -> "Đang giữ chỗ";
        };
    }
}
