package com.travelagency.backend.services;

import com.travelagency.backend.entities.PromotionEntity;
import com.travelagency.backend.repositories.PromotionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PromotionServiceTest {

    @InjectMocks
    private PromotionService promotionService;

    @Mock
    private PromotionRepository promotionRepository;

    private PromotionEntity validPromotion;

    @BeforeEach
    void setUp() {
        validPromotion = new PromotionEntity();
        validPromotion.setId(1L);
        validPromotion.setName("Verano 2025");
        validPromotion.setDiscountRate(0.15);
        validPromotion.setStartDate(LocalDate.now().plusDays(1));
        validPromotion.setEndDate(LocalDate.now().plusDays(30));
        validPromotion.setActive(true);
    }

    // ── createPromotion ───────────────────────────────────────────────────────

    @Test
    void createPromotion_validPromotion_returnsSaved() {
        // Given
        when(promotionRepository.save(any())).thenReturn(validPromotion);

        // When
        PromotionEntity result = promotionService.createPromotion(validPromotion);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("Verano 2025");
        assertThat(result.getActive()).isTrue();
    }

    @Test
    void createPromotion_nullName_throwsIllegalArgument() {
        // Given
        validPromotion.setName(null);

        // When / Then
        assertThatThrownBy(() -> promotionService.createPromotion(validPromotion))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("name");
    }

    @Test
    void createPromotion_rateZero_throwsIllegalArgument() {
        // Given
        validPromotion.setDiscountRate(0.0);

        // When / Then
        assertThatThrownBy(() -> promotionService.createPromotion(validPromotion))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("rate");
    }

    @Test
    void createPromotion_rateNegative_throwsIllegalArgument() {
        // Given — tasa negativa no permitida
        validPromotion.setDiscountRate(-0.10);

        // When / Then
        assertThatThrownBy(() -> promotionService.createPromotion(validPromotion))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void createPromotion_endDateBeforeStartDate_throwsIllegalArgument() {
        // Given
        validPromotion.setEndDate(LocalDate.now());
        validPromotion.setStartDate(LocalDate.now().plusDays(5));

        // When / Then
        assertThatThrownBy(() -> promotionService.createPromotion(validPromotion))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("End date");
    }

    @Test
    void createPromotion_setsActiveTrue() {
        // Given
        validPromotion.setActive(false);
        when(promotionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        // When
        PromotionEntity result = promotionService.createPromotion(validPromotion);

        // Then
        assertThat(result.getActive()).isTrue();
    }

    // ── updatePromotion ───────────────────────────────────────────────────────

    @Test
    void updatePromotion_validName_updatesName() {
        // Given
        PromotionEntity updates = new PromotionEntity();
        updates.setName("Invierno 2025");
        when(promotionRepository.findById(1L)).thenReturn(Optional.of(validPromotion));
        when(promotionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        // When
        PromotionEntity result = promotionService.updatePromotion(1L, updates);

        // Then
        assertThat(result.getName()).isEqualTo("Invierno 2025");
    }

    @Test
    void updatePromotion_validRate_updatesRate() {
        // Given
        PromotionEntity updates = new PromotionEntity();
        updates.setDiscountRate(0.20);
        when(promotionRepository.findById(1L)).thenReturn(Optional.of(validPromotion));
        when(promotionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        // When
        PromotionEntity result = promotionService.updatePromotion(1L, updates);

        // Then
        assertThat(result.getDiscountRate()).isEqualTo(0.20);
    }

    @Test
    void updatePromotion_endDateBeforeStartDate_throwsIllegalArgument() {
        // Given
        PromotionEntity updates = new PromotionEntity();
        updates.setEndDate(LocalDate.now().minusDays(10)); // antes del startDate existente
        when(promotionRepository.findById(1L)).thenReturn(Optional.of(validPromotion));

        // When / Then
        assertThatThrownBy(() -> promotionService.updatePromotion(1L, updates))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("End date");
    }

    @Test
    void updatePromotion_nonExistingId_throwsIllegalArgument() {
        // Given
        when(promotionRepository.findById(99L)).thenReturn(Optional.empty());

        // When / Then
        assertThatThrownBy(() -> promotionService.updatePromotion(99L, new PromotionEntity()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("99");
    }

    @Test
    void updatePromotion_blankName_doesNotUpdateName() {
        // Given — nombre en blanco no sobreescribe el existente
        PromotionEntity updates = new PromotionEntity();
        updates.setName("   ");
        when(promotionRepository.findById(1L)).thenReturn(Optional.of(validPromotion));
        when(promotionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        // When
        PromotionEntity result = promotionService.updatePromotion(1L, updates);

        // Then
        assertThat(result.getName()).isEqualTo("Verano 2025");
    }

    // ── changeStatus (promotion) ──────────────────────────────────────────────

    @Test
    void changeStatus_deactivatePromotion_setsActiveFalse() {
        // Given
        when(promotionRepository.findById(1L)).thenReturn(Optional.of(validPromotion));
        when(promotionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        // When
        PromotionEntity result = promotionService.changeStatus(1L, false);

        // Then
        assertThat(result.getActive()).isFalse();
    }

    @Test
    void changeStatus_activatePromotion_setsActiveTrue() {
        // Given
        validPromotion.setActive(false);
        when(promotionRepository.findById(1L)).thenReturn(Optional.of(validPromotion));
        when(promotionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        // When
        PromotionEntity result = promotionService.changeStatus(1L, true);

        // Then
        assertThat(result.getActive()).isTrue();
    }

    @Test
    void changeStatus_nonExistingId_throwsIllegalArgument() {
        // Given
        when(promotionRepository.findById(99L)).thenReturn(Optional.empty());

        // When / Then
        assertThatThrownBy(() -> promotionService.changeStatus(99L, false))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("99");
    }

    @Test
    void changeStatus_savesPromotion() {
        // Given
        when(promotionRepository.findById(1L)).thenReturn(Optional.of(validPromotion));
        when(promotionRepository.save(any())).thenReturn(validPromotion);

        // When
        promotionService.changeStatus(1L, false);

        // Then
        verify(promotionRepository).save(any());
    }

    @Test
    void changeStatus_returnsUpdatedPromotion() {
        // Given
        when(promotionRepository.findById(1L)).thenReturn(Optional.of(validPromotion));
        when(promotionRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        // When
        PromotionEntity result = promotionService.changeStatus(1L, false);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("Verano 2025");
    }

    // ── getAllPromotions ───────────────────────────────────────────────────────

    @Test
    void getAllPromotions_returnsAllPromotions() {
        // Given
        when(promotionRepository.findAll()).thenReturn(List.of(validPromotion));

        // When
        List<PromotionEntity> result = promotionService.getAllPromotions();

        // Then
        assertThat(result).hasSize(1);
    }

    @Test
    void getAllPromotions_emptyRepository_returnsEmptyList() {
        // Given
        when(promotionRepository.findAll()).thenReturn(List.of());

        // When
        List<PromotionEntity> result = promotionService.getAllPromotions();

        // Then
        assertThat(result).isEmpty();
    }

    @Test
    void getAllPromotions_repositoryCalled() {
        // Given
        when(promotionRepository.findAll()).thenReturn(List.of());

        // When
        promotionService.getAllPromotions();

        // Then
        verify(promotionRepository).findAll();
    }

    @Test
    void getAllPromotions_multiplePromotions_allReturned() {
        // Given
        PromotionEntity p2 = new PromotionEntity();
        p2.setId(2L);
        when(promotionRepository.findAll()).thenReturn(List.of(validPromotion, p2));

        // When
        List<PromotionEntity> result = promotionService.getAllPromotions();

        // Then
        assertThat(result).hasSize(2);
    }

    @Test
    void getAllPromotions_returnsCorrectName() {
        // Given
        when(promotionRepository.findAll()).thenReturn(List.of(validPromotion));

        // When
        List<PromotionEntity> result = promotionService.getAllPromotions();

        // Then
        assertThat(result.get(0).getName()).isEqualTo("Verano 2025");
    }

    // ── getPromotionById ──────────────────────────────────────────────────────

    @Test
    void getPromotionById_existingId_returnsPromotion() {
        // Given
        when(promotionRepository.findById(1L)).thenReturn(Optional.of(validPromotion));

        // When
        PromotionEntity result = promotionService.getPromotionById(1L);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
    }

    @Test
    void getPromotionById_nonExistingId_throwsIllegalArgument() {
        // Given
        when(promotionRepository.findById(99L)).thenReturn(Optional.empty());

        // When / Then
        assertThatThrownBy(() -> promotionService.getPromotionById(99L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("99");
    }

    @Test
    void getPromotionById_repositoryCalledWithCorrectId() {
        // Given
        when(promotionRepository.findById(1L)).thenReturn(Optional.of(validPromotion));

        // When
        promotionService.getPromotionById(1L);

        // Then
        verify(promotionRepository).findById(1L);
    }

    @Test
    void getPromotionById_returnsCorrectName() {
        // Given
        when(promotionRepository.findById(1L)).thenReturn(Optional.of(validPromotion));

        // When
        PromotionEntity result = promotionService.getPromotionById(1L);

        // Then
        assertThat(result.getName()).isEqualTo("Verano 2025");
    }

    @Test
    void getPromotionById_returnsCorrectRate() {
        // Given
        when(promotionRepository.findById(1L)).thenReturn(Optional.of(validPromotion));

        // When
        PromotionEntity result = promotionService.getPromotionById(1L);

        // Then
        assertThat(result.getDiscountRate()).isEqualTo(0.15);
    }

    // ── getActivePromotions ───────────────────────────────────────────────────

    @Test
    void getActivePromotions_returnsActiveList() {
        // Given
        when(promotionRepository.findActivePromotions(any(LocalDate.class)))
                .thenReturn(List.of(validPromotion));

        // When
        List<PromotionEntity> result = promotionService.getActivePromotions();

        // Then
        assertThat(result).hasSize(1);
    }

    @Test
    void getActivePromotions_noActive_returnsEmptyList() {
        // Given
        when(promotionRepository.findActivePromotions(any())).thenReturn(List.of());

        // When
        List<PromotionEntity> result = promotionService.getActivePromotions();

        // Then
        assertThat(result).isEmpty();
    }

    @Test
    void getActivePromotions_repositoryCalled() {
        // Given
        when(promotionRepository.findActivePromotions(any())).thenReturn(List.of());

        // When
        promotionService.getActivePromotions();

        // Then
        verify(promotionRepository).findActivePromotions(any(LocalDate.class));
    }

    @Test
    void getActivePromotions_returnsCorrectPromotion() {
        // Given
        when(promotionRepository.findActivePromotions(any())).thenReturn(List.of(validPromotion));

        // When
        List<PromotionEntity> result = promotionService.getActivePromotions();

        // Then
        assertThat(result.get(0).getName()).isEqualTo("Verano 2025");
    }

    @Test
    void getActivePromotions_multipleActive_allReturned() {
        // Given
        PromotionEntity p2 = new PromotionEntity();
        p2.setName("Invierno");
        when(promotionRepository.findActivePromotions(any())).thenReturn(List.of(validPromotion, p2));

        // When
        List<PromotionEntity> result = promotionService.getActivePromotions();

        // Then
        assertThat(result).hasSize(2);
    }
}
