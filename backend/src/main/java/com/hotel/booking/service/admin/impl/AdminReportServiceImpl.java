package com.hotel.booking.service.admin.impl;

import com.hotel.booking.common.exception.AppException;
import com.hotel.booking.common.exception.ErrorCode;
import com.hotel.booking.dto.report.RevenueByTime;
import com.hotel.booking.dto.report.RevenueReportResponse;
import com.hotel.booking.dto.report.RoomCategoryShare;
import com.hotel.booking.dto.report.SummaryMetrics;
import com.hotel.booking.enums.ReportType;
import com.hotel.booking.repository.ReportRepository;
import com.hotel.booking.repository.RoomRepository;
import com.hotel.booking.repository.projection.CategoryShareProjection;
import com.hotel.booking.repository.projection.TimeRevenueProjection;
import com.hotel.booking.service.admin.AdminReportService;
import com.lowagie.text.Document;
import com.lowagie.text.Element;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.BaseFont;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.xssf.streaming.SXSSFSheet;
import org.apache.poi.xssf.streaming.SXSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.NumberFormat;
import java.time.LocalDate;
import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminReportServiceImpl implements AdminReportService {

    private final ReportRepository reportRepository;
    private final RoomRepository roomRepository;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final NumberFormat CURRENCY_FORMAT = NumberFormat.getInstance(Locale.of("vi", "VN"));

    @Override
    @Transactional(readOnly = true)
    public RevenueReportResponse getRevenueReport(LocalDate startDate, LocalDate endDate, ReportType reportType) {
        validateDateRange(startDate, endDate);

        ReportType actualType = (reportType != null) ? reportType : ReportType.MONTHLY;

        // Truy vấn phân nhóm thời gian tại CSDL
        List<TimeRevenueProjection> timeProjections = (actualType == ReportType.DAILY)
                ? reportRepository.getDailyRevenue(startDate, endDate)
                : reportRepository.getMonthlyRevenue(startDate, endDate);

        // Truy vấn phân nhóm loại phòng tại CSDL
        List<CategoryShareProjection> categoryProjections = reportRepository.getCategoryShare(startDate, endDate);

        // Luồng 5b: Không có dữ liệu hoàn thành trong khoảng thời gian này
        if (timeProjections.isEmpty() && categoryProjections.isEmpty()) {
            return RevenueReportResponse.noData();
        }

        long totalRoomsCount = roomRepository.count();
        if (totalRoomsCount <= 0) totalRoomsCount = 1;

        long daysInPeriod = ChronoUnit.DAYS.between(startDate, endDate) + 1;

        BigDecimal totalRevenue = BigDecimal.ZERO;
        BigDecimal serviceRevenue = BigDecimal.ZERO;
        long totalCompletedBookings = 0;
        long totalOccupiedNights = 0;

        List<RevenueByTime> revenueByTimeList = new ArrayList<>();
        for (TimeRevenueProjection p : timeProjections) {
            BigDecimal timeTotal = p.getTotalRev() != null ? p.getTotalRev() : BigDecimal.ZERO;
            BigDecimal timeService = p.getServiceRev() != null ? p.getServiceRev() : BigDecimal.ZERO;
            BigDecimal timeRoom = timeTotal.subtract(timeService);

            long bookingCount = p.getBookingCount() != null ? p.getBookingCount() : 0;
            long occupiedNights = p.getOccupiedNights() != null ? p.getOccupiedNights() : 0;

            totalRevenue = totalRevenue.add(timeTotal);
            serviceRevenue = serviceRevenue.add(timeService);
            totalCompletedBookings += bookingCount;
            totalOccupiedNights += occupiedNights;

            // Tính công suất phòng theo mốc thời gian
            int daysInBucket = calculateDaysInBucket(p.getTimeLabel(), actualType);
            double bucketOccupancyRate = 0.0;
            if (daysInBucket > 0) {
                bucketOccupancyRate = Math.min(100.0, (double) occupiedNights / (totalRoomsCount * daysInBucket) * 100);
            }

            revenueByTimeList.add(RevenueByTime.builder()
                    .label(p.getTimeLabel())
                    .roomRevenue(timeRoom)
                    .serviceRevenue(timeService)
                    .totalRevenue(timeTotal)
                    .occupancyRate(Math.round(bucketOccupancyRate * 10.0) / 10.0)
                    .build());
        }

        BigDecimal roomRevenue = totalRevenue.subtract(serviceRevenue);

        // Tính công suất phòng trung bình toàn kỳ
        double overallOccupancyRate = 0.0;
        if (daysInPeriod > 0) {
            overallOccupancyRate = Math.min(100.0, (double) totalOccupiedNights / (totalRoomsCount * daysInPeriod) * 100);
        }

        // Tỷ trọng theo loại phòng
        List<RoomCategoryShare> roomCategoryShareList = new ArrayList<>();
        for (CategoryShareProjection cp : categoryProjections) {
            BigDecimal catRev = cp.getRevenue() != null ? cp.getRevenue() : BigDecimal.ZERO;
            long bCount = cp.getBookingCount() != null ? cp.getBookingCount() : 0;

            double percentage = 0.0;
            if (totalRevenue.compareTo(BigDecimal.ZERO) > 0) {
                percentage = catRev.multiply(BigDecimal.valueOf(100))
                        .divide(totalRevenue, 1, RoundingMode.HALF_UP)
                        .doubleValue();
            }

            roomCategoryShareList.add(RoomCategoryShare.builder()
                    .categoryName(cp.getCategoryName())
                    .bookingCount(bCount)
                    .revenue(catRev)
                    .percentage(percentage)
                    .build());
        }

        String topCategory = (!roomCategoryShareList.isEmpty()) ? roomCategoryShareList.get(0).getCategoryName() : "Không xác định";

        SummaryMetrics summaryMetrics = SummaryMetrics.builder()
                .totalRevenue(totalRevenue)
                .roomRevenue(roomRevenue)
                .serviceRevenue(serviceRevenue)
                .completedBookings(totalCompletedBookings)
                .occupancyRate(Math.round(overallOccupancyRate * 10.0) / 10.0)
                .topCategory(topCategory)
                .build();

        return RevenueReportResponse.builder()
                .hasData(true)
                .message("Thành công")
                .summaryMetrics(summaryMetrics)
                .revenueByTime(revenueByTimeList)
                .roomCategoryShare(roomCategoryShareList)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] exportExcelReport(LocalDate startDate, LocalDate endDate) {
        RevenueReportResponse report = getRevenueReport(startDate, endDate, ReportType.MONTHLY);
        if (!Boolean.TRUE.equals(report.getHasData())) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Không có dữ liệu trong khoảng thời gian này");
        }

        try (SXSSFWorkbook workbook = new SXSSFWorkbook(100);
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            SXSSFSheet sheet = workbook.createSheet("Báo cáo doanh thu");
            sheet.trackAllColumnsForAutoSizing();

            // Cell Styles
            CellStyle titleStyle = workbook.createCellStyle();
            Font titleFont = workbook.createFont();
            titleFont.setBold(true);
            titleFont.setFontHeightInPoints((short) 16);
            titleStyle.setFont(titleFont);

            CellStyle subTitleStyle = workbook.createCellStyle();
            Font subTitleFont = workbook.createFont();
            subTitleFont.setItalic(true);
            subTitleFont.setFontHeightInPoints((short) 11);
            subTitleStyle.setFont(subTitleFont);

            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerFont.setColor(IndexedColors.WHITE.getIndex());
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.DARK_BLUE.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            headerStyle.setAlignment(HorizontalAlignment.CENTER);

            CellStyle currencyStyle = workbook.createCellStyle();
            DataFormat dataFormat = workbook.createDataFormat();
            currencyStyle.setDataFormat(dataFormat.getFormat("#,##0 \"đ\""));

            CellStyle percentStyle = workbook.createCellStyle();
            percentStyle.setDataFormat(dataFormat.getFormat("0.0\"%\""));

            int rowIdx = 0;

            // 1. Tiêu đề
            Row titleRow = sheet.createRow(rowIdx++);
            Cell titleCell = titleRow.createCell(0);
            titleCell.setCellValue("BÁO CÁO DOANH THU & CHỈ SỐ HOẠT ĐỘNG KHÁCH SẠN");
            titleCell.setCellStyle(titleStyle);

            Row subRow = sheet.createRow(rowIdx++);
            Cell subCell = subRow.createCell(0);
            subCell.setCellValue("Khoảng thời gian: " + startDate.format(DATE_FORMATTER) + " — " + endDate.format(DATE_FORMATTER));
            subCell.setCellStyle(subTitleStyle);

            rowIdx++; // Dòng trống

            // 2. Bảng METRIC / VALUE (KPIs)
            Row kpiHeaderRow = sheet.createRow(rowIdx++);
            createCell(kpiHeaderRow, 0, "CHỈ SỐ KPI", headerStyle);
            createCell(kpiHeaderRow, 1, "GIÁ TRỊ", headerStyle);

            SummaryMetrics sm = report.getSummaryMetrics();
            addKpiRow(sheet, rowIdx++, "Tổng doanh thu", sm.getTotalRevenue(), currencyStyle);
            addKpiRow(sheet, rowIdx++, "Doanh thu tiền phòng", sm.getRoomRevenue(), currencyStyle);
            addKpiRow(sheet, rowIdx++, "Doanh thu dịch vụ", sm.getServiceRevenue(), currencyStyle);
            addKpiRowNumber(sheet, rowIdx++, "Số đơn hoàn thành (CHECKED_OUT)", sm.getCompletedBookings());
            addKpiRowPercent(sheet, rowIdx++, "Công suất phòng trung bình", sm.getOccupancyRate(), percentStyle);
            addKpiRowString(sheet, rowIdx++, "Hạng phòng doanh thu cao nhất", sm.getTopCategory());

            rowIdx += 2; // Dòng trống

            // 3. Bảng Doanh thu theo mốc thời gian
            Row timeHeaderRow = sheet.createRow(rowIdx++);
            createCell(timeHeaderRow, 0, "Mốc thời gian", headerStyle);
            createCell(timeHeaderRow, 1, "Doanh thu phòng", headerStyle);
            createCell(timeHeaderRow, 2, "Doanh thu dịch vụ", headerStyle);
            createCell(timeHeaderRow, 3, "Tổng doanh thu", headerStyle);
            createCell(timeHeaderRow, 4, "Công suất phòng", headerStyle);

            for (RevenueByTime item : report.getRevenueByTime()) {
                Row r = sheet.createRow(rowIdx++);
                r.createCell(0).setCellValue(item.getLabel());

                Cell c1 = r.createCell(1);
                c1.setCellValue(item.getRoomRevenue().doubleValue());
                c1.setCellStyle(currencyStyle);

                Cell c2 = r.createCell(2);
                c2.setCellValue(item.getServiceRevenue().doubleValue());
                c2.setCellStyle(currencyStyle);

                Cell c3 = r.createCell(3);
                c3.setCellValue(item.getTotalRevenue().doubleValue());
                c3.setCellStyle(currencyStyle);

                Cell c4 = r.createCell(4);
                c4.setCellValue(item.getOccupancyRate() != null ? item.getOccupancyRate() : 0.0);
                c4.setCellStyle(percentStyle);
            }

            rowIdx += 2; // Dòng trống

            // 4. Bảng Tỷ trọng theo loại phòng
            Row catHeaderRow = sheet.createRow(rowIdx++);
            createCell(catHeaderRow, 0, "Loại phòng", headerStyle);
            createCell(catHeaderRow, 1, "Số đơn đặt phòng", headerStyle);
            createCell(catHeaderRow, 2, "Doanh thu", headerStyle);
            createCell(catHeaderRow, 3, "Tỷ trọng (%)", headerStyle);

            for (RoomCategoryShare share : report.getRoomCategoryShare()) {
                Row r = sheet.createRow(rowIdx++);
                r.createCell(0).setCellValue(share.getCategoryName());
                r.createCell(1).setCellValue(share.getBookingCount());

                Cell c2 = r.createCell(2);
                c2.setCellValue(share.getRevenue().doubleValue());
                c2.setCellStyle(currencyStyle);

                Cell c3 = r.createCell(3);
                c3.setCellValue(share.getPercentage() != null ? share.getPercentage() : 0.0);
                c3.setCellStyle(percentStyle);
            }

            for (int i = 0; i < 5; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            workbook.dispose();
            return out.toByteArray();
        } catch (Exception e) {
            log.error("Lỗi khi xuất file Excel báo cáo: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "Không thể xuất file Excel: " + e.getMessage());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] exportPdfReport(LocalDate startDate, LocalDate endDate) {
        RevenueReportResponse report = getRevenueReport(startDate, endDate, ReportType.MONTHLY);
        if (!Boolean.TRUE.equals(report.getHasData())) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Không có dữ liệu trong khoảng thời gian này");
        }

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 36, 36, 36, 36);
            PdfWriter.getInstance(document, out);
            document.open();

            // Font tiếng Việt Unicode
            com.lowagie.text.Font titleFont = getVietnameseFont(18, com.lowagie.text.Font.BOLD, new Color(15, 23, 42));
            com.lowagie.text.Font subTitleFont = getVietnameseFont(10, com.lowagie.text.Font.ITALIC, new Color(100, 116, 139));
            com.lowagie.text.Font sectionFont = getVietnameseFont(13, com.lowagie.text.Font.BOLD, new Color(30, 41, 59));
            com.lowagie.text.Font headerFont = getVietnameseFont(10, com.lowagie.text.Font.BOLD, Color.WHITE);
            com.lowagie.text.Font textFont = getVietnameseFont(10, com.lowagie.text.Font.NORMAL, new Color(30, 41, 59));
            com.lowagie.text.Font boldFont = getVietnameseFont(10, com.lowagie.text.Font.BOLD, new Color(15, 23, 42));

            // Tiêu đề
            Paragraph title = new Paragraph("BÁO CÁO DOANH THU & CHỈ SỐ HOẠT ĐỘNG", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(4);
            document.add(title);

            Paragraph subTitle = new Paragraph("Khách sạn Sonxoi Hill • Khoảng thời gian: "
                    + startDate.format(DATE_FORMATTER) + " — " + endDate.format(DATE_FORMATTER), subTitleFont);
            subTitle.setAlignment(Element.ALIGN_CENTER);
            subTitle.setSpacingAfter(18);
            document.add(subTitle);

            // 1. Bảng METRIC / VALUE
            document.add(new Paragraph("1. CÁC CHỈ SỐ DOANH THU CHỦ CHỐT (KPI)", sectionFont));
            document.add(new Paragraph(" "));

            PdfPTable kpiTable = new PdfPTable(2);
            kpiTable.setWidthPercentage(100);
            kpiTable.setWidths(new float[]{60, 40});

            addPdfHeaderCell(kpiTable, "Chỉ số hoạt động (Metric)", headerFont);
            addPdfHeaderCell(kpiTable, "Giá trị thực tế (Value)", headerFont);

            SummaryMetrics sm = report.getSummaryMetrics();
            addPdfRow(kpiTable, "Tổng doanh thu", formatVND(sm.getTotalRevenue()), textFont, boldFont);
            addPdfRow(kpiTable, "Doanh thu tiền phòng", formatVND(sm.getRoomRevenue()), textFont, textFont);
            addPdfRow(kpiTable, "Doanh thu dịch vụ", formatVND(sm.getServiceRevenue()), textFont, textFont);
            addPdfRow(kpiTable, "Số đơn đặt phòng hoàn tất", String.valueOf(sm.getCompletedBookings()), textFont, textFont);
            addPdfRow(kpiTable, "Công suất phòng trung bình", sm.getOccupancyRate() + "%", textFont, textFont);
            addPdfRow(kpiTable, "Hạng phòng mang lại doanh thu cao nhất", sm.getTopCategory(), textFont, boldFont);

            document.add(kpiTable);
            document.add(new Paragraph(" "));

            // 2. Bảng Doanh thu theo mốc thời gian
            document.add(new Paragraph("2. DOANH THU THEO MỐC THỜI GIAN", sectionFont));
            document.add(new Paragraph(" "));

            PdfPTable timeTable = new PdfPTable(5);
            timeTable.setWidthPercentage(100);
            timeTable.setWidths(new float[]{22, 22, 20, 22, 14});

            addPdfHeaderCell(timeTable, "Thời gian", headerFont);
            addPdfHeaderCell(timeTable, "Tiền phòng", headerFont);
            addPdfHeaderCell(timeTable, "Dịch vụ", headerFont);
            addPdfHeaderCell(timeTable, "Tổng cộng", headerFont);
            addPdfHeaderCell(timeTable, "OCC (%)", headerFont);

            for (RevenueByTime item : report.getRevenueByTime()) {
                addPdfCell(timeTable, item.getLabel(), textFont, Element.ALIGN_CENTER);
                addPdfCell(timeTable, formatVND(item.getRoomRevenue()), textFont, Element.ALIGN_RIGHT);
                addPdfCell(timeTable, formatVND(item.getServiceRevenue()), textFont, Element.ALIGN_RIGHT);
                addPdfCell(timeTable, formatVND(item.getTotalRevenue()), boldFont, Element.ALIGN_RIGHT);
                addPdfCell(timeTable, item.getOccupancyRate() + "%", textFont, Element.ALIGN_CENTER);
            }

            document.add(timeTable);
            document.add(new Paragraph(" "));

            // 3. Bảng Tỷ trọng theo loại phòng
            document.add(new Paragraph("3. TỶ TRỌNG DOANH THU THEO HẠNG PHÒNG", sectionFont));
            document.add(new Paragraph(" "));

            PdfPTable catTable = new PdfPTable(4);
            catTable.setWidthPercentage(100);
            catTable.setWidths(new float[]{35, 20, 30, 15});

            addPdfHeaderCell(catTable, "Hạng phòng", headerFont);
            addPdfHeaderCell(catTable, "Số đơn hoàn tất", headerFont);
            addPdfHeaderCell(catTable, "Doanh thu", headerFont);
            addPdfHeaderCell(catTable, "Tỷ trọng", headerFont);

            for (RoomCategoryShare share : report.getRoomCategoryShare()) {
                addPdfCell(catTable, share.getCategoryName(), textFont, Element.ALIGN_LEFT);
                addPdfCell(catTable, String.valueOf(share.getBookingCount()), textFont, Element.ALIGN_CENTER);
                addPdfCell(catTable, formatVND(share.getRevenue()), boldFont, Element.ALIGN_RIGHT);
                addPdfCell(catTable, share.getPercentage() + "%", textFont, Element.ALIGN_CENTER);
            }

            document.add(catTable);

            document.close();
            return out.toByteArray();
        } catch (Exception e) {
            log.error("Lỗi khi xuất file PDF báo cáo: {}", e.getMessage(), e);
            throw new AppException(ErrorCode.INTERNAL_SERVER_ERROR, "Không thể xuất file PDF: " + e.getMessage());
        }
    }

    private void validateDateRange(LocalDate startDate, LocalDate endDate) {
        if (startDate == null || endDate == null) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Ngày bắt đầu và ngày kết thúc không được để trống");
        }
        if (endDate.isBefore(startDate)) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu");
        }
        if (ChronoUnit.DAYS.between(startDate, endDate) > 366) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Khoảng thời gian lọc tối đa là 366 ngày");
        }
    }

    private int calculateDaysInBucket(String label, ReportType type) {
        if (type == ReportType.DAILY) return 1;
        try {
            YearMonth ym = YearMonth.parse(label);
            return ym.lengthOfMonth();
        } catch (Exception e) {
            return 30;
        }
    }

    private void createCell(Row row, int col, String value, CellStyle style) {
        Cell cell = row.createCell(col);
        cell.setCellValue(value);
        cell.setCellStyle(style);
    }

    private void addKpiRow(Sheet sheet, int rowIdx, String label, BigDecimal value, CellStyle currencyStyle) {
        Row row = sheet.createRow(rowIdx);
        row.createCell(0).setCellValue(label);
        Cell valCell = row.createCell(1);
        valCell.setCellValue(value != null ? value.doubleValue() : 0.0);
        valCell.setCellStyle(currencyStyle);
    }

    private void addKpiRowNumber(Sheet sheet, int rowIdx, String label, Long value) {
        Row row = sheet.createRow(rowIdx);
        row.createCell(0).setCellValue(label);
        row.createCell(1).setCellValue(value != null ? value : 0);
    }

    private void addKpiRowPercent(Sheet sheet, int rowIdx, String label, Double value, CellStyle percentStyle) {
        Row row = sheet.createRow(rowIdx);
        row.createCell(0).setCellValue(label);
        Cell valCell = row.createCell(1);
        valCell.setCellValue(value != null ? value : 0.0);
        valCell.setCellStyle(percentStyle);
    }

    private void addKpiRowString(Sheet sheet, int rowIdx, String label, String value) {
        Row row = sheet.createRow(rowIdx);
        row.createCell(0).setCellValue(label);
        row.createCell(1).setCellValue(value != null ? value : "");
    }

    private void addPdfHeaderCell(PdfPTable table, String text, com.lowagie.text.Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBackgroundColor(new Color(30, 41, 59));
        cell.setPadding(6);
        cell.setHorizontalAlignment(Element.ALIGN_CENTER);
        table.addCell(cell);
    }

    private void addPdfCell(PdfPTable table, String text, com.lowagie.text.Font font, int align) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setPadding(5);
        cell.setHorizontalAlignment(align);
        table.addCell(cell);
    }

    private void addPdfRow(PdfPTable table, String label, String value, com.lowagie.text.Font f1, com.lowagie.text.Font f2) {
        PdfPCell c1 = new PdfPCell(new Phrase(label, f1));
        c1.setPadding(5);
        table.addCell(c1);

        PdfPCell c2 = new PdfPCell(new Phrase(value, f2));
        c2.setPadding(5);
        c2.setHorizontalAlignment(Element.ALIGN_RIGHT);
        table.addCell(c2);
    }

    private com.lowagie.text.Font getVietnameseFont(float size, int style, Color color) {
        String[] fontPaths = {
                "C:/Windows/Fonts/arial.ttf",
                "C:/Windows/Fonts/times.ttf",
                "C:/Windows/Fonts/tahoma.ttf",
                "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
        };
        for (String path : fontPaths) {
            try {
                if (new File(path).exists()) {
                    BaseFont bf = BaseFont.createFont(path, BaseFont.IDENTITY_H, BaseFont.EMBEDDED);
                    return new com.lowagie.text.Font(bf, size, style, color);
                }
            } catch (Exception ignored) {
            }
        }
        return new com.lowagie.text.Font(com.lowagie.text.Font.HELVETICA, size, style, color);
    }

    private String formatVND(BigDecimal amount) {
        if (amount == null) return "0 đ";
        return CURRENCY_FORMAT.format(amount) + " đ";
    }
}
