package com.hotel.booking.repository;

import com.hotel.booking.entity.Transaction;
import com.hotel.booking.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByBookingId(Long bookingId);
    List<Transaction> findByPaymentStatus(PaymentStatus paymentStatus);
}
