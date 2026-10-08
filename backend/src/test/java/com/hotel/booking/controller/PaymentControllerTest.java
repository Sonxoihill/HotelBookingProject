package com.hotel.booking.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hotel.booking.config.JwtUtil;
import com.hotel.booking.dto.payment.VNPayIpnResponse;
import com.hotel.booking.security.jwt.JwtAuthenticationFilter;
import com.hotel.booking.security.jwt.JwtUtils;
import com.hotel.booking.service.PaymentService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.jpa.mapping.JpaMetamodelMappingContext;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(PaymentController.class)
@AutoConfigureMockMvc(addFilters = false)
class PaymentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private JpaMetamodelMappingContext jpaMappingContext;

    @MockBean
    private PaymentService paymentService;

    @MockBean
    private JwtUtil jwtUtil;

    @MockBean
    private JwtUtils jwtUtils;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Test
    @DisplayName("API 1: GET /payment/create-url - Trả về HTTP 200 kèm link VNPay redirect")
    void testCreatePaymentUrl_Success() throws Exception {
        String mockPaymentUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?vnp_Amount=100000000&vnp_TxnRef=1";
        when(paymentService.createVNPayPaymentUrl(eq(1L), any(), any())).thenReturn(mockPaymentUrl);

        mockMvc.perform(get("/payment/create-url")
                        .param("bookingId", "1")
                        .param("amount", "1000000"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.paymentUrl").value(mockPaymentUrl))
                .andExpect(jsonPath("$.data.url").value(mockPaymentUrl));
    }

    @Test
    @DisplayName("API 2: GET /payment/vnpay-ipn - Trả về đúng format VNPay JSON: RspCode 00 và Confirm Success")
    void testProcessVNPayIpn_Success() throws Exception {
        when(paymentService.processVNPayIpn(any())).thenReturn(new VNPayIpnResponse("00", "Confirm Success"));

        mockMvc.perform(get("/payment/vnpay-ipn")
                        .param("vnp_TxnRef", "1")
                        .param("vnp_Amount", "100000000")
                        .param("vnp_ResponseCode", "00")
                        .param("vnp_SecureHash", "mock_hash"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.RspCode").value("00"))
                .andExpect(jsonPath("$.Message").value("Confirm Success"));
    }

    @Test
    @DisplayName("API 2: GET /payment/vnpay-ipn - Checksum giả mạo trả về RspCode 97 và Invalid Checksum")
    void testProcessVNPayIpn_InvalidChecksum() throws Exception {
        when(paymentService.processVNPayIpn(any())).thenReturn(new VNPayIpnResponse("97", "Invalid Checksum"));

        mockMvc.perform(get("/payment/vnpay-ipn")
                        .param("vnp_TxnRef", "1")
                        .param("vnp_Amount", "100000000")
                        .param("vnp_ResponseCode", "00")
                        .param("vnp_SecureHash", "tampered_hash"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.RspCode").value("97"))
                .andExpect(jsonPath("$.Message").value("Invalid Checksum"));
    }

    @Test
    @DisplayName("GET /payment/vnpay-return - Trả về kết quả giao dịch sau khi khách hoàn tất")
    void testProcessVNPayReturn() throws Exception {
        Map<String, Object> returnData = new HashMap<>();
        returnData.put("isSuccess", true);
        returnData.put("bookingId", 1L);
        returnData.put("message", "Thanh toán thành công");

        when(paymentService.processVNPayReturn(any())).thenReturn(returnData);

        mockMvc.perform(get("/payment/vnpay-return")
                        .param("vnp_TxnRef", "1")
                        .param("vnp_ResponseCode", "00"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.isSuccess").value(true))
                .andExpect(jsonPath("$.data.bookingId").value(1));
    }
}
