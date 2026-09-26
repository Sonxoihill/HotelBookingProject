package com.hotel.booking.service;

import com.hotel.booking.dto.booking.CancelBookingRequest;
import com.hotel.booking.dto.booking.CreateBookingRequest;
import com.hotel.booking.entity.Booking;

import java.util.List;

public interface BookingService {
    List<Booking> getMyBookings(String email);

    Booking createBooking(String email, CreateBookingRequest request);

    Booking cancelBooking(String email, Long bookingId, CancelBookingRequest request);
}
