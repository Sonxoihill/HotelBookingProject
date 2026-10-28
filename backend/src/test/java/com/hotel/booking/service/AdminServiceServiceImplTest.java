package com.hotel.booking.service;

import com.hotel.booking.common.exception.AppException;
import com.hotel.booking.common.exception.ErrorCode;
import com.hotel.booking.dto.admin.AdminServiceRequest;
import com.hotel.booking.entity.Service;
import com.hotel.booking.enums.ServiceStatus;
import com.hotel.booking.repository.BookingServiceRepository;
import com.hotel.booking.repository.ServiceRepository;
import com.hotel.booking.service.impl.AdminServiceServiceImpl;
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
class AdminServiceServiceImplTest {

    @Mock
    private ServiceRepository serviceRepository;

    @Mock
    private BookingServiceRepository bookingServiceRepository;

    @InjectMocks
    private AdminServiceServiceImpl adminServiceService;

    private Service service;

    @BeforeEach
    void setUp() {
        service = Service.builder()
                .name("Bữa sáng Buffet")
                .price(new BigDecimal("120000.00"))
                .unit("Suất")
                .status(ServiceStatus.ACTIVE)
                .build();
        service.setId(1L);
    }

    @Test
    @DisplayName("Tạo dịch vụ thất bại khi trùng tên dịch vụ -> Ném CONFLICT 409")
    void testCreateService_DuplicateName() {
        AdminServiceRequest request = AdminServiceRequest.builder()
                .name("Bữa sáng Buffet")
                .price(new BigDecimal("120000.00"))
                .unit("Suất")
                .build();

        when(serviceRepository.existsByName("Bữa sáng Buffet")).thenReturn(true);

        AppException ex = assertThrows(AppException.class, () -> adminServiceService.createService(request));
        assertEquals(ErrorCode.CONFLICT, ex.getErrorCode());
        assertEquals("Tên dịch vụ đã tồn tại", ex.getMessage());
    }

    @Test
    @DisplayName("Xóa dịch vụ đã phát sinh giao dịch trong booking_services -> Không xóa cứng, chuyển INACTIVE")
    void testDeleteService_HasTransactions_Deactivated() {
        when(serviceRepository.findById(1L)).thenReturn(Optional.of(service));
        when(bookingServiceRepository.existsByServiceId(1L)).thenReturn(true);

        boolean hardDeleted = adminServiceService.deleteService(1L);
        assertFalse(hardDeleted);
        assertEquals(ServiceStatus.INACTIVE, service.getStatus());
        verify(serviceRepository, times(1)).save(service);
        verify(serviceRepository, never()).delete(any());
    }

    @Test
    @DisplayName("Xóa dịch vụ chưa phát sinh giao dịch -> Xóa cứng thành công")
    void testDeleteService_NoTransactions_HardDeleted() {
        when(serviceRepository.findById(1L)).thenReturn(Optional.of(service));
        when(bookingServiceRepository.existsByServiceId(1L)).thenReturn(false);

        boolean hardDeleted = adminServiceService.deleteService(1L);
        assertTrue(hardDeleted);
        verify(serviceRepository, times(1)).delete(service);
    }
}
