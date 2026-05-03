package com.travelagency.backend.services;

import com.travelagency.backend.entities.DiscountEntity;
import com.travelagency.backend.enums.DiscountType;
import com.travelagency.backend.enums.ReservationStatus;
import com.travelagency.backend.repositories.DiscountRepository;
import com.travelagency.backend.repositories.ReservationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class DiscountService {

    private static final double MAX_TOTAL_DISCOUNT_RATE = 0.20;

    @Autowired
    private DiscountRepository discountRepository;

    @Autowired
    private ReservationRepository reservationRepository;

    public DiscountEntity createDiscount(DiscountEntity discount) {
        if (discountRepository.findByDiscountTypeAndActiveTrue(discount.getDiscountType()).isPresent()) {
            throw new IllegalArgumentException("An active discount of this type already exists.");
        }
        if (discount.getDiscountRate() <= 0 || discount.getDiscountRate() >= 1) {
            throw new IllegalArgumentException("Discount rate must be between 0 and 1.");
        }
        if (discount.getMinThreshold() <= 0) {
            throw new IllegalArgumentException("Min threshold must be greater than zero.");
        }
        discount.setActive(true);
        return discountRepository.save(discount);
    }

    public List<DiscountEntity> getAllDiscounts() {
        return discountRepository.findAll();
    }

    public DiscountEntity updateDiscount(Long id, DiscountEntity updates) {
        DiscountEntity existing = discountRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Discount not found: " + id));

        if (updates.getDiscountRate() != null && updates.getDiscountRate() > 0 && updates.getDiscountRate() < 1) {
            existing.setDiscountRate(updates.getDiscountRate());
        }
        if (updates.getMinThreshold() != null && updates.getMinThreshold() > 0) {
            existing.setMinThreshold(updates.getMinThreshold());
        }
        return discountRepository.save(existing);
    }

    public DiscountEntity changeStatus(Long id, Boolean active) {
        DiscountEntity existing = discountRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Discount not found: " + id));
        existing.setActive(active);
        return discountRepository.save(existing);
    }

    public DiscountResult calculate(Long clientId, int quantity, double baseAmount, boolean isMultiplePackagesOperation) {
        List<String> applied = new ArrayList<>();
        double totalDiscountRate = 0.0;

        // descuento de GROUP
        Optional<DiscountEntity> groupDiscount = discountRepository
                .findByDiscountTypeAndActiveTrue(DiscountType.GROUP);
        if (groupDiscount.isPresent() && quantity >= groupDiscount.get().getMinThreshold()) {
            totalDiscountRate += groupDiscount.get().getDiscountRate();
            applied.add("Group discount: " + (int)(groupDiscount.get().getDiscountRate() * 100) + "%");
        }

        // descuento de FREQUENT_CLIENT
        Optional<DiscountEntity> frequentDiscount = discountRepository
                .findByDiscountTypeAndActiveTrue(DiscountType.FREQUENT_CLIENT);
        if (frequentDiscount.isPresent()) {
            long paidReservations = reservationRepository
                    .countByClient_IdAndReservationStatus(clientId, ReservationStatus.CONFIRMED);
            if (paidReservations >= frequentDiscount.get().getMinThreshold()) {
                totalDiscountRate += frequentDiscount.get().getDiscountRate();
                applied.add("Frequent client discount: " + (int)(frequentDiscount.get().getDiscountRate() * 100) + "%");
            }
        }
        // descuento por compra de MULTIPLE_PACKAGE
        Optional<DiscountEntity> multipleDiscount = discountRepository
                .findByDiscountTypeAndActiveTrue(DiscountType.MULTIPLE_PACKAGES);
        if (multipleDiscount.isPresent()) {
            boolean applies = false;
            // 2 casos (A y B)
            // Caso A: misma operación con más de un paquete
            if (isMultiplePackagesOperation) {
                applies = true;
            } else {
                // Caso B: período definido (últimos 30 días)
                LocalDateTime windowStart = LocalDateTime.now().minusDays(30);
                long recentReservations = reservationRepository
                        .countByClient_IdAndReservationDateAfter(clientId, windowStart);
                if (recentReservations >= multipleDiscount.get().getMinThreshold()) {
                    applies = true;
                }
            }

            if (applies) {
                totalDiscountRate += multipleDiscount.get().getDiscountRate();
                applied.add("Multiple packages discount: " + (int)(multipleDiscount.get().getDiscountRate() * 100) + "%");
            }
        }
        // Limite maximo 20%
        if (totalDiscountRate > MAX_TOTAL_DISCOUNT_RATE) {
            totalDiscountRate = MAX_TOTAL_DISCOUNT_RATE;
        }

        double discountAmount = baseAmount * totalDiscountRate;
        double totalAmount = baseAmount - discountAmount;

        if (totalAmount < 0) totalAmount = 0.0;

        return new DiscountResult(discountAmount, totalAmount, String.join(", ", applied));
    }

    public record DiscountResult(
            double discountAmount,
            double totalAmount,
            String appliedDiscounts
    ) {}
}