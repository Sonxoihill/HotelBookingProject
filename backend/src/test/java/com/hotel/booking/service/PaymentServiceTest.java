package com.hotel.booking.service;

import com.hotel.booking.common.exception.ResourceNotFoundException;
import com.hotel.booking.config.vnpay.VNPayConfig;
import com.hotel.booking.config.vnpay.VNPayUtil;
import com.hotel.booking.dto.payment.VNPayIpnResponse;
import com.hotel.booking.entity.Booking;
import com.hotel.booking.entity.Room;
import com.hotel.booking.entity.Transaction;
import com.hotel.booking.enums.BookingStatus;
import com.hotel.booking.enums.PaymentStatus;
import com.hotel.booking.enums.RoomStatus;
import com.hotel.booking.repository.BookingRepository;
import com.hotel.booking.repository.RoomRepository;
import com.hotel.booking.repository.TransactionRepository;
import com.hotel.booking.service.impl.PaymentServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @Mock
    private VNPayConfig vnPayConfig;

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private RoomRepository roomRepository;

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private EmailService emailService;

    @InjectMocks
    private PaymentServiceImpl paymentService;

    private final String HASH_SECRET = "TESTSECRETKEY1234567890ABCDEFGH";
    private final String TMN_CODE = "TESTTMN01";
    private final String PAY_URL = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
    private final String RETURN_URL = "http://localhost:5173/payment-result";

    private Booking sampleBooking;
    private Room sampleRoom;

    @BeforeEach
    void setUp() {
        sampleRoom = Room.builder()
                .roomNumber("P101")
                .status(RoomStatus.ON_HOLD)
                .build();
        sampleRoom.setId(10L);

        sampleBooking = Booking.builder()
                .checkIn(LocalDate.now().plusDays(1))
                .checkOut(LocalDate.now().plusDays(3))
                .totalAmount(BigDecimal.valueOf(1000000))
                .status(BookingStatus.PENDING)
                .room(sampleRoom)
                .build();
        sampleBooking.setId(1L);
    }

    @Test
    @DisplayName("API 1: Tạo URL thanh toán VNPay thành công với bookingId và băm SHA512")
    void testCreateVNPayPaymentUrl_Success() {
        when(vnPayConfig.getVersion()).thenReturn("2.1.0");
        when(vnPayConfig.getCommand()).thenReturn("pay");
        when(vnPayConfig.getTmnCode()).thenReturn(TMN_CODE);
        when(vnPayConfig.getHashSecret()).thenReturn(HASH_SECRET);
        when(vnPayConfig.getPayUrl()).thenReturn(PAY_URL);
        when(vnPayConfig.getReturnUrl()).thenReturn(RETURN_URL);
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(sampleBooking));

        String paymentUrl = paymentService.createVNPayPaymentUrl(1L, BigDecimal.valueOf(1000000), "127.0.0.1");

        assertNotNull(paymentUrl);
        assertTrue(paymentUrl.startsWith(PAY_URL));
        assertTrue(paymentUrl.contains("vnp_TmnCode=" + TMN_CODE));
        assertTrue(paymentUrl.contains("vnp_Amount=100000000")); // x100
        assertTrue(paymentUrl.contains("vnp_TxnRef=1"));
        assertTrue(paymentUrl.contains("vnp_SecureHash="));
    }

    @Test
    @DisplayName("API 1: Tạo URL thất bại khi không tìm thấy đơn đặt phòng")
    void testCreateVNPayPaymentUrl_NotFound() {
        when(bookingRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                paymentService.createVNPayPaymentUrl(999L, null, "127.0.0.1")
        );
    }

    @Test
    @DisplayName("API 2 (IPN): Checksum không hợp lệ trả về RspCode 97")
    void testProcessVNPayIpn_InvalidChecksum() {
        when(vnPayConfig.getHashSecret()).thenReturn(HASH_SECRET);

        Map<String, String> params = new HashMap<>();
        params.put("vnp_TxnRef", "1");
        params.put("vnp_Amount", "100000000");
        params.put("vnp_ResponseCode", "00");
        params.put("vnp_SecureHash", "INVALID_HASH_VALUE");

        VNPayIpnResponse response = paymentService.processVNPayIpn(params);

        assertNotNull(response);
        assertEquals("97", response.getRspCode());
        assertEquals("Invalid Checksum", response.getMessage());
        verify(bookingRepository, never()).save(any());
    }

    @Test
    @DisplayName("API 2 (IPN): Giao dịch thành công (00) -> cập nhật đơn hàng thành CONFIRMED")
    void testProcessVNPayIpn_Success_00() {
        when(vnPayConfig.getHashSecret()).thenReturn(HASH_SECRET);
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(sampleBooking));
        when(transactionRepository.findByBookingId(1L)).thenReturn(Collections.emptyList());

        Map<String, String> fields = new HashMap<>();
        fields.put("vnp_TxnRef", "1");
        fields.put("vnp_Amount", "100000000");
        fields.put("vnp_ResponseCode", "00");

        String secureHash = VNPayUtil.hashAllFields(fields, HASH_SECRET);
        fields.put("vnp_SecureHash", secureHash);

        VNPayIpnResponse response = paymentService.processVNPayIpn(fields);

        assertNotNull(response);
        assertEquals("00", response.getRspCode());
        assertEquals("Confirm Success", response.getMessage());
        assertEquals(BookingStatus.CONFIRMED, sampleBooking.getStatus());
        verify(bookingRepository, times(1)).save(sampleBooking);
        verify(transactionRepository, times(1)).save(any(Transaction.class));
        verify(emailService, times(1)).sendBookingConfirmationEmail(sampleBooking);
    }

    @Test
    @DisplayName("API 2 (IPN): Giao dịch bị hủy hoặc thất bại (24) -> cập nhật đơn hàng thành FAILED và nhả phòng về AVAILABLE")
    void testProcessVNPayIpn_Failed_24() {
        when(vnPayConfig.getHashSecret()).thenReturn(HASH_SECRET);
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(sampleBooking));
        when(transactionRepository.findByBookingId(1L)).thenReturn(Collections.emptyList());

        Map<String, String> fields = new HashMap<>();
        fields.put("vnp_TxnRef", "1");
        fields.put("vnp_Amount", "100000000");
        fields.put("vnp_ResponseCode", "24"); // Khách hủy giao dịch

        String secureHash = VNPayUtil.hashAllFields(fields, HASH_SECRET);
        fields.put("vnp_SecureHash", secureHash);

        VNPayIpnResponse response = paymentService.processVNPayIpn(fields);

        assertNotNull(response);
        assertEquals("00", response.getRspCode());
        assertEquals("Confirm Success", response.getMessage());
        assertEquals(BookingStatus.FAILED, sampleBooking.getStatus());
        assertEquals(RoomStatus.AVAILABLE, sampleRoom.getStatus()); // Room reverted to AVAILABLE
        verify(bookingRepository, times(1)).save(sampleBooking);
        verify(roomRepository, times(1)).saveAndFlush(sampleRoom);
        verify(transactionRepository, times(1)).save(any(Transaction.class));
    }

    @Test
    @DisplayName("API 2 (IPN): Đơn hàng không tồn tại -> trả về RspCode 01")
    void testProcessVNPayIpn_OrderNotFound() {
        when(vnPayConfig.getHashSecret()).thenReturn(HASH_SECRET);
        when(bookingRepository.findById(999L)).thenReturn(Optional.empty());

        Map<String, String> fields = new HashMap<>();
        fields.put("vnp_TxnRef", "999");
        fields.put("vnp_Amount", "100000000");
        fields.put("vnp_ResponseCode", "00");

        String secureHash = VNPayUtil.hashAllFields(fields, HASH_SECRET);
        fields.put("vnp_SecureHash", secureHash);

        VNPayIpnResponse response = paymentService.processVNPayIpn(fields);

        assertNotNull(response);
        assertEquals("01", response.getRspCode());
        assertEquals("Order not Found", response.getMessage());
    }

    @Test
    @DisplayName("API 2 (IPN): Đơn hàng đã được xác nhận trước đó -> trả về RspCode 02")
    void testProcessVNPayIpn_AlreadyConfirmed() {
        sampleBooking.setStatus(BookingStatus.CONFIRMED);
        when(vnPayConfig.getHashSecret()).thenReturn(HASH_SECRET);
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(sampleBooking));

        Map<String, String> fields = new HashMap<>();
        fields.put("vnp_TxnRef", "1");
        fields.put("vnp_Amount", "100000000");
        fields.put("vnp_ResponseCode", "00");

        String secureHash = VNPayUtil.hashAllFields(fields, HASH_SECRET);
        fields.put("vnp_SecureHash", secureHash);

        VNPayIpnResponse response = paymentService.processVNPayIpn(fields);

        assertNotNull(response);
        assertEquals("02", response.getRspCode());
        assertEquals("Order already confirmed", response.getMessage());
    }
}
