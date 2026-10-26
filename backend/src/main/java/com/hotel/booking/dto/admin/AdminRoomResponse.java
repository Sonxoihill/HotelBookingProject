package com.hotel.booking.dto.admin;

import com.hotel.booking.entity.Room;
import com.hotel.booking.entity.RoomCategory;
import com.hotel.booking.enums.RoomStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminRoomResponse {
    private Long id;
    private String roomNumber;
    private Integer floor;
    private RoomStatus status;
    private Long categoryId;
    private String categoryName;
    private BigDecimal basePrice;
    private Integer capacity;
    private Integer bedCount;
    private BigDecimal area;
    private String bedType;
    private String imageUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static AdminRoomResponse from(Room room) {
        if (room == null) return null;
        RoomCategory cat = room.getCategory();
        return AdminRoomResponse.builder()
                .id(room.getId())
                .roomNumber(room.getRoomNumber())
                .floor(room.getFloor())
                .status(room.getStatus())
                .categoryId(cat != null ? cat.getId() : null)
                .categoryName(cat != null ? cat.getName() : null)
                .basePrice(cat != null ? cat.getBasePrice() : null)
                .capacity(cat != null ? cat.getCapacity() : null)
                .bedCount(cat != null ? cat.getBedCount() : null)
                .area(cat != null ? cat.getArea() : null)
                .bedType(cat != null ? cat.getBedType() : null)
                .imageUrl(cat != null ? cat.getImageUrl() : null)
                .createdAt(room.getCreatedAt())
                .updatedAt(room.getUpdatedAt())
                .build();
    }
}
