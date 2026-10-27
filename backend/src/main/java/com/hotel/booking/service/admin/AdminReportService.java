package com.hotel.booking.service.admin;

import com.hotel.booking.dto.report.RevenueReportResponse;
import com.hotel.booking.enums.ReportType;

import java.time.LocalDate;

public interface AdminReportService {

    RevenueReportResponse getRevenueReport(LocalDate startDate, LocalDate endDate, ReportType reportType);

    byte[] exportExcelReport(LocalDate startDate, LocalDate endDate);

    byte[] exportPdfReport(LocalDate startDate, LocalDate endDate);
}
