package com.hotel.booking.service;

import com.hotel.booking.common.exception.BadRequestException;
import com.hotel.booking.common.exception.ConflictException;
import com.hotel.booking.common.exception.RoomConflictException;
import com.hotel.booking.dto.booking.CancelBookingRequest;
import com.hotel.booking.dto.booking.CreateBookingRequest;
import com.hotel.booking.entity.Booking;
import com.hotel.booking.entity.Room;
import com.hotel.booking.entity.RoomCategory;
import com.hotel.booking.entity.User;
import com.hotel.booking.enums.BookingStatus;
import com.hotel.booking.enums.RoomStatus;
import com.hotel.booking.repository.BookingRepository;
import com.hotel.booking.repository.RoomRepository;
import com.hotel.booking.repository.UserRepository;
import com.hotel.booking.service.impl.BookingServiceImpl;
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
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private RoomRepository roomRepository;

    @InjectMocks
    private BookingServiceImpl bookingService;

    private User sampleUser;
    private Room sampleRoom;
    private RoomCategory sampleCategory;

    @BeforeEach
    void setUp() {
        sampleUser = User.builder()
                .email("guest@hotel.com")
                .fullName("Nguyễn Văn A")
                .build();
        sampleUser.setId(1L);

        sampleCategory = RoomCategory.builder()
                .name("Deluxe Room")
                .basePrice(new BigDecimal("1000000"))
                .build();
        sampleCategory.setId(10L);

        sampleRoom = Room.builder()
                .roomNumber("101")
                .floor(1)
                .status(RoomStatus.AVAILABLE)
                .category(sampleCategory)
                .build();
        sampleRoom.setId(100L);
    }

    @Test
    @DisplayName("SCRUM-93: Tạo đơn thành công với Pessimistic Lock, trạng thái đơn PENDING, không khóa cưỡng chế trạng thái phòng")
    void testCreateBooking_Success_SetsPending() {
        CreateBookingRequest request = CreateBookingRequest.builder()
                .roomId(100L)
                .checkIn(LocalDate.now().plusDays(1))
                .checkOut(LocalDate.now().plusDays(3))
                .totalAmount(new BigDecimal("2200000"))
                .email("guest@hotel.com")
                .build();

        when(userRepository.findByEmail("guest@hotel.com")).thenReturn(Optional.of(sampleUser));
        when(roomRepository.findByIdWithLock(100L)).thenReturn(Optional.of(sampleRoom));
        when(bookingRepository.existsOverlappingBooking(eq(100L), any(), any())).thenReturn(false);
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> {
            Booking b = invocation.getArgument(0);
            b.setId(500L);
            return b;
        });

        Booking result = bookingService.createBooking("guest@hotel.com", request);

        assertNotNull(result);
        assertEquals(BookingStatus.PENDING, result.getStatus());
        assertEquals(RoomStatus.AVAILABLE, sampleRoom.getStatus());

        verify(roomRepository).findByIdWithLock(100L);
        verify(bookingRepository).save(any(Booking.class));
    }

    @Test
    @DisplayName("SCRUM-93: Đặt phòng thất bại khi phòng đang trong trạng thái bảo trì MAINTENANCE (HTTP 409 Conflict)")
    void testCreateBooking_Conflict_WhenRoomUnderMaintenance() {
        sampleRoom.setStatus(RoomStatus.MAINTENANCE);

        CreateBookingRequest request = CreateBookingRequest.builder()
                .roomId(100L)
                .checkIn(LocalDate.now().plusDays(1))
                .checkOut(LocalDate.now().plusDays(3))
                .email("guest@hotel.com")
                .build();

        when(userRepository.findByEmail("guest@hotel.com")).thenReturn(Optional.of(sampleUser));
        when(roomRepository.findByIdWithLock(100L)).thenReturn(Optional.of(sampleRoom));

        RoomConflictException exception = assertThrows(RoomConflictException.class, () ->
                bookingService.createBooking("guest@hotel.com", request)
        );

        assertTrue(exception.getMessage().contains("bảo trì"));
        verify(bookingRepository, never()).save(any(Booking.class));
    }

    @Test
    @DisplayName("SCRUM-93 Concurrency: Đặt phòng thất bại khi đã có đơn trùng lịch check-in/check-out (HTTP 409 Conflict)")
    void testCreateBooking_Conflict_WhenOverlappingBookingExists() {
        CreateBookingRequest request = CreateBookingRequest.builder()
                .roomId(100L)
                .checkIn(LocalDate.now().plusDays(1))
                .checkOut(LocalDate.now().plusDays(3))
                .email("guest@hotel.com")
                .build();

        when(userRepository.findByEmail("guest@hotel.com")).thenReturn(Optional.of(sampleUser));
        when(roomRepository.findByIdWithLock(100L)).thenReturn(Optional.of(sampleRoom));
        when(bookingRepository.existsOverlappingBooking(eq(100L), any(), any())).thenReturn(true);

        RoomConflictException exception = assertThrows(RoomConflictException.class, () ->
                bookingService.createBooking("guest@hotel.com", request)
        );

        assertTrue(exception.getMessage().contains("đã được đặt hoặc đang có người giữ chỗ"));
        verify(bookingRepository, never()).save(any(Booking.class));
    }

    @Test
    @DisplayName("SCRUM-93: Cho phép đặt cùng 1 phòng nếu thời gian check-in/check-out KHÁC NHAU không bị trùng lặp")
    void testCreateBooking_Success_WhenDifferentDatesForSameRoom() {
        // Request 1 đã đặt từ ngày +1 đến +3 (không trùng lịch với request 2 từ +10 đến +12)
        CreateBookingRequest request = CreateBookingRequest.builder()
                .roomId(100L)
                .checkIn(LocalDate.now().plusDays(10))
                .checkOut(LocalDate.now().plusDays(12))
                .email("guest2@hotel.com")
                .build();

        when(userRepository.findByEmail("guest2@hotel.com")).thenReturn(Optional.of(sampleUser));
        when(roomRepository.findByIdWithLock(100L)).thenReturn(Optional.of(sampleRoom));
        // Kiểm tra lịch không trùng trả về false
        when(bookingRepository.existsOverlappingBooking(eq(100L), eq(request.getCheckIn()), eq(request.getCheckOut())))
                .thenReturn(false);
        when(bookingRepository.save(any(Booking.class))).thenAnswer(invocation -> {
            Booking b = invocation.getArgument(0);
            b.setId(501L);
            return b;
        });

        Booking result = bookingService.createBooking("guest2@hotel.com", request);

        assertNotNull(result);
        assertEquals(BookingStatus.PENDING, result.getStatus());
        verify(bookingRepository).save(any(Booking.class));
    }

    @Test
    @DisplayName("Hủy đơn thành công: Giải phóng phòng từ ON_HOLD về AVAILABLE")
    void testCancelBooking_Success_ReleasesRoomToAvailable() {
        sampleRoom.setStatus(RoomStatus.ON_HOLD);

        Booking booking = Booking.builder()
                .user(sampleUser)
                .room(sampleRoom)
                .status(BookingStatus.PENDING)
                .build();
        booking.setId(500L);

        when(bookingRepository.findById(500L)).thenReturn(Optional.of(booking));
        when(bookingRepository.save(any(Booking.class))).thenReturn(booking);

        CancelBookingRequest request = CancelBookingRequest.builder()
                .reason("Khách đổi kế hoạch")
                .build();

        Booking result = bookingService.cancelBooking("guest@hotel.com", 500L, request);

        assertEquals(BookingStatus.CANCELLED, result.getStatus());
        assertEquals(RoomStatus.AVAILABLE, sampleRoom.getStatus());
        verify(roomRepository).saveAndFlush(sampleRoom);
    }

    @Test
    @DisplayName("SCRUM-93 Cron Job: Quét các đơn PENDING quá 15 phút, đổi thành CANCELLED và nhả phòng về AVAILABLE")
    void testCancelExpiredPendingBookings_Success() {
        sampleRoom.setStatus(RoomStatus.ON_HOLD);

        Booking expiredBooking = Booking.builder()
                .user(sampleUser)
                .room(sampleRoom)
                .status(BookingStatus.PENDING)
                .build();
        expiredBooking.setId(999L);
        expiredBooking.setCreatedAt(LocalDateTime.now().minusMinutes(20));

        when(bookingRepository.findExpiredPendingBookings(any(LocalDateTime.class)))
                .thenReturn(List.of(expiredBooking));

        int cancelledCount = bookingService.cancelExpiredPendingBookings(15);

        assertEquals(1, cancelledCount);
        assertEquals(BookingStatus.CANCELLED, expiredBooking.getStatus());
        assertEquals(RoomStatus.AVAILABLE, sampleRoom.getStatus());

        verify(bookingRepository).save(expiredBooking);
        verify(roomRepository).saveAndFlush(sampleRoom);
    }
}
