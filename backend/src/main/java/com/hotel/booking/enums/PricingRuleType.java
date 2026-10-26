package com.hotel.booking.enums;

import lombok.Getter;

@Getter
public enum PricingRuleType {
    WEEKEND("Cuối tuần"),
    HOLIDAY("Lễ Tết"),
    PEAK_SEASON("Mùa cao điểm");

    private final String displayName;

    PricingRuleType(String displayName) {
        this.displayName = displayName;
    }
}
