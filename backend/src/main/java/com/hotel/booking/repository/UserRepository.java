package com.hotel.booking.repository;

import com.hotel.booking.entity.User;
import com.hotel.booking.enums.UserRole;
import com.hotel.booking.enums.UserStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    Optional<User> findByPhone(String phone);
    boolean existsByPhone(String phone);
    List<User> findByRole(UserRole role);
    List<User> findByStatus(UserStatus status);
}
