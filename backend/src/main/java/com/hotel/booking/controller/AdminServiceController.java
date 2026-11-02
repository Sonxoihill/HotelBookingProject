package com.hotel.booking.controller;

import com.hotel.booking.common.response.ApiResponse;
import com.hotel.booking.dto.admin.AdminServiceRequest;
import com.hotel.booking.entity.Service;
import com.hotel.booking.service.AdminServiceService;
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
@RequestMapping("/admin/services")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
@Tag(name = "13. Quản trị viên - Quản lý Danh mục Dịch vụ (Admin Services)", description = "Các API CRUD danh mục dịch vụ phụ trợ dành cho Quản trị viên (UC14)")
@SecurityRequirement(name = "bearerAuth")
public class AdminServiceController {

    private final AdminServiceService adminServiceService;

    @Operation(
            summary = "Lấy toàn bộ danh sách dịch vụ (UC14)",
            description = "Trả về toàn bộ các dịch vụ trong hệ thống bao gồm cả trạng thái ACTIVE và INACTIVE."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Lấy danh sách dịch vụ thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Chưa đăng nhập hoặc JWT Token hết hạn"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Sai quyền hạn (yêu cầu quyền ADMIN)")
    })
    @GetMapping
    public ResponseEntity<ApiResponse<List<Service>>> getAllServices() {
        List<Service> services = adminServiceService.getAllServices();
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách dịch vụ thành công", services));
    }

    @Operation(
            summary = "Lấy chi tiết dịch vụ theo ID (UC14)",
            description = "Trả về thông tin chi tiết của một dịch vụ cụ thể theo ID."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Lấy thông tin dịch vụ thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Chưa đăng nhập hoặc JWT Token hết hạn"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Sai quyền hạn (yêu cầu quyền ADMIN)"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Không tìm thấy dịch vụ theo ID")
    })
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Service>> getServiceById(
            @Parameter(description = "ID của dịch vụ", example = "1", required = true)
            @PathVariable Long id) {
        Service service = adminServiceService.getServiceById(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin dịch vụ thành công", service));
    }

    @Operation(
            summary = "Tạo mới dịch vụ phụ trợ (UC14)",
            description = "Quản trị viên thêm dịch vụ mới vào danh mục dịch vụ khách sạn (tên, đơn giá, đơn vị tính, mô tả)."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Tạo dịch vụ mới thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Dữ liệu không hợp lệ (tên trống hoặc giá <= 0)"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Chưa đăng nhập hoặc JWT Token hết hạn"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Sai quyền hạn (yêu cầu quyền ADMIN)"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Tên dịch vụ đã tồn tại trong hệ thống")
    })
    @PostMapping
    public ResponseEntity<ApiResponse<Service>> createService(@Valid @RequestBody AdminServiceRequest request) {
        Service created = adminServiceService.createService(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Tạo dịch vụ mới thành công", created));
    }

    @Operation(
            summary = "Cập nhật dịch vụ phụ trợ (UC14)",
            description = "Quản trị viên cập nhật thông tin, đơn giá, đơn vị tính hoặc trạng thái (ACTIVE/INACTIVE) của dịch vụ."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Cập nhật dịch vụ thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Dữ liệu cập nhật không hợp lệ"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Chưa đăng nhập hoặc JWT Token hết hạn"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Sai quyền hạn (yêu cầu quyền ADMIN)"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Không tìm thấy dịch vụ theo ID"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Tên dịch vụ bị trùng với dịch vụ khác")
    })
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Service>> updateService(
            @Parameter(description = "ID dịch vụ cần cập nhật", example = "1", required = true)
            @PathVariable Long id,
            @Valid @RequestBody AdminServiceRequest request) {
        Service updated = adminServiceService.updateService(id, request);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật dịch vụ thành công", updated));
    }

    @Operation(
            summary = "Xóa dịch vụ phụ trợ (UC14)",
            description = "Xóa cứng nếu dịch vụ chưa phát sinh giao dịch, hoặc tự động chuyển sang trạng thái INACTIVE (xóa mềm) nếu dịch vụ đã nằm trong hóa đơn của khách."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Xóa cứng hoặc chuyển trạng thái ngừng hoạt động thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Chưa đăng nhập hoặc JWT Token hết hạn"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Sai quyền hạn (yêu cầu quyền ADMIN)"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Không tìm thấy dịch vụ theo ID")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteService(
            @Parameter(description = "ID dịch vụ cần xóa", example = "10", required = true)
            @PathVariable Long id) {
        boolean hardDeleted = adminServiceService.deleteService(id);
        if (hardDeleted) {
            return ResponseEntity.ok(ApiResponse.success("Xóa dịch vụ thành công", null));
        } else {
            return ResponseEntity.ok(ApiResponse.success("Dịch vụ đã phát sinh giao dịch nên được chuyển sang trạng thái Ngừng hoạt động", null));
        }
    }
}
