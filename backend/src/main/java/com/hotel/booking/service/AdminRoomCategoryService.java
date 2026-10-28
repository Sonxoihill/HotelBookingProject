package com.hotel.booking.service;

import com.hotel.booking.dto.admin.RoomCategoryRequest;
import com.hotel.booking.entity.RoomCategory;

import java.util.List;

public interface AdminRoomCategoryService {
    List<RoomCategory> getAllCategories();

    RoomCategory getCategoryById(Long id);

    RoomCategory createCategory(RoomCategoryRequest request);

    RoomCategory updateCategory(Long id, RoomCategoryRequest request);

    void deleteCategory(Long id);
}
