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
                .fullName("Nguyễn Văn Khách")
                .phone("0987654321")
                .email("guest@gmail.com")
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
                .fullName("Nguyễn Văn Khách")
                .phone("0987654321")
                .email("guest2@gmail.com")
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
                .fullName("Nguyễn Văn Khách")
                .phone("0987654321")
                .email("guest2@gmail.com")
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
                .fullName("Nguyễn Văn Khách")
                .phone("0987654321")
                .email("guest2@gmail.com")
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

    @Test
    @DisplayName("POST /bookings - Bỏ trống trường Họ tên trả về HTTP 400 Bad Request")
    void testCreateBooking_BlankFullName_Returns400() throws Exception {
        CreateBookingRequest request = CreateBookingRequest.builder()
                .roomId(1L)
                .checkIn(LocalDate.of(2026, 10, 10))
                .checkOut(LocalDate.of(2026, 10, 12))
                .fullName("")
                .phone("0987654321")
                .email("guest@gmail.com")
                .build();

        mockMvc.perform(post("/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errors.fullName").value("Không được để trống trường Họ tên"));
    }

    @Test
    @DisplayName("POST /bookings - Bỏ trống trường SĐT trả về HTTP 400 Bad Request")
    void testCreateBooking_BlankPhone_Returns400() throws Exception {
        CreateBookingRequest request = CreateBookingRequest.builder()
                .roomId(1L)
                .checkIn(LocalDate.of(2026, 10, 10))
                .checkOut(LocalDate.of(2026, 10, 12))
                .fullName("Nguyễn Văn Khách")
                .phone("")
                .email("guest@gmail.com")
                .build();

        mockMvc.perform(post("/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errors.phone").value("Không được để trống trường SĐT"));
    }

    @Test
    @DisplayName("POST /bookings - Bỏ trống trường Email trả về HTTP 400 Bad Request")
    void testCreateBooking_BlankEmail_Returns400() throws Exception {
        CreateBookingRequest request = CreateBookingRequest.builder()
                .roomId(1L)
                .checkIn(LocalDate.of(2026, 10, 10))
                .checkOut(LocalDate.of(2026, 10, 12))
                .fullName("Nguyễn Văn Khách")
                .phone("0987654321")
                .email("")
                .build();

        mockMvc.perform(post("/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errors.email").value("Không được để trống trường Email"));
    }

    @Test
    @DisplayName("POST /bookings - Bỏ trống tất cả các trường trả về HTTP 400 Bad Request")
    void testCreateBooking_BlankAllFields_Returns400() throws Exception {
        CreateBookingRequest request = CreateBookingRequest.builder()
                .fullName("")
                .phone("")
                .email("")
                .build();

        mockMvc.perform(post("/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errors.fullName").value("Không được để trống trường Họ tên"))
                .andExpect(jsonPath("$.errors.phone").value("Không được để trống trường SĐT"))
                .andExpect(jsonPath("$.errors.email").value("Không được để trống trường Email"))
                .andExpect(jsonPath("$.errors.roomId").exists())
                .andExpect(jsonPath("$.errors.checkIn").exists())
                .andExpect(jsonPath("$.errors.checkOut").exists());
    }

    @Test
    @DisplayName("POST /bookings - Họ tên chứa chữ số, ký tự đặc biệt, quá ngắn trả về HTTP 400 'Họ tên không đúng định dạng'")
    void testCreateBooking_InvalidFullNameFormat_Returns400() throws Exception {
        CreateBookingRequest request = CreateBookingRequest.builder()
                .roomId(1L)
                .checkIn(LocalDate.of(2026, 10, 10))
                .checkOut(LocalDate.of(2026, 10, 12))
                .fullName("Nguyen123")
                .phone("0987654321")
                .email("guest@gmail.com")
                .build();

        mockMvc.perform(post("/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errors.fullName").value("Họ tên không đúng định dạng"));

        // Test 1 ký tự
        request.setFullName("A");
        mockMvc.perform(post("/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errors.fullName").value("Họ tên không đúng định dạng"));
    }

    @Test
    @DisplayName("POST /bookings - SĐT không đúng định dạng trả về HTTP 400 'SĐT không đúng định dạng'")
    void testCreateBooking_InvalidPhoneFormat_Returns400() throws Exception {
        CreateBookingRequest request = CreateBookingRequest.builder()
                .roomId(1L)
                .checkIn(LocalDate.of(2026, 10, 10))
                .checkOut(LocalDate.of(2026, 10, 12))
                .fullName("Nguyễn Văn Khách")
                .phone("0123456789")
                .email("guest@gmail.com")
                .build();

        mockMvc.perform(post("/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errors.phone").value("SĐT không đúng định dạng"));
    }

    @Test
    @DisplayName("POST /bookings - Email không đúng định dạng trả về HTTP 400 'Email không đúng định dạng'")
    void testCreateBooking_InvalidEmailFormat_Returns400() throws Exception {
        CreateBookingRequest request = CreateBookingRequest.builder()
                .roomId(1L)
                .checkIn(LocalDate.of(2026, 10, 10))
                .checkOut(LocalDate.of(2026, 10, 12))
                .fullName("Nguyễn Văn Khách")
                .phone("0987654321")
                .email("invalid-email@other.com")
                .build();

        mockMvc.perform(post("/bookings")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false))
                .andExpect(jsonPath("$.errors.email").value("Email không đúng định dạng"));
    }
}
