package com.hotel.booking.common.exception;

import lombok.Getter;

@Getter
public class AppException extends RuntimeException {

    private final ErrorCode errorCode;
    private final Object errors;

    public AppException(ErrorCode errorCode) {
        super(errorCode.getDefaultMessage());
        this.errorCode = errorCode;
        this.errors = null;
    }

    public AppException(ErrorCode errorCode, String customMessage) {
        super(customMessage);
        this.errorCode = errorCode;
        this.errors = null;
    }

    public AppException(ErrorCode errorCode, String customMessage, Object errors) {
        super(customMessage);
        this.errorCode = errorCode;
        this.errors = errors;
    }
}
