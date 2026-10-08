package com.hotel.booking.service;

import com.hotel.booking.entity.Booking;
import com.hotel.booking.entity.Room;
import com.hotel.booking.entity.RoomCategory;
import com.hotel.booking.entity.User;
import com.hotel.booking.enums.BookingStatus;
import com.hotel.booking.service.impl.EmailServiceImpl;
import jakarta.mail.Session;
import jakarta.mail.internet.MimeMessage;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Properties;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmailServiceTest {

    @Mock
    private JavaMailSender mailSender;

    @Mock
    private com.hotel.booking.repository.BookingRepository bookingRepository;

    @InjectMocks
    private EmailServiceImpl emailService;

    private Booking sampleBooking;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(emailService, "fromEmail", "vtruong1828@gmail.com");

        User user = User.builder()
                .email("customer@gmail.com")
                .fullName("Nguyễn Văn Khách")
                .build();
        user.setId(10L);

        RoomCategory category = RoomCategory.builder()
                .name("Deluxe Double")
                .build();

        Room room = Room.builder()
                .roomNumber("201")
                .category(category)
                .build();
        room.setId(20L);

        sampleBooking = Booking.builder()
                .checkIn(LocalDate.of(2026, 11, 1))
                .checkOut(LocalDate.of(2026, 11, 3))
                .totalAmount(BigDecimal.valueOf(1900000))
                .status(BookingStatus.CONFIRMED)
                .user(user)
                .room(room)
                .build();
        sampleBooking.setId(100L);
    }

    @Test
    @DisplayName("SCRUM-95: Gửi email xác nhận đặt phòng thành công với template HTML")
    void testSendBookingConfirmationEmail_Success() {
        MimeMessage mimeMessage = new MimeMessage(Session.getInstance(new Properties()));
        when(mailSender.createMimeMessage()).thenReturn(mimeMessage);

        emailService.sendBookingConfirmationEmail(sampleBooking);

        verify(mailSender, times(1)).createMimeMessage();
        verify(mailSender, times(1)).send(any(MimeMessage.class));
    }

    @Test
    @DisplayName("SCRUM-95: Không gửi email khi đối tượng Booking là null")
    void testSendBookingConfirmationEmail_NullBooking() {
        emailService.sendBookingConfirmationEmail(null);

        verify(mailSender, never()).send(any(MimeMessage.class));
    }

    @Test
    @DisplayName("SCRUM-95: Không gửi email khi khách hàng không có địa chỉ email")
    void testSendBookingConfirmationEmail_NoEmail() {
        sampleBooking.getUser().setEmail(null);

        emailService.sendBookingConfirmationEmail(sampleBooking);

        verify(mailSender, never()).send(any(MimeMessage.class));
    }
}
