package com.hotel.booking.repository;

import com.hotel.booking.entity.Booking;
import com.hotel.booking.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUserId(Long userId);
    List<Booking> findByRoomId(Long roomId);
    List<Booking> findByStatus(BookingStatus status);
    boolean existsByRoomId(Long roomId);
    boolean existsByRoomIdAndStatusIn(Long roomId, List<BookingStatus> statuses);

    @Query("SELECT b FROM Booking b JOIN FETCH b.user u JOIN FETCH b.room r LEFT JOIN FETCH r.category c WHERE b.id = :id")
    java.util.Optional<Booking> findByIdWithDetails(@Param("id") Long id);

    @Query("SELECT b FROM Booking b JOIN FETCH b.room r JOIN FETCH r.category c WHERE b.user.id = :userId ORDER BY b.createdAt DESC")
    List<Booking> findMyBookings(@Param("userId") Long userId);

    @Query("SELECT COUNT(b) > 0 FROM Booking b " +
           "WHERE b.room.id = :roomId " +
           "  AND b.status IN (com.hotel.booking.enums.BookingStatus.PENDING, com.hotel.booking.enums.BookingStatus.CONFIRMED) " +
           "  AND b.checkIn < :checkOut " +
           "  AND b.checkOut > :checkIn")
    boolean existsOverlappingBooking(
            @Param("roomId") Long roomId,
            @Param("checkIn") LocalDate checkIn,
            @Param("checkOut") LocalDate checkOut
    );

    @Query("SELECT b FROM Booking b JOIN FETCH b.room r " +
           "WHERE b.status = com.hotel.booking.enums.BookingStatus.PENDING " +
           "  AND b.createdAt < :cutoffTime")
    List<Booking> findExpiredPendingBookings(@Param("cutoffTime") LocalDateTime cutoffTime);

    @Query(value = "SELECT b FROM Booking b " +
           "JOIN FETCH b.user u " +
           "JOIN FETCH b.room r " +
           "LEFT JOIN FETCH r.category c " +
           "WHERE (:status IS NULL OR b.status = :status) " +
           "  AND (:keyword IS NULL OR :keyword = '' OR " +
           "       LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "       LOWER(u.phone) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "       LOWER(r.roomNumber) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "       CONCAT('', b.id) LIKE CONCAT('%', :keyword, '%'))",
           countQuery = "SELECT COUNT(b) FROM Booking b " +
           "JOIN b.user u " +
           "JOIN b.room r " +
           "WHERE (:status IS NULL OR b.status = :status) " +
           "  AND (:keyword IS NULL OR :keyword = '' OR " +
           "       LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "       LOWER(u.phone) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "       LOWER(r.roomNumber) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "       CONCAT('', b.id) LIKE CONCAT('%', :keyword, '%'))")
    Page<Booking> findReceptionistBookings(
            @Param("keyword") String keyword,
            @Param("status") BookingStatus status,
            Pageable pageable
    );
}
