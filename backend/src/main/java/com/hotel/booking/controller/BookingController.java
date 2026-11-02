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
@Tag(name = "4. Khách hàng - Đặt phòng & Lịch sử (Booking Management)", description = "Các API tạo đơn đặt phòng có khóa đồng thời Pessimistic Lock (UC06), xem lịch sử đặt phòng cá nhân và hủy đơn đặt phòng trước 24 giờ (UC08)")
public class BookingController {

    private final BookingService bookingService;
    private final JwtUtil jwtUtil;

    @Operation(
            summary = "Lấy lịch sử đặt phòng của cá nhân",
            description = "Trả về danh sách tất cả các đơn đặt phòng của người dùng đang đăng nhập (sắp xếp mới nhất lên đầu).",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Lấy lịch sử đặt phòng thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Chưa đăng nhập hoặc JWT Token không hợp lệ")
    })
    @GetMapping({"/my-history", "/my-bookings"})
    public ApiResponse<List<Booking>> getMyBookings(
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

        List<Booking> bookings = bookingService.getMyBookings(email);
        return ApiResponse.success("Lấy lịch sử đặt phòng thành công", bookings);
    }

    @Operation(
            summary = "Tạo đơn đặt phòng mới & Giữ phòng chống xung đột (UC06)",
            description = "Tạo đơn đặt phòng mới với cơ chế Pessimistic Write Lock chống đặt trùng phòng đồng thời. Hệ thống tự động tính lại tổng tiền theo quy tắc giá linh hoạt (PricingCalculator) và gửi email xác nhận bất đồng bộ.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Đặt phòng thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Dữ liệu đặt phòng không hợp lệ (trống họ tên, SĐT, email hoặc ngày lưu trú sai)"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Không tìm thấy phòng theo roomId"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Xung đột phòng - Phòng đang được giữ chỗ (ON_HOLD) hoặc đã có người đặt trong khoảng ngày này")
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

        if (email == null) {
            org.springframework.security.core.Authentication auth =
                    org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
                email = auth.getName();
            }
        }

        Booking booking = bookingService.createBooking(email, request);
        return ApiResponse.success("Đặt phòng thành công!", booking);
    }

    @Operation(
            summary = "Khách hàng hủy đơn đặt phòng (UC08)",
            description = "Hủy đơn đặt phòng theo ID. Yêu cầu: Email trong JWT Token phải trùng với chủ đơn, đơn đang ở trạng thái PENDING hoặc CONFIRMED, và thời điểm hủy phải trước giờ check-in ít nhất 24 giờ. Tự động giải phóng phòng về trạng thái AVAILABLE.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Hủy đơn đặt phòng thành công!"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Đơn đặt phòng không đủ điều kiện hủy (sát giờ check-in < 24h hoặc trạng thái không hợp lệ)"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Chưa đăng nhập hoặc JWT Token hết hạn"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Không có quyền hủy đơn đặt phòng của người khác"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Không tìm thấy đơn đặt phòng theo ID")
    })
    @PatchMapping("/{id}/cancel")
    public ApiResponse<Booking> cancelBooking(
            @Parameter(hidden = true)
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @Parameter(description = "ID đơn đặt phòng cần hủy", example = "4", required = true)
            @PathVariable Long id,
            @Valid @RequestBody CancelBookingRequest request
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

        Booking booking = bookingService.cancelBooking(email, id, request);
        return ApiResponse.success("Hủy đơn đặt phòng thành công!", booking);
    }
}
