package com.hotel.booking.service.impl;

import com.hotel.booking.entity.Room;
import com.hotel.booking.repository.RoomRepository;
import com.hotel.booking.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RoomServiceImpl implements RoomService {

    private final RoomRepository roomRepository;
    private final com.hotel.booking.repository.ReviewRepository reviewRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<Room> getPublicRooms(Pageable pageable) {
        return roomRepository.findAll(pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Room> getAllRooms() {
        return roomRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public Room getRoomById(Long id) {
        return roomRepository.findById(id)
                .orElseThrow(() -> new com.hotel.booking.common.exception.ResourceNotFoundException("Room", "id", id));
    }

    @Override
    @Transactional(readOnly = true)
    public com.hotel.booking.dto.response.RoomDetailResponse getRoomDetail(Long id) {
        Room room = roomRepository.findById(id)
                .orElseThrow(() -> new com.hotel.booking.common.exception.ResourceNotFoundException("Room", "id", id));

        // Luồng sự kiện thay thế 2a: Phòng đã ngừng phục vụ (MAINTENANCE)
        if (room.getStatus() == com.hotel.booking.enums.RoomStatus.MAINTENANCE) {
            throw new com.hotel.booking.common.exception.BadRequestException("Phòng đã ngừng phục vụ, vui lòng quay lại danh sách phòng.");
        }

        java.util.List<com.hotel.booking.entity.Review> reviews = reviewRepository.findByRoomIdWithUserOrderByCreatedAtDesc(id);

        return com.hotel.booking.dto.response.RoomDetailResponse.fromEntity(room, reviews);
    }


    @Override
    @Transactional(readOnly = true)
    public List<com.hotel.booking.dto.response.RoomSearchResponse> searchRooms(com.hotel.booking.dto.request.RoomSearchRequest request) {
        java.time.LocalDate checkIn = request.getCheckIn();
        java.time.LocalDate checkOut = request.getCheckOut();
        java.time.LocalDate today = java.time.LocalDate.now();

        // 1. Validation ngày nhận / trả phòng
        if ((checkIn != null && checkOut == null) || (checkIn == null && checkOut != null)) {
            throw new com.hotel.booking.common.exception.BadRequestException(
                    "Vui lòng cung cấp đầy đủ cả ngày nhận phòng (checkIn) và ngày trả phòng (checkOut)!");
        }

        if (checkIn != null) {
            if (checkIn.isBefore(today)) {
                throw new com.hotel.booking.common.exception.BadRequestException(
                        "Ngày nhận phòng (checkIn) không được là ngày trong quá khứ so với thời điểm hiện tại!");
            }
            if (checkOut.isBefore(today)) {
                throw new com.hotel.booking.common.exception.BadRequestException(
                        "Ngày trả phòng (checkOut) không được là ngày trong quá khứ so với thời điểm hiện tại!");
            }
            if (checkOut.isBefore(checkIn) || checkOut.isEqual(checkIn)) {
                throw new com.hotel.booking.common.exception.BadRequestException(
                        "Ngày trả phòng (checkOut) phải sau ngày nhận phòng (checkIn)!");
            }
        }

        // 2. Validation khoảng giá và sức chứa
        if (request.getMinPrice() != null && request.getMinPrice().compareTo(java.math.BigDecimal.ZERO) < 0) {
            throw new com.hotel.booking.common.exception.BadRequestException("Giá tối thiểu không được nhỏ hơn 0!");
        }
        if (request.getMaxPrice() != null && request.getMaxPrice().compareTo(java.math.BigDecimal.ZERO) < 0) {
            throw new com.hotel.booking.common.exception.BadRequestException("Giá tối đa không được nhỏ hơn 0!");
        }
        if (request.getMinPrice() != null && request.getMaxPrice() != null
                && request.getMinPrice().compareTo(request.getMaxPrice()) > 0) {
            throw new com.hotel.booking.common.exception.BadRequestException("Giá tối thiểu không được lớn hơn giá tối đa!");
        }
        if (request.getCapacity() != null && request.getCapacity() <= 0) {
            throw new com.hotel.booking.common.exception.BadRequestException("Sức chứa phòng phải lớn hơn 0!");
        }

        // 3. Truy vấn danh sách phòng trống theo tiêu chí
        List<Room> rooms = roomRepository.searchRooms(
                checkIn,
                checkOut,
                request.getMinPrice(),
                request.getMaxPrice(),
                request.getCategoryId(),
                request.getCapacity()
        );

        return rooms.stream()
                .map(com.hotel.booking.dto.response.RoomSearchResponse::fromEntity)
                .collect(java.util.stream.Collectors.toList());
    }
}

