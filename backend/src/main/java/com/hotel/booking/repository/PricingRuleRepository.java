package com.hotel.booking.repository;

import com.hotel.booking.entity.PricingRule;
import com.hotel.booking.enums.PricingRuleType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface PricingRuleRepository extends JpaRepository<PricingRule, Long> {

    List<PricingRule> findByCategoryId(Long categoryId);

    @Query("SELECT COUNT(r) > 0 FROM PricingRule r WHERE " +
           "(:id IS NULL OR r.id != :id) AND " +
           "r.isActive = true AND " +
           "((:categoryId IS NULL AND r.category IS NULL) OR (r.category IS NOT NULL AND r.category.id = :categoryId)) AND " +
           "r.startDate <= :endDate AND r.endDate >= :startDate")
    boolean existsOverlappingRule(
            @Param("id") Long id,
            @Param("categoryId") Long categoryId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);

    @Query("SELECT r FROM PricingRule r LEFT JOIN FETCH r.category c WHERE " +
           "(:ruleType IS NULL OR r.ruleType = :ruleType) AND " +
           "(:categoryId IS NULL OR (c IS NOT NULL AND c.id = :categoryId)) AND " +
           "(:active IS NULL OR r.isActive = :active) " +
           "ORDER BY r.id DESC")
    List<PricingRule> findAllWithFilters(
            @Param("ruleType") PricingRuleType ruleType,
            @Param("categoryId") Long categoryId,
            @Param("active") Boolean active);

    @Query("SELECT r FROM PricingRule r LEFT JOIN FETCH r.category c WHERE " +
           "r.isActive = true AND " +
           "((:categoryId IS NOT NULL AND c.id = :categoryId) OR c IS NULL) AND " +
           "r.startDate <= :lastNight AND r.endDate >= :checkIn")
    List<PricingRule> findApplicableRules(
            @Param("categoryId") Long categoryId,
            @Param("checkIn") LocalDate checkIn,
            @Param("lastNight") LocalDate lastNight);
}
