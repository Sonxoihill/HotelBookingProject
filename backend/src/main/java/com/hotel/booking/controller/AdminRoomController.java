package com.hotel.booking.controller;

import com.hotel.booking.common.response.ApiResponse;
import com.hotel.booking.dto.admin.AdminRoomRequest;
import com.hotel.booking.dto.admin.AdminRoomResponse;
import com.hotel.booking.service.AdminRoomService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/rooms")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
@Tag(name = "Admin Rooms", description = "Các API Quản lý phòng vật lý cho Quản trị viên (UC13a)")
@SecurityRequirement(name = "bearerAuth")
public class AdminRoomController {

    private final AdminRoomService adminRoomService;

    @Operation(summary = "Lấy danh sách tất cả phòng", description = "Trả về danh sách tất cả các phòng vật lý kèm thông tin loại phòng.")
    @GetMapping
    public ResponseEntity<ApiResponse<List<AdminRoomResponse>>> getAllRooms() {
        List<AdminRoomResponse> rooms = adminRoomService.getAllRooms();
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách phòng thành công", rooms));
    }

    @Operation(summary = "Lấy chi tiết phòng theo ID", description = "Trả về thông tin chi tiết của một phòng vật lý.")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminRoomResponse>> getRoomById(@PathVariable Long id) {
        AdminRoomResponse room = adminRoomService.getRoomById(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin phòng thành công", room));
    }

    @Operation(summary = "Tạo phòng mới", description = "Quản trị viên thêm mới một phòng vật lý vào hệ thống.")
    @PostMapping
    public ResponseEntity<ApiResponse<AdminRoomResponse>> createRoom(@Valid @RequestBody AdminRoomRequest request) {
        AdminRoomResponse created = adminRoomService.createRoom(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo phòng mới thành công", created));
    }

    @Operation(summary = "Cập nhật phòng", description = "Quản trị viên chỉnh sửa thông tin phòng vật lý.")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminRoomResponse>> updateRoom(
            @PathVariable Long id,
            @Valid @RequestBody AdminRoomRequest request) {
        AdminRoomResponse updated = adminRoomService.updateRoom(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật phòng thành công", updated));
    }

    @Operation(summary = "Xóa phòng", description = "Xóa phòng theo các ràng buộc kiểm tra nghiệp vụ và lịch sử đặt phòng.")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteRoom(@PathVariable Long id) {
        adminRoomService.deleteRoom(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa phòng thành công", null));
    }
}
