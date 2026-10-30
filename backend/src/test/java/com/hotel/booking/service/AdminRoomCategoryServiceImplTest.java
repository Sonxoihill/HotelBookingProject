package com.hotel.booking.service;

import com.hotel.booking.common.exception.AppException;
import com.hotel.booking.common.exception.ErrorCode;
import com.hotel.booking.dto.admin.RoomCategoryRequest;
import com.hotel.booking.entity.RoomCategory;
import com.hotel.booking.repository.RoomCategoryRepository;
import com.hotel.booking.repository.RoomRepository;
import com.hotel.booking.service.impl.AdminRoomCategoryServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminRoomCategoryServiceImplTest {

    @Mock
    private RoomCategoryRepository roomCategoryRepository;

    @Mock
    private RoomRepository roomRepository;

    @InjectMocks
    private AdminRoomCategoryServiceImpl adminRoomCategoryService;

    private RoomCategory category;

    @BeforeEach
    void setUp() {
        category = RoomCategory.builder()
                .name("Deluxe Double")
                .basePrice(new BigDecimal("950000.00"))
                .capacity(2)
                .bedCount(1)
                .area(new BigDecimal("35.00"))
                .build();
        category.setId(2L);
    }

    @Test
    @DisplayName("Tạo loại phòng thất bại khi trùng tên -> Ném CONFLICT 409")
    void testCreateCategory_DuplicateName() {
        RoomCategoryRequest request = RoomCategoryRequest.builder()
                .name("Deluxe Double")
                .basePrice(new BigDecimal("950000.00"))
                .capacity(2)
                .bedCount(1)
                .area(new BigDecimal("35.00"))
                .build();

        when(roomCategoryRepository.existsByName("Deluxe Double")).thenReturn(true);

        AppException ex = assertThrows(AppException.class, () -> adminRoomCategoryService.createCategory(request));
        assertEquals(ErrorCode.CONFLICT, ex.getErrorCode());
        assertEquals("Tên loại phòng đã tồn tại", ex.getMessage());
    }

    @Test
    @DisplayName("Xóa loại phòng thất bại khi đang có phòng vật lý gắn vào -> Ném BAD_REQUEST 400")
    void testDeleteCategory_HasRooms_Throws400() {
        when(roomCategoryRepository.findById(2L)).thenReturn(Optional.of(category));
        when(roomRepository.existsByCategoryId(2L)).thenReturn(true);

        AppException ex = assertThrows(AppException.class, () -> adminRoomCategoryService.deleteCategory(2L));
        assertEquals(ErrorCode.BAD_REQUEST, ex.getErrorCode());
        assertEquals("Không thể xóa loại phòng đang được sử dụng bởi các phòng vật lý", ex.getMessage());
    }

    @Test
    @DisplayName("Xóa loại phòng thành công khi không có phòng vật lý nào sử dụng")
    void testDeleteCategory_Success() {
        when(roomCategoryRepository.findById(2L)).thenReturn(Optional.of(category));
        when(roomRepository.existsByCategoryId(2L)).thenReturn(false);

        assertDoesNotThrow(() -> adminRoomCategoryService.deleteCategory(2L));
        verify(roomCategoryRepository, times(1)).delete(category);
    }
}
