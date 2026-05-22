package com.travelagency.backend.services;

import com.travelagency.backend.entities.ClientEntity;
import com.travelagency.backend.entities.PackageEntity;
import com.travelagency.backend.entities.ReservationEntity;
import com.travelagency.backend.enums.PackageStatus;
import com.travelagency.backend.enums.ReservationStatus;
import com.travelagency.backend.repositories.ReservationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReservationServiceTest {

    @InjectMocks
    private ReservationService reservationService;

    @Mock
    private ReservationRepository reservationRepository;

    @Mock
    private PackageService packageService;

    @Mock
    private ClientService clientService;

    @Mock
    private DiscountService discountService;

    private ClientEntity client;
    private PackageEntity pkg;
    private ReservationEntity reservation;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(reservationService, "expirationHours", 24);

        client = new ClientEntity();
        client.setId(1L);
        client.setFullName("Martin Perez");
        client.setActive(true);

        pkg = new PackageEntity();
        pkg.setId(10L);
        pkg.setPackageName("Viaje a Paris");
        pkg.setPrice(1500.0);
        pkg.setAvailableSlots(10);
        pkg.setPackageStatus(PackageStatus.AVAILABLE);

        reservation = new ReservationEntity();
        reservation.setId(100L);
        reservation.setClient(client);
        reservation.setTravelPackage(pkg);
        reservation.setQuantity(2);
        reservation.setReservationStatus(ReservationStatus.PENDING);
        reservation.setBaseAmount(3000.0);
        reservation.setDiscountAmount(0.0);
        reservation.setTotalAmount(3000.0);
    }

    // ── createReservation ─────────────────────────────────────────────────────

    @Test
    void createReservation_validData_returnsReservation() {
        // Given
        DiscountService.DiscountResult noDiscount = new DiscountService.DiscountResult(0.0, 3000.0, "");
        when(clientService.getActiveClientById(1L)).thenReturn(client);
        when(packageService.getPackageById(10L)).thenReturn(pkg);
        when(packageService.deductSlots(eq(10L), eq(2))).thenReturn(pkg);
        when(discountService.calculate(anyLong(), anyInt(), anyDouble(), anyBoolean())).thenReturn(noDiscount);
        when(reservationRepository.save(any())).thenReturn(reservation);

        // When
        ReservationEntity result = reservationService.createReservation(1L, 10L, 2, null);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getReservationStatus()).isEqualTo(ReservationStatus.PENDING);
        verify(packageService).deductSlots(10L, 2);
    }

    @Test
    void createReservation_quantityZero_throwsIllegalArgument() {
        // Given
        when(clientService.getActiveClientById(1L)).thenReturn(client);
        when(packageService.getPackageById(10L)).thenReturn(pkg);

        // When / Then
        assertThatThrownBy(() -> reservationService.createReservation(1L, 10L, 0, null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("greater than zero");
    }

    @Test
    void createReservation_quantityNegative_throwsIllegalArgument() {
        // Given — cantidad negativa equivale a 0 (no permitida)
        when(clientService.getActiveClientById(1L)).thenReturn(client);
        when(packageService.getPackageById(10L)).thenReturn(pkg);

        // When / Then
        assertThatThrownBy(() -> reservationService.createReservation(1L, 10L, -3, null))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void createReservation_packageNotAvailable_throwsIllegalArgument() {
        // Given
        pkg.setPackageStatus(PackageStatus.SOLD_OUT);
        when(clientService.getActiveClientById(1L)).thenReturn(client);
        when(packageService.getPackageById(10L)).thenReturn(pkg);

        // When / Then
        assertThatThrownBy(() -> reservationService.createReservation(1L, 10L, 2, null))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("not available");
    }

    @Test
    void createReservation_calculatesBaseAmountCorrectly() {
        // Given — 3 pasajeros x $1500 = $4500
        pkg.setPrice(1500.0);
        DiscountService.DiscountResult noDiscount = new DiscountService.DiscountResult(0.0, 4500.0, "");
        when(clientService.getActiveClientById(1L)).thenReturn(client);
        when(packageService.getPackageById(10L)).thenReturn(pkg);
        when(packageService.deductSlots(anyLong(), anyInt())).thenReturn(pkg);
        when(discountService.calculate(anyLong(), anyInt(), anyDouble(), anyBoolean())).thenReturn(noDiscount);
        when(reservationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        // When
        ReservationEntity result = reservationService.createReservation(1L, 10L, 3, null);

        // Then
        assertThat(result.getBaseAmount()).isEqualTo(4500.0);
    }

    // ── cancelReservation ─────────────────────────────────────────────────────

    @Test
    void cancelReservation_pendingReservation_setCancelled() {
        // Given
        when(reservationRepository.findById(100L)).thenReturn(Optional.of(reservation));
        when(reservationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        // When
        ReservationEntity result = reservationService.cancelReservation(100L);

        // Then
        assertThat(result.getReservationStatus()).isEqualTo(ReservationStatus.CANCELLED);
        verify(packageService).releaseSlots(pkg.getId(), 2);
    }

    @Test
    void cancelReservation_alreadyCancelled_throwsIllegalArgument() {
        // Given
        reservation.setReservationStatus(ReservationStatus.CANCELLED);
        when(reservationRepository.findById(100L)).thenReturn(Optional.of(reservation));

        // When / Then
        assertThatThrownBy(() -> reservationService.cancelReservation(100L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("already cancelled");
    }

    @Test
    void cancelReservation_nonExistingId_throwsIllegalArgument() {
        // Given
        when(reservationRepository.findById(999L)).thenReturn(Optional.empty());

        // When / Then
        assertThatThrownBy(() -> reservationService.cancelReservation(999L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("999");
    }

    @Test
    void cancelReservation_releasesSlots() {
        // Given
        reservation.setQuantity(5);
        when(reservationRepository.findById(100L)).thenReturn(Optional.of(reservation));
        when(reservationRepository.save(any())).thenReturn(reservation);

        // When
        reservationService.cancelReservation(100L);

        // Then
        verify(packageService).releaseSlots(pkg.getId(), 5);
    }

    @Test
    void cancelReservation_confirmedReservation_setCancelled() {
        // Given — también se puede cancelar una reserva confirmada
        reservation.setReservationStatus(ReservationStatus.CONFIRMED);
        when(reservationRepository.findById(100L)).thenReturn(Optional.of(reservation));
        when(reservationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        // When
        ReservationEntity result = reservationService.cancelReservation(100L);

        // Then
        assertThat(result.getReservationStatus()).isEqualTo(ReservationStatus.CANCELLED);
    }

    // ── confirmReservation ────────────────────────────────────────────────────

    @Test
    void confirmReservation_pendingReservation_setsConfirmed() {
        // Given
        when(reservationRepository.findById(100L)).thenReturn(Optional.of(reservation));
        when(reservationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        // When
        ReservationEntity result = reservationService.confirmReservation(100L);

        // Then
        assertThat(result.getReservationStatus()).isEqualTo(ReservationStatus.CONFIRMED);
    }

    @Test
    void confirmReservation_nonExistingId_throwsIllegalArgument() {
        // Given
        when(reservationRepository.findById(999L)).thenReturn(Optional.empty());

        // When / Then
        assertThatThrownBy(() -> reservationService.confirmReservation(999L))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void confirmReservation_savesReservation() {
        // Given
        when(reservationRepository.findById(100L)).thenReturn(Optional.of(reservation));
        when(reservationRepository.save(any())).thenReturn(reservation);

        // When
        reservationService.confirmReservation(100L);

        // Then
        verify(reservationRepository).save(any());
    }

    @Test
    void confirmReservation_returnsCorrectClient() {
        // Given
        when(reservationRepository.findById(100L)).thenReturn(Optional.of(reservation));
        when(reservationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        // When
        ReservationEntity result = reservationService.confirmReservation(100L);

        // Then
        assertThat(result.getClient().getFullName()).isEqualTo("Martin Perez");
    }

    @Test
    void confirmReservation_returnsCorrectPackage() {
        // Given
        when(reservationRepository.findById(100L)).thenReturn(Optional.of(reservation));
        when(reservationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        // When
        ReservationEntity result = reservationService.confirmReservation(100L);

        // Then
        assertThat(result.getTravelPackage().getPackageName()).isEqualTo("Viaje a Paris");
    }

    // ── expirePendingReservations ─────────────────────────────────────────────

    @Test
    void expirePendingReservations_expiredReservations_setsStatusExpired() {
        // Given
        when(reservationRepository.findByReservationStatusAndReservationDateBefore(
                eq(ReservationStatus.PENDING), any(LocalDateTime.class)))
                .thenReturn(List.of(reservation));
        when(reservationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        // When
        reservationService.expirePendingReservations();

        // Then
        assertThat(reservation.getReservationStatus()).isEqualTo(ReservationStatus.EXPIRED);
        verify(packageService).releaseSlots(pkg.getId(), 2);
    }

    @Test
    void expirePendingReservations_noExpiredReservations_doesNothing() {
        // Given
        when(reservationRepository.findByReservationStatusAndReservationDateBefore(
                any(), any())).thenReturn(List.of());

        // When
        reservationService.expirePendingReservations();

        // Then
        verify(packageService, never()).releaseSlots(anyLong(), anyInt());
        verify(reservationRepository, never()).save(any());
    }

    @Test
    void expirePendingReservations_releasesSlots() {
        // Given
        reservation.setQuantity(4);
        when(reservationRepository.findByReservationStatusAndReservationDateBefore(
                any(), any())).thenReturn(List.of(reservation));
        when(reservationRepository.save(any())).thenReturn(reservation);

        // When
        reservationService.expirePendingReservations();

        // Then
        verify(packageService).releaseSlots(pkg.getId(), 4);
    }

    @Test
    void expirePendingReservations_multipleReservations_allExpired() {
        // Given
        ReservationEntity res2 = new ReservationEntity();
        res2.setId(200L);
        res2.setTravelPackage(pkg);
        res2.setQuantity(1);
        res2.setReservationStatus(ReservationStatus.PENDING);

        when(reservationRepository.findByReservationStatusAndReservationDateBefore(
                any(), any())).thenReturn(List.of(reservation, res2));
        when(reservationRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        // When
        reservationService.expirePendingReservations();

        // Then
        assertThat(reservation.getReservationStatus()).isEqualTo(ReservationStatus.EXPIRED);
        assertThat(res2.getReservationStatus()).isEqualTo(ReservationStatus.EXPIRED);
        verify(reservationRepository, times(2)).save(any());
    }

    @Test
    void expirePendingReservations_savesEachExpiredReservation() {
        // Given
        when(reservationRepository.findByReservationStatusAndReservationDateBefore(
                any(), any())).thenReturn(List.of(reservation));
        when(reservationRepository.save(any())).thenReturn(reservation);

        // When
        reservationService.expirePendingReservations();

        // Then
        verify(reservationRepository, times(1)).save(reservation);
    }

    // ── getMyReservations ─────────────────────────────────────────────────────

    @Test
    void getMyReservations_existingClient_returnsList() {
        // Given
        when(reservationRepository.findByClient_Id(1L)).thenReturn(List.of(reservation));

        // When
        List<ReservationEntity> result = reservationService.getMyReservations(1L);

        // Then
        assertThat(result).hasSize(1);
    }

    @Test
    void getMyReservations_noReservations_returnsEmptyList() {
        // Given
        when(reservationRepository.findByClient_Id(1L)).thenReturn(List.of());

        // When
        List<ReservationEntity> result = reservationService.getMyReservations(1L);

        // Then
        assertThat(result).isEmpty();
    }

    @Test
    void getMyReservations_repositoryCalledWithCorrectClientId() {
        // Given
        when(reservationRepository.findByClient_Id(1L)).thenReturn(List.of());

        // When
        reservationService.getMyReservations(1L);

        // Then
        verify(reservationRepository).findByClient_Id(1L);
    }

    @Test
    void getMyReservations_multipleReservations_allReturned() {
        // Given
        ReservationEntity res2 = new ReservationEntity();
        res2.setId(200L);
        when(reservationRepository.findByClient_Id(1L)).thenReturn(List.of(reservation, res2));

        // When
        List<ReservationEntity> result = reservationService.getMyReservations(1L);

        // Then
        assertThat(result).hasSize(2);
    }

    @Test
    void getMyReservations_returnsCorrectReservationId() {
        // Given
        when(reservationRepository.findByClient_Id(1L)).thenReturn(List.of(reservation));

        // When
        List<ReservationEntity> result = reservationService.getMyReservations(1L);

        // Then
        assertThat(result.get(0).getId()).isEqualTo(100L);
    }

    // ── getAllReservations ────────────────────────────────────────────────────

    @Test
    void getAllReservations_returnsAll() {
        // Given
        when(reservationRepository.findAll()).thenReturn(List.of(reservation));

        // When
        List<ReservationEntity> result = reservationService.getAllReservations();

        // Then
        assertThat(result).hasSize(1);
    }

    @Test
    void getAllReservations_emptyRepository_returnsEmptyList() {
        // Given
        when(reservationRepository.findAll()).thenReturn(List.of());

        // When
        List<ReservationEntity> result = reservationService.getAllReservations();

        // Then
        assertThat(result).isEmpty();
    }

    @Test
    void getAllReservations_repositoryCalled() {
        // Given
        when(reservationRepository.findAll()).thenReturn(List.of());

        // When
        reservationService.getAllReservations();

        // Then
        verify(reservationRepository).findAll();
    }

    @Test
    void getAllReservations_multipleReservations_allReturned() {
        // Given
        ReservationEntity res2 = new ReservationEntity();
        res2.setId(200L);
        when(reservationRepository.findAll()).thenReturn(List.of(reservation, res2));

        // When
        List<ReservationEntity> result = reservationService.getAllReservations();

        // Then
        assertThat(result).hasSize(2);
    }

    @Test
    void getAllReservations_returnsCorrectStatus() {
        // Given
        when(reservationRepository.findAll()).thenReturn(List.of(reservation));

        // When
        List<ReservationEntity> result = reservationService.getAllReservations();

        // Then
        assertThat(result.get(0).getReservationStatus()).isEqualTo(ReservationStatus.PENDING);
    }

    // ── getReservationById ────────────────────────────────────────────────────

    @Test
    void getReservationById_existingId_returnsReservation() {
        // Given
        when(reservationRepository.findById(100L)).thenReturn(Optional.of(reservation));

        // When
        ReservationEntity result = reservationService.getReservationById(100L);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(100L);
    }

    @Test
    void getReservationById_nonExistingId_throwsIllegalArgument() {
        // Given
        when(reservationRepository.findById(999L)).thenReturn(Optional.empty());

        // When / Then
        assertThatThrownBy(() -> reservationService.getReservationById(999L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("999");
    }

    @Test
    void getReservationById_repositoryCalledWithCorrectId() {
        // Given
        when(reservationRepository.findById(100L)).thenReturn(Optional.of(reservation));

        // When
        reservationService.getReservationById(100L);

        // Then
        verify(reservationRepository).findById(100L);
    }

    @Test
    void getReservationById_returnsCorrectClient() {
        // Given
        when(reservationRepository.findById(100L)).thenReturn(Optional.of(reservation));

        // When
        ReservationEntity result = reservationService.getReservationById(100L);

        // Then
        assertThat(result.getClient().getFullName()).isEqualTo("Martin Perez");
    }

    @Test
    void getReservationById_returnsCorrectPackage() {
        // Given
        when(reservationRepository.findById(100L)).thenReturn(Optional.of(reservation));

        // When
        ReservationEntity result = reservationService.getReservationById(100L);

        // Then
        assertThat(result.getTravelPackage().getPackageName()).isEqualTo("Viaje a Paris");
    }

    // ── createMultipleReservations ────────────────────────────────────────────

    @Test
    void createMultipleReservations_emptyItems_throwsIllegalArgument() {
        // Given — lista vacía no permitida

        // When / Then
        assertThatThrownBy(() -> reservationService.createMultipleReservations(1L, List.of()))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("empty");
    }

    @Test
    void createMultipleReservations_nullItems_throwsIllegalArgument() {
        // Given — null no permitido

        // When / Then
        assertThatThrownBy(() -> reservationService.createMultipleReservations(1L, null))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void createMultipleReservations_validSingleItem_returnsOneReservation() {
        // Given
        java.util.Map<String, Object> item = java.util.Map.of("packageId", "10", "quantity", "2");
        DiscountService.DiscountResult noDiscount = new DiscountService.DiscountResult(0.0, 3000.0, "");
        when(clientService.getActiveClientById(1L)).thenReturn(client);
        when(packageService.getPackageById(10L)).thenReturn(pkg);
        when(packageService.deductSlots(anyLong(), anyInt())).thenReturn(pkg);
        when(discountService.calculate(anyLong(), anyInt(), anyDouble(), anyBoolean())).thenReturn(noDiscount);
        when(reservationRepository.save(any())).thenReturn(reservation);

        // When
        List<ReservationEntity> result = reservationService.createMultipleReservations(1L, List.of(item));

        // Then
        assertThat(result).hasSize(1);
    }

    @Test
    void createMultipleReservations_packageNotAvailable_throwsIllegalArgument() {
        // Given
        pkg.setPackageStatus(PackageStatus.SOLD_OUT);
        java.util.Map<String, Object> item = java.util.Map.of("packageId", "10", "quantity", "2");
        when(clientService.getActiveClientById(1L)).thenReturn(client);
        when(packageService.getPackageById(10L)).thenReturn(pkg);

        // When / Then
        assertThatThrownBy(() -> reservationService.createMultipleReservations(1L, List.of(item)))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("not available");
    }

    @Test
    void createMultipleReservations_twoItems_returnsTwoReservations() {
        // Given
        java.util.Map<String, Object> item1 = java.util.Map.of("packageId", "10", "quantity", "2");
        java.util.Map<String, Object> item2 = java.util.Map.of("packageId", "10", "quantity", "1");
        DiscountService.DiscountResult noDiscount = new DiscountService.DiscountResult(0.0, 3000.0, "");
        when(clientService.getActiveClientById(1L)).thenReturn(client);
        when(packageService.getPackageById(10L)).thenReturn(pkg);
        when(packageService.deductSlots(anyLong(), anyInt())).thenReturn(pkg);
        when(discountService.calculate(anyLong(), anyInt(), anyDouble(), anyBoolean())).thenReturn(noDiscount);
        when(reservationRepository.save(any())).thenReturn(reservation);

        // When
        List<ReservationEntity> result = reservationService.createMultipleReservations(1L, List.of(item1, item2));

        // Then
        assertThat(result).hasSize(2);
    }
}
