package com.hotel.booking.service.impl;

import com.hotel.booking.entity.Booking;
import com.hotel.booking.entity.Room;
import com.hotel.booking.entity.User;
import com.hotel.booking.service.EmailService;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.text.NumberFormat;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;
    private final com.hotel.booking.repository.BookingRepository bookingRepository;

    @Value("${spring.mail.username}")
    private String fromEmail;

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final Locale VIETNAMESE_LOCALE = Locale.of("vi", "VN");

    @Override
    @Async
    public void sendBookingConfirmationEmail(Booking booking) {
        if (booking == null) {
            log.warn("Không thể gửi email: Đối tượng Booking bị null");
            return;
        }

        Booking targetBooking = booking;
        if (booking.getId() != null && bookingRepository != null) {
            try {
                targetBooking = bookingRepository.findByIdWithDetails(booking.getId()).orElse(booking);
            } catch (Exception e) {
                log.warn("Không thể fetch join booking, dùng booking hiện tại: {}", e.getMessage());
            }
        }

        User user = targetBooking.getUser();
        String recipientEmail = (user != null) ? user.getEmail() : null;
        if (recipientEmail == null || recipientEmail.trim().isEmpty()) {
            log.warn("Không thể gửi email cho Booking #{}: Không tìm thấy địa chỉ email khách hàng", targetBooking.getId());
            return;
        }

        log.info("Bắt đầu gửi email xác nhận đặt phòng #{} tới: {}", targetBooking.getId(), recipientEmail);

        try {
            long startTime = System.currentTimeMillis();
            MimeMessage mimeMessage = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, true, "UTF-8");

            helper.setFrom(fromEmail, "Khách sạn L'ÉTOILE");
            helper.setTo(recipientEmail);
            helper.setSubject("[L'ÉTOILE] Xác nhận đặt phòng & thanh toán thành công - Mã đơn #" + targetBooking.getId());

            String htmlContent = buildBookingEmailHtml(targetBooking);
            helper.setText(htmlContent, true);

            mailSender.send(mimeMessage);
            long duration = System.currentTimeMillis() - startTime;
            log.info("Đã gửi email xác nhận đặt phòng #{} thành công tới {} trong {}ms",
                    targetBooking.getId(), recipientEmail, duration);
        } catch (Exception ex) {
            log.error("Lỗi khi gửi email xác nhận đặt phòng #{}: {}", targetBooking.getId(), ex.getMessage(), ex);
        }
    }

    private String buildBookingEmailHtml(Booking booking) {
        User user = booking.getUser();
        Room room = booking.getRoom();

        String guestName = (user != null && user.getFullName() != null && !user.getFullName().trim().isEmpty())
                ? user.getFullName()
                : "Quý khách";

        String roomName = (room != null)
                ? "Phòng " + room.getRoomNumber() + ((room.getCategory() != null) ? " (" + room.getCategory().getName() + ")" : "")
                : "Phòng khách sạn";

        String checkInStr = (booking.getCheckIn() != null)
                ? booking.getCheckIn().format(DATE_FORMATTER)
                : "N/A";

        String checkOutStr = (booking.getCheckOut() != null)
                ? booking.getCheckOut().format(DATE_FORMATTER)
                : "N/A";

        BigDecimal totalAmount = (booking.getTotalAmount() != null)
                ? booking.getTotalAmount()
                : BigDecimal.ZERO;
        NumberFormat currencyFormatter = NumberFormat.getInstance(VIETNAMESE_LOCALE);
        String formattedAmount = currencyFormatter.format(totalAmount) + " VNĐ";

        return """
            <!DOCTYPE html>
            <html lang="vi">
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; color: #1e293b; }
                    .container { max-width: 600px; margin: 30px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.06); }
                    .header { background: linear-gradient(135deg, #1e3a8a 0%%, #0f172a 100%%); color: #ffffff; padding: 32px 24px; text-align: center; }
                    .header h1 { margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 1px; color: #f59e0b; }
                    .header p { margin: 8px 0 0; font-size: 14px; opacity: 0.9; color: #e2e8f0; }
                    .content { padding: 32px 24px; }
                    .greeting { font-size: 16px; margin-bottom: 20px; line-height: 1.6; }
                    .badge { display: inline-block; background-color: #ecfdf5; color: #065f46; font-weight: 700; font-size: 13px; padding: 6px 14px; border-radius: 20px; border: 1px solid #a7f3d0; margin-bottom: 24px; }
                    .card { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 20px; margin-bottom: 24px; }
                    .card-table { width: 100%%; border-collapse: collapse; }
                    .card-table td { padding: 10px 0; font-size: 14px; border-bottom: 1px solid #f1f5f9; }
                    .card-table td:last-child { text-align: right; font-weight: 600; color: #0f172a; }
                    .card-table tr:last-child td { border-bottom: none; }
                    .card-table .highlight { color: #d97706; font-size: 17px; font-weight: 700; }
                    .footer { background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; line-height: 1.6; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>L'ÉTOILE HOTEL</h1>
                        <p>XÁC NHẬN THANH TOÁN VÀ ĐẶT PHÒNG THÀNH CÔNG</p>
                    </div>
                    <div class="content">
                        <div class="greeting">
                            Xin chào <strong>%s</strong>,<br>
                            Cảm ơn bạn đã lựa chọn L'ÉTOILE Hotel. Giao dịch thanh toán đặt phòng qua cổng <strong>VNPay</strong> của bạn đã được ghi nhận thành công!
                        </div>
                        <div style="text-align: center;">
                            <span class="badge">✔ TRẠNG THÁI: ĐÃ XÁC NHẬN (CONFIRMED)</span>
                        </div>
                        <div class="card">
                            <table class="card-table">
                                <tr>
                                    <td>Mã đơn đặt phòng:</td>
                                    <td>#%d</td>
                                </tr>
                                <tr>
                                    <td>Tên phòng:</td>
                                    <td>%s</td>
                                </tr>
                                <tr>
                                    <td>Ngày nhận phòng (Check-in):</td>
                                    <td>%s</td>
                                </tr>
                                <tr>
                                    <td>Ngày trả phòng (Check-out):</td>
                                    <td>%s</td>
                                </tr>
                                <tr>
                                    <td>Tổng tiền đã thanh toán:</td>
                                    <td class="highlight">%s</td>
                                </tr>
                            </table>
                        </div>
                        <p style="font-size: 13px; color: #475569; line-height: 1.6;">
                            🕒 <strong>Quy định nhận phòng:</strong> Giờ nhận phòng tiêu chuẩn từ 14:00 và trả phòng trước 12:00.<br>
                            Quý khách vui lòng xuất trình email này hoặc mã đơn hàng <strong>#%d</strong> cùng giấy tờ tùy thân tại quầy lễ tân khi làm thủ tục nhận phòng.
                        </p>
                    </div>
                    <div class="footer">
                        Mọi thắc mắc xin vui lòng liên hệ bộ phận hỗ trợ khách hàng: <strong>1900 6868</strong> hoặc email: <strong>vtruong1828@gmail.com</strong>.<br>
                        &copy; 2026 L'ÉTOILE Hotel & Resort. All rights reserved.
                    </div>
                </div>
            </body>
            </html>
            """.formatted(guestName, booking.getId(), roomName, checkInStr, checkOutStr, formattedAmount, booking.getId());
    }
}
