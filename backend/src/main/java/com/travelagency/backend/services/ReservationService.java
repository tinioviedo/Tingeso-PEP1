package com.travelagency.backend.services;


import com.travelagency.backend.entities.ClientEntity;
import com.travelagency.backend.entities.PackageEntity;
import com.travelagency.backend.entities.ReservationEntity;
import com.travelagency.backend.enums.PackageStatus;
import com.travelagency.backend.enums.ReservationStatus;
import com.travelagency.backend.repositories.ReservationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReservationService {

    @Autowired
    private ReservationRepository reservationRepository;
    @Autowired
    private PackageService packageService;
    @Autowired
    private ClientService clientService;

    public ReservationEntity createReservation(Long clientId, Long packageId, Integer quantity) {
        ClientEntity client = clientService.getActiveClientById(clientId);
        PackageEntity pkg = packageService.getPackageById(packageId);

        if (pkg.getPackageStatus() != PackageStatus.AVAILABLE) {
            throw new IllegalArgumentException("El paquete no está disponible.");
        }

        packageService.deductSlots(packageId, quantity);

        ReservationEntity reservation = new ReservationEntity();
        reservation.setClient(client);
        reservation.setTravelPackage(pkg);
        reservation.setQuantity(quantity);
        reservation.setReservationStatus(ReservationStatus.CONFIRMED);

        return reservationRepository.save(reservation);
    }

    public ReservationEntity cancelReservation(Long reservationId) {
        ReservationEntity reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new IllegalArgumentException("Reserva no encontrada: " + reservationId));

        if (reservation.getReservationStatus() == ReservationStatus.CANCELLED) {
            throw new IllegalArgumentException("La reserva ya está cancelada.");
        }

        packageService.releaseSlots(reservation.getTravelPackage().getId(), reservation.getQuantity());
        reservation.setReservationStatus(ReservationStatus.CANCELLED);
        return reservationRepository.save(reservation);
    }

    public List<ReservationEntity> getMyReservations(Long clientId) {
        return reservationRepository.findByClient_Id(clientId);
    }

    public List<ReservationEntity> getAllReservations() {
        return reservationRepository.findAll();
    }

    public ReservationEntity getReservationById(Long id) {
        return reservationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Reserva no encontrada: " + id));
    }
}