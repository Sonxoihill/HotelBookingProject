package com.hotel.booking.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hotel.booking.common.exception.ConflictException;
import com.hotel.booking.config.JwtUtil;
import com.hotel.booking.dto.booking.CreateBookingRequest;
import com.hotel.booking.entity.Booking;
import com.hotel.booking.entity.Room;
import com.hotel.booking.enums.BookingStatus;
import com.hotel.booking.security.jwt.JwtAuthenticationFilter;
import com.hotel.booking.security.jwt.JwtUtils;
import com.hotel.booking.service.BookingService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.dao.CannotAcquireLockException;
import org.springframework.data.jpa.mapping.JpaMetamodelMappingContext;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(BookingController.class)
@AutoConfigureMockMvc(addFilters = false)
class BookingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private JpaMetamodelMappingContext jpaMappingContext;

    @MockBean
    private BookingService bookingService;

    @MockBean
    private JwtUtil jwtUtil;

    @MockBean
    private JwtUtils jwtUtils;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    @DisplayName("POST /bookings (SCRUM-93) - Đặt phòng thành công trả về HTTP 200 và đơn hàng PENDING")
    void testCreateBooking_Success() throws Exception {
        CreateBookingRequest request = CreateBookingRequest.builder()
                .roomId(1L)
                .checkIn(LocalDate.of(2026, 10, 10))
                .checkOut(LocalDate.of(2026, 10, 12))
                .totalAmount(new BigDecimal("2000000"))
                .email("guest@hotel.com")
                .build();

        Booking booking = Booking.builder()
                .checkIn(request.getCheckIn())
                .checkOut(request.getCheckOut())
                .totalAmount(request.getTotalAmount())
                .status(BookingStatus.PENDING)
                .room(Room.builder().roomNumber("101").build())
                .build();
        booking.setId(10L);

        when(bookingService.createBooking(any(), any(CreateBookingRequest.class))).thenReturn(booking);

        mockMvc.perform(post("/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.message").value("Đặt phòng thành công!"))
                .andExpect(jsonPath("$.data.id").value(10L))
                .andExpect(jsonPath("$.data.status").value("PENDING"));
    }

    @Test
    @DisplayName("POST /bookings (SCRUM-93 AC) - 2 request cùng đặt 1 phòng: Request thứ 2 gặp xung đột trả về HTTP 409 Conflict")
    void testCreateBooking_Conflict_Returns409() throws Exception {
        CreateBookingRequest request = CreateBookingRequest.builder()
                .roomId(1L)
                .checkIn(LocalDate.of(2026, 10, 10))
                .checkOut(LocalDate.of(2026, 10, 12))
                .totalAmount(new BigDecimal("2000000"))
                .email("guest2@hotel.com")
                .build();

        when(bookingService.createBooking(any(), any(CreateBookingRequest.class)))
                .thenThrow(new ConflictException("Phòng hiện đang được giữ chỗ hoặc đã có khách. Vui lòng chọn phòng khác!"));

        mockMvc.perform(post("/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Phòng hiện đang được giữ chỗ hoặc đã có khách. Vui lòng chọn phòng khác!"));
    }

    @Test
    @DisplayName("POST /bookings (SCRUM-93 AC) - 2 request cùng đặt 1 phòng: Request thứ 2 gặp RoomConflictException trả về HTTP 409 Conflict")
    void testCreateBooking_RoomConflictException_Returns409() throws Exception {
        CreateBookingRequest request = CreateBookingRequest.builder()
                .roomId(1L)
                .checkIn(LocalDate.of(2026, 10, 10))
                .checkOut(LocalDate.of(2026, 10, 12))
                .totalAmount(new BigDecimal("2000000"))
                .email("guest2@hotel.com")
                .build();

        when(bookingService.createBooking(any(), any(CreateBookingRequest.class)))
                .thenThrow(new com.hotel.booking.common.exception.RoomConflictException("Phòng đã được đặt hoặc đang có người giữ chỗ trong khoảng thời gian này. Vui lòng chọn thời gian khác hoặc phòng khác!"));

        mockMvc.perform(post("/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Phòng đã được đặt hoặc đang có người giữ chỗ trong khoảng thời gian này. Vui lòng chọn thời gian khác hoặc phòng khác!"));
    }

    @Test
    @DisplayName("POST /bookings (SCRUM-93 AC) - Database lock contention trả về HTTP 409 Conflict với message tiếng Việt rõ ràng")
    void testCreateBooking_LockContention_Returns409() throws Exception {
        CreateBookingRequest request = CreateBookingRequest.builder()
                .roomId(1L)
                .checkIn(LocalDate.of(2026, 10, 10))
                .checkOut(LocalDate.of(2026, 10, 12))
                .totalAmount(new BigDecimal("2000000"))
                .email("guest2@hotel.com")
                .build();

        when(bookingService.createBooking(any(), any(CreateBookingRequest.class)))
                .thenThrow(new CannotAcquireLockException("Could not acquire lock for entity Room"));

        mockMvc.perform(post("/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.message").value("Phòng đang được xử lý đặt bởi người dùng khác. Vui lòng thử lại sau ít phút!"));
    }
}
