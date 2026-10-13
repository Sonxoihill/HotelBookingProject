package com.hotel.booking.repository;

import com.hotel.booking.entity.DynamicPricing;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface DynamicPricingRepository extends JpaRepository<DynamicPricing, Long> {
    List<DynamicPricing> findByCategoryId(Long categoryId);
    List<DynamicPricing> findByCategoryIdAndStartDateLessThanEqualAndEndDateGreaterThanEqual(
            Long categoryId, LocalDate date1, LocalDate date2);
}
