package com.hotel.booking.service.impl;

import com.hotel.booking.common.exception.AppException;
import com.hotel.booking.common.exception.ErrorCode;
import com.hotel.booking.dto.admin.AdminServiceRequest;
import com.hotel.booking.entity.Service;
import com.hotel.booking.enums.ServiceStatus;
import com.hotel.booking.repository.BookingServiceRepository;
import com.hotel.booking.repository.ServiceRepository;
import com.hotel.booking.service.AdminServiceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Sort;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@org.springframework.stereotype.Service
@RequiredArgsConstructor
public class AdminServiceServiceImpl implements AdminServiceService {

    private final ServiceRepository serviceRepository;
    private final BookingServiceRepository bookingServiceRepository;

    @Override
    @Transactional(readOnly = true)
    public List<Service> getAllServices() {
        return serviceRepository.findAll(Sort.by(Sort.Order.asc("id")));
    }

    @Override
    @Transactional(readOnly = true)
    public Service getServiceById(Long id) {
        return serviceRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.RESOURCE_NOT_FOUND, "Không tìm thấy dịch vụ với ID: " + id));
    }

    @Override
    @Transactional
    public Service createService(AdminServiceRequest request) {
        String trimmedName = request.getName().trim();

        if (serviceRepository.existsByName(trimmedName)) {
            throw new AppException(ErrorCode.CONFLICT, "Tên dịch vụ đã tồn tại");
        }

        ServiceStatus targetStatus = request.getStatus() != null ? request.getStatus() : ServiceStatus.ACTIVE;

        Service service = Service.builder()
                .name(trimmedName)
                .price(request.getPrice())
                .unit(request.getUnit().trim())
                .description(request.getDescription())
                .status(targetStatus)
                .build();

        Service savedService = serviceRepository.save(service);
        log.info("Admin tạo mới dịch vụ: {} (Giá: {}, ĐVT: {})", trimmedName, request.getPrice(), request.getUnit());
        return savedService;
    }

    @Override
    @Transactional
    public Service updateService(Long id, AdminServiceRequest request) {
        Service service = getServiceById(id);

        String trimmedName = request.getName().trim();
        if (serviceRepository.existsByNameAndIdNot(trimmedName, id)) {
            throw new AppException(ErrorCode.CONFLICT, "Tên dịch vụ đã tồn tại");
        }

        service.setName(trimmedName);
        service.setPrice(request.getPrice());
        service.setUnit(request.getUnit().trim());
        service.setDescription(request.getDescription());
        if (request.getStatus() != null) {
            service.setStatus(request.getStatus());
        }

        Service updatedService = serviceRepository.save(service);
        log.info("Admin cập nhật dịch vụ #{} ({})", id, trimmedName);
        return updatedService;
    }

    @Override
    @Transactional
    public boolean deleteService(Long id) {
        Service service = getServiceById(id);

        // Kiểm tra dịch vụ đã nằm trong booking_services hay chưa
        boolean hasBookings = bookingServiceRepository.existsByServiceId(id);

        if (hasBookings) {
            // Đã phát sinh giao dịch: chuyển status sang INACTIVE (soft delete)
            service.setStatus(ServiceStatus.INACTIVE);
            serviceRepository.save(service);
            log.info("Dịch vụ #{} ({}) đã phát sinh giao dịch nên được chuyển sang INACTIVE", id, service.getName());
            return false;
        } else {
            // Chưa dùng lần nào: Xóa cứng
            serviceRepository.delete(service);
            log.info("Admin xóa cứng dịch vụ #{} ({})", id, service.getName());
            return true;
        }
    }
}
