package com.hotel.booking.entity;

import com.hotel.booking.common.entity.BaseEntity;
import com.hotel.booking.enums.RoomStatus;
import jakarta.persistence.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "rooms")
public class Room extends BaseEntity {

    @Column(name = "room_number", nullable = false, unique = true, length = 20)
    private String roomNumber;

    @Column(name = "floor")
    private Integer floor;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private RoomStatus status = RoomStatus.AVAILABLE;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id", nullable = false)
    private RoomCategory category;

    @Transient
    public String getImageUrl() {
        return category != null ? category.getImageUrl() : null;
    }

    @Transient
    public String getCategoryName() {
        return category != null ? category.getName() : null;
    }

    @Transient
    public java.math.BigDecimal getBasePrice() {
        return category != null ? category.getBasePrice() : null;
    }

    @Transient
    public Integer getCapacity() {
        return category != null ? category.getCapacity() : null;
    }

    @Transient
    public String getBedType() {
        return category != null ? category.getBedType() : null;
    }

    @Transient
    public String getDescription() {
        return category != null ? category.getDescription() : null;
    }
}
