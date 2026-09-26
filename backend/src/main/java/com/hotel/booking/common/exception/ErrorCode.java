package com.hotel.booking.common.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum ErrorCode {
    // 200 / Common
    SUCCESS(HttpStatus.OK, "Thành công"),

    // 400 Bad Request
    BAD_REQUEST(HttpStatus.BAD_REQUEST, "Yêu cầu không hợp lệ"),
    VALIDATION_ERROR(HttpStatus.BAD_REQUEST, "Dữ liệu đầu vào không hợp lệ"),
    INVALID_CREDENTIALS(HttpStatus.BAD_REQUEST, "Thông tin đăng nhập không chính xác"),
    ROOM_NOT_AVAILABLE(HttpStatus.BAD_REQUEST, "Phòng không còn khả dụng trong khoảng thời gian này"),

    // 401 Unauthorized
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "Chưa xác thực hoặc phiên đăng nhập đã hết hạn"),

    // 403 Forbidden
    FORBIDDEN(HttpStatus.FORBIDDEN, "Bạn không có quyền thực hiện hành động này"),

    // 404 Not Found
    RESOURCE_NOT_FOUND(HttpStatus.NOT_FOUND, "Không tìm thấy tài nguyên yêu cầu"),
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "Không tìm thấy người dùng"),
    HOTEL_NOT_FOUND(HttpStatus.NOT_FOUND, "Không tìm thấy khách sạn"),
    ROOM_NOT_FOUND(HttpStatus.NOT_FOUND, "Không tìm thấy phòng"),
    BOOKING_NOT_FOUND(HttpStatus.NOT_FOUND, "Không tìm thấy đơn đặt phòng"),

    // 409 Conflict
    CONFLICT(HttpStatus.CONFLICT, "Dữ liệu đã tồn tại hoặc bị xung đột"),
    EMAIL_ALREADY_EXISTS(HttpStatus.CONFLICT, "Email đã được sử dụng"),
    PHONE_ALREADY_EXISTS(HttpStatus.CONFLICT, "Số điện thoại đã được sử dụng"),

    // 500 Internal Server Error
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "Đã xảy ra lỗi máy chủ nội bộ");

    private final HttpStatus httpStatus;
    private final String defaultMessage;

    ErrorCode(HttpStatus httpStatus, String defaultMessage) {
        this.httpStatus = httpStatus;
        this.defaultMessage = defaultMessage;
    }
}
