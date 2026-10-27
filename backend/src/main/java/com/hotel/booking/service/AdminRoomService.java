package com.hotel.booking.service;

import com.hotel.booking.dto.admin.AdminRoomRequest;
import com.hotel.booking.dto.admin.AdminRoomResponse;

import java.util.List;

public interface AdminRoomService {
    List<AdminRoomResponse> getAllRooms();

    AdminRoomResponse getRoomById(Long id);

    AdminRoomResponse createRoom(AdminRoomRequest request);

    AdminRoomResponse updateRoom(Long id, AdminRoomRequest request);

    void deleteRoom(Long id);
}
