package com.hotel.booking.service.impl;

import com.hotel.booking.dto.review.CreateReviewRequest;
import com.hotel.booking.dto.review.ReviewResponse;
import com.hotel.booking.dto.review.RoomReviewsSummaryResponse;
import com.hotel.booking.entity.Booking;
import com.hotel.booking.entity.Review;
import com.hotel.booking.entity.Room;
import com.hotel.booking.entity.User;
import com.hotel.booking.repository.BookingRepository;
import com.hotel.booking.repository.ReviewRepository;
import com.hotel.booking.repository.RoomRepository;
import com.hotel.booking.repository.UserRepository;
import com.hotel.booking.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final RoomRepository roomRepository;
    private final BookingRepository bookingRepository;

    @Override
    @Transactional
    public ReviewResponse createReview(String userEmail, CreateReviewRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy thông tin tài khoản: " + userEmail));

        Room room = null;
        if (request.getBookingId() != null) {
            Booking booking = bookingRepository.findById(request.getBookingId())
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đơn đặt phòng #" + request.getBookingId()));
            room = booking.getRoom();
        } else if (request.getRoomId() != null) {
            room = roomRepository.findById(request.getRoomId())
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy phòng #" + request.getRoomId()));
        } else {
            throw new IllegalArgumentException("Cần cung cấp mã đơn đặt phòng hoặc mã phòng để đánh giá.");
        }

        Review review = Review.builder()
                .user(user)
                .room(room)
                .rating(request.getRating())
                .comment(request.getComment())
                .build();

        Review saved = reviewRepository.save(review);
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public RoomReviewsSummaryResponse getReviewsByRoomId(Long roomId) {
        List<Review> reviews = reviewRepository.findByRoomIdOrderByCreatedAtDesc(roomId);
        if (reviews.isEmpty()) {
            return RoomReviewsSummaryResponse.builder()
                    .averageRating(0.0)
                    .totalReviews(0)
                    .reviews(List.of())
                    .build();
        }

        double avg = reviews.stream()
                .mapToInt(Review::getRating)
                .average()
                .orElse(0.0);

        BigDecimal roundedAvg = BigDecimal.valueOf(avg).setScale(1, RoundingMode.HALF_UP);

        List<ReviewResponse> responseList = reviews.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return RoomReviewsSummaryResponse.builder()
                .averageRating(roundedAvg.doubleValue())
                .totalReviews(reviews.size())
                .reviews(responseList)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewResponse> getMyReviews(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy tài khoản: " + userEmail));

        return reviewRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private ReviewResponse mapToResponse(Review review) {
        String userName = review.getUser() != null ? review.getUser().getFullName() : "Khách hàng";
        String roomNumber = review.getRoom() != null ? review.getRoom().getRoomNumber() : "";
        Long roomId = review.getRoom() != null ? review.getRoom().getId() : null;
        Long userId = review.getUser() != null ? review.getUser().getId() : null;

        return ReviewResponse.builder()
                .id(review.getId())
                .rating(review.getRating())
                .comment(review.getComment())
                .userId(userId)
                .userName(userName)
                .roomId(roomId)
                .roomNumber(roomNumber)
                .createdAt(review.getCreatedAt())
                .build();
    }
}
