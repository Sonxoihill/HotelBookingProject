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
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.math.BigDecimal;
import java.net.URI;
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
        return createVNPayPaymentUrl(bookingId, amount, ipAddress, null);
    }

    @Override
    @Transactional(readOnly = true)
    public String createVNPayPaymentUrl(Long bookingId, BigDecimal amount, String ipAddress, String customReturnUrl) {
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
        vnpParams.put("vnp_ReturnUrl", resolveReturnUrl(customReturnUrl));
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

    /**
     * Tự động giải quyết returnUrl cho VNPay:
     * 1. customReturnUrl truyền trực tiếp
     * 2. Query param 'returnUrl' từ client
     * 3. Domain header 'Origin' (ví dụ: http://localhost:5173 hoặc https://hotelbookingproject-fontend-l6ru.onrender.com)
     * 4. Domain header 'Referer'
     * 5. Fallback về cấu hình vnPayConfig.getReturnUrl()
     */
    private String resolveReturnUrl(String customReturnUrl) {
        if (customReturnUrl != null && !customReturnUrl.trim().isEmpty()) {
            return customReturnUrl.trim();
        }

        try {
            ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
            if (attributes != null) {
                HttpServletRequest request = attributes.getRequest();
                // 1. Kiểm tra query param 'returnUrl' nếu client gửi lên
                String paramReturnUrl = request.getParameter("returnUrl");
                if (paramReturnUrl != null && !paramReturnUrl.trim().isEmpty()) {
                    return paramReturnUrl.trim();
                }

                // 2. Kiểm tra header Origin
                String origin = request.getHeader("Origin");
                if (origin != null && !origin.trim().isEmpty()) {
                    String cleanOrigin = origin.replaceAll("/+$", "");
                    if (cleanOrigin.contains("localhost:8080") || cleanOrigin.contains("127.0.0.1:8080")) {
                        cleanOrigin = cleanOrigin.replace(":8080", ":5173");
                    }
                    return cleanOrigin + "/api/v1/payment/vnpay-return";
                }

                // 3. Kiểm tra header Referer
                String referer = request.getHeader("Referer");
                if (referer != null && !referer.trim().isEmpty()) {
                    URI uri = URI.create(referer);
                    String host = uri.getHost();
                    int port = uri.getPort();
                    String scheme = uri.getScheme() != null ? uri.getScheme() : "http";
                    if (("localhost".equalsIgnoreCase(host) || "127.0.0.1".equals(host)) && port == 8080) {
                        port = 5173;
                    }
                    String base = scheme + "://" + host + (port > 0 ? ":" + port : "");
                    return base + "/api/v1/payment/vnpay-return";
                }
            }
        } catch (Exception e) {
            log.warn("Không thể xác định dynamic returnUrl từ request context: {}", e.getMessage());
        }

        return vnPayConfig.getReturnUrl();
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
            // Thanh toán thành công: Cập nhật đơn hàng thành CONFIRMED và cập nhật tiền đã trả
            booking.setStatus(BookingStatus.CONFIRMED);
            booking.setPaidAmount(booking.getTotalAmount());
            Room room = booking.getRoom();
            if (room != null && (room.getStatus() == RoomStatus.AVAILABLE || room.getStatus() == RoomStatus.ON_HOLD)) {
                room.setStatus(RoomStatus.RESERVED);
                roomRepository.save(room);
            }
            bookingRepository.save(booking);

            saveOrUpdateTransaction(booking, PaymentStatus.SUCCESS);
            log.info("VNPay IPN: Đơn đặt phòng #{} thanh toán thành công (CONFIRMED), phòng #{} chuyển sang RESERVED.",
                    bookingId, room != null ? room.getRoomNumber() : null);

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
            if (booking != null) {
                boolean needsSave = false;
                if (booking.getStatus() != BookingStatus.CONFIRMED) {
                    booking.setStatus(BookingStatus.CONFIRMED);
                    needsSave = true;
                }
                if (booking.getPaidAmount() == null || booking.getPaidAmount().compareTo(BigDecimal.ZERO) == 0) {
                    booking.setPaidAmount(booking.getTotalAmount());
                    needsSave = true;
                }
                Room room = booking.getRoom();
                if (room != null && (room.getStatus() == RoomStatus.AVAILABLE || room.getStatus() == RoomStatus.ON_HOLD)) {
                    room.setStatus(RoomStatus.RESERVED);
                    roomRepository.save(room);
                }
                if (needsSave) {
                    bookingRepository.save(booking);
                }

                saveOrUpdateTransaction(booking, PaymentStatus.SUCCESS);
                log.info("VNPay Return: Đơn đặt phòng #{} đã được cập nhật thành CONFIRMED, phòng chuyển sang RESERVED.", bookingId);

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
