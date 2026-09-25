package com.hotel.booking.dto.auth;

import com.hotel.booking.dto.user.UserProfileResponse;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginResponse {

    private String token;
    private String tokenType;
    private UserProfileResponse user;

    public static LoginResponse of(String token, UserProfileResponse user) {
        return LoginResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .user(user)
                .build();
    }
}
