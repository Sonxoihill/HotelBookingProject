package com.hotel.booking.service;

import com.hotel.booking.entity.Room;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface RoomService {
    Page<Room> getPublicRooms(Pageable pageable);

    List<Room> getAllRooms();

    Room getRoomById(Long id);
}
