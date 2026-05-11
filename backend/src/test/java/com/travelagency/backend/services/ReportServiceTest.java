package com.travelagency.backend.services;

import com.travelagency.backend.entities.ReservationEntity;
import com.travelagency.backend.repositories.ReservationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReportServiceTest {

    @InjectMocks
    private ReportService reportService;

    @Mock
    private ReservationRepository reservationRepository;

    private LocalDate startDate;
    private LocalDate endDate;

    @BeforeEach
    void setUp() {
        startDate = LocalDate.of(2025, 1, 1);
        endDate = LocalDate.of(2025, 1, 31);
    }

    // ── getSalesByPeriod ──────────────────────────────────────────────────────

    @Test
    void getSalesByPeriod_validDates_returnsReservations() {
        // Given
        ReservationEntity res = new ReservationEntity();
        when(reservationRepository.findSalesByPeriod(any(), any())).thenReturn(List.of(res));

        // When
        List<ReservationEntity> result = reportService.getSalesByPeriod(startDate, endDate);

        // Then
        assertThat(result).hasSize(1);
    }

    @Test
    void getSalesByPeriod_startAfterEnd_throwsIllegalArgument() {
        // Given — fecha inicio posterior a fecha fin
        LocalDate invalidStart = LocalDate.of(2025, 2, 1);
        LocalDate invalidEnd = LocalDate.of(2025, 1, 1);

        // When / Then
        assertThatThrownBy(() -> reportService.getSalesByPeriod(invalidStart, invalidEnd))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Start date");
    }

    @Test
    void getSalesByPeriod_noPeriodResults_returnsEmptyList() {
        // Given
        when(reservationRepository.findSalesByPeriod(any(), any())).thenReturn(List.of());

        // When
        List<ReservationEntity> result = reportService.getSalesByPeriod(startDate, endDate);

        // Then
        assertThat(result).isEmpty();
    }

    @Test
    void getSalesByPeriod_sameDates_doesNotThrow() {
        // Given — misma fecha inicio y fin es válido
        LocalDate sameDate = LocalDate.of(2025, 6, 15);
        when(reservationRepository.findSalesByPeriod(any(), any())).thenReturn(List.of());

        // When / Then
        assertThatCode(() -> reportService.getSalesByPeriod(sameDate, sameDate))
                .doesNotThrowAnyException();
    }

    @Test
    void getSalesByPeriod_repositoryCalledWithCorrectWindow() {
        // Given
        when(reservationRepository.findSalesByPeriod(any(), any())).thenReturn(List.of());

        // When
        reportService.getSalesByPeriod(startDate, endDate);

        // Then — repositorio debe ser llamado con el rango correcto
        verify(reservationRepository).findSalesByPeriod(
                eq(startDate.atStartOfDay()),
                eq(endDate.atTime(23, 59, 59))
        );
    }

    // ── getPackageRankingByPeriod ─────────────────────────────────────────────

    @Test
    void getPackageRankingByPeriod_validDates_returnsMappedResults() {
        // Given
        Object[] row = {1L, "Viaje a Paris", 5L, 12L, 7500.0};
        when(reservationRepository.findPackageRankingByPeriod(any(), any()))
                .thenReturn(Collections.singletonList(row));

        // When
        List<Map<String, Object>> result = reportService.getPackageRankingByPeriod(startDate, endDate);

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0)).containsKey("packageName");
        assertThat(result.get(0).get("packageName")).isEqualTo("Viaje a Paris");
    }

    @Test
    void getPackageRankingByPeriod_startAfterEnd_throwsIllegalArgument() {
        // Given
        LocalDate invalidStart = LocalDate.of(2025, 3, 1);
        LocalDate invalidEnd = LocalDate.of(2025, 1, 1);

        // When / Then
        assertThatThrownBy(() -> reportService.getPackageRankingByPeriod(invalidStart, invalidEnd))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Start date");
    }

    @Test
    void getPackageRankingByPeriod_noResults_returnsEmptyList() {
        // Given
        when(reservationRepository.findPackageRankingByPeriod(any(), any()))
                .thenReturn(Collections.emptyList());

        // When
        List<Map<String, Object>> result = reportService.getPackageRankingByPeriod(startDate, endDate);

        // Then
        assertThat(result).isEmpty();
    }

    @Test
    void getPackageRankingByPeriod_resultContainsAllKeys() {
        // Given
        Object[] row = {1L, "Roma", 3L, 9L, 4500.0};
        when(reservationRepository.findPackageRankingByPeriod(any(), any()))
                .thenReturn(Collections.singletonList(row));

        // When
        List<Map<String, Object>> result = reportService.getPackageRankingByPeriod(startDate, endDate);

        // Then
        Map<String, Object> item = result.get(0);
        assertThat(item).containsKeys("packageId", "packageName", "totalReservations", "totalPassengers", "totalAmount");
    }

    @Test
    void getPackageRankingByPeriod_totalAmountMappedCorrectly() {
        // Given
        Object[] row = {2L, "Tokyo", 10L, 30L, 15000.0};
        when(reservationRepository.findPackageRankingByPeriod(any(), any()))
                .thenReturn(Collections.singletonList(row));

        // When
        List<Map<String, Object>> result = reportService.getPackageRankingByPeriod(startDate, endDate);

        // Then
        assertThat(result.get(0).get("totalAmount")).isEqualTo(15000.0);
    }
}
