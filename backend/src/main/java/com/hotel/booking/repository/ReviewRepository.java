package com.hotel.booking.repository;

import com.hotel.booking.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByRoomId(Long roomId);
    List<Review> findByRoomIdOrderByCreatedAtDesc(Long roomId);
    List<Review> findByUserId(Long userId);
    List<Review> findByUserIdOrderByCreatedAtDesc(Long userId);
}
