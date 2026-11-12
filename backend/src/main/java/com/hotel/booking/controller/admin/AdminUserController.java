package com.hotel.booking.controller.admin;

import com.hotel.booking.common.response.ApiResponse;
import com.hotel.booking.common.response.PageResponse;
import com.hotel.booking.dto.admin.AdminUserResponse;
import com.hotel.booking.dto.admin.CreateStaffRequest;
import com.hotel.booking.dto.admin.UpdateUserRoleRequest;
import com.hotel.booking.enums.UserRole;
import com.hotel.booking.service.admin.AdminUserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "15. Quản trị viên - Quản lý Người dùng & Nhân sự (Admin Users)", description = "Các API quản lý danh sách người dùng, cấp tài khoản nhân sự mới, phân quyền vai trò và khóa/mở khóa tài khoản (UC16)")
@SecurityRequirement(name = "bearerAuth")
public class AdminUserController {

    private final AdminUserService adminUserService;

    @Operation(
            summary = "Danh sách người dùng và nhân sự có phân trang (UC16 - API 1)",
            description = "Tìm kiếm theo từ khóa (họ tên hoặc email), lọc chính xác theo vai trò trong enum UserRole (ADMIN, RECEPTIONIST, CUSTOMER, GUEST) hoặc để trống để lấy toàn bộ người dùng."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Lấy danh sách người dùng thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Chưa đăng nhập hoặc JWT Token hết hạn"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Sai quyền hạn (yêu cầu quyền ADMIN)")
    })
    @GetMapping
    public ApiResponse<PageResponse<AdminUserResponse>> getUsers(
            @Parameter(description = "Từ khóa tìm kiếm (họ tên hoặc email)", example = "receptionist")
            @RequestParam(required = false) String keyword,
            @Parameter(description = "Lọc theo vai trò (ADMIN, RECEPTIONIST, CUSTOMER, GUEST)", example = "RECEPTIONIST")
            @RequestParam(required = false) UserRole role,
            @Parameter(hidden = true) @PageableDefault(page = 0, size = 10, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {
        PageResponse<AdminUserResponse> response = adminUserService.getUsers(keyword, role, pageable);
        return ApiResponse.success("Lấy danh sách người dùng thành công", response);
    }

    @Operation(
            summary = "Cấp tài khoản nhân sự mới (UC16 - API 2)",
            description = "Sinh mật khẩu ngẫu nhiên 8 ký tự, mã hóa BCrypt, gửi email thông tin đăng nhập bất đồng bộ và ghi nhận Audit Log STAFF_CREATED."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Cấp tài khoản nhân sự mới thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Dữ liệu không hợp lệ hoặc vai trò nhân sự không phải RECEPTIONIST/ADMIN"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Chưa đăng nhập hoặc JWT Token hết hạn"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Sai quyền hạn (yêu cầu quyền ADMIN)"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Email đã tồn tại trong hệ thống")
    })
    @PostMapping("/staff")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<AdminUserResponse> createStaff(
            @Valid @RequestBody CreateStaffRequest request,
            Principal principal) {
        String adminEmail = (principal != null) ? principal.getName() : null;
        AdminUserResponse response = adminUserService.createStaff(request, adminEmail);
        return ApiResponse.success("Cấp tài khoản nhân sự mới thành công", response);
    }

    @Operation(
            summary = "Phân quyền / Đổi vai trò người dùng (UC16 - API 3)",
            description = "Cập nhật vai trò người dùng (ADMIN, RECEPTIONIST, CUSTOMER, GUEST). Không cho phép Admin tự đổi quyền của chính mình. Ghi nhận Audit Log ROLE_CHANGED và trả về DTO có role mới chuẩn xác."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Cập nhật quyền hạn người dùng thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Tự đổi quyền chính mình hoặc chọn vai trò trùng với vai trò hiện tại"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Chưa đăng nhập hoặc JWT Token hết hạn"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Sai quyền hạn (yêu cầu quyền ADMIN)"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Không tìm thấy người dùng theo ID")
    })
    @PatchMapping("/{id}/role")
    public ApiResponse<AdminUserResponse> updateUserRole(
            @Parameter(description = "ID người dùng cần đổi vai trò", example = "2", required = true)
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRoleRequest request,
            Principal principal) {
        String adminEmail = (principal != null) ? principal.getName() : null;
        AdminUserResponse response = adminUserService.updateUserRole(id, request, adminEmail);
        return ApiResponse.success("Cập nhật quyền hạn thành công", response);
    }

    @Operation(
            summary = "Khóa / Mở khóa tài khoản người dùng (UC16 - API 4)",
            description = "Đảo trạng thái tài khoản ACTIVE <-> LOCKED. Không cho phép Admin tự khóa chính mình. Có hiệu lực chặn tức thì đối với cả các JWT Token cũ. Ghi nhận Audit Log ACCOUNT_LOCKED / ACCOUNT_UNLOCKED."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Cập nhật trạng thái khóa tài khoản thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Không thể tự khóa tài khoản của chính mình"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Chưa đăng nhập hoặc JWT Token hết hạn"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Sai quyền hạn (yêu cầu quyền ADMIN)"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Không tìm thấy người dùng theo ID")
    })
    @PatchMapping("/{id}/lock")
    public ApiResponse<AdminUserResponse> toggleUserLock(
            @Parameter(description = "ID người dùng cần khóa hoặc mở khóa", example = "5", required = true)
            @PathVariable Long id,
            Principal principal) {
        String adminEmail = (principal != null) ? principal.getName() : null;
        AdminUserResponse response = adminUserService.toggleUserLock(id, adminEmail);
        return ApiResponse.success("Cập nhật trạng thái khóa tài khoản thành công", response);
    }
}
