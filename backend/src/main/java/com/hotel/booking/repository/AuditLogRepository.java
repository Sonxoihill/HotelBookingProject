package com.hotel.booking.repository;

import com.hotel.booking.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findByActorId(Long actorId);
    List<AuditLog> findByTargetUserId(Long targetUserId);
    List<AuditLog> findAllByOrderByCreatedAtDesc();
}
