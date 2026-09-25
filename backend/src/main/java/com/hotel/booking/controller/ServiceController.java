package com.hotel.booking.controller;

import com.hotel.booking.common.response.ApiResponse;
import com.hotel.booking.entity.Service;
import com.hotel.booking.enums.ServiceStatus;
import com.hotel.booking.repository.ServiceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/services")
@RequiredArgsConstructor
public class ServiceController {

    private final ServiceRepository serviceRepository;

    @GetMapping
    public ApiResponse<List<Service>> getServices() {
        List<Service> services = serviceRepository.findByStatus(ServiceStatus.ACTIVE);
        return ApiResponse.success("Lấy danh sách dịch vụ thành công", services);
    }
}
