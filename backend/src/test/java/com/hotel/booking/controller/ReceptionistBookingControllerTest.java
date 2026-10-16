package com.hotel.booking.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hotel.booking.common.exception.AppException;
import com.hotel.booking.common.exception.ErrorCode;
import com.hotel.booking.common.response.PageResponse;
import com.hotel.booking.dto.receptionist.*;
import com.hotel.booking.enums.BookingStatus;
import com.hotel.booking.enums.RoomStatus;
import com.hotel.booking.security.jwt.JwtAuthenticationFilter;
import com.hotel.booking.security.jwt.JwtUtils;
import com.hotel.booking.service.ReceptionistService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.mapping.JpaMetamodelMappingContext;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ReceptionistBookingController.class)
@AutoConfigureMockMvc(addFilters = false)
class ReceptionistBookingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private JpaMetamodelMappingContext jpaMappingContext;

    @MockBean
    private ReceptionistService receptionistService;

    @MockBean
    private JwtUtils jwtUtils;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    @DisplayName("API 1: GET /receptionist/bookings - Danh sách & lọc đơn thành công")
    void testGetBookings_Success() throws Exception {
        ReceptionistBookingResponse b1 = ReceptionistBookingResponse.builder()
                .id(1L)
                .code("#LET-1")
                .guestName("Nguyễn Văn A")
                .guestPhone("0901234567")
                .roomNumber("101")
                .roomCategory("Deluxe Double")
                .status(BookingStatus.PENDING)
                .statusLabel("Chờ duyệt")
                .totalAmount(new BigDecimal("1500000"))
                .paidAmount(BigDecimal.ZERO)
                .remainingAmount(new BigDecimal("1500000"))
                .build();

        PageResponse<ReceptionistBookingResponse> pageResponse = PageResponse.<ReceptionistBookingResponse>builder()
                .items(List.of(b1))
                .page(1)
                .size(10)
                .totalElements(1)
                .totalPages(1)
                .isLast(true)
                .build();

        when(receptionistService.getBookings(any(), any(), any(Pageable.class))).thenReturn(pageResponse);

        mockMvc.perform(get("/receptionist/bookings")
                        .param("keyword", "Nguyễn")
                        .param("status", "PENDING")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.items").isArray())
                .andExpect(jsonPath("$.data.items[0].code").value("#LET-1"))
                .andExpect(jsonPath("$.data.items[0].guestName").value("Nguyễn Văn A"))
                .andExpect(jsonPath("$.data.items[0].status").value("PENDING"));
    }

    @Test
    @DisplayName("API 2: PATCH /receptionist/bookings/{id}/approve - Duyệt đơn thành công")
    void testApproveBooking_Success() throws Exception {
        ReceptionistBookingResponse response = ReceptionistBookingResponse.builder()
                .id(1L)
                .code("#LET-1")
                .status(BookingStatus.CONFIRMED)
                .statusLabel("Đã duyệt / Giữ phòng")
                .roomStatus(RoomStatus.RESERVED)
                .build();

        when(receptionistService.approveBooking(1L)).thenReturn(response);

        mockMvc.perform(patch("/receptionist/bookings/{id}/approve", 1L)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Duyệt đơn đặt phòng thành công"))
                .andExpect(jsonPath("$.data.status").value("CONFIRMED"))
                .andExpect(jsonPath("$.data.roomStatus").value("RESERVED"));
    }

    @Test
    @DisplayName("API 2: PATCH /receptionist/bookings/{id}/approve - Báo lỗi 400 khi đơn không ở trạng thái PENDING")
    void testApproveBooking_NotPending_Returns400() throws Exception {
        when(receptionistService.approveBooking(1L))
                .thenThrow(new AppException(ErrorCode.BAD_REQUEST, "Chỉ được duyệt đơn đặt phòng đang ở trạng thái Chờ xác nhận (PENDING)"));

        mockMvc.perform(patch("/receptionist/bookings/{id}/approve", 1L)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Chỉ được duyệt đơn đặt phòng đang ở trạng thái Chờ xác nhận (PENDING)"));
    }

    @Test
    @DisplayName("API 3: PATCH /receptionist/bookings/{id}/cancel - Lễ tân hủy đơn thành công")
    void testCancelBooking_Success() throws Exception {
        ReceptionistCancelBookingRequest request = new ReceptionistCancelBookingRequest("Khách hủy chuyến đi");
        ReceptionistBookingResponse response = ReceptionistBookingResponse.builder()
                .id(1L)
                .code("#LET-1")
                .status(BookingStatus.CANCELLED)
                .cancelReason("Khách hủy chuyến đi")
                .roomStatus(RoomStatus.AVAILABLE)
                .build();

        when(receptionistService.cancelBooking(eq(1L), eq("Khách hủy chuyến đi"))).thenReturn(response);

        mockMvc.perform(patch("/receptionist/bookings/{id}/cancel", 1L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Hủy đơn đặt phòng thành công"))
                .andExpect(jsonPath("$.data.status").value("CANCELLED"))
                .andExpect(jsonPath("$.data.roomStatus").value("AVAILABLE"));
    }

    @Test
    @DisplayName("API 3: PATCH /receptionist/bookings/{id}/cancel - Báo lỗi 400 khi lý do hủy rỗng")
    void testCancelBooking_EmptyReason_Returns400() throws Exception {
        mockMvc.perform(patch("/receptionist/bookings/{id}/cancel", 1L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"cancelReason\": \"\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @DisplayName("API 4: PATCH /receptionist/bookings/{id}/check-in - Nhận phòng (Check-in) thành công")
    void testCheckInBooking_Success() throws Exception {
        ReceptionistBookingResponse response = ReceptionistBookingResponse.builder()
                .id(1L)
                .code("#LET-1")
                .status(BookingStatus.CHECKED_IN)
                .roomStatus(RoomStatus.OCCUPIED)
                .actualCheckIn(LocalDateTime.now())
                .build();

        when(receptionistService.checkInBooking(1L)).thenReturn(response);

        mockMvc.perform(patch("/receptionist/bookings/{id}/check-in", 1L)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Nhận phòng (Check-in) thành công"))
                .andExpect(jsonPath("$.data.status").value("CHECKED_IN"))
                .andExpect(jsonPath("$.data.roomStatus").value("OCCUPIED"));
    }

    @Test
    @DisplayName("API 4: PATCH /receptionist/bookings/{id}/check-in - Báo lỗi 400 khi đơn chưa CONFIRMED")
    void testCheckInBooking_NotConfirmed_Returns400() throws Exception {
        when(receptionistService.checkInBooking(1L))
                .thenThrow(new AppException(ErrorCode.BAD_REQUEST, "Chỉ được Check-in cho đơn đặt phòng đã duyệt (CONFIRMED)"));

        mockMvc.perform(patch("/receptionist/bookings/{id}/check-in", 1L)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Chỉ được Check-in cho đơn đặt phòng đã duyệt (CONFIRMED)"));
    }

    @Test
    @DisplayName("API 5: GET /receptionist/bookings/{id}/checkout-summary - Tóm tắt hóa đơn trước check-out thành công")
    void testGetCheckoutSummary_Success() throws Exception {
        CheckoutSummaryResponse summary = CheckoutSummaryResponse.builder()
                .bookingId(1L)
                .bookingCode("#LET-1")
                .roomNumber("101")
                .roomCategory("Deluxe Double")
                .guestName("Nguyễn Văn A")
                .roomAmount(new BigDecimal("1500000"))
                .totalServiceAmount(new BigDecimal("100000"))
                .totalAmount(new BigDecimal("1600000"))
                .paidAmount(new BigDecimal("1000000"))
                .remainingAmount(new BigDecimal("600000"))
                .build();

        when(receptionistService.getCheckoutSummary(1L)).thenReturn(summary);

        mockMvc.perform(get("/receptionist/bookings/{id}/checkout-summary", 1L)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Lấy thông tin tóm tắt thanh toán thành công"))
                .andExpect(jsonPath("$.data.bookingId").value(1))
                .andExpect(jsonPath("$.data.totalAmount").value(1600000))
                .andExpect(jsonPath("$.data.remainingAmount").value(600000));
    }

    @Test
    @DisplayName("API 6: POST /receptionist/bookings/{id}/check-out - Xác nhận Check-out thành công")
    void testCheckOutBooking_Success() throws Exception {
        CheckOutRequest request = new CheckOutRequest("CASH", "Khách trả tiền mặt đủ");
        ReceptionistBookingResponse response = ReceptionistBookingResponse.builder()
                .id(1L)
                .code("#LET-1")
                .status(BookingStatus.CHECKED_OUT)
                .roomStatus(RoomStatus.DIRTY)
                .totalAmount(new BigDecimal("1600000"))
                .paidAmount(new BigDecimal("1600000"))
                .remainingAmount(BigDecimal.ZERO)
                .actualCheckOut(LocalDateTime.now())
                .build();

        when(receptionistService.checkOutBooking(eq(1L), any(CheckOutRequest.class))).thenReturn(response);

        mockMvc.perform(post("/receptionist/bookings/{id}/check-out", 1L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Trả phòng (Check-out) thành công"))
                .andExpect(jsonPath("$.data.status").value("CHECKED_OUT"))
                .andExpect(jsonPath("$.data.roomStatus").value("DIRTY"))
                .andExpect(jsonPath("$.data.paidAmount").value(1600000));
    }

    @Test
    @DisplayName("POST /receptionist/bookings/{bookingId}/services (UC11) - Ghi nhận dịch vụ thành công trả về 200")
    void testAddServicesToBooking_Success() throws Exception {
        BookingServicesSummaryResponse summaryResponse = BookingServicesSummaryResponse.builder()
                .bookingId(100L)
                .roomNumber("101")
                .guestName("Trần Minh Quân")
                .bookingStatus(BookingStatus.CHECKED_IN)
                .totalAmount(new BigDecimal("1990000"))
                .totalServiceAmount(new BigDecimal("90000"))
                .paidAmount(new BigDecimal("1000000"))
                .remainingAmount(new BigDecimal("990000"))
                .services(List.of())
                .build();

        when(receptionistService.addServicesToBooking(eq(100L), any())).thenReturn(summaryResponse);

        mockMvc.perform(post("/receptionist/bookings/{bookingId}/services", 100L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("[{\"serviceId\": 1, \"quantity\": 2}]"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Cập nhật thành công"))
                .andExpect(jsonPath("$.data.bookingId").value(100))
                .andExpect(jsonPath("$.data.totalAmount").value(1990000));
    }

    @Test
    @DisplayName("GET /receptionist/bookings/{bookingId}/services (UC11) - Xem dịch vụ đã dùng trả về 200")
    void testGetBookingServices_Success() throws Exception {
        BookingServicesSummaryResponse summaryResponse = BookingServicesSummaryResponse.builder()
                .bookingId(100L)
                .roomNumber("101")
                .guestName("Trần Minh Quân")
                .bookingStatus(BookingStatus.CHECKED_IN)
                .totalAmount(new BigDecimal("1990000"))
                .services(List.of())
                .build();

        when(receptionistService.getBookingServices(100L)).thenReturn(summaryResponse);

        mockMvc.perform(get("/receptionist/bookings/{bookingId}/services", 100L)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Lấy thông tin dịch vụ thành công"));
    }
}
