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
    public ApiResponse<Room> getRoomById(@org.springframework.web.bind.annotation.PathVariable Long id) {
        Room room = roomService.getRoomById(id);
        return ApiResponse.success("Lấy thông tin phòng thành công", room);
    }
}
