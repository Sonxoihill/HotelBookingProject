package com.hotel.booking.controller;

import com.hotel.booking.common.response.ApiResponse;
import com.hotel.booking.entity.Service;
import com.hotel.booking.enums.ServiceStatus;
import com.hotel.booking.repository.ServiceRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/services")
@RequiredArgsConstructor
@Tag(name = "3. Khách hàng - Danh mục Dịch vụ (Hotel Services)", description = "Các API truy xuất danh sách dịch vụ phụ trợ đang hoạt động của khách sạn (Bữa sáng Buffet, Đưa đón sân bay, Spa, Giặt là, Minibar...)")
public class ServiceController {

    private final ServiceRepository serviceRepository;

    @Operation(
            summary = "Lấy danh sách dịch vụ khách sạn đang hoạt động",
            description = "Lấy toàn bộ các dịch vụ đang khả dụng (status = ACTIVE) kèm theo đơn giá, đơn vị tính và mô tả chi tiết."
    )
    @ApiResponses(value = {
            @io.swagger.v3.oas.annotations.responses.ApiResponse(responseCode = "200", description = "Lấy danh sách dịch vụ thành công")
    })
    @GetMapping
    public ApiResponse<List<Service>> getServices() {
        List<Service> services = serviceRepository.findByStatus(ServiceStatus.ACTIVE);
        return ApiResponse.success("Lấy danh sách dịch vụ thành công", services);
    }
}
