package com.hotel.booking.common.exception;

public class RoomConflictException extends AppException {

    public RoomConflictException(String message) {
        super(ErrorCode.CONFLICT, message);
    }

    public RoomConflictException(ErrorCode errorCode, String message) {
        super(errorCode, message);
    }
}
