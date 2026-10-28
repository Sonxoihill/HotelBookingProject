package com.hotel.booking.enums;

import lombok.Getter;

@Getter
public enum Department {
    FRONT_DESK("Quầy Lễ tân"),
    HOUSEKEEPING("Buồng phòng"),
    MANAGEMENT("Quản lý");

    private final String displayName;

    Department(String displayName) {
        this.displayName = displayName;
    }
}
