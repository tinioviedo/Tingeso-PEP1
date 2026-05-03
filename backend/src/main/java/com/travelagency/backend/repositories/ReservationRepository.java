package com.travelagency.backend.repositories;

import com.travelagency.backend.entities.ReservationEntity;
import com.travelagency.backend.enums.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
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
}