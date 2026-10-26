package com.hotel.booking.service.impl;

import com.hotel.booking.common.exception.AppException;
import com.hotel.booking.common.exception.ErrorCode;
import com.hotel.booking.dto.admin.RoomCategoryRequest;
import com.hotel.booking.entity.RoomCategory;
import com.hotel.booking.repository.RoomCategoryRepository;
import com.hotel.booking.repository.RoomRepository;
import com.hotel.booking.service.AdminRoomCategoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminRoomCategoryServiceImpl implements AdminRoomCategoryService {

    private final RoomCategoryRepository roomCategoryRepository;
    private final RoomRepository roomRepository;

    @Override
    @Transactional(readOnly = true)
    public List<RoomCategory> getAllCategories() {
        return roomCategoryRepository.findAll();
    }

    @Override
    @Transactional(readOnly = true)
    public RoomCategory getCategoryById(Long id) {
        return roomCategoryRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy loại phòng với ID: " + id));
    }

    @Override
    @Transactional
    public RoomCategory createCategory(RoomCategoryRequest request) {
        String trimmedName = request.getName().trim();
        if (roomCategoryRepository.existsByName(trimmedName)) {
            throw new AppException(ErrorCode.CONFLICT, "Tên loại phòng đã tồn tại");
        }

        RoomCategory category = RoomCategory.builder()
                .name(trimmedName)
                .basePrice(request.getBasePrice())
                .capacity(request.getCapacity())
                .bedCount(request.getBedCount())
                .area(request.getArea())
                .bedType(request.getBedType())
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .build();

        log.info("Admin tạo mới loại phòng: {}", trimmedName);
        return roomCategoryRepository.save(category);
    }

    @Override
    @Transactional
    public RoomCategory updateCategory(Long id, RoomCategoryRequest request) {
        RoomCategory category = getCategoryById(id);

        String trimmedName = request.getName().trim();
        if (roomCategoryRepository.existsByNameAndIdNot(trimmedName, id)) {
            throw new AppException(ErrorCode.CONFLICT, "Tên loại phòng đã tồn tại");
        }

        category.setName(trimmedName);
        category.setBasePrice(request.getBasePrice());
        category.setCapacity(request.getCapacity());
        category.setBedCount(request.getBedCount());
        category.setArea(request.getArea());
        category.setBedType(request.getBedType());
        category.setDescription(request.getDescription());
        category.setImageUrl(request.getImageUrl());

        log.info("Admin cập nhật loại phòng #{} ({})", id, trimmedName);
        return roomCategoryRepository.save(category);
    }

    @Override
    @Transactional
    public void deleteCategory(Long id) {
        RoomCategory category = getCategoryById(id);

        // Kiểm tra ràng buộc: Loại phòng đang được sử dụng bởi các phòng vật lý
        if (roomRepository.existsByCategoryId(id)) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Không thể xóa loại phòng đang được sử dụng bởi các phòng vật lý");
        }

        log.info("Admin xóa loại phòng #{} ({})", id, category.getName());
        roomCategoryRepository.delete(category);
    }
}
