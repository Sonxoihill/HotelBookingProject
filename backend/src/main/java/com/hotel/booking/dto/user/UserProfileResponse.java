package com.hotel.booking.dto.user;

import com.hotel.booking.entity.User;
import com.hotel.booking.enums.UserRole;
import com.hotel.booking.enums.UserStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfileResponse {

    private Long id;
    private String email;
    private String fullName;
    private String phone;
    private UserRole role;
    private UserStatus status;
    private LocalDateTime createdAt;

    public static UserProfileResponse fromEntity(User user) {
        if (user == null) return null;
        return UserProfileResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .role(user.getRole())
                .status(user.getStatus())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
