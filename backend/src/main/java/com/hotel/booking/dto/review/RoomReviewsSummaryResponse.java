package com.hotel.booking.dto.review;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomReviewsSummaryResponse {
    private Double averageRating;
    private Integer totalReviews;
    private List<ReviewResponse> reviews;
}
