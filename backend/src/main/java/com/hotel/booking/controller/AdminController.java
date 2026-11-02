package com.hotel.booking.controller;

import com.hotel.booking.common.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/admin")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "10. Quản trị viên - Kiểm tra Quyền hạn (Admin Security)", description = "Các API xác thực quyền Quản trị viên (ROLE_ADMIN)")
@SecurityRequirement(name = "bearerAuth")
public class AdminController {

    @Operation(summary = "Kiểm tra quyền Quản trị viên (ADMIN)", description = "Xác thực JWT Token của người dùng có quyền ROLE_ADMIN hay không.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Xác thực quyền ADMIN thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Chưa đăng nhập hoặc JWT Token hết hạn"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Sai quyền hạn (GUEST/CUSTOMER/RECEPTIONIST cố gọi API Admin)")
    })
    @GetMapping("/ping")
    public ResponseEntity<ApiResponse<Map<String, String>>> ping() {
        return ResponseEntity.ok(ApiResponse.success(
                "Xác thực quyền Quản trị viên (ADMIN) thành công",
                Map.of("status", "ACTIVE", "role", "ADMIN")
        ));
    }
}
