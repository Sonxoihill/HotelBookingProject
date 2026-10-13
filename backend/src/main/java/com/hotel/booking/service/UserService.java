package com.hotel.booking.service;

import com.hotel.booking.dto.auth.LoginRequest;
import com.hotel.booking.dto.auth.LoginResponse;
import com.hotel.booking.dto.user.ChangePasswordRequest;
import com.hotel.booking.dto.user.UpdateProfileRequest;
import com.hotel.booking.dto.user.UserProfileResponse;

public interface UserService {
    UserProfileResponse getProfile(String email);
    UserProfileResponse updateProfile(String email, UpdateProfileRequest request);
    void changePassword(String email, ChangePasswordRequest request);
    LoginResponse login(LoginRequest request);
}
