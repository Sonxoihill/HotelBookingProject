package com.hotel.booking.controller;

import com.hotel.booking.common.exception.BadRequestException;
import com.hotel.booking.common.exception.ConflictException;
import com.hotel.booking.common.exception.ResourceNotFoundException;
import com.hotel.booking.common.exception.UnauthorizedException;
import com.hotel.booking.common.response.ApiResponse;
import com.hotel.booking.repository.BookingRepository;
import com.hotel.booking.repository.RoomCategoryRepository;
import com.hotel.booking.repository.RoomRepository;
import com.hotel.booking.repository.ServiceRepository;
import com.hotel.booking.repository.UserRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/health")
@RequiredArgsConstructor
public class HealthController {

    private final UserRepository userRepository;
    private final RoomCategoryRepository roomCategoryRepository;
    private final RoomRepository roomRepository;
    private final ServiceRepository serviceRepository;
    private final BookingRepository bookingRepository;

    @GetMapping
    public ApiResponse<Map<String, Object>> checkHealth() {
        Map<String, Object> data = new HashMap<>();
        data.put("status", "UP");
        data.put("service", "hotel-booking-backend");
        data.put("totalUsers", userRepository.count());
        data.put("totalCategories", roomCategoryRepository.count());
        data.put("totalRooms", roomRepository.count());
        data.put("totalServices", serviceRepository.count());
        data.put("totalBookings", bookingRepository.count());
        return ApiResponse.success("Dịch vụ Backend & Kết nối CSDL hoạt động bình thường", data);
    }

    @GetMapping("/test-error")
    public ApiResponse<Void> testError(@RequestParam(defaultValue = "notFound") String type) {
        switch (type.toLowerCase()) {
            case "badrequest":
                throw new BadRequestException("Dữ liệu gửi lên không đúng định dạng!");
            case "conflict":
                throw new ConflictException("Tài nguyên đã tồn tại trong hệ thống!");
            case "unauthorized":
                throw new UnauthorizedException("Phiên đăng nhập đã hết hạn hoặc không hợp lệ!");
            case "notfound":
                throw new ResourceNotFoundException("User", "id", 999L);
            default:
                throw new RuntimeException("Lỗi hệ thống bất ngờ ngoài dự kiến!");
        }
    }

    @Getter
    @Setter
    public static class TestValidationDto {
        @NotBlank(message = "Tên không được để trống")
        private String name;

        @NotBlank(message = "Email không được để trống")
        @Email(message = "Email không đúng định dạng")
        private String email;
    }

    @PostMapping("/test-validation")
    public ApiResponse<TestValidationDto> testValidation(@Valid @RequestBody TestValidationDto dto) {
        return ApiResponse.success("Validate thành công", dto);
    }
}
