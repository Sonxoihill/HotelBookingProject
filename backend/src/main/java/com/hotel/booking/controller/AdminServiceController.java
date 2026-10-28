package com.hotel.booking.controller;

import com.hotel.booking.common.response.ApiResponse;
import com.hotel.booking.dto.admin.AdminServiceRequest;
import com.hotel.booking.entity.Service;
import com.hotel.booking.service.AdminServiceService;
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
@RequestMapping("/admin/services")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
@Tag(name = "Admin Services", description = "Các API Quản lý danh mục dịch vụ cho Quản trị viên (UC14)")
@SecurityRequirement(name = "bearerAuth")
public class AdminServiceController {

    private final AdminServiceService adminServiceService;

    @Operation(summary = "Lấy toàn bộ danh sách dịch vụ", description = "Trả về toàn bộ các dịch vụ bao gồm cả ACTIVE và INACTIVE.")
    @GetMapping
    public ResponseEntity<ApiResponse<List<Service>>> getAllServices() {
        List<Service> services = adminServiceService.getAllServices();
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách dịch vụ thành công", services));
    }

    @Operation(summary = "Lấy chi tiết dịch vụ theo ID", description = "Trả về thông tin chi tiết của một dịch vụ cụ thể.")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Service>> getServiceById(@PathVariable Long id) {
        Service service = adminServiceService.getServiceById(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin dịch vụ thành công", service));
    }

    @Operation(summary = "Tạo mới dịch vụ", description = "Quản trị viên thêm dịch vụ mới vào danh mục dịch vụ khách sạn.")
    @PostMapping
    public ResponseEntity<ApiResponse<Service>> createService(@Valid @RequestBody AdminServiceRequest request) {
        Service created = adminServiceService.createService(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo dịch vụ mới thành công", created));
    }

    @Operation(summary = "Cập nhật dịch vụ", description = "Quản trị viên cập nhật thông tin, giá hoặc trạng thái của dịch vụ.")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Service>> updateService(
            @PathVariable Long id,
            @Valid @RequestBody AdminServiceRequest request) {
        Service updated = adminServiceService.updateService(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật dịch vụ thành công", updated));
    }

    @Operation(summary = "Xóa dịch vụ", description = "Xóa cứng nếu dịch vụ chưa phát sinh giao dịch, chuyển sang INACTIVE nếu đã nằm trong hóa đơn.")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteService(@PathVariable Long id) {
        boolean hardDeleted = adminServiceService.deleteService(id);
        if (hardDeleted) {
            return ResponseEntity.ok(ApiResponse.success("Xóa dịch vụ thành công", null));
        } else {
            return ResponseEntity.ok(ApiResponse.success("Dịch vụ đã phát sinh giao dịch nên được chuyển sang trạng thái Ngừng hoạt động", null));
        }
    }
}
