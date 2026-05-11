package com.travelagency.backend.services;

import com.travelagency.backend.entities.PaymentEntity;
import com.travelagency.backend.entities.ReservationEntity;
import com.travelagency.backend.enums.PaymentMethod;
import com.travelagency.backend.enums.PaymentStatus;
import com.travelagency.backend.enums.ReservationStatus;
import com.travelagency.backend.repositories.PaymentRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentServiceTest {

    @InjectMocks
    private PaymentService paymentService;

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private ReservationService reservationService;

    private ReservationEntity pendingReservation;
    private PaymentEntity savedPayment;

    @BeforeEach
    void setUp() {
        pendingReservation = new ReservationEntity();
        pendingReservation.setId(1L);
        pendingReservation.setReservationStatus(ReservationStatus.PENDING);
        pendingReservation.setTotalAmount(3000.0);

        savedPayment = new PaymentEntity();
        savedPayment.setId(10L);
        savedPayment.setReservation(pendingReservation);
        savedPayment.setAmount(3000.0);
        savedPayment.setPaymentMethod(PaymentMethod.CREDIT_CARD);
        savedPayment.setPaymentStatus(PaymentStatus.APPROVED);
        savedPayment.setCardNumber("**** **** **** 4242");
        savedPayment.setCvv("***");
    }

    // ── processPayment ────────────────────────────────────────────────────────

    @Test
    void processPayment_validData_returnsApprovedPayment() {
        // Given
        when(reservationService.getReservationById(1L)).thenReturn(pendingReservation);
        when(paymentRepository.existsByReservation_Id(1L)).thenReturn(false);
        when(paymentRepository.save(any())).thenReturn(savedPayment);
        when(reservationService.confirmReservation(1L)).thenReturn(pendingReservation);

        // When
        PaymentEntity result = paymentService.processPayment(1L, "1234567890124242", "12/27", "123");

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getPaymentStatus()).isEqualTo(PaymentStatus.APPROVED);
        verify(reservationService).confirmReservation(1L);
    }

    @Test
    void processPayment_cancelledReservation_throwsIllegalArgument() {
        // Given
        pendingReservation.setReservationStatus(ReservationStatus.CANCELLED);
        when(reservationService.getReservationById(1L)).thenReturn(pendingReservation);

        // When / Then
        assertThatThrownBy(() -> paymentService.processPayment(1L, "1234", "12/27", "123"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("cancelled");
    }

    @Test
    void processPayment_expiredReservation_throwsIllegalArgument() {
        // Given
        pendingReservation.setReservationStatus(ReservationStatus.EXPIRED);
        when(reservationService.getReservationById(1L)).thenReturn(pendingReservation);

        // When / Then
        assertThatThrownBy(() -> paymentService.processPayment(1L, "1234", "12/27", "123"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("expired");
    }

    @Test
    void processPayment_alreadyConfirmedReservation_throwsIllegalArgument() {
        // Given
        pendingReservation.setReservationStatus(ReservationStatus.CONFIRMED);
        when(reservationService.getReservationById(1L)).thenReturn(pendingReservation);

        // When / Then
        assertThatThrownBy(() -> paymentService.processPayment(1L, "1234", "12/27", "123"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("already paid");
    }

    @Test
    void processPayment_duplicatePayment_throwsIllegalArgument() {
        // Given
        when(reservationService.getReservationById(1L)).thenReturn(pendingReservation);
        when(paymentRepository.existsByReservation_Id(1L)).thenReturn(true);

        // When / Then
        assertThatThrownBy(() -> paymentService.processPayment(1L, "1234", "12/27", "123"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("already exists");
    }

    @Test
    void processPayment_nullCardNumber_throwsIllegalArgument() {
        // Given
        when(reservationService.getReservationById(1L)).thenReturn(pendingReservation);
        when(paymentRepository.existsByReservation_Id(1L)).thenReturn(false);

        // When / Then
        assertThatThrownBy(() -> paymentService.processPayment(1L, null, "12/27", "123"))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Card number");
    }

    @Test
    void processPayment_blankCvv_throwsIllegalArgument() {
        // Given
        when(reservationService.getReservationById(1L)).thenReturn(pendingReservation);
        when(paymentRepository.existsByReservation_Id(1L)).thenReturn(false);

        // When / Then
        assertThatThrownBy(() -> paymentService.processPayment(1L, "1234567890124242", "12/27", ""))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("CVV");
    }

    // ── maskCardNumber (via processPayment) ───────────────────────────────────

    @Test
    void processPayment_masksCardNumberCorrectly() {
        // Given — últimos 4 dígitos deben quedar visibles
        when(reservationService.getReservationById(1L)).thenReturn(pendingReservation);
        when(paymentRepository.existsByReservation_Id(1L)).thenReturn(false);
        when(paymentRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(reservationService.confirmReservation(anyLong())).thenReturn(pendingReservation);

        // When
        PaymentEntity result = paymentService.processPayment(1L, "1234567890124242", "12/27", "123");

        // Then
        assertThat(result.getCardNumber()).isEqualTo("**** **** **** 4242");
    }

    @Test
    void processPayment_masksCvv() {
        // Given
        when(reservationService.getReservationById(1L)).thenReturn(pendingReservation);
        when(paymentRepository.existsByReservation_Id(1L)).thenReturn(false);
        when(paymentRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(reservationService.confirmReservation(anyLong())).thenReturn(pendingReservation);

        // When
        PaymentEntity result = paymentService.processPayment(1L, "1234567890124242", "12/27", "123");

        // Then
        assertThat(result.getCvv()).isEqualTo("***");
    }

    @Test
    void processPayment_shortCardNumber_masksCompletely() {
        // Given — número de tarjeta con menos de 4 dígitos → "****"
        when(reservationService.getReservationById(1L)).thenReturn(pendingReservation);
        when(paymentRepository.existsByReservation_Id(1L)).thenReturn(false);
        when(paymentRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(reservationService.confirmReservation(anyLong())).thenReturn(pendingReservation);

        // When
        PaymentEntity result = paymentService.processPayment(1L, "123", "12/27", "456");

        // Then
        assertThat(result.getCardNumber()).isEqualTo("****");
    }

    @Test
    void processPayment_amountMatchesReservationTotal() {
        // Given
        pendingReservation.setTotalAmount(5500.0);
        when(reservationService.getReservationById(1L)).thenReturn(pendingReservation);
        when(paymentRepository.existsByReservation_Id(1L)).thenReturn(false);
        when(paymentRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));
        when(reservationService.confirmReservation(anyLong())).thenReturn(pendingReservation);

        // When
        PaymentEntity result = paymentService.processPayment(1L, "1234567890124242", "12/27", "321");

        // Then
        assertThat(result.getAmount()).isEqualTo(5500.0);
    }

    // ── getPaymentByReservationId ─────────────────────────────────────────────

    @Test
    void getPaymentByReservationId_existingPayment_returnsPayment() {
        // Given
        when(paymentRepository.findByReservation_Id(1L)).thenReturn(Optional.of(savedPayment));

        // When
        PaymentEntity result = paymentService.getPaymentByReservationId(1L);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getPaymentStatus()).isEqualTo(PaymentStatus.APPROVED);
    }

    @Test
    void getPaymentByReservationId_nonExistingPayment_throwsIllegalArgument() {
        // Given
        when(paymentRepository.findByReservation_Id(99L)).thenReturn(Optional.empty());

        // When / Then
        assertThatThrownBy(() -> paymentService.getPaymentByReservationId(99L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("99");
    }

    @Test
    void getPaymentByReservationId_returnsCorrectAmount() {
        // Given
        when(paymentRepository.findByReservation_Id(1L)).thenReturn(Optional.of(savedPayment));

        // When
        PaymentEntity result = paymentService.getPaymentByReservationId(1L);

        // Then
        assertThat(result.getAmount()).isEqualTo(3000.0);
    }

    @Test
    void getPaymentByReservationId_repositoryCalledWithCorrectId() {
        // Given
        when(paymentRepository.findByReservation_Id(1L)).thenReturn(Optional.of(savedPayment));

        // When
        paymentService.getPaymentByReservationId(1L);

        // Then
        verify(paymentRepository).findByReservation_Id(1L);
    }

    @Test
    void getPaymentByReservationId_paymentMethodIsCreditCard() {
        // Given
        when(paymentRepository.findByReservation_Id(1L)).thenReturn(Optional.of(savedPayment));

        // When
        PaymentEntity result = paymentService.getPaymentByReservationId(1L);

        // Then
        assertThat(result.getPaymentMethod()).isEqualTo(PaymentMethod.CREDIT_CARD);
    }
}
