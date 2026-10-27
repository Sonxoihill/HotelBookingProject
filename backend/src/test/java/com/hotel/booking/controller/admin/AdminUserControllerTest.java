package com.hotel.booking.controller.admin;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hotel.booking.common.exception.AppException;
import com.hotel.booking.common.exception.ErrorCode;
import com.hotel.booking.common.exception.GlobalExceptionHandler;
import com.hotel.booking.common.response.PageResponse;
import com.hotel.booking.dto.admin.AdminUserResponse;
import com.hotel.booking.dto.admin.CreateStaffRequest;
import com.hotel.booking.dto.admin.UpdateUserRoleRequest;
import com.hotel.booking.enums.Department;
import com.hotel.booking.enums.UserRole;
import com.hotel.booking.enums.UserStatus;
import com.hotel.booking.service.admin.AdminUserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class AdminUserControllerTest {

    private MockMvc mockMvc;

    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

    @Mock
    private AdminUserService adminUserService;

    @InjectMocks
    private AdminUserController adminUserController;

    private Principal mockAdminPrincipal;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(adminUserController)
                .setCustomArgumentResolvers(new org.springframework.data.web.PageableHandlerMethodArgumentResolver())
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        mockAdminPrincipal = () -> "admin@hotel.com";
    }

    @Test
    @DisplayName("API 1 - GET /admin/users: Lấy danh sách người dùng phân trang thành công")
    void testGetUsers_Success() throws Exception {
        AdminUserResponse userResponse = AdminUserResponse.builder()
                .id(1L)
                .fullName("Lễ Tân 1")
                .email("letan1@hotel.com")
                .phone("0987654321")
                .role(UserRole.RECEPTIONIST)
                .department(Department.FRONT_DESK)
                .status(UserStatus.ACTIVE)
                .createdAt(LocalDateTime.now())
                .build();

        PageResponse<AdminUserResponse> pageResponse = PageResponse.<AdminUserResponse>builder()
                .items(List.of(userResponse))
                .page(1)
                .size(10)
                .totalElements(1)
                .totalPages(1)
                .isLast(true)
                .build();

        when(adminUserService.getUsers(any(), any(), any(Pageable.class))).thenReturn(pageResponse);

        mockMvc.perform(get("/admin/users")
                        .param("keyword", "letan")
                        .param("role", "RECEPTIONIST"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.items[0].email").value("letan1@hotel.com"))
                .andExpect(jsonPath("$.data.items[0].role").value("RECEPTIONIST"))
                .andExpect(jsonPath("$.data.items[0].password").doesNotExist()); // Đảm bảo không lộ password
    }

    @Test
    @DisplayName("API 2 - POST /admin/users/staff: Cấp tài khoản nhân sự mới thành công (201 Created)")
    void testCreateStaff_Success() throws Exception {
        CreateStaffRequest request = CreateStaffRequest.builder()
                .fullName("Nguyễn Lễ Tân")
                .email("letan.new@hotel.com")
                .phone("0912345678")
                .role(UserRole.RECEPTIONIST)
                .department(Department.FRONT_DESK)
                .build();

        AdminUserResponse response = AdminUserResponse.builder()
                .id(10L)
                .fullName("Nguyễn Lễ Tân")
                .email("letan.new@hotel.com")
                .phone("0912345678")
                .role(UserRole.RECEPTIONIST)
                .department(Department.FRONT_DESK)
                .status(UserStatus.ACTIVE)
                .build();

        when(adminUserService.createStaff(any(CreateStaffRequest.class), eq("admin@hotel.com"))).thenReturn(response);

        mockMvc.perform(post("/admin/users/staff")
                        .principal(mockAdminPrincipal)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(10))
                .andExpect(jsonPath("$.data.email").value("letan.new@hotel.com"))
                .andExpect(jsonPath("$.data.password").doesNotExist());
    }

    @Test
    @DisplayName("API 2 - POST /admin/users/staff: Báo lỗi 409 khi email đã tồn tại")
    void testCreateStaff_DuplicateEmail_Returns409() throws Exception {
        CreateStaffRequest request = CreateStaffRequest.builder()
                .fullName("Trùng Email")
                .email("exists@hotel.com")
                .role(UserRole.RECEPTIONIST)
                .department(Department.FRONT_DESK)
                .build();

        when(adminUserService.createStaff(any(CreateStaffRequest.class), any()))
                .thenThrow(new AppException(ErrorCode.CONFLICT, "Email đã tồn tại trong hệ thống"));

        mockMvc.perform(post("/admin/users/staff")
                        .principal(mockAdminPrincipal)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Email đã tồn tại trong hệ thống"));
    }

    @Test
    @DisplayName("API 3 - PATCH /admin/users/{id}/role: Cập nhật quyền hạn thành công")
    void testUpdateUserRole_Success() throws Exception {
        UpdateUserRoleRequest request = UpdateUserRoleRequest.builder()
                .role(UserRole.ADMIN)
                .build();

        AdminUserResponse response = AdminUserResponse.builder()
                .id(2L)
                .fullName("Nhân viên thăng chức")
                .email("staff@hotel.com")
                .role(UserRole.ADMIN)
                .status(UserStatus.ACTIVE)
                .build();

        when(adminUserService.updateUserRole(eq(2L), any(UpdateUserRoleRequest.class), eq("admin@hotel.com")))
                .thenReturn(response);

        mockMvc.perform(patch("/admin/users/2/role")
                        .principal(mockAdminPrincipal)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.role").value("ADMIN"));
    }

    @Test
    @DisplayName("API 3 - Luồng 4a: Báo lỗi 400 khi chọn quyền trùng với quyền hiện tại")
    void testUpdateUserRole_SameRole_Returns400() throws Exception {
        UpdateUserRoleRequest request = UpdateUserRoleRequest.builder()
                .role(UserRole.RECEPTIONIST)
                .build();

        when(adminUserService.updateUserRole(eq(2L), any(UpdateUserRoleRequest.class), any()))
                .thenThrow(new AppException(ErrorCode.BAD_REQUEST, "Vui lòng chọn quyền hạn mới khác với quyền hiện tại"));

        mockMvc.perform(patch("/admin/users/2/role")
                        .principal(mockAdminPrincipal)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Vui lòng chọn quyền hạn mới khác với quyền hiện tại"));
    }

    @Test
    @DisplayName("API 3: Báo lỗi 400 khi Admin tự đổi quyền của chính mình")
    void testUpdateUserRole_SelfRoleChange_Returns400() throws Exception {
        UpdateUserRoleRequest request = UpdateUserRoleRequest.builder()
                .role(UserRole.RECEPTIONIST)
                .build();

        when(adminUserService.updateUserRole(eq(1L), any(UpdateUserRoleRequest.class), any()))
                .thenThrow(new AppException(ErrorCode.BAD_REQUEST, "Không thể tự thay đổi quyền của chính mình"));

        mockMvc.perform(patch("/admin/users/1/role")
                        .principal(mockAdminPrincipal)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Không thể tự thay đổi quyền của chính mình"));
    }

    @Test
    @DisplayName("API 4 - PATCH /admin/users/{id}/lock: Khóa / Mở khóa tài khoản thành công")
    void testToggleUserLock_Success() throws Exception {
        AdminUserResponse response = AdminUserResponse.builder()
                .id(2L)
                .email("locked.user@hotel.com")
                .status(UserStatus.LOCKED)
                .build();

        when(adminUserService.toggleUserLock(eq(2L), eq("admin@hotel.com"))).thenReturn(response);

        mockMvc.perform(patch("/admin/users/2/lock")
                        .principal(mockAdminPrincipal))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("LOCKED"));
    }

    @Test
    @DisplayName("API 4: Báo lỗi 400 khi Admin tự khóa chính mình")
    void testToggleUserLock_SelfLock_Returns400() throws Exception {
        when(adminUserService.toggleUserLock(eq(1L), any()))
                .thenThrow(new AppException(ErrorCode.BAD_REQUEST, "Không thể tự khóa tài khoản của chính mình"));

        mockMvc.perform(patch("/admin/users/1/lock")
                        .principal(mockAdminPrincipal))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Không thể tự khóa tài khoản của chính mình"));
    }
}
