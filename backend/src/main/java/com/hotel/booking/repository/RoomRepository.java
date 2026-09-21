package com.hotel.booking.repository;

import com.hotel.booking.entity.Room;
import com.hotel.booking.enums.RoomStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {
    Optional<Room> findByRoomNumber(String roomNumber);
    List<Room> findByStatus(RoomStatus status);
    List<Room> findByCategoryId(Long categoryId);
    List<Room> findByCategoryIdAndStatus(Long categoryId, RoomStatus status);

    @Query(value = "SELECT r FROM Room r JOIN FETCH r.category",
           countQuery = "SELECT COUNT(r) FROM Room r")
    Page<Room> findAllWithCategory(Pageable pageable);
}
