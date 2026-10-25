package com.hotel.booking.service.admin;

import com.hotel.booking.dto.admin.PricingRuleRequest;
import com.hotel.booking.dto.admin.PricingRuleResponse;
import com.hotel.booking.enums.PricingRuleType;

import java.util.List;

public interface AdminPricingRuleService {

    List<PricingRuleResponse> getPricingRules(PricingRuleType ruleType, Long categoryId, Boolean active);

    PricingRuleResponse getPricingRuleById(Long id);

    PricingRuleResponse createPricingRule(PricingRuleRequest request);

    PricingRuleResponse updatePricingRule(Long id, PricingRuleRequest request);

    void deletePricingRule(Long id);
}
