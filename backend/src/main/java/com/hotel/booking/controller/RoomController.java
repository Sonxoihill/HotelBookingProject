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
@Tag(name = "2. Khách hàng - Tìm kiếm & Chi tiết Phòng (Rooms)", description = "Các API tìm kiếm phòng trống theo ngày/số khách (UC04), xem chi tiết phòng & đánh giá (UC05) và tính báo giá linh hoạt")
public class RoomController {

    private final RoomService roomService;

    @Operation(
            summary = "Tìm kiếm & Lọc phòng trống theo ngày và số khách (UC04)",
            description = "Tìm kiếm danh sách các phòng còn trống theo khoảng thời gian nhận/trả phòng (checkIn, checkOut), sức chứa (capacity / guests), khoảng giá (minPrice, maxPrice) và hạng phòng (categoryId). Hệ thống tự động loại trừ các phòng đã được đặt trong khoảng thời gian yêu cầu."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Tìm kiếm phòng trống thành công",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiResponse.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "400",
                    description = "Tham số tìm kiếm không hợp lệ (ngày trả phòng trước ngày nhận phòng hoặc định dạng sai)",
                    content = @Content(mediaType = "application/json")
            )
    })
    @GetMapping("/search")
    public ApiResponse<List<RoomSearchResponse>> searchRooms(
            @Parameter(description = "Ngày nhận phòng (Định dạng YYYY-MM-DD)", example = "2026-12-10")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkIn,

            @Parameter(description = "Ngày trả phòng (Định dạng YYYY-MM-DD)", example = "2026-12-12")
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOut,

            @Parameter(description = "Khoảng giá tối thiểu mỗi đêm (VNĐ)", example = "500000")
            @RequestParam(required = false) BigDecimal minPrice,

            @Parameter(description = "Khoảng giá tối đa mỗi đêm (VNĐ)", example = "3000000")
            @RequestParam(required = false) BigDecimal maxPrice,

            @Parameter(description = "ID danh mục / hạng phòng", example = "1")
            @RequestParam(required = false) Long categoryId,

            @Parameter(description = "Sức chứa tối thiểu (số lượng khách)", example = "2")
            @RequestParam(required = false) Integer capacity,

            @Parameter(description = "Số lượng khách lưu trú (alias của capacity)", example = "2")
            @RequestParam(required = false) Integer guests) {

        Integer effectiveCapacity = (capacity != null) ? capacity : guests;
        RoomSearchRequest request = RoomSearchRequest.builder()
                .checkIn(checkIn)
                .checkOut(checkOut)
                .minPrice(minPrice)
                .maxPrice(maxPrice)
                .categoryId(categoryId)
                .capacity(effectiveCapacity)
                .build();
        List<RoomSearchResponse> rooms = roomService.searchRooms(request);
        return ApiResponse.success("Tìm kiếm phòng thành công", rooms);
    }

    @Operation(
            summary = "Xem chi tiết phòng & Bảng giá (UC05)",
            description = "Lấy đầy đủ thông tin chi tiết của một phòng cụ thể bao gồm: hạng phòng, diện tích, loại giường, tiện ích, hình ảnh, giá cơ bản mỗi đêm, điểm đánh giá trung bình và danh sách nhận xét tiếng Việt UTF-8 của khách hàng."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Lấy thông tin chi tiết phòng thành công",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiResponse.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "400",
                    description = "ID phòng không đúng định dạng số",
                    content = @Content(mediaType = "application/json")
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
            summary = "Lấy danh sách phòng nổi bật công khai (Public)",
            description = "Lấy danh sách các phòng khả dụng có phân trang (mặc định 6 phòng/trang) để hiển thị trên trang chủ."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Lấy danh sách phòng công khai thành công")
    })
    @GetMapping("/public")
    public ApiResponse<Page<Room>> getPublicRooms(
            @Parameter(hidden = true)
            @PageableDefault(page = 0, size = 6, sort = "id", direction = Sort.Direction.ASC) Pageable pageable) {
        Page<Room> rooms = roomService.getPublicRooms(pageable);
        return ApiResponse.success("Lấy danh sách phòng thành công", rooms);
    }

    @Operation(
            summary = "Lấy toàn bộ danh sách phòng khách sạn",
            description = "Lấy danh sách phòng có phân trang (mặc định 12 phòng/trang)."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Lấy danh sách phòng thành công")
    })
    @GetMapping
    public ApiResponse<Page<Room>> getRooms(
            @Parameter(hidden = true)
            @PageableDefault(page = 0, size = 12, sort = "id", direction = Sort.Direction.ASC) Pageable pageable) {
        Page<Room> rooms = roomService.getPublicRooms(pageable);
        return ApiResponse.success("Lấy danh sách phòng thành công", rooms);
    }

    @Operation(
            summary = "Xem trước báo giá phòng theo ngày lưu trú (Dynamic Pricing Quote)",
            description = "Hệ thống tự động áp dụng các quy tắc giá linh hoạt (HOLIDAY, PEAK_SEASON, WEEKEND) cho từng đêm lưu trú và tính thuế GTGT 10% VAT."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Tính báo giá phòng thành công"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "400", description = "Khoảng ngày nhận/trả phòng không hợp lệ"),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "404", description = "Không tìm thấy phòng theo ID")
    })
    @GetMapping("/{id}/price-quote")
    public ApiResponse<com.hotel.booking.dto.response.PriceQuote> getPriceQuote(
            @Parameter(description = "ID phòng cần tính giá", example = "1", required = true)
            @PathVariable Long id,
            @Parameter(description = "Ngày nhận phòng (YYYY-MM-DD)", example = "2027-09-01", required = true)
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkIn,
            @Parameter(description = "Ngày trả phòng (YYYY-MM-DD)", example = "2027-09-03", required = true)
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate checkOut) {
        com.hotel.booking.dto.response.PriceQuote quote = roomService.getPriceQuote(id, checkIn, checkOut);
        return ApiResponse.success("Lấy báo giá phòng thành công", quote);
    }
}
