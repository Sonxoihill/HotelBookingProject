package com.hotel.booking.dto.admin;

import com.hotel.booking.enums.RoomStatus;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminRoomRequest {

    @NotBlank(message = "Số phòng không được để trống")
    private String roomNumber;

    @NotNull(message = "Tầng không được để trống")
    @Min(value = 1, message = "Tầng phải từ 1 trở lên")
    private Integer floor;

    @NotNull(message = "Loại phòng không được để trống")
    private Long categoryId;

    private RoomStatus status;
}
