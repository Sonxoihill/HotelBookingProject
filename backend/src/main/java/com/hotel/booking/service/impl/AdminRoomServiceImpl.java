package com.hotel.booking.service.impl;

import com.hotel.booking.common.exception.AppException;
import com.hotel.booking.common.exception.ErrorCode;
import com.hotel.booking.dto.admin.AdminRoomRequest;
import com.hotel.booking.dto.admin.AdminRoomResponse;
import com.hotel.booking.entity.Room;
import com.hotel.booking.entity.RoomCategory;
import com.hotel.booking.enums.BookingStatus;
import com.hotel.booking.enums.RoomStatus;
import com.hotel.booking.repository.BookingRepository;
import com.hotel.booking.repository.ReviewRepository;
import com.hotel.booking.repository.RoomCategoryRepository;
import com.hotel.booking.repository.RoomRepository;
import com.hotel.booking.service.AdminRoomService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminRoomServiceImpl implements AdminRoomService {

    private final RoomRepository roomRepository;
    private final RoomCategoryRepository roomCategoryRepository;
    private final BookingRepository bookingRepository;
    private final ReviewRepository reviewRepository;

    private static final Set<RoomStatus> ALLOWED_ADMIN_STATUSES = Set.of(
            RoomStatus.AVAILABLE,
            RoomStatus.DIRTY,
            RoomStatus.MAINTENANCE
    );

    @Override
    @Transactional(readOnly = true)
    public List<AdminRoomResponse> getAllRooms() {
        return roomRepository.findAll(Sort.by(Sort.Order.asc("floor"), Sort.Order.asc("roomNumber")))
                .stream()
                .map(AdminRoomResponse::from)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public AdminRoomResponse getRoomById(Long id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND, "Không tìm thấy phòng với ID: " + id));
        return AdminRoomResponse.from(room);
    }

    @Override
    @Transactional
    public AdminRoomResponse createRoom(AdminRoomRequest request) {
        String trimmedRoomNumber = request.getRoomNumber().trim();

        // 1. Kiểm tra số phòng không được trùng
        if (roomRepository.existsByRoomNumber(trimmedRoomNumber)) {
            throw new AppException(ErrorCode.CONFLICT, "Số phòng đã tồn tại");
        }

        // 2. Kiểm tra loại phòng phải tồn tại
        RoomCategory category = roomCategoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy loại phòng với ID: " + request.getCategoryId()));

        // 3. Admin chỉ được đặt AVAILABLE, DIRTY, MAINTENANCE
        RoomStatus targetStatus = request.getStatus() != null ? request.getStatus() : RoomStatus.AVAILABLE;
        validateAdminRoomStatus(targetStatus);

        Room room = Room.builder()
                .roomNumber(trimmedRoomNumber)
                .floor(request.getFloor())
                .category(category)
                .status(targetStatus)
                .build();

        Room savedRoom = roomRepository.save(room);
        log.info("Admin tạo mới phòng: {} (Tầng {}, Loại: {})", trimmedRoomNumber, request.getFloor(), category.getName());
        return AdminRoomResponse.from(savedRoom);
    }

    @Override
    @Transactional
    public AdminRoomResponse updateRoom(Long id, AdminRoomRequest request) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND, "Không tìm thấy phòng với ID: " + id));

        String trimmedRoomNumber = request.getRoomNumber().trim();

        // 1. Kiểm tra trùng số phòng với phòng khác
        if (roomRepository.existsByRoomNumberAndIdNot(trimmedRoomNumber, id)) {
            throw new AppException(ErrorCode.CONFLICT, "Số phòng đã tồn tại");
        }

        // 2. Kiểm tra loại phòng phải tồn tại
        RoomCategory category = roomCategoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy loại phòng với ID: " + request.getCategoryId()));

        // 3. Ràng buộc trạng thái phòng khi sửa
        RoomStatus newStatus = request.getStatus() != null ? request.getStatus() : room.getStatus();

        // Không cho đổi trạng thái của phòng đang OCCUPIED
        if (room.getStatus() == RoomStatus.OCCUPIED && newStatus != RoomStatus.OCCUPIED) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Không thể thay đổi trạng thái của phòng đang có khách lưu trú (OCCUPIED)");
        }

        // Nếu thay đổi trạng thái sang trạng thái khác thì phải nằm trong ALLOWED_ADMIN_STATUSES
        if (room.getStatus() != RoomStatus.OCCUPIED || newStatus != RoomStatus.OCCUPIED) {
            validateAdminRoomStatus(newStatus);
        }

        room.setRoomNumber(trimmedRoomNumber);
        room.setFloor(request.getFloor());
        room.setCategory(category);
        room.setStatus(newStatus);

        Room updatedRoom = roomRepository.save(room);
        log.info("Admin cập nhật phòng #{} (Số phòng: {}, Trạng thái: {})", id, trimmedRoomNumber, newStatus);
        return AdminRoomResponse.from(updatedRoom);
    }

    @Override
    @Transactional
    public void deleteRoom(Long id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ROOM_NOT_FOUND, "Không tìm thấy phòng với ID: " + id));

        // Thứ tự kiểm tra 1: Phòng đang OCCUPIED/RESERVED hoặc có đơn PENDING/CONFIRMED/CHECKED_IN
        boolean isOccupiedOrReserved = room.getStatus() == RoomStatus.OCCUPIED || room.getStatus() == RoomStatus.RESERVED;
        boolean hasActiveBookings = bookingRepository.existsByRoomIdAndStatusIn(
                id,
                List.of(BookingStatus.PENDING, BookingStatus.CONFIRMED, BookingStatus.CHECKED_IN)
        );

        if (isOccupiedOrReserved || hasActiveBookings) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Không thể xóa phòng đang có khách lưu trú hoặc có lịch đặt trước");
        }

        // Thứ tự kiểm tra 2: Phòng đã có lịch sử đặt (bất kỳ booking nào) hoặc có review
        boolean hasBookingHistory = bookingRepository.existsByRoomId(id);
        boolean hasReviews = reviewRepository.existsByRoomId(id);

        if (hasBookingHistory || hasReviews) {
            throw new AppException(ErrorCode.BAD_REQUEST,
                    "Phòng đã phát sinh lịch sử đặt phòng nên không thể xóa. Vui lòng chuyển phòng sang trạng thái Bảo trì (MAINTENANCE)");
        }

        // Thứ tự kiểm tra 3: Không vướng các trường hợp trên -> Xóa cứng
        log.info("Admin xóa cứng phòng #{} (P.{})", id, room.getRoomNumber());
        roomRepository.delete(room);
    }

    private void validateAdminRoomStatus(RoomStatus status) {
        if (!ALLOWED_ADMIN_STATUSES.contains(status)) {
            throw new AppException(ErrorCode.BAD_REQUEST,
                    "Admin chỉ được phép thiết lập trạng thái phòng là AVAILABLE, DIRTY hoặc MAINTENANCE");
        }
    }
}
