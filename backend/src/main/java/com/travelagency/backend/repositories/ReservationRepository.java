package com.travelagency.backend.repositories;

import com.travelagency.backend.entities.ReservationEntity;
import com.travelagency.backend.enums.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<ReservationEntity, Long> {

    List<ReservationEntity> findByClient_Id(Long clientId);

    List<ReservationEntity> findByTravelPackage_Id(Long packageId);

    List<ReservationEntity> findByReservationStatus(ReservationStatus status);
}