package com.hotel.booking.controller;

import com.hotel.booking.common.response.ApiResponse;
import com.hotel.booking.dto.receptionist.RoomGridResponse;
import com.hotel.booking.entity.Room;
import com.hotel.booking.enums.RoomStatus;
import com.hotel.booking.service.ReceptionistService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/receptionist")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN')")
@Tag(name = "Receptionist Management", description = "Các API dành riêng cho Quầy lễ tân (RECEPTIONIST, ADMIN)")
@SecurityRequirement(name = "bearerAuth")
public class ReceptionistController {

    private final ReceptionistService receptionistService;

    @Operation(summary = "Kiểm tra quyền Lễ tân (RECEPTIONIST)", description = "Xác thực JWT token của người dùng có quyền ROLE_RECEPTIONIST hoặc ROLE_ADMIN hay không.")
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Xác thực thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "403", description = "Không có quyền Quầy Lễ tân")
    })
    @GetMapping("/ping")
    public ResponseEntity<ApiResponse<Map<String, String>>> ping() {
        return ResponseEntity.ok(ApiResponse.success(
                "Xác thực quyền Quầy Lễ tân thành công",
                Map.of("status", "ACTIVE", "role", "RECEPTIONIST")
        ));
    }

    @Operation(
            summary = "Lấy Sơ đồ phòng thời gian thực (Room Grid - UC09)",
            description = "Lấy danh sách các phòng trên sơ đồ dạng lưới, kèm thông tin tóm tắt đơn đặt phòng đang CHECKED_IN hoặc CONFIRMED trong 1 câu truy vấn (tối ưu N+1). Hỗ trợ lọc theo Tầng (floor) và Trạng thái phòng (status)."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Lấy sơ đồ phòng thành công",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiResponse.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "403",
                    description = "Chưa đăng nhập hoặc không có quyền RECEPTIONIST/ADMIN"
            )
    })
    @GetMapping({"/rooms/grid", "/room-matrix"})
    public ResponseEntity<ApiResponse<List<RoomGridResponse>>> getRoomGrid(
            @Parameter(description = "Số tầng để lọc (Tùy chọn, ví dụ: 1, 2, 3)", example = "1")
            @RequestParam(required = false) Integer floor,

            @Parameter(description = "Trạng thái phòng để lọc (Tùy chọn: AVAILABLE, RESERVED, OCCUPIED, DIRTY, MAINTENANCE)", example = "DIRTY")
            @RequestParam(required = false) RoomStatus status
    ) {
        List<RoomGridResponse> grid = receptionistService.getRoomGrid(floor, status);
        return ResponseEntity.ok(ApiResponse.success("Lấy sơ đồ phòng thành công", grid));
    }

    @Operation(
            summary = "Xác nhận đã dọn phòng (UC12)",
            description = "Xác nhận phòng đã dọn dẹp sạch sẽ. Phòng bắt buộc phải ở trạng thái DIRTY mới cho phép chuyển sang AVAILABLE. Nếu phòng ở trạng thái khác sẽ ném lỗi 400 Bad Request kèm thông báo 'Phòng không ở trạng thái Cần dọn'."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Cập nhật trạng thái phòng thành công",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiResponse.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "400",
                    description = "Phòng không ở trạng thái Cần dọn"
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404",
                    description = "Không tìm thấy phòng theo ID"
            )
    })
    @PatchMapping("/rooms/{roomId}/clean")
    public ResponseEntity<ApiResponse<Room>> cleanRoom(
            @Parameter(description = "ID của phòng cần cập nhật sau khi dọn xong", example = "4", required = true)
            @PathVariable Long roomId
    ) {
        Room updatedRoom = receptionistService.cleanRoom(roomId);
        return ResponseEntity.ok(ApiResponse.success("Xác nhận đã dọn phòng thành công", updatedRoom));
    }
}
