package com.hotel.booking.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.hotel.booking.entity.Room;
import com.hotel.booking.entity.RoomCategory;
import io.swagger.v3.oas.annotations.media.Schema;
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
@Schema(description = "Kết quả tìm kiếm phòng")
public class RoomSearchResponse {

    @Schema(description = "ID của phòng", example = "1")
    private Long id;

    @Schema(description = "Số phòng", example = "101")
    private String roomNumber;

    @Schema(description = "Tên phòng", example = "Phòng Deluxe Hướng Biển 101")
    private String roomName;

    @Schema(description = "Tầng", example = "1")
    private Integer floor;

    @Schema(description = "Trạng thái phòng", example = "AVAILABLE")
    private String status;

    @Schema(description = "ID danh mục / hạng phòng", example = "2")
    private Long categoryId;

    @Schema(description = "Tên hạng phòng", example = "Deluxe Ocean View")
    private String categoryName;

    @Schema(description = "Loại phòng", example = "Deluxe")
    private String roomType;

    @Schema(description = "Giá mỗi đêm (VNĐ)", example = "1200000")
    private BigDecimal pricePerNight;

    @Schema(description = "Giá cơ bản của hạng phòng (VNĐ)", example = "1200000")
    private BigDecimal basePrice;

    @Schema(description = "Sức chứa tối đa (người)", example = "2")
    private Integer capacity;

    @Schema(description = "Loại giường", example = "1 Giường đôi King")
    private String bedType;

    @Schema(description = "Mô tả phòng", example = "Phòng Deluxe sang trọng, view ngắm trọn biển và ban công thoáng đãng")
    private String description;

    @Schema(description = "Ảnh đại diện phòng", example = "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b")
    private String imageUrl;

    @Schema(description = "Danh sách link ảnh phòng")
    private List<String> images;

    @Schema(description = "Danh sách link ảnh phòng (alias)")
    private List<String> imageUrls;

    @Schema(description = "Danh sách tiện ích phòng", example = "[\"Wifi tốc độ cao\", \"Ban công hướng biển\", \"Minibar\"]")
    private List<String> amenities;

    @Schema(description = "Thông tin tóm tắt hạng phòng")
    private CategorySummary category;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    @Schema(description = "Tóm tắt thông tin hạng phòng")
    public static class CategorySummary {
        @Schema(description = "ID hạng phòng", example = "2")
        private Long id;

        @Schema(description = "Tên hạng phòng", example = "Deluxe Ocean View")
        private String name;

        @Schema(description = "Mô tả hạng phòng", example = "Hạng phòng cao cấp với ban công view biển")
        private String description;

        @Schema(description = "Giá cơ bản", example = "1200000")
        private BigDecimal basePrice;

        @Schema(description = "Sức chứa", example = "2")
        private Integer capacity;

        @Schema(description = "Loại giường", example = "1 Giường đôi King")
        private String bedType;

        @Schema(description = "Ảnh đại diện hạng phòng", example = "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b")
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
