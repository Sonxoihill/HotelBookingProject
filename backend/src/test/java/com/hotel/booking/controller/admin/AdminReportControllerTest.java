package com.hotel.booking.controller.admin;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hotel.booking.common.exception.AppException;
import com.hotel.booking.common.exception.ErrorCode;
import com.hotel.booking.common.exception.GlobalExceptionHandler;
import com.hotel.booking.dto.report.RevenueByTime;
import com.hotel.booking.dto.report.RevenueReportResponse;
import com.hotel.booking.dto.report.RoomCategoryShare;
import com.hotel.booking.dto.report.SummaryMetrics;
import com.hotel.booking.enums.ReportType;
import com.hotel.booking.service.admin.AdminReportService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpHeaders;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class AdminReportControllerTest {

    private MockMvc mockMvc;

    @Mock
    private AdminReportService reportService;

    @InjectMocks
    private AdminReportController reportController;

    private final LocalDate startDate = LocalDate.of(2026, 9, 1);
    private final LocalDate endDate = LocalDate.of(2026, 9, 30);

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(reportController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    @DisplayName("GET /admin/reports/revenue - Thành công có dữ liệu")
    void testGetRevenueReport_Success() throws Exception {
        RevenueReportResponse mockResponse = RevenueReportResponse.builder()
                .hasData(true)
                .message("Thành công")
                .summaryMetrics(SummaryMetrics.builder()
                        .totalRevenue(new BigDecimal("10000000"))
                        .roomRevenue(new BigDecimal("8000000"))
                        .serviceRevenue(new BigDecimal("2000000"))
                        .completedBookings(5L)
                        .occupancyRate(75.5)
                        .topCategory("Deluxe Double")
                        .build())
                .revenueByTime(List.of(
                        RevenueByTime.builder()
                                .label("2026-09")
                                .roomRevenue(new BigDecimal("8000000"))
                                .serviceRevenue(new BigDecimal("2000000"))
                                .totalRevenue(new BigDecimal("10000000"))
                                .occupancyRate(75.5)
                                .build()
                ))
                .roomCategoryShare(List.of(
                        RoomCategoryShare.builder()
                                .categoryName("Deluxe Double")
                                .bookingCount(5L)
                                .revenue(new BigDecimal("10000000"))
                                .percentage(100.0)
                                .build()
                ))
                .build();

        when(reportService.getRevenueReport(eq(startDate), eq(endDate), eq(ReportType.MONTHLY)))
                .thenReturn(mockResponse);

        mockMvc.perform(get("/admin/reports/revenue")
                        .param("startDate", "2026-09-01")
                        .param("endDate", "2026-09-30")
                        .param("reportType", "MONTHLY"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.hasData").value(true))
                .andExpect(jsonPath("$.data.summaryMetrics.totalRevenue").value(10000000))
                .andExpect(jsonPath("$.data.summaryMetrics.topCategory").value("Deluxe Double"))
                .andExpect(jsonPath("$.data.revenueByTime[0].label").value("2026-09"))
                .andExpect(jsonPath("$.data.roomCategoryShare[0].percentage").value(100.0));
    }

    @Test
    @DisplayName("GET /admin/reports/revenue - Luồng 5b khi không có dữ liệu")
    void testGetRevenueReport_NoData() throws Exception {
        when(reportService.getRevenueReport(eq(startDate), eq(endDate), any()))
                .thenReturn(RevenueReportResponse.noData());

        mockMvc.perform(get("/admin/reports/revenue")
                        .param("startDate", "2026-09-01")
                        .param("endDate", "2026-09-30"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.hasData").value(false))
                .andExpect(jsonPath("$.data.message").value("Không có dữ liệu trong khoảng thời gian này"))
                .andExpect(jsonPath("$.data.revenueByTime").isEmpty())
                .andExpect(jsonPath("$.data.roomCategoryShare").isEmpty());
    }

    @Test
    @DisplayName("GET /admin/reports/export?format=EXCEL - Xuất file Excel thành công")
    void testExportReport_Excel_Success() throws Exception {
        byte[] dummyExcelBytes = new byte[]{80, 75, 3, 4}; // PK zip header
        when(reportService.exportExcelReport(eq(startDate), eq(endDate)))
                .thenReturn(dummyExcelBytes);

        mockMvc.perform(get("/admin/reports/export")
                        .param("format", "EXCEL")
                        .param("startDate", "2026-09-01")
                        .param("endDate", "2026-09-30"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.CONTENT_TYPE, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .andExpect(header().string(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"bao-cao-doanh-thu_2026-09-01_2026-09-30.xlsx\""))
                .andExpect(content().bytes(dummyExcelBytes));
    }

    @Test
    @DisplayName("GET /admin/reports/export?format=PDF - Xuất file PDF thành công")
    void testExportReport_Pdf_Success() throws Exception {
        byte[] dummyPdfBytes = "%PDF-1.4 mock".getBytes();
        when(reportService.exportPdfReport(eq(startDate), eq(endDate)))
                .thenReturn(dummyPdfBytes);

        mockMvc.perform(get("/admin/reports/export")
                        .param("format", "PDF")
                        .param("startDate", "2026-09-01")
                        .param("endDate", "2026-09-30"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.CONTENT_TYPE, "application/pdf"))
                .andExpect(header().string(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"bao-cao-doanh-thu_2026-09-01_2026-09-30.pdf\""))
                .andExpect(content().bytes(dummyPdfBytes));
    }

    @Test
    @DisplayName("GET /admin/reports/export/{format} - Endpoint tương thích path variable")
    void testExportReportByPath_Success() throws Exception {
        byte[] dummyPdfBytes = "%PDF-1.4 mock".getBytes();
        when(reportService.exportPdfReport(eq(startDate), eq(endDate)))
                .thenReturn(dummyPdfBytes);

        mockMvc.perform(get("/admin/reports/export/PDF")
                        .param("startDate", "2026-09-01")
                        .param("endDate", "2026-09-30"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.CONTENT_TYPE, "application/pdf"));
    }

    @Test
    @DisplayName("GET /admin/reports/export - Lỗi 400 khi format không hỗ trợ")
    void testExportReport_UnsupportedFormat_Throws400() throws Exception {
        mockMvc.perform(get("/admin/reports/export")
                        .param("format", "CSV")
                        .param("startDate", "2026-09-01")
                        .param("endDate", "2026-09-30"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Định dạng xuất file không được hỗ trợ. Chỉ hỗ trợ EXCEL hoặc PDF"));
    }

    @Test
    @DisplayName("GET /admin/reports/export - Lỗi 400 khi không có dữ liệu để xuất")
    void testExportReport_NoData_Throws400() throws Exception {
        when(reportService.exportExcelReport(eq(startDate), eq(endDate)))
                .thenThrow(new AppException(ErrorCode.BAD_REQUEST, "Không có dữ liệu trong khoảng thời gian này"));

        mockMvc.perform(get("/admin/reports/export")
                        .param("format", "EXCEL")
                        .param("startDate", "2026-09-01")
                        .param("endDate", "2026-09-30"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Không có dữ liệu trong khoảng thời gian này"));
    }
}
