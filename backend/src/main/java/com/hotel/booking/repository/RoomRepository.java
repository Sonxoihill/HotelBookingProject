package com.hotel.booking.repository;

import com.hotel.booking.entity.Room;
import com.hotel.booking.enums.RoomStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {
    Optional<Room> findByRoomNumber(String roomNumber);
    List<Room> findByStatus(RoomStatus status);
    List<Room> findByCategoryId(Long categoryId);
    List<Room> findByCategoryIdAndStatus(Long categoryId, RoomStatus status);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT r FROM Room r WHERE r.id = :id")
    Optional<Room> findByIdWithLock(@Param("id") Long id);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"category"})
    org.springframework.data.domain.Page<Room> findAll(org.springframework.data.domain.Pageable pageable);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"category"})
    List<Room> findAll();

    @org.springframework.data.jpa.repository.Query("SELECT DISTINCT r FROM Room r " +
            "JOIN FETCH r.category c " +
            "WHERE r.status != com.hotel.booking.enums.RoomStatus.MAINTENANCE " +
            "  AND (:categoryId IS NULL OR c.id = :categoryId) " +
            "  AND (:capacity IS NULL OR c.capacity >= :capacity) " +
            "  AND (:minPrice IS NULL OR c.basePrice >= :minPrice) " +
            "  AND (:maxPrice IS NULL OR c.basePrice <= :maxPrice) " +
            "  AND (:checkIn IS NULL OR :checkOut IS NULL OR r.id NOT IN (" +
            "      SELECT b.room.id FROM Booking b " +
            "      WHERE b.status IN (com.hotel.booking.enums.BookingStatus.PENDING, com.hotel.booking.enums.BookingStatus.CONFIRMED) " +
            "        AND b.checkIn < :checkOut " +
            "        AND b.checkOut > :checkIn" +
            "  )) " +
            "ORDER BY c.basePrice ASC, r.roomNumber ASC")
    List<Room> searchRooms(
            @org.springframework.data.repository.query.Param("checkIn") java.time.LocalDate checkIn,
            @org.springframework.data.repository.query.Param("checkOut") java.time.LocalDate checkOut,
            @org.springframework.data.repository.query.Param("minPrice") java.math.BigDecimal minPrice,
            @org.springframework.data.repository.query.Param("maxPrice") java.math.BigDecimal maxPrice,
            @org.springframework.data.repository.query.Param("categoryId") Long categoryId,
            @org.springframework.data.repository.query.Param("capacity") Integer capacity
    );
}

