package com.hotel.booking.controller;

import com.hotel.booking.common.response.ApiResponse;
import com.hotel.booking.config.JwtUtil;
import com.hotel.booking.dto.review.CreateReviewRequest;
import com.hotel.booking.dto.review.ReviewResponse;
import com.hotel.booking.dto.review.RoomReviewsSummaryResponse;
import com.hotel.booking.service.ReviewService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/reviews")
@RequiredArgsConstructor
@Tag(name = "Review Management", description = "Các API đánh giá phòng, xem đánh giá của phòng và của cá nhân")
public class ReviewController {

    private final ReviewService reviewService;
    private final JwtUtil jwtUtil;

    @Operation(
            summary = "Gửi đánh giá và nhận xét cho phòng",
            description = "Gửi đánh giá (số sao 1-5 và bình luận) cho phòng đã từng lưu trú.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Đánh giá phòng thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Dữ liệu đánh giá không hợp lệ")
    })
    @PostMapping
    public ApiResponse<ReviewResponse> createReview(
            @Parameter(hidden = true)
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @Valid @RequestBody CreateReviewRequest request
    ) {
        String email = jwtUtil.extractEmail(authHeader);
        ReviewResponse response = reviewService.createReview(email, request);
        return ApiResponse.success("Đánh giá của bạn đã được ghi nhận thành công!", response);
    }

    @Operation(
            summary = "Lấy danh sách đánh giá của phòng",
            description = "Trả về điểm trung bình và toàn bộ danh sách đánh giá của khách hàng cho phòng chỉ định."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Lấy danh sách đánh giá thành công")
    })
    @GetMapping("/room/{roomId}")
    public ApiResponse<RoomReviewsSummaryResponse> getRoomReviews(
            @Parameter(description = "ID của phòng", example = "1", required = true)
            @PathVariable Long roomId) {
        RoomReviewsSummaryResponse response = reviewService.getReviewsByRoomId(roomId);
        return ApiResponse.success("Lấy danh sách đánh giá phòng thành công", response);
    }

    @Operation(
            summary = "Lấy danh sách đánh giá của bản thân",
            description = "Trả về các đánh giá mà tài khoản đang đăng nhập đã gửi.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Lấy danh sách đánh giá thành công")
    })
    @GetMapping("/my-reviews")
    public ApiResponse<List<ReviewResponse>> getMyReviews(
            @Parameter(hidden = true)
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        String email = jwtUtil.extractEmail(authHeader);
        List<ReviewResponse> response = reviewService.getMyReviews(email);
        return ApiResponse.success("Lấy danh sách đánh giá của bạn thành công", response);
    }
}
