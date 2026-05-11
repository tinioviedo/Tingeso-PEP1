package com.travelagency.backend.services;

import com.travelagency.backend.entities.PackageEntity;
import com.travelagency.backend.enums.PackageStatus;
import com.travelagency.backend.repositories.PackageRepository;
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
class PackageServiceTest {

    @InjectMocks
    private PackageService packageService;

    @Mock
    private PackageRepository packageRepository;

    private PackageEntity validPackage;

    @BeforeEach
    void setUp() {
        validPackage = new PackageEntity();
        validPackage.setId(1L);
        validPackage.setPackageName("Viaje a Roma");
        validPackage.setDestination("Roma");
        validPackage.setDescription("Viaje cultural por Roma");
        validPackage.setPrice(1500.0);
        validPackage.setSlots(20);
        validPackage.setAvailableSlots(20);
        validPackage.setStartDate(LocalDate.now().plusDays(10));
        validPackage.setEndDate(LocalDate.now().plusDays(20));
        validPackage.setPackageStatus(PackageStatus.AVAILABLE);
    }

    // ── savePackage ───────────────────────────────────────────────────────────

    @Test
    void savePackage_validPackage_returnsSavedPackage() {
        // Given
        when(packageRepository.save(any())).thenReturn(validPackage);

        // When
        PackageEntity result = packageService.savePackage(validPackage);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getPackageName()).isEqualTo("Viaje a Roma");
        verify(packageRepository).save(any());
    }

    @Test
    void savePackage_nullName_throwsIllegalArgument() {
        // Given
        validPackage.setPackageName(null);

        // When / Then
        assertThatThrownBy(() -> packageService.savePackage(validPackage))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void savePackage_priceZero_throwsIllegalArgument() {
        // Given
        validPackage.setPrice(0.0);

        // When / Then
        assertThatThrownBy(() -> packageService.savePackage(validPackage))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("precio");
    }

    @Test
    void savePackage_priceNegative_throwsIllegalArgument() {
        // Given — precio negativo no permitido
        validPackage.setPrice(-100.0);

        // When / Then
        assertThatThrownBy(() -> packageService.savePackage(validPackage))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("precio");
    }

    @Test
    void savePackage_endDateBeforeStartDate_throwsIllegalArgument() {
        // Given
        validPackage.setEndDate(LocalDate.now().plusDays(5));
        validPackage.setStartDate(LocalDate.now().plusDays(10));

        // When / Then
        assertThatThrownBy(() -> packageService.savePackage(validPackage))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("fecha");
    }

    @Test
    void savePackage_zeroSlots_throwsIllegalArgument() {
        // Given
        validPackage.setSlots(0);

        // When / Then
        assertThatThrownBy(() -> packageService.savePackage(validPackage))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("cupos");
    }

    @Test
    void savePackage_setsAvailableSlotsEqualToSlots() {
        // Given
        validPackage.setSlots(15);
        when(packageRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        // When
        PackageEntity result = packageService.savePackage(validPackage);

        // Then
        assertThat(result.getAvailableSlots()).isEqualTo(15);
    }

    // ── getPackageById ────────────────────────────────────────────────────────

    @Test
    void getPackageById_existingId_returnsPackage() {
        // Given
        when(packageRepository.findById(1L)).thenReturn(Optional.of(validPackage));

        // When
        PackageEntity result = packageService.getPackageById(1L);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
    }

    @Test
    void getPackageById_nonExistingId_throwsIllegalArgument() {
        // Given
        when(packageRepository.findById(99L)).thenReturn(Optional.empty());

        // When / Then
        assertThatThrownBy(() -> packageService.getPackageById(99L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("99");
    }

    @Test
    void getPackageById_returnsCorrectPackageName() {
        // Given
        when(packageRepository.findById(1L)).thenReturn(Optional.of(validPackage));

        // When
        PackageEntity result = packageService.getPackageById(1L);

        // Then
        assertThat(result.getPackageName()).isEqualTo("Viaje a Roma");
    }

    @Test
    void getPackageById_returnsCorrectStatus() {
        // Given
        when(packageRepository.findById(1L)).thenReturn(Optional.of(validPackage));

        // When
        PackageEntity result = packageService.getPackageById(1L);

        // Then
        assertThat(result.getPackageStatus()).isEqualTo(PackageStatus.AVAILABLE);
    }

    @Test
    void getPackageById_repositoryCalledWithCorrectId() {
        // Given
        when(packageRepository.findById(1L)).thenReturn(Optional.of(validPackage));

        // When
        packageService.getPackageById(1L);

        // Then
        verify(packageRepository).findById(1L);
    }

    // ── changeStatus ──────────────────────────────────────────────────────────

    @Test
    void changeStatus_toAvailableWithSlots_succeeds() {
        // Given
        validPackage.setAvailableSlots(5);
        when(packageRepository.findById(1L)).thenReturn(Optional.of(validPackage));
        when(packageRepository.save(any())).thenReturn(validPackage);

        // When
        PackageEntity result = packageService.changeStatus(1L, PackageStatus.AVAILABLE);

        // Then
        assertThat(result.getPackageStatus()).isEqualTo(PackageStatus.AVAILABLE);
    }

    @Test
    void changeStatus_toAvailableWithNoSlots_throwsIllegalArgument() {
        // Given
        validPackage.setAvailableSlots(0);
        when(packageRepository.findById(1L)).thenReturn(Optional.of(validPackage));

        // When / Then
        assertThatThrownBy(() -> packageService.changeStatus(1L, PackageStatus.AVAILABLE))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("cupos");
    }

    @Test
    void changeStatus_toCancelled_succeeds() {
        // Given
        when(packageRepository.findById(1L)).thenReturn(Optional.of(validPackage));
        when(packageRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        // When
        PackageEntity result = packageService.changeStatus(1L, PackageStatus.CANCELLED);

        // Then
        assertThat(result.getPackageStatus()).isEqualTo(PackageStatus.CANCELLED);
    }

    @Test
    void changeStatus_toNotValid_succeeds() {
        // Given
        when(packageRepository.findById(1L)).thenReturn(Optional.of(validPackage));
        when(packageRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        // When
        PackageEntity result = packageService.changeStatus(1L, PackageStatus.NOT_VALID);

        // Then
        assertThat(result.getPackageStatus()).isEqualTo(PackageStatus.NOT_VALID);
    }

    @Test
    void changeStatus_nonExistingId_throwsIllegalArgument() {
        // Given
        when(packageRepository.findById(99L)).thenReturn(Optional.empty());

        // When / Then
        assertThatThrownBy(() -> packageService.changeStatus(99L, PackageStatus.CANCELLED))
                .isInstanceOf(IllegalArgumentException.class);
    }

    // ── deductSlots ───────────────────────────────────────────────────────────

    @Test
    void deductSlots_sufficientSlots_decrementsAvailableSlots() {
        // Given
        validPackage.setAvailableSlots(10);
        when(packageRepository.findById(1L)).thenReturn(Optional.of(validPackage));
        when(packageRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        // When
        PackageEntity result = packageService.deductSlots(1L, 3);

        // Then
        assertThat(result.getAvailableSlots()).isEqualTo(7);
    }

    @Test
    void deductSlots_insufficientSlots_throwsIllegalArgument() {
        // Given
        validPackage.setAvailableSlots(2);
        when(packageRepository.findById(1L)).thenReturn(Optional.of(validPackage));

        // When / Then
        assertThatThrownBy(() -> packageService.deductSlots(1L, 5))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("cupos");
    }

    @Test
    void deductSlots_exactSlots_setsStatusToSoldOut() {
        // Given — deducir exactamente todos los cupos disponibles
        validPackage.setAvailableSlots(5);
        when(packageRepository.findById(1L)).thenReturn(Optional.of(validPackage));
        when(packageRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        // When
        PackageEntity result = packageService.deductSlots(1L, 5);

        // Then
        assertThat(result.getAvailableSlots()).isEqualTo(0);
        assertThat(result.getPackageStatus()).isEqualTo(PackageStatus.SOLD_OUT);
    }

    @Test
    void deductSlots_partialSlots_statusRemainsAvailable() {
        // Given
        validPackage.setAvailableSlots(10);
        validPackage.setPackageStatus(PackageStatus.AVAILABLE);
        when(packageRepository.findById(1L)).thenReturn(Optional.of(validPackage));
        when(packageRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        // When
        PackageEntity result = packageService.deductSlots(1L, 4);

        // Then
        assertThat(result.getAvailableSlots()).isEqualTo(6);
        assertThat(result.getPackageStatus()).isEqualTo(PackageStatus.AVAILABLE);
    }

    @Test
    void deductSlots_zeroAvailableSlots_throwsIllegalArgument() {
        // Given — sin cupos disponibles, no se puede deducir ninguno
        validPackage.setAvailableSlots(0);
        when(packageRepository.findById(1L)).thenReturn(Optional.of(validPackage));

        // When / Then
        assertThatThrownBy(() -> packageService.deductSlots(1L, 1))
                .isInstanceOf(IllegalArgumentException.class);
    }

    // ── releaseSlots ──────────────────────────────────────────────────────────

    @Test
    void releaseSlots_soldOutPackage_statusBecomesAvailable() {
        // Given
        validPackage.setAvailableSlots(0);
        validPackage.setPackageStatus(PackageStatus.SOLD_OUT);
        when(packageRepository.findById(1L)).thenReturn(Optional.of(validPackage));
        when(packageRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        // When
        PackageEntity result = packageService.releaseSlots(1L, 3);

        // Then
        assertThat(result.getAvailableSlots()).isEqualTo(3);
        assertThat(result.getPackageStatus()).isEqualTo(PackageStatus.AVAILABLE);
    }

    @Test
    void releaseSlots_availablePackage_slotsIncrease() {
        // Given
        validPackage.setAvailableSlots(5);
        validPackage.setPackageStatus(PackageStatus.AVAILABLE);
        when(packageRepository.findById(1L)).thenReturn(Optional.of(validPackage));
        when(packageRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        // When
        PackageEntity result = packageService.releaseSlots(1L, 2);

        // Then
        assertThat(result.getAvailableSlots()).isEqualTo(7);
        assertThat(result.getPackageStatus()).isEqualTo(PackageStatus.AVAILABLE);
    }

    @Test
    void releaseSlots_cancelledPackage_statusNotChanged() {
        // Given — CANCELLED no cambia a AVAILABLE aunque tenga cupos
        validPackage.setAvailableSlots(0);
        validPackage.setPackageStatus(PackageStatus.CANCELLED);
        when(packageRepository.findById(1L)).thenReturn(Optional.of(validPackage));
        when(packageRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        // When
        PackageEntity result = packageService.releaseSlots(1L, 5);

        // Then
        assertThat(result.getPackageStatus()).isEqualTo(PackageStatus.CANCELLED);
    }

    @Test
    void releaseSlots_multipleSlotsReleased_allAdded() {
        // Given
        validPackage.setAvailableSlots(3);
        when(packageRepository.findById(1L)).thenReturn(Optional.of(validPackage));
        when(packageRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        // When
        PackageEntity result = packageService.releaseSlots(1L, 7);

        // Then
        assertThat(result.getAvailableSlots()).isEqualTo(10);
    }

    @Test
    void releaseSlots_savesUpdatedPackage() {
        // Given
        validPackage.setAvailableSlots(0);
        validPackage.setPackageStatus(PackageStatus.SOLD_OUT);
        when(packageRepository.findById(1L)).thenReturn(Optional.of(validPackage));
        when(packageRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        // When
        packageService.releaseSlots(1L, 1);

        // Then
        verify(packageRepository).save(any());
    }

    // ── updatePackage ─────────────────────────────────────────────────────────

    @Test
    void updatePackage_validFields_updatesSuccessfully() {
        // Given
        PackageEntity updates = new PackageEntity();
        updates.setPackageName("Nuevo nombre");
        updates.setPrice(2000.0);
        when(packageRepository.findById(1L)).thenReturn(Optional.of(validPackage));
        when(packageRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        // When
        PackageEntity result = packageService.updatePackage(1L, updates);

        // Then
        assertThat(result.getPackageName()).isEqualTo("Nuevo nombre");
        assertThat(result.getPrice()).isEqualTo(2000.0);
    }

    @Test
    void updatePackage_datesWithReservations_throwsIllegalArgument() {
        // Given — paquete con 5 cupos reservados (slots=20, available=15)
        validPackage.setSlots(20);
        validPackage.setAvailableSlots(15);
        PackageEntity updates = new PackageEntity();
        updates.setStartDate(LocalDate.now().plusDays(30));
        when(packageRepository.findById(1L)).thenReturn(Optional.of(validPackage));

        // When / Then
        assertThatThrownBy(() -> packageService.updatePackage(1L, updates))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("fechas");
    }

    @Test
    void updatePackage_slotsLessThanReserved_throwsIllegalArgument() {
        // Given — 5 cupos reservados, no se puede bajar a 3
        validPackage.setSlots(20);
        validPackage.setAvailableSlots(15);
        PackageEntity updates = new PackageEntity();
        updates.setSlots(3);
        when(packageRepository.findById(1L)).thenReturn(Optional.of(validPackage));

        // When / Then
        assertThatThrownBy(() -> packageService.updatePackage(1L, updates))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("reservados");
    }

    @Test
    void updatePackage_increaseSlots_adjustsAvailableSlots() {
        // Given — slots=10, available=8, reserved=2. Subir a 15 → available debe ser 13
        validPackage.setSlots(10);
        validPackage.setAvailableSlots(8);
        PackageEntity updates = new PackageEntity();
        updates.setSlots(15);
        when(packageRepository.findById(1L)).thenReturn(Optional.of(validPackage));
        when(packageRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        // When
        PackageEntity result = packageService.updatePackage(1L, updates);

        // Then
        assertThat(result.getSlots()).isEqualTo(15);
        assertThat(result.getAvailableSlots()).isEqualTo(13);
    }

    @Test
    void updatePackage_setAvailableToAvailableWithNoSlots_throwsIllegalArgument() {
        // Given — intentar publicar paquete sin cupos
        validPackage.setAvailableSlots(0);
        PackageEntity updates = new PackageEntity();
        updates.setPackageStatus(PackageStatus.AVAILABLE);
        when(packageRepository.findById(1L)).thenReturn(Optional.of(validPackage));

        // When / Then
        assertThatThrownBy(() -> packageService.updatePackage(1L, updates))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("cupos");
    }
}
