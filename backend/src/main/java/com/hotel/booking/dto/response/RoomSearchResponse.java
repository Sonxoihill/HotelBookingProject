package com.hotel.booking.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.hotel.booking.entity.Room;
import com.hotel.booking.entity.RoomCategory;
import lombok.*;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class RoomSearchResponse {

    private Long id;
    private String roomNumber;
    private String roomName;
    private Integer floor;
    private String status;

    private Long categoryId;
    private String categoryName;
    private String roomType;

    private BigDecimal pricePerNight;
    private BigDecimal basePrice;
    private Integer capacity;
    private String bedType;
    private String description;
    private String imageUrl;
    private List<String> images;
    private List<String> imageUrls;
    private List<String> amenities;

    private CategorySummary category;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CategorySummary {
        private Long id;
        private String name;
        private String description;
        private BigDecimal basePrice;
        private Integer capacity;
        private String bedType;
        private String imageUrl;
    }

    public static RoomSearchResponse fromEntity(Room room) {
        RoomCategory cat = room.getCategory();

        String catName = cat != null ? cat.getName() : "Phòng tiêu chuẩn";
        String roomName = catName + " (Phòng " + room.getRoomNumber() + ")";
        BigDecimal price = cat != null ? cat.getBasePrice() : BigDecimal.ZERO;
        Integer cap = cat != null ? cat.getCapacity() : null;
        String bed = cat != null ? cat.getBedType() : null;
        String desc = cat != null ? cat.getDescription() : null;
        String img = cat != null ? cat.getImageUrl() : null;

        List<String> amenitiesList = new ArrayList<>();
        if (bed != null && !bed.isBlank()) {
            amenitiesList.add(bed);
        }

        List<String> imageList = (img != null && !img.isBlank())
                ? List.of(img)
                : Collections.emptyList();

        CategorySummary catSummary = cat != null ? CategorySummary.builder()
                .id(cat.getId())
                .name(cat.getName())
                .description(cat.getDescription())
                .basePrice(cat.getBasePrice())
                .capacity(cat.getCapacity())
                .bedType(cat.getBedType())
                .imageUrl(cat.getImageUrl())
                .build() : null;

        return RoomSearchResponse.builder()
                .id(room.getId())
                .roomNumber(room.getRoomNumber())
                .roomName(roomName)
                .floor(room.getFloor())
                .status(room.getStatus() != null ? room.getStatus().name() : "AVAILABLE")
                .categoryId(cat != null ? cat.getId() : null)
                .categoryName(catName)
                .roomType(catName)
                .pricePerNight(price)
                .basePrice(price)
                .capacity(cap)
                .bedType(bed)
                .description(desc)
                .amenities(amenitiesList)
                .images(imageList)
                .imageUrls(imageList)
                .imageUrl(img)
                .category(catSummary)
                .build();
    }
}
