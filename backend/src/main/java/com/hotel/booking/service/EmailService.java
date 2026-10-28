package com.hotel.booking.service;

import com.hotel.booking.entity.Booking;

public interface EmailService {

    /**
     * Gửi email xác nhận đặt phòng tự động bất đồng bộ (@Async)
     *
     * @param booking Đơn đặt phòng vừa thanh toán thành công
     */
    void sendBookingConfirmationEmail(Booking booking);

    /**
     * Gửi email cấp tài khoản nhân sự với mật khẩu ngẫu nhiên (@Async)
     *
     * @param user Thông tin nhân sự vừa được tạo
     * @param rawPassword Mật khẩu ngẫu nhiên vừa sinh
     */
    void sendStaffAccountEmail(com.hotel.booking.entity.User user, String rawPassword);
}
