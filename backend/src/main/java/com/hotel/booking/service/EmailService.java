package com.hotel.booking.service;

import com.hotel.booking.entity.Booking;

public interface EmailService {

    /**
     * Gửi email xác nhận đặt phòng tự động bất đồng bộ (@Async)
     *
     * @param booking Đơn đặt phòng vừa thanh toán thành công
     */
    void sendBookingConfirmationEmail(Booking booking);
}
