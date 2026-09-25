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
}
