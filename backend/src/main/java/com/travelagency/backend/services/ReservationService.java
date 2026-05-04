package com.travelagency.backend.services;

import com.travelagency.backend.entities.ClientEntity;
import com.travelagency.backend.entities.PackageEntity;
import com.travelagency.backend.entities.ReservationEntity;
import com.travelagency.backend.enums.PackageStatus;
import com.travelagency.backend.enums.ReservationStatus;
import com.travelagency.backend.repositories.ReservationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class ReservationService {

    @Autowired
    private ReservationRepository reservationRepository;
    @Autowired
    private PackageService packageService;
    @Autowired
    private ClientService clientService;
    @Autowired
    private DiscountService discountService;

    public ReservationEntity createReservation(Long clientId, Long packageId, Integer quantity) {
        ClientEntity client = clientService.getActiveClientById(clientId);
        PackageEntity pkg = packageService.getPackageById(packageId);

        if (quantity == null || quantity <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than zero.");
        }
        if (pkg.getPackageStatus() != PackageStatus.AVAILABLE) {
            throw new IllegalArgumentException("Package is not available.");
        }

        packageService.deductSlots(packageId, quantity);

        double baseAmount = pkg.getPrice() * quantity;
        DiscountService.DiscountResult discount = discountService.calculate(clientId, quantity, baseAmount, false);

        ReservationEntity reservation = new ReservationEntity();
        reservation.setClient(client);
        reservation.setTravelPackage(pkg);
        reservation.setQuantity(quantity);
        reservation.setReservationStatus(ReservationStatus.PENDING);
        reservation.setBaseAmount(baseAmount);
        reservation.setDiscountAmount(discount.discountAmount());
        reservation.setTotalAmount(discount.totalAmount());
        reservation.setAppliedDiscounts(discount.appliedDiscounts());

        return reservationRepository.save(reservation);
    }

    public ReservationEntity cancelReservation(Long reservationId) {
        ReservationEntity reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new IllegalArgumentException("Reservation not found: " + reservationId));

        if (reservation.getReservationStatus() == ReservationStatus.CANCELLED) {
            throw new IllegalArgumentException("Reservation is already cancelled.");
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
                .orElseThrow(() -> new IllegalArgumentException("Reservation not found: " + id));
    }

    public List<ReservationEntity> createMultipleReservations(Long clientId, List<Map<String, Object>> items) {
        if (items == null || items.isEmpty()) {
            throw new IllegalArgumentException("Items list cannot be empty.");
        }

        ClientEntity client = clientService.getActiveClientById(clientId);
        boolean isMultiplePackages = items.size() > 1;

        List<ReservationEntity> created = new ArrayList<>();

        for (Map<String, Object> item : items) {
            Long packageId = Long.valueOf(item.get("packageId").toString());
            Integer quantity = Integer.valueOf(item.get("quantity").toString());

            PackageEntity pkg = packageService.getPackageById(packageId);

            if (quantity == null || quantity <= 0) {
                throw new IllegalArgumentException("Quantity must be greater than zero.");
            }
            if (pkg.getPackageStatus() != PackageStatus.AVAILABLE) {
                throw new IllegalArgumentException("Package " + packageId + " is not available.");
            }

            packageService.deductSlots(packageId, quantity);

            double baseAmount = pkg.getPrice() * quantity;
            DiscountService.DiscountResult discount = discountService.calculate(
                    clientId, quantity, baseAmount, isMultiplePackages);

            ReservationEntity reservation = new ReservationEntity();
            reservation.setClient(client);
            reservation.setTravelPackage(pkg);
            reservation.setQuantity(quantity);
            reservation.setReservationStatus(ReservationStatus.PENDING);
            reservation.setBaseAmount(baseAmount);
            reservation.setDiscountAmount(discount.discountAmount());
            reservation.setTotalAmount(discount.totalAmount());
            reservation.setAppliedDiscounts(discount.appliedDiscounts());

            created.add(reservationRepository.save(reservation));
        }

        return created;
    }

    @Value("${reservation.expiration-hours}")
    private int expirationHours;

    public void expirePendingReservations() {
        LocalDateTime cutoff = LocalDateTime.now().minusHours(expirationHours);
        List<ReservationEntity> expired = reservationRepository
                .findByReservationStatusAndReservationDateBefore(ReservationStatus.PENDING, cutoff);

        for (ReservationEntity reservation : expired) {
            packageService.releaseSlots(
                    reservation.getTravelPackage().getId(),
                    reservation.getQuantity());
            reservation.setReservationStatus(ReservationStatus.EXPIRED);
            reservationRepository.save(reservation);
        }
    }
    public ReservationEntity confirmReservation(Long reservationId) {
        ReservationEntity reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new IllegalArgumentException("Reservation not found: " + reservationId));
        reservation.setReservationStatus(ReservationStatus.CONFIRMED);
        return reservationRepository.save(reservation);
    }

}