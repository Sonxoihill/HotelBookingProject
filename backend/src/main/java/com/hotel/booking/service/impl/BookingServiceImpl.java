package com.hotel.booking.service.impl;

import com.hotel.booking.common.exception.BadRequestException;
import com.hotel.booking.common.exception.ResourceNotFoundException;
import com.hotel.booking.dto.booking.CancelBookingRequest;
import com.hotel.booking.dto.booking.CreateBookingRequest;
import com.hotel.booking.entity.Booking;
import com.hotel.booking.entity.Room;
import com.hotel.booking.entity.User;
import com.hotel.booking.enums.BookingStatus;
import com.hotel.booking.repository.BookingRepository;
import com.hotel.booking.repository.RoomRepository;
import com.hotel.booking.repository.UserRepository;
import com.hotel.booking.service.BookingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final RoomRepository roomRepository;

    @Override
    @Transactional(readOnly = true)
    public List<Booking> getMyBookings(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", email));
        return bookingRepository.findMyBookings(user.getId());
    }

    @Override
    @Transactional
    public Booking createBooking(String email, CreateBookingRequest request) {
        final String targetEmail = (email != null && !email.trim().isEmpty())
                ? email.trim()
                : (request.getEmail() != null && !request.getEmail().trim().isEmpty() ? request.getEmail().trim() : "guest@example.com");

        User user = userRepository.findByEmail(targetEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User", "email", targetEmail));

        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new ResourceNotFoundException("Room", "id", request.getRoomId()));

        if (request.getCheckOut().isBefore(request.getCheckIn()) || request.getCheckOut().isEqual(request.getCheckIn())) {
            throw new BadRequestException("Ngày Check-out phải sau ngày Check-in!");
        }

        long nights = ChronoUnit.DAYS.between(request.getCheckIn(), request.getCheckOut());
        if (nights <= 0) nights = 1;

        BigDecimal totalAmount = request.getTotalAmount();
        if (totalAmount == null || totalAmount.compareTo(BigDecimal.ZERO) <= 0) {
            BigDecimal basePrice = (room.getCategory() != null && room.getCategory().getBasePrice() != null)
                    ? room.getCategory().getBasePrice()
                    : BigDecimal.valueOf(500000);
            totalAmount = basePrice.multiply(BigDecimal.valueOf(nights)).multiply(BigDecimal.valueOf(1.1)); // 10% VAT
        }

        BookingStatus initialStatus = "RECEPTION".equalsIgnoreCase(request.getPaymentMethod())
                ? BookingStatus.PENDING
                : BookingStatus.CONFIRMED;

        Booking booking = Booking.builder()
                .user(user)
                .room(room)
                .checkIn(request.getCheckIn())
                .checkOut(request.getCheckOut())
                .totalAmount(totalAmount)
                .status(initialStatus)
                .build();

        Booking saved = bookingRepository.save(booking);
        log.info("Khách hàng {} đã tạo đơn đặt phòng #{} thành công cho phòng {}", user.getEmail(), saved.getId(), room.getRoomNumber());
        return saved;
    }

    @Override
    @Transactional
    public Booking cancelBooking(String email, Long bookingId, CancelBookingRequest request) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));

        if (email != null && !email.trim().isEmpty()) {
            if (!booking.getUser().getEmail().equalsIgnoreCase(email.trim())) {
                throw new BadRequestException("Bạn không có quyền hủy đơn đặt phòng này!");
            }
        }

        if (booking.getStatus() != BookingStatus.PENDING && booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new BadRequestException("Đơn hàng không đủ điều kiện hủy!");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        Booking saved = bookingRepository.save(booking);
        log.info("Đơn đặt phòng #{} đã được hủy thành công. Lý do: {}", bookingId, request.getReason());
        return saved;
    }
}
