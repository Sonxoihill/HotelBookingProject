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
@Tag(name = "Admin User Management", description = "Quản lý nhân sự và người dùng cho Quản trị viên (UC16)")
public class AdminUserController {

    private final AdminUserService adminUserService;

    @Operation(summary = "Danh sách người dùng và nhân sự (API 1)", description = "Tìm kiếm theo từ khóa (tên hoặc email), lọc theo vai trò, phân trang.")
    @GetMapping
    public ApiResponse<PageResponse<AdminUserResponse>> getUsers(
            @Parameter(description = "Từ khóa tìm kiếm (tên hoặc email)") @RequestParam(required = false) String keyword,
            @Parameter(description = "Lọc theo vai trò") @RequestParam(required = false) UserRole role,
            @Parameter(hidden = true) @PageableDefault(page = 0, size = 10, sort = "id", direction = Sort.Direction.DESC) Pageable pageable) {
        PageResponse<AdminUserResponse> response = adminUserService.getUsers(keyword, role, pageable);
        return ApiResponse.success("Lấy danh sách người dùng thành công", response);
    }

    @Operation(summary = "Cấp tài khoản nhân sự mới (API 2)", description = "Sinh mật khẩu ngẫu nhiên 8 ký tự, mã hóa BCrypt, gửi email thông tin đăng nhập và ghi audit log STAFF_CREATED.")
    @PostMapping("/staff")
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<AdminUserResponse> createStaff(
            @Valid @RequestBody CreateStaffRequest request,
            Principal principal) {
        String adminEmail = (principal != null) ? principal.getName() : null;
        AdminUserResponse response = adminUserService.createStaff(request, adminEmail);
        return ApiResponse.success("Cấp tài khoản nhân sự mới thành công", response);
    }

    @Operation(summary = "Phân quyền / Đổi vai trò người dùng (API 3)", description = "Cập nhật vai trò (ADMIN, RECEPTIONIST, CUSTOMER). Không cho phép tự đổi quyền của chính mình. Ghi audit log ROLE_CHANGED.")
    @PatchMapping("/{id}/role")
    public ApiResponse<AdminUserResponse> updateUserRole(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserRoleRequest request,
            Principal principal) {
        String adminEmail = (principal != null) ? principal.getName() : null;
        AdminUserResponse response = adminUserService.updateUserRole(id, request, adminEmail);
        return ApiResponse.success("Cập nhật quyền hạn thành công", response);
    }

    @Operation(summary = "Khóa / Mở khóa tài khoản người dùng (API 4)", description = "Đảo trạng thái ACTIVE <-> LOCKED. Không cho phép tự khóa chính mình. Có hiệu lực ngay lập tức với token cũ. Ghi audit log ACCOUNT_LOCKED / ACCOUNT_UNLOCKED.")
    @PatchMapping("/{id}/lock")
    public ApiResponse<AdminUserResponse> toggleUserLock(
            @PathVariable Long id,
            Principal principal) {
        String adminEmail = (principal != null) ? principal.getName() : null;
        AdminUserResponse response = adminUserService.toggleUserLock(id, adminEmail);
        return ApiResponse.success("Cập nhật trạng thái khóa tài khoản thành công", response);
    }
}
