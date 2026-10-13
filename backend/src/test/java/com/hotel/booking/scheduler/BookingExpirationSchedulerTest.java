package com.hotel.booking.scheduler;

import com.hotel.booking.service.BookingService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BookingExpirationSchedulerTest {

    @Mock
    private BookingService bookingService;

    @InjectMocks
    private BookingExpirationScheduler scheduler;

    @Test
    @DisplayName("SCRUM-93: Scheduler kích hoạt quét và hủy đơn PENDING quá hạn 15 phút")
    void testScanAndCancelExpiredPendingBookings() {
        when(bookingService.cancelExpiredPendingBookings(15)).thenReturn(3);

        scheduler.scanAndCancelExpiredPendingBookings();

        verify(bookingService).cancelExpiredPendingBookings(15);
    }
}
