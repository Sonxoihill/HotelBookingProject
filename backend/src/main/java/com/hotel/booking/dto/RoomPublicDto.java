package com.hotel.booking.dto;

import com.hotel.booking.enums.RoomStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomPublicDto {
    private Long id;
    private String roomNumber;
    private Integer floor;
    private RoomStatus status;
    private Long categoryId;
    private String categoryName;
    private String description;
    private BigDecimal basePrice;
    private Integer capacity;
    private String bedType;
    private String imageUrl;
}
