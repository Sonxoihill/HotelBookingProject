package com.hotel.booking.service.impl;

import com.hotel.booking.common.exception.BadRequestException;
import com.hotel.booking.common.exception.ResourceNotFoundException;
import com.hotel.booking.config.vnpay.VNPayConfig;
import com.hotel.booking.config.vnpay.VNPayUtil;
import com.hotel.booking.dto.payment.VNPayIpnResponse;
import com.hotel.booking.entity.Booking;
import com.hotel.booking.entity.Room;
import com.hotel.booking.entity.Transaction;
import com.hotel.booking.enums.BookingStatus;
import com.hotel.booking.enums.PaymentMethod;
import com.hotel.booking.enums.PaymentStatus;
import com.hotel.booking.enums.RoomStatus;
import com.hotel.booking.repository.BookingRepository;
import com.hotel.booking.repository.RoomRepository;
import com.hotel.booking.repository.TransactionRepository;
import com.hotel.booking.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final VNPayConfig vnPayConfig;
    private final BookingRepository bookingRepository;
    private final RoomRepository roomRepository;
    private final TransactionRepository transactionRepository;
    private final com.hotel.booking.service.EmailService emailService;

    private static final DateTimeFormatter VNP_DATE_FORMAT = DateTimeFormatter.ofPattern("yyyyMMddHHmmss");
    private static final ZoneId VIETNAM_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");

    @Override
    @Transactional(readOnly = true)
    public String createVNPayPaymentUrl(Long bookingId, BigDecimal amount, String ipAddress) {
        if (bookingId == null) {
            throw new BadRequestException("bookingId không được để trống!");
        }

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking", "id", bookingId));

        BigDecimal paymentAmount = (amount != null && amount.compareTo(BigDecimal.ZERO) > 0)
                ? amount
                : booking.getTotalAmount();

        if (paymentAmount == null || paymentAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Số tiền thanh toán không hợp lệ!");
        }

        // Chuyển số tiền sang định dạng VNPay (VND x 100)
        long vnpAmount = paymentAmount.multiply(BigDecimal.valueOf(100)).longValue();

        ZonedDateTime now = ZonedDateTime.now(VIETNAM_ZONE);
        String createDate = now.format(VNP_DATE_FORMAT);
        String expireDate = now.plusMinutes(15).format(VNP_DATE_FORMAT);

        Map<String, String> vnpParams = new HashMap<>();
        vnpParams.put("vnp_Version", vnPayConfig.getVersion());
        vnpParams.put("vnp_Command", vnPayConfig.getCommand());
        vnpParams.put("vnp_TmnCode", vnPayConfig.getTmnCode());
        vnpParams.put("vnp_Amount", String.valueOf(vnpAmount));
        vnpParams.put("vnp_CurrCode", "VND");
        vnpParams.put("vnp_TxnRef", String.valueOf(bookingId));
        vnpParams.put("vnp_OrderInfo", "Thanh toan don dat phong #" + bookingId);
        vnpParams.put("vnp_OrderType", "other");
        vnpParams.put("vnp_Locale", "vn");
        vnpParams.put("vnp_ReturnUrl", vnPayConfig.getReturnUrl());
        vnpParams.put("vnp_IpAddr", (ipAddress != null && !ipAddress.trim().isEmpty()) ? ipAddress : "127.0.0.1");
        vnpParams.put("vnp_CreateDate", createDate);
        vnpParams.put("vnp_ExpireDate", expireDate);

        // Băm SHA512 bằng vnp_HashSecret
        String secureHash = VNPayUtil.hashAllFields(vnpParams, vnPayConfig.getHashSecret());
        String queryUrl = VNPayUtil.buildQueryUrl(vnpParams) + "&vnp_SecureHash=" + secureHash;

        String paymentUrl = vnPayConfig.getPayUrl() + "?" + queryUrl;
        log.info("Đã tạo URL thanh toán VNPay thành công cho Booking #{}: {}", bookingId, paymentUrl);
        return paymentUrl;
    }

    @Override
    @Transactional
    public VNPayIpnResponse processVNPayIpn(Map<String, String> params) {
        if (params == null || params.isEmpty()) {
            return new VNPayIpnResponse("99", "Unknown error");
        }

        String vnpSecureHash = params.get("vnp_SecureHash");
        if (vnpSecureHash == null || vnpSecureHash.trim().isEmpty()) {
            log.warn("VNPay IPN: Thiếu vnp_SecureHash trong request");
            return new VNPayIpnResponse("97", "Invalid Checksum");
        }

        // 1. Verify Checksum lại chuỗi hash để chống giả mạo
        Map<String, String> fieldsToHash = new HashMap<>(params);
        fieldsToHash.remove("vnp_SecureHash");
        fieldsToHash.remove("vnp_SecureHashType");

        String calculatedHash = VNPayUtil.hashAllFields(fieldsToHash, vnPayConfig.getHashSecret());
        if (!calculatedHash.equalsIgnoreCase(vnpSecureHash)) {
            log.warn("VNPay IPN: Checksum không hợp lệ! Checksum nhận: {}, Checksum tính toán: {}", vnpSecureHash, calculatedHash);
            return new VNPayIpnResponse("97", "Invalid Checksum");
        }

        // 2. Tìm kiếm đơn đặt phòng từ vnp_TxnRef
        String txnRef = params.get("vnp_TxnRef");
        Long bookingId = extractBookingId(txnRef);
        if (bookingId == null) {
            log.warn("VNPay IPN: Không phân tích được bookingId từ vnp_TxnRef: {}", txnRef);
            return new VNPayIpnResponse("01", "Order not Found");
        }

        Booking booking = bookingRepository.findById(bookingId).orElse(null);
        if (booking == null) {
            log.warn("VNPay IPN: Đơn đặt phòng #{} không tồn tại trong hệ thống", bookingId);
            return new VNPayIpnResponse("01", "Order not Found");
        }

        // 3. Kiểm tra trạng thái đơn hàng: nếu đã xác nhận trước đó thì không cập nhật lại
        if (booking.getStatus() == BookingStatus.CONFIRMED) {
            log.info("VNPay IPN: Đơn đặt phòng #{} đã được xác nhận trước đó", bookingId);
            return new VNPayIpnResponse("02", "Order already confirmed");
        }

        // 4. Kiểm tra số tiền thanh toán
        String vnpAmountStr = params.get("vnp_Amount");
        if (vnpAmountStr != null && !vnpAmountStr.trim().isEmpty()) {
            try {
                long vnpAmount = Long.parseLong(vnpAmountStr.trim());
                long expectedAmount = booking.getTotalAmount().multiply(BigDecimal.valueOf(100)).longValue();
                if (vnpAmount != expectedAmount) {
                    log.warn("VNPay IPN: Số tiền không khớp cho booking #{}. Expected {}, got {}", bookingId, expectedAmount, vnpAmount);
                    return new VNPayIpnResponse("04", "Invalid Amount");
                }
            } catch (NumberFormatException e) {
                log.warn("VNPay IPN: Lỗi định dạng vnp_Amount: {}", vnpAmountStr);
            }
        }

        // 5. Cập nhật trạng thái đơn hàng theo mã vnp_ResponseCode
        String responseCode = params.get("vnp_ResponseCode");
        if ("00".equals(responseCode)) {
            // Thanh toán thành công: Cập nhật đơn hàng thành CONFIRMED
            booking.setStatus(BookingStatus.CONFIRMED);
            bookingRepository.save(booking);

            saveOrUpdateTransaction(booking, PaymentStatus.SUCCESS);
            log.info("VNPay IPN: Đơn đặt phòng #{} thanh toán thành công (CONFIRMED).", bookingId);

            // SCRUM-95: Gửi email xác nhận đặt phòng tự động bất đồng bộ (@Async)
            try {
                emailService.sendBookingConfirmationEmail(booking);
            } catch (Exception ex) {
                log.error("Lỗi khi kích hoạt luồng gửi email xác nhận cho đơn #{}: {}", bookingId, ex.getMessage());
            }

            return new VNPayIpnResponse("00", "Confirm Success");
        } else {
            // Thanh toán thất bại hoặc khách hủy: Cập nhật đơn hàng thành FAILED
            booking.setStatus(BookingStatus.FAILED);

            // Nhả phòng từ ON_HOLD về AVAILABLE
            Room room = booking.getRoom();
            if (room != null && room.getStatus() == RoomStatus.ON_HOLD) {
                room.setStatus(RoomStatus.AVAILABLE);
                roomRepository.saveAndFlush(room);
            }
            bookingRepository.save(booking);

            saveOrUpdateTransaction(booking, PaymentStatus.FAILED);
            log.warn("VNPay IPN: Đơn đặt phòng #{} thanh toán thất bại (FAILED), mã lỗi: {}", bookingId, responseCode);
            return new VNPayIpnResponse("00", "Confirm Success");
        }
    }

    @Override
    @Transactional
    public Map<String, Object> processVNPayReturn(Map<String, String> params) {
        Map<String, Object> result = new HashMap<>();
        if (params == null || params.isEmpty()) {
            result.put("isSuccess", false);
            result.put("message", "Tham số không hợp lệ");
            return result;
        }

        String vnpSecureHash = params.get("vnp_SecureHash");
        Map<String, String> fieldsToHash = new HashMap<>(params);
        fieldsToHash.remove("vnp_SecureHash");
        fieldsToHash.remove("vnp_SecureHashType");

        String calculatedHash = VNPayUtil.hashAllFields(fieldsToHash, vnPayConfig.getHashSecret());
        boolean isValidChecksum = calculatedHash.equalsIgnoreCase(vnpSecureHash);

        String txnRef = params.get("vnp_TxnRef");
        Long bookingId = extractBookingId(txnRef);
        String responseCode = params.get("vnp_ResponseCode");
        boolean isSuccess = isValidChecksum && "00".equals(responseCode);

        result.put("isSuccess", isSuccess);
        result.put("bookingId", bookingId);
        result.put("responseCode", responseCode);
        result.put("message", isSuccess ? "Thanh toán thành công" : "Thanh toán thất bại hoặc không hợp lệ");
        result.put("amount", params.get("vnp_Amount"));
        result.put("transactionNo", params.get("vnp_TransactionNo"));

        // Đồng bộ cập nhật trạng thái đơn hàng khi khách hàng quay lại từ cổng VNPay
        if (isSuccess && bookingId != null) {
            Booking booking = bookingRepository.findById(bookingId).orElse(null);
            if (booking != null && booking.getStatus() != BookingStatus.CONFIRMED) {
                booking.setStatus(BookingStatus.CONFIRMED);
                bookingRepository.save(booking);

                saveOrUpdateTransaction(booking, PaymentStatus.SUCCESS);
                log.info("VNPay Return: Đơn đặt phòng #{} đã được cập nhật thành CONFIRMED.", bookingId);

                // SCRUM-95: Gửi email xác nhận đặt phòng tự động bất đồng bộ (@Async)
                try {
                    emailService.sendBookingConfirmationEmail(booking);
                } catch (Exception ex) {
                    log.error("Lỗi khi kích hoạt luồng gửi email xác nhận cho đơn #{}: {}", bookingId, ex.getMessage());
                }
            }
        } else if (isValidChecksum && !"00".equals(responseCode) && bookingId != null) {
            Booking booking = bookingRepository.findById(bookingId).orElse(null);
            if (booking != null && booking.getStatus() == BookingStatus.PENDING) {
                booking.setStatus(BookingStatus.FAILED);
                Room room = booking.getRoom();
                if (room != null && room.getStatus() == RoomStatus.ON_HOLD) {
                    room.setStatus(RoomStatus.AVAILABLE);
                    roomRepository.saveAndFlush(room);
                }
                bookingRepository.save(booking);

                saveOrUpdateTransaction(booking, PaymentStatus.FAILED);
                log.warn("VNPay Return: Đơn đặt phòng #{} thanh toán thất bại (FAILED), mã lỗi: {}", bookingId, responseCode);
            }
        }

        return result;
    }

    private Long extractBookingId(String txnRef) {
        if (txnRef == null || txnRef.trim().isEmpty()) {
            return null;
        }
        try {
            String clean = txnRef.contains("_") ? txnRef.split("_")[0] : txnRef;
            return Long.parseLong(clean.trim());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private void saveOrUpdateTransaction(Booking booking, PaymentStatus status) {
        List<Transaction> transactions = transactionRepository.findByBookingId(booking.getId());
        Transaction transaction;
        if (!transactions.isEmpty()) {
            transaction = transactions.get(0);
        } else {
            transaction = Transaction.builder()
                    .booking(booking)
                    .amount(booking.getTotalAmount())
                    .transactionDate(LocalDateTime.now())
                    .build();
        }
        transaction.setPaymentMethod(PaymentMethod.VNPAY);
        transaction.setPaymentStatus(status);
        transactionRepository.save(transaction);
    }
}
