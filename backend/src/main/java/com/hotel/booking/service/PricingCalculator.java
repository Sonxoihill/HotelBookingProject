package com.hotel.booking.service;

import com.hotel.booking.dto.response.PriceQuote;
import com.hotel.booking.entity.RoomCategory;

import java.time.LocalDate;

public interface PricingCalculator {
    /**
     * Tính toán báo giá chi tiết từng đêm và tổng tiền (kèm 10% VAT)
     * áp dụng các quy tắc giá linh hoạt (cuối tuần, lễ tết, mùa cao điểm).
     *
     * @param category Loại phòng cần tính giá
     * @param checkIn Ngày nhận phòng
     * @param checkOut Ngày trả phòng
     * @return Báo giá PriceQuote
     */
    PriceQuote calculate(RoomCategory category, LocalDate checkIn, LocalDate checkOut);
}
