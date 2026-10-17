package com.hotel.booking.dto.review;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
@Schema(description = "Dữ liệu yêu cầu gửi đánh giá phòng sau khi lưu trú")
public class CreateReviewRequest {

    @Schema(description = "Mã đơn đặt phòng đã hoàn tất trả phòng (CHECKED_OUT)", example = "100")
    private Long bookingId;

    @Schema(description = "Mã phòng được đánh giá (tự động lấy từ đơn đặt phòng nếu có bookingId)", example = "1")
    private Long roomId;

    @NotNull(message = "Số sao đánh giá không được để trống")
    @Min(value = 1, message = "Đánh giá tối thiểu 1 sao")
    @Max(value = 5, message = "Đánh giá tối đa 5 sao")
    @Schema(description = "Số sao đánh giá từ 1 đến 5", example = "5", requiredMode = Schema.RequiredMode.REQUIRED)
    private Integer rating;

    @Schema(description = "Bình luận, cảm nhận của khách hàng", example = "Phòng rất đẹp, view biển tuyệt vời, nhân viên chu đáo!")
    private String comment;
}
