package com.hotel.booking.controller;

import com.hotel.booking.common.response.ApiResponse;
import com.hotel.booking.config.JwtUtil;
import com.hotel.booking.entity.Booking;
import com.hotel.booking.service.BookingService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;
    private final JwtUtil jwtUtil;

    @GetMapping("/my-history")
    public ApiResponse<List<Booking>> getMyBookings(
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        String email = jwtUtil.extractEmail(authHeader);
        List<Booking> bookings = bookingService.getMyBookings(email);
        return ApiResponse.success("Lấy lịch sử đặt phòng thành công", bookings);
    }

    @org.springframework.web.bind.annotation.PostMapping
    public ApiResponse<Booking> createBooking(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @jakarta.validation.Valid @org.springframework.web.bind.annotation.RequestBody com.hotel.booking.dto.booking.CreateBookingRequest request
    ) {
        String email = null;
        try {
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                email = jwtUtil.extractEmail(authHeader);
            }
        } catch (Exception ignored) {}

        Booking booking = bookingService.createBooking(email, request);
        return ApiResponse.success("Đặt phòng thành công!", booking);
    }

    @org.springframework.web.bind.annotation.PatchMapping("/{id}/cancel")
    public ApiResponse<Booking> cancelBooking(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @org.springframework.web.bind.annotation.PathVariable Long id,
            @jakarta.validation.Valid @org.springframework.web.bind.annotation.RequestBody com.hotel.booking.dto.booking.CancelBookingRequest request
    ) {
        String email = null;
        try {
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                email = jwtUtil.extractEmail(authHeader);
            }
        } catch (Exception ignored) {}

        Booking booking = bookingService.cancelBooking(email, id, request);
        return ApiResponse.success("Hủy đơn đặt phòng thành công!", booking);
    }
}
