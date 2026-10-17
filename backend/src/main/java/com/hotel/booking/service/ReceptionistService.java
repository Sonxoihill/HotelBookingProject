package com.hotel.booking.service;

import com.hotel.booking.common.response.PageResponse;
import com.hotel.booking.dto.receptionist.*;
import com.hotel.booking.entity.Room;
import com.hotel.booking.enums.BookingStatus;
import com.hotel.booking.enums.RoomStatus;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ReceptionistService {

    /**
     * Lấy sơ đồ phòng (Room Grid / Room Matrix) thời gian thực kèm thông tin đặt phòng đang ở (UC09)
     * Tối ưu N+1 query: lấy danh sách phòng và tóm tắt booking trong 1 câu truy vấn duy nhất.
     *
     * @param floor Tầng tùy chọn để lọc (null nếu xem tất cả)
     * @param status Trạng thái phòng tùy chọn để lọc (null nếu xem tất cả)
     * @return Danh sách các phòng trên sơ đồ kèm tóm tắt booking đang có
     */
    List<RoomGridResponse> getRoomGrid(Integer floor, RoomStatus status);

    /**
     * Xác nhận đã dọn dẹp phòng xong (UC12).
     * Chỉ cho phép chuyển từ DIRTY sang AVAILABLE.
     *
     * @param roomId ID phòng cần cập nhật
     * @return Đối tượng phòng sau khi đã cập nhật trạng thái AVAILABLE
     */
    Room cleanRoom(Long roomId);

    /**
     * Ghi nhận dịch vụ phát sinh cho đơn đặt phòng đang lưu trú (UC11).
     * Chỉ áp dụng cho đơn đặt phòng có trạng thái BookingStatus.CHECKED_IN.
     * Kiểm tra danh sách dịch vụ không rỗng, quantity > 0, dịch vụ tồn tại và ACTIVE.
     * Tính toán quantity * service.price, lưu vào booking_services và cộng dồn vào booking.totalAmount.
     *
     * @param bookingId ID đơn đặt phòng
     * @param items Danh sách dịch vụ và số lượng cần thêm
     * @return Tóm tắt hóa đơn và danh sách dịch vụ mới nhất của đơn đặt phòng
     */
    BookingServicesSummaryResponse addServicesToBooking(Long bookingId, List<AddServiceItemRequest> items);

    /**
     * Lấy danh sách dịch vụ đã phát sinh kèm chi tiết hóa đơn của đơn đặt phòng (UC11).
     *
     * @param bookingId ID đơn đặt phòng
     * @return Tóm tắt hóa đơn và danh sách dịch vụ chi tiết
     */
    BookingServicesSummaryResponse getBookingServices(Long bookingId);

    /**
     * Lấy danh sách và lọc đơn đặt phòng dành cho Lễ tân có phân trang (UC10 - API 1).
     *
     * @param keyword Từ khóa tìm kiếm (mã đơn, tên khách, số điện thoại)
     * @param status Trạng thái đơn đặt phòng cần lọc
     * @param pageable Thông tin phân trang và sắp xếp
     * @return Danh sách đơn đặt phòng phân trang
     */
    PageResponse<ReceptionistBookingResponse> getBookings(String keyword, BookingStatus status, Pageable pageable);

    /**
     * Lễ tân duyệt đơn đặt phòng (UC10 - API 2 - Luồng 3a).
     * Đơn PENDING -> CONFIRMED, Phòng -> RESERVED.
     *
     * @param id ID đơn đặt phòng
     * @return Thông tin đơn đặt phòng sau khi duyệt
     */
    ReceptionistBookingResponse approveBooking(Long id);

    /**
     * Lễ tân hủy đơn đặt phòng (UC10 - API 3 - Luồng 3b).
     * Yêu cầu cancelReason không rỗng. Đơn -> CANCELLED, Phòng -> AVAILABLE.
     *
     * @param id ID đơn đặt phòng
     * @param cancelReason Lý do hủy đơn
     * @return Thông tin đơn đặt phòng sau khi hủy
     */
    ReceptionistBookingResponse cancelBooking(Long id, String cancelReason);

    /**
     * Nhận phòng - Check-in cho khách đến (UC10 - API 4 - Luồng 3c).
     * Chỉ cho phép khi đơn đang CONFIRMED. Đơn -> CHECKED_IN, actualCheckIn = now(), Phòng -> OCCUPIED.
     *
     * @param id ID đơn đặt phòng
     * @return Thông tin đơn đặt phòng sau khi check-in
     */
    ReceptionistBookingResponse checkInBooking(Long id);

    /**
     * Tóm tắt hóa đơn trước Check-out (UC10 - API 5).
     * Tiền phòng + Tổng dịch vụ phát sinh (UC11) - Đã trả trước (paidAmount) = Số tiền cần thu thêm.
     *
     * @param id ID đơn đặt phòng
     * @return Chi tiết hóa đơn và số tiền cần thu thêm
     */
    CheckoutSummaryResponse getCheckoutSummary(Long id);

    /**
     * Xác nhận trả phòng - Check-out (UC10 - API 6).
     * paidAmount = totalAmount, actualCheckOut = now(), Đơn -> CHECKED_OUT, Phòng -> DIRTY trong 1 Transaction.
     *
     * @param id ID đơn đặt phòng
     * @param request Thông tin thanh toán và ghi chú trả phòng
     * @return Thông tin đơn đặt phòng sau khi check-out
     */
    ReceptionistBookingResponse checkOutBooking(Long id, CheckOutRequest request);
}
