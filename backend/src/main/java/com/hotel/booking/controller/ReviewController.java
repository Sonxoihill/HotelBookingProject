package com.hotel.booking.controller;

import com.hotel.booking.common.response.ApiResponse;
import com.hotel.booking.config.JwtUtil;
import com.hotel.booking.dto.review.CreateReviewRequest;
import com.hotel.booking.dto.review.ReviewResponse;
import com.hotel.booking.dto.review.RoomReviewsSummaryResponse;
import com.hotel.booking.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;
    private final JwtUtil jwtUtil;

    @PostMapping
    public ApiResponse<ReviewResponse> createReview(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @Valid @RequestBody CreateReviewRequest request
    ) {
        String email = jwtUtil.extractEmail(authHeader);
        ReviewResponse response = reviewService.createReview(email, request);
        return ApiResponse.success("Đánh giá của bạn đã được ghi nhận thành công!", response);
    }

    @GetMapping("/room/{roomId}")
    public ApiResponse<RoomReviewsSummaryResponse> getRoomReviews(@PathVariable Long roomId) {
        RoomReviewsSummaryResponse response = reviewService.getReviewsByRoomId(roomId);
        return ApiResponse.success("Lấy danh sách đánh giá phòng thành công", response);
    }

    @GetMapping("/my-reviews")
    public ApiResponse<List<ReviewResponse>> getMyReviews(
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        String email = jwtUtil.extractEmail(authHeader);
        List<ReviewResponse> response = reviewService.getMyReviews(email);
        return ApiResponse.success("Lấy danh sách đánh giá của bạn thành công", response);
    }
}
