package com.hotel.booking.repository;

import com.hotel.booking.entity.Booking;
import com.hotel.booking.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUserId(Long userId);
    List<Booking> findByRoomId(Long roomId);
    List<Booking> findByStatus(BookingStatus status);

    @org.springframework.data.jpa.repository.Query("SELECT b FROM Booking b JOIN FETCH b.room r JOIN FETCH r.category c WHERE b.user.id = :userId ORDER BY b.createdAt DESC")
    List<Booking> findMyBookings(@org.springframework.data.repository.query.Param("userId") Long userId);
}
