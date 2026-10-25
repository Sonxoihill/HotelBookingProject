package com.hotel.booking.service.admin;

import com.hotel.booking.common.exception.AppException;
import com.hotel.booking.common.exception.ErrorCode;
import com.hotel.booking.common.response.PageResponse;
import com.hotel.booking.dto.admin.AdminUserResponse;
import com.hotel.booking.dto.admin.CreateStaffRequest;
import com.hotel.booking.dto.admin.UpdateUserRoleRequest;
import com.hotel.booking.entity.AuditLog;
import com.hotel.booking.entity.User;
import com.hotel.booking.enums.Department;
import com.hotel.booking.enums.UserRole;
import com.hotel.booking.enums.UserStatus;
import com.hotel.booking.repository.AuditLogRepository;
import com.hotel.booking.repository.UserRepository;
import com.hotel.booking.service.EmailService;
import com.hotel.booking.service.admin.impl.AdminUserServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminUserServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private AuditLogRepository auditLogRepository;

    @Mock
    private EmailService emailService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AdminUserServiceImpl adminUserService;

    private User adminUser;
    private User staffUser;

    @BeforeEach
    void setUp() {
        adminUser = User.builder()
                .email("admin@hotel.com")
                .fullName("Quản Trị Viên")
                .role(UserRole.ADMIN)
                .status(UserStatus.ACTIVE)
                .build();
        adminUser.setId(1L);

        staffUser = User.builder()
                .email("letan@hotel.com")
                .fullName("Nhân Viên Lễ Tân")
                .role(UserRole.RECEPTIONIST)
                .department(Department.FRONT_DESK)
                .status(UserStatus.ACTIVE)
                .build();
        staffUser.setId(2L);
    }

    @Test
    @DisplayName("API 1: Tìm kiếm và lọc người dùng phân trang")
    void testGetUsers_Success() {
        PageRequest pageRequest = PageRequest.of(0, 10);
        when(userRepository.searchUsers(eq("letan"), eq(UserRole.RECEPTIONIST), eq(pageRequest)))
                .thenReturn(new PageImpl<>(List.of(staffUser), pageRequest, 1));

        PageResponse<AdminUserResponse> response = adminUserService.getUsers("letan", UserRole.RECEPTIONIST, pageRequest);

        assertNotNull(response);
        assertEquals(1, response.getItems().size());
        assertEquals("letan@hotel.com", response.getItems().get(0).getEmail());
    }

    @Test
    @DisplayName("API 2: Cấp tài khoản nhân sự mới, mã hóa mật khẩu, gửi email và ghi Audit Log")
    void testCreateStaff_Success() {
        CreateStaffRequest request = CreateStaffRequest.builder()
                .fullName("Nguyễn Lễ Tân Mới")
                .email("new.letan@hotel.com")
                .role(UserRole.RECEPTIONIST)
                .department(Department.FRONT_DESK)
                .build();

        when(userRepository.existsByEmail("new.letan@hotel.com")).thenReturn(false);
        when(userRepository.findByEmail("admin@hotel.com")).thenReturn(Optional.of(adminUser));
        when(passwordEncoder.encode(anyString())).thenReturn("hashed_password_123");
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> {
            User u = invocation.getArgument(0);
            u.setId(10L);
            return u;
        });

        AdminUserResponse response = adminUserService.createStaff(request, "admin@hotel.com");

        assertNotNull(response);
        assertEquals("new.letan@hotel.com", response.getEmail());
        assertEquals(UserRole.RECEPTIONIST, response.getRole());

        // Kiểm tra gửi email
        verify(emailService).sendStaffAccountEmail(any(User.class), anyString());

        // Kiểm tra ghi Audit Log: STAFF_CREATED
        ArgumentCaptor<AuditLog> logCaptor = ArgumentCaptor.forClass(AuditLog.class);
        verify(auditLogRepository).save(logCaptor.capture());
        AuditLog savedLog = logCaptor.getValue();
        assertEquals("STAFF_CREATED", savedLog.getAction());
        assertEquals(adminUser, savedLog.getActor());
        assertEquals("RECEPTIONIST", savedLog.getNewValue());
    }

    @Test
    @DisplayName("API 2: Báo lỗi 400 khi cố tạo tài khoản nhân sự với role CUSTOMER")
    void testCreateStaff_InvalidRole_ThrowsBadRequest() {
        CreateStaffRequest request = CreateStaffRequest.builder()
                .fullName("Khách hàng")
                .email("customer@hotel.com")
                .role(UserRole.CUSTOMER) // Không hợp lệ cho nhân sự
                .build();

        AppException ex = assertThrows(AppException.class, () ->
                adminUserService.createStaff(request, "admin@hotel.com"));

        assertEquals(ErrorCode.BAD_REQUEST, ex.getErrorCode());
        assertTrue(ex.getMessage().contains("chỉ được là RECEPTIONIST hoặc ADMIN"));
    }

    @Test
    @DisplayName("API 3: Đổi vai trò người dùng và ghi Audit Log ROLE_CHANGED")
    void testUpdateUserRole_Success() {
        UpdateUserRoleRequest request = UpdateUserRoleRequest.builder()
                .role(UserRole.ADMIN)
                .build();

        when(userRepository.findById(2L)).thenReturn(Optional.of(staffUser));
        when(userRepository.findByEmail("admin@hotel.com")).thenReturn(Optional.of(adminUser));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AdminUserResponse response = adminUserService.updateUserRole(2L, request, "admin@hotel.com");

        assertEquals(UserRole.ADMIN, response.getRole());

        // Kiểm tra Audit Log: ROLE_CHANGED
        ArgumentCaptor<AuditLog> logCaptor = ArgumentCaptor.forClass(AuditLog.class);
        verify(auditLogRepository).save(logCaptor.capture());
        AuditLog savedLog = logCaptor.getValue();
        assertEquals("ROLE_CHANGED", savedLog.getAction());
        assertEquals("RECEPTIONIST", savedLog.getOldValue());
        assertEquals("ADMIN", savedLog.getNewValue());
    }

    @Test
    @DisplayName("API 4: Khóa tài khoản người dùng và ghi Audit Log ACCOUNT_LOCKED")
    void testToggleUserLock_LocksAccount() {
        when(userRepository.findById(2L)).thenReturn(Optional.of(staffUser));
        when(userRepository.findByEmail("admin@hotel.com")).thenReturn(Optional.of(adminUser));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AdminUserResponse response = adminUserService.toggleUserLock(2L, "admin@hotel.com");

        assertEquals(UserStatus.LOCKED, response.getStatus());

        ArgumentCaptor<AuditLog> logCaptor = ArgumentCaptor.forClass(AuditLog.class);
        verify(auditLogRepository).save(logCaptor.capture());
        assertEquals("ACCOUNT_LOCKED", logCaptor.getValue().getAction());
    }

    @Test
    @DisplayName("API 4: Mở khóa tài khoản người dùng và ghi Audit Log ACCOUNT_UNLOCKED")
    void testToggleUserLock_UnlocksAccount() {
        staffUser.setStatus(UserStatus.LOCKED);
        when(userRepository.findById(2L)).thenReturn(Optional.of(staffUser));
        when(userRepository.findByEmail("admin@hotel.com")).thenReturn(Optional.of(adminUser));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        AdminUserResponse response = adminUserService.toggleUserLock(2L, "admin@hotel.com");

        assertEquals(UserStatus.ACTIVE, response.getStatus());

        ArgumentCaptor<AuditLog> logCaptor = ArgumentCaptor.forClass(AuditLog.class);
        verify(auditLogRepository).save(logCaptor.capture());
        assertEquals("ACCOUNT_UNLOCKED", logCaptor.getValue().getAction());
    }
}
