package com.hotel.booking.service;

import com.hotel.booking.common.exception.AppException;
import com.hotel.booking.common.exception.ErrorCode;
import com.hotel.booking.dto.receptionist.RoomGridResponse;
import com.hotel.booking.entity.Booking;
import com.hotel.booking.entity.Room;
import com.hotel.booking.entity.RoomCategory;
import com.hotel.booking.entity.User;
import com.hotel.booking.enums.BookingStatus;
import com.hotel.booking.enums.RoomStatus;
import com.hotel.booking.repository.BookingRepository;
import com.hotel.booking.repository.BookingServiceRepository;
import com.hotel.booking.repository.RoomRepository;
import com.hotel.booking.repository.ServiceRepository;
import com.hotel.booking.service.impl.ReceptionistServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReceptionistServiceTest {

    @Mock
    private RoomRepository roomRepository;

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private BookingServiceRepository bookingServiceRepository;

    @Mock
    private ServiceRepository serviceRepository;

    @InjectMocks
    private ReceptionistServiceImpl receptionistService;

    private Room sampleRoomDirty;
    private Room sampleRoomAvailable;
    private User sampleUser;
    private Booking sampleBookingCheckedIn;
    private Booking sampleBookingConfirmed;
    private Booking sampleBookingPending;
    private com.hotel.booking.entity.Service sampleService1;
    private com.hotel.booking.entity.Service sampleService2;

    @BeforeEach
    void setUp() {
        RoomCategory category = RoomCategory.builder()
                .name("Deluxe Double")
                .basePrice(new BigDecimal("950000"))
                .capacity(2)
                .bedType("1 Giường đôi King size")
                .build();
        category.setId(2L);

        sampleRoomDirty = Room.builder()
                .roomNumber("202")
                .floor(2)
                .status(RoomStatus.DIRTY)
                .category(category)
                .build();
        sampleRoomDirty.setId(4L);

        sampleRoomAvailable = Room.builder()
                .roomNumber("101")
                .floor(1)
                .status(RoomStatus.AVAILABLE)
                .category(category)
                .build();
        sampleRoomAvailable.setId(1L);

        sampleUser = User.builder()
                .email("guest@hotel.com")
                .fullName("Trần Minh Quân")
                .phone("0901234567")
                .build();
        sampleUser.setId(10L);

        sampleBookingCheckedIn = Booking.builder()
                .user(sampleUser)
                .room(sampleRoomAvailable)
                .checkIn(LocalDate.now())
                .checkOut(LocalDate.now().plusDays(2))
                .status(BookingStatus.CHECKED_IN)
                .totalAmount(new BigDecimal("1900000"))
                .paidAmount(new BigDecimal("1000000"))
                .actualCheckIn(LocalDateTime.now())
                .notes("Khách VIP")
                .build();
        sampleBookingCheckedIn.setId(100L);

        sampleBookingConfirmed = Booking.builder()
                .user(sampleUser)
                .room(sampleRoomAvailable)
                .checkIn(LocalDate.now())
                .checkOut(LocalDate.now().plusDays(2))
                .status(BookingStatus.CONFIRMED)
                .totalAmount(new BigDecimal("1900000"))
                .paidAmount(new BigDecimal("500000"))
                .build();
        sampleBookingConfirmed.setId(101L);

        sampleBookingPending = Booking.builder()
                .user(sampleUser)
                .room(sampleRoomAvailable)
                .checkIn(LocalDate.now())
                .checkOut(LocalDate.now().plusDays(2))
                .status(BookingStatus.PENDING)
                .totalAmount(new BigDecimal("1900000"))
                .paidAmount(BigDecimal.ZERO)
                .build();
        sampleBookingPending.setId(102L);

        sampleService1 = com.hotel.booking.entity.Service.builder()
                .name("Nước suối khoáng")
                .price(new BigDecimal("20000"))
                .unit("Chai")
                .status(com.hotel.booking.enums.ServiceStatus.ACTIVE)
                .build();
        sampleService1.setId(1L);

        sampleService2 = com.hotel.booking.entity.Service.builder()
                .name("Giặt là")
                .price(new BigDecimal("50000"))
                .unit("Bộ")
                .status(com.hotel.booking.enums.ServiceStatus.ACTIVE)
                .build();
        sampleService2.setId(2L);
    }

    @Test
    @DisplayName("getRoomGrid (UC09) - Lấy sơ đồ phòng thành công và khử trùng lặp ưu tiên CHECKED_IN")
    void testGetRoomGrid_Success() {
        RoomGridResponse room1 = RoomGridResponse.builder()
                .id(1L)
                .roomNumber("101")
                .floor(1)
                .status(RoomStatus.AVAILABLE)
                .categoryName("Standard Single")
                .build();

        RoomGridResponse room2Confirmed = RoomGridResponse.builder()
                .id(2L)
                .roomNumber("102")
                .floor(1)
                .status(RoomStatus.OCCUPIED)
                .categoryName("Standard Single")
                .bookingId(10L)
                .bookingStatus(BookingStatus.CONFIRMED)
                .guestName("Khách Hàng A")
                .build();

        RoomGridResponse room2CheckedIn = RoomGridResponse.builder()
                .id(2L)
                .roomNumber("102")
                .floor(1)
                .status(RoomStatus.OCCUPIED)
                .categoryName("Standard Single")
                .bookingId(11L)
                .bookingStatus(BookingStatus.CHECKED_IN)
                .guestName("Khách Hàng Đang Ở")
                .actualCheckIn(LocalDateTime.now())
                .checkOut(LocalDate.now().plusDays(2))
                .notes("Ưu tiên phòng yên tĩnh")
                .build();

        when(roomRepository.findRoomGrid(1, null)).thenReturn(List.of(room1, room2Confirmed, room2CheckedIn));

        List<RoomGridResponse> result = receptionistService.getRoomGrid(1, null);

        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals("101", result.get(0).getRoomNumber());
        assertEquals("102", result.get(1).getRoomNumber());
        assertEquals(BookingStatus.CHECKED_IN, result.get(1).getBookingStatus(), "Đơn CHECKED_IN phải được ưu tiên ghi đè");
        assertEquals("Khách Hàng Đang Ở", result.get(1).getGuestName());
    }

    @Test
    @DisplayName("cleanRoom (UC12) - Xác nhận dọn phòng thành công khi phòng ở trạng thái DIRTY")
    void testCleanRoom_Success() {
        when(roomRepository.findById(4L)).thenReturn(Optional.of(sampleRoomDirty));
        when(roomRepository.save(any(Room.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Room cleaned = receptionistService.cleanRoom(4L);

        assertNotNull(cleaned);
        assertEquals(RoomStatus.AVAILABLE, cleaned.getStatus());
        verify(roomRepository).save(sampleRoomDirty);
    }

    @Test
    @DisplayName("cleanRoom (UC12) - Ném ngoại lệ HTTP 400 Bad Request khi phòng không ở trạng thái DIRTY")
    void testCleanRoom_NotDirty_ThrowsException() {
        when(roomRepository.findById(1L)).thenReturn(Optional.of(sampleRoomAvailable));

        AppException exception = assertThrows(AppException.class, () -> receptionistService.cleanRoom(1L));

        assertEquals(ErrorCode.BAD_REQUEST, exception.getErrorCode());
        assertEquals("Phòng không ở trạng thái Cần dọn", exception.getMessage());
        verify(roomRepository, never()).save(any(Room.class));
    }

    @Test
    @DisplayName("cleanRoom (UC12) - Ném ngoại lệ 404 Not Found khi không tìm thấy phòng")
    void testCleanRoom_NotFound_ThrowsException() {
        when(roomRepository.findById(999L)).thenReturn(Optional.empty());

        AppException exception = assertThrows(AppException.class, () -> receptionistService.cleanRoom(999L));

        assertEquals(ErrorCode.ROOM_NOT_FOUND, exception.getErrorCode());
        verify(roomRepository, never()).save(any(Room.class));
    }

    @Test
    @DisplayName("addServicesToBooking (UC11) - Thêm dịch vụ thành công, cập nhật tổng tiền Booking")
    void testAddServicesToBooking_Success() {
        List<com.hotel.booking.dto.receptionist.AddServiceItemRequest> items = List.of(
                new com.hotel.booking.dto.receptionist.AddServiceItemRequest(1L, 2), // 2 * 20,000 = 40,000
                new com.hotel.booking.dto.receptionist.AddServiceItemRequest(2L, 1)  // 1 * 50,000 = 50,000
        );

        when(bookingRepository.findByIdWithDetails(100L)).thenReturn(Optional.of(sampleBookingCheckedIn));
        when(serviceRepository.findById(1L)).thenReturn(Optional.of(sampleService1));
        when(serviceRepository.findById(2L)).thenReturn(Optional.of(sampleService2));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(inv -> inv.getArgument(0));

        com.hotel.booking.entity.BookingService bs1 = com.hotel.booking.entity.BookingService.builder()
                .id(1L)
                .booking(sampleBookingCheckedIn)
                .service(sampleService1)
                .quantity(2)
                .price(sampleService1.getPrice())
                .build();

        com.hotel.booking.entity.BookingService bs2 = com.hotel.booking.entity.BookingService.builder()
                .id(2L)
                .booking(sampleBookingCheckedIn)
                .service(sampleService2)
                .quantity(1)
                .price(sampleService2.getPrice())
                .build();

        when(bookingServiceRepository.findByBookingIdWithService(100L)).thenReturn(List.of(bs1, bs2));

        com.hotel.booking.dto.receptionist.BookingServicesSummaryResponse response =
                receptionistService.addServicesToBooking(100L, items);

        assertNotNull(response);
        assertEquals(100L, response.getBookingId());
        // 1,900,000 + 40,000 + 50,000 = 1,990,000
        assertEquals(new BigDecimal("1990000"), response.getTotalAmount());
        assertEquals(new BigDecimal("90000"), response.getTotalServiceAmount());
        assertEquals(new BigDecimal("990000"), response.getRemainingAmount());
        assertEquals(2, response.getServices().size());
        verify(bookingServiceRepository, times(2)).save(any(com.hotel.booking.entity.BookingService.class));
        verify(bookingRepository).save(sampleBookingCheckedIn);
    }

    @Test
    @DisplayName("addServicesToBooking (UC11) - Ném 400 khi danh sách dịch vụ rỗng")
    void testAddServicesToBooking_EmptyList_ThrowsException() {
        AppException ex = assertThrows(AppException.class, () ->
                receptionistService.addServicesToBooking(100L, List.of()));

        assertEquals(ErrorCode.BAD_REQUEST, ex.getErrorCode());
        assertEquals("Vui lòng chọn dịch vụ và số lượng hợp lệ", ex.getMessage());
    }

    @Test
    @DisplayName("addServicesToBooking (UC11) - Ném 400 khi số lượng dịch vụ <= 0")
    void testAddServicesToBooking_InvalidQuantity_ThrowsException() {
        List<com.hotel.booking.dto.receptionist.AddServiceItemRequest> items = List.of(
                new com.hotel.booking.dto.receptionist.AddServiceItemRequest(1L, 0)
        );

        AppException ex = assertThrows(AppException.class, () ->
                receptionistService.addServicesToBooking(100L, items));

        assertEquals(ErrorCode.BAD_REQUEST, ex.getErrorCode());
        assertEquals("Vui lòng chọn dịch vụ và số lượng hợp lệ", ex.getMessage());
    }

    @Test
    @DisplayName("addServicesToBooking (UC11) - Ném 404 khi không tìm thấy đơn đặt phòng")
    void testAddServicesToBooking_BookingNotFound_ThrowsException() {
        List<com.hotel.booking.dto.receptionist.AddServiceItemRequest> items = List.of(
                new com.hotel.booking.dto.receptionist.AddServiceItemRequest(1L, 1)
        );

        when(bookingRepository.findByIdWithDetails(999L)).thenReturn(Optional.empty());

        AppException ex = assertThrows(AppException.class, () ->
                receptionistService.addServicesToBooking(999L, items));

        assertEquals(ErrorCode.BOOKING_NOT_FOUND, ex.getErrorCode());
    }

    @Test
    @DisplayName("addServicesToBooking (UC11) - Ném 400 khi đơn đặt phòng không ở trạng thái CHECKED_IN")
    void testAddServicesToBooking_NotCheckedIn_ThrowsException() {
        List<com.hotel.booking.dto.receptionist.AddServiceItemRequest> items = List.of(
                new com.hotel.booking.dto.receptionist.AddServiceItemRequest(1L, 1)
        );

        when(bookingRepository.findByIdWithDetails(101L)).thenReturn(Optional.of(sampleBookingConfirmed));

        AppException ex = assertThrows(AppException.class, () ->
                receptionistService.addServicesToBooking(101L, items));

        assertEquals(ErrorCode.BAD_REQUEST, ex.getErrorCode());
        assertTrue(ex.getMessage().contains("CHECKED_IN"));
    }

    @Test
    @DisplayName("addServicesToBooking (UC11) - Ném 400 khi dịch vụ không hoạt động (INACTIVE)")
    void testAddServicesToBooking_ServiceInactive_ThrowsException() {
        com.hotel.booking.entity.Service inactiveService = com.hotel.booking.entity.Service.builder()
                .name("Dịch vụ tạm ngưng")
                .price(new BigDecimal("100000"))
                .status(com.hotel.booking.enums.ServiceStatus.INACTIVE)
                .build();
        inactiveService.setId(99L);

        List<com.hotel.booking.dto.receptionist.AddServiceItemRequest> items = List.of(
                new com.hotel.booking.dto.receptionist.AddServiceItemRequest(99L, 1)
        );

        when(bookingRepository.findByIdWithDetails(100L)).thenReturn(Optional.of(sampleBookingCheckedIn));
        when(serviceRepository.findById(99L)).thenReturn(Optional.of(inactiveService));

        AppException ex = assertThrows(AppException.class, () ->
                receptionistService.addServicesToBooking(100L, items));

        assertEquals(ErrorCode.BAD_REQUEST, ex.getErrorCode());
        assertTrue(ex.getMessage().contains("không hoạt động"));
    }

    @Test
    @DisplayName("getBookingServices (UC11) - Lấy danh sách dịch vụ và tóm tắt hóa đơn thành công")
    void testGetBookingServices_Success() {
        when(bookingRepository.findByIdWithDetails(100L)).thenReturn(Optional.of(sampleBookingCheckedIn));

        com.hotel.booking.entity.BookingService bs1 = com.hotel.booking.entity.BookingService.builder()
                .id(1L)
                .booking(sampleBookingCheckedIn)
                .service(sampleService1)
                .quantity(2)
                .price(sampleService1.getPrice())
                .build();

        when(bookingServiceRepository.findByBookingIdWithService(100L)).thenReturn(List.of(bs1));

        com.hotel.booking.dto.receptionist.BookingServicesSummaryResponse response =
                receptionistService.getBookingServices(100L);

        assertNotNull(response);
        assertEquals(100L, response.getBookingId());
        assertEquals("101", response.getRoomNumber());
        assertEquals("Trần Minh Quân", response.getGuestName());
        assertEquals(1, response.getServices().size());
        assertEquals("Nước suối khoáng", response.getServices().get(0).getServiceName());
        assertEquals(new BigDecimal("40000"), response.getTotalServiceAmount());
    }

    @Test
    @DisplayName("getBookings (UC10 - API 1) - Lấy danh sách đơn đặt phòng phân trang thành công")
    void testGetBookings_Success() {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(0, 10);
        org.springframework.data.domain.Page<Booking> page = new org.springframework.data.domain.PageImpl<>(
                List.of(sampleBookingCheckedIn, sampleBookingConfirmed), pageable, 2
        );

        when(bookingRepository.findReceptionistBookings("Quân", null, pageable)).thenReturn(page);

        com.hotel.booking.common.response.PageResponse<com.hotel.booking.dto.receptionist.ReceptionistBookingResponse> result =
                receptionistService.getBookings("Quân", null, pageable);

        assertNotNull(result);
        assertEquals(2, result.getItems().size());
        assertEquals(1, result.getPage());
        assertEquals(2, result.getTotalElements());
        assertEquals("Trần Minh Quân", result.getItems().get(0).getGuestName());
    }

    @Test
    @DisplayName("approveBooking (UC10 - API 2 - Luồng 3a) - Duyệt đơn PENDING thành CONFIRMED, phòng sang RESERVED")
    void testApproveBooking_Success() {
        when(bookingRepository.findByIdWithDetails(102L)).thenReturn(Optional.of(sampleBookingPending));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(inv -> inv.getArgument(0));

        com.hotel.booking.dto.receptionist.ReceptionistBookingResponse response = receptionistService.approveBooking(102L);

        assertNotNull(response);
        assertEquals(BookingStatus.CONFIRMED, response.getStatus());
        assertEquals(RoomStatus.RESERVED, sampleRoomAvailable.getStatus());
        verify(roomRepository).save(sampleRoomAvailable);
        verify(bookingRepository).save(sampleBookingPending);
    }

    @Test
    @DisplayName("approveBooking (UC10 - API 2) - Ném 400 khi đơn không ở trạng thái PENDING")
    void testApproveBooking_NotPending_ThrowsException() {
        when(bookingRepository.findByIdWithDetails(100L)).thenReturn(Optional.of(sampleBookingCheckedIn));

        AppException ex = assertThrows(AppException.class, () -> receptionistService.approveBooking(100L));

        assertEquals(ErrorCode.BAD_REQUEST, ex.getErrorCode());
        assertTrue(ex.getMessage().contains("PENDING"));
        verify(roomRepository, never()).save(any());
    }

    @Test
    @DisplayName("cancelBooking (UC10 - API 3 - Luồng 3b) - Hủy đơn ghi nhận lý do, giải phóng phòng về AVAILABLE")
    void testCancelBooking_Success() {
        sampleRoomAvailable.setStatus(RoomStatus.RESERVED);
        when(bookingRepository.findByIdWithDetails(101L)).thenReturn(Optional.of(sampleBookingConfirmed));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(inv -> inv.getArgument(0));

        com.hotel.booking.dto.receptionist.ReceptionistBookingResponse response =
                receptionistService.cancelBooking(101L, "Khách bận việc đột xuất");

        assertNotNull(response);
        assertEquals(BookingStatus.CANCELLED, response.getStatus());
        assertEquals("Khách bận việc đột xuất", response.getCancelReason());
        assertEquals(RoomStatus.AVAILABLE, sampleRoomAvailable.getStatus());
        verify(roomRepository).save(sampleRoomAvailable);
        verify(bookingRepository).save(sampleBookingConfirmed);
    }

    @Test
    @DisplayName("cancelBooking (UC10 - API 3) - Ném 400 khi lý do hủy rỗng")
    void testCancelBooking_EmptyReason_ThrowsException() {
        AppException ex = assertThrows(AppException.class, () ->
                receptionistService.cancelBooking(101L, "   "));

        assertEquals(ErrorCode.BAD_REQUEST, ex.getErrorCode());
        assertEquals("Lý do hủy phòng là bắt buộc", ex.getMessage());
    }

    @Test
    @DisplayName("cancelBooking (UC10 - API 3) - Ném 400 khi đơn đang ở trạng thái CHECKED_IN")
    void testCancelBooking_CheckedInStatus_ThrowsException() {
        when(bookingRepository.findByIdWithDetails(100L)).thenReturn(Optional.of(sampleBookingCheckedIn));

        AppException ex = assertThrows(AppException.class, () ->
                receptionistService.cancelBooking(100L, "Khách muốn hủy giữa chừng"));

        assertEquals(ErrorCode.BAD_REQUEST, ex.getErrorCode());
        assertTrue(ex.getMessage().contains("CHECKED_IN"));
        verify(bookingRepository, never()).save(any());
        verify(roomRepository, never()).save(any());
    }

    @Test
    @DisplayName("checkInBooking (UC10 - API 4 - Luồng 3c) - Check-in đơn CONFIRMED thành CHECKED_IN, phòng OCCUPIED")
    void testCheckInBooking_Success() {
        when(bookingRepository.findByIdWithDetails(101L)).thenReturn(Optional.of(sampleBookingConfirmed));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(inv -> inv.getArgument(0));

        com.hotel.booking.dto.receptionist.ReceptionistBookingResponse response = receptionistService.checkInBooking(101L);

        assertNotNull(response);
        assertEquals(BookingStatus.CHECKED_IN, response.getStatus());
        assertNotNull(response.getActualCheckIn());
        assertEquals(RoomStatus.OCCUPIED, sampleRoomAvailable.getStatus());
        verify(roomRepository).save(sampleRoomAvailable);
        verify(bookingRepository).save(sampleBookingConfirmed);
    }

    @Test
    @DisplayName("checkInBooking (UC10 - API 4) - Ném 400 khi đơn chưa CONFIRMED")
    void testCheckInBooking_NotConfirmed_ThrowsException() {
        when(bookingRepository.findByIdWithDetails(102L)).thenReturn(Optional.of(sampleBookingPending));

        AppException ex = assertThrows(AppException.class, () -> receptionistService.checkInBooking(102L));

        assertEquals(ErrorCode.BAD_REQUEST, ex.getErrorCode());
        assertTrue(ex.getMessage().contains("CONFIRMED"));
    }

    @Test
    @DisplayName("getCheckoutSummary (UC10 - API 5) - Tính toán tóm tắt hóa đơn trước Check-out chính xác")
    void testGetCheckoutSummary_Success() {
        when(bookingRepository.findByIdWithDetails(100L)).thenReturn(Optional.of(sampleBookingCheckedIn));

        com.hotel.booking.entity.BookingService bs1 = com.hotel.booking.entity.BookingService.builder()
                .id(1L)
                .booking(sampleBookingCheckedIn)
                .service(sampleService1)
                .quantity(3)
                .price(sampleService1.getPrice()) // 3 * 20,000 = 60,000
                .build();

        when(bookingServiceRepository.findByBookingIdWithService(100L)).thenReturn(List.of(bs1));

        com.hotel.booking.dto.receptionist.CheckoutSummaryResponse summary = receptionistService.getCheckoutSummary(100L);

        assertNotNull(summary);
        assertEquals(100L, summary.getBookingId());
        assertEquals(new BigDecimal("1900000"), summary.getTotalAmount());
        assertEquals(new BigDecimal("60000"), summary.getTotalServiceAmount());
        assertEquals(new BigDecimal("1840000"), summary.getRoomAmount());
        assertEquals(new BigDecimal("1000000"), summary.getPaidAmount());
        assertEquals(new BigDecimal("900000"), summary.getRemainingAmount());
        assertEquals(1, summary.getServices().size());
    }

    @Test
    @DisplayName("checkOutBooking (UC10 - API 6) - Check-out cập nhật paidAmount = totalAmount, phòng DIRTY")
    void testCheckOutBooking_Success() {
        sampleRoomAvailable.setStatus(RoomStatus.OCCUPIED);
        when(bookingRepository.findByIdWithDetails(100L)).thenReturn(Optional.of(sampleBookingCheckedIn));
        when(bookingRepository.save(any(Booking.class))).thenAnswer(inv -> inv.getArgument(0));

        com.hotel.booking.dto.receptionist.CheckOutRequest request =
                new com.hotel.booking.dto.receptionist.CheckOutRequest("CREDIT_CARD", "Khách quẹt thẻ POS");

        com.hotel.booking.dto.receptionist.ReceptionistBookingResponse response =
                receptionistService.checkOutBooking(100L, request);

        assertNotNull(response);
        assertEquals(BookingStatus.CHECKED_OUT, response.getStatus());
        assertEquals(new BigDecimal("1900000"), response.getPaidAmount());
        assertEquals(BigDecimal.ZERO, response.getRemainingAmount());
        assertNotNull(response.getActualCheckOut());
        assertEquals(RoomStatus.DIRTY, sampleRoomAvailable.getStatus());
        verify(roomRepository).save(sampleRoomAvailable);
        verify(bookingRepository).save(sampleBookingCheckedIn);
    }

    @Test
    @DisplayName("checkOutBooking (UC10 - API 6) - Ném 400 khi đơn không ở trạng thái CHECKED_IN")
    void testCheckOutBooking_NotCheckedIn_ThrowsException() {
        when(bookingRepository.findByIdWithDetails(101L)).thenReturn(Optional.of(sampleBookingConfirmed));

        com.hotel.booking.dto.receptionist.CheckOutRequest request = new com.hotel.booking.dto.receptionist.CheckOutRequest();

        AppException ex = assertThrows(AppException.class, () -> receptionistService.checkOutBooking(101L, request));

        assertEquals(ErrorCode.BAD_REQUEST, ex.getErrorCode());
        assertTrue(ex.getMessage().contains("CHECKED_IN"));
    }
}
