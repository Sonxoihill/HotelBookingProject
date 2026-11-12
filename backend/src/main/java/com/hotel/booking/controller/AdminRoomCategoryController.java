package com.hotel.booking.controller;

import com.hotel.booking.common.response.ApiResponse;
import com.hotel.booking.dto.admin.RoomCategoryRequest;
import com.hotel.booking.entity.RoomCategory;
import com.hotel.booking.service.AdminRoomCategoryService;
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
@RequestMapping({"/admin/room-categories", "/admin/room-types"})
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
@Tag(name = "11. Quản trị viên - Quản lý Loại phòng (Admin Room Categories)", description = "Các API CRUD danh mục loại phòng / hạng phòng dành cho Quản trị viên (UC13b)")
@SecurityRequirement(name = "bearerAuth")
public class AdminRoomCategoryController {

    private final AdminRoomCategoryService adminRoomCategoryService;

    @Operation(
            summary = "Lấy danh sách tất cả loại phòng (UC13b)",
            description = "Trả về danh sách toàn bộ các loại phòng hiện có trong hệ thống kèm giá cơ bản, sức chứa, số giường và diện tích."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Lấy danh sách loại phòng thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Chưa đăng nhập hoặc JWT Token hết hạn"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Sai quyền hạn (yêu cầu quyền ADMIN)")
    })
    @GetMapping
    public ResponseEntity<ApiResponse<List<RoomCategory>>> getAllCategories() {
        List<RoomCategory> categories = adminRoomCategoryService.getAllCategories();
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách loại phòng thành công", categories));
    }

    @Operation(
            summary = "Lấy chi tiết loại phòng theo ID (UC13b)",
            description = "Trả về thông tin chi tiết của một loại phòng cụ thể theo ID."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Lấy chi tiết loại phòng thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Chưa đăng nhập hoặc JWT Token hết hạn"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Sai quyền hạn (yêu cầu quyền ADMIN)"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Không tìm thấy loại phòng theo ID")
    })
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RoomCategory>> getCategoryById(
            @Parameter(description = "ID của loại phòng", example = "1", required = true)
            @PathVariable Long id) {
        RoomCategory category = adminRoomCategoryService.getCategoryById(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy chi tiết loại phòng thành công", category));
    }

    @Operation(
            summary = "Thêm mới loại phòng (UC13b)",
            description = "Quản trị viên tạo mới một loại phòng với đầy đủ thông số quy chuẩn (tên, giá cơ bản, sức chứa, số giường, diện tích). Kiểm tra trùng tên loại phòng."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Tạo loại phòng mới thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Dữ liệu đầu vào không hợp lệ (giá hoặc diện tích <= 0)"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Chưa đăng nhập hoặc JWT Token hết hạn"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Sai quyền hạn (yêu cầu quyền ADMIN)"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Tên loại phòng đã tồn tại trong hệ thống")
    })
    @PostMapping
    public ResponseEntity<ApiResponse<RoomCategory>> createCategory(@Valid @RequestBody RoomCategoryRequest request) {
        RoomCategory created = adminRoomCategoryService.createCategory(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo loại phòng mới thành công", created));
    }

    @Operation(
            summary = "Cập nhật thông tin loại phòng (UC13b)",
            description = "Quản trị viên chỉnh sửa thông tin của một loại phòng đã có theo ID."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Cập nhật loại phòng thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Dữ liệu cập nhật không hợp lệ"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Chưa đăng nhập hoặc JWT Token hết hạn"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Sai quyền hạn (yêu cầu quyền ADMIN)"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Không tìm thấy loại phòng theo ID"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Tên loại phòng bị trùng với loại phòng khác")
    })
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<RoomCategory>> updateCategory(
            @Parameter(description = "ID loại phòng cần cập nhật", example = "1", required = true)
            @PathVariable Long id,
            @Valid @RequestBody RoomCategoryRequest request) {
        RoomCategory updated = adminRoomCategoryService.updateCategory(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật loại phòng thành công", updated));
    }

    @Operation(
            summary = "Xóa loại phòng (UC13b)",
            description = "Xóa loại phòng nếu chưa được gắn vào bất kỳ phòng vật lý nào. Trả về lỗi nếu đang có phòng vật lý thuộc loại phòng này."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Xóa loại phòng thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Không thể xóa loại phòng đang có phòng vật lý sử dụng"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Chưa đăng nhập hoặc JWT Token hết hạn"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Sai quyền hạn (yêu cầu quyền ADMIN)"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Không tìm thấy loại phòng theo ID")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(
            @Parameter(description = "ID loại phòng cần xóa", example = "4", required = true)
            @PathVariable Long id) {
        adminRoomCategoryService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.success("Xóa loại phòng thành công", null));
    }
}
