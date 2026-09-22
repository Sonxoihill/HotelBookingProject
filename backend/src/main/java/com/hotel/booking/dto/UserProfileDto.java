package com.hotel.booking.dto;

import com.hotel.booking.enums.UserRole;
import com.hotel.booking.enums.UserStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileDto {
    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private String avatarUrl;
    private UserRole role;
    private UserStatus status;
    private LocalDateTime createdAt;
}
