package com.hotel.booking.entity;

import com.hotel.booking.common.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "room_categories")
public class RoomCategory extends BaseEntity {

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "base_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal basePrice;

    @Column(name = "capacity", nullable = false)
    private Integer capacity;

    @Column(name = "bed_type", length = 50)
    private String bedType;

    @Column(name = "image_url", length = 500)
    private String imageUrl;
}
