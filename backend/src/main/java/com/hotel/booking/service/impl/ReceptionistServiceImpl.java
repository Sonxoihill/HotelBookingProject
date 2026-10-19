package com.hotel.booking.service.impl;

import com.hotel.booking.common.exception.AppException;
import com.hotel.booking.common.exception.ErrorCode;
import com.hotel.booking.common.response.PageResponse;
import com.hotel.booking.dto.receptionist.*;
import com.hotel.booking.entity.Booking;
import com.hotel.booking.entity.BookingService;
import com.hotel.booking.entity.Room;
import com.hotel.booking.entity.RoomCategory;
import com.hotel.booking.entity.User;
import com.hotel.booking.enums.BookingStatus;
import com.hotel.booking.enums.RoomStatus;
import com.hotel.booking.enums.ServiceStatus;
import com.hotel.booking.repository.BookingRepository;
import com.hotel.booking.repository.BookingServiceRepository;
import com.hotel.booking.repository.RoomRepository;
import com.hotel.booking.repository.ServiceRepository;
import com.hotel.booking.service.ReceptionistService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReceptionistServiceImpl implements ReceptionistService {

    private final RoomRepository roomRepository;
    private final BookingRepository bookingRepository;
    private final BookingServiceRepository bookingServiceRepository;
    private final ServiceRepository serviceRepository;

    @Override
    @Transactional(readOnly = true)
    public List<RoomGridResponse> getRoomGrid(Integer floor, RoomStatus status) {
        log.debug("Lấy sơ đồ phòng (Room Grid) với bộ lọc: floor={}, status={}", floor, status);

        List<RoomGridResponse> rawList = roomRepository.findRoomGrid(floor, status);

        // Khử trùng lặp phòng nếu phòng có nhiều đơn đặt (ưu tiên đơn đang CHECKED_IN)
        Map<Long, RoomGridResponse> roomMap = new LinkedHashMap<>();
        for (RoomGridResponse item : rawList) {
            if (!roomMap.containsKey(item.getId())) {
                roomMap.put(item.getId(), item);
            } else {
                RoomGridResponse existing = roomMap.get(item.getId());
                // Ưu tiên đơn CHECKED_IN hơn đơn CONFIRMED
                if (existing.getBookingStatus() != BookingStatus.CHECKED_IN && item.getBookingStatus() == BookingStatus.CHECKED_IN) {
                    roomMap.put(item.getId(), item);
                }
            }
        }

        return new ArrayList<>(roomMap.values());
    }

    @Override
    @Transactional
    public Room cleanRoom(Long roomId) {
        log.info("Lễ tân yêu cầu xác nhận dọn dẹp phòng #{}", roomId);

        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND, "Không tìm thấy phòng với ID: " + roomId));

        // Kiểm tra điều kiện bắt buộc: Phòng phải đang ở trạng thái DIRTY
        if (room.getStatus() != RoomStatus.DIRTY) {
            log.warn("Từ chối dọn phòng #{}: Trạng thái hiện tại là '{}' (yêu cầu DIRTY)", roomId, room.getStatus());
            throw new AppException(ErrorCode.BAD_REQUEST, "Phòng không ở trạng thái Cần dọn");
        }

        room.setStatus(RoomStatus.AVAILABLE);
        Room savedRoom = roomRepository.save(room);

        log.info("Phòng #{} (P.{}) đã được chuyển sang trạng thái AVAILABLE thành công", savedRoom.getId(), savedRoom.getRoomNumber());
        return savedRoom;
    }

    @Override
    @Transactional
    public BookingServicesSummaryResponse addServicesToBooking(Long bookingId, List<AddServiceItemRequest> items) {
        log.info("Ghi nhận dịch vụ phát sinh cho đơn đặt phòng #{}", bookingId);

        // Validation 1: Kiểm tra danh sách dịch vụ không rỗng
        if (items == null || items.isEmpty()) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Vui lòng chọn dịch vụ và số lượng hợp lệ");
        }

        // Validation 2: Kiểm tra từng mục dịch vụ (serviceId không null, quantity > 0)
        for (AddServiceItemRequest item : items) {
            if (item == null || item.getServiceId() == null || item.getQuantity() == null || item.getQuantity() <= 0) {
                throw new AppException(ErrorCode.BAD_REQUEST, "Vui lòng chọn dịch vụ và số lượng hợp lệ");
            }
        }

        // Validation 3: Đơn đặt phòng phải tồn tại và đang ở trạng thái CHECKED_IN
        Booking booking = bookingRepository.findByIdWithDetails(bookingId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND, "Không tìm thấy đơn đặt phòng #" + bookingId));

        if (booking.getStatus() != BookingStatus.CHECKED_IN) {
            log.warn("Từ chối thêm dịch vụ: Đơn #{} có trạng thái '{}' (yêu cầu CHECKED_IN)", bookingId, booking.getStatus());
            throw new AppException(ErrorCode.BAD_REQUEST, "Chỉ được thêm dịch vụ cho đơn đặt phòng đang lưu trú (CHECKED_IN)");
        }

        // Xử lý lưu các dịch vụ và tính tổng tiền phát sinh
        BigDecimal totalAddedAmount = BigDecimal.ZERO;
        for (AddServiceItemRequest item : items) {
            com.hotel.booking.entity.Service service = serviceRepository.findById(item.getServiceId())
                    .orElseThrow(() -> new AppException(ErrorCode.BAD_REQUEST, "Không tìm thấy dịch vụ #" + item.getServiceId()));

            if (service.getStatus() != ServiceStatus.ACTIVE) {
                throw new AppException(ErrorCode.BAD_REQUEST, "Dịch vụ " + service.getName() + " hiện không hoạt động");
            }

            BigDecimal lineTotal = service.getPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
            totalAddedAmount = totalAddedAmount.add(lineTotal);

            BookingService bookingService = BookingService.builder()
                    .booking(booking)
                    .service(service)
                    .quantity(item.getQuantity())
                    .price(service.getPrice())
                    .build();
            bookingServiceRepository.save(bookingService);
        }

        // Cập nhật tổng tiền đơn đặt phòng (totalAmount)
        BigDecimal currentTotal = booking.getTotalAmount() != null ? booking.getTotalAmount() : BigDecimal.ZERO;
        booking.setTotalAmount(currentTotal.add(totalAddedAmount));
        Booking updatedBooking = bookingRepository.save(booking);

        log.info("Đã nạp thành công {} VND dịch vụ vào đơn đặt phòng #{}. Tổng tiền mới: {}",
                totalAddedAmount, bookingId, updatedBooking.getTotalAmount());

        return buildBookingServicesSummary(updatedBooking);
    }

    @Override
    @Transactional(readOnly = true)
    public BookingServicesSummaryResponse getBookingServices(Long bookingId) {
        Booking booking = bookingRepository.findByIdWithDetails(bookingId)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND, "Không tìm thấy đơn đặt phòng #" + bookingId));

        return buildBookingServicesSummary(booking);
    }

    private BookingServicesSummaryResponse buildBookingServicesSummary(Booking booking) {
        List<BookingService> bookingServices = bookingServiceRepository.findByBookingIdWithService(booking.getId());

        BigDecimal totalServiceAmount = BigDecimal.ZERO;
        List<BookingServiceDetailResponse> serviceDetails = new ArrayList<>();

        for (BookingService bs : bookingServices) {
            BigDecimal unitPrice = bs.getPrice() != null ? bs.getPrice() : BigDecimal.ZERO;
            int quantity = bs.getQuantity() != null ? bs.getQuantity() : 0;
            BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(quantity));
            totalServiceAmount = totalServiceAmount.add(lineTotal);

            serviceDetails.add(BookingServiceDetailResponse.builder()
                    .id(bs.getId())
                    .serviceId(bs.getService() != null ? bs.getService().getId() : null)
                    .serviceName(bs.getService() != null ? bs.getService().getName() : null)
                    .unit(bs.getService() != null ? bs.getService().getUnit() : null)
                    .unitPrice(unitPrice)
                    .quantity(quantity)
                    .totalPrice(lineTotal)
                    .createdAt(bs.getCreatedAt())
                    .build());
        }

        BigDecimal totalAmount = booking.getTotalAmount() != null ? booking.getTotalAmount() : BigDecimal.ZERO;
        BigDecimal paidAmount = booking.getPaidAmount() != null ? booking.getPaidAmount() : BigDecimal.ZERO;
        BigDecimal remainingAmount = totalAmount.subtract(paidAmount);
        BigDecimal roomAmount = totalAmount.subtract(totalServiceAmount);

        return BookingServicesSummaryResponse.builder()
                .bookingId(booking.getId())
                .roomId(booking.getRoom() != null ? booking.getRoom().getId() : null)
                .roomNumber(booking.getRoom() != null ? booking.getRoom().getRoomNumber() : null)
                .roomCode(booking.getRoom() != null ? booking.getRoom().getRoomNumber() : null)
                .roomType(booking.getRoom() != null && booking.getRoom().getCategory() != null ? booking.getRoom().getCategory().getName() : null)
                .categoryName(booking.getRoom() != null && booking.getRoom().getCategory() != null ? booking.getRoom().getCategory().getName() : null)
                .userId(booking.getUser() != null ? booking.getUser().getId() : null)
                .guestName(booking.getUser() != null ? booking.getUser().getFullName() : null)
                .guestPhone(booking.getUser() != null ? booking.getUser().getPhone() : null)
                .bookingStatus(booking.getStatus())
                .checkIn(booking.getCheckIn())
                .checkOut(booking.getCheckOut())
                .actualCheckIn(booking.getActualCheckIn())
                .notes(booking.getNotes())
                .roomAmount(roomAmount.compareTo(BigDecimal.ZERO) >= 0 ? roomAmount : BigDecimal.ZERO)
                .totalServiceAmount(totalServiceAmount)
                .totalAmount(totalAmount)
                .paidAmount(paidAmount)
                .remainingAmount(remainingAmount.compareTo(BigDecimal.ZERO) >= 0 ? remainingAmount : BigDecimal.ZERO)
                .services(serviceDetails)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ReceptionistBookingResponse> getBookings(String keyword, BookingStatus status, Pageable pageable) {
        log.debug("Lấy danh sách đơn đặt phòng Lễ tân: keyword={}, status={}, pageable={}", keyword, status, pageable);

        String cleanedKeyword = (keyword != null && !keyword.trim().isEmpty()) ? keyword.trim() : null;
        Page<Booking> page = bookingRepository.findReceptionistBookings(cleanedKeyword, status, pageable);

        List<ReceptionistBookingResponse> responses = page.getContent().stream()
                .map(this::toReceptionistBookingResponse)
                .toList();

        return PageResponse.<ReceptionistBookingResponse>builder()
                .items(responses)
                .page(page.getNumber() + 1)
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .isLast(page.isLast())
                .build();
    }

    @Override
    @Transactional
    public ReceptionistBookingResponse approveBooking(Long id) {
        log.info("Lễ tân duyệt đơn đặt phòng #{}", id);

        Booking booking = bookingRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND, "Không tìm thấy đơn đặt phòng #" + id));

        if (booking.getStatus() != BookingStatus.PENDING) {
            log.warn("Từ chối duyệt đơn #{}: Trạng thái hiện tại là '{}' (yêu cầu PENDING)", id, booking.getStatus());
            throw new AppException(ErrorCode.BAD_REQUEST, "Chỉ được duyệt đơn đặt phòng đang ở trạng thái Chờ xác nhận (PENDING)");
        }

        booking.setStatus(BookingStatus.CONFIRMED);
        Room room = booking.getRoom();
        if (room != null) {
            room.setStatus(RoomStatus.RESERVED);
            roomRepository.save(room);
            log.info("Phòng #{} (P.{}) đã đổi trạng thái sang RESERVED", room.getId(), room.getRoomNumber());
        }

        Booking saved = bookingRepository.save(booking);
        log.info("Duyệt đơn đặt phòng #{} thành công -> CONFIRMED", id);
        return toReceptionistBookingResponse(saved);
    }

    @Override
    @Transactional
    public ReceptionistBookingResponse cancelBooking(Long id, String cancelReason) {
        log.info("Lễ tân hủy đơn đặt phòng #{}, lý do: {}", id, cancelReason);

        if (cancelReason == null || cancelReason.trim().isEmpty()) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Lý do hủy phòng là bắt buộc");
        }

        Booking booking = bookingRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND, "Không tìm thấy đơn đặt phòng #" + id));

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Đơn đặt phòng này đã bị hủy trước đó");
        }
        if (booking.getStatus() == BookingStatus.CHECKED_OUT) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Không thể hủy đơn đặt phòng đã hoàn tất trả phòng (CHECKED_OUT)");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancelReason(cancelReason.trim());

        Room room = booking.getRoom();
        if (room != null) {
            room.setStatus(RoomStatus.AVAILABLE);
            roomRepository.save(room);
            log.info("Phòng #{} (P.{}) đã giải phóng về AVAILABLE", room.getId(), room.getRoomNumber());
        }

        Booking saved = bookingRepository.save(booking);
        log.info("Hủy đơn đặt phòng #{} thành công -> CANCELLED", id);
        return toReceptionistBookingResponse(saved);
    }

    @Override
    @Transactional
    public ReceptionistBookingResponse checkInBooking(Long id) {
        log.info("Lễ tân thực hiện Check-in cho đơn đặt phòng #{}", id);

        Booking booking = bookingRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND, "Không tìm thấy đơn đặt phòng #" + id));

        if (booking.getStatus() != BookingStatus.CONFIRMED) {
            log.warn("Từ chối check-in đơn #{}: Trạng thái hiện tại là '{}' (yêu cầu CONFIRMED)", id, booking.getStatus());
            throw new AppException(ErrorCode.BAD_REQUEST, "Chỉ được Check-in cho đơn đặt phòng đã duyệt (CONFIRMED)");
        }

        booking.setStatus(BookingStatus.CHECKED_IN);
        booking.setActualCheckIn(LocalDateTime.now());

        Room room = booking.getRoom();
        if (room != null) {
            room.setStatus(RoomStatus.OCCUPIED);
            roomRepository.save(room);
            log.info("Phòng #{} (P.{}) đã đổi trạng thái sang OCCUPIED", room.getId(), room.getRoomNumber());
        }

        Booking saved = bookingRepository.save(booking);
        log.info("Check-in đơn đặt phòng #{} thành công -> CHECKED_IN", id);
        return toReceptionistBookingResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public CheckoutSummaryResponse getCheckoutSummary(Long id) {
        log.info("Lấy thông tin tóm tắt thanh toán Check-out cho đơn #{}", id);

        Booking booking = bookingRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND, "Không tìm thấy đơn đặt phòng #" + id));

        List<BookingService> bookingServices = bookingServiceRepository.findByBookingIdWithService(id);

        BigDecimal totalServiceAmount = BigDecimal.ZERO;
        List<BookingServiceDetailResponse> serviceDetails = new ArrayList<>();

        for (BookingService bs : bookingServices) {
            BigDecimal unitPrice = bs.getPrice() != null ? bs.getPrice() : BigDecimal.ZERO;
            int qty = bs.getQuantity() != null ? bs.getQuantity() : 0;
            BigDecimal lineTotal = unitPrice.multiply(BigDecimal.valueOf(qty));
            totalServiceAmount = totalServiceAmount.add(lineTotal);

            serviceDetails.add(BookingServiceDetailResponse.builder()
                    .id(bs.getId())
                    .serviceId(bs.getService() != null ? bs.getService().getId() : null)
                    .serviceName(bs.getService() != null ? bs.getService().getName() : null)
                    .unit(bs.getService() != null ? bs.getService().getUnit() : null)
                    .unitPrice(unitPrice)
                    .quantity(qty)
                    .totalPrice(lineTotal)
                    .createdAt(bs.getCreatedAt())
                    .build());
        }

        BigDecimal totalAmount = booking.getTotalAmount() != null ? booking.getTotalAmount() : BigDecimal.ZERO;
        BigDecimal paidAmount = booking.getPaidAmount() != null ? booking.getPaidAmount() : BigDecimal.ZERO;
        BigDecimal roomAmount = totalAmount.subtract(totalServiceAmount);
        BigDecimal remainingAmount = totalAmount.subtract(paidAmount);

        long nights = 1;
        if (booking.getCheckIn() != null && booking.getCheckOut() != null) {
            nights = ChronoUnit.DAYS.between(booking.getCheckIn(), booking.getCheckOut());
            if (nights <= 0) nights = 1;
        }

        Room room = booking.getRoom();
        RoomCategory category = room != null ? room.getCategory() : null;
        BigDecimal pricePerNight = category != null && category.getBasePrice() != null ? category.getBasePrice() : BigDecimal.ZERO;

        return CheckoutSummaryResponse.builder()
                .bookingId(booking.getId())
                .bookingCode("#LET-" + booking.getId())
                .roomId(room != null ? room.getId() : null)
                .roomNumber(room != null ? room.getRoomNumber() : null)
                .roomCategory(category != null ? category.getName() : null)
                .userId(booking.getUser() != null ? booking.getUser().getId() : null)
                .guestName(booking.getUser() != null ? booking.getUser().getFullName() : null)
                .guestPhone(booking.getUser() != null ? booking.getUser().getPhone() : null)
                .guestEmail(booking.getUser() != null ? booking.getUser().getEmail() : null)
                .bookingStatus(booking.getStatus())
                .checkIn(booking.getCheckIn())
                .checkOut(booking.getCheckOut())
                .actualCheckIn(booking.getActualCheckIn())
                .checkoutTime(LocalDateTime.now())
                .numberOfNights(nights)
                .roomPricePerNight(pricePerNight)
                .roomAmount(roomAmount.compareTo(BigDecimal.ZERO) >= 0 ? roomAmount : BigDecimal.ZERO)
                .totalServiceAmount(totalServiceAmount)
                .totalAmount(totalAmount)
                .paidAmount(paidAmount)
                .remainingAmount(remainingAmount.compareTo(BigDecimal.ZERO) >= 0 ? remainingAmount : BigDecimal.ZERO)
                .services(serviceDetails)
                .build();
    }

    @Override
    @Transactional
    public ReceptionistBookingResponse checkOutBooking(Long id, CheckOutRequest request) {
        log.info("Lễ tân thực hiện Check-out cho đơn đặt phòng #{}", id);

        Booking booking = bookingRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new AppException(ErrorCode.BOOKING_NOT_FOUND, "Không tìm thấy đơn đặt phòng #" + id));

        if (booking.getStatus() != BookingStatus.CHECKED_IN) {
            log.warn("Từ chối check-out đơn #{}: Trạng thái hiện tại là '{}' (yêu cầu CHECKED_IN)", id, booking.getStatus());
            throw new AppException(ErrorCode.BAD_REQUEST, "Chỉ được Check-out cho đơn đặt phòng đang lưu trú (CHECKED_IN)");
        }

        // Cập nhật paidAmount = totalAmount (hoặc totalPrice)
        booking.setPaidAmount(booking.getTotalAmount());
        booking.setActualCheckOut(LocalDateTime.now());
        booking.setStatus(BookingStatus.CHECKED_OUT);

        if (request != null && request.getNotes() != null && !request.getNotes().trim().isEmpty()) {
            String currentNotes = booking.getNotes() != null ? booking.getNotes() + " | " : "";
            booking.setNotes(currentNotes + "Check-out [" + (request.getPaymentMethod() != null ? request.getPaymentMethod() : "CASH") + "]: " + request.getNotes().trim());
        }

        // Đổi trạng thái phòng sang RoomStatus.DIRTY (Cần dọn)
        Room room = booking.getRoom();
        if (room != null) {
            room.setStatus(RoomStatus.DIRTY);
            roomRepository.save(room);
            log.info("Phòng #{} (P.{}) đã đổi trạng thái sang DIRTY (Cần dọn)", room.getId(), room.getRoomNumber());
        }

        Booking saved = bookingRepository.save(booking);
        log.info("Check-out đơn đặt phòng #{} thành công -> CHECKED_OUT", id);
        return toReceptionistBookingResponse(saved);
    }

    private ReceptionistBookingResponse toReceptionistBookingResponse(Booking booking) {
        if (booking == null) return null;

        Room room = booking.getRoom();
        User user = booking.getUser();
        RoomCategory category = room != null ? room.getCategory() : null;

        BigDecimal total = booking.getTotalAmount() != null ? booking.getTotalAmount() : BigDecimal.ZERO;
        BigDecimal paid = booking.getPaidAmount() != null ? booking.getPaidAmount() : BigDecimal.ZERO;
        BigDecimal remaining = total.subtract(paid);

        long nights = 1;
        if (booking.getCheckIn() != null && booking.getCheckOut() != null) {
            nights = ChronoUnit.DAYS.between(booking.getCheckIn(), booking.getCheckOut());
            if (nights <= 0) nights = 1;
        }

        String statusLabel = switch (booking.getStatus()) {
            case PENDING -> "Chờ duyệt";
            case CONFIRMED -> "Đã duyệt / Giữ phòng";
            case CHECKED_IN -> "Đang lưu trú";
            case CHECKED_OUT -> "Đã trả phòng";
            case CANCELLED -> "Đã hủy";
            default -> booking.getStatus().name();
        };

        return ReceptionistBookingResponse.builder()
                .id(booking.getId())
                .code("#LET-" + booking.getId())
                .userId(user != null ? user.getId() : null)
                .guestName(user != null ? user.getFullName() : null)
                .guestPhone(user != null ? user.getPhone() : null)
                .guestEmail(user != null ? user.getEmail() : null)
                .guestTier(user != null && user.getRole() != null ? user.getRole().name() : "GUEST")
                .roomId(room != null ? room.getId() : null)
                .roomNumber(room != null ? room.getRoomNumber() : null)
                .roomCode(room != null ? room.getRoomNumber() : null)
                .roomCategory(category != null ? category.getName() : null)
                .floor(room != null ? room.getFloor() : null)
                .roomStatus(room != null ? room.getStatus() : null)
                .checkIn(booking.getCheckIn())
                .checkOut(booking.getCheckOut())
                .numberOfNights(nights)
                .actualCheckIn(booking.getActualCheckIn())
                .actualCheckOut(booking.getActualCheckOut())
                .status(booking.getStatus())
                .statusLabel(statusLabel)
                .totalAmount(total)
                .paidAmount(paid)
                .remainingAmount(remaining.compareTo(BigDecimal.ZERO) >= 0 ? remaining : BigDecimal.ZERO)
                .cancelReason(booking.getCancelReason())
                .notes(booking.getNotes())
                .createdAt(booking.getCreatedAt())
                .build();
    }
}
