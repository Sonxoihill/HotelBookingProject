package com.hotel.booking.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.hotel.booking.dto.review.ReviewResponse;
import com.hotel.booking.entity.Review;
import com.hotel.booking.entity.Room;
import com.hotel.booking.entity.RoomCategory;
import lombok.*;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class RoomDetailResponse {

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

    private CategoryDetailSummary category;

    private Double averageRating;
    private Integer totalReviews;
    private List<ReviewResponse> reviews;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CategoryDetailSummary {
        private Long id;
        private String name;
        private String description;
        private BigDecimal basePrice;
        private Integer capacity;
        private String bedType;
        private String imageUrl;
    }

    public static RoomDetailResponse fromEntity(Room room, List<Review> reviewEntities) {
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

        List<ReviewResponse> reviewResponses = new ArrayList<>();
        double avg = 0.0;
        int count = 0;

        if (reviewEntities != null && !reviewEntities.isEmpty()) {
            count = reviewEntities.size();
            avg = reviewEntities.stream()
                    .mapToInt(Review::getRating)
                    .average()
                    .orElse(0.0);
            avg = BigDecimal.valueOf(avg).setScale(1, RoundingMode.HALF_UP).doubleValue();

            reviewResponses = reviewEntities.stream().map(rev -> {
                String userName = rev.getUser() != null ? rev.getUser().getFullName() : "Khách hàng";
                return ReviewResponse.builder()
                        .id(rev.getId())
                        .rating(rev.getRating())
                        .comment(rev.getComment())
                        .userId(rev.getUser() != null ? rev.getUser().getId() : null)
                        .userName(userName)
                        .roomId(room.getId())
                        .roomNumber(room.getRoomNumber())
                        .createdAt(rev.getCreatedAt())
                        .build();
            }).collect(Collectors.toList());
        }

        CategoryDetailSummary catSummary = cat != null ? CategoryDetailSummary.builder()
                .id(cat.getId())
                .name(cat.getName())
                .description(cat.getDescription())
                .basePrice(cat.getBasePrice())
                .capacity(cat.getCapacity())
                .bedType(cat.getBedType())
                .imageUrl(cat.getImageUrl())
                .build() : null;

        return RoomDetailResponse.builder()
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
                .averageRating(avg)
                .totalReviews(count)
                .reviews(reviewResponses)
                .build();
    }
}
