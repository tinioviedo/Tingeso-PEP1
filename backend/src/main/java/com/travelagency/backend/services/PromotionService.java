package com.travelagency.backend.services;

import com.travelagency.backend.entities.PromotionEntity;
import com.travelagency.backend.repositories.PromotionRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class PromotionService {

    private final PromotionRepository promotionRepository;

    public PromotionService(PromotionRepository promotionRepository) {
        this.promotionRepository = promotionRepository;
    }

    public PromotionEntity createPromotion(PromotionEntity promotion) {
        if (promotion.getName() == null || promotion.getName().isBlank()) {
            throw new IllegalArgumentException("Promotion name is required.");
        }
        if (promotion.getDiscountRate() == null || promotion.getDiscountRate() <= 0 || promotion.getDiscountRate() >= 1) {
            throw new IllegalArgumentException("Discount rate must be between 0 and 1.");
        }
        if (promotion.getStartDate() == null || promotion.getEndDate() == null) {
            throw new IllegalArgumentException("Start date and end date are required.");
        }
        if (!promotion.getEndDate().isAfter(promotion.getStartDate())) {
            throw new IllegalArgumentException("End date must be after start date.");
        }
        promotion.setActive(true);
        return promotionRepository.save(promotion);
    }

    public List<PromotionEntity> getAllPromotions() {
        return promotionRepository.findAll();
    }

    public PromotionEntity getPromotionById(Long id) {
        return promotionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Promotion not found: " + id));
    }

    public PromotionEntity updatePromotion(Long id, PromotionEntity updates) {
        PromotionEntity existing = getPromotionById(id);

        if (updates.getName() != null && !updates.getName().isBlank()) {
            existing.setName(updates.getName());
        }
        if (updates.getDiscountRate() != null) {
            if (updates.getDiscountRate() <= 0 || updates.getDiscountRate() >= 1) {
                throw new IllegalArgumentException("Discount rate must be between 0 and 1.");
            }
            existing.setDiscountRate(updates.getDiscountRate());
        }
        if (updates.getStartDate() != null) {
            existing.setStartDate(updates.getStartDate());
        }
        if (updates.getEndDate() != null) {
            if (!updates.getEndDate().isAfter(existing.getStartDate())) {
                throw new IllegalArgumentException("End date must be after start date.");
            }
            existing.setEndDate(updates.getEndDate());
        }
        return promotionRepository.save(existing);
    }

    public PromotionEntity changeStatus(Long id, Boolean active) {
        PromotionEntity existing = getPromotionById(id);
        existing.setActive(active);
        return promotionRepository.save(existing);
    }

    public List<PromotionEntity> getActivePromotions() {
        return promotionRepository.findActivePromotions(LocalDate.now());
    }
}