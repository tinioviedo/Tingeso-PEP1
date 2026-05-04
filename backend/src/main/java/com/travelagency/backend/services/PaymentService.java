package com.travelagency.backend.services;

import com.travelagency.backend.entities.PaymentEntity;
import com.travelagency.backend.entities.ReservationEntity;
import com.travelagency.backend.enums.PaymentMethod;
import com.travelagency.backend.enums.PaymentStatus;
import com.travelagency.backend.enums.ReservationStatus;
import com.travelagency.backend.repositories.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PaymentService {

    @Autowired
    private PaymentRepository paymentRepository;

    @Autowired
    private ReservationService reservationService;

    public PaymentEntity processPayment(Long reservationId, String cardNumber,
                                        String cardExpiration, String cardCvv) {
        ReservationEntity reservation = reservationService.getReservationById(reservationId);

        if (reservation.getReservationStatus() == ReservationStatus.CANCELLED) {
            throw new IllegalArgumentException("Cannot pay for a cancelled reservation.");
        }
        if (reservation.getReservationStatus() == ReservationStatus.EXPIRED) {
            throw new IllegalArgumentException("Cannot pay for an expired reservation.");
        }
        if (reservation.getReservationStatus() == ReservationStatus.CONFIRMED) {
            throw new IllegalArgumentException("Reservation is already paid.");
        }
        if (paymentRepository.existsByReservation_Id(reservationId)) {
            throw new IllegalArgumentException("A payment already exists for this reservation.");
        }

        // Validate card data is present (no external validation)
        if (cardNumber == null || cardNumber.isBlank()) {
            throw new IllegalArgumentException("Card number is required.");
        }
        if (cardExpiration == null || cardExpiration.isBlank()) {
            throw new IllegalArgumentException("Card expiration date is required.");
        }
        if (cardCvv == null || cardCvv.isBlank()) {
            throw new IllegalArgumentException("Card CVV is required.");
        }

        // Simulate payment — always approved
        PaymentEntity payment = new PaymentEntity();
        payment.setReservation(reservation);
        payment.setAmount(reservation.getTotalAmount());
        payment.setPaymentMethod(PaymentMethod.CREDIT_CARD);
        payment.setPaymentStatus(PaymentStatus.APPROVED);
        payment.setCardNumber(maskCardNumber(cardNumber));
        payment.setCardExpiration(cardExpiration);
        payment.setCvv("***");

        PaymentEntity saved = paymentRepository.save(payment);

        // Update reservation status to CONFIRMED
        reservationService.confirmReservation(reservationId);

        return saved;
    }

    public PaymentEntity getPaymentByReservationId(Long reservationId) {
        return paymentRepository.findByReservation_Id(reservationId)
                .orElseThrow(() -> new IllegalArgumentException("Payment not found for reservation: " + reservationId));
    }

    public List<PaymentEntity> getAllPayments() {
        return paymentRepository.findAll();
    }

    private String maskCardNumber(String cardNumber) {
        if (cardNumber.length() < 4) return "****";
        return "**** **** **** " + cardNumber.substring(cardNumber.length() - 4);
    }
}