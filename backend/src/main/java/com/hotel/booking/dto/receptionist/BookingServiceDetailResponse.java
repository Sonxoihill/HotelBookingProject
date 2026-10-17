package com.hotel.booking.dto.receptionist;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookingServiceDetailResponse {

    private Long id;
    private Long serviceId;
    private String serviceName;
    private String unit;
    private BigDecimal unitPrice;
    private Integer quantity;
    private BigDecimal totalPrice;
    private LocalDateTime createdAt;

    public BigDecimal getTotalAmount() {
        return totalPrice != null ? totalPrice : (unitPrice != null && quantity != null ? unitPrice.multiply(BigDecimal.valueOf(quantity)) : BigDecimal.ZERO);
    }
}
