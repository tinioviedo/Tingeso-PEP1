package com.travelagency.backend.repositories;

import com.travelagency.backend.entities.ReservationEntity;
import com.travelagency.backend.enums.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<ReservationEntity, Long> {

    long countByClient_IdAndReservationStatus(Long clientId, ReservationStatus status);

    List<ReservationEntity> findByClient_Id(Long clientId);

    List<ReservationEntity> findByTravelPackage_Id(Long packageId);

    List<ReservationEntity> findByReservationStatus(ReservationStatus status);

    long countByClient_IdAndReservationDateAfter(Long clientId, LocalDateTime date);

    List<ReservationEntity> findByReservationStatusAndReservationDateBefore(
            ReservationStatus status, LocalDateTime date);
    // Reporte 1: ventas por período (se excluye CANCELLED y EXPIRED)
    @Query("SELECT r FROM ReservationEntity r WHERE r.reservationDate BETWEEN :start AND :end " +
            "AND r.reservationStatus NOT IN ('CANCELLED', 'EXPIRED')")
    List<ReservationEntity> findSalesByPeriod(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

    // Reporte 2: ranking por período agrupado por paquete
    @Query("SELECT r.travelPackage.id, r.travelPackage.packageName, " +
            "COUNT(r), SUM(r.quantity), SUM(r.totalAmount) " +
            "FROM ReservationEntity r " +
            "WHERE r.reservationDate BETWEEN :start AND :end " +
            "AND r.reservationStatus NOT IN ('CANCELLED', 'EXPIRED') " +
            "GROUP BY r.travelPackage.id, r.travelPackage.packageName " +
            "ORDER BY COUNT(r) DESC, r.travelPackage.packageName ASC")
    List<Object[]> findPackageRankingByPeriod(
            @Param("start") LocalDateTime start,
            @Param("end") LocalDateTime end);

}