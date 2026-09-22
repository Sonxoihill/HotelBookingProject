package com.hotel.booking.controller;

import com.hotel.booking.common.exception.BadRequestException;
import com.hotel.booking.common.exception.ResourceNotFoundException;
import com.hotel.booking.common.exception.UnauthorizedException;
import com.hotel.booking.common.response.ApiResponse;
import com.hotel.booking.config.JwtService;
import com.hotel.booking.dto.UpdateProfileRequest;
import com.hotel.booking.dto.UserProfileDto;
import com.hotel.booking.entity.User;
import com.hotel.booking.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;
    private final JwtService jwtService;

    // Các định dạng ảnh được phép và giới hạn dung lượng
    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList("jpg", "jpeg", "png", "webp");
    private static final List<String> ALLOWED_MIME_TYPES = Arrays.asList("image/jpeg", "image/png", "image/webp");
    private static final long MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

    /**
     * API GET /api/v1/users/profile
     * Trích xuất Email từ JWT Token, query DB trả về chi tiết User đang đăng nhập.
     */
    @GetMapping("/profile")
    public ApiResponse<UserProfileDto> getProfile(
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        User user = getAuthenticatedUser(authHeader);
        log.info("Truy vấn hồ sơ cá nhân cho email: {}", user.getEmail());
        return ApiResponse.success("Lấy thông tin hồ sơ thành công", mapToDto(user));
    }

    /**
     * API PUT /api/v1/users/profile
     * Cập nhật họ tên, số điện thoại và đường dẫn ảnh đại diện (đã qua lọc độc hại)
     */
    @PutMapping("/profile")
    public ApiResponse<UserProfileDto> updateProfile(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @Valid @RequestBody UpdateProfileRequest request
    ) {
        User user = getAuthenticatedUser(authHeader);

        if (request.getFullName() != null && !request.getFullName().trim().isEmpty()) {
            // Lọc các thẻ HTML chống XSS
            String cleanName = request.getFullName().replaceAll("<[^>]*>", "").trim();
            user.setFullName(cleanName);
        }

        if (request.getPhone() != null) {
            String cleanPhone = request.getPhone().replaceAll("<[^>]*>", "").trim();
            user.setPhone(cleanPhone);
        }

        if (request.getAvatarUrl() != null) {
            String avatar = request.getAvatarUrl().trim();
            if (!avatar.isEmpty()) {
                String lower = avatar.toLowerCase();
                if (lower.startsWith("javascript:") || lower.startsWith("data:") || lower.contains("<") || lower.contains(">")) {
                    throw new BadRequestException("URL ảnh đại diện không hợp lệ hoặc chứa mã độc hại!");
                }
                user.setAvatarUrl(avatar);
            } else {
                user.setAvatarUrl(null);
            }
        }

        User savedUser = userRepository.save(user);
        log.info("Cập nhật hồ sơ thành công cho user id: {}", savedUser.getId());
        return ApiResponse.success("Cập nhật thông tin hồ sơ thành công", mapToDto(savedUser));
    }

    /**
     * API POST /api/v1/users/avatar
     * Tải lên ảnh đại diện với đầy đủ các chốt chặn bảo mật phòng chống chèn mã độc (Malware/Polyglot/XSS/RCE/Path Traversal)
     */
    @PostMapping(value = "/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<UserProfileDto> uploadAvatar(
            @RequestHeader(value = "Authorization", required = false) String authHeader,
            @RequestParam("file") MultipartFile file
    ) {
        User user = getAuthenticatedUser(authHeader);

        // Chốt chặn 1: Kiểm tra tệp rỗng
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Vui lòng chọn tệp hình ảnh để tải lên!");
        }

        // Chốt chặn 2: Kiểm tra dung lượng tệp (tối đa 2MB)
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new BadRequestException("Dung lượng ảnh vượt quá giới hạn cho phép (Tối đa 2MB)!");
        }

        // Chốt chặn 3: Kiểm tra phần mở rộng tệp tin (Whitelist file extension)
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || !originalFilename.contains(".")) {
            throw new BadRequestException("Tên tệp tin không hợp lệ!");
        }

        String extension = originalFilename.substring(originalFilename.lastIndexOf('.') + 1).toLowerCase();
        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new BadRequestException("Định dạng tệp không được hỗ trợ! Chỉ chấp nhận JPG, JPEG, PNG, WEBP (Nghiêm cấm SVG, HTML, EXE, JS, PHP).");
        }

        // Chốt chặn 4: Kiểm tra MIME Type từ Request Header
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_MIME_TYPES.contains(contentType.toLowerCase())) {
            throw new BadRequestException("Loại nội dung (MIME Type) không hợp lệ!");
        }

        byte[] fileBytes;
        try {
            fileBytes = file.getBytes();
        } catch (IOException e) {
            throw new BadRequestException("Không thể đọc dữ liệu tệp tin tải lên!");
        }

        // Chốt chặn 5: Kiểm tra chữ ký tệp nhị phân (Magic Bytes Verification)
        if (!isValidImageMagicBytes(fileBytes, extension)) {
            throw new BadRequestException("Tệp tin bị từ chối: Chữ ký nhị phân không khớp với định dạng ảnh thật (Phát hiện tệp giả mạo hoặc nguy cơ mã độc)!");
        }

        // Chốt chặn 6: Quét chuỗi nguy hiểm (Anti-Polyglot / Anti-XSS Payload inspection)
        if (containsDangerousPayload(fileBytes)) {
            throw new BadRequestException("Phát hiện đoạn mã độc hại hoặc thẻ kịch bản nhúng trong tệp tin ảnh!");
        }

        // Chốt chặn 7: Giải mã và kiểm tra tính toàn vẹn hình ảnh (Image Decoding & Dimensions Verification)
        if ("jpg".equals(extension) || "jpeg".equals(extension) || "png".equals(extension)) {
            try {
                BufferedImage bi = ImageIO.read(new ByteArrayInputStream(fileBytes));
                if (bi == null) {
                    throw new BadRequestException("Dữ liệu hình ảnh bị hỏng hoặc không thể giải mã!");
                }
                // Giới hạn kích thước chiều rộng / cao để phòng ngừa Decompression Bomb (Pixel Flood)
                if (bi.getWidth() < 10 || bi.getHeight() < 10 || bi.getWidth() > 4096 || bi.getHeight() > 4096) {
                    throw new BadRequestException("Kích thước điểm ảnh không hợp lệ (Cho phép từ 10x10 đến 4096x4096 pixel)!");
                }
            } catch (IOException e) {
                throw new BadRequestException("Lỗi trong quá trình kiểm tra cấu trúc điểm ảnh!");
            }
        }

        // Chốt chặn 8: Chống tấn công Path Traversal - Hoàn toàn không sử dụng tên tệp của người dùng
        String secureFileName = UUID.randomUUID().toString().replace("-", "") + "." + extension;

        try {
            Path uploadDir = Paths.get("uploads/avatars").toAbsolutePath().normalize();
            if (!Files.exists(uploadDir)) {
                Files.createDirectories(uploadDir);
            }

            Path destinationFile = uploadDir.resolve(secureFileName).normalize();
            // Đảm bảo tệp nằm chính xác trong thư mục upload
            if (!destinationFile.startsWith(uploadDir)) {
                throw new BadRequestException("Phát hiện hành vi can thiệp đường dẫn bất hợp pháp (Path Traversal)!");
            }

            // Xóa tệp ảnh cũ nếu trước đó người dùng đã tải ảnh lên thư mục này
            deletePreviousAvatarFile(user.getAvatarUrl(), uploadDir);

            // Ghi tệp an toàn
            Files.write(destinationFile, fileBytes, StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);

            // Cập nhật đường dẫn vào database
            String avatarUrl = "/api/v1/users/avatar/" + secureFileName;
            user.setAvatarUrl(avatarUrl);
            User savedUser = userRepository.save(user);

            log.info("Cập nhật avatar thành công cho user {}: {}", user.getEmail(), secureFileName);
            return ApiResponse.success("Tải lên ảnh đại diện an toàn thành công!", mapToDto(savedUser));
        } catch (IOException e) {
            log.error("Lỗi khi lưu trữ ảnh đại diện: {}", e.getMessage());
            throw new BadRequestException("Không thể lưu trữ tệp tin ảnh đại diện vào hệ thống!");
        }
    }

    /**
     * API GET /api/v1/users/avatar/{fileName}
     * Cung cấp hình ảnh an toàn với header chống MIME Sniffing và CSP nghiêm ngặt
     */
    @GetMapping("/avatar/{fileName:.+}")
    public ResponseEntity<Resource> getAvatar(@PathVariable String fileName) {
        // Kiểm tra định dạng tên tệp bằng Regex nghiêm ngặt
        if (!fileName.matches("^[a-zA-Z0-9_-]+\\.(jpg|jpeg|png|webp)$")) {
            throw new BadRequestException("Tên tệp tin không hợp lệ!");
        }

        try {
            Path uploadDir = Paths.get("uploads/avatars").toAbsolutePath().normalize();
            Path filePath = uploadDir.resolve(fileName).normalize();

            if (!filePath.startsWith(uploadDir) || !Files.exists(filePath)) {
                return ResponseEntity.notFound().build();
            }

            Resource resource = new UrlResource(filePath.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.notFound().build();
            }

            String contentType = "image/jpeg";
            String ext = fileName.substring(fileName.lastIndexOf('.') + 1).toLowerCase();
            if ("png".equals(ext)) {
                contentType = "image/png";
            } else if ("webp".equals(ext)) {
                contentType = "image/webp";
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileName + "\"")
                    .header("X-Content-Type-Options", "nosniff")
                    .header("Content-Security-Policy", "default-src 'none'")
                    .header(HttpHeaders.CACHE_CONTROL, "public, max-age=86400")
                    .body(resource);
        } catch (Exception e) {
            log.error("Lỗi khi phục vụ ảnh đại diện {}: {}", fileName, e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * API DELETE /api/v1/users/avatar
     * Xóa ảnh đại diện hiện tại và quay về hiển thị chữ cái đầu
     */
    @DeleteMapping("/avatar")
    public ApiResponse<UserProfileDto> deleteAvatar(
            @RequestHeader(value = "Authorization", required = false) String authHeader
    ) {
        User user = getAuthenticatedUser(authHeader);
        Path uploadDir = Paths.get("uploads/avatars").toAbsolutePath().normalize();
        deletePreviousAvatarFile(user.getAvatarUrl(), uploadDir);

        user.setAvatarUrl(null);
        User savedUser = userRepository.save(user);

        log.info("Xóa ảnh đại diện thành công cho user: {}", user.getEmail());
        return ApiResponse.success("Đã xóa ảnh đại diện thành công!", mapToDto(savedUser));
    }

    // =========================================================================
    // CÁC HÀM TIỆN ÍCH BẢO MẬT & KIỂM TRA TỆP
    // =========================================================================

    private User getAuthenticatedUser(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("Vui lòng đăng nhập hoặc cung cấp JWT Token hợp lệ!");
        }

        String token = authHeader.substring(7).trim();
        String email = jwtService.extractEmail(token);

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
    }

    private UserProfileDto mapToDto(User user) {
        return UserProfileDto.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .avatarUrl(user.getAvatarUrl())
                .role(user.getRole())
                .status(user.getStatus())
                .createdAt(user.getCreatedAt())
                .build();
    }

    private boolean isValidImageMagicBytes(byte[] bytes, String extension) {
        if (bytes == null || bytes.length < 12) {
            return false;
        }

        // JPEG: FF D8 FF
        if ("jpg".equals(extension) || "jpeg".equals(extension)) {
            return (bytes[0] & 0xFF) == 0xFF && (bytes[1] & 0xFF) == 0xD8 && (bytes[2] & 0xFF) == 0xFF;
        }

        // PNG: 89 50 4E 47 0D 0A 1A 0A
        if ("png".equals(extension)) {
            return (bytes[0] & 0xFF) == 0x89 &&
                    bytes[1] == 0x50 &&
                    bytes[2] == 0x4E &&
                    bytes[3] == 0x47 &&
                    bytes[4] == 0x0D &&
                    bytes[5] == 0x0A &&
                    bytes[6] == 0x1A &&
                    bytes[7] == 0x0A;
        }

        // WEBP: RIFF....WEBP
        if ("webp".equals(extension)) {
            return bytes[0] == 'R' && bytes[1] == 'I' && bytes[2] == 'F' && bytes[3] == 'F' &&
                    bytes[8] == 'W' && bytes[9] == 'E' && bytes[10] == 'B' && bytes[11] == 'P';
        }

        return false;
    }

    private boolean containsDangerousPayload(byte[] bytes) {
        if (bytes == null || bytes.length == 0) return false;
        String contentHeader = new String(bytes, 0, Math.min(bytes.length, 2048)).toLowerCase();
        return contentHeader.contains("<script") ||
                contentHeader.contains("<svg") ||
                contentHeader.contains("<?php") ||
                contentHeader.contains("<html") ||
                contentHeader.contains("onload=") ||
                contentHeader.contains("onerror=");
    }

    private void deletePreviousAvatarFile(String avatarUrl, Path uploadDir) {
        if (avatarUrl != null && avatarUrl.contains("/avatar/")) {
            String oldFileName = avatarUrl.substring(avatarUrl.lastIndexOf('/') + 1);
            if (oldFileName.matches("^[a-zA-Z0-9_-]+\\.(jpg|jpeg|png|webp)$")) {
                try {
                    Path oldFilePath = uploadDir.resolve(oldFileName).normalize();
                    if (oldFilePath.startsWith(uploadDir)) {
                        Files.deleteIfExists(oldFilePath);
                    }
                } catch (IOException e) {
                    log.warn("Không thể xóa tệp tin avatar cũ {}: {}", oldFileName, e.getMessage());
                }
            }
        }
    }
}
