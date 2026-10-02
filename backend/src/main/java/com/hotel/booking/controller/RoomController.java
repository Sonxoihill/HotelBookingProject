package com.hotel.booking.controller;

import com.hotel.booking.common.response.ApiResponse;
import com.hotel.booking.entity.Room;
import com.hotel.booking.service.RoomService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/rooms")
@RequiredArgsConstructor
public class RoomController {

    private final RoomService roomService;

    @GetMapping("/search")
    public ApiResponse<java.util.List<com.hotel.booking.dto.response.RoomSearchResponse>> searchRooms(
            @org.springframework.web.bind.annotation.RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate checkIn,
            @org.springframework.web.bind.annotation.RequestParam(required = false) @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate checkOut,
            @org.springframework.web.bind.annotation.RequestParam(required = false) java.math.BigDecimal minPrice,
            @org.springframework.web.bind.annotation.RequestParam(required = false) java.math.BigDecimal maxPrice,
            @org.springframework.web.bind.annotation.RequestParam(required = false) Long categoryId,
            @org.springframework.web.bind.annotation.RequestParam(required = false) Integer capacity) {
        com.hotel.booking.dto.request.RoomSearchRequest request = com.hotel.booking.dto.request.RoomSearchRequest.builder()
                .checkIn(checkIn)
                .checkOut(checkOut)
                .minPrice(minPrice)
                .maxPrice(maxPrice)
                .categoryId(categoryId)
                .capacity(capacity)
                .build();
        java.util.List<com.hotel.booking.dto.response.RoomSearchResponse> rooms = roomService.searchRooms(request);
        return ApiResponse.success("Tìm kiếm phòng thành công", rooms);
    }

    @GetMapping("/public")
    public ApiResponse<Page<Room>> getPublicRooms(
            @PageableDefault(page = 0, size = 6, sort = "id", direction = Sort.Direction.ASC) Pageable pageable) {
        Page<Room> rooms = roomService.getPublicRooms(pageable);
        return ApiResponse.success("Lấy danh sách phòng thành công", rooms);
    }


    @GetMapping
    public ApiResponse<Page<Room>> getRooms(
            @PageableDefault(page = 0, size = 12, sort = "id", direction = Sort.Direction.ASC) Pageable pageable) {
        Page<Room> rooms = roomService.getPublicRooms(pageable);
        return ApiResponse.success("Lấy danh sách phòng thành công", rooms);
    }

    @GetMapping("/{id}")
    public ApiResponse<com.hotel.booking.dto.response.RoomDetailResponse> getRoomById(@org.springframework.web.bind.annotation.PathVariable Long id) {
        com.hotel.booking.dto.response.RoomDetailResponse room = roomService.getRoomDetail(id);
        return ApiResponse.success("Lấy thông tin chi tiết phòng thành công", room);
    }
}

