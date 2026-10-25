package com.hotel.booking.controller;

import com.hotel.booking.common.response.ApiResponse;
import com.hotel.booking.dto.admin.RoomCategoryRequest;
import com.hotel.booking.entity.RoomCategory;
import com.hotel.booking.service.AdminRoomCategoryService;
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
@RequestMapping({"/admin/room-categories", "/admin/room-types"})
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
@Tag(name = "Admin Room Categories", description = "Các API Quản lý danh mục loại phòng cho Quản trị viên (UC13b)")
@SecurityRequirement(name = "bearerAuth")
public class AdminRoomCategoryController {

    private final AdminRoomCategoryService adminRoomCategoryService;

    @Operation(summary = "Lấy danh sách tất cả loại phòng", description = "Trả về danh sách tất cả các loại phòng hiện có trong hệ thống.")
    @GetMapping
    public ResponseEntity<ApiResponse<List<RoomCategory>>> getAllCategories() {
        List<RoomCategory> categories = adminRoomCategoryService.getAllCategories();
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách loại phòng thành công", categories));
    }

    @Operation(summary = "Lấy chi tiết loại phòng theo ID", description = "Trả về thông tin chi tiết của một loại phòng cụ thể.")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RoomCategory>> getCategoryById(@PathVariable Long id) {
        RoomCategory category = adminRoomCategoryService.getCategoryById(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy chi tiết loại phòng thành công", category));
    }

    @Operation(summary = "Thêm mới loại phòng", description = "Quản trị viên tạo mới một loại phòng với đầy đủ các thông số quy chuẩn.")
    @PostMapping
    public ResponseEntity<ApiResponse<RoomCategory>> createCategory(@Valid @RequestBody RoomCategoryRequest request) {
        RoomCategory created = adminRoomCategoryService.createCategory(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo loại phòng mới thành công", created));
    }

    @Operation(summary = "Cập nhật loại phòng", description = "Quản trị viên chỉnh sửa thông tin của một loại phòng đã có.")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<RoomCategory>> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody RoomCategoryRequest request) {
        RoomCategory updated = adminRoomCategoryService.updateCategory(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật loại phòng thành công", updated));
    }

    @Operation(summary = "Xóa loại phòng", description = "Xóa loại phòng nếu chưa được gắn vào bất kỳ phòng vật lý nào.")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Long id) {
        adminRoomCategoryService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa loại phòng thành công", null));
    }
}
