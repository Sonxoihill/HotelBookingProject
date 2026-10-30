package com.hotel.booking.enums;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Loại thống kê báo cáo doanh thu")
public enum ReportType {
    DAILY,
    MONTHLY,
    BY_CATEGORY
}
