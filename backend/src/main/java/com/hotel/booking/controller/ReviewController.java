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
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(value = "/reviews", produces = MediaType.APPLICATION_JSON_VALUE)
@RequiredArgsConstructor
@Tag(name = "6. Khách hàng - Đánh giá & Nhận xét Phòng (Reviews)", description = "Các API gửi đánh giá phòng sau lưu trú (UC07), xem danh sách đánh giá theo phòng và lịch sử đánh giá cá nhân (chuẩn tiếng Việt UTF-8)")
public class ReviewController {

    private final ReviewService reviewService;
    private final JwtUtil jwtUtil;

    @Operation(
            summary = "Gửi đánh giá và nhận xét sau lưu trú (UC07)",
            description = "Gửi đánh giá cho đơn đặt phòng đã hoàn tất trả phòng (CHECKED_OUT). Nhận bookingId (hoặc roomId), rating từ 1 đến 5 sao và bình luận tiếng Việt UTF-8. Kiểm tra đơn phải thuộc sở hữu người dùng đăng nhập và chưa từng được đánh giá trước đó.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Đánh giá của bạn đã được ghi nhận thành công!"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Dữ liệu đánh giá không hợp lệ (sao ngoài khoảng 1-5, đơn chưa CHECKED_OUT hoặc đã được đánh giá)"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Chưa đăng nhập hoặc JWT Token hết hạn")
    })
    @PostMapping
    public ApiResponse<ReviewResponse> createReview(
            @Parameter(hidden = true)
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @Valid @RequestBody CreateReviewRequest request
    ) {
        String email = null;
        try {
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                email = jwtUtil.extractEmail(authHeader);
            }
        } catch (Exception ignored) {}

        if (email == null) {
            org.springframework.security.core.Authentication auth =
                    org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
                email = auth.getName();
            }
        }

        ReviewResponse response = reviewService.createReview(email, request);
        return ApiResponse.success("Đánh giá của bạn đã được ghi nhận thành công!", response);
    }

    @Operation(
            summary = "Lấy danh sách đánh giá và điểm trung bình của phòng",
            description = "Trả về điểm trung bình (làm tròn 1 chữ số thập phân), tổng số lượt đánh giá và toàn bộ danh sách nhận xét tiếng Việt UTF-8 của khách hàng cho phòng chỉ định."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Lấy danh sách đánh giá phòng thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Không tìm thấy phòng theo ID")
    })
    @GetMapping("/room/{roomId}")
    public ApiResponse<RoomReviewsSummaryResponse> getRoomReviews(
            @Parameter(description = "ID của phòng cần xem đánh giá", example = "1", required = true)
            @PathVariable Long roomId) {
        RoomReviewsSummaryResponse response = reviewService.getReviewsByRoomId(roomId);
        return ApiResponse.success("Lấy danh sách đánh giá phòng thành công", response);
    }

    @Operation(
            summary = "Lấy danh sách đánh giá của bản thân",
            description = "Trả về tất cả các đánh giá mà tài khoản đang đăng nhập đã gửi.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Lấy danh sách đánh giá cá nhân thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Chưa đăng nhập hoặc JWT Token hết hạn")
    })
    @GetMapping("/my-reviews")
    public ApiResponse<List<ReviewResponse>> getMyReviews(
            @Parameter(hidden = true)
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        String email = null;
        try {
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                email = jwtUtil.extractEmail(authHeader);
            }
        } catch (Exception ignored) {}

        if (email == null) {
            org.springframework.security.core.Authentication auth =
                    org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
                email = auth.getName();
            }
        }

        List<ReviewResponse> response = reviewService.getMyReviews(email);
        return ApiResponse.success("Lấy danh sách đánh giá của bạn thành công", response);
    }
}
