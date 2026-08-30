package com.travelagency.backend.services;

import com.travelagency.backend.entities.DiscountEntity;
import com.travelagency.backend.entities.PromotionEntity;
import com.travelagency.backend.enums.DiscountType;
import com.travelagency.backend.enums.ReservationStatus;
import com.travelagency.backend.repositories.DiscountRepository;
import com.travelagency.backend.repositories.PromotionRepository;
import com.travelagency.backend.repositories.ReservationRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class DiscountService {

    private static final double MAX_TOTAL_DISCOUNT_RATE = 0.20;

    // Ventana temporal (en días) para el descuento por múltiples paquetes.
    private static final int MULTIPLE_PACKAGES_WINDOW_DAYS = 30;

    private final DiscountRepository discountRepository;
    private final ReservationRepository reservationRepository;
    private final PromotionRepository promotionRepository;

    public DiscountService(DiscountRepository discountRepository,
                           ReservationRepository reservationRepository,
                           PromotionRepository promotionRepository) {
        this.discountRepository = discountRepository;
        this.reservationRepository = reservationRepository;
        this.promotionRepository = promotionRepository;
    }

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

        double totalDiscountRate = groupRate(quantity, applied)
                + frequentClientRate(clientId, applied)
                + multiplePackagesRate(clientId, isMultiplePackagesOperation, applied)
                + activePromotionsRate(applied);

        // El descuento acumulado nunca puede superar el tope configurado.
        totalDiscountRate = Math.min(totalDiscountRate, MAX_TOTAL_DISCOUNT_RATE);

        double discountAmount = baseAmount * totalDiscountRate;
        double totalAmount = Math.max(baseAmount - discountAmount, 0.0);

        return new DiscountResult(discountAmount, totalAmount, String.join(", ", applied));
    }

    // Descuento grupal: aplica cuando la cantidad de pasajeros alcanza el umbral configurado.
    private double groupRate(int quantity, List<String> applied) {
        Optional<DiscountEntity> groupDiscount = discountRepository
                .findByDiscountTypeAndActiveTrue(DiscountType.GROUP);
        if (groupDiscount.isEmpty() || quantity < groupDiscount.get().getMinThreshold()) {
            return 0.0;
        }
        double rate = groupDiscount.get().getDiscountRate();
        applied.add("Descuento grupal: " + toPercent(rate) + "%");
        return rate;
    }

    // Cliente frecuente: se cuentan las reservas ya confirmadas (pagadas) del cliente.
    private double frequentClientRate(Long clientId, List<String> applied) {
        Optional<DiscountEntity> frequentDiscount = discountRepository
                .findByDiscountTypeAndActiveTrue(DiscountType.FREQUENT_CLIENT);
        if (frequentDiscount.isEmpty()) {
            return 0.0;
        }
        long paidReservations = reservationRepository
                .countByClient_IdAndReservationStatus(clientId, ReservationStatus.CONFIRMED);
        if (paidReservations < frequentDiscount.get().getMinThreshold()) {
            return 0.0;
        }
        double rate = frequentDiscount.get().getDiscountRate();
        applied.add("Descuento cliente frecuente: " + toPercent(rate) + "%");
        return rate;
    }

    // Múltiples paquetes, dos casos posibles:
    //   Caso A: la misma operación incluye más de un paquete.
    //   Caso B: el cliente acumula reservas dentro de la ventana de días definida.
    private double multiplePackagesRate(Long clientId, boolean isMultiplePackagesOperation, List<String> applied) {
        Optional<DiscountEntity> multipleDiscount = discountRepository
                .findByDiscountTypeAndActiveTrue(DiscountType.MULTIPLE_PACKAGES);
        if (multipleDiscount.isEmpty()) {
            return 0.0;
        }
        boolean applies = isMultiplePackagesOperation
                || hasRecentReservations(clientId, multipleDiscount.get().getMinThreshold());
        if (!applies) {
            return 0.0;
        }
        double rate = multipleDiscount.get().getDiscountRate();
        applied.add("Descuento múltiples paquetes: " + toPercent(rate) + "%");
        return rate;
    }

    private boolean hasRecentReservations(Long clientId, double minThreshold) {
        LocalDateTime windowStart = LocalDateTime.now().minusDays(MULTIPLE_PACKAGES_WINDOW_DAYS);
        return reservationRepository
                .countByClient_IdAndReservationDateAfter(clientId, windowStart) >= minThreshold;
    }

    // Promociones vigentes en la fecha actual: todas suman al descuento total.
    private double activePromotionsRate(List<String> applied) {
        double rate = 0.0;
        for (PromotionEntity promo : promotionRepository.findActivePromotions(LocalDate.now())) {
            rate += promo.getDiscountRate();
            applied.add("Promoción '" + promo.getName() + "': " + toPercent(promo.getDiscountRate()) + "%");
        }
        return rate;
    }

    private int toPercent(double rate) {
        return (int) (rate * 100);
    }

    public record DiscountResult(
            double discountAmount,
            double totalAmount,
            String appliedDiscounts
    ) {}
}