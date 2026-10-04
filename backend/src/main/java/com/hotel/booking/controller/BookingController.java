package com.hotel.booking.controller;

import com.hotel.booking.common.response.ApiResponse;
import com.hotel.booking.config.JwtUtil;
import com.hotel.booking.dto.booking.CancelBookingRequest;
import com.hotel.booking.dto.booking.CreateBookingRequest;
import com.hotel.booking.entity.Booking;
import com.hotel.booking.service.BookingService;
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
@RequestMapping("/bookings")
@RequiredArgsConstructor
@Tag(name = "Booking Management", description = "Các API tạo đơn đặt phòng, xem lịch sử đặt phòng và hủy đặt phòng")
public class BookingController {

    private final BookingService bookingService;
    private final JwtUtil jwtUtil;

    @Operation(
            summary = "Lấy lịch sử đặt phòng của cá nhân",
            description = "Trả về danh sách tất cả các đơn đặt phòng của người dùng đang đăng nhập.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Lấy lịch sử đặt phòng thành công")
    })
    @GetMapping("/my-history")
    public ApiResponse<List<Booking>> getMyBookings(
            @Parameter(hidden = true)
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        String email = jwtUtil.extractEmail(authHeader);
        List<Booking> bookings = bookingService.getMyBookings(email);
        return ApiResponse.success("Lấy lịch sử đặt phòng thành công", bookings);
    }

    @Operation(
            summary = "Tạo đơn đặt phòng mới",
            description = "Tạo đơn đặt phòng với thông tin khách hàng, phòng chọn, khoảng ngày lưu trú và các dịch vụ đi kèm. Hỗ trợ cả khách vãng lai và thành viên.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Đặt phòng thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Thông tin không hợp lệ hoặc phòng đã bị đặt")
    })
    @PostMapping
    public ApiResponse<Booking> createBooking(
            @Parameter(hidden = true)
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @Valid @RequestBody CreateBookingRequest request
    ) {
        String email = null;
        try {
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                email = jwtUtil.extractEmail(authHeader);
            }
        } catch (Exception ignored) {}

        Booking booking = bookingService.createBooking(email, request);
        return ApiResponse.success("Đặt phòng thành công!", booking);
    }

    @Operation(
            summary = "Hủy đơn đặt phòng",
            description = "Hủy đơn đặt phòng theo ID với lý do hủy.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Hủy đơn đặt phòng thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Đơn không đủ điều kiện hủy hoặc không tìm thấy")
    })
    @PatchMapping("/{id}/cancel")
    public ApiResponse<Booking> cancelBooking(
            @Parameter(hidden = true)
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @Parameter(description = "ID đơn đặt phòng", example = "1", required = true)
            @PathVariable Long id,
            @Valid @RequestBody CancelBookingRequest request
    ) {
        String email = null;
        try {
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                email = jwtUtil.extractEmail(authHeader);
            }
        } catch (Exception ignored) {}

        Booking booking = bookingService.cancelBooking(email, id, request);
        return ApiResponse.success("Hủy đơn đặt phòng thành công!", booking);
    }
}
