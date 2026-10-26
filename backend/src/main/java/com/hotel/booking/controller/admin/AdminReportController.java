package com.hotel.booking.controller.admin;

import com.hotel.booking.common.exception.AppException;
import com.hotel.booking.common.exception.ErrorCode;
import com.hotel.booking.common.response.ApiResponse;
import com.hotel.booking.dto.report.RevenueReportResponse;
import com.hotel.booking.enums.ReportType;
import com.hotel.booking.service.admin.AdminReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;

@RestController
@RequestMapping("/admin/reports")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Reports", description = "API Báo cáo, thống kê doanh thu và xuất file Excel/PDF (UC17)")
public class AdminReportController {

    private final AdminReportService reportService;

    @Operation(
            summary = "Báo cáo doanh thu và công suất phòng",
            description = "Cung cấp số liệu tổng quan KPI (doanh thu, phòng, dịch vụ, số đơn, tỷ lệ lấp đầy), biểu đồ theo thời gian và tỷ trọng theo loại phòng (UC17)"
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Lấy báo cáo doanh thu thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Tham số ngày không hợp lệ hoặc khoảng lọc vượt quá 366 ngày"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Không có quyền Admin")
    })
    @GetMapping("/revenue")
    public ApiResponse<RevenueReportResponse> getRevenueReport(
            @Parameter(description = "Ngày bắt đầu (bắt buộc, định dạng YYYY-MM-DD)")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "Ngày kết thúc (bắt buộc, định dạng YYYY-MM-DD, endDate >= startDate, khoảng lọc tối đa 366 ngày)")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @Parameter(description = "Loại báo cáo theo mốc thời gian: DAILY, MONTHLY, BY_CATEGORY (mặc định MONTHLY)")
            @RequestParam(required = false, defaultValue = "MONTHLY") ReportType reportType) {
        RevenueReportResponse report = reportService.getRevenueReport(startDate, endDate, reportType);
        return ApiResponse.success("Lấy báo cáo doanh thu thành công", report);
    }

    @Operation(
            summary = "Xuất file báo cáo doanh thu (Query Param)",
            description = "Xuất báo cáo doanh thu ra định dạng EXCEL (.xlsx) hoặc PDF (.pdf) theo tham số format"
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Xuất file báo cáo thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Không có dữ liệu trong khoảng thời gian hoặc tham số không hợp lệ"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Không có quyền Admin")
    })
    @GetMapping("/export")
    public ResponseEntity<byte[]> exportReport(
            @Parameter(description = "Định dạng file xuất: EXCEL hoặc PDF")
            @RequestParam String format,
            @Parameter(description = "Ngày bắt đầu (bắt buộc, định dạng YYYY-MM-DD)")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "Ngày kết thúc (bắt buộc, định dạng YYYY-MM-DD)")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return buildExportResponse(format, startDate, endDate);
    }

    @Operation(
            summary = "Xuất file báo cáo doanh thu (Path Variable)",
            description = "Endpoint tương thích frontend cho đường dẫn /export/{format} (EXCEL hoặc PDF)"
    )
    @GetMapping("/export/{format}")
    public ResponseEntity<byte[]> exportReportByPath(
            @Parameter(description = "Định dạng file xuất: EXCEL hoặc PDF")
            @PathVariable String format,
            @Parameter(description = "Ngày bắt đầu (bắt buộc, định dạng YYYY-MM-DD)")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @Parameter(description = "Ngày kết thúc (bắt buộc, định dạng YYYY-MM-DD)")
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return buildExportResponse(format, startDate, endDate);
    }

    private ResponseEntity<byte[]> buildExportResponse(String format, LocalDate startDate, LocalDate endDate) {
        if (format == null || format.trim().isEmpty()) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Định dạng xuất file không được để trống");
        }

        String upperFormat = format.trim().toUpperCase();
        byte[] fileBytes;
        String fileName;
        MediaType mediaType;

        if ("EXCEL".equals(upperFormat) || "XLSX".equals(upperFormat)) {
            fileBytes = reportService.exportExcelReport(startDate, endDate);
            fileName = String.format("bao-cao-doanh-thu_%s_%s.xlsx", startDate, endDate);
            mediaType = MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        } else if ("PDF".equals(upperFormat)) {
            fileBytes = reportService.exportPdfReport(startDate, endDate);
            fileName = String.format("bao-cao-doanh-thu_%s_%s.pdf", startDate, endDate);
            mediaType = MediaType.APPLICATION_PDF;
        } else {
            throw new AppException(ErrorCode.BAD_REQUEST, "Định dạng xuất file không được hỗ trợ. Chỉ hỗ trợ EXCEL hoặc PDF");
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(mediaType);
        headers.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"");

        return ResponseEntity.ok()
                .headers(headers)
                .body(fileBytes);
    }
}
