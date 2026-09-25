package com.hotel.booking.service;

import com.hotel.booking.dto.review.CreateReviewRequest;
import com.hotel.booking.dto.review.ReviewResponse;
import com.hotel.booking.dto.review.RoomReviewsSummaryResponse;

import java.util.List;

public interface ReviewService {
    ReviewResponse createReview(String userEmail, CreateReviewRequest request);
    RoomReviewsSummaryResponse getReviewsByRoomId(Long roomId);
    List<ReviewResponse> getMyReviews(String userEmail);
}
