package com.hotel.booking.repository;

import com.hotel.booking.entity.BookingService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

@Repository
public interface BookingServiceRepository extends JpaRepository<BookingService, Long> {
    List<BookingService> findByBookingId(Long bookingId);
    List<BookingService> findByServiceId(Long serviceId);
    boolean existsByServiceId(Long serviceId);

    @Query("SELECT bs FROM BookingService bs JOIN FETCH bs.service WHERE bs.booking.id = :bookingId ORDER BY bs.id ASC")
    List<BookingService> findByBookingIdWithService(@Param("bookingId") Long bookingId);
}
