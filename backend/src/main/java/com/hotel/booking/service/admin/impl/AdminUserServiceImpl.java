package com.hotel.booking.service.admin.impl;

import com.hotel.booking.common.exception.AppException;
import com.hotel.booking.common.exception.ErrorCode;
import com.hotel.booking.common.response.PageResponse;
import com.hotel.booking.dto.admin.AdminUserResponse;
import com.hotel.booking.dto.admin.CreateStaffRequest;
import com.hotel.booking.dto.admin.UpdateUserRoleRequest;
import com.hotel.booking.entity.AuditLog;
import com.hotel.booking.entity.User;
import com.hotel.booking.enums.UserRole;
import com.hotel.booking.enums.UserStatus;
import com.hotel.booking.repository.AuditLogRepository;
import com.hotel.booking.repository.UserRepository;
import com.hotel.booking.service.EmailService;
import com.hotel.booking.service.admin.AdminUserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminUserServiceImpl implements AdminUserService {

    private final UserRepository userRepository;
    private final AuditLogRepository auditLogRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    private static final String UPPER = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    private static final String LOWER = "abcdefghijklmnopqrstuvwxyz";
    private static final String DIGITS = "0123456789";
    private static final String ALL_CHARS = UPPER + LOWER + DIGITS;
    private static final SecureRandom RANDOM = new SecureRandom();

    @Override
    @Transactional(readOnly = true)
    public PageResponse<AdminUserResponse> getUsers(String keyword, UserRole role, Pageable pageable) {
        String trimmedKeyword = (keyword != null && !keyword.trim().isEmpty()) ? keyword.trim() : null;
        Page<User> page = userRepository.searchUsers(trimmedKeyword, role, pageable);
        return PageResponse.of(page.map(AdminUserResponse::fromEntity));
    }

    @Override
    @Transactional
    public AdminUserResponse createStaff(CreateStaffRequest request, String currentAdminEmail) {
        // Kiểm tra vai trò nhân sự hợp lệ: chỉ RECEPTIONIST hoặc ADMIN
        if (request.getRole() != UserRole.RECEPTIONIST && request.getRole() != UserRole.ADMIN) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Vai trò nhân sự chỉ được là RECEPTIONIST hoặc ADMIN");
        }

        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new AppException(ErrorCode.CONFLICT, "Email đã tồn tại trong hệ thống");
        }

        User currentAdmin = getCurrentAdmin(currentAdminEmail);

        // Sinh mật khẩu ngẫu nhiên 8 ký tự (có chữ hoa, chữ thường, số)
        String rawPassword = generateRandomPassword(8);

        User staffUser = User.builder()
                .fullName(request.getFullName().trim())
                .email(email)
                .password(passwordEncoder.encode(rawPassword))
                .phone(request.getPhone() != null ? request.getPhone().trim() : null)
                .role(request.getRole())
                .department(request.getDepartment())
                .status(UserStatus.ACTIVE)
                .build();

        User savedUser = userRepository.save(staffUser);
        log.info("Admin {} đã cấp tài khoản nhân sự mới: email={}, role={}", currentAdminEmail, savedUser.getEmail(), savedUser.getRole());

        // Ghi Audit Log: STAFF_CREATED
        AuditLog auditLog = AuditLog.builder()
                .actor(currentAdmin)
                .targetUser(savedUser)
                .action("STAFF_CREATED")
                .oldValue(null)
                .newValue(savedUser.getRole().name())
                .description("Cấp tài khoản nhân sự mới: " + savedUser.getEmail() + " (" + savedUser.getRole().name() + ")")
                .build();
        auditLogRepository.save(auditLog);

        // Gửi email bất đồng bộ kèm thông tin đăng nhập
        emailService.sendStaffAccountEmail(savedUser, rawPassword);

        // Trả response kèm temporaryPassword cho Quản trị viên (chỉ 1 lần khi tạo)
        AdminUserResponse response = AdminUserResponse.fromEntity(savedUser);
        response.setTemporaryPassword(rawPassword);
        return response;
    }

    @Override
    @Transactional
    public AdminUserResponse updateUserRole(Long id, UpdateUserRoleRequest request, String currentAdminEmail) {
        User targetUser = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND, "Không tìm thấy người dùng"));

        User currentAdmin = getCurrentAdmin(currentAdminEmail);

        // Admin tự đổi quyền của chính mình -> 400
        if (currentAdmin != null && currentAdmin.getId().equals(targetUser.getId())) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Không thể tự thay đổi quyền của chính mình");
        }

        // role để trống hoặc trùng với vai trò hiện tại -> 400
        if (request.getRole() == null || request.getRole() == targetUser.getRole()) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Vui lòng chọn quyền hạn mới khác với quyền hiện tại");
        }

        UserRole oldRole = targetUser.getRole();
        targetUser.setRole(request.getRole());
        User updatedUser = userRepository.save(targetUser);

        log.info("Admin {} đã đổi vai trò của {} từ {} sang {}",
                currentAdminEmail, targetUser.getEmail(), oldRole, request.getRole());

        // Ghi Audit Log: ROLE_CHANGED
        AuditLog auditLog = AuditLog.builder()
                .actor(currentAdmin)
                .targetUser(updatedUser)
                .action("ROLE_CHANGED")
                .oldValue(oldRole.name())
                .newValue(updatedUser.getRole().name())
                .description("Thay đổi vai trò người dùng " + updatedUser.getEmail() + " từ " + oldRole.name() + " sang " + updatedUser.getRole().name())
                .build();
        auditLogRepository.save(auditLog);

        return AdminUserResponse.fromEntity(updatedUser);
    }

    @Override
    @Transactional
    public AdminUserResponse toggleUserLock(Long id, String currentAdminEmail) {
        User targetUser = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND, "Không tìm thấy người dùng"));

        User currentAdmin = getCurrentAdmin(currentAdminEmail);

        // Admin tự khóa chính mình -> 400
        if (currentAdmin != null && currentAdmin.getId().equals(targetUser.getId())) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Không thể tự khóa tài khoản của chính mình");
        }

        UserStatus oldStatus = targetUser.getStatus();
        String action;
        String description;

        if (oldStatus == UserStatus.ACTIVE) {
            targetUser.setStatus(UserStatus.LOCKED);
            action = "ACCOUNT_LOCKED";
            description = "Khóa tài khoản người dùng: " + targetUser.getEmail();
        } else {
            targetUser.setStatus(UserStatus.ACTIVE);
            action = "ACCOUNT_UNLOCKED";
            description = "Mở khóa tài khoản người dùng: " + targetUser.getEmail();
        }

        User updatedUser = userRepository.save(targetUser);
        log.info("Admin {} đã chuyển trạng thái tài khoản {} sang {}",
                currentAdminEmail, targetUser.getEmail(), updatedUser.getStatus());

        // Ghi Audit Log
        AuditLog auditLog = AuditLog.builder()
                .actor(currentAdmin)
                .targetUser(updatedUser)
                .action(action)
                .oldValue(oldStatus.name())
                .newValue(updatedUser.getStatus().name())
                .description(description)
                .build();
        auditLogRepository.save(auditLog);

        return AdminUserResponse.fromEntity(updatedUser);
    }

    private User getCurrentAdmin(String email) {
        if (email == null) return null;
        return userRepository.findByEmail(email).orElse(null);
    }

    private String generateRandomPassword(int length) {
        StringBuilder sb = new StringBuilder(length);
        // Đảm bảo có ít nhất 1 chữ hoa, 1 chữ thường, 1 chữ số
        sb.append(UPPER.charAt(RANDOM.nextInt(UPPER.length())));
        sb.append(LOWER.charAt(RANDOM.nextInt(LOWER.length())));
        sb.append(DIGITS.charAt(RANDOM.nextInt(DIGITS.length())));

        for (int i = 3; i < length; i++) {
            sb.append(ALL_CHARS.charAt(RANDOM.nextInt(ALL_CHARS.length())));
        }

        char[] arr = sb.toString().toCharArray();
        for (int i = arr.length - 1; i > 0; i--) {
            int j = RANDOM.nextInt(i + 1);
            char temp = arr[i];
            arr[i] = arr[j];
            arr[j] = temp;
        }
        return new String(arr);
    }
}
