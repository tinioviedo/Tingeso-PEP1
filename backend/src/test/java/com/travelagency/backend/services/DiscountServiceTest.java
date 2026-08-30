package com.travelagency.backend.services;

import com.travelagency.backend.entities.DiscountEntity;
import com.travelagency.backend.entities.PromotionEntity;
import com.travelagency.backend.enums.DiscountType;
import com.travelagency.backend.enums.ReservationStatus;
import com.travelagency.backend.repositories.DiscountRepository;
import com.travelagency.backend.repositories.PromotionRepository;
import com.travelagency.backend.repositories.ReservationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DiscountServiceTest {

    @InjectMocks
    private DiscountService discountService;

    @Mock
    private DiscountRepository discountRepository;

    @Mock
    private ReservationRepository reservationRepository;

    @Mock
    private PromotionRepository promotionRepository;

    private DiscountEntity groupDiscount;

    @BeforeEach
    void setUp() {
        groupDiscount = new DiscountEntity();
        groupDiscount.setId(1L);
        groupDiscount.setDiscountType(DiscountType.GROUP);
        groupDiscount.setMinThreshold(6.0);
        groupDiscount.setDiscountRate(0.10);
        groupDiscount.setActive(true);
    }

    // ── createDiscount ────────────────────────────────────────────────────────

    @Test
    void createDiscount_validDiscount_returnsSaved() {
        // Given
        when(discountRepository.findByDiscountTypeAndActiveTrue(DiscountType.GROUP)).thenReturn(Optional.empty());
        when(discountRepository.save(any())).thenReturn(groupDiscount);

        // When
        DiscountEntity result = discountService.createDiscount(groupDiscount);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getDiscountType()).isEqualTo(DiscountType.GROUP);
    }

    @Test
    void createDiscount_duplicateActiveType_throwsIllegalArgument() {
        // Given
        when(discountRepository.findByDiscountTypeAndActiveTrue(DiscountType.GROUP))
                .thenReturn(Optional.of(groupDiscount));

        // When / Then
        assertThatThrownBy(() -> discountService.createDiscount(groupDiscount))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("already exists");
    }

    @Test
    void createDiscount_rateZero_throwsIllegalArgument() {
        // Given
        groupDiscount.setDiscountRate(0.0);
        when(discountRepository.findByDiscountTypeAndActiveTrue(any())).thenReturn(Optional.empty());

        // When / Then
        assertThatThrownBy(() -> discountService.createDiscount(groupDiscount))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("rate");
    }

    @Test
    void createDiscount_rateNegative_throwsIllegalArgument() {
        // Given — tasa negativa no es válida (debe quedar en 0, no proceder)
        groupDiscount.setDiscountRate(-0.05);
        when(discountRepository.findByDiscountTypeAndActiveTrue(any())).thenReturn(Optional.empty());

        // When / Then
        assertThatThrownBy(() -> discountService.createDiscount(groupDiscount))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void createDiscount_thresholdZero_throwsIllegalArgument() {
        // Given
        groupDiscount.setMinThreshold(0.0);
        when(discountRepository.findByDiscountTypeAndActiveTrue(any())).thenReturn(Optional.empty());

        // When / Then
        assertThatThrownBy(() -> discountService.createDiscount(groupDiscount))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("threshold");
    }

    // ── changeStatus (discount) ───────────────────────────────────────────────

    @Test
    void changeStatus_activateDiscount_setsActiveTrue() {
        // Given
        groupDiscount.setActive(false);
        when(discountRepository.findById(1L)).thenReturn(Optional.of(groupDiscount));
        when(discountRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        // When
        DiscountEntity result = discountService.changeStatus(1L, true);

        // Then
        assertThat(result.getActive()).isTrue();
    }

    @Test
    void changeStatus_deactivateDiscount_setsActiveFalse() {
        // Given
        when(discountRepository.findById(1L)).thenReturn(Optional.of(groupDiscount));
        when(discountRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        // When
        DiscountEntity result = discountService.changeStatus(1L, false);

        // Then
        assertThat(result.getActive()).isFalse();
    }

    @Test
    void changeStatus_nonExistingId_throwsIllegalArgument() {
        // Given
        when(discountRepository.findById(99L)).thenReturn(Optional.empty());

        // When / Then
        assertThatThrownBy(() -> discountService.changeStatus(99L, false))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("99");
    }

    @Test
    void changeStatus_savesUpdatedDiscount() {
        // Given
        when(discountRepository.findById(1L)).thenReturn(Optional.of(groupDiscount));
        when(discountRepository.save(any())).thenReturn(groupDiscount);

        // When
        discountService.changeStatus(1L, false);

        // Then
        verify(discountRepository).save(any());
    }

    @Test
    void changeStatus_toggleTwice_finalStateMatchesLast() {
        // Given
        when(discountRepository.findById(1L)).thenReturn(Optional.of(groupDiscount));
        when(discountRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        // When
        discountService.changeStatus(1L, false);
        DiscountEntity result = discountService.changeStatus(1L, true);

        // Then
        assertThat(result.getActive()).isTrue();
    }

    // ── calculate ────────────────────────────────────────────────────────────

    @Test
    void calculate_noDiscountsNoPromotions_returnsFullAmount() {
        // Given
        double baseAmount = 1000.0;
        when(discountRepository.findByDiscountTypeAndActiveTrue(any())).thenReturn(Optional.empty());
        when(promotionRepository.findActivePromotions(any())).thenReturn(List.of());

        // When
        DiscountService.DiscountResult result = discountService.calculate(1L, 2, baseAmount, false);

        // Then
        assertThat(result.discountAmount()).isEqualTo(0.0);
        assertThat(result.totalAmount()).isEqualTo(1000.0);
    }

    @Test
    void calculate_groupDiscountApplies_reducesTotal() {
        // Given — 6 pasajeros, descuento grupal del 10%
        double baseAmount = 1000.0;
        when(discountRepository.findByDiscountTypeAndActiveTrue(DiscountType.GROUP))
                .thenReturn(Optional.of(groupDiscount));
        when(discountRepository.findByDiscountTypeAndActiveTrue(DiscountType.FREQUENT_CLIENT))
                .thenReturn(Optional.empty());
        when(discountRepository.findByDiscountTypeAndActiveTrue(DiscountType.MULTIPLE_PACKAGES))
                .thenReturn(Optional.empty());
        when(promotionRepository.findActivePromotions(any())).thenReturn(List.of());

        // When
        DiscountService.DiscountResult result = discountService.calculate(1L, 6, baseAmount, false);

        // Then
        assertThat(result.discountAmount()).isEqualTo(100.0);
        assertThat(result.totalAmount()).isEqualTo(900.0);
        assertThat(result.appliedDiscounts()).contains("Descuento grupal");
    }

    @Test
    void calculate_totalDiscountCapAt20Percent() {
        // Given — múltiples descuentos que superan el 20%
        DiscountEntity frequent = new DiscountEntity();
        frequent.setDiscountType(DiscountType.FREQUENT_CLIENT);
        frequent.setDiscountRate(0.15);
        frequent.setMinThreshold(3.0);

        DiscountEntity multiple = new DiscountEntity();
        multiple.setDiscountType(DiscountType.MULTIPLE_PACKAGES);
        multiple.setDiscountRate(0.15);
        multiple.setMinThreshold(2.0);

        when(discountRepository.findByDiscountTypeAndActiveTrue(DiscountType.GROUP))
                .thenReturn(Optional.of(groupDiscount)); // 10%
        when(discountRepository.findByDiscountTypeAndActiveTrue(DiscountType.FREQUENT_CLIENT))
                .thenReturn(Optional.of(frequent)); // 15%
        when(discountRepository.findByDiscountTypeAndActiveTrue(DiscountType.MULTIPLE_PACKAGES))
                .thenReturn(Optional.of(multiple)); // 15% → total 40% → se capea a 20%
        when(reservationRepository.countByClient_IdAndReservationStatus(eq(1L), eq(ReservationStatus.CONFIRMED)))
                .thenReturn(5L);
        when(promotionRepository.findActivePromotions(any())).thenReturn(List.of());

        double baseAmount = 1000.0;

        // When
        DiscountService.DiscountResult result = discountService.calculate(1L, 6, baseAmount, true);

        // Then — cap al 20%
        assertThat(result.discountAmount()).isEqualTo(200.0);
        assertThat(result.totalAmount()).isEqualTo(800.0);
    }

    @Test
    void calculate_negativeBaseAmount_totalAmountIsZero() {
        // Given — monto base negativo debe resultar en totalAmount = 0 (no negativo)
        double baseAmount = -500.0;
        when(discountRepository.findByDiscountTypeAndActiveTrue(any())).thenReturn(Optional.empty());
        when(promotionRepository.findActivePromotions(any())).thenReturn(List.of());

        // When
        DiscountService.DiscountResult result = discountService.calculate(1L, 1, baseAmount, false);

        // Then
        assertThat(result.totalAmount()).isGreaterThanOrEqualTo(0.0);
    }

    @Test
    void calculate_activePromotion_appliesPromoDiscount() {
        // Given
        PromotionEntity promo = new PromotionEntity();
        promo.setName("Verano");
        promo.setDiscountRate(0.10);

        when(discountRepository.findByDiscountTypeAndActiveTrue(any())).thenReturn(Optional.empty());
        when(promotionRepository.findActivePromotions(any())).thenReturn(List.of(promo));

        double baseAmount = 2000.0;

        // When
        DiscountService.DiscountResult result = discountService.calculate(1L, 2, baseAmount, false);

        // Then
        assertThat(result.discountAmount()).isEqualTo(200.0);
        assertThat(result.totalAmount()).isEqualTo(1800.0);
        assertThat(result.appliedDiscounts()).contains("Verano");
    }

    // ── getAllDiscounts ───────────────────────────────────────────────────────

    @Test
    void getAllDiscounts_returnsAllDiscounts() {
        // Given
        when(discountRepository.findAll()).thenReturn(List.of(groupDiscount));

        // When
        List<DiscountEntity> result = discountService.getAllDiscounts();

        // Then
        assertThat(result).hasSize(1);
    }

    @Test
    void getAllDiscounts_emptyRepository_returnsEmptyList() {
        // Given
        when(discountRepository.findAll()).thenReturn(List.of());

        // When
        List<DiscountEntity> result = discountService.getAllDiscounts();

        // Then
        assertThat(result).isEmpty();
    }

    @Test
    void getAllDiscounts_repositoryCalled() {
        // Given
        when(discountRepository.findAll()).thenReturn(List.of());

        // When
        discountService.getAllDiscounts();

        // Then
        verify(discountRepository).findAll();
    }

    @Test
    void getAllDiscounts_multipleDiscounts_allReturned() {
        // Given
        DiscountEntity d2 = new DiscountEntity();
        d2.setId(2L);
        when(discountRepository.findAll()).thenReturn(List.of(groupDiscount, d2));

        // When
        List<DiscountEntity> result = discountService.getAllDiscounts();

        // Then
        assertThat(result).hasSize(2);
    }

    @Test
    void getAllDiscounts_returnsCorrectDiscountType() {
        // Given
        when(discountRepository.findAll()).thenReturn(List.of(groupDiscount));

        // When
        List<DiscountEntity> result = discountService.getAllDiscounts();

        // Then
        assertThat(result.get(0).getDiscountType()).isEqualTo(DiscountType.GROUP);
    }

    // ── updateDiscount ────────────────────────────────────────────────────────

    @Test
    void updateDiscount_validRate_updatesRate() {
        // Given
        DiscountEntity updates = new DiscountEntity();
        updates.setDiscountRate(0.15);
        when(discountRepository.findById(1L)).thenReturn(Optional.of(groupDiscount));
        when(discountRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        // When
        DiscountEntity result = discountService.updateDiscount(1L, updates);

        // Then
        assertThat(result.getDiscountRate()).isEqualTo(0.15);
    }

    @Test
    void updateDiscount_validThreshold_updatesThreshold() {
        // Given
        DiscountEntity updates = new DiscountEntity();
        updates.setMinThreshold(8.0);
        when(discountRepository.findById(1L)).thenReturn(Optional.of(groupDiscount));
        when(discountRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        // When
        DiscountEntity result = discountService.updateDiscount(1L, updates);

        // Then
        assertThat(result.getMinThreshold()).isEqualTo(8.0);
    }

    @Test
    void updateDiscount_nonExistingId_throwsIllegalArgument() {
        // Given
        when(discountRepository.findById(99L)).thenReturn(Optional.empty());
        DiscountEntity updates = new DiscountEntity();

        // When / Then
        assertThatThrownBy(() -> discountService.updateDiscount(99L, updates))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("99");
    }

    @Test
    void updateDiscount_invalidRate_doesNotUpdate() {
        // Given — tasa de 0 no debe sobreescribir la existente
        DiscountEntity updates = new DiscountEntity();
        updates.setDiscountRate(0.0);
        when(discountRepository.findById(1L)).thenReturn(Optional.of(groupDiscount));
        when(discountRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        // When
        DiscountEntity result = discountService.updateDiscount(1L, updates);

        // Then
        assertThat(result.getDiscountRate()).isEqualTo(0.10); // sin cambio
    }

    @Test
    void updateDiscount_savesUpdatedDiscount() {
        // Given
        DiscountEntity updates = new DiscountEntity();
        updates.setDiscountRate(0.12);
        when(discountRepository.findById(1L)).thenReturn(Optional.of(groupDiscount));
        when(discountRepository.save(any())).thenReturn(groupDiscount);

        // When
        discountService.updateDiscount(1L, updates);

        // Then
        verify(discountRepository).save(any());
    }
}
