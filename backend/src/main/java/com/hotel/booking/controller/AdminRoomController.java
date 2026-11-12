package com.hotel.booking.controller;

import com.hotel.booking.common.response.ApiResponse;
import com.hotel.booking.dto.admin.AdminRoomRequest;
import com.hotel.booking.dto.admin.AdminRoomResponse;
import com.hotel.booking.service.AdminRoomService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
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
@Tag(name = "12. Quản trị viên - Quản lý Phòng vật lý (Admin Rooms)", description = "Các API CRUD phòng vật lý cho Quản trị viên (UC13a)")
@SecurityRequirement(name = "bearerAuth")
public class AdminRoomController {

    private final AdminRoomService adminRoomService;

    @Operation(
            summary = "Lấy danh sách tất cả phòng vật lý (UC13a)",
            description = "Trả về danh sách tất cả các phòng vật lý kèm thông tin loại phòng, tầng và trạng thái hiện tại."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Lấy danh sách phòng thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Chưa đăng nhập hoặc JWT Token hết hạn"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Sai quyền hạn (yêu cầu quyền ADMIN)")
    })
    @GetMapping
    public ResponseEntity<ApiResponse<List<AdminRoomResponse>>> getAllRooms() {
        List<AdminRoomResponse> rooms = adminRoomService.getAllRooms();
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách phòng thành công", rooms));
    }

    @Operation(
            summary = "Lấy chi tiết phòng vật lý theo ID (UC13a)",
            description = "Trả về thông tin chi tiết của một phòng vật lý theo ID."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Lấy thông tin phòng thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Chưa đăng nhập hoặc JWT Token hết hạn"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Sai quyền hạn (yêu cầu quyền ADMIN)"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Không tìm thấy phòng theo ID")
    })
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminRoomResponse>> getRoomById(
            @Parameter(description = "ID của phòng vật lý", example = "1", required = true)
            @PathVariable Long id) {
        AdminRoomResponse room = adminRoomService.getRoomById(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin phòng thành công", room));
    }

    @Operation(
            summary = "Tạo phòng vật lý mới (UC13a)",
            description = "Quản trị viên thêm mới một phòng vật lý vào hệ thống (kiểm tra trùng số hiệu phòng roomNumber)."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Tạo phòng mới thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Dữ liệu không hợp lệ (thiếu số phòng, tầng < 1)"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Chưa đăng nhập hoặc JWT Token hết hạn"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Sai quyền hạn (yêu cầu quyền ADMIN)"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Không tìm thấy loại phòng (categoryId)"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Số hiệu phòng (roomNumber) đã tồn tại")
    })
    @PostMapping
    public ResponseEntity<ApiResponse<AdminRoomResponse>> createRoom(@Valid @RequestBody AdminRoomRequest request) {
        AdminRoomResponse created = adminRoomService.createRoom(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo phòng mới thành công", created));
    }

    @Operation(
            summary = "Cập nhật thông tin phòng vật lý (UC13a)",
            description = "Quản trị viên chỉnh sửa thông tin tầng, loại phòng hoặc trạng thái của phòng vật lý."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Cập nhật phòng thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Dữ liệu cập nhật không hợp lệ hoặc phòng đang có khách lưu trú"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Chưa đăng nhập hoặc JWT Token hết hạn"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Sai quyền hạn (yêu cầu quyền ADMIN)"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Không tìm thấy phòng hoặc loại phòng"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Số hiệu phòng bị trùng với phòng khác")
    })
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AdminRoomResponse>> updateRoom(
            @Parameter(description = "ID phòng cần cập nhật", example = "1", required = true)
            @PathVariable Long id,
            @Valid @RequestBody AdminRoomRequest request) {
        AdminRoomResponse updated = adminRoomService.updateRoom(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật phòng thành công", updated));
    }

    @Operation(
            summary = "Xóa phòng vật lý (UC13a)",
            description = "Xóa phòng theo các ràng buộc kiểm tra nghiệp vụ và lịch sử đặt phòng."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Xóa phòng thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Không thể xóa phòng đang có khách hoặc đã có lịch sử đặt phòng"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Chưa đăng nhập hoặc JWT Token hết hạn"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Sai quyền hạn (yêu cầu quyền ADMIN)"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Không tìm thấy phòng theo ID")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteRoom(
            @Parameter(description = "ID phòng cần xóa", example = "21", required = true)
            @PathVariable Long id) {
        adminRoomService.deleteRoom(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa phòng thành công", null));
    }
}
