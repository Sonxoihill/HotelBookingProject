package com.hotel.booking.scheduler;

import com.hotel.booking.service.BookingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

/**
 * Scheduled Task (Cron Job) cho việc tự động hủy đơn đặt phòng hết hạn (SCRUM-93).
 * Quét các đơn PENDING có thời gian tạo vượt quá 15 phút.
 * Tự động đổi trạng thái đơn thành CANCELLED và nhả phòng về trạng thái AVAILABLE.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class BookingExpirationScheduler {

    private final BookingService bookingService;

    /**
     * Chạy định kỳ 1 phút/lần (vào giây 0 của mỗi phút).
     */
    @Scheduled(cron = "0 * * * * ?")
    public void scanAndCancelExpiredPendingBookings() {
        log.debug("Bắt đầu quét các đơn đặt phòng PENDING quá hạn 15 phút...");
        try {
            int cancelledCount = bookingService.cancelExpiredPendingBookings(15);
            if (cancelledCount > 0) {
                log.info("Scheduler: Đã tự động hủy {} đơn PENDING quá hạn và nhả phòng về AVAILABLE.", cancelledCount);
            }
        } catch (Exception e) {
            log.error("Lỗi khi quét và hủy đơn đặt phòng quá hạn: {}", e.getMessage(), e);
        }
    }
}
