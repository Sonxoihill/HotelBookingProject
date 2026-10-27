package com.hotel.booking.repository.projection;

import java.math.BigDecimal;

public interface TimeRevenueProjection {
    String getTimeLabel();
    BigDecimal getTotalRev();
    BigDecimal getServiceRev();
    Long getBookingCount();
    Long getOccupiedNights();
}
