package com.hotel.booking.controller.admin;

import com.hotel.booking.common.response.ApiResponse;
import com.hotel.booking.dto.admin.PricingRuleRequest;
import com.hotel.booking.dto.admin.PricingRuleResponse;
import com.hotel.booking.enums.PricingRuleType;
import com.hotel.booking.service.admin.AdminPricingRuleService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
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
@Tag(name = "Admin Pricing Rule Management", description = "Quản lý quy tắc giá linh hoạt cho Admin (UC15)")
public class AdminPricingRuleController {

    private final AdminPricingRuleService pricingRuleService;

    @Operation(summary = "Lấy danh sách quy tắc giá linh hoạt", description = "Hỗ trợ lọc theo loại quy tắc (HOLIDAY, PEAK_SEASON, WEEKEND), loại phòng và trạng thái kích hoạt.")
    @GetMapping
    public ApiResponse<List<PricingRuleResponse>> getPricingRules(
            @Parameter(description = "Loại quy tắc giá") @RequestParam(required = false) PricingRuleType ruleType,
            @Parameter(description = "ID loại phòng (null để lọc tất cả)") @RequestParam(required = false) Long categoryId,
            @Parameter(description = "Trạng thái kích hoạt") @RequestParam(required = false) Boolean active) {
        List<PricingRuleResponse> list = pricingRuleService.getPricingRules(ruleType, categoryId, active);
        return ApiResponse.success("Lấy danh sách quy tắc giá thành công", list);
    }

    @Operation(summary = "Lấy chi tiết quy tắc giá", description = "Lấy thông tin quy tắc giá theo ID")
    @GetMapping("/{id}")
    public ApiResponse<PricingRuleResponse> getPricingRuleById(@PathVariable Long id) {
        PricingRuleResponse rule = pricingRuleService.getPricingRuleById(id);
        return ApiResponse.success("Lấy thông tin quy tắc giá thành công", rule);
    }

    @Operation(summary = "Tạo mới quy tắc giá", description = "Tạo mới một quy tắc giá linh hoạt với kiểm tra trùng lặp thời gian.")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<PricingRuleResponse> createPricingRule(@Valid @RequestBody PricingRuleRequest request) {
        PricingRuleResponse created = pricingRuleService.createPricingRule(request);
        return ApiResponse.success("Tạo quy tắc giá mới thành công", created);
    }

    @Operation(summary = "Cập nhật quy tắc giá", description = "Cập nhật thông tin quy tắc giá theo ID")
    @PutMapping("/{id}")
    public ApiResponse<PricingRuleResponse> updatePricingRule(
            @PathVariable Long id,
            @Valid @RequestBody PricingRuleRequest request) {
        PricingRuleResponse updated = pricingRuleService.updatePricingRule(id, request);
        return ApiResponse.success("Cập nhật quy tắc giá thành công", updated);
    }

    @Operation(summary = "Xóa quy tắc giá", description = "Xóa một quy tắc giá linh hoạt theo ID")
    @DeleteMapping("/{id}")
    public ApiResponse<Void> deletePricingRule(@PathVariable Long id) {
        pricingRuleService.deletePricingRule(id);
        return ApiResponse.success("Xóa quy tắc giá thành công", null);
    }
}
