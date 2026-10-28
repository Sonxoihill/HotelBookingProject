package com.hotel.booking.service;

import com.hotel.booking.dto.admin.AdminServiceRequest;
import com.hotel.booking.entity.Service;

import java.util.List;

public interface AdminServiceService {
    List<Service> getAllServices();

    Service getServiceById(Long id);

    Service createService(AdminServiceRequest request);

    Service updateService(Long id, AdminServiceRequest request);

    /**
     * Xóa dịch vụ:
     * - Nếu đã có trong booking_services: chuyển status sang INACTIVE (soft delete), trả về false
     * - Nếu chưa dùng lần nào: xóa cứng khỏi DB, trả về true
     */
    boolean deleteService(Long id);
}
