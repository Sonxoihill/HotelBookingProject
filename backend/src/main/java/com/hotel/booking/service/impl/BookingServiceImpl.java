package com.hotel.booking.service.impl;

import com.hotel.booking.common.exception.BadRequestException;
import com.hotel.booking.common.exception.ConflictException;
import com.hotel.booking.common.exception.ResourceNotFoundException;
import com.hotel.booking.common.exception.RoomConflictException;
import com.hotel.booking.dto.booking.CancelBookingRequest;
import com.hotel.booking.dto.booking.CreateBookingRequest;
import com.hotel.booking.entity.Booking;
import com.hotel.booking.entity.Room;
import com.hotel.booking.entity.User;
import com.hotel.booking.enums.BookingStatus;
import com.hotel.booking.enums.RoomStatus;
import com.hotel.booking.repository.BookingRepository;
import com.hotel.booking.repository.RoomRepository;
import com.hotel.booking.repository.UserRepository;
import com.hotel.booking.service.BookingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
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
        final String targetEmail = (request.getEmail() != null && !request.getEmail().trim().isEmpty())
                ? request.getEmail().trim()
                : (email != null && !email.trim().isEmpty() ? email.trim() : "guest@gmail.com");

        User user = userRepository.findByEmail(targetEmail)
                .orElseGet(() -> {
                    User newGuest = User.builder()
                            .email(targetEmail)
                            .fullName(request.getFullName() != null && !request.getFullName().trim().isEmpty() ? request.getFullName().trim() : "Quý khách")
                            .phone(request.getPhone() != null ? request.getPhone().trim() : "0900000000")
                            .password("$2a$10$OxPPTB8GlxjW2rZNo5ngl.W8tJsEgNADGJgrN1PIrgZzY6fEdJJaC")
                            .role(com.hotel.booking.enums.UserRole.GUEST)
                            .status(com.hotel.booking.enums.UserStatus.ACTIVE)
                            .build();
                    return userRepository.save(newGuest);
                });

        if (request.getCheckOut().isBefore(request.getCheckIn())
                || request.getCheckOut().isEqual(request.getCheckIn())) {
            throw new BadRequestException("Ngày Check-out phải sau ngày Check-in!");
        }

        // 1. Áp dụng pessimistic lock PESSIMISTIC_WRITE để đồng bộ hóa và ngăn chặn race condition khi
        // nhiều request cùng đặt một phòng trong cùng một thời điểm
        Room room = roomRepository.findByIdWithLock(request.getRoomId())
                .orElseThrow(() -> new ResourceNotFoundException("Room", "id", request.getRoomId()));

        // 2. Kiểm tra trạng thái vật lý của phòng: từ chối nếu phòng đang bảo trì
        if (room.getStatus() == RoomStatus.MAINTENANCE) {
            throw new RoomConflictException(
                    "Phòng hiện đang bảo trì, không thể đặt phòng vào lúc này. Vui lòng chọn phòng khác!");
        }

        // 3. Kiểm tra xem phòng đã có đơn PENDING hoặc CONFIRMED trong khoảng thời gian này hay chưa
        // Chỉ từ chối khi thời gian nhận/trả phòng bị trùng lặp (overlap) với đơn đã có
        boolean hasConflict = bookingRepository.existsOverlappingBooking(room.getId(), request.getCheckIn(),
                request.getCheckOut());
        if (hasConflict) {
            throw new RoomConflictException(
                    "Phòng đã được đặt hoặc đang có người giữ chỗ trong khoảng thời gian này. Vui lòng chọn thời gian khác hoặc phòng khác!");
        }

        long nights = ChronoUnit.DAYS.between(request.getCheckIn(), request.getCheckOut());
        if (nights <= 0)
            nights = 1;

        BigDecimal totalAmount = request.getTotalAmount();
        if (totalAmount == null || totalAmount.compareTo(BigDecimal.ZERO) <= 0) {
            BigDecimal basePrice = (room.getCategory() != null && room.getCategory().getBasePrice() != null)
                    ? room.getCategory().getBasePrice()
                    : BigDecimal.valueOf(500000);
            totalAmount = basePrice.multiply(BigDecimal.valueOf(nights)).multiply(BigDecimal.valueOf(1.1)); // 10% VAT
        }

        // 4. Set trạng thái đơn hàng là PENDING để chờ thanh toán VNPay
        Booking booking = Booking.builder()
                .user(user)
                .room(room)
                .checkIn(request.getCheckIn())
                .checkOut(request.getCheckOut())
                .totalAmount(totalAmount)
                .status(BookingStatus.PENDING)
                .build();

        Booking saved = bookingRepository.save(booking);

        log.info("Khách hàng {} đã tạo đơn đặt phòng #{} thành công cho phòng {}. Trạng thái đơn: PENDING",
                user.getEmail(), saved.getId(), room.getRoomNumber());
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
        Room room = booking.getRoom();
        if (room != null && room.getStatus() == RoomStatus.ON_HOLD) {
            room.setStatus(RoomStatus.AVAILABLE);
            roomRepository.saveAndFlush(room);
        }

        Booking saved = bookingRepository.save(booking);
        log.info("Đơn đặt phòng #{} đã được hủy thành công. Phòng {} chuyển về AVAILABLE. Lý do: {}",
                bookingId, room != null ? room.getRoomNumber() : "", request.getReason());
        return saved;
    }

    @Override
    @Transactional
    public int cancelExpiredPendingBookings(int expirationMinutes) {
        LocalDateTime cutoffTime = LocalDateTime.now().minusMinutes(expirationMinutes);
        List<Booking> expiredBookings = bookingRepository.findExpiredPendingBookings(cutoffTime);

        for (Booking booking : expiredBookings) {
            booking.setStatus(BookingStatus.CANCELLED);
            Room room = booking.getRoom();
            if (room != null && room.getStatus() == RoomStatus.ON_HOLD) {
                room.setStatus(RoomStatus.AVAILABLE);
                roomRepository.saveAndFlush(room);
            }
            bookingRepository.save(booking);
            log.info("CronJob: Tự động hủy đơn đặt phòng quá hạn #{} (tạo lúc {}) của phòng {}, nhả phòng về AVAILABLE",
                    booking.getId(), booking.getCreatedAt(), room != null ? room.getRoomNumber() : "N/A");
        }

        return expiredBookings.size();
    }
}
