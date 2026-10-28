package com.hotel.booking.repository.projection;

import java.math.BigDecimal;

public interface CategoryShareProjection {
    String getCategoryName();
    Long getBookingCount();
    BigDecimal getRevenue();
}
