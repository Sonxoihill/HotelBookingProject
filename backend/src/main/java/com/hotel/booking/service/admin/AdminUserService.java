package com.hotel.booking.service.admin;

import com.hotel.booking.common.response.PageResponse;
import com.hotel.booking.dto.admin.AdminUserResponse;
import com.hotel.booking.dto.admin.CreateStaffRequest;
import com.hotel.booking.dto.admin.UpdateUserRoleRequest;
import com.hotel.booking.enums.UserRole;
import org.springframework.data.domain.Pageable;

public interface AdminUserService {

    PageResponse<AdminUserResponse> getUsers(String keyword, UserRole role, Pageable pageable);

    AdminUserResponse createStaff(CreateStaffRequest request, String currentAdminEmail);

    AdminUserResponse updateUserRole(Long id, UpdateUserRoleRequest request, String currentAdminEmail);

    AdminUserResponse toggleUserLock(Long id, String currentAdminEmail);
}
