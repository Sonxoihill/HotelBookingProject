package com.hotel.booking.controller;

import com.hotel.booking.common.response.ApiResponse;
import com.hotel.booking.common.response.PageResponse;
import com.hotel.booking.dto.RoomPublicDto;
import com.hotel.booking.entity.Room;
import com.hotel.booking.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/rooms")
@RequiredArgsConstructor
public class RoomController {

    private final RoomRepository roomRepository;

    /**
     * API GET /api/v1/rooms/public
     * Trả về danh sách phòng kèm URL ảnh và phân trang
     */
    @GetMapping("/public")
    public ApiResponse<PageResponse<RoomPublicDto>> getPublicRooms(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "6") int size
    ) {
        // Cho phép nhận cả 0-indexed hoặc 1-indexed từ client
        int pageIndex = Math.max(0, page > 0 ? page - 1 : 0);
        Pageable pageable = PageRequest.of(pageIndex, size, Sort.by(Sort.Direction.ASC, "roomNumber"));

        Page<Room> roomPage = roomRepository.findAllWithCategory(pageable);

        Page<RoomPublicDto> dtoPage = roomPage.map(room -> RoomPublicDto.builder()
                .id(room.getId())
                .roomNumber(room.getRoomNumber())
                .floor(room.getFloor())
                .status(room.getStatus())
                .categoryId(room.getCategory() != null ? room.getCategory().getId() : null)
                .categoryName(room.getCategory() != null ? room.getCategory().getName() : "Tiêu chuẩn")
                .description(room.getCategory() != null ? room.getCategory().getDescription() : "")
                .basePrice(room.getCategory() != null ? room.getCategory().getBasePrice() : null)
                .capacity(room.getCategory() != null ? room.getCategory().getCapacity() : 2)
                .bedType(room.getCategory() != null ? room.getCategory().getBedType() : "1 Giường đôi")
                .imageUrl(room.getCategory() != null ? room.getCategory().getImageUrl() : null)
                .build());

        return ApiResponse.success("Lấy danh sách phòng công khai thành công", PageResponse.of(dtoPage));
    }
}
