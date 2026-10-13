package com.hotel.booking.repository;

import com.hotel.booking.entity.Service;
import com.hotel.booking.enums.ServiceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ServiceRepository extends JpaRepository<Service, Long> {
    Optional<Service> findByName(String name);
    List<Service> findByStatus(ServiceStatus status);
}
