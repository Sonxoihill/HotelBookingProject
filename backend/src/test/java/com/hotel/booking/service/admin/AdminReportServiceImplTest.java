package com.hotel.booking.service.admin;

import com.hotel.booking.common.exception.AppException;
import com.hotel.booking.dto.report.RevenueReportResponse;
import com.hotel.booking.enums.ReportType;
import com.hotel.booking.repository.ReportRepository;
import com.hotel.booking.repository.RoomRepository;
import com.hotel.booking.repository.projection.CategoryShareProjection;
import com.hotel.booking.repository.projection.TimeRevenueProjection;
import com.hotel.booking.service.admin.impl.AdminReportServiceImpl;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AdminReportServiceImplTest {

    @Mock
    private ReportRepository reportRepository;

    @Mock
    private RoomRepository roomRepository;

    @InjectMocks
    private AdminReportServiceImpl reportService;

    private final LocalDate startDate = LocalDate.of(2026, 9, 1);
    private final LocalDate endDate = LocalDate.of(2026, 9, 30);

    private TimeRevenueProjection createTimeProjection(String label, BigDecimal total, BigDecimal service, Long bookings, Long nights) {
        TimeRevenueProjection p = mock(TimeRevenueProjection.class);
        when(p.getTimeLabel()).thenReturn(label);
        when(p.getTotalRev()).thenReturn(total);
        when(p.getServiceRev()).thenReturn(service);
        when(p.getBookingCount()).thenReturn(bookings);
        when(p.getOccupiedNights()).thenReturn(nights);
        return p;
    }

    private CategoryShareProjection createCategoryProjection(String name, BigDecimal rev, Long count) {
        CategoryShareProjection p = mock(CategoryShareProjection.class);
        when(p.getCategoryName()).thenReturn(name);
        when(p.getRevenue()).thenReturn(rev);
        when(p.getBookingCount()).thenReturn(count);
        return p;
    }

    @Test
    @DisplayName("Báo cáo doanh thu: Lấy dữ liệu theo tháng thành công (MONTHLY)")
    void testGetRevenueReport_Monthly_Success() {
        TimeRevenueProjection timeProj = createTimeProjection("2026-09",
                new BigDecimal("10000000"), new BigDecimal("2000000"), 5L, 10L);
        CategoryShareProjection catProj = createCategoryProjection("Deluxe Double",
                new BigDecimal("10000000"), 5L);

        when(reportRepository.getMonthlyRevenue(startDate, endDate)).thenReturn(List.of(timeProj));
        when(reportRepository.getCategoryShare(startDate, endDate)).thenReturn(List.of(catProj));
        when(roomRepository.count()).thenReturn(10L);

        RevenueReportResponse res = reportService.getRevenueReport(startDate, endDate, ReportType.MONTHLY);

        assertNotNull(res);
        assertTrue(res.getHasData());
        assertEquals("Thành công", res.getMessage());
        assertNotNull(res.getSummaryMetrics());
        assertEquals(new BigDecimal("10000000"), res.getSummaryMetrics().getTotalRevenue());
        assertEquals(new BigDecimal("8000000"), res.getSummaryMetrics().getRoomRevenue());
        assertEquals(new BigDecimal("2000000"), res.getSummaryMetrics().getServiceRevenue());
        assertEquals(5L, res.getSummaryMetrics().getCompletedBookings());
        assertEquals("Deluxe Double", res.getSummaryMetrics().getTopCategory());

        assertEquals(1, res.getRevenueByTime().size());
        assertEquals("2026-09", res.getRevenueByTime().get(0).getLabel());

        assertEquals(1, res.getRoomCategoryShare().size());
        assertEquals("Deluxe Double", res.getRoomCategoryShare().get(0).getCategoryName());
        assertEquals(100.0, res.getRoomCategoryShare().get(0).getPercentage());
    }

    @Test
    @DisplayName("Báo cáo doanh thu: Lấy dữ liệu theo ngày thành công (DAILY)")
    void testGetRevenueReport_Daily_Success() {
        TimeRevenueProjection timeProj = createTimeProjection("2026-09-15",
                new BigDecimal("2500000"), new BigDecimal("500000"), 1L, 2L);
        CategoryShareProjection catProj = createCategoryProjection("Standard Single",
                new BigDecimal("2500000"), 1L);

        when(reportRepository.getDailyRevenue(startDate, endDate)).thenReturn(List.of(timeProj));
        when(reportRepository.getCategoryShare(startDate, endDate)).thenReturn(List.of(catProj));
        when(roomRepository.count()).thenReturn(5L);

        RevenueReportResponse res = reportService.getRevenueReport(startDate, endDate, ReportType.DAILY);

        assertNotNull(res);
        assertTrue(res.getHasData());
        assertEquals(1, res.getRevenueByTime().size());
        assertEquals("2026-09-15", res.getRevenueByTime().get(0).getLabel());
    }

    @Test
    @DisplayName("Báo cáo doanh thu: Luồng 5b khi không có dữ liệu hoàn thành")
    void testGetRevenueReport_NoData() {
        when(reportRepository.getMonthlyRevenue(startDate, endDate)).thenReturn(Collections.emptyList());
        when(reportRepository.getCategoryShare(startDate, endDate)).thenReturn(Collections.emptyList());

        RevenueReportResponse res = reportService.getRevenueReport(startDate, endDate, ReportType.MONTHLY);

        assertNotNull(res);
        assertFalse(res.getHasData());
        assertEquals("Không có dữ liệu trong khoảng thời gian này", res.getMessage());
        assertNull(res.getSummaryMetrics());
        assertTrue(res.getRevenueByTime().isEmpty());
        assertTrue(res.getRoomCategoryShare().isEmpty());
    }

    @Test
    @DisplayName("Báo cáo doanh thu: Ném lỗi 400 khi endDate < startDate")
    void testGetRevenueReport_EndDateBeforeStartDate() {
        LocalDate start = LocalDate.of(2026, 9, 30);
        LocalDate end = LocalDate.of(2026, 9, 1);

        AppException ex = assertThrows(AppException.class,
                () -> reportService.getRevenueReport(start, end, ReportType.MONTHLY));
        assertTrue(ex.getMessage().contains("Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu"));
    }

    @Test
    @DisplayName("Báo cáo doanh thu: Ném lỗi 400 khi khoảng thời gian > 366 ngày")
    void testGetRevenueReport_Exceeds366Days() {
        LocalDate start = LocalDate.of(2025, 1, 1);
        LocalDate end = LocalDate.of(2026, 1, 10); // 375 ngày

        AppException ex = assertThrows(AppException.class,
                () -> reportService.getRevenueReport(start, end, ReportType.MONTHLY));
        assertTrue(ex.getMessage().contains("Khoảng thời gian lọc tối đa là 366 ngày"));
    }

    @Test
    @DisplayName("Xuất file Excel: Xuất thành công mảng bytes hợp lệ (.xlsx)")
    void testExportExcelReport_Success() {
        TimeRevenueProjection timeProj = createTimeProjection("2026-09",
                new BigDecimal("5000000"), new BigDecimal("1000000"), 2L, 4L);
        CategoryShareProjection catProj = createCategoryProjection("Deluxe Suite",
                new BigDecimal("5000000"), 2L);

        when(reportRepository.getMonthlyRevenue(startDate, endDate)).thenReturn(List.of(timeProj));
        when(reportRepository.getCategoryShare(startDate, endDate)).thenReturn(List.of(catProj));
        when(roomRepository.count()).thenReturn(10L);

        byte[] excelBytes = reportService.exportExcelReport(startDate, endDate);

        assertNotNull(excelBytes);
        assertTrue(excelBytes.length > 0);
        // Kiểm tra ZIP header (PK) của tệp .xlsx
        assertEquals((byte) 'P', excelBytes[0]);
        assertEquals((byte) 'K', excelBytes[1]);
    }

    @Test
    @DisplayName("Xuất file Excel: Ném lỗi 400 khi không có dữ liệu")
    void testExportExcelReport_NoData_Throws400() {
        when(reportRepository.getMonthlyRevenue(startDate, endDate)).thenReturn(Collections.emptyList());
        when(reportRepository.getCategoryShare(startDate, endDate)).thenReturn(Collections.emptyList());

        AppException ex = assertThrows(AppException.class,
                () -> reportService.exportExcelReport(startDate, endDate));
        assertTrue(ex.getMessage().contains("Không có dữ liệu trong khoảng thời gian này"));
    }

    @Test
    @DisplayName("Xuất file PDF: Xuất thành công mảng bytes hợp lệ (.pdf)")
    void testExportPdfReport_Success() {
        TimeRevenueProjection timeProj = createTimeProjection("2026-09",
                new BigDecimal("5000000"), new BigDecimal("1000000"), 2L, 4L);
        CategoryShareProjection catProj = createCategoryProjection("Deluxe Suite",
                new BigDecimal("5000000"), 2L);

        when(reportRepository.getMonthlyRevenue(startDate, endDate)).thenReturn(List.of(timeProj));
        when(reportRepository.getCategoryShare(startDate, endDate)).thenReturn(List.of(catProj));
        when(roomRepository.count()).thenReturn(10L);

        byte[] pdfBytes = reportService.exportPdfReport(startDate, endDate);

        assertNotNull(pdfBytes);
        assertTrue(pdfBytes.length > 0);
        // Header PDF bắt đầu bằng %PDF
        String header = new String(pdfBytes, 0, Math.min(pdfBytes.length, 5));
        assertTrue(header.startsWith("%PDF"));
    }

    @Test
    @DisplayName("Xuất file PDF: Ném lỗi 400 khi không có dữ liệu")
    void testExportPdfReport_NoData_Throws400() {
        when(reportRepository.getMonthlyRevenue(startDate, endDate)).thenReturn(Collections.emptyList());
        when(reportRepository.getCategoryShare(startDate, endDate)).thenReturn(Collections.emptyList());

        AppException ex = assertThrows(AppException.class,
                () -> reportService.exportPdfReport(startDate, endDate));
        assertTrue(ex.getMessage().contains("Không có dữ liệu trong khoảng thời gian này"));
    }
}
