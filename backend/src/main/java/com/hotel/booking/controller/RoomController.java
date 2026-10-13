package com.hotel.booking.controller;

import com.hotel.booking.common.response.ApiResponse;
import com.hotel.booking.dto.request.RoomSearchRequest;
import com.hotel.booking.dto.response.RoomDetailResponse;
import com.hotel.booking.dto.response.RoomSearchResponse;
import com.hotel.booking.entity.Room;
import com.hotel.booking.service.RoomService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/rooms")
@RequiredArgsConstructor
@Tag(name = "Room Management", description = "Các API tìm kiếm, lọc và xem thông tin chi tiết phòng khách sạn (Subtask 1.2 - UC04 & Subtask 1.3 - UC05)")
public class RoomController {

    private final RoomService roomService;

    @Operation(
            summary = "Tìm kiếm & Lọc phòng trống (UC04)",
            description = "Tìm kiếm danh sách các phòng còn trống theo khoảng thời gian nhận/trả phòng, mức giá, hạng phòng và sức chứa. Hệ thống tự động loại bỏ các phòng đã có người đặt trong thời gian yêu cầu."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Tìm kiếm phòng thành công",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiResponse.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "400",
                    description = "Tham số tìm kiếm không hợp lệ (Ví dụ: Ngày trả phòng trước ngày nhận phòng, ngày trong quá khứ)",
                    content = @Content(mediaType = "application/json")
            )
    })
    @GetMapping("/search")
    public ApiResponse<List<RoomSearchResponse>> searchRooms(
            @Parameter(description = "Ngày nhận phòng (Định dạng YYYY-MM-DD)", example = "2026-10-10")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkIn,

            @Parameter(description = "Ngày trả phòng (Định dạng YYYY-MM-DD)", example = "2026-10-12")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOut,

            @Parameter(description = "Khoảng giá tối thiểu mỗi đêm (VNĐ)", example = "500000")
            @RequestParam(required = false) BigDecimal minPrice,

            @Parameter(description = "Khoảng giá tối đa mỗi đêm (VNĐ)", example = "3000000")
            @RequestParam(required = false) BigDecimal maxPrice,

            @Parameter(description = "ID danh mục / hạng phòng", example = "1")
            @RequestParam(required = false) Long categoryId,

            @Parameter(description = "Sức chứa tối thiểu (số lượng khách)", example = "2")
            @RequestParam(required = false) Integer capacity) {

        RoomSearchRequest request = RoomSearchRequest.builder()
                .checkIn(checkIn)
                .checkOut(checkOut)
                .minPrice(minPrice)
                .maxPrice(maxPrice)
                .categoryId(categoryId)
                .capacity(capacity)
                .build();
        List<RoomSearchResponse> rooms = roomService.searchRooms(request);
        return ApiResponse.success("Tìm kiếm phòng thành công", rooms);
    }

    @Operation(
            summary = "Xem chi tiết phòng (UC05)",
            description = "Lấy đầy đủ thông tin chi tiết của một phòng cụ thể bao gồm: tiện ích, hình ảnh, giá mỗi đêm, đánh giá trung bình và danh sách nhận xét của khách hàng."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Lấy thông tin chi tiết phòng thành công",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiResponse.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404",
                    description = "Không tìm thấy phòng với ID tương ứng",
                    content = @Content(mediaType = "application/json")
            )
    })
    @GetMapping("/{id}")
    public ApiResponse<RoomDetailResponse> getRoomById(
            @Parameter(description = "ID của phòng cần xem chi tiết", example = "1", required = true)
            @PathVariable Long id) {
        RoomDetailResponse room = roomService.getRoomDetail(id);
        return ApiResponse.success("Lấy thông tin chi tiết phòng thành công", room);
    }

    @Operation(
            summary = "Lấy danh sách phòng công khai (Public)",
            description = "Lấy danh sách các phòng khả dụng có phân trang (mặc định 6 phòng/trang) cho trang chủ."
    )
    @GetMapping("/public")
    public ApiResponse<Page<Room>> getPublicRooms(
            @Parameter(hidden = true)
            @PageableDefault(page = 0, size = 6, sort = "id", direction = Sort.Direction.ASC) Pageable pageable) {
        Page<Room> rooms = roomService.getPublicRooms(pageable);
        return ApiResponse.success("Lấy danh sách phòng thành công", rooms);
    }

    @Operation(
            summary = "Lấy toàn bộ danh sách phòng",
            description = "Lấy danh sách phòng có phân trang (mặc định 12 phòng/trang)."
    )
    @GetMapping
    public ApiResponse<Page<Room>> getRooms(
            @Parameter(hidden = true)
            @PageableDefault(page = 0, size = 12, sort = "id", direction = Sort.Direction.ASC) Pageable pageable) {
        Page<Room> rooms = roomService.getPublicRooms(pageable);
        return ApiResponse.success("Lấy danh sách phòng thành công", rooms);
    }
}
