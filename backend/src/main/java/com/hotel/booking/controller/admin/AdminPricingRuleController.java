package com.hotel.booking.controller.admin;

import com.hotel.booking.common.response.ApiResponse;
import com.hotel.booking.dto.admin.PricingRuleRequest;
import com.hotel.booking.dto.admin.PricingRuleResponse;
import com.hotel.booking.enums.PricingRuleType;
import com.hotel.booking.service.admin.AdminPricingRuleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/admin/pricing-rules")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "14. Quản trị viên - Quy tắc Giá linh hoạt (Admin Pricing Rules)", description = "Các API CRUD quy tắc giá linh hoạt theo ngày lễ, mùa cao điểm, cuối tuần (HOLIDAY, PEAK_SEASON, WEEKEND) dành cho Quản trị viên (UC15)")
@SecurityRequirement(name = "bearerAuth")
public class AdminPricingRuleController {

    private final AdminPricingRuleService pricingRuleService;

    @Operation(
            summary = "Lấy danh sách quy tắc giá linh hoạt (UC15)",
            description = "Hỗ trợ lọc theo loại quy tắc (HOLIDAY, PEAK_SEASON, WEEKEND), hạng phòng (categoryId) và trạng thái kích hoạt (active)."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Lấy danh sách quy tắc giá thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Chưa đăng nhập hoặc JWT Token hết hạn"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Sai quyền hạn (yêu cầu quyền ADMIN)")
    })
    @GetMapping
    public ApiResponse<List<PricingRuleResponse>> getPricingRules(
            @Parameter(description = "Loại quy tắc giá (HOLIDAY, PEAK_SEASON, WEEKEND)", example = "HOLIDAY")
            @RequestParam(required = false) PricingRuleType ruleType,
            @Parameter(description = "ID loại phòng (để trống để lọc tất cả)", example = "2")
            @RequestParam(required = false) Long categoryId,
            @Parameter(description = "Trạng thái kích hoạt (true / false)", example = "true")
            @RequestParam(required = false) Boolean active) {
        List<PricingRuleResponse> list = pricingRuleService.getPricingRules(ruleType, categoryId, active);
        return ApiResponse.success("Lấy danh sách quy tắc giá thành công", list);
    }

    @Operation(
            summary = "Lấy chi tiết quy tắc giá theo ID (UC15)",
            description = "Trả về thông tin chi tiết của một quy tắc giá linh hoạt theo ID."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Lấy thông tin quy tắc giá thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Chưa đăng nhập hoặc JWT Token hết hạn"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Sai quyền hạn (yêu cầu quyền ADMIN)"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Không tìm thấy quy tắc giá theo ID")
    })
    @GetMapping("/{id}")
    public ApiResponse<PricingRuleResponse> getPricingRuleById(
            @Parameter(description = "ID của quy tắc giá", example = "1", required = true)
            @PathVariable Long id) {
        PricingRuleResponse rule = pricingRuleService.getPricingRuleById(id);
        return ApiResponse.success("Lấy thông tin quy tắc giá thành công", rule);
    }

    @Operation(
            summary = "Tạo mới quy tắc giá linh hoạt (UC15)",
            description = "Tạo mới một quy tắc giá linh hoạt (HOLIDAY, PEAK_SEASON, WEEKEND) có kiểm tra điều kiện phần trăm điều chỉnh khác 0 và chống trùng lặp khoảng thời gian."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "201", description = "Tạo quy tắc giá mới thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Dữ liệu không hợp lệ (endDate < startDate hoặc adjustmentPercent == 0)"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Chưa đăng nhập hoặc JWT Token hết hạn"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Sai quyền hạn (yêu cầu quyền ADMIN)"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Không tìm thấy loại phòng (categoryId)"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Trùng lặp khoảng thời gian với quy tắc giá đang hoạt động khác")
    })
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<PricingRuleResponse> createPricingRule(@Valid @RequestBody PricingRuleRequest request) {
        PricingRuleResponse created = pricingRuleService.createPricingRule(request);
        return ApiResponse.success("Tạo quy tắc giá mới thành công", created);
    }

    @Operation(
            summary = "Cập nhật quy tắc giá linh hoạt (UC15)",
            description = "Cập nhật thông tin quy tắc giá linh hoạt theo ID."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Cập nhật quy tắc giá thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Dữ liệu cập nhật không hợp lệ"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Chưa đăng nhập hoặc JWT Token hết hạn"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Sai quyền hạn (yêu cầu quyền ADMIN)"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Không tìm thấy quy tắc giá theo ID"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "409", description = "Trùng lặp khoảng thời gian với quy tắc giá khác")
    })
    @PutMapping("/{id}")
    public ApiResponse<PricingRuleResponse> updatePricingRule(
            @Parameter(description = "ID quy tắc giá cần cập nhật", example = "1", required = true)
            @PathVariable Long id,
            @Valid @RequestBody PricingRuleRequest request) {
        PricingRuleResponse updated = pricingRuleService.updatePricingRule(id, request);
        return ApiResponse.success("Cập nhật quy tắc giá thành công", updated);
    }

    @Operation(
            summary = "Xóa quy tắc giá linh hoạt (UC15)",
            description = "Xóa một quy tắc giá linh hoạt theo ID."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Xóa quy tắc giá thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "401", description = "Chưa đăng nhập hoặc JWT Token hết hạn"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Sai quyền hạn (yêu cầu quyền ADMIN)"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Không tìm thấy quy tắc giá theo ID")
    })
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deletePricingRule(
            @Parameter(description = "ID quy tắc giá cần xóa", example = "3", required = true)
            @PathVariable Long id) {
        pricingRuleService.deletePricingRule(id);
        return ApiResponse.success("Xóa quy tắc giá thành công", null);
    }
}
