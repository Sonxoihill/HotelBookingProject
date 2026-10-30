package com.hotel.booking.service;

import com.hotel.booking.common.exception.AppException;
import com.hotel.booking.common.exception.ErrorCode;
import com.hotel.booking.dto.admin.AdminRoomRequest;
import com.hotel.booking.dto.admin.AdminRoomResponse;
import com.hotel.booking.entity.Room;
import com.hotel.booking.entity.RoomCategory;
import com.hotel.booking.enums.RoomStatus;
import com.hotel.booking.repository.BookingRepository;
import com.hotel.booking.repository.ReviewRepository;
import com.hotel.booking.repository.RoomCategoryRepository;
import com.hotel.booking.repository.RoomRepository;
import com.hotel.booking.service.impl.AdminRoomServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminRoomServiceImplTest {

    @Mock
    private RoomRepository roomRepository;

    @Mock
    private RoomCategoryRepository roomCategoryRepository;

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private ReviewRepository reviewRepository;

    @InjectMocks
    private AdminRoomServiceImpl adminRoomService;

    private RoomCategory category;
    private Room availableRoom;
    private Room occupiedRoom;

    @BeforeEach
    void setUp() {
        category = RoomCategory.builder()
                .name("Standard Single")
                .basePrice(new BigDecimal("500000.00"))
                .capacity(1)
                .bedCount(1)
                .area(new BigDecimal("25.00"))
                .build();
        category.setId(1L);

        availableRoom = Room.builder()
                .roomNumber("101")
                .floor(1)
                .status(RoomStatus.AVAILABLE)
                .category(category)
                .build();
        availableRoom.setId(1L);

        occupiedRoom = Room.builder()
                .roomNumber("102")
                .floor(1)
                .status(RoomStatus.OCCUPIED)
                .category(category)
                .build();
        occupiedRoom.setId(2L);
    }

    @Test
    @DisplayName("Tạo phòng thất bại khi số phòng đã tồn tại -> Ném CONFLICT 409")
    void testCreateRoom_DuplicateRoomNumber() {
        AdminRoomRequest request = AdminRoomRequest.builder()
                .roomNumber("101")
                .floor(1)
                .categoryId(1L)
                .build();

        when(roomRepository.existsByRoomNumber("101")).thenReturn(true);

        AppException ex = assertThrows(AppException.class, () -> adminRoomService.createRoom(request));
        assertEquals(ErrorCode.CONFLICT, ex.getErrorCode());
        assertEquals("Số phòng đã tồn tại", ex.getMessage());
    }

    @Test
    @DisplayName("Tạo phòng thất bại khi đặt trạng thái OCCUPIED/RESERVED -> Ném BAD_REQUEST 400")
    void testCreateRoom_InvalidStatus() {
        AdminRoomRequest request = AdminRoomRequest.builder()
                .roomNumber("103")
                .floor(1)
                .categoryId(1L)
                .status(RoomStatus.OCCUPIED)
                .build();

        when(roomRepository.existsByRoomNumber("103")).thenReturn(false);
        when(roomCategoryRepository.findById(1L)).thenReturn(Optional.of(category));

        AppException ex = assertThrows(AppException.class, () -> adminRoomService.createRoom(request));
        assertEquals(ErrorCode.BAD_REQUEST, ex.getErrorCode());
        assertTrue(ex.getMessage().contains("Admin chỉ được phép"));
    }

    @Test
    @DisplayName("Sửa phòng thất bại khi phòng đang OCCUPIED mà cố đổi trạng thái -> Ném BAD_REQUEST 400")
    void testUpdateRoom_ChangeStatusOfOccupiedRoom() {
        AdminRoomRequest request = AdminRoomRequest.builder()
                .roomNumber("102")
                .floor(1)
                .categoryId(1L)
                .status(RoomStatus.AVAILABLE)
                .build();

        when(roomRepository.findById(2L)).thenReturn(Optional.of(occupiedRoom));
        when(roomRepository.existsByRoomNumberAndIdNot("102", 2L)).thenReturn(false);
        when(roomCategoryRepository.findById(1L)).thenReturn(Optional.of(category));

        AppException ex = assertThrows(AppException.class, () -> adminRoomService.updateRoom(2L, request));
        assertEquals(ErrorCode.BAD_REQUEST, ex.getErrorCode());
        assertEquals("Không thể thay đổi trạng thái của phòng đang có khách lưu trú (OCCUPIED)", ex.getMessage());
    }

    @Test
    @DisplayName("Xóa phòng thất bại khi phòng đang OCCUPIED hoặc có đơn PENDING/CONFIRMED/CHECKED_IN -> Ném BAD_REQUEST 400")
    void testDeleteRoom_OccupiedOrActiveBooking() {
        when(roomRepository.findById(2L)).thenReturn(Optional.of(occupiedRoom));

        AppException ex = assertThrows(AppException.class, () -> adminRoomService.deleteRoom(2L));
        assertEquals(ErrorCode.BAD_REQUEST, ex.getErrorCode());
        assertEquals("Không thể xóa phòng đang có khách lưu trú hoặc có lịch đặt trước", ex.getMessage());
    }

    @Test
    @DisplayName("Xóa phòng thất bại khi phòng đã có lịch sử đặt phòng hoặc review -> Ném BAD_REQUEST 400")
    void testDeleteRoom_HasBookingHistory() {
        when(roomRepository.findById(1L)).thenReturn(Optional.of(availableRoom));
        when(bookingRepository.existsByRoomIdAndStatusIn(eq(1L), anyList())).thenReturn(false);
        when(bookingRepository.existsByRoomId(1L)).thenReturn(true);

        AppException ex = assertThrows(AppException.class, () -> adminRoomService.deleteRoom(1L));
        assertEquals(ErrorCode.BAD_REQUEST, ex.getErrorCode());
        assertTrue(ex.getMessage().contains("Phòng đã phát sinh lịch sử đặt phòng nên không thể xóa"));
    }

    @Test
    @DisplayName("Xóa phòng thành công khi không vướng lịch sử -> Xóa cứng")
    void testDeleteRoom_Success() {
        when(roomRepository.findById(1L)).thenReturn(Optional.of(availableRoom));
        when(bookingRepository.existsByRoomIdAndStatusIn(eq(1L), anyList())).thenReturn(false);
        when(bookingRepository.existsByRoomId(1L)).thenReturn(false);
        when(reviewRepository.existsByRoomId(1L)).thenReturn(false);

        assertDoesNotThrow(() -> adminRoomService.deleteRoom(1L));
        verify(roomRepository, times(1)).delete(availableRoom);
    }
}
