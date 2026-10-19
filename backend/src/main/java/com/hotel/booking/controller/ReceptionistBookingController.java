package com.hotel.booking.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hotel.booking.common.exception.AppException;
import com.hotel.booking.common.exception.ErrorCode;
import com.hotel.booking.common.response.ApiResponse;
import com.hotel.booking.common.response.PageResponse;
import com.hotel.booking.dto.receptionist.*;
import com.hotel.booking.enums.BookingStatus;
import com.hotel.booking.service.ReceptionistService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/receptionist/bookings")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('RECEPTIONIST', 'ADMIN')")
@Tag(name = "Receptionist Booking Management", description = "Các API quản lý đơn đặt phòng dành cho Lễ tân: Danh sách, Duyệt, Hủy, Check-in, Check-out (UC10) & Dịch vụ (UC11)")
@SecurityRequirement(name = "bearerAuth")
public class ReceptionistBookingController {

    private final ReceptionistService receptionistService;
    private final ObjectMapper objectMapper;

    @Operation(
            summary = "API 1: Danh sách & Lọc đơn đặt phòng (UC10)",
            description = "Lấy danh sách các đơn đặt phòng có phân trang và lọc theo từ khóa (mã đơn, tên khách, số điện thoại) và trạng thái đơn."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Lấy danh sách đơn đặt phòng thành công",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiResponse.class))
            )
    })
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponse<ReceptionistBookingResponse>>> getBookings(
            @Parameter(description = "Từ khóa tìm kiếm (mã đơn, tên khách, SĐT)", example = "0901234567")
            @RequestParam(required = false) String keyword,

            @Parameter(description = "Trạng thái đơn (PENDING, CONFIRMED, CHECKED_IN, CHECKED_OUT, CANCELLED)", example = "PENDING")
            @RequestParam(required = false) BookingStatus status,

            @Parameter(description = "Số trang (bắt đầu từ 0)", example = "0")
            @RequestParam(defaultValue = "0") int page,

            @Parameter(description = "Kích thước trang", example = "10")
            @RequestParam(defaultValue = "10") int size,

            @Parameter(description = "Trường sắp xếp (mặc định createdAt)", example = "createdAt")
            @RequestParam(defaultValue = "createdAt") String sortBy,

            @Parameter(description = "Chiều sắp xếp (ASC hoặc DESC, mặc định DESC)", example = "DESC")
            @RequestParam(defaultValue = "DESC") String direction
    ) {
        Sort.Direction dir = "ASC".equalsIgnoreCase(direction) ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.max(size, 1), Sort.by(dir, sortBy));

        PageResponse<ReceptionistBookingResponse> response = receptionistService.getBookings(keyword, status, pageable);
        return ResponseEntity.ok(ApiResponse.success("Lấy danh sách đơn đặt phòng thành công", response));
    }

    @Operation(
            summary = "API 2: Duyệt đơn đặt phòng (UC10 - Luồng 3a)",
            description = "Kiểm tra đơn đang PENDING -> chuyển trạng thái đơn sang CONFIRMED, đồng thời chuyển trạng thái phòng sang RESERVED."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Duyệt đơn đặt phòng thành công",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiResponse.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "400",
                    description = "Đơn không ở trạng thái PENDING"
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404",
                    description = "Không tìm thấy đơn đặt phòng"
            )
    })
    @PatchMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<ReceptionistBookingResponse>> approveBooking(
            @Parameter(description = "ID đơn đặt phòng cần duyệt", example = "1", required = true)
            @PathVariable Long id
    ) {
        ReceptionistBookingResponse response = receptionistService.approveBooking(id);
        return ResponseEntity.ok(ApiResponse.success("Duyệt đơn đặt phòng thành công", response));
    }

    @Operation(
            summary = "API 3: Lễ tân Hủy đơn đặt phòng (UC10 - Luồng 3b)",
            description = "Nhận lý do hủy (bắt buộc) -> lưu vào cancel_reason, đổi đơn sang CANCELLED và giải phóng phòng về AVAILABLE."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Hủy đơn đặt phòng thành công",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiResponse.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "400",
                    description = "Lý do hủy trống hoặc đơn không đủ điều kiện hủy"
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404",
                    description = "Không tìm thấy đơn đặt phòng"
            )
    })
    @PatchMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<ReceptionistBookingResponse>> cancelBooking(
            @Parameter(description = "ID đơn đặt phòng cần hủy", example = "1", required = true)
            @PathVariable Long id,
            @Valid @RequestBody ReceptionistCancelBookingRequest request
    ) {
        ReceptionistBookingResponse response = receptionistService.cancelBooking(id, request.getCancelReason());
        return ResponseEntity.ok(ApiResponse.success("Hủy đơn đặt phòng thành công", response));
    }

    @Operation(
            summary = "API 4: Nhận phòng - Check-in cho khách đến (UC10 - Luồng 3c)",
            description = "Chỉ cho phép khi đơn đang CONFIRMED. Đổi đơn sang CHECKED_IN, ghi nhận actualCheckIn = now(), và đổi phòng sang OCCUPIED."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Nhận phòng (Check-in) thành công",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiResponse.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "400",
                    description = "Đơn chưa được duyệt (CONFIRMED)"
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404",
                    description = "Không tìm thấy đơn đặt phòng"
            )
    })
    @PatchMapping("/{id}/check-in")
    public ResponseEntity<ApiResponse<ReceptionistBookingResponse>> checkInBooking(
            @Parameter(description = "ID đơn đặt phòng", example = "1", required = true)
            @PathVariable Long id
    ) {
        ReceptionistBookingResponse response = receptionistService.checkInBooking(id);
        return ResponseEntity.ok(ApiResponse.success("Nhận phòng (Check-in) thành công", response));
    }

    @Operation(
            summary = "API 5: Tóm tắt hóa đơn trước Check-out (UC10)",
            description = "Tính toán chi tiết: Tiền phòng + Tổng tiền dịch vụ phát sinh (UC11) - Tiền đã trả trước (paidAmount) = Số tiền cần thu thêm."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Lấy thông tin tóm tắt thanh toán thành công",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiResponse.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404",
                    description = "Không tìm thấy đơn đặt phòng"
            )
    })
    @GetMapping("/{id}/checkout-summary")
    public ResponseEntity<ApiResponse<CheckoutSummaryResponse>> getCheckoutSummary(
            @Parameter(description = "ID đơn đặt phòng", example = "1", required = true)
            @PathVariable Long id
    ) {
        CheckoutSummaryResponse response = receptionistService.getCheckoutSummary(id);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin tóm tắt thanh toán thành công", response));
    }

    @Operation(
            summary = "API 6: Xác nhận trả phòng - Check-out (UC10)",
            description = "Nhận paymentMethod -> cập nhật paidAmount = totalAmount, actualCheckOut = now(), chuyển đơn sang CHECKED_OUT, và đổi phòng sang DIRTY (Cần dọn) trong cùng một transaction."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Trả phòng (Check-out) thành công",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiResponse.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "400",
                    description = "Đơn không ở trạng thái lưu trú (CHECKED_IN)"
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404",
                    description = "Không tìm thấy đơn đặt phòng"
            )
    })
    @PostMapping("/{id}/check-out")
    public ResponseEntity<ApiResponse<ReceptionistBookingResponse>> checkOutBooking(
            @Parameter(description = "ID đơn đặt phòng", example = "1", required = true)
            @PathVariable Long id,
            @RequestBody(required = false) CheckOutRequest request
    ) {
        CheckOutRequest req = request != null ? request : new CheckOutRequest();
        ReceptionistBookingResponse response = receptionistService.checkOutBooking(id, req);
        return ResponseEntity.ok(ApiResponse.success("Trả phòng (Check-out) thành công", response));
    }

    @Operation(
            summary = "Ghi nhận Dịch vụ phát sinh cho Phòng đang thuê (UC11)",
            description = "Cho phép Lễ tân nạp dịch vụ vào Folio phòng/đơn đặt phòng đang lưu trú (CHECKED_IN). Nhận Request Body là danh sách [{serviceId, quantity}] (hoặc 1 object {serviceId, quantity})."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Cập nhật phí vào hóa đơn phòng thành công",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiResponse.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "400",
                    description = "Vui lòng chọn dịch vụ và số lượng hợp lệ HOẶC phòng không ở trạng thái CHECKED_IN"
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404",
                    description = "Không tìm thấy đơn đặt phòng"
            )
    })
    @PostMapping("/{bookingId}/services")
    public ResponseEntity<ApiResponse<BookingServicesSummaryResponse>> addServicesToBooking(
            @Parameter(description = "ID đơn đặt phòng đang CHECKED_IN", example = "1", required = true)
            @PathVariable Long bookingId,
            @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    description = "Danh sách dịch vụ cần thêm, ví dụ: [{\"serviceId\": 1, \"quantity\": 2}]",
                    required = true,
                    content = @Content(schema = @Schema(implementation = AddServiceItemRequest.class))
            )
            @RequestBody(required = false) JsonNode bodyNode
    ) {
        List<AddServiceItemRequest> items = parseServiceItems(bodyNode);
        BookingServicesSummaryResponse response = receptionistService.addServicesToBooking(bookingId, items);
        return ResponseEntity.ok(ApiResponse.success("Cập nhật thành công", response));
    }

    @Operation(
            summary = "Xem danh sách dịch vụ đã dùng của đơn đặt phòng (UC11)",
            description = "Lấy danh sách các dịch vụ phát sinh kèm theo phân tích chi tiết hóa đơn (tổng tiền dịch vụ, tổng tiền phòng, đã thanh toán, còn lại) để hiển thị cột hóa đơn bên phải."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "200",
                    description = "Lấy danh sách dịch vụ thành công",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ApiResponse.class))
            ),
            @io.swagger.v3.oas.annotations.responses.ApiResponse(
                    responseCode = "404",
                    description = "Không tìm thấy đơn đặt phòng"
            )
    })
    @GetMapping("/{bookingId}/services")
    public ResponseEntity<ApiResponse<BookingServicesSummaryResponse>> getBookingServices(
            @Parameter(description = "ID đơn đặt phòng", example = "1", required = true)
            @PathVariable Long bookingId
    ) {
        BookingServicesSummaryResponse response = receptionistService.getBookingServices(bookingId);
        return ResponseEntity.ok(ApiResponse.success("Lấy thông tin dịch vụ thành công", response));
    }

    private List<AddServiceItemRequest> parseServiceItems(JsonNode bodyNode) {
        if (bodyNode == null || bodyNode.isNull() || bodyNode.isEmpty()) {
            throw new AppException(ErrorCode.BAD_REQUEST, "Vui lòng chọn dịch vụ và số lượng hợp lệ");
        }

        List<AddServiceItemRequest> items = new ArrayList<>();
        if (bodyNode.isArray()) {
            for (JsonNode node : bodyNode) {
                AddServiceItemRequest item = objectMapper.convertValue(node, AddServiceItemRequest.class);
                items.add(item);
            }
        } else if (bodyNode.isObject()) {
            if (bodyNode.has("services") && bodyNode.get("services").isArray()) {
                for (JsonNode node : bodyNode.get("services")) {
                    items.add(objectMapper.convertValue(node, AddServiceItemRequest.class));
                }
            } else if (bodyNode.has("serviceId")) {
                items.add(objectMapper.convertValue(bodyNode, AddServiceItemRequest.class));
            } else {
                throw new AppException(ErrorCode.BAD_REQUEST, "Vui lòng chọn dịch vụ và số lượng hợp lệ");
            }
        } else {
            throw new AppException(ErrorCode.BAD_REQUEST, "Vui lòng chọn dịch vụ và số lượng hợp lệ");
        }

        return items;
    }
}
